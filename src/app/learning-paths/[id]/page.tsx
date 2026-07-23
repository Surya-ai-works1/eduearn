"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Container } from "../../../components/layout/Container";
import { PageWrapper } from "../../../components/layout/PageWrapper";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Divider } from "../../../components/ui/divider";
import { toast } from "sonner";
import {
  BookOpen,
  Award,
  Clock,
  ArrowRight,
  ArrowLeft,
  Play,
  FileText,
  CheckCircle,
  HelpCircle,
  QrCode,
  Sparkles,
} from "lucide-react";

interface PathDetails {
  id: string;
  title: string;
  desc: string;
  duration: string;
  stepsCount: number;
  skills: string[];
}

export default function InteractivePathPage() {
  const params = useParams();
  const router = useRouter();
  const id = (params?.id as string) || "intro";

  const pathInfo = useMemo<PathDetails>(() => {
    const cleanTitle = id
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

    return {
      id,
      title: cleanTitle.includes("Fullstack") ? "Full-Stack Web Developer Path" : `${cleanTitle} Learning Pathway`,
      desc: `A guided step-by-step master roadmap built by verified student mentors to master ${cleanTitle} from scratch.`,
      duration: "4 Weeks",
      stepsCount: 3,
      skills: [cleanTitle, "Best Practices", "Portfolio Project", "Evaluation Checkpoint"],
    };
  }, [id]);

  const [step, setStep] = useState(0); // 0: Overview, 1: Step 1 (Video & Notes), 2: Step 2 (Quiz), 3: Step 3 (Project), 4: Certificate

  // Quiz state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizScore, setQuizScore] = useState<number | null>(null);

  // Project state
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [projectSubmitted, setProjectSubmitted] = useState(false);

  const quizQuestions = [
    {
      q: `What is the primary best practice when starting with ${pathInfo.title}?`,
      options: ["Build small prototypes first", "Read the entire specification book", "Hire an external agency", "Copy-paste from production templates"],
      correct: 0,
    },
    {
      q: `How do you structure code or files for scale in this context?`,
      options: ["Put all logic in a single file", "Use folders by technical responsibility or features", "Store code in LocalStorage databases", "Write code in plain text documentation"],
      correct: 1,
    },
  ];

  const handleSelectAnswer = (qIdx: number, oIdx: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [qIdx]: oIdx }));
  };

  const handleSubmitQuiz = () => {
    if (Object.keys(selectedAnswers).length < quizQuestions.length) {
      toast.error("Please answer all questions before submitting.");
      return;
    }
    let score = 0;
    quizQuestions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correct) score++;
    });
    setQuizScore(score);
    if (score >= 1) {
      toast.success("Congratulations! You passed the quiz challenge.");
    } else {
      toast.error("You did not pass the quiz checkpoint. Try again!");
    }
  };

  const handleSimulateUpload = () => {
    setUploading(true);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploading(false);
          setProjectSubmitted(true);
          toast.success("Graduation Project submitted successfully!");
          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };

  return (
    <PageWrapper>
      {/* Header Banner */}
      <section className="w-full py-12 bg-muted/20 border-b border-border/40 text-left select-none">
        <Container className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-semibold">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <span>/</span>
            <Link href="/learning-paths" className="hover:text-foreground">Paths</Link>
            <span>/</span>
            <span className="text-foreground truncate">{pathInfo.title}</span>
          </div>

          <div className="flex justify-between items-center gap-4 flex-wrap mt-1">
            <div className="flex flex-col gap-2">
              <span className="text-[9px] uppercase tracking-wider font-extrabold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full w-fit">
                Step-by-Step Guided Pathway
              </span>
              <h1 className="text-3xl font-heading font-extrabold text-foreground tracking-tight">
                {pathInfo.title}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              {[0, 1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border transition-colors ${
                    step === s
                      ? "bg-primary border-primary text-white"
                      : step > s
                      ? "bg-primary/20 border-primary text-primary"
                      : "bg-muted border-border text-muted-foreground"
                  }`}
                >
                  {s + 1}
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* Main Wizard Area */}
      <section className="w-full py-12 select-none text-left min-h-[50vh]">
        <Container className="max-w-3xl">
          {step === 0 && (
            <Card variant="glass" className="p-6 border-border flex flex-col gap-6">
              <div className="space-y-2">
                <h2 className="text-xl font-heading font-extrabold text-foreground">Roadmap Overview</h2>
                <p className="text-xs text-muted-foreground leading-relaxed">{pathInfo.desc}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-muted-foreground">
                <div className="flex items-center gap-2 p-3 bg-muted/20 border border-border/40 rounded-xl">
                  <Clock size={16} className="text-primary" />
                  <span>Duration: {pathInfo.duration}</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-muted/20 border border-border/40 rounded-xl">
                  <BookOpen size={16} className="text-primary" />
                  <span>Steps Count: {pathInfo.stepsCount} Modules</span>
                </div>
              </div>

              <div className="space-y-3">
                <span className="text-[10px] font-bold text-foreground uppercase tracking-wider block">Target Skills</span>
                <div className="flex flex-wrap gap-2">
                  {pathInfo.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="py-1 px-3">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              <Button onClick={() => setStep(1)} className="w-full mt-4 flex items-center justify-center gap-2">
                Start Learning Pathway <ArrowRight size={14} />
              </Button>
            </Card>
          )}

          {step === 1 && (
            <Card variant="glass" className="p-6 border-border flex flex-col gap-6">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold text-primary uppercase tracking-wider">Step 1 of 3</span>
                <h2 className="text-xl font-heading font-extrabold text-foreground">Theoretical & Notes Checkpoint</h2>
                <p className="text-xs text-muted-foreground">
                  Watch the concept introduction and download notes PDF files to align with the core syllabus context.
                </p>
              </div>

              {/* Mock Video player container */}
              <div className="aspect-video w-full bg-slate-900 border border-border/60 rounded-xl flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-hero-gradient opacity-10" />
                <Button variant="primary" className="rounded-full w-14 h-14 flex items-center justify-center">
                  <Play size={22} className="fill-current ml-1" />
                </Button>
                <span className="absolute bottom-3 left-3 bg-black/60 px-2 py-0.5 rounded text-[8px] font-mono text-white/90">
                  Concept introduction (4:20 mins)
                </span>
              </div>

              <div className="p-4 bg-muted/20 border border-border/40 rounded-xl flex items-center justify-between text-xs gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center text-primary">
                    <FileText size={16} />
                  </div>
                  <div>
                    <span className="font-bold block text-foreground">Syllabus Study Notes.pdf</span>
                    <span className="text-[9px] text-muted-foreground font-semibold">Format: PDF · Size: 2.4 MB</span>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => toast.success("Study Notes PDF downloaded successfully!")}>
                  Download PDF
                </Button>
              </div>

              <div className="flex justify-between mt-4">
                <Button variant="ghost" onClick={() => setStep(0)} className="flex items-center gap-1">
                  <ArrowLeft size={13} /> Back
                </Button>
                <Button onClick={() => setStep(2)} className="flex items-center gap-1">
                  Next: Take Quiz Checkpoint <ArrowRight size={13} />
                </Button>
              </div>
            </Card>
          )}

          {step === 2 && (
            <Card variant="glass" className="p-6 border-border flex flex-col gap-6">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold text-primary uppercase tracking-wider">Step 2 of 3</span>
                <h2 className="text-xl font-heading font-extrabold text-foreground">Quiz Checkpoint</h2>
                <p className="text-xs text-muted-foreground">
                  Score above 70% to pass this checkpoint. Answer all questions below.
                </p>
              </div>

              <div className="space-y-5 text-xs">
                {quizQuestions.map((q, qIdx) => (
                  <div key={qIdx} className="space-y-3 p-4 bg-muted/10 border border-border/40 rounded-xl">
                    <span className="font-bold text-foreground block">
                      {qIdx + 1}. {q.q}
                    </span>
                    <div className="grid grid-cols-1 gap-2">
                      {q.options.map((opt, oIdx) => {
                        const isSelected = selectedAnswers[qIdx] === oIdx;
                        return (
                          <div
                            key={oIdx}
                            onClick={() => handleSelectAnswer(qIdx, oIdx)}
                            className={`p-3 rounded-lg border cursor-pointer font-semibold transition-all ${
                              isSelected
                                ? "border-primary bg-primary/5 text-foreground"
                                : "border-border hover:border-slate-400 text-muted-foreground"
                            }`}
                          >
                            {opt}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {quizScore === null ? (
                <Button onClick={handleSubmitQuiz} className="w-full mt-2">
                  Submit Quiz Responses
                </Button>
              ) : (
                <div className="p-4 bg-muted/20 border border-border/40 rounded-xl text-center space-y-3">
                  <span className="text-sm font-bold block text-foreground">
                    Quiz Score: {quizScore} / {quizQuestions.length}
                  </span>
                  {quizScore >= 1 ? (
                    <span className="text-xs text-emerald-500 font-extrabold block">✓ Verification Checkpoint Passed!</span>
                  ) : (
                    <div className="space-y-2">
                      <span className="text-xs text-rose-500 font-extrabold block">✗ Verification Checkpoint Failed.</span>
                      <Button variant="outline" size="sm" onClick={() => { setSelectedAnswers({}); setQuizScore(null); }}>
                        Retry Quiz
                      </Button>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-between mt-4">
                <Button variant="ghost" onClick={() => setStep(1)} className="flex items-center gap-1">
                  <ArrowLeft size={13} /> Back
                </Button>
                <Button
                  disabled={quizScore === null || quizScore < 1}
                  onClick={() => setStep(3)}
                  className="flex items-center gap-1"
                >
                  Next: Submit Project <ArrowRight size={13} />
                </Button>
              </div>
            </Card>
          )}

          {step === 3 && (
            <Card variant="glass" className="p-6 border-border flex flex-col gap-6">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold text-primary uppercase tracking-wider">Step 3 of 3</span>
                <h2 className="text-xl font-heading font-extrabold text-foreground">Graduation Capstone Project</h2>
                <p className="text-xs text-muted-foreground">
                  Submit your sandbox project zip archive details for AI verification review.
                </p>
              </div>

              <div className="border border-dashed border-border/80 rounded-xl p-8 text-center flex flex-col items-center justify-center gap-4 bg-muted/5 hover:bg-muted/10 transition-colors select-none">
                <span className="text-3xl">📁</span>
                <div className="space-y-1">
                  <span className="text-xs font-bold text-foreground block">Drag and drop your sandbox project here</span>
                  <span className="text-[9px] text-muted-foreground font-semibold">Supports .zip, .rar archives up to 10MB</span>
                </div>
                <Button variant="outline" size="sm" disabled={uploading} onClick={handleSimulateUpload}>
                  {uploading ? "Uploading Archive..." : "Select File"}
                </Button>
              </div>

              {uploading && (
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between font-semibold text-muted-foreground">
                    <span>Uploading submission archive...</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )}

              <div className="flex justify-between mt-4">
                <Button variant="ghost" onClick={() => setStep(2)} className="flex items-center gap-1">
                  <ArrowLeft size={13} /> Back
                </Button>
                <Button
                  disabled={!projectSubmitted}
                  onClick={() => setStep(4)}
                  className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600"
                >
                  Claim Verified Certificate <Award size={13} />
                </Button>
              </div>
            </Card>
          )}

          {step === 4 && (
            <Card variant="glass" className="p-6 border-border flex flex-col gap-6 text-center">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                  <Award size={36} className="animate-bounce" />
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-heading font-black text-foreground">Syllabus Pathway Completed!</h2>
                <p className="text-xs text-muted-foreground leading-relaxed max-w-md mx-auto">
                  You have successfully completed all checkpoints, passed the conceptual quiz, and submitted the graduation portfolio.
                </p>
              </div>

              {/* Dynamic Certificate Preview Card */}
              <div className="w-full max-w-md mx-auto bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between shadow-lg select-none text-center relative overflow-hidden aspect-[4/3] mt-2">
                <div className="absolute inset-0 bg-hero-gradient opacity-[0.03] pointer-events-none" />
                <div className="text-[8px] uppercase tracking-wider font-extrabold text-primary">EduEarn Verified Certification</div>
                
                <div className="space-y-1 mt-6">
                  <span className="text-[10px] text-muted-foreground font-light block">This is to certify that</span>
                  <div className="text-sm font-black text-foreground">Student Learner</div>
                  <div className="text-[8px] text-muted-foreground font-light max-w-[200px] mx-auto leading-normal">
                    has successfully completed all structural modules for the <strong className="text-foreground">{pathInfo.title}</strong>.
                  </div>
                </div>

                <div className="flex justify-between items-end border-t border-border/40 pt-3 mt-6">
                  <div className="text-left text-[7px] text-muted-foreground font-semibold">
                    <div>Verification ID</div>
                    <div className="text-[8px] font-mono text-foreground font-bold uppercase">ES-{id.substring(0, 6).toUpperCase()}-2026</div>
                  </div>
                  <div className="w-8 h-8 border border-border bg-white flex items-center justify-center p-0.5 shadow-sm">
                    <QrCode size={26} className="text-slate-900" />
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
                <Button onClick={() => { toast.success("LinkedIn post share workflow opened!"); }} className="flex items-center gap-1.5">
                  Share to LinkedIn <Sparkles size={13} className="text-yellow-300" />
                </Button>
                <Button variant="outline" onClick={() => router.push("/")} className="flex items-center gap-1">
                  Back to Dashboard
                </Button>
              </div>
            </Card>
          )}
        </Container>
      </section>
    </PageWrapper>
  );
}
