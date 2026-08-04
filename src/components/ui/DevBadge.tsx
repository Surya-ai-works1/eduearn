"use client";

import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../../hooks/useAuth";
import { ChevronUp, RefreshCw, Terminal, Sparkles, Shield, Info, Database } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { cn } from "../../utils/cn";
import { createClient } from "../../lib/supabase";
import { repairSessionInDev } from "../../utils/sessionRepair";
import { getPermissionsCountForRole, resolveRouteDecision, CanonicalRole } from "../../utils/rbacResolver";

// Module-level helper functions to satisfy strict rules
function performSwitch(redirect: string, mockUser: any) {
  if (typeof document !== "undefined") {
    document.cookie = "eduearn-bypass-session=1; path=/; max-age=86400; SameSite=Lax";
  }
  if (typeof window !== "undefined") {
    localStorage.setItem(
      "eduearn_session",
      JSON.stringify({ user: mockUser, isAuthenticated: true })
    );
    // Trigger repair immediately to clean up other keys
    repairSessionInDev();
    window.location.href = redirect;
  }
}

function performReload() {
  if (typeof window !== "undefined") {
    window.location.reload();
  }
}

export function DevBadge() {
  const { user, isAuthenticated } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
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

  const roleConfigs: Record<CanonicalRole, {
    label: string;
    badgeClass: string;
    dotClass: string;
    redirect: string;
    mockUser: any;
  }> = {
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
        bio: "Mock administration context.",
      }
    },
    "super-admin": {
      label: "Super Admin",
      badgeClass: "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400",
      dotClass: "bg-rose-500",
      redirect: "/admin/dashboard",
      mockUser: {
        id: "dev-super-admin",
        email: "superadmin@eduearn.com",
        fullName: "Super Admin Demo",
        role: "super-admin" as const,
        complete: true,
        bio: "Mock root administrator context.",
      }
    },
    finance: {
      label: "Finance",
      badgeClass: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
      dotClass: "bg-amber-500",
      redirect: "/admin/dashboard",
      mockUser: {
        id: "dev-finance",
        email: "finance@eduearn.com",
        fullName: "Finance Demo",
        role: "finance" as const,
        complete: true,
        bio: "Mock finance billing context.",
      }
    },
    moderator: {
      label: "Moderator",
      badgeClass: "border-cyan-500/30 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
      dotClass: "bg-cyan-500",
      redirect: "/admin/dashboard",
      mockUser: {
        id: "dev-moderator",
        email: "moderator@eduearn.com",
        fullName: "Moderator Demo",
        role: "moderator" as const,
        complete: true,
        bio: "Mock content reviewer context.",
      }
    },
    support: {
      label: "Support Staff",
      badgeClass: "border-indigo-500/30 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
      dotClass: "bg-indigo-500",
      redirect: "/admin/dashboard",
      mockUser: {
        id: "dev-support",
        email: "support@eduearn.com",
        fullName: "Support Staff Demo",
        role: "support" as const,
        complete: true,
        bio: "Mock helpdesk support context.",
      }
    }
  };

  const handleSwitchRole = (roleKey: CanonicalRole) => {
    const config = roleConfigs[roleKey];
    useAuth.setState({ user: config.mockUser, isAuthenticated: true, isLoading: false });
    toast.success(`Switched role to ${config.label}! Redirecting...`);
    setIsOpen(false);
    performSwitch(config.redirect, config.mockUser);
  };

  const currentRoleCanonical = (user?.role || "student") as CanonicalRole;
  const currentConfig = roleConfigs[currentRoleCanonical] || {
    label: "Dev Mode",
    badgeClass: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
    dotClass: "bg-amber-500"
  };

  const permissionsCount = getPermissionsCountForRole(currentRoleCanonical);

  // Active dashboard description helper
  let activeDashboard = "Learner Center";
  if (currentRoleCanonical === "tutor") {
    activeDashboard = "Tutor Studio";
  } else if (["admin", "super-admin", "finance", "moderator", "support"].includes(currentRoleCanonical)) {
    activeDashboard = "Admin Console";
  }

  return (
    <div className="fixed bottom-4 right-4 z-[99999] select-none text-left flex flex-col items-end gap-2.5" ref={menuRef}>
      {/*Collapsible Debug Panel (Objective 8) */}
      {isOpen && showDebug && (() => {
        const decision = resolveRouteDecision(currentRoleCanonical, pathname, user?.complete !== false);
        const lastRepairTime = typeof window !== "undefined" ? (localStorage.getItem("eduearn_last_repair_time") || "Just now") : "Just now";
        return (
          <div className="w-80 rounded-2xl bg-card border border-border shadow-floating backdrop-blur-md p-4 space-y-3.5 select-none animate-fadeIn duration-200">
            <div className="flex justify-between items-center border-b border-border/40 pb-2">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-foreground flex items-center gap-1">
                <Shield size={12} className="text-primary" /> Dev Debug Panel
              </span>
              <button onClick={() => setShowDebug(false)} className="text-[9px] uppercase font-bold text-muted-foreground hover:text-foreground">
                Close Panel
              </button>
            </div>

            <div className="space-y-2 text-[10px] font-semibold text-muted-foreground">
              <div className="flex justify-between">
                <span>Current User:</span>
                <span className="text-foreground font-bold">{user?.fullName || "Not authenticated"}</span>
              </div>
              <div className="flex justify-between">
                <span>Current Role:</span>
                <span className="text-foreground font-bold uppercase">{currentRoleCanonical}</span>
              </div>
              <div className="flex justify-between">
                <span>Permission Count:</span>
                <span className="text-foreground font-mono font-black">{permissionsCount} actions</span>
              </div>
              <div className="flex justify-between">
                <span>Current Route:</span>
                <span className="text-foreground font-mono font-bold truncate max-w-[160px]">{pathname}</span>
              </div>
              <div className="flex justify-between">
                <span>Middleware Decision:</span>
                <span className={cn("font-bold uppercase", decision.allowed ? "text-emerald-500" : "text-rose-500")}>
                  {decision.allowed ? "ALLOW" : "BLOCK"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>RouteGuard Decision:</span>
                <span className={cn("font-bold uppercase", decision.allowed ? "text-emerald-500" : "text-rose-500")}>
                  {decision.allowed ? "ALLOW" : "BLOCK"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Session Source:</span>
                <span className="text-foreground font-mono font-bold">Zustand Store</span>
              </div>
              <div className="flex justify-between">
                <span>Cookie Source:</span>
                <span className="text-foreground font-mono font-bold">Document Cookies</span>
              </div>
              <div className="flex justify-between">
                <span>Storage Source:</span>
                <span className="text-foreground font-mono font-bold">localStorage (eduearn_session)</span>
              </div>
              <div className="flex justify-between">
                <span>Synchronization Status:</span>
                <span className="text-emerald-500 font-bold uppercase">Synchronized</span>
              </div>
              <div className="flex justify-between">
                <span>Last Repair Time:</span>
                <span className="text-foreground font-mono font-bold">{lastRepairTime}</span>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="w-56 rounded-2xl bg-card border border-border shadow-floating backdrop-blur-md p-3.5 space-y-3 animate-fadeIn duration-200">
          <div className="border-b border-border/40 pb-2 flex justify-between items-center">
            <span className="text-[8px] uppercase tracking-wider font-extrabold text-muted-foreground/80 block">
              Development Options
            </span>
            <button
              onClick={() => setShowDebug(!showDebug)}
              className="text-[8px] uppercase font-black tracking-widest text-primary flex items-center gap-0.5 hover:underline"
            >
              <Info size={9} /> {showDebug ? "Hide Info" : "Debug Panel"}
            </button>
          </div>

          <div className="border-t border-border/40 pt-2 pb-1">
            <span className="text-[8px] uppercase tracking-wider font-extrabold text-muted-foreground/80 block">
              Quick Switch Role
            </span>
          </div>

          <div className="flex flex-col gap-1 max-h-56 overflow-y-auto pr-1">
            {(Object.keys(roleConfigs) as CanonicalRole[]).map((roleKey) => {
              const cfg = roleConfigs[roleKey];
              const isSelected = currentRoleCanonical === roleKey;
              return (
                <button
                  key={roleKey}
                  type="button"
                  onClick={() => handleSwitchRole(roleKey)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer bg-transparent",
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
