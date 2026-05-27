-- Cafe Adnan | قهوة عدنان
-- Supabase SQL Database Schema

-- 1. Create categories table
create table if not exists public.categories (
  id uuid default gen_random_uuid() primary key,
  name_ar text not null,
  name_en text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create menu_items table
create table if not exists public.menu_items (
  id uuid default gen_random_uuid() primary key,
  category_id uuid references public.categories(id) on delete cascade not null,
  name_ar text not null,
  name_en text not null,
  description_ar text,
  description_en text,
  price numeric(10, 2) not null,
  available boolean default true not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Enable Row Level Security (RLS)
alter table public.categories enable row level security;
alter table public.menu_items enable row level security;

-- 4. Set up public read access policies
create policy "Allow public read access to categories"
  on public.categories for select
  using (true);

create policy "Allow public read access to menu_items"
  on public.menu_items for select
  using (true);

-- 5. Set up authenticated admin write policies
create policy "Allow authenticated admin changes to categories"
  on public.categories for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Allow authenticated admin changes to menu_items"
  on public.menu_items for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- 6. Enable Realtime Replication
-- To enable Supabase Realtime, we need to add the tables to the supabase_realtime publication.
-- If the publication doesn't exist, we create it.
begin;
  -- Add tables to realtime if publication exists, or handle gracefully
  alter publication supabase_realtime add table public.categories;
  alter publication supabase_realtime add table public.menu_items;
commit;
