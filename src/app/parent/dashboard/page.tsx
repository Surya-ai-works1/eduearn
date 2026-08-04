"use client";

import React, { useState, useMemo } from "react";
import { toast } from "sonner";
import { 
  Users, 
  Calendar, 
  Clock, 
  ClipboardList, 
  Video, 
  Plus, 
  FileText, 
  TrendingUp, 
  CheckCircle, 
  PlayCircle, 
  Download, 
  Trash2, 
  Edit,
  GraduationCap,
  Sparkles,
  BookOpen,
  UserCheck,
  ChevronRight,
  TrendingDown,
  AlertCircle,
  CreditCard,
  Bell,
  BrainCircuit,
  MessageSquare,
  FileDown,
  Info,
  CalendarDays,
  FolderOpen,
  MessageCircle,
  MailOpen,
  Mail
} from "lucide-react";
import { Container } from "../../../components/layout/Container";
import { PageWrapper } from "../../../components/layout/PageWrapper";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Divider } from "../../../components/ui/divider";

interface ChildProfile {
  id: string;
  name: string;
  avatar: string;
  class: string;
  board: string;
  section: string;
  rollNumber: string;
  admissionNumber: string;
  attendancePct: number;
  homeworkCompletionPct: number;
  avgScore: number;
  teacherRemarks: string;
}

