import React, { Suspense } from "react";
import { CheckoutClient } from "./CheckoutClient";
import { PageWrapper } from "../../components/layout/PageWrapper";
import { Loader2 } from "lucide-react";
import { parseValidAmount, resolveCheckoutAmount } from "../../utils/checkoutAmountResolver";

export const dynamic = "force-dynamic";

interface CheckoutPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
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
  const parsedAmount = parseValidAmount(rawAmount);
  const finalAmount = resolveCheckoutAmount(parsedAmount, courseId);

  const platform = typeof resolvedSearchParams.platform === "string"
    ? resolvedSearchParams.platform
    : Array.isArray(resolvedSearchParams.platform)
    ? resolvedSearchParams.platform[0] || "Google Meet"
    : "Google Meet";

  const coupon = typeof resolvedSearchParams.coupon === "string"
    ? resolvedSearchParams.coupon
    : Array.isArray(resolvedSearchParams.coupon)
    ? resolvedSearchParams.coupon[0] || ""
    : "";

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
          amount={finalAmount}
          platform={platform}
          coupon={coupon}
        />
      </Suspense>
    </PageWrapper>
  );
}
