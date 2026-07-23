-- Create Profiles Table (user metadata sync)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'learner',
    display_name TEXT,
    bio TEXT,
    avatar_url TEXT,
    country TEXT,
    language TEXT,
    skills TEXT[],
    interests TEXT[],
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles RLS Policies
CREATE POLICY "Allow public select on profiles" 
ON public.profiles FOR SELECT 
USING (true);

CREATE POLICY "Allow users to manage own profile" 
ON public.profiles FOR ALL 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);


-- Create Enrollments Table
CREATE TABLE IF NOT EXISTS public.enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    learner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    progress NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(learner_id, course_id)
);

-- Enable RLS on Enrollments
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

-- Enrollments RLS Policies
CREATE POLICY "Allow learners to view own enrollments" 
ON public.enrollments FOR SELECT 
TO authenticated 
USING (auth.uid() = learner_id);

CREATE POLICY "Allow learners to self-enroll" 
ON public.enrollments FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = learner_id);

CREATE POLICY "Allow course tutors to view enrollments"
ON public.enrollments FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.courses
        WHERE courses.id = enrollments.course_id AND courses.tutor_id = auth.uid()
    )
);

CREATE POLICY "Allow admins full access to enrollments" 
ON public.enrollments FOR ALL 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
);


-- Admin access to courses policy
CREATE POLICY "Allow admins full access to courses"
ON public.courses FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
);
