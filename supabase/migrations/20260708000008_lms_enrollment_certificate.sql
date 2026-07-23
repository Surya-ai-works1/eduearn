-- Add certificate_url to public.enrollments
ALTER TABLE public.enrollments ADD COLUMN IF NOT EXISTS certificate_url TEXT;
