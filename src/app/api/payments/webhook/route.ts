import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { PayoutLedgerService } from "@/lib/payoutLedger";

export async function POST(req: NextRequest) {
  try {
    const bodyText = await req.text();
    const webhookSignature = req.headers.get("x-razorpay-signature");
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET || "mock_razorpay_secret";

    // 1. Mandatory Razorpay Webhook HMAC SHA256 Signature Verification
    if (!webhookSignature) {
      return NextResponse.json(
        { error: "Missing x-razorpay-signature header." },
        { status: 400 }
      );
    }

    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(bodyText)
      .digest("hex");

    const sigBuf = Buffer.from(webhookSignature);
    const expBuf = Buffer.from(expectedSignature);
    const isSignatureValid =
      sigBuf.length === expBuf.length &&
      crypto.timingSafeEqual(sigBuf, expBuf);

    if (!isSignatureValid) {
      return NextResponse.json(
        { error: "Invalid Razorpay webhook signature." },
        { status: 400 }
      );
    }

    // 2. Parse payload ONLY after cryptographic verification
    const payload = JSON.parse(bodyText);
    const event = payload.event;
    const admin = createAdminClient();

    // 3. Process payment.captured or order.paid
    if (event === "payment.captured" || event === "order.paid") {
      const paymentEntity = payload.payload?.payment?.entity || {};
      const orderId = paymentEntity.order_id || payload.payload?.order?.entity?.id;
      const paymentId = paymentEntity.id;

      if (!orderId || !paymentId) {
        return NextResponse.json(
          { error: "Webhook payload missing order_id or payment_id." },
          { status: 400 }
        );
      }

      // Fetch authoritative payment order
      const { data: dbOrder, error: orderErr } = await admin
        .from("payment_orders")
        .select("*")
        .eq("order_id", orderId)
        .maybeSingle();

      if (orderErr || !dbOrder) {
        return NextResponse.json(
          { error: "Associated database order not found." },
          { status: 404 }
        );
      }

      // Verify amount: paise in webhook vs database order amount
      const webhookPaise = paymentEntity.amount;
      if (webhookPaise !== undefined && webhookPaise !== Math.round(Number(dbOrder.amount) * 100)) {
        return NextResponse.json(
          { error: "Webhook amount does not match authoritative order amount." },
          { status: 400 }
        );
      }

      // Fetch course tutor ID authoritatively
      const { data: dbCourse } = await admin
        .from("courses")
        .select("id, tutor_id")
        .eq("id", dbOrder.course_id)
        .maybeSingle();

      // Execute atomic transaction for payment verification + enrollment + payout ledger
      const result = await PayoutLedgerService.recordVerifiedPayment({
        orderId,
        paymentId,
        learnerId: dbOrder.user_id,
        productId: dbOrder.course_id,
        productType: dbOrder.product_type || "INDIVIDUAL_COURSE",
        tutorId: dbCourse?.tutor_id,
        grossAmount: Number(dbOrder.amount),
        basePrice: Number(dbOrder.notes?.authoritativePrice || dbOrder.amount),
        sellingPrice: Number(dbOrder.amount),
        discountAmount: Number(dbOrder.notes?.discountAmount || 0),
        discountId: dbOrder.notes?.discountId || null,
        discountCode: dbOrder.notes?.couponCode || undefined,
        hardwareCost: 0,
      });

      return NextResponse.json({
        success: true,
        idempotent: result.idempotent,
        enrollmentId: result.enrollmentId,
        ledgerId: result.ledgerId,
        message: result.message || "Webhook processed atomically.",
      });
    }

    // 4. Process payment.failed event
    if (event === "payment.failed") {
      const paymentEntity = payload.payload?.payment?.entity || {};
      const orderId = paymentEntity.order_id;
      if (orderId) {
        await admin
          .from("payment_orders")
          .update({ status: "failed", updated_at: new Date().toISOString() })
          .eq("order_id", orderId);
      }
      return NextResponse.json({
        success: true,
        status: "payment_failed_recorded",
        message: "Payment failure recorded cleanly. No enrollment or earnings created.",
      });
    }

    // 5. Unsupported / ignored event
    return NextResponse.json({
      status: "ignored",
      event,
      message: "Event acknowledged but not handled by EduEarn order fulfillment.",
    });
  } catch (err: any) {
    console.error("Payment webhook handling error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error processing webhook." },
      { status: 500 }
    );
  }
}
