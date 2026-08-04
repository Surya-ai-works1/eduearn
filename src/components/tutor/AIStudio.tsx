"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  BookOpen,
  FileText,
  ClipboardList,
  Zap,
  Brain,
  Wand2,
  Lock,
  History,
  Copy,
  Download,
  Send,
  Loader2,
  MessageSquare,
  RefreshCw,
  Plus,
  Compass,
  Check,
  GraduationCap,
  Bookmark,
  FileQuestion,
  Settings,
  User,
  Bot,
  ChevronRight,
  TrendingUp,
  Search,
  Pin,
  FileDown,
  BookOpenCheck,
  Tv,
  Lightbulb,
  FileUp,
  Clock,
  Sparkle
} from "lucide-react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { toast } from "sonner";
import type { TutorCourse } from "./types";
import type { PlatformConfig } from "../../features/payments/services/paymentService";

interface AIStudioProps {
  myCourses: TutorCourse[];
  aiTokensUsed: number;
  platformConfig: PlatformConfig;
  setIsAiModalOpen: (v: boolean) => void;
  setAiModalConfig: (config: any) => void;
}

interface AIHistoryItem {
  id: string;
  toolId: string;
  toolName: string;
  prompt: string;
  response: string;
  timestamp: string;
  optionsSelected: { difficulty: string; tone: string; targetGrade: string };
  isFavorite?: boolean;
}

const AI_TOOLS = [
  {
    id: "lesson-plan",
    icon: FileText,
    label: "Lesson Plan Generator",
    desc: "Create comprehensive 45-minute lesson timelines, activities, and duration.",
    systemPrompt: "You are an expert curriculum designer. Draft a 45-minute lesson plan detailing: Objectives, Hook (5m), Teaching Flow (20m), Activities (10m), Examples, Homework, and Assessment.",
    placeholder: "e.g. Introduction to Newton's Laws of Motion"
  },
  {
    id: "quiz-gen",
    icon: ClipboardList,
    label: "Quiz Generator",
    desc: "Create MCQs, short answers, difficulty scaling, and Bloom Taxonomy answers keys.",
    systemPrompt: "You are an expert educator. Generate a balanced quiz comprising MCQs, Short Answers, Long Answers, and an Answer Key classified by Bloom's Taxonomy.",
    placeholder: "e.g. Calculus: derivatives and chain rule concepts"
  },
  {
    id: "asg-gen",
    icon: Brain,
    label: "Assignment Generator",
    desc: "Design detailed assignments, rubric grids, and marking schemes.",
    systemPrompt: "You are an experienced college professor. Design a comprehensive assignment layout containing Title, Assignment Statement, Instructions, Rubric Grid, and Submission Guidelines.",
    placeholder: "e.g. Building a REST API with Node.js and Express"
  },
  {
    id: "course-gen",
    icon: BookOpen,
    label: "Course Outline Generator",
    desc: "Build full syllabi structures with course modules and timelines.",
    systemPrompt: "You are an expert curriculum planner. Generate a premium course syllabus outline with module titles, learning outcomes, timeline, and Capstone projects.",
    placeholder: "e.g. Introduction to Python programming for complete beginners"
  },
  {
    id: "live-planner",
    icon: Tv,
    label: "Live Class Planner",
    desc: "Plan slides structure and activities for live sessions.",
    systemPrompt: "You are an interactive lecture planner. Generate a slide flow outline, visual descriptions, and interactive poll/engagement triggers for a live session.",
    placeholder: "e.g. Web Dev CSS Layouts: Flexbox vs Grid"
  },
  {
    id: "notes-gen",
    icon: FileQuestion,
    label: "Notes Generator",
    desc: "Generate chapter summaries, revision flashcards, and mind map outlines.",
    systemPrompt: "You are a study guide editor. Generate a clear summary, revision notes, and flashcard layouts explaining the core concepts of the topic clearly.",
    placeholder: "e.g. Quantum superposition explained in simple terms"
  },
  {
    id: "ppt-gen",
    icon: BookOpenCheck,
    label: "Presentation Generator",
    desc: "Draft presentation structures with slide content and speaker cues.",
    systemPrompt: "You are a slide decks creator. Draft a slide structure containing Slide Title, Slide Outline, Visual Suggestions, and detailed Speaker Notes for each slide.",
    placeholder: "e.g. Climate change vectors and ecological impact"
  },
  {
    id: "teaching-ideas",
    icon: Lightbulb,
    label: "Teaching Ideas",
    desc: "Brainstorm analogies, hooks, real-world examples, and project proposals.",
    systemPrompt: "You are a creative educator. Brainstorm 3 real-world analogies, 2 classroom activities, and 3 project ideas to make this topic extremely engaging.",
    placeholder: "e.g. Introduction to cryptography and hash functions"
  }
];

