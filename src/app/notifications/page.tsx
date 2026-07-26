"use client";

import React, { useState, useEffect } from "react";
import { Container } from "../../components/layout/Container";
import { PageWrapper } from "../../components/layout/PageWrapper";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Divider } from "../../components/ui/divider";
import { 
  Bell, 
  CheckCheck, 
  Archive, 
  Trash2, 
  ShieldAlert, 
  Award, 
  Video, 
  BookOpen, 
  Coins, 
  Info,
  Clock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { communicationService, Notification } from "../../features/communication/services/communicationService";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeFilter, setActiveFilter] = useState<"all" | "unread" | "archived">("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    setNotifications(communicationService.getNotifications());
  }, []);

  const handleMarkRead = (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    setNotifications(updated);
    communicationService.updateNotifications(updated);
    toast.success("Notification marked as read");
  };

  const handleArchive = (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, archived: true } : n));
    setNotifications(updated);
    communicationService.updateNotifications(updated);
    toast.success("Notification archived");
  };

  const handleDelete = (id: string) => {
    const updated = notifications.filter((n) => n.id !== id);
    setNotifications(updated);
    communicationService.updateNotifications(updated);
    toast.error("Notification deleted");
  };

  const handleMarkAllRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    communicationService.updateNotifications(updated);
    toast.success("All notifications marked as read");
  };

  const handleArchiveAll = () => {
    const updated = notifications.map((n) => ({ ...n, archived: true }));
    setNotifications(updated);
    communicationService.updateNotifications(updated);
    toast.info("All notifications archived");
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "certificate":
        return <Award className="text-amber-500" size={16} />;
      case "live-class":
        return <Video className="text-blue-500" size={16} />;
      case "assignment":
        return <BookOpen className="text-emerald-500" size={16} />;
      case "payment":
      case "wallet":
      case "refund":
        return <Coins className="text-indigo-500" size={16} />;
      case "security":
        return <ShieldAlert className="text-rose-500" size={16} />;
      default:
        return <Info className="text-slate-500" size={16} />;
    }
  };

  // Filter computations
  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === "unread" && n.read) return false;
    if (activeFilter === "archived" && !n.archived) return false;
    if (activeFilter !== "archived" && n.archived) return false;
    
    if (selectedCategory !== "all" && n.category !== selectedCategory) return false;
    return true;
  });

  const categories = [
    { id: "all", label: "All Categories" },
    { id: "certificate", label: "Certificates" },
    { id: "live-class", label: "Live Sessions" },
    { id: "assignment", label: "Assignments" },
    { id: "payment", label: "Finance & Wallet" },
    { id: "security", label: "Security & Platform" },
  ];

  return (
    <PageWrapper>
      <Container className="py-12 max-w-5xl select-none text-left">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* 1. Sidebar Category Filters */}
          <div className="md:col-span-3 space-y-6">
            <div className="flex items-center gap-2">
              <Bell className="text-primary" size={20} />
              <h1 className="text-lg font-heading font-black text-foreground">Notifications</h1>
            </div>

            <div className="flex flex-col gap-1 bg-card border border-border/80 p-2 rounded-2xl shadow-soft">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition ${
                    selectedCategory === cat.id
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Central Notifications Feed */}
          <div className="md:col-span-9 space-y-6">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
              <div className="flex gap-1.5 bg-card border border-border p-1 rounded-xl text-xs">
                {(["all", "unread", "archived"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setActiveFilter(f)}
                    className={`px-3 py-1.5 rounded-lg font-bold capitalize transition ${
                      activeFilter === f
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              {filteredNotifications.length > 0 && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleMarkAllRead} className="text-[10px] uppercase font-bold gap-1">
                    <CheckCheck size={12} /> Mark all read
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleArchiveAll} className="text-[10px] uppercase font-bold gap-1">
                    <Archive size={12} /> Archive all
                  </Button>
                </div>
              )}
            </div>

            {/* List */}
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {filteredNotifications.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="py-20 text-center text-xs text-muted-foreground bg-card border border-border/80 rounded-3xl"
                  >
                    No notifications in this filter category.
                  </motion.div>
                ) : (
                  filteredNotifications.map((noti) => (
                    <motion.div
                      key={noti.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className={`p-4 border rounded-2xl shadow-soft transition flex gap-4 bg-card ${
                        noti.read ? "border-border/60 opacity-80" : "border-primary/20 bg-primary/5"
                      }`}
                    >
                      <div className="p-2.5 bg-muted/40 rounded-xl shrink-0 h-10 w-10 flex items-center justify-center border border-border">
                        {getCategoryIcon(noti.category)}
                      </div>

                      <div className="grow space-y-1">
                        <div className="flex justify-between items-start gap-4">
                          <h4 className="font-heading font-extrabold text-xs text-foreground">
                            {noti.title}
                          </h4>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-mono">
                            <Clock size={10} /> {noti.createdAt}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed font-light">
                          {noti.content}
                        </p>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 pt-2 text-[10px] font-bold text-muted-foreground select-none">
                          {!noti.read && (
                            <button
                              onClick={() => handleMarkRead(noti.id)}
                              className="hover:text-primary transition"
                            >
                              Mark Read
                            </button>
                          )}
                          {!noti.archived && (
                            <>
                              {!noti.read && <span className="text-muted-foreground/30">•</span>}
                              <button
                                onClick={() => handleArchive(noti.id)}
                                className="hover:text-foreground transition"
                              >
                                Archive
                              </button>
                            </>
                          )}
                          <span className="text-muted-foreground/30">•</span>
                          <button
                            onClick={() => handleDelete(noti.id)}
                            className="hover:text-red-500 transition"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>
      </Container>
    </PageWrapper>
  );
}
