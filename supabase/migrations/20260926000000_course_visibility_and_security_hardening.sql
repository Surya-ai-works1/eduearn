-- Migration: 20260926000000_course_visibility_and_security_hardening.sql
-- Description: Harden public course SELECT policy so draft/pending/rejected courses are not exposed to unauthorized public users.

-- 1. Drop existing policies on public.courses
DROP POLICY IF EXISTS "Allow public read access to courses" ON public.courses;
DROP POLICY IF EXISTS "Allow tutors to insert their own courses" ON public.courses;
DROP POLICY IF EXISTS "Allow tutors to update their own courses" ON public.courses;
DROP POLICY IF EXISTS "Allow tutors to delete their own courses" ON public.courses;
DROP POLICY IF EXISTS "Allow admins full access to courses" ON public.courses;
DROP POLICY IF EXISTS "Public and Students can only view published and approved courses" ON public.courses;
DROP POLICY IF EXISTS "Tutors can view their own courses in any status" ON public.courses;
DROP POLICY IF EXISTS "Tutors can insert their own draft courses" ON public.courses;
DROP POLICY IF EXISTS "Tutors can update their own courses" ON public.courses;
DROP POLICY IF EXISTS "Tutors can delete their own draft courses" ON public.courses;
DROP POLICY IF EXISTS "Admins have full governance access over courses" ON public.courses;

-- 2. Public & Learner Read Policy (Published & Approved courses or system catalog templates)
CREATE POLICY "Public and Students can only view published and approved courses"
ON public.courses FOR SELECT
USING (
  (status = 'published' AND (approval_status = 'approved' OR approval_status IS NULL))
  OR tutor_id IS NULL
);

-- 3. Tutor Read Policy (Tutor can view ALL their own courses regardless of draft/pending status)
CREATE POLICY "Tutors can view their own courses in any status"
ON public.courses FOR SELECT
TO authenticated
USING (auth.uid() = tutor_id);

-- 4. Tutor Insert Policy (Tutor can create draft courses for themselves)
CREATE POLICY "Tutors can insert their own draft courses"
ON public.courses FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = tutor_id);

-- 5. Tutor Update Policy (Tutor can edit their own courses)
CREATE POLICY "Tutors can update their own courses"
ON public.courses FOR UPDATE
TO authenticated
USING (auth.uid() = tutor_id)
WITH CHECK (auth.uid() = tutor_id);

-- 6. Tutor Delete Policy (Tutor can delete their own draft/pending courses)
CREATE POLICY "Tutors can delete their own draft courses"
ON public.courses FOR DELETE
TO authenticated
USING (auth.uid() = tutor_id AND (status = 'draft' OR approval_status = 'pending'));

-- 7. Admin Governance Policy
CREATE POLICY "Admins have full governance access over courses"
ON public.courses FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'super-admin')
  )
);
