-- ==============================================================================
-- 🛡️ EDUEARN SECURITY & RLS HARDENING MIGRATION
-- Migration: 20260922000000_security_and_rls_hardening.sql
-- Description: Comprehensive database-level RBAC, RLS, storage, and RPC lockdown.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. PROFILES: Prevent Self-Elevation to Admin / Role Tampering
-- ------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.prevent_profile_role_escalation()
RETURNS TRIGGER AS $$
BEGIN
    -- Only service_role can update the role column
    IF (NEW.role IS DISTINCT FROM OLD.role) THEN
        IF auth.role() IS DISTINCT FROM 'service_role' THEN
            RAISE EXCEPTION 'Privilege escalation denied: You cannot alter your account role.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_prevent_profile_role_escalation ON public.profiles;

CREATE TRIGGER trg_prevent_profile_role_escalation
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.prevent_profile_role_escalation();

-- Tighten profiles update policy
DROP POLICY IF EXISTS "Allow users to manage own profile" ON public.profiles;

CREATE POLICY "Allow users to view profiles"
ON public.profiles FOR SELECT
USING (true);

CREATE POLICY "Allow users to update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- ------------------------------------------------------------------------------
-- 2. ENROLLMENTS: Remove Arbitrary Client Self-Enrollment (Server-Only Architecture)
-- ------------------------------------------------------------------------------

-- Drop all client self-enrollment policies. All enrollments must be created server-side
DROP POLICY IF EXISTS "Allow learners to self-enroll" ON public.enrollments;
DROP POLICY IF EXISTS "Allow learners to enroll in free courses" ON public.enrollments;

-- Ensure authenticated learners can view their own enrollments
DROP POLICY IF EXISTS "Allow learners to view own enrollments" ON public.enrollments;
CREATE POLICY "Allow learners to view own enrollments"
ON public.enrollments FOR SELECT
TO authenticated
USING (auth.uid() = learner_id);

-- ------------------------------------------------------------------------------
-- 3. SECURITY DEFINER RPC: Restrict Payment Execution to Service Role
-- ------------------------------------------------------------------------------

-- Ensure process_verified_payment_atomic cannot be executed by anon or authenticated clients
DO $$
BEGIN
    REVOKE EXECUTE ON FUNCTION public.process_verified_payment_atomic(
        TEXT, TEXT, UUID, UUID, TEXT, NUMERIC, UUID, UUID, UUID, UUID, NUMERIC, NUMERIC, NUMERIC, NUMERIC, NUMERIC, NUMERIC, NUMERIC, NUMERIC
    ) FROM PUBLIC, anon, authenticated;
    GRANT EXECUTE ON FUNCTION public.process_verified_payment_atomic(
        TEXT, TEXT, UUID, UUID, TEXT, NUMERIC, UUID, UUID, UUID, UUID, NUMERIC, NUMERIC, NUMERIC, NUMERIC, NUMERIC, NUMERIC, NUMERIC, NUMERIC
    ) TO service_role;
EXCEPTION
    WHEN OTHERS THEN
        NULL; -- Handle if function signature differs in specific environments
END $$;

-- ------------------------------------------------------------------------------
-- 4. TUTOR VERIFICATIONS: Prevent Self-Approval and Feedback Tampering
-- ------------------------------------------------------------------------------

DROP POLICY IF EXISTS "Allow users to update own verification" ON public.tutor_verifications;

CREATE OR REPLACE FUNCTION public.validate_tutor_verification_update()
RETURNS TRIGGER AS $$
BEGIN
    IF auth.role() IS DISTINCT FROM 'service_role' AND NOT EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    ) THEN
        -- Prevent applicant from altering approval or moderation columns
        IF (NEW.status IS DISTINCT FROM OLD.status) OR
           (NEW.admin_notes IS DISTINCT FROM OLD.admin_notes) OR
           (NEW.admin_feedback IS DISTINCT FROM OLD.admin_feedback) OR
           (NEW.rejection_reason IS DISTINCT FROM OLD.rejection_reason) OR
           (NEW.ai_evaluation IS DISTINCT FROM OLD.ai_evaluation) THEN
            RAISE EXCEPTION 'Tampering detected: You are not authorized to modify administrative or evaluation fields.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_validate_tutor_verification_update ON public.tutor_verifications;

