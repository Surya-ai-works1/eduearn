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
  Award
} from "lucide-react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Divider } from "../ui/divider";

interface TeacherStudioViewProps {
  user: any;
  academy?: any;
}

export function TeacherStudioView({ user, academy }: TeacherStudioViewProps) {
  // Configured Tabs from Academy or default values matching configuration-driven layout
  const configTabs = useMemo(() => {
    // K-12 School Tuition Teachers should ONLY see Assigned Classes, Attendance, Homework/Activities, Timetable/Schedules, Report Cards, and Student Progress.
    if (academy?.slug === "school-tuition") {
      return ["overview", "classes", "activities", "attendance", "schedules", "progress", "report-cards", "notices", "ai"];
    }
    const baseTabs = academy?.dashboardLayout?.tabs || ["overview", "classes", "activities", "attendance", "schedules", "progress", "documents", "notices", "report-cards", "analytics", "ai"];
    const extraTabs = ["requests", "wallet", "referrals", "badges"];
    const merged = [...baseTabs];
    extraTabs.forEach(t => {
      if (!merged.includes(t)) merged.push(t);
    });
    return merged;
  }, [academy]);

  const [activeTab, setActiveTab] = useState("overview");
  const [selectedClassFilter, setSelectedClassFilter] = useState("Class 10 A");

  // Mock Teacher assignments mapping (Extended mapping details)
  const assignments = [
    { id: "assign-1", board: "CBSE", class: "Class 10", section: "Section A", subject: "Mathematics", academicYear: "2026-27" },
    { id: "assign-2", board: "CBSE", class: "Class 9", section: "Section B", subject: "Science", academicYear: "2026-27" }
  ];

  // Activities state (Homework, Assignments, Labs, Projects)
  const [activities, setActivities] = useState([
    { id: "act-1", title: "Algebra Chapter 2 Practice sheet", type: "Homework", subject: "Mathematics", class: "Class 10 A", dueDate: "2026-08-05", maxMarks: 50, attachment: "algebra_sheet.pdf", video: "https://www.w3schools.com/html/mov_bbb.mp4", pendingCount: 4 },
    { id: "act-2", title: "Laws of Motion Lab report submission", type: "Lab", subject: "Science", class: "Class 9 B", dueDate: "2026-08-08", maxMarks: 100, attachment: "motion_lab.pdf", video: "", pendingCount: 0 },
    { id: "act-3", title: "Trigonometric Identites Project work", type: "Project", subject: "Mathematics", class: "Class 10 A", dueDate: "2026-08-12", maxMarks: 100, attachment: "", video: "", pendingCount: 2 }
  ]);

  // Schedules state (Live Classes, Doubt Sessions, Workshops)
  const [schedules, setSchedules] = useState([
    { id: "sched-1", title: "Quadratic Equations Live Class", type: "Live Class", subject: "Mathematics", class: "Class 10 A", date: "2026-08-01", time: "10:00 AM", duration: 60, link: "https://meet.google.com/abc-def-ghi" },
    { id: "sched-2", title: "Science Chapter 1 Doubt Room", type: "Doubt Session", subject: "Science", class: "Class 9 B", date: "2026-08-01", time: "02:00 PM", duration: 45, link: "https://meet.google.com/xyz-pqr-stu" }
  ]);

  // Students Progress and Attendance State
  const [students, setStudents] = useState([
    { id: "st-1", name: "Amit Kumar", class: "Class 10 A", attendancePct: 92, completedHomeworks: 5, averageScore: 88, status: "Present" },
    { id: "st-2", name: "Priya Sharma", class: "Class 10 A", attendancePct: 88, completedHomeworks: 4, averageScore: 94, status: "Present" },
    { id: "st-3", name: "Rahul Singh", class: "Class 10 A", attendancePct: 76, completedHomeworks: 3, averageScore: 68, status: "Absent" },
    { id: "st-4", name: "Sneha Patel", class: "Class 9 B", attendancePct: 95, completedHomeworks: 6, averageScore: 91, status: "Present" }
  ]);

  const filteredStudents = useMemo(() => {
    return students.filter((s) => s.class === selectedClassFilter);
  }, [students, selectedClassFilter]);

  // Forms state
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [actTitle, setActTitle] = useState("");
  const [actType, setActType] = useState("Homework");
  const [actClass, setActClass] = useState("Class 10 A");
  const [actDueDate, setActDueDate] = useState("");
  const [actMaxMarks, setActMaxMarks] = useState("100");
  const [actAttachment, setActAttachment] = useState("");
  const [actVideo, setActVideo] = useState("");

  // Notices / Announcements states
  const [noticesList, setNoticesList] = useState([
    { id: "notice-1", title: "Term 1 Chemistry Lab Guidelines", type: "Circular", class: "Class 9 B", date: "2026-07-28", content: "All students are required to carry science journals." },
    { id: "notice-2", title: "Mathematics Chapter 2 Extra doubt sessions", type: "Live Class Notice", class: "Class 10 A", date: "2026-07-29", content: "Doubt clearing hour mapped at 4:00 PM." }
  ]);
  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeType, setNoticeType] = useState("Homework Notice");
  const [noticeClass, setNoticeClass] = useState("Class 10 A");
  const [noticeText, setNoticeText] = useState("");

  const handleCreateNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitle.trim() || !noticeText.trim()) {
      toast.error("Please fill in notice title and details.");
      return;
    }
    const newNotice = {
      id: `notice-${Date.now()}`,
      title: noticeTitle.trim(),
      type: noticeType,
      class: noticeClass,
      date: new Date().toISOString().split("T")[0],
      content: noticeText.trim()
    };
    setNoticesList(prev => [newNotice, ...prev]);
    toast.success("Notice published successfully!");
    setNoticeTitle("");
    setNoticeText("");
  };

  // Report Cards State
  const [reportsList, setReportsList] = useState([
    { id: "rep-1", studentName: "Amit Kumar", class: "Class 10 A", Math: 90, Science: 84, English: 88, remarks: "Consistent efforts, showing high aptitude." }
  ]);
  const [reportStudent, setReportStudent] = useState("st-1");
  const [reportMath, setReportMath] = useState("90");
  const [reportScience, setReportScience] = useState("85");
  const [reportEnglish, setReportEnglish] = useState("88");
  const [reportRemarks, setReportRemarks] = useState("");

  const handleCreateReport = (e: React.FormEvent) => {
    e.preventDefault();
    const stRecord = students.find(s => s.id === reportStudent);
    if (!stRecord) return;
    const newRep = {
      id: `rep-${Date.now()}`,
      studentName: stRecord.name,
      class: stRecord.class,
      Math: Number(reportMath) || 0,
      Science: Number(reportScience) || 0,
      English: Number(reportEnglish) || 0,
      remarks: reportRemarks.trim() || "Good performance overall."
    };
    setReportsList(prev => [newRep, ...prev]);
    toast.success(`Report Card saved successfully for ${stRecord.name}!`);
    setReportRemarks("");
  };

  // Document Uploads State
  const [uploadedDocs, setUploadedDocs] = useState([
    { title: "Algebra Linear Equations Notes.pdf", subject: "Mathematics", date: "2026-07-28" }
  ]);
  const [docTitle, setDocTitle] = useState("");
  const [docSubject, setDocSubject] = useState("Mathematics");

  const handleUploadDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim()) return;
    setUploadedDocs(prev => [{ title: docTitle.trim(), subject: docSubject, date: new Date().toISOString().split("T")[0] }, ...prev]);
    toast.success("Document uploaded successfully!");
    setDocTitle("");
  };

  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [schedTitle, setSchedTitle] = useState("");
  const [schedType, setSchedType] = useState("Live Class");
  const [schedClass, setSchedClass] = useState("Class 10 A");
  const [schedDate, setSchedDate] = useState("");
  const [schedTime, setSchedTime] = useState("");
  const [schedDuration, setSchedDuration] = useState("60");
  const [schedLink, setSchedLink] = useState("");

  const handleCreateActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actTitle.trim() || !actDueDate) {
      toast.error("Please enter a title and select a due date.");
      return;
    }
    const newAct = {
      id: `act-${Date.now()}`,
      title: actTitle.trim(),
      type: actType,
      subject: actClass.includes("10") ? "Mathematics" : "Science",
      class: actClass,
      dueDate: actDueDate,
      maxMarks: Number(actMaxMarks) || 100,
      attachment: actAttachment.trim() || undefined,
      video: actVideo.trim() || undefined,
      pendingCount: 0
    } as any;
    setActivities((prev) => [newAct, ...prev]);
    toast.success("Activity task created successfully!");
    setShowActivityForm(false);
    setActTitle("");
    setActDueDate("");
  };

  const handleCreateSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedTitle.trim() || !schedDate || !schedTime) {
      toast.error("Please enter a title, date, and scheduled time.");
      return;
    }
    const newSched = {
      id: `sched-${Date.now()}`,
      title: schedTitle.trim(),
      type: schedType,
      subject: schedClass.includes("10") ? "Mathematics" : "Science",
      class: schedClass,
      date: schedDate,
      time: schedTime,
      duration: Number(schedDuration) || 60,
      link: schedLink.trim() || "https://meet.google.com/abc-def-ghi"
    };
    setSchedules((prev) => [newSched, ...prev]);
    toast.success("Event scheduled successfully!");
    setShowScheduleForm(false);
    setSchedTitle("");
    setSchedDate("");
    setSchedTime("");
  };

  const handleDeleteActivity = (id: string) => {
    setActivities((prev) => prev.filter(a => a.id !== id));
    toast.success("Activity removed successfully.");
  };

  const handleDeleteSchedule = (id: string) => {
    setSchedules((prev) => prev.filter(s => s.id !== id));
    toast.success("Scheduled session cancelled.");
  };

  const handleToggleAttendance = (studentId: string) => {
    setStudents((prev) => prev.map(s => {
      if (s.id === studentId) {
        const nextStatus = s.status === "Present" ? "Absent" : s.status === "Absent" ? "Excused" : "Present";
        return { ...s, status: nextStatus };
      }
      return s;
    }));
    toast.success("Student attendance status toggled.");
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header Profile Greeting */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-primary/10 via-background to-background p-6 rounded-2xl border border-primary/20">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase">
            <Sparkles size={10} /> Teacher Studio Portal
          </div>
          <h2 className="text-xl md:text-2xl font-heading font-extrabold text-foreground">
            Class Workspace: {user?.fullName || "Teacher"}
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Manage boards, mark student rosters, publish homework templates, and host dynamic live lecture schedules.
          </p>
        </div>
      </div>

      {/* Configuration-driven Tabs */}
      <div className="flex flex-wrap gap-1.5 border-b border-border pb-px">
        {configTabs.map((tab: string) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-xs font-bold transition-all relative border-b-2 capitalize ${
              activeTab === tab
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content renderer */}
      {activeTab === "overview" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Reusable Analytics Dashboard */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4 border-border bg-card">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-bold uppercase text-muted-foreground">Assigned Students</p>
                  <h3 className="text-2xl font-extrabold text-foreground mt-1">{students.length} Pupils</h3>
                </div>
                <span className="p-1.5 bg-primary/10 rounded-lg text-primary"><Users size={16} /></span>
              </div>
            </Card>
            <Card className="p-4 border-border bg-card">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-bold uppercase text-muted-foreground">Class Attendance Rate</p>
                  <h3 className="text-2xl font-extrabold text-emerald-500 mt-1">
                    {Math.round(students.reduce((acc, curr) => acc + curr.attendancePct, 0) / students.length)}%
                  </h3>
                </div>
                <span className="p-1.5 bg-emerald-500/10 rounded-lg text-emerald-500"><UserCheck size={16} /></span>
              </div>
            </Card>
            <Card className="p-4 border-border bg-card">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-bold uppercase text-muted-foreground">Pending Submissions</p>
                  <h3 className="text-2xl font-extrabold text-amber-500 mt-1">
                    {activities.reduce((acc, curr) => acc + curr.pendingCount, 0)} Reviews
                  </h3>
                </div>
                <span className="p-1.5 bg-amber-500/10 rounded-lg text-amber-500"><ClipboardList size={16} /></span>
              </div>
            </Card>
            <Card className="p-4 border-border bg-card">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-bold uppercase text-muted-foreground">Upcoming Live Sessions</p>
                  <h3 className="text-2xl font-extrabold text-purple-500 mt-1">{schedules.length} Scheduled</h3>
                </div>
                <span className="p-1.5 bg-purple-500/10 rounded-lg text-purple-500"><Video size={16} /></span>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left side: Today's Classes & Timetable preview */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar size={16} className="text-primary" />
                  Today&apos;s Live Rooms schedule
                </h3>
                <Button size="sm" onClick={() => setActiveTab("schedules")} className="text-[10px] h-8 font-bold">
                  View Timetable planner
                </Button>
              </div>

              <div className="space-y-3">
                {schedules.map((item) => (
                  <Card key={item.id} className="p-4 border-border bg-card hover:border-primary/30 transition">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[8px] font-bold uppercase">
                            {item.type}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">{item.class} • {item.subject}</span>
                        </div>
                        <h4 className="font-extrabold text-xs text-foreground">{item.title}</h4>
                        <p className="text-[10px] text-muted-foreground">Duration: {item.duration} mins</p>
                      </div>
                      <div className="flex sm:flex-col items-start sm:items-end gap-2 shrink-0">
                        <span className="text-[10px] font-bold text-foreground flex items-center gap-1">
                          <Clock size={11} className="text-primary" />
                          {item.time} ({item.date})
                        </span>
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-primary text-white text-[10px] font-extrabold hover:bg-primary/95 transition shadow-sm"
                        >
                          Launch Meeting
                        </a>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Right side: Homework awaiting reviews */}
            <div className="lg:col-span-4 space-y-4">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle size={16} className="text-amber-500" />
                Action Required
              </h3>
              <Card className="p-4 border-border bg-card space-y-3">
                <span className="text-[9px] font-extrabold uppercase text-muted-foreground tracking-wider block">Pending grading reviews</span>
                <div className="space-y-3 divide-y divide-border">
                  {activities.filter(a => a.pendingCount > 0).map((act) => (
                    <div key={act.id} className="pt-2.5 first:pt-0 space-y-1">
                      <div className="flex justify-between items-center text-[10.5px] font-bold">
                        <span className="text-foreground truncate max-w-[150px]">{act.title}</span>
                        <span className="text-amber-500 text-[9.5px] font-extrabold">{act.pendingCount} Submissions</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground">{act.class} • {act.type}</p>
                      <button
                        onClick={() => setActiveTab("activities")}
                        className="text-[9.5px] text-primary font-bold hover:underline block pt-1"
                      >
                        Start Grading Evaluation →
                      </button>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}

      {activeTab === "classes" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Teacher Class Assignments Registry</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assignments.map((ass) => (
              <Card key={ass.id} className="p-5 border-border bg-card hover:shadow-soft transition text-left space-y-3">
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-extrabold text-sm">
                    {ass.subject[0]}
                  </div>
                  <Badge variant="outline" className="text-[9px] font-bold uppercase">
                    Academic Year {ass.academicYear}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <h4 className="font-extrabold text-sm text-foreground">{ass.subject}</h4>
                  <p className="text-xs text-muted-foreground">{ass.board} Board • Grade Level: {ass.class}</p>
                  <p className="text-xs text-muted-foreground">Classroom Section: <strong className="text-foreground">{ass.section}</strong></p>
                </div>
                <Divider />
                <div className="flex items-center justify-between text-[10px] font-bold">
                  <span className="text-muted-foreground">Interactive status:</span>
                  <span className="text-emerald-500">Active Curriculum Mapping</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === "activities" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex justify-between items-center bg-muted/20 p-4 rounded-xl border border-border">
            <div>
              <h3 className="font-extrabold text-xs text-foreground">Activities & Homework Tasks ({activities.length})</h3>
              <p className="text-[10px] text-muted-foreground">Reuse existing Activity Engine for Homeworks, Labs, and Projects.</p>
            </div>
            <Button size="sm" onClick={() => setShowActivityForm(!showActivityForm)} className="text-[10px] h-8 font-bold flex items-center gap-1">
              <Plus size={12} /> {showActivityForm ? "Close Form" : "Create Task"}
            </Button>
          </div>

          {/* Form to create Activity */}
          {showActivityForm && (
            <Card className="p-5 border-border bg-card space-y-4 max-w-xl">
              <h4 className="font-heading font-extrabold text-xs text-foreground uppercase tracking-wider">Publish New Activity Task</h4>
              <form onSubmit={handleCreateActivity} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Task Title</label>
                  <input
                    type="text"
                    required
                    value={actTitle}
                    onChange={(e) => setActTitle(e.target.value)}
                    placeholder="e.g. Chapter 2 Homework sheet"
                    className="w-full text-xs bg-background border border-border px-3 py-2 rounded-lg focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Task Type</label>
                    <select
                      value={actType}
                      onChange={(e) => setActType(e.target.value)}
                      className="w-full text-xs bg-background border border-border px-3 py-2 rounded-lg focus:outline-none"
                    >
                      <option>Homework</option>
                      <option>Assignment</option>
                      <option>Lab</option>
                      <option>Project</option>
                      <option>Practice Exercise</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Target Class</label>
                    <select
                      value={actClass}
                      onChange={(e) => setActClass(e.target.value)}
                      className="w-full text-xs bg-background border border-border px-3 py-2 rounded-lg focus:outline-none"
                    >
                      <option>Class 10 A</option>
                      <option>Class 9 B</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Due Date</label>
                    <input
                      type="date"
                      required
                      value={actDueDate}
                      onChange={(e) => setActDueDate(e.target.value)}
                      className="w-full text-xs bg-background border border-border px-3 py-2 rounded-lg focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Max Marks</label>
                    <input
                      type="number"
                      value={actMaxMarks}
                      onChange={(e) => setActMaxMarks(e.target.value)}
                      placeholder="100"
                      className="w-full text-xs bg-background border border-border px-3 py-2 rounded-lg focus:outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Attachment URL (PDF)</label>
                    <input
                      type="text"
                      value={actAttachment}
                      onChange={(e) => setActAttachment(e.target.value)}
                      placeholder="algebra_sheet.pdf"
                      className="w-full text-xs bg-background border border-border px-3 py-2 rounded-lg focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Video Lecture URL (Optional)</label>
                    <input
                      type="text"
                      value={actVideo}
                      onChange={(e) => setActVideo(e.target.value)}
                      placeholder="https://video..."
                      className="w-full text-xs bg-background border border-border px-3 py-2 rounded-lg focus:outline-none"
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full py-2.5 text-xs font-bold mt-2">
                  Publish Activity Task
                </Button>
              </form>
            </Card>
          )}

          {/* Activities list */}
          <div className="space-y-3">
            {activities.map((act) => (
              <Card key={act.id} className="p-4 border-border bg-card">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[8px] font-bold uppercase">
                        {act.type}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">{act.class} • Subject: {act.subject}</span>
                    </div>
                    <h4 className="font-extrabold text-xs text-foreground">{act.title}</h4>
                    <p className="text-[10px] text-muted-foreground">Due: {act.dueDate} • Max Score: {act.maxMarks} Marks</p>
                    {act.attachment && (
                      <span className="inline-flex items-center gap-1 text-[9.5px] text-primary font-bold mt-2">
                        <FileText size={10} /> {act.attachment}
                      </span>
                    )}
                  </div>
                  <div className="flex sm:flex-col items-start sm:items-end gap-2 shrink-0">
                    {act.pendingCount > 0 ? (
                      <span className="text-[10px] font-bold text-amber-500 block">
                        {act.pendingCount} Submissions pending grading
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-emerald-500 block">
                        All submissions evaluated
                      </span>
                    )}
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                        <Edit size={12} />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDeleteActivity(act.id)} className="h-7 w-7 text-rose-500 hover:text-rose-600">
                        <Trash2 size={12} />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === "attendance" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="p-5 border border-border bg-card rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="font-heading font-extrabold text-sm text-foreground">Interactive Student Attendance Grid</h3>
              <p className="text-[10.5px] text-muted-foreground">Mark student registers. Changes update the Attendance Engine dynamically.</p>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedClassFilter}
                onChange={(e) => setSelectedClassFilter(e.target.value)}
                className="text-xs bg-background border border-border px-3 py-1.5 rounded-lg font-bold"
              >
                <option value="Class 10 A">Class 10 Section A (Math)</option>
                <option value="Class 9 B">Class 9 Section B (Science)</option>
              </select>
              <Button size="sm" variant="outline" className="text-[10px] h-8 font-bold flex items-center gap-1">
                <Download size={12} /> Export Attendance Report
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-border bg-card">
            <table className="w-full text-left text-xs font-semibold">
              <thead className="border-b border-border bg-muted/40 text-[10px] text-muted-foreground uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Student Name</th>
                  <th className="px-4 py-3">Assigned Class</th>
                  <th className="px-4 py-3">Average Pct</th>
                  <th className="px-4 py-3 text-right">Attendance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredStudents.map((st) => (
                  <tr key={st.id}>
                    <td className="px-4 py-3 text-foreground font-bold">{st.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{st.class}</td>
                    <td className="px-4 py-3 text-muted-foreground">{st.attendancePct}%</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleToggleAttendance(st.id)}
                        className={`px-3 py-1 rounded text-[10px] font-bold transition ${
                          st.status === "Present"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            : st.status === "Absent"
                            ? "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                        }`}
                      >
                        {st.status} (Toggle)
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "schedules" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex justify-between items-center bg-muted/20 p-4 rounded-xl border border-border">
            <div>
              <h3 className="font-extrabold text-xs text-foreground">Timetable & Schedule Planner ({schedules.length})</h3>
              <p className="text-[10px] text-muted-foreground">Host live sessions, doubt rooms, webinars, and workshop sessions.</p>
            </div>
            <Button size="sm" onClick={() => setShowScheduleForm(!showScheduleForm)} className="text-[10px] h-8 font-bold flex items-center gap-1">
              <Plus size={12} /> {showScheduleForm ? "Close Form" : "Create Session"}
            </Button>
          </div>

          {/* Form to create Session */}
          {showScheduleForm && (
            <Card className="p-5 border-border bg-card space-y-4 max-w-xl">
              <h4 className="font-heading font-extrabold text-xs text-foreground uppercase tracking-wider">Schedule Class Event</h4>
              <form onSubmit={handleCreateSchedule} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Classroom Session Title</label>
                  <input
                    type="text"
                    required
                    value={schedTitle}
                    onChange={(e) => setSchedTitle(e.target.value)}
                    placeholder="e.g. Science Chapter 1 Doubt Room"
                    className="w-full text-xs bg-background border border-border px-3 py-2 rounded-lg focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Session Type</label>
                    <select
                      value={schedType}
                      onChange={(e) => setSchedType(e.target.value)}
                      className="w-full text-xs bg-background border border-border px-3 py-2 rounded-lg focus:outline-none"
                    >
                      <option>Live Class</option>
                      <option>Doubt Session</option>
                      <option>Workshop</option>
                      <option>Webinar</option>
                      <option>Practice Session</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Target Class</label>
                    <select
                      value={schedClass}
                      onChange={(e) => setSchedClass(e.target.value)}
                      className="w-full text-xs bg-background border border-border px-3 py-2 rounded-lg focus:outline-none"
                    >
                      <option>Class 10 A</option>
                      <option>Class 9 B</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Date</label>
                    <input
                      type="date"
                      required
                      value={schedDate}
                      onChange={(e) => setSchedDate(e.target.value)}
                      className="w-full text-xs bg-background border border-border px-3 py-2 rounded-lg focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Time</label>
                    <input
                      type="text"
                      required
                      value={schedTime}
                      onChange={(e) => setSchedTime(e.target.value)}
                      placeholder="e.g. 10:00 AM"
                      className="w-full text-xs bg-background border border-border px-3 py-2 rounded-lg focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Duration (mins)</label>
                    <input
                      type="number"
                      value={schedDuration}
                      onChange={(e) => setSchedDuration(e.target.value)}
                      placeholder="60"
                      className="w-full text-xs bg-background border border-border px-3 py-2 rounded-lg focus:outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Google Meet / Webinar Link</label>
                  <input
                    type="text"
                    value={schedLink}
                    onChange={(e) => setSchedLink(e.target.value)}
                    placeholder="https://meet.google.com/..."
                    className="w-full text-xs bg-background border border-border px-3 py-2 rounded-lg focus:outline-none"
                  />
                </div>
                <Button type="submit" className="w-full py-2.5 text-xs font-bold mt-2">
                  Save Timetable Schedule
                </Button>
              </form>
            </Card>
          )}

          {/* Schedules list */}
          <div className="space-y-3">
            {schedules.map((item) => (
              <Card key={item.id} className="p-4 border-border bg-card">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[8px] font-bold uppercase">
                        {item.type}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">{item.class} • Subject: {item.subject}</span>
                    </div>
                    <h4 className="font-extrabold text-xs text-foreground">{item.title}</h4>
                    <p className="text-[10px] text-muted-foreground">Date: {item.date} • Start: {item.time} ({item.duration} mins)</p>
                  </div>
                  <div className="flex sm:flex-col items-start sm:items-end gap-2 shrink-0">
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-primary text-white text-[10px] font-extrabold hover:bg-primary/95 transition shadow-sm"
                    >
                      Join Session
                    </a>
                    <Button size="sm" variant="outline" onClick={() => handleDeleteSchedule(item.id)} className="h-7 w-7 text-rose-500 hover:text-rose-600">
                      <Trash2 size={12} />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === "progress" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex justify-between items-center bg-muted/20 p-4 rounded-xl border border-border">
            <div>
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Student Progress & Grading Index</h3>
              <p className="text-[10px] text-muted-foreground">Class rosters are dynamically synced to teacher class/board mapping parameters.</p>
            </div>
            <select
              value={selectedClassFilter}
              onChange={(e) => setSelectedClassFilter(e.target.value)}
              className="text-xs bg-background border border-border px-3 py-1.5 rounded-lg font-bold"
            >
              <option value="Class 10 A">Class 10 Section A (Math)</option>
              <option value="Class 9 B">Class 9 Section B (Science)</option>
            </select>
          </div>
          <div className="space-y-3">
            {filteredStudents.map((st) => (
              <Card key={st.id} className="p-5 border-border bg-card">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-xs text-foreground">{st.name}</h4>
                    <p className="text-[10px] text-muted-foreground">Classroom Roster: {st.class}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-6 flex-1 max-w-lg">
                    <div className="space-y-0.5">
                      <span className="text-[9px] uppercase font-bold text-muted-foreground block">Attendance</span>
                      <span className="text-xs font-extrabold text-foreground">{st.attendancePct}% Rate</span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[9px] uppercase font-bold text-muted-foreground block">Activities</span>
                      <span className="text-xs font-extrabold text-foreground">{st.completedHomeworks} Completed</span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[9px] uppercase font-bold text-muted-foreground block">Average Grade</span>
                      <span className="text-xs font-extrabold text-emerald-500">{st.averageScore} Score</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === "documents" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex justify-between items-center bg-muted/20 p-4 rounded-xl border border-border">
            <div>
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Document uploads & resources Center</h3>
              <p className="text-[10px] text-muted-foreground">Upload class notes, worksheets, lab manuals, and syllabus files.</p>
            </div>
          </div>

          <form onSubmit={handleUploadDoc} className="grid gap-4 md:grid-cols-3 bg-muted/10 p-4 rounded-xl border border-border">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Document Title</label>
              <input
                type="text"
                required
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                placeholder="e.g. Science Chapter 1 Slides.pdf"
                className="w-full text-xs bg-background border border-border px-3 py-2 rounded-lg font-bold"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Subject area</label>
              <select
                value={docSubject}
                onChange={(e) => setDocSubject(e.target.value)}
                className="w-full text-xs bg-background border border-border px-3 py-2 rounded-lg font-bold"
              >
                <option>Mathematics</option>
                <option>Science</option>
                <option>English</option>
              </select>
            </div>
            <div className="flex items-end">
              <button type="submit" className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2.5 text-xs font-semibold text-primary-foreground hover:opacity-90">
                <Plus size={14} /> Upload PDF Manual
              </button>
            </div>
          </form>

          <div className="grid gap-3">
            {uploadedDocs.map((doc, idx) => (
              <Card key={idx} className="p-4 border-border bg-card flex justify-between items-center">
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold uppercase text-muted-foreground">{doc.subject}</span>
                  <h4 className="font-extrabold text-xs text-foreground">{doc.title}</h4>
                  <p className="text-[9.5px] text-muted-foreground">Date: {doc.date}</p>
                </div>
                <button className="rounded border border-border bg-card px-2 py-1 text-[10px] font-bold hover:bg-muted">Download</button>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === "notices" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex justify-between items-center bg-muted/20 p-4 rounded-xl border border-border">
            <div>
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Communication notices Board</h3>
              <p className="text-[10px] text-muted-foreground">Broadcast circular notifications, schedule changes, and homework alerts.</p>
            </div>
          </div>

          <form onSubmit={handleCreateNotice} className="space-y-3.5 bg-muted/10 p-5 rounded-xl border border-border">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Notice Title</label>
                <input
                  type="text"
                  required
                  value={noticeTitle}
                  onChange={(e) => setNoticeTitle(e.target.value)}
                  placeholder="e.g. Chapter 3 Review Exam notice"
                  className="w-full text-xs bg-background border border-border px-3 py-2 rounded-lg font-bold"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Notice category</label>
                <select
                  value={noticeType}
                  onChange={(e) => setNoticeType(e.target.value)}
                  className="w-full text-xs bg-background border border-border px-3 py-2 rounded-lg font-bold"
                >
                  <option>Homework Notice</option>
                  <option>Exam Notice</option>
                  <option>Schedule Change</option>
                  <option>Live Class Notice</option>
                  <option>Circular</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Target classroom</label>
                <select
                  value={noticeClass}
                  onChange={(e) => setNoticeClass(e.target.value)}
                  className="w-full text-xs bg-background border border-border px-3 py-2 rounded-lg font-bold"
                >
                  <option>Class 10 A</option>
                  <option>Class 9 B</option>
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Notice Details</label>
              <textarea
                rows={3}
                required
                value={noticeText}
                onChange={(e) => setNoticeText(e.target.value)}
                placeholder="Write notice instructions here..."
                className="w-full bg-background border border-border rounded-lg p-2.5 text-xs font-semibold text-foreground resize-none"
              />
            </div>
            <button type="submit" className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2.5 text-xs font-semibold text-primary-foreground hover:opacity-90">
              Publish notice Alert
            </button>
          </form>

          <div className="grid gap-3">
            {noticesList.map((nt) => (
              <Card key={nt.id} className="p-4 border-border bg-card">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[9px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded uppercase">{nt.type}</span>
                    <h4 className="font-extrabold text-xs text-foreground mt-2">{nt.title}</h4>
                    <p className="text-[10.5px] text-muted-foreground mt-1 leading-relaxed">{nt.content}</p>
                    <p className="text-[9.5px] text-muted-foreground mt-2">Class: {nt.class} • Date: {nt.date}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === "report-cards" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex justify-between items-center bg-muted/20 p-4 rounded-xl border border-border">
            <div>
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">School report card generator</h3>
              <p className="text-[10px] text-muted-foreground">Register grades, attendance positions, and coordinator feedback files.</p>
            </div>
          </div>

          <form onSubmit={handleCreateReport} className="space-y-3.5 bg-muted/10 p-5 rounded-xl border border-border">
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Select Student</label>
                <select
                  value={reportStudent}
                  onChange={(e) => setReportStudent(e.target.value)}
                  className="w-full text-xs bg-background border border-border px-3 py-2 rounded-lg font-bold"
                >
                  {students.map((st) => (
                    <option key={st.id} value={st.id}>{st.name} ({st.class})</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Mathematics Score</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={reportMath}
                  onChange={(e) => setReportMath(e.target.value)}
                  className="w-full text-xs bg-background border border-border px-3 py-2 rounded-lg font-bold"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Science Score</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={reportScience}
                  onChange={(e) => setReportScience(e.target.value)}
                  className="w-full text-xs bg-background border border-border px-3 py-2 rounded-lg font-bold"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">English Score</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={reportEnglish}
                  onChange={(e) => setReportEnglish(e.target.value)}
                  className="w-full text-xs bg-background border border-border px-3 py-2 rounded-lg font-bold"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Teacher Comments</label>
              <input
                type="text"
                required
                value={reportRemarks}
                onChange={(e) => setReportRemarks(e.target.value)}
                placeholder="Remarks e.g. Consistent efforts, showing high aptitude."
                className="w-full text-xs bg-background border border-border px-3 py-2 rounded-lg font-bold"
              />
            </div>
            <button type="submit" className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2.5 text-xs font-semibold text-primary-foreground hover:opacity-90">
              Save Report Card file
            </button>
          </form>

          <div className="grid gap-3">
            {reportsList.map((rep) => (
              <Card key={rep.id} className="p-4 border-border bg-card">
                <div className="flex justify-between items-center text-left">
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-xs text-foreground">{rep.studentName} ({rep.class})</h4>
                    <p className="text-[10.5px] text-muted-foreground">Remarks: &quot;{rep.remarks}&quot;</p>
                    <p className="text-[9.5px] text-muted-foreground">Grades: Math ({rep.Math}%) · Science ({rep.Science}%) · English ({rep.English}%)</p>
                  </div>
                  <Badge variant="outline" className="text-[8.5px] uppercase font-bold">Grade Mapped</Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === "analytics" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex justify-between items-center bg-muted/20 p-4 rounded-xl border border-border">
            <div>
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Class performance Analytics console</h3>
              <p className="text-[10px] text-muted-foreground">Detailed metrics reporting homework submission rates and test summaries.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 border-border bg-card">
              <span className="text-[9px] uppercase font-bold text-muted-foreground">Math average index</span>
              <h3 className="text-2xl font-extrabold text-primary mt-1">88.5% Performance</h3>
            </Card>
            <Card className="p-4 border-border bg-card">
              <span className="text-[9px] uppercase font-bold text-muted-foreground">Attendance summary</span>
              <h3 className="text-2xl font-extrabold text-emerald-500 mt-1">92.0% Present Rate</h3>
            </Card>
            <Card className="p-4 border-border bg-card">
              <span className="text-[9px] uppercase font-bold text-muted-foreground">Homework Completion Average</span>
              <h3 className="text-2xl font-extrabold text-primary mt-1">85.4% Completion</h3>
            </Card>
          </div>
        </div>
      )}

      {activeTab === "ai" && (
        <div className="p-5 border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background rounded-2xl space-y-4 max-w-xl text-left animate-in fade-in duration-200">
          <h3 className="font-extrabold text-xs text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles size={14} className="text-primary animate-pulse" />
            AI Teacher Studio Assistant (Sandbox preview)
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Generate lesson plans automatically, analyze classroom weak points, and compile report card reviews.
          </p>
          <div className="space-y-3 p-3 bg-muted/20 border border-border rounded-xl">
            <div className="space-y-1">
              <strong className="text-xs text-foreground block">AI lesson planner preview:</strong>
              <p className="text-[10.5px] text-muted-foreground leading-relaxed italic">
                &quot;Suggested Topic: Quadratic variables mapping. Activity: 15-minute whiteboard session followed by 10 practice questions from the Activity engine.&quot;
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === "requests" && (
        <div className="space-y-4 animate-in fade-in duration-200 text-left">
          <div className="flex justify-between items-center bg-muted/20 p-4 rounded-xl border border-border">
            <div>
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Teaching & Booking Requests</h3>
              <p className="text-[10px] text-muted-foreground">Review incoming student booking requests for workshops and 1-on-1 private tutoring.</p>
            </div>
          </div>

          <div className="grid gap-3.5">
            {[
              { id: "req-1", studentName: "Rohan Das", academy: "Competitive Exams", details: "JEE Physics: Kinematics & Mechanics 1-on-1 Class", mode: "Online", duration: "1 Hour", price: "₹1,200", status: "Pending" },
              { id: "req-2", studentName: "Siddharth Verma", academy: "Skill Development", details: "Vite NextJS Full Stack Mentorship", mode: "Hybrid", duration: "Weekly (3 Classes)", price: "₹4,500", status: "Pending" }
            ].map((req) => (
              <Card key={req.id} className="p-4 border-border bg-card flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <strong className="text-xs text-foreground font-bold">{req.studentName}</strong>
                    <span className="px-2 py-0.5 rounded text-[9px] bg-primary/10 text-primary border border-primary/20 font-bold">{req.academy}</span>
                    <span className="px-2 py-0.5 rounded text-[9px] bg-slate-500/10 text-slate-600 dark:text-slate-400 font-bold">{req.mode}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">{req.details} • {req.duration}</p>
                  <strong className="text-xs text-foreground block">Session Fee: {req.price}</strong>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => toast.success(`Booking request approved for ${req.studentName}`)}
                    className="bg-primary text-white text-[10px] font-bold px-3 py-1.5 rounded-lg"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => toast.info(`Booking request declined.`)}
                    className="border border-border text-foreground hover:bg-muted text-[10px] font-bold px-3 py-1.5 rounded-lg"
                  >
                    Decline
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === "wallet" && (
        <div className="space-y-6 animate-in fade-in duration-200 text-left">
          <div className="flex justify-between items-center bg-muted/20 p-4 rounded-xl border border-border">
            <div>
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Tutor Wallet & Withdrawals</h3>
              <p className="text-[10px] text-muted-foreground">Manage your teaching earnings, referral bonuses, and request payouts.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Card className="p-4 border-border bg-card">
              <span className="text-[9px] uppercase font-bold text-muted-foreground">Available Balance</span>
              <h3 className="text-2xl font-extrabold text-foreground mt-1">₹18,450</h3>
            </Card>
            <Card className="p-4 border-border bg-card">
              <span className="text-[9px] uppercase font-bold text-muted-foreground">Pending Earnings</span>
              <h3 className="text-2xl font-extrabold text-muted-foreground mt-1">₹4,200</h3>
            </Card>
            <Card className="p-4 border-border bg-card">
              <span className="text-[9px] uppercase font-bold text-muted-foreground">Referral Bonuses</span>
              <h3 className="text-2xl font-extrabold text-emerald-500 mt-1">₹1,500</h3>
            </Card>
            <Card className="p-4 border-border bg-card">
              <span className="text-[9px] uppercase font-bold text-muted-foreground">Teaching Rewards</span>
              <h3 className="text-2xl font-extrabold text-primary mt-1">₹1,200</h3>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="p-5 border-border bg-card space-y-4">
              <h4 className="font-bold text-xs uppercase text-foreground">Request Withdrawal</h4>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-[9px] uppercase font-bold text-muted-foreground block mb-1">Select Transfer Mode</label>
                  <select className="w-full bg-background border border-border p-2.5 rounded-xl font-bold">
                    <option value="upi">UPI (Instant Transfer)</option>
                    <option value="bank">Direct Bank Account Transfer</option>
                    <option value="paypal">PayPal Gateway</option>
                    <option value="stripe">Stripe Connect Payout</option>
                  </select>
                </div>
                <div>
                  <label className="text-[9px] uppercase font-bold text-muted-foreground block mb-1">Transfer Address / ID</label>
                  <input placeholder="e.g. yourname@okaxis" className="w-full bg-background border border-border p-2.5 rounded-xl text-xs" />
                </div>
                <div>
                  <label className="text-[9px] uppercase font-bold text-muted-foreground block mb-1">Withdrawal Amount (₹)</label>
                  <input type="number" placeholder="Min. ₹500" className="w-full bg-background border border-border p-2.5 rounded-xl text-xs" />
                </div>
                <button
                  onClick={() => toast.success("Withdrawal request submitted! Pending administrator approval.")}
                  className="w-full bg-primary text-white font-bold py-2.5 rounded-xl text-xs"
                >
                  Submit Payout Request
                </button>
              </div>
            </Card>

            <Card className="p-5 border-border bg-card space-y-3">
              <h4 className="font-bold text-xs uppercase text-foreground">Withdrawal History</h4>
              <div className="space-y-2.5 text-xs">
                {[
                  { id: "wd-1", date: "2026-07-28", amount: "₹8,500", method: "UPI", status: "Completed" },
                  { id: "wd-2", date: "2026-07-15", amount: "₹12,000", method: "Bank Transfer", status: "Completed" }
                ].map((wd) => (
                  <div key={wd.id} className="flex justify-between items-center p-2.5 bg-muted/20 border border-border rounded-lg">
                    <div>
                      <span className="font-bold text-foreground block">{wd.amount}</span>
                      <span className="text-[10px] text-muted-foreground">{wd.date} • {wd.method}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[9px] bg-emerald-500/10 text-emerald-600 font-bold">{wd.status}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeTab === "referrals" && (
        <div className="space-y-4 animate-in fade-in duration-200 text-left">
          <div className="flex justify-between items-center bg-muted/20 p-4 rounded-xl border border-border">
            <div>
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Referrals & Affiliates program</h3>
              <p className="text-[10px] text-muted-foreground">Invite peer educators or students and earn flat credits added to your wallet balance.</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3 text-xs font-semibold">
            <Card className="p-4 border-border bg-card">
              <span className="text-[9px] text-muted-foreground uppercase font-bold">Total Referred Instructors</span>
              <strong className="text-xl text-foreground block mt-1">4 Tutors</strong>
            </Card>
            <Card className="p-4 border-border bg-card">
              <span className="text-[9px] text-muted-foreground uppercase font-bold">Total Referred Students</span>
              <strong className="text-xl text-foreground block mt-1">18 Pupils</strong>
            </Card>
            <Card className="p-4 border-border bg-card">
              <span className="text-[9px] text-muted-foreground uppercase font-bold">Referrals Credit Yield</span>
              <strong className="text-xl text-emerald-500 block mt-1">₹3,200</strong>
            </Card>
          </div>

          <Card className="p-5 border-border bg-card space-y-3">
            <h4 className="font-bold text-xs uppercase text-foreground">Your Referral Link</h4>
            <div className="flex gap-2">
              <input readOnly value="https://eduearn.platform/join?ref=tutor_demo_2026" className="flex-1 bg-muted border border-border px-3 py-2 rounded-xl text-xs text-foreground font-mono" />
              <button onClick={() => { navigator.clipboard.writeText("https://eduearn.platform/join?ref=tutor_demo_2026"); toast.success("Referral Link copied!"); }} className="bg-primary text-white text-xs font-bold px-4 py-2 rounded-xl">Copy Link</button>
            </div>
          </Card>
        </div>
      )}

      {activeTab === "badges" && (
        <div className="space-y-4 animate-in fade-in duration-200 text-left">
          <div className="flex justify-between items-center bg-muted/20 p-4 rounded-xl border border-border">
            <div>
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Educator Recognition Badges</h3>
              <p className="text-[10px] text-muted-foreground">Certifications and badges indicating verification level, student reviews response time, and expert ratings.</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            {[
              { title: "Verified Tutor", desc: "Successfully completed credentials check & demo review.", color: "border-emerald-500/20 bg-emerald-500/5 text-emerald-600" },
              { title: "Top Rated", desc: "Maintained ratings average above 4.8 across all courses.", color: "border-amber-500/20 bg-amber-500/5 text-amber-600" },
              { title: "Fast Responder", desc: "Replies to student queries in less than 2 hours average.", color: "border-blue-500/20 bg-blue-500/5 text-blue-600" },
              { title: "Academy Expert", desc: "Published course content covering more than 3 categories.", color: "border-purple-500/20 bg-purple-500/5 text-purple-600" }
            ].map((badge, idx) => (
              <Card key={idx} className={`p-4 border text-center flex flex-col items-center justify-center gap-2 ${badge.color}`}>
                <Award size={28} className="animate-bounce" />
                <h4 className="font-extrabold text-xs">{badge.title}</h4>
                <p className="text-[10px] text-muted-foreground leading-relaxed font-semibold">{badge.desc}</p>
              </Card>
            ))}
          </div>

          <div className="mt-6 space-y-3">
            <h4 className="font-bold text-xs uppercase text-foreground">Active Certificates Mapped</h4>
            <div className="grid gap-3.5 md:grid-cols-3 text-xs">
              <Card className="p-4 border-border bg-card">
                <span className="text-[9px] uppercase font-bold text-muted-foreground">Certificate Title</span>
                <strong className="text-sm text-foreground block mt-1">Teaching Excellence Credentials</strong>
                <span className="text-[10px] text-muted-foreground">Issued: July 2026 • Verified</span>
              </Card>
              <Card className="p-4 border-border bg-card">
                <span className="text-[9px] uppercase font-bold text-muted-foreground">Certificate Title</span>
                <strong className="text-sm text-foreground block mt-1">Academy Specialist Certificate</strong>
                <span className="text-[10px] text-muted-foreground">Issued: July 2026 • Verified</span>
              </Card>
            </div>
          </div>

          {/* AI Helper placeholder */}
          <div className="p-5 border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background rounded-2xl max-w-xl text-left mt-6">
            <h3 className="font-bold text-xs text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles size={14} className="text-primary animate-pulse" />
              AI Educator Assistant (Future architecture placeholder)
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed mt-1">
              Provides recommendations to optimize teaching styles, suggest homework activities, and highlight low student engagement courses.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
