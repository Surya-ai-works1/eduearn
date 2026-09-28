-- Migration: 20260926000005_make_payments_course_id_nullable.sql
-- Description: Allow payments.course_id to be NULL so non-course products (packages, projects, tuition) can be logged in payments table.

ALTER TABLE public.payments ALTER COLUMN course_id DROP NOT NULL;
