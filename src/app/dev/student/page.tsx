"use client";

import React, { useEffect } from "react";
import { useRouter, notFound } from "next/navigation";
import { useAuth } from "../../../hooks/useAuth";
import { Loader2 } from "lucide-react";

export default function DevStudentPage() {
  const router = useRouter();
  const isDev = process.env.NODE_ENV === "development";

  useEffect(() => {
    if (!isDev) return;

    const injectMockSession = async () => {
      // Mock student session payload
      const mockUser = {
        id: "dev-student",
        email: "student@eduearn.com",
        fullName: "Student Demo",
        role: "student" as const,
        complete: true,
        avatarUrl: undefined,
        bio: "Mock student profile context.",
      };

      // Set cookies for middleware/auth initialize bypass
      document.cookie = "eduearn-bypass-session=1; path=/; max-age=86400; SameSite=Lax";
      
      // Update local storage so useAuth initialize preserves state
      localStorage.setItem(
        "eduearn_mock_session",
        JSON.stringify({ user: mockUser, isAuthenticated: true })
      );

      // Set Zustand store state directly
      useAuth.setState({ user: mockUser, isAuthenticated: true, isLoading: false });

      // Redirect immediately to student dashboard
      router.replace("/student/dashboard");
    };

    injectMockSession();
  }, [router, isDev]);

  if (!isDev) {
    return notFound();
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground text-center select-none">
      <div className="space-y-4">
        <Loader2 className="animate-spin h-8 w-8 text-primary mx-auto" />
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest animate-pulse">
          Injecting Student Preview Session...
        </p>
      </div>
    </div>
  );
}
