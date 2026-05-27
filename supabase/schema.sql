-- =============================================
-- Cafe Adnan | قهوة عدنان
-- Database Schema for Supabase
-- =============================================

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Menu items table
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  available BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- Row Level Security
-- =============================================

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- Public read access (anyone can view the menu)
CREATE POLICY "Public read categories" ON categories
  FOR SELECT USING (true);

CREATE POLICY "Public read menu items" ON menu_items
  FOR SELECT USING (true);

-- Admin write access (authenticated users only)
CREATE POLICY "Admin insert categories" ON categories
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admin update categories" ON categories
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Admin delete categories" ON categories
  FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Admin insert items" ON menu_items
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admin update items" ON menu_items
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Admin delete items" ON menu_items
  FOR DELETE USING (auth.role() = 'authenticated');

-- =============================================
-- Realtime
-- =============================================

ALTER PUBLICATION supabase_realtime ADD TABLE categories;
ALTER PUBLICATION supabase_realtime ADD TABLE menu_items;

-- =============================================
-- Indexes for Performance
-- =============================================

CREATE INDEX idx_menu_items_category ON menu_items(category_id);
CREATE INDEX idx_menu_items_available ON menu_items(available);
CREATE INDEX idx_categories_sort ON categories(sort_order);
CREATE INDEX idx_menu_items_sort ON menu_items(sort_order);

-- =============================================
-- Sample Data (Arabic café menu)
-- =============================================

-- Categories
INSERT INTO categories (name_ar, name_en, sort_order) VALUES
  ('القهوة الساخنة', 'Hot Coffee', 1),
  ('القهوة الباردة', 'Cold Coffee', 2),
  ('المشروبات الساخنة', 'Hot Drinks', 3),
  ('المشروبات الباردة', 'Cold Drinks', 4),
  ('الحلويات', 'Desserts', 5),
  ('المعجنات', 'Pastries', 6);

-- Hot Coffee
INSERT INTO menu_items (category_id, name_ar, name_en, price, sort_order)
SELECT id, 'إسبريسو', 'Espresso', 35.00, 1 FROM categories WHERE name_en = 'Hot Coffee';
INSERT INTO menu_items (category_id, name_ar, name_en, price, sort_order)
SELECT id, 'إسبريسو دبل', 'Double Espresso', 45.00, 2 FROM categories WHERE name_en = 'Hot Coffee';
INSERT INTO menu_items (category_id, name_ar, name_en, price, sort_order)
SELECT id, 'أمريكانو', 'Americano', 40.00, 3 FROM categories WHERE name_en = 'Hot Coffee';
INSERT INTO menu_items (category_id, name_ar, name_en, price, sort_order)
SELECT id, 'لاتيه', 'Latte', 55.00, 4 FROM categories WHERE name_en = 'Hot Coffee';
INSERT INTO menu_items (category_id, name_ar, name_en, price, sort_order)
SELECT id, 'كابتشينو', 'Cappuccino', 55.00, 5 FROM categories WHERE name_en = 'Hot Coffee';
INSERT INTO menu_items (category_id, name_ar, name_en, price, sort_order)
SELECT id, 'فلات وايت', 'Flat White', 60.00, 6 FROM categories WHERE name_en = 'Hot Coffee';
INSERT INTO menu_items (category_id, name_ar, name_en, price, sort_order)
SELECT id, 'موكا', 'Mocha', 65.00, 7 FROM categories WHERE name_en = 'Hot Coffee';
INSERT INTO menu_items (category_id, name_ar, name_en, price, sort_order)
SELECT id, 'قهوة تركي', 'Turkish Coffee', 30.00, 8 FROM categories WHERE name_en = 'Hot Coffee';

-- Cold Coffee
INSERT INTO menu_items (category_id, name_ar, name_en, price, sort_order)
SELECT id, 'آيس لاتيه', 'Iced Latte', 60.00, 1 FROM categories WHERE name_en = 'Cold Coffee';
INSERT INTO menu_items (category_id, name_ar, name_en, price, sort_order)
SELECT id, 'آيس أمريكانو', 'Iced Americano', 50.00, 2 FROM categories WHERE name_en = 'Cold Coffee';
INSERT INTO menu_items (category_id, name_ar, name_en, price, sort_order)
SELECT id, 'آيس موكا', 'Iced Mocha', 70.00, 3 FROM categories WHERE name_en = 'Cold Coffee';
INSERT INTO menu_items (category_id, name_ar, name_en, price, sort_order)
SELECT id, 'كولد برو', 'Cold Brew', 65.00, 4 FROM categories WHERE name_en = 'Cold Coffee';
INSERT INTO menu_items (category_id, name_ar, name_en, price, sort_order)
SELECT id, 'فرابتشينو كراميل', 'Caramel Frappuccino', 75.00, 5 FROM categories WHERE name_en = 'Cold Coffee';

