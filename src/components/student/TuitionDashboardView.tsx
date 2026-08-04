"use client";

import React, { useState } from "react";
import { 
  BookOpen, 
  Video, 
  ClipboardList, 
  Calendar, 
  Activity, 
  CheckCircle, 
  Clock, 
  UserCheck, 
  Download, 
  HelpCircle, 
  PlayCircle,
  FileText,
  AlertCircle,
  Award,
  Sparkles,
  ChevronRight,
  TrendingUp,
  MessageSquare,
  Users
} from "lucide-react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Divider } from "../ui/divider";
import { 
  MOCK_CURRICULUM, 
  MOCK_SCHEDULES, 
  MOCK_ASSESSMENTS, 
  MOCK_ATTENDANCE,
  SCHOOL_SUBJECTS,
  MockScheduleEvent,
  MockAssessment,
  MockAttendanceRecord
} from "../../constants/schoolTuitionData";

interface TuitionDashboardProps {
  user: any;
}

export function TuitionDashboardView({ user }: TuitionDashboardProps) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "subjects" | "homework" | "tests" | "attendance" | "timetable"
  >("overview");

  // Selection state for curriculum viewer
  const [selectedSubject, setSelectedSubject] = useState<string | null>("Mathematics");
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  // Calculations
  const totalHomework = MOCK_ASSESSMENTS.filter(a => a.type === "homework" || a.type === "assignment");
  const completedHomework = totalHomework.filter(a => a.status === "graded" || a.status === "submitted").length;
  
  const pendingTests = MOCK_ASSESSMENTS.filter(a => (a.type === "test" || a.type === "quiz") && a.status === "pending").length;
  
  const presentDays = MOCK_ATTENDANCE.filter(a => a.status === "Present").length;
  const attendanceRate = MOCK_ATTENDANCE.length > 0 
    ? Math.round((presentDays / MOCK_ATTENDANCE.length) * 100) 
    : 100;

  return (
    <div className="space-y-6 text-left">
      {/* Header Profile Greeting */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-emerald-500/10 via-background to-background p-6 rounded-2xl border border-emerald-500/20">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase">
            <Sparkles size={10} /> Active Tuition Segment
          </div>
          <h2 className="text-xl md:text-2xl font-heading font-extrabold text-foreground">
            Welcome back, {user?.fullName || "Student"}!
          </h2>
          <p className="text-xs text-muted-foreground">
            Current curriculum: <strong className="text-foreground">Class 10 (CBSE Board)</strong> • Academic Year 2026-27
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-muted-foreground pt-1.5 border-t border-border/40 mt-1.5">
            <span>Admission No: <strong className="text-foreground">ADM-2026-001</strong></span>
            <span>•</span>
            <span>Roll No: <strong className="text-foreground">10</strong></span>
            <span>•</span>
            <span>Assigned Teachers: <strong className="text-foreground">Rahul Sharma (Math), Neha Gupta (Science)</strong></span>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <div className="text-[10px] bg-card px-3 py-1.5 rounded-xl border border-border flex items-center gap-1.5 font-bold">
            <UserCheck size={12} className="text-emerald-500" />
            Attendance: {attendanceRate}%
          </div>
          <div className="text-[10px] bg-card px-3 py-1.5 rounded-xl border border-border flex items-center gap-1.5 font-bold">
            <CheckCircle size={12} className="text-primary" />
            Homework: {completedHomework}/{totalHomework.length} Done
          </div>
        </div>
      </div>

      {/* Main Grid Navigation Tabs */}
      <div className="flex flex-wrap gap-1.5 border-b border-border pb-px">
        {(["overview", "subjects", "homework", "tests", "attendance", "timetable"] as const).map((tab) => (
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

      {/* TAB CONTENTS */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4 border-border bg-card">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-bold uppercase text-muted-foreground">Enrolled Subjects</p>
                  <h3 className="text-2xl font-extrabold text-foreground mt-1">4 Topics</h3>
                </div>
                <span className="p-1.5 bg-primary/10 rounded-lg text-primary"><BookOpen size={16} /></span>
              </div>
            </Card>
            <Card className="p-4 border-border bg-card">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-bold uppercase text-muted-foreground">Weekly Tests Status</p>
                  <h3 className="text-2xl font-extrabold text-amber-500 mt-1">{pendingTests} Pending</h3>
                </div>
                <span className="p-1.5 bg-amber-500/10 rounded-lg text-amber-500"><Award size={16} /></span>
              </div>
            </Card>
            <Card className="p-4 border-border bg-card">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-bold uppercase text-muted-foreground">Pending Homework</p>
                  <h3 className="text-2xl font-extrabold text-foreground mt-1">
                    {totalHomework.length - completedHomework} Assignments
                  </h3>
                </div>
                <span className="p-1.5 bg-violet-500/10 rounded-lg text-violet-500"><ClipboardList size={16} /></span>
              </div>
            </Card>
            <Card className="p-4 border-border bg-card">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-bold uppercase text-muted-foreground">Next Live Class</p>
                  <h3 className="text-xs font-extrabold text-emerald-500 mt-2 truncate">Tomorrow, 10:00 AM</h3>
                </div>
                <span className="p-1.5 bg-emerald-500/10 rounded-lg text-emerald-500"><Video size={16} /></span>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left side: Live schedules & classes */}
            <div className="lg:col-span-7 space-y-4">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Video size={16} className="text-primary" />
                Live Rooms & Doubt Sessions
              </h3>
              <div className="space-y-3">
                {MOCK_SCHEDULES.map((event: MockScheduleEvent) => (
                  <Card key={event.id} className="p-4 border-border bg-card hover:border-primary/40 transition">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant={event.type === "live_class" ? "primary" : "secondary"} className="text-[8px] font-bold uppercase">
                            {event.type.replace("_", " ")}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">{event.courseTitle}</span>
                        </div>
                        <h4 className="font-extrabold text-xs text-foreground">{event.title}</h4>
                        <p className="text-[10.5px] text-muted-foreground leading-relaxed">{event.description}</p>
                      </div>
                      <div className="flex sm:flex-col items-start sm:items-end gap-2 shrink-0">
                        <span className="text-[10px] font-bold text-foreground flex items-center gap-1">
                          <Clock size={11} className="text-primary" />
                          {new Date(event.scheduledAt).toLocaleDateString()}
                        </span>
                        <a
                          href={event.meetingLink}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-primary text-white text-[10px] font-extrabold hover:bg-primary/95 transition shadow-sm"
                        >
                          Join Meet
                        </a>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Right side: Urgent Notifications & Parent-Teacher update slots */}
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <AlertCircle size={16} className="text-amber-500" />
                  Academic Alerts
                </h3>
                <Card className="p-4 border-border bg-card space-y-3">
                  <div className="flex gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                    <div>
                      <p className="text-[11px] font-bold text-foreground">Homework Due In 3 Days</p>
                      <p className="text-[10px] text-muted-foreground leading-relaxed">
                        Class 10 CBSE Math: Homework 1 - Quadratic Polynomial roots factorization equations worksheets.
                      </p>
                    </div>
                  </div>
                  <Divider />
                  <div className="flex gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <div>
                      <p className="text-[11px] font-bold text-foreground">Weekly Mathematics Mock Test Opened</p>
                      <p className="text-[10px] text-muted-foreground leading-relaxed">
                        Contains 20 multiple choice questions. Max duration: 60 minutes.
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Reusable Parent update slot */}
              <div className="space-y-3">
                <h4 className="text-[10.5px] font-extrabold uppercase text-muted-foreground tracking-wider flex items-center gap-1">
                  <Users size={12} /> Parent Portal Link Status
                </h4>
                <div className="p-3 border border-border bg-muted/20 rounded-xl flex items-center justify-between text-[10px] font-bold">
                  <span className="text-muted-foreground">Connected Parent Profile:</span>
                  <span className="text-emerald-500">Active (Sponsor Mapped)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "subjects" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left panel: Available subjects list */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Academic Topics</h3>
            {SCHOOL_SUBJECTS.slice(0, 4).map((sub) => (
              <button
                key={sub.id}
                onClick={() => {
                  setSelectedSubject(sub.name);
                  setActiveVideo(null);
                }}
                className={`w-full p-4 rounded-xl border transition text-left flex items-center justify-between bg-card ${
                  selectedSubject === sub.name ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                }`}
              >
                <div className="space-y-1">
                  <h4 className="font-extrabold text-xs text-foreground">{sub.name}</h4>
                  <p className="text-[10px] text-muted-foreground">Class 10 • CBSE</p>
                </div>
                <ChevronRight size={14} className={selectedSubject === sub.name ? "text-primary" : "text-muted-foreground"} />
              </button>
            ))}
          </div>

          {/* Right panel: Course syllabus and lesson viewer */}
          <div className="lg:col-span-8 space-y-4">
            <div className="p-4 bg-muted/20 rounded-xl border border-border flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-sm text-foreground">{selectedSubject} Syllabus</h3>
                <p className="text-[10.5px] text-muted-foreground">Curriculum sync: Academic Year 2026-27</p>
              </div>
              <Button size="sm" variant="outline" className="text-[10px] h-8 flex items-center gap-1 font-bold">
                <Download size={12} /> Syllabus PDF
              </Button>
            </div>

            {/* Video Player sandbox */}
            {activeVideo && (
              <Card className="overflow-hidden border-border bg-card space-y-2">
                <video controls className="w-full aspect-video bg-black" src={activeVideo} />
                <div className="p-4 text-left">
                  <h4 className="font-extrabold text-xs text-foreground">Lecture Playback Active</h4>
                  <p className="text-[10.5px] text-muted-foreground mt-0.5">Syllabus compliance: Euclid division theorems</p>
                </div>
              </Card>
            )}

            {/* Chapters list */}
            <div className="space-y-3">
              {MOCK_CURRICULUM.chapters.map((chapter) => (
                <div key={chapter.id} className="border border-border rounded-xl bg-card overflow-hidden">
                  <div className="p-3.5 bg-muted/40 border-b border-border/40">
                    <h4 className="font-extrabold text-xs text-foreground">{chapter.title}</h4>
                    <p className="text-[10.5px] text-muted-foreground mt-0.5">{chapter.description}</p>
                  </div>
                  <div className="p-3 divide-y divide-border/60">
                    {chapter.lessons.map((lesson) => (
                      <div key={lesson.id} className="py-2.5 flex items-center justify-between text-xs font-semibold">
                        <div className="flex items-center gap-2">
                          <PlayCircle size={14} className="text-primary shrink-0" />
                          <span className="text-foreground">{lesson.title}</span>
                          <span className="text-[9.5px] text-muted-foreground">({lesson.duration})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setActiveVideo(lesson.videoUrl)}
                            className="text-[9.5px] text-primary font-bold hover:underline"
                          >
                            Watch Video
                          </button>
                          <span className="text-muted-foreground">•</span>
                          <button className="text-[9.5px] text-muted-foreground font-bold hover:underline flex items-center gap-1">
                            <FileText size={10} /> Study Notes
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "homework" && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Homework & Assignments Registry</h3>
          <div className="space-y-3">
            {MOCK_ASSESSMENTS.filter(a => a.type === "homework" || a.type === "assignment").map((ass: MockAssessment) => (
              <Card key={ass.id} className="p-5 border-border bg-card">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={ass.status === "graded" ? "secondary" : "outline"} className="text-[8px] font-bold uppercase">
                        {ass.status}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">Max Score: {ass.maxMarks} Marks</span>
                    </div>
                    <h4 className="font-extrabold text-xs text-foreground">{ass.title}</h4>
                    <p className="text-[10.5px] text-muted-foreground leading-relaxed">{ass.description}</p>
                  </div>

                  <div className="flex sm:flex-col items-start sm:items-end gap-2 shrink-0 text-right">
                    <span className="text-[10px] font-bold text-foreground">
                      Due: {new Date(ass.dueDate).toLocaleDateString()}
                    </span>
                    {ass.status === "pending" ? (
                      <button className="px-3 py-1.5 rounded-lg bg-primary text-white text-[10px] font-extrabold hover:bg-primary/95 transition shadow-sm">
                        Submit Answer Sheet
                      </button>
                    ) : (
                      <span className="text-[11px] font-extrabold text-emerald-500">
                        {ass.score !== undefined ? `Graded: ${ass.score}/${ass.maxMarks}` : "Submitted for Review"}
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === "tests" && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Weekly Assessment & Mock Tests</h3>
          <div className="space-y-3">
            {MOCK_ASSESSMENTS.filter(a => a.type === "test" || a.type === "quiz").map((test: MockAssessment) => (
              <Card key={test.id} className="p-5 border-border bg-card">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="warning" className="text-[8px] font-bold uppercase bg-amber-500 text-white">
                        {test.type}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">Duration: 60 minutes • Max Marks: {test.maxMarks}</span>
                    </div>
                    <h4 className="font-extrabold text-xs text-foreground">{test.title}</h4>
                    <p className="text-[10.5px] text-muted-foreground leading-relaxed">{test.description}</p>
                  </div>

                  <div className="flex sm:flex-col items-start sm:items-end gap-2 shrink-0 text-right">
                    <span className="text-[10px] font-bold text-foreground">
                      Available until: {new Date(test.dueDate).toLocaleDateString()}
                    </span>
                    <button className="px-3 py-1.5 rounded-lg bg-amber-500 text-white text-[10px] font-extrabold hover:bg-amber-600 transition shadow-sm">
                      Start Online Test
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === "attendance" && (
        <div className="space-y-4">
          <div className="p-5 border border-border bg-card rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="font-heading font-extrabold text-sm text-foreground">Live Sessions Attendance Log</h3>
              <p className="text-[10.5px] text-muted-foreground">Must maintain above 75% attendance to unlock term final exams.</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-muted-foreground font-bold uppercase block">Current Term Average</span>
              <span className="text-2xl font-extrabold text-emerald-500">{attendanceRate}%</span>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-border bg-card">
            <table className="w-full text-left text-xs font-semibold">
              <thead className="border-b border-border bg-muted/40 text-[10px] text-muted-foreground uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Scheduled Live Session</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Attendance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {MOCK_ATTENDANCE.map((rec: MockAttendanceRecord) => (
                  <tr key={rec.id}>
                    <td className="px-4 py-3 text-foreground">{rec.entityTitle}</td>
                    <td className="px-4 py-3 capitalize text-muted-foreground">{rec.entityType.replace("_", " ")}</td>
                    <td className="px-4 py-3 text-muted-foreground">{rec.date}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`px-2 py-0.5 rounded text-[9.5px] font-bold ${
                        rec.status === "Present" 
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
                          : "bg-red-500/10 text-red-600 dark:text-red-400"
                      }`}>
                        {rec.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "timetable" && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Weekly Timetable Planner</h3>
          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            {(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const).map((day) => {
              const isToday = day === "Friday"; // Mock active day
              return (
                <div key={day} className={`p-4 rounded-xl border text-left space-y-3 bg-card ${
                  isToday ? "border-primary/60 bg-primary/5" : "border-border"
                }`}>
                  <h4 className="text-[10px] font-extrabold uppercase text-foreground flex items-center justify-between">
                    <span>{day}</span>
                    {isToday && <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />}
                  </h4>
                  <Divider />
                  <div className="space-y-2">
                    {day === "Friday" ? (
                      <div className="text-[9.5px] p-2 bg-muted/50 rounded-lg border border-border/40 space-y-1">
                        <span className="font-bold text-foreground block">10:00 AM - 11:00 AM</span>
                        <span className="text-muted-foreground block">CBSE Math Live Session</span>
                      </div>
                    ) : day === "Monday" || day === "Wednesday" ? (
                      <div className="text-[9.5px] p-2 bg-muted/30 rounded-lg border border-border/40 space-y-1">
                        <span className="font-bold text-foreground block">04:00 PM - 05:00 PM</span>
                        <span className="text-muted-foreground block">Doubt Clearing Room</span>
                      </div>
                    ) : (
                      <span className="text-[9px] text-muted-foreground italic">No Sessions Scheduled</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
