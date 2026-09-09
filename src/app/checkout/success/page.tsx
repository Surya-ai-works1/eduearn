import React, { Suspense } from "react";
import { CheckoutSuccessClient } from "./CheckoutSuccessClient";
import { PageWrapper } from "../../../components/layout/PageWrapper";

export const dynamic = "force-dynamic";

interface SuccessPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CheckoutSuccessPage({ searchParams }: SuccessPageProps) {
  const resolvedSearchParams = await (searchParams ?? Promise.resolve({}));

  const tutorId = typeof resolvedSearchParams.tutorId === "string"
    ? resolvedSearchParams.tutorId
    : Array.isArray(resolvedSearchParams.tutorId)
    ? resolvedSearchParams.tutorId[0] || ""
    : "";

  const courseId = typeof resolvedSearchParams.courseId === "string"
    ? resolvedSearchParams.courseId
    : Array.isArray(resolvedSearchParams.courseId)
    ? resolvedSearchParams.courseId[0] || ""
    : "";

  const planId = typeof resolvedSearchParams.planId === "string"
    ? resolvedSearchParams.planId
    : Array.isArray(resolvedSearchParams.planId)
    ? resolvedSearchParams.planId[0] || "Complete Course"
    : "Complete Course";

  const batchId = typeof resolvedSearchParams.batchId === "string"
    ? resolvedSearchParams.batchId
    : Array.isArray(resolvedSearchParams.batchId)
    ? resolvedSearchParams.batchId[0] || "Morning Batch"
    : "Morning Batch";

  const rawAmount = resolvedSearchParams.amount;
  const amount = typeof rawAmount === "string"
    ? rawAmount
    : Array.isArray(rawAmount)
    ? rawAmount[0] || "950"
    : "950";

  const platform = typeof resolvedSearchParams.platform === "string"
    ? resolvedSearchParams.platform
    : Array.isArray(resolvedSearchParams.platform)
    ? resolvedSearchParams.platform[0] || "Google Meet"
    : "Google Meet";

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
