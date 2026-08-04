"use client";

import React, { useState } from "react";
import { 
  Download, Upload, Edit, Eye, Check, X, Award, FileText, ChevronRight, Sparkles, Filter
} from "lucide-react";
import { toast } from "sonner";
import { Card } from "../../../../../components/ui/card";
import { Button } from "../../../../../components/ui/button";
import { GradeRecord, Student, Course, calculateGradeStatistics } from "./AcademicOperationsStore";

interface GradebookTabProps {
  courses: Course[];
  students: Student[];
  grades: GradeRecord[];
  setGrades: React.Dispatch<React.SetStateAction<GradeRecord[]>>;
  onOpenStudent: (id: string) => void;
  onOpenCourse: (id: string) => void;
  logAuditAction: (action: string) => void;
}

export default function GradebookTab({
  courses,
  students,
  grades,
  setGrades,
  onOpenStudent,
  onOpenCourse,
  logAuditAction
}: GradebookTabProps) {
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[0]?.id || "");
  const [search, setSearch] = useState("");
  const [editingGrade, setEditingGrade] = useState<GradeRecord | null>(null);
  const [overrideValue, setOverrideValue] = useState<string>("");
  const [remarksValue, setRemarksValue] = useState<string>("");
  const [selectedTranscript, setSelectedTranscript] = useState<{ student: Student; grade: GradeRecord } | null>(null);

  // Filter students enrolled in selected course
  const courseStudents = students.filter(s => s.courseId === selectedCourseId && s.name.toLowerCase().includes(search.toLowerCase()));

  const getStudentGrade = (studentId: string) => {
    return grades.find(g => g.studentId === studentId && g.courseId === selectedCourseId) || {
      studentId,
      courseId: selectedCourseId,
      assignmentScore: 0,
      quizScore: 0,
      projectScore: 0,
      midtermScore: 0,
      finalScore: 0,
      attendanceScore: 0,
      bonusPoints: 0,
      penaltyPoints: 0,
      remarks: "",
      gradeHistory: []
    };
  };

  // Grade Edit Handler
  const handleEditClick = (g: GradeRecord) => {
    setEditingGrade({ ...g });
    setOverrideValue(g.overrideScore !== undefined ? String(g.overrideScore) : "");
    setRemarksValue(g.remarks);
  };

  // Save Grade Changes
  const handleSaveGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGrade) return;

    const parsedOverride = overrideValue.trim() !== "" ? Number(overrideValue) : undefined;
    const finalGrade: GradeRecord = {
      ...editingGrade,
      overrideScore: parsedOverride,
      remarks: remarksValue.trim(),
      gradeHistory: [
        {
          date: new Date().toISOString().substring(0, 10),
          actor: "System Admin",
          oldGrade: String(getStudentGrade(editingGrade.studentId).overrideScore ?? "Auto"),
          newGrade: String(parsedOverride ?? "Auto"),
          reason: "Manual admin override adjust"
        },
        ...(getStudentGrade(editingGrade.studentId).gradeHistory || [])
      ]
    };

    setGrades(prev => {
      const idx = prev.findIndex(p => p.studentId === editingGrade.studentId && p.courseId === selectedCourseId);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = finalGrade;
        return updated;
      }
      return [...prev, finalGrade];
    });

    logAuditAction(`Updated grade values and overrides for student ID: ${editingGrade.studentId}`);
    toast.success("Student grades updated successfully.");
    setEditingGrade(null);
  };

  // Simulated Grade CSV Exporter
  const handleExportCSV = () => {
    const headers = "Student ID,Student Name,Assignments,Quizzes,Projects,Midterm,Final,Attendance,Bonus,Penalty,Override,Letter Grade,Status,CGPA\n";
    const rows = courseStudents.map(s => {
      const g = getStudentGrade(s.id);
      const stats = calculateGradeStatistics(g);
      return `"${s.id}","${s.name}",${g.assignmentScore},${g.quizScore},${g.projectScore},${g.midtermScore},${g.finalScore},${g.attendanceScore},${g.bonusPoints},${g.penaltyPoints},${g.overrideScore ?? ""},"${stats.letterGrade}","${stats.status}",${stats.cgpa}`;
    }).join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("href", url);
    a.setAttribute("download", `eduearn_gradebook_${selectedCourseId}.csv`);
    a.click();
    toast.success("CSV grade roster exported.");
  };

  // Simulated Grade CSV Importer
  const handleImportCSV = () => {
    toast.info("Simulated bulk CSV grade update template uploaded successfully.");
    // Randomize grades slightly for simulation
    setGrades(prev => prev.map(g => {
      if (g.courseId === selectedCourseId) {
        return {
          ...g,
          assignmentScore: Math.min(100, Math.max(0, g.assignmentScore + Math.floor(Math.random() * 10 - 5))),
          finalScore: Math.min(100, Math.max(0, g.finalScore + Math.floor(Math.random() * 10 - 5)))
        };
      }
      return g;
    }));
    logAuditAction(`Bulk imported grade roster for course ID: ${selectedCourseId}`);
    toast.success("Gradebook updated from CSV file values.");
  };

  return (
    <div className="space-y-6 text-left select-none">
      {/* Top filter bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-4 rounded-xl border border-border shadow-soft">
        <div className="flex items-center gap-3">
          <span className="text-xs font-black uppercase text-muted-foreground tracking-wider flex items-center gap-1.5"><Filter size={14} /> Course select</span>
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="h-9 rounded border border-border bg-card px-3 focus:outline-none text-xs font-semibold"
          >
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.code} &mdash; {c.title}</option>
            ))}
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
          <Button onClick={handleExportCSV} variant="outline" size="sm" className="gap-1 h-9 border-border bg-card">
            <Download size={13} /> Export Roster
          </Button>
          <Button onClick={handleImportCSV} variant="outline" size="sm" className="gap-1 h-9 border-border bg-card">
            <Upload size={13} /> Import Grades
          </Button>
        </div>
      </div>

      {/* Grade Roster Table */}
      <Card className="p-4 border-border bg-card overflow-x-auto shadow-soft">
        {courseStudents.length === 0 ? (
          <div className="text-center py-10 text-xs text-muted-foreground/60">
            No students enrolled in this course match your search.
          </div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-border/40 text-[10px] text-muted-foreground font-extrabold uppercase tracking-wider">
                <th className="py-3 px-3">Student Name</th>
                <th className="py-3 px-2 text-center">Assignments (20%)</th>
                <th className="py-3 px-2 text-center">Quizzes (15%)</th>
                <th className="py-3 px-2 text-center">Projects (25%)</th>
                <th className="py-3 px-2 text-center">Midterm (15%)</th>
                <th className="py-3 px-2 text-center">Final Exam (25%)</th>
                <th className="py-3 px-2 text-center">Att. (Score)</th>
                <th className="py-3 px-2 text-center">Bonus/Pen.</th>
                <th className="py-3 px-2 text-center">Final Score</th>
                <th className="py-3 px-2 text-center">Letter / CGPA</th>
                <th className="py-3 px-2 text-center">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20 text-xs font-semibold">
              {courseStudents.map(student => {
                const g = getStudentGrade(student.id);
                const stats = calculateGradeStatistics(g);
                return (
                  <tr key={student.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-3">
                      <span className="font-extrabold text-foreground hover:text-primary cursor-pointer block" onClick={() => onOpenStudent(student.id)}>{student.name}</span>
                      <span className="text-[9px] text-muted-foreground mt-0.5 block">{student.email}</span>
                    </td>
                    <td className="py-3 px-2 text-center text-foreground">{g.assignmentScore}</td>
                    <td className="py-3 px-2 text-center text-foreground">{g.quizScore}</td>
                    <td className="py-3 px-2 text-center text-foreground">{g.projectScore}</td>
                    <td className="py-3 px-2 text-center text-foreground">{g.midtermScore}</td>
                    <td className="py-3 px-2 text-center text-foreground">{g.finalScore}</td>
                    <td className="py-3 px-2 text-center text-foreground">{g.attendanceScore}</td>
                    <td className="py-3 px-2 text-center">
                      <span className="text-emerald-500">+{g.bonusPoints}</span>
                      <span className="text-rose-500">/-{g.penaltyPoints}</span>
                    </td>
                    <td className="py-3 px-2 text-center font-black">
                      {g.overrideScore !== undefined ? (
                        <span className="text-amber-500" title="Manual Admin Override Applied">{g.overrideScore}% *</span>
                      ) : (
                        <span className="text-foreground">{stats.percentage}%</span>
                      )}
                    </td>
                    <td className="py-3 px-2 text-center font-extrabold text-primary">
                      {stats.letterGrade} / {stats.cgpa.toFixed(1)}
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-extrabold ${
                        stats.status === "Pass" ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-500"
                      }`}>
                        {stats.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right space-x-1.5 whitespace-nowrap">
                      <Button variant="outline" size="sm" onClick={() => handleEditClick(g)} className="h-7 px-2 text-[9px] uppercase font-bold border-border bg-card">
                        <Edit size={10} className="mr-1" /> Override
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setSelectedTranscript({ student, grade: g })} className="h-7 px-2 text-[9px] uppercase font-bold border-border bg-card">
                        <Eye size={10} className="mr-1" /> Transcript
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>

      {/* Manual Grade Override Modal */}
      {editingGrade && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <Card className="p-6 bg-card border border-border w-full max-w-sm text-left">
            <h3 className="text-xs font-heading font-extrabold uppercase text-foreground mb-4">Manual Grade Override Adjust</h3>
            <form onSubmit={handleSaveGrade} className="space-y-4 text-xs font-semibold">
              <div className="space-y-1">
                <label className="text-muted-foreground">Override Final Percentage Score (Leave blank to remove override)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={overrideValue}
                  onChange={(e) => setOverrideValue(e.target.value)}
                  className="h-10 w-full rounded border border-border bg-background px-3 focus:outline-none text-xs"
                  placeholder="e.g. 85"
                />
              </div>
              <div className="space-y-1">
                <label className="text-muted-foreground">Audit remarks / reason for change</label>
                <input
                  type="text"
                  required
                  value={remarksValue}
                  onChange={(e) => setRemarksValue(e.target.value)}
                  className="h-10 w-full rounded border border-border bg-background px-3 focus:outline-none text-xs"
                  placeholder="e.g. Approved medical excuse midterm makeup"
                />
              </div>
              <div className="flex gap-2 justify-end pt-3">
                <Button type="button" variant="outline" onClick={() => setEditingGrade(null)} size="sm">Cancel</Button>
                <Button type="submit" size="sm">Save Grades</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Transcript Preview Modal */}
      {selectedTranscript && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="p-6 bg-card border border-border w-full max-w-lg text-left shadow-2xl relative">
            <button
              onClick={() => setSelectedTranscript(null)}
              className="absolute top-4 right-4 p-1 rounded-xl hover:bg-muted text-muted-foreground"
            >
              <X size={16} />
            </button>
            <div className="border-b border-border/40 pb-4 mb-4 select-none">
              <span className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-1"><Award size={12} /> Verifiable Academic Transcript</span>
              <h2 className="text-lg font-heading font-extrabold text-foreground mt-2">{selectedTranscript.student.name}</h2>
              <p className="text-xs text-muted-foreground">{selectedTranscript.student.email} · Enrolled Course: {courses.find(c => c.id === selectedCourseId)?.title}</p>
            </div>
            
            <div className="space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-2 gap-4 bg-muted/20 p-4 rounded-xl border border-border/50">
                <div>
                  <span className="text-muted-foreground block text-[10px]">Calculated Grade Summary</span>
                  <span className="text-foreground text-sm font-black">
                    {calculateGradeStatistics(selectedTranscript.grade).percentage}% ({calculateGradeStatistics(selectedTranscript.grade).letterGrade})
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Status / GPA</span>
                  <span className="text-foreground text-sm font-black">
                    {calculateGradeStatistics(selectedTranscript.grade).status} / {calculateGradeStatistics(selectedTranscript.grade).cgpa.toFixed(1)} CGPA
                  </span>
                </div>
              </div>

              <div className="space-y-2 border-t border-border/40 pt-3">
                <span className="text-[10px] font-black uppercase text-muted-foreground tracking-wider block">Detailed Assessment Breakdown</span>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[11px] border-b border-border/10 pb-1">
                    <span className="text-muted-foreground">Assignments Weight (20%)</span>
                    <span className="text-foreground font-bold">{selectedTranscript.grade.assignmentScore}/100</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] border-b border-border/10 pb-1">
                    <span className="text-muted-foreground">Quizzes Weight (15%)</span>
                    <span className="text-foreground font-bold">{selectedTranscript.grade.quizScore}/100</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] border-b border-border/10 pb-1">
                    <span className="text-muted-foreground">Projects Weight (25%)</span>
                    <span className="text-foreground font-bold">{selectedTranscript.grade.projectScore}/100</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] border-b border-border/10 pb-1">
                    <span className="text-muted-foreground">Midterm Exam (15%)</span>
                    <span className="text-foreground font-bold">{selectedTranscript.grade.midtermScore}/100</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] border-b border-border/10 pb-1">
                    <span className="text-muted-foreground">Final Exam (25%)</span>
                    <span className="text-foreground font-bold">{selectedTranscript.grade.finalScore}/100</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] border-b border-border/10 pb-1">
                    <span className="text-muted-foreground">Attendance Check (Score)</span>
                    <span className="text-foreground font-bold">{selectedTranscript.grade.attendanceScore}/100</span>
                  </div>
                </div>
              </div>

              {selectedTranscript.grade.gradeHistory && selectedTranscript.grade.gradeHistory.length > 0 && (
                <div className="space-y-2 border-t border-border/40 pt-3">
                  <span className="text-[10px] font-black uppercase text-muted-foreground tracking-wider block">Grade Revision History Logs</span>
                  <div className="space-y-1.5 max-h-[80px] overflow-y-auto pr-1">
                    {selectedTranscript.grade.gradeHistory.map((h, i) => (
                      <div key={i} className="text-[10px] text-muted-foreground bg-muted/10 p-2 border border-border/30 rounded flex justify-between gap-2">
                        <span>{h.date}: {h.actor} modified ({h.oldGrade} &rarr; {h.newGrade})</span>
                        <span className="font-extrabold italic truncate">{h.reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