export default function ParentDashboardPage() {
  // Mock Children list matching parent_student_relationships
  const childrenList: ChildProfile[] = [
    {
      id: "child-1",
      name: "Amit Kumar",
      avatar: "👦",
      class: "Class 10",
      board: "CBSE",
      section: "Section A",
      rollNumber: "10",
      admissionNumber: "ADM-2026-001",
      attendancePct: 92,
      homeworkCompletionPct: 83,
      avgScore: 88,
      teacherRemarks: "Amit is showing exceptional promise in Mathematics. Needs slight focus on science lab reporting consistency."
    },
    {
      id: "child-2",
      name: "Sneha Kumar",
      avatar: "👧",
      class: "Class 6",
      board: "CBSE",
      section: "Section C",
      rollNumber: "14",
      admissionNumber: "ADM-2026-042",
      attendancePct: 96,
      homeworkCompletionPct: 95,
      avgScore: 92,
      teacherRemarks: "Sneha participates enthusiastically in class activities. Good progress across all subjects."
    }
  ];

  const [selectedChildId, setSelectedChildId] = useState(childrenList[0].id);
  const [activeTab, setActiveTab] = useState<"overview" | "homework" | "assessments" | "timetable" | "teachers" | "fees" | "reports" | "calendar" | "documents" | "communication" | "ai">("overview");

  // Resolve selected child profile
  const activeChild = useMemo(() => {
    return childrenList.find((c) => c.id === selectedChildId) || childrenList[0];
  }, [selectedChildId]);

  // Notifications state matching Notification Center parameters (Unread, Read, Archive, Priority)
  const [notifications, setNotifications] = useState([
    { id: "not-1", type: "Homework Assigned", text: "Math Chapter 3 Quadrilaterals practice worksheet published.", priority: "High", status: "Unread", timestamp: "Today, 10:00 AM" },
    { id: "not-2", type: "Assessment Results", text: "Science Term-1 review exam scores released: Sneha scored 90/100.", priority: "Medium", status: "Unread", timestamp: "Today, 08:30 AM" },
    { id: "not-3", type: "Attendance Alert", text: "Amit was marked Present for Mathematics live Doubt room.", priority: "Low", status: "Read", timestamp: "Yesterday, 11:30 AM" },
    { id: "not-4", type: "Live Class Reminder", text: "Physics Session start in 30 minutes. Direct stream ready.", priority: "High", status: "Unread", timestamp: "Yesterday, 09:00 AM" },
    { id: "not-5", type: "Payment Confirmation", text: "Fee invoice #INV-2026-004 receipt generated and successfully synced.", priority: "Medium", status: "Read", timestamp: "3 days ago" }
  ]);

  const handleMarkRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, status: "Read" } : n));
    toast.success("Notification marked as read");
  };

  const handleArchive = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, status: "Archived" } : n));
    toast.success("Notification archived successfully");
  };

  // Mock Homework Roster for selected child
  const homeworkRoster = useMemo(() => {
    if (activeChild.id === "child-1") {
      return [
        { id: "hw-1", title: "Algebra Chapter 2 Practice sheet", subject: "Mathematics", dueDate: "2026-08-05", status: "Submitted", score: "42/50", feedback: "Excellent homework. Keep it up!" },
        { id: "hw-2", title: "Laws of Motion Lab report", subject: "Science", dueDate: "2026-08-08", status: "Pending Evaluation", score: "—", feedback: "—" },
        { id: "hw-3", title: "English Poetry Analysis Exercise", subject: "English", dueDate: "2026-08-03", status: "Overdue", score: "0/30", feedback: "Homework submission missed." }
      ];
    } else {
      return [
        { id: "hw-4", title: "Fractions Chapter 1 worksheet", subject: "Mathematics", dueDate: "2026-08-04", status: "Graded", score: "28/30", feedback: "Good effort in mapping equivalent fractions." },
        { id: "hw-5", title: "Plant Cell Diagram Project", subject: "Science", dueDate: "2026-08-07", status: "Submitted", score: "—", feedback: "—" }
      ];
    }
  }, [activeChild]);

  // Mock Assessments for selected child
  const assessmentsList = useMemo(() => {
    if (activeChild.id === "child-1") {
      return [
        { id: "ass-1", title: "Weekly Quadratic Equations Quiz", type: "Quiz", date: "2026-07-28", score: "18/20", ranking: "Top 5%" },
        { id: "ass-2", title: "Trigonometry Monthly Test", type: "Test", date: "2026-07-22", score: "84/100", ranking: "Top 15%" },
        { id: "ass-3", title: "Term 1 Syllabus Review mock", type: "Mock Test", date: "2026-08-15", score: "Pending", ranking: "—" }
      ];
    } else {
      return [
        { id: "ass-4", title: "Fractions & Decimals Mini Quiz", type: "Quiz", date: "2026-07-29", score: "19/20", ranking: "Top 2%" },
        { id: "ass-5", title: "Science Chapter 1 Review test", type: "Test", date: "2026-07-25", score: "90/100", ranking: "Top 8%" }
      ];
    }
  }, [activeChild]);

  // Mock Timetable
  const timetableSessions = useMemo(() => {
    if (activeChild.id === "child-1") {
      return [
        { id: "session-1", title: "Quadratic Equations Live Lecture", type: "Live Class", subject: "Mathematics", time: "10:00 AM", instructor: "Rahul Sharma", link: "https://meet.google.com/abc-def-ghi" },
        { id: "session-2", title: "Physics Doubt Room Room", type: "Doubt Session", subject: "Science", time: "02:00 PM", instructor: "Neha Gupta", link: "https://meet.google.com/xyz-pqr-stu" }
      ];
    } else {
      return [
        { id: "session-3", title: "Basic Fractions Introduction", type: "Live Class", subject: "Mathematics", time: "11:30 AM", instructor: "Rahul Sharma", link: "https://meet.google.com/abc-def-ghi" }
      ];
    }
  }, [activeChild]);

  // Mock Teachers
  const instructors = useMemo(() => {
    return [
      { name: "Rahul Sharma", subject: "Mathematics", officeHours: "Mon-Wed 4:00 PM - 5:00 PM", email: "rahul.tutor@domain.com" },
      { name: "Neha Gupta", subject: "Science / Physics", officeHours: "Tue-Thu 3:30 PM - 4:30 PM", email: "neha.tutor@domain.com" }
    ];
  }, []);

  // Performance alerts derived automatically
  const performanceAlerts = useMemo(() => {
    const alertsList = [];
    if (activeChild.attendancePct < 95) {
      alertsList.push({ type: "Low Attendance Warning", text: `${activeChild.name}'s attendance is ${activeChild.attendancePct}%. Keep it above 95% to preserve exam clearance states.`, severity: "High" });
    }
    const missedHomeworks = homeworkRoster.filter(h => h.status === "Overdue");
    if (missedHomeworks.length > 0) {
      alertsList.push({ type: "Missing Homework Alert", text: `${activeChild.name} has missed ${missedHomeworks.length} homework deadline(s). Action required.`, severity: "High" });
    }
    const lowScores = assessmentsList.filter(a => typeof a.score === "string" && a.score.includes("/") && parseInt(a.score.split("/")[0]) < 15);
    if (lowScores.length > 0) {
      alertsList.push({ type: "Performance Attention Needed", text: `Low score achieved in recent assessment tests. Review suggestions tab.`, severity: "Medium" });
    }
    return alertsList;
  }, [activeChild, homeworkRoster, assessmentsList]);

  // Mock Calendar Events
  const calendarEvents = [
    { date: "2026-08-01", title: "Term 1 Chemistry Lab Session", type: "Workshop" },
    { date: "2026-08-05", title: "Mathematics Chapter 2 Homework submission deadline", type: "Assignment Deadline" },
    { date: "2026-08-10", title: "Term 1 Parent Teacher Association Meet", type: "Parent Meeting" },
    { date: "2026-08-15", title: "Weekly Science Review Test", type: "Exam" },
    { date: "2026-08-22", title: "National Independence Day Holiday", type: "Holiday" }
  ];

  // Document Center Mock
  const documentFiles = [
    { title: "Algebra Linear Equations Notes.pdf", subject: "Mathematics", uploadedBy: "Rahul Sharma", date: "2026-07-28" },
    { title: "Science Chapter 1 Lab Worksheets.pdf", subject: "Science", uploadedBy: "Neha Gupta", date: "2026-07-25" },
    { title: "English Grammar Tenses Handbook.pdf", subject: "English", uploadedBy: "Aditi Sen", date: "2026-07-20" }
  ];

  // Messaging Mock (Parent to Teacher communication)
  const [messages, setMessages] = useState([
    { sender: "Parent", text: "Hello Mr. Rahul, I wanted to inquire about Amit's performance in Algebra mock test.", time: "Today, 10:15 AM" },
    { sender: "Rahul Sharma (Tutor)", text: "Amit is doing extremely well in linear equations. Just needs to pay more attention to quadratic variables scaling.", time: "Today, 10:30 AM" }
  ]);
  const [newMsgText, setNewMsgText] = useState("");

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsgText.trim()) return;
    setMessages(prev => [...prev, { sender: "Parent", text: newMsgText.trim(), time: "Just now" }]);
    setNewMsgText("");
    toast.success("Message dispatched to course teacher!");
  };

  return (
    <PageWrapper>
      <section className="py-10 text-left min-h-[90vh] bg-muted/20">
        <Container className="max-w-6xl space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-primary/10 via-background to-background p-6 rounded-2xl border border-primary/20">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase">
                <Users size={12} /> Parent Dashboard Workspace
              </span>
              <h2 className="text-xl md:text-2xl font-heading font-extrabold text-foreground">
                Guardian Portal Console
              </h2>
              <p className="text-xs text-muted-foreground">
                Monitor live timetables, verify grading reports, track fee plans, and consult school teacher logs.
              </p>
            </div>
            {/* Child Switcher */}
            <div className="flex gap-2.5 items-center shrink-0">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Select Child:</span>
              <div className="flex bg-card border border-border p-1 rounded-xl gap-1">
                {childrenList.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedChildId(c.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      selectedChildId === c.id
                        ? "bg-primary text-white shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span>{c.avatar}</span>
                    <span>{c.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Child Metadata Strip */}
          <div className="flex flex-wrap gap-4 text-xs font-semibold bg-card border border-border p-4 rounded-xl">
            <span className="text-muted-foreground">Curriculum: <strong className="text-foreground">{activeChild.class} ({activeChild.board} Board)</strong></span>
            <span className="text-border">|</span>
            <span className="text-muted-foreground">Section: <strong className="text-foreground">{activeChild.section}</strong></span>
            <span className="text-border">|</span>
            <span className="text-muted-foreground">Roll No: <strong className="text-foreground">{activeChild.rollNumber}</strong></span>
            <span className="text-border">|</span>
            <span className="text-muted-foreground">Admission Code: <strong className="text-foreground">{activeChild.admissionNumber}</strong></span>
          </div>

          {/* Performance Alerts Center */}
          {performanceAlerts.length > 0 && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl space-y-2.5">
              <div className="flex items-center gap-1.5 text-rose-500 font-extrabold text-xs uppercase tracking-wider">
                <AlertCircle size={14} /> Attention: System Warning indicators detected
              </div>
              <div className="grid gap-2">
                {performanceAlerts.map((alert, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs font-semibold p-2.5 bg-card/65 rounded-lg border border-border">
                    <span className="text-foreground">{alert.text}</span>
                    <Badge variant="danger" className="text-[9px] uppercase font-bold">{alert.severity} Alert</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab Selection */}
          <div className="flex flex-wrap gap-1 border-b border-border pb-px">
            {([
              "overview", 
              "homework", 
              "assessments", 
              "timetable", 
              "teachers", 
              "reports", 
              "calendar", 
              "documents", 
              "communication", 
              "fees", 
              "ai"
            ] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-2.5 text-xs font-bold capitalize transition-all relative border-b-2 ${
                  activeTab === tab
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab === "ai" ? "AI Parent Hub" : tab}
              </button>
            ))}
          </div>

          {/* Tab Renderers */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-200">
              {/* Left Column: Analytics Stats & Remarks */}
              <div className="lg:col-span-8 space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="p-4 border-border bg-card">
                    <span className="text-[10px] font-bold uppercase text-muted-foreground">Attendance rate</span>
                    <h3 className="text-2xl font-extrabold text-emerald-500 mt-1">{activeChild.attendancePct}%</h3>
                  </Card>
                  <Card className="p-4 border-border bg-card">
                    <span className="text-[10px] font-bold uppercase text-muted-foreground">Homework completed</span>
                    <h3 className="text-2xl font-extrabold text-primary mt-1">{activeChild.homeworkCompletionPct}%</h3>
                  </Card>
                  <Card className="p-4 border-border bg-card">
                    <span className="text-[10px] font-bold uppercase text-muted-foreground">Average Performance</span>
                    <h3 className="text-2xl font-extrabold text-primary mt-1">{activeChild.avgScore} Score</h3>
                  </Card>
                  <Card className="p-4 border-border bg-card">
                    <span className="text-[10px] font-bold uppercase text-muted-foreground">Pending Homework</span>
                    <h3 className="text-2xl font-extrabold text-amber-500 mt-1">
                      {homeworkRoster.filter(h => h.status !== "Submitted" && h.status !== "Graded").length} Tasks
                    </h3>
                  </Card>
                </div>

                {/* Teacher Remarks Card */}
                <Card className="p-5 border-border bg-card space-y-2">
                  <h4 className="font-extrabold text-xs text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquare size={14} className="text-primary" />
                    Teacher Academic Remarks
                  </h4>
                  <p className="text-xs text-muted-foreground italic leading-relaxed bg-muted/20 p-4 rounded-lg border border-border">
                    &quot;{activeChild.teacherRemarks}&quot;
                  </p>
                </Card>

                {/* Timetable previews */}
                <div className="space-y-3">
                  <h4 className="font-extrabold text-xs text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar size={14} className="text-primary" />
                    Today&apos;s Live Rooms Timetable
                  </h4>
                  {timetableSessions.map((session) => (
                    <Card key={session.id} className="p-4 border-border bg-card hover:border-primary/30 transition flex justify-between items-center">
                      <div className="space-y-1">
                        <Badge variant="outline" className="text-[8px] font-bold uppercase">
                          {session.type}
                        </Badge>
                        <h4 className="font-extrabold text-xs text-foreground">{session.title}</h4>
                        <p className="text-[10px] text-muted-foreground">Instructor: {session.instructor} • Subject: {session.subject}</p>
                      </div>
                      <a
                        href={session.link}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-primary text-white text-[10px] font-extrabold hover:bg-primary/95 transition"
                      >
                        Join Room
                      </a>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Right Column: Alerts & Notification Feeds */}
              <div className="lg:col-span-4 space-y-6">
                <Card className="p-5 border-border bg-card space-y-4">
                  <h4 className="font-extrabold text-xs text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Bell size={14} className="text-amber-500" />
                    Alert Notifications Feed
                  </h4>
                  <div className="space-y-3">
                    {notifications.filter(n => n.status !== "Archived").map((al) => (
                      <div key={al.id} className="text-xs space-y-1 border-b border-border/40 pb-2.5 last:border-0 last:pb-0 text-left">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-foreground text-[10.5px]">{al.type}</span>
                          <span className="text-[9px] text-muted-foreground">{al.timestamp}</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground leading-relaxed">{al.text}</p>
                        <div className="flex gap-2 pt-1 select-none">
                          {al.status === "Unread" && (
                            <button onClick={() => handleMarkRead(al.id)} className="text-[9px] text-primary font-extrabold hover:underline">Mark read</button>
                          )}
                          <button onClick={() => handleArchive(al.id)} className="text-[9px] text-muted-foreground font-extrabold hover:underline">Archive</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          )}

          {activeTab === "homework" && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <h3 className="font-extrabold text-xs text-foreground uppercase tracking-wider">Assigned Homework & Submissions log</h3>
              {homeworkRoster.map((hw) => (
                <Card key={hw.id} className="p-4 border-border bg-card flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-extrabold uppercase text-muted-foreground">{hw.subject}</span>
                    <h4 className="font-extrabold text-xs text-foreground">{hw.title}</h4>
                    <p className="text-[10px] text-muted-foreground">Due: {hw.dueDate}</p>
                    {hw.feedback !== "—" && (
                      <p className="text-[10px] bg-primary/5 p-2 rounded border border-primary/20 text-muted-foreground mt-2 leading-relaxed italic">
                        Teacher Feedback: {hw.feedback}
                      </p>
                    )}
                  </div>
                  <div className="flex sm:flex-col items-start sm:items-end gap-1.5 shrink-0">
                    <Badge variant="outline" className="text-[9px] font-bold uppercase">
                      {hw.status}
                    </Badge>
                    <span className="text-xs font-extrabold text-foreground">{hw.score} Marks</span>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {activeTab === "assessments" && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <h3 className="font-extrabold text-xs text-foreground uppercase tracking-wider">Assessment Performance & Quiz scores</h3>
              {assessmentsList.map((ass) => (
                <Card key={ass.id} className="p-4 border-border bg-card flex justify-between items-center">
                  <div className="space-y-1">
                    <Badge variant="outline" className="text-[8px] font-bold uppercase">
                      {ass.type}
                    </Badge>
                    <h4 className="font-extrabold text-xs text-foreground">{ass.title}</h4>
                    <p className="text-[10px] text-muted-foreground">Date: {ass.date}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-extrabold text-foreground">{ass.score}</p>
                    <p className="text-[9.5px] text-emerald-500 font-bold">{ass.ranking}</p>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {activeTab === "timetable" && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <h3 className="font-extrabold text-xs text-foreground uppercase tracking-wider">Live Lectures Timetable schedule</h3>
              {timetableSessions.map((session) => (
                <Card key={session.id} className="p-4 border-border bg-card flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="space-y-1">
                    <Badge variant="outline" className="text-[8px] font-bold uppercase">
                      {session.type}
                    </Badge>
                    <h4 className="font-extrabold text-xs text-foreground">{session.title}</h4>
                    <p className="text-[10px] text-muted-foreground">Start Time: {session.time} • Instructor: {session.instructor}</p>
                  </div>
                  <a
                    href={session.link}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-primary text-white text-[10px] font-extrabold hover:bg-primary/95 transition shadow-sm"
                  >
                    Launch Live Stream
                  </a>
                </Card>
              ))}
            </div>
          )}

          {activeTab === "teachers" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-200">
              {instructors.map((ins, idx) => (
                <Card key={idx} className="p-5 border-border bg-card text-left space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-extrabold text-sm">
                      {ins.name[0]}
                    </div>
                    <span className="inline-flex rounded-full bg-emerald-500/10 text-emerald-600 px-2 py-0.5 text-[9px] font-bold uppercase">
                      Verified Faculty
                    </span>
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-xs text-foreground">{ins.name}</h4>
                    <p className="text-[11px] text-muted-foreground">Subject Coordinator: <strong className="text-foreground">{ins.subject}</strong></p>
                    <p className="text-[10px] text-muted-foreground">Office hours: {ins.officeHours}</p>
                    <p className="text-[10px] text-muted-foreground">Contact: {ins.email}</p>
                  </div>
                  <Divider />
                  <Button size="sm" variant="outline" className="w-full text-[10px] font-bold transition" onClick={() => setActiveTab("communication")}>
                    Send Message Dialog
                  </Button>
                </Card>
              ))}
            </div>
          )}

          {activeTab === "reports" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex justify-between items-center">
                <h3 className="font-extrabold text-xs text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <FileText size={14} className="text-primary" /> School Report Cards generator
                </h3>
                <Button size="sm" className="gap-1.5 text-[10px] font-extrabold" onClick={() => toast.success("Exporting report card PDF simulation...")}>
                  <FileDown size={14} /> Export Report Card PDF
                </Button>
              </div>

              <Card className="p-6 border-border bg-card space-y-6 max-w-2xl text-left">
                <div className="flex justify-between items-start border-b border-border/40 pb-4">
                  <div className="space-y-1">
                    <h4 className="text-sm font-extrabold text-foreground">{activeChild.name}</h4>
                    <p className="text-[11px] text-muted-foreground">{activeChild.class} Section {activeChild.section} • Roll Number: {activeChild.rollNumber}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-extrabold bg-primary/10 text-primary px-2.5 py-1 rounded">Overall Grade: A</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <span className="text-[9px] uppercase font-bold text-muted-foreground block">Subject-wise Marks</span>
                  <div className="grid gap-2 text-xs">
                    <div className="flex justify-between p-2 bg-muted/20 border border-border rounded-lg">
                      <span>Mathematics</span>
                      <strong className="text-foreground">90/100 (90%)</strong>
                    </div>
                    <div className="flex justify-between p-2 bg-muted/20 border border-border rounded-lg">
                      <span>Science</span>
                      <strong className="text-foreground">84/100 (84%)</strong>
                    </div>
                    <div className="flex justify-between p-2 bg-muted/20 border border-border rounded-lg">
                      <span>English</span>
                      <strong className="text-foreground">88/100 (88%)</strong>
                    </div>
                  </div>
                </div>

                <div className="space-y-1 bg-muted/10 p-3 rounded-lg border border-border">
                  <strong className="text-[10px] text-foreground uppercase block">Performance Graph Trend:</strong>
                  <div className="h-4 bg-primary/20 rounded mt-1.5 flex" style={{ width: "90%" }}>
                    <span className="text-[8px] font-bold text-primary pl-2 flex items-center">Term-1 performance (90%)</span>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {activeTab === "calendar" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <h3 className="font-extrabold text-xs text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <CalendarDays size={14} className="text-primary" /> Academic Calendar Events
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {calendarEvents.map((ev, idx) => (
                  <Card key={idx} className="p-4 border-border bg-card flex justify-between items-center text-left">
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold bg-muted px-1.5 py-0.5 rounded text-muted-foreground uppercase">{ev.type}</span>
                      <h4 className="font-bold text-xs text-foreground mt-1.5">{ev.title}</h4>
                    </div>
                    <span className="text-[10.5px] font-extrabold text-primary shrink-0">{ev.date}</span>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === "documents" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <h3 className="font-extrabold text-xs text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <FolderOpen size={14} className="text-primary" /> Academic Document Center
              </h3>

              <div className="grid gap-3">
                {documentFiles.map((doc, idx) => (
                  <Card key={idx} className="p-4 border-border bg-card flex justify-between items-center text-left">
                    <div className="space-y-1">
                      <span className="text-[10px] font-extrabold text-muted-foreground uppercase">{doc.subject}</span>
                      <h4 className="font-bold text-xs text-foreground">{doc.title}</h4>
                      <p className="text-[9.5px] text-muted-foreground">Uploaded by: {doc.uploadedBy} • Date: {doc.date}</p>
                    </div>
                    <Button size="sm" variant="outline" className="gap-1 text-[10px]" onClick={() => toast.success(`Downloading ${doc.title}...`)}>
                      <Download size={12} /> Download
                    </Button>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === "communication" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-200 text-left">
              {/* Left Side Chat Log */}
              <div className="lg:col-span-8 space-y-4">
                <Card className="p-5 border-border bg-card space-y-4 min-h-[300px] flex flex-col justify-between">
                  <div className="space-y-3.5">
                    <div className="border-b border-border/40 pb-2 flex justify-between items-center">
                      <h4 className="font-extrabold text-xs text-foreground uppercase">Consult Subject Instructors</h4>
                      <Badge variant="outline" className="text-[9px] uppercase font-bold">Active Chat sandbox</Badge>
                    </div>

                    <div className="space-y-3 overflow-y-auto max-h-[250px] p-1">
                      {messages.map((m, idx) => (
                        <div key={idx} className={`max-w-[80%] rounded-lg p-2.5 text-xs font-semibold ${
                          m.sender === "Parent"
                            ? "bg-primary text-white ml-auto"
                            : "bg-muted text-foreground mr-auto"
                        }`}>
                          <div className="flex justify-between items-center gap-4 text-[9px] opacity-75 mb-1">
                            <span>{m.sender}</span>
                            <span>{m.time}</span>
                          </div>
                          <p className="leading-relaxed">{m.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <form onSubmit={handleSendMessage} className="flex gap-2 border-t border-border/30 pt-3">
                    <input
                      type="text"
                      required
                      placeholder="Write message to coordinator..."
                      value={newMsgText}
                      onChange={(e) => setNewMsgText(e.target.value)}
                      className="flex-1 text-xs bg-background border border-border px-3 py-2 rounded-lg"
                    />
                    <Button type="submit" size="sm">Send Chat</Button>
                  </form>
                </Card>
              </div>

              {/* Right Side Info */}
              <div className="lg:col-span-4 space-y-4">
                <Card className="p-5 border-border bg-card space-y-3">
                  <h4 className="font-extrabold text-xs text-foreground uppercase flex items-center gap-1"><Info size={14} className="text-primary" /> Chat details</h4>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    Message notifications map directly to teacher portal inbox modules, triggering alerts instantly.
                  </p>
                </Card>
              </div>
            </div>
          )}

          {activeTab === "fees" && (
            <Card className="p-5 border-border bg-card space-y-4 max-w-xl text-left animate-in fade-in duration-200">
              <h3 className="font-extrabold text-xs text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <CreditCard size={14} className="text-primary" />
                Fee Plan & Statements Ledger
              </h3>
              <div className="space-y-3">
                <div className="p-4 bg-muted/20 border border-border rounded-lg flex justify-between items-center">
                  <div>
                    <h4 className="font-extrabold text-xs text-foreground">School Tuition annual plan</h4>
                    <p className="text-[10px] text-muted-foreground">Active Term: Academic Year 2026-27</p>
                  </div>
                  <span className="text-xs font-extrabold text-foreground">₹2,500/Month</span>
                </div>
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-muted-foreground">Upcoming Installment Due Date:</span>
                  <span className="text-rose-500">2026-08-10</span>
                </div>
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-muted-foreground">Fee status:</span>
                  <span className="text-emerald-500 font-bold">Paid for July 2026</span>
                </div>
                
                <hr className="border-border/40" />

                <div>
                  <span className="text-[9px] uppercase font-bold text-muted-foreground block mb-2">Payment History Logs</span>
                  <div className="space-y-2">
                    <div className="p-2.5 bg-muted/10 border border-border rounded flex justify-between items-center text-xs">
                      <div>
                        <strong className="text-[10px] text-foreground block">INV-2026-004 Tuition fee</strong>
                        <span className="text-[9px] text-muted-foreground">Paid on 2026-07-28 • Razorpay Sandbox</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-foreground">₹2,500</span>
                        <button className="text-[9px] text-primary hover:underline block" onClick={() => toast.success("Generating invoice copy...")}>Receipt</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {activeTab === "ai" && (
            <Card className="p-5 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background rounded-2xl space-y-4 max-w-xl text-left animate-in fade-in duration-200">
              <h3 className="font-extrabold text-xs text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <BrainCircuit size={14} className="text-primary animate-pulse" />
                AI Parent Assistant (Sandbox preview)
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Unlock weekly cognitive metrics summaries, study plan suggestions, and attendance patterns prediction logs.
              </p>
              <div className="space-y-3 p-3 bg-muted/20 border border-border rounded-xl">
                <div className="space-y-1">
                  <strong className="text-xs text-foreground block">Weekly summary preview (Amit Kumar):</strong>
                  <p className="text-[10.5px] text-muted-foreground leading-relaxed italic">
                    &quot;Amit completed 2 of 3 homework assignments this week. Excellent test marks (90%) achieved in Quadratic equations quiz. Recommendation: Schedule 1 extra doubt hour session on Science Cell Diagrams next Tuesday.&quot;
                  </p>
                </div>
              </div>
            </Card>
          )}

        </Container>
      </section>
    </PageWrapper>
  );
}
