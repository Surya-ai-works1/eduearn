"use client";

import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Video,
  FileText,
  CalendarDays,
  FolderOpen,
  Sparkles,
  TrendingUp,
  DollarSign,
  Star,
  MessageSquare,
  Globe2,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
  LogOut,
  GraduationCap,
} from "lucide-react";

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isSidebarCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileMenuOpen: boolean;
  onCloseMobile: () => void;
  user: { fullName: string; role: string; avatarUrl?: string } | null;
  onLogout: () => void;
  pendingAssignments?: number;
  pendingReviews?: number;
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: "",
    items: [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Teaching",
    items: [
      { id: "courses", label: "Courses", icon: BookOpen },
      { id: "students", label: "Students", icon: Users },
      { id: "live-classes", label: "Live Classes", icon: Video },
      { id: "assignments", label: "Assignments", icon: FileText },
      { id: "calendar", label: "Calendar", icon: CalendarDays },
    ],
  },
  {
    label: "Content",
    items: [
      { id: "resources", label: "Resources", icon: FolderOpen },
      { id: "ai-studio", label: "AI Studio", icon: Sparkles },
    ],
  },
  {
    label: "Business",
    items: [
      { id: "analytics", label: "Analytics", icon: TrendingUp },
      { id: "finance", label: "Finance", icon: DollarSign },
      { id: "reviews", label: "Reviews", icon: Star },
    ],
  },
  {
    label: "Communication",
    items: [
      { id: "messages", label: "Messages", icon: MessageSquare },
      { id: "community", label: "Community", icon: Globe2 },
    ],
  },
  {
    label: "",
    items: [
      { id: "settings", label: "Settings", icon: Settings },
    ],
  },
];

function SidebarContent({
  activeTab,
  onTabChange,
  isSidebarCollapsed,
  user,
  onLogout,
  pendingAssignments = 0,
  pendingReviews = 0,
  onClose,
}: {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isSidebarCollapsed: boolean;
  user: SidebarProps["user"];
  onLogout: () => void;
  pendingAssignments?: number;
  pendingReviews?: number;
  onClose?: () => void;
}) {
  const badgeMap = useMemo<Record<string, number>>(() => ({
    assignments: pendingAssignments,
    reviews: pendingReviews,
  }), [pendingAssignments, pendingReviews]);

  return (
    <>
      {/* Header */}
      <div className="p-4 border-b border-border/40 flex items-center gap-3 shrink-0">
        <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary shrink-0 relative overflow-hidden text-sm">
          {user?.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            user?.fullName?.charAt(0) || "T"
          )}
        </div>
        {!isSidebarCollapsed && (
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-heading font-bold truncate text-foreground">{user?.fullName}</h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] uppercase tracking-wider font-bold text-primary">Online · Tutor</span>
            </div>
          </div>
        )}
        {onClose && (
          <button onClick={onClose} className="p-1 hover:bg-muted rounded cursor-pointer ml-auto">
            <X size={14} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 overflow-y-auto scrollbar-none space-y-0.5">
        {NAV_GROUPS.map((group, gi) => (
          <div key={gi} className={gi > 0 ? "mt-4" : ""}>
            {group.label && !isSidebarCollapsed && (
              <div className="px-3 py-1.5 mb-1">
                <span className="text-[9px] uppercase tracking-widest font-bold text-muted-foreground/60">
                  {group.label}
                </span>
              </div>
            )}
            {group.label && !isSidebarCollapsed && gi > 0 && (
              <div className="mx-3 h-px bg-border/40 mb-2" />
            )}
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const badge = badgeMap[item.id];
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  title={isSidebarCollapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-button text-xs font-semibold cursor-pointer transition-all duration-150 focus:outline-none relative group ${
                    isActive
                      ? "bg-primary text-white shadow-soft"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  } ${isSidebarCollapsed ? "justify-center" : ""}`}
                >
                  <Icon size={15} className="shrink-0" />
                  {!isSidebarCollapsed && (
                    <span className="truncate flex-1 text-left">{item.label}</span>
                  )}
                  {!isSidebarCollapsed && badge > 0 && (
                    <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded-full shrink-0 ${
                      isActive ? "bg-white/20 text-white" : "bg-primary/10 text-primary"
                    }`}>
                      {badge}
                    </span>
                  )}
                  {isSidebarCollapsed && badge > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary border border-card" />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-border/40 shrink-0">
        <button
          onClick={onLogout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-button text-xs font-semibold text-destructive hover:bg-destructive/5 transition-colors cursor-pointer focus:outline-none ${
            isSidebarCollapsed ? "justify-center" : ""
          }`}
        >
          <LogOut size={15} className="shrink-0" />
          {!isSidebarCollapsed && <span>Logout</span>}
        </button>
      </div>
    </>
  );
}

export const TutorSidebar = React.memo(function TutorSidebar({
  activeTab,
  onTabChange,
  isSidebarCollapsed,
  onToggleCollapse,
  isMobileMenuOpen,
  onCloseMobile,
  user,
  onLogout,
  pendingAssignments,
  pendingReviews,
}: SidebarProps) {
  return (
    <>
      {/* ─── Desktop Sidebar ─── */}
      <aside
        className={`sidebar-surface backdrop-blur-md hidden md:flex flex-col fixed top-0 left-0 bottom-0 h-screen z-50 transition-all duration-300 ${
          isSidebarCollapsed ? "w-[4.5rem]" : "w-64"
        }`}
      >
        <button
          onClick={onToggleCollapse}
          className="absolute -right-3 top-5 bg-primary text-white border-2 border-background rounded-full p-1 cursor-pointer hover:bg-primary/90 shadow-md focus:outline-none z-10"
          aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isSidebarCollapsed ? <ChevronRight size={11} /> : <ChevronLeft size={11} />}
        </button>

        {/* Logo area */}
        <div className={`flex items-center gap-2.5 p-4 border-b border-border/40 shrink-0 ${
          isSidebarCollapsed ? "justify-center" : ""
        }`}>
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <GraduationCap size={14} className="text-white" />
          </div>
          {!isSidebarCollapsed && (
            <span className="text-sm font-heading font-extrabold text-foreground tracking-tight">
              EduEarn
            </span>
          )}
        </div>

        <SidebarContent
          activeTab={activeTab}
          onTabChange={onTabChange}
          isSidebarCollapsed={isSidebarCollapsed}
          user={user}
          onLogout={onLogout}
          pendingAssignments={pendingAssignments}
          pendingReviews={pendingReviews}
        />
      </aside>

      {/* ─── Mobile Drawer ─── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onCloseMobile}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm md:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 w-64 bg-card border-r border-border z-50 flex flex-col md:hidden"
            >
              <div className="flex items-center gap-2.5 p-4 border-b border-border/40">
                <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                  <GraduationCap size={14} className="text-white" />
                </div>
                <span className="text-sm font-heading font-extrabold text-foreground tracking-tight flex-1">
                  EduEarn
                </span>
                <button onClick={onCloseMobile} className="p-1 hover:bg-muted rounded cursor-pointer">
                  <X size={14} />
                </button>
              </div>
              <SidebarContent
                activeTab={activeTab}
                onTabChange={(tab) => { onTabChange(tab); onCloseMobile(); }}
                isSidebarCollapsed={false}
                user={user}
                onLogout={onLogout}
                pendingAssignments={pendingAssignments}
                pendingReviews={pendingReviews}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
});
