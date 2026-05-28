require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3001;

// Supabase Setup
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabase;
if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  console.warn("WARNING: Supabase credentials missing. Running in mock mode.");
  supabase = createClient('https://placeholder.supabase.co', 'placeholder-key');
}

// Express Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET || 'cafe-adnan-lite-secret-key-123456',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true if deploying with HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// EJS Template Engine Setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Auth Middleware Guard
const requireAuth = (req, res, next) => {
  if (req.session && req.session.isAdmin) {
    return next();
  }
  res.redirect('/admin/login');
};

// ==================== PUBLIC ROUTES ====================

// Redirect root to menu
app.get('/', (req, res) => {
  res.redirect('/menu');
});

// Digital Menu Page (Server-Side Rendered)
app.get('/menu', async (req, res) => {
  try {
    const [catResult, itemResult] = await Promise.all([
      supabase.from('categories').select('*').order('sort_order').order('created_at'),
      supabase.from('menu_items').select('*').order('sort_order').order('created_at')
    ]);

    const categories = catResult.data || [];
    const items = itemResult.data || [];

    // Group items by category_id for structured display
    const itemsByCategory = {};
    categories.forEach(cat => {
      itemsByCategory[cat.id] = items.filter(item => item.category_id === cat.id);
    });

    res.render('menu', {
      categories,
      itemsByCategory,
      theme: req.cookies.theme || 'dark'
    });
  } catch (err) {
    console.error('Menu load error:', err);
    res.status(500).send('حدث خطأ أثناء تحميل القائمة. الرجاء المحاولة لاحقاً.');
  }
});

// Theme toggler
app.get('/toggle-theme', (req, res) => {
  const currentTheme = req.cookies.theme || 'dark';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  res.cookie('theme', newTheme, { maxAge: 365 * 24 * 60 * 60 * 1000 });
  res.redirect('back');
});

// ==================== ADMIN AUTH ROUTES ====================

// GET Login Page
app.get('/admin/login', (req, res) => {
  if (req.session && req.session.isAdmin) {
    return res.redirect('/admin/dashboard');
  }
  res.render('login', { error: null });
});

// POST Login Page
app.post('/admin/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Try standard Supabase Auth first
    let authError = null;
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim()
      });
      authError = error;
      if (!error && data.user) {
        req.session.isAdmin = true;
        req.session.email = email.trim();
        return res.redirect('/admin/dashboard');
      }
    } catch (e) {
      authError = e;
    }

    // 2. Fall back to secure database credentials query (RPC)
    const { data: isCustomValid, error: rpcError } = await supabase.rpc('verify_admin_credentials', {
      admin_email: email.trim().toLowerCase(),
      admin_password: password.trim()
    });

    if (!rpcError && isCustomValid) {
      req.session.isAdmin = true;
      req.session.email = email.trim().toLowerCase();
      return res.redirect('/admin/dashboard');
    }

    // 3. Hardcoded Fallback: Instant setup-free bypass
    if (email.trim().toLowerCase() === 'admin@cafeadnan.com' && password.trim() === '1234') {
      req.session.isAdmin = true;
      req.session.email = email.trim().toLowerCase();
      return res.redirect('/admin/dashboard');
    }

    res.render('login', { error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
  } catch (err) {
    console.error('Login error:', err);
    res.render('login', { error: 'حدث خطأ غير متوقع أثناء الدخول' });
  }
});

// Logout Route
app.get('/admin/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/admin/login');
  });
});

// ==================== ADMIN PORTAL (SECURE) ====================

// Dashboard View
app.get('/admin/dashboard', requireAuth, async (req, res) => {
  try {
    const [catResult, itemResult] = await Promise.all([
      supabase.from('categories').select('*').order('sort_order'),
      supabase.from('menu_items').select('*').order('sort_order')
    ]);

    res.render('dashboard', {
      categories: catResult.data || [],
      items: itemResult.data || [],
      email: req.session.email
    });
  } catch (err) {
    console.error('Dashboard load error:', err);
    res.status(500).send('خطأ في تحميل لوحة التحكم');
  }
});

// Create Category
app.post('/admin/categories/create', requireAuth, async (req, res) => {
  const { name_ar, name_en, sort_order } = req.body;
  try {
    await supabase.from('categories').insert([{
      name_ar,
      name_en,
      sort_order: parseInt(sort_order) || 0
    }]);
    res.redirect('/admin/dashboard');
  } catch (err) {
    console.error(err);
    res.status(500).send('خطأ في إنشاء القسم');
  }
});

// Update Category
app.post('/admin/categories/update/:id', requireAuth, async (req, res) => {
  const { name_ar, name_en, sort_order } = req.body;
  try {
    await supabase.from('categories').update({
      name_ar,
      name_en,
      sort_order: parseInt(sort_order) || 0
    }).eq('id', req.params.id);
    res.redirect('/admin/dashboard');
  } catch (err) {
    console.error(err);
    res.status(500).send('خطأ في تعديل القسم');
  }
});

// Delete Category
app.post('/admin/categories/delete/:id', requireAuth, async (req, res) => {
  try {
    await supabase.from('categories').delete().eq('id', req.params.id);
    res.redirect('/admin/dashboard');
  } catch (err) {
    console.error(err);
    res.status(500).send('خطأ في حذف القسم');
  }
});

// Create Menu Item
app.post('/admin/items/create', requireAuth, async (req, res) => {
  const { category_id, name_ar, name_en, price, description_ar, description_en, sort_order, available } = req.body;
  try {
    await supabase.from('menu_items').insert([{
      category_id,
      name_ar,
      name_en,
      price: parseFloat(price) || 0,
      description_ar,
      description_en,
      sort_order: parseInt(sort_order) || 0,
      available: available === 'true'
    }]);
    res.redirect('/admin/dashboard');
  } catch (err) {
    console.error(err);
    res.status(500).send('خطأ في إضافة المنتج');
  }
});

// Update Menu Item
app.post('/admin/items/update/:id', requireAuth, async (req, res) => {
  const { category_id, name_ar, name_en, price, description_ar, description_en, sort_order, available } = req.body;
  try {
    await supabase.from('menu_items').update({
      category_id,
      name_ar,
      name_en,
      price: parseFloat(price) || 0,
      description_ar,
      description_en,
      sort_order: parseInt(sort_order) || 0,
      available: available === 'true'
    }).eq('id', req.params.id);
    res.redirect('/admin/dashboard');
  } catch (err) {
    console.error(err);
    res.status(500).send('خطأ في تعديل المنتج');
  }
});

// Delete Menu Item
app.post('/admin/items/delete/:id', requireAuth, async (req, res) => {
  try {
    await supabase.from('menu_items').delete().eq('id', req.params.id);
    res.redirect('/admin/dashboard');
  } catch (err) {
    console.error(err);
    res.status(500).send('خطأ في حذف المنتج');
  }
});

// Server boot
app.listen(PORT, () => {
  console.log(`Cafe Adnan Lite Server running on port ${PORT}`);
});
