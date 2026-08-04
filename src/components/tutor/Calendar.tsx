"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Video,
  FileText,
  HelpCircle,
  AlertOctagon,
  Calendar as CalendarIcon,
  Users,
  Compass,
  Bell,
  CheckCircle,
  XCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  MapPin,
  Clock,
  History,
  Plus,
  X,
  Edit2,
  Trash2,
  Bookmark,
  Activity,
  Heart
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { toast } from "sonner";
import type { LiveSession } from "./types";

interface CalendarViewProps {
  onScheduleLive: () => void;
  liveSessions: LiveSession[];
}

type EventType =
  | "Live Class"
  | "Assignment Deadline"
  | "Quiz"
  | "Exam"
  | "Meeting"
  | "Mentoring Session"
  | "Holiday"
  | "Reminder"
  | "Personal Event";

interface AcademicEvent {
  id: string;
  title: string;
  type: EventType;
  course: string;
  batch: string;
  description?: string;
  date: string; // YYYY-MM-DD
  startTime: string;
  endTime: string;
  timezone: string;
  locationLink?: string;
  reminderTrigger: "1 Day Before" | "1 Hour Before" | "15 Minutes Before" | "At Event Time" | "None";
  participantsCount: number;
  colorLabel: "Blue" | "Red" | "Green" | "Amber" | "Purple" | "Gray";
  recurring: "Daily" | "Weekly" | "Monthly" | "None";
  notes?: string;
  attachments?: string[];
  attendanceCount?: number;
  completed?: boolean;
}

