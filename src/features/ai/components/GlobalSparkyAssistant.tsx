"use client";

import React, { useMemo } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "../../../hooks/useAuth";
import { AiChatWidget } from "./AiChatWidget";

export function GlobalSparkyAssistant() {
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuth();

  const shouldShow = useMemo(() => {
    if (!isAuthenticated || !user) return false;
    if (!pathname) return false;

    // Blacklisted paths where Sparky should NOT appear
    const isBlacklisted =
      pathname.startsWith("/login") ||
      pathname.startsWith("/register") ||
      pathname.startsWith("/forgot-password") ||
      pathname.startsWith("/reset-password") ||
      pathname.startsWith("/auth") ||
      pathname.startsWith("/welcome") ||
      pathname.startsWith("/complete-profile") ||
      pathname.startsWith("/choose-role") ||
      pathname.startsWith("/verify-email") ||
      pathname.startsWith("/verify-otp") ||
      pathname.startsWith("/verify");

    return !isBlacklisted;
  }, [pathname, isAuthenticated, user]);

  if (!shouldShow) return null;

  return <AiChatWidget />;
}

export default GlobalSparkyAssistant;
