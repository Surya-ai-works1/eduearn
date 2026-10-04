-- ==============================================================================
-- 🚀 EDUEARN COMPLETE UNIFIED SCHEMAS, STORAGE BUCKETS, TRIGGERS & RLS POLICIES
-- Run this script inside the Supabase Dashboard SQL Editor to initialize all tables.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 📁 Migration Schema: 20260708000000_lms_tutor_studio_schema.sql
-- ------------------------------------------------------------------------------

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


-- ------------------------------------------------------------------------------
-- 📁 Migration Schema: 20260708000001_lms_hubs_and_forums_schema.sql
-- ------------------------------------------------------------------------------

-- Supabase Schema Migration: LMS Hubs & Forums Support
-- Created: 2026-07-08

-- 1. Community Posts Table
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    tags TEXT[],
    correct_comment_id UUID, -- reference to comments table (will be added as FK after comments table)
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on Posts
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Posts RLS Policies
CREATE POLICY "Allow public read access to posts" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Allow users to create posts" ON public.posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Allow owners to modify posts" ON public.posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Allow owners to delete posts" ON public.posts FOR DELETE USING (auth.uid() = user_id);


-- 2. Comments Table
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
    is_correct BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add Foreign Key constraint for correct_comment_id on posts
ALTER TABLE public.posts ADD CONSTRAINT fk_correct_comment FOREIGN KEY (correct_comment_id) REFERENCES public.comments(id) ON DELETE SET NULL;

-- Enable RLS on Comments
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Comments RLS Policies
CREATE POLICY "Allow public read access to comments" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Allow users to create comments" ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Allow owners to modify comments" ON public.comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Allow owners to delete comments" ON public.comments FOR DELETE USING (auth.uid() = user_id);


-- 3. Post Likes Table
CREATE TABLE IF NOT EXISTS public.post_likes (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, post_id)
);

-- Enable RLS on Post Likes
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

-- Post Likes RLS Policies
CREATE POLICY "Allow public read access to likes" ON public.post_likes FOR SELECT USING (true);
CREATE POLICY "Allow users to toggle likes" ON public.post_likes FOR ALL USING (auth.uid() = user_id);


-- 4. Study Groups Table
CREATE TABLE IF NOT EXISTS public.study_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on Study Groups
ALTER TABLE public.study_groups ENABLE ROW LEVEL SECURITY;

-- Study Groups RLS Policies
CREATE POLICY "Allow public read access to study groups" ON public.study_groups FOR SELECT USING (true);
CREATE POLICY "Allow users to create study groups" ON public.study_groups FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Allow creators to modify study groups" ON public.study_groups FOR UPDATE USING (auth.uid() = creator_id);
CREATE POLICY "Allow creators to delete study groups" ON public.study_groups FOR DELETE USING (auth.uid() = creator_id);


-- 5. Study Group Members Table
CREATE TABLE IF NOT EXISTS public.study_group_members (
    group_id UUID NOT NULL REFERENCES public.study_groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    PRIMARY KEY (group_id, user_id)
);

-- Enable RLS on Study Group Members
ALTER TABLE public.study_group_members ENABLE ROW LEVEL SECURITY;

-- Study Group Members RLS Policies
CREATE POLICY "Allow public read access to study group members" ON public.study_group_members FOR SELECT USING (true);
CREATE POLICY "Allow users to join/leave groups" ON public.study_group_members FOR ALL USING (auth.uid() = user_id);


-- 6. Follows (Followers) Table
CREATE TABLE IF NOT EXISTS public.follows (
    follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    PRIMARY KEY (follower_id, following_id),
    CONSTRAINT chk_not_self CHECK (follower_id <> following_id)
);

-- Enable RLS on Follows
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- Follows RLS Policies
CREATE POLICY "Allow public read access to follows" ON public.follows FOR SELECT USING (true);
CREATE POLICY "Allow users to toggle follow statuses" ON public.follows FOR ALL USING (auth.uid() = follower_id);


