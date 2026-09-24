-- Migration: 20260924000000_razorpay_payment_orders_and_enrollments_update.sql
-- Description: Razorpay test-mode payment orders table, enrollments updated_at column, and hardened atomic payment RPC.

-- 1. Ensure enrollments has updated_at column for atomic conflict updates
ALTER TABLE public.enrollments
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- 2. Create payment_orders table for server-authoritative order tracking
CREATE TABLE IF NOT EXISTS public.payment_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id TEXT NOT NULL UNIQUE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
    product_type TEXT NOT NULL DEFAULT 'INDIVIDUAL_COURSE',
    amount NUMERIC NOT NULL,
    currency TEXT NOT NULL DEFAULT 'INR',
    receipt TEXT,
    status TEXT NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'attempted', 'paid', 'failed', 'cancelled')),
    notes JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for payment_orders
CREATE INDEX IF NOT EXISTS idx_payment_orders_user ON public.payment_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_orders_order_id ON public.payment_orders(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_orders_course ON public.payment_orders(course_id);
CREATE INDEX IF NOT EXISTS idx_payment_orders_status ON public.payment_orders(status);

-- Enable RLS on payment_orders
ALTER TABLE public.payment_orders ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view own payment orders" ON public.payment_orders;
DROP POLICY IF EXISTS "Admins can view all payment orders" ON public.payment_orders;
DROP POLICY IF EXISTS "Service role manages payment orders" ON public.payment_orders;

-- 3. RLS Policies
-- Users can view only their own payment orders
CREATE POLICY "Users can view own payment orders"
    ON public.payment_orders
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Admins can view all payment orders
CREATE POLICY "Admins can view all payment orders"
    ON public.payment_orders
    FOR SELECT
    TO authenticated
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- Service role has full access
CREATE POLICY "Service role manages payment orders"
    ON public.payment_orders
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 4. Harden and update process_verified_payment_atomic RPC
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

        -- Ensure payment_orders status is synchronized
        UPDATE public.payment_orders
        SET status = 'paid', updated_at = now()
        WHERE order_id = p_order_id;

        RETURN jsonb_build_object(
            'success', true,
            'idempotent', true,
            'enrollment_id', v_enrollment_id,
            'ledger_id', v_existing_ledger,
            'message', 'Payment already processed cleanly.'
        );
    END IF;

    -- 2. Create or verify enrollment (safe upsert with updated_at)
    IF p_product_id IS NOT NULL THEN
        INSERT INTO public.enrollments (learner_id, course_id, progress, created_at, updated_at)
        VALUES (p_learner_id, p_product_id, 0, now(), now())
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

    -- 5. Mark payment_orders as paid if record exists
    UPDATE public.payment_orders
    SET status = 'paid', updated_at = now()
    WHERE order_id = p_order_id;

    -- 6. Update tutor earnings summary
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

-- Revoke execute from public/anon/authenticated; grant only to service_role
REVOKE EXECUTE ON FUNCTION public.process_verified_payment_atomic(
    TEXT, TEXT, UUID, UUID, TEXT, NUMERIC, UUID, UUID, UUID, UUID, NUMERIC, NUMERIC, NUMERIC, NUMERIC, NUMERIC, NUMERIC, NUMERIC, NUMERIC
) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.process_verified_payment_atomic(
    TEXT, TEXT, UUID, UUID, TEXT, NUMERIC, UUID, UUID, UUID, UUID, NUMERIC, NUMERIC, NUMERIC, NUMERIC, NUMERIC, NUMERIC, NUMERIC, NUMERIC
) TO service_role;
