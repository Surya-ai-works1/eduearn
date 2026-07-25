"use client";

import React, { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, BellOff, Check, CheckCheck, Trash2, BookOpen, FileText, Award, Video, DollarSign, Star, Settings } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../../components/ui/button";
import type { Notification } from "../../lib/types/notification";

const TYPE_ICON_MAP: Record<string, React.ElementType> = {
  Course: BookOpen,
  Assignment: FileText,
  Quiz: FileText,
  Certificate: Award,
  "Live Class": Video,
  Payment: DollarSign,
  Tutor: Star,
  Admin: Settings,
  System: Bell,
};

const TYPE_COLOR_MAP: Record<string, string> = {
  Course: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  Assignment: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  Quiz: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  Certificate: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  "Live Class": "bg-rose-500/10 text-rose-500 border-rose-500/20",
  Payment: "bg-green-500/10 text-green-500 border-green-500/20",
  Tutor: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  Admin: "bg-muted/50 text-muted-foreground border-border",
  System: "bg-primary/10 text-primary border-primary/20",
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function TutorNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/tutor/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch {
      // silently fail - notifications are non-critical
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkRead = useCallback(async (id: string) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    try {
      await fetch(`/api/tutor/notifications/${id}`, { method: "PATCH" });
    } catch {
      toast.error("Failed to mark as read");
    }
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    try {
      await fetch(`/api/tutor/notifications/${id}`, { method: "DELETE" });
      toast.success("Notification removed");
    } catch {
      toast.error("Failed to delete notification");
    }
  }, []);

  const handleMarkAllRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try {
      await fetch("/api/tutor/notifications/read-all", { method: "POST" });
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Failed to mark all as read");
    }
  }, []);

  const displayed = filter === "unread"
    ? notifications.filter((n) => !n.isRead)
    : notifications;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <motion.div
      key="tutor-notifications"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="space-y-5"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-heading font-extrabold text-foreground flex items-center gap-2">
            <Bell size={16} className="text-primary" />
            Notifications
            {unreadCount > 0 && (
              <span className="ml-1 text-[9px] font-extrabold bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full uppercase">
                {unreadCount} new
              </span>
            )}
          </h2>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {notifications.length} total · {unreadCount} unread
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <div className="flex items-center border border-border rounded-input overflow-hidden">
            {(["all", "unread"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 h-8 text-[10px] font-bold capitalize transition-colors cursor-pointer ${
                  filter === f
                    ? "bg-primary text-foreground"
                    : "bg-card text-muted-foreground hover:text-foreground hover:bg-muted/30"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {unreadCount > 0 && (
            <Button
              onClick={handleMarkAllRead}
              size="sm"
              variant="outline"
              className="h-8 text-[10px] gap-1.5 font-bold"
            >
              <CheckCheck size={11} />
              Mark all read
            </Button>
          )}
        </div>
      </div>

      {/* Notifications list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 rounded-card bg-muted/20 animate-pulse border border-border"
            />
          ))}
        </div>
      ) : displayed.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center space-y-3"
        >
          <div className="w-14 h-14 rounded-full bg-muted/30 flex items-center justify-center">
            <BellOff size={24} className="text-muted-foreground/50" />
          </div>
          <p className="text-sm font-bold text-foreground">
            {filter === "unread" ? "All caught up!" : "No notifications yet"}
          </p>
          <p className="text-[11px] text-muted-foreground max-w-xs">
            {filter === "unread"
              ? "You have no unread notifications. Check back later."
              : "Notifications about your students, courses, and earnings will appear here."}
          </p>
          {filter === "unread" && (
            <Button
              onClick={() => setFilter("all")}
              size="sm"
              variant="outline"
              className="h-8 text-[10px] mt-1"
            >
              View all notifications
            </Button>
          )}
        </motion.div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {displayed.map((notif) => {
              const IconComp = TYPE_ICON_MAP[notif.type] || Bell;
              const colorClass = TYPE_COLOR_MAP[notif.type] || TYPE_COLOR_MAP.System;

              return (
                <motion.div
                  key={notif.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => !notif.isRead && handleMarkRead(notif.id)}
                  className={`relative flex items-start gap-3.5 p-4 rounded-card border shadow-soft transition-all cursor-pointer group ${
                    notif.isRead
                      ? "bg-card border-border opacity-70 hover:opacity-100"
                      : "bg-card border-primary/20 ring-1 ring-primary/10 hover:border-primary/40"
                  }`}
                >
                  {/* Unread dot */}
                  {!notif.isRead && (
                    <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-primary shrink-0" />
                  )}

                  {/* Icon */}
                  <div className={`p-2 rounded-xl border shrink-0 mt-0.5 ${colorClass}`}>
                    <IconComp size={14} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pr-16">
                    <p className={`text-xs font-bold leading-snug ${notif.isRead ? "text-muted-foreground" : "text-foreground"}`}>
                      {notif.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                      {notif.message}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-[9px] font-bold text-muted-foreground/60">
                        {timeAgo(notif.createdAt)}
                      </span>
                      <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded border ${colorClass}`}>
                        {notif.type}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!notif.isRead && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleMarkRead(notif.id); }}
                        title="Mark as read"
                        className="p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors cursor-pointer"
                      >
                        <Check size={12} />
                      </button>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(notif.id); }}
                      title="Delete"
                      className="p-1.5 rounded-lg hover:bg-rose-500/10 text-rose-500/70 transition-colors cursor-pointer"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
