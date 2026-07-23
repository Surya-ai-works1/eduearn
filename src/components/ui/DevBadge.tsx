"use client";

import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../../hooks/useAuth";
import { ChevronUp, RefreshCw, Terminal } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "../../utils/cn";

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

export function DevBadge() {
  const { user, isAuthenticated } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

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

  if (!mounted || process.env.NODE_ENV !== "development" || !isAuthenticated || !user) {
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

  const currentConfig = user.role && roleConfigs[user.role as keyof typeof roleConfigs];
  if (!currentConfig) return null;

  const handleSwitchRole = (roleKey: "student" | "tutor" | "admin") => {
    const config = roleConfigs[roleKey];
    
    // Update Zustand state first
    useAuth.setState({ user: config.mockUser, isAuthenticated: true, isLoading: false });

    // Show success toast
    toast.success(`Switched role to ${config.label}! Redirecting...`);
    setIsOpen(false);

    // Call top-level helper function for cookies/redirect
    performSwitch(config.redirect, config.mockUser);
  };

  return (
    <div className="fixed bottom-4 right-4 z-[99999] select-none text-left" ref={menuRef}>
      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute bottom-12 right-0 w-52 rounded-2xl bg-card/95 border border-border shadow-floating backdrop-blur-md p-3.5 space-y-3 animate-fadeIn duration-200">
          <div className="border-b border-border/40 pb-2">
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
                    "w-full flex items-center justify-between px-3 py-2 rounded-lg text-[10.5px] font-bold border transition-all cursor-pointer",
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
