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
