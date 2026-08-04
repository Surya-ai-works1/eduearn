"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TutorRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/tutor/dashboard");
  }, [router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center text-xs text-muted-foreground font-semibold animate-pulse">
      Redirecting to Tutor Dashboard...
    </div>
  );
}
