"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AppHeader } from "../../../components/shared/AppHeader";
import {
  LayoutDashboard, Users, ShieldCheck, BookOpen, FolderKanban, Coins, FileSpreadsheet, FileText,
  Bell, Settings, BookOpenCheck, Menu, X, ChevronLeft, ChevronRight, Search, Sparkles,
  ShieldAlert, Trash2, Tag, Video, HelpCircle, Award, Globe, Database, BarChart3,
  Sliders, DollarSign, TrendingUp, Activity, LogOut, Calendar, Lock, Eye, CheckCircle2,
  Bookmark, Play, RefreshCw, Check, Archive, Info, Server, AlertCircle, Download, Building2, Cpu
} from "lucide-react";
import { RequireAdmin } from "../../../features/auth/components/RouteGuard";
import { useAuth } from "../../../hooks/useAuth";
import { toast } from "sonner";
import { Button } from "../../../components/ui/button";

// Platform Integration Services
import { 
  PlatformEventBus, GlobalSearchIndex, PlatformNotification, PLATFORM_EVENTS_KEY 
} from "../../../lib/services/PlatformIntegrationEngine";

interface SidebarGroup {
  title: string;
  items: {
    id: string;
    label: string;
    icon: React.ComponentType<any>;
  }[];
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSearchChange?: (val: string) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export default function DashboardLayout({
  children,
  activeTab,
  setActiveTab,
  onSearchChange,
  onRefresh,
  isRefreshing
}: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Command Palettes & Search States
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isActionPaletteOpen, setIsActionPaletteOpen] = useState(false);
  const [paletteSearch, setPaletteSearch] = useState("");
  const [actionSearch, setActionSearch] = useState("");

  // Notification Feed Drawer States
  const [isNotifDrawerOpen, setIsNotifDrawerOpen] = useState(false);
  const [notifSearch, setNotifSearch] = useState("");
  const [notifFilter, setNotifFilter] = useState<string>("All");
  const [notifications, setNotifications] = useState<PlatformNotification[]>([]);

