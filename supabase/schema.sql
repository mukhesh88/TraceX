-- TraceX Supabase Database Schema
-- Run this in your Supabase Project -> SQL Editor

-- 1. Create table for custom monitored targets & threat watchlist
CREATE TABLE IF NOT EXISTS public.watchlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    target_type TEXT NOT NULL DEFAULT 'URL', -- 'URL', 'DOMAIN', 'IP', 'KEYWORD'
    threat_level TEXT NOT NULL DEFAULT 'HIGH', -- 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'BENIGN'
    notes TEXT,
    risk_score FLOAT DEFAULT 0.0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_watchlist_user_id ON public.watchlist(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_url ON public.watchlist(url);
CREATE INDEX IF NOT EXISTS idx_watchlist_created_at ON public.watchlist(created_at DESC);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies for CRUD operations
-- SELECT: Users can read their own watchlist items (or public demo items where user_id IS NULL)
CREATE POLICY "Users can read own watchlist items" 
ON public.watchlist FOR SELECT 
USING (auth.uid() = user_id OR user_id IS NULL);

-- INSERT: Authenticated users can insert watchlist items for themselves
CREATE POLICY "Users can insert own watchlist items" 
ON public.watchlist FOR INSERT 
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- UPDATE: Users can update their own watchlist items
CREATE POLICY "Users can update own watchlist items" 
ON public.watchlist FOR UPDATE 
USING (auth.uid() = user_id OR user_id IS NULL);

-- DELETE: Users can delete their own watchlist items
CREATE POLICY "Users can delete own watchlist items" 
ON public.watchlist FOR DELETE 
USING (auth.uid() = user_id OR user_id IS NULL);

-- 5. Trigger for updated_at automatic timestamping
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_watchlist_modtime
BEFORE UPDATE ON public.watchlist
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- 6. Insert initial seed targets
INSERT INTO public.watchlist (url, target_type, threat_level, notes, risk_score, is_active)
VALUES 
    ('https://secure-login.apple-support-verify.com/auth', 'URL', 'CRITICAL', 'Known credential harvester masquerading as Apple support', 0.965, true),
    ('https://xn--pple-43d.com/login', 'URL', 'HIGH', 'Punycode IDN homograph impersonating apple.com', 0.820, true),
    ('http://192.168.1.100/paypal/login.php', 'IP', 'CRITICAL', 'Raw IP credential stealer bypassing DNS logs', 0.940, true),
    ('http://account-update-banking.xyz/session/verify', 'URL', 'HIGH', 'Abuse-prone .xyz TLD with financial phishing keywords', 0.880, true)
ON CONFLICT DO NOTHING;
