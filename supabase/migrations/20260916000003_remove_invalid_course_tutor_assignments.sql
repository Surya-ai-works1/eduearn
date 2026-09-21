-- ==============================================================================
-- 🚀 EDUEARN REMEDIATION MIGRATION: REMOVE INVALID COURSE TUTOR ASSIGNMENTS
-- Migration: 20260916000003_remove_invalid_course_tutor_assignments.sql
-- Non-Destructive, Idempotent Remediation Migration
-- ==============================================================================

-- 1. Ensure courses.tutor_id can be NULL when unassigned
DO $$
BEGIN
    ALTER TABLE public.courses ALTER COLUMN tutor_id DROP NOT NULL;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- 2. Cleanly remove invalid course tutor assignments and unpublish them
-- Any course whose tutor_id does not correspond to a profile with role = 'tutor'
UPDATE public.courses
SET 
    tutor_id = NULL,
    status = 'draft',
    approval_status = 'pending',
    updated_at = now()
WHERE 
    tutor_id IS NOT NULL 
    AND tutor_id NOT IN (
        SELECT id FROM public.profiles WHERE role = 'tutor'
    );

-- 3. Database Trigger: Enforce Server-Side Publication & Purchase Safety
CREATE OR REPLACE FUNCTION public.check_course_tutor_publication_safety()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'published' AND NEW.approval_status = 'approved' THEN
        IF NEW.tutor_id IS NULL THEN
            RAISE EXCEPTION 'Publication rejected: Cannot publish a course without an assigned tutor_id.';
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = NEW.tutor_id AND role = 'tutor'
        ) THEN
            RAISE EXCEPTION 'Publication rejected: Course tutor_id does not belong to a legitimate tutor profile (role = tutor).';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_course_tutor_publication_safety ON public.courses;

CREATE TRIGGER trg_course_tutor_publication_safety
    BEFORE INSERT OR UPDATE ON public.courses
    FOR EACH ROW
    EXECUTE FUNCTION public.check_course_tutor_publication_safety();
