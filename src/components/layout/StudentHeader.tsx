"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  Search,
  Bell,
  ChevronDown,
  LogOut,
  Shield,
  User as UserIcon,
  Settings,
  HelpCircle,
  FileText,
  Coins,
  ChevronRight
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
import { ThemeToggle } from "./ThemeToggle";

export function StudentHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const mounted = useMounted();
  const scrollY = useScrollPosition();
  const { user, isAuthenticated, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
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
    const timer = setTimeout(() => {
      setIsMobileMenuOpen(false);
      setActiveDropdown(null);
    }, 0);
    return () => clearTimeout(timer);
  }, [pathname]);

  const logoSrc = resolvedTheme === "dark" ? "/logo-light.svg" : "/logo-dark.svg";

  const resolvedMainNav = [
    { title: "My Learn", href: "/learn" },
    { title: "LMS Catalog", href: "/learn/courses" },
    { title: "AI Hub", href: "/ai-hub" },
    { title: "Notes Library", href: "/notes" },
    { title: "Community", href: "/community" },
    { title: "Career Hub", href: "/career" },
    { title: "Tutors", href: "/tutors" },
    { title: "Wishlist", href: "/student/dashboard?tab=wishlist" },
  ];

  const isScrolled = scrollY > 20;

  return (
    <header
      className={cn(
        "fixed top-0 transition-all duration-300 select-none z-40 h-16 flex items-center border-b border-border/40 backdrop-blur-md bg-background/95 dark:bg-slate-900/95 left-0 w-full"
      )}
    >
      <div className="w-full flex items-center justify-between gap-4 px-6 max-w-none">
        <div className="flex items-center gap-3">
          {/* Brand Logo */}
          <Link 
            href="/" 
            className="shrink-0 flex items-center gap-2 relative z-50 pointer-events-auto"
          >
            {mounted ? (
              <Image
                src={logoSrc}
                alt={siteConfig.name}
                width={112}
                height={32}
                priority
                className="w-full h-auto object-contain dark:brightness-100"
              />
            ) : (
              <div className="w-28 h-8 bg-muted rounded-input animate-pulse" />
            )}
          </Link>

          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-[11px] font-semibold select-none mr-4" aria-label="Breadcrumb">
            <span className="text-muted-foreground hidden sm:inline">Student</span>
            <ChevronRight size={11} className="text-muted-foreground/60 hidden sm:inline" />
            <span className="text-foreground font-bold capitalize">
              {pathname === "/learn" ? "My Learn" : pathname.split("/").filter(Boolean)[1] || "Dashboard"}
            </span>
          </nav>
        </div>

        {/* Desktop Left Nav Wrapper */}
        <div className="hidden lg:flex items-center gap-6 relative pointer-events-auto">
          <nav className="flex items-center gap-6">
            {resolvedMainNav.map((item, idx) => (
              <Link
                key={idx}
                href={item.href}
                className="text-xs font-bold text-foreground hover:text-primary transition-colors cursor-pointer py-1"
              >
                {item.title}
              </Link>
            ))}
          </nav>
        </div>

        {/* Desktop Search & Auth actions */}
        <div className="flex items-center gap-4 relative pointer-events-auto">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 border border-border/80 rounded-button bg-muted/15 text-[10px] text-muted-foreground font-semibold hover:border-primary/40 cursor-pointer">
            <Search size={12} />
            <span>Search courses, skills...</span>
          </div>

          {/* Theme Toggle */}
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>

          {isAuthenticated && (
            <div className="flex items-center gap-3">
              {/* Notifications Dropdown */}
              <div className="relative" ref={notificationsRef}>
                <button
                  onClick={() => toggleDropdown("notifications")}
                  className="p-2 hover:bg-muted/80 rounded-full relative cursor-pointer text-foreground focus:outline-none"
                  aria-label="View notifications dropdown"
                >
                  <Bell size={16} />
                  {unreadCount > 0 && (
                    <span className="w-4 h-4 bg-rose-500 text-white rounded-full absolute -top-1.5 -right-1.5 animate-pulse text-[8px] font-black flex items-center justify-center">
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
                      className="absolute right-0 mt-3 w-80 bg-card border border-border/80 shadow-floating rounded-modal p-4 text-foreground flex flex-col z-[99999]"
                    >
                      <div className="flex items-center justify-between border-b border-border/40 pb-2.5 mb-2.5 select-none">
                        <span className="text-xs font-extrabold text-foreground">Notifications Feed</span>
                        {unreadCount > 0 && (
                          <button
                            onClick={() => {
                              markAllAsRead();
                              toast.success("All marked as read");
                            }}
                            className="text-[9.5px] font-extrabold text-primary hover:underline cursor-pointer"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      
                      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                        {notifications.length === 0 ? (
                          <div className="text-center py-6 text-xs text-muted-foreground/60 select-none">
                            Feed is clear.
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div 
                              key={n.id} 
                              onClick={() => markAsRead(n.id)}
                              className={cn(
                                "p-2.5 rounded-lg border text-xs font-semibold flex flex-col gap-1 transition-all cursor-pointer",
                                n.isRead ? "bg-muted/10 border-border/40" : "bg-primary/5 border-primary/20 hover:bg-primary/10"
                              )}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-extrabold text-foreground">{n.title}</span>
                                <span className="text-[8.5px] text-muted-foreground/50">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                              <p className="text-[10px] text-muted-foreground leading-relaxed mt-0.5">{n.message}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* User Dropdown */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => toggleDropdown("user")}
                  className="flex items-center gap-1.5 focus:outline-none cursor-pointer hover:opacity-90 transition-opacity"
                >
                  <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-extrabold text-xs sm:text-sm shadow-soft overflow-hidden">
                    {user?.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user?.fullName || "User"} className="w-full h-full object-cover" />
                    ) : (
                      (user?.fullName || "U").charAt(0)
                    )}
                  </div>
                  <ChevronDown
                    size={14}
                    className={cn(
                      "text-muted-foreground transition-transform duration-200 hidden md:block",
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
                      className="absolute right-0 mt-3 w-56 bg-card border border-border/80 shadow-floating rounded-modal p-2.5 text-foreground flex flex-col z-[99999]"
                    >
                      <div className="px-3 py-2 border-b border-border/60 select-none mb-1.5">
                        <p className="text-xs font-extrabold truncate text-foreground">{user?.fullName}</p>
                        <p className="text-[10px] text-muted-foreground font-semibold truncate mt-0.5">{user?.email}</p>
                      </div>
                      
                      <Link
                        href="/student/dashboard"
                        onClick={() => setActiveDropdown(null)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-button transition-colors"
                      >
                        <Shield size={14} className="text-primary shrink-0" />
                        <span>Dashboard</span>
                      </Link>

                      <Link
                        href="/profile"
                        onClick={() => setActiveDropdown(null)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-button transition-colors"
                      >
                        <UserIcon size={14} className="text-primary shrink-0" />
                        <span>Profile</span>
                      </Link>

                      <Link
                        href="/settings"
                        onClick={() => setActiveDropdown(null)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-button transition-colors"
                      >
                        <Settings size={14} className="text-primary shrink-0" />
                        <span>Settings</span>
                      </Link>

                      <Link
                        href="/student/dashboard?tab=notifications"
                        onClick={() => setActiveDropdown(null)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-button transition-colors"
                      >
                        <Bell size={14} className="text-primary shrink-0" />
                        <span>Notifications</span>
                      </Link>

                      <div className="border-t border-border/40 my-1.5" />

                      <Link
                        href="/privacy"
                        onClick={() => setActiveDropdown(null)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-button transition-colors"
                      >
                        <FileText size={14} className="text-muted-foreground/60 shrink-0" />
                        <span>Privacy Policy</span>
                      </Link>

                      <Link
                        href="/terms"
                        onClick={() => setActiveDropdown(null)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-button transition-colors"
                      >
                        <FileText size={14} className="text-muted-foreground/60 shrink-0" />
                        <span>Terms &amp; Conditions</span>
                      </Link>

                      <button
                        onClick={async () => {
                          await logout();
                          toast.success("Signed out securely.");
                        }}
                        className="flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold text-destructive hover:bg-destructive/5 rounded-button transition-colors cursor-pointer w-full text-left border-t border-border/40 pt-2.5"
                      >
                        <LogOut size={14} className="shrink-0" />
                        <span>Logout</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden text-foreground w-9 h-9 rounded-button border border-border bg-card hover:bg-muted/80 flex items-center justify-center cursor-pointer transition-colors focus:outline-none pointer-events-auto"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Slide Drawer Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.35 }}
              className="fixed top-0 right-0 bottom-0 z-40 w-80 bg-card border-l border-border p-6 shadow-floating overflow-y-auto flex flex-col justify-between lg:hidden"
            >
              <div className="flex flex-col gap-6 mt-14">
                <div className="relative border border-border rounded-button bg-muted/30 flex items-center px-3 gap-2 py-2">
                  <Search size={16} className="text-muted-foreground shrink-0" />
                  <input
                    type="text"
                    placeholder="Search courses..."
                    className="bg-transparent border-none text-xs text-foreground placeholder:text-muted-foreground focus:outline-none w-full"
                  />
                </div>

                <nav className="flex flex-col gap-4">
                  {resolvedMainNav.map((item, idx) => (
                    <Link
                      key={idx}
                      href={item.href}
                      className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors border-b border-border/40 pb-2"
                    >
                      {item.title}
                    </Link>
                  ))}
                </nav>
              </div>

              <div className="flex flex-col gap-3 mt-8 border-t border-border pt-6">
                <div className="flex items-center justify-between py-1 border-b border-border/40 pb-3 mb-1">
                  <span className="text-xs font-bold text-muted-foreground">Appearance</span>
                  <ThemeToggle />
                </div>
                <Link
                  href="/student/dashboard"
                  className="w-full text-center py-2 rounded-button bg-muted hover:bg-muted/80 text-xs font-bold text-foreground transition-colors"
                >
                  Dashboard Panel
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
