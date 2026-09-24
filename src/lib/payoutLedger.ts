import { createAdminClient } from "./supabase/admin";

export interface PayoutCalculationInput {
  orderId: string;
  paymentId: string;
  learnerId: string;
  productId?: string;
  packageId?: string;
  moduleId?: string;
  tutorId?: string;
  productType: "INDIVIDUAL_COURSE" | "CAREER_PACKAGE" | "PROJECT" | "TUITION" | "MENTORING";
  grossAmount: number;
  discountCode?: string;
  hardwareCost?: number;
  basePrice?: number;
  sellingPrice?: number;
  discountAmount?: number;
  discountId?: string | null;
}

export interface PayoutCalculationResult {
  basePrice: number;
  sellingPrice: number;
  discountAmount: number;
  discountId: string | null;
  paymentFee: number;
  tutorSharePercent: number;
  tutorPayoutAmount: number;
  eduearnShareAmount: number;
  hardwareReimbursement: number;
}

export class PayoutLedgerService {
  /**
   * Calculate revenue share splits dynamically based on product type
   * Default rules:
   * - INDIVIDUAL_COURSE: 65% Tutor / 35% EduEarn
   * - CAREER_PACKAGE: 65% Tutor Pool / 35% EduEarn
   * - PROJECT: 60% Tutor / 40% EduEarn
   * - TUITION / MENTORING: 80% Tutor / 20% EduEarn
   * - HARDWARE: 100% approved hardware reimbursement (no platform fee)
   */
  static calculatePayout(input: PayoutCalculationInput): PayoutCalculationResult {
    const gross = input.grossAmount;
    const hardwareCost = input.hardwareCost || 0;
    const netLearningFee = Math.max(0, gross - hardwareCost);
    const paymentFee = Math.round(gross * 0.02 * 100) / 100; // 2% gateway fee

    let tutorSharePercent = 65;
    switch (input.productType) {
      case "INDIVIDUAL_COURSE":
        tutorSharePercent = 65;
        break;
      case "CAREER_PACKAGE":
        tutorSharePercent = 65;
        break;
      case "PROJECT":
        tutorSharePercent = 60;
        break;
      case "TUITION":
      case "MENTORING":
        tutorSharePercent = 80;
        break;
      default:
        tutorSharePercent = 65;
    }

    const tutorLearningPayout = Math.round((netLearningFee * tutorSharePercent) / 100 * 100) / 100;
    const tutorPayoutAmount = tutorLearningPayout + hardwareCost;
    const eduearnShareAmount = Math.max(0, netLearningFee - tutorLearningPayout - paymentFee);

    return {
      basePrice: gross,
      sellingPrice: netLearningFee,
      discountAmount: 0,
      discountId: null,
      paymentFee,
      tutorSharePercent,
      tutorPayoutAmount,
      eduearnShareAmount,
      hardwareReimbursement: hardwareCost,
    };
  }

  /**
   * Authoritative Atomic Record for Verified Payment
   * Invokes database RPC function `process_verified_payment_atomic` to guarantee:
   * 1. Server-side verified payment execution
   * 2. Atomic enrollment + payout ledger creation
   * 3. Idempotent protection against duplicate webhooks
   */
  static async recordVerifiedPayment(input: PayoutCalculationInput): Promise<{
    success: boolean;
    idempotent: boolean;
    enrollmentId?: string;
    ledgerId?: string;
    message?: string;
  }> {
    try {
      const supabase = createAdminClient();
      const calc = this.calculatePayout(input);

      // Call database atomic function
      const { data, error } = await supabase.rpc("process_verified_payment_atomic", {
        p_order_id: input.orderId,
        p_payment_id: input.paymentId,
        p_learner_id: input.learnerId,
        p_product_id: input.productId || null,
        p_product_type: input.productType,
        p_gross_amount: input.grossAmount,
        p_discount_id: input.discountId ?? calc.discountId ?? null,
        p_tutor_id: input.tutorId || null,
        p_package_id: input.packageId || null,
        p_module_id: input.moduleId || null,
        p_base_price: input.basePrice ?? calc.basePrice,
        p_selling_price: input.sellingPrice ?? calc.sellingPrice,
        p_discount_amount: input.discountAmount ?? calc.discountAmount,
        p_payment_fee: calc.paymentFee,
        p_tutor_share_percent: calc.tutorSharePercent,
        p_tutor_payout_amount: calc.tutorPayoutAmount,
        p_eduearn_share_amount: calc.eduearnShareAmount,
        p_hardware_reimbursement: calc.hardwareReimbursement,
      });

      if (error) {
        console.error("Atomic payment verification RPC failed:", error);
        return { success: false, idempotent: false, message: error.message };
      }

      return {
        success: data?.success ?? false,
        idempotent: data?.idempotent ?? false,
        enrollmentId: data?.enrollment_id,
        ledgerId: data?.ledger_id,
        message: data?.message,
      };
    } catch (err: any) {
      console.error("PayoutLedgerService error:", err);
      return { success: false, idempotent: false, message: err?.message || "Internal server error" };
    }
  }

  /**
   * Append a new immutable REFUND / REVERSAL entry without mutating past rows
   */
  static async recordRefund(
    paymentId: string,
    orderId: string,
    refundAmount: number,
    reason: string
  ): Promise<{ success: boolean; ledgerId?: string }> {
    try {
      const supabase = createAdminClient();
      
      const { data: original, error: fetchErr } = await supabase
        .from("payout_ledger")
        .select("*")
        .eq("payment_id", paymentId)
        .eq("transaction_type", "EARNING")
        .single();

      if (fetchErr || !original) {
        return { success: false };
      }

      const tutorRefundShare = Math.round((refundAmount * (original.tutor_share_percent / 100)) * 100) / 100;
      const eduearnRefundShare = Math.max(0, refundAmount - tutorRefundShare);

      const { data: refundEntry, error: insertErr } = await supabase
        .from("payout_ledger")
        .insert({
          order_id: orderId,
          payment_id: paymentId,
          enrollment_id: original.enrollment_id,
          product_id: original.product_id,
          package_id: original.package_id,
          module_id: original.module_id,
          tutor_id: original.tutor_id,
          product_type: original.product_type,
          transaction_type: "REFUND",
          base_price: original.base_price,
          selling_price: refundAmount,
          discount_amount: 0,
          payment_fee: 0,
          tutor_share_percent: original.tutor_share_percent,
          tutor_payout_amount: -tutorRefundShare,
          eduearn_share_amount: -eduearnRefundShare,
          hardware_reimbursement: 0,
          created_at: new Date().toISOString(),
        })
        .select("id")
        .single();

      if (insertErr || !refundEntry) {
        return { success: false };
      }

      return { success: true, ledgerId: refundEntry.id };
    } catch {
      return { success: false };
    }
  }
}
