-- ==============================================================================
-- 🚀 EDUEARN UNIFIED MARKETPLACE, PRICING, DISCOUNTS & ATOMIC PAYOUT LEDGER SCHEMA
-- Created: 2026-09-16
-- Idempotent, Non-Destructive Migration
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Extend Courses Table for Unified Product Fields
-- ------------------------------------------------------------------------------
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS product_type TEXT DEFAULT 'INDIVIDUAL_COURSE' CHECK (product_type IN ('INDIVIDUAL_COURSE', 'CAREER_PACKAGE', 'PROJECT', 'TUITION', 'MENTORING'));
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS delivery_type TEXT DEFAULT 'LIVE' CHECK (delivery_type IN ('LIVE', 'PROJECT_LAB', 'ONE_ON_ONE'));
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS base_price NUMERIC DEFAULT 0;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS selling_price NUMERIC DEFAULT 0;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'INR';
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS duration TEXT;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS total_sessions INT DEFAULT 16;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS sessions_per_month INT DEFAULT 16;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS subcategory TEXT;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS slug TEXT;

-- Index for product_type & approval_status querying
CREATE INDEX IF NOT EXISTS idx_courses_product_type ON public.courses(product_type);
CREATE INDEX IF NOT EXISTS idx_courses_approval_status ON public.courses(approval_status);
CREATE INDEX IF NOT EXISTS idx_courses_category_subcategory ON public.courses(category, subcategory);

-- ------------------------------------------------------------------------------
-- 2. Practical Projects Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE,
    description TEXT,
    category TEXT NOT NULL,
    subcategory TEXT,
    difficulty TEXT NOT NULL DEFAULT 'Beginner' CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
    duration TEXT DEFAULT '2 Weeks',
    total_sessions INT DEFAULT 4,
    learning_fee NUMERIC NOT NULL DEFAULT 0,
    hardware_required BOOLEAN NOT NULL DEFAULT false,
    hardware_cost NUMERIC DEFAULT 0,
    bom JSONB DEFAULT '[]'::JSONB,
    skills TEXT[] DEFAULT '{}'::TEXT[],
    learning_outcomes TEXT[] DEFAULT '{}'::TEXT[],
    status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
    approval_status TEXT NOT NULL DEFAULT 'approved' CHECK (approval_status IN ('draft', 'submitted', 'under_review', 'approved', 'rejected')),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to published projects" 
ON public.projects FOR SELECT USING (status = 'published' OR auth.uid() = created_by);

CREATE POLICY "Allow tutors to create projects" 
ON public.projects FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Allow tutors to update their own projects" 
ON public.projects FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Allow admins full access to projects" 
ON public.projects FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
);

CREATE INDEX IF NOT EXISTS idx_projects_category ON public.projects(category);
CREATE INDEX IF NOT EXISTS idx_projects_approval_status ON public.projects(approval_status);

-- ------------------------------------------------------------------------------
-- 3. Career Packages & Modules Tables
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.career_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    level TEXT DEFAULT 'All Levels',
    base_price NUMERIC NOT NULL DEFAULT 0,
    selling_price NUMERIC NOT NULL DEFAULT 0,
    currency TEXT DEFAULT 'INR',
    duration_months INT DEFAULT 6,
    total_live_classes INT DEFAULT 96,
    status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.career_packages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to packages" ON public.career_packages FOR SELECT USING (true);
CREATE POLICY "Allow admins full access to packages" ON public.career_packages FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE TABLE IF NOT EXISTS public.package_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id UUID NOT NULL REFERENCES public.career_packages(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    module_order INT NOT NULL DEFAULT 1,
    duration TEXT DEFAULT '1 Month',
    session_count INT DEFAULT 16,
    is_required BOOLEAN DEFAULT true,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.package_modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to package modules" ON public.package_modules FOR SELECT USING (true);
CREATE POLICY "Allow admins full access to package modules" ON public.package_modules FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE INDEX IF NOT EXISTS idx_package_modules_package ON public.package_modules(package_id, module_order);

-- ------------------------------------------------------------------------------
-- 4. Package Tutor Module Assignments Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.package_tutor_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id UUID NOT NULL REFERENCES public.career_packages(id) ON DELETE CASCADE,
    module_id UUID NOT NULL REFERENCES public.package_modules(id) ON DELETE CASCADE,
    tutor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    assigned_sessions INT DEFAULT 16,
    start_date DATE,
    end_date DATE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'reassigned', 'cancelled')),
    payout_rule JSONB DEFAULT '{"pool_share_percent": 20}'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(package_id, module_id, tutor_id)
);

