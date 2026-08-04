"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Trash2, Edit2, Check, X, Star, BookOpen, AlertCircle, Copy, Search, CheckCircle, 
  FileText, Video, Award, Brain, ExternalLink, Eye, RefreshCw, ChevronLeft, ChevronRight,
  BookOpenCheck, Calendar, GraduationCap, Users, ShieldAlert, Award as CertIcon, Clock
} from "lucide-react";
import { Card } from "../../../../../components/ui/card";
import { Button } from "../../../../../components/ui/button";

// Academic Store Imports
import { 
  Course, Student, TutorMetrics, GradeRecord, AttendanceRecord, Exam, Question, ResourceItem, StudentRiskSummary,
  seedCourses, seedStudents, seedTutorMetrics, seedGrades, seedAttendance, seedExams, seedQuestions, seedResources, seedRiskSummaries,
  recalculateRisk
} from "./AcademicOperationsStore";

// Reusable Tabs
import CourseLifecycleTab from "./CourseLifecycleTab";
import GradebookTab from "./GradebookTab";
import AttendanceTab from "./AttendanceTab";
import ExamCenterTab from "./ExamCenterTab";
import StudentSuccessTab from "./StudentSuccessTab";
import TutorPerformanceTab from "./TutorPerformanceTab";

interface AdminCourse {
  id: string;
  title: string;
  tutorName: string;
  category: string;
  price: number;
  tutorEarnings: number;
  platformEarnings: number;
  status: "Pending" | "Approved" | "Rejected" | "Draft" | "Need Changes" | "Archived";
  featured: boolean;
  hidden: boolean;
  assignedSkill: string;
  isDynamic?: boolean;
}

interface CoursesTabProps {
  courses: AdminCourse[];
  setCourses: React.Dispatch<React.SetStateAction<AdminCourse[]>>;
  logAuditAction: (actionStr: string) => void;
  isLoading?: boolean;
}

