-- Migration: 20260926000002_live_classes_security_and_provider.sql
-- Description: Add provider and status columns to live_classes and harden RLS policies.

-- 1. Add provider and status columns if they do not exist
ALTER TABLE public.live_classes
  ADD COLUMN IF NOT EXISTS provider text DEFAULT 'google_meet',
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'scheduled';

-- Add check constraints for provider and status
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'live_classes_provider_check'
  ) THEN
    ALTER TABLE public.live_classes
      ADD CONSTRAINT live_classes_provider_check
      CHECK (provider IN ('google_meet', 'zoom'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'live_classes_status_check'
  ) THEN
    ALTER TABLE public.live_classes
      ADD CONSTRAINT live_classes_status_check
      CHECK (status IN ('scheduled', 'live', 'completed', 'cancelled'));
  END IF;
END $$;

-- 2. Enable RLS on public.live_classes
ALTER TABLE public.live_classes ENABLE ROW LEVEL SECURITY;

-- 3. Drop ALL existing permissive or legacy policies (both space and underscore naming)
DROP POLICY IF EXISTS "Allow public read access to live classes" ON public.live_classes;
DROP POLICY IF EXISTS "Allow public read access to live_classes" ON public.live_classes;
DROP POLICY IF EXISTS "Allow course owners to modify live classes" ON public.live_classes;
DROP POLICY IF EXISTS "Allow course owners to modify live_classes" ON public.live_classes;
DROP POLICY IF EXISTS "Allow tutors to insert live_classes" ON public.live_classes;
DROP POLICY IF EXISTS "Allow tutors to update live_classes" ON public.live_classes;
DROP POLICY IF EXISTS "Allow tutors to delete live_classes" ON public.live_classes;
DROP POLICY IF EXISTS "Enrolled students can view live classes for their courses" ON public.live_classes;
DROP POLICY IF EXISTS "Tutors can view live classes for their own courses" ON public.live_classes;
DROP POLICY IF EXISTS "Tutors can insert live classes for their own courses" ON public.live_classes;
DROP POLICY IF EXISTS "Tutors can update live classes for their own courses" ON public.live_classes;
DROP POLICY IF EXISTS "Tutors can delete live classes for their own courses" ON public.live_classes;
DROP POLICY IF EXISTS "Admins have full access over live_classes" ON public.live_classes;

-- 4. Enrolled Students SELECT policy (Strictly enrolled students only)
CREATE POLICY "Enrolled students can view live classes for their courses"
ON public.live_classes FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.enrollments
    WHERE enrollments.learner_id = auth.uid()
      AND enrollments.course_id = live_classes.course_id
  )
);

-- 5. Tutor Read Policy (Tutors can view live classes for their owned courses)
CREATE POLICY "Tutors can view live classes for their own courses"
ON public.live_classes FOR SELECT
TO authenticated
USING (
  auth.uid() = tutor_id
);

-- 6. Tutor Insert Policy (Tutors can create live classes for their owned courses)
CREATE POLICY "Tutors can insert live classes for their own courses"
ON public.live_classes FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = tutor_id
  AND EXISTS (
    SELECT 1 FROM public.courses
    WHERE courses.id = live_classes.course_id
      AND courses.tutor_id = auth.uid()
  )
);

-- 7. Tutor Update Policy (Tutors can update live classes for their owned courses)
CREATE POLICY "Tutors can update live classes for their owned courses"
ON public.live_classes FOR UPDATE
TO authenticated
USING (
  auth.uid() = tutor_id
)
WITH CHECK (
  auth.uid() = tutor_id
);

-- 8. Tutor Delete Policy (Tutors can delete live classes for their owned courses)
CREATE POLICY "Tutors can delete live classes for their owned courses"
ON public.live_classes FOR DELETE
TO authenticated
USING (
  auth.uid() = tutor_id
);

-- 9. Admin Governance Policy (Full access for admins)
CREATE POLICY "Admins have full access over live_classes"
ON public.live_classes FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super-admin')
  )
);