-- 7. AI Chat & Tool History Table
CREATE TABLE IF NOT EXISTS public.ai_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tool_type TEXT NOT NULL, -- 'tutor' | 'planner' | 'notes' | 'quiz' | 'summarizer' | 'resume' | etc.
    prompt TEXT NOT NULL,
    response TEXT NOT NULL,
    is_favorite BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on AI History
ALTER TABLE public.ai_history ENABLE ROW LEVEL SECURITY;

-- AI History RLS Policies
CREATE POLICY "Allow users to access their own AI history" ON public.ai_history FOR ALL USING (auth.uid() = user_id);


-- 8. Career Resumes Table
CREATE TABLE IF NOT EXISTS public.resumes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'My Resume',
    raw_text TEXT,
    parsed_data JSONB,
    score INT DEFAULT 0,
    suggestions JSONB,
    file_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on Resumes
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;

-- Resumes RLS Policies
CREATE POLICY "Allow users to access their own resumes" ON public.resumes FOR ALL USING (auth.uid() = user_id);


-- 9. Career Roadmaps Table
CREATE TABLE IF NOT EXISTS public.roadmaps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role_title TEXT NOT NULL,
    steps JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on Roadmaps
ALTER TABLE public.roadmaps ENABLE ROW LEVEL SECURITY;

-- Roadmaps RLS Policies
CREATE POLICY "Allow users to access their own roadmaps" ON public.roadmaps FOR ALL USING (auth.uid() = user_id);


-- 10. Database Performance Indexes
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON public.posts(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON public.comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_ai_history_user_id ON public.ai_history(user_id);
CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON public.resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_roadmaps_user_id ON public.roadmaps(user_id);


-- ------------------------------------------------------------------------------
-- 📁 Migration Schema: 20260708000002_lms_admin_schema.sql
-- ------------------------------------------------------------------------------

-- Supabase Schema Migration: LMS Admin Dashboard Support
-- Created: 2026-07-08

-- 1. Tutor Verification Applications Table
CREATE TABLE IF NOT EXISTS public.tutor_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tutor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tutor_name TEXT NOT NULL,
    expertise TEXT NOT NULL,
    education TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending', -- 'Pending' | 'Approved' | 'Rejected'
    gov_id_url TEXT,
    degree_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on Tutor Verifications
ALTER TABLE public.tutor_verifications ENABLE ROW LEVEL SECURITY;

-- Tutor Verifications RLS Policies
CREATE POLICY "Allow admins to read all verifications" ON public.tutor_verifications FOR SELECT USING (true); -- Real app would restrict to admins
CREATE POLICY "Allow tutors to insert their own verifications" ON public.tutor_verifications FOR INSERT WITH CHECK (auth.uid() = tutor_id);
CREATE POLICY "Allow admins to modify verifications" ON public.tutor_verifications FOR ALL USING (true); -- Restrictable to admins


-- 2. System Settings Table
CREATE TABLE IF NOT EXISTS public.system_settings (
    id TEXT PRIMARY KEY, -- 'main_config'
    maintenance_mode BOOLEAN DEFAULT false,
    system_version TEXT DEFAULT '1.0.0',
    brand_color TEXT DEFAULT '#3B82F6',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on System Settings
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- System Settings RLS Policies
CREATE POLICY "Allow public read access to system settings" ON public.system_settings FOR SELECT USING (true);
CREATE POLICY "Allow admins to modify settings" ON public.system_settings FOR ALL USING (true);


-- 3. Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    details TEXT,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on Audit Logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Audit Logs RLS Policies
CREATE POLICY "Allow admins to access audit logs" ON public.audit_logs FOR SELECT USING (true);
CREATE POLICY "Allow system to insert audit logs" ON public.audit_logs FOR INSERT WITH CHECK (true);


-- 4. Database Performance Indexes
CREATE INDEX IF NOT EXISTS idx_tutor_verifications_tutor_id ON public.tutor_verifications(tutor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);


-- ------------------------------------------------------------------------------
-- 📁 Migration Schema: 20260708000003_lms_lessons_position.sql
-- ------------------------------------------------------------------------------

-- Alter public.lessons to support description and position columns
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS position INT DEFAULT 0;

-- Backfill existing rows
UPDATE public.lessons SET position = COALESCE(lesson_order, 0) WHERE position IS NULL OR position = 0;

-- Create index on course_id + position
CREATE INDEX IF NOT EXISTS idx_lessons_course_id_position ON public.lessons(course_id, position);

-- Ensure storage lectures bucket exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('lectures', 'lectures', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for storage bucket
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Allow public read access to lectures'
    ) THEN
        CREATE POLICY "Allow public read access to lectures" ON storage.objects FOR SELECT USING (bucket_id = 'lectures');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Allow authenticated users to upload lectures'
    ) THEN
        CREATE POLICY "Allow authenticated users to upload lectures" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'lectures');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Allow authenticated users to update/delete lectures'
    ) THEN
        CREATE POLICY "Allow authenticated users to update/delete lectures" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'lectures');
    END IF;