export const CalendarView = React.memo(function CalendarView({
  liveSessions,
}: CalendarViewProps) {
  // Navigation tabs: "calendar" | "analytics"
  const [activeTab, setActiveTab] = useState<"calendar" | "analytics">("calendar");
  const [calView, setCalView] = useState<"month" | "week" | "day" | "agenda">("month");

  // Core Events State
  const [events, setEvents] = useState<AcademicEvent[]>([
    {
      id: "evt-1",
      title: "Midterm Linear Systems Quiz",
      type: "Quiz",
      course: "Linear Algebra & Applications",
      batch: "Batch A",
      description: "20 multiple choice questions on vectors, matrices, and eigenvalues.",
      date: "2026-07-28",
      startTime: "10:00",
      endTime: "11:30",
      timezone: "IST",
      locationLink: "https://eduearn.com/quizzes/linear-midterm",
      reminderTrigger: "1 Day Before",
      participantsCount: 22,
      colorLabel: "Red",
      recurring: "None",
      notes: "Ensure all students have locked browser extension enabled.",
      attachments: ["quiz_syllabus.pdf", "formula_sheet.pdf"],
      attendanceCount: 22,
      completed: true
    },
    {
      id: "evt-2",
      title: "Independence Day Recess",
      type: "Holiday",
      course: "All Courses",
      batch: "All Batches",
      description: "College campus closed for Independence Day.",
      date: "2026-08-15",
      startTime: "00:00",
      endTime: "23:59",
      timezone: "IST",
      reminderTrigger: "None",
      participantsCount: 0,
      colorLabel: "Green",
      recurring: "None",
      completed: false
    },
    {
      id: "evt-3",
      title: "1-on-1 Mentoring: Aarav Mehta",
      type: "Mentoring Session",
      course: "Full-Stack Web Dev Bootcamp",
      batch: "Batch B",
      description: "Portfolio review and React state management troubleshooting.",
      date: "2026-08-03",
      startTime: "15:00",
      endTime: "15:45",
      timezone: "IST",
      locationLink: "https://zoom.us/j/908321456",
      reminderTrigger: "15 Minutes Before",
      participantsCount: 1,
      colorLabel: "Purple",
      recurring: "Weekly",
      notes: "Aarav needs help integrating Postgres with Prisma.",
      completed: false
    },
    {
      id: "evt-4",
      title: "Syllabus Steering Meeting",
      type: "Meeting",
      course: "All Courses",
      batch: "All Batches",
      description: "Bi-weekly department meeting to align on curriculum outlines.",
      date: "2026-08-01",
      startTime: "16:00",
      endTime: "17:00",
      timezone: "IST",
      locationLink: "https://meet.google.com/xyz-api-meet",
      reminderTrigger: "1 Hour Before",
      participantsCount: 8,
      colorLabel: "Amber",
      recurring: "None",
      notes: "Discuss student drop-off rate in lecture 4.",
      completed: false
    },
    {
      id: "evt-5",
      title: "Final Capstone Submission",
      type: "Assignment Deadline",
      course: "Full-Stack Web Dev Bootcamp",
      batch: "Batch B",
      description: "Final full stack application deployed to production with testing docs.",
      date: "2026-08-05",
      startTime: "23:59",
      endTime: "23:59",
      timezone: "IST",
      reminderTrigger: "1 Day Before",
      participantsCount: 25,
      colorLabel: "Red",
      recurring: "None",
      notes: "Requires GitHub link and 3 minutes video walkthrough.",
      completed: false
    }
  ]);

  // Sync Live Sessions from props
  const consolidatedEvents = useMemo(() => {
    const parsedSessions: AcademicEvent[] = liveSessions.map(session => {
      let ymd = "2026-08-01";
      let timeStr = "17:00";
      const parts = session.time.split(",");
      if (parts[0]) {
        const rawDate = new Date(parts[0]);
        if (!isNaN(rawDate.getTime())) {
          ymd = rawDate.toISOString().split("T")[0];
        }
      }
      if (parts[1]) {
        const cleanedTime = parts[1].trim().toLowerCase();
        if (cleanedTime.includes("pm") || cleanedTime.includes("am")) {
          const matched = cleanedTime.match(/(\d+):(\d+)\s*(pm|am)/);
          if (matched) {
            let hr = parseInt(matched[1] || "17");
            const min = matched[2] || "00";
            const period = matched[3];
            if (period === "pm" && hr < 12) hr += 12;
            if (period === "am" && hr === 12) hr = 0;
            timeStr = `${String(hr).padStart(2, "0")}:${min}`;
          }
        }
      }

      return {
        id: session.id,
        title: session.title,
        type: "Live Class",
        course: session.course || "Linear Algebra & Applications",
        batch: session.batch || "Batch A",
        description: session.description || "Consolidated virtual interactive live class.",
        date: ymd,
        startTime: timeStr,
        endTime: `${String(parseInt(timeStr.split(":")[0] || "17") + 1).padStart(2, "0")}:30`,
        timezone: session.timezone || "IST",
        locationLink: session.meetingLink,
        reminderTrigger: "15 Minutes Before",
        participantsCount: session.studentsCount || 24,
        colorLabel: "Blue",
        recurring: "None",
        notes: session.notes,
        attendanceCount: session.attendanceCount || 0,
        completed: session.status === "Completed"
      };
    });

    return [...events, ...parsedSessions];
  }, [events, liveSessions]);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [courseFilter, setCourseFilter] = useState("All");
  const [batchFilter, setBatchFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("upcoming");

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return consolidatedEvents
      .filter(evt => {
        const matchesSearch = evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              (evt.description || "").toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCourse = courseFilter === "All" || evt.course === courseFilter;
        const matchesBatch = batchFilter === "All" || evt.batch === batchFilter;
        const matchesType = typeFilter === "All" || evt.type === typeFilter;
        const matchesStatus = statusFilter === "All" ||
                              (statusFilter === "Completed" && evt.completed) ||
                              (statusFilter === "Pending" && !evt.completed);

        return matchesSearch && matchesCourse && matchesBatch && matchesType && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === "newest") return b.date.localeCompare(a.date);
        if (sortBy === "oldest") return a.date.localeCompare(b.date);
        if (sortBy === "upcoming") return a.date.localeCompare(b.date);
        return 0;
      });
  }, [consolidatedEvents, searchQuery, courseFilter, batchFilter, typeFilter, statusFilter, sortBy]);

  // Calendar Base Calculations
  const today = useMemo(() => new Date(), []);
  const todayYmd = useMemo(() => today.toISOString().split("T")[0], [today]);
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const startOfMonth = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth(), 1);
  const daysInMonth = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 0).getDate();
  const startDay = startOfMonth.getDay();

  // Next/Prev month controls
  const handlePrevMonth = () => {
    setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() - 1, 1));
  };
  const handleNextMonth = () => {
    setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 1));
  };

  // Modals / Drawer triggers
  const [selectedEvent, setSelectedEvent] = useState<AcademicEvent | null>(null);
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [createDate, setCreateDate] = useState(todayYmd);
  const [createForm, setCreateForm] = useState({
    title: "",
    type: "Meeting" as EventType,
    course: "Linear Algebra & Applications",
    batch: "Batch A",
    description: "",
    startTime: "10:00",
    endTime: "11:30",
    timezone: "IST",
    locationLink: "",
    reminderTrigger: "15 Minutes Before" as AcademicEvent["reminderTrigger"],
    participantsCount: 10,
    colorLabel: "Blue" as AcademicEvent["colorLabel"],
    recurring: "None" as AcademicEvent["recurring"],
    notes: ""
  });

  // Calculate top summary stats
  const stats = useMemo(() => {
    const todayEvents = consolidatedEvents.filter(e => e.date === todayYmd).length;
    const upcomingEvents = consolidatedEvents.filter(e => {
      const d = new Date(e.date);
      const diff = d.getTime() - today.getTime();
      return diff >= 0 && diff <= 7 * 24 * 60 * 60 * 1000;
    }).length;
    
    const liveClassesCount = consolidatedEvents.filter(e => e.type === "Live Class").length;
    const assignmentDeadlinesCount = consolidatedEvents.filter(e => e.type === "Assignment Deadline").length;
    const meetingsCount = consolidatedEvents.filter(e => e.type === "Meeting").length;
    const totalScheduledHours = consolidatedEvents.length * 1.5;

    return {
      todayEvents,
      upcomingEvents,
      liveClassesCount,
      assignmentDeadlinesCount,
      meetingsCount,
      totalScheduledHours
    };
  }, [consolidatedEvents, todayYmd, today]);

  // Icon selector based on type
  const getEventIcon = (type: EventType) => {
    switch (type) {
      case "Live Class":
        return Video;
      case "Assignment Deadline":
        return FileText;
      case "Quiz":
        return HelpCircle;
      case "Exam":
        return AlertOctagon;
      case "Meeting":
        return Users;
      case "Mentoring Session":
        return Compass;
      case "Holiday":
        return Bookmark;
      default:
        return Bookmark;
    }
  };

  // Color label mapper
  const getColorClasses = (color: AcademicEvent["colorLabel"]) => {
    switch (color) {
      case "Blue":
        return "bg-sky-500/10 border-sky-500/20 text-sky-600";
      case "Red":
        return "bg-rose-500/10 border-rose-500/20 text-rose-600";
      case "Green":
        return "bg-emerald-500/10 border-emerald-500/20 text-emerald-600";
      case "Amber":
        return "bg-amber-500/10 border-amber-500/20 text-amber-600";
      case "Purple":
        return "bg-purple-500/10 border-purple-500/20 text-purple-600";
      default:
        return "bg-gray-500/10 border-gray-500/20 text-gray-600";
    }
  };

  // Event Creation Handler
  const handleCreateEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.title.trim()) return;

    const newEvent: AcademicEvent = {
      id: `evt-${Date.now()}`,
      title: createForm.title.trim(),
      type: createForm.type,
      course: createForm.course,
      batch: createForm.batch,
      description: createForm.description,
      date: createDate,
      startTime: createForm.startTime,
      endTime: createForm.endTime,
      timezone: createForm.timezone,
      locationLink: createForm.locationLink,
      reminderTrigger: createForm.reminderTrigger,
      participantsCount: createForm.participantsCount,
      colorLabel: createForm.colorLabel,
      recurring: createForm.recurring,
      notes: createForm.notes,
      completed: false
    };

    setEvents(prev => [newEvent, ...prev]);
    setIsCreatingEvent(false);
    toast.success(`Academic event "${newEvent.title}" published!`);
  };

  // Reschedule drag & drop mock
  const handleEventReschedule = (eventId: string, newDateStr: string) => {
    setEvents(prev =>
      prev.map(evt => (evt.id === eventId ? { ...evt, date: newDateStr } : evt))
    );
    toast.success("Event rescheduled automatically!");
  };

  // Delete event handler
  const handleDeleteEvent = (id: string) => {
    setEvents(prev => prev.filter(evt => evt.id !== id));
    setSelectedEvent(null);
    toast.success("Event removed from calendar schedule.");
  };

  // Month grid cell compilation
  const monthDaysCells = useMemo(() => {
    const cells = [];
    for (let i = 0; i < startDay; i++) {
      cells.push(<div key={`empty-${i}`} className="min-h-[90px] border border-border/20 bg-muted/5 opacity-30" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const formattedDate = `${currentMonthDate.getFullYear()}-${String(
        currentMonthDate.getMonth() + 1
      ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      
      const dayEvents = filteredEvents.filter(e => e.date === formattedDate);
      const isToday = formattedDate === todayYmd;

      cells.push(
        <div
          key={day}
          onClick={() => {
            setCreateDate(formattedDate);
            setIsCreatingEvent(true);
          }}
          className={`min-h-[90px] p-2 border border-border/30 flex flex-col justify-between hover:bg-muted/15 transition-all text-left relative cursor-pointer ${
            isToday ? "bg-primary/5 border-primary" : "bg-card"
          }`}
        >
          <span className={`text-[10px] font-bold ${isToday ? "w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center font-extrabold" : "text-muted-foreground"}`}>
            {day}
          </span>
          <div className="w-full space-y-1 mt-1.5 overflow-hidden">
            {dayEvents.map(evt => (
              <div
                key={evt.id}
                draggable
                onDragEnd={() => handleEventReschedule(evt.id, todayYmd)}
                className={`text-[8.5px] font-extrabold px-1.5 py-0.5 rounded border truncate leading-none cursor-grab flex items-center gap-1 ${getColorClasses(evt.colorLabel)}`}
                onClick={e => {
                  e.stopPropagation();
                  setSelectedEvent(evt);
                }}
                title="Drag card to reschedule"
              >
                {evt.title}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return cells;
  }, [currentMonthDate, filteredEvents, startDay, daysInMonth, todayYmd]);

  return (
    <motion.div
      key="tutor-schedule-hub"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="space-y-6"
    >
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground font-heading">Schedule & Calendar Hub</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Consolidated academic calendar tracking live lectures, quiz sessions, assignments, and campus holidays.
          </p>
        </div>
        <Button
          onClick={() => {
            setCreateDate(todayYmd);
            setIsCreatingEvent(true);
          }}
          size="sm"
          className="h-9 gap-1.5 bg-primary hover:bg-primary/95 text-white font-semibold shadow-sm"
        >
          <Plus size={14} /> Schedule New Event
        </Button>
      </div>

      {/* KPI Cards summary row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {[
          { label: "Events Today", value: stats.todayEvents, icon: CalendarIcon },
          { label: "Upcoming This Week", value: stats.upcomingEvents, icon: Clock },
          { label: "Live Classes", value: stats.liveClassesCount, icon: Video },
          { label: "Deadlines Set", value: stats.assignmentDeadlinesCount, icon: FileText },
          { label: "Meetings Scheduled", value: stats.meetingsCount, icon: Users },
          { label: "Teaching Hours", value: `${stats.totalScheduledHours} hrs`, icon: Activity }
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <Card key={idx} className="p-3 border border-border bg-card shadow-sm flex items-center justify-between min-w-0">
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-muted-foreground truncate">{item.label}</p>
                <h4 className="text-lg font-extrabold text-foreground mt-0.5">{item.value}</h4>
              </div>
              <Icon size={16} className="text-primary shrink-0 ml-2" />
            </Card>
          );
        })}
      </div>

      {/* Module tab buttons */}
      <div className="flex gap-1.5 border-b border-border/40 pb-2 font-semibold">
        {[
          { id: "calendar", label: "Academic Calendar" },
          { id: "analytics", label: "Scheduling Insights" }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-1.5 text-xs border-b-2 transition-all cursor-pointer ${
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT: CALENDAR WORKSPACE */}
      {activeTab === "calendar" && (
        <div className="space-y-6">
          {/* Advanced Filters */}
          <Card variant="glass" className="p-4 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search event title..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="h-9 w-full pl-9 pr-3 rounded-button border border-border bg-card/60 text-xs font-semibold text-foreground focus:outline-none"
              />
            </div>

            <select
              value={courseFilter}
              onChange={e => setCourseFilter(e.target.value)}
              className="h-9 rounded-button border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
            >
              <option value="All">All Courses</option>
              <option value="Linear Algebra & Applications">Linear Algebra & Applications</option>
              <option value="Full-Stack Web Dev Bootcamp">Full-Stack Web Dev Bootcamp</option>
              <option value="All Courses">All Courses</option>
            </select>

            <select
              value={batchFilter}
              onChange={e => setBatchFilter(e.target.value)}
              className="h-9 rounded-button border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
            >
              <option value="All">All Batches</option>
              <option value="Batch A">Batch A</option>
              <option value="Batch B">Batch B</option>
            </select>

            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="h-9 rounded-button border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
            >
              <option value="All">All Types</option>
              <option value="Live Class">Live Class</option>
              <option value="Assignment Deadline">Assignment Deadline</option>
              <option value="Quiz">Quiz</option>
              <option value="Exam">Exam</option>
              <option value="Meeting">Meeting</option>
              <option value="Mentoring Session">Mentoring Session</option>
              <option value="Holiday">Holiday</option>
            </select>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="h-9 rounded-button border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
            </select>

            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="h-9 rounded-button border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none ml-auto"
            >
              <option value="upcoming">Upcoming First</option>
              <option value="newest">Newest Added</option>
              <option value="oldest">Oldest Added</option>
            </select>
          </Card>

          {/* Splitted Workspace Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
            {/* Left Column Calendar */}
            <div className="space-y-4">
              <Card className="p-4 border border-border bg-card shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Button variant="outline" size="sm" onClick={handlePrevMonth} className="h-8 w-8 p-0 cursor-pointer">
                    <ChevronLeft size={14} />
                  </Button>
                  <h3 className="text-xs font-bold text-foreground min-w-[120px] text-center uppercase tracking-wider">
                    {currentMonthDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                  </h3>
                  <Button variant="outline" size="sm" onClick={handleNextMonth} className="h-8 w-8 p-0 cursor-pointer">
                    <ChevronRight size={14} />
                  </Button>
                </div>

                <div className="flex bg-muted/40 p-0.5 rounded-button text-[10px] font-bold">
                  {["month", "week", "day", "agenda"].map(mode => (
                    <button
                      key={mode}
                      onClick={() => setCalView(mode as any)}
                      className={`px-2.5 py-1 rounded-button capitalize transition-colors ${calView === mode ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </Card>

              {calView === "month" ? (
                <Card className="p-4 overflow-hidden border border-border bg-card shadow-sm">
                  <div className="grid grid-cols-7 mb-2 text-center text-[9px] font-extrabold uppercase tracking-wider text-muted-foreground/70">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                      <div key={d} className="py-1">{d}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-px bg-border/40 rounded-card overflow-hidden">
                    {monthDaysCells}
                  </div>
                </Card>
              ) : (
                <Card className="p-6 text-center text-xs text-muted-foreground italic flex flex-col items-center justify-center gap-3">
                  <CalendarIcon size={24} className="text-primary animate-pulse" />
                  <p>Showing Interactive academic calendar {calView} layout slots.</p>
                  <Button
                    onClick={() => {
                      setCreateDate(todayYmd);
                      setIsCreatingEvent(true);
                    }}
                    size="sm"
                    className="h-8 text-[10px] font-bold bg-primary text-white"
                  >
                    Schedule Slot Event
                  </Button>
                </Card>
              )}
            </div>

            {/* Right Column Today Panel */}
            <div className="space-y-4">
              <Card variant="glass" className="p-4 space-y-4">
                <h4 className="text-xs font-bold uppercase text-muted-foreground border-b border-border/60 pb-2">
                  Today&apos;s Agenda
                </h4>
                <div className="space-y-3">
                  {consolidatedEvents.filter(e => e.date === todayYmd).map(evt => {
                    const Icon = getEventIcon(evt.type);
                    return (
                      <div
                        key={evt.id}
                        onClick={() => setSelectedEvent(evt)}
                        className="p-3 bg-card border border-border/40 rounded-card space-y-2 cursor-pointer hover:border-primary/25 transition-all"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <Icon size={13} className="text-primary" />
                            <h5 className="text-xs font-bold text-foreground truncate max-w-[150px]">{evt.title}</h5>
                          </div>
                          <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded border ${getColorClasses(evt.colorLabel)}`}>
                            {evt.type}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground font-semibold">
                          <span>Batch: {evt.batch}</span>
                          <span className="flex items-center gap-1">
                            <Clock size={11} /> {evt.startTime}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  {consolidatedEvents.filter(e => e.date === todayYmd).length === 0 && (
                    <p className="text-[11px] text-muted-foreground italic text-center py-6">No events scheduled for today.</p>
                  )}
                </div>
              </Card>

              {/* Busy Days / Alerts Panel */}
              <Card variant="glass" className="p-4 space-y-3">
                <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5 border-b border-border/60 pb-2">
                  <Activity size={12} className="text-primary animate-pulse" /> Class Schedule Alerts
                </h4>
                <div className="space-y-2.5 text-[10px] font-semibold text-muted-foreground">
                  <div className="p-2 bg-rose-500/5 border border-rose-500/10 rounded flex items-center justify-between">
                    <span className="text-rose-600 font-bold">Upcoming Exam Deadline</span>
                    <span>Aug 05</span>
                  </div>
                  <div className="p-2 bg-purple-500/5 border border-purple-500/10 rounded flex items-center justify-between">
                    <span className="text-purple-600 font-bold">Sahiti Mentoring session</span>
                    <span>Aug 03</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: ANALYTICS */}
      {activeTab === "analytics" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-5 border border-border bg-card shadow-sm space-y-4">
            <h4 className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1.5 border-b border-border/60 pb-2">
              <TrendingUp size={13} className="text-primary" /> Scheduling Utilization
            </h4>
            <div className="space-y-4 text-xs font-semibold">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Cumulative Scheduled Hours</span>
                <span className="text-foreground font-bold">12.5 hrs</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Linear Algebra Classes</span>
                <span className="text-foreground font-bold text-primary">3 Lectures scheduled</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Assignment Handouts This Month</span>
                <span className="text-foreground font-bold">1 Deadline pending</span>
              </div>
            </div>
          </Card>

          <Card className="p-5 border border-border bg-card shadow-sm space-y-4">
            <h4 className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1.5 border-b border-border/60 pb-2">
              <Heart size={13} className="text-primary" /> Class Density Map
            </h4>
            <div className="space-y-4 text-xs font-semibold">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Busy Days Heatmap</span>
                <span className="text-foreground font-bold">Mondays &amp; Tuesdays</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Holiday cancellations rate</span>
                <span className="text-foreground font-bold">0% active dropoff</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* EVENT DETAILS SIDE DRAWER */}
      <AnimatePresence>
        {selectedEvent && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/35 backdrop-blur-sm"
              onClick={() => setSelectedEvent(null)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              className="fixed right-0 top-0 bottom-0 w-full sm:w-[420px] bg-card border-l border-border z-50 overflow-y-auto shadow-floating flex flex-col justify-between"
            >
              <div className="p-5 space-y-5 overflow-y-auto flex-1 text-xs font-semibold">
                <div className="flex items-center justify-between border-b border-border/40 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-primary/10 text-primary flex items-center justify-center font-bold">
                      <CalendarIcon size={18} />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-foreground leading-tight truncate max-w-[240px]">
                        {selectedEvent.title}
                      </h3>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Type: {selectedEvent.type}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="text-muted-foreground hover:text-foreground cursor-pointer p-0.5 rounded"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="p-3 bg-muted/20 border border-border/40 rounded">
                    <p className="text-[9px] font-bold uppercase text-muted-foreground mb-0.5 font-heading">Course Mapped</p>
                    <p className="font-bold text-foreground">{selectedEvent.course}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-muted/20 border border-border/40 rounded">
                      <p className="text-[9px] font-bold uppercase text-muted-foreground mb-0.5 font-heading">Batch</p>
                      <p className="font-bold text-foreground">{selectedEvent.batch}</p>
                    </div>
                    <div className="p-3 bg-muted/20 border border-border/40 rounded">
                      <p className="text-[9px] font-bold uppercase text-muted-foreground mb-0.5 font-heading">Timings</p>
                      <p className="font-bold text-foreground">{selectedEvent.startTime} - {selectedEvent.endTime} {selectedEvent.timezone}</p>
                    </div>
                  </div>

                  {selectedEvent.locationLink && (
                    <div className="p-3 bg-muted/20 border border-border/40 rounded">
                      <p className="text-[9px] font-bold uppercase text-muted-foreground mb-0.5 font-heading">Meeting URL / Location</p>
                      <a
                        href={selectedEvent.locationLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary hover:underline font-bold flex items-center gap-1.5"
                      >
                        <Compass size={12} /> {selectedEvent.locationLink}
                      </a>
                    </div>
                  )}

                  {selectedEvent.description && (
                    <div className="p-3 bg-muted/20 border border-border/40 rounded">
                      <p className="text-[9px] font-bold uppercase text-muted-foreground mb-0.5 font-heading">Description</p>
                      <p className="text-[10px] text-foreground font-medium leading-relaxed">{selectedEvent.description}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-muted/20 border border-border/40 rounded">
                      <p className="text-[9px] font-bold uppercase text-muted-foreground mb-0.5 font-heading">Reminder set</p>
                      <p className="font-bold text-foreground flex items-center gap-1"><Bell size={11} className="text-primary" /> {selectedEvent.reminderTrigger}</p>
                    </div>
                    <div className="p-3 bg-muted/20 border border-border/40 rounded">
                      <p className="text-[9px] font-bold uppercase text-muted-foreground mb-0.5 font-heading">Recurring</p>
                      <p className="font-bold text-foreground">{selectedEvent.recurring}</p>
                    </div>
                  </div>

                  {/* Attendance audit info */}
                  {selectedEvent.attendanceCount !== undefined && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded flex justify-between items-center">
                      <span className="font-bold">Attendance rate logged</span>
                      <span className="font-extrabold">{selectedEvent.attendanceCount} attended / {selectedEvent.participantsCount} total</span>
                    </div>
                  )}

                  {/* Recent updates log */}
                  <div className="p-3 bg-muted/20 border border-border/40 rounded space-y-1.5">
                    <p className="text-[9px] font-bold uppercase text-muted-foreground flex items-center gap-1">
                      <History size={11} className="text-primary" /> Recent Update Audit Log
                    </p>
                    <div className="space-y-1 text-[9px] text-muted-foreground">
                      <div className="flex gap-2">
                        <span className="font-bold shrink-0">{selectedEvent.date}</span>
                        <span className="text-foreground/90">Event created and published.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-5 border-t border-border/40 flex flex-col gap-2 bg-muted/10">
                <Button
                  onClick={() => handleDeleteEvent(selectedEvent.id)}
                  className="w-full h-9 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white gap-1.5"
                >
                  <Trash2 size={13} /> Remove Event
                </Button>
                <Button
                  onClick={() => setSelectedEvent(null)}
                  variant="outline"
                  className="w-full h-9 text-xs font-bold"
                >
                  Close Drawer
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* CREATE EVENT MODAL */}
      <AnimatePresence>
        {isCreatingEvent && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/35 backdrop-blur-sm"
              onClick={() => setIsCreatingEvent(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="fixed inset-0 m-auto z-50 h-fit max-h-[90vh] w-[90%] max-w-lg bg-card border border-border rounded-card p-5 shadow-floating overflow-y-auto space-y-4"
            >
              <form onSubmit={handleCreateEventSubmit} className="space-y-4 text-xs font-semibold">
                <div className="flex items-center justify-between border-b border-border/60 pb-2">
                  <h4 className="text-sm font-bold uppercase text-foreground">
                    Schedule Calendar Event
                  </h4>
                  <button
                    type="button"
                    onClick={() => setIsCreatingEvent(false)}
                    className="text-muted-foreground hover:text-foreground cursor-pointer p-0.5 rounded"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1 col-span-2">
                    <label className="font-bold text-foreground">Event Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Vectors concepts sync quiz"
                      value={createForm.title}
                      onChange={e => setCreateForm(f => ({ ...f, title: e.target.value }))}
                      className="h-9 w-full rounded border border-border bg-card px-3 font-semibold text-foreground focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-foreground">Event Type *</label>
                    <select
                      value={createForm.type}
                      onChange={e => setCreateForm(f => ({ ...f, type: e.target.value as any }))}
                      className="h-9 w-full rounded border border-border bg-card px-2 font-semibold text-foreground focus:outline-none"
                    >
                      <option value="Live Class">Live Class</option>
                      <option value="Assignment Deadline">Assignment Deadline</option>
                      <option value="Quiz">Quiz</option>
                      <option value="Exam">Exam</option>
                      <option value="Meeting">Meeting</option>
                      <option value="Mentoring Session">Mentoring Session</option>
                      <option value="Holiday">Holiday</option>
                      <option value="Reminder">Reminder</option>
                      <option value="Personal Event">Personal Event</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-foreground">Date Mapped *</label>
                    <input
                      type="date"
                      required
                      value={createDate}
                      onChange={e => setCreateDate(e.target.value)}
                      className="h-9 w-full rounded border border-border bg-card px-3 font-semibold text-foreground focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-foreground">Course *</label>
                    <select
                      value={createForm.course}
                      onChange={e => setCreateForm(f => ({ ...f, course: e.target.value }))}
                      className="h-9 w-full rounded border border-border bg-card px-2 font-semibold text-foreground focus:outline-none"
                    >
                      <option value="Linear Algebra & Applications">Linear Algebra & Applications</option>
                      <option value="Full-Stack Web Dev Bootcamp">Full-Stack Web Dev Bootcamp</option>
                      <option value="All Courses">All Courses</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-foreground">Batch *</label>
                    <select
                      value={createForm.batch}
                      onChange={e => setCreateForm(f => ({ ...f, batch: e.target.value }))}
                      className="h-9 w-full rounded border border-border bg-card px-2 font-semibold text-foreground focus:outline-none"
                    >
                      <option value="Batch A">Batch A</option>
                      <option value="Batch B">Batch B</option>
                      <option value="All Batches">All Batches</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-foreground">Start Time *</label>
                    <input
                      type="time"
                      required
                      value={createForm.startTime}
                      onChange={e => setCreateForm(f => ({ ...f, startTime: e.target.value }))}
                      className="h-9 w-full rounded border border-border bg-card px-3 font-semibold text-foreground focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-foreground">End Time *</label>
                    <input
                      type="time"
                      required
                      value={createForm.endTime}
                      onChange={e => setCreateForm(f => ({ ...f, endTime: e.target.value }))}
                      className="h-9 w-full rounded border border-border bg-card px-3 font-semibold text-foreground focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-foreground">Timezone *</label>
                    <input
                      type="text"
                      required
                      value={createForm.timezone}
                      onChange={e => setCreateForm(f => ({ ...f, timezone: e.target.value }))}
                      className="h-9 w-full rounded border border-border bg-card px-3 font-semibold text-foreground focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-foreground">Reminder Notification</label>
                    <select
                      value={createForm.reminderTrigger}
                      onChange={e => setCreateForm(f => ({ ...f, reminderTrigger: e.target.value as any }))}
                      className="h-9 w-full rounded border border-border bg-card px-2 font-semibold text-foreground focus:outline-none"
                    >
                      <option value="1 Day Before">1 Day Before</option>
                      <option value="1 Hour Before">1 Hour Before</option>
                      <option value="15 Minutes Before">15 Minutes Before</option>
                      <option value="At Event Time">At Event Time</option>
                      <option value="None">None</option>
                    </select>
                  </div>

                  <div className="space-y-1 col-span-2">
                    <label className="font-bold text-foreground">Location URL / Meeting Link</label>
                    <input
                      type="text"
                      placeholder="e.g. https://meet.google.com/..."
                      value={createForm.locationLink}
                      onChange={e => setCreateForm(f => ({ ...f, locationLink: e.target.value }))}
                      className="h-9 w-full rounded border border-border bg-card px-3 font-semibold text-foreground focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1 col-span-2">
                    <label className="font-bold text-foreground">Description</label>
                    <textarea
                      rows={2}
                      placeholder="Enter description..."
                      value={createForm.description}
                      onChange={e => setCreateForm(f => ({ ...f, description: e.target.value }))}
                      className="w-full bg-card border border-border rounded p-2 focus:outline-none font-semibold text-foreground resize-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 border-t border-border/40 pt-3">
                  <div className="space-y-1">
                    <label className="font-bold text-foreground">Color Label *</label>
                    <select
                      value={createForm.colorLabel}
                      onChange={e => setCreateForm(f => ({ ...f, colorLabel: e.target.value as any }))}
                      className="h-9 w-full rounded border border-border bg-card px-2 font-semibold text-foreground focus:outline-none"
                    >
                      <option value="Blue">Blue (Live Classes)</option>
                      <option value="Red">Red (Exams / Deadlines)</option>
                      <option value="Green">Green (Holidays)</option>
                      <option value="Amber">Amber (Meetings)</option>
                      <option value="Purple">Purple (Mentoring)</option>
                      <option value="Gray">Gray (Personal / Reminder)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-foreground">Recurring Pattern *</label>
                    <select
                      value={createForm.recurring}
                      onChange={e => setCreateForm(f => ({ ...f, recurring: e.target.value as any }))}
                      className="h-9 w-full rounded border border-border bg-card px-2 font-semibold text-foreground focus:outline-none"
                    >
                      <option value="None">No Repeat</option>
                      <option value="Daily">Daily</option>
                      <option value="Weekly">Weekly</option>
                      <option value="Monthly">Monthly</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-3 border-t border-border/40">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      toast.success("Event draft saved.");
                      setIsCreatingEvent(false);
                    }}
                    className="h-9 text-xs"
                  >
                    Save Draft
                  </Button>
                  <Button
                    type="submit"
                    className="h-9 text-xs bg-primary text-white font-bold"
                  >
                    Publish Event
                  </Button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
});
