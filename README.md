# Cafe Adnan | قهوة عدنان

Premium QR menu web application for Cafe Adnan. Customers scan a QR code to instantly access an elegant digital menu on their phones.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Realtime**: Supabase Realtime
- **Deployment**: Vercel

## Getting Started

### 1. Clone & Install

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the contents of `supabase/schema.sql`
3. Go to Authentication > Settings and enable Email auth
4. Create an admin user in Authentication > Users

### 3. Configure Environment

Copy `.env.local.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Run Development Server

```bash
npm run dev
```

Visit:
- **Menu**: http://localhost:3000/menu
- **Admin**: http://localhost:3000/admin/login

## Deployment on Vercel

### 1. Push to GitHub

```bash
git add .
git commit -m "Initial commit"
git push
```

### 2. Import on Vercel

1. Go to [vercel.com](https://vercel.com) and import your repository
2. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL` (your Vercel domain)
3. Deploy!

### 3. Update QR Codes

After deployment, update the QR code URL in Admin > QR Code to your production domain.

## Project Structure

```
src/
├── app/              # Next.js App Router pages
│   ├── menu/         # Customer menu (public)
│   └── admin/        # Admin dashboard (protected)
├── components/       # Reusable UI components
│   ├── menu/         # Menu-specific components
│   └── admin/        # Admin-specific components
├── hooks/            # Custom React hooks
├── lib/              # Supabase clients
├── providers/        # Context providers
├── services/         # Data access layer
└── types/            # TypeScript types
```

## Features

### Customer Menu
- ✅ Instant QR scan → menu access
- ✅ Sticky category navigation
- ✅ Bilingual (Arabic/English)
- ✅ Real-time menu updates
- ✅ Fast search
- ✅ Dark mode
- ✅ Mobile-first design

### Admin Dashboard
- ✅ Secure authentication
- ✅ Category management (CRUD)
- ✅ Menu item management (CRUD)
- ✅ Availability toggling
- ✅ QR code generation
- ✅ Mobile-friendly admin
- ✅ Real-time sync

## License

Private — Cafe Adnan © 2025
