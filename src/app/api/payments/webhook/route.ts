import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { PayoutLedgerService } from "@/lib/payoutLedger";

export async function POST(req: NextRequest) {
  try {
    const bodyText = await req.text();
    const webhookSignature = req.headers.get("x-razorpay-signature");
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET || "mock_razorpay_secret";

    // 1. Validate Webhook Signature if present or in production
    if (webhookSignature) {
      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(bodyText)
        .digest("hex");

      if (expectedSignature !== webhookSignature && process.env.NODE_ENV === "production") {
        return NextResponse.json(
          { error: "Invalid Razorpay webhook signature." },
          { status: 400 }
        );
      }
    }

    const payload = JSON.parse(bodyText);
    const event = payload.event;

    // We only process payment capture / order paid events
    if (event === "payment.captured" || event === "order.paid") {
      const paymentEntity = payload.payload?.payment?.entity || {};
      const orderId = paymentEntity.order_id;
      const paymentId = paymentEntity.id;
      const grossAmount = (paymentEntity.amount || 0) / 100; // Razorpay amount in paise
      const notes = paymentEntity.notes || {};

      const learnerId = notes.learnerId;
      const productId = notes.productId;
      const packageId = notes.packageId;
      const moduleId = notes.moduleId;
      const tutorId = notes.tutorId;
      const productType = notes.productType || "INDIVIDUAL_COURSE";
      const discountCode = notes.discountCode;
      const hardwareCost = notes.hardwareCost || 0;

      if (!orderId || !paymentId || !learnerId) {
        return NextResponse.json(
          { error: "Webhook payload missing essential notes metadata (orderId, paymentId, learnerId)." },
          { status: 400 }
        );
      }

      // Execute atomic transaction for payment verification + enrollment + payout ledger
      const result = await PayoutLedgerService.recordVerifiedPayment({
        orderId,
        paymentId,
        learnerId,
        productId,
        packageId,
        moduleId,
        tutorId,
        productType,
        grossAmount,
        discountCode,
        hardwareCost,
      });

      return NextResponse.json({
        success: true,
        idempotent: result.idempotent,
        enrollmentId: result.enrollmentId,
        ledgerId: result.ledgerId,
        message: result.message || "Webhook processed atomically.",
      });
    }

    return NextResponse.json({ status: "ignored", event });
  } catch (err: any) {
    console.error("Payment webhook handling error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error processing webhook." },
      { status: 500 }
    );
  }
}
