import { NextResponse } from "next/server";
import { PaymentService } from "@/features/payments/services/paymentService";
import { MOCK_COURSES } from "@/constants/mockData";
import { createClient } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const { courseId, packageId, projectId, couponCode, useWalletCredits, walletBalance } = await request.json();
    let basePrice = 1299;
    let title = "EduEarn Course";

    const supabase = createClient();

    if (courseId && supabase) {
      const { data: dbCourse } = await supabase
        .from("courses")
        .select("title, price, selling_price, status, approval_status, tutor_id")
        .eq("id", courseId)
        .maybeSingle();

      if (dbCourse) {
        if (dbCourse.status !== "published" || dbCourse.approval_status !== "approved" || !dbCourse.tutor_id) {
          return NextResponse.json(
            { error: "Course is not currently available for purchase (awaiting tutor assignment or approval)." },
            { status: 400 }
          );
        }

        const { data: tutorProfile } = await supabase
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

        basePrice = Number(dbCourse.selling_price || dbCourse.price || 1299);
        title = dbCourse.title;
      } else {
        const mock = MOCK_COURSES.find((c) => c.id === courseId);
        if (mock) {
          basePrice = mock.price;
          title = mock.title;
        }
      }
    } else if (packageId) {
      const { data: dbPkg } = await supabase.from("career_packages").select("title, selling_price").eq("id", packageId).maybeSingle();
      if (dbPkg) {
        basePrice = Number(dbPkg.selling_price || 8499);
        title = dbPkg.title;
      }
    } else if (projectId) {
      const { data: dbProj } = await supabase.from("projects").select("title, learning_fee, hardware_cost").eq("id", projectId).maybeSingle();
      if (dbProj) {
        basePrice = Number(dbProj.learning_fee || 899) + Number(dbProj.hardware_cost || 0);
        title = dbProj.title;
      }
    }

    // Validate Coupon/Discount Code
    let discount = 0;
    if (couponCode) {
      const { data: dbDiscount } = await supabase
        .from("discounts")
        .select("*")
        .eq("code", couponCode)
        .eq("active", true)
        .maybeSingle();

      if (dbDiscount) {
        if (dbDiscount.discount_mode === "percentage") {
          discount = Math.round((basePrice * dbDiscount.percentage) / 100);
          if (dbDiscount.max_discount && discount > dbDiscount.max_discount) {
            discount = dbDiscount.max_discount;
          }
        } else {
          discount = Number(dbDiscount.fixed_amount || 0);
        }
      } else {
        const result = PaymentService.validateCoupon(couponCode, basePrice);
        if (result.success) discount = result.discountAmount;
      }
    }

    // Wallet Deduction
    let walletDeduction = 0;
    if (useWalletCredits && typeof walletBalance === "number") {
      const maxApplicable = Math.max(0, basePrice - discount);
      walletDeduction = Math.min(walletBalance, maxApplicable);
    }

    const discountedAmount = Math.max(0, basePrice - discount - walletDeduction);
    const platformFee = Math.round(discountedAmount * 0.02);
    const gst = Math.round((discountedAmount + platformFee) * 0.18);
    const finalAmount = Math.max(0, discountedAmount + platformFee + gst);

    // Create Razorpay Order Server-Side
    const order = await PaymentService.createRazorpayOrder(finalAmount);

    return NextResponse.json({
      order,
      amount: finalAmount,
      basePrice,
      sellingPrice: discountedAmount,
      savings: discount + walletDeduction,
      title,
    });
  } catch (err) {
    console.error("Create order error:", err);
    return NextResponse.json({ error: "Server error creating payment order." }, { status: 500 });
  }
}