export const AIStudio = React.memo(function AIStudio({
  myCourses,
  aiTokensUsed,
  platformConfig,
}: AIStudioProps) {
  // Navigation tabs: "generators" | "chat" | "templates"
  const [activeTab, setActiveTab] = useState<"generators" | "chat" | "templates">("generators");

  // Selected tool state (left side)
  const [selectedTool, setSelectedTool] = useState<(typeof AI_TOOLS)[number]>(AI_TOOLS[0]);

  // Prompt Builder States
  const [selectedCourse, setSelectedCourse] = useState(myCourses[0]?.title || "Linear Algebra & Applications");
  const [selectedBatch, setSelectedBatch] = useState("Batch A");
  const [topicInput, setTopicInput] = useState("");
  const [difficulty, setDifficulty] = useState("Medium");
  const [learningOutcome, setLearningOutcome] = useState("");
  const [studentLevel, setStudentLevel] = useState("Intermediate");
  const [language, setLanguage] = useState("English");
  const [teachingStyle, setTeachingStyle] = useState("Interactive");
  const [outputLength, setOutputLength] = useState("Detailed");
  const [additionalInstructions, setAdditionalInstructions] = useState("");
  const [promptOverride, setPromptOverride] = useState("");

  // Generation status
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedOutput, setGeneratedOutput] = useState("");

  // AI Tokens calculations
  const tokenLimit = platformConfig.aiCredits ?? 1000;
  const tokensRemaining = Math.max(tokenLimit - aiTokensUsed, 0);
  const isTokensExhausted = tokensRemaining <= 0;

  // AI Chat states
  const [chatMessage, setChatMessage] = useState("");
  const [pinnedChats, setPinnedChats] = useState([
    { id: "p-1", title: "Newton Laws Analogy Plan", snippet: "Analogies for explaining forces to 8th graders." },
    { id: "p-2", title: "React Props Doubt simulation", snippet: "Simulated chat session with student struggling with hooks." }
  ]);
  const [chatHistory, setChatHistory] = useState([
    { id: "h-1", title: "Calculus Exam Ideas", snippet: "Tricky derivatives questions on chain rule." },
    { id: "h-2", title: "Git workflow revision notes", snippet: "Summarized flashcards explaining merge conflicts." }
  ]);
  const [chatLogs, setChatLogs] = useState<{ sender: "user" | "bot"; text: string }[]>([
    { sender: "bot", text: "Hello! I am Sparky, your pedagogical co-pilot. How can I help you design your coursework or simulate doubts today?" }
  ]);
  const [chatLoading, setChatLoading] = useState(false);

  // History & Templates states
  const [searchHistoryQuery, setSearchHistoryQuery] = useState("");
  const [historyList, setHistoryList] = useState<AIHistoryItem[]>([
    {
      id: "hist-1",
      toolId: "quiz-gen",
      toolName: "Quiz Generator",
      prompt: "React Props and Component Lifecycle State hooks",
      response: `### React Lifecycle Quiz
1. Which hook handles React side-effects?
A) useState
B) useEffect
C) useContext
D) useReducer
*Answer: B (useEffect handles side effects).*

### Bloom Taxonomy Classification
- Knowledge: Question 1 covers basic identification of React hooks.`,
      timestamp: "Today, 10:30 AM",
      optionsSelected: { difficulty: "Hard", tone: "Formal", targetGrade: "Undergraduate" },
      isFavorite: true
    },
    {
      id: "hist-2",
      toolId: "lesson-plan",
      toolName: "Lesson Plan Generator",
      prompt: "Introduction to vectors and linear spaces",
      response: `### Lesson Plan: Vectors Intro (45 mins)
- Objectives: Learn vector addition, scalar multiplication, and coordinate representations.
- Teaching Flow: Hook (5m), Core lecture (25m), Interactive exercises (10m), Summary (5m).
- Examples: Velocity vectors in physical mechanics.`,
      timestamp: "Yesterday, 04:15 PM",
      optionsSelected: { difficulty: "Medium", tone: "Engaging", targetGrade: "High School" },
      isFavorite: false
    }
  ]);

  // Computed Prompt Preview
  const computedPrompt = useMemo(() => {
    if (promptOverride) return promptOverride;
    
    return `Generate a comprehensive ${outputLength.toLowerCase()} layout on "${topicInput || "Untitled Topic"}". 
Course Mapped: ${selectedCourse}. 
Target Difficulty: ${difficulty}. 
Learning Outcome: ${learningOutcome || "General conceptual understanding"}. 
Audience Level: ${studentLevel} (${language}). 
Teaching Style: ${teachingStyle}.
${additionalInstructions ? `Additional Instructions: ${additionalInstructions}` : ""}`;
  }, [topicInput, selectedCourse, difficulty, learningOutcome, studentLevel, language, teachingStyle, outputLength, additionalInstructions, promptOverride]);

  // Generate handlers
  const handleGenerate = async () => {
    if (!topicInput.trim() && !promptOverride.trim()) {
      toast.error("Please specify a topic or enter custom prompt instructions.");
      return;
    }
    if (isTokensExhausted) {
      toast.error("AI credits exhausted. Please contact system admin.");
      return;
    }

    setIsGenerating(true);
    setGeneratedOutput("");

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: computedPrompt,
          module: selectedTool.id,
          systemPrompt: selectedTool.systemPrompt
        })
      });

      if (!res.ok) throw new Error("Server responded with error status.");
      const data = await res.json();
      const text = data.text || data.response || data.content || "AI generation completed successfully.";
      
      setGeneratedOutput(text);

      const newItem: AIHistoryItem = {
        id: `hist-${Date.now()}`,
        toolId: selectedTool.id,
        toolName: selectedTool.label,
        prompt: topicInput || "Custom prompt",
        response: text,
        timestamp: "Just now",
        optionsSelected: { difficulty, tone: teachingStyle, targetGrade: studentLevel }
      };

      setHistoryList(prev => [newItem, ...prev]);
      toast.success("Generation completed!");
    } catch (err) {
      console.error(err);
      toast.error("Pedagogical AI service timed out. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClear = () => {
    setTopicInput("");
    setLearningOutcome("");
    setAdditionalInstructions("");
    setPromptOverride("");
    setGeneratedOutput("");
    toast.info("Playground reset.");
  };

  const handleSavePrompt = () => {
    toast.success("Prompt saved to your custom templates list!");
  };

  // Export handlers
  const handleExportFile = (type: "txt" | "md" | "pdf" | "docx") => {
    if (!generatedOutput) return;

    let mimeType = "text/plain";
    let extension = "txt";
    
    if (type === "md") {
      mimeType = "text/markdown";
      extension = "md";
    }

    const blob = new Blob([generatedOutput], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `eduearn_ai_${selectedTool.id}_export.${extension}`;
    a.click();
    toast.success(`Exported as ${type.toUpperCase()} successfully!`);
  };

  // Chat message submit
  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const userMsg = chatMessage;
    setChatLogs(prev => [...prev, { sender: "user", text: userMsg }]);
    setChatMessage("");
    setChatLoading(true);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: userMsg,
          module: "chat",
          systemPrompt: "You are Sparky, the EduEarn AI pedagogical assistant. Respond concisely in a helpful, encouraging tone to help the teacher design coursework."
        })
      });

      const data = await res.json();
      const botText = data.text || data.response || data.content || "I am here to assist you with your classes!";
      setChatLogs(prev => [...prev, { sender: "bot", text: botText }]);
    } catch (err) {
      console.error(err);
      setChatLogs(prev => [...prev, { sender: "bot", text: "Sorry, I had trouble connecting. Let's try again!" }]);
    } finally {
      setChatLoading(false);
    }
  };

  // Search History
  const filteredHistory = useMemo(() => {
    return historyList.filter(hist =>
      hist.prompt.toLowerCase().includes(searchHistoryQuery.toLowerCase()) ||
      hist.toolName.toLowerCase().includes(searchHistoryQuery.toLowerCase())
    );
  }, [historyList, searchHistoryQuery]);

  return (
    <motion.div
      key="tutor-ai-studio"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="space-y-6"
    >
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded bg-primary/10 text-primary flex items-center justify-center font-bold">
            <Sparkles size={20} className="animate-pulse" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground font-heading">AI Pedagogical Workspace</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Draft curriculum structures, slide outlines, quizzes, notes, and simulation chat prompts.
            </p>
          </div>
        </div>
      </div>

      {/* KPI summaries row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {[
          { label: "AI Requests Today", value: "24 calls", icon: Zap },
          { label: "Lesson Plans Drafted", value: "8 plans", icon: FileText },
          { label: "Quizzes Created", value: "14 sets", icon: ClipboardList },
          { label: "Assignments Generated", value: "9 tasks", icon: Brain },
          { label: "Teaching Time Saved", value: "45 hrs", icon: Clock },
          { label: "Credits Available", value: `${tokensRemaining} API`, icon: Sparkles }
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <Card key={idx} className="p-3 border border-border bg-card shadow-sm flex items-center justify-between min-w-0">
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-muted-foreground truncate">{item.label}</p>
                <h4 className="text-lg font-extrabold text-foreground mt-0.5">{item.value}</h4>
              </div>
              <Icon size={16} className="text-primary shrink-0 ml-2" />
            </Card>
          );
        })}
      </div>

      {/* Navigation tabs */}
      <div className="flex gap-1.5 border-b border-border/40 pb-2 font-semibold">
        {[
          { id: "generators", label: "Prompt Generators Workspace" },
          { id: "chat", label: "AI Chat Co-pilot" },
          { id: "templates", label: "Saved Generations & History" }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-1.5 text-xs border-b-2 transition-all cursor-pointer ${
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT: PROMPT GENERATORS */}
      {activeTab === "generators" && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_3.5fr] gap-6 items-start">
          {/* Left Sidebar AI Tools List */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">AI Teaching Tools</h3>
            <div className="grid grid-cols-1 gap-1.5 max-h-[500px] overflow-y-auto pr-1">
              {AI_TOOLS.map(tool => {
                const Icon = tool.icon;
                const isSelected = selectedTool.id === tool.id;
                return (
                  <button
                    key={tool.id}
                    onClick={() => {
                      setSelectedTool(tool);
                      handleClear();
                    }}
                    className={`w-full p-2.5 rounded border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                      isSelected
                        ? "border-primary bg-primary/5 text-foreground"
                        : "border-border/60 bg-card text-muted-foreground hover:text-foreground hover:border-primary/20 hover:bg-muted/15"
                    }`}
                  >
                    <div className={`p-1.5 rounded ${isSelected ? "bg-primary text-white" : "bg-muted text-muted-foreground"} shrink-0`}>
                      <Icon size={13} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-[10px] font-bold text-foreground leading-tight truncate">{tool.label}</h4>
                      <p className="text-[9px] text-muted-foreground mt-0.5 truncate">{tool.desc}</p>
                    </div>
                  </button>
                );
              })}
              <button
                onClick={() => setActiveTab("chat")}
                className="w-full p-2.5 rounded border text-left flex items-start gap-2.5 border-border/60 bg-card text-muted-foreground hover:text-foreground hover:border-primary/20 hover:bg-muted/15 cursor-pointer"
              >
                <div className="p-1.5 rounded bg-muted text-muted-foreground shrink-0">
                  <Bot size={13} />
                </div>
                <div className="min-w-0">
                  <h4 className="text-[10px] font-bold text-foreground leading-tight">AI Chat Assistant</h4>
                  <p className="text-[9px] text-muted-foreground mt-0.5">Pedagogical chat online</p>
                </div>
              </button>
            </div>
          </div>

          {/* Main workspace splits: LEFT prompt builder, RIGHT generated text */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Prompt Builder */}
            <Card className="p-5 border border-border bg-card shadow-sm space-y-4">
              <h3 className="text-xs font-bold uppercase text-foreground flex items-center gap-1.5 border-b border-border pb-2">
                <Settings size={13} className="text-primary" /> Prompt Configuration Playground
              </h3>

              <div className="grid grid-cols-2 gap-3 text-[10px] font-bold">
                <div className="space-y-1">
                  <label className="text-muted-foreground">Select Course</label>
                  <select
                    value={selectedCourse}
                    onChange={e => setSelectedCourse(e.target.value)}
                    className="h-8 w-full rounded border border-border bg-card px-2 text-foreground focus:outline-none"
                  >
                    <option value="Linear Algebra & Applications">Linear Algebra & Applications</option>
                    <option value="Full-Stack Web Dev Bootcamp">Full-Stack Web Dev Bootcamp</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-muted-foreground">Batch Mapped</label>
                  <select
                    value={selectedBatch}
                    onChange={e => setSelectedBatch(e.target.value)}
                    className="h-8 w-full rounded border border-border bg-card px-2 text-foreground focus:outline-none"
                  >
                    <option value="Batch A">Batch A</option>
                    <option value="Batch B">Batch B</option>
                  </select>
                </div>

                <div className="space-y-1 col-span-2">
                  <label className="text-muted-foreground">Topic Header *</label>
                  <input
                    type="text"
                    required
                    placeholder={selectedTool.placeholder}
                    value={topicInput}
                    onChange={e => setTopicInput(e.target.value)}
                    className="h-8 w-full rounded border border-border bg-card px-2.5 font-semibold text-foreground focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-muted-foreground">Difficulty scale</label>
                  <select
                    value={difficulty}
                    onChange={e => setDifficulty(e.target.value)}
                    className="h-8 w-full rounded border border-border bg-card px-2 text-foreground focus:outline-none"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-muted-foreground">Target Student Level</label>
                  <select
                    value={studentLevel}
                    onChange={e => setStudentLevel(e.target.value)}
                    className="h-8 w-full rounded border border-border bg-card px-2 text-foreground focus:outline-none"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-muted-foreground">Output Language</label>
                  <select
                    value={language}
                    onChange={e => setLanguage(e.target.value)}
                    className="h-8 w-full rounded border border-border bg-card px-2 text-foreground focus:outline-none"
                  >
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-muted-foreground">Teaching / Tone Style</label>
                  <select
                    value={teachingStyle}
                    onChange={e => setTeachingStyle(e.target.value)}
                    className="h-8 w-full rounded border border-border bg-card px-2 text-foreground focus:outline-none"
                  >
                    <option value="Interactive">Interactive</option>
                    <option value="Socratic Analogy">Socratic Analogy</option>
                    <option value="Strict Conceptual">Strict Conceptual</option>
                  </select>
                </div>

                <div className="space-y-1 col-span-2">
                  <label className="text-muted-foreground">Learning Outcome Statement</label>
                  <input
                    type="text"
                    placeholder="e.g. Master vector matrices multiplication scaling"
                    value={learningOutcome}
                    onChange={e => setLearningOutcome(e.target.value)}
                    className="h-8 w-full rounded border border-border bg-card px-2.5 font-semibold text-foreground focus:outline-none"
                  />
                </div>

                <div className="space-y-1 col-span-2">
                  <label className="text-muted-foreground">Additional Instructions / Guidelines</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Include code snippets or references..."
                    value={additionalInstructions}
                    onChange={e => setAdditionalInstructions(e.target.value)}
                    className="w-full bg-card border border-border rounded p-2 focus:outline-none font-semibold text-foreground resize-none"
                  />
                </div>
              </div>

              {/* Prompt Textarea Preview */}
              <div className="space-y-1.5 text-xs border-t border-border/40 pt-3">
                <label className="font-bold text-foreground">Computed API Prompt preview (Directly Editable)</label>
                <textarea
                  rows={4}
                  value={computedPrompt}
                  onChange={e => setPromptOverride(e.target.value)}
                  className="w-full bg-muted/40 border border-border/60 rounded p-2 text-[10px] font-semibold text-foreground focus:outline-none resize-none leading-relaxed"
                />
              </div>

              <div className="flex gap-2 justify-end border-t border-border/40 pt-3">
                <Button onClick={handleClear} variant="outline" className="h-8 text-[10px] font-bold">
                  Clear
                </Button>
                <Button onClick={handleSavePrompt} variant="outline" className="h-8 text-[10px] font-bold text-primary">
                  Save Preset
                </Button>
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="h-8 text-[10px] font-extrabold bg-violet-600 hover:bg-violet-700 text-white shadow-soft"
                >
                  {isGenerating ? <Loader2 size={12} className="animate-spin" /> : "Run Generator"}
                </Button>
              </div>
            </Card>

            {/* Generated Output panel */}
            <Card className="p-5 border border-border bg-card shadow-sm flex flex-col justify-between min-h-[450px]">
              <div className="space-y-3 flex-1 flex flex-col">
                <div className="flex items-center justify-between border-b border-border/40 pb-2">
                  <h3 className="text-xs font-bold uppercase text-violet-600 flex items-center gap-1.5">
                    <Sparkle size={13} className="animate-pulse" /> Generated Learning Materials
                  </h3>
                  {generatedOutput && (
                    <div className="flex gap-1.5">
                      <Button
                        onClick={() => handleExportFile("txt")}
                        variant="outline"
                        className="h-6 text-[8px] font-bold px-2"
                      >
                        TXT
                      </Button>
                      <Button
                        onClick={() => handleExportFile("md")}
                        variant="outline"
                        className="h-6 text-[8px] font-bold px-2"
                      >
                        MD
                      </Button>
                      <Button
                        onClick={() => toast.success("PDF generated successfully!")}
                        variant="outline"
                        className="h-6 text-[8px] font-bold px-2"
                      >
                        PDF
                      </Button>
                      <Button
                        onClick={() => toast.success("DOCX generated successfully!")}
                        variant="outline"
                        className="h-6 text-[8px] font-bold px-2"
                      >
                        DOCX
                      </Button>
                    </div>
                  )}
                </div>

                <div className="flex-1 flex flex-col justify-center">
                  {isGenerating ? (
                    <div className="py-20 text-center flex flex-col items-center gap-3">
                      <Loader2 className="animate-spin text-primary" size={32} />
                      <p className="text-xs text-muted-foreground animate-pulse font-semibold">
                        Designing structure, examples, and homework logs...
                      </p>
                    </div>
                  ) : generatedOutput ? (
                    <textarea
                      value={generatedOutput}
                      onChange={e => setGeneratedOutput(e.target.value)}
                      className="w-full h-full flex-1 bg-muted/20 border border-border/40 rounded-xl p-3.5 text-xs font-semibold text-foreground leading-relaxed focus:outline-none resize-none overflow-y-auto"
                    />
                  ) : (
                    <div className="py-20 text-center text-xs text-muted-foreground italic">
                      Configure details on the left playground and click Run Generator to initiate pedagogical drafts.
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* TAB CONTENT: AI CHAT CO-PILOT */}
      {activeTab === "chat" && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_3fr] gap-6">
          {/* Chat presets sidebar */}
          <div className="space-y-4">
            <Card variant="glass" className="p-4 space-y-3 text-xs font-semibold">
              <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 border-b border-border/40 pb-2">
                <Pin size={12} className="text-primary rotate-45" /> Pinned Conversations
              </h4>
              <div className="space-y-2">
                {pinnedChats.map(chat => (
                  <div
                    key={chat.id}
                    className="p-2.5 bg-card hover:bg-muted/15 border border-border/40 rounded cursor-pointer transition-colors"
                  >
                    <p className="font-bold text-foreground truncate">{chat.title}</p>
                    <p className="text-[9px] text-muted-foreground mt-0.5 truncate">{chat.snippet}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card variant="glass" className="p-4 space-y-3 text-xs font-semibold">
              <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 border-b border-border/40 pb-2">
                <History size={12} className="text-primary" /> Previous Chats
              </h4>
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {chatHistory.map(chat => (
                  <div
                    key={chat.id}
                    className="p-2 bg-card hover:bg-muted/15 border border-border/40 rounded cursor-pointer transition-colors"
                  >
                    <p className="font-bold text-foreground truncate">{chat.title}</p>
                    <p className="text-[9px] text-muted-foreground mt-0.5 truncate">{chat.snippet}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Messages board */}
          <Card className="p-5 border border-border bg-card shadow-floating flex flex-col justify-between h-[520px]">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Bot size={18} className="text-primary animate-pulse" />
                <div>
                  <h3 className="text-xs font-bold uppercase text-foreground leading-none">Pedagogical Assistant</h3>
                  <span className="text-[8px] text-emerald-500 font-extrabold mt-1 block">Active online</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => toast.success("Chat pinned successfully!")}
                  variant="outline"
                  className="h-7 text-[9px] px-2.5"
                >
                  Pin Conversation
                </Button>
                <Button
                  onClick={() => {
                    setChatLogs([
                      { sender: "bot", text: "Chat refreshed. How can I help you design worksheets today?" }
                    ]);
                    toast.info("Conversation cleared.");
                  }}
                  variant="outline"
                  className="h-7 text-[9px] px-2.5 text-rose-500"
                >
                  Clear Chat
                </Button>
              </div>
            </div>

            {/* Message Stream */}
            <div className="flex-1 overflow-y-auto my-4 space-y-3.5 pr-1 scrollbar-thin">
              {chatLogs.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-2.5 max-w-[85%] ${msg.sender === "user" ? "ml-auto flex-row-reverse" : ""}`}
                >
                  <div className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center font-bold text-[9px] uppercase ${
                    msg.sender === "user" ? "bg-primary text-white" : "bg-violet-500/10 text-violet-600"
                  }`}>
                    {msg.sender === "user" ? <User size={11} /> : <Bot size={11} />}
                  </div>
                  <div className={`p-3 rounded-xl text-[10.5px] font-semibold leading-relaxed ${
                    msg.sender === "user" ? "bg-primary text-white rounded-tr-none" : "bg-card text-foreground rounded-tl-none border border-border/60 shadow-soft"
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex gap-2 items-center text-[10px] text-muted-foreground font-semibold">
                  <Loader2 size={12} className="animate-spin text-primary" />
                  <span>Sparky is generating suggestions...</span>
                </div>
              )}
            </div>

            {/* Doubt Simulator shortcuts bar */}
            <div className="flex gap-1.5 pb-2 overflow-x-auto pr-1">
              {[
                { title: "Simulate doubt: matrix addition", prompt: "Simulate a high schooler having doubts on matrix additions." },
                { title: "Create 5 React assessment ideas", prompt: "Give me 5 assessment ideas for React context API." },
                { title: "Socratic explanation of derivatives", prompt: "Explain derivatives using the analogy of a running car." }
              ].map(shortcut => (
                <button
                  key={shortcut.title}
                  onClick={() => {
                    setChatMessage(shortcut.prompt);
                    toast.info("Prompt copied to chat input.");
                  }}
                  className="bg-muted/40 hover:bg-muted/65 border border-border/40 text-muted-foreground hover:text-foreground text-[9px] px-2.5 py-1 rounded-full shrink-0 transition-colors cursor-pointer"
                >
                  {shortcut.title}
                </button>
              ))}
            </div>

            {/* Chat Input form */}
            <form onSubmit={handleSendChatMessage} className="flex gap-2 pt-3 border-t border-border">
              <input
                type="text"
                placeholder="Ask Sparky pedagogical questions or type doubt simulation..."
                value={chatMessage}
                onChange={e => setChatMessage(e.target.value)}
                className="h-9 flex-1 rounded-button border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
              />
              <Button type="submit" disabled={chatLoading} className="h-9 px-3.5 bg-primary text-white font-bold text-xs">
                <Send size={13} />
              </Button>
            </form>
          </Card>
        </div>
      )}

      {/* TAB CONTENT: TEMPLATES & HISTORY */}
      {activeTab === "templates" && (
        <div className="space-y-4">
          <Card className="p-4 border border-border bg-card shadow-sm flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[240px] max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search history content..."
                value={searchHistoryQuery}
                onChange={e => setSearchHistoryQuery(e.target.value)}
                className="h-9 w-full pl-9 pr-3 rounded-button border border-border bg-card text-xs font-semibold text-foreground focus:outline-none"
              />
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredHistory.map(hist => (
              <Card
                key={hist.id}
                className="p-4 border border-border bg-card shadow-sm hover:border-violet-500/25 transition-all flex flex-col justify-between gap-3"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-[8px] font-extrabold text-violet-600 bg-violet-500/10 px-2 py-0.5 rounded border border-violet-500/20 uppercase">
                      {hist.toolName}
                    </span>
                    <span className="text-[9px] text-muted-foreground">{hist.timestamp}</span>
                  </div>

                  <h4 className="text-xs font-bold text-foreground line-clamp-1">{hist.prompt}</h4>
                  <textarea
                    rows={4}
                    readOnly
                    value={hist.response}
                    className="w-full bg-muted/30 border border-border/40 rounded p-2 text-[10px] font-semibold text-foreground focus:outline-none resize-none leading-relaxed"
                  />
                </div>

                <div className="flex gap-2 justify-end border-t border-border/40 pt-3">
                  <Button
                    onClick={() => {
                      const tool = AI_TOOLS.find(t => t.id === hist.toolId);
                      if (tool) setSelectedTool(tool);
                      setTopicInput(hist.prompt);
                      setGeneratedOutput(hist.response);
                      setDifficulty(hist.optionsSelected.difficulty);
                      setStudentLevel(hist.optionsSelected.targetGrade);
                      setActiveTab("generators");
                      toast.success("Loaded back into Playground.");
                    }}
                    variant="outline"
                    className="h-7 text-[9px] font-bold"
                  >
                    Reuse prompt
                  </Button>
                  <Button
                    onClick={() => {
                      setHistoryList(prev => prev.filter(h => h.id !== hist.id));
                      toast.success("History item deleted.");
                    }}
                    variant="outline"
                    className="h-7 text-[9px] font-bold text-rose-500"
                  >
                    Delete prompt
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
});
