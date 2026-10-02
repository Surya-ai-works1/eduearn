-- Migration: 20261002000000_resolve_advisor_security_findings.sql
-- Description: Resolve Supabase Database Advisor security findings and harden RLS policies across public schema.

-- ============================================================================
-- 0. Helper Functions (SECURITY DEFINER, SET search_path = public)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.is_chat_room_participant(p_room_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.chat_participants
    WHERE room_id = p_room_id AND user_id = p_user_id
  );
$$;

CREATE OR REPLACE FUNCTION public.is_chat_room_tutor(p_room_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.chat_rooms cr
    LEFT JOIN public.courses c ON c.id = cr.course_id
    LEFT JOIN public.live_classes lc ON lc.id = cr.live_class_id
    WHERE cr.id = p_room_id AND (c.tutor_id = p_user_id OR lc.tutor_id = p_user_id)
  );
$$;

CREATE OR REPLACE FUNCTION public.is_course_enrolled(p_course_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.enrollments
    WHERE course_id = p_course_id AND learner_id = p_user_id
  );
$$;

CREATE OR REPLACE FUNCTION public.is_conversation_member(p_conversation_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.conversation_members
    WHERE conversation_id = p_conversation_id AND user_id = p_user_id
  );
$$;


-- ============================================================================
-- 1. Table: public.document_sections (RLS Disabled -> Enabled)
-- ============================================================================
ALTER TABLE public.document_sections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authorized read access for document sections" ON public.document_sections;
DROP POLICY IF EXISTS "Tutors and admins manage document sections" ON public.document_sections;
DROP POLICY IF EXISTS "Allow authenticated read for document sections" ON public.document_sections;
DROP POLICY IF EXISTS "Anyone can view document sections" ON public.document_sections;

CREATE POLICY "Authorized read access for document sections"
ON public.document_sections FOR SELECT
USING (
  (EXISTS (
    SELECT 1 FROM public.courses c
    WHERE c.id = document_sections.course_id AND c.status = 'published'
  ))
  OR (EXISTS (
    SELECT 1 FROM public.enrollments e
    WHERE e.course_id = document_sections.course_id AND e.learner_id = auth.uid()
  ))
  OR (EXISTS (
    SELECT 1 FROM public.courses c
    WHERE c.id = document_sections.course_id AND c.tutor_id = auth.uid()
  ))
  OR (EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  ))
);

CREATE POLICY "Tutors and admins manage document sections"
ON public.document_sections FOR ALL
USING (
  (EXISTS (
    SELECT 1 FROM public.courses c
    WHERE c.id = document_sections.course_id AND c.tutor_id = auth.uid()
  ))
  OR (EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  ))
)
WITH CHECK (
  (EXISTS (
    SELECT 1 FROM public.courses c
    WHERE c.id = document_sections.course_id AND c.tutor_id = auth.uid()
  ))
  OR (EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  ))
);


-- ============================================================================
-- 2. Table: public.chat_rooms (RLS Disabled -> Enabled)
-- ============================================================================
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authorized users can view chat rooms" ON public.chat_rooms;
DROP POLICY IF EXISTS "Authorized users can create chat rooms" ON public.chat_rooms;
DROP POLICY IF EXISTS "Tutors and admins manage chat rooms" ON public.chat_rooms;

CREATE POLICY "Authorized users can view chat rooms"
ON public.chat_rooms FOR SELECT
USING (
  (course_id IS NOT NULL AND public.is_course_enrolled(course_id, auth.uid()))
  OR (course_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.courses c WHERE c.id = chat_rooms.course_id AND c.tutor_id = auth.uid()
  ))
  OR (live_class_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.live_classes lc WHERE lc.id = chat_rooms.live_class_id AND lc.tutor_id = auth.uid()
  ))
  OR (live_class_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.live_classes lc
    WHERE lc.id = chat_rooms.live_class_id AND public.is_course_enrolled(lc.course_id, auth.uid())
  ))
  OR public.is_chat_room_participant(id, auth.uid())
  OR (EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
  ))
);

CREATE POLICY "Authorized users can create chat rooms"
ON public.chat_rooms FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL AND (
    (course_id IS NOT NULL AND public.is_course_enrolled(course_id, auth.uid()))
    OR (course_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.courses c WHERE c.id = chat_rooms.course_id AND c.tutor_id = auth.uid()
    ))
    OR (live_class_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.live_classes lc WHERE lc.id = chat_rooms.live_class_id AND lc.tutor_id = auth.uid()
    ))
    OR (EXISTS (
      SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
    ))
  )
);

CREATE POLICY "Tutors and admins manage chat rooms"
ON public.chat_rooms FOR UPDATE
USING (
  (course_id IS NOT NULL AND EXISTS (SELECT 1 FROM public.courses c WHERE c.id = chat_rooms.course_id AND c.tutor_id = auth.uid()))
  OR (live_class_id IS NOT NULL AND EXISTS (SELECT 1 FROM public.live_classes lc WHERE lc.id = chat_rooms.live_class_id AND lc.tutor_id = auth.uid()))
  OR (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
);


-- ============================================================================
-- 3. Table: public.chat_participants (RLS Disabled -> Enabled)
-- ============================================================================
ALTER TABLE public.chat_participants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authorized view of chat participants" ON public.chat_participants;
DROP POLICY IF EXISTS "Users can join as chat participant" ON public.chat_participants;
DROP POLICY IF EXISTS "Users can leave chat rooms" ON public.chat_participants;

CREATE POLICY "Authorized view of chat participants"
ON public.chat_participants FOR SELECT
USING (
  user_id = auth.uid()
  OR public.is_chat_room_participant(room_id, auth.uid())
  OR public.is_chat_room_tutor(room_id, auth.uid())
  OR (EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
  ))
);

