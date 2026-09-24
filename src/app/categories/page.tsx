"use client";
import { cn } from "../../utils/cn";
import { Tuitions } from "../../components/layout/Tuitions";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { getCategoryBanner } from "../../lib/courseThumbnailRegistry";
import { Container } from "../../components/layout/Container";
import { PageWrapper } from "../../components/layout/PageWrapper";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { StaggerContainer, staggerChildVariants } from "../../components/animations";
import { motion, AnimatePresence } from "framer-motion";
import {
  Code,
  BrainCircuit,
  Music,
  Camera,
  Briefcase,
  Languages,
  Palette,
  GraduationCap,
  Flame,
  Sparkles,
  Star,
  Users,
  CheckCircle2,
  ArrowRight,
  Clock,
  User,
  BookOpen,
  Search,
  Check,
  Video,
  Award,
  ShieldCheck,
  CheckCircle,
  Cpu,
} from "lucide-react";

// Helper map to match icon string to Lucide component
const IconComponent = ({ name, className }: { name: string; className?: string }) => {
  switch (name) {
    case "GraduationCap":
      return <GraduationCap className={className} />;
    case "Code":
      return <Code className={className} />;
    case "BrainCircuit":
      return <BrainCircuit className={className} />;
    case "Cpu":
      return <Cpu className={className} />;
    case "Briefcase":
      return <Briefcase className={className} />;
    case "Palette":
      return <Palette className={className} />;
    case "Camera":
      return <Camera className={className} />;
    case "Music":
      return <Music className={className} />;
    case "Flame":
      return <Flame className={className} />;
    case "Languages":
      return <Languages className={className} />;
    default:
      return <BookOpen className={className} />;
  }
};

interface CategoryItem {
  id: string;
  name: string;
  desc: string;
  iconName: string;
  badge: "Trending" | "Best Seller" | "Fast Growing" | "New" | "Featured" | "Popular";
  accentColor: string;
  badgeColor: string;
  skills: string[];
  featuredCourse: {
    title: string;
    tutor: string;
    duration: string;
    rating: number;
    students: number;
    price: number;
    thumbnailColor: string;
  };
  stats: {
    courses: number;
    liveClasses: number;
    students: number;
    rating: number;
  };
}

