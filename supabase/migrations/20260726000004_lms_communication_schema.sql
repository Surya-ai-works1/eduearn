-- 1. Global Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'general', -- 'enrollment', 'assignment', 'quiz', 'payout', 'announcement', 'security'
    read BOOLEAN NOT NULL DEFAULT false,
    archived BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on Notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
ON public.notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
ON public.notifications FOR UPDATE
USING (auth.uid() = user_id);

-- 2. Notification Preferences Table
CREATE TABLE IF NOT EXISTS public.notification_preferences (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    email_enabled BOOLEAN NOT NULL DEFAULT true,
    push_enabled BOOLEAN NOT NULL DEFAULT true,
    assignment_alerts BOOLEAN NOT NULL DEFAULT true,
    course_updates BOOLEAN NOT NULL DEFAULT true,
    marketing_emails BOOLEAN NOT NULL DEFAULT false,
    certificate_alerts BOOLEAN NOT NULL DEFAULT true,
    live_session_reminders BOOLEAN NOT NULL DEFAULT true,
    payment_alerts BOOLEAN NOT NULL DEFAULT true,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on Notification Preferences
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own notification preferences"
ON public.notification_preferences FOR ALL
USING (auth.uid() = user_id);

-- 3. Conversations Table (Direct message groupings)
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on Conversations
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create conversations"
ON public.conversations FOR INSERT
WITH CHECK (true);

-- 4. Conversation Members Table
CREATE TABLE IF NOT EXISTS public.conversation_members (
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (conversation_id, user_id)
);

-- Enable RLS on Conversation Members
ALTER TABLE public.conversation_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view their conversation members"
ON public.conversation_members FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.conversation_members AS cm
        WHERE cm.conversation_id = conversation_members.conversation_id AND cm.user_id = auth.uid()
    )
);

-- 5. Messages Table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'sent', -- 'sent' | 'delivered' | 'read'
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on Messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view conversation messages"
ON public.messages FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.conversation_members
        WHERE conversation_members.conversation_id = messages.conversation_id AND conversation_members.user_id = auth.uid()
    )
);

CREATE POLICY "Members can post messages"
ON public.messages FOR INSERT
WITH CHECK (
    sender_id = auth.uid() AND EXISTS (
        SELECT 1 FROM public.conversation_members
        WHERE conversation_members.conversation_id = messages.conversation_id AND conversation_members.user_id = auth.uid()
    )
);

-- 6. Message Attachments Table
CREATE TABLE IF NOT EXISTS public.message_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on Attachments
ALTER TABLE public.message_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view attachments"
ON public.message_attachments FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.messages
        JOIN public.conversation_members ON conversation_members.conversation_id = messages.conversation_id
        WHERE messages.id = message_attachments.message_id AND conversation_members.user_id = auth.uid()
    )
);

-- 7. Broadcast Logs Table
CREATE TABLE IF NOT EXISTS public.broadcast_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    target_audience TEXT NOT NULL DEFAULT 'all', -- 'all' | 'students' | 'tutors'
    type TEXT NOT NULL DEFAULT 'announcement', -- 'announcement' | 'maintenance' | 'feature' | 'security'
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on Broadcast Logs
ALTER TABLE public.broadcast_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view broadcast logs"
ON public.broadcast_logs FOR SELECT
USING (true);

-- Indexes for performance optimizing
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_members_user_id ON public.conversation_members(user_id);
CREATE INDEX IF NOT EXISTS idx_message_attachments_message_id ON public.message_attachments(message_id);
