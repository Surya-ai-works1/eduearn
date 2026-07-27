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
        if (user.role === "tutor") {
          router.replace("/tutor/onboarding");
        } else {
          router.replace("/complete-profile");
        }
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
 * Ensures that the user is authenticated and has either 'student', 'learner', or 'admin' role.
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
 * Also enforces onboarding completion — an incomplete tutor is redirected to /tutor/onboarding.
 * Unauthenticated users are sent to /tutor/login (not the student /login page).
 */
export function RequireTutor({ children }: RouteGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [checkingStatus, setCheckingStatus] = React.useState(true);
  const [appStatus, setAppStatus] = React.useState<string | null>(null);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace("/tutor/login");
      return;
    }

    if (user) {
      if (user.role !== "tutor" && user.role !== "admin") {
        router.replace("/forbidden");
        return;
      }
      // Tutors must complete onboarding before accessing the dashboard
      if (user.role === "tutor" && !user.complete) {
        router.replace("/tutor/onboarding");
        return;
      }

      if (user.role === "tutor") {
        fetch("/api/tutor/application-status")
          .then((res) => {
            if (res.ok) return res.json();
            throw new Error("Failed to fetch application status");
          })
          .then((data) => {
            setAppStatus(data.status);
            setCheckingStatus(false);
            if (data.status !== "Approved") {
              router.replace("/tutor/application-status");
            }
          })
          .catch((err) => {
            console.error("Error in RequireTutor status check:", err);
            setCheckingStatus(false);
            router.replace("/tutor/application-status");
          });
      } else {
        setCheckingStatus(false);
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  const isBlocked =
    !isAuthenticated ||
    (user && user.role !== "tutor" && user.role !== "admin") ||
    (user && user.role === "tutor" && !user.complete) ||
    (user && user.role === "tutor" && appStatus !== "Approved" && !checkingStatus);

  if (isLoading || checkingStatus || isBlocked) {
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