END
$$;


-- ------------------------------------------------------------------------------
-- 📁 Migration Schema: 20260708000005_lms_enrollments_and_rls.sql
-- ------------------------------------------------------------------------------

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


-- ------------------------------------------------------------------------------
-- 📁 Migration Schema: 20260708000006_lms_profiles_v2.sql
-- ------------------------------------------------------------------------------

-- Alter profiles to support requested columns
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

-- Ensure default role is 'student'
ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'student';

-- Trigger to automatically create a profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, full_name, avatar_url, created_at, updated_at)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'role', 'student'),
    COALESCE(new.raw_user_meta_data->>'fullName', new.raw_user_meta_data->>'full_name', 'Student Learner'),
    new.raw_user_meta_data->>'avatar_url',
    now(),
    now()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ------------------------------------------------------------------------------
-- 📁 Migration Schema: 20260708000007_lms_assignment_submissions.sql
-- ------------------------------------------------------------------------------

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


-- ------------------------------------------------------------------------------
-- 📁 Migration Schema: 20260708000008_lms_enrollment_certificate.sql
-- ------------------------------------------------------------------------------

-- Add certificate_url to public.enrollments
ALTER TABLE public.enrollments ADD COLUMN IF NOT EXISTS certificate_url TEXT;


-- ------------------------------------------------------------------------------
-- 📁 Migration Schema: 20260709000000_lms_ai_features.sql
-- ------------------------------------------------------------------------------

-- ─── EduEarn AI Features Schema Migration ─────────────────────────────────────
-- Setup database tables to support AI Notes Library, persistent AI Chat Sessions,
-- and Tutor Course AI Assistant configurations. Enables Row Level Security (RLS)
-- and setups matching policies for security.

-- 1. Notes Library Table
CREATE TABLE IF NOT EXISTS public.notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    module TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}'::TEXT[],
    course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS policies for notes
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own notes"
    ON public.notes
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);


-- 2. AI Chat Sessions Table
CREATE TABLE IF NOT EXISTS public.ai_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    module TEXT NOT NULL,
    messages JSONB DEFAULT '[]'::JSONB,
    is_pinned BOOLEAN NOT NULL DEFAULT false,
    course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS policies for ai_sessions
ALTER TABLE public.ai_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own AI sessions"
    ON public.ai_sessions
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);


-- 3. AI Assistant Configuration Table
CREATE TABLE IF NOT EXISTS public.assistant_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tutor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    course_id UUID UNIQUE NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    name TEXT NOT NULL DEFAULT 'Course Assistant',
    persona TEXT NOT NULL DEFAULT 'friendly',
    tone TEXT NOT NULL DEFAULT 'encouraging',
    system_prompt TEXT NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS policies for assistant_configs
ALTER TABLE public.assistant_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tutors can manage configs for their own courses"
    ON public.assistant_configs
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.courses c
            WHERE c.id = course_id AND c.tutor_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.courses c
            WHERE c.id = course_id AND c.tutor_id = auth.uid()
        )
    );

