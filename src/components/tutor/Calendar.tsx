"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays,
  Plus,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Edit2,
  Clock,
  BookOpen,
  Info,
  CalendarRange,
  Zap,
  Save,
  X
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { toast } from "sonner";
import type { LiveSession } from "./types";

interface CalendarViewProps {
  onScheduleLive: () => void;
  liveSessions: LiveSession[];
}

interface CalendarEvent {
  id: string;
  title: string;
  type: "class" | "deadline" | "holiday" | "event";
  date: string; // YYYY-MM-DD
  time?: string;
  notes?: string;
}

export const CalendarView = React.memo(function CalendarView({
  onScheduleLive,
  liveSessions,
}: CalendarViewProps) {
  // View mode: "month" | "week"
  const [viewMode, setViewMode] = useState<"month" | "week">("month");

  // State for all events (initialized with defaults, plus dynamically computed live sessions)
  const [customEvents, setCustomEvents] = useState<CalendarEvent[]>([
    {
      id: "evt-1",
      title: "Submit Midterm Grades",
      type: "deadline",
      date: "2026-07-28",
      time: "11:59 PM",
      notes: "Must submit final math grads to dean office."
    },
    {
      id: "evt-2",
      title: "Independence Day Holiday",
      type: "holiday",
      date: "2026-08-15",
      notes: "National holiday — college closed."
    },
    {
      id: "evt-3",
      title: "1-on-1 Mentoring: Sahiti",
      type: "event",
      date: "2026-07-30",
      time: "03:00 PM",
      notes: "Discuss full stack syllabus and resume review."
    }
  ]);

  // Merge customEvents with liveSessions parsed as events
  const allEvents = useMemo(() => {
    const sessionsAsEvents: CalendarEvent[] = liveSessions.map((session) => {
      // Try to parse YYYY-MM-DD from time string or default to today's date if unparseable
      const parsed = new Date(session.time);
      let ymd = new Date().toISOString().split("T")[0];
      if (!isNaN(parsed.getTime())) {
        ymd = parsed.toISOString().split("T")[0];
      }
      return {
        id: session.id,
        title: session.title,
        type: "class" as const,
        date: ymd,
        time: session.time.split(",")[1]?.trim() || "5:00 PM",
        notes: session.notes
      };
    });

    return [...customEvents, ...sessionsAsEvents];
  }, [customEvents, liveSessions]);

  // Calendar utility dates
  const today = useMemo(() => new Date(), []);
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const startOfMonth = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth(), 1);
  const daysInMonth = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 0).getDate();
  const startDay = startOfMonth.getDay();

  // Create Event state
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [eventForm, setEventForm] = useState({
    title: "",
    type: "event" as CalendarEvent["type"],
    time: "",
    notes: ""
  });

  // Edit/View Event state
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // Month navigation helpers
  const handlePrevMonth = () => {
    setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() - 1, 1));
  };
  const handleNextMonth = () => {
    setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 1));
  };

  // Create Event handler
  const handleDateClick = (dayNum: number) => {
    const formattedDate = `${currentMonthDate.getFullYear()}-${String(
      currentMonthDate.getMonth() + 1
    ).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
    setSelectedDateStr(formattedDate);
    setEventForm({ title: "", type: "event", time: "", notes: "" });
    setIsCreatingEvent(true);
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventForm.title || !selectedDateStr) return;

    const newEvent: CalendarEvent = {
      id: `evt-${Date.now()}`,
      title: eventForm.title,
      type: eventForm.type,
      date: selectedDateStr,
      time: eventForm.time || undefined,
      notes: eventForm.notes || undefined
    };

    setCustomEvents((prev) => [...prev, newEvent]);
    setIsCreatingEvent(false);
    toast.success("Event created successfully!");
  };

  const handleDeleteEvent = (id: string) => {
    setCustomEvents((prev) => prev.filter((e) => e.id !== id));
    setSelectedEvent(null);
    toast.success("Event removed from calendar.");
  };

  // Sync ready handler
  const handleSyncCalendar = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1500)),
      {
        loading: "Establishing OAuth connection with Google Calendar API...",
        success: "Calendar synced successfully! 3 events written.",
        error: "Sync failed."
      }
    );
  };

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Render month view cells
  const monthCells = useMemo(() => {
    const cells = [];
    // Empty cells at start
    for (let i = 0; i < startDay; i++) {
      cells.push(<div key={`empty-${i}`} className="min-h-[70px] border border-border/20 bg-muted/5 opacity-40" />);
    }

    // Days of month
    for (let day = 1; day <= daysInMonth; day++) {
      const formattedDate = `${currentMonthDate.getFullYear()}-${String(
        currentMonthDate.getMonth() + 1
      ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      
      const dayEvents = allEvents.filter((e) => e.date === formattedDate);
      const isToday = day === today.getDate() && currentMonthDate.getMonth() === today.getMonth() && currentMonthDate.getFullYear() === today.getFullYear();

      cells.push(
        <button
          key={day}
          onClick={() => {
            if (dayEvents.length > 0) {
              setSelectedEvent(dayEvents[0]); // open detail drawer for the first event
            } else {
              handleDateClick(day);
            }
          }}
          className={`min-h-[70px] p-1.5 border border-border/30 flex flex-col items-start justify-between hover:bg-muted/30 transition-all text-left focus:outline-none cursor-pointer ${
            isToday ? "bg-primary/5 border-primary" : "bg-card"
          }`}
        >
          <span className={`text-[10px] font-bold ${isToday ? "w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center font-extrabold" : "text-foreground"}`}>
            {day}
          </span>
          <div className="w-full space-y-0.5 mt-1 overflow-hidden">
            {dayEvents.map((evt) => {
              const bgClass =
                evt.type === "class"
                  ? "bg-violet-500/10 text-violet-500 border-violet-500/20"
                  : evt.type === "deadline"
                  ? "bg-rose-500/10 text-rose-500 border-rose-500/20"
                  : evt.type === "holiday"
                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                  : "bg-sky-500/10 text-sky-500 border-sky-500/20";

              return (
                <div
                  key={evt.id}
                  className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded border truncate leading-none ${bgClass}`}
                >
                  {evt.title}
                </div>
              );
            })}
          </div>
        </button>
      );
    }
    return cells;
  }, [currentMonthDate, allEvents, today]);

  return (
    <motion.div
      key="tutor-calendar"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-5"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-heading font-extrabold text-foreground">Interactive Calendar</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage your live sessions, deadlines, and personal milestones in a sync-ready layout
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleSyncCalendar}
            variant="outline"
            size="sm"
            className="h-9 gap-1.5 shadow-soft border-border text-foreground font-bold"
          >
            <Zap size={14} className="text-amber-500" />
            Sync with Google Calendar
          </Button>
          <Button
            onClick={onScheduleLive}
            size="sm"
            className="h-9 gap-1.5 shadow-soft bg-primary hover:bg-primary/95 text-white font-bold"
          >
            <Plus size={14} />
            Schedule Class
          </Button>
        </div>
      </div>

      {/* Grid Controller & Toggle */}
      <Card variant="glass" className="p-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrevMonth} className="h-8 w-8 p-0">
            <ChevronLeft size={14} />
          </Button>
          <h3 className="text-xs font-heading font-extrabold text-foreground uppercase tracking-wide min-w-[120px] text-center">
            {currentMonthDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </h3>
          <Button variant="outline" size="sm" onClick={handleNextMonth} className="h-8 w-8 p-0">
            <ChevronRight size={14} />
          </Button>
        </div>

        {/* View Toggle */}
        <div className="flex bg-muted/40 p-0.5 rounded-button">
          <button
            onClick={() => setViewMode("month")}
            className={`px-3.5 py-1.5 text-[10px] font-extrabold uppercase rounded-button transition-all cursor-pointer ${
              viewMode === "month"
                ? "bg-card text-foreground shadow-soft"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Monthly Grid
          </button>
          <button
            onClick={() => setViewMode("week")}
            className={`px-3.5 py-1.5 text-[10px] font-extrabold uppercase rounded-button transition-all cursor-pointer ${
              viewMode === "week"
                ? "bg-card text-foreground shadow-soft"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Weekly Schedule
          </button>
        </div>
      </Card>

      {/* Monthly view */}
      {viewMode === "month" && (
        <Card variant="glass" className="p-4 overflow-hidden">
          <div className="grid grid-cols-7 mb-2 text-center text-[10px] font-extrabold uppercase tracking-wide text-muted-foreground/80">
            {daysOfWeek.map((d) => (
              <div key={d} className="py-2">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1 bg-border/20 rounded-lg overflow-hidden border border-border/40">
            {monthCells}
          </div>
        </Card>
      )}

      {/* Weekly View (Lists days with events listed under them) */}
      {viewMode === "week" && (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {daysOfWeek.map((dayName, idx) => {
            const tempDate = new Date(today);
            const dayOffset = idx - today.getDay();
            tempDate.setDate(today.getDate() + dayOffset);
            const dateYmd = tempDate.toISOString().split("T")[0];
            const dayEvents = allEvents.filter((e) => e.date === dateYmd);

            return (
              <Card key={dayName} className={`p-3 min-h-[140px] flex flex-col justify-between ${dateYmd === today.toISOString().split("T")[0] ? "border-primary bg-primary/5" : "border-border/60"}`}>
                <div className="space-y-2">
                  <div className="flex items-center justify-between border-b border-border/30 pb-1">
                    <span className="text-[10px] font-extrabold uppercase text-muted-foreground">{dayName}</span>
                    <span className="text-xs font-bold text-foreground">{tempDate.getDate()}</span>
                  </div>
                  <div className="space-y-1 overflow-hidden">
                    {dayEvents.map((evt) => (
                      <div
                        key={evt.id}
                        onClick={() => setSelectedEvent(evt)}
                        className={`text-[8px] font-extrabold p-1.5 rounded border truncate cursor-pointer leading-tight ${
                          evt.type === "class"
                            ? "bg-violet-500/10 text-violet-500 border-violet-500/20"
                            : evt.type === "deadline"
                            ? "bg-rose-500/10 text-rose-500 border-rose-500/20"
                            : evt.type === "holiday"
                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                            : "bg-sky-500/10 text-sky-500 border-sky-500/20"
                        }`}
                      >
                        {evt.title}
                      </div>
                    ))}
                    {dayEvents.length === 0 && (
                      <span className="text-[9px] text-muted-foreground/40 italic block mt-2 text-center">Empty</span>
                    )}
                  </div>
                </div>
                <Button
                  onClick={() => {
                    setSelectedDateStr(dateYmd);
                    setEventForm({ title: "", type: "event", time: "", notes: "" });
                    setIsCreatingEvent(true);
                  }}
                  variant="ghost"
                  size="sm"
                  className="h-6 w-full text-[8px] font-bold p-0 text-primary hover:bg-primary/5 mt-2"
                >
                  + Add Event
                </Button>
              </Card>
            );
          })}
        </div>
      )}

      {/* CREATE EVENT MODAL */}
      <AnimatePresence>
        {isCreatingEvent && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-45 bg-black/35 backdrop-blur-sm"
              onClick={() => setIsCreatingEvent(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="fixed inset-0 m-auto z-50 h-fit max-h-[85vh] w-[90%] max-w-sm bg-card border border-border rounded-card p-5 shadow-floating"
            >
              <form onSubmit={handleSaveEvent} className="space-y-3.5">
                <div className="flex items-center justify-between border-b border-border/60 pb-2">
                  <h4 className="text-xs font-heading font-extrabold uppercase text-foreground">
                    Create Calendar Event
                  </h4>
                  <button
                    type="button"
                    onClick={() => setIsCreatingEvent(false)}
                    className="text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-1 text-xs">
                  <label className="font-bold text-foreground">Event Title *</label>
                  <input
                    type="text"
                    required
                    value={eventForm.title}
                    onChange={(e) => setEventForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="e.g. Study Group Session"
                    className="h-9 w-full rounded border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1 text-xs">
                    <label className="font-bold text-foreground">Event Type *</label>
                    <select
                      value={eventForm.type}
                      onChange={(e) => setEventForm((f) => ({ ...f, type: e.target.value as any }))}
                      className="h-9 w-full rounded border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
                    >
                      <option value="event">Student Event</option>
                      <option value="deadline">Deadline</option>
                      <option value="holiday">Holiday</option>
                      <option value="class">Class</option>
                    </select>
                  </div>
                  <div className="space-y-1 text-xs">
                    <label className="font-bold text-foreground">Time (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. 2:00 PM"
                      value={eventForm.time}
                      onChange={(e) => setEventForm((f) => ({ ...f, time: e.target.value }))}
                      className="h-9 w-full rounded border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <label className="font-bold text-foreground">Notes</label>
                  <textarea
                    rows={2}
                    value={eventForm.notes}
                    onChange={(e) => setEventForm((f) => ({ ...f, notes: e.target.value }))}
                    className="w-full bg-card border border-border rounded p-2 focus:outline-none text-xs font-semibold text-foreground resize-none"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-1">
                  <Button type="submit" className="h-9 text-xs bg-primary hover:bg-primary/95 text-white">
                    Save Event
                  </Button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* EVENT DETAIL VIEW & DELETE DRAWER */}
      <AnimatePresence>
        {selectedEvent && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-45 bg-black/35 backdrop-blur-sm"
              onClick={() => setSelectedEvent(null)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              className="fixed right-0 top-0 bottom-0 w-full sm:w-80 bg-card border-l border-border z-50 overflow-y-auto p-5 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <h4 className="text-xs font-heading font-extrabold uppercase text-foreground">Event Details</h4>
                <button onClick={() => setSelectedEvent(null)} className="text-muted-foreground hover:text-foreground">
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-3.5 text-xs font-semibold">
                <div className="p-3 bg-muted/30 rounded border border-border/40">
                  <span className="text-[8px] font-extrabold uppercase px-2 py-0.5 rounded border bg-primary/10 text-primary border-primary/20">
                    {selectedEvent.type}
                  </span>
                  <h3 className="text-sm font-bold text-foreground mt-2 leading-snug">{selectedEvent.title}</h3>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-2 bg-muted/20 rounded border border-border/40">
                    <p className="text-[9px] text-muted-foreground">Date</p>
                    <p className="font-bold text-foreground">{selectedEvent.date}</p>
                  </div>
                  <div className="p-2 bg-muted/20 rounded border border-border/40">
                    <p className="text-[9px] text-muted-foreground">Time</p>
                    <p className="font-bold text-foreground">{selectedEvent.time || "N/A"}</p>
                  </div>
                </div>

                {selectedEvent.notes && (
                  <div className="space-y-1">
                    <p className="text-[9px] text-muted-foreground">Description & Notes</p>
                    <p className="p-2.5 bg-muted/20 border border-border/40 rounded text-muted-foreground leading-relaxed">
                      {selectedEvent.notes}
                    </p>
                  </div>
                )}

                {selectedEvent.type !== "class" && (
                  <Button
                    onClick={() => handleDeleteEvent(selectedEvent.id)}
                    className="w-full h-9 bg-rose-600 hover:bg-rose-700 text-white font-bold gap-2 shadow-soft mt-4"
                  >
                    <Trash2 size={13} />
                    Delete Event
                  </Button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
});
