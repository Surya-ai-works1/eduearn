"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { SEED_CATEGORIES } from "../../../features/payments/services/marketplaceService";
import { MOCK_COURSES, MOCK_TUTORS } from "../../../constants/mockData";
import { useAuth } from "../../../hooks/useAuth";
import { useCourseContext } from "../../../hooks/useCourseContext";
import { Container } from "../../../components/layout/Container";
import { PageWrapper } from "../../../components/layout/PageWrapper";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { StaggerContainer, staggerChildVariants } from "../../../components/animations";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  Code,
  BrainCircuit,
  Briefcase,
  Palette,
  Camera,
  Music,
  Flame,
  Languages,
  BookOpen,
  ArrowLeft,
  Search,
  Star,
  Clock,
  User,
  Users,
  Video,
  Award,
  Sparkles,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  Play,
  ArrowRight,
  Tv,
} from "lucide-react";

// Icon lookup helper
const CategoryIcon = ({ name, className }: { name: string; className?: string }) => {
  switch (name) {
    case "GraduationCap": return <GraduationCap className={className} />;
    case "Code": return <Code className={className} />;
    case "BrainCircuit": return <BrainCircuit className={className} />;
    case "Briefcase": return <Briefcase className={className} />;
    case "Palette": return <Palette className={className} />;
    case "Camera": return <Camera className={className} />;
    case "Music": return <Music className={className} />;
    case "Flame": return <Flame className={className} />;
    case "Languages": return <Languages className={className} />;
    default: return <BookOpen className={className} />;
  }
};

// URL dynamic slug to DB mapping
const slugToIdMap: Record<string, string> = {
  "academic-education": "academics",
  "technology-programming": "technology-programming",
  "ai-data-science": "ai-data-science",
  "business-entrepreneurship": "business-entrepreneurship",
  "creative-arts": "creative-arts-design",
  "creative-arts-design": "creative-arts-design",
  "photography-media": "photography-media",
  "video-editing": "video-editing-animation",
  "video-editing-animation": "video-editing-animation",
  "music": "music",
  "dance": "dance",
  "sports-fitness": "sports-fitness",
  "languages": "languages",
  "communication": "communication",
  "cooking-lifestyle": "cooking-lifestyle",
  "marketing": "marketing"
};

// Details database metadata
interface CategoryDetail {
  id: string;
  name: string;
  desc: string;
  iconName: string;
  bannerColor: string;
  subjects: string[];
  mockCourses: Array<{
    id: string;
    title: string;
    tutor: string;
    duration: string;
    rating: number;
    students: number;
    price: number;
    difficulty: "Beginner" | "Intermediate" | "Advanced";
  }>;
  mockTutors: Array<{
    id: string;
    name: string;
    role: string;
    rating: number;
    price: number;
    languages: string;
    reviewsCount: number;
  }>;
  mockPaths: Array<{
    title: string;
    steps: string[];
    project: string;
  }>;
  mockLive: Array<{
    title: string;
    tutor: string;
    time: string;
    participants: number;
  }>;
}