CREATE POLICY "Anyone can view active assistant configurations"
    ON public.assistant_configs
    FOR SELECT
    USING (enabled = true);


-- ------------------------------------------------------------------------------
-- 📁 Migration Schema: 20260710000000_lms_missing_tables.sql
-- ------------------------------------------------------------------------------

-- 🗄️ EduEarn Missing Tables Migration
-- Created: 2026-07-11

-- 1. Quizzes Table
CREATE TABLE IF NOT EXISTS public.quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    passing_score NUMERIC NOT NULL DEFAULT 60,
    questions JSONB DEFAULT '[]'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on Quizzes
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to quizzes"
ON public.quizzes FOR SELECT
USING (true);

CREATE POLICY "Allow tutors to manage quizzes for their courses"
ON public.quizzes FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.courses
        WHERE courses.id = quizzes.course_id AND courses.tutor_id = auth.uid()
    )
);


-- 2. Quiz Attempts Table
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
    score NUMERIC NOT NULL,
    passed BOOLEAN NOT NULL,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on Quiz Attempts
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own quiz attempts"
ON public.quiz_attempts FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Tutors can view attempts for their courses"
ON public.quiz_attempts FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.quizzes
        JOIN public.courses ON courses.id = quizzes.course_id
        WHERE quizzes.id = quiz_attempts.quiz_id AND courses.tutor_id = auth.uid()
    )
);


-- 3. Flashcards Table
CREATE TABLE IF NOT EXISTS public.flashcards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    front TEXT NOT NULL,
    back TEXT NOT NULL,
    is_learned BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on Flashcards
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own flashcards"
ON public.flashcards FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);


-- 4. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    type TEXT NOT NULL DEFAULT 'general',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on Notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own notifications"
ON public.notifications FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);


-- 5. Wishlist Table
CREATE TABLE IF NOT EXISTS public.wishlist (
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, course_id)
);

-- Enable RLS on Wishlist
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own wishlist"
ON public.wishlist FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);


-- 6. Payments Table
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    provider TEXT NOT NULL DEFAULT 'razorpay',
    tx_id TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on Payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own payments"
ON public.payments FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins have full access to payments"
ON public.payments FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
);


-- 7. Reviews Table
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, course_id)
);

-- Enable RLS on Reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to reviews"
ON public.reviews FOR SELECT
USING (true);

CREATE POLICY "Users can manage their own reviews"
ON public.reviews FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);


-- 8. Attendance Table
CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    live_class_id UUID NOT NULL REFERENCES public.live_classes(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, live_class_id)
);

-- Enable RLS on Attendance
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view and create their own attendance"
ON public.attendance FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Tutors can view attendance for their classes"
ON public.attendance FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.live_classes
        WHERE live_classes.id = attendance.live_class_id AND live_classes.tutor_id = auth.uid()
    )
);


-- 9. Achievements Table
CREATE TABLE IF NOT EXISTS public.achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    badge_url TEXT,
    unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on Achievements
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own achievements"
ON public.achievements FOR SELECT
USING (auth.uid() = user_id);


-- 10. Reward Transactions Table
CREATE TABLE IF NOT EXISTS public.reward_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount INT NOT NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('earn', 'spend')),
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on Reward Transactions
ALTER TABLE public.reward_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own reward transactions"
ON public.reward_transactions FOR SELECT
USING (auth.uid() = user_id);


-- 11. Learning Progress Table
CREATE TABLE IF NOT EXISTS public.learning_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    completed BOOLEAN NOT NULL DEFAULT true,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, lesson_id)
);

-- Enable RLS on Learning Progress
ALTER TABLE public.learning_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own learning progress"
ON public.learning_progress FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);