const DEFAULT_CATEGORIES: CategoryItem[] = [
  {
    id: "academics",
    name: "Academic Education",
    desc: "Master school, college and university subjects.",
    iconName: "GraduationCap",
    badge: "Featured",
    accentColor: "border-blue-500/20 text-blue-400 group-hover:border-blue-500/40",
    badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    skills: ["Mathematics", "Physics", "Chemistry", "Biology", "English", "History"],
    featuredCourse: {
      title: "Calculus Basic Training",
      tutor: "Priya Patel",
      duration: "12 Hours",
      rating: 4.8,
      students: 240,
      price: 499,
      thumbnailColor: "from-blue-600/20 to-indigo-600/20",
    },
    stats: { courses: 29, liveClasses: 12, students: 1240, rating: 4.8 },
  },
  {
    id: "programming",
    name: "Technology & Programming",
    desc: "Learn software development from beginner to advanced.",
    iconName: "Code",
    badge: "Trending",
    accentColor: "border-cyan-500/20 text-cyan-400 group-hover:border-cyan-500/40",
    badgeColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    skills: ["Python", "Java", "JavaScript", "React", "Next.js", "Node.js"],
    featuredCourse: {
      title: "Complete Full Stack Development",
      tutor: "Vikram Rathore",
      duration: "42 Hours",
      rating: 4.9,
      students: 580,
      price: 999,
      thumbnailColor: "from-cyan-600/20 to-blue-600/20",
    },
    stats: { courses: 48, liveClasses: 18, students: 3420, rating: 4.9 },
  },
  {
    id: "ai",
    name: "AI & Data Science",
    desc: "Build AI applications using modern tools and frameworks.",
    iconName: "BrainCircuit",
    badge: "Best Seller",
    accentColor: "border-purple-500/20 text-purple-400 group-hover:border-purple-500/40",
    badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    skills: ["LLMs", "Machine Learning", "Deep Learning", "Prompt Engineering", "PyTorch", "TensorFlow"],
    featuredCourse: {
      title: "AI Prompt Engineering 101",
      tutor: "Karan Malhotra",
      duration: "10 Hours",
      rating: 4.9,
      students: 420,
      price: 699,
      thumbnailColor: "from-purple-600/20 to-pink-600/20",
    },
    stats: { courses: 15, liveClasses: 6, students: 1850, rating: 4.9 },
  },
  {
    id: "engineering-electronics",
    name: "Engineering & Electronics",
    desc: "Master ECE & Embedded, EEE & Power, Robotics & IoT, VLSI, EV & BMS, and practical hardware engineering.",
    iconName: "Cpu",
    badge: "New",
    accentColor: "border-blue-500/20 text-blue-400 group-hover:border-blue-500/40",
    badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    skills: ["ECE & Embedded", "EEE & Power", "Robotics & IoT", "VLSI", "EV & BMS", "PLC / SCADA"],
    featuredCourse: {
      title: "ESP32 & IoT Embedded Firmware Masterclass",
      tutor: "Dr. Ananya Ray",
      duration: "22 Hours",
      rating: 4.9,
      students: 310,
      price: 699,
      thumbnailColor: "from-blue-600/20 to-cyan-600/20",
    },
    stats: { courses: 14, liveClasses: 8, students: 950, rating: 4.9 },
  },
  {
    id: "business",
    name: "Business & Entrepreneurship",
    desc: "Launch startups and build business skills.",
    iconName: "Briefcase",
    badge: "Popular",
    accentColor: "border-emerald-500/20 text-emerald-400 group-hover:border-emerald-500/40",
    badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    skills: ["Startups", "Finance", "Marketing", "Strategy", "Public Relations", "Sales"],
    featuredCourse: {
      title: "Startup Foundations & Pitch Deck",
      tutor: "Sophia Miller",
      duration: "15 Hours",
      rating: 4.7,
      students: 190,
      price: 599,
      thumbnailColor: "from-emerald-600/20 to-teal-600/20",
    },
    stats: { courses: 22, liveClasses: 8, students: 1100, rating: 4.7 },
  },
  {
    id: "design",
    name: "Creative Design",
    desc: "UI/UX, Graphic Design, Motion Graphics and Branding.",
    iconName: "Palette",
    badge: "Fast Growing",
    accentColor: "border-pink-500/20 text-pink-400 group-hover:border-pink-500/40",
    badgeColor: "bg-pink-500/10 text-pink-400 border-pink-500/20",
    skills: ["UI/UX", "Graphic Design", "Figma", "Branding", "Illustrator", "Motion Graphics"],
    featuredCourse: {
      title: "UX/UI Design Mastery with Figma",
      tutor: "Karan Malhotra",
      duration: "24 Hours",
      rating: 4.8,
      students: 310,
      price: 799,
      thumbnailColor: "from-pink-600/20 to-purple-600/20",
    },
    stats: { courses: 19, liveClasses: 5, students: 950, rating: 4.8 },
  },
  {
    id: "photography",
    name: "Photography & Video",
    desc: "Master photography, videography and editing.",
    iconName: "Camera",
    badge: "New",
    accentColor: "border-orange-500/20 text-orange-400 group-hover:border-orange-500/40",
    badgeColor: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    skills: ["DSLR Settings", "Video Editing", "Lightroom", "Premiere Pro", "Lighting", "Storyboarding"],
    featuredCourse: {
      title: "Advanced DSLR Photography Masterclass",
      tutor: "Anjali Deshmukh",
      duration: "8 Hours",
      rating: 4.6,
      students: 110,
      price: 399,
      thumbnailColor: "from-orange-600/20 to-amber-600/20",
    },
    stats: { courses: 12, liveClasses: 4, students: 620, rating: 4.6 },
  },
  {
    id: "music",
    name: "Music & Performing Arts",
    desc: "Develop creative talents with expert guidance.",
    iconName: "Music",
    badge: "Popular",
    accentColor: "border-violet-500/20 text-violet-400 group-hover:border-violet-500/40",
    badgeColor: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    skills: ["Keyboard", "Guitar", "Music Theory", "Piano", "Vocals", "Sound Design"],
    featuredCourse: {
      title: "Fundamentals of Keyboard & Chords",
      tutor: "Aarav Sharma",
      duration: "12 Hours",
      rating: 4.8,
      students: 290,
      price: 499,
      thumbnailColor: "from-violet-600/20 to-indigo-600/20",
    },
    stats: { courses: 25, liveClasses: 10, students: 1680, rating: 4.8 },
  },
  {
    id: "fitness",
    name: "Health & Fitness",
    desc: "Nutrition, wellness, yoga and personal fitness.",
    iconName: "Flame",
    badge: "Featured",
    accentColor: "border-red-500/20 text-red-400 group-hover:border-red-500/40",
    badgeColor: "bg-red-500/10 text-red-400 border-red-500/20",
    skills: ["Nutrition", "Yoga", "Aerobics", "Wellness", "Muscle Building", "Core Strength"],
    featuredCourse: {
      title: "Vinyasa Yoga & Breathwork",
      tutor: "Sneha Iyer",
      duration: "6 Hours",
      rating: 4.7,
      students: 95,
      price: 299,
      thumbnailColor: "from-red-600/20 to-orange-600/20",
    },
    stats: { courses: 14, liveClasses: 3, students: 510, rating: 4.7 },
  },
  {
    id: "languages",
    name: "Language Learning",
    desc: "Master international and regional languages.",
    iconName: "Languages",
    badge: "Fast Growing",
    accentColor: "border-indigo-500/20 text-indigo-400 group-hover:border-indigo-500/40",
    badgeColor: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    skills: ["English", "Spanish", "French", "German", "Japanese", "Sanskrit"],
    featuredCourse: {
      title: "Conversational Spanish Fluency",
      tutor: "Jessica Day",
      duration: "18 Hours",
      rating: 4.8,
      students: 150,
      price: 499,
      thumbnailColor: "from-indigo-600/20 to-blue-600/20",
    },
    stats: { courses: 16, liveClasses: 5, students: 840, rating: 4.8 },
  },
];