const CATEGORY_META_DATA: Record<string, CategoryDetail> = {
  "academics": {
    id: "academics",
    name: "Academic Education",
    desc: "Complete academic support for school, college, and competitive exams with expert student mentors.",
    iconName: "GraduationCap",
    bannerColor: "from-blue-600/20 to-indigo-600/20 border-blue-500/20",
    subjects: ["Mathematics", "Physics", "Chemistry", "Biology", "English", "History"],
    mockCourses: [
      { id: "course-1", title: "Calculus Basic Training", tutor: "Priya Patel", duration: "12 Hours", rating: 4.8, students: 240, price: 499, difficulty: "Beginner" },
      { id: "course-2", title: "Organic Chemistry Deep Dive", tutor: "Dr. Ravi Kumar", duration: "18 Hours", rating: 4.9, students: 180, price: 699, difficulty: "Intermediate" },
      { id: "course-3", title: "Classical Physics Foundations", tutor: "Amit Sharma", duration: "15 Hours", rating: 4.7, students: 150, price: 399, difficulty: "Beginner" },
    ],
    mockTutors: [
      { id: "tutor-1", name: "Dr. Ravi Kumar", role: "Physics & Chemistry Specialist", rating: 4.9, price: 500, languages: "English, Hindi", reviewsCount: 184 },
      { id: "tutor-2", name: "Sneha Iyer", role: "IIT Mathematics Ranker", rating: 4.8, price: 450, languages: "English, Tamil", reviewsCount: 92 },
    ],
    mockPaths: [
      { title: "IIT-JEE Foundation Path", steps: ["Calculus Basics", "Mechanics Core", "General Organic Chemistry"], project: "Mock Exam Solved Sheets" }
    ],
    mockLive: [
      { title: "Calculus Limits Live Session", tutor: "Sneha Iyer", time: "Today at 5:00 PM", participants: 42 }
    ]
  },
  "technology-programming": {
    id: "technology-programming",
    name: "Technology & Programming",
    desc: "Learn modern software engineering, coding languages, web building, and system design.",
    iconName: "Code",
    bannerColor: "from-cyan-600/20 to-blue-600/20 border-cyan-500/20",
    subjects: ["Python", "JavaScript", "React", "Next.js", "Node.js", "Flutter", "Docker"],
    mockCourses: [
      { id: "course-11", title: "Next.js 16 Production Guide", tutor: "Vikram Rathore", duration: "32 Hours", rating: 4.9, students: 680, price: 999, difficulty: "Advanced" },
      { id: "course-12", title: "Python for Absolute Beginners", tutor: "Priya Patel", duration: "14 Hours", rating: 4.8, students: 1120, price: 299, difficulty: "Beginner" },
      { id: "course-13", title: "Rust Programming Basics", tutor: "Karan Malhotra", duration: "20 Hours", rating: 4.7, students: 310, price: 599, difficulty: "Intermediate" },
    ],
    mockTutors: [
      { id: "tutor-3", name: "Vikram Rathore", role: "Ex-Google Software Architect", rating: 4.9, price: 800, languages: "English, Hindi", reviewsCount: 310 },
      { id: "tutor-4", name: "Anjali Deshmukh", role: "Frontend UI Developer", rating: 4.7, price: 400, languages: "English, Marathi", reviewsCount: 54 },
    ],
    mockPaths: [
      { title: "Full Stack Engineer Roadmap", steps: ["HTML & CSS Mastery", "JavaScript Advanced", "React & Supabase integration"], project: "E-Commerce Web Portal" }
    ],
    mockLive: [
      { title: "Building a Live Chat with Next.js", tutor: "Vikram Rathore", time: "Tomorrow at 2:00 PM", participants: 110 }
    ]
  },
  "ai-data-science": {
    id: "ai-data-science",
    name: "AI & Data Science",
    desc: "Dive deep into Machine Learning, Prompt Engineering, Large Language Models, and Data Analytics.",
    iconName: "BrainCircuit",
    bannerColor: "from-purple-600/20 to-pink-600/20 border-purple-500/20",
    subjects: ["ChatGPT", "Gemini", "LangChain", "Prompt Engineering", "Machine Learning", "PyTorch"],
    mockCourses: [
      { id: "course-21", title: "AI Prompt Engineering 101", tutor: "Karan Malhotra", duration: "10 Hours", rating: 4.9, students: 420, price: 699, difficulty: "Beginner" },
      { id: "course-22", title: "Deep Learning Foundations with PyTorch", tutor: "Dr. Ravi Kumar", duration: "25 Hours", rating: 4.8, students: 280, price: 899, difficulty: "Advanced" },
    ],
    mockTutors: [
      { id: "tutor-5", name: "Karan Malhotra", role: "AI Research Engineer", rating: 4.9, price: 900, languages: "English, Punjabi", reviewsCount: 154 },
    ],
    mockPaths: [
      { title: "Generative AI Developer Roadmap", steps: ["Python Coding", "OpenAI APIs integration", "RAG Database setups"], project: "PDF Document Analyzer Chatbot" }
    ],
    mockLive: [
      { title: "Fine-Tuning LLMs Overview", tutor: "Karan Malhotra", time: "Today at 7:00 PM", participants: 85 }
    ]
  },
  "business-entrepreneurship": {
    id: "business-entrepreneurship",
    name: "Business & Entrepreneurship",
    desc: "Master starting, funding, running, and scaling successful commercial ventures and startups.",
    iconName: "Briefcase",
    bannerColor: "from-emerald-600/20 to-teal-600/20 border-emerald-500/20",
    subjects: ["Startups", "Finance", "Strategy", "Pitch Deck", "Marketing", "Sales"],
    mockCourses: [
      { id: "course-31", title: "Startup Foundations & Pitch Deck", tutor: "Sophia Miller", duration: "15 Hours", rating: 4.7, students: 190, price: 599, difficulty: "Beginner" },
      { id: "course-32", title: "Venture Capital Valuation Rules", tutor: "Amit Sharma", duration: "8 Hours", rating: 4.6, students: 95, price: 499, difficulty: "Intermediate" },
    ],
    mockTutors: [
      { id: "tutor-6", name: "Sophia Miller", role: "Startup Mentor & Pitch Coach", rating: 4.8, price: 700, languages: "English", reviewsCount: 68 },
    ],
    mockPaths: [
      { title: "Founder Launch Path", steps: ["Product Design MVP", "Financial Modelling basics", "Pitching to Angel Investors"], project: "Pitch Deck Deck Submission" }
    ],
    mockLive: [
      { title: "How to raise your first Seed Round", tutor: "Sophia Miller", time: "July 15, 6:00 PM", participants: 64 }
    ]
  }
};

// Generic fallback detail if ID is not custom
const getGenericMetadata = (id: string, name: string): CategoryDetail => ({
  id,
  name,
  desc: `Access verified classes, courses, and custom roadmap resources for ${name}.`,
  iconName: "BookOpen",
  bannerColor: "from-violet-600/20 to-indigo-600/20 border-violet-500/20",
  subjects: ["General Basics", "Intermediate Practice", "Expert Roadmaps"],
  mockCourses: [
    { id: "course-generic-1", title: `${name} Mastery Level 1`, tutor: "Expert Tutor", duration: "10 Hours", rating: 4.8, students: 120, price: 499, difficulty: "Beginner" },
    { id: "course-generic-2", title: `${name} Professional Workshop`, tutor: "Senior Coach", duration: "14 Hours", rating: 4.7, students: 85, price: 799, difficulty: "Intermediate" },
  ],
  mockTutors: [
    { id: "tutor-generic", name: "Aditi Rao", role: `${name} Lead Educator`, rating: 4.8, price: 400, languages: "English, Hindi", reviewsCount: 45 },
  ],
  mockPaths: [
    { title: `${name} Career Roadmap`, steps: ["Introductory Basics", "Hands-on Projects", "Certification Core"], project: "Final Review Task" }
  ],
  mockLive: [
    { title: `${name} Live Q&A Session`, tutor: "Aditi Rao", time: "Next Saturday at 11:00 AM", participants: 30 }
  ]
});

const getCoursePriceByDifficulty = (difficulty: string, categoryId: string) => {
  if (categoryId && (categoryId.includes("ai") || categoryId.includes("machine-learning"))) {
    return 1999;
  }
  switch (difficulty?.toLowerCase()) {
    case "beginner": return 999;
    case "intermediate": return 1299;
    case "advanced": return 1499;
    default: return 1299;
  }
};

