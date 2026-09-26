"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Loader2 } from "lucide-react";

/**
 * Legacy Learn Page Route
 * Redirects legacy bookmarks/links to the canonical database-backed classroom workspace.
 */
export default function LegacyCourseLearnPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params?.id as string;

  useEffect(() => {
    if (courseId) {
      router.replace(`/student/course/${courseId}/lesson/default`);
    } else {
      router.replace("/student/dashboard");
    }
  }, [courseId, router]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3 text-muted-foreground select-none">
      <Loader2 size={32} className="animate-spin text-primary" />
      <span className="text-xs font-mono uppercase tracking-wider">Redirecting to Interactive Classroom...</span>
    </div>
  );
}
