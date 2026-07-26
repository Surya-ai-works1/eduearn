"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminTutorsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/dashboard?tab=tutors");
  }, [router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center text-xs text-muted-foreground font-semibold animate-pulse">
      Loading admin tutors directory...
    </div>
  );
}
