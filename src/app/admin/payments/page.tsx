"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminPaymentsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/dashboard?tab=payments");
  }, [router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center text-xs text-muted-foreground font-semibold animate-pulse">
      Loading admin payments directory...
    </div>
  );
}