CREATE POLICY "Users can join as chat participant"
ON public.chat_participants FOR INSERT
WITH CHECK (
  user_id = auth.uid()
);

CREATE POLICY "Users can leave chat rooms"
ON public.chat_participants FOR DELETE
USING (
  user_id = auth.uid()
  OR public.is_chat_room_tutor(room_id, auth.uid())
  OR (EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
  ))
);


-- ============================================================================
-- 4. Table: public.voice_sessions (RLS Disabled -> Enabled)
-- ============================================================================
ALTER TABLE public.voice_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage their own voice sessions" ON public.voice_sessions;

CREATE POLICY "Users manage their own voice sessions"
ON public.voice_sessions FOR ALL
USING (
  user_id = auth.uid()
  OR (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
)
WITH CHECK (
  user_id = auth.uid()
  OR (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
);


-- ============================================================================
-- 5. Table: public.voice_history (RLS Disabled -> Enabled)
-- ============================================================================
ALTER TABLE public.voice_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage their own voice history" ON public.voice_history;

CREATE POLICY "Users manage their own voice history"
ON public.voice_history FOR ALL
USING (
  user_id = auth.uid()
  OR (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
)
WITH CHECK (
  user_id = auth.uid()
  OR (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
);


-- ============================================================================
-- 6. Table: public.conversation_members (Fix Infinite Recursion 42P17) & Messaging
-- ============================================================================
ALTER TABLE public.conversation_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view their conversation members" ON public.conversation_members;
DROP POLICY IF EXISTS "Users view own conversation memberships" ON public.conversation_members;
DROP POLICY IF EXISTS "Users insert own conversation membership" ON public.conversation_members;

CREATE POLICY "Users view own conversation memberships"
ON public.conversation_members FOR SELECT
USING (
  user_id = auth.uid()
  OR public.is_conversation_member(conversation_id, auth.uid())
  OR (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
);

CREATE POLICY "Users insert own conversation membership"
ON public.conversation_members FOR INSERT
WITH CHECK (
  user_id = auth.uid()
);


-- ============================================================================
-- 7. Additional Hardening: Remove unsafe 'Allow admins to modify settings' FOR ALL qual=true
-- ============================================================================
DROP POLICY IF EXISTS "Allow admins to modify settings" ON public.system_settings;


-- ============================================================================
-- 8. Function Search Path & RPC Access Revocations
-- ============================================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE n.nspname = 'public' AND p.proname = 'handle_new_user') THEN
    ALTER FUNCTION public.handle_new_user() SET search_path = public;
    REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE n.nspname = 'public' AND p.proname = 'match_document_sections') THEN
    ALTER FUNCTION public.match_document_sections(vector, float, int, uuid[]) SET search_path = public;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE n.nspname = 'public' AND p.proname = 'check_course_tutor_publication_safety') THEN
    ALTER FUNCTION public.check_course_tutor_publication_safety() SET search_path = public;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE n.nspname = 'public' AND p.proname = 'prevent_profile_role_escalation') THEN
    ALTER FUNCTION public.prevent_profile_role_escalation() SET search_path = public;
    REVOKE EXECUTE ON FUNCTION public.prevent_profile_role_escalation() FROM anon, authenticated;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE n.nspname = 'public' AND p.proname = 'validate_tutor_verification_update') THEN
    ALTER FUNCTION public.validate_tutor_verification_update() SET search_path = public;
    REVOKE EXECUTE ON FUNCTION public.validate_tutor_verification_update() FROM anon, authenticated;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE n.nspname = 'public' AND p.proname = 'prevent_withdrawal_tampering') THEN
    ALTER FUNCTION public.prevent_withdrawal_tampering() SET search_path = public;
    REVOKE EXECUTE ON FUNCTION public.prevent_withdrawal_tampering() FROM anon, authenticated;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE n.nspname = 'public' AND p.proname = 'prevent_course_self_approval') THEN
    ALTER FUNCTION public.prevent_course_self_approval() SET search_path = public;
    REVOKE EXECUTE ON FUNCTION public.prevent_course_self_approval() FROM anon, authenticated;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE n.nspname = 'public' AND p.proname = 'is_chat_room_participant') THEN
    REVOKE EXECUTE ON FUNCTION public.is_chat_room_participant(UUID, UUID) FROM anon, authenticated;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE n.nspname = 'public' AND p.proname = 'is_chat_room_tutor') THEN
    REVOKE EXECUTE ON FUNCTION public.is_chat_room_tutor(UUID, UUID) FROM anon, authenticated;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE n.nspname = 'public' AND p.proname = 'is_course_enrolled') THEN
    REVOKE EXECUTE ON FUNCTION public.is_course_enrolled(UUID, UUID) FROM anon, authenticated;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE n.nspname = 'public' AND p.proname = 'is_conversation_member') THEN
    REVOKE EXECUTE ON FUNCTION public.is_conversation_member(UUID, UUID) FROM anon, authenticated;
  END IF;
END $$;
