"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../../../hooks/useAuth";
import { Loader2 } from "lucide-react";
import { resolveRouteDecision, getPermissionsCountForRole } from "../../../utils/rbacResolver";

interface RouteGuardProps {
  children: React.ReactNode;
}

function logGuardDecision(user: any, pathname: string, allowed: boolean, reason: string) {
  const isDev = process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_DEV_MODE === "true";
  if (!isDev) return;

  const userFullName = user?.fullName || "Guest User";
  const userRole = user?.role || "guest";
  const permCount = user?.role ? getPermissionsCountForRole(user.role as any) : 0;
  const lastRepair = localStorage.getItem("eduearn_last_repair_time") || "Never";

  console.log(`[Dev RouteGuard Log]
------------------------------------
Current User:      ${userFullName}
Current Role:      ${userRole}
Permission Count:  ${permCount}
Session Source:    LocalStorage (eduearn_session)
Route:             ${pathname}
Route Decision:    ${allowed ? "ALLOW" : "BLOCK"}
Reason:            ${reason}
Last Repair Time:  ${lastRepair}
------------------------------------`);
}

/**
 * RequireAuth Guard
 * Ensures that the user is logged in.
 */
export function RequireAuth({ children }: RouteGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    const decision = resolveRouteDecision(user?.role, pathname, user?.complete !== false);
    logGuardDecision(user, pathname, decision.allowed, decision.reason);

    if (!decision.allowed && decision.redirectPath) {
      router.replace(decision.redirectPath);
    }
  }, [isLoading, isAuthenticated, user, pathname, router]);

  const decision = resolveRouteDecision(user?.role, pathname, user?.complete !== false);
  if (isLoading || !decision.allowed) {
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
 * Ensures that the user has student/admin role.
 */
export function RequireLearner({ children }: RouteGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    const decision = resolveRouteDecision(user?.role, pathname, user?.complete !== false);
    logGuardDecision(user, pathname, decision.allowed, decision.reason);

    if (!decision.allowed && decision.redirectPath) {
      router.replace(decision.redirectPath);
    }
  }, [isLoading, isAuthenticated, user, pathname, router]);

  const decision = resolveRouteDecision(user?.role, pathname, user?.complete !== false);
  if (isLoading || !decision.allowed) {
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
 * Ensures that the user has tutor/admin role.
 */
export function RequireTutor({ children }: RouteGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace("/tutor/login");
      return;
    }

    const decision = resolveRouteDecision(user?.role, pathname, user?.complete !== false);
    logGuardDecision(user, pathname, decision.allowed, decision.reason);

    if (!decision.allowed && decision.redirectPath) {
      router.replace(decision.redirectPath);
    }
  }, [isLoading, isAuthenticated, user, pathname, router]);

  const decision = resolveRouteDecision(user?.role, pathname, user?.complete !== false);
  if (isLoading || !decision.allowed) {
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
 * Ensures that the user has admin/super-admin role.
 */
export function RequireAdmin({ children }: RouteGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    const decision = resolveRouteDecision(user?.role, pathname, user?.complete !== false);
    logGuardDecision(user, pathname, decision.allowed, decision.reason);

    if (!decision.allowed && decision.redirectPath) {
      router.replace(decision.redirectPath);
    }
  }, [isLoading, isAuthenticated, user, pathname, router]);

  const decision = resolveRouteDecision(user?.role, pathname, user?.complete !== false);
  if (isLoading || !decision.allowed) {
    return (
      <div className="flex min-h-[70vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
