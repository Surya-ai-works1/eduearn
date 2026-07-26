"use client";

import React, { useMemo } from "react";
import { Bell, Check, Trash2, CheckCircle } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { DashboardCard } from "./DashboardCard";

interface NotificationItem {
  id: string;
  title: string;
  text: string;
  time: string;
  read: boolean;
  type: string;
}

interface NotificationsPanelProps {
  notifications: NotificationItem[];
  handleMarkAllRead: () => void;
  handleMarkOneRead: (id: string) => void;
  handleDeleteNotification: (id: string) => void;
}

export function NotificationsPanel({
  notifications,
  handleMarkAllRead,
  handleMarkOneRead,
  handleDeleteNotification,
}: NotificationsPanelProps) {
  
  // Group notifications dynamically based on timestamp
  const groupedNotifications = useMemo(() => {
    const today: NotificationItem[] = [];
    const yesterday: NotificationItem[] = [];
    const earlier: NotificationItem[] = [];

    notifications.forEach((item) => {
      const itemDate = new Date(item.time);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - itemDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 1 || item.time.toLowerCase() === "today") {
        today.push(item);
      } else if (diffDays === 2 || item.time.toLowerCase() === "yesterday") {
        yesterday.push(item);
      } else {
        earlier.push(item);
      }
    });

    return { today, yesterday, earlier };
  }, [notifications]);

  const hasNotifications = notifications.length > 0;

  return (
    <DashboardCard variant="default" hoverEffect="none" className="p-6 border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900/60">
      <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-heading font-black uppercase tracking-wider text-slate-800 dark:text-slate-250">
            Notifications Center
          </h3>
        </div>
        
        {hasNotifications && (
          <Button onClick={handleMarkAllRead} size="sm" variant="outline" className="text-xs h-8 font-bold gap-1 rounded-xl">
            <CheckCircle className="w-3.5 h-3.5" /> Mark all read
          </Button>
        )}
      </div>

      {!hasNotifications ? (
        <div className="text-center p-8 text-slate-400 text-xs">
          No notifications found. You are completely up to date!
        </div>
      ) : (
        <div className="space-y-6 text-left">
          {/* Today Group */}
          {groupedNotifications.today.length > 0 && (
            <div className="space-y-3">
              <h5 className="text-[10px] font-black uppercase text-slate-450 dark:text-slate-500 tracking-wider">Today</h5>
              <div className="divide-y divide-slate-100 dark:divide-slate-800/40">
                {groupedNotifications.today.map((notif) => (
                  <div key={notif.id} className="py-3 flex justify-between gap-4 first:pt-0 last:pb-0">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {!notif.read && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />}
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{notif.title}</span>
                      </div>
                      <p className="text-[10px] text-slate-550 dark:text-slate-400 leading-relaxed pl-3.5">{notif.text}</p>
                    </div>
                    
                    <div className="flex items-start gap-2 pt-0.5 shrink-0">
                      {!notif.read && (
                        <button
                          onClick={() => handleMarkOneRead(notif.id)}
                          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-primary rounded-lg cursor-pointer focus:outline-none"
                          title="Mark as read"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteNotification(notif.id)}
                        className="p-1 hover:bg-slate-150 dark:hover:bg-slate-850 text-rose-500 rounded-lg cursor-pointer focus:outline-none"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Yesterday Group */}
          {groupedNotifications.yesterday.length > 0 && (
            <div className="space-y-3">
              <h5 className="text-[10px] font-black uppercase text-slate-450 dark:text-slate-500 tracking-wider">Yesterday</h5>
              <div className="divide-y divide-slate-100 dark:divide-slate-800/40">
                {groupedNotifications.yesterday.map((notif) => (
                  <div key={notif.id} className="py-3 flex justify-between gap-4 first:pt-0 last:pb-0">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {!notif.read && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />}
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{notif.title}</span>
                      </div>
                      <p className="text-[10px] text-slate-550 dark:text-slate-400 leading-relaxed pl-3.5">{notif.text}</p>
                    </div>
                    
                    <div className="flex items-start gap-2 pt-0.5 shrink-0">
                      {!notif.read && (
                        <button
                          onClick={() => handleMarkOneRead(notif.id)}
                          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-primary rounded-lg cursor-pointer focus:outline-none"
                          title="Mark as read"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteNotification(notif.id)}
                        className="p-1 hover:bg-slate-150 dark:hover:bg-slate-850 text-rose-500 rounded-lg cursor-pointer focus:outline-none"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Earlier Group */}
          {groupedNotifications.earlier.length > 0 && (
            <div className="space-y-3">
              <h5 className="text-[10px] font-black uppercase text-slate-450 dark:text-slate-500 tracking-wider">Earlier</h5>
              <div className="divide-y divide-slate-100 dark:divide-slate-800/40">
                {groupedNotifications.earlier.map((notif) => (
                  <div key={notif.id} className="py-3 flex justify-between gap-4 first:pt-0 last:pb-0">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {!notif.read && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />}
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{notif.title}</span>
                      </div>
                      <p className="text-[10px] text-slate-550 dark:text-slate-400 leading-relaxed pl-3.5">{notif.text}</p>
                    </div>
                    
                    <div className="flex items-start gap-2 pt-0.5 shrink-0">
                      {!notif.read && (
                        <button
                          onClick={() => handleMarkOneRead(notif.id)}
                          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-primary rounded-lg cursor-pointer focus:outline-none"
                          title="Mark as read"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteNotification(notif.id)}
                        className="p-1 hover:bg-slate-150 dark:hover:bg-slate-850 text-rose-500 rounded-lg cursor-pointer focus:outline-none"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </DashboardCard>
  );
}
export default NotificationsPanel;
