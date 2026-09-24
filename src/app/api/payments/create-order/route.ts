import { NextRequest, NextResponse } from "next/server";
import { getApiUser } from "@/lib/apiAuth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate the caller
    const auth = await getApiUser();
    if (auth.error || !auth.user) {
      return NextResponse.json(
        { error: auth.error || "Authentication required to create a payment order." },
        { status: auth.status || 401 }
      );
    }
    const userId = auth.user.id;

    const body = await req.json();
    const { courseId, couponCode } = body;

    if (!courseId) {
      return NextResponse.json(
        { error: "Course ID is required." },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    // 2. Fetch authoritative course details from Supabase
    const { data: dbCourse, error: courseErr } = await admin
      .from("courses")
      .select("id, title, price, selling_price, status, approval_status, tutor_id")
      .eq("id", courseId)
      .maybeSingle();

    if (courseErr || !dbCourse) {
      return NextResponse.json({ error: "Course not found." }, { status: 404 });
    }

    // 3. Verify course is published and approved with an assigned tutor
    if (dbCourse.status !== "published" || dbCourse.approval_status !== "approved" || !dbCourse.tutor_id) {
      return NextResponse.json(
        { error: "Course is not currently available for purchase (must be published and approved with an assigned tutor)." },
        { status: 400 }
      );
    }

    // 4. Verify verified tutor profile exists
    const { data: tutorProfile } = await admin
      .from("profiles")
      .select("id, role")
      .eq("id", dbCourse.tutor_id)
      .maybeSingle();

    if (!tutorProfile || tutorProfile.role !== "tutor") {
      return NextResponse.json(
        { error: "Course cannot be purchased because no verified tutor profile is assigned." },
        { status: 400 }
      );
    }

    // 5. Check if user is already enrolled
    const { data: existingEnrollment } = await admin
      .from("enrollments")
      .select("id")
      .eq("learner_id", userId)
      .eq("course_id", courseId)
      .maybeSingle();

    if (existingEnrollment) {
      return NextResponse.json(
        { error: "You are already enrolled in this course.", alreadyEnrolled: true },
        { status: 400 }
      );
    }

    // 6. Retrieve authoritative base selling price
    const basePrice = Number(dbCourse.selling_price || dbCourse.price || 0);
    if (basePrice <= 0) {
      return NextResponse.json(
        { error: "Course is free. Please use the free enrollment endpoint." },
        { status: 400 }
      );
    }

    // 7. Validate database-backed discount code server-side
    let discount = 0;
    let discountId: string | null = null;
    if (couponCode && typeof couponCode === "string") {
      const { data: dbDiscount } = await admin
        .from("discounts")
        .select("*")
        .eq("code", couponCode.trim().toUpperCase())
        .eq("active", true)
        .maybeSingle();

      if (dbDiscount) {
        discountId = dbDiscount.id;
        if (dbDiscount.discount_mode === "percentage") {
          discount = Math.round((basePrice * dbDiscount.percentage) / 100);
          if (dbDiscount.max_discount && discount > dbDiscount.max_discount) {
            discount = dbDiscount.max_discount;
          }
        } else {
          discount = Number(dbDiscount.fixed_amount || 0);
        }
      }
    }

    // Final authoritative payable amount in INR
    const finalAmount = Math.max(1, basePrice - discount);
    const amountInPaise = Math.round(finalAmount * 100);

    // 8. Create Razorpay TEST Order
    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";
    const keySecret = process.env.RAZORPAY_KEY_SECRET || "";

    // Ensure real Razorpay TEST credentials are present; otherwise abort with clear error.
    if (!keyId.startsWith("rzp_test_") || !keySecret || keySecret.length < 5) {
      console.error("Razorpay test credentials are missing or invalid. Abort order creation.");
      return NextResponse.json(
        { error: "Razorpay test credentials are not configured. Unable to create payment order." },
        { status: 500 }
      );
    }

    // Real test credentials are present; proceed to create order via Razorpay API.
    let rzpOrder: any = null;
    try {
      const authHeader = "Basic " + Buffer.from(`${keyId}:${keySecret}`).toString("base64");
      const res = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
        body: JSON.stringify({
          amount: amountInPaise,
          currency: "INR",
          receipt: `rcpt_${Date.now().toString(36)}_${userId.substring(0, 6)}`,
          notes: {
            userId,
            courseId,
            productType: "INDIVIDUAL_COURSE",
            tutorId: dbCourse.tutor_id,
          },
        }),
      });
      if (!res.ok) {
        const errBody = await res.text();
        console.error("Razorpay API error:", res.status, errBody);
        throw new Error(`Razorpay API responded with status ${res.status}`);
      }
      rzpOrder = await res.json();
    } catch (apiErr) {
      console.error("Failed to create Razorpay order:", apiErr);
      return NextResponse.json(
        { error: "Failed to create Razorpay order. Please try again later." },
        { status: 502 }
      );
    }

    // Use the real order ID returned by Razorpay.
    const orderId = rzpOrder.id;
    const receipt = rzpOrder.receipt;

    const order = {
      id: orderId,
      amount: amountInPaise,
      currency: "INR",
      receipt: receipt,
    };

    // 9. Store the order intent in payment_orders table
    const { error: insertOrderErr } = await admin.from("payment_orders").insert({
      order_id: order.id,
      user_id: userId,
      course_id: courseId,
      product_type: "INDIVIDUAL_COURSE",
      amount: finalAmount,
      currency: "INR",
      receipt: order.receipt,
      status: "created",
      notes: {
        title: dbCourse.title,
        authoritativePrice: basePrice,
        discountAmount: discount,
        discountId,
        couponCode: couponCode || null,
        tutorId: dbCourse.tutor_id,
      },
    });

    if (insertOrderErr) {
      console.error("Failed to store payment_order record:", insertOrderErr);
      return NextResponse.json({ error: "Failed to persist payment order record." }, { status: 500 });
    }

    // 10. Return public test order details to frontend (never expose secrets)
    return NextResponse.json({
      order,
      keyId: keyId.startsWith("rzp_test_") ? keyId : "rzp_test_eduearn",
      amount: finalAmount,
      courseId,
      title: dbCourse.title,
      currency: "INR",
    });
  } catch (err: any) {
    console.error("Create order error:", err);
    return NextResponse.json({ error: "Server error creating payment order." }, { status: 500 });
  }
}
