"use client";

import React, { useState } from "react";
import { 
  AlertTriangle, CheckCircle, ShieldAlert, Sparkles, Filter, ChevronRight, UserCheck, HelpCircle, Eye, PlusCircle
} from "lucide-react";
import { toast } from "sonner";
import { Card } from "../../../../../components/ui/card";
import { Button } from "../../../../../components/ui/button";
import { StudentRiskSummary, Student, Course, GradeRecord, AttendanceRecord, calculateGradeStatistics, recalculateRisk } from "./AcademicOperationsStore";

interface StudentSuccessTabProps {
  courses: Course[];
  students: Student[];
  grades: GradeRecord[];
  attendance: AttendanceRecord[];
  risks: StudentRiskSummary[];
  setRisks: React.Dispatch<React.SetStateAction<StudentRiskSummary[]>>;
  onOpenStudent: (id: string) => void;
  onOpenTutor: (id: string) => void;
  logAuditAction: (action: string) => void;
}

export default function StudentSuccessTab({
  courses,
  students,
  grades,
  attendance,
  risks,
  setRisks,
  onOpenStudent,
  onOpenTutor,
  logAuditAction
}: StudentSuccessTabProps) {
  const [selectedCourseId, setSelectedCourseId] = useState<string>("All");
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<string>("All");
  const [search, setSearch] = useState("");

  const [interventionStudent, setInterventionStudent] = useState<Student | null>(null);
  const [notesText, setNotesText] = useState("");

  const getStudentRisk = (studentId: string, courseId: string) => {
    const r = risks.find(item => item.studentId === studentId && item.courseId === courseId);
    if (r) return r;
    // Fallback recalculate
    return recalculateRisk(studentId, courseId, grades, attendance);
  };

  const getStudentGrade = (studentId: string, courseId: string) => {
    return grades.find(g => g.studentId === studentId && g.courseId === courseId);
  };

  const getStudentAttendanceRate = (studentId: string, courseId: string) => {
    const courseAtt = attendance.filter(a => a.studentId === studentId && a.courseId === courseId);
    if (courseAtt.length === 0) return 100;
    const present = courseAtt.filter(r => r.status === "Present" || r.status === "Late" || r.status === "Excused").length;
    return Math.round((present / courseAtt.length) * 100);
  };

  const handleInterventionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!interventionStudent || !notesText.trim()) return;

    setRisks(prev => {
      const idx = prev.findIndex(r => r.studentId === interventionStudent.id && r.courseId === interventionStudent.courseId);
      const newHistory = {
        date: new Date().toISOString().substring(0, 10),
        notes: notesText.trim(),
        tutor: "Admin Counselor"
      };

      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          interventionHistory: [newHistory, ...(updated[idx].interventionHistory || [])]
        };
        return updated;
      } else {
        const base = recalculateRisk(interventionStudent.id, interventionStudent.courseId, grades, attendance);
        return [...prev, {
          ...base,
          interventionHistory: [newHistory]
        }];
      }
    });

    logAuditAction(`Recorded counselor intervention log note for student: ${interventionStudent.name}`);
    toast.success("Intervention counseling notes saved.");
    setNotesText("");
    setInterventionStudent(null);
  };

  // Filter lists
  const filtered = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(search.toLowerCase()) || 
                          student.email.toLowerCase().includes(search.toLowerCase());
    const matchesCourse = selectedCourseId === "All" || student.courseId === selectedCourseId;
    
    const risk = getStudentRisk(student.id, student.courseId);
    const matchesRisk = selectedRiskFilter === "All" || risk.dropoutPrediction === selectedRiskFilter;

    return matchesSearch && matchesCourse && matchesRisk;
  });

  return (
    <div className="space-y-6 text-left select-none">
      {/* Risk Alert Counter Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "High Risk Students", val: String(students.filter(s => getStudentRisk(s.id, s.courseId).dropoutPrediction === "High").length), sub: "Requires immediate intervention", color: "text-rose-500 bg-rose-500/10 border-rose-500/15" },
          { label: "Medium Risk Candidates", val: String(students.filter(s => getStudentRisk(s.id, s.courseId).dropoutPrediction === "Medium").length), sub: "Needs regular review logs", color: "text-amber-500 bg-amber-500/10 border-amber-500/15" },
          { label: "Perfect Standings", val: String(students.filter(s => getStudentRisk(s.id, s.courseId).dropoutPrediction === "Low").length), sub: "Good grades & attendance", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/15" },
          { label: "Eligible for Certs", val: String(students.filter(s => getStudentRisk(s.id, s.courseId).certificateEligibility).length), sub: "Passed curriculum metrics", color: "text-primary bg-primary/10 border-primary/15" }
        ].map((kpi, idx) => (
          <Card key={idx} className={`p-5 rounded-xl border flex flex-col justify-between shadow-soft ${kpi.color}`}>
            <span className="text-[10px] uppercase font-black tracking-wider opacity-80">{kpi.label}</span>
            <span className="text-2xl font-black mt-3 block">{kpi.val}</span>
            <span className="text-[9.5px] font-extrabold mt-1 block opacity-70">{kpi.sub}</span>
          </Card>
        ))}
      </div>

      {/* Roster Filters bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-4 rounded-xl border border-border shadow-soft">
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="h-9 rounded border border-border bg-card px-3 focus:outline-none text-xs font-semibold"
          >
            <option value="All">All Courses</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.code}</option>
            ))}
          </select>

          <select
            value={selectedRiskFilter}
            onChange={(e) => setSelectedRiskFilter(e.target.value)}
            className="h-9 rounded border border-border bg-card px-3 focus:outline-none text-xs font-semibold"
          >
            <option value="All">All Risk Levels</option>
            <option value="High">High Dropout Risk</option>
            <option value="Medium">Medium Warning</option>
            <option value="Low">Low Risk</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search student name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 max-w-xs rounded border border-border bg-card px-3 focus:outline-none text-xs font-semibold"
          />
        </div>
      </div>

      {/* Roster Grid */}
      <Card className="p-4 border-border bg-card overflow-x-auto shadow-soft">
        {filtered.length === 0 ? (
          <div className="text-center py-10 text-xs text-muted-foreground/60">
            No at-risk students match selection.
          </div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-border/40 text-[10px] text-muted-foreground font-extrabold uppercase tracking-wider">
                <th className="py-3 px-3">Student Name</th>
                <th className="py-3 px-2 text-center">Course Code</th>
                <th className="py-3 px-2 text-center">Attendance Rate</th>
                <th className="py-3 px-2 text-center">Assignment State</th>
                <th className="py-3 px-2 text-center">Dropout Forecast</th>
                <th className="py-3 px-2 text-center">Assigned Mentor</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20 text-xs font-semibold">
              {filtered.map(student => {
                const risk = getStudentRisk(student.id, student.courseId);
                const attRate = getStudentAttendanceRate(student.id, student.courseId);
                const g = getStudentGrade(student.id, student.courseId);
                const gradeStr = g ? `${calculateGradeStatistics(g).percentage}%` : "No Grade";

                return (
                  <tr key={student.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-3">
                      <span className="font-extrabold text-foreground hover:text-primary cursor-pointer block" onClick={() => onOpenStudent(student.id)}>{student.name}</span>
                      <span className="text-[9px] text-muted-foreground mt-0.5 block">{student.email}</span>
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span className="text-[9.5px] font-black uppercase text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                        {courses.find(c => c.id === student.courseId)?.code}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span className={`font-black ${attRate >= 80 ? "text-emerald-500" : attRate >= 60 ? "text-amber-500" : "text-rose-500"}`}>
                        {attRate}%
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center font-bold text-foreground">
                      Average: {gradeStr}
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-extrabold ${
                        risk.dropoutPrediction === "High" ? "bg-rose-500/10 text-rose-500 border border-rose-500/20" :
                        risk.dropoutPrediction === "Medium" ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" :
                        "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                      }`}>
                        {risk.dropoutPrediction}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center text-muted-foreground">{student.mentorName}</td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" size="sm" onClick={() => setInterventionStudent(student)} className="h-7 px-2 text-[9px] uppercase font-bold border-border bg-card">
                          <PlusCircle size={11} className="mr-1" /> Log Intervention
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>

      {/* Intervention Notes Dialog */}
      {interventionStudent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="p-6 bg-card border border-border w-full max-w-sm text-left text-xs font-semibold">
            <h3 className="text-xs font-heading font-extrabold uppercase text-foreground mb-4">Counselor Intervention Logs</h3>
            <form onSubmit={handleInterventionSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-muted-foreground">Add details of discussion / actions taken for {interventionStudent.name}</label>
                <textarea
                  required
                  value={notesText}
                  onChange={(e) => setNotesText(e.target.value)}
                  className="w-full text-xs p-3 bg-background border border-border rounded-xl resize-none focus:outline-none text-foreground"
                  rows={4}
                  placeholder="e.g. Checked-in via phone. Scheduled weekly review tasks."
                />
              </div>
              <div className="flex gap-2 justify-end pt-3">
                <Button type="button" variant="outline" onClick={() => setInterventionStudent(null)} size="sm">Cancel</Button>
                <Button type="submit" size="sm">Save Log</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