export default function CategoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const contextStore = useCourseContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSubject, setActiveSubject] = useState("All");

  const slug = (params?.id as string) || "";
  const dbId = slugToIdMap[slug] || slug;

  // Retrieve metadata matching category
  const metadata = useMemo(() => {
    if (CATEGORY_META_DATA[dbId]) {
      return CATEGORY_META_DATA[dbId];
    }
    const cleanName = slug
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
    return getGenericMetadata(dbId, cleanName);
  }, [dbId, slug]);

  // Dynamically query category subjects from SEED_CATEGORIES
  const categorySubjects = useMemo(() => {
    const matchedCategory = SEED_CATEGORIES.find(c => c.id === dbId);
    if (!matchedCategory) return metadata.subjects;
    const list: string[] = [];
    matchedCategory.subcategories.forEach(sub => {
      sub.skills.forEach(skill => {
        if (!skill.isHidden) list.push(skill.name);
      });
    });
    return list;
  }, [dbId, metadata.subjects]);

  // Filter courses from central MOCK_COURSES
  const categoryCourses = useMemo(() => {
    const raw = MOCK_COURSES.filter(c => c.categoryId === dbId);
    return raw.map(c => ({
      id: c.id,
      title: c.title,
      tutor: c.tutorName,
      duration: c.duration,
      rating: c.rating,
      students: c.studentsCount,
      price: c.price,
      difficulty: (c.level === "all_levels" ? "Beginner" : c.level.charAt(0).toUpperCase() + c.level.slice(1)) as any,
      subjectName: c.subjectName,
      subjectId: c.subjectId,
    }));
  }, [dbId]);

  // Filter Spotlight Tutors
  const categoryTutors = useMemo(() => {
    const raw = MOCK_TUTORS.filter(t => t.subjectsTaught.some(s => categorySubjects.includes(s)));
    return raw.map(t => ({
      id: t.id,
      name: t.fullName,
      role: t.bio.substring(0, 50) + "...",
      rating: t.rating,
      price: parseInt((t.singleSubjectFee || "").replace(/[^0-9]/g, "")) || 500,
      languages: t.languages.join(", "),
      reviewsCount: t.totalStudents - 10,
      subjectsTaught: t.subjectsTaught,
    }));
  }, [categorySubjects]);

  const filteredTutors = useMemo(() => {
    if (activeSubject === "All") return categoryTutors.slice(0, 4);
    return categoryTutors.filter(t => t.subjectsTaught.includes(activeSubject)).slice(0, 4);
  }, [categoryTutors, activeSubject]);

  // Combined Courses data search & subject filter
  const filteredCourses = useMemo(() => {
    return categoryCourses.filter((c) => {
      const matchesSearch =
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.tutor.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (activeSubject === "All") return true;
      return c.subjectName === activeSubject;
    });
  }, [categoryCourses, searchQuery, activeSubject]);

  // Dynamic Live Classes
  const activeLiveClasses = useMemo(() => {
    const subjectsToSearch = activeSubject === "All" ? categorySubjects : [activeSubject];
    const liveClassesList: any[] = [];
    
    subjectsToSearch.forEach((sub, idx) => {
      const course = MOCK_COURSES.find(c => c.subjectName === sub);
      const title = course ? `Live Practice: ${course.title}` : `Interactive Class: ${sub} Basics`;
      const tutorObj = MOCK_TUTORS.find(t => t.subjectsTaught.includes(sub)) || MOCK_TUTORS[idx % MOCK_TUTORS.length];
      
      liveClassesList.push({
        title,
        tutor: tutorObj.fullName,
        time: idx === 0 ? "Live Now" : "Today at 6:00 PM IST",
        participants: 12 + (idx * 8),
        subjectName: sub
      });
    });
    
    return liveClassesList.slice(0, 3);
  }, [activeSubject, categorySubjects]);

  // Calculate age, eligibility, userLevel
  const [userAge, setUserAge] = useState(18);

  useEffect(() => {
    if (!user?.dob) return;
    try {
      const birthDate = new Date(user.dob);
      const difference = Date.now() - birthDate.getTime();
      const ageDate = new Date(difference);
      setUserAge(Math.abs(ageDate.getUTCFullYear() - 1970));
    } catch {
      setUserAge(18);
    }
  }, [user]);

  const userLevel = useMemo(() => {
    if (userAge < 14) return "Beginner";
    if (userAge < 18) return "Intermediate";
    return "Advanced";
  }, [userAge]);

  const eligibility = useMemo(() => {
    if (userAge < 12) return "Primary School";
    if (userAge < 15) return "Middle School";
    if (userAge < 18) return "High School";
    return "College / Adult";
  }, [userAge]);

  // Dynamic Roadmap
  const dynamicRoadmap = useMemo(() => {
    const subjectName = activeSubject === "All" ? (categorySubjects[0] || metadata.name) : activeSubject;
    const isProjectSub = ["programming", "ai-data-science", "creative-arts-design", "video-editing-animation", "photography-media"].includes(dbId);
    
    return {
      title: `${subjectName} Guided Pathway (${eligibility})`,
      steps: [
        `Step 1: Introduction to ${subjectName} basics for ${userLevel} levels`,
        `Step 2: Practical applications and hands-on drills`,
        `Step 3: Advanced Optimization & Certification Capstone`
      ],
      project: isProjectSub ? `Portfolio Submission` : `Written evaluation assessment`
    };
  }, [activeSubject, categorySubjects, metadata.name, eligibility, userLevel, dbId]);

  // Set course context for Sparky AI Chat
  useEffect(() => {
    contextStore.setCourseContext({
      subject: activeSubject === "All" ? (categorySubjects[0] || null) : activeSubject,
      difficulty: userLevel,
      userLevel: eligibility,
      roadmap: dynamicRoadmap.title,
    });
  }, [activeSubject, categorySubjects, userLevel, eligibility, dynamicRoadmap.title]);

  const handleAskSparky = (e: React.MouseEvent) => {
    e.preventDefault();
    const promptMessage = `I want roadmap recommendations, top courses, and projects for ${metadata.name} (specifically ${activeSubject === "All" ? "all subjects" : activeSubject} at ${userLevel} level).`;
    window.dispatchEvent(
      new CustomEvent("open-sparky-chat", {
        detail: { prompt: promptMessage },
      })
    );
  };

  return (
    <PageWrapper>
      <Container className="py-8 flex flex-col gap-6 text-left select-none">
        
        {/* 12. BREADCRUMBS */}
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground select-none font-bold">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span>&gt;</span>
          <Link href="/categories" className="hover:text-primary transition-colors">Categories</Link>
          <span>&gt;</span>
          <span className="text-foreground font-extrabold">{metadata.name}</span>
        </div>

        {/* 13. BACK BUTTON */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors font-bold select-none w-fit"
        >
          <ArrowLeft size={14} /> Back to Categories
        </button>

        {/* HERO BANNER SECTION */}
        <div className={`w-full p-8 rounded-3xl border bg-gradient-to-br ${metadata.bannerColor} relative overflow-hidden flex flex-col gap-5 mt-2`}>
          <div className="absolute inset-0 bg-gradient-to-t from-background/30 via-transparent to-transparent z-0" />
          
          <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-background/90 border border-border/80 flex items-center justify-center text-primary shadow-md">
                <CategoryIcon name={metadata.iconName} className="w-8 h-8" />
              </div>
              <div>
                <span className="text-[9px] font-extrabold tracking-widest text-primary uppercase bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-full">
                  Verified Category
                </span>
                <h1 className="text-2xl md:text-3xl font-heading font-black text-foreground tracking-tight mt-1">
                  {metadata.name}
                </h1>
              </div>
            </div>

            <Button
              onClick={handleAskSparky}
              className="text-[10px] font-black uppercase tracking-wider py-4 px-5 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground shadow-lg flex items-center gap-1.5 shrink-0"
            >
              Ask Sparky <Sparkles size={13} className="text-yellow-300 fill-current animate-pulse" />
            </Button>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl relative z-10 mt-1">
            {metadata.desc}
          </p>

          {/* Quick Category Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 border-t border-border/30 pt-6 mt-2 relative z-10 text-left">
            {[
              { label: "Active Courses", value: `${categoryCourses.length}+ Courses` },
              { label: "Verified Mentors", value: `${categoryTutors.length > 0 ? categoryTutors.length : "40+"} Tutors` },
              { label: "Learning Roadmaps", value: `1 Pathway` },
              { label: "Average Rating", value: "⭐ 4.9 Average" }
            ].map((stat, index) => (
              <div key={index} className="flex flex-col gap-0.5">
                <span className="text-[8px] text-muted-foreground/80 font-bold uppercase tracking-wider">{stat.label}</span>
                <span className="text-xs font-heading font-extrabold text-foreground">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* SEARCH & FILTERS ROW */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-6 border-b border-border/40 pb-6">
          <div className="relative w-full md:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={`Search ${activeSubject === "All" ? metadata.name : activeSubject} courses...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-border bg-card/60 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <button
              onClick={() => setActiveSubject("All")}
              className={`px-3 py-1 rounded-full border text-[9px] font-bold uppercase tracking-wider transition-all shrink-0 ${
                activeSubject === "All"
                  ? "bg-primary border-primary text-primary-foreground"
                  : "bg-card border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              All Subjects
            </button>
            {categorySubjects.map((sub) => (
              <button
                key={sub}
                onClick={() => setActiveSubject(sub)}
                className={`px-3 py-1 rounded-full border text-[9px] font-bold uppercase tracking-wider transition-all shrink-0 ${
                  activeSubject === sub
                    ? "bg-primary border-primary text-primary-foreground"
                    : "bg-card border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        </div>

        {/* MAIN BODY GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mt-4">
          
          {/* LEFT AREA: Courses & Live classes */}
          <div className="lg:col-span-8 flex flex-col gap-10">
            
            {/* 15. COURSES SECTION & EMPTY STATE */}
            <div>
              <h2 className="text-lg font-heading font-extrabold text-foreground mb-4">
                📚 Popular Courses
              </h2>
              {filteredCourses.length === 0 ? (
                <Card variant="glass" className="p-8 text-center flex flex-col items-center justify-center gap-3">
                  <HelpCircle className="w-10 h-10 text-muted-foreground/60 animate-bounce" />
                  <h3 className="text-xs font-bold text-foreground">No Courses Found</h3>
                  <p className="text-[10px] text-muted-foreground">
                    Try adjusting your search filters or check back later for newly published modules.
                  </p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredCourses.map((course) => (
                    <Link key={course.id} href={`/courses/${course.id}`}>
                      <Card
                        variant="glass"
                        className="p-4 border border-border/80 hover:border-primary/20 bg-card rounded-2xl hover:shadow-lg transition-all group duration-300"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[7.5px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded border border-accent/25 bg-accent/5 text-accent">
                            {course.difficulty}
                          </span>
                          <span className="text-[9px] font-extrabold text-primary">₹{course.price}</span>
                        </div>

                        <h4 className="text-xs font-heading font-extrabold text-foreground mt-3 group-hover:text-primary transition-colors leading-tight line-clamp-1">
                          {course.title}
                        </h4>

                        <div className="flex items-center justify-between text-[8.5px] text-muted-foreground mt-4 font-semibold">
                          <span className="flex items-center gap-0.5">
                            <User size={11} className="text-primary/70" /> {course.tutor}
                          </span>
                          <span className="flex items-center gap-0.5">
                            <Clock size={11} className="text-primary/70" /> {course.duration}
                          </span>
                        </div>

                        <div className="flex items-center justify-between border-t border-border/30 pt-3 mt-3 text-[9px]">
                          <span className="flex items-center gap-0.5 text-amber-500 font-extrabold">
                            <Star size={11} className="fill-current" /> {course.rating.toFixed(1)}
                          </span>
                          <span className="text-muted-foreground font-semibold">
                            {course.students} Students
                          </span>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* LIVE CLASSES SECTION */}
            <div>
              <h2 className="text-lg font-heading font-extrabold text-foreground mb-4">
                🔴 Active Live Classes
              </h2>
              {activeLiveClasses.length === 0 ? (
                <Card variant="glass" className="p-6 text-center">
                  <span className="text-xs text-muted-foreground">No active live classes scheduled.</span>
                </Card>
              ) : (
                <div className="flex flex-col gap-3">
                  {activeLiveClasses.map((live, idx) => (
                    <Card
                      key={idx}
                      variant="glass"
                      className="p-4 border border-border bg-card rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-primary/20 transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 shrink-0">
                          <Video className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-heading font-extrabold text-foreground leading-tight">
                            {live.title}
                          </h4>
                          <div className="flex items-center gap-3 text-[9px] text-muted-foreground mt-1 font-semibold">
                            <span className="flex items-center gap-0.5">
                              <User className="w-2.5 h-2.5" /> Tutor: {live.tutor}
                            </span>
                            <span className="flex items-center gap-0.5">
                              <Clock className="w-2.5 h-2.5" /> {live.time}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
                        <span className="text-[9px] font-extrabold text-emerald-400">
                          👥 {live.participants} watching
                        </span>
                        <Link href="/live-classes">
                          <Button size="sm" className="bg-red-500 hover:bg-red-600 text-white font-extrabold text-[9.5px] px-4 py-2 rounded-lg flex items-center gap-1">
                            <Play size={10} className="fill-current" /> Join Class
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* 10. LEARNING PATHS ROADMAP */}
            <div>
              <h2 className="text-lg font-heading font-extrabold text-foreground mb-4">
                🗺️ Recommended Learning Roadmap
              </h2>
              <Card
                variant="glass"
                className="p-5 border border-border bg-card rounded-2xl flex flex-col gap-4 text-left relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
                
                <div>
                  <h3 className="text-xs font-heading font-extrabold text-foreground">
                    {dynamicRoadmap.title}
                  </h3>
                  <p className="text-[9px] text-muted-foreground mt-0.5 font-semibold">
                    Complete all steps sequentially to unlock path certification.
                  </p>
                </div>

                {/* Steps Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                  {dynamicRoadmap.steps.map((step, sIdx) => (
                    <div key={sIdx} className="p-3 rounded-xl border border-border bg-muted/20 relative flex flex-col gap-1 text-left">
                      <span className="absolute top-2 right-2 text-[8px] bg-primary/10 text-primary px-1.5 py-0.2 rounded font-black">
                        Step {sIdx + 1}
                      </span>
                      <h4 className="text-[10px] font-extrabold text-foreground pr-8 leading-tight">
                        {step}
                      </h4>
                      <span className="text-[8px] text-muted-foreground mt-1.5">
                        Recommended Module
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 mt-2 pt-4 border-t border-border/30 text-[9px] text-muted-foreground font-extrabold uppercase tracking-wider">
                  <span className="flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-primary" /> Project: {dynamicRoadmap.project}
                  </span>
                  <Link href={`/learning-paths/${activeSubject === "All" ? (categorySubjects[0]?.toLowerCase() || "intro") : activeSubject.toLowerCase()}`}>
                    <Button size="sm" variant="outline" className="text-[9px] font-bold py-2 rounded-lg">
                      Start Roadmap
                    </Button>
                  </Link>
                </div>
              </Card>
            </div>

          </div>

          {/* RIGHT AREA: Spotlight Tutors & Sidebar Sparky widget */}
          <div className="lg:col-span-4 flex flex-col gap-6 w-full">
            
            {/* SPOTLIGHT TUTORS */}
            <div>
              <h2 className="text-lg font-heading font-extrabold text-foreground mb-4">
                👨‍🏫 Spotlight Tutors
              </h2>
              {filteredTutors.length === 0 ? (
                <Card variant="glass" className="p-6 text-center">
                  <span className="text-xs text-muted-foreground">No mentors listed for this subject.</span>
                </Card>
              ) : (
                <div className="flex flex-col gap-3">
                  {filteredTutors.map((tutor) => (
                    <Card
                      key={tutor.id}
                      variant="glass"
                      className="p-4 border border-border bg-card rounded-2xl text-left hover:border-primary/20 transition-all flex flex-col gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-heading font-extrabold text-xs shrink-0">
                          {tutor.name.split(" ").map(w => w[0]).join("")}
                        </div>
                        <div>
                          <h4 className="text-xs font-extrabold text-foreground">
                            {tutor.name}
                          </h4>
                          <p className="text-[9px] text-muted-foreground font-semibold leading-tight">
                            {tutor.role}
                          </p>
                        </div>
                      </div>

                      <ul className="space-y-1 mt-2 text-[9px] text-muted-foreground font-semibold border-t border-border/30 pt-3">
                        <li className="flex items-center justify-between">
                          <span>Languages:</span>
                          <span className="text-foreground">{tutor.languages}</span>
                        </li>
                        <li className="flex items-center justify-between">
                          <span>Tutor Level:</span>
                          <span className="text-primary font-bold">
                            {tutor.rating >= 4.9 ? "👑 Elite Mentor" : tutor.rating >= 4.8 ? "🏆 Top Mentor" : tutor.rating >= 4.7 ? "⭐ Popular Tutor" : "🌱 Rising Tutor"}
                          </span>
                        </li>
                      </ul>

                      <div className="flex items-center justify-between text-[9px] pt-3 border-t border-border/30 font-extrabold">
                        <span className="flex items-center gap-0.5 text-amber-500">
                          <Star className="w-3.5 h-3.5 fill-current" /> {tutor.rating} ({tutor.reviewsCount} reviews)
                        </span>
                        <Link href={`/tutors/${tutor.id}`}>
                          <span className="text-primary hover:underline flex items-center gap-0.5 cursor-pointer">
                            View Profile &rarr;
                          </span>
                        </Link>
                      </div>

                      <Link href={`/tutors/${tutor.id}?bookTrial=true`} className="w-full">
                        <Button size="sm" className="w-full text-[9px] font-bold py-2 rounded-lg">
                          Book Free Trial
                        </Button>
                      </Link>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* SPARKY AI SIDEBAR CARD */}
            <Card
              variant="glass"
              className="p-5 border border-primary/20 bg-primary/5 rounded-2xl text-left relative overflow-hidden flex flex-col gap-4"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Sparkles className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-xs font-heading font-extrabold text-foreground">
                    ✨ Ask Sparky AI
                  </h3>
                  <span className="text-[8px] text-primary font-bold uppercase tracking-wider">
                    ✨ Smart Recommendation
                  </span>
                </div>
              </div>

              <p className="text-[10px] text-muted-foreground leading-relaxed">
                Connect your learning goals in {metadata.name} directly. Sparky matches you with personalized tutors, roadmaps, and exercises.
              </p>

              <Button
                onClick={handleAskSparky}
                className="w-full text-[9.5px] font-bold py-2 bg-primary hover:bg-primary/95 text-primary-foreground shadow-sm flex items-center justify-center gap-1"
              >
                Match Tutors & Roadmap <Sparkles className="w-3 h-3 text-yellow-300" />
              </Button>
            </Card>

          </div>

        </div>

        {/* 14. RELATED CONTENT BOTTOM SECTION */}
        <div className="border-t border-border/40 pt-10 mt-10">
          <h2 className="text-lg font-heading font-extrabold text-foreground mb-6">
            🔗 Related Learning Categories
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Object.entries(CATEGORY_META_DATA)
              .filter(([id]) => id !== dbId)
              .slice(0, 4)
              .map(([id, cat]) => (
                <Link key={id} href={`/categories/${id === "academics" ? "academic-education" : id === "creative-arts-design" ? "creative-arts" : id === "video-editing-animation" ? "video-editing" : id}`}>
                  <Card
                    variant="glass"
                    className="p-4 border border-border/80 hover:border-primary/20 bg-card rounded-2xl flex items-center gap-3 group hover:-translate-y-0.5 transition-all"
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-center text-primary group-hover:text-primary-foreground group-hover:bg-primary transition-all shrink-0">
                      <CategoryIcon name={cat.iconName} className="w-4.5 h-4.5" />
                    </div>
                    <div className="text-left">
                      <h4 className="text-[10px] font-heading font-extrabold text-foreground group-hover:text-primary transition-colors leading-tight line-clamp-1">
                        {cat.name}
                      </h4>
                      <span className="text-[8px] text-muted-foreground">
                        Explore Category
                      </span>
                    </div>
                  </Card>
                </Link>
              ))}
          </div>
        </div>

      </Container>
    </PageWrapper>
  );
}
