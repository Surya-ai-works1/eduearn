"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminAnalyticsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/dashboard?tab=analytics");
  }, [router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center text-xs text-muted-foreground font-semibold animate-pulse">
      Loading admin analytics...
    </div>
  );
}
