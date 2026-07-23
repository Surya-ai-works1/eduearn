-- Create Assignment Submissions Table
CREATE TABLE IF NOT EXISTS public.assignment_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT,
    file_url TEXT,
    grade TEXT,
    feedback TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(assignment_id, student_id)
);

-- Enable RLS
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;

-- Submissions RLS Policies
CREATE POLICY "Allow students to manage own submissions"
ON public.assignment_submissions FOR ALL
TO authenticated
USING (auth.uid() = student_id)
WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Allow course owners to view and grade submissions"
ON public.assignment_submissions FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.assignments
        JOIN public.courses ON courses.id = assignments.course_id
        WHERE assignments.id = assignment_submissions.assignment_id AND courses.tutor_id = auth.uid()
    )
);

CREATE POLICY "Allow admins full access to submissions"
ON public.assignment_submissions FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
);