ALTER TABLE public.package_tutor_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow tutors to view their module assignments" ON public.package_tutor_assignments FOR SELECT USING (auth.uid() = tutor_id);
CREATE POLICY "Allow admins full access to assignments" ON public.package_tutor_assignments FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE INDEX IF NOT EXISTS idx_package_tutor_assignments_tutor ON public.package_tutor_assignments(tutor_id);

-- ------------------------------------------------------------------------------
-- 5. Discounts & Promotions Table (Extended from admin_offers)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.discounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('LAUNCH', 'STUDENT', 'REFERRAL', 'BUNDLE', 'SEASONAL', 'FIRST_PURCHASE', 'LOYALTY')),
    discount_mode TEXT NOT NULL DEFAULT 'percentage' CHECK (discount_mode IN ('percentage', 'fixed')),
    percentage NUMERIC DEFAULT 0,
    fixed_amount NUMERIC DEFAULT 0,
    max_discount NUMERIC,
    product_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    package_id UUID REFERENCES public.career_packages(id) ON DELETE CASCADE,
    minimum_purchase NUMERIC DEFAULT 0,
    usage_limit INT DEFAULT 1000,
    usage_count INT DEFAULT 0,
    per_user_limit INT DEFAULT 1,
    start_at TIMESTAMPTZ DEFAULT now(),
    end_at TIMESTAMPTZ NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.discounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to active discounts" ON public.discounts FOR SELECT USING (active = true);
CREATE POLICY "Allow admins full access to discounts" ON public.discounts FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE INDEX IF NOT EXISTS idx_discounts_code ON public.discounts(code);

-- ------------------------------------------------------------------------------
-- 6. Immutable Financial Payout Ledger Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payout_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id TEXT NOT NULL,
    payment_id TEXT NOT NULL,
    enrollment_id UUID,
    product_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
    package_id UUID REFERENCES public.career_packages(id) ON DELETE SET NULL,
    module_id UUID REFERENCES public.package_modules(id) ON DELETE SET NULL,
    tutor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    product_type TEXT NOT NULL CHECK (product_type IN ('INDIVIDUAL_COURSE', 'CAREER_PACKAGE', 'PROJECT', 'TUITION', 'MENTORING')),
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('EARNING', 'REFUND', 'REVERSAL', 'HARDWARE_REIMBURSEMENT')),
    base_price NUMERIC NOT NULL,
    selling_price NUMERIC NOT NULL,
    discount_amount NUMERIC NOT NULL DEFAULT 0,
    discount_id UUID REFERENCES public.discounts(id) ON DELETE SET NULL,
    payment_fee NUMERIC NOT NULL DEFAULT 0,
    tutor_share_percent NUMERIC NOT NULL,
    tutor_payout_amount NUMERIC NOT NULL,
    eduearn_share_amount NUMERIC NOT NULL,
    hardware_reimbursement NUMERIC NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(payment_id, transaction_type)
);

ALTER TABLE public.payout_ledger ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow tutors to view their own payout ledger entries" ON public.payout_ledger FOR SELECT USING (auth.uid() = tutor_id);
CREATE POLICY "Allow admins full access to payout ledger" ON public.payout_ledger FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE INDEX IF NOT EXISTS idx_payout_ledger_tutor ON public.payout_ledger(tutor_id);
CREATE INDEX IF NOT EXISTS idx_payout_ledger_order ON public.payout_ledger(order_id);
CREATE INDEX IF NOT EXISTS idx_payout_ledger_payment ON public.payout_ledger(payment_id);

