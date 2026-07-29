-- Create admin_offers table
CREATE TABLE IF NOT EXISTS public.admin_offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL CHECK (type IN ('percentage', 'fixed')),
    value NUMERIC NOT NULL CHECK (value > 0),
    min_purchase NUMERIC DEFAULT 0,
    max_discount NUMERIC,
    expires_at TIMESTAMPTZ NOT NULL,
    usage_limit INT NOT NULL CHECK (usage_limit >= 0),
    usage_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_offers ENABLE ROW LEVEL SECURITY;

-- Select policy: Admins can view and manage all offers
CREATE POLICY "Admins have full access to admin_offers"
ON public.admin_offers FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
);

-- Allow public read access to offers (so checkout/payment service can validate coupon codes)
CREATE POLICY "Anyone can view offers"
ON public.admin_offers FOR SELECT
USING (true);

-- Index for optimized querying on code and expiration
CREATE INDEX IF NOT EXISTS idx_admin_offers_code ON public.admin_offers(code);
CREATE INDEX IF NOT EXISTS idx_admin_offers_expires_at ON public.admin_offers(expires_at);
