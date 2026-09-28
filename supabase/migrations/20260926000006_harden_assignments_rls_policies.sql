-- Migration: 20260926000006_harden_assignments_rls_policies.sql
-- Description: Drop legacy public read policy on assignments table and restrict access to authenticated enrolled students, course tutors, and admins.

-- 1. Drop all legacy/permissive policies on public.assignments
DROP POLICY IF EXISTS "Allow public read access to assignments" ON public.assignments;
DROP POLICY IF EXISTS "Allow public read access to assignments " ON public.assignments;
DROP POLICY IF EXISTS "Allow course owners to modify assignments" ON public.assignments;
DROP POLICY IF EXISTS "Assignments read policy" ON public.assignments;
DROP POLICY IF EXISTS "Assignments manage policy" ON public.assignments;

-- Ensure RLS is enabled
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

-- 2. Authenticated-only read policy: Enrolled students, course tutor, and admins
CREATE POLICY "Authenticated users read course assignments"
ON public.assignments
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.enrollments
        WHERE enrollments.course_id = assignments.course_id AND enrollments.learner_id = auth.uid()
    )
    OR EXISTS (
        SELECT 1 FROM public.courses
        WHERE courses.id = assignments.course_id AND courses.tutor_id = auth.uid()
    )
    OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
);

-- 3. Modify policy: Course tutor and admins only
CREATE POLICY "Tutors and admins modify course assignments"
ON public.assignments
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.courses
        WHERE courses.id = assignments.course_id AND courses.tutor_id = auth.uid()
    )
    OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.courses
        WHERE courses.id = assignments.course_id AND courses.tutor_id = auth.uid()
    )
    OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
);
