"use client";

import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../../hooks/useAuth";
import { ChevronUp, RefreshCw, Terminal, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "../../utils/cn";
import { createClient } from "../../lib/supabase";

// Module-level helper functions to satisfy strict react-hooks/immutability rules
function performSwitch(redirect: string, mockUser: any) {
  if (typeof document !== "undefined") {
    document.cookie = "eduearn-bypass-session=1; path=/; max-age=86400; SameSite=Lax";
  }
  if (typeof window !== "undefined") {
    localStorage.setItem(
      "eduearn_mock_session",
      JSON.stringify({ user: mockUser, isAuthenticated: true })
    );
    window.location.href = redirect;
  }
}

function performReload() {
  if (typeof window !== "undefined") {
    window.location.reload();
  }
}

function getSafeSupabase() {
  try {
    return createClient();
  } catch {
    return null;
  }
}

/**
 * Dev-only: ensure a pre-confirmed Supabase user exists via the /api/dev/auth
 * admin route (never triggers email verification), then sign in with password.
 * Returns the authenticated user data or throws.
 */
async function devSignIn(
  email: string,
  password: string,
  fullName: string,
  role: string
) {
  const supabase = getSafeSupabase();
  if (!supabase) throw new Error("Supabase client unavailable.");

  // Step 1 — try sign in directly (user may already exist)
  const { data: signInData, error: signInError } =
    await supabase.auth.signInWithPassword({ email, password });

  if (!signInError && signInData?.user) {
    return { supabase, data: signInData };
  }

  // Step 2 — user doesn't exist; create via admin-only dev route (no email)
  const res = await fetch("/api/dev/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, fullName, role }),
  });
  const json = await res.json();
  if (!json.success) {
    throw new Error(json.error || "Dev user provision failed");
  }

  // Step 3 — sign in now that the account is confirmed
  const { data: signInData2, error: signInError2 } =
    await supabase.auth.signInWithPassword({ email, password });
  if (signInError2 || !signInData2?.user) {
    throw new Error(signInError2?.message || "Sign-in after account creation failed");
  }
  return { supabase, data: signInData2 };
}

