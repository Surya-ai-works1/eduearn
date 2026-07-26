"use client";

import React, { useState, useMemo } from "react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bell, Search, Sparkles, Sun, Moon, Laptop, Menu,
  Award, Flame, Wallet, Check, Trash2, ArrowUpRight
} from "lucide-react";
import { RequireLearner } from "../../../../features/auth/components/RouteGuard";

interface NotificationItem {
  id: string;
  title: string;
  text: string;
  time: string;
  read: boolean;
  type: string;
}

interface TopNavigationProps {
  user: any;
  avatarPreview: string | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isSidebarCollapsed: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  coins: number;
  xp: number;
  streak: number;
  learningLevel: string;
  notifications: NotificationItem[];
  handleMarkAllRead: () => void;
  handleMarkOneRead: (id: string) => void;
  handleDeleteNotification: (id: string) => void;
  setAiAssistantOpen: (open: boolean) => void;
  setAiAssistantType: (type: any) => void;
  courseSearch: string;
  setCourseSearch: (val: string) => void;
  welcomeGreeting: string;
}

export function TopNavigation({
  user,
  avatarPreview,
  activeTab,
  setActiveTab,
  isSidebarCollapsed,
  setIsMobileMenuOpen,
  coins,
  xp,
  streak,
  learningLevel,
  notifications,
  handleMarkAllRead,
  handleMarkOneRead,
  handleDeleteNotification,
  setAiAssistantOpen,
  setAiAssistantType,
  courseSearch,
  setCourseSearch,
  welcomeGreeting,
}: TopNavigationProps) {
  const { theme, setTheme } = useTheme();
  const [notifOpen, setNotifOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  return (
    <header className="fixed top-0 right-0 h-16 px-4 sm:px-6 flex items-center justify-between bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 z-40 transition-all duration-300 select-none left-0 md:left-auto right-0"
      style={{
        left: typeof window !== "undefined" && window.innerWidth >= 768 
          ? (isSidebarCollapsed ? "80px" : "256px") 
          : "0px"
      }}
    >
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="md:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer transition-colors"
          aria-label="Open mobile navigation"
        >
          <Menu size={20} />
        </button>
        
        {/* Search bar input widget */}
        <div className="relative max-w-xs hidden sm:block">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search skills & courses... (⌘K)"
            value={courseSearch}
            onChange={(e) => setCourseSearch(e.target.value)}
            className="w-64 pl-9 pr-4 py-1.5 text-xs bg-slate-100 dark:bg-slate-800/60 border-0 focus:ring-2 focus:ring-primary/40 rounded-xl placeholder-slate-400 text-slate-700 dark:text-slate-200 focus:outline-none transition-all"
          />
        </div>
        
        <h1 className="text-sm font-heading font-extrabold tracking-tight capitalize sm:hidden">
          {activeTab.replace("-", " ")}
        </h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Streak Flame */}
        <div className="flex items-center gap-1.5 border border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full px-2.5 py-1 text-[11px] font-bold shadow-soft">
          <Flame size={12} className="fill-current" />
          <span>{streak}d Streak</span>
        </div>

        {/* Coins Wallet */}
        <div className="flex items-center gap-1.5 border border-yellow-500/20 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 rounded-full px-2.5 py-1 text-[11px] font-bold shadow-soft">
          <Wallet size={12} className="fill-current" />
          <span>{coins} Coins</span>
        </div>

        {/* AI Assistant Button */}
        <button
          onClick={() => {
            setAiAssistantType("study");
            setAiAssistantOpen(true);
          }}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-primary dark:text-blue-400 rounded-xl cursor-pointer relative group transition-colors focus:outline-none"
          aria-label="Sparky AI Assistant"
        >
          <Sparkles size={18} className="animate-pulse" />
          <span className="absolute -top-1 -right-1 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => {
              setNotifOpen(!notifOpen);
              setThemeOpen(false);
            }}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl cursor-pointer relative transition-colors focus:outline-none"
            aria-label="View notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 bg-rose-500 text-white font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center border border-white dark:border-slate-900 shadow-soft">
                {unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {notifOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden text-left"
                >
                  <div className="p-4 border-b border-slate-100 dark:border-slate-800/60 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100">Notifications ({unreadCount})</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={() => {
                          handleMarkAllRead();
                          setNotifOpen(false);
                        }}
                        className="text-[10px] text-primary hover:underline font-bold focus:outline-none"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/40">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400">
                        No new notifications
                      </div>
                    ) : (
                      notifications.slice(0, 4).map((n) => (
                        <div
                          key={n.id}
                          className={`p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors flex gap-3 ${
                            !n.read ? "bg-blue-50/20 dark:bg-blue-950/10" : ""
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start gap-2">
                              <h5 className="text-[11px] font-bold text-slate-700 dark:text-slate-200 truncate">{n.title}</h5>
                              <span className="text-[9px] text-slate-400 shrink-0">{n.time}</span>
                            </div>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">{n.text}</p>
                            <div className="flex gap-3 mt-2">
                              {!n.read && (
                                <button
                                  onClick={() => handleMarkOneRead(n.id)}
                                  className="text-[9px] text-primary font-bold hover:underline flex items-center gap-0.5"
                                >
                                  <Check size={8} /> Read
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteNotification(n.id)}
                                className="text-[9px] text-rose-500 font-bold hover:underline flex items-center gap-0.5"
                              >
                                <Trash2 size={8} /> Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="p-2 border-t border-slate-100 dark:border-slate-800/60 text-center bg-slate-50/50 dark:bg-slate-900/50">
                    <button
                      onClick={() => {
                        setActiveTab("notifications");
                        setNotifOpen(false);
                      }}
                      className="text-[10px] text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 font-bold w-full py-1.5 focus:outline-none"
                    >
                      View all notifications
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Theme Selector Popover */}
        <div className="relative">
          <button
            onClick={() => {
              setThemeOpen(!themeOpen);
              setNotifOpen(false);
            }}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl cursor-pointer transition-colors focus:outline-none"
            aria-label="Toggle theme selector"
          >
            {theme === "dark" ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          <AnimatePresence>
            {themeOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setThemeOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-36 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 p-1.5 flex flex-col gap-0.5 text-left"
                >
                  {[
                    { key: "light", icon: Sun, label: "Light" },
                    { key: "dark", icon: Moon, label: "Dark" },
                    { key: "system", icon: Laptop, label: "System" },
                  ].map((t) => {
                    const Icon = t.icon;
                    return (
                      <button
                        key={t.key}
                        onClick={() => {
                          setTheme(t.key);
                          setThemeOpen(false);
                        }}
                        className={`flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer focus:outline-none ${
                          theme === t.key
                            ? "bg-primary text-white"
                            : "text-slate-650 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-850"
                        }`}
                      >
                        <Icon size={14} />
                        <span>{t.label}</span>
                      </button>
                    );
                  })}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* User avatar dropdown/profile navigation */}
        <button
          onClick={() => setActiveTab("settings")}
          className="w-8 h-8 rounded-full border-2 border-primary/20 hover:border-primary flex items-center justify-center font-bold text-xs overflow-hidden shrink-0 transition-colors focus:outline-none"
          title="Profile settings"
        >
          {avatarPreview ? (
            <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <span className="text-[10px] text-slate-800 dark:text-slate-100">{user?.fullName?.charAt(0) || "S"}</span>
          )}
        </button>
      </div>
    </header>
  );
}
export default TopNavigation;