-- Hot Drinks
INSERT INTO menu_items (category_id, name_ar, name_en, price, sort_order)
SELECT id, 'شاي أحمر', 'Black Tea', 25.00, 1 FROM categories WHERE name_en = 'Hot Drinks';
INSERT INTO menu_items (category_id, name_ar, name_en, price, sort_order)
SELECT id, 'شاي أخضر', 'Green Tea', 30.00, 2 FROM categories WHERE name_en = 'Hot Drinks';
INSERT INTO menu_items (category_id, name_ar, name_en, price, sort_order)
SELECT id, 'شوكولاتة ساخنة', 'Hot Chocolate', 55.00, 3 FROM categories WHERE name_en = 'Hot Drinks';
INSERT INTO menu_items (category_id, name_ar, name_en, price, sort_order)
SELECT id, 'سحلب', 'Sahlab', 50.00, 4 FROM categories WHERE name_en = 'Hot Drinks';

-- Cold Drinks
INSERT INTO menu_items (category_id, name_ar, name_en, price, sort_order)
SELECT id, 'عصير برتقال طازج', 'Fresh Orange Juice', 45.00, 1 FROM categories WHERE name_en = 'Cold Drinks';
INSERT INTO menu_items (category_id, name_ar, name_en, price, sort_order)
SELECT id, 'ليموناضة', 'Lemonade', 40.00, 2 FROM categories WHERE name_en = 'Cold Drinks';
INSERT INTO menu_items (category_id, name_ar, name_en, price, sort_order)
SELECT id, 'موهيتو', 'Mojito', 50.00, 3 FROM categories WHERE name_en = 'Cold Drinks';
INSERT INTO menu_items (category_id, name_ar, name_en, price, sort_order)
SELECT id, 'سموذي مانجو', 'Mango Smoothie', 55.00, 4 FROM categories WHERE name_en = 'Cold Drinks';
INSERT INTO menu_items (category_id, name_ar, name_en, price, sort_order)
SELECT id, 'ميلك شيك فراولة', 'Strawberry Milkshake', 60.00, 5 FROM categories WHERE name_en = 'Cold Drinks';

-- Desserts
INSERT INTO menu_items (category_id, name_ar, name_en, price, sort_order)
SELECT id, 'تشيز كيك', 'Cheesecake', 85.00, 1 FROM categories WHERE name_en = 'Desserts';
INSERT INTO menu_items (category_id, name_ar, name_en, price, sort_order)
SELECT id, 'براونيز', 'Brownies', 70.00, 2 FROM categories WHERE name_en = 'Desserts';
INSERT INTO menu_items (category_id, name_ar, name_en, price, sort_order)
SELECT id, 'تيراميسو', 'Tiramisu', 90.00, 3 FROM categories WHERE name_en = 'Desserts';
INSERT INTO menu_items (category_id, name_ar, name_en, price, sort_order)
SELECT id, 'كريم بروليه', 'Crème Brûlée', 80.00, 4 FROM categories WHERE name_en = 'Desserts';

-- Pastries
INSERT INTO menu_items (category_id, name_ar, name_en, price, sort_order)
SELECT id, 'كرواسون زبدة', 'Butter Croissant', 45.00, 1 FROM categories WHERE name_en = 'Pastries';
INSERT INTO menu_items (category_id, name_ar, name_en, price, sort_order)
SELECT id, 'كرواسون شوكولاتة', 'Chocolate Croissant', 50.00, 2 FROM categories WHERE name_en = 'Pastries';
INSERT INTO menu_items (category_id, name_ar, name_en, price, sort_order)
SELECT id, 'مافن توت', 'Blueberry Muffin', 55.00, 3 FROM categories WHERE name_en = 'Pastries';
INSERT INTO menu_items (category_id, name_ar, name_en, price, sort_order)
SELECT id, 'سينامون رول', 'Cinnamon Roll', 50.00, 4 FROM categories WHERE name_en = 'Pastries';
