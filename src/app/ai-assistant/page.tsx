"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Send, Sparkles, User, Loader2, ArrowLeft, Lightbulb, HelpCircle, Clock,
  ClipboardList, Map, GraduationCap, Code, Languages, FileText, Brain, UserCheck,
  Briefcase, Layers, ThumbsUp, ThumbsDown, Copy, Check, Download, Trash2, Edit3,
  Pin, Volume2, VolumeX, Mic, MicOff, Image as ImageIcon, FileUp, FileCode, Plus,
  ChevronDown, Search, Star, MessageSquare
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

import { PageWrapper } from "../../components/layout/PageWrapper";
import { Container } from "../../components/layout/Container";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { cn } from "../../utils/cn";

function generateUniqueId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).substring(2, 9)}`;
}

interface ChatMessage {
  id: string;
  role: "user" | "ai";
  content: string;
  feedback?: "like" | "dislike" | null;
  modelUsed?: string;
  timestamp: string;
}

interface ChatSession {
  id: string;
  title: string;
  isPinned: boolean;
  messages: ChatMessage[];
  activeModule: string;
  activeModel: string;
}

// ─── 14 COMPLETE AI HUB MODULES ──────────────────────────────────────────────
const AI_MODULES = [
  { id: "study", title: "AI Study Assistant", desc: "Breakdown complex concepts, theories, and historical events easily.", category: "Academic", icon: <Brain size={16} className="text-primary" /> },
  { id: "homework", title: "AI Homework Solver", desc: "Get step-by-step guidance, outlines, and hint checklists.", category: "Academic", icon: <ClipboardList size={16} className="text-sky-500" /> },
  { id: "quiz", title: "AI Quiz Generator", desc: "Generate custom multiple choice tests to evaluate your knowledge.", category: "Academic", icon: <HelpCircle size={16} className="text-emerald-500" /> },
  { id: "notes", title: "AI Notes Generator", desc: "Summarize textbook chapters or lectures into structured review notes.", category: "Academic", icon: <FileText size={16} className="text-purple-500" /> },
  { id: "flashcards", title: "AI Flashcards Creator", desc: "Make active recall Q&A card decks for study revision.", category: "Creative", icon: <Layers size={16} className="text-rose-500" /> },
  { id: "planner", title: "AI Study Planner", desc: "Schedule dynamic revision blocks based on exam deadlines.", category: "Life Skills", icon: <Clock size={16} className="text-amber-500" /> },
  { id: "career", title: "AI Career Guidance", desc: "Align learning progress with high-salary roles & tutoring.", category: "Career", icon: <Briefcase size={16} className="text-indigo-500" /> },
  { id: "roadmap", title: "AI Learning Roadmap", desc: "Create structured week-by-week pathways to master skills.", category: "Career", icon: <Map size={16} className="text-orange-500" /> },
  { id: "programming", title: "AI Coding Helper", desc: "Debug programming code syntax and build widgets step-by-step.", category: "Programming", icon: <Code size={16} className="text-teal-500" /> },
  { id: "translator", title: "AI Language Translator", desc: "Translate text phrases and study pronunciation details.", category: "Language", icon: <Languages size={16} className="text-violet-500" /> },
  { id: "doubt", title: "AI Doubt Solver", desc: "Enter quick questions for direct peer-style clarification.", category: "Life Skills", icon: <Lightbulb size={16} className="text-yellow-600" /> },
  { id: "interview", title: "AI Interview Prep", desc: "Simulate coding interviews, behavioral mocks, and get tips.", category: "Career", icon: <UserCheck size={16} className="text-cyan-600" /> },
  { id: "resume", title: "AI Resume Reviewer", desc: "Upload details to match resume highlights with job specs.", category: "Career", icon: <GraduationCap size={16} className="text-blue-500" /> },
  { id: "prompt", title: "AI Prompt Coach", desc: "Master structuring LLM prompts using frameworks like Few-shot.", category: "Programming", icon: <Sparkles size={16} className="text-fuchsia-500" /> },
];

const SIDEBAR_CATEGORIES = [
  "Recently Used",
  "Favorites",
  "Trending",
  "Academic",
  "Programming",
  "Creative",
  "Music",
  "Photography",
  "Business",
  "Career",
  "Language",
  "Life Skills"
];

// ─── MODULE SPECIFIC DYNAMIC SUGGESTIONS ─────────────────────────────────────
const MODULE_SUGGESTIONS: Record<string, string[]> = {
  study: ["Explain Calculus", "Natya Shastra Theory", "Exposure Triangle basics", "Feyman Technique guidelines"],
  homework: ["Calculus Limits assignment", "Calculus Derivatives assignment", "React state hook error", "Spoken English phrase list"],
  quiz: ["Create Quiz", "Calculus MCQ Test", "Python Loops MCQ", "DSLR Shutter Speed Quiz"],
  notes: ["Summarize Notes", "Calculus limits key takeaways", " Natya Shastra mudras sheet", "Music major scale chord progression"],
  flashcards: ["Spoken Spanish flashcards", "Calculus formulas deck", "Keyboard octaves deck"],
  planner: ["Weekly Calculus study plan", "30-Day Python coding plan", "15-Day photography setup roadmap"],
  career: ["Career Guidance", "Full-stack developer salaries", " Extracurricular tutoring opportunities"],
  roadmap: ["Learning Python roadmap", "Becoming a Portrait Photographer roadmap", "Mastering Kuchipudi dance roadmap"],
  programming: ["Teach Python", "Debug React code", "Optimize SQL query", "Write Next.js custom router"],
  translator: ["Spanish greeting list", "German grammar tips", "Translate to Telugu"],
  doubt: ["Doubt: Shutter speed vs ISO", "Doubt: let vs var in block scopes", "Doubt: Area under curve in calculus"],
  interview: ["Behavioral mock prep", "Coding interview simulation", "React interview questions"],
  resume: ["Resume bullet points", "Resume design review", "Portfolio projects layout"],
  prompt: ["AI Prompt Writing", "R-C-T-C framework example", "Few-shot templates"],
};

// ─── 10 DETAILED INTERACTIVE CHAT PROMPT ANSWERS ──────────────────────────────
const PROMPT_ANSWERS: Record<string, string> = {
  "explain calculus": `### 📐 Understanding Calculus: Limits, Derivatives, & Integrals

