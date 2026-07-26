-- Supabase Schema Migration: Tutor Platform Stabilization
-- Created: 2026-07-26

-- 1. Add reply_text column to public.reviews table
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS reply_text TEXT;

-- 2. Add payment_method and bank_details columns to public.withdrawal_requests table
ALTER TABLE public.withdrawal_requests ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'UPI';
ALTER TABLE public.withdrawal_requests ADD COLUMN IF NOT EXISTS bank_details TEXT;
