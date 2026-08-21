"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, RefreshCw, Bell, Menu, ChevronDown, User as UserIcon, Settings, LogOut, Shield, ChevronRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { ThemeToggle } from "../theme-toggle";
import { useOutsideClick } from "@/hooks/useOutsideClick";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";

interface AppHeaderProps {
  activeTab: string;
  onSearchChange?: (val: string) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  isSidebarCollapsed: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;
  unreadNotificationsCount?: number;
  onBellClick?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  activeTab,
  onSearchChange,
  onRefresh,
  isRefreshing,
  setIsMobileMenuOpen,
  isSidebarCollapsed,
  setIsCommandPaletteOpen,
  unreadNotificationsCount = 0,
  onBellClick,
}) => {
  const { user, logout } = useAuth();
  const { resolvedTheme } = useTheme();
  const router = useRouter();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const userDropdownRef = useOutsideClick<HTMLDivElement>(() => {
    setUserDropdownOpen(false);
  });

  const logoSrc = resolvedTheme === "dark" ? "/logo-light.svg" : "/logo-dark.svg";

  return (
    <header
      className="h-16 px-4 sm:px-6 flex items-center justify-between border-b border-border bg-card shrink-0 select-none w-full"
    >
      <div className="flex items-center gap-3">
        {/* Hamburger for mobile navigation drawer */}
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="md:hidden p-2 hover:bg-muted rounded-button cursor-pointer text-foreground"
          aria-label="Open mobile menu"
        >
          <Menu size={18} />
        </button>

        {/* Platform Logo */}
        <Link href="/admin/dashboard" className="flex items-center gap-2 shrink-0">
          <Image
            src={logoSrc}
            alt="EduEarn Admin Console"
            width={90}
            height={26}
            priority
            className="w-auto h-6 object-contain"
          />
        </Link>
        <span className="hidden sm:inline text-muted-foreground/30 text-lg font-light mx-1">|</span>
        <nav className="hidden sm:flex items-center gap-1.5 text-[10px] font-heading font-extrabold tracking-widest uppercase text-muted-foreground" aria-label="Breadcrumb">
          <span className="text-muted-foreground">Admin</span>
          <ChevronRight size={10} className="text-muted-foreground/60" />
          <span className="text-primary">{activeTab.replace("-", " ")}</span>
        </nav>
      </div>

      <div className="flex items-center gap-3">
        {/* Global Admin Search Bar */}
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 border border-border rounded-button bg-muted/20 text-[10px] text-muted-foreground font-semibold hover:border-primary/40 cursor-pointer w-72 text-left justify-between"
        >
          <div className="flex items-center gap-2 truncate">
            <Search size={12} className="shrink-0" />
            <span className="truncate">Search users, courses, organizations, payments, audit logs...</span>
          </div>
          <span className="bg-muted px-1.5 py-0.5 rounded border border-border/50 text-[9px] font-mono shrink-0">Ctrl+K</span>
        </button>

        {/* Refresh button */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 hover:bg-muted rounded-full relative cursor-pointer text-foreground disabled:opacity-50 transition-colors"
            aria-label="Sync status refresh"
            title="Synchronize Live Database Stats"
          >
            <RefreshCw size={16} className={isRefreshing ? "animate-spin text-primary" : ""} />
          </button>
        )}

        {/* Theme Toggle */}
        <div className="flex items-center">
          <ThemeToggle />
        </div>

        {/* Notifications */}
        <button 
          onClick={onBellClick}
          className="p-2 hover:bg-muted rounded-full relative cursor-pointer text-foreground" 
          aria-label="View notifications"
        >
          <Bell size={16} />
          {unreadNotificationsCount > 0 && (
            <span className="w-4 h-4 bg-rose-500 text-white rounded-full absolute -top-1.5 -right-1.5 animate-pulse text-[8px] font-black flex items-center justify-center">
              {unreadNotificationsCount}
            </span>
          )}
        </button>

        {/* User Profile Menu */}
        <div className="relative" ref={userDropdownRef}>
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center gap-1.5 focus:outline-none cursor-pointer hover:opacity-90 transition-opacity"
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-extrabold text-xs shadow-soft overflow-hidden select-none">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
              ) : (
                user?.fullName.charAt(0) || "A"
              )}
            </div>
            <ChevronDown size={12} className="text-muted-foreground hidden sm:block" />
          </button>

          <AnimatePresence>
            {userDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="absolute right-0 mt-2 w-52 bg-card border border-border shadow-floating rounded-modal p-2 text-foreground flex flex-col z-[99999]"
              >
                <div className="px-3 py-1.5 border-b border-border/60 select-none mb-1 text-left">
                  <p className="text-xs font-extrabold truncate text-foreground">{user?.fullName}</p>
                  <p className="text-[9px] text-muted-foreground font-semibold truncate uppercase mt-0.5">{user?.role}</p>
                </div>

                <Link
                  href="/admin/dashboard?tab=settings"
                  onClick={() => setUserDropdownOpen(false)}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-button transition-colors"
                >
                  <Settings size={14} className="text-primary shrink-0" />
                  <span>Settings</span>
                </Link>

                <button
                  onClick={async () => {
                    setUserDropdownOpen(false);
                    await logout();
                    router.push("/login");
                    toast.success("Signed out securely.");
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-destructive hover:bg-destructive/5 rounded-button transition-colors cursor-pointer w-full text-left border-t border-border/40 mt-1"
                >
                  <LogOut size={14} className="shrink-0" />
                  <span>Logout</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};
