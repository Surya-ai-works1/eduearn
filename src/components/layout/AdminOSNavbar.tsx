"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu, X, Search, Bell, ChevronDown, LogOut, Shield, User as UserIcon, Settings,
  HelpCircle, FileText, Sparkles, Laptop, ShieldCheck, RefreshCw, Activity, Terminal
} from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "../../hooks/useAuth";
import { useNotifications } from "../../providers/NotificationProvider";
import { siteConfig } from "../../config/site";
import { useMounted } from "../../hooks/useMounted";
import { useScrollPosition } from "../../hooks/useScrollPosition";
import { useOutsideClick } from "../../hooks/useOutsideClick";
import { useTheme } from "../../hooks/useTheme";
import { cn } from "../../utils/cn";

export function AdminOSNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const mounted = useMounted();
  const scrollY = useScrollPosition();
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const { resolvedTheme } = useTheme();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const userMenuRef = useOutsideClick<HTMLDivElement>(() => {
    if (activeDropdown === "user") setActiveDropdown(null);
  });

  const notificationsRef = useOutsideClick<HTMLDivElement>(() => {
    if (activeDropdown === "notifications") setActiveDropdown(null);
  });

  const toggleDropdown = (name: string) => {
    setActiveDropdown((prev) => (prev === name ? null : name));
  };

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setActiveDropdown(null);
  }, [pathname]);

  const adminNavItems = [
    { title: "Overview", href: "/" },
    { title: "Users", href: "/admin/dashboard?tab=users" },
    { title: "Learning", href: "/admin/dashboard?tab=courses" },
    { title: "Finance", href: "/admin/dashboard?tab=finance" },
    { title: "Trust & Safety", href: "/admin/dashboard?tab=reports" },
    { title: "AI", href: "/admin/dashboard?tab=ai" },
    { title: "Community", href: "/admin/dashboard?tab=organizations" },
    { title: "System", href: "/admin/dashboard?tab=settings" },
  ];

  const isScrolled = scrollY > 20;

  const handleGlobalSearchFocus = () => {
    const searchInput = document.getElementById("admin-command-search");
    if (searchInput) {
      searchInput.focus();
      searchInput.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      toast.info("Command console search is ready on the homepage.");
    }
  };

  return (
    <header
      className={cn(
        "fixed top-0 transition-all duration-300 select-none left-0 right-0 w-full z-50",
        isScrolled
          ? "bg-white/95 dark:bg-[#090d16]/95 border-b border-slate-200 dark:border-slate-800/80 py-3 shadow-sm backdrop-blur"
          : "bg-white dark:bg-[#090d16] border-b border-slate-100 dark:border-slate-850 py-4"
      )}
    >
      <div className="mx-auto w-[min(96vw,1800px)] flex items-center justify-between gap-4">
        {/* Brand Logo & Admin Badge */}
        <div className="flex items-center gap-3">
          <Link href="/" className="shrink-0 flex items-center gap-2 relative z-50 pointer-events-auto">
            <Image
              src="/logo-dark.svg"
              alt={siteConfig.name}
              width={106}
              height={30}
              priority
              className="w-auto h-8 object-contain dark:hidden"
            />
            <Image
              src="/logo-light.svg"
              alt={siteConfig.name}
              width={106}
              height={30}
              priority
              className="w-auto h-8 object-contain hidden dark:block"
            />
          </Link>
          <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-black font-mono tracking-wider bg-blue-600/10 text-blue-600 dark:text-blue-500 border border-blue-600/20 px-2 py-0.5 rounded uppercase">
            CONTROL PLANE
          </span>
        </div>

        {/* Desktop Mid Nav (Admin OS Subsections) */}
        <nav className="hidden xl:flex items-center gap-1 relative pointer-events-auto">
          {adminNavItems.map((item, idx) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href.split("?")[0]));
            return (
              <Link
                key={idx}
                href={item.href}
                className={cn(
                  "px-3.5 py-1.5 rounded-lg text-sm font-extrabold transition-all hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-blue-600 dark:hover:text-blue-500",
                  isActive 
                    ? "text-blue-600 dark:text-blue-550 bg-blue-50/50 dark:bg-blue-900/10" 
                    : "text-slate-600 dark:text-slate-400"
                )}
              >
                {item.title}
              </Link>
            );
          })}
        </nav>

        {/* Right Nav (Global Admin Search, Notifications, Profile) */}
        <div className="flex items-center gap-3.5 relative z-50 pointer-events-auto">
          
          {/* Global Admin Search trigger */}
          <button
            onClick={handleGlobalSearchFocus}
            className="flex items-center gap-2 h-9 px-3 bg-[#f8fafc] dark:bg-[#0c1322] border border-slate-205 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-lg text-slate-450 dark:text-slate-500 text-xs transition cursor-pointer"
            title="Focus System Command Search"
          >
            <Search size={14} />
            <span className="hidden md:inline font-semibold">Search platform...</span>
            <kbd className="hidden lg:inline-flex h-5 items-center gap-0.5 rounded border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-900 px-1.5 font-mono text-[10px] font-medium text-slate-400 shadow-sm">
              ⌘K
            </kbd>
          </button>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => toggleDropdown("notifications")}
              className="relative p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-855 rounded-lg transition-colors cursor-pointer focus:outline-none"
              aria-label="View platform alerts"
            >
              <Bell size={19} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-black text-white ring-2 ring-white dark:ring-[#090d16]">
                  {unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {activeDropdown === "notifications" && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg rounded-xl p-3 flex flex-col z-[99999]"
                >
                  <div className="flex items-center justify-between px-2 pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-black uppercase text-slate-500 tracking-wider">Alert Logs</span>
                    {unreadCount > 0 && (
                      <span className="text-[10px] font-bold text-blue-600 dark:text-blue-500">
                        {unreadCount} unresolved
                      </span>
                    )}
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-2 select-none">
                    {notifications.length === 0 ? (
                      <div className="text-center py-6 text-xs text-slate-400 font-mono">
                        No critical platform exceptions
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div 
                          key={n.id} 
                          className={cn(
                            "p-2.5 rounded-lg border text-xs font-semibold flex flex-col gap-1 transition-all cursor-pointer",
                            n.isRead ? "bg-muted/10 border-border/40" : "bg-blue-500/5 border-blue-500/10 hover:bg-blue-500/10"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-slate-900 dark:text-slate-100">{n.title}</span>
                            <span className="text-[8.5px] text-slate-400">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <p className="text-[10px] text-slate-500 leading-relaxed mt-0.5">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Account / Profile Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => toggleDropdown("user")}
              className="flex items-center gap-1.5 focus:outline-none cursor-pointer hover:opacity-90 transition-opacity"
            >
              <div className="w-9 h-9 rounded-full bg-blue-600/10 border border-blue-600/20 flex items-center justify-center text-blue-600 font-extrabold text-xs sm:text-sm shadow-sm overflow-hidden select-none">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user?.fullName || "Admin"} className="w-full h-full object-cover" />
                ) : (
                  (user?.fullName || "A").charAt(0)
                )}
              </div>
              <ChevronDown
                size={14}
                className={cn(
                  "text-slate-450 transition-transform duration-200 hidden md:block",
                  activeDropdown === "user" && "rotate-180"
                )}
              />
            </button>

            <AnimatePresence>
              {activeDropdown === "user" && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute right-0 mt-3 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg rounded-xl p-2.5 text-slate-755 dark:text-slate-200 flex flex-col z-[99999]"
                >
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 select-none mb-1.5">
                    <p className="text-xs font-black truncate text-slate-905 dark:text-white">{user?.fullName || "Ecosystem Admin"}</p>
                    <p className="text-[10px] text-slate-400 font-semibold truncate mt-0.5">{user?.email}</p>
                  </div>
                  
                  <Link
                    href="/admin/dashboard"
                    onClick={() => setActiveDropdown(null)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-550 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-850 rounded-lg transition-colors"
                  >
                    <ShieldCheck size={14} className="text-blue-600 shrink-0" />
                    <span>Control Panel</span>
                  </Link>

                  <Link
                    href="/settings"
                    onClick={() => setActiveDropdown(null)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-550 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-850 rounded-lg transition-colors"
                  >
                    <Settings size={14} className="text-blue-600 shrink-0" />
                    <span>System Settings</span>
                  </Link>

                  <button
                    onClick={async () => {
                      await logout();
                      toast.success("Signed out securely.");
                    }}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-500/5 rounded-lg transition-colors cursor-pointer w-full text-left border-t border-slate-100 dark:border-slate-800 mt-1.5 pt-2"
                  >
                    <LogOut size={14} className="shrink-0" />
                    <span>Logout Session</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="xl:hidden text-slate-700 dark:text-slate-200 w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-center cursor-pointer transition-colors focus:outline-none pointer-events-auto"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

        </div>

      </div>

      {/* Mobile Menu Panel */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="xl:hidden absolute top-[60px] left-0 right-0 bg-white dark:bg-[#090d16] border-b border-slate-200 dark:border-slate-800 shadow-lg px-4 py-4 z-40 overflow-hidden text-left"
          >
            <div className="flex flex-col gap-1.5">
              {adminNavItems.map((item, idx) => (
                <Link
                  key={idx}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-4 py-3 rounded-lg text-sm font-extrabold text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-blue-600 transition-all block"
                >
                  {item.title}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
export default AdminOSNavbar;
