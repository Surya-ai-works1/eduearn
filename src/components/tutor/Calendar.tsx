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
  X,
  ArrowRightLeft,
  Check
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
  type: "class" | "deadline" | "holiday" | "reminder";
  date: string; // YYYY-MM-DD
  time?: string;
  notes?: string;
}

export const CalendarView = React.memo(function CalendarView({
  onScheduleLive,
  liveSessions,
}: CalendarViewProps) {
  // View mode: "month" | "week" | "day"
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month");

  // State for all events (initialized with defaults, plus dynamically computed live sessions)
  const [customEvents, setCustomEvents] = useState<CalendarEvent[]>([
    {
      id: "evt-1",
      title: "Submit Midterm Grades",
      type: "deadline",
      date: "2026-07-28",
      time: "11:59 PM",
      notes: "Must submit final math grades to dean office."
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
      type: "reminder",
      date: "2026-07-30",
      time: "03:00 PM",
      notes: "Discuss full stack syllabus and resume review."
    }
  ]);

  // Merge customEvents with liveSessions parsed as events
  const allEvents = useMemo(() => {
    const sessionsAsEvents: CalendarEvent[] = liveSessions.map((session) => {
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

  // Calendar dates
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
    type: "reminder" as CalendarEvent["type"],
    time: "",
    notes: ""
  });

  // Edit/View Event state
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isEditingEvent, setIsEditingEvent] = useState(false);
  const [editEventForm, setEditEventForm] = useState<Partial<CalendarEvent>>({});

  // Reschedule state (drag and drop simulation tool)
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState("");

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
    setEventForm({ title: "", type: "reminder", time: "", notes: "" });
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
    toast.success("Event added successfully!");
  };

  const handleStartEdit = (evt: CalendarEvent) => {
    setSelectedEvent(evt);
    setEditEventForm({
      title: evt.title,
      type: evt.type,
      date: evt.date,
      time: evt.time || "",
      notes: evt.notes || ""
    });
    setIsEditingEvent(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;

    setCustomEvents((prev) =>
      prev.map((evt) =>
        evt.id === selectedEvent.id
          ? {
              ...evt,
              title: editEventForm.title || evt.title,
              type: editEventForm.type || evt.type,
              date: editEventForm.date || evt.date,
              time: editEventForm.time,
              notes: editEventForm.notes,
            }
          : evt
      )
    );

    setIsEditingEvent(false);
    setSelectedEvent(null);
    toast.success("Event updated successfully!");
  };

  const handleDeleteEvent = (id: string) => {
    setCustomEvents((prev) => prev.filter((e) => e.id !== id));
    setSelectedEvent(null);
    setIsEditingEvent(false);
    toast.success("Event removed from calendar.");
  };

  // Drag and drop mock rescheduling trigger
  const handleReschedule = () => {
    if (!selectedEvent || !rescheduleDate) return;
    setCustomEvents((prev) =>
      prev.map((e) => (e.id === selectedEvent.id ? { ...e, date: rescheduleDate } : e))
    );
    setIsRescheduling(false);
    setSelectedEvent(null);
    toast.success(`Event rescheduled to ${rescheduleDate}`);
  };

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Render month cells
  const monthCells = useMemo(() => {
    const cells = [];
    for (let i = 0; i < startDay; i++) {
      cells.push(<div key={`empty-${i}`} className="min-h-[80px] border border-border/25 bg-muted/5 opacity-40" />);
    }

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
              setSelectedEvent(dayEvents[0]);
            } else {
              handleDateClick(day);
            }
          }}
          className={`min-h-[80px] p-2 border border-border/30 flex flex-col items-start justify-between hover:bg-muted/30 transition-all text-left focus:outline-none cursor-pointer ${
            isToday ? "bg-primary/5 border-primary" : "bg-card"
          }`}
        >
          <span className={`text-[10px] font-bold ${isToday ? "w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center font-extrabold" : "text-foreground"}`}>
            {day}
          </span>
          <div className="w-full space-y-1 mt-1.5 overflow-hidden">
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
            Full scheduling desk for live courses, deadlines, and reminders.
          </p>
        </div>
        <div className="flex items-center gap-2">
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
          <h3 className="text-xs font-heading font-extrabold text-foreground uppercase tracking-wide min-w-[125px] text-center">
            {currentMonthDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </h3>
          <Button variant="outline" size="sm" onClick={handleNextMonth} className="h-8 w-8 p-0">
            <ChevronRight size={14} />
          </Button>
        </div>

        {/* View Toggle */}
        <div className="flex bg-muted/40 p-0.5 rounded-button">
          {["month", "week", "day"].map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode as any)}
              className={`px-3.5 py-1.5 text-[10px] font-extrabold uppercase rounded-button transition-all cursor-pointer ${
                viewMode === mode
                  ? "bg-card text-foreground shadow-soft"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {mode} view
            </button>
          ))}
        </div>
      </Card>

      {/* MONTH VIEW */}
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

      {/* WEEK VIEW */}
      {viewMode === "week" && (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {daysOfWeek.map((dayName, idx) => {
            const tempDate = new Date(today);
            const dayOffset = idx - today.getDay();
            tempDate.setDate(today.getDate() + dayOffset);
            const dateYmd = tempDate.toISOString().split("T")[0];
            const dayEvents = allEvents.filter((e) => e.date === dateYmd);

            return (
              <Card key={dayName} className={`p-3 min-h-[160px] flex flex-col justify-between ${dateYmd === today.toISOString().split("T")[0] ? "border-primary bg-primary/5" : "border-border/60"}`}>
                <div className="space-y-2">
                  <div className="flex items-center justify-between border-b border-border/30 pb-1">
                    <span className="text-[10px] font-extrabold uppercase text-muted-foreground">{dayName}</span>
                    <span className="text-xs font-bold text-foreground">{tempDate.getDate()}</span>
                  </div>
                  <div className="space-y-1">
                    {dayEvents.map((evt) => (
                      <div
                        key={evt.id}
                        onClick={() => setSelectedEvent(evt)}
                        className={`text-[8px] font-extrabold p-2 rounded border cursor-pointer leading-tight ${
                          evt.type === "class"
                            ? "bg-violet-500/10 text-violet-500 border-violet-500/20"
                            : evt.type === "deadline"
                            ? "bg-rose-500/10 text-rose-500 border-rose-500/20"
                            : evt.type === "holiday"
                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                            : "bg-sky-500/10 text-sky-500 border-sky-500/20"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="truncate max-w-[80%]">{evt.title}</span>
                          <ArrowRightLeft size={8} className="opacity-60" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <Button
                  onClick={() => {
                    setSelectedDateStr(dateYmd);
                    setEventForm({ title: "", type: "reminder", time: "", notes: "" });
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

      {/* DAY VIEW */}
      {viewMode === "day" && (
        <Card className="p-5 max-w-xl mx-auto space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <h4 className="text-xs font-heading font-extrabold uppercase text-foreground">
              Agenda for {today.toISOString().split("T")[0]}
            </h4>
            <Button
              onClick={() => {
                setSelectedDateStr(today.toISOString().split("T")[0]);
                setEventForm({ title: "", type: "reminder", time: "", notes: "" });
                setIsCreatingEvent(true);
              }}
              size="sm"
              className="h-7 text-[10px] font-bold"
            >
              + Create Event
            </Button>
          </div>

          <div className="space-y-2">
            {allEvents.filter((e) => e.date === today.toISOString().split("T")[0]).map((evt) => (
              <div
                key={evt.id}
                onClick={() => setSelectedEvent(evt)}
                className="p-3 border border-border bg-card rounded flex items-center justify-between cursor-pointer hover:border-primary/20"
              >
                <div>
                  <h4 className="text-xs font-bold text-foreground">{evt.title}</h4>
                  <p className="text-[9px] text-muted-foreground mt-0.5">{evt.time || "All day"}</p>
                </div>
                <span className={`text-[8px] font-extrabold uppercase px-2 py-0.5 rounded border ${
                  evt.type === "class"
                    ? "bg-violet-500/10 text-violet-500 border-violet-500/20"
                    : "bg-muted text-muted-foreground"
                }`}>
                  {evt.type}
                </span>
              </div>
            ))}
            {allEvents.filter((e) => e.date === today.toISOString().split("T")[0]).length === 0 && (
              <p className="text-xs text-muted-foreground italic text-center py-6">No classes or deadlines scheduled for today.</p>
            )}
          </div>
        </Card>
      )}

      {/* CREATE EVENT DIALOG */}
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
              className="fixed inset-0 m-auto z-50 h-fit w-[90%] max-w-sm bg-card border border-border rounded-card p-5 shadow-floating"
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
                    placeholder="e.g. Grading Deadline"
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
                      <option value="reminder">Personal Reminder</option>
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

      {/* EVENT DETAIL VIEW & EVENT EDITOR DIALOG */}
      <AnimatePresence>
        {selectedEvent && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-45 bg-black/35 backdrop-blur-sm"
              onClick={() => { setSelectedEvent(null); setIsEditingEvent(false); }}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              className="fixed right-0 top-0 bottom-0 w-full sm:w-85 bg-card border-l border-border z-50 overflow-y-auto p-5 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <h4 className="text-xs font-heading font-extrabold uppercase text-foreground">
                  {isEditingEvent ? "Edit Event details" : "Event details"}
                </h4>
                <button onClick={() => { setSelectedEvent(null); setIsEditingEvent(false); }} className="text-muted-foreground hover:text-foreground">
                  <X size={16} />
                </button>
              </div>

              {isEditingEvent ? (
                <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs font-semibold">
                  <div className="space-y-1">
                    <label className="font-bold text-foreground">Event Title</label>
                    <input
                      type="text"
                      value={editEventForm.title || ""}
                      onChange={(e) => setEditEventForm(f => ({ ...f, title: e.target.value }))}
                      className="h-9 w-full rounded border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-foreground">Type</label>
                      <select
                        value={editEventForm.type}
                        onChange={(e) => setEditEventForm(f => ({ ...f, type: e.target.value as any }))}
                        className="h-9 w-full rounded border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
                      >
                        <option value="reminder">Personal Reminder</option>
                        <option value="deadline">Deadline</option>
                        <option value="holiday">Holiday</option>
                        <option value="class">Class</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-foreground">Time</label>
                      <input
                        type="text"
                        value={editEventForm.time || ""}
                        onChange={(e) => setEditEventForm(f => ({ ...f, time: e.target.value }))}
                        className="h-9 w-full rounded border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-foreground">Notes</label>
                    <textarea
                      rows={2}
                      value={editEventForm.notes || ""}
                      onChange={(e) => setEditEventForm(f => ({ ...f, notes: e.target.value }))}
                      className="w-full bg-card border border-border rounded p-2 focus:outline-none text-xs font-semibold text-foreground resize-none"
                    />
                  </div>

                  <div className="pt-2 flex gap-2">
                    <Button type="submit" className="flex-1 h-9 bg-primary hover:bg-primary/95 text-white font-bold">
                      Save Changes
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setIsEditingEvent(false)} className="h-9 font-bold">
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4 text-xs font-semibold">
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

                  {/* Drag and Drop Mock Rescheduling Tool */}
                  <div className="p-3 bg-muted/25 rounded border border-border/40 space-y-2">
                    <p className="text-[9px] font-extrabold uppercase text-muted-foreground flex items-center gap-1">
                      <ArrowRightLeft size={11} /> Reschedule Event (Drag/Drop Mock)
                    </p>
                    {isRescheduling ? (
                      <div className="flex gap-2">
                        <input
                          type="date"
                          value={rescheduleDate}
                          onChange={(e) => setRescheduleDate(e.target.value)}
                          className="h-8 rounded border border-border bg-card px-2.5 text-[10px] font-semibold text-foreground focus:outline-none"
                        />
                        <Button onClick={handleReschedule} className="h-8 w-8 p-0 bg-emerald-600 text-white"><Check size={13} /></Button>
                        <Button onClick={() => setIsRescheduling(false)} variant="outline" className="h-8 w-8 p-0 text-rose-500"><X size={13} /></Button>
                      </div>
                    ) : (
                      <Button onClick={() => { setIsRescheduling(true); setRescheduleDate(selectedEvent.date); }} variant="outline" className="w-full h-8 text-[10px] font-bold gap-1 text-primary">
                        Reschedule Event...
                      </Button>
                    )}
                  </div>

                  <div className="pt-2 flex gap-2">
                    {selectedEvent.type !== "class" && (
                      <>
                        <Button
                          onClick={() => handleStartEdit(selectedEvent)}
                          className="flex-1 h-9 bg-primary text-white font-bold gap-1.5 shadow-soft"
                        >
                          <Edit2 size={13} /> Edit Event
                        </Button>
                        <Button
                          onClick={() => handleDeleteEvent(selectedEvent.id)}
                          className="h-9 bg-rose-600 hover:bg-rose-700 text-white font-bold px-3 shadow-soft"
                        >
                          <Trash2 size={13} />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
});
