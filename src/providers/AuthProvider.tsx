"use client";

import React, { useEffect } from "react";
import { useAuth } from "../hooks/useAuth";

/**
 * AuthProvider
 *
 * Runs `initialize()` once on mount to restore the Supabase session from
 * cookies / localStorage and subscribe to auth state changes.
 *
 * Children are rendered immediately — guards inside individual pages or
 * the proxy handle redirects. We never block the whole tree because the
 * session is restored almost synchronously from localStorage by Supabase.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initialize = useAuth((state) => state.initialize);

  useEffect(() => {
    void initialize();
    // initialize is stable (Zustand action ref never changes)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{children}</>;
}
