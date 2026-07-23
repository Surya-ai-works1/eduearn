"use client";

import React, { use, useEffect } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { LiveClassroom } from "../../../features/classroom/components/LiveClassroom";
import { Spinner } from "../../../components/ui/spinner";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ClassroomPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;
  const { user, isLoading, initialize } = useAuth();

  // Initialize auth store if not done
  useEffect(() => {
    initialize();
  }, [initialize]);

  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-background flex flex-col items-center justify-center gap-4 text-foreground select-none">
        <Spinner size="lg" className="text-blue-500" />
        <p className="text-xs text-muted-foreground font-medium">Entering Live Classroom...</p>
      </div>
    );
  }

  // Get user details or fallback to mock testers (e.g. if Supabase is unconfigured)
  const userName = user?.fullName || "Test Learner";
  const isTutor = user?.role === "tutor";

  const sessionInit = {
    id,
    title: isTutor 
      ? "Interactive Q&A Session: Linear Algebra Doubts" 
      : "UI/UX Figma Design: Layouts & Grids Essentials",
    tutorName: isTutor ? userName : "Ananya Iyer (Tutor)",
    isTutor,
    userName,
  };

  return <LiveClassroom sessionInit={sessionInit} />;
}
