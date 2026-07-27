-- Redesign tutor_verifications table for production-grade onboarding
DROP TABLE IF EXISTS public.tutor_verifications CASCADE;

CREATE TABLE public.tutor_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tutor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    tutor_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending', -- 'Pending' | 'Documents Submitted' | 'AI Test Scheduled' | 'AI Test Completed' | 'Under Review' | 'Approved' | 'Rejected'
    personal_info JSONB DEFAULT '{}'::jsonb,
    academic_qualifications JSONB DEFAULT '[]'::jsonb,
    teaching_experience JSONB DEFAULT '{}'::jsonb,
    subject_selection JSONB DEFAULT '{}'::jsonb,
    gov_id_url TEXT,
    degree_url TEXT,
    certificates_url TEXT,
    resume_url TEXT,
    video_demo_url TEXT,
    ai_evaluation JSONB DEFAULT '{}'::jsonb, -- stores overall_score, strengths, weaknesses, learning_plan, sub-scores
    admin_notes TEXT,
    admin_feedback TEXT,
    rejection_reason TEXT,
    live_interview_details JSONB DEFAULT '{}'::jsonb, -- stores date, meeting link, notes
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.tutor_verifications ENABLE ROW LEVEL SECURITY;

-- Select policy: Users can see their own applications, admins can see all.
CREATE POLICY "Allow users to read their own verification" ON public.tutor_verifications 
    FOR SELECT USING (auth.uid() = tutor_id);

-- Write policies: Users can insert and update their own application
CREATE POLICY "Allow users to insert own verification" ON public.tutor_verifications 
    FOR INSERT WITH CHECK (auth.uid() = tutor_id);

CREATE POLICY "Allow users to update own verification" ON public.tutor_verifications 
    FOR UPDATE USING (auth.uid() = tutor_id);

-- Admin policy: Full access
CREATE POLICY "Allow admins full access to tutor verifications" ON public.tutor_verifications 
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );
