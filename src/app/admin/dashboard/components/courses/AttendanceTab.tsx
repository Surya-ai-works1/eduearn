"use client";

import React, { useState } from "react";
import { 
  Download, Plus, Calendar, AlertTriangle, Check, UserPlus, Filter, Clock, CalendarDays
} from "lucide-react";
import { toast } from "sonner";
import { Card } from "../../../../../components/ui/card";
import { Button } from "../../../../../components/ui/button";
import { AttendanceRecord, Student, Course } from "./AcademicOperationsStore";

interface AttendanceTabProps {
  courses: Course[];
  students: Student[];
  attendance: AttendanceRecord[];
  setAttendance: React.Dispatch<React.SetStateAction<AttendanceRecord[]>>;
  onOpenStudent: (id: string) => void;
  logAuditAction: (action: string) => void;
}

export default function AttendanceTab({
  courses,
  students,
  attendance,
  setAttendance,
  onOpenStudent,
  logAuditAction
}: AttendanceTabProps) {
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[0]?.id || "");
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().substring(0, 10));
  const [search, setSearch] = useState("");

  const courseStudents = students.filter(s => s.courseId === selectedCourseId && s.name.toLowerCase().includes(search.toLowerCase()));

  const getStudentStatus = (studentId: string) => {
    const record = attendance.find(a => a.studentId === studentId && a.courseId === selectedCourseId && a.date === selectedDate);
    return record ? record.status : "Absent";
  };

  const getAttendanceRate = (studentId: string) => {
    const studentRecords = attendance.filter(a => a.studentId === studentId && a.courseId === selectedCourseId);
    if (studentRecords.length === 0) return 100;
    const present = studentRecords.filter(r => r.status === "Present" || r.status === "Late" || r.status === "Excused").length;
    return Math.round((present / studentRecords.length) * 100);
  };

  // Status Change
  const handleStatusChange = (studentId: string, newStatus: AttendanceRecord["status"]) => {
    setAttendance(prev => {
      const idx = prev.findIndex(a => a.studentId === studentId && a.courseId === selectedCourseId && a.date === selectedDate);
      const newRecord: AttendanceRecord = {
        studentId,
        courseId: selectedCourseId,
        date: selectedDate,
        status: newStatus,
        type: "Daily"
      };
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = newRecord;
        return updated;
      }
      return [...prev, newRecord];
    });
    logAuditAction(`Set attendance status of student ID ${studentId} to ${newStatus} for date ${selectedDate}`);
  };

  // Bulk Mark Present
  const handleBulkMarkPresent = () => {
    setAttendance(prev => {
      const updated = [...prev];
      courseStudents.forEach(student => {
        const idx = updated.findIndex(a => a.studentId === student.id && a.courseId === selectedCourseId && a.date === selectedDate);
        const newRecord: AttendanceRecord = {
          studentId: student.id,
          courseId: selectedCourseId,
          date: selectedDate,
          status: "Present",
          type: "Daily"
        };
        if (idx >= 0) {
          updated[idx] = newRecord;
        } else {
          updated.push(newRecord);
        }
      });
      return updated;
    });
    logAuditAction(`Bulk marked all enrolled students present for course ID ${selectedCourseId} on date ${selectedDate}`);
    toast.success(`Marked all ${courseStudents.length} students Present.`);
  };

  // Export Attendance CSV
  const handleExportCSV = () => {
    const headers = "Student ID,Student Name,Date,Status,Attendance %\n";
    const rows = courseStudents.map(s => {
      const status = getStudentStatus(s.id);
      const rate = getAttendanceRate(s.id);
      return `"${s.id}","${s.name}","${selectedDate}","${status}",${rate}`;
    }).join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("href", url);
    a.setAttribute("download", `eduearn_attendance_${selectedCourseId}_${selectedDate}.csv`);
    a.click();
    toast.success("Attendance report CSV file downloaded.");
  };

  // Calculate Course Average Attendance
  const courseRecords = attendance.filter(a => a.courseId === selectedCourseId);
  const totalSlots = courseRecords.length;
  const presentSlots = courseRecords.filter(r => r.status === "Present" || r.status === "Late" || r.status === "Excused").length;
  const avgAttRate = totalSlots > 0 ? Math.round((presentSlots / totalSlots) * 100) : 100;

  return (
    <div className="space-y-6 text-left select-none">
      {/* Top dashboard summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-5 border-border/80 bg-card/60 flex items-center justify-between shadow-soft">
          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-black tracking-wider block">Course Roster Size</span>
            <span className="text-2xl font-extrabold text-foreground mt-2 block">{courseStudents.length} Students</span>
          </div>
          <CalendarDays size={28} className="text-primary/30" />
        </Card>

        <Card className="p-5 border-border/80 bg-card/60 flex items-center justify-between shadow-soft">
          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-black tracking-wider block">Average Attendance Rate</span>
            <span className="text-2xl font-extrabold text-emerald-500 mt-2 block">{avgAttRate}% Present</span>
          </div>
          <Clock size={28} className="text-emerald-500/30" />
        </Card>

        <Card className="p-5 border-border/80 bg-card/60 flex items-center justify-between shadow-soft">
          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-black tracking-wider block">Absence Risk Warning Alerts</span>
            <span className="text-2xl font-extrabold text-rose-500 mt-2 block">
              {courseStudents.filter(s => getAttendanceRate(s.id) < 80).length} At Risk
            </span>
          </div>
          <AlertTriangle size={28} className="text-rose-500/30 animate-bounce" />
        </Card>
      </div>

      {/* Roster Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-4 rounded-xl border border-border shadow-soft">
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="h-9 rounded border border-border bg-card px-3 focus:outline-none text-xs font-semibold"
          >
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.code} &mdash; {c.title}</option>
            ))}
          </select>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="h-9 rounded border border-border bg-card px-3 focus:outline-none text-xs font-semibold"
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search student name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 max-w-xs rounded border border-border bg-card px-3 focus:outline-none text-xs font-semibold"
          />
          <Button onClick={handleBulkMarkPresent} size="sm" className="gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] h-9 uppercase tracking-wider">
            <Check size={12} /> Mark All Present
          </Button>
          <Button onClick={handleExportCSV} variant="outline" size="sm" className="gap-1 h-9 border-border bg-card">
            <Download size={13} /> Export Logs
          </Button>
        </div>
      </div>

      {/* Roster Grid */}
      <Card className="p-4 border-border bg-card overflow-x-auto shadow-soft">
        {courseStudents.length === 0 ? (
          <div className="text-center py-10 text-xs text-muted-foreground/60">
            No students enrolled.
          </div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-border/40 text-[10px] text-muted-foreground font-extrabold uppercase tracking-wider">
                <th className="py-3 px-3">Student Name</th>
                <th className="py-3 px-2 text-center">Enrolled Batch</th>
                <th className="py-3 px-2 text-center">Cumulative Attendance %</th>
                <th className="py-3 px-2 text-center">Alert State</th>
                <th className="py-3 px-3 text-center">Daily Status Selector ({selectedDate})</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20 text-xs font-semibold">
              {courseStudents.map(student => {
                const status = getStudentStatus(student.id);
                const rate = getAttendanceRate(student.id);
                return (
                  <tr key={student.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-3">
                      <span className="font-extrabold text-foreground hover:text-primary cursor-pointer block" onClick={() => onOpenStudent(student.id)}>{student.name}</span>
                      <span className="text-[9px] text-muted-foreground mt-0.5 block">{student.email}</span>
                    </td>
                    <td className="py-3 px-2 text-center text-muted-foreground">{student.batch}</td>
                    <td className="py-3 px-2 text-center font-black">
                      <span className={rate >= 80 ? "text-emerald-500" : rate >= 60 ? "text-amber-500" : "text-rose-500"}>
                        {rate}%
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center">
                      {rate < 80 ? (
                        <span className="inline-flex items-center gap-1 text-[8.5px] font-extrabold bg-rose-500/10 text-rose-500 px-2 py-0.5 rounded border border-rose-500/10 uppercase tracking-widest">
                          <AlertTriangle size={10} /> Critical Low
                        </span>
                      ) : (
                        <span className="text-muted-foreground/30 text-[9px] uppercase">Normal</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex justify-center gap-1">
                        {[
                          { val: "Present", label: "Present", color: "bg-emerald-600 text-white border-emerald-600" },
                          { val: "Late", label: "Late", color: "bg-amber-500 text-white border-amber-500" },
                          { val: "Excused", label: "Excused", color: "bg-blue-500 text-white border-blue-500" },
                          { val: "Absent", label: "Absent", color: "bg-rose-500 text-white border-rose-500" },
                          { val: "Holiday", label: "Holiday", color: "bg-slate-500 text-white border-slate-500" }
                        ].map(st => {
                          const isSel = status === st.val;
                          return (
                            <button
                              key={st.val}
                              onClick={() => handleStatusChange(student.id, st.val as any)}
                              className={`text-[9px] font-extrabold uppercase px-2.5 py-1 rounded border transition-all ${
                                isSel ? st.color : "bg-card text-muted-foreground border-border/80 hover:bg-muted/40"
                              }`}
                            >
                              {st.label}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
