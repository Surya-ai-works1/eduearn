"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/dashboard?tab=dashboard");
  }, [router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center text-xs text-muted-foreground font-semibold animate-pulse">
      Loading admin dashboard...
    </div>
  );
}
