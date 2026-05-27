-- =============================================
-- Cafe Adnan | قهوة عدنان
-- Database Schema for Debts (نظام المديونيات)
-- =============================================

-- Debts table
CREATE TABLE IF NOT EXISTS debts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  description TEXT,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  paid_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  remaining_amount DECIMAL(10,2) GENERATED ALWAYS AS (total_amount - paid_amount) STORED,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- Row Level Security (RLS)
-- =============================================

ALTER TABLE debts ENABLE ROW LEVEL SECURITY;

-- Admins only (authenticated users)
CREATE POLICY "Admin select debts" ON debts
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admin insert debts" ON debts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admin update debts" ON debts
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Admin delete debts" ON debts
  FOR DELETE USING (auth.role() = 'authenticated');

-- =============================================
-- Realtime
-- =============================================

ALTER PUBLICATION supabase_realtime ADD TABLE debts;

-- =============================================
-- Indexes for Performance
-- =============================================

CREATE INDEX IF NOT EXISTS idx_debts_customer ON debts(customer_name);
CREATE INDEX IF NOT EXISTS idx_debts_created_at ON debts(created_at);
