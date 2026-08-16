"use client";

import React, { useState, useEffect, useMemo, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  Loader2,
  Circle,
  CheckCircle2,
} from "lucide-react";

interface PathwayConfig {
  title: string;
  desc: string;
  duration: string;
  skills: string[];
  notesFilename: string;
  notesSize: string;
  quizQuestions: { q: string; options: string[]; correct: number }[];
  projectTitle: string;
  projectDesc: string;
  certificateTitle: string;
  videoDuration: string;
}

const PATHWAYS_CONFIG: Record<string, PathwayConfig> = {
  "fullstack": {
    title: "Full Stack Developer Learning Pathway",
    desc: "Go from HTML basics to building complex cloud-deployed React/Node applications.",
    duration: "12 Weeks",
    skills: ["React & Next.js", "Node.js & Express", "Database Design", "Cloud Deployment"],
    notesFilename: "Fullstack_Web_Development_Mastery_Notes.pdf",
    notesSize: "4.8 MB",
    videoDuration: "8:45 mins",
    quizQuestions: [
      {
        q: "Which Next.js routing model uses folder-based routing with layout.tsx and page.tsx files?",
        options: ["Pages Router", "App Router", "Dynamic Hash Router", "Static Route Handler"],
        correct: 1,
      },
      {
        q: "What is the primary purpose of React's useEffect clean-up function?",
        options: ["To execute logic before the component renders", "To prevent memory leaks by unsubscribing or cancelling async operations", "To update the component state directly", "To fetch data from remote APIs"],
        correct: 1,
      }
    ],
    projectTitle: "E-Commerce Full Stack Application",
    projectDesc: "Build and deploy a fully functional e-commerce app with cart management, order checkout flow, and custom database storage.",
    certificateTitle: "Full Stack Developer Learning Certificate"
  },
  "ai-engineer": {
    title: "AI Engineer Learning Pathway",
    desc: "Master Prompt Engineering, fine-tune models, and build LLM-driven agents.",
    duration: "8 Weeks",
    skills: ["LLMs & Prompts", "RAG & Vector DBs", "Gemini API integrations", "Agentic Workflows"],
    notesFilename: "AI_Prompt_Specialist_Core_Syllabus.pdf",
    notesSize: "3.2 MB",
    videoDuration: "6:15 mins",
    quizQuestions: [
      {
        q: "What is Retrieval-Augmented Generation (RAG) primarily used for?",
        options: ["Training a language model from scratch", "Injecting external proprietary knowledge into prompt contexts dynamically", "Compressing vector embeddings in local storage", "Translating code formats to standard schemas"],
        correct: 1,
      },
      {
        q: "In prompt engineering, what is the role of system instructions/prompts?",
        options: ["To store database credentials", "To define the high-level behavior, constraints, and identity of the AI model", "To perform arithmetic logic units operations", "To send HTTP request packages to backend servers"],
        correct: 1,
      }
    ],
    projectTitle: "Multi-Agent Support Chatbot",
    projectDesc: "Develop a custom RAG chatbot using vector searches that compiles answers from text manuals and provides structured JSON responses.",
    certificateTitle: "AI Engineer Learning Certificate"
  },
  "ui-ux": {
    title: "UI/UX Designer Learning Pathway",
    desc: "Master typography, layout grids, wireframes, prototypes, and Figma Design Systems.",
    duration: "10 Weeks",
    skills: ["Figma Design Systems", "Typography & Grids", "User Research & IA", "High-Fidelity Prototyping"],
    notesFilename: "Figma_Design_System_Guides.pdf",
    notesSize: "5.1 MB",
    videoDuration: "10:30 mins",
    quizQuestions: [
      {
        q: "What is the purpose of Auto-Layout in Figma design systems?",
        options: ["To automatically export frames to React files", "To design responsive layouts that grow/shrink dynamically with padding and spacing constraints", "To save color palettes in cloud files", "To run usability test interviews in browser tabs"],
        correct: 1,
      },
      {
        q: "Which UX process involves mapping out the blueprint structure and directory paths of an application?",
        options: ["Persona Mapping", "Information Architecture (IA)", "High-Fidelity Mockups", "Interactive Micro-Animations"],
        correct: 1,
      }
    ],
    projectTitle: "Fintech Wallet High-Fidelity Prototype",
    projectDesc: "Create a complete interactive prototype of a digital wallet app with dark/light modes, user flow maps, and responsive inputs.",
    certificateTitle: "UI/UX Designer Learning Certificate"
  },
  "digital-marketing": {
    title: "Digital Marketing Learning Pathway",
    desc: "Master Google SEO, pay-per-click Ads, content strategies, and web analytics.",
    duration: "6 Weeks",
    skills: ["Search Engine Optimization", "Content Copywriting", "PPC Campaigns & Ads", "Google Analytics"],
    notesFilename: "Growth_Marketing_Strategies_Guide.pdf",
    notesSize: "2.1 MB",
    videoDuration: "5:20 mins",
    quizQuestions: [
      {
        q: "What is the key objective of Search Engine Optimization (SEO)?",
        options: ["To pay search engines to show ads on keywords", "To optimize web pages so they rank higher in organic search engine results", "To host web pages on fast server-side clients", "To post daily updates on social media boards"],
        correct: 1,
      },
      {
        q: "In online marketing, what does CPC stand for?",
        options: ["Cost Per Conversion", "Cost Per Click", "Content Production Cost", "Conversion Placement Count"],
        correct: 1,
      }
    ],
    projectTitle: "Launch & Optimize A PPC Campaign",
    projectDesc: "Formulate a detailed mock growth marketing plan with budget allocations, ad copy copies, and target search keywords.",
    certificateTitle: "Digital Marketing Learning Certificate"
  },
  "data-science": {
    title: "Data Science Learning Pathway",
    desc: "Learn Python data analysis, regression forecasting, and machine learning models.",
    duration: "14 Weeks",
    skills: ["Pandas & NumPy", "Statistical Mathematics", "Scikit-Learn Regression", "Data Visualizations"],
    notesFilename: "Data_Science_Fundamentals_Formulas.pdf",
    notesSize: "4.5 MB",
    videoDuration: "9:10 mins",
    quizQuestions: [
      {
        q: "Which Python data analysis library provides structured tables called DataFrames?",
        options: ["NumPy", "Pandas", "Matplotlib", "TensorFlow"],
        correct: 1,
      },
      {
        q: "What is the main objective of a linear regression machine learning model?",
        options: ["To cluster unlabelled data into K categories", "To predict a continuous numerical value based on inputs", "To split text files into word arrays", "To clean local database caches"],
        correct: 1,
      }
    ],
    projectTitle: "Climate Data Analysis Dashboard",
    projectDesc: "Clean a real-world CSV dataset, calculate statistics, plot trend graphs with matplotlib, and fit a prediction model.",
    certificateTitle: "Data Science Learning Certificate"
  },
  "photography-mastery": {
    title: "Photography Learning Pathway",
    desc: "Master camera exposure, lighting composition, lens selection, and Lightroom presets.",
    duration: "8 Weeks",
    skills: ["Exposure Triangle", "Visual Composition", "Lightroom Presets", "Lighting setups"],
    notesFilename: "Visual_Arts_Photography_Syllabus.pdf",
    notesSize: "3.8 MB",
    videoDuration: "7:05 mins",
    quizQuestions: [
      {
        q: "Which three elements form the Exposure Triangle in photography?",
        options: ["Zoom, Focus, Lens Length", "Aperture, Shutter Speed, ISO", "Highlights, Shadows, Contrast", "Resolution, Color Depth, Aspect Ratio"],
        correct: 1,
      },
      {
        q: "What rule of composition suggests dividing your frame into nine equal rectangles to place key details?",
        options: ["Rule of Halves", "Rule of Thirds", "Golden Ratio spiral", "Symmetric Center focus"],
        correct: 1,
      }
    ],
    projectTitle: "Visual Composition Case Study",
    projectDesc: "Submit a photo collection demonstrating mastery of lighting angles, rules of thirds composition, and custom Lightroom presets.",
    certificateTitle: "Photography Learning Certificate"
  },
  "music-learning": {
    title: "Music Learning Pathway",
    desc: "Learn acoustic chord transitions, rhythm counting, and basic music theory scales.",
    duration: "12 Weeks",
    skills: ["Acoustic Chords", "Rhythm & Tempo", "Music Theory scales", "Visual scale transitions"],
    notesFilename: "Music_Theory_Fundamentals_Sheet.pdf",
    notesSize: "1.9 MB",
    videoDuration: "4:50 mins",
    quizQuestions: [
      {
        q: "How many semitones/notes make up a standard western chromatic scale octave?",
        options: ["8 notes", "12 notes", "7 notes", "10 notes"],
        correct: 1,
      },
      {
        q: "Which chord transition is commonly used as the dominant-to-tonic resolution in music keys?",
        options: ["ii to V chord progression", "V to I chord progression", "IV to vi chord progression", "I to IV chord progression"],
        correct: 1,
      }
    ],
    projectTitle: "Scale Mastery & Chord Progression",
    projectDesc: "Submit a video/audio recording showing fluid major scale keyboard transitions and rhythm sync counting.",
    certificateTitle: "Music Learning Certificate"
  },
  "cooking-essentials": {
    title: "Cooking Learning Pathway",
    desc: "Learn professional chef knife handling, baking temperatures, and pasta foundations.",
    duration: "4 Weeks",
    skills: ["Chef Knife Handling", "Sauces foundations", "Baking temperatures", "Pasta recipes"],
    notesFilename: "Culinary_Arts_Kitchen_Fundamentals.pdf",
    notesSize: "2.5 MB",
    videoDuration: "3:40 mins",
    quizQuestions: [
      {
        q: "What is the primary knife technique for safely slicing vegetables while protecting fingertips?",
        options: ["The Chop Slice", "The Claw Grip", "The Rocker Cut", "The Flat Press"],
        correct: 1,
      },
      {
        q: "Which basic culinary mother sauce uses milk thickened with a white roux?",
        options: ["Hollandaise", "Béchamel", "Velouté", "Tomato Marinara"],
        correct: 1,
      }
    ],
    projectTitle: "Signature Recipe & Knife Work Showcase",
    projectDesc: "Prepare a meal demonstrating uniform dice cuts, proper mother sauce preparation, and temperature management.",
    certificateTitle: "Cooking Learning Certificate"
  }
};

