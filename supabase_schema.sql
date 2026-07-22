-- Table Tennis Showcase - Supabase PostgreSQL Schema DDL

-- 1. Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create players table
CREATE TABLE IF NOT EXISTS public.players (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  rank INT UNIQUE NOT NULL,
  playing_style TEXT NOT NULL,
  playing_hand TEXT NOT NULL,
  biography TEXT,
  country TEXT,
  achievements JSONB DEFAULT '[]'::jsonb,
  avatar_url TEXT,
  equipment JSONB DEFAULT '{}'::jsonb,
  promo_video JSONB DEFAULT '{"type":"external","url":""}'::jsonb,
  gallery JSONB DEFAULT '[]'::jsonb,
  votes INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create settings table
CREATE TABLE IF NOT EXISTS public.settings (
  id TEXT PRIMARY KEY,
  website_name TEXT,
  logo_url TEXT,
  banner_url TEXT,
  about_content TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  location TEXT,
  social_links JSONB,
  footer_text TEXT
);

-- 4. Seed default admin user (admin / AdminPassword123!)
INSERT INTO public.users (id, username, password)
VALUES ('admin_id_1', 'admin', '$2a$10$x4EO.Q8cThIBXW9Eji5iVeqCQkwAUlOCpl/p2GCy4t0wX8O9Ri71e')
ON CONFLICT (username) DO UPDATE SET password = EXCLUDED.password;

-- 5. Row Level Security Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running
DROP POLICY IF EXISTS "Allow public read players" ON public.players;
DROP POLICY IF EXISTS "Allow public read settings" ON public.settings;
DROP POLICY IF EXISTS "Allow service_role all users" ON public.users;
DROP POLICY IF EXISTS "Allow service_role all players" ON public.players;
DROP POLICY IF EXISTS "Allow service_role all settings" ON public.settings;

CREATE POLICY "Allow public read players" ON public.players FOR SELECT USING (true);
CREATE POLICY "Allow public read settings" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Allow service_role all users" ON public.users FOR ALL USING (true);
CREATE POLICY "Allow service_role all players" ON public.players FOR ALL USING (true);
CREATE POLICY "Allow service_role all settings" ON public.settings FOR ALL USING (true);
