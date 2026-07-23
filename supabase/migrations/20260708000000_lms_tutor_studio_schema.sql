-- Supabase Schema Migration: LMS Tutor Studio Support
-- Created: 2026-07-08

-- 1. Courses Table
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tutor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    subtitle TEXT,
    description TEXT,
    category TEXT NOT NULL,
    level TEXT NOT NULL,
    thumbnail TEXT,
    price NUMERIC NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'published',
    approval_status TEXT NOT NULL DEFAULT 'approved',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on Courses
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Courses RLS Policies
CREATE POLICY "Allow public read access to courses" 
ON public.courses FOR SELECT 
USING (true);

CREATE POLICY "Allow tutors to insert their own courses" 
ON public.courses FOR INSERT 
WITH CHECK (auth.uid() = tutor_id);

CREATE POLICY "Allow tutors to update their own courses" 
ON public.courses FOR UPDATE 
USING (auth.uid() = tutor_id)
WITH CHECK (auth.uid() = tutor_id);

CREATE POLICY "Allow tutors to delete their own courses" 
ON public.courses FOR DELETE 
USING (auth.uid() = tutor_id);


-- 2. Lessons (Lectures) Table
CREATE TABLE IF NOT EXISTS public.lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    video_url TEXT,
    duration NUMERIC DEFAULT 0,
    lesson_order INT DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on Lessons
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

-- Lessons RLS Policies
CREATE POLICY "Allow public read access to lessons" 
ON public.lessons FOR SELECT 
USING (true); -- Real implementation might restrict this to enrolled students

CREATE POLICY "Allow course owners to modify lessons" 
ON public.lessons FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.courses 
        WHERE courses.id = lessons.course_id AND courses.tutor_id = auth.uid()
    )
);


-- 3. Assignments Table
CREATE TABLE IF NOT EXISTS public.assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    file_url TEXT,
    due_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on Assignments
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

-- Assignments RLS Policies
CREATE POLICY "Allow public read access to assignments" 
ON public.assignments FOR SELECT 
USING (true);

CREATE POLICY "Allow course owners to modify assignments" 
ON public.assignments FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.courses 
        WHERE courses.id = assignments.course_id AND courses.tutor_id = auth.uid()
    )
);


-- 4. Live Classes Table
CREATE TABLE IF NOT EXISTS public.live_classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    tutor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    scheduled_at TIMESTAMPTZ NOT NULL,
    duration NUMERIC NOT NULL DEFAULT 60,
    meeting_link TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on Live Classes
ALTER TABLE public.live_classes ENABLE ROW LEVEL SECURITY;

-- Live Classes RLS Policies
CREATE POLICY "Allow public read access to live classes" 
ON public.live_classes FOR SELECT 
USING (true);

CREATE POLICY "Allow course owners to modify live classes" 
ON public.live_classes FOR ALL 
USING (auth.uid() = tutor_id);


-- 5. Tutor Earnings Table
CREATE TABLE IF NOT EXISTS public.tutor_earnings (
    tutor_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    total_earnings NUMERIC NOT NULL DEFAULT 0,
    available_balance NUMERIC NOT NULL DEFAULT 0,
    withdrawn_amount NUMERIC NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on Tutor Earnings
ALTER TABLE public.tutor_earnings ENABLE ROW LEVEL SECURITY;

-- Tutor Earnings RLS Policies
CREATE POLICY "Allow tutors to view their own earnings" 
ON public.tutor_earnings FOR SELECT 
USING (auth.uid() = tutor_id);


-- 6. Withdrawal Requests Table
CREATE TABLE IF NOT EXISTS public.withdrawal_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tutor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on Withdrawal Requests
ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;

-- Withdrawal Requests RLS Policies
CREATE POLICY "Allow tutors to view and create their own withdrawals" 
ON public.withdrawal_requests FOR ALL 
USING (auth.uid() = tutor_id);
