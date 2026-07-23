"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Container } from "../../components/layout/Container";
import { PageWrapper } from "../../components/layout/PageWrapper";
import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Divider } from "../../components/ui/divider";
import { Accordion } from "../../components/ui/accordion";
import { toast } from "sonner";
import { Check, X, Star, Loader2, Activity, Brain, HardDrive } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

export default function PricingPage() {
  const { user } = useAuth();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  const [tutorProSubscribed, setTutorProSubscribed] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("tutor_pro_subscribed") === "true";
    }
    return false;
  });
  const [isUpgradingPro, setIsUpgradingPro] = useState(false);

  const handleUpgradeToPro = () => {
    setIsUpgradingPro(true);
    toast.info("Initializing secure Razorpay subscription...");
    setTimeout(() => {
      if (typeof window !== "undefined") {
        localStorage.setItem("tutor_pro_subscribed", "true");
        setTutorProSubscribed(true);
        toast.success("Subscribed to Tutor Pro successfully! ₹499/month processed.");
        setIsUpgradingPro(false);
      }
    }, 2000);
  };

  const plans = [
    {
      name: "Free Learner",
      price: 0,
      desc: "Access basic free public lectures and download student review sheets.",
      features: [
        "View public recorded classes",
        "Basic course searches",
        "Download free resources",
        "Standard student profile dashboard",
      ],
      cta: "Get Started",
      popular: false,
    },
    {
      name: "Learner Pro",
      price: billingCycle === "monthly" ? 299 : 249,
      desc: "Unlock every premium self-paced course, live doubt clearances, and certificates.",
      features: [
        "All 100+ Premium Courses",
        "Join Live doubt screen shares",
        "Verified certificates issued",
        "Priority student forum support",
        "Offline syllabus download options",
      ],
      cta: "Upgrade to Pro",
      popular: true,
    },
    {
      name: "Tutor Pro",
      price: billingCycle === "monthly" ? 499 : 399,
      desc: "For student creators who want to publish courses, host live sessions, and earn.",
      features: [
        "Publish unlimited courses",
        "Host live doubt clearances (60m)",
        "Earn 85% payouts on student enrollment",
        "AI Verified assessment credentials",
        "Advanced course-analytics console",
      ],
      cta: "Become a Tutor",
      popular: false,
    },
  ];

  const comparisonMatrix = [
    { feature: "Self-paced video modules", free: true, learner: true, tutor: true },
    { feature: "Live screen-shares & Q&A", free: false, learner: true, tutor: true },
    { feature: "Verified course certificates", free: false, learner: true, tutor: true },
    { feature: "Direct UPI payouts (85%)", free: false, learner: false, tutor: true },
    { feature: "AI validator assessment testing", free: false, learner: false, tutor: true },
    { feature: "Tutor analytic tools dashboard", free: false, learner: false, tutor: true },
  ];

  const pricingFaqItems = [
    {
      id: "pricing-faq-1",
      trigger: "How do tutor payouts work on EduEarn?",
      content: "Student tutors retain 85% of course fees. Payouts are calculated monthly and transferred directly via UPI to your linked bank account.",
    },
    {
      id: "pricing-faq-2",
      trigger: "Can I cancel my Learner Pro subscription anytime?",
      content: "Yes! There are no lock-in periods. Subscriptions can be paused or cancelled directly from your account settings page.",
    },
    {
      id: "pricing-faq-3",
      trigger: "Do you offer student discounts on the pricing tiers?",
      content: "All pricing plans are optimized specifically for school/college students. By selecting the yearly cycle, you save up to 20% on Pro plans.",
    },
  ];

  const handleCtaClick = (planName: string) => {
    toast.success(`Selected plan: ${planName}! Payment integration sandbox opens in Phase 3.5`);
  };

  return (
    <PageWrapper>
      {/* Header section */}
      <section className="w-full py-12 bg-muted/20 border-b border-border/40 text-left select-none">
        <Container className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-semibold">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <span>/</span>
            <span className="text-foreground">Pricing Plans</span>
          </div>

          <div className="flex flex-col gap-2 mt-1">
            <h1 className="text-3xl md:text-4xl font-heading font-extrabold text-foreground tracking-tight">
              Simple, Transparent Pricing
            </h1>
            <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
              {"Choose the plan that matches your goals. Learn from student peers or publish courses and generate income."}
            </p>
          </div>
        </Container>
      </section>

      {/* Cycle Toggle & Plans Cards */}
      <section className="w-full py-16 select-none text-left">
        <Container className="flex flex-col gap-12 items-center">
          
          {/* Billing Cycle Switch */}
          <div className="flex items-center gap-3 bg-muted/40 border border-border/60 p-1.5 rounded-full select-none">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer focus:outline-none ${
                billingCycle === "monthly" ? "bg-primary text-white" : "text-muted-foreground"
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer focus:outline-none ${
                billingCycle === "yearly" ? "bg-primary text-white" : "text-muted-foreground"
              }`}
            >
              Yearly Billing
            </button>
          </div>

          {/* Pricing Cards Grid */}
          {user?.role === "tutor" ? (
            <div className="w-full max-w-xl border border-border bg-card rounded-card p-6 shadow-soft space-y-6 text-left select-none">
              <div className="border-b border-border/40 pb-4 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-heading font-extrabold text-foreground tracking-tight">
                    Your Creator Plan Status
                  </h3>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Plan type: {tutorProSubscribed ? "Tutor Pro Membership" : "Free Creator Trial"}
                  </p>
                </div>
                <span className={`text-[9px] font-extrabold uppercase px-2.5 py-1 rounded border shadow-soft ${
                  tutorProSubscribed 
                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
                    : "bg-amber-500/10 text-amber-500 border-amber-500/20 animate-pulse"
                }`}>
                  {tutorProSubscribed ? "Active" : "Trial Mode"}
                </span>
              </div>

              {/* Status parameters */}
              {/* Status parameters */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div className="border border-border/50 p-3 rounded bg-muted/20">
                  <span className="text-muted-foreground/80 block font-bold text-[10px] uppercase">Days Remaining</span>
                  <span className="text-foreground font-heading font-extrabold text-sm block mt-1">
                    {tutorProSubscribed ? "Unlimited Access" : "22 Days"}
                  </span>
                </div>
                <div className="border border-border/50 p-3 rounded bg-muted/20">
                  <span className="text-muted-foreground/80 block font-bold text-[10px] uppercase">Current Earnings</span>
                  <span className="text-foreground font-heading font-extrabold text-sm block mt-1">₹12,500</span>
                </div>
                <div className="border border-border/50 p-3 rounded bg-muted/20">
                  <span className="text-muted-foreground/80 block font-bold text-[10px] uppercase">Students Enrolled</span>
                  <span className="text-foreground font-heading font-extrabold text-sm block mt-1">12 Students</span>
                </div>
                <div className="border border-border/50 p-3 rounded bg-muted/20">
                  <span className="text-muted-foreground/80 block font-bold text-[10px] uppercase">Bandwidth Used</span>
                  <span className="text-foreground font-heading font-extrabold text-sm block mt-1">2.4 GB / 20 GB</span>
                </div>
                <div className="border border-border/50 p-3 rounded bg-muted/20">
                  <span className="text-muted-foreground/80 block font-bold text-[10px] uppercase">AI Credits Used</span>
                  <span className="text-foreground font-heading font-extrabold text-sm block mt-1">18 / 100 requests</span>
                </div>
              </div>

              {/* Storage bar */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center text-[10px] font-bold text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <HardDrive size={12} className="text-primary" />
                    Cloud Storage Capacity
                  </span>
                  <span className="text-foreground">152 MB / 5.0 GB Used</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: "3.0%" }} />
                </div>
              </div>

              {/* Upgrade form */}
              {!tutorProSubscribed && (
                <div className="pt-2 space-y-4">
                  <div className="p-4 rounded border border-primary/20 bg-primary/5 space-y-2">
                    <span className="text-xs font-heading font-extrabold text-primary block">Tutor Pro Creator upgrade — ₹499/month</span>
                    <p className="text-[10px] text-muted-foreground leading-normal">
                      Unlock unlimited cloud space hosting, advanced AI scripts generated automatically, doubt class video archives, and priorities support to cover our servers and API costs.
                    </p>
                  </div>
                  <button
                    onClick={handleUpgradeToPro}
                    disabled={isUpgradingPro}
                    className="w-full h-10 font-bold gap-2 text-xs bg-primary text-white shadow-premium hover:bg-primary/95">
                    {isUpgradingPro ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        Processing Secure Checkout...
                      </>
                    ) : (
                      <>
                        Upgrade to Tutor Pro (₹499/mo)
                      </>
                    )}
                  </button>
                </div>
              )}

              {tutorProSubscribed && (
                <div className="p-4 rounded border border-emerald-500/20 bg-emerald-500/5 text-center text-xs text-emerald-600 font-bold">
                  ✓ Tutor Pro Membership is Active. Thank you for supporting the EduEarn learning community!
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
                {plans.map((plan, idx) => (
                  <Card
                    key={idx}
                    variant={plan.popular ? "glass" : "default"}
                    hoverEffect="lift"
                    className={`p-6 border-border flex flex-col justify-between h-full relative ${
                      plan.popular ? "border-primary/50 shadow-premium bg-card" : "bg-card"
                    }`}
                  >
                    {plan.popular && (
                      <Badge variant="primary" className="absolute -top-3 left-6 flex items-center gap-0.5 animate-pulse uppercase tracking-wider text-[8px] font-extrabold">
                        <Star size={9} className="fill-white text-emerald-500" />
                        Most Popular Choice
                      </Badge>
                    )}

                    <div className="flex flex-col gap-5 text-left">
                      <div>
                        <h4 className="text-base font-heading font-extrabold text-foreground">
                          {plan.name}
                        </h4>
                        <p className="text-[10px] text-muted-foreground mt-2 leading-relaxed min-h-[40px]">
                          {plan.desc}
                        </p>
                      </div>

                      <div className="flex items-baseline gap-1 mt-2">
                        <span className="text-3xl font-heading font-extrabold text-foreground">
                          {plan.price === 0 ? "Free" : `₹${plan.price}`}
                        </span>
                        {plan.price > 0 && (
                          <span className="text-[10px] text-muted-foreground font-semibold">
                            /{billingCycle === "monthly" ? "month" : "month (billed yearly)"}
                          </span>
                        )}
                      </div>

                      <Divider variant="dashed" className="my-1" />

                      {/* list features */}
                      <div className="flex flex-col gap-3 text-xs text-muted-foreground font-semibold text-left">
                        <span className="text-[8px] uppercase tracking-wider font-extrabold text-muted-foreground/80">What is included:</span>
                        {plan.features.map((feature, fIdx) => (
                          <div key={fIdx} className="flex items-start gap-2.5 leading-normal">
                            <Check size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-8">
                      <Button
                        onClick={() => handleCtaClick(plan.name)}
                        variant={plan.popular ? "primary" : "outline"}
                        className="w-full"
                      >
                        {plan.cta}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Comparison Matrix Table */}
              <div className="w-full mt-10 flex flex-col gap-6 text-left">
                <h3 className="text-base font-heading font-extrabold text-foreground">
                  Tiers Feature Matrix
                </h3>
                
                <div className="w-full overflow-x-auto border border-border/80 rounded-card bg-card shadow-soft">
                  <table className="w-full text-xs text-left min-w-[500px]">
                    <thead>
                      <tr className="border-b border-border bg-muted/30 text-[9px] uppercase tracking-wider font-extrabold text-muted-foreground/80">
                        <th className="p-4">Feature Segment</th>
                        <th className="p-4 text-center">Free Learner</th>
                        <th className="p-4 text-center">Learner Pro</th>
                        <th className="p-4 text-center">Tutor Pro</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40 font-semibold text-muted-foreground">
                      {comparisonMatrix.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-muted/10">
                          <td className="p-4 text-foreground text-xs">{row.feature}</td>
                          <td className="p-4 text-center">
                            {row.free ? <Check size={16} className="text-emerald-500 mx-auto" /> : <X size={16} className="text-muted-foreground mx-auto" />}
                          </td>
                          <td className="p-4 text-center">
                            {row.learner ? <Check size={16} className="text-emerald-500 mx-auto" /> : <X size={16} className="text-muted-foreground mx-auto" />}
                          </td>
                          <td className="p-4 text-center">
                            {row.tutor ? <Check size={16} className="text-emerald-500 mx-auto" /> : <X size={16} className="text-muted-foreground mx-auto" />}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* FAQs and support accordion */}
          <div className="w-full flex flex-col gap-6 mt-6">
            <h3 className="text-base font-heading font-extrabold text-foreground">
              Pricing FAQs
            </h3>
            <Accordion items={pricingFaqItems} allowMultiple={true} className="border-border/60" />
          </div>

        </Container>
      </section>
    </PageWrapper>
  );
}
