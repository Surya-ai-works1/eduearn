"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../../../hooks/useAuth";
import { Loader2 } from "lucide-react";

interface RouteGuardProps {
  children: React.ReactNode;
}

/**
 * RequireAuth Guard
 *
 * Ensures that the user is logged in.
 * If not authenticated, redirects to /login with a redirect query param.
 * If onboarding is incomplete, redirects to the correct onboarding step.
 */
export function RequireAuth({ children }: RouteGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    // Redirect incomplete profiles to onboarding steps
    if (user) {
      if (!user.role) {
        router.replace("/choose-role");
      } else if (!user.complete) {
        router.replace("/complete-profile");
      }
    }
  }, [isLoading, isAuthenticated, user, pathname, router]);

  if (isLoading || !isAuthenticated || (user && (!user.role || !user.complete))) {
    return (
      <div className="flex min-h-[70vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}

/**
 * RequireLearner Guard
 *
 * Ensures that the user is authenticated and has either 'learner' or 'admin' role.
 * Otherwise, redirects to /forbidden.
 */
export function RequireLearner({ children }: RouteGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (user && user.role !== "student" && user.role !== "admin") {
      router.replace("/forbidden");
    }
  }, [isLoading, isAuthenticated, user, router]);

  if (isLoading || !isAuthenticated || (user && user.role !== "student" && user.role !== "admin")) {
    return (
      <div className="flex min-h-[70vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}

/**
 * RequireTutor Guard
 *
 * Ensures that the user is authenticated and has either 'tutor' or 'admin' role.
 * Otherwise, redirects to /forbidden.
 */
export function RequireTutor({ children }: RouteGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (user && user.role !== "tutor" && user.role !== "admin") {
      router.replace("/forbidden");
    }
  }, [isLoading, isAuthenticated, user, router]);

  if (isLoading || !isAuthenticated || (user && user.role !== "tutor" && user.role !== "admin")) {
    return (
      <div className="flex min-h-[70vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}

/**
 * RequireAdmin Guard
 *
 * Ensures that the user is authenticated and has the 'admin' role.
 * Otherwise, redirects to /forbidden.
 */
export function RequireAdmin({ children }: RouteGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (user && user.role !== "admin") {
      router.replace("/forbidden");
    }
  }, [isLoading, isAuthenticated, user, router]);

  if (isLoading || !isAuthenticated || (user && user.role !== "admin")) {
    return (
      <div className="flex min-h-[70vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
