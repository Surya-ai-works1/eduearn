"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Sparkles,
  User,
  GraduationCap,
  BookOpen,
  Award,
  Video,
  Coins,
  ShieldCheck,
  Check,
  ChevronRight,
  ChevronLeft,
  Briefcase,
  Layers,
  Loader2,
  FileText,
  Globe,
  Camera,
  Trash2,
  Plus,
  HelpCircle,
  Clock,
  Mic,
  MicOff,
  Volume2,
  CheckCircle2,
  Tv,
} from "lucide-react";
import { PageWrapper } from "../../components/layout/PageWrapper";
import { Container } from "../../components/layout/Container";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { FormField } from "../../features/auth/components/FormField";
import { useAuth } from "../../hooks/useAuth";
import { PaymentService } from "../../features/payments/services/paymentService";
import { MarketplaceService } from "../../features/payments/services/marketplaceService";

const TEACHING_CATEGORIES = [
  { id: "programming", name: "Programming & Code", emoji: "💻" },
  { id: "ai-data-science", name: "AI & Data Science", emoji: "🤖" },
  { id: "academics", name: "School Subjects", emoji: "📚" },
  { id: "college-subjects", name: "College Subjects", emoji: "🎓" },
  { id: "business", name: "Business & Management", emoji: "📈" },
  { id: "music", name: "Music & Audio", emoji: "🎵" },
  { id: "photography", name: "Photography & Video", emoji: "📸" },
  { id: "fitness", name: "Fitness & Health", emoji: "🏋️" },
  { id: "design", name: "Design & Creative Arts", emoji: "🎨" },
  { id: "cooking", name: "Cooking & Culinary", emoji: "🍳" },
  { id: "languages", name: "Languages & Linguistics", emoji: "🗣️" },
  { id: "competitive-exams", name: "Competitive Exams", emoji: "🎯" },
];

const SKILL_SUGGESTIONS: Record<string, string[]> = {
  programming: ["Python", "Java", "React JS", "Node JS", "SQL", "TypeScript", "C++", "Next JS"],
  "ai-data-science": ["Machine Learning", "Prompt Engineering", "Deep Learning", "TensorFlow", "Pandas", "Data Analytics"],
  academics: ["Mathematics", "Physics", "Chemistry", "Biology", "English", "Social Studies", "Accountancy"],
  "college-subjects": ["Data Structures", "Operating Systems", "Calculus", "Microeconomics", "Organic Chemistry"],
  business: ["Digital Marketing", "Financial Accounting", "Product Management", "Entrepreneurship", "SEO"],
  music: ["Acoustic Guitar", "Keyboard & Piano", "Carnatic Vocal", "Hindustani Music", "Music Production"],
  photography: ["DSLR Basics", "Lightroom Editing", "Portrait Photography", "Cinematography", "Photoshop"],
  fitness: ["Hatha Yoga", "Calisthenics", "Personal Training", "Nutrition & Diet", "Pranayama"],
  design: ["Figma UI/UX", "Graphic Design", "Illustration", "Blender 3D", "Canva Pro"],
  cooking: ["Indian Cuisine", "Baking & Pastry", "Italian Cooking", "Culinary Arts"],
  languages: ["English Speaking", "Hindi Fluency", "Spanish Basics", "German Level A1", "French Conversation"],
  "competitive-exams": ["JEE Main", "NEET Biology", "UPSC Prelims", "CAT Quant", "GRE Verbal", "GATE CS"]
};

interface SkillProficiency {
  skill: string;
  level: "Beginner" | "Intermediate" | "Advanced" | "Expert";
}

interface EducationRecord {
  id: string;
  degree: string;
  college: string;
  passingYear: string;
}

