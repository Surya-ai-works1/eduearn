import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getApiUser } from "@/lib/apiAuth";
import { createAdminClient } from "@/lib/supabase/admin";
import { PayoutLedgerService } from "@/lib/payoutLedger";

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate caller
    const auth = await getApiUser();
    if (auth.error || !auth.user) {
      return NextResponse.json(
        { error: auth.error || "Authentication required to verify payment." },
        { status: auth.status || 401 }
      );
    }
    const userId = auth.user.id;

    const body = await req.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      grossAmount,
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Missing required payment verification parameters (razorpay_order_id, razorpay_payment_id, razorpay_signature)." },
        { status: 400 }
      );
    }

    // 2. Server-side Razorpay HMAC SHA256 signature verification (Mandatory in ALL environments)
    // Ensure Razorpay secret is configured; otherwise abort.
    const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!razorpaySecret || razorpaySecret.length < 5) {
      console.error("Razorpay secret key is not configured.");
      return NextResponse.json(
        { error: "Razorpay secret key is not configured. Cannot verify payment." },
        { status: 500 }
      );
    }
    const expectedSignature = crypto
      .createHmac("sha256", razorpaySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");


    const sigBuffer = Buffer.from(razorpay_signature);
    const expectedBuffer = Buffer.from(expectedSignature);
    const isSignatureValid =
      sigBuffer.length === expectedBuffer.length &&
      crypto.timingSafeEqual(sigBuffer, expectedBuffer);

    if (!isSignatureValid) {
      return NextResponse.json(
        { error: "Cryptographic payment signature verification failed." },
        { status: 400 }
      );
    }

    // 3. Authoritative Order Lookup from database
    const admin = createAdminClient();
    const { data: dbOrder, error: orderErr } = await admin
      .from("payment_orders")
      .select("*")
      .eq("order_id", razorpay_order_id)
      .maybeSingle();

    if (orderErr || !dbOrder) {
      return NextResponse.json(
        { error: "Payment order record not found in database." },
        { status: 404 }
      );
    }

    // 4. Verify order ownership: Order must belong to the authenticated user
    if (dbOrder.user_id !== userId) {
      return NextResponse.json(
        { error: "Forbidden: Payment order belongs to another user." },
        { status: 403 }
      );
    }

    // 5. Verify authoritative amount: Reject client tampering
    if (grossAmount !== undefined && Number(grossAmount) !== Number(dbOrder.amount)) {
      return NextResponse.json(
        { error: "Client-supplied gross amount does not match authoritative order amount." },
        { status: 400 }
      );
    }

    // 6. Verify course status and retrieve tutor ID authoritatively
    const { data: dbCourse, error: courseErr } = await admin
      .from("courses")
      .select("id, title, tutor_id, status, approval_status")
      .eq("id", dbOrder.course_id)
      .maybeSingle();

    if (courseErr || !dbCourse) {
      return NextResponse.json(
        { error: "Associated course not found." },
        { status: 404 }
      );
    }

    if (dbCourse.status !== "published" || dbCourse.approval_status !== "approved" || !dbCourse.tutor_id) {
      return NextResponse.json(
        { error: "Course is not currently available for purchase." },
        { status: 400 }
      );
    }

    // 7. Execute Atomic Payment Verification & Financial Ledger Creation
    const result = await PayoutLedgerService.recordVerifiedPayment({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      learnerId: userId,
      productId: dbOrder.course_id,
      productType: dbOrder.product_type || "INDIVIDUAL_COURSE",
      tutorId: dbCourse.tutor_id,
      grossAmount: Number(dbOrder.amount),
      basePrice: Number(dbOrder.notes?.authoritativePrice || dbOrder.amount),
      sellingPrice: Number(dbOrder.amount),
      discountAmount: Number(dbOrder.notes?.discountAmount || 0),
      discountId: dbOrder.notes?.discountId || null,
      discountCode: dbOrder.notes?.couponCode || undefined,
      hardwareCost: 0,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.message || "Failed to process payment ledger atomically." },
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
    console.error("Payment verification route error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error during payment verification." },
      { status: 500 }
    );
  }
}