export function DevBadge() {
  const { user, isAuthenticated } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const isDevMode = process.env.NEXT_PUBLIC_DEV_MODE === "true";

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen]);

  if (!mounted) {
    return null;
  }

  // Hide entirely if Dev Mode is not active
  if (!isDevMode) {
    return null;
  }

  const roleConfigs = {
    student: {
      label: "Student",
      badgeClass: "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400",
      dotClass: "bg-blue-500",
      redirect: "/student/dashboard",
      mockUser: {
        id: "dev-student",
        email: "student@eduearn.com",
        fullName: "Student Demo",
        role: "student" as const,
        complete: true,
        avatarUrl: undefined,
        bio: "Mock student profile context.",
      }
    },
    tutor: {
      label: "Tutor",
      badgeClass: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      dotClass: "bg-emerald-500",
      redirect: "/tutor/dashboard",
      mockUser: {
        id: "dev-tutor",
        email: "tutor@eduearn.com",
        fullName: "Tutor Demo",
        role: "tutor" as const,
        complete: true,
        avatarUrl: undefined,
        bio: "Mock tutor studio context.",
      }
    },
    admin: {
      label: "Admin",
      badgeClass: "border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400",
      dotClass: "bg-purple-500",
      redirect: "/admin/dashboard",
      mockUser: {
        id: "dev-admin",
        email: "admin@eduearn.com",
        fullName: "Admin Demo",
        role: "admin" as const,
        complete: true,
        avatarUrl: undefined,
        bio: "Mock administration context.",
      }
    }
  };

  const handleBecomeTutor = async () => {
    const email = "dev-tutor@eduearn.com";
    const password = "Password123!";
    const fullName = "Tutor Demo";
    const role = "tutor";

    toast.loading("Setting up Development Tutor Session...", { id: "dev-auth" });
    try {
      const { supabase, data } = await devSignIn(email, password, fullName, role);

      // Force metadata: complete=false so onboarding starts from step 1
      await supabase.auth.updateUser({
        data: { complete: false, role: "tutor", fullName, full_name: fullName }
      });
      await supabase.from("profiles").upsert({
        id: data.user!.id,
        email,
        full_name: fullName,
        role: "tutor",
        updated_at: new Date().toISOString()
      });
      await supabase.auth.refreshSession();
      localStorage.removeItem("tutor_onboarding_state");

      const mockUser = { id: data.user!.id, email, fullName, role: "tutor" as const, complete: false };
      useAuth.setState({ user: mockUser, isAuthenticated: true, isLoading: false });

      toast.success("Development Tutor Session initialized! Starting Onboarding.", { id: "dev-auth" });
      setIsOpen(false);
      window.location.href = "/tutor/onboarding";
    } catch (err: any) {
      toast.error("Dev Tutor login failed: " + (err?.message || "Unknown error"), { id: "dev-auth" });
    }
  };

  const handleBecomeStudent = async () => {
    const email = "dev-student@eduearn.com";
    const password = "Password123!";
    const fullName = "Student Demo";
    const role = "student";

    toast.loading("Setting up Development Student Session...", { id: "dev-auth" });
    try {
      const { supabase, data } = await devSignIn(email, password, fullName, role);

      await supabase.auth.updateUser({
        data: { complete: true, role: "student", fullName, full_name: fullName }
      });
      await supabase.from("profiles").upsert({
        id: data.user!.id,
        email,
        full_name: fullName,
        role: "student",
        updated_at: new Date().toISOString()
      });
      await supabase.auth.refreshSession();

      const mockUser = { id: data.user!.id, email, fullName, role: "student" as const, complete: true };
      useAuth.setState({ user: mockUser, isAuthenticated: true, isLoading: false });

      toast.success("Development Student Session initialized!", { id: "dev-auth" });
      setIsOpen(false);
      window.location.href = "/student/dashboard";
    } catch (err: any) {
      toast.error("Dev Student login failed: " + (err?.message || "Unknown error"), { id: "dev-auth" });
    }
  };

  const handleBecomeAdmin = async () => {
    const email = "dev-admin@eduearn.com";
    const password = "Password123!";
    const fullName = "Admin Demo";
    const role = "admin";

    toast.loading("Setting up Development Admin Session...", { id: "dev-auth" });
    try {
      const { supabase, data } = await devSignIn(email, password, fullName, role);

      await supabase.auth.updateUser({
        data: { complete: true, role: "admin", fullName, full_name: fullName }
      });
      await supabase.from("profiles").upsert({
        id: data.user!.id,
        email,
        full_name: fullName,
        role: "admin",
        updated_at: new Date().toISOString()
      });
      await supabase.auth.refreshSession();

      const mockUser = { id: data.user!.id, email, fullName, role: "admin" as const, complete: true };
      useAuth.setState({ user: mockUser, isAuthenticated: true, isLoading: false });

      toast.success("Development Admin Session initialized!", { id: "dev-auth" });
      setIsOpen(false);
      window.location.href = "/admin/dashboard";
    } catch (err: any) {
      toast.error("Dev Admin login failed: " + (err?.message || "Unknown error"), { id: "dev-auth" });
    }
  };

  const handleSwitchRole = (roleKey: "student" | "tutor" | "admin") => {
    const config = roleConfigs[roleKey];
    useAuth.setState({ user: config.mockUser, isAuthenticated: true, isLoading: false });
    toast.success(`Switched role to ${config.label}! Redirecting...`);
    setIsOpen(false);
    performSwitch(config.redirect, config.mockUser);
  };

  const currentConfig = (user?.role && roleConfigs[user.role as keyof typeof roleConfigs]) || {
    label: "Dev Mode",
    badgeClass: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
    dotClass: "bg-amber-500"
  };

  return (
    <div className="fixed bottom-4 right-4 z-[99999] select-none text-left" ref={menuRef}>
      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute bottom-12 right-0 w-52 rounded-2xl bg-card/95 border border-border shadow-floating backdrop-blur-md p-3.5 space-y-3 animate-fadeIn duration-200">
          <div className="border-b border-border/40 pb-2">
            <span className="text-[8px] uppercase tracking-wider font-extrabold text-muted-foreground/80 block">
              Development Options
            </span>
          </div>
          <div className="flex flex-col gap-1.5">
            <button
              type="button"
              onClick={handleBecomeTutor}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-[10.5px] font-bold border border-transparent hover:bg-muted text-foreground cursor-pointer transition-all text-left bg-transparent"
            >
              <div className="flex items-center gap-2">
                <Sparkles size={11} className="text-amber-500 animate-pulse" />
                <span>Become Tutor</span>
              </div>
            </button>
            <button
              type="button"
              onClick={handleBecomeStudent}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-[10.5px] font-bold border border-transparent hover:bg-muted text-foreground cursor-pointer transition-all text-left bg-transparent"
            >
              <div className="flex items-center gap-2">
                <Sparkles size={11} className="text-blue-500" />
                <span>Become Student</span>
              </div>
            </button>
            <button
              type="button"
              onClick={handleBecomeAdmin}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-[10.5px] font-bold border border-transparent hover:bg-muted text-foreground cursor-pointer transition-all text-left bg-transparent"
            >
              <div className="flex items-center gap-2">
                <Sparkles size={11} className="text-purple-500" />
                <span>Development Admin</span>
              </div>
            </button>
          </div>

          {isAuthenticated && user && (
            <>
              <div className="border-t border-border/40 pt-2 pb-1">
                <span className="text-[8px] uppercase tracking-wider font-extrabold text-muted-foreground/80 block">
                  Quick Switch Role
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                {(["student", "tutor", "admin"] as const).map((roleKey) => {
                  const cfg = roleConfigs[roleKey];
                  const isSelected = user.role === roleKey;
                  return (
                    <button
                      key={roleKey}
                      type="button"
                      onClick={() => handleSwitchRole(roleKey)}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 rounded-lg text-[10.5px] font-bold border transition-all cursor-pointer bg-transparent",
                        isSelected
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-transparent hover:bg-muted text-foreground"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span className={cn("w-1.5 h-1.5 rounded-full", cfg.dotClass)} />
                        <span>{cfg.label}</span>
                      </div>
                      {isSelected && <span className="text-[8px] uppercase font-black tracking-widest text-primary">Active</span>}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          <div className="border-t border-border/40 pt-2.5 flex flex-col gap-1">
            {isAuthenticated && (
              <button
                type="button"
                onClick={() => {
                  toast.success("Dashboard reloaded.");
                  performReload();
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-foreground hover:bg-muted rounded-md text-[10px] font-bold text-left cursor-pointer transition-colors border-none bg-transparent"
              >
                <RefreshCw size={11} className="text-muted-foreground" />
                Reload Dashboard
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                router.push("/dev");
              }}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-foreground hover:bg-muted rounded-md text-[10px] font-bold text-left cursor-pointer transition-colors border-none bg-transparent"
            >
              <Terminal size={11} className="text-muted-foreground" />
              Open Dev Launcher
            </button>
          </div>
        </div>
      )}

      {/* Main Trigger Badge Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2.5 px-3 py-1.5 rounded-full border shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer focus:outline-none",
          currentConfig.badgeClass
        )}
      >
        <span className="relative flex h-2 w-2">
          <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", currentConfig.dotClass)} />
          <span className={cn("relative inline-flex rounded-full h-2 w-2", currentConfig.dotClass)} />
        </span>
        <div className="flex flex-col leading-none">
          <span className="text-[7.5px] uppercase font-extrabold tracking-widest text-muted-foreground/80">Dev Mode</span>
          <span className="text-[10px] font-black mt-0.5">{currentConfig.label}</span>
        </div>
        <ChevronUp size={11} className={cn("text-muted-foreground transition-transform duration-200", isOpen ? "rotate-180" : "")} />
      </button>
    </div>
  );
}
export default DevBadge;