  // Keyboard shortcut listeners (Ctrl+K and Ctrl+Shift+P)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl + Shift + P -> Action Palette
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "p") {
        e.preventDefault();
        setIsActionPaletteOpen(prev => !prev);
        setIsCommandPaletteOpen(false);
      }
      // Ctrl + K -> Global Search
      else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
        setIsActionPaletteOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Sync Notifications feed from localStorage
  const loadNotifications = () => {
    setNotifications(PlatformEventBus.getNotifications());
  };

  useEffect(() => {
    loadNotifications();
    // Periodically sync notifications
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "eduearn_platform_notifications") {
        loadNotifications();
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const sidebarGroups: SidebarGroup[] = [
    {
      title: "OPERATIONS",
      items: [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
        { id: "organizations", label: "Organizations", icon: Building2 },
        { id: "categories", label: "Categories", icon: FolderKanban },
        { id: "courses", label: "Courses", icon: BookOpenCheck },
        { id: "tutors", label: "Tutors", icon: Users },
        { id: "students", label: "Students", icon: Users }
      ]
    },
    {
      title: "FINANCE",
      items: [
        { id: "payments", label: "Payments", icon: FileSpreadsheet },
        { id: "finance", label: "Finance", icon: DollarSign },
        { id: "offers", label: "Coupons & Offers", icon: Tag }
      ]
    },
    {
      title: "PLATFORM",
      items: [
        { id: "certificates", label: "Certificates", icon: Award },
        { id: "cms", label: "CMS", icon: Globe },
        { id: "analytics", label: "Analytics", icon: BarChart3 }
      ]
    },
    {
      title: "SECURITY",
      items: [
        { id: "reports", label: "Reports", icon: FileText },
        { id: "audit-logs", label: "Audit Logs", icon: Database },
        { id: "security", label: "Security", icon: ShieldAlert }
      ]
    },
    {
      title: "SYSTEM",
      items: [
        { id: "settings", label: "Settings", icon: Settings },
        { id: "system-health", label: "System Health", icon: Activity }
      ]
    }
  ];

  // Global Search Index matching logic
  const searchResults = GlobalSearchIndex.query(paletteSearch);

  // Ctrl+Shift+P Action Commands list
  const actionCommands = [
    { label: "Go to Users", action: () => setActiveTab("users"), icon: Users },
    { label: "Go to Tutors", action: () => setActiveTab("tutors"), icon: Award },
    { label: "Go to Finance", action: () => setActiveTab("payments"), icon: FileSpreadsheet },
    { label: "Go to AI Studio", action: () => setActiveTab("ai"), icon: Sparkles },
    { label: "Go to Communication", action: () => setActiveTab("communication"), icon: Bell },
    { label: "Go to Organizations", action: () => setActiveTab("organizations"), icon: Building2 },
    { label: "Go to Automation", action: () => setActiveTab("automation"), icon: Cpu },
    { label: "Create Course", action: () => setActiveTab("courses"), icon: BookOpenCheck },
    { label: "Generate Report", action: () => setActiveTab("analytics"), icon: BarChart3 },
    { label: "Export Users", action: () => {
      const stored = localStorage.getItem("eduearn_admin_users");
      const blob = new Blob([stored || "[]"], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "eduearn_users.json";
      a.click();
      toast.success("Users registry exported.");
    }, icon: Download },
    { label: "Open Audit Logs", action: () => setActiveTab("audit-logs"), icon: Database }
  ];

  const filteredActionCommands = actionCommands.filter(c => 
    c.label.toLowerCase().includes(actionSearch.toLowerCase())
  );

  // Handle Search Result Click Redirects
  const handleSearchResultClick = (res: { module: string; id: string }) => {
    setIsCommandPaletteOpen(false);
    setPaletteSearch("");
    
    if (res.module === "Course") {
      setActiveTab("courses");
    } else if (res.module === "Student" || res.module === "Tutor" || res.module === "User") {
      setActiveTab("users");
    } else if (res.module === "Audit Logs" || res.module === "Timeline") {
      setActiveTab("audit-logs");
    } else if (res.module === "Support Tickets") {
      setActiveTab("communication");
    } else {
      setActiveTab("dashboard");
    }
  };

  // Notification Operations
  const handleMarkRead = (id: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
      localStorage.setItem("eduearn_platform_notifications", JSON.stringify(updated));
      return updated;
    });
  };

  const handleArchiveNotif = (id: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, archived: true } : n);
      localStorage.setItem("eduearn_platform_notifications", JSON.stringify(updated));
      return updated;
    });
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      localStorage.setItem("eduearn_platform_notifications", JSON.stringify(updated));
      return updated;
    });
    toast.success("All notifications marked as read.");
  };

  const filteredNotifs = notifications.filter(n => {
    if (n.archived) return false;
    const matchesSearch = n.title.toLowerCase().includes(notifSearch.toLowerCase()) || 
                          n.message.toLowerCase().includes(notifSearch.toLowerCase());
    const matchesFilter = notifFilter === "All" || n.priority === notifFilter || n.module === notifFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <RequireAdmin>
      <div className="min-h-screen bg-background text-foreground flex select-none text-left relative overflow-x-hidden font-sans">
        
        {/* 1. DESKTOP SIDEBAR NAVIGATION */}
        <aside
          className={`sidebar-surface backdrop-blur-md hidden md:flex flex-col transition-all duration-300 fixed top-0 left-0 bottom-0 h-screen z-45 bg-card/95 border-r border-border/80 shadow-soft ${
            isSidebarCollapsed ? "w-20" : "w-64"
          }`}
        >
          {/* Collapse toggle button */}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="absolute -right-3 top-6 bg-primary text-white border border-primary/20 rounded-full p-1.5 cursor-pointer hover:opacity-90 shadow-soft focus:outline-none z-50 transition-transform duration-200"
            aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isSidebarCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
          </button>

          {/* Admin Avatar Header */}
          <div className="p-5 border-b border-border/40 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-black text-primary shrink-0 relative overflow-hidden select-none shadow-soft">
              {user?.avatarUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element -- User avatars are dynamically loaded from external Supabase Storage URLs */
                <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                user?.fullName.charAt(0)
              )}
            </div>
            {!isSidebarCollapsed && (
              <div className="min-w-0">
                <h4 className="text-xs font-extrabold text-foreground truncate">{user?.fullName}</h4>
                <span className="text-[8px] uppercase tracking-wider font-extrabold text-primary bg-primary/10 px-2 py-0.5 rounded-full mt-1 inline-block">
                  {user?.role}
                </span>
              </div>
            )}
          </div>

          {/* Navigation Items grouped */}
          <nav className="flex-1 p-3.5 flex flex-col gap-4 overflow-y-auto scrollbar-none select-none">
            {sidebarGroups.map((group) => (
              <div key={group.title} className="space-y-1">
                {!isSidebarCollapsed && (
                  <span className="text-[9px] font-black text-muted-foreground/50 tracking-widest block pl-2 mb-2 uppercase">
                    {group.title}
                  </span>
                )}
                {group.items.map((item) => {
                  const Icon = item.icon;
                  
                  // Active mapping: map sub-tabs to main tab containers
                  let isActive = activeTab === item.id;
                  if (activeTab === "students" && item.id === "students") isActive = true;
                  if (activeTab === "tutors" && item.id === "tutors") isActive = true;
                  if (activeTab === "tutor-verification" && item.id === "tutor-verification") isActive = true;

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                      }}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-button text-xs font-extrabold cursor-pointer transition-all duration-200 focus:outline-none w-full ${
                        isActive
                          ? "bg-primary text-white shadow-soft font-black"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      }`}
                    >
                      <Icon size={16} className="shrink-0" />
                      {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* Logout row */}
          <div className="p-4 border-t border-border/40 select-none">
            <button
              onClick={() => {
                logout();
                router.push("/login");
              }}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-button text-xs font-extrabold text-muted-foreground hover:text-red-500 hover:bg-red-500/10 cursor-pointer transition-all duration-200 focus:outline-none w-full"
            >
              <LogOut size={16} className="shrink-0" />
              {!isSidebarCollapsed && <span className="uppercase tracking-wider text-[10px]">Logout Panel</span>}
            </button>
          </div>
        </aside>

        {/* 2. MOBILE NAVIGATION DRAWER */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-45 md:hidden"
              />
              <motion.aside
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", bounce: 0.1, duration: 0.3 }}
                className="fixed top-0 left-0 bottom-0 w-64 bg-card border-r border-border backdrop-blur-md z-50 flex flex-col p-4 md:hidden"
              >
                <div className="flex items-center justify-between pb-3 border-b border-border/40 mb-3 select-none">
                  <span className="text-xs font-heading font-extrabold text-foreground">EduEarn Menu</span>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-1 hover:bg-muted rounded cursor-pointer text-foreground"
                  >
                    <X size={16} />
                  </button>
                </div>
                <nav className="flex-1 flex flex-col gap-4 overflow-y-auto scrollbar-none">
                  {sidebarGroups.map((group) => (
                    <div key={group.title} className="space-y-1">
                      <span className="text-[8px] font-extrabold text-muted-foreground/60 tracking-wider block pl-2 mb-1">
                        {group.title}
                      </span>
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              setActiveTab(item.id);
                              setIsMobileMenuOpen(false);
                            }}
                            className={`flex items-center gap-3 px-3 py-2 rounded-button text-[11px] font-semibold transition-all w-full cursor-pointer ${
                              isActive
                                ? "bg-primary text-white shadow-soft font-bold"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                            }`}
                          >
                            <Icon size={14} />
                            <span>{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </nav>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* 3. MAIN HEADER NAVBAR & CONTROLLER BODY */}
        <div className={`flex-1 flex flex-col overflow-hidden min-w-0 transition-all duration-300 ${
          isSidebarCollapsed ? "md:pl-20" : "md:pl-64"
        }`}>
          <AppHeader
            activeTab={activeTab}
            onSearchChange={onSearchChange}
            onRefresh={onRefresh}
            isRefreshing={isRefreshing}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
            isSidebarCollapsed={isSidebarCollapsed}
            setIsCommandPaletteOpen={setIsCommandPaletteOpen}
            unreadNotificationsCount={unreadCount}
            onBellClick={() => setIsNotifDrawerOpen(true)}
          />

          {/* PAGE BODY VIEW */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-background relative z-10 scroll-smooth">
            {children}
          </main>
        </div>

        {/* 4. GLOBAL SEARCH PALETTE (Ctrl+K) */}
        <AnimatePresence>
          {isCommandPaletteOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsCommandPaletteOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-start justify-center pt-24"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -20 }}
                  transition={{ type: "spring", duration: 0.3 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-card border border-border shadow-modal rounded-card w-full max-w-lg overflow-hidden flex flex-col text-left"
                >
                  <div className="p-4 border-b border-border/50 flex items-center gap-3">
                    <Search size={16} className="text-muted-foreground shrink-0" />
                    <input
                      type="text"
                      autoFocus
                      placeholder="Search users, courses, organizations, payments, audit logs..."
                      value={paletteSearch}
                      onChange={(e) => setPaletteSearch(e.target.value)}
                      className="bg-transparent border-none text-xs text-foreground focus:outline-none w-full font-bold"
                    />
                    <button onClick={() => setIsCommandPaletteOpen(false)} className="p-1 hover:bg-muted rounded cursor-pointer text-muted-foreground"><X size={14} /></button>
                  </div>

                  <div className="max-h-[300px] overflow-y-auto p-2 space-y-0.5">
                    {paletteSearch.trim() === "" ? (
                      <div className="py-8 text-center text-xs text-muted-foreground/60 font-semibold select-none">
                        Type to search across all operational databases...
                      </div>
                    ) : searchResults.length === 0 ? (
                      <div className="py-8 text-center text-xs text-muted-foreground/60 font-semibold">No results found matching search queries.</div>
                    ) : (
                      searchResults.map((res, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSearchResultClick(res)}
                          className="flex items-center justify-between px-3 py-2.5 rounded-button text-xs font-semibold text-foreground hover:bg-primary hover:text-white transition-colors w-full text-left"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] bg-muted border border-border/50 text-muted-foreground px-1.5 py-0.2 rounded font-black uppercase">{res.module}</span>
                            <span>{res.name}</span>
                          </div>
                          <span className="text-[10px] text-muted-foreground/60 select-none truncate max-w-[150px]">{res.info}</span>
                        </button>
                      ))
                    )}
                  </div>
                  
                  <div className="p-3 border-t border-border/30 bg-muted/10 text-[9px] text-muted-foreground flex items-center justify-between font-bold select-none">
                    <span>Press ESC to exit</span>
                    <span>Global Operations Index</span>
                  </div>
                </motion.div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* 5. ADMIN COMMAND PALETTE (Ctrl+Shift+P) */}
        <AnimatePresence>
          {isActionPaletteOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsActionPaletteOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-start justify-center pt-24"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -20 }}
                  transition={{ type: "spring", duration: 0.3 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-card border border-border shadow-modal rounded-card w-full max-w-md overflow-hidden flex flex-col text-left"
                >
                  <div className="p-4 border-b border-border/50 flex items-center gap-3">
                    <Sparkles size={16} className="text-primary shrink-0 animate-pulse" />
                    <input
                      type="text"
                      autoFocus
                      placeholder="Type a command (e.g. Go to Finance, Create Course)..."
                      value={actionSearch}
                      onChange={(e) => setActionSearch(e.target.value)}
                      className="bg-transparent border-none text-xs text-foreground focus:outline-none w-full font-bold"
                    />
                    <button onClick={() => setIsActionPaletteOpen(false)} className="p-1 hover:bg-muted rounded cursor-pointer text-muted-foreground"><X size={14} /></button>
                  </div>

                  <div className="max-h-[250px] overflow-y-auto p-2 space-y-0.5">
                    {filteredActionCommands.length === 0 ? (
                      <div className="py-6 text-center text-xs text-muted-foreground/60">No matching commands.</div>
                    ) : (
                      filteredActionCommands.map((cmd, idx) => {
                        const Icon = cmd.icon;
                        return (
                          <button
                            key={idx}
                            onClick={() => {
                              cmd.action();
                              setIsActionPaletteOpen(false);
                              setActionSearch("");
                            }}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-button text-xs font-semibold text-foreground hover:bg-primary hover:text-white transition-colors w-full text-left"
                          >
                            <Icon size={14} className="shrink-0" />
                            <span>{cmd.label}</span>
                          </button>
                        );
                      })
                    )}
                  </div>
                  
                  <div className="p-3 border-t border-border/30 bg-muted/10 text-[9px] text-muted-foreground flex items-center justify-between font-bold">
                    <span>Ctrl + Shift + P Palette</span>
                    <span>System Executive Actions</span>
                  </div>
                </motion.div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* 6. GLOBAL OPERATIONS FEED DRAWER (Notification Center) */}
        <AnimatePresence>
          {isNotifDrawerOpen && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }} onClick={() => setIsNotifDrawerOpen(false)} className="fixed inset-0 bg-black z-45 cursor-pointer" />
              <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25 }} className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-background border-l border-border/80 z-50 overflow-y-auto p-6 text-left flex flex-col justify-between shadow-2xl">
                <div>
                  <div className="flex justify-between items-center border-b border-border/40 pb-4 mb-4 select-none">
                    <div className="flex items-center gap-2">
                      <Bell size={18} className="text-primary animate-pulse" />
                      <h2 className="text-sm font-extrabold font-heading text-foreground uppercase">Global Operations Feed</h2>
                    </div>
                    <button onClick={() => setIsNotifDrawerOpen(false)} className="p-1.5 rounded-xl hover:bg-muted text-muted-foreground"><X size={16} /></button>
                  </div>

                  {/* Search and Filters */}
                  <div className="space-y-3 mb-4 select-none">
                    <input
                      type="text"
                      placeholder="Search notifications..."
                      value={notifSearch}
                      onChange={(e) => setNotifSearch(e.target.value)}
                      className="h-9 w-full rounded border border-border bg-card px-3 focus:outline-none text-xs font-semibold"
                    />
                    <div className="flex flex-wrap gap-1.5">
                      {["All", "High", "Medium", "Low"].map(pr => (
                        <button
                          key={pr}
                          onClick={() => setNotifFilter(pr)}
                          className={`text-[8.5px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded border ${
                            notifFilter === pr ? "bg-primary text-white border-primary" : "bg-card text-muted-foreground border-border hover:bg-muted"
                          }`}
                        >
                          {pr} Priority
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* List */}
                  <div className="space-y-2.5 max-h-[calc(100vh-230px)] overflow-y-auto pr-1">
                    {filteredNotifs.length === 0 ? (
                      <div className="text-center py-10 text-xs text-muted-foreground/60 select-none">No active notifications.</div>
                    ) : (
                      filteredNotifs.map(n => {
                        const prioColor = n.priority === "High" ? "bg-rose-500/10 text-rose-500" :
                                         n.priority === "Medium" ? "bg-amber-500/10 text-amber-500" : "bg-slate-500/10 text-slate-500";
                        return (
                          <div key={n.id} className={`p-3.5 border rounded-lg text-xs font-semibold flex flex-col justify-between gap-2 relative transition-all ${
                            n.read ? "bg-muted/15 border-border/40" : "bg-primary/5 border-primary/20 shadow-soft"
                          }`}>
                            <div className="flex justify-between items-start gap-2 select-none">
                              <span className={`text-[8px] font-black uppercase px-1.5 py-0.2 rounded ${prioColor}`}>{n.priority}</span>
                              <span className="text-[9px] text-muted-foreground/60 font-extrabold">{new Date(n.timestamp).toLocaleTimeString()}</span>
                            </div>
                            <div>
                              <h4 className="text-foreground font-black text-[12px]">{n.title}</h4>
                              <p className="text-muted-foreground/80 text-[10px] mt-1 leading-relaxed">{n.message}</p>
                            </div>
                            <div className="flex justify-end gap-1.5 pt-2 border-t border-border/10">
                              {!n.read && (
                                <button onClick={() => handleMarkRead(n.id)} className="p-1 hover:bg-emerald-500/10 text-emerald-500 rounded border border-border/40" title="Mark as Read">
                                  <Check size={12} />
                                </button>
                              )}
                              <button onClick={() => handleArchiveNotif(n.id)} className="p-1 hover:bg-rose-500/10 text-rose-500 rounded border border-border/40" title="Archive Announcement">
                                <Archive size={12} />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-border/40 flex gap-2">
                  <Button onClick={handleMarkAllRead} variant="outline" className="flex-1 text-[10px] font-extrabold uppercase tracking-wider h-10 border-border bg-card">Mark All Read</Button>
                  <Button onClick={() => setIsNotifDrawerOpen(false)} className="flex-1 text-[10px] font-extrabold uppercase tracking-wider h-10">Close Feed</Button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

      </div>
    </RequireAdmin>
  );
}