-- 12. Database Performance Indexes
CREATE INDEX IF NOT EXISTS idx_quizzes_course_id ON public.quizzes(course_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON public.quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_user_id ON public.flashcards(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_course_id ON public.reviews(course_id);
CREATE INDEX IF NOT EXISTS idx_attendance_live_class_id ON public.attendance(live_class_id);
CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON public.achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_reward_transactions_user_id ON public.reward_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_progress_user_id ON public.learning_progress(user_id);


-- ------------------------------------------------------------------------------
-- 🗄️ Unified Storage Buckets Setup (Step 3 & Step 7)
-- ------------------------------------------------------------------------------


-- 1. Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('avatars', 'avatars', true),
  ('course-thumbnails', 'course-thumbnails', true),
  ('course-resources', 'course-resources', true),
  ('assignments', 'assignments', true),
  ('certificates', 'certificates', true),
  ('community', 'community', true),
  ('tutor-documents', 'tutor-documents', false),
  ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- 2. Create Storage policies for SELECT, INSERT, UPDATE, DELETE on each bucket
DO $$
DECLARE
    bucket_name TEXT;
    buckets TEXT[] := ARRAY['avatars', 'course-thumbnails', 'course-resources', 'assignments', 'certificates', 'community', 'tutor-documents', 'documents'];
BEGIN
    FOREACH bucket_name IN ARRAY buckets LOOP
        -- Select Policy
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Allow public read access to ' || bucket_name
        ) THEN
            EXECUTE format('CREATE POLICY %I ON storage.objects FOR SELECT USING (bucket_id = %L)', 'Allow public read access to ' || bucket_name, bucket_name);
        END IF;

        -- Insert Policy
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Allow authenticated users to upload to ' || bucket_name
        ) THEN
            EXECUTE format('CREATE POLICY %I ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = %L)', 'Allow authenticated users to upload to ' || bucket_name, bucket_name);
        END IF;

        -- Update/Delete Policy
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Allow authenticated users to modify in ' || bucket_name
        ) THEN
            EXECUTE format('CREATE POLICY %I ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = %L)', 'Allow authenticated users to modify in ' || bucket_name, bucket_name);
        END IF;
    END LOOP;
END
$$;


-- ------------------------------------------------------------------------------
-- 🌱 Master Seed Data (Step 8)
-- ------------------------------------------------------------------------------


-- 1. Master Categories Seed Data
CREATE TABLE IF NOT EXISTS public.categories (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'Enabled',
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO public.categories (name, status, description) VALUES
  ('Web Development', 'Enabled', 'Build modern websites and web applications using HTML, CSS, JavaScript, React, and Node.'),
  ('App Development', 'Enabled', 'Create native and cross-platform mobile apps for iOS and Android devices.'),
  ('AI/ML', 'Enabled', 'Explore artificial intelligence, machine learning models, neural networks, and prompt engineering.'),
  ('AI Tools', 'Enabled', 'Learn to utilize generative AI tools like Midjourney, ChatGPT, and Copilot for productivity.'),
  ('Data Science', 'Enabled', 'Analyze data, build models, and extract insights using Python, R, and statistical libraries.'),
  ('Data Analytics', 'Enabled', 'Visualize data, create dashboards, and perform business intelligence using SQL, Tableau, and PowerBI.'),
  ('Ethical Hacking', 'Enabled', 'Master cybersecurity, network defense, penetration testing, and secure coding practices.'),
  ('UI UX Designing', 'Enabled', 'Design premium interfaces, user flows, and wireframes in Figma and Adobe Creative Suite.'),
  ('Academic Education', 'Enabled', 'Explore school subjects, competitive exams, secondary MPC, and BiPC prep courses.'),
  ('Others', 'Enabled', 'General academic topics, creative studies, and peer-to-peer coaching categories.')
ON CONFLICT (name) DO NOTHING;

-- 2. Master Course Levels Seed Data
-- Standard course levels referenced across dynamic selection dropdowns
-- (Beginner, Intermediate, Advanced, Expert)

-- 3. Master Languages Seed Data
-- Languages supported by localized UI outlines and translator templates
-- (English, Telugu, Hindi, Spanish, Korean, French)

-- 4. Master tags / skills Seed Data
-- (React JS, Python, Javascript, CSS, HTML, Flutter, Figma, Machine Learning, Data Analytics)

