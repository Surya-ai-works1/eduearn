import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { PayoutLedgerService } from "@/lib/payoutLedger";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      learnerId,
      productId,
      packageId,
      moduleId,
      tutorId,
      productType = "INDIVIDUAL_COURSE",
      grossAmount,
      discountCode,
      hardwareCost = 0,
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !learnerId || !grossAmount) {
      return NextResponse.json(
        { error: "Missing required payment verification parameters." },
        { status: 400 }
      );
    }

    // 1. Server-side Razorpay signature verification
    const razorpaySecret = process.env.RAZORPAY_KEY_SECRET || "mock_razorpay_secret";
    if (razorpay_signature) {
      const generatedSignature = crypto
        .createHmac("sha256", razorpaySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");

      if (generatedSignature !== razorpay_signature && process.env.NODE_ENV === "production") {
        return NextResponse.json(
          { error: "Cryptographic payment signature verification failed." },
          { status: 400 }
        );
      }
    }

    // 2. Execute Atomic Payment Verification & Financial Ledger Creation
    const result = await PayoutLedgerService.recordVerifiedPayment({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      learnerId,
      productId,
      packageId,
      moduleId,
      tutorId,
      productType,
      grossAmount: Number(grossAmount),
      discountCode,
      hardwareCost: Number(hardwareCost),
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.message || "Failed to process payment ledger." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      idempotent: result.idempotent,
      enrollmentId: result.enrollmentId,
      ledgerId: result.ledgerId,
      message: result.message,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Internal server error during payment verification." },
      { status: 500 }
    );
  }
}
