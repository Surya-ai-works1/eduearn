"use client";

import React, { useState, useCallback } from "react";
import {
  Menu,
  Bell,
  Plus,
  ChevronRight,
  ChevronDown,
  BookOpen,
  Video,
  Upload,
  FileText,
  DollarSign,
} from "lucide-react";
import { ThemeToggle } from "../theme-toggle";

const BREADCRUMB_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  courses: "Courses",
  students: "Students",
  "live-classes": "Live Classes",
  assignments: "Assignments",
  calendar: "Calendar",
  resources: "Resources",
  "ai-studio": "AI Studio",
  analytics: "Analytics",
  finance: "Finance",
  reviews: "Reviews",
  messages: "Messages",
  community: "Community",
  settings: "Settings",
};

interface QuickAction {
  label: string;
  icon: React.ElementType;
  tabId: string;
  extra?: () => void;
}

const QUICK_ACTIONS: QuickAction[] = [
  { label: "Create Course", icon: BookOpen, tabId: "courses" },
  { label: "Schedule Live Class", icon: Video, tabId: "live-classes" },
  { label: "Upload Resource", icon: Upload, tabId: "resources" },
  { label: "Grade Assignments", icon: FileText, tabId: "assignments" },
  { label: "Withdraw Earnings", icon: DollarSign, tabId: "finance" },
];

interface TutorHeaderProps {
  activeTab: string;
  isCurriculumBuilderOpen?: boolean;
  onMobileMenuOpen: () => void;
  onTabChange: (tab: string) => void;
  notificationCount?: number;
}

export const TutorHeader = React.memo(function TutorHeader({
  activeTab,
  isCurriculumBuilderOpen,
  onMobileMenuOpen,
  onTabChange,
  notificationCount = 0,
}: TutorHeaderProps) {
  const [isQuickMenuOpen, setIsQuickMenuOpen] = useState(false);

  const currentLabel = isCurriculumBuilderOpen
    ? "Curriculum Builder"
    : BREADCRUMB_LABELS[activeTab] || activeTab;

  const handleQuickAction = useCallback(
    (action: QuickAction) => {
      onTabChange(action.tabId);
      setIsQuickMenuOpen(false);
      if (action.extra) action.extra();
    },
    [onTabChange]
  );

  return (
    <header className="h-14 px-4 sm:px-6 flex items-center justify-between navbar-surface-blur border-b border-border/40 relative z-30 shrink-0">
      {/* Left: Mobile menu + Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuOpen}
          className="md:hidden p-1.5 hover:bg-muted rounded-button cursor-pointer"
          aria-label="Open menu"
        >
          <Menu size={18} />
        </button>

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-[11px] font-semibold" aria-label="Breadcrumb">
          <span className="text-muted-foreground hidden sm:inline">Tutor</span>
          <ChevronRight size={11} className="text-muted-foreground/60 hidden sm:inline" />
          <span className="text-foreground font-bold">{currentLabel}</span>
        </nav>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Quick Create */}
        <div className="relative">
          <button
            onClick={() => setIsQuickMenuOpen((p) => !p)}
            className="flex items-center gap-1.5 h-8 px-3 bg-primary text-white text-xs font-bold rounded-button hover:bg-primary/90 transition-colors shadow-soft cursor-pointer"
          >
            <Plus size={13} />
            <span className="hidden sm:inline">Create</span>
            <ChevronDown size={11} className={`transition-transform ${isQuickMenuOpen ? "rotate-180" : ""}`} />
          </button>

          {isQuickMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsQuickMenuOpen(false)}
              />
              <div className="absolute right-0 top-full mt-1.5 w-48 bg-card border border-border rounded-card shadow-floating z-50 py-1 overflow-hidden">
                {QUICK_ACTIONS.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.tabId}
                      onClick={() => handleQuickAction(action)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                      <Icon size={13} className="text-primary" />
                      {action.label}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Notification Bell — navigates to notifications tab */}
        <button
          onClick={() => onTabChange("notifications")}
          className="relative p-1.5 hover:bg-muted rounded-button transition-colors cursor-pointer"
          aria-label="View notifications"
        >
          <Bell size={17} className="text-muted-foreground" />
          {notificationCount > 0 && (
            <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-primary rounded-full border border-card" />
          )}
        </button>

        {/* Theme Toggle */}
        <ThemeToggle />
      </div>
    </header>
  );
});
