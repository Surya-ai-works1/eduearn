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
