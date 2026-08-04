import { NextResponse } from 'next/server';
import { PaymentService } from '@/features/payments/services/paymentService';
import { MOCK_COURSES } from '@/constants/mockData';

export async function POST(request: Request) {
  try {
    const { courseId, couponCode, useWalletCredits, walletBalance } = await request.json();
    const course = MOCK_COURSES.find(c => c.id === courseId);
    if (!course) {
      return NextResponse.json({ error: 'Invalid courseId' }, { status: 400 });
    }
    const basePrice = course.price;
    // Apply coupon
    let discount = 0;
    if (couponCode) {
      const result = PaymentService.validateCoupon(couponCode, basePrice);
      if (result.success) discount = result.discountAmount;
    }
    // Wallet deduction
    let walletDeduction = 0;
    if (useWalletCredits && typeof walletBalance === 'number') {
      const maxApplicable = Math.max(0, basePrice - discount);
      walletDeduction = Math.min(walletBalance, maxApplicable);
    }
    const discountedAmount = basePrice - discount - walletDeduction;
    const platformFee = Math.round(discountedAmount * 0.02);
    const gst = Math.round((discountedAmount + platformFee) * 0.18);
    const finalAmount = Math.max(0, discountedAmount + platformFee + gst);
    // Create Razorpay order server‑side
    const order = await PaymentService.createRazorpayOrder(finalAmount);
    return NextResponse.json({ order, amount: finalAmount });
  } catch (err) {
    console.error('Create order error', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