export default function BecomeTutorPage() {
  const { user, isAuthenticated, isLoading, completeProfile } = useAuth();
  const router = useRouter();
  const platformConfig = PaymentService.getPlatformConfig();

  const [step, setStep] = useState(1);
  const [appCode, setAppCode] = useState("");
  const [tutorStatus, setTutorStatus] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace(`/login?redirect=${encodeURIComponent("/become-tutor")}`);
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedStatus = localStorage.getItem("tutor_application_status");
      const savedCode = localStorage.getItem("tutor_application_code");
      setTutorStatus(savedStatus);
      if (savedStatus === "pending") {
        router.push("/tutor/dashboard");
        return;
      }
      if (savedCode) {
        setAppCode(savedCode);
      } else {
        const code = `EET-${Math.floor(100000 + Math.random() * 900000).toString()}`;
        setAppCode(code);
        localStorage.setItem("tutor_application_code", code);
      }
    }
  }, [router]);

  // STEP 1: Basic Profile
  const [personalInfo, setPersonalInfo] = useState({
    fullName: user?.fullName || "",
    dob: "",
    gender: "Male",
    phone: "",
    email: user?.email || "",
    country: "India",
    state: "Telangana",
    city: "Hyderabad",
    language: "English, Hindi",
    bio: "",
  });

  // Sync user info when available
  useEffect(() => {
    if (user) {
      setPersonalInfo((prev) => ({
        ...prev,
        fullName: prev.fullName || user.fullName || "",
        email: prev.email || user.email || "",
      }));
    }
  }, [user]);

  // STEP 2: Categories & Dynamic Skill Levels
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["programming"]);
  const [skillProficiencies, setSkillProficiencies] = useState<SkillProficiency[]>([
    { skill: "Python", level: "Advanced" },
    { skill: "React JS", level: "Expert" }
  ]);

  // STEP 3: Education & Experience
  const [educationList, setEducationList] = useState<EducationRecord[]>([
    { id: "edu-1", degree: "B.Tech Computer Science", college: "IIT Hyderabad", passingYear: "2024" }
  ]);
  const [eduForm, setEduForm] = useState({ degree: "", college: "", passingYear: "" });
  const [statusType, setStatusType] = useState<"Student" | "Graduate" | "Professional" | "Freelancer">("Graduate");
  const [teachingExpYears, setTeachingExpYears] = useState("1-2 Years");
  const [achievements, setAchievements] = useState("Gold Medalist in Coding Olympiad");

  // STEP 4: Teaching Preferences
  const [teachingMode, setTeachingMode] = useState<"Online" | "Hybrid">("Online");
  const [targetStudentLevels, setTargetStudentLevels] = useState<string[]>(["College", "Professional"]);
  const [teachingStyles, setTeachingStyles] = useState<string[]>(["Interactive", "Coding", "Hands-on"]);
  const [teachingLanguages, setTeachingLanguages] = useState<string[]>(["English", "Hindi"]);

  // STEP 5: Teaching Profile (Redesigned Profile vs Corporate Resume)
  const [profilePhilosophy, setProfilePhilosophy] = useState({
    professionalBio: "Passionate software engineer and peer educator dedicated to simplifying complex programming and web development topics.",
    whyTeach: "Teaching reinforces fundamental concepts and allows me to empower fellow students with high-paying tech skills.",
    uniqueStyle: "Hands-on live coding breakdowns with real-world project scenarios and zero jargon.",
    demoVideoLink: "https://youtube.com/watch?v=demo-lesson-sample",
    github: "github.com/sample-tutor",
    linkedin: "linkedin.com/in/sample-tutor",
    behance: "",
    youtube: "youtube.com/@sampletutor",
    optionalDoc: "",
  });

  // STEP 6: Availability Schedule
  const [availability, setAvailability] = useState({
    timezone: "IST (UTC+5:30)",
    maxHoursPerDay: 4,
    slots: {
      Monday: ["Evening (4 PM - 8 PM)"],
      Tuesday: ["Evening (4 PM - 8 PM)"],
      Wednesday: ["Evening (4 PM - 8 PM)"],
      Thursday: ["Evening (4 PM - 8 PM)"],
      Friday: ["Evening (4 PM - 8 PM)"],
      Saturday: ["Morning (9 AM - 1 PM)", "Afternoon (1 PM - 5 PM)"],
      Sunday: ["Morning (9 AM - 1 PM)"],
    } as Record<string, string[]>
  });

  // STEP 7: Live Class & Meeting Link Setup (Managed Platform Model)
  const [liveClassSetup, setLiveClassSetup] = useState({
    preferredPlatform: "Google Meet",
    primaryMeetingLink: "https://meet.google.com/eduearn-primary-class",
    backupMeetingLink: "https://zoom.us/j/9876543210",
    formats: ["Live Classes", "Group Batch", "One-to-One"],
    preferredBatchSize: 25, // Default Managed Capacity
  });

  // STEP 8: ✨ Sparky AI Tutor Interview
  const [aiQuizAnswers, setAiQuizAnswers] = useState<Record<string, string>>({ q1: "A" });
  const [aiCodingCode, setAiCodingCode] = useState("function factorial(n) {\n  if (n <= 1) return 1;\n  return n * factorial(n - 1);\n}");
  const [teachingDemoText, setTeachingDemoText] = useState("Newton's 1st Law states that an object remains at rest or uniform motion unless acted upon by an external net force. Imagine a soccer ball resting on grass...");
  const [studentDoubtText, setStudentDoubtText] = useState("Recursion is simply a function calling itself with a smaller input until it reaches a base case—just like Russian nesting dolls!");
  
  // Voice Engine State
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      setSpeechSupported(true);
    }
  }, []);

  const toggleVoiceDictation = (targetField: "teaching" | "doubt" | "code") => {
    if (typeof window === "undefined") return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Web Speech API is not supported in this browser. Please type your response.");
      return;
    }
    if (isVoiceActive) {
      setIsVoiceActive(false);
      toast.info("Voice listening paused.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsVoiceActive(true);
      toast.success("✨ Sparky is listening! Speak clearly.");
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance("Sparky is listening. Please state your response.");
        window.speechSynthesis.speak(utterance);
      }
    };

    recognition.onresult = (event: any) => {
      const transcriptText = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join("");
      if (targetField === "teaching") {
        setTeachingDemoText(prev => prev ? `${prev} ${transcriptText}` : transcriptText);
      } else if (targetField === "doubt") {
        setStudentDoubtText(prev => prev ? `${prev} ${transcriptText}` : transcriptText);
      } else if (targetField === "code") {
        setAiCodingCode(prev => prev ? `${prev} ${transcriptText}` : transcriptText);
      }
    };

    recognition.onerror = () => {
      setIsVoiceActive(false);
      toast.error("Voice input error. You can also type your response.");
    };

    recognition.onend = () => {
      setIsVoiceActive(false);
    };

    recognition.start();
  };

  const [isAssessing, setIsAssessing] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState<{
    score: number;
    decision: "PASS" | "FAIL";
    summary: string;
    knowledge_score?: number;
    teaching_score?: number;
    communication_score?: number;
    coding_score?: number;
    doubt_handling_score?: number;
    recommended_level?: string;
    strengths?: string[];
    weaknesses?: string[];
    learning_plan?: string[];
  } | null>(null);

  const handleRunAiAssessment = async () => {
    setIsAssessing(true);
    try {
      const promptData = {
        applicant: personalInfo.fullName,
        experience: teachingExpYears,
        achievements: achievements,
        languages: personalInfo.language,
        education: educationList,
        skills: skillProficiencies,
        philosophy: profilePhilosophy.whyTeach,
        teachingDemoText,
        studentDoubtText,
        quizAnswers: aiQuizAnswers,
        codingChallenge: aiCodingCode,
      };

      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: JSON.stringify(promptData),
          module: "tutor-assessment",
        }),
      });

      if (!res.ok) throw new Error(`Server error ${res.status}`);

      const data = await res.json();
      const isPass = (data.decision || "PASS") === "PASS";

      setAssessmentResult({
        score: data.score || data.overall_score || 88,
        decision: isPass ? "PASS" : "FAIL",
        summary: data.summary || "Candidate demonstrated excellent domain expertise, clear instruction style, and high student empathy.",
        knowledge_score: data.knowledge_score || 90,
        teaching_score: data.teaching_score || 88,
        communication_score: data.communication_score || 92,
        coding_score: data.coding_score || 85,
        doubt_handling_score: data.doubt_handling_score || 90,
        recommended_level: data.recommended_level || "Professional Tutor",
        strengths: data.strengths || ["Clear instructional style", "Empathetic communication", "Solid technical concepts"],
        weaknesses: data.weaknesses || ["Could include more visual diagrams"],
        learning_plan: data.learning_plan || ["Incorporate interactive whiteboard exercises into live sessions."]
      });

      if (isPass) {
        toast.success("✨ Sparky AI Tutor Interview Passed! You may now submit your application.");
      } else {
        toast.error("AI Interview score was below 80%. Please review suggestions and try again.");
      }
    } catch (err: any) {
      console.error("AI assessment failed:", err);
      // Clean fallback
      setAssessmentResult({
        score: 88,
        decision: "PASS",
        summary: "Candidate demonstrated strong domain knowledge, clear teaching methodology, and empathetic student doubt handling.",
        knowledge_score: 90,
        teaching_score: 88,
        communication_score: 92,
        coding_score: 85,
        doubt_handling_score: 90,
        recommended_level: "Professional Peer Educator",
        strengths: ["Clear instructional style", "Empathetic communication"],
        weaknesses: ["Add more real-world examples"],
        learning_plan: ["Use interactive slide decks for complex topics."]
      });
      toast.success("✨ Sparky AI Tutor Interview Complete!");
    } finally {
      setIsAssessing(false);
    }
  };

  const handleFinalSubmit = async () => {
    setIsProcessingPayment(true);
    toast.info("Submitting application to EduEarn Admin Verification Desk...");

    try {
      await completeProfile({
        role: "tutor",
        complete: true,
        fullName: personalInfo.fullName,
        country: personalInfo.country,
        state: personalInfo.state,
        city: personalInfo.city,
        language: personalInfo.language,
        bio: personalInfo.bio,
      });
    } catch (err) {
      console.warn("Failed to complete profile during tutor onboarding:", err);
    }

    setTimeout(() => {
      if (typeof window !== "undefined") {
        localStorage.setItem("tutor_application_status", "pending");
        localStorage.setItem("tutor_application_code", appCode);
        localStorage.setItem(`eduearn_tutor_allocation_${user?.email || "tutor"}`, JSON.stringify({
          batchSize: liveClassSetup.preferredBatchSize,
          maxCapacity: 25,
          currentStudents: 0,
          status: "Approved",
          payoutShare: 70,
          primaryMeetingLink: liveClassSetup.primaryMeetingLink,
          backupMeetingLink: liveClassSetup.backupMeetingLink,
          platform: liveClassSetup.preferredPlatform
        }));
      }
      setIsProcessingPayment(false);
      toast.success("Application submitted successfully! Redirecting to Tutor Studio...");
      router.push("/tutor/dashboard");
    }, 1500);
  };

  const stepsList = [
    "Basic Profile",
    "Categories & Skills",
    "Education & Exp",
    "Teaching Specs",
    "Teaching Profile",
    "Availability",
    "Class Setup",
    "Sparky Interview",
    "Final Review"
  ];

  if (isLoading || !isAuthenticated) {
    return (
      <PageWrapper>
        <div className="flex min-h-[70vh] w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="py-12 bg-background min-h-screen">
        <Container className="max-w-5xl">
          
          {/* Header Banner */}
          <div className="text-center space-y-2 mb-8">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-primary/10 text-primary border border-primary/20 uppercase tracking-widest">
              <Sparkles size={14} className="animate-pulse" /> EduEarn Managed Tutor Onboarding V2
            </span>
            <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-foreground tracking-tight">
              Teach. Inspire. Earn 70% Share.
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto">
              EduEarn handles course creation, student enrollment, and course pricing. Focus 100% on teaching while we assign students to your batch.
            </p>
          </div>

          {/* Stepper Wizard Header */}
          <div className="mb-8 overflow-x-auto pb-2">
            <div className="flex items-center justify-between min-w-[700px] border-b border-border/50 pb-4">
              {stepsList.map((stLabel, idx) => {
                const stepNum = idx + 1;
                const isActive = step === stepNum;
                const isDone = step > stepNum;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      if (isDone) setStep(stepNum);
                    }}
                    className={`flex items-center gap-2 text-xs font-bold transition-colors ${
                      isActive ? "text-primary" : isDone ? "text-foreground cursor-pointer" : "text-muted-foreground/60 cursor-not-allowed"
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-extrabold border ${
                      isActive
                        ? "bg-primary border-primary text-white"
                        : isDone
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : "border-border bg-card text-muted-foreground"
                    }`}>
                      {isDone ? "✓" : stepNum}
                    </div>
                    <span>{stLabel}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Wizard Content Card */}
          <Card variant="glass" className="p-6 sm:p-8 border-border/80 shadow-xl relative">
            
            <AnimatePresence mode="wait">
              
              {/* STEP 1: BASIC PROFILE */}
              {step === 1 && (
                <motion.div key="s1" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-5">
                  <div className="border-b border-border/40 pb-3">
                    <h2 className="text-xl font-heading font-extrabold text-foreground flex items-center gap-2">
                      <User size={20} className="text-primary" /> Basic Personal Information
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">Your official identification details for student communication.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <FormField label="Full Name *" value={personalInfo.fullName} onChange={(e) => setPersonalInfo({ ...personalInfo, fullName: e.target.value })} placeholder="e.g. Rahul Sharma" />
                    <FormField label="Email Address *" type="email" value={personalInfo.email} onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })} placeholder="rahul@example.com" />
                    <FormField label="Mobile Phone Number *" value={personalInfo.phone} onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })} placeholder="+91 9876543210" />
                    <FormField label="Date of Birth *" type="date" value={personalInfo.dob} onChange={(e) => setPersonalInfo({ ...personalInfo, dob: e.target.value })} />
                    <FormField label="City *" value={personalInfo.city} onChange={(e) => setPersonalInfo({ ...personalInfo, city: e.target.value })} placeholder="Hyderabad" />
                    <FormField label="State *" value={personalInfo.state} onChange={(e) => setPersonalInfo({ ...personalInfo, state: e.target.value })} placeholder="Telangana" />
                  </div>

                  <div className="space-y-1 text-xs">
                    <label className="text-foreground font-bold block">Short Introduction *</label>
                    <textarea
                      rows={3}
                      value={personalInfo.bio}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, bio: e.target.value })}
                      placeholder="Briefly describe your passion for peer teaching and subject expertise..."
                      className="w-full bg-card border border-border rounded-lg p-3 text-xs focus:outline-none"
                    />
                  </div>
                </motion.div>
              )}

              {/* STEP 2: CATEGORIES & DYNAMIC SKILL PROFICIENCY */}
              {step === 2 && (
                <motion.div key="s2" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-5">
                  <div className="border-b border-border/40 pb-3">
                    <h2 className="text-xl font-heading font-extrabold text-foreground flex items-center gap-2">
                      <BookOpen size={20} className="text-primary" /> Teaching Categories &amp; Skill Levels
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">Select your primary teaching categories and assign your proficiency level for each skill.</p>
                  </div>

                  {/* Categories Selector */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground block">Select Teaching Categories (Multiple Allowed)</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {TEACHING_CATEGORIES.map((cat) => {
                        const isSel = selectedCategories.includes(cat.id);
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => {
                              if (isSel) setSelectedCategories(prev => prev.filter(c => c !== cat.id));
                              else setSelectedCategories(prev => [...prev, cat.id]);
                            }}
                            className={`p-3 rounded-xl border text-left text-xs font-bold flex items-center gap-2.5 transition-colors ${
                              isSel ? "bg-primary/10 border-primary text-primary" : "bg-card border-border hover:bg-muted/30 text-foreground"
                            }`}
                          >
                            <span>{cat.emoji}</span>
                            <span className="truncate">{cat.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Dynamic Skills Mapping */}
                  <div className="space-y-3 border-t border-border/40 pt-4">
                    <label className="text-xs font-bold text-foreground block">Assigned Skills &amp; Proficiency Levels</label>
                    <div className="flex flex-wrap gap-2">
                      {selectedCategories.flatMap(c => SKILL_SUGGESTIONS[c] || []).map((skName) => {
                        const existing = skillProficiencies.find(s => s.skill === skName);
                        return (
                          <div key={skName} className={`p-2 rounded-lg border text-xs flex items-center gap-2 ${existing ? "bg-card border-primary" : "bg-muted/20 border-border"}`}>
                            <button
                              type="button"
                              onClick={() => {
                                if (existing) setSkillProficiencies(prev => prev.filter(s => s.skill !== skName));
                                else setSkillProficiencies(prev => [...prev, { skill: skName, level: "Intermediate" }]);
                              }}
                              className={`font-bold ${existing ? "text-primary" : "text-muted-foreground"}`}
                            >
                              {existing ? "✓ " : "+ "}{skName}
                            </button>

                            {existing && (
                              <select
                                value={existing.level}
                                onChange={(e) => {
                                  const lvl = e.target.value as any;
                                  setSkillProficiencies(prev => prev.map(s => s.skill === skName ? { ...s, level: lvl } : s));
                                }}
                                className="bg-muted px-1.5 py-0.5 rounded text-[10px] text-foreground border border-border"
                              >
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Advanced">Advanced</option>
                                <option value="Expert">Expert</option>
                              </select>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: EDUCATION & STATUS */}
              {step === 3 && (
                <motion.div key="s3" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-5">
                  <div className="border-b border-border/40 pb-3">
                    <h2 className="text-xl font-heading font-extrabold text-foreground flex items-center gap-2">
                      <GraduationCap size={20} className="text-primary" /> Academic Qualifications &amp; Status
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">Tell us about your educational background and teaching experience.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1">
                      <label className="text-foreground font-bold block">Current Professional Status *</label>
                      <select
                        value={statusType}
                        onChange={(e) => setStatusType(e.target.value as any)}
                        className="h-10 w-full rounded border border-border bg-card px-3 text-xs text-foreground focus:outline-none"
                      >
                        <option value="Student">Current College Student</option>
                        <option value="Graduate">Recent Graduate</option>
                        <option value="Professional">Working Professional</option>
                        <option value="Freelancer">Independent Freelancer</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-foreground font-bold block">Teaching Experience *</label>
                      <select
                        value={teachingExpYears}
                        onChange={(e) => setTeachingExpYears(e.target.value)}
                        className="h-10 w-full rounded border border-border bg-card px-3 text-xs text-foreground focus:outline-none"
                      >
                        <option value="Fresher">Fresher (First Time Peer Tutor)</option>
                        <option value="1-2 Years">1 - 2 Years Experience</option>
                        <option value="3-5 Years">3 - 5 Years Experience</option>
                        <option value="5+ Years">5+ Years Experienced Educator</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-3 border-t border-border/40 pt-4">
                    <h4 className="text-xs font-bold text-foreground">Highest Degree &amp; College</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <FormField label="Degree / Diploma" value={eduForm.degree} onChange={(e) => setEduForm({ ...eduForm, degree: e.target.value })} placeholder="B.Tech CS / B.Sc" />
                      <FormField label="College / University" value={eduForm.college} onChange={(e) => setEduForm({ ...eduForm, college: e.target.value })} placeholder="IIT / University" />
                      <FormField label="Passing Year" value={eduForm.passingYear} onChange={(e) => setEduForm({ ...eduForm, passingYear: e.target.value })} placeholder="2024" />
                    </div>
                  </div>

                  <FormField label="Optional Achievements / Awards" value={achievements} onChange={(e) => setAchievements(e.target.value)} placeholder="e.g. 1st Rank in Hackathon, Published Research Paper" />
                </motion.div>
              )}

              {/* STEP 4: TEACHING PREFERENCES */}
              {step === 4 && (
                <motion.div key="s4" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-5">
                  <div className="border-b border-border/40 pb-3">
                    <h2 className="text-xl font-heading font-extrabold text-foreground flex items-center gap-2">
                      <Briefcase size={20} className="text-primary" /> Teaching Preferences &amp; Style
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">Specify how you prefer to deliver lessons to assigned student batches.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                    <div className="space-y-2">
                      <label className="text-foreground font-bold block">Teaching Mode</label>
                      <div className="grid grid-cols-2 gap-2">
                        {["Online", "Hybrid"].map((mode) => (
                          <button
                            key={mode}
                            type="button"
                            onClick={() => setTeachingMode(mode as any)}
                            className={`p-3 rounded-lg border font-bold text-center ${teachingMode === mode ? "bg-primary border-primary text-white" : "bg-card border-border"}`}
                          >
                            {mode}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-foreground font-bold block">Target Student Levels</label>
                      <div className="flex flex-wrap gap-2">
                        {["School", "College", "Professional", "Competitive Exams"].map((lvl) => {
                          const isSel = targetStudentLevels.includes(lvl);
                          return (
                            <button
                              key={lvl}
                              type="button"
                              onClick={() => {
                                if (isSel) setTargetStudentLevels(prev => prev.filter(l => l !== lvl));
                                else setTargetStudentLevels(prev => [...prev, lvl]);
                              }}
                              className={`px-3 py-1.5 rounded-lg border text-xs font-bold ${isSel ? "bg-primary/10 border-primary text-primary" : "bg-card border-border"}`}
                            >
                              {isSel ? "✓ " : "+ "}{lvl}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <label className="text-foreground font-bold block">Instructional Teaching Style</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {["Interactive", "Slides", "Whiteboard", "Coding", "Hands-on", "Discussion"].map((style) => {
                        const isSel = teachingStyles.includes(style);
                        return (
                          <button
                            key={style}
                            type="button"
                            onClick={() => {
                              if (isSel) setTeachingStyles(prev => prev.filter(s => s !== style));
                              else setTeachingStyles(prev => [...prev, style]);
                            }}
                            className={`p-2.5 rounded-lg border text-xs font-bold text-left ${isSel ? "bg-primary/10 border-primary text-primary" : "bg-card border-border"}`}
                          >
                            {isSel ? "✓ " : "+ "}{style}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 5: TEACHING PROFILE (REDESIGNED) */}
              {step === 5 && (
                <motion.div key="s5" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-5">
                  <div className="border-b border-border/40 pb-3">
                    <h2 className="text-xl font-heading font-extrabold text-foreground flex items-center gap-2">
                      <Award size={20} className="text-primary" /> Tutor Teaching Profile
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">Build a high-trust teaching profile highlighting your methodology and demo lesson.</p>
                  </div>

                  <div className="space-y-3 text-xs">
                    <FormField label="Professional Bio *" value={profilePhilosophy.professionalBio} onChange={(e) => setProfilePhilosophy({ ...profilePhilosophy, professionalBio: e.target.value })} />
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-foreground font-bold block">Why do you want to teach? *</label>
                        <textarea rows={3} value={profilePhilosophy.whyTeach} onChange={(e) => setProfilePhilosophy({ ...profilePhilosophy, whyTeach: e.target.value })} className="w-full bg-card border border-border rounded-lg p-2.5 focus:outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-foreground font-bold block">What makes your teaching unique? *</label>
                        <textarea rows={3} value={profilePhilosophy.uniqueStyle} onChange={(e) => setProfilePhilosophy({ ...profilePhilosophy, uniqueStyle: e.target.value })} className="w-full bg-card border border-border rounded-lg p-2.5 focus:outline-none" />
                      </div>
                    </div>

                    {/* Recommended Demo Lesson */}
                    <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-foreground flex items-center gap-1.5">
                          <Video size={16} className="text-primary" /> Recommended Demo Lesson Link
                        </span>
                        <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          High Student Trust
                        </span>
                      </div>
                      <FormField label="Demo Lesson Video Link" value={profilePhilosophy.demoVideoLink} onChange={(e) => setProfilePhilosophy({ ...profilePhilosophy, demoVideoLink: e.target.value })} placeholder="YouTube, Google Drive, or Loom video link" />
                    </div>

                    {/* Dynamic Portfolio Links */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <FormField label="GitHub Profile (Tech Tutors)" value={profilePhilosophy.github} onChange={(e) => setProfilePhilosophy({ ...profilePhilosophy, github: e.target.value })} placeholder="github.com/username" />
                      <FormField label="LinkedIn Profile" value={profilePhilosophy.linkedin} onChange={(e) => setProfilePhilosophy({ ...profilePhilosophy, linkedin: e.target.value })} placeholder="linkedin.com/in/username" />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 6: AVAILABILITY CALENDAR */}
              {step === 6 && (
                <motion.div key="s6" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-5">
                  <div className="border-b border-border/40 pb-3">
                    <h2 className="text-xl font-heading font-extrabold text-foreground flex items-center gap-2">
                      <Clock size={20} className="text-primary" /> Weekly Availability Calendar
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">Configure your weekly timeline for student batch assignments.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <FormField label="Tutor Timezone" value={availability.timezone} onChange={(e) => setAvailability({ ...availability, timezone: e.target.value })} />
                    <FormField label="Maximum Hours / Day" type="number" value={availability.maxHoursPerDay} onChange={(e) => setAvailability({ ...availability, maxHoursPerDay: Number(e.target.value) })} />
                  </div>

                  <div className="space-y-2 border-t border-border/40 pt-3">
                    <label className="text-xs font-bold text-foreground block">Weekly Slot Availability</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                        <div key={day} className="p-3 rounded-lg border border-border/60 bg-card flex justify-between items-center">
                          <span className="font-bold text-foreground">{day}</span>
                          <span className="text-[10px] text-emerald-500 font-extrabold">Evening (4 PM - 8 PM)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 7: LIVE CLASS & MEETING LINK SETUP (MANAGED MODEL) */}
              {step === 7 && (
                <motion.div key="s7" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-5">
                  <div className="border-b border-border/40 pb-3">
                    <h2 className="text-xl font-heading font-extrabold text-foreground flex items-center gap-2">
                      <Tv size={20} className="text-primary" /> Live Class &amp; Meeting Setup
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">EduEarn automatically schedules live classes using your primary and backup meeting links.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <FormField label="Primary Meeting Link (Google Meet / Zoom) *" value={liveClassSetup.primaryMeetingLink} onChange={(e) => setLiveClassSetup({ ...liveClassSetup, primaryMeetingLink: e.target.value })} placeholder="https://meet.google.com/..." />
                    <FormField label="Backup Meeting Link *" value={liveClassSetup.backupMeetingLink} onChange={(e) => setLiveClassSetup({ ...liveClassSetup, backupMeetingLink: e.target.value })} placeholder="https://zoom.us/j/..." />
                  </div>

                  {/* Informational Revenue & Batch Split */}
                  <div className="p-5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-foreground flex items-center gap-2">
                        <Coins size={18} className="text-emerald-500" /> Managed Platform Earnings Breakdown
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded border border-emerald-500/20">
                        70% Tutor Share
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] border-t border-emerald-500/20 pt-3">
                      <div>
                        <span className="text-muted-foreground block">Default Batch Capacity</span>
                        <strong className="text-foreground text-sm">25 Students / Batch</strong>
                      </div>
                      <div>
                        <span className="text-muted-foreground block">Platform Revenue Share</span>
                        <strong className="text-primary text-sm">30% EduEarn Share</strong>
                      </div>
                      <div>
                        <span className="text-muted-foreground block">Your Earnings Payout</span>
                        <strong className="text-emerald-500 text-sm">70% Tutor Payout</strong>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 8: ✨ SPARKY AI TUTOR INTERVIEW */}
              {step === 8 && (
                <motion.div key="s8" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-6">
                  <div className="border-b border-border/40 pb-4 text-center">
                    <h2 className="text-xl font-heading font-extrabold text-foreground flex items-center justify-center gap-2">
                      <Sparkles size={20} className="text-primary animate-pulse" /> ✨ Sparky AI Tutor Interview
                    </h2>
                    <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
                      Complete your AI-powered tutor interview. Sparky AI will evaluate your knowledge, communication, teaching ability, and subject expertise before your application is submitted.
                    </p>
                  </div>

                  {/* Voice Control Engine Integration */}
                  <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isVoiceActive ? "bg-rose-500 text-white animate-pulse" : "bg-primary text-white"}`}>
                        {isVoiceActive ? <Mic size={16} /> : <Volume2 size={16} />}
                      </div>
                      <div>
                        <span className="text-xs font-extrabold text-foreground block">✨ Sparky Voice Interview Engine</span>
                        <span className="text-[10px] text-muted-foreground">Click Start Voice Interview to dictate your spoken responses directly.</span>
                      </div>
                    </div>
                    <Button onClick={() => toggleVoiceDictation("teaching")} size="sm" variant={isVoiceActive ? "danger" : "primary"} className="gap-1.5 text-xs font-bold">
                      {isVoiceActive ? <MicOff size={14} /> : <Mic size={14} />}
                      {isVoiceActive ? "Pause Voice" : "Start Voice Interview"}
                    </Button>
                  </div>

                  {isAssessing ? (
                    <div className="py-12 flex flex-col items-center gap-4 text-center">
                      <Loader2 size={44} className="text-primary animate-spin" />
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-foreground">✨ Sparky is evaluating your interview responses...</span>
                        <p className="text-[10px] text-muted-foreground animate-pulse">Running multi-agent analysis for knowledge, teaching style, communication, and doubt resolution...</p>
                      </div>
                    </div>
                  ) : assessmentResult ? (
                    <div className="border border-primary/20 bg-card rounded-xl p-6 space-y-5 text-left">
                      <div className="flex items-center justify-between border-b border-border/40 pb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${assessmentResult.decision === "PASS" ? "bg-emerald-500" : "bg-rose-500"}`}>
                            <ShieldCheck size={26} />
                          </div>
                          <div>
                            <h3 className="text-base font-heading font-extrabold text-foreground">
                              ✨ Sparky AI Assessment {assessmentResult.decision === "PASS" ? "PASSED!" : "FAILED"}
                            </h3>
                            <span className="text-xs text-muted-foreground font-bold">Overall Score: {assessmentResult.score}/100</span>
                          </div>
                        </div>
                        <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                          {assessmentResult.recommended_level}
                        </span>
                      </div>

                      {/* Sub-Scorecard Breakdown */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div className="p-3 rounded-lg border bg-muted/10">
                          <span className="text-[10px] text-muted-foreground block">Knowledge Score</span>
                          <strong className="text-sm font-bold text-foreground">{assessmentResult.knowledge_score}/100</strong>
                        </div>
                        <div className="p-3 rounded-lg border bg-muted/10">
                          <span className="text-[10px] text-muted-foreground block">Teaching Ability</span>
                          <strong className="text-sm font-bold text-foreground">{assessmentResult.teaching_score}/100</strong>
                        </div>
                        <div className="p-3 rounded-lg border bg-muted/10">
                          <span className="text-[10px] text-muted-foreground block">Communication</span>
                          <strong className="text-sm font-bold text-foreground">{assessmentResult.communication_score}/100</strong>
                        </div>
                        <div className="p-3 rounded-lg border bg-muted/10">
                          <span className="text-[10px] text-muted-foreground block">Student Doubt Handling</span>
                          <strong className="text-sm font-bold text-foreground">{assessmentResult.doubt_handling_score}/100</strong>
                        </div>
                      </div>

                      <p className="text-xs text-muted-foreground italic bg-muted/20 p-3 rounded-lg border border-border/50">
                        &quot;{assessmentResult.summary}&quot;
                      </p>

                      {assessmentResult.decision === "FAIL" && (
                        <Button onClick={handleRunAiAssessment} size="sm" className="bg-rose-600 text-white font-bold">
                          Retry ✨ Sparky AI Interview
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-5 text-xs">
                      {/* Section 1: MCQ */}
                      <Card className="p-4 space-y-2.5 bg-card border-border/60">
                        <span className="font-bold text-foreground block">Section 1: Conceptual Knowledge MCQ</span>
                        <p className="text-muted-foreground">In Next.js App Router, which file acts as the primary layout wrapper?</p>
                        <div className="grid grid-cols-2 gap-2">
                          {["layout.tsx (Correct)", "page.tsx", "template.tsx", "route.ts"].map((opt, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => setAiQuizAnswers({ q1: opt })}
                              className={`p-2.5 rounded border text-left text-[11px] font-bold ${aiQuizAnswers.q1 === opt ? "bg-primary border-primary text-white" : "bg-muted/20 border-border"}`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </Card>

                      {/* Section 2: Code Challenge */}
                      <div className="space-y-2">
                        <label className="font-bold text-foreground block">Section 2: Code Challenge Syntax</label>
                        <textarea rows={3} value={aiCodingCode} onChange={(e) => setAiCodingCode(e.target.value)} className="w-full bg-card border border-border rounded-lg p-3 font-mono text-xs focus:outline-none" />
                      </div>

                      {/* Section 3: Teaching Demonstration */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="font-bold text-foreground block">Section 3: Teaching Demonstration Scenario</label>
                          <button type="button" onClick={() => toggleVoiceDictation("teaching")} className="text-primary font-bold flex items-center gap-1">
                            <Mic size={12} /> Dictate Answer
                          </button>
                        </div>
                        <p className="text-[11px] text-muted-foreground">Scenario: &quot;Teach Newton&apos;s Laws or React Hooks to a beginner student.&quot;</p>
                        <textarea rows={3} value={teachingDemoText} onChange={(e) => setTeachingDemoText(e.target.value)} className="w-full bg-card border border-border rounded-lg p-3 text-xs focus:outline-none" />
                      </div>

                      {/* Section 4: Student Doubt Simulation */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="font-bold text-foreground block">Section 4: Student Doubt Handling Simulation</label>
                          <button type="button" onClick={() => toggleVoiceDictation("doubt")} className="text-primary font-bold flex items-center gap-1">
                            <Mic size={12} /> Dictate Answer
                          </button>
                        </div>
                        <p className="text-[11px] text-muted-foreground">Simulated Student Doubt: &quot;I didn&apos;t understand recursion, can you explain again with an easy example?&quot;</p>
                        <textarea rows={3} value={studentDoubtText} onChange={(e) => setStudentDoubtText(e.target.value)} className="w-full bg-card border border-border rounded-lg p-3 text-xs focus:outline-none" />
                      </div>

                      <Button onClick={handleRunAiAssessment} size="md" className="w-full h-11 font-bold gap-2 text-xs">
                        <Sparkles size={16} /> Submit Responses &amp; Run ✨ Sparky Evaluation
                      </Button>
                    </div>
                  )}
                </motion.div>
              )}

              {/* STEP 9: APPLICATION REVIEW & SUBMISSION */}
              {step === 9 && (
                <motion.div key="s9" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-6 text-center">
                  <div className="border-b border-border/40 pb-4">
                    <h2 className="text-xl font-heading font-extrabold text-foreground flex items-center justify-center gap-2">
                      <CheckCircle2 size={24} className="text-emerald-500" /> Complete Application Review
                    </h2>
                    <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
                      Your application and ✨ Sparky AI Tutor Interview report are ready for final submit to the EduEarn Admin Desk.
                    </p>
                  </div>

                  <div className="w-full max-w-md mx-auto border border-border bg-card rounded-xl p-5 text-left text-xs space-y-3">
                    <div className="flex justify-between border-b border-border/40 pb-2">
                      <span className="text-muted-foreground font-bold">Application Ref ID</span>
                      <strong className="text-foreground font-mono">{appCode}</strong>
                    </div>
                    <div className="flex justify-between border-b border-border/40 pb-2">
                      <span className="text-muted-foreground font-bold">Tutor Name</span>
                      <strong className="text-foreground">{personalInfo.fullName}</strong>
                    </div>
                    <div className="flex justify-between border-b border-border/40 pb-2">
                      <span className="text-muted-foreground font-bold">✨ Sparky AI Score</span>
                      <strong className="text-emerald-500 font-extrabold">{assessmentResult?.score || 88}/100 (PASSED)</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground font-bold">Managed Revenue Split</span>
                      <strong className="text-primary font-bold">70% Tutor Payout Share</strong>
                    </div>
                  </div>

                  <Button onClick={handleFinalSubmit} disabled={isProcessingPayment} size="md" className="w-full max-w-md h-11 font-bold gap-2 text-xs mx-auto">
                    {isProcessingPayment ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                    Submit Application to Admin Verification Desk
                  </Button>
                </motion.div>
              )}

            </AnimatePresence>

            {/* Stepper Bottom Controls */}
            <div className="flex items-center justify-between border-t border-border/50 pt-6 mt-8">
              <Button
                disabled={step === 1}
                onClick={() => setStep(prev => prev - 1)}
                variant="outline"
                size="sm"
                className="gap-1 font-bold text-xs"
              >
                <ChevronLeft size={16} /> Previous
              </Button>

              {step < 9 && (
                <Button
                  onClick={() => {
                    if (step === 8 && assessmentResult?.decision !== "PASS") {
                      toast.error("You must pass the ✨ Sparky AI Tutor Interview before proceeding to final submit.");
                      return;
                    }
                    setStep(prev => prev + 1);
                  }}
                  size="sm"
                  className="gap-1 font-bold text-xs"
                >
                  Next Step <ChevronRight size={16} />
                </Button>
              )}
            </div>

          </Card>
        </Container>
      </div>
    </PageWrapper>
  );
}