export default function CoursesTab({
  courses: legacyCourses,
  setCourses: setLegacyCourses,
  logAuditAction,
  isLoading = false
}: CoursesTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<string>("lifecycle");

  // Core Shared Academic Store States
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [tutors, setTutors] = useState<TutorMetrics[]>([]);
  const [grades, setGrades] = useState<GradeRecord[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [risks, setRisks] = useState<StudentRiskSummary[]>([]);

  // Sliding Contextual Drawers
  const [drawerTutor, setDrawerTutor] = useState<TutorMetrics | null>(null);
  const [drawerStudent, setDrawerStudent] = useState<Student | null>(null);
  const [drawerCourse, setDrawerCourse] = useState<Course | null>(null);

  // Load datasets from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const getOrSeed = (key: string, seedFn: () => any) => {
      const stored = localStorage.getItem(key);
      if (stored) {
        try { return JSON.parse(stored); } catch {}
      }
      const data = seedFn();
      localStorage.setItem(key, JSON.stringify(data));
      return data;
    };

    setCourses(getOrSeed("eduearn_academic_courses", seedCourses));
    setStudents(getOrSeed("eduearn_academic_students", seedStudents));
    setTutors(getOrSeed("eduearn_academic_tutors", seedTutorMetrics));
    setGrades(getOrSeed("eduearn_academic_grades", seedGrades));
    setAttendance(getOrSeed("eduearn_academic_attendance", seedAttendance));
    setExams(getOrSeed("eduearn_academic_exams", seedExams));
    setQuestions(getOrSeed("eduearn_academic_questions", seedQuestions));
    setResources(getOrSeed("eduearn_academic_resources", seedResources));
    setRisks(getOrSeed("eduearn_academic_risks", seedRiskSummaries));
  }, []);

  // Save changes to localStorage + propagate course updates to legacy parent states
  useEffect(() => {
    if (typeof window === "undefined" || courses.length === 0) return;
    localStorage.setItem("eduearn_academic_courses", JSON.stringify(courses));

    // Backward compatibility sync: update page.tsx parent course array
    const mapped: AdminCourse[] = courses.map(c => ({
      id: c.id,
      title: c.title,
      tutorName: c.tutorName,
      category: c.category,
      price: c.price,
      tutorEarnings: Math.round(c.price * 0.8),
      platformEarnings: Math.round(c.price * 0.2),
      status: (c.status === "Published" ? "Approved" : c.status === "Draft" ? "Draft" : c.status === "Archived" ? "Archived" : "Pending") as any,
      featured: c.healthScore > 90,
      hidden: c.status === "Draft" || c.status === "Archived",
      assignedSkill: c.category
    }));
    setLegacyCourses(mapped);
  }, [courses, setLegacyCourses]);

  const saveState = (key: string, val: any) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(key, JSON.stringify(val));
    }
  };

  useEffect(() => {
    if (students.length > 0) saveState("eduearn_academic_students", students);
  }, [students]);

  useEffect(() => {
    if (tutors.length > 0) saveState("eduearn_academic_tutors", tutors);
  }, [tutors]);

  useEffect(() => {
    if (grades.length > 0) {
      saveState("eduearn_academic_grades", grades);
      // Auto triggers: Recalculate Student Success Risks
      setRisks(prev => {
        const updated = prev.map(r => {
          const fresh = recalculateRisk(r.studentId, r.courseId, grades, attendance);
          return { ...r, ...fresh };
        });
        saveState("eduearn_academic_risks", updated);
        return updated;
      });
    }
  }, [grades, attendance]);

  useEffect(() => {
    if (attendance.length > 0) saveState("eduearn_academic_attendance", attendance);
  }, [attendance]);

  useEffect(() => {
    if (exams.length > 0) saveState("eduearn_academic_exams", exams);
  }, [exams]);

  useEffect(() => {
    if (questions.length > 0) saveState("eduearn_academic_questions", questions);
  }, [questions]);

  useEffect(() => {
    if (resources.length > 0) saveState("eduearn_academic_resources", resources);
  }, [resources]);

  useEffect(() => {
    if (risks.length > 0) saveState("eduearn_academic_risks", risks);
  }, [risks]);

  // Drawer Open Actions
  const handleOpenTutorDrawer = (id: string) => {
    const t = tutors.find(item => item.tutorId === id);
    if (t) setDrawerTutor(t);
  };

  const handleOpenStudentDrawer = (id: string) => {
    const s = students.find(item => item.id === id);
    if (s) setDrawerStudent(s);
  };

  const handleOpenCourseDrawer = (course: Course) => {
    setDrawerCourse(course);
  };

  return (
    <div className="space-y-6 text-left select-none">
      {/* Subtab Navigation Selector Bar */}
      <div className="flex items-center justify-between border-b border-border/40 pb-2">
        <div className="flex flex-wrap gap-2.5">
          {[
            { id: "lifecycle", label: "Course Lifecycles", icon: BookOpenCheck },
            { id: "gradebook", label: "LMS Gradebook", icon: GraduationCap },
            { id: "attendance", label: "Attendance Center", icon: Calendar },
            { id: "exam-center", label: "Exam & Quiz Console", icon: Brain },
            { id: "success-center", label: "Student Success", icon: ShieldAlert },
            { id: "tutor-performance", label: "Tutor Performance", icon: Users }
          ].map(tab => {
            const Icon = tab.icon;
            const isSel = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-button text-[11px] font-extrabold uppercase tracking-wider transition-all border ${
                  isSel 
                    ? "bg-primary text-white border-primary shadow-soft" 
                    : "bg-card text-muted-foreground border-border hover:bg-muted/50"
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Render selected workspace components */}
      <div className="mt-4">
        {activeSubTab === "lifecycle" && (
          <CourseLifecycleTab
            courses={courses}
            setCourses={setCourses}
            students={students}
            onOpenTutor={handleOpenTutorDrawer}
            onOpenStudent={handleOpenStudentDrawer}
            onOpenCourseDetails={handleOpenCourseDrawer}
            logAuditAction={logAuditAction}
          />
        )}

        {activeSubTab === "gradebook" && (
          <GradebookTab
            courses={courses}
            students={students}
            grades={grades}
            setGrades={setGrades}
            onOpenStudent={handleOpenStudentDrawer}
            onOpenCourse={handleOpenTutorDrawer}
            logAuditAction={logAuditAction}
          />
        )}

        {activeSubTab === "attendance" && (
          <AttendanceTab
            courses={courses}
            students={students}
            attendance={attendance}
            setAttendance={setAttendance}
            onOpenStudent={handleOpenStudentDrawer}
            logAuditAction={logAuditAction}
          />
        )}

        {activeSubTab === "exam-center" && (
          <ExamCenterTab
            courses={courses}
            students={students}
            exams={exams}
            setExams={setExams}
            questions={questions}
            setQuestions={setQuestions}
            onOpenCourse={handleOpenTutorDrawer}
            logAuditAction={logAuditAction}
          />
        )}

        {activeSubTab === "success-center" && (
          <StudentSuccessTab
            courses={courses}
            students={students}
            grades={grades}
            attendance={attendance}
            risks={risks}
            setRisks={setRisks}
            onOpenStudent={handleOpenStudentDrawer}
            onOpenTutor={handleOpenTutorDrawer}
            logAuditAction={logAuditAction}
          />
        )}

        {activeSubTab === "tutor-performance" && (
          <TutorPerformanceTab
            tutorMetrics={tutors}
            onOpenTutor={handleOpenTutorDrawer}
            logAuditAction={logAuditAction}
          />
        )}
      </div>

      {/* ── CONTEXTUAL SIDE DRAWERS ── */}
      <AnimatePresence>
        {/* Tutor Details Drawer */}
        {drawerTutor && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }} onClick={() => setDrawerTutor(null)} className="fixed inset-0 bg-black z-45 cursor-pointer" />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25 }} className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-background border-l border-border/80 z-50 overflow-y-auto p-6 text-left flex flex-col justify-between shadow-2xl">
              <div>
                <div className="flex justify-between items-center border-b border-border/40 pb-4 mb-4">
                  <h2 className="text-sm font-extrabold font-heading text-foreground uppercase">Tutor Profile Audit Roster</h2>
                  <button onClick={() => setDrawerTutor(null)} className="p-1.5 rounded-xl hover:bg-muted text-muted-foreground"><X size={16} /></button>
                </div>
                
                <div className="space-y-6 text-xs font-semibold">
                  <div>
                    <h3 className="text-base font-extrabold text-foreground">{drawerTutor.tutorName}</h3>
                    <span className="text-[10px] text-muted-foreground mt-0.5 block">Tutor ID: {drawerTutor.tutorId}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 bg-muted/20 p-4 rounded-xl border border-border/50">
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase">Teaching Hours</span>
                      <span className="text-foreground text-sm font-black">{drawerTutor.teachingHours} Hours</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase">Average Rating</span>
                      <span className="text-foreground text-sm font-black flex items-center gap-1">
                        <Star size={12} className="fill-amber-400 text-amber-400" /> {drawerTutor.avgRating}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase">Review Speed</span>
                      <span className="text-foreground text-sm font-black">{drawerTutor.avgReviewTime} Hrs</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase">GST/TDS share</span>
                      <span className="text-emerald-500 text-sm font-black">₹{drawerTutor.revenue.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="space-y-2 border-t border-border/40 pt-3">
                    <span className="text-[10px] font-black uppercase text-muted-foreground tracking-wider block">Course Assignments</span>
                    <div className="p-3 border border-border/60 bg-muted/10 rounded-lg">
                      <div className="flex justify-between text-[11px] font-bold text-foreground">
                        <span>Course Count</span>
                        <span>{drawerTutor.courseCount} Courses</span>
                      </div>
                      <div className="flex justify-between text-[11px] font-bold text-foreground mt-1">
                        <span>Live Classes Done</span>
                        <span>{drawerTutor.liveClassesCount} classes</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-border/40">
                <Button onClick={() => setDrawerTutor(null)} className="w-full text-xs font-bold h-10">Close Audit Profile</Button>
              </div>
            </motion.div>
          </>
        )}

        {/* Student Details Drawer */}
        {drawerStudent && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }} onClick={() => setDrawerStudent(null)} className="fixed inset-0 bg-black z-45 cursor-pointer" />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25 }} className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-background border-l border-border/80 z-50 overflow-y-auto p-6 text-left flex flex-col justify-between shadow-2xl">
              <div>
                <div className="flex justify-between items-center border-b border-border/40 pb-4 mb-4">
                  <h2 className="text-sm font-extrabold font-heading text-foreground uppercase">Student Profile Drawer</h2>
                  <button onClick={() => setDrawerStudent(null)} className="p-1.5 rounded-xl hover:bg-muted text-muted-foreground"><X size={16} /></button>
                </div>
                
                <div className="space-y-6 text-xs font-semibold">
                  <div>
                    <h3 className="text-base font-extrabold text-foreground">{drawerStudent.name}</h3>
                    <span className="text-[10px] text-muted-foreground mt-0.5 block">{drawerStudent.email}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 bg-muted/20 p-4 rounded-xl border border-border/50">
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase">Batch Group</span>
                      <span className="text-foreground text-sm font-black">{drawerStudent.batch}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase">Progress Rate</span>
                      <span className="text-foreground text-sm font-black">{drawerStudent.progress}% Complete</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase">Assigned Mentor</span>
                      <span className="text-foreground text-sm font-black">{drawerStudent.mentorName}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase">Certificate Status</span>
                      <span className="text-foreground text-sm font-black">
                        {drawerStudent.certificateIssued ? "Issued" : "Not Eligible"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-border/40">
                <Button onClick={() => setDrawerStudent(null)} className="w-full text-xs font-bold h-10">Close Profile</Button>
              </div>
            </motion.div>
          </>
        )}

        {/* Course Details Drawer */}
        {drawerCourse && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }} onClick={() => setDrawerCourse(null)} className="fixed inset-0 bg-black z-45 cursor-pointer" />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25 }} className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-background border-l border-border/80 z-50 overflow-y-auto p-6 text-left flex flex-col justify-between shadow-2xl">
              <div>
                <div className="flex justify-between items-center border-b border-border/40 pb-4 mb-4">
                  <h2 className="text-sm font-extrabold font-heading text-foreground uppercase">Course Version Inspector</h2>
                  <button onClick={() => setDrawerCourse(null)} className="p-1.5 rounded-xl hover:bg-muted text-muted-foreground"><X size={16} /></button>
                </div>
                
                <div className="space-y-6 text-xs font-semibold">
                  <div>
                    <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded mr-2 uppercase tracking-widest">{drawerCourse.code}</span>
                    <span className="text-[9px] font-extrabold text-muted-foreground uppercase">Version {drawerCourse.version}</span>
                    <h3 className="text-base font-extrabold text-foreground mt-2">{drawerCourse.title}</h3>
                  </div>

                  <div className="space-y-2 border-t border-border/40 pt-3">
                    <span className="text-[10px] font-black uppercase text-muted-foreground tracking-wider block">Course Revision Logs</span>
                    <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                      {drawerCourse.revisionTimeline.map((item, idx) => (
                        <div key={idx} className="p-3 bg-muted/15 border border-border/40 rounded-lg text-[11px]">
                          <div className="flex justify-between text-[10px] text-muted-foreground">
                            <span>{item.date}</span>
                            <span>{item.actor}</span>
                          </div>
                          <p className="text-foreground font-bold mt-1">{item.change}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-border/40">
                <Button onClick={() => setDrawerCourse(null)} className="w-full text-xs font-bold h-10">Close Drawer</Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
