import React, { Suspense } from "react";
import { CheckoutSuccessClient } from "./CheckoutSuccessClient";
import { PageWrapper } from "../../../components/layout/PageWrapper";

export const dynamic = "force-dynamic";

interface SuccessPageProps {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function CheckoutSuccessPage({ searchParams }: SuccessPageProps) {
  const resolvedSearchParams = await searchParams;
  const tutorId = resolvedSearchParams.tutorId || "";
  const courseId = resolvedSearchParams.courseId || "";
  const planId = resolvedSearchParams.planId || "Complete Course";
  const batchId = resolvedSearchParams.batchId || "Morning Batch";
  const amount = resolvedSearchParams.amount || "4,999";
  const platform = resolvedSearchParams.platform || "Google Meet";

  return (
    <PageWrapper>
      <Suspense fallback={
        <div className="py-24 flex flex-col items-center justify-center gap-2">
          <span className="text-xs text-muted-foreground font-bold animate-pulse">Loading transaction results...</span>
        </div>
      }>
        <CheckoutSuccessClient
          tutorId={tutorId}
          courseId={courseId}
          planId={planId}
          batchId={batchId}
          amount={amount}
          platform={platform}
        />
      </Suspense>
    </PageWrapper>
  );
}
