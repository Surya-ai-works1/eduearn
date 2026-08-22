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
  Award,
  DollarSign
} from "lucide-react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Divider } from "../ui/divider";
import { useTutor } from "../../context/TutorContext";
import { MoreVertical } from "lucide-react";

function CreatorPerformanceChart({ dataPoints }: { dataPoints: number[] }) {
  const maxVal = Math.max(...dataPoints, 1);
  const width = 500;
  const height = 150;
  const pointsStr = dataPoints
    .map((val, idx) => {
      const x = (idx / (dataPoints.length - 1)) * width;
      const y = height - (val / maxVal) * (height - 30) - 15;
      return `${x},${y}`;
    })
    .join(" ");

  const fillPointsStr = `0,${height} ${pointsStr} ${width},${height}`;

  return (
    <div className="relative w-full h-[150px] mt-4">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full overflow-visible"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="dashboardGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Grid lines */}
        <line x1="0" y1={height * 0.25} x2={width} y2={height * 0.25} stroke="currentColor" strokeOpacity="0.05" strokeDasharray="4 4" />
        <line x1="0" y1={height * 0.5} x2={width} y2={height * 0.5} stroke="currentColor" strokeOpacity="0.05" strokeDasharray="4 4" />
        <line x1="0" y1={height * 0.75} x2={width} y2={height * 0.75} stroke="currentColor" strokeOpacity="0.05" strokeDasharray="4 4" />

        {/* Gradient fill */}
        <polygon points={fillPointsStr} fill="url(#dashboardGrad)" />

        {/* Line */}
        <polyline
          fill="none"
          stroke="#8b5cf6"
          strokeWidth="2.5"
          points={pointsStr}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points dots */}
        {dataPoints.map((val, idx) => {
          const x = (idx / (dataPoints.length - 1)) * width;
          const y = height - (val / maxVal) * (height - 30) - 15;
          return (
            <circle
              key={idx}
              cx={x}
              cy={y}
              r="4"
              className="fill-card stroke-primary"
              strokeWidth="2"
              style={{ stroke: "#8b5cf6" }}
            />
          );
        })}
      </svg>
    </div>
  );
}

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

  const {
    myCourses: contextCourses = [],
    students: contextStudents = [],
    liveSessions: contextLiveSessions = [],
    reviews: contextReviews = [],
    earningsBalanceState: contextEarningsBalance = { total: 43000, available: 12200, pending: 6250 },
    handleTabChange,
  } = useTutor();

  const [activeTab, setActiveTab] = useState("overview");
  const [selectedClassFilter, setSelectedClassFilter] = useState("Class 10 A");

  const [chartMetric, setChartMetric] = useState<"views" | "watchTime" | "enrollments" | "revenue">("revenue");
  const [timePeriod, setTimePeriod] = useState<"7d" | "28d" | "90d" | "1y">("28d");
  const [contentCategory, setContentCategory] = useState<"all" | "courses" | "videos" | "recordings" | "shorts" | "resources">("all");

  const chartDataPoints = useMemo(() => {
    let base = [30, 45, 38, 62, 50, 78, 70, 88, 80, 102, 90, 124];
    if (chartMetric === "views") {
      base = [120, 240, 180, 310, 420, 380, 510, 480, 620, 590, 750, 840];
    } else if (chartMetric === "watchTime") {
      base = [45, 90, 75, 140, 180, 160, 220, 200, 270, 250, 320, 380];
    } else if (chartMetric === "enrollments") {
      base = [5, 12, 8, 18, 22, 15, 28, 20, 35, 30, 42, 48];
    } else if (chartMetric === "revenue") {
      base = [2000, 4500, 3800, 6200, 5000, 7800, 7000, 8800, 8000, 10200, 9000, 12400];
    }

    if (timePeriod === "7d") {
      return base.slice(-7);
    }
    if (timePeriod === "28d") {
      return base.slice(-12);
    }
    if (timePeriod === "90d") {
      return base.map(x => Math.round(x * 2.8));
    }
    return base.map(x => Math.round(x * 11));
  }, [chartMetric, timePeriod]);

  const dashboardContentItems = useMemo(() => {
    return [
      { id: "c-1", title: "Python Programming Masterclass", type: "COURSE", views: 1248, likesOrStudents: 1248, rating: "4.8 ★", revenue: 24500, status: "Published" },
      { id: "c-2", title: "React State Management Basics", type: "VIDEO", views: 12400, likesOrStudents: 842, rating: "842 likes", revenue: 3200, status: "Published" },
      { id: "c-3", title: "Python OOP & Classes (Class 04)", type: "LIVE RECORDING", views: 842, likesOrStudents: 74, rating: "74 students", revenue: 0, status: "Published" },
      { id: "c-4", title: "JavaScript Closures in 60s", type: "SHORT", views: 4800, likesOrStudents: 620, rating: "620 likes", revenue: 0, status: "Published" },
      { id: "c-5", title: "Python Programming Complete Notes", type: "RESOURCE", views: 980, likesOrStudents: 184, rating: "184 sales", revenue: 18216, status: "Published" },
      { id: "c-6", title: "Full-Stack Web Dev Bootcamp", type: "COURSE", views: 980, likesOrStudents: 920, rating: "4.7 ★", revenue: 18700, status: "Published" },
      { id: "c-7", title: "DSA & Algorithms Essentials", type: "COURSE", views: 740, likesOrStudents: 742, rating: "4.6 ★", revenue: 14300, status: "Published" },
    ];
  }, []);

  const filteredDashboardContent = useMemo(() => {
    if (contentCategory === "all") return dashboardContentItems;
    if (contentCategory === "courses") return dashboardContentItems.filter(i => i.type === "COURSE");
    if (contentCategory === "videos") return dashboardContentItems.filter(i => i.type === "VIDEO");
    if (contentCategory === "recordings") return dashboardContentItems.filter(i => i.type === "LIVE RECORDING");
    if (contentCategory === "shorts") return dashboardContentItems.filter(i => i.type === "SHORT");
    if (contentCategory === "resources") return dashboardContentItems.filter(i => i.type === "RESOURCE");
    return dashboardContentItems;
  }, [contentCategory, dashboardContentItems]);

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
    <div className="space-y-8 text-left pb-12">
      {/* Welcome / Creator Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-br from-primary/15 via-background to-background p-6 rounded-2xl border border-primary/20">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase">
            <Sparkles size={10} /> EduEarn Creator Studio
          </div>
          <h2 className="text-xl md:text-2xl font-heading font-extrabold text-foreground">
            Good Evening, {user?.fullName || "Tutor"} 👋
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Here&apos;s how your teaching business is performing today.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 select-none">
          <Button
            onClick={() => handleTabChange("courses")}
            size="sm"
            className="bg-primary hover:bg-primary/95 text-white font-bold h-8 text-[11px] border-none"
          >
            Create Course
          </Button>
          <Button
            onClick={() => handleTabChange("resources")}
            size="sm"
            variant="outline"
            className="h-8 text-[11px] font-bold border-border/80"
          >
            Upload Video
          </Button>
          <Button
            onClick={() => handleTabChange("live-classes")}
            size="sm"
            variant="outline"
            className="h-8 text-[11px] font-bold border-border/80"
          >
            Schedule Live Class
          </Button>
        </div>
      </div>

      {/* Creator Status Area (Mini KPIs) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 select-none">
        {[
          { label: "My Courses", value: contextCourses.length || 3, icon: BookOpen, color: "text-primary bg-primary/10" },
          { label: "Active Students", value: contextStudents.length || 124, icon: Users, color: "text-indigo-500 bg-indigo-500/10" },
          { label: "Live Classes", value: contextLiveSessions.length || 3, icon: Video, color: "text-rose-500 bg-rose-500/10" },
          { label: "Published Content", value: 14, icon: ClipboardList, color: "text-sky-500 bg-sky-500/10" },
          { label: "Resource Sales", value: "1,284", icon: TrendingUp, color: "text-emerald-500 bg-emerald-500/10" },
          { label: "Average Rating", value: "4.8 ★", icon: Award, color: "text-amber-500 bg-amber-500/10" },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <Card key={idx} variant="glass" className="p-4 border-border/60 hover:border-primary/20 hover:shadow-sm transition-all flex items-center justify-between min-w-0">
              <div className="min-w-0 space-y-1">
                <span className="text-[9px] font-black uppercase text-muted-foreground tracking-wider block">{item.label}</span>
                <h4 className="text-base font-black text-foreground mt-0.5 leading-none">{item.value}</h4>
              </div>
              <span className={`p-2 rounded-lg shrink-0 ml-3 ${item.color}`}><Icon size={14} /></span>
            </Card>
          );
        })}
      </div>

      {/* Configuration-driven Tabs for other School Tuition features */}
      <div className="flex flex-wrap gap-1.5 border-b border-border pb-px">
        {configTabs.map((tab: string) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-xs font-bold transition-all relative border-b-2 capitalize bg-transparent border-none cursor-pointer ${
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
        <div className="space-y-8 animate-in fade-in duration-200">
          
          {/* Section 1: TODAY'S TEACHING & Pipeline */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left: Today's Teaching */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex justify-between items-center select-none">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5 font-heading">
                  <Calendar size={15} className="text-primary animate-pulse" />
                  Today&apos;s Teaching Command Center
                </h3>
                <Button 
                  size="sm" 
                  onClick={() => handleTabChange("live-classes")} 
                  className="text-[10px] h-7 font-bold border-none"
                >
                  Schedule Live Class
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Session 1 */}
                <Card variant="glass" className="p-4 border-border/80 hover:border-primary/30 transition flex flex-col justify-between h-44">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 select-none">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                      <span className="text-[10px] font-black uppercase text-rose-500">Live Masterclass</span>
                      <span className="text-[10px] text-muted-foreground font-semibold">• Today · 6:00 PM</span>
                    </div>
                    <h4 className="font-extrabold text-sm text-foreground">Python Loops &amp; Control Flow</h4>
                    <p className="text-[10.5px] text-muted-foreground font-semibold">24 students registered • 22 seats remaining</p>
                  </div>
                  <div className="pt-2 select-none">
                    <Button 
                      onClick={() => toast.success("Live class starting...")}
                      size="sm" 
                      className="bg-primary hover:bg-primary/95 text-white font-extrabold text-[10.5px] h-8 w-full border-none"
                    >
                      Start Class
                    </Button>
                  </div>
                </Card>

                {/* Session 2 */}
                <Card variant="glass" className="p-4 border-border/80 hover:border-primary/30 transition flex flex-col justify-between h-44">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 select-none">
                      <span className="text-[10px] font-black uppercase text-indigo-500">Weekly Doubt Session</span>
                      <span className="text-[10px] text-muted-foreground font-semibold">• Today · 7:30 PM</span>
                    </div>
                    <h4 className="font-extrabold text-sm text-foreground">Python Exercises Live solving</h4>
                    <p className="text-[10.5px] text-muted-foreground font-semibold">12 students registered • Interactive Board ready</p>
                  </div>
                  <div className="pt-2 select-none">
                    <Button 
                      onClick={() => toast.success("Opening Doubt Session manager...")}
                      size="sm" 
                      variant="outline"
                      className="text-foreground font-extrabold text-[10.5px] h-8 w-full border-border/80 hover:bg-muted"
                    >
                      Manage Session
                    </Button>
                  </div>
                </Card>
              </div>

              {/* Pending Tasks & Urgent Action Items widget */}
              <Card variant="glass" className="p-4 border-border/80 space-y-3">
                <h4 className="text-xs font-black uppercase text-foreground flex items-center gap-1.5 select-none font-heading">
                  <ClipboardList size={14} className="text-primary" /> Urgent Tasks &amp; Actions
                </h4>
                <div className="divide-y divide-border/20 text-xs font-semibold text-muted-foreground">
                  <div className="py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      <span>Review &amp; grade: <strong>Python Functions Assignment</strong> (Aarav Kumar)</span>
                    </div>
                    <button onClick={() => handleTabChange("assignments")} className="text-[10px] text-primary font-bold hover:underline bg-transparent border-none cursor-pointer">Grade</button>
                  </div>
                  <div className="py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      <span>Unresolved doubts: <strong>"decorators returning arguments"</strong> (Aarav Kumar)</span>
                    </div>
                    <button onClick={() => handleTabChange("students")} className="text-[10px] text-primary font-bold hover:underline bg-transparent border-none cursor-pointer">Resolve</button>
                  </div>
                  <div className="py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                      <span>Course Approval Pending: <strong>Advanced React Architecture</strong></span>
                    </div>
                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-500">Draft</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Right: Quick Actions */}
            <div className="lg:col-span-4 space-y-4">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5 font-heading select-none">
                <Sparkles size={15} className="text-primary" />
                Quick Actions
              </h3>
              <Card variant="glass" className="p-4 border-border/80 flex flex-col gap-2.5 select-none">
                {[
                  { label: "Create Course", tab: "courses", icon: BookOpen, primary: true },
                  { label: "Schedule Live Class", tab: "live-classes", icon: Video, primary: true },
                  { label: "Upload Video / Lesson", tab: "resources", icon: Plus, primary: false },
                  { label: "View Students Center", tab: "students", icon: Users, primary: false },
                  { label: "View Performance Analytics", tab: "analytics", icon: TrendingUp, primary: false },
                  { label: "Open Payout Wallet", tab: "finance", icon: DollarSign, primary: false },
                ].map((act, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleTabChange(act.tab)}
                    className={`w-full flex items-center gap-3 p-3 border transition text-xs font-bold rounded-xl cursor-pointer select-none text-left ${
                      act.primary
                        ? "bg-primary text-white border-primary hover:bg-primary/90 shadow-soft"
                        : "bg-muted/30 border-border/40 hover:border-primary/20 hover:bg-muted/60 text-foreground"
                    }`}
                  >
                    <act.icon size={14} className={act.primary ? "text-white" : "text-primary"} />
                    <span>{act.label}</span>
                  </button>
                ))}
              </Card>
            </div>
          </div>

          {/* Section 2: PERFORMANCE OVERVIEW & SVG Chart */}
          <Card variant="glass" className="p-6 border-border/80 text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4 select-none">
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5 font-heading">
                  <TrendingUp size={15} className="text-primary" />
                  Performance Overview
                </h3>
                <p className="text-[11px] text-muted-foreground font-semibold">Monitor views, watch time, revenue growth, and student activity trends.</p>
              </div>
              <div className="flex items-center gap-1 bg-muted/40 p-1 border border-border/40 rounded-xl shrink-0">
                {(["7d", "28d", "90d", "1y"] as const).map(tf => (
                  <button
                    key={tf}
                    onClick={() => setTimePeriod(tf)}
                    className={`px-3 py-1.5 text-[9.5px] font-black uppercase rounded-lg transition cursor-pointer border-none ${
                      timePeriod === tf
                        ? "bg-primary text-white"
                        : "text-muted-foreground hover:text-foreground bg-transparent"
                    }`}
                  >
                    {tf === "7d" ? "7 Days" : tf === "28d" ? "28 Days" : tf === "90d" ? "90 Days" : "1 Year"}
                  </button>
                ))}
              </div>
            </div>

            {/* Metric buttons selector grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 select-none">
              {[
                { id: "views", label: "Views", val: "12,450", color: "border-primary/20" },
                { id: "watchTime", label: "Watch Time", val: "842h", color: "border-indigo-500/20" },
                { id: "enrollments", label: "Enrollments", val: "112", color: "border-sky-500/20" },
                { id: "revenue", label: "Revenue", val: "₹18,450", color: "border-emerald-500/20" },
              ].map(m => (
                <button
                  key={m.id}
                  onClick={() => setChartMetric(m.id as any)}
                  className={`p-4 border rounded-xl text-left transition-all cursor-pointer bg-transparent ${
                    chartMetric === m.id
                      ? "border-primary bg-primary/5 text-foreground ring-1 ring-primary/40"
                      : "border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/20"
                  }`}
                >
                  <span className="text-[9.5px] font-black uppercase tracking-wider block">{m.label}</span>
                  <h4 className="text-lg font-black text-foreground mt-1">{m.val}</h4>
                </button>
              ))}
            </div>

            {/* Interactive SVG Chart */}
            <div className="mt-5">
              <CreatorPerformanceChart dataPoints={chartDataPoints} />
            </div>
          </Card>

          {/* Section 3: YOUR CONTENT & Pipeline Workflow */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left: Your Content Tabs & List */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-border/40 pb-2 select-none">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider font-heading">Your Content</h3>
                <div className="flex flex-wrap gap-1">
                  {["all", "courses", "videos", "recordings", "shorts", "resources"].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setContentCategory(cat as any)}
                      className={`px-2.5 py-1 text-[9.5px] font-black rounded transition border-none cursor-pointer uppercase tracking-wider ${
                        contentCategory === cat
                          ? "bg-primary text-white"
                          : "text-muted-foreground hover:text-foreground bg-transparent"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Items Card List */}
              <div className="space-y-3">
                {filteredDashboardContent.map(item => (
                  <Card key={item.id} variant="glass" className="p-4 border-border/60 hover:border-primary/20 transition flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-1.5 select-none">
                        <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                          item.type === "COURSE"
                            ? "bg-primary/10 text-primary border-primary/20"
                            : item.type === "VIDEO"
                            ? "bg-rose-500/10 text-rose-500 border-rose-500/20"
                            : item.type === "LIVE RECORDING"
                            ? "bg-indigo-500/10 text-indigo-500 border-indigo-500/20"
                            : item.type === "SHORT"
                            ? "bg-sky-500/10 text-sky-500 border-sky-500/20"
                            : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                        }`}>
                          {item.type}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-semibold">{item.views.toLocaleString()} views</span>
                      </div>
                      <h4 className="text-xs font-black text-foreground truncate">{item.title}</h4>
                    </div>

                    <div className="flex items-center gap-6 shrink-0 text-right select-none">
                      <div className="text-xs font-semibold text-muted-foreground space-y-0.5">
                        <div>Rating: <strong className="text-foreground">{item.rating}</strong></div>
                        {item.revenue > 0 && <div className="text-emerald-500 font-bold">Earned: ₹{item.revenue.toLocaleString()}</div>}
                      </div>

                      <div className="relative group/content-actions">
                        <button className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground cursor-pointer bg-transparent border-none">
                          <MoreVertical size={13} />
                        </button>
                        <div className="absolute right-0 bottom-full mb-1 hidden group-hover/content-actions:flex flex-col bg-card border border-border rounded-lg shadow-floating py-1.5 w-24 z-30">
                          <button
                            onClick={() => toast.success("Opening content editor...")}
                            className="px-3 py-1.5 text-[10px] text-left font-bold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition cursor-pointer bg-transparent border-none"
                          >
                            Edit Item
                          </button>
                          <button
                            onClick={() => toast.success("Loading individual analytics...")}
                            className="px-3 py-1.5 text-[10px] text-left font-bold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition cursor-pointer bg-transparent border-none"
                          >
                            Analytics
                          </button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Right: Live-to-Content Pipeline */}
            <div className="lg:col-span-4 space-y-4">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5 font-heading select-none">
                <PlayCircle size={15} className="text-primary" />
                From Live to Content
              </h3>
              <Card variant="glass" className="p-4 border-border/80 text-xs font-semibold space-y-4">
                <div className="bg-primary/5 border border-primary/20 p-3 rounded-xl flex items-center gap-2 select-none">
                  <CheckCircle size={14} className="text-emerald-500 shrink-0" />
                  <div>
                    <h5 className="font-black text-foreground">Recording Ready</h5>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Python Loops &amp; Control Flow is ready to compile.</p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 select-none">
                  <button
                    onClick={() => {
                      toast.success("Recording published as video lesson.");
                    }}
                    className="w-full text-center py-2 bg-primary text-white text-[10.5px] font-bold rounded-xl cursor-pointer hover:bg-primary/95 transition border-none"
                  >
                    Publish Recording
                  </button>
                  <button
                    onClick={() => handleTabChange("resources")}
                    className="w-full text-center py-2 bg-muted hover:bg-muted/80 text-foreground text-[10.5px] font-bold rounded-xl cursor-pointer transition border-none"
                  >
                    Create Educational Short
                  </button>
                  <button
                    onClick={() => handleTabChange("resources")}
                    className="w-full text-center py-2 bg-transparent hover:bg-muted text-muted-foreground hover:text-foreground border border-border/40 text-[10.5px] font-bold rounded-xl cursor-pointer transition"
                  >
                    Attach Study Notes
                  </button>
                </div>
              </Card>
            </div>
          </div>

          {/* Section 4: TOP PERFORMING & AI CREATOR INSIGHTS */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left: Top Performing Leaderboard */}
            <div className="lg:col-span-6 space-y-4 text-left">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider font-heading select-none">Top Performing Content</h3>
              <Card variant="glass" className="p-4 border-border/80 divide-y divide-border/30">
                {[
                  { rank: "🥇", title: "Python Programming Masterclass", stats: "12,450 views • ₹24,500 revenue" },
                  { rank: "🥈", title: "React State Management Basics", stats: "9,820 views • ₹18,700 revenue" },
                  { rank: "🥉", title: "DSA & Algorithms Essentials", stats: "7,420 views • ₹14,300 revenue" },
                ].map((item, i) => (
                  <div key={i} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-base select-none">{item.rank}</span>
                      <div className="min-w-0">
                        <h4 className="text-xs font-black text-foreground truncate">{item.title}</h4>
                        <p className="text-[10px] text-muted-foreground font-semibold">{item.stats}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleTabChange("analytics")}
                      className="text-[10px] text-primary font-black hover:underline shrink-0 select-none bg-transparent border-none cursor-pointer"
                    >
                      Stats
                    </button>
                  </div>
                ))}
              </Card>
            </div>

            {/* Right: AI Creator Insights */}
            <div className="lg:col-span-6 space-y-4 text-left">
              <div className="flex justify-between items-center select-none">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider font-heading">AI Creator Insights</h3>
                <button
                  onClick={() => handleTabChange("ai-studio")}
                  className="text-[10px] text-primary font-black hover:underline bg-transparent border-none cursor-pointer"
                >
                  Open AI Studio →
                </button>
              </div>
              <Card variant="glass" className="p-4 border-border/80 space-y-3 text-xs font-semibold">
                {[
                  "💡 Your Python content is getting 38% more views this month.",
                  "📈 Students who watch Python Basics frequently enroll in your Python Masterclass.",
                  "🎯 Consider creating a lesson on Exception Handling.",
                  "⏰ Your students are most active on Saturday evenings.",
                ].map((insight, idx) => (
                  <div key={idx} className="flex gap-2 text-muted-foreground leading-relaxed hover:text-foreground transition duration-150">
                    <span className="select-none">•</span>
                    <span>{insight}</span>
                  </div>
                ))}
              </Card>
            </div>
          </div>

          {/* Section 5: REVENUE SOURCES & Student Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left: Your Earnings Wallet overview */}
            <div className="lg:col-span-6 space-y-4 text-left">
              <div className="flex justify-between items-center select-none">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider font-heading">Your Earnings</h3>
                <button
                  onClick={() => handleTabChange("finance")}
                  className="text-[10px] text-primary font-black hover:underline bg-transparent border-none cursor-pointer"
                >
                  View Wallet →
                </button>
              </div>
              <Card variant="glass" className="p-5 border-border/80 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-4 border-r border-border/30 pr-2 select-none">
                  <div>
                    <span className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">Total Revenue</span>
                    <h3 className="text-2xl font-black text-emerald-500 mt-0.5">₹{contextEarningsBalance.total.toLocaleString()}</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[9px] font-bold text-muted-foreground uppercase">Available</span>
                      <p className="text-sm font-black text-foreground">₹{contextEarningsBalance.available.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-muted-foreground uppercase">Pending</span>
                      <p className="text-sm font-black text-foreground">₹{contextEarningsBalance.pending.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2.5 text-xs font-semibold select-none">
                  <span className="text-[10px] font-black uppercase text-muted-foreground tracking-wider block">Revenue Sources</span>
                  {[
                    { name: "Courses", amt: "₹15,000" },
                    { name: "Live Classes", amt: "₹18,000" },
                    { name: "Recorded Content", amt: "₹6,000" },
                    { name: "Resources Library", amt: "₹4,000" },
                  ].map((src, i) => (
                    <div key={i} className="flex justify-between border-b border-border/20 pb-1.5 last:border-0 last:pb-0">
                      <span className="text-muted-foreground">{src.name}</span>
                      <strong className="text-foreground">{src.amt}</strong>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Right: Student Overview (My Students) */}
            <div className="lg:col-span-6 space-y-4 text-left">
              <div className="flex justify-between items-center select-none">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider font-heading">My Students</h3>
                <button
                  onClick={() => handleTabChange("students")}
                  className="text-[10px] text-primary font-black hover:underline bg-transparent border-none cursor-pointer"
                >
                  View All Students →
                </button>
              </div>
              <Card variant="glass" className="p-5 border-border/80 grid grid-cols-2 gap-6 select-none">
                <div className="space-y-4 border-r border-border/30 pr-2">
                  <div>
                    <span className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">Total Active Cohort</span>
                    <h3 className="text-2xl font-black text-foreground mt-0.5">{contextStudents.length || 124} Pupils</h3>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-muted-foreground uppercase">New Cohorts (This Month)</span>
                    <p className="text-sm font-black text-emerald-500">+18 Students</p>
                  </div>
                </div>
                <div className="flex flex-col justify-around text-xs font-semibold">
                  <div className="flex justify-between border-b border-border/20 pb-2">
                    <span className="text-muted-foreground">Course Completion:</span>
                    <strong className="text-foreground">78%</strong>
                  </div>
                  <div className="flex justify-between border-b border-border/20 pb-2">
                    <span className="text-muted-foreground">Avg Session Watch:</span>
                    <strong className="text-foreground">45 mins</strong>
                  </div>
                  <div className="flex justify-between pb-0">
                    <span className="text-muted-foreground">Returning rate:</span>
                    <strong className="text-foreground">62%</strong>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Section 6: RECENT STUDENT ACTIVITY & Resource Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left: Recent Activity Feed */}
            <div className="lg:col-span-8 space-y-4 text-left">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider font-heading select-none">Recent Student Activity</h3>
              <Card variant="glass" className="p-4 border-border/80 divide-y divide-border/30">
                {[
                  { user: "Aarav", desc: "enrolled in Python Programming Masterclass", time: "2 minutes ago" },
                  { user: "Meera", desc: "completed Lesson 8 (Functions parameters)", time: "18 minutes ago" },
                  { user: "Rahul", desc: "asked a question: 'Why does recursion overflow here?'", time: "32 minutes ago" },
                  { user: "Priya", desc: "left a 5★ review on Python Complete Notes", time: "1 hour ago" },
                ].map((act, i) => (
                  <div key={i} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between text-xs font-semibold gap-3">
                    <div className="min-w-0 flex-1">
                      <span className="font-extrabold text-foreground">{act.user} </span>
                      <span className="text-muted-foreground">{act.desc}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground/60 shrink-0 select-none">{act.time}</span>
                  </div>
                ))}
              </Card>
            </div>

            {/* Right: Resource Performance Summary */}
            <div className="lg:col-span-4 space-y-4 text-left">
              <div className="flex justify-between items-center select-none">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider font-heading">Resource Library</h3>
                <button
                  onClick={() => handleTabChange("resources")}
                  className="text-[10px] text-primary font-black hover:underline bg-transparent border-none cursor-pointer"
                >
                  Open Resources →
                </button>
              </div>
              <Card variant="glass" className="p-4 border-border/80 space-y-3.5 text-xs font-semibold">
                <div className="border-b border-border/20 pb-2">
                  <h5 className="font-black text-foreground truncate">Python Complete Notes</h5>
                  <p className="text-[10px] text-muted-foreground mt-0.5">PDF • Object-Oriented Programming</p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-[10.5px]">
                  <div>Purchases: <strong className="text-foreground">184 orders</strong></div>
                  <div>Earnings: <strong className="text-emerald-500">₹18,216</strong></div>
                  <div>Downloads: <strong className="text-foreground">1,100</strong></div>
                  <div>Views: <strong className="text-foreground">3,240</strong></div>
                </div>
              </Card>
            </div>
          </div>

          {/* Section 7: CONTINUE CREATING & Doubt Sessions */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left: Continue Creating Drafts */}
            <div className="lg:col-span-6 space-y-4 text-left">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider font-heading select-none">Continue Creating</h3>
              <Card variant="glass" className="p-5 border-border/80 space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs font-extrabold select-none">
                    <span className="text-foreground truncate max-w-[200px]">Python Programming Masterclass</span>
                    <span className="text-primary text-[10px]">75% complete</span>
                  </div>
                  <div className="w-full bg-muted/40 h-2 rounded-full overflow-hidden select-none">
                    <div className="bg-primary h-full rounded-full" style={{ width: "75%" }} />
                  </div>
                  <p className="text-[10px] text-muted-foreground font-semibold">18 / 24 lessons uploaded • 6 drafts remaining.</p>
                </div>

                <div className="flex flex-wrap gap-2 select-none pt-2 border-t border-border/20">
                  <span className="text-[9.5px] font-black uppercase tracking-wider px-2.5 py-1 bg-slate-500/10 text-slate-400 border border-slate-500/20 rounded-lg">2 Draft Videos</span>
                  <span className="text-[9.5px] font-black uppercase tracking-wider px-2.5 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-lg">1 Under Review</span>
                  <span className="text-[9.5px] font-black uppercase tracking-wider px-2.5 py-1 bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 rounded-lg">3 Draft Resources</span>
                </div>
              </Card>
            </div>

            {/* Right: Live Doubt Session Integration */}
            <div className="lg:col-span-6 space-y-4 text-left">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider font-heading select-none">Upcoming Doubt Sessions</h3>
              <Card variant="glass" className="p-5 border-border/80 flex flex-col justify-between h-[152px]">
                <div className="space-y-1">
                  <span className="text-[9.5px] font-black uppercase text-indigo-500 select-none">Interactive Doubt Room</span>
                  <h4 className="font-extrabold text-sm text-foreground">Python Masterclass Weekly Doubt Session</h4>
                  <p className="text-[10.5px] text-muted-foreground font-semibold">Saturday · 6:00 PM • 18 students registered</p>
                </div>
                <div className="pt-2 select-none">
                  <Button
                    onClick={() => toast.success("Doubt Room scheduled successfully.")}
                    size="sm"
                    className="bg-primary hover:bg-primary/95 text-white font-extrabold text-[10.5px] h-8 w-full border-none"
                  >
                    Manage Doubt Session
                  </Button>
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
