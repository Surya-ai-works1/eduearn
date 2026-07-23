"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { CalendarDays, Plus } from "lucide-react";
import { Button } from "../../components/ui/button";
import { toast } from "sonner";
import type { LiveSession } from "./types";

interface CalendarViewProps {
  onScheduleLive: () => void;
  liveSessions: LiveSession[];
}

export const CalendarView = React.memo(function CalendarView({
  onScheduleLive,
  liveSessions,
}: CalendarViewProps) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const today = useMemo(() => new Date(), []);
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const startDay = startOfMonth.getDay();

  // Compute event days from real live sessions
  const eventDayMap = useMemo(() => {
    const map = new Map<number, LiveSession[]>();
    liveSessions.forEach((session) => {
      // Try to parse a day number from the session time string
      // e.g. "Today, 5:00 PM IST" → today's date; fall back to today
      const raw = session.time || "";
      const parsed = new Date(raw);
      const dayNum = !isNaN(parsed.getTime())
        ? parsed.getDate()
        : today.getDate();

      if (!map.has(dayNum)) map.set(dayNum, []);
      map.get(dayNum)!.push(session);
    });
    return map;
  }, [liveSessions, today]);

  // Upcoming sessions sorted by date (show up to 3)
  const upcomingSessions = useMemo(
    () =>
      liveSessions
        .filter((s) => s.status === "Scheduled")
        .slice(0, 3),
    [liveSessions]
  );

  return (
    <motion.div
      key="tutor-calendar"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-5"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-heading font-extrabold text-foreground">Calendar</h2>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {today.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </p>
        </div>
        <Button onClick={onScheduleLive} size="sm" className="h-9 gap-1 shadow-soft">
          <Plus size={14} /> Schedule Class
        </Button>
      </div>

      <div className="card-surface rounded-card p-5 shadow-soft">
        {/* Days of week */}
        <div className="grid grid-cols-7 mb-2">
          {days.map((d) => (
            <div
              key={d}
              className="text-center text-[9px] font-extrabold uppercase text-muted-foreground py-2"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Date grid */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: startDay }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const isToday = day === today.getDate();
            const sessions = eventDayMap.get(day) || [];
            const hasEvent = sessions.length > 0;
            return (
              <button
                key={day}
                onClick={() => {
                  if (hasEvent) {
                    const names = sessions.map((s) => s.title).join(", ");
                    toast.info(`${sessions.length} session(s): ${names}`);
                  } else {
                    toast.info("Click 'Schedule Class' to add a session.");
                  }
                }}
                className={`aspect-square flex flex-col items-center justify-center rounded-lg text-xs font-bold transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                  isToday
                    ? "bg-primary text-primary-foreground"
                    : hasEvent
                    ? "bg-primary/10 text-primary hover:bg-primary/20"
                    : "hover:bg-muted/50 text-foreground"
                }`}
              >
                <span>{day}</span>
                {hasEvent && !isToday && (
                  <div className="w-1 h-1 rounded-full bg-primary mt-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Upcoming Events — real data */}
        <div className="card-surface rounded-card p-4 shadow-soft">
          <h4 className="text-xs font-heading font-extrabold text-foreground border-b border-border/40 pb-2 mb-3">
            Upcoming Sessions
          </h4>
          {upcomingSessions.length === 0 ? (
            <div className="py-6 text-center">
              <CalendarDays size={20} className="text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">No upcoming sessions</p>
              <button
                onClick={onScheduleLive}
                className="text-[10px] font-bold text-primary hover:underline mt-1 cursor-pointer"
              >
                Schedule one →
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {upcomingSessions.map((session) => (
                <div key={session.id} className="flex items-center gap-3 p-2 bg-muted/30 rounded-card">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                    <CalendarDays size={14} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground truncate">{session.title}</p>
                    <p className="text-[9px] text-muted-foreground">{session.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Availability */}
        <div className="card-surface rounded-card p-4 shadow-soft">
          <h4 className="text-xs font-heading font-extrabold text-foreground border-b border-border/40 pb-2 mb-3">
            Availability
          </h4>
          <div className="space-y-2">
            {[
              { days: "Mon–Wed", available: true },
              { days: "Thu–Fri", available: true },
              { days: "Sat–Sun", available: false },
            ].map(({ days: dayLabel, available }) => (
              <div key={dayLabel} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                <span className="text-xs font-semibold text-foreground">{dayLabel}</span>
                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                    available
                      ? "text-emerald-500 bg-emerald-500/10"
                      : "text-muted-foreground bg-muted"
                  }`}
                >
                  {available ? "Available" : "Unavailable"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
});
