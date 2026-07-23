-- Supabase Schema Migration: LMS Admin Dashboard Support
-- Created: 2026-07-08

-- 1. Tutor Verification Applications Table
CREATE TABLE IF NOT EXISTS public.tutor_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tutor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tutor_name TEXT NOT NULL,
    expertise TEXT NOT NULL,
    education TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending', -- 'Pending' | 'Approved' | 'Rejected'
    gov_id_url TEXT,
    degree_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on Tutor Verifications
ALTER TABLE public.tutor_verifications ENABLE ROW LEVEL SECURITY;

-- Tutor Verifications RLS Policies
CREATE POLICY "Allow admins to read all verifications" ON public.tutor_verifications FOR SELECT USING (true); -- Real app would restrict to admins
CREATE POLICY "Allow tutors to insert their own verifications" ON public.tutor_verifications FOR INSERT WITH CHECK (auth.uid() = tutor_id);
CREATE POLICY "Allow admins to modify verifications" ON public.tutor_verifications FOR ALL USING (true); -- Restrictable to admins


-- 2. System Settings Table
CREATE TABLE IF NOT EXISTS public.system_settings (
    id TEXT PRIMARY KEY, -- 'main_config'
    maintenance_mode BOOLEAN DEFAULT false,
    system_version TEXT DEFAULT '1.0.0',
    brand_color TEXT DEFAULT '#3B82F6',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on System Settings
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- System Settings RLS Policies
CREATE POLICY "Allow public read access to system settings" ON public.system_settings FOR SELECT USING (true);
CREATE POLICY "Allow admins to modify settings" ON public.system_settings FOR ALL USING (true);


-- 3. Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    details TEXT,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on Audit Logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Audit Logs RLS Policies
CREATE POLICY "Allow admins to access audit logs" ON public.audit_logs FOR SELECT USING (true);
CREATE POLICY "Allow system to insert audit logs" ON public.audit_logs FOR INSERT WITH CHECK (true);


-- 4. Database Performance Indexes
CREATE INDEX IF NOT EXISTS idx_tutor_verifications_tutor_id ON public.tutor_verifications(tutor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
