"use client";

import React, { useState } from "react";
import { 
  Plus, Trash2, Copy, Play, CheckCircle, XCircle, Archive, RotateCcw, Calendar, 
  Layers, CheckSquare, ShieldCheck, Heart, AlertTriangle, FileText, ArrowRight, Eye, RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import { Card } from "../../../../../components/ui/card";
import { Button } from "../../../../../components/ui/button";
import { Course, Student } from "./AcademicOperationsStore";

interface CourseLifecycleTabProps {
  courses: Course[];
  setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
  students: Student[];
  onOpenTutor: (id: string) => void;
  onOpenStudent: (id: string) => void;
  onOpenCourseDetails: (course: Course) => void;
  logAuditAction: (action: string) => void;
}

export default function CourseLifecycleTab({
  courses,
  setCourses,
  students,
  onOpenTutor,
  onOpenStudent,
  onOpenCourseDetails,
  logAuditAction
}: CourseLifecycleTabProps) {
  const [search, setSearch] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [scheduleDate, setScheduleDate] = useState("");
  const [isScheduling, setIsScheduling] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("All");

  const filtered = courses.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) || 
                          c.code.toLowerCase().includes(search.toLowerCase()) || 
                          c.tutorName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Action: Approve
  const handleApprove = (id: string) => {
    setCourses(prev => prev.map(c => {
      if (c.id === id) {
        logAuditAction(`Approved course: ${c.title} (${c.code})`);
        toast.success(`Course ${c.code} marked as Approved.`);
        return { ...c, status: "Approved" };
      }
      return c;
    }));
  };

  // Action: Reject
  const handleReject = (id: string) => {
    setCourses(prev => prev.map(c => {
      if (c.id === id) {
        logAuditAction(`Rejected course: ${c.title} (${c.code})`);
        toast.success(`Course ${c.code} marked as Rejected.`);
        return { ...c, status: "Rejected" };
      }
      return c;
    }));
  };

  // Action: Publish
  const handlePublish = (id: string) => {
    setCourses(prev => prev.map(c => {
      if (c.id === id) {
        logAuditAction(`Published course: ${c.title} (${c.code})`);
        toast.success(`Course ${c.code} published live.`);
        return { ...c, status: "Published" };
      }
      return c;
    }));
  };

  // Action: Schedule
  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse || !scheduleDate) return;

    setCourses(prev => prev.map(c => {
      if (c.id === selectedCourse.id) {
        logAuditAction(`Scheduled publishing for course: ${c.title} on ${scheduleDate}`);
        toast.success(`Course scheduled for publishing on ${scheduleDate}`);
        return { ...c, status: "Scheduled", publishDate: scheduleDate };
      }
      return c;
    }));
    setIsScheduling(false);
    setSelectedCourse(null);
  };

  // Action: Archive
  const handleArchive = (id: string) => {
    setCourses(prev => prev.map(c => {
      if (c.id === id) {
        logAuditAction(`Archived course: ${c.title} (${c.code})`);
        toast.success(`Course ${c.code} archived.`);
        return { ...c, status: "Archived" };
      }
      return c;
    }));
  };

  // Action: Restore
  const handleRestore = (id: string) => {
    setCourses(prev => prev.map(c => {
      if (c.id === id) {
        logAuditAction(`Restored course: ${c.title} (${c.code})`);
        toast.success(`Course ${c.code} restored to Draft.`);
        return { ...c, status: "Draft" };
      }
      return c;
    }));
  };

  // Action: Duplicate/Clone
  const handleDuplicate = (course: Course) => {
    const newCode = `${course.code}-DUP-${Math.floor(100 + Math.random() * 900)}`;
    const duplicate: Course = {
      ...course,
      id: `c-dup-${Date.now()}`,
      code: newCode,
      title: `${course.title} (Copy)`,
      status: "Draft",
      revenue: 0,
      completionRate: 0,
      revisionTimeline: [
        { date: new Date().toISOString().substring(0, 10), actor: "System Admin", change: "Cloned from " + course.code }
      ]
    };
    setCourses(prev => [duplicate, ...prev]);
    logAuditAction(`Duplicated course ${course.code} into ${newCode}`);
    toast.success(`Course duplicated successfully under code ${newCode}`);
  };

  // Action: Delete (with validation)
  const handleDelete = (course: Course) => {
    // SECURITY CONSTRAINT: Prevent deleting published courses with active students
    const activeStudentCount = students.filter(s => s.courseId === course.id).length;
    if (course.status === "Published" && activeStudentCount > 0) {
      toast.error(`Cannot delete Published course "${course.title}". It has ${activeStudentCount} active student enrollments.`);
      logAuditAction(`Blocked deletion of published course: ${course.code} due to active enrollments`);
      return;
    }

    if (!confirm(`Are you sure you want to permanently delete course "${course.title}" (${course.code})?`)) return;

    setCourses(prev => prev.filter(c => c.id !== course.id));
    logAuditAction(`Deleted course: ${course.title} (${course.code})`);
    toast.success("Course deleted permanently.");
  };

  return (
    <div className="space-y-6 text-left select-none">
      {/* Search and Filters Roster */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-4 rounded-xl border border-border shadow-soft">
        <div className="flex flex-1 max-w-md items-center gap-2 border border-border rounded-button bg-muted/15 px-3 py-1.5">
          <input
            type="text"
            placeholder="Search course title, code, tutor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none text-xs text-foreground focus:outline-none w-full font-semibold"
          />
        </div>
        <div className="flex gap-2">
          {["All", "Draft", "Under Review", "Approved", "Published", "Scheduled", "Archived"].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`text-[10px] uppercase tracking-wider font-extrabold px-3 py-1.5 rounded-button border ${
                statusFilter === st ? "bg-primary text-white border-primary" : "bg-card text-muted-foreground border-border hover:bg-muted/50"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Courses */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {filtered.map(course => {
          const courseStudents = students.filter(s => s.courseId === course.id);
          const healthColor = course.healthScore >= 90 ? "text-emerald-500 bg-emerald-500/10" : 
                             course.healthScore >= 75 ? "text-amber-500 bg-amber-500/10" : "text-rose-500 bg-rose-500/10";
          return (
            <Card key={course.id} className="p-6 border-border/80 bg-card/60 flex flex-col justify-between shadow-soft hover:shadow-md transition-shadow">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20 mr-2 uppercase tracking-widest">{course.code}</span>
                    <span className="text-[9px] font-extrabold text-muted-foreground uppercase">Version {course.version}</span>
                    <h3 className="text-sm font-extrabold font-heading text-foreground mt-2 hover:text-primary cursor-pointer" onClick={() => onOpenCourseDetails(course)}>{course.title}</h3>
                  </div>
                  <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded ${
                    course.status === "Published" ? "bg-emerald-500/10 text-emerald-600" :
                    course.status === "Draft" ? "bg-slate-500/10 text-slate-600" :
                    course.status === "Scheduled" ? "bg-cyan-500/10 text-cyan-600" :
                    course.status === "Archived" ? "bg-red-500/10 text-red-500" : "bg-amber-500/10 text-amber-600"
                  }`}>
                    {course.status}
                  </span>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-semibold border-y border-border/40 py-3.5 bg-muted/10 rounded-lg px-2">
                  <div>
                    <span className="text-[10px] text-muted-foreground block">Tutor</span>
                    <span className="text-foreground hover:text-primary cursor-pointer" onClick={() => onOpenTutor(course.tutorId)}>{course.tutorName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block">Students</span>
                    <span className="text-primary font-black">{courseStudents.length} enrolled</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block">Health Score</span>
                    <span className={`px-1.5 py-0.2 rounded font-black ${healthColor}`}>{course.healthScore}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block">Gross Revenue</span>
                    <span className="text-emerald-500 font-extrabold">₹{course.revenue.toLocaleString()}</span>
                  </div>
                </div>

                {/* Validation checklist mock */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-wider">Validation Checklist</span>
                  <div className="grid grid-cols-2 gap-1.5 text-[10px] font-extrabold text-muted-foreground">
                    <div className="flex items-center gap-1.5 text-emerald-500"><CheckCircle size={10} /> Syllabus Uploaded</div>
                    <div className="flex items-center gap-1.5 text-emerald-500"><CheckCircle size={10} /> Tutor Assigned</div>
                    <div className="flex items-center gap-1.5 text-emerald-500"><CheckCircle size={10} /> Assessment Setup</div>
                    <div className="flex items-center gap-1.5 text-amber-500"><AlertTriangle size={10} /> Dependency Checked</div>
                  </div>
                </div>

                {/* Scheduled Payout dates */}
                {course.status === "Scheduled" && course.publishDate && (
                  <div className="p-2.5 border border-cyan-500/20 bg-cyan-500/5 text-cyan-600 rounded-lg text-[10px] font-extrabold flex items-center gap-2">
                    <Calendar size={12} /> Scheduled publishing on: {course.publishDate}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 justify-end mt-5 pt-3 border-t border-border/20">
                {course.status === "Under Review" && (
                  <>
                    <Button onClick={() => handleApprove(course.id)} size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] h-8 uppercase tracking-wider">
                      Approve
                    </Button>
                    <Button onClick={() => handleReject(course.id)} size="sm" className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-[10px] h-8 uppercase tracking-wider">
                      Reject
                    </Button>
                  </>
                )}
                {course.status === "Approved" && (
                  <>
                    <Button onClick={() => handlePublish(course.id)} size="sm" className="bg-primary text-white font-extrabold text-[10px] h-8 uppercase tracking-wider">
                      Publish Live
                    </Button>
                    <Button onClick={() => { setSelectedCourse(course); setIsScheduling(true); }} size="sm" variant="outline" className="border-border bg-card font-extrabold text-[10px] h-8 uppercase tracking-wider">
                      Schedule
                    </Button>
                  </>
                )}
                {course.status === "Published" && (
                  <Button onClick={() => handleArchive(course.id)} size="sm" variant="outline" className="border-border bg-card hover:bg-red-500/10 hover:text-red-500 font-extrabold text-[10px] h-8 uppercase tracking-wider">
                    Archive Course
                  </Button>
                )}
                {course.status === "Archived" && (
                  <Button onClick={() => handleRestore(course.id)} size="sm" variant="outline" className="border-border bg-card font-extrabold text-[10px] h-8 uppercase tracking-wider">
                    Restore to Draft
                  </Button>
                )}
                <Button onClick={() => handleDuplicate(course)} size="sm" variant="outline" className="border-border bg-card font-extrabold text-[10px] h-8 uppercase tracking-wider">
                  Clone / Copy
                </Button>
                <button
                  onClick={() => handleDelete(course)}
                  className="p-2 border border-border/80 hover:bg-red-500/10 hover:text-red-500 rounded cursor-pointer"
                  title="Delete Course Template"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Scheduling Date Input dialog */}
      {isScheduling && selectedCourse && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <Card className="p-6 bg-card border border-border w-full max-w-sm text-left">
            <h3 className="text-xs font-heading font-extrabold uppercase text-foreground mb-4">Publishing Date for {selectedCourse.code}</h3>
            <form onSubmit={handleScheduleSubmit} className="space-y-4">
              <input
                type="date"
                required
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                className="h-10 w-full rounded border border-border bg-background px-3 focus:outline-none text-xs"
              />
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => { setIsScheduling(false); setSelectedCourse(null); }} size="sm">Cancel</Button>
                <Button type="submit" size="sm">Save Schedule</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
