"use client";

import React, { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

function RedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const email = searchParams.get("email") || "";
    router.replace(`/verify-otp?email=${encodeURIComponent(email)}`);
  }, [router, searchParams]);

  return (
    <div className="py-24 flex flex-col items-center justify-center gap-2 min-h-[80vh]">
      <Loader2 className="animate-spin text-primary" size={32} />
      <span className="text-xs text-muted-foreground font-bold">Redirecting to OTP verification...</span>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="py-24 flex flex-col items-center justify-center gap-2 min-h-[80vh]">
        <Loader2 className="animate-spin text-primary" size={32} />
        <span className="text-xs text-muted-foreground font-bold">Loading...</span>
      </div>
    }>
      <RedirectContent />
    </Suspense>
  );
}
