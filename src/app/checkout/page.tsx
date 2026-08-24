import React, { Suspense } from "react";
import { CheckoutClient } from "./CheckoutClient";
import { PageWrapper } from "../../components/layout/PageWrapper";
import { Loader2 } from "lucide-react";

export const dynamic = "force-dynamic";

interface CheckoutPageProps {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const resolvedSearchParams = await searchParams;
  const tutorId = resolvedSearchParams.tutorId || "";
  const courseId = resolvedSearchParams.courseId || "";
  const planId = resolvedSearchParams.planId || "Complete Course";
  const batchId = resolvedSearchParams.batchId || "Morning Batch";
  const rawAmount = resolvedSearchParams.amount;
  const amount = rawAmount ? Number(rawAmount) : null;
  const platform = resolvedSearchParams.platform || "Google Meet";
  const coupon = resolvedSearchParams.coupon || "";

  return (
    <PageWrapper>
      <Suspense fallback={
        <div className="py-24 flex flex-col items-center justify-center gap-2">
          <Loader2 className="animate-spin text-primary" size={32} />
          <span className="text-xs text-muted-foreground font-bold">Loading secure session...</span>
        </div>
      }>
        <CheckoutClient
          tutorId={tutorId}
          courseId={courseId}
          planId={planId}
          batchId={batchId}
          amount={amount}
          platform={platform}
          coupon={coupon}
        />
      </Suspense>
    </PageWrapper>
  );
}
