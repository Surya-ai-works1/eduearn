"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "../../hooks/useAuth";
import { PublicHeader } from "./PublicHeader";
import { TutorHeader } from "./TutorHeader";
import { StudentHeader } from "./StudentHeader";
import { AdminOSNavbar } from "./AdminOSNavbar";

export function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();

  // Exclude Admin dashboard routes as it uses its own dedicated shell (DashboardLayout/AdminShell)
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  // Exclude onboarding sub-flows
  if (pathname?.startsWith("/tutor/onboarding") || pathname?.startsWith("/complete-profile")) {
    return null;
  }

  if (isAuthenticated && user) {
    if (user.role === "admin" || user.role === "super-admin") {
      return <AdminOSNavbar />;
    }

    if (user.role === "tutor" && pathname?.startsWith("/tutor")) {
      return <TutorHeader />;
    }

    const isStudentDashboard =
      pathname?.startsWith("/student") ||
      pathname?.startsWith("/learn");

    if (isStudentDashboard) {
      return <StudentHeader />;
    }
  }

  // Fallback to Public Marketplace Header for public routes (/, /courses, /tutors, etc.)
  return <PublicHeader />;
}