function getImageFitMode(src?: string): { fitClass: string; bgClass: string; scaleClass: string } {
  if (!src) return { fitClass: "object-cover", bgClass: "bg-muted", scaleClass: "scale-100 group-hover:scale-105" };
  const filename = src.split("/").pop()?.toLowerCase() || "";
  
  const ignored = ["english", "languages", "classroom", "communication", "fallback", "academic-education", "generic-education", "generic-business"];
  if (ignored.some(word => filename.includes(word))) {
    return {
      fitClass: "object-cover",
      bgClass: "bg-muted",
      scaleClass: "scale-100 group-hover:scale-105"
    };
  }
  
  if (filename.includes("commerce")) {
    return {
      fitClass: "object-contain p-3.5",
      bgClass: "bg-slate-50 dark:bg-slate-900/60",
      scaleClass: "scale-[1.02] group-hover:scale-[1.08]"
    };
  }
  if (filename.includes("accountancy") || filename.includes("accounting")) {
    return {
      fitClass: "object-contain p-2.5",
      bgClass: "bg-slate-50 dark:bg-slate-900/60",
      scaleClass: "scale-[1.06] group-hover:scale-[1.12]"
    };
  }
  if (filename.includes("ai") || filename.includes("ai-data-science") || filename.includes("business")) {
    return {
      fitClass: "object-contain p-2.5",
      bgClass: "bg-slate-50 dark:bg-slate-900/60",
      scaleClass: "scale-[1.10] group-hover:scale-[1.16]"
    };
  }
  if (filename.includes("python") || filename.includes("web-dev")) {
    return {
      fitClass: "object-contain p-2.5",
      bgClass: "bg-slate-50 dark:bg-slate-900/60",
      scaleClass: "scale-[1.10] group-hover:scale-[1.16]"
    };
  }
  if (filename.includes("music") || filename.includes("dance") || filename.includes("photography") || filename.includes("video-editing")) {
    return {
      fitClass: "object-contain p-2",
      bgClass: "bg-slate-50 dark:bg-slate-900/60",
      scaleClass: "scale-[1.05] group-hover:scale-[1.11]"
    };
  }
  if (filename.includes("sports") || filename.includes("fitness")) {
    return {
      fitClass: "object-contain p-2",
      bgClass: "bg-slate-50 dark:bg-slate-900/60",
      scaleClass: "scale-[1.08] group-hover:scale-[1.14]"
    };
  }
  if (filename.includes("mathematics") || filename.includes("physics") || filename.includes("chemistry") || filename.includes("biology") || filename.includes("academics") || filename.includes("academic")) {
    return {
      fitClass: "object-contain p-2.5",
      bgClass: "bg-slate-50 dark:bg-slate-900/60",
      scaleClass: "scale-[1.08] group-hover:scale-[1.14]"
    };
  }
  if (filename.includes("technology") || filename.includes("coding") || filename.includes("computer-science") || filename.includes("generic-programming")) {
    return {
      fitClass: "object-contain p-2.5",
      bgClass: "bg-slate-50 dark:bg-slate-900/60",
      scaleClass: "scale-[1.08] group-hover:scale-[1.14]"
    };
  }
  if (filename.includes("creative") || filename.includes("arts") || filename.includes("drawing") || filename.includes("painting") || filename.includes("sketching") || filename.includes("cooking")) {
    return {
      fitClass: "object-contain p-2.5",
      bgClass: "bg-slate-50 dark:bg-slate-900/60",
      scaleClass: "scale-[1.08] group-hover:scale-[1.14]"
    };
  }
  
  return {
    fitClass: "object-contain p-2.5",
    bgClass: "bg-slate-50 dark:bg-slate-900/60",
    scaleClass: "scale-[1.08] group-hover:scale-[1.14]"
  };
}