export const ALIAS_MAP: Record<string, string> = {
  "fullstack": "fullstack",
  "full-stack-developer": "fullstack",
  "web-development": "fullstack",
  "web development": "fullstack",
  "javascript": "fullstack",
  "react": "fullstack",
  "next-js": "fullstack",
  "next.js": "fullstack",
  "node-js": "fullstack",
  "node.js": "fullstack",
  "ai-engineer": "ai-engineer",
  "ai-ml": "ai-engineer",
  "ui-ux": "ui-ux",
  "ui-ux-designer": "ui-ux",
  "digital-marketing": "digital-marketing",
  "digital-marketing-specialist": "digital-marketing",
  "seo": "digital-marketing",
  "data-science": "data-science",
  "data-analyst": "data-science",
  "photography-mastery": "photography-mastery",
  "photography": "photography-mastery",
  "music-learning": "music-learning",
  "music": "music-learning",
  "guitar": "music-learning",
  "piano": "music-learning",
  "keyboard": "music-learning",
  "cooking-essentials": "cooking-essentials",
  "cooking": "cooking-essentials",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function InteractivePathPage({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const rawId = resolvedParams?.id || "intro";
  const id = decodeURIComponent(rawId).toLowerCase();

  const normalizedId = ALIAS_MAP[id];
  const pathInfo = PATHWAYS_CONFIG[normalizedId];

  // Lifecycle states
  // 0: Overview, 1: Step 1 (Learning), 2: Step 2 (Quiz), 3: Step 3 (Capstone Project), 4: Verification, 5: Certificate
  const [step, setStep] = useState(0);

  // Quiz state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizScore, setQuizScore] = useState<number | null>(null);

  // Project state
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [projectSubmitted, setProjectSubmitted] = useState(false);

  // Verification state
  const [verificationProgress, setVerificationProgress] = useState(0);
  const [verificationStatus, setVerificationStatus] = useState<"idle" | "verifying" | "success">("idle");

  // Automatically start simulated verification when step 4 is active
  useEffect(() => {
    if (step !== 4) return;

    setVerificationStatus("verifying");
    setVerificationProgress(0);

    const interval = setInterval(() => {
      setVerificationProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setVerificationStatus("success");
          toast.success("Project verification checklist matches successfully!");
          return 100;
        }
        return prev + 10;
      });
    }, 250);

    return () => clearInterval(interval);
  }, [step]);

  const handleSelectAnswer = (qIdx: number, oIdx: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [qIdx]: oIdx }));
  };

  const handleSubmitQuiz = () => {
    if (!pathInfo) return;
    if (Object.keys(selectedAnswers).length < pathInfo.quizQuestions.length) {
      toast.error("Please answer all questions before submitting.");
      return;
    }
    let score = 0;
    pathInfo.quizQuestions.forEach((q, idx) => {
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

  if (!normalizedId || !pathInfo) {
    return (
      <PageWrapper>
        <section className="w-full py-12 bg-muted/20 border-b border-border/40 text-left select-none">
          <Container className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-semibold">
              <Link href="/" className="hover:text-foreground">Home</Link>
              <span>/</span>
              <Link href="/learning-paths" className="hover:text-foreground">Paths</Link>
              <span>/</span>
              <span className="text-foreground">Not Found</span>
            </div>
          </Container>
        </section>
        <section className="w-full py-20 select-none text-center">
          <Container className="max-w-md">
            <Card variant="glass" className="p-8 border-dashed border-2 border-border/80 bg-card flex flex-col items-center gap-5 shadow-soft">
              <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 text-xl font-bold">
                ✕
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-foreground">Learning Pathway Not Found</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  The requested learning pathway ID does not exist or has not been configured yet.
                </p>
              </div>
              <div className="flex flex-col gap-2 w-full mt-2">
                <Button size="sm" onClick={() => router.push("/learning-paths")} className="font-bold">
                  Browse Active Pathways
                </Button>
                <Button size="sm" variant="outline" onClick={() => router.push("/")} className="font-bold">
                  Back to Homepage
                </Button>
              </div>
            </Card>
          </Container>
        </section>
      </PageWrapper>
    );
  }

  // Exactly 3 progress indicators mapping to Learning, Quiz, and Capstone
  const progressSteps = [
    { num: 1, label: "Learning", activeOn: [1], completedOn: [2, 3, 4, 5] },
    { num: 2, label: "Quiz", activeOn: [2], completedOn: [3, 4, 5] },
    { num: 3, label: "Capstone", activeOn: [3], completedOn: [4, 5] }
  ];

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

            {/* Exactly 3 Progress Indicators */}
            <div className="flex items-center gap-4">
              {progressSteps.map((pStep) => {
                const isActive = pStep.activeOn.includes(step);
                const isCompleted = pStep.completedOn.includes(step);
                return (
                  <div key={pStep.num} className="flex items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border transition-colors ${
                        isActive
                          ? "bg-primary border-primary text-white"
                          : isCompleted
                          ? "bg-emerald-600 border-emerald-600 text-white"
                          : "bg-muted border-border text-muted-foreground"
                      }`}
                    >
                      {isCompleted ? "✓" : pStep.num}
                    </div>
                    <span className={`text-xs font-semibold hidden sm:inline ${
                      isActive ? "text-primary" : isCompleted ? "text-emerald-600" : "text-muted-foreground"
                    }`}>
                      {pStep.label}
                    </span>
                  </div>
                );
              })}
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
                  <span>Steps Count: 3 Modules</span>
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
                <span className="text-[10px] font-extrabold text-primary uppercase tracking-wider">Module 1 — Learning / Resources</span>
                <h2 className="text-xl font-heading font-extrabold text-foreground">Theoretical & Notes Checkpoint</h2>
                <p className="text-xs text-muted-foreground">
                  Watch the concept introduction video and download structural notes to cover the syllabus concepts.
                </p>
              </div>

              {/* Video Player */}
              <div className="aspect-video w-full bg-slate-900 border border-border/60 rounded-xl flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-hero-gradient opacity-10" />
                <Button variant="primary" className="rounded-full w-14 h-14 flex items-center justify-center">
                  <Play size={22} className="fill-current ml-1" />
                </Button>
                <span className="absolute bottom-3 left-3 bg-black/60 px-2 py-0.5 rounded text-[8px] font-mono text-white/90">
                  Concept introduction ({pathInfo.videoDuration})
                </span>
              </div>

              {/* Study Notes */}
              <div className="p-4 bg-muted/20 border border-border/40 rounded-xl flex items-center justify-between text-xs gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center text-primary">
                    <FileText size={16} />
                  </div>
                  <div>
                    <span className="font-bold block text-foreground">{pathInfo.notesFilename}</span>
                    <span className="text-[9px] text-muted-foreground font-semibold">Format: PDF · Size: {pathInfo.notesSize}</span>
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
                <span className="text-[10px] font-extrabold text-primary uppercase tracking-wider">Module 2 — Quiz / Knowledge Check</span>
                <h2 className="text-xl font-heading font-extrabold text-foreground">Quiz Checkpoint</h2>
                <p className="text-xs text-muted-foreground">
                  Score above 50% to satisfy this checkpoint. Answer all questions below.
                </p>
              </div>

              <div className="space-y-5 text-xs">
                {pathInfo.quizQuestions.map((q, qIdx) => (
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
                    Quiz Score: {quizScore} / {pathInfo.quizQuestions.length}
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
                <span className="text-[10px] font-extrabold text-primary uppercase tracking-wider">Module 3 — Capstone Project</span>
                <h2 className="text-xl font-heading font-extrabold text-foreground">{pathInfo.projectTitle}</h2>
                <p className="text-xs text-muted-foreground">
                  {pathInfo.projectDesc} Upload your sandbox project ZIP archive for AI verification review.
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
                  onClick={() => {
                    setVerificationStatus("idle");
                    setVerificationProgress(0);
                    setStep(4);
                  }}
                  className="flex items-center gap-1 bg-primary hover:bg-primary/95 text-white"
                >
                  Proceed to Verification <ArrowRight size={13} />
                </Button>
              </div>
            </Card>
          )}

          {step === 4 && (
            <Card variant="glass" className="p-6 border-border flex flex-col gap-6 text-left">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold text-primary uppercase tracking-wider">Project Verification</span>
                <h2 className="text-xl font-heading font-extrabold text-foreground">Verifying Your Capstone Project</h2>
                <p className="text-xs text-muted-foreground">
                  {"We're checking your submitted project against the requirements of this learning pathway."}
                </p>
              </div>

              <div className="space-y-4 p-4 bg-muted/20 border border-border/40 rounded-xl">
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between font-semibold text-muted-foreground">
                    <span>
                      {verificationProgress < 25 && "Compiling project in sandbox..."}
                      {verificationProgress >= 25 && verificationProgress < 50 && "Running test suites..."}
                      {verificationProgress >= 50 && verificationProgress < 75 && "Analyzing architecture & constraints..."}
                      {verificationProgress >= 75 && verificationProgress < 100 && "Generating verification signature..."}
                      {verificationProgress === 100 && "Project Verification Complete"}
                    </span>
                    <span className="font-mono">{verificationProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        verificationStatus === "success" ? "bg-emerald-500" : "bg-primary"
                      }`}
                      style={{ width: `${verificationProgress}%` }}
                    />
                  </div>
                </div>

                {/* Criteria Checklist */}
                {(() => {
                  const getCheckState = (activeThreshold: number, completeThreshold: number) => {
                    if (verificationProgress >= completeThreshold) {
                      return {
                        icon: <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-500/10 shrink-0" />,
                        textClass: "text-foreground font-semibold",
                      };
                    }
                    if (verificationProgress >= activeThreshold) {
                      return {
                        icon: <Loader2 className="w-4 h-4 text-primary animate-spin shrink-0" />,
                        textClass: "text-primary font-bold animate-pulse",
                      };
                    }
                    return {
                      icon: <Circle className="w-4 h-4 text-muted-foreground/30 shrink-0" />,
                      textClass: "text-muted-foreground/60 font-medium",
                    };
                  };

                  const check1 = getCheckState(0, 25);
                  const check2 = getCheckState(25, 50);
                  const check3 = getCheckState(50, 75);
                  const check4 = getCheckState(75, 100);

                  return (
                    <div className="flex flex-col gap-3 pt-3 border-t border-border/20 text-xs">
                      <div className="flex items-center gap-2.5">
                        {check1.icon}
                        <span className={check1.textClass}>Sandbox Compilation</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        {check2.icon}
                        <span className={check2.textClass}>Functional Unit Tests</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        {check3.icon}
                        <span className={check3.textClass}>Architectural Policy Alignment</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        {check4.icon}
                        <span className={check4.textClass}>Digital Verification Signature</span>
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="flex justify-between mt-4">
                <Button
                  variant="ghost"
                  disabled={verificationStatus === "verifying" && verificationProgress < 100}
                  onClick={() => {
                    setStep(3);
                  }}
                  className="flex items-center gap-1"
                >
                  <ArrowLeft size={13} /> Back
                </Button>
                <Button
                  disabled={verificationStatus !== "success"}
                  onClick={() => setStep(5)}
                  className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600"
                >
                  Claim Verified Certificate <Award size={13} />
                </Button>
              </div>
            </Card>
          )}

          {step === 5 && (
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
                <Button variant="outline" onClick={() => router.push("/student/dashboard")} className="flex items-center gap-1">
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
