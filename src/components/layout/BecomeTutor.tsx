"use client";

import React from "react";
import { Container } from "./Container";
import { Button } from "../ui/button";
import { Check, DollarSign, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export function BecomeTutor() {
  const router = useRouter();
  const benefits = [
    "Earn up to ₹1,500/hour conducting peer doubt clearances.",
    "Build a verified teaching portfolio backed by AI screening.",
    "Flexibility to schedule classes around your college classes.",
    "Receive student feedback and grow your professional reputation.",
  ];

  return (
    <section className="w-full py-20 bg-muted/20 border-y border-border/40 select-none overflow-hidden relative">
      {/* Decorative Blur elements */}
      <div className="absolute top-1/2 left-[-100px] w-64 h-64 rounded-full bg-primary/10 blur-[80px] pointer-events-none" />

      <Container className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Side Info */}
        <div className="lg:col-span-7 flex flex-col items-start text-left gap-6">
          <span className="text-[10px] uppercase tracking-wider font-extrabold text-primary bg-primary/10 px-3 py-1 rounded-full">
            Join Our Faculty
          </span>
          <h2 className="text-3xl md:text-5xl font-heading font-extrabold text-foreground tracking-tight leading-tight">
            Turn Your Knowledge <br />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Into Income.
            </span>
          </h2>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-xl">
            If you are a student or young professional aged 16–24, share your subject skills, help peers solve homework doubts, and earn to support your education.
          </p>

          {/* Benefits list */}
          <ul className="flex flex-col gap-3">
            {benefits.map((benefit, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                <Check size={14} className="text-accent shrink-0 mt-0.5" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap items-center gap-3.5 mt-4">
            <Button
              onClick={() => {
                router.push("/tutor/onboarding");
              }}
              size="md"
            >
              Become a Tutor
            </Button>
            <Button
              onClick={() => {
                router.push("/tutor-support");
              }}
              variant="outline"
              size="md"
            >
              Learn More
            </Button>
          </div>
        </div>

        {/* Right Side Mock Dashboard Widget */}
        <div className="lg:col-span-5 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
            className="w-full max-w-[380px] bg-card border border-border shadow-sm hover:shadow-md transition-shadow duration-200 rounded-card shadow-floating p-5 relative overflow-hidden text-left select-none"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/45 pb-3.5 mb-4">
              <span className="text-[10px] font-extrabold text-foreground uppercase tracking-wide">
                Tutor Dashboard
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse" />
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-3 bg-muted/40 border border-border/30 rounded-input flex flex-col">
                <span className="text-[8px] uppercase tracking-wider font-extrabold text-muted-foreground/80">Students Taught</span>
                <span className="text-lg font-heading font-extrabold text-foreground mt-1">42</span>
              </div>
              <div className="p-3 bg-muted/40 border border-border/30 rounded-input flex flex-col">
                <span className="text-[8px] uppercase tracking-wider font-extrabold text-muted-foreground/80">Class Rating</span>
                <span className="text-lg font-heading font-extrabold text-foreground mt-1">4.9 ★</span>
              </div>
            </div>

            {/* Wallet details */}
            <div className="p-4 rounded-input bg-card border border-border shadow-sm hover:shadow-md transition-shadow duration-200/50 flex items-center justify-between shadow-soft mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                  <DollarSign size={16} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] uppercase tracking-wider font-extrabold text-muted-foreground/80">Wallet Balance</span>
                  <span className="text-sm font-extrabold text-foreground mt-0.5">₹8,450.00</span>
                </div>
              </div>
              <span className="text-[8px] font-extrabold text-accent uppercase bg-accent/10 px-2 py-0.5 rounded">
                Verified
              </span>
            </div>

            {/* Earnings Sparkline Chart Mock */}
            <div className="flex flex-col gap-2 p-3 border border-border/30 rounded-input bg-muted/20">
              <div className="flex justify-between items-center text-[8px] font-bold text-muted-foreground uppercase">
                <span>Weekly Income</span>
                <span className="text-accent flex items-center">
                  <TrendingUp size={10} className="mr-0.5" />
                  +12.4%
                </span>
              </div>
              {/* SVG Sparkline */}
              <svg viewBox="0 0 100 20" className="w-full h-8 overflow-visible mt-1">
                <path
                  d="M0,15 Q15,5 30,12 T60,5 T90,2 T100,2"
                  fill="none"
                  className="stroke-accent stroke-2"
                  strokeLinecap="round"
                />
                <circle cx="100" cy="2" r="2.5" className="fill-accent" />
              </svg>
            </div>
          </motion.div>
        </div>

      </Container>
    </section>
  );
}

export default BecomeTutor;