Calculus is the study of how things change. It breaks down into two core areas:

1. **Differential Calculus (Derivatives):**
   - **What it is:** Measures the *instantaneous rate of change* (the slope of a curve at any single point).
   - **Formula:** \\( f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h} \\).
   - **Example:** If you drive a car, your speedometer shows your derivative (speed at that exact second), not your average trip speed.

2. **Integral Calculus (Integration):**
   - **What it is:** Accumulates quantities over time (finding the *exact area under a curve*).
   - **Formula:** \\( \\int f(x) \\, dx \\).
   - **Example:** Calculating the total distance traveled during a trip by integrating your speed graph.

**Real-world application:** Used extensively in machine learning (gradient descent algorithms to minimize loss function gradients!).`,

  "teach python": `### 🐍 Python Programming Essentials (Quickstart Guide)

Python is a high-level, human-readable language ideal for coding.

#### 1. Core Syntax Fundamentals
- **Variables & Data Types:**
  \`\`\`python
  name = "Surya"      # String
  age = 22            # Integer
  is_student = True   # Boolean
  \`\`\`

- **Lists & Dictionaries:**
  \`\`\`python
  skills = ["Python", "Photography", "Keyboard"]
  tutor_rates = {"Aarav": 800, "Sneha": 1500}
  \`\`\`

#### 2. Control Flow Loops
  \`\`\`python
  for skill in skills:
      print(f"I want to master {skill} on EduEarn!")
  \`\`\`

#### 3. Functions Structure
  \`\`\`python
  def calculate_earnings(hours, rate=1500):
      return hours * rate
  print(f"Earnings: ₹{calculate_earnings(5)}")
  \`\`\`

**Try it out:** Open your Python environment, copy this code, and run it!`,

  "create quiz": `### 🧠 Custom Practice MCQ Quiz

Here is a 3-question review test. Answer in the input box!

* **Question 1 (Mathematics):**
  What is the derivative of \\( f(x) = 5x + 3 \\)?
  - A) 5x
  - B) 5
  - C) 3
  - D) 0

* **Question 2 (Coding):**
  Which variable declaration in Javascript scopes variables block-wise?
  - A) var
  - B) let
  - C) define
  - D) global

* **Question 3 (Photography):**
  What parameter controls sensor sensitivity to ambient light?
  - A) Aperture
  - B) Shutter Speed
  - C) ISO
  - D) Focal Length

*Answer below by typing your answers (e.g. '1: B, 2: B, 3: C')!*`,

  "summarize notes": `### 📝 Structured Lecture Study Notes Summary

Here are core study notes distilled using the **Cornell Notes Method**:

- **Active Recall:** Instead of passive re-reading, close your textbook and write down everything you remember. This forces the brain to retrieve information.
- **Spaced Repetition:** Review notes at expanding intervals (1 day, 3 days, 7 days, 30 days) to combat the forgetting curve.
- **Feynman Technique:** Teach the concept in simple terms to a peer student or mock tutor. If you struggle, you've identified gaps in your understanding.
- **Gamification:** Reward yourself with study slots (e.g., earn 50 EduEarn coins upon finishing Python Module 3) to build momentum.`,

  "explain dance theory": `### 💃 Classical Indian Dance Theory (Natya Shastra)

Classical dance styles like **Kuchipudi** and **Bharatanatyam** are structured around classical theatrical manuals:

- **Nritta (Pure Dance):** Rhythmic footwork, coordination movements, and poses without dramatic mime representation.
- **Nritya (Expressive Dance):** Sentiments and moods conveyed through hand gestures (**Mudras**) and facial mime expression (**Abhinaya**).
- **Asamyuta Hastas:** Single hand gestures (e.g., *Pataka* represents a banner/cloud, *Tripataka* represents a crown or tree).
- **Samyuta Hastas:** Double hand gestures (e.g., *Anjali* gesture represents salutation/prayer).

**Concept Focus:** Mudra sync is crucial; practicing hand gestures daily improves muscle memory.`,

  "explain music theory": `### 🎹 Keyboard & Music Theory Fundamentals

Understanding notes and octaves is essential to play musical instruments.

- **Musical Notes Alphabet:** There are 12 notes in western music: C, C#, D, D#, E, F, F#, G, G#, A, A#, B.
- **Octaves Scale:** A group of 8 white keys containing 12 total semitones.
- **Major Scales Structure:** Unfolds using Tone-Tone-Semitone-Tone-Tone-Tone-Semitone interval sequence (e.g., C Major scale contains C-D-E-F-G-A-B-C with 0 sharps or flats).
- **Chord Progressions:** Chords represent multiple notes played simultaneously. The I-V-vi-IV chord progression is the foundation of modern pop songs (C Major, G Major, A Minor, F Major).`,

  "help with chess": `### ♟️ Chess Strategy & Openings Outline

Mastering chess requires studying openings, tactical checks, and endgames:

#### 1. Fundamental Chess Openings
- **Ruy Lopez (Spanish Opening):** 1. e4 e5 2. Nf3 Nc6 3. Bb5. Focuses on quick castling safety and controlling center files.
- **Sicilian Defense:** 1. e4 c5. Black fights for the center symmetrically using the c-pawn, leading to sharp tactical play.

#### 2. Tactical Patterns
- **Forks:** A single piece attacks two enemy pieces simultaneously (knights are famous for forks).
- **Pins:** A defending piece cannot move because it would expose a higher-value piece (e.g., queen or king) behind it.

**Endgame Rule:** Keep your king active in the center and escort passed pawns to promotion.`,

  "photography tips": `### 📸 DSLR Photography Masterclass Tips

Achieving professional exposure relies on balancing three parameters: the **Exposure Triangle**.

1. **Aperture (f-stop):**
   - Controls the lens opening size.
   - *Tip:* A lower f-stop (e.g., f/2.8) yields a shallow depth of field (blurry background portrait bokeh).

2. **Shutter Speed:**
   - How long the camera sensor is exposed to light.
   - *Tip:* Fast speed (e.g., 1/1000s) freezes action; slow speed (e.g., 1/2s) creates motion blur.

3. **ISO:**
   - Sensor sensitivity to ambient light.
   - *Tip:* Keep ISO low (100-400) in daylight to avoid digital noise/grain in photos.

**Rule of Thirds:** Align subjects along 3x3 grid intersections for natural framing.`,

  "ai prompt writing": `### 🤖 Advanced Prompt Engineering Guide

To get precise outcomes from LLMs (Gemini, ChatGPT), structure prompts using the **R-C-T-C framework**:

- **Role (Who):** Assign a specific persona (e.g., "Act as a Senior Python Code Tutor").
- **Context (Background):** Describe your scenario (e.g., "I am preparing for an interview at a tech company").
- **Task (What):** Outline requirements (e.g., "Explain list comprehension clearly with three code snippets").
- **Constraints (Limits):** Define constraints (e.g., "Do not use external libraries. Keep code snippets under 5 lines").

**Few-shot Technique:** Provide 2 examples of input-output pairings within your prompt to guide response styling.`,

  "career guidance": `### 💼 Career Guidance: Peer Learning to Internships

How to translate skills learned on EduEarn into career milestones:

1. **Skills Portfolio:** Code React modules, record photography portfolio clips, or dance coordination routines.
2. **Peer Tutoring:** Apply to become an AI-Verified Tutor on EduEarn. Teaching other students is a premium resume highlights booster.
3. **Freelance Gigs:** Offer single-subject packages on Upwork or local communities.
4. **Technical Internships:** Target junior developer or teaching assistant roles. Average packages for full-stack interns: ₹15,000–₹25,000/month.

**Focus path:** Start by building 2 high-quality projects to showcase your credentials.`,
};

