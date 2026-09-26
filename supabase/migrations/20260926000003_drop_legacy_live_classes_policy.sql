-- Migration: 20260926000003_drop_legacy_live_classes_policy.sql
-- Description: Drop legacy 'Allow public read access to live classes' policy with spaces.

DROP POLICY IF EXISTS "Allow public read access to live classes" ON public.live_classes;
DROP POLICY IF EXISTS "Allow course owners to modify live classes" ON public.live_classes;
