"use client";

import React, { use, useEffect, useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { LiveClassroom } from "../../../features/classroom/components/LiveClassroom";
import { Spinner } from "../../../components/ui/spinner";
import { createClient } from "../../../lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ClassroomPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;
  const { user, isLoading, initialize } = useAuth();
  const router = useRouter();

  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  // Initialize auth store if not done
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Server-side database authorization check
  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      toast.error("Please log in to join the live classroom.");
      router.push(`/login?redirect=/classroom/${id}`);
      return;
    }

    const checkAuthorization = async () => {
      try {
        const supabase = createClient();
        if (!supabase) {
          toast.error("Database connection unavailable. Classroom access denied.");
          setIsAuthorized(false);
          router.push(`/courses/${id}`);
          return;
        }

        // Tutors and Admins get automatic teaching access
        if (user.role === "tutor" || user.role === "admin") {
          setIsAuthorized(true);
          return;
        }

        // Check authoritative enrollments table
        const { data: enrollment, error } = await supabase
          .from("enrollments")
          .select("id")
          .eq("learner_id", user.id)
          .eq("course_id", id)
          .maybeSingle();

        if (error || !enrollment) {
          toast.error("Unauthorized: You must be enrolled in this course to join the live classroom.");
          setIsAuthorized(false);
          router.push(`/courses/${id}`);
          return;
        }

        setIsAuthorized(true);
      } catch (err) {
        console.error("Classroom authorization check failed:", err);
        toast.error("Authorization check failed. Access denied.");
        setIsAuthorized(false);
        router.push(`/courses/${id}`);
      }
    };

    checkAuthorization();
  }, [user, isLoading, id, router]);

  if (isLoading || isAuthorized === null) {
    return (
      <div className="h-screen w-screen bg-background flex flex-col items-center justify-center gap-4 text-foreground select-none">
        <Spinner size="lg" className="text-blue-500" />
        <p className="text-xs text-muted-foreground font-medium">Verifying Live Classroom Access Authorization...</p>
      </div>
    );
  }

  if (isAuthorized === false) {
    return null;
  }

  const userName = user?.fullName || "Learner";
  const isTutor = user?.role === "tutor";

  const sessionInit = {
    id,
    title: isTutor 
      ? "Interactive LIVE Session: Course Doubts & Lab" 
      : "LIVE Class: Interactive Peer Learning",
    tutorName: isTutor ? userName : "Verified Peer Tutor",
    isTutor,
    userName,
  };

  return <LiveClassroom sessionInit={sessionInit} />;
}