export default function AiAssistantPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>("");
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeModule, setActiveModule] = useState<string>("study");
  const [activeModel, setActiveModel] = useState<string>("Sparky AI");
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const welcomeSeen = localStorage.getItem("eduearn_sparky_welcome_seen");
      if (!welcomeSeen) {
        setIsWelcomeOpen(true);
      }
    }
  }, []);

  const handleCloseWelcome = (accept: boolean) => {
    setIsWelcomeOpen(false);
    localStorage.setItem("eduearn_sparky_welcome_seen", "true");
    if (accept) {
      toast.success("Sparky AI activated! Ask your first question.");
    }
  };

  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    "Academic": true,
    "Programming": true,
    "Creative": true,
    "Career": true,
  });
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  
  // Voice Synthesis States
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>("");

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const loadVoices = () => {
      const allVoices = window.speechSynthesis.getVoices();
      const engVoices = allVoices.filter(v => v.lang.toLowerCase().includes("en"));
      setVoices(engVoices);
      
      const bestVoice = engVoices.find(v => {
        const name = v.name.toLowerCase();
        return (name.includes("natural") || name.includes("google") || name.includes("samantha") || name.includes("zira") || name.includes("hazel") || name.includes("siri")) && (name.includes("female") || name.includes("samantha") || name.includes("zira") || name.includes("siri") || name.includes("hazel"));
      }) || engVoices.find(v => {
        const name = v.name.toLowerCase();
        return name.includes("female") || name.includes("samantha") || name.includes("zira") || name.includes("siri") || name.includes("hazel");
      }) || engVoices[0];

      if (bestVoice) {
        setSelectedVoiceName(bestVoice.name);
      }
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);
  
  // Voice Recognition states
  const [isListening, setIsListening] = useState(false);
  const [voiceOutputEnabled, setVoiceOutputEnabled] = useState(false);

  // File Upload states
  const [attachedFiles, setAttachedFiles] = useState<{ name: string; type: "image" | "pdf" | "code" }[]>([]);

  // Favorite Prompts
  const [favoritePrompts] = useState<string[]>([
    "Explain Calculus",
    "Teach Python",
    "Create Quiz"
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Load chat sessions from local storage
  useEffect(() => {
    const stored = localStorage.getItem("eduearn_ai_sessions");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.length > 0) {
          setSessions(parsed);
          setActiveSessionId(parsed[0].id);
          setActiveModule(parsed[0].activeModule || "study");
          setActiveModel(parsed[0].activeModel || "Sparky AI");
          return;
        }
      } catch {
        // Fallback
      }
    }
    // Initialize default session
    const defaultSession: ChatSession = {
      id: "session-1",
      title: "New AI Study Chat",
      isPinned: false,
      activeModule: "study",
      activeModel: "Sparky AI",
      messages: [
        {
          id: "msg-init",
          role: "ai",
          content: "Hello! I am your EduEarn AI Learning Hub. Select any specialty tool card below or ask me any question. I can help with academic subjects, music, coding, dance, photography, and career advice!",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]
    };
    setSessions([defaultSession]);
    setActiveSessionId(defaultSession.id);
  }, []);

  // Save sessions to local storage
  const saveSessions = (updated: ChatSession[]) => {
    setSessions(updated);
    localStorage.setItem("eduearn_ai_sessions", JSON.stringify(updated));
  };

  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];

  useEffect(() => {
    if (activeSession && activeSession.messages.length > 1) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [activeSession?.messages?.length]);

  // Create new chat session
  const handleCreateNewChat = () => {
    const newId = generateUniqueId("session");
    const newSession: ChatSession = {
      id: newId,
      title: `Chat Session #${sessions.length + 1}`,
      isPinned: false,
      activeModule: activeModule,
      activeModel: activeModel,
      messages: [
        {
          id: generateUniqueId("msg"),
          role: "ai",
          content: `Activated ${AI_MODULES.find(m => m.id === activeModule)?.title || "Sparky AI"}. How can I guide you today?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]
    };
    const updated = [newSession, ...sessions];
    saveSessions(updated);
    setActiveSessionId(newId);
    toast.success("Created new chat session");
  };

  // Launch AI Tool Module
  const handleLaunchModule = (moduleId: string, moduleTitle: string) => {
    setActiveModule(moduleId);
    if (!activeSession) return;
    
    const welcomeMsg = `Hello! I have activated the **${moduleTitle}** module. Ask me your questions or upload materials.`;
    const updatedMessages: ChatMessage[] = [
      ...activeSession.messages,
      {
        id: generateUniqueId("module"),
        role: "ai",
        content: welcomeMsg,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];

    const updated = sessions.map(s => s.id === activeSessionId ? { ...s, activeModule: moduleId, messages: updatedMessages } : s);
    saveSessions(updated);
    toast.success(`Activated ${moduleTitle}`);
  };

  const speakText = (text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[^a-zA-Z0-9\s.,]/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanText.substring(0, 300));
    if (selectedVoiceName) {
      const voice = voices.find(v => v.name === selectedVoiceName);
      if (voice) {
        utterance.voice = voice;
      }
    }
    window.speechSynthesis.speak(utterance);
  };

  // Chat Submission handler
  const handleSendMessage = useCallback(
    async (textToSend: string) => {
      if ((!textToSend.trim() && attachedFiles.length === 0) || isStreaming || !activeSession) return;

      const userText = textToSend.trim();
      setInput("");
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      // Build attachment textual descriptions if files exist
      let enrichedText = userText;
      if (attachedFiles.length > 0) {
        const fileNames = attachedFiles.map(f => `[File Attachment: ${f.name} (${f.type})]`).join(", ");
        enrichedText = enrichedText ? `${enrichedText}\n\n${fileNames}` : fileNames;
      }
      setAttachedFiles([]);

      const userMsg: ChatMessage = {
        id: generateUniqueId("user"),
        role: "user",
        content: enrichedText,
        timestamp: timeStr
      };

      const withUserMessages = [...activeSession.messages, userMsg];

      // Update session title dynamically if it was a default placeholder
      let nextTitle = activeSession.title;
      if (activeSession.title.startsWith("New AI") || activeSession.title.startsWith("Chat Session")) {
        nextTitle = userText.length > 25 ? userText.substring(0, 22) + "..." : userText;
      }

      // Add dummy AI response block to stream
      const aiMsgId = generateUniqueId("ai");
      const aiPlaceholderMsg: ChatMessage = {
        id: aiMsgId,
        role: "ai",
        content: "AI is thinking...",
        modelUsed: activeModel,
        timestamp: timeStr
      };

      const withAiPlaceholder = [...withUserMessages, aiPlaceholderMsg];
      
      const intermediateSessions = sessions.map(s => 
        s.id === activeSessionId 
          ? { ...s, title: nextTitle, messages: withAiPlaceholder } 
          : s
      );
      setSessions(intermediateSessions);
      setIsStreaming(true);

      try {
        const res = await fetch("/api/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: userText,
            module: activeModule,
          }),
        });

        if (!res.ok) throw new Error("API call failed");

        const data = await res.json();
        const responseText = data.text || "No response received.";

        let currentText = "";
        const words = responseText.split(" ");
        let wordIdx = 0;

        const interval = setInterval(() => {
          if (wordIdx < words.length) {
            currentText += (wordIdx === 0 ? "" : " ") + words[wordIdx];
            setSessions(prev =>
              prev.map(s => 
                s.id === activeSessionId 
                  ? {
                      ...s,
                      messages: s.messages.map(msg => msg.id === aiMsgId ? { ...msg, content: currentText } : msg)
                    }
                  : s
              )
            );
            wordIdx++;
          } else {
            clearInterval(interval);
            setIsStreaming(false);
            if (voiceOutputEnabled) {
              speakText(currentText);
            }
            // Save final session changes to localstorage
            localStorage.setItem("eduearn_ai_sessions", JSON.stringify(
              sessions.map(s => 
                s.id === activeSessionId 
                  ? {
                      ...s,
                      title: nextTitle,
                      messages: s.messages.map(msg => msg.id === aiMsgId ? { ...msg, content: currentText } : msg)
                    }
                  : s
              )
            ));
          }
        }, 15);
      } catch (err) {
        console.error("AI Assistant API error:", err);
        setIsStreaming(false);
        toast.error("AI service error. Please try again.");
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isStreaming, activeSession, activeModel, activeModule, sessions, activeSessionId, voiceOutputEnabled, attachedFiles]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(input);
  };

  // Copy code/text helper
  const handleCopyText = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Text copied to clipboard");
  };

  // Liked/Disliked reactions
  const handleFeedback = (msgId: string, rating: "like" | "dislike") => {
    if (!activeSession) return;
    const updatedMsgs = activeSession.messages.map(m => m.id === msgId ? { ...m, feedback: m.feedback === rating ? null : rating } : m);
    const updated = sessions.map(s => s.id === activeSessionId ? { ...s, messages: updatedMsgs } : s);
    saveSessions(updated);
    toast.success("Feedback submitted. Thank you!");
  };

  // Chat PDF downloader
  const downloadChatPDF = (chatTitle: string, chatMessages: ChatMessage[]) => {
    const textContent = chatMessages.map(m => `[${m.role.toUpperCase()} - ${m.timestamp}]\n${m.content}`).join("\n\n------------------------------\n\n");
    const blob = new Blob([textContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${chatTitle.replace(/\s+/g, "_")}_transcript.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success("Downloaded chat log transcript.");
  };



  // Web Speech API Voice Recognition
  const handleToggleVoiceInput = () => {
    if (isListening) {
      setIsListening(false);
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    } else {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        toast.error("Web Speech API is not supported in this browser.");
        return;
      }

      setIsListening(true);
      toast.info("Listening... Speak now");

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        toast.success(`Voice transcribed: "${transcript}"`);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        toast.error(`Voice recognition error: ${event.error}`);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
      recognitionRef.current = recognition;
    }
  };

  // Attachment upload simulator
  const triggerAttachment = (type: "image" | "pdf" | "code") => {
    const name = type === "image" ? "calculus_problems.jpg" : type === "pdf" ? "react_hooks_notes.pdf" : "widget.py";
    setAttachedFiles(prev => [...prev, { name, type }]);
    toast.success(`Attached ${name}`);
  };

  // Rename Session Title
  const handleRenameSession = (id: string) => {
    if (!editingTitle.trim()) return;
    const updated = sessions.map(s => s.id === id ? { ...s, title: editingTitle.trim() } : s);
    saveSessions(updated);
    setEditingSessionId(null);
    toast.success("Chat renamed successfully");
  };

  // Pin Chat
  const handlePinSession = (id: string) => {
    const updated = sessions.map(s => s.id === id ? { ...s, isPinned: !s.isPinned } : s);
    // Sort pinned to the top
    const sorted = [...updated].sort((a, b) => (a.isPinned === b.isPinned ? 0 : a.isPinned ? -1 : 1));
    saveSessions(sorted);
    toast.success("Pin configuration updated");
  };

  // Delete Chat
  const handleDeleteSession = (id: string) => {
    if (sessions.length <= 1) {
      toast.error("Cannot delete the only remaining session");
      return;
    }
    const updated = sessions.filter(s => s.id !== id);
    saveSessions(updated);
    if (activeSessionId === id) {
      setActiveSessionId(updated[0].id);
    }
    toast.success("Chat session deleted");
  };

  // Clear Chat history inside session
  const handleClearSession = () => {
    if (!activeSession) return;
    const updated: ChatSession[] = sessions.map(s => s.id === activeSessionId ? { ...s, messages: [
      {
        id: generateUniqueId("msg"),
        role: "ai",
        content: "Chat cleared. Ask me anything to begin again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ] } : s);
    saveSessions(updated);
    toast.info("Session history cleared");
  };

  // Toggle categories list
  const toggleCategoryExpand = (cat: string) => {
    setExpandedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  return (
    <PageWrapper>
      <div className="min-h-[90vh] py-8 bg-background relative text-left select-none">
        
        {/* Background ambient radial gradients */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.06),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.04),transparent_35%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.12),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.06),transparent_40%)]"
        />

        <Container className="max-w-[1400px] relative z-10 flex flex-col gap-6">
          
          {/* Header Panel */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-primary mb-1 select-none">
                <Sparkles size={14} className="animate-pulse text-yellow-400" />
                <span>✨ Sparky AI Learning Suite</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-heading font-extrabold text-foreground tracking-tight">
                ✨ Sparky AI Hub
              </h1>
              <p className="text-xs text-muted-foreground">
                Overlord chat models, simulated workspace environments, voice integrations, and dynamic prompt suggestions.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <Link href="/" passHref>
                <Button variant="outline" size="sm" className="h-9 text-xs font-bold gap-2">
                  <ArrowLeft size={13} />
                  Home
                </Button>
              </Link>
            </div>
          </div>

          {/* MAIN COLUMN OVERVIEW */}
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 items-start">
            
            {/* LEFT SIDEBAR - COLLAPSIBLE MODULE CATEGORIES & CONVERSATIONS */}
            <div className="flex flex-col gap-4">
              
              {/* Active Sessions Panel */}
              <Card variant="glass" className="p-4 border-border/40 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <MessageSquare size={14} className="text-primary" />
                    Recent Chats
                  </span>
                  <button
                    onClick={handleCreateNewChat}
                    className="p-1 hover:bg-muted text-primary hover:text-primary-dark rounded transition-colors focus:outline-none"
                    title="New Chat Session"
                  >
                    <Plus size={15} />
                  </button>
                </div>

                <div className="flex flex-col gap-1.5 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
                  {sessions.map((s) => {
                    const isSelected = s.id === activeSessionId;
                    return (
                      <div
                        key={s.id}
                        className={cn(
                          "group flex items-center justify-between p-2 rounded-lg text-xs font-bold border transition-all cursor-pointer",
                          isSelected
                            ? "bg-primary/10 border-primary text-primary"
                            : "bg-muted/30 border-transparent text-muted-foreground hover:bg-muted/65 hover:text-foreground"
                        )}
                        onClick={() => {
                          setActiveSessionId(s.id);
                          setActiveModule(s.activeModule || "study");
                        }}
                      >
                        {editingSessionId === s.id ? (
                          <input
                            type="text"
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleRenameSession(s.id)}
                            onBlur={() => handleRenameSession(s.id)}
                            className="bg-card border border-border shadow-sm hover:shadow-md transition-shadow duration-200 text-foreground px-1 py-0.5 rounded text-[11px] font-semibold w-2/3"
                            autoFocus
                          />
                        ) : (
                          <div className="flex items-center gap-1.5 truncate max-w-[70%]">
                            {s.isPinned && <Pin size={10} className="text-primary rotate-45" />}
                            <span className="truncate">{s.title}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingSessionId(s.id);
                              setEditingTitle(s.title);
                            }}
                            className="p-0.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground"
                            title="Rename"
                          >
                            <Edit3 size={11} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePinSession(s.id);
                            }}
                            className="p-0.5 hover:bg-muted rounded text-muted-foreground hover:text-primary"
                            title="Pin Chat"
                          >
                            <Pin size={11} className={s.isPinned ? "fill-primary text-primary" : ""} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSession(s.id);
                            }}
                            className="p-0.5 hover:bg-muted rounded text-muted-foreground hover:text-destructive"
                            title="Delete"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Collapsible Specialty Modules list */}
              <Card variant="glass" className="p-4 border-border/40 flex flex-col gap-4">
                <span className="text-xs font-bold text-foreground select-none uppercase tracking-wider">
                  Specialty Modules
                </span>

                {["Academic", "Programming", "Creative", "Career", "Language", "Life Skills"].map((cat) => {
                  const isExpanded = expandedCategories[cat];
                  const modulesInCat = AI_MODULES.filter(m => m.category === cat);
                  return (
                    <div key={cat} className="space-y-1.5" role="group" aria-label={cat}>
                      <button
                        onClick={() => toggleCategoryExpand(cat)}
                        className="w-full flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wide text-muted-foreground hover:text-foreground focus:outline-none"
                      >
                        <span>{cat}</span>
                        <ChevronDown size={12} className={cn("transition-transform duration-200", isExpanded && "rotate-180")} />
                      </button>

                      {isExpanded && (
                        <div className="flex flex-col gap-1 pl-2 border-l border-border/30">
                          {modulesInCat.map((mod) => (
                            <button
                              key={mod.id}
                              onClick={() => handleLaunchModule(mod.id, mod.title)}
                              className={cn(
                                "w-full text-left p-1.5 rounded text-[11px] font-bold flex items-center gap-2 transition-colors",
                                activeModule === mod.id
                                  ? "bg-primary/5 text-primary"
                                  : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                              )}
                            >
                              <div className="shrink-0">{mod.icon}</div>
                              <span className="truncate">{mod.title}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </Card>
            </div>

            {/* RIGHT MAIN PANEL - INTERACTIVE CHAT WINDOW & SPECIALTY CARDS */}
            <div className="flex flex-col gap-6">
              
              {/* PREMIUM AI FEATURE MODULES GRID */}
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground select-none">
                  AI Specialty Tool Suite
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
                  {AI_MODULES.slice(0, 4).map((mod) => {
                    const isActive = activeModule === mod.id;
                    return (
                      <Card
                        key={mod.id}
                        onClick={() => handleLaunchModule(mod.id, mod.title)}
                        variant="glass"
                        className={cn(
                          "p-4 cursor-pointer relative group flex flex-col justify-between h-[125px] hover-premium-card border",
                          isActive
                            ? "border-primary bg-primary/10 shadow-soft"
                            : "border-border/60"
                        )}
                      >
                        {/* Upper Details */}
                        <div className="flex items-start gap-2.5 text-left">
                          <div className="w-8 h-8 rounded-full bg-muted dark:bg-muted/45 flex items-center justify-center shrink-0 border border-border/30">
                            {mod.icon}
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-foreground group-hover:text-primary transition-colors leading-tight">
                              {mod.title}
                            </h4>
                            <p className="text-[10px] text-muted-foreground leading-normal mt-1 line-clamp-2">
                              {mod.desc}
                            </p>
                          </div>
                        </div>

                        {/* Status tag */}
                        <div className="flex items-center gap-1.5 select-none text-[9px] font-bold text-emerald-500 bg-emerald-500/5 px-2 py-0.5 rounded w-fit border border-emerald-500/10">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span>● Ready</span>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {/* CHAT WINDOW & PROMPT SUGGESTIONS ROW */}
              <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-6">
                
                {/* Main Chat Box */}
                <Card variant="glass" className="h-[600px] border-border/40 flex flex-col overflow-hidden bg-card/65 dark:bg-card/45 shadow-premium">
                  
                  {/* Status header */}
                  <div className="px-4 py-3 bg-muted/20 border-b border-border/40 flex items-center justify-between shrink-0 select-none">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-500">
                        {AI_MODULES.find(m => m.id === activeModule)?.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Clear Session */}
                      <button
                        onClick={handleClearSession}
                        className="p-1 hover:bg-muted rounded text-[9px] font-bold text-muted-foreground hover:text-foreground cursor-pointer focus:outline-none uppercase border border-border/40"
                      >
                        Clear Chat
                      </button>

                      {/* Download PDF */}
                      <button
                        onClick={() => downloadChatPDF(activeSession.title, activeSession.messages)}
                        className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-primary cursor-pointer focus:outline-none border border-border/40"
                        title="Download Chat PDF"
                      >
                        <Download size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Messages list */}
                  <div className="flex-grow overflow-y-auto p-4 space-y-4 scrollbar-thin">
                    {activeSession?.messages.map((msg) => {
                      const isAi = msg.role === "ai";
                      return (
                        <div
                          key={msg.id}
                          className={cn("flex w-full", isAi ? "justify-start" : "justify-end")}
                        >
                          <div className={cn("flex gap-3 max-w-[85%]", isAi ? "flex-row" : "flex-row-reverse")}>
                            
                            {/* Avatar */}
                            <div className={cn(
                              "w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-1 shadow-soft border",
                              isAi
                                ? "bg-primary/10 text-primary border-primary/20"
                                : "bg-muted text-muted-foreground border-border/40"
                            )}>
                              {isAi ? <Sparkles size={13} className="text-yellow-300 fill-current animate-pulse" /> : <User size={13} />}
                            </div>

                            {/* Content Bubble */}
                            <div className="space-y-1">
                              <div className={cn(
                                "p-3.5 rounded-2xl text-xs leading-relaxed font-semibold shadow-soft text-left",
                                isAi
                                  ? "bg-card border border-border shadow-sm hover:shadow-md transition-shadow duration-200 text-foreground rounded-tl-none"
                                  : "bg-primary text-white rounded-tr-none"
                              )}>
                                {msg.content.split("\n").map((line, lineIdx) => {
                                  // Simple Markdown heading parsing
                                  if (line.startsWith("### ")) {
                                    return <h4 key={lineIdx} className="font-extrabold text-sm mb-1.5 mt-2.5 text-foreground dark:text-foreground">{line.replace("### ", "")}</h4>;
                                  }
                                  if (line.startsWith("#### ")) {
                                    return <h5 key={lineIdx} className="font-bold text-xs mb-1 mt-2 text-foreground dark:text-foreground">{line.replace("#### ", "")}</h5>;
                                  }
                                  if (line.startsWith("- ")) {
                                    return <li key={lineIdx} className="ml-3 mb-1.5 list-disc leading-relaxed">{line.replace("- ", "")}</li>;
                                  }
                                  if (line.startsWith("* ")) {
                                    return <li key={lineIdx} className="ml-3 mb-1.5 list-disc leading-relaxed">{line.replace("* ", "")}</li>;
                                  }

                                  // Code blocks renderer
                                  if (line.startsWith("```")) {
                                    return null;
                                  }

                                  // Check if line represents markdown table headers or rows
                                  if (line.includes("|")) {
                                    const cells = line.split("|").map(c => c.trim()).filter(Boolean);
                                    if (cells.length > 0 && !line.includes("---")) {
                                      return (
                                        <div key={lineIdx} className="grid grid-cols-4 gap-2 bg-muted/40 p-2 border-b border-border/30 font-bold text-[9px] tracking-wide text-foreground">
                                          {cells.map((cell, cellIdx) => (
                                            <span key={cellIdx} className="truncate">{cell}</span>
                                          ))}
                                        </div>
                                      );
                                    }
                                    return null;
                                  }

                                  const safeLine = line
                                    .replace(/&/g, "&amp;")
                                    .replace(/</g, "&lt;")
                                    .replace(/>/g, "&gt;")
                                    .replace(/"/g, "&quot;")
                                    .replace(/'/g, "&#039;")
                                    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                                    .replace(/\*(.*?)\*/g, "<em>$1</em>")
                                    .replace(/\`(.*?)\`/g, '<code class="bg-muted/65 px-1 py-0.5 rounded text-[10px] border border-border font-mono">$1</code>');

                                  return (
                                    <p
                                      key={lineIdx}
                                      className="mb-1.5 last:mb-0 leading-relaxed"
                                      dangerouslySetInnerHTML={{
                                        __html: safeLine,
                                      }}
                                    />
                                  );
                                })}
                              </div>

                              {/* Interaction controls for AI responses */}
                              {isAi && msg.id !== "msg-init" && (
                                <div className="flex items-center gap-2 text-[9px] font-bold text-muted-foreground/60 select-none pl-1">
                                  {/* Like */}
                                  <button
                                    onClick={() => handleFeedback(msg.id, "like")}
                                    className={cn("hover:text-emerald-500 p-0.5", msg.feedback === "like" && "text-emerald-500")}
                                  >
                                    <ThumbsUp size={11} className={msg.feedback === "like" ? "fill-current" : ""} />
                                  </button>

                                  {/* Dislike */}
                                  <button
                                    onClick={() => handleFeedback(msg.id, "dislike")}
                                    className={cn("hover:text-red-500 p-0.5", msg.feedback === "dislike" && "text-red-500")}
                                  >
                                    <ThumbsDown size={11} className={msg.feedback === "dislike" ? "fill-current" : ""} />
                                  </button>

                                  <span className="text-muted-foreground">•</span>

                                  {/* Copy */}
                                  <button
                                    onClick={() => handleCopyText(msg.content)}
                                    className="hover:text-primary flex items-center gap-0.5"
                                  >
                                    <Copy size={10} />
                                    Copy
                                  </button>

                                  <span className="text-muted-foreground">•</span>

                                  {/* Regenerate */}
                                  <button
                                    onClick={() => handleSendMessage(activeSession.messages[activeSession.messages.length - 2]?.content || "")}
                                    className="hover:text-primary"
                                  >
                                    Regenerate
                                  </button>

                                  {msg.modelUsed && (
                                    <>
                                      <span className="text-muted-foreground">•</span>
                                      <span className="text-[8px] tracking-wider uppercase font-mono text-muted-foreground/50">{msg.modelUsed}</span>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>

                          </div>
                        </div>
                      );
                    })}

                        {/* Simulated typing dot animation */}
                    {isStreaming && activeSession.messages[activeSession.messages.length - 1].role === "user" && (
                      <div className="flex justify-start">
                        <div className="flex gap-3">
                          <div className="w-7 h-7 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0 mt-1">
                             <Sparkles size={13} className="text-yellow-300 fill-current animate-pulse" />
                          </div>
                          <div className="p-3 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow duration-200 rounded-tl-none flex items-center gap-1.5 h-[38px] shadow-soft">
                            <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                            <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                            <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Attachment Previews */}
                  {attachedFiles.length > 0 && (
                    <div className="px-4 py-2 bg-muted/20 border-t border-border/40 flex items-center gap-2 flex-wrap">
                      {attachedFiles.map((file, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-1.5 bg-card border border-border shadow-sm hover:shadow-md transition-shadow duration-200/60 rounded px-2.5 py-1 text-[10px] font-bold text-foreground"
                        >
                          {file.type === "image" ? <ImageIcon size={11} className="text-emerald-500" /> : file.type === "pdf" ? <FileUp size={11} className="text-red-500" /> : <FileCode size={11} className="text-teal-500" />}
                          <span className="truncate max-w-[120px]">{file.name}</span>
                          <button
                            onClick={() => setAttachedFiles(p => p.filter((_, i) => i !== idx))}
                            className="text-muted-foreground hover:text-destructive font-black ml-1 cursor-pointer focus:outline-none"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Input area & Upload control triggers */}
                  <div className="p-4 border-t border-border/40 bg-muted/10 shrink-0">
                    <form onSubmit={handleSubmit} className="relative flex items-center">
                      
                      {/* Sim File Upload triggers */}
                      <div className="absolute left-4 flex items-center gap-1.5 z-15">
                        <button
                          type="button"
                          onClick={() => triggerAttachment("image")}
                          className="p-1 hover:bg-muted text-muted-foreground hover:text-emerald-500 rounded transition-colors cursor-pointer"
                          title="Attach Image"
                        >
                          <ImageIcon size={14} />
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => triggerAttachment("pdf")}
                          className="p-1 hover:bg-muted text-muted-foreground hover:text-red-500 rounded transition-colors cursor-pointer"
                          title="Attach PDF Document"
                        >
                          <FileUp size={14} />
                        </button>

                        <button
                          type="button"
                          onClick={() => triggerAttachment("code")}
                          className="p-1 hover:bg-muted text-muted-foreground hover:text-teal-500 rounded transition-colors cursor-pointer"
                          title="Attach Code File"
                        >
                          <FileCode size={14} />
                        </button>
                      </div>

                      <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={isStreaming ? "AI Study Companion is generating..." : "Type your study question here..."}
                        disabled={isStreaming}
                        className="w-full bg-card border border-border shadow-sm hover:shadow-md transition-shadow duration-200 rounded-full py-3.5 pl-28 pr-28 text-xs font-semibold text-foreground focus:outline-none focus:border-primary/50 shadow-inner disabled:opacity-50 transition-colors"
                      />

                      {/* Microphone Voice & submission controls */}
                      <div className="absolute right-3 flex items-center gap-1.5">
                        {/* Voice Input */}
                        <button
                          type="button"
                          onClick={handleToggleVoiceInput}
                          className={cn(
                            "p-1.5 rounded-full hover:bg-muted transition-colors cursor-pointer",
                            isListening ? "text-red-500 bg-red-500/10" : "text-muted-foreground"
                          )}
                          title="Voice Input"
                        >
                          {isListening ? <Mic size={14} className="animate-bounce" /> : <Mic size={14} />}
                        </button>

                        {/* Voice Output */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setVoiceOutputEnabled(!voiceOutputEnabled);
                              toast.success(!voiceOutputEnabled ? "Text-to-speech enabled for responses" : "Text-to-speech disabled");
                            }}
                            className={cn(
                              "p-1.5 rounded-full hover:bg-muted transition-colors cursor-pointer",
                              voiceOutputEnabled ? "text-primary bg-primary/10" : "text-muted-foreground"
                            )}
                            title="Voice Output Tts"
                          >
                            {voiceOutputEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
                          </button>
                          {voiceOutputEnabled && voices.length > 0 && (
                            <select
                              value={selectedVoiceName}
                              onChange={(e) => setSelectedVoiceName(e.target.value)}
                              className="text-[9px] bg-card border border-border rounded px-1.5 py-0.5 font-bold text-foreground focus:outline-none max-w-[80px] truncate"
                              title="Select TTS Voice"
                            >
                              {voices.map((v) => (
                                <option key={v.name} value={v.name}>
                                  {v.name.replace("Microsoft", "").replace("Google", "").trim()}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>

                        <button
                          type="submit"
                          disabled={(!input.trim() && attachedFiles.length === 0) || isStreaming}
                          className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors focus:outline-none">
                          {isStreaming ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} className="ml-0.5" />}
                        </button>
                      </div>

                    </form>
                  </div>
                </Card>

                {/* Sidebar category matching dynamic suggested prompts */}
                <div className="space-y-4">
                  <Card variant="glass" className="p-4 border-border/40 space-y-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                      <Lightbulb size={15} className="text-amber-500" />
                      <span>Suggested Prompts</span>
                    </div>

                    <div className="flex flex-col gap-2 max-h-[350px] overflow-y-auto pr-1">
                      {(MODULE_SUGGESTIONS[activeModule] || ["Explain Calculus", "Teach Python", "Create Quiz"]).map((promptText, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSendMessage(promptText)}
                          disabled={isStreaming}
                          className="text-left p-2.5 bg-card/90 hover:bg-primary/10 text-foreground hover:text-primary rounded-xl text-xs font-semibold border border-border/60 hover:border-primary/40 transition-all cursor-pointer focus:outline-none shadow-xs"
                        >
                          ⚡ {promptText}
                        </button>
                      ))}
                    </div>
                  </Card>

                  {/* Favorite Prompts List */}
                  <Card variant="glass" className="p-4 border-border/40 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <Star size={14} className="fill-amber-500 text-amber-500" />
                        Favorite Prompts
                      </span>
                    </div>

                    <div className="flex flex-col gap-2">
                      {favoritePrompts.map((fav, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(fav)}
                          disabled={isStreaming}
                          className="text-left p-2 bg-card/80 hover:bg-primary/10 text-foreground hover:text-primary rounded-lg text-xs font-semibold border border-border/50 hover:border-primary/40 transition-colors shadow-xs"
                        >
                          ⭐ {fav}
                        </button>
                      ))}
                    </div>
                  </Card>
                </div>

              </div>

            </div>

          </div>

        </Container>
      </div>

      <AnimatePresence>
        {isWelcomeOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-md w-full bg-card border border-border shadow-premium rounded-3xl p-6 flex flex-col gap-4 text-xs font-semibold text-foreground"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Sparkles size={20} className="animate-pulse" />
                </div>
                <div>
                  <h2 className="text-sm font-heading font-extrabold text-foreground">
                    Welcome to Sparky AI!
                  </h2>
                  <p className="text-[9px] text-muted-foreground mt-0.5">
                    Your personalized student assistant.
                  </p>
                </div>
              </div>

              <div className="h-px w-full bg-border/50" />

              <div className="space-y-3 leading-relaxed text-left text-muted-foreground">
                <p className="font-bold text-foreground">
                  ✨ Hi! I&apos;m Sparky AI, your personal study companion.
                </p>
                <p>I can help you with:</p>
                <ul className="space-y-1.5 pl-1.5">
                  <li className="flex items-center gap-2">
                    <span className="text-primary">•</span> Course explanations
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary">•</span> Assignments
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary">•</span> Quiz generation
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary">•</span> Learning roadmaps
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary">•</span> Resume review
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary">•</span> Interview preparation
                    </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary">•</span> Career guidance
                  </li>
                </ul>
              </div>

              <div className="flex items-center justify-end gap-2.5 border-t border-border/50 pt-4 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCloseWelcome(false)}
                  className="font-bold text-[10px]"
                >
                  Maybe Later
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleCloseWelcome(true)}
                  className="font-bold text-[10px]"
                >
                  Ask Sparky
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PageWrapper>
  );
}
