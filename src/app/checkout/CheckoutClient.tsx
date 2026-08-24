"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Container } from "../../components/layout/Container";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Divider } from "../../components/ui/divider";
import { toast } from "sonner";
import { 
  CreditCard, 
  Smartphone, 
  Building, 
  Wallet, 
  ShieldCheck, 
  Loader2, 
  ArrowLeft,
  Coins,
  Ticket
} from "lucide-react";
import { MOCK_COURSES, MOCK_TUTORS } from "../../constants/mockData";
import { PaymentService } from "../../features/payments/services/paymentService";

interface CheckoutClientProps {
  tutorId: string;
  courseId: string;
  planId: string;
  batchId: string;
  amount: number | null;
  platform: string;
  coupon: string;
}

export function CheckoutClient({
  tutorId,
  courseId,
  planId,
  batchId,
  amount,
  platform,
  coupon,
}: CheckoutClientProps) {
  const router = useRouter();

  // State-driven data initialized consistently for SSR & initial client render
  const [tutor, setTutor] = useState<typeof MOCK_TUTORS[number]>(() => MOCK_TUTORS.find(t => t.id === tutorId) || MOCK_TUTORS[0]);
  const [course, setCourse] = useState<typeof MOCK_COURSES[number]>(() => MOCK_COURSES.find(c => c.id === courseId) || MOCK_COURSES[0]);
  const [planIdState, setPlanIdState] = useState(planId);
  const [batchIdState, setBatchIdState] = useState(batchId);
  const [meetingPlatform, setMeetingPlatform] = useState(platform);
  const [basePrice, setBasePrice] = useState<number>(() => amount !== null ? amount : (MOCK_COURSES.find(c => c.id === courseId)?.price || 1499));

  // Checkout calculations states
  const [couponCode, setCouponCode] = useState(coupon);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(coupon || null);
  const [discount, setDiscount] = useState(0);
  const [useWalletCredits, setUseWalletCredits] = useState(false);
  const [walletBalance, setWalletBalance] = useState(550);

  // Payment UI states
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card" | "netbanking" | "wallet">("upi");
  const [selectedSubMethod, setSelectedSubMethod] = useState("gpay");
  const [isProcessing, setIsProcessing] = useState(false);

  // Apply Coupon Logic
  const handleApplyCoupon = useCallback((codeToApply?: string) => {
    const code = codeToApply || couponCode;
    if (!code.trim()) {
      toast.error("Please enter a valid coupon code");
      return;
    }
    const result = PaymentService.validateCoupon(code, basePrice);
    if (result.success) {
      setDiscount(result.discountAmount);
      setAppliedCoupon(code);
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  }, [couponCode, basePrice]);

  useEffect(() => {
    setWalletBalance(PaymentService.getWalletBalance().total);
  }, []);

  useEffect(() => {
    const t = MOCK_TUTORS.find(x => x.id === tutorId) || MOCK_TUTORS[0];
    setTutor(t);
    const c = MOCK_COURSES.find(x => x.id === courseId) || MOCK_COURSES[0];
    setCourse(c);
    setPlanIdState(planId);
    setBatchIdState(batchId);
    setMeetingPlatform(platform);
    setBasePrice(amount !== null ? amount : c.price);
    if (coupon) {
      setCouponCode(coupon);
      setAppliedCoupon(coupon);
    }
  }, [tutorId, courseId, planId, batchId, platform, amount, coupon]);

  useEffect(() => {
    if (coupon) {
      handleApplyCoupon(coupon);
    }
  }, [coupon, handleApplyCoupon]);

  const handleRemoveCoupon = () => {
    setDiscount(0);
    setAppliedCoupon(null);
    setCouponCode("");
    toast.info("Coupon removed");
  };

  // Computations
  const discountedAmount = basePrice - discount;
  const walletDeduction = useWalletCredits ? Math.min(walletBalance, discountedAmount) : 0;
  const platformFee = Math.round(discountedAmount * 0.02); // 2% platform convenience fee
  const gst = Math.round((discountedAmount + platformFee) * 0.18); // 18% GST on services
  const finalTotal = Math.max(0, discountedAmount + platformFee + gst - walletDeduction);

  const handlePay = () => {
    setIsProcessing(true);
    toast.info("Connecting with secure Razorpay Sandbox...");

    setTimeout(() => {
      // 1. Deduct wallet credits if applied
      if (walletDeduction > 0) {
        PaymentService.deductWalletCredits(walletDeduction);
      }

      // 2. Add course purchase history item
      PaymentService.addPurchase(course.id, course.title, basePrice - discount);

      // 3. Add course to dynamic Student Dashboard enrolled courses list
      if (typeof window !== "undefined") {
        const studentCourses = localStorage.getItem("eduearn_student_courses");
        const list = studentCourses ? JSON.parse(studentCourses) : [];
        
        // Avoid duplicate enrollments
        if (!list.some((c: any) => c.id === course.id)) {
          const newEnroll = {
            id: course.id,
            title: course.title,
            tutorName: tutor.fullName,
            thumbnail: course.thumbnail,
            progress: 0,
            lessonsCount: course.lessonsCount || 10,
            completedLessons: 0,
            duration: course.duration || "8 hours",
            estimatedCompletion: "Getting Started",
            category: course.category || "General",
            lastStudied: "Just Enrolled",
          };
          list.push(newEnroll);
          localStorage.setItem("eduearn_student_courses", JSON.stringify(list));
        }

        // Add dynamically scheduled live class to localstorage registry
        const storedClasses = localStorage.getItem("eduearn_live_classes");
        const parsedClasses = storedClasses ? JSON.parse(storedClasses) : [];
        const nextMonday = new Date();
        nextMonday.setDate(nextMonday.getDate() + ((1 + 7 - nextMonday.getDay()) % 7 || 7));
        const dateStr = nextMonday.toLocaleDateString("en-IN", { weekday: 'short', month: 'short', day: 'numeric' });

        parsedClasses.push({
          id: `live-${Date.now()}`,
          title: `Intro Session - ${course.title}`,
          tutorName: tutor.fullName,
          time: batchIdState.includes("Morning") ? "7:00 AM IST" : batchIdState.includes("Evening") ? "6:00 PM IST" : "10:00 AM IST",
          date: dateStr,
          status: "Scheduled",
          link: meetingPlatform === "Zoom" ? "https://zoom.us/j/90823901" : "https://meet.google.com/abc-defg-hij",
          meetingPlatform
        });
        localStorage.setItem("eduearn_live_classes", JSON.stringify(parsedClasses));

        // Create transaction entry for Admin Revenue dashboard
        const storedTrans = localStorage.getItem("eduearn_admin_enrollments");
        const parsedTrans = storedTrans ? JSON.parse(storedTrans) : [];
        parsedTrans.push({
          id: `tx-${Date.now()}`,
          student: "Surya K",
          tutor: tutor.fullName,
          tutorId: tutor.id,
          course: course.title,
          courseId: course.id,
          plan: planIdState,
          batch: batchIdState,
          amount: basePrice - discount,
          commission: Math.round((basePrice - discount) * 0.15), // 15% admin commission split
          status: "Success",
          date: new Date().toISOString().split("T")[0]
        });
        localStorage.setItem("eduearn_admin_enrollments", JSON.stringify(parsedTrans));
      }

      // 4. Generate user & tutor notifications
      PaymentService.addNotification(
        "Enrollment Successful 🎉",
        `You have enrolled in ${course.title} by ${tutor.fullName} successfully. Check the learning dashboard.`,
        "welcome"
      );

      toast.success("Payment successful! Redirecting...");
      setIsProcessing(false);

      // Redirect to dynamic Success Page
      router.push(`/checkout/success?courseId=${course.id}&tutorId=${tutor.id}&planId=${planIdState}&batchId=${batchIdState}&amount=${finalTotal}&platform=${meetingPlatform}`);
    }, 2500);
  };

  return (
    <Container className="py-12 select-none text-left">
      {/* Back button */}
      <button 
        onClick={() => router.back()} 
        className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft size={14} /> Back to Profile
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Payment Forms */}
        <div className="lg:col-span-8 space-y-6">
          <Card variant="glass" className="p-6 space-y-4 border border-primary/10">
            <div>
              <h2 className="text-lg font-heading font-extrabold text-foreground">
                Secure Checkout Gateway
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Choose your preferred payment mode below. Protected by bank-grade SSL sandbox simulation.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {/* UPI Option */}
              <button
                onClick={() => setPaymentMethod("upi")}
                className={`p-4 rounded-xl border text-left flex flex-col justify-between gap-3 transition-all duration-300 ${
                  paymentMethod === "upi"
                    ? "border-primary bg-primary/5 text-primary shadow-soft"
                    : "border-border hover:bg-muted/30 text-muted-foreground"
                }`}
              >
                <Smartphone size={20} className={paymentMethod === "upi" ? "text-primary" : "text-muted-foreground"} />
                <div>
                  <span className="text-xs font-bold block text-foreground">UPI Transfer</span>
                  <span className="text-[10px] text-muted-foreground">GPay, PhonePe, UPI ID</span>
                </div>
              </button>

              {/* Cards Option */}
              <button
                onClick={() => setPaymentMethod("card")}
                className={`p-4 rounded-xl border text-left flex flex-col justify-between gap-3 transition-all duration-300 ${
                  paymentMethod === "card"
                    ? "border-primary bg-primary/5 text-primary shadow-soft"
                    : "border-border hover:bg-muted/30 text-muted-foreground"
                }`}
              >
                <CreditCard size={20} className={paymentMethod === "card" ? "text-primary" : "text-muted-foreground"} />
                <div>
                  <span className="text-xs font-bold block text-foreground">Credit / Debit</span>
                  <span className="text-[10px] text-muted-foreground">Visa, MasterCard, RuPay</span>
                </div>
              </button>

              {/* NetBanking Option */}
              <button
                onClick={() => setPaymentMethod("netbanking")}
                className={`p-4 rounded-xl border text-left flex flex-col justify-between gap-3 transition-all duration-300 ${
                  paymentMethod === "netbanking"
                    ? "border-primary bg-primary/5 text-primary shadow-soft"
                    : "border-border hover:bg-muted/30 text-muted-foreground"
                }`}
              >
                <Building size={20} className={paymentMethod === "netbanking" ? "text-primary" : "text-muted-foreground"} />
                <div>
                  <span className="text-xs font-bold block text-foreground">Net Banking</span>
                  <span className="text-[10px] text-muted-foreground">SBI, HDFC, ICICI, Axis</span>
                </div>
              </button>

              {/* Wallet Credits Option */}
              <button
                onClick={() => setPaymentMethod("wallet")}
                className={`p-4 rounded-xl border text-left flex flex-col justify-between gap-3 transition-all duration-300 ${
                  paymentMethod === "wallet"
                    ? "border-primary bg-primary/5 text-primary shadow-soft"
                    : "border-border hover:bg-muted/30 text-muted-foreground"
                }`}
              >
                <Wallet size={20} className={paymentMethod === "wallet" ? "text-primary" : "text-muted-foreground"} />
                <div>
                  <span className="text-xs font-bold block text-foreground">EduEarn Wallet</span>
                  <span className="text-[10px] text-muted-foreground">Balance: ₹{walletBalance}</span>
                </div>
              </button>
            </div>

            <Divider className="my-2" />

            {/* Sub-Payment Method Form Details */}
            <div className="p-5 border border-border bg-card/40 rounded-xl space-y-4">
              {paymentMethod === "upi" && (
                <div className="space-y-4">
                  <span className="text-xs font-extrabold text-foreground block">Select UPI App</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {["gpay", "phonepe", "paytm", "upi_id"].map((method) => (
                      <button
                        key={method}
                        onClick={() => setSelectedSubMethod(method)}
                        className={`p-3 rounded-lg border text-center font-bold text-xs uppercase transition-all ${
                          selectedSubMethod === method
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border hover:bg-muted/20 text-muted-foreground"
                        }`}
                      >
                        {method.replace("_", " ")}
                      </button>
                    ))}
                  </div>

                  {selectedSubMethod === "upi_id" && (
                    <div className="space-y-1 text-xs text-left max-w-sm mt-3 animate-fade-in">
                      <label className="font-bold text-foreground">Enter UPI ID</label>
                      <input
                        type="text"
                        placeholder="username@okaxis"
                        className="h-10 w-full rounded border border-border bg-card px-3 text-xs text-foreground focus:outline-none focus:border-primary/50"
                      />
                    </div>
                  )}
                </div>
              )}

              {paymentMethod === "card" && (
                <div className="space-y-3 text-xs text-left max-w-md">
                  <div className="space-y-1">
                    <label className="font-bold text-foreground">Cardholder Name</label>
                    <input
                      type="text"
                      placeholder="Surya Kumar"
                      className="h-10 w-full rounded border border-border bg-card px-3 focus:outline-none focus:border-primary/50"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-foreground">Card Number</label>
                    <input
                      type="text"
                      placeholder="4321 9081 2304 9012"
                      className="h-10 w-full rounded border border-border bg-card px-3 focus:outline-none focus:border-primary/50"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-foreground">Expiry Date</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        className="h-10 w-full rounded border border-border bg-card px-3 focus:outline-none focus:border-primary/50"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-foreground">CVV</label>
                      <input
                        type="password"
                        maxLength={3}
                        placeholder="•••"
                        className="h-10 w-full rounded border border-border bg-card px-3 focus:outline-none focus:border-primary/50"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === "netbanking" && (
                <div className="space-y-1 text-xs text-left max-w-sm">
                  <label className="font-bold text-foreground">Choose Bank</label>
                  <select className="h-10 w-full rounded border border-border bg-card px-3 focus:outline-none focus:border-primary/50 font-semibold cursor-pointer">
                    <option>State Bank of India</option>
                    <option>HDFC Bank</option>
                    <option>ICICI Bank</option>
                    <option>Axis Bank</option>
                    <option>Kotak Mahindra Bank</option>
                  </select>
                </div>
              )}

              {paymentMethod === "wallet" && (
                <div className="space-y-3 text-xs text-left">
                  <div className="p-4 border border-amber-500/20 bg-amber-500/5 rounded-lg flex items-start gap-3">
                    <Coins className="text-amber-500 shrink-0 mt-0.5" size={16} />
                    <div className="space-y-1 leading-normal">
                      <span className="font-bold text-foreground block">Apply Wallet Balance Bonus Credits</span>
                      <p className="text-[10px] text-muted-foreground">
                        You have **₹{walletBalance}** available. Credits will be automatically applied to deduct from final invoice amount.
                      </p>
                    </div>
                  </div>
                  <Button
                    variant={useWalletCredits ? "primary" : "outline"}
                    size="sm"
                    onClick={() => setUseWalletCredits(!useWalletCredits)}
                    className="mt-2"
                  >
                    {useWalletCredits ? "Wallet Applied" : "Apply Wallet Credits"}
                  </Button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/80 font-semibold mt-4">
              <ShieldCheck size={14} className="text-emerald-500" />
              Secured by Razorpay Sandbox. Transactions are fully encrypted.
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN: Sticky Order Summary */}
        <div className="lg:col-span-4 lg:sticky lg:top-24">
          <Card variant="glass" className="p-6 space-y-5 border border-primary/10">
            <div>
              <span className="text-[9px] uppercase font-heading font-extrabold tracking-widest text-primary">
                Order Invoice
              </span>
              <h3 className="text-sm font-heading font-extrabold text-foreground mt-1">
                Receipt Summary
              </h3>
            </div>

            {/* Course & Tutor meta */}
            <div className="flex gap-3 items-center text-left">
              <div className="w-14 h-10 rounded bg-muted overflow-hidden border border-border shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element -- Course thumbnails are loaded dynamically from external storage */}
                <img 
                  src={course?.thumbnail || "/images/courses/academic-education.webp"} 
                  alt={course?.title}
                  className="w-full h-full object-cover" 
                />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-foreground truncate">{course?.title}</h4>
                <p className="text-[10px] text-muted-foreground mt-0.5 truncate">Educator: {tutor?.fullName}</p>
              </div>
            </div>

            <Divider className="my-1" />

            {/* Plan Specs */}
            <div className="flex flex-col gap-2.5 text-xs text-muted-foreground text-left leading-normal font-semibold">
              <div className="flex justify-between">
                <span>Selected Plan</span>
                <span className="text-foreground font-bold">{planIdState}</span>
              </div>
              <div className="flex justify-between">
                <span>Batch Selected</span>
                <span className="text-foreground font-bold">{batchIdState}</span>
              </div>
              <div className="flex justify-between">
                <span>Classroom Channel</span>
                <span className="text-foreground font-bold">{meetingPlatform}</span>
              </div>
            </div>

            <Divider className="my-1" />

            {/* Coupon Code Entry */}
            <div className="space-y-2 text-left">
              <span className="text-[10px] font-bold text-foreground flex items-center gap-1">
                <Ticket size={12} className="text-primary" /> Apply Promo Code
              </span>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="WELCOME10"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  disabled={!!appliedCoupon}
                  className="h-9 grow rounded border border-border bg-card px-3 text-xs font-bold text-foreground placeholder:text-muted-foreground/80 uppercase focus:outline-none disabled:bg-muted/40"
                />
                {appliedCoupon ? (
                  <Button variant="outline" size="sm" onClick={handleRemoveCoupon} className="h-9 px-2 text-red-500 hover:text-red-600">
                    Remove
                  </Button>
                ) : (
                  <Button variant="secondary" size="sm" onClick={() => handleApplyCoupon()} className="h-9 px-3">
                    Apply
                  </Button>
                )}
              </div>
            </div>

            <Divider className="my-1" />

            {/* Price list breakdown */}
            <div className="flex flex-col gap-2 text-xs text-muted-foreground text-left font-semibold">
              <div className="flex justify-between">
                <span>Base Price</span>
                <span className="text-foreground font-bold">₹{basePrice}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Coupon Discount</span>
                  <span>-₹{discount}</span>
                </div>
              )}
              {walletDeduction > 0 && (
                <div className="flex justify-between text-amber-500 font-bold">
                  <span>Wallet Credits Applied</span>
                  <span>-₹{walletDeduction}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Platform Convenience Fee (2%)</span>
                <span className="text-foreground font-bold">₹{platformFee}</span>
              </div>
              <div className="flex justify-between">
                <span>GST (18% Service Tax)</span>
                <span className="text-foreground font-bold">₹{gst}</span>
              </div>

              <Divider className="my-1" />

              <div className="flex justify-between text-sm font-black text-foreground pt-1">
                <span>Total Amount Due</span>
                <span className="text-primary font-black">₹{finalTotal}</span>
              </div>
            </div>

            <Button
              onClick={handlePay}
              disabled={isProcessing}
              className="w-full h-11 text-xs font-bold mt-4 shadow-soft gap-2 flex items-center justify-center"
            >
              {isProcessing ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Processing Payment...
                </>
              ) : (
                <>
                  Pay &amp; Enroll Now
                </>
              )}
            </Button>
          </Card>
        </div>

      </div>
    </Container>
  );
}