CREATE TRIGGER trg_validate_tutor_verification_update
    BEFORE UPDATE ON public.tutor_verifications
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_tutor_verification_update();

CREATE POLICY "Allow tutors to update own draft verification"
ON public.tutor_verifications FOR UPDATE
TO authenticated
USING (auth.uid() = tutor_id)
WITH CHECK (auth.uid() = tutor_id);

-- ------------------------------------------------------------------------------
-- 5. WITHDRAWAL REQUESTS: Prevent Self-Status Modification
-- ------------------------------------------------------------------------------

DROP POLICY IF EXISTS "Allow tutors to view and create their own withdrawals" ON public.withdrawal_requests;

CREATE POLICY "Allow tutors to view own withdrawals"
ON public.withdrawal_requests FOR SELECT
TO authenticated
USING (auth.uid() = tutor_id);

CREATE POLICY "Allow tutors to insert own withdrawals"
ON public.withdrawal_requests FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() = tutor_id AND
    status = 'pending'
);

CREATE OR REPLACE FUNCTION public.prevent_withdrawal_tampering()
RETURNS TRIGGER AS $$
BEGIN
    IF auth.role() IS DISTINCT FROM 'service_role' AND NOT EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    ) THEN
        IF (NEW.status IS DISTINCT FROM OLD.status) OR (NEW.amount IS DISTINCT FROM OLD.amount) THEN
            RAISE EXCEPTION 'Tampering detected: Only administrators can update withdrawal status.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_prevent_withdrawal_tampering ON public.withdrawal_requests;

CREATE TRIGGER trg_prevent_withdrawal_tampering
    BEFORE UPDATE ON public.withdrawal_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.prevent_withdrawal_tampering();

-- ------------------------------------------------------------------------------
-- 6. COURSES: Prevent Self-Approval & Publication Without Admin Review
-- ------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.prevent_course_self_approval()
RETURNS TRIGGER AS $$
BEGIN
    IF auth.role() IS DISTINCT FROM 'service_role' AND NOT EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    ) THEN
        IF (NEW.approval_status = 'approved' AND OLD.approval_status IS DISTINCT FROM 'approved') OR
           (NEW.status = 'published' AND OLD.status IS DISTINCT FROM 'published' AND OLD.approval_status IS DISTINCT FROM 'approved') THEN
            RAISE EXCEPTION 'Approval required: Courses must be reviewed and approved by an administrator before publication.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_prevent_course_self_approval ON public.courses;

CREATE TRIGGER trg_prevent_course_self_approval
    BEFORE UPDATE ON public.courses
    FOR EACH ROW
    EXECUTE FUNCTION public.prevent_course_self_approval();

-- ------------------------------------------------------------------------------
-- 7. STORAGE: Private Documents & User Folder Isolation
-- ------------------------------------------------------------------------------

-- Ensure documents bucket is private
UPDATE storage.buckets
SET public = false
WHERE id = 'documents';

-- Drop previous open policies on storage objects
DROP POLICY IF EXISTS "Allow public read access to documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload to documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to modify in documents" ON storage.objects;

-- Private documents policies: User folder scoped
CREATE POLICY "Allow users to read own documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'documents' AND
    (
        (storage.foldername(name))[1] = auth.uid()::text OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    )
);

CREATE POLICY "Allow users to upload own documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'documents' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Allow users to update own documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'documents' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Allow users to delete own documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'documents' AND
    (storage.foldername(name))[1] = auth.uid()::text
);
