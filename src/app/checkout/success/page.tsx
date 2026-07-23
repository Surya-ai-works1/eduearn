"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Container } from "../../../components/layout/Container";
import { PageWrapper } from "../../../components/layout/PageWrapper";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Divider } from "../../../components/ui/divider";
import { toast } from "sonner";
import { 
  CheckCircle, 
  ArrowRight, 
  Printer, 
  Calendar, 
  Video,
  Award,
  ArrowLeft
} from "lucide-react";
import { MOCK_COURSES, MOCK_TUTORS } from "../../../constants/mockData";

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [transactionId] = useState(() => "TX-EE-" + (Math.random() * 1000000).toFixed(0));

  const tutorId = searchParams.get("tutorId");
  const courseId = searchParams.get("courseId");
  const planId = searchParams.get("planId") || "Complete Course";
  const batchId = searchParams.get("batchId") || "Morning Batch";
  const rawAmount = searchParams.get("amount");
  const platform = searchParams.get("platform") || "Google Meet";

  const tutor = MOCK_TUTORS.find(t => t.id === tutorId) || MOCK_TUTORS[0];
  const course = MOCK_COURSES.find(c => c.id === courseId) || MOCK_COURSES[0];

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <Container className="py-16 select-none max-w-2xl text-center">
      <div className="flex flex-col items-center gap-6">
        {/* Animated Checkmark Badge */}
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center animate-bounce shadow-soft">
          <CheckCircle size={36} />
        </div>

        <div className="space-y-1">
          <span className="text-[10px] uppercase font-heading font-extrabold tracking-widest text-emerald-600">
            Payment Confirmed
          </span>
          <h2 className="text-xl md:text-2xl font-heading font-extrabold text-foreground">
            Enrollment Successful!
          </h2>
          <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
            Congratulations! You are officially registered in the course. The class files and link have been configured.
          </p>
        </div>

        {/* Invoice Summary Card */}
        <Card variant="glass" className="p-6 border-border/60 bg-card/60 w-full text-left space-y-4 shadow-premium mt-2">
          <div className="flex justify-between items-center pb-2 border-b border-border/40">
            <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-black">Transaction ID</span>
            <span className="text-xs font-mono font-bold text-foreground">{transactionId}</span>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-start gap-4">
              <span className="text-xs font-bold text-muted-foreground shrink-0">Course Name</span>
              <span className="text-xs font-extrabold text-foreground text-right">{course?.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs font-bold text-muted-foreground">Tutor</span>
              <span className="text-xs font-bold text-foreground">{tutor?.fullName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs font-bold text-muted-foreground">Learning Plan</span>
              <span className="text-xs font-bold text-primary">{planId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs font-bold text-muted-foreground">Batch Schedule</span>
              <span className="text-xs font-bold text-foreground">{batchId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs font-bold text-muted-foreground">Virtual Classroom</span>
              <span className="text-xs font-bold text-foreground flex items-center gap-1">
                <Video size={12} className="text-sky-500" /> {platform}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs font-bold text-muted-foreground">Amount Paid</span>
              <span className="text-xs font-black text-foreground">₹{rawAmount || "4,999"}</span>
            </div>
          </div>

          <Divider />

          {/* Quick Schedule Tips */}
          <div className="p-3 bg-primary/5 border border-primary/10 rounded-lg text-[10px] text-white/90 leading-normal space-y-1.5 font-semibold">
            <span className="font-bold text-foreground block">📅 What happens next?</span>
            <p>1. Open your **Student Dashboard** to access lectures, notes, and task lists.</p>
            <p>2. Your live batch classes will start on Monday. The Google Meet/Zoom link will be active 10 minutes prior.</p>
            <p>3. Check your email for a detailed PDF invoice copy.</p>
          </div>
        </Card>

        {/* Action Triggers */}
        <div className="flex flex-wrap justify-center items-center gap-3 w-full mt-4">
          <Button variant="outline" size="sm" onClick={handlePrint} className="h-10 text-xs font-bold gap-1.5">
            <Printer size={13} /> Print Invoice
          </Button>

          <Link href="/student/dashboard" className="grow sm:grow-0">
            <Button size="sm" className="h-10 text-xs font-bold gap-1.5 w-full">
              Go to Student Dashboard <ArrowRight size={13} />
            </Button>
          </Link>
        </div>

        <Link href={`/tutors/${tutor?.id}`} className="text-xs font-bold text-muted-foreground hover:text-foreground mt-4 transition-colors">
          View Tutor Profile
        </Link>
      </div>
    </Container>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <PageWrapper>
      <Suspense fallback={
        <div className="py-24 flex flex-col items-center justify-center gap-2">
          <span className="text-xs text-muted-foreground font-bold animate-pulse">Loading transaction results...</span>
        </div>
      }>
        <CheckoutSuccessContent />
      </Suspense>
    </PageWrapper>
  );
}
