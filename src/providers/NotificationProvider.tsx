"use client";

import React, { createContext, useContext, useState } from "react";
import { toast } from "sonner";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  addNotification: (title: string, message: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: "n-live",
      title: "Upcoming Live Class",
      message: "Keyboard Practice Session with Aarav Sharma starts in 1 hour.",
      isRead: false,
      createdAt: "2026-06-30T17:45:00.000Z",
    },
    {
      id: "n-quiz",
      title: "Weekly Quiz Available",
      message: "Weekly derivatives and calculus challenge is now active. Attempt now to earn 50 Coins!",
      isRead: false,
      createdAt: "2026-06-30T16:00:00.000Z",
    },
    {
      id: "n-assign",
      title: "Assignment Due",
      message: "Task 2: Calculus Limits due in 2 days. Submit worksheet PDF early.",
      isRead: false,
      createdAt: "2026-06-30T13:00:00.000Z",
    },
    {
      id: "n-notes",
      title: "Tutor uploaded Notes",
      message: "Sneha Iyer uploaded Kuchipudi hand mudras revision PDF helper notes.",
      isRead: false,
      createdAt: "2026-06-30T06:00:00.000Z",
    },
    {
      id: "n-pay",
      title: "Payment Success",
      message: "Payment of ₹1500 for Python Masterclass checkout was processed successfully.",
      isRead: true,
      createdAt: "2026-06-29T18:00:00.000Z",
    },
    {
      id: "n-cert",
      title: "Certificate Ready",
      message: "Your Pencil Sketching & Drawing certificate is ready! Verification ID: EE-CERT-904128.",
      isRead: true,
      createdAt: "2026-06-28T18:00:00.000Z",
    },
    {
      id: "n-reco",
      title: "New Recommended Course",
      message: "Based on drawing performance: Advanced DSLR Photography has been recommended.",
      isRead: true,
      createdAt: "2026-06-27T18:00:00.000Z",
    },
    {
      id: "n-lead",
      title: "Leaderboard Results",
      message: "Leaderboard Update: You are currently ranked #4 in student points! Keep up the momentum.",
      isRead: true,
      createdAt: "2026-06-26T18:00:00.000Z",
    },
    {
      id: "n-challenge",
      title: "Weekly Challenge",
      message: "Complete 3 coding practice modules to earn a bonus badge & 100 Coins.",
      isRead: true,
      createdAt: "2026-06-25T18:00:00.000Z",
    },
    {
      id: "n-competition",
      title: "Skill Competition",
      message: "Extracurricular competition: Next Gen Drawing Championship entries open on Friday.",
      isRead: true,
      createdAt: "2026-06-24T18:00:00.000Z",
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Reactively track network connectivity
  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOnline = () => {
      toast.success("You are back online!", {
        description: "EduEarn is synced with the live server.",
      });
    };

    const handleOffline = () => {
      toast.error("You are currently offline.", {
        description: "Please check your network connectivity status.",
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const addNotification = (title: string, message: string) => {
    const newItem: NotificationItem = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      message,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [newItem, ...prev]);
    toast.success(`${title}: ${message}`);
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    toast.success("All notifications marked as read");
  };

  const clearNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}
