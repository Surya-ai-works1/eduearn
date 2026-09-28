-- Migration: 20260926000004_fix_process_verified_payment_atomic_null_product.sql
-- Description: Fix process_verified_payment_atomic RPC to handle NULL p_product_id for packages/tuition/projects without FK constraint violation on payments.course_id.

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

    -- 4. Record payment log in payments table (pass p_product_id directly, allowing NULL without FK constraint violation)
    INSERT INTO public.payments (user_id, course_id, amount, provider, tx_id, status, created_at)
    VALUES (p_learner_id, p_product_id, p_gross_amount, 'razorpay', p_payment_id, 'completed', now())
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Revoke execute from public/anon/authenticated; grant only to service_role
REVOKE EXECUTE ON FUNCTION public.process_verified_payment_atomic(
    TEXT, TEXT, UUID, UUID, TEXT, NUMERIC, UUID, UUID, UUID, UUID, NUMERIC, NUMERIC, NUMERIC, NUMERIC, NUMERIC, NUMERIC, NUMERIC, NUMERIC
) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.process_verified_payment_atomic(
    TEXT, TEXT, UUID, UUID, TEXT, NUMERIC, UUID, UUID, UUID, UUID, NUMERIC, NUMERIC, NUMERIC, NUMERIC, NUMERIC, NUMERIC, NUMERIC, NUMERIC
) TO service_role;
