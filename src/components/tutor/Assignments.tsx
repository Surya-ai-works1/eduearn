"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { FileText, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../../components/ui/button";
import { EmptyState } from "./EmptyState";
import type { StudentProgress } from "./types";

interface AssignmentsProps {
  students: StudentProgress[];
  activeGradingStudentId: string | null;
  setActiveGradingStudentId: (id: string | null) => void;
  gradingForm: { grade: string; feedback: string; score: string };
  setGradingForm: React.Dispatch<
    React.SetStateAction<{ grade: string; feedback: string; score: string }>
  >;
  handleSubmitGrade: (studentId: string) => void;
}

export const Assignments = React.memo(function Assignments({
  students,
  activeGradingStudentId,
  setActiveGradingStudentId,
  gradingForm,
  setGradingForm,
  handleSubmitGrade,
}: AssignmentsProps) {
  // Compute all three buckets in one pass
  const { submitted, graded, pending } = useMemo(() => {
    const s: StudentProgress[] = [];
    const g: StudentProgress[] = [];
    const p: StudentProgress[] = [];
    for (const st of students) {
      if (st.assignmentStatus === "Submitted") s.push(st);
      else if (st.assignmentStatus === "Graded") g.push(st);
      else p.push(st);
    }
    return { submitted: s, graded: g, pending: p };
  }, [students]);

  return (
    <motion.div
      key="tutor-assignments"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-heading font-extrabold text-foreground">Assignments</h2>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {submitted.length} pending review &bull; {graded.length} graded
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            label: "Awaiting Review",
            count: submitted.length,
            color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
          },
          {
            label: "Graded",
            count: graded.length,
            color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
          },
          {
            label: "Not Submitted",
            count: pending.length,
            color: "text-muted-foreground bg-muted border-border",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`card-surface p-3 rounded-card border text-center ${stat.color}`}
          >
            <p className="text-lg font-heading font-extrabold">{stat.count}</p>
            <p className="text-[9px] font-bold uppercase mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Needs Grading */}
      {submitted.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-heading font-extrabold uppercase tracking-wide text-foreground flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse inline-block" />
            Needs Grading ({submitted.length})
          </h3>
          {submitted.map((student) => (
            <div key={student.id} className="card-surface p-4 rounded-card shadow-soft space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                    {student.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground">{student.name}</h4>
                    <p className="text-[10px] text-muted-foreground">{student.courseTitle}</p>
                  </div>
                </div>
                <span className="text-[8px] font-extrabold uppercase px-2 py-0.5 rounded border bg-amber-500/10 border-amber-500/20 text-amber-500">
                  Submitted
                </span>
              </div>

              {student.submittedFile && (
                <div className="flex items-center gap-2 text-[10px] bg-muted/30 p-2 rounded border border-border/40">
                  <FileText size={12} className="text-primary" />
                  <span className="font-semibold text-foreground">{student.submittedFile}</span>
                </div>
              )}

              {activeGradingStudentId === student.id ? (
                <div className="space-y-2.5 border-t border-border/40 pt-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1 text-xs">
                      <label className="font-bold text-foreground">Grade *</label>
                      <select
                        value={gradingForm.grade}
                        onChange={(e) => setGradingForm((f) => ({ ...f, grade: e.target.value }))}
                        className="h-9 w-full rounded border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                      >
                        <option value="">Select grade...</option>
                        {["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "D", "F"].map((g) => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1 text-xs">
                      <label className="font-bold text-foreground">Score</label>
                      <input
                        type="text"
                        placeholder="e.g. 85/100"
                        value={gradingForm.score}
                        onChange={(e) => setGradingForm((f) => ({ ...f, score: e.target.value }))}
                        className="h-9 w-full rounded border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                      />
                    </div>
                  </div>
                  <div className="space-y-1 text-xs">
                    <label className="font-bold text-foreground">Feedback *</label>
                    <textarea
                      rows={3}
                      value={gradingForm.feedback}
                      onChange={(e) => setGradingForm((f) => ({ ...f, feedback: e.target.value }))}
                      placeholder="Write constructive feedback..."
                      className="w-full bg-card border border-border rounded p-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 text-xs font-semibold text-foreground resize-none"
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() => setActiveGradingStudentId(null)}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() => handleSubmitGrade(student.id)}
                    >
                      <CheckCircle size={12} className="mr-1" />
                      Submit Grade
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button
                    onClick={() => setActiveGradingStudentId(student.id)}
                    size="sm"
                    className="h-8 text-xs font-bold"
                  >
                    Grade Assignment
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => toast.info(`Downloading ${student.name}'s submission...`)}
                  >
                    Download
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Graded */}
      {graded.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-heading font-extrabold uppercase tracking-wide text-foreground flex items-center gap-2">
            <CheckCircle size={12} className="text-emerald-500" />
            Graded ({graded.length})
          </h3>
          {graded.map((student) => (
            <div
              key={student.id}
              className="card-surface p-4 rounded-card shadow-soft flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-xs shrink-0">
                  {student.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-foreground truncate">{student.name}</h4>
                  <p className="text-[10px] text-muted-foreground truncate">{student.courseTitle}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {student.grade && (
                  <span className="text-xs font-extrabold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    {student.grade}
                  </span>
                )}
                <span className="text-[8px] font-extrabold uppercase px-2 py-0.5 rounded border bg-emerald-500/10 border-emerald-500/20 text-emerald-500">
                  Graded
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {submitted.length === 0 && graded.length === 0 && (
        <EmptyState
          icon={<FileText size={28} />}
          title="No assignments to review"
          description="When students submit assignments, they will appear here for grading."
        />
      )}

      {/* All graded success state */}
      {submitted.length === 0 && graded.length > 0 && (
        <div className="border border-emerald-500/20 bg-emerald-500/5 rounded-card p-4 text-center">
          <CheckCircle size={20} className="text-emerald-500 mx-auto mb-2" />
          <p className="text-xs font-bold text-emerald-600">All assignments graded!</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Great work — all submissions have been reviewed.</p>
        </div>
      )}
    </motion.div>
  );
});