-- ------------------------------------------------------------------------------
-- 7. Atomic Payment Verification, Enrollment & Financial Ledger RPC Function
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.process_verified_payment_atomic(
    p_order_id TEXT,
    p_payment_id TEXT,
    p_learner_id UUID,
    p_product_id UUID,
    p_product_type TEXT,
    p_gross_amount NUMERIC,
    p_discount_id UUID DEFAULT NULL,
    p_tutor_id UUID DEFAULT NULL,
    p_package_id UUID DEFAULT NULL,
    p_module_id UUID DEFAULT NULL,
    p_base_price NUMERIC DEFAULT 0,
    p_selling_price NUMERIC DEFAULT 0,
    p_discount_amount NUMERIC DEFAULT 0,
    p_payment_fee NUMERIC DEFAULT 0,
    p_tutor_share_percent NUMERIC DEFAULT 65,
    p_tutor_payout_amount NUMERIC DEFAULT 0,
    p_eduearn_share_amount NUMERIC DEFAULT 0,
    p_hardware_reimbursement NUMERIC DEFAULT 0
) RETURNS JSONB AS $$
DECLARE
    v_enrollment_id UUID;
    v_ledger_id UUID;
    v_existing_ledger UUID;
BEGIN
    -- 1. Check idempotency on payout_ledger
    SELECT id INTO v_existing_ledger 
    FROM public.payout_ledger 
    WHERE payment_id = p_payment_id AND transaction_type = 'EARNING';

    IF v_existing_ledger IS NOT NULL THEN
        SELECT id INTO v_enrollment_id FROM public.enrollments 
        WHERE learner_id = p_learner_id AND (course_id = p_product_id OR p_product_id IS NULL)
        LIMIT 1;

        RETURN jsonb_build_object(
            'success', true,
            'idempotent', true,
            'enrollment_id', v_enrollment_id,
            'ledger_id', v_existing_ledger,
            'message', 'Payment already processed cleanly.'
        );
    END IF;

    -- 2. Create or verify enrollment
    IF p_product_id IS NOT NULL THEN
        INSERT INTO public.enrollments (learner_id, course_id, progress, created_at)
        VALUES (p_learner_id, p_product_id, 0, now())
        ON CONFLICT (learner_id, course_id) DO UPDATE SET updated_at = now()
        RETURNING id INTO v_enrollment_id;
    END IF;

    -- 3. Create immutable payout_ledger EARNING entry
    INSERT INTO public.payout_ledger (
        order_id, payment_id, enrollment_id, product_id, package_id, module_id, tutor_id,
        product_type, transaction_type, base_price, selling_price, discount_amount, discount_id,
        payment_fee, tutor_share_percent, tutor_payout_amount, eduearn_share_amount, hardware_reimbursement, created_at
    ) VALUES (
        p_order_id, p_payment_id, v_enrollment_id, p_product_id, p_package_id, p_module_id, p_tutor_id,
        p_product_type, 'EARNING', p_base_price, p_selling_price, p_discount_amount, p_discount_id,
        p_payment_fee, p_tutor_share_percent, p_tutor_payout_amount, p_eduearn_share_amount, p_hardware_reimbursement, now()
    ) RETURNING id INTO v_ledger_id;

    -- 4. Record payment log in payments table
    INSERT INTO public.payments (user_id, course_id, amount, provider, tx_id, status, created_at)
    VALUES (p_learner_id, COALESCE(p_product_id, gen_random_uuid()), p_gross_amount, 'razorpay', p_payment_id, 'completed', now())
    ON CONFLICT (tx_id) DO UPDATE SET status = 'completed';

    -- 5. Update tutor earnings summary
    IF p_tutor_id IS NOT NULL THEN
        INSERT INTO public.tutor_earnings (tutor_id, total_earnings, available_balance, updated_at)
        VALUES (p_tutor_id, p_tutor_payout_amount, p_tutor_payout_amount, now())
        ON CONFLICT (tutor_id) DO UPDATE SET 
            total_earnings = tutor_earnings.total_earnings + EXCLUDED.total_earnings,
            available_balance = tutor_earnings.available_balance + EXCLUDED.available_balance,
            updated_at = now();
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'idempotent', false,
        'enrollment_id', v_enrollment_id,
        'ledger_id', v_ledger_id,
        'message', 'Atomic payment verification, enrollment & financial ledger successfully recorded.'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
