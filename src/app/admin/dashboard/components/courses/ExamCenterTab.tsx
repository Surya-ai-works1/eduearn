"use client";

import React, { useState } from "react";
import { 
  Plus, Trash2, Calendar, Award, Sparkles, BrainCircuit, Play, CheckCircle, Database, HelpCircle, Eye, BarChart2
} from "lucide-react";
import { toast } from "sonner";
import { Card } from "../../../../../components/ui/card";
import { Button } from "../../../../../components/ui/button";
import { Exam, Question, Course, Student } from "./AcademicOperationsStore";

interface ExamCenterTabProps {
  courses: Course[];
  students: Student[];
  exams: Exam[];
  setExams: React.Dispatch<React.SetStateAction<Exam[]>>;
  questions: Question[];
  setQuestions: React.Dispatch<React.SetStateAction<Question[]>>;
  onOpenCourse: (id: string) => void;
  logAuditAction: (action: string) => void;
}

export default function ExamCenterTab({
  courses,
  students,
  exams,
  setExams,
  questions,
  setQuestions,
  onOpenCourse,
  logAuditAction
}: ExamCenterTabProps) {
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[0]?.id || "");
  
  // New Exam Form
  const [showExamForm, setShowExamForm] = useState(false);
  const [examTitle, setExamTitle] = useState("");
  const [examCategory, setExamCategory] = useState("Quiz");
  const [examTopic, setExamTopic] = useState("");
  const [examDifficulty, setExamDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");
  const [examMaxMarks, setExamMaxMarks] = useState(100);
  const [examDuration, setExamDuration] = useState(60);
  const [examNegMarking, setExamNegMarking] = useState(false);
  const [examAttempts, setExamAttempts] = useState(1);
  const [examWindowStart, setExamWindowStart] = useState("");
  const [examWindowEnd, setExamWindowEnd] = useState("");

  // Question Bank
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [qText, setQText] = useState("");
  const [qTopic, setQTopic] = useState("");
  const [qDifficulty, setQDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");
  const [qMarks, setQMarks] = useState(10);
  const [qTags, setQTags] = useState("");
  const [targetExamId, setTargetExamId] = useState("");

  // Sub-Tab Switcher
  const [activePane, setActivePane] = useState<"scheduler" | "bank" | "leaderboard">("scheduler");

  const courseExams = exams.filter(e => e.courseId === selectedCourseId);
  const courseQuestions = questions.filter(q => courseExams.some(e => e.id === q.examId));

  // Add Exam
  const handleCreateExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examTitle.trim() || !examTopic.trim()) return;

    // Security Constraint: Prevent duplicate Exam titles in same course
    if (exams.some(ex => ex.courseId === selectedCourseId && ex.title.toLowerCase() === examTitle.trim().toLowerCase())) {
      toast.error("An exam with this title already exists in the selected course.");
      return;
    }

    const newExam: Exam = {
      id: `e-${Date.now()}`,
      courseId: selectedCourseId,
      title: examTitle.trim(),
      category: examCategory,
      topic: examTopic.trim(),
      difficulty: examDifficulty,
      maxMarks: examMaxMarks,
      negativeMarking: examNegMarking,
      durationMinutes: examDuration,
      attemptLimit: examAttempts,
      examWindowStart: examWindowStart || new Date().toISOString().substring(0, 10),
      examWindowEnd: examWindowEnd || new Date().toISOString().substring(0, 10),
      published: false
    };

    setExams(prev => [newExam, ...prev]);
    logAuditAction(`Scheduled new exam: ${examTitle} for course ID ${selectedCourseId}`);
    toast.success("Exam scheduled successfully.");
    setShowExamForm(false);
  };

  // Add Question
  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qText.trim() || !targetExamId) return;

    const newQuestion: Question = {
      id: `q-${Date.now()}`,
      examId: targetExamId,
      category: "Coding",
      topic: qTopic.trim() || "General",
      text: qText.trim(),
      difficulty: qDifficulty,
      marks: qMarks,
      tags: qTags.split(",").map(t => t.trim()).filter(t => t !== "")
    };

    setQuestions(prev => [...prev, newQuestion]);
    logAuditAction(`Added question token to exam: ${targetExamId}`);
    toast.success("Question added to Question Bank.");
    setShowQuestionForm(false);
    setQText("");
    setQTags("");
  };

  // Publish Results
  const handleTogglePublish = (id: string) => {
    setExams(prev => prev.map(e => {
      if (e.id === id) {
        const nextState = !e.published;
        logAuditAction(`${nextState ? "Published" : "Retracted"} results publication for exam: ${e.title}`);
        toast.success(`Exam results ${nextState ? "published" : "retracted"}.`);
        return { ...e, published: nextState };
      }
      return e;
    }));
  };

  // Delete Exam
  const handleDeleteExam = (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete exam "${title}"?`)) return;
    setExams(prev => prev.filter(e => e.id !== id));
    logAuditAction(`Deleted scheduled exam: ${title}`);
    toast.success("Exam deleted successfully.");
  };

  // Auto Generate Questions
  const handleAutoGenerate = (examId: string) => {
    const defaultTexts = [
      "Select the correct syntax of component declaration.",
      "Explain the time complexity of the sorting method.",
      "Which command is used to install dependencies in npm?",
      "Design a custom middleware handler script."
    ];
    const generated: Question[] = Array.from({ length: 3 }).map((_, idx) => ({
      id: `q-auto-${Date.now()}-${idx}`,
      examId,
      category: "Auto",
      topic: "Core concepts",
      text: defaultTexts[idx % defaultTexts.length],
      difficulty: "Medium",
      marks: 10,
      tags: ["Auto-Generated", "Core"]
    }));

    setQuestions(prev => [...prev, ...generated]);
    logAuditAction(`Auto-generated 3 questions for exam ID ${examId}`);
    toast.success("Added 3 randomly generated questions to the exam bank.");
  };

  return (
    <div className="space-y-6 text-left select-none">
      {/* Selector header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-4 rounded-xl border border-border shadow-soft">
        <div className="flex items-center gap-3">
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="h-9 rounded border border-border bg-card px-3 focus:outline-none text-xs font-semibold"
          >
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.code} &mdash; {c.title}</option>
            ))}
          </select>

          <div className="border-l border-border/80 h-6 mx-2 hidden sm:block"></div>

          <div className="flex gap-1 bg-muted/40 p-1 rounded-button border border-border/60">
            {[
              { id: "scheduler", label: "Exam Scheduler" },
              { id: "bank", label: "Question Bank" },
              { id: "leaderboard", label: "Class Leaderboard" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActivePane(tab.id as any)}
                className={`text-[9.5px] uppercase tracking-wider font-extrabold px-3 py-1 rounded-button transition-all ${
                  activePane === tab.id ? "bg-primary text-white shadow-soft" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          {activePane === "scheduler" && (
            <Button onClick={() => setShowExamForm(true)} size="sm" className="gap-1 text-xs">
              <Plus size={13} /> Add Exam Session
            </Button>
          )}
          {activePane === "bank" && (
            <Button onClick={() => {
              if (courseExams.length === 0) {
                toast.error("Please schedule at least one exam before adding questions.");
                return;
              }
              setTargetExamId(courseExams[0].id);
              setShowQuestionForm(true);
            }} size="sm" className="gap-1 text-xs">
              <Plus size={13} /> Add Question
            </Button>
          )}
        </div>
      </div>

      {/* Pane 1: Scheduler */}
      {activePane === "scheduler" && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {courseExams.length === 0 ? (
            <div className="col-span-2 py-10 border border-dashed border-border rounded-xl text-center text-xs text-muted-foreground/60 font-semibold bg-muted/5 flex flex-col items-center justify-center gap-1.5">
              <Database size={24} className="text-muted-foreground/30" />
              <span>No exams scheduled for this course yet.</span>
            </div>
          ) : (
            courseExams.map(exam => {
              const examQCount = questions.filter(q => q.examId === exam.id).length;
              return (
                <Card key={exam.id} className="p-6 border-border/80 bg-card/60 flex flex-col justify-between shadow-soft">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[9px] font-extrabold uppercase bg-purple-500/10 text-purple-600 px-2 py-0.5 rounded mr-2">{exam.category}</span>
                        <span className="text-[9px] font-extrabold text-muted-foreground uppercase">{exam.difficulty}</span>
                        <h3 className="text-sm font-extrabold font-heading text-foreground mt-2">{exam.title}</h3>
                      </div>
                      <span className={`text-[9.5px] font-black uppercase ${exam.published ? "text-emerald-500" : "text-amber-500"}`}>
                        {exam.published ? "● Results Published" : "○ Draft State"}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-3 border-y border-border/40 py-3 bg-muted/10 px-2 rounded-lg text-xs font-semibold text-muted-foreground">
                      <div>
                        <span className="text-[9px] text-muted-foreground/60 block uppercase">Duration</span>
                        <span className="text-foreground font-bold">{exam.durationMinutes} minutes</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-muted-foreground/60 block uppercase">Max Marks</span>
                        <span className="text-foreground font-bold">{exam.maxMarks} Marks</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-muted-foreground/60 block uppercase">Questions</span>
                        <span className="text-primary font-black">{examQCount} loaded</span>
                      </div>
                    </div>

                    <div className="space-y-1 text-[11px] font-semibold text-muted-foreground">
                      <div className="flex justify-between">
                        <span>Window opens:</span>
                        <span className="text-foreground">{exam.examWindowStart}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Window closes:</span>
                        <span className="text-foreground">{exam.examWindowEnd}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Negative marking:</span>
                        <span className={exam.negativeMarking ? "text-rose-500" : "text-slate-500"}>
                          {exam.negativeMarking ? "Enabled" : "Disabled"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end mt-5 pt-3 border-t border-border/20">
                    <Button onClick={() => handleTogglePublish(exam.id)} size="sm" variant="outline" className="border-border bg-card text-[10px] font-extrabold h-8 uppercase tracking-wider">
                      {exam.published ? "Retract Results" : "Publish Results"}
                    </Button>
                    <Button onClick={() => handleAutoGenerate(exam.id)} size="sm" variant="outline" className="border-border bg-card text-[10px] font-extrabold h-8 uppercase tracking-wider">
                      Auto-Generate Qs
                    </Button>
                    <button
                      onClick={() => handleDeleteExam(exam.id, exam.title)}
                      className="p-2 border border-border/80 hover:bg-rose-500/10 hover:text-rose-500 rounded cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* Pane 2: Bank */}
      {activePane === "bank" && (
        <Card className="p-4 border-border bg-card overflow-x-auto shadow-soft">
          {courseQuestions.length === 0 ? (
            <div className="text-center py-10 text-xs text-muted-foreground/60 font-semibold">
              No questions found. Add questions or click auto-generate inside scheduler.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border/40 text-[10px] text-muted-foreground font-extrabold uppercase tracking-wider">
                  <th className="py-3 px-3">Question Text</th>
                  <th className="py-3 px-2 text-center">Topic</th>
                  <th className="py-3 px-2 text-center">Difficulty</th>
                  <th className="py-3 px-2 text-center">Marks</th>
                  <th className="py-3 px-2 text-center">Associated Tags</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20 text-xs font-semibold">
                {courseQuestions.map(q => (
                  <tr key={q.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-3 max-w-sm truncate text-foreground font-bold" title={q.text}>{q.text}</td>
                    <td className="py-3 px-2 text-center text-muted-foreground">{q.topic}</td>
                    <td className="py-3 px-2 text-center">
                      <span className={`px-1.5 py-0.5 rounded text-[8px] uppercase font-extrabold ${
                        q.difficulty === "Easy" ? "bg-emerald-500/10 text-emerald-600" :
                        q.difficulty === "Medium" ? "bg-amber-500/10 text-amber-600" : "bg-rose-500/10 text-rose-600"
                      }`}>
                        {q.difficulty}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center font-bold text-foreground">{q.marks} pts</td>
                    <td className="py-3 px-2 text-center">
                      <div className="flex flex-wrap gap-1 justify-center">
                        {q.tags.map(t => (
                          <span key={t} className="text-[8px] bg-muted border border-border/50 text-muted-foreground px-1 py-0.2 rounded font-extrabold">{t}</span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => {
                          setQuestions(prev => prev.filter(item => item.id !== q.id));
                          toast.success("Question deleted from bank.");
                        }}
                        className="p-1.5 border border-border/60 hover:bg-rose-500/10 hover:text-rose-500 rounded cursor-pointer"
                      >
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      )}

      {/* Pane 3: Leaderboard */}
      {activePane === "leaderboard" && (
        <Card className="p-4 border-border bg-card overflow-x-auto shadow-soft">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/40 text-[10px] text-muted-foreground font-extrabold uppercase tracking-wider">
                <th className="py-3 px-3 text-center w-12">Rank</th>
                <th className="py-3 px-3">Student Name</th>
                <th className="py-3 px-2 text-center">Batch Group</th>
                <th className="py-3 px-2 text-center">Exam Score Avg</th>
                <th className="py-3 px-2 text-center">Letter Grade</th>
                <th className="py-3 px-3 text-right">Platform Badges</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20 text-xs font-semibold">
              {students
                .filter(s => s.courseId === selectedCourseId)
                .map((student, index) => (
                  <tr key={student.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-3 text-center font-black text-primary">#{index + 1}</td>
                    <td className="py-3 px-3 text-foreground font-extrabold">{student.name}</td>
                    <td className="py-3 px-2 text-center text-muted-foreground">{student.batch}</td>
                    <td className="py-3 px-2 text-center font-bold text-foreground">{100 - index * 8}%</td>
                    <td className="py-3 px-2 text-center font-bold text-primary">{index === 0 ? "A" : index === 1 ? "B" : "C"}</td>
                    <td className="py-3 px-3 text-right">
                      {index === 0 && <span className="text-[8px] font-extrabold bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded uppercase tracking-wider">★ Top Scorer</span>}
                      {index === 1 && <span className="text-[8px] font-extrabold bg-blue-500/10 text-blue-500 border border-blue-500/20 px-2 py-0.5 rounded uppercase tracking-wider">⚡ Silver Badge</span>}
                      {index > 1 && <span className="text-muted-foreground/30 text-[9px] uppercase">Normal</span>}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* Exam Create Modal */}
      {showExamForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="p-6 bg-card border border-border w-full max-w-md text-left text-xs font-semibold">
            <h3 className="text-xs font-heading font-extrabold uppercase text-foreground mb-4">Add Scheduled Exam Session</h3>
            <form onSubmit={handleCreateExam} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1 col-span-2">
                  <label className="text-muted-foreground">Exam/Assessment Title</label>
                  <input
                    type="text"
                    required
                    value={examTitle}
                    onChange={(e) => setExamTitle(e.target.value)}
                    className="h-10 w-full rounded border border-border bg-background px-3 focus:outline-none text-xs"
                    placeholder="e.g. React Native Midterm Assessment"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-muted-foreground">Category</label>
                  <select
                    value={examCategory}
                    onChange={(e) => setExamCategory(e.target.value)}
                    className="h-10 w-full rounded border border-border bg-background px-3 focus:outline-none text-xs"
                  >
                    <option value="Quiz">Quiz</option>
                    <option value="Midterm">Midterm Exam</option>
                    <option value="Final Exam">Final Exam</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-muted-foreground">Topic</label>
                  <input
                    type="text"
                    required
                    value={examTopic}
                    onChange={(e) => setExamTopic(e.target.value)}
                    className="h-10 w-full rounded border border-border bg-background px-3 focus:outline-none text-xs"
                    placeholder="e.g. Navigation"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-muted-foreground">Duration (Mins)</label>
                  <input
                    type="number"
                    value={examDuration}
                    onChange={(e) => setExamDuration(Number(e.target.value))}
                    className="h-10 w-full rounded border border-border bg-background px-3 focus:outline-none text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-muted-foreground">Attempt Limit</label>
                  <input
                    type="number"
                    value={examAttempts}
                    onChange={(e) => setExamAttempts(Number(e.target.value))}
                    className="h-10 w-full rounded border border-border bg-background px-3 focus:outline-none text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-muted-foreground">Window Opens</label>
                  <input
                    type="date"
                    required
                    value={examWindowStart}
                    onChange={(e) => setExamWindowStart(e.target.value)}
                    className="h-10 w-full rounded border border-border bg-background px-3 focus:outline-none text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-muted-foreground">Window Closes</label>
                  <input
                    type="date"
                    required
                    value={examWindowEnd}
                    onChange={(e) => setExamWindowEnd(e.target.value)}
                    className="h-10 w-full rounded border border-border bg-background px-3 focus:outline-none text-xs"
                  />
                </div>
                <div className="flex items-center gap-2 col-span-2 p-2 border border-border/50 rounded bg-muted/10">
                  <input
                    type="checkbox"
                    id="cb-neg"
                    checked={examNegMarking}
                    onChange={(e) => setExamNegMarking(e.target.checked)}
                    className="h-4 w-4 cursor-pointer accent-primary"
                  />
                  <label htmlFor="cb-neg" className="cursor-pointer text-[10px]">Enable Negative Marking Penalties</label>
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-3">
                <Button type="button" variant="outline" onClick={() => setShowExamForm(false)} size="sm">Cancel</Button>
                <Button type="submit" size="sm">Save Exam</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Question Add Modal */}
      {showQuestionForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="p-6 bg-card border border-border w-full max-w-sm text-left text-xs font-semibold">
            <h3 className="text-xs font-heading font-extrabold uppercase text-foreground mb-4">Add Quiz Question</h3>
            <form onSubmit={handleAddQuestion} className="space-y-4">
              <div className="space-y-1">
                <label className="text-muted-foreground">Select Exam ID</label>
                <select
                  value={targetExamId}
                  onChange={(e) => setTargetExamId(e.target.value)}
                  className="h-10 w-full rounded border border-border bg-background px-3 focus:outline-none text-xs"
                >
                  {courseExams.map(ex => (
                    <option key={ex.id} value={ex.id}>{ex.title}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-muted-foreground">Question Text</label>
                <textarea
                  required
                  value={qText}
                  onChange={(e) => setQText(e.target.value)}
                  className="w-full text-xs p-3 bg-background border border-border rounded-xl resize-none focus:outline-none"
                  rows={3}
                  placeholder="Type question content..."
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-muted-foreground">Topic</label>
                  <input
                    type="text"
                    value={qTopic}
                    onChange={(e) => setQTopic(e.target.value)}
                    className="h-10 w-full rounded border border-border bg-background px-3 focus:outline-none text-xs"
                    placeholder="e.g. Hooks"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-muted-foreground">Marks</label>
                  <input
                    type="number"
                    value={qMarks}
                    onChange={(e) => setQMarks(Number(e.target.value))}
                    className="h-10 w-full rounded border border-border bg-background px-3 focus:outline-none text-xs"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-muted-foreground">Difficulty</label>
                <div className="flex gap-2">
                  {["Easy", "Medium", "Hard"].map(diff => (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => setQDifficulty(diff as any)}
                      className={`flex-1 h-9 rounded border text-[10px] font-extrabold uppercase ${
                        qDifficulty === diff ? "bg-primary text-white border-primary" : "bg-card text-muted-foreground border-border"
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-muted-foreground">Tags (comma separated)</label>
                <input
                  type="text"
                  value={qTags}
                  onChange={(e) => setQTags(e.target.value)}
                  className="h-10 w-full rounded border border-border bg-background px-3 focus:outline-none text-xs"
                  placeholder="e.g. React, Hooks, Router"
                />
              </div>
              <div className="flex gap-2 justify-end pt-3">
                <Button type="button" variant="outline" onClick={() => setShowQuestionForm(false)} size="sm">Cancel</Button>
                <Button type="submit" size="sm">Save Question</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
