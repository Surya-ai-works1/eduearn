-- ==============================================================================
-- 🚀 EDUEARN MIGRATION: COURSE TUTOR APPLICATIONS SCHEMA
-- Migration: 20260916000004_course_tutor_applications_schema.sql
-- Idempotent, Non-Destructive Migration for Application-Based Template Claiming
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.course_tutor_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    tutor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'UNDER_REVIEW' CHECK (status IN ('UNDER_REVIEW', 'APPROVED', 'REJECTED', 'CANCELLED')),
    application_note TEXT,
    reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    admin_feedback TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Unique index: A tutor can only have ONE active (UNDER_REVIEW) application per course template
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_active_app_per_tutor_course 
ON public.course_tutor_applications(tutor_id, course_id) 
WHERE status = 'UNDER_REVIEW';

-- Index for querying applications by course or tutor
CREATE INDEX IF NOT EXISTS idx_course_tutor_apps_tutor ON public.course_tutor_applications(tutor_id);
CREATE INDEX IF NOT EXISTS idx_course_tutor_apps_course ON public.course_tutor_applications(course_id);
CREATE INDEX IF NOT EXISTS idx_course_tutor_apps_status ON public.course_tutor_applications(status);

-- Enable RLS
ALTER TABLE public.course_tutor_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Tutors can view their own course applications" ON public.course_tutor_applications;
CREATE POLICY "Tutors can view their own course applications" 
ON public.course_tutor_applications FOR SELECT 
USING (auth.uid() = tutor_id);

DROP POLICY IF EXISTS "Tutors can insert their own course applications" ON public.course_tutor_applications;
CREATE POLICY "Tutors can insert their own course applications" 
ON public.course_tutor_applications FOR INSERT 
WITH CHECK (
    auth.uid() = tutor_id AND 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'tutor')
);

DROP POLICY IF EXISTS "Admins have full access to course applications" ON public.course_tutor_applications;
CREATE POLICY "Admins have full access to course applications" 
ON public.course_tutor_applications FOR ALL 
USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