export default function CategoriesPage() {
  const getCategorySlug = (id: string) => {
    switch (id) {
      case "academics": return "academic-education";
      case "technology-programming": return "technology-programming";
      case "ai-data-science": return "ai-data-science";
      case "engineering":
      case "engineering-electronics": return "engineering";
      case "business-entrepreneurship": return "business-entrepreneurship";
      case "creative-arts-design": return "creative-arts";
      case "photography-media": return "photography-media";
      case "video-editing-animation": return "video-editing";
      case "music": return "music";
      case "dance": return "dance";
      case "sports-fitness": return "sports-fitness";
      case "languages": return "languages";
      case "communication": return "communication";
      case "cooking-lifestyle": return "cooking-lifestyle";
      case "marketing": return "marketing";
      default: return id;
    }
  };

  const [categories, setCategories] = useState<CategoryItem[]>(DEFAULT_CATEGORIES);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});

  const handleImageError = (id: string) => {
    setFailedImages((prev) => ({ ...prev, [id]: true }));
  };
  // Removed unused tutoring stats states
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  // Entrance count-up states
  const [stats, setStats] = useState({
    courses: 0,
    tutors: 0,
    liveClasses: 0,
    rating: 0,
  });

  useEffect(() => {
    // Count-up animation emulation
    const duration = 1500;
    const steps = 60;
    const stepTime = duration / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      setStats({
        courses: Math.min(Math.round((1200 / steps) * currentStep), 1200),
        tutors: Math.min(Math.round((600 / steps) * currentStep), 600),
        liveClasses: Math.min(Math.round((250 / steps) * currentStep), 250),
        rating: Math.min(Number(((4.9 / steps) * currentStep).toFixed(1)), 4.9),
      });

      if (currentStep >= steps) clearInterval(timer);
    }, stepTime);

    return () => clearInterval(timer);
  }, []);

  // Load real Supabase data on mount
  useEffect(() => {
    async function loadStats() {
      try {
        const { createClient } = await import("../../lib/supabase");
        const supabase = createClient();

        // 1. Load courses
        const { data: dbCourses } = await supabase
          .from("courses")
          .select("id, title, category, tutor_id, rating, duration, status")
          .eq("status", "published");

        // 2. Load enrollments count
        const { data: dbEnrollments } = await supabase
          .from("enrollments")
          .select("course_id");

        // Active tutors count loaded inside Tuitions component

        if (dbCourses && dbCourses.length > 0) {
          const updated = DEFAULT_CATEGORIES.map((cat) => {
            const catCourses = dbCourses.filter(
              (c: any) =>
                c.category?.toLowerCase() === cat.id ||
                c.category?.toLowerCase() === cat.name.toLowerCase()
            );

            const courseIds = catCourses.map((c: any) => c.id);
            const catEnrollments = dbEnrollments
              ? dbEnrollments.filter((e: any) => courseIds.includes(e.course_id))
              : [];

            // Find best course
            let feat = cat.featuredCourse;
            if (catCourses.length > 0) {
              const best = catCourses.reduce((prev: any, current: any) =>
                (prev.rating || 0) > (current.rating || 0) ? prev : current
              );
              feat = {
                title: best.title,
                tutor: "Tutor Expert",
                duration: best.duration || "Self-paced",
                rating: best.rating || 4.8,
                students: catEnrollments.length || 120,
                price: 499,
                thumbnailColor: cat.featuredCourse.thumbnailColor,
              };
            }

            return {
              ...cat,
              stats: {
                courses: Math.max(catCourses.length, cat.stats.courses),
                liveClasses: cat.stats.liveClasses,
                students: Math.max(catEnrollments.length, cat.stats.students),
                rating: cat.stats.rating,
              },
              featuredCourse: feat,
            };
          });

          setCategories(updated);
        }
      } catch (err) {
        console.warn("Failed to load live categories from Supabase, falling back to mock stats:", err);
      }
    }

    loadStats();
  }, []);

  const handleAskSparky = (e: React.MouseEvent) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent("open-sparky-chat"));
  };

  // Filter & Search logic
  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      // 1. Search Query filter
      const matchesSearch =
        cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      // 2. Active Quick filter tab
      if (activeFilter === "All") return true;
      if (activeFilter === "Courses" && cat.stats.courses > 0) return true;
      if (activeFilter === "Live Classes" && cat.stats.liveClasses > 0) return true;
      if (activeFilter === "AI Skills" && cat.id === "ai") return true;
      if (activeFilter === "Tuition" && cat.id === "academics") return true;

      return true;
    });
  }, [categories, searchQuery, activeFilter]);

  return (
    <PageWrapper>
      {/* 1. HERO SECTION */}
      <section className="w-full py-20 bg-background text-left relative overflow-hidden select-none border-b border-border/40">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.06),rgba(255,255,255,0))]" />
        
        <Container className="flex flex-col gap-8 relative z-10">
          
          {/* Small Premium Badge */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/25 bg-violet-500/5 text-[9px] uppercase tracking-wider text-violet-400 font-extrabold w-fit shadow-[0_0_15px_-3px_rgba(139,92,246,0.1)]"
          >
            <Sparkles size={11} className="text-yellow-400 animate-pulse" />
            <span>India&apos;s First AI-Powered Student-to-Student Learning Marketplace</span>
          </motion.div>

          <div className="flex flex-col gap-4">
            <motion.h1 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-6xl font-heading font-extrabold text-foreground tracking-tight leading-none max-w-4xl"
            >
              Explore Our Premium <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-primary to-purple-400">
                Learning Categories
              </span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-sm text-muted-foreground max-w-2xl leading-relaxed mt-1"
            >
              Connect with vetted student mentors and professional tutors. Level up with live courses, interactive coding sessions, creative workshops, and 1-on-1 AI-enhanced mentorships.
            </motion.p>
          </div>

          {/* CTA Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex items-center flex-wrap gap-4 mt-2"
          >
            <Link href="/courses">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-extrabold text-xs px-6 py-5 rounded-xl shadow-md flex items-center gap-1.5 transition-all">
                Explore Courses <ArrowRight size={14} />
              </Button>
            </Link>
            <Link href="/tutors">
              <Button size="lg" variant="outline" className="border-border hover:bg-muted font-extrabold text-xs px-6 py-5 rounded-xl transition-all">
                Find Tutors
              </Button>
            </Link>
          </motion.div>

          {/* Horizontal Statistics Row */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-5 gap-6 border-t border-border/40 pt-8 mt-6"
          >
            {[
              { label: "Courses Listed", value: `${stats.courses}+` },
              { label: "Verified Tutors", value: `${stats.tutors}+` },
              { label: "Live Classes Today", value: `${stats.liveClasses}+` },
              { label: "AI Powered Learning", value: "Active", highlight: true },
              { label: "Average Rating", value: `${stats.rating.toFixed(1)} / 5.0` },
            ].map((stat, idx) => (
              <div key={idx} className="flex flex-col gap-1 text-left">
                <span className="text-[10px] text-muted-foreground/80 font-bold uppercase tracking-wider">
                  {stat.label}
                </span>
                <span className={`text-xl font-heading font-black tracking-tight ${stat.highlight ? "text-primary" : "text-foreground"}`}>
                  {stat.value}
                </span>
              </div>
            ))}
          </motion.div>

        </Container>
      </section>

      {/* 5. SEARCH & FILTERS SECTION */}
      <section className="w-full bg-background/30 py-6 border-b border-border/40 select-none">
        <Container className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Global Search Bar */}
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search courses, tutors, skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card/60 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {["All", "Courses", "Live Classes", "Tuition", "AI Skills"].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-1.5 rounded-full border text-[10px] font-bold transition-all uppercase tracking-wider shrink-0 ${
                  activeFilter === filter
                    ? "bg-primary border-primary text-primary-foreground"
                    : "bg-card border-border/80 text-muted-foreground hover:text-foreground"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </Container>
      </section>

      {/* 2 & 3. CATEGORY CARDS GRID */}
      <section className="w-full py-16 text-left select-none bg-background/50">
        <Container className="flex flex-col gap-10">
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {filteredCategories.map((cat) => (
                <motion.div key={cat.id} variants={staggerChildVariants} className="h-full">
                  <Link href={cat.id === "engineering" ? "/engineering" : `/categories/${getCategorySlug(cat.id)}`} className="block h-full">
                    <Card
                      variant="glass"
                      className="p-3 pb-4 border border-border/80 hover:border-primary/20 bg-card rounded-2xl h-full flex flex-col justify-between group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden relative"
                    >
                      {/* Cover Image Wrapper with Gradient Overlay - Redesigned as Premium Inset Banner */}
                      <div className="w-full aspect-[4/3.5] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950/60 relative overflow-hidden shrink-0 border-b border-border/40 p-3">
                        {/* Placeholder Banner Image */}
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/40 via-background/20 to-card/40 z-0" />
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10" />
                        
                        {/* Cover Image placeholder pattern */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${cat.featuredCourse.thumbnailColor} opacity-40 z-0`} />

                        {/* Actual Category Banner Image */}
                        {!failedImages[cat.id] && (
                          <div className={cn(
                            "absolute inset-3 overflow-hidden rounded-xl border border-border/30",
                            getImageFitMode(getCategoryBanner(cat.id)).bgClass
                          )}>
                            <Image
                              src={getCategoryBanner(cat.id)}
                              alt={`${cat.name} learning category banner`}
                              fill
                              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                              loading="lazy"
                              decoding="async"
                              onLoad={() => setLoadedImages((prev) => ({ ...prev, [cat.id]: true }))}
                              onError={() => handleImageError(cat.id)}
                              className={cn(
                                "transition-all duration-700 ease-out",
                                getImageFitMode(getCategoryBanner(cat.id)).fitClass,
                                getImageFitMode(getCategoryBanner(cat.id)).scaleClass,
                                loadedImages[cat.id] ? "opacity-100 blur-0" : "opacity-0 blur-sm"
                              )}
                            />
                          </div>
                        )}

                        {/* Top Overlay details */}
                        <div className="absolute top-5 left-5 right-5 flex items-center justify-between z-20">
                          <div className="w-9 h-9 rounded-lg bg-background/90 border border-border/60 flex items-center justify-center text-primary shadow-sm">
                            <IconComponent name={cat.iconName} className="w-5 h-5" />
                          </div>
                          <span className={`text-[8px] font-extrabold tracking-wide uppercase px-2 py-0.5 rounded border ${cat.badgeColor}`}>
                            {cat.badge}
                          </span>
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="p-4 flex flex-col gap-3 grow">
                        <div>
                          <h4 className="text-xs font-heading font-extrabold text-foreground group-hover:text-primary transition-colors leading-tight flex items-center gap-1.5">
                            <span className="truncate">{cat.name}</span>
                          </h4>
                          <p className="text-[10px] text-muted-foreground leading-relaxed mt-1.5">
                            {cat.desc}
                          </p>
                        </div>

                        {/* Top Skills Tags */}
                        <div className="flex flex-wrap gap-1">
                          {cat.skills.slice(0, 3).map((skill, index) => (
                            <span
                              key={index}
                              className="text-[8px] font-semibold bg-muted/50 text-foreground/80 px-2 py-0.5 rounded border border-border/30"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>

                        {/* 7. FEATURED COURSE MINI-CARD */}
                        <div className="p-3 rounded-xl border border-border/60 bg-muted/20 group-hover:bg-muted/40 transition-colors text-left flex flex-col gap-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[8px] font-extrabold uppercase tracking-wider text-accent">
                              Featured Course
                            </span>
                            <span className="text-[8px] font-extrabold text-primary">
                              ₹{cat.featuredCourse.price}
                            </span>
                          </div>
                          
                          <h5 className="text-[10px] font-extrabold text-foreground leading-tight line-clamp-1">
                            {cat.featuredCourse.title}
                          </h5>

                          <div className="flex items-center justify-between text-[8px] text-muted-foreground mt-1.5 font-semibold">
                            <span className="flex items-center gap-0.5">
                              <User className="w-2.5 h-2.5 text-primary/70" />
                              {cat.featuredCourse.tutor}
                            </span>
                            <span className="flex items-center gap-0.5">
                              <Clock className="w-2.5 h-2.5 text-primary/70" />
                              {cat.featuredCourse.duration}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[8px] mt-2 pt-2 border-t border-border/30">
                            <span className="flex items-center gap-0.5 text-amber-500 font-extrabold">
                              <Star className="w-2.5 h-2.5 fill-current" />
                              {cat.featuredCourse.rating}
                            </span>
                            <span className="text-[8px] text-muted-foreground">
                              {cat.featuredCourse.students} Enrolled
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Footer Row */}
                      <div className="px-5 pb-5 pt-3 border-t border-border/40 flex flex-col gap-3 shrink-0">
                        {/* Course & Stats Counters */}
                        <div className="flex items-center justify-between text-[8px] text-muted-foreground font-extrabold uppercase tracking-wider">
                          <span className="flex items-center gap-0.5">
                            <BookOpen className="w-3 h-3 text-primary/70" />
                            {cat.stats.courses} Courses
                          </span>
                          <span className="flex items-center gap-0.5">
                            <Video className="w-3 h-3 text-primary/70" />
                            {cat.stats.liveClasses} Live
                          </span>
                          <span className="flex items-center gap-0.5 text-amber-500">
                            <Star className="w-3 h-3 fill-current" />
                            {cat.stats.rating.toFixed(1)}
                          </span>
                        </div>

                        {/* View Button with Arrow Animation */}
                        <div className="w-full py-1.5 px-3 rounded-lg border border-border bg-card group-hover:bg-primary/5 group-hover:border-primary/20 transition-all flex items-center justify-between text-[10px] font-extrabold text-foreground group-hover:text-primary">
                          <span>View Category</span>
                          <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                        </div>
                      </div>

                    </Card>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </StaggerContainer>

          {/* 8 & 9. TUITION & MENTORSHIP SECTION */}
          <div className="w-full mt-10">
            <Tuitions />
          </div>

        </Container>
      </section>
    </PageWrapper>
  );
}
