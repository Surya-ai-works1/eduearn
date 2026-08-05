"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../../../hooks/useAuth";
import { Loader2 } from "lucide-react";
import { resolveRouteDecision, getPermissionsCountForRole } from "../../../utils/rbacResolver";

interface RouteGuardProps {
  children: React.ReactNode;
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
