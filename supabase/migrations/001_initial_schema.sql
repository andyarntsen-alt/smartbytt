-- =====================================================
-- SmartBytt Database Schema
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard
-- =====================================================

-- 1. PROFILES (extends Supabase Auth)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  postal_code TEXT,
  notification_email BOOLEAN DEFAULT true,
  notification_sms BOOLEAN DEFAULT false,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 2. CATEGORIES
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PROVIDERS
CREATE TABLE IF NOT EXISTS providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES categories(id),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  website_url TEXT,
  is_partner BOOLEAN DEFAULT false,
  affiliate_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. OFFERS
CREATE TABLE IF NOT EXISTS offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES providers(id),
  name TEXT NOT NULL,
  price_type TEXT CHECK (price_type IN ('spot', 'fixed', 'variable')),
  monthly_fee DECIMAL(10,2),
  markup_ore_kwh DECIMAL(10,4),
  price_per_unit DECIMAL(10,4),
  data_amount_gb INTEGER,
  speed_mbps INTEGER,
  binding_months INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  valid_from DATE DEFAULT CURRENT_DATE,
  valid_until DATE,
  price_area TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. USER CONTRACTS
CREATE TABLE IF NOT EXISTS user_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id),
  provider_id UUID REFERENCES providers(id),
  provider_name TEXT,
  price_type TEXT,
  monthly_cost DECIMAL(10,2),
  yearly_consumption_kwh INTEGER,
  data_amount_gb INTEGER,
  speed_mbps INTEGER,
  postal_code TEXT,
  price_area TEXT,
  binding_until DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. DOCUMENTS (for invoice uploads)
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  user_contract_id UUID REFERENCES user_contracts(id),
  file_path TEXT NOT NULL,
  file_type TEXT,
  original_filename TEXT,
  extracted_data JSONB,
  ocr_status TEXT DEFAULT 'pending' CHECK (ocr_status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. RECOMMENDATIONS
CREATE TABLE IF NOT EXISTS recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  user_contract_id UUID REFERENCES user_contracts(id),
  offer_id UUID REFERENCES offers(id),
  current_monthly_cost DECIMAL(10,2),
  recommended_monthly_cost DECIMAL(10,2),
  monthly_savings DECIMAL(10,2),
  yearly_savings DECIMAL(10,2),
  urgency TEXT DEFAULT 'low' CHECK (urgency IN ('low', 'medium', 'high')),
  reasons TEXT[],
  is_dismissed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. SWITCHES (tracking provider switches)
CREATE TABLE IF NOT EXISTS switches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  recommendation_id UUID REFERENCES recommendations(id),
  from_provider_id UUID REFERENCES providers(id),
  to_provider_id UUID REFERENCES providers(id),
  to_offer_id UUID REFERENCES offers(id),
  status TEXT DEFAULT 'initiated' CHECK (status IN ('initiated', 'pending', 'completed', 'cancelled', 'failed')),
  affiliate_click_id TEXT,
  estimated_savings DECIMAL(10,2),
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('savings_alert', 'switch_completed', 'price_change', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE switches ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles: users can only see/edit their own
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- User contracts: users can only see/edit their own
CREATE POLICY "Users can manage own contracts" ON user_contracts FOR ALL USING (auth.uid() = user_id);

-- Documents: users can only see/edit their own
CREATE POLICY "Users can manage own documents" ON documents FOR ALL USING (auth.uid() = user_id);

-- Recommendations: users can only see their own
CREATE POLICY "Users can view own recommendations" ON recommendations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own recommendations" ON recommendations FOR UPDATE USING (auth.uid() = user_id);

-- Switches: users can only see/manage their own
CREATE POLICY "Users can manage own switches" ON switches FOR ALL USING (auth.uid() = user_id);

-- Notifications: users can only see/manage their own
CREATE POLICY "Users can manage own notifications" ON notifications FOR ALL USING (auth.uid() = user_id);

-- Public read access to categories, providers, offers
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Anyone can view providers" ON providers FOR SELECT USING (true);
CREATE POLICY "Anyone can view offers" ON offers FOR SELECT USING (true);

-- =====================================================
-- SEED DATA
-- =====================================================

-- Insert categories
INSERT INTO categories (slug, name, description, icon, is_active, sort_order) VALUES
  ('strom', 'Strøm', 'Sammenlign strømleverandører', '⚡', true, 1),
  ('mobil', 'Mobil', 'Finn beste mobilabonnement', '📱', false, 2),
  ('bredband', 'Bredbånd', 'Sammenlign bredbåndstilbud', '🌐', false, 3)
ON CONFLICT (slug) DO NOTHING;

-- Insert some example providers
INSERT INTO providers (category_id, name, slug, website_url, is_partner, is_active) 
SELECT c.id, 'Tibber', 'tibber', 'https://tibber.com', true, true
FROM categories c WHERE c.slug = 'strom'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO providers (category_id, name, slug, website_url, is_partner, is_active)
SELECT c.id, 'Fjordkraft', 'fjordkraft', 'https://fjordkraft.no', false, true
FROM categories c WHERE c.slug = 'strom'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO providers (category_id, name, slug, website_url, is_partner, is_active)
SELECT c.id, 'Gudbrandsdal Energi', 'gudbrandsdal-energi', 'https://ge.no', false, true
FROM categories c WHERE c.slug = 'strom'
ON CONFLICT (slug) DO NOTHING;

-- Insert example offers
INSERT INTO offers (provider_id, name, price_type, monthly_fee, markup_ore_kwh, binding_months, is_active, price_area)
SELECT p.id, 'Tibber Spot', 'spot', 39, 1.5, 0, true, 'NO1'
FROM providers p WHERE p.slug = 'tibber'
ON CONFLICT DO NOTHING;

INSERT INTO offers (provider_id, name, price_type, monthly_fee, markup_ore_kwh, binding_months, is_active, price_area)
SELECT p.id, 'Fjordkraft Spot', 'spot', 49, 2.9, 0, true, 'NO1'
FROM providers p WHERE p.slug = 'fjordkraft'
ON CONFLICT DO NOTHING;

INSERT INTO offers (provider_id, name, price_type, monthly_fee, markup_ore_kwh, binding_months, is_active, price_area)
SELECT p.id, 'GE Spot', 'spot', 29, 2.0, 0, true, 'NO3'
FROM providers p WHERE p.slug = 'gudbrandsdal-energi'
ON CONFLICT DO NOTHING;

-- Done!
SELECT 'Database setup complete!' as status;
