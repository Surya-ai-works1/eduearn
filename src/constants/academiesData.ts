export interface Academy {
  id: string; // matches the DB slug
  name: string;
  slug: string;
  description: string;
  icon: string;
  coverImage: string;
  themeColor: string;
  status: "Active" | "Coming Soon" | "Private Beta" | "Archived";
  displayOrder: number;
  targetAudience: string;
  futureCourses: string[];
  expectedLaunch: string;
  // Module Configurations
  enabledFeatures: string[];
  dashboardLayout: {
    tabs: string[];
    widgets: string[];
  };
  navigationConfig: {
    sidebarItems: Array<{ label: string; href: string; icon: string }>;
  };
}

export const ACADEMIES: Academy[] = [
  {
    id: "career",
    name: "Career Academy",
    slug: "career",
    description: "Flagship program designed to build career-ready portfolios and launch your software engineering journey.",
    icon: "Briefcase",
    coverImage: "/images/academies/career.webp",
    themeColor: "#3b82f6",
    status: "Active",
    displayOrder: 1,
    targetAudience: "College students, self-taught developers, and career switchers.",
    futureCourses: ["AI Engineer Track", "Full Stack Developer Track", "UI/UX Designer Track"],
    expectedLaunch: "Already Live",
    enabledFeatures: ["certificates", "projects", "placement", "mock-interviews", "wallet"],
    dashboardLayout: {
      tabs: ["dashboard", "my-courses", "classroom", "wallet", "payments", "settings"],
      widgets: ["stats", "learning-level", "streak", "xp-coins", "calendar"]
    },
    navigationConfig: {
      sidebarItems: [
        { label: "Dashboard", href: "/student/dashboard", icon: "LayoutDashboard" },
        { label: "My Learning", href: "/student/learning", icon: "BookOpen" }
      ]
    }
  },
  {
    id: "school",
    name: "School Tuition",
    slug: "school-tuition",
    description: "Tuition support for Grades 1 through 12, covering science, math, and creative coding.",
    icon: "GraduationCap",
    coverImage: "/images/academies/school.webp",
    themeColor: "#10b981",
    status: "Active",
    displayOrder: 2,
    targetAudience: "K-12 students seeking dynamic homework help and conceptual learning.",
    futureCourses: ["Grade 10 Physics", "Grade 12 Calculus", "Scratch Programming for Kids"],
    expectedLaunch: "Already Live",
    enabledFeatures: ["homework", "attendance", "timetable", "parent-support", "doubt-sessions", "live-classes"],
    dashboardLayout: {
      tabs: ["overview", "subjects", "homework", "tests", "attendance", "timetable"],
      widgets: ["stats", "live-rooms", "homework-checklist", "parent-link"]
    },
    navigationConfig: {
      sidebarItems: [
        { label: "Tuition Center", href: "/student/dashboard", icon: "GraduationCap" }
      ]
    }
  },
  {
    id: "competitive",
    name: "Competitive Exams",
    slug: "competitive",
    description: "Preparation for major academic and competitive entrance examinations like UPSC, SSC, NEET, and JEE.",
    icon: "BookOpen",
    coverImage: "/images/academies/competitive.webp",
    themeColor: "#f59e0b",
    status: "Active",
    displayOrder: 3,
    targetAudience: "Aspirants preparing for national competitive testing boards.",
    futureCourses: ["JEE Physics Foundations", "NEET Biology Crash Course", "UPSC General Studies"],
    expectedLaunch: "Already Live",
    enabledFeatures: ["mock-tests", "rankings", "test-series"],
    dashboardLayout: {
      tabs: ["dashboard", "test-series", "rankings", "performance"],
      widgets: ["stats", "ranking-leaderboard", "upcoming-tests"]
    },
    navigationConfig: {
      sidebarItems: [
        { label: "Exam Prep", href: "/student/dashboard", icon: "BookOpen" }
      ]
    }
  },
  {
    id: "cultural",
    name: "Cultural & Creative Academy",
    slug: "cultural",
    description: "Learn guitar, dance, singing, painting, fashion design, and creative arts from peers.",
    icon: "Palette",
    coverImage: "/images/academies/cultural.webp",
    themeColor: "#ec4899",
    status: "Active",
    displayOrder: 4,
    targetAudience: "Hobbyists and creative minds looking to learn non-academic skills.",
    futureCourses: ["Acoustic Guitar Basics", "Bharatanatyam Foundations", "Digital Illustration in Procreate"],
    expectedLaunch: "Already Live",
    enabledFeatures: ["practice-logs", "portfolio", "performances"],
    dashboardLayout: {
      tabs: ["dashboard", "portfolio", "practices", "classes"],
      widgets: ["stats", "practice-timer", "gallery"]
    },
    navigationConfig: {
      sidebarItems: [
        { label: "Creative Studio", href: "/student/dashboard", icon: "Palette" }
      ]
    }
  },
  {
    id: "home",
    name: "Home & Lifestyle Academy",
    slug: "home",
    description: "Cooking, baking, home workouts, yoga, beauty, and wellness tips.",
    icon: "Heart",
    coverImage: "/images/academies/home.webp",
    themeColor: "#8b5cf6",
    status: "Active",
    displayOrder: 5,
    targetAudience: "Individuals looking to upgrade their daily lives, cooking abilities, and wellness routines.",
    futureCourses: ["Italian Cooking Basics", "Baking Artisan Bread", "Vinyasa Yoga Flow"],
    expectedLaunch: "Already Live",
    enabledFeatures: ["recipes", "workout-logs", "challenges"],
    dashboardLayout: {
      tabs: ["dashboard", "recipes", "workouts", "settings"],
      widgets: ["stats", "daily-challenge", "tracker"]
    },
    navigationConfig: {
      sidebarItems: [
        { label: "Lifestyle hub", href: "/student/dashboard", icon: "Heart" }
      ]
    }
  },
  {
    id: "skills",
    name: "Skill Development Academy",
    slug: "skills",
    description: "Master soft skills, public speaking, leadership, and spoken English.",
    icon: "TrendingUp",
    coverImage: "/images/academies/skills.webp",
    themeColor: "#ef4444",
    status: "Active",
    displayOrder: 6,
    targetAudience: "Professionals and students aiming to boost their communication and career growth.",
    futureCourses: ["Spoken English Masterclass", "Public Speaking Confidence", "SaaS Business Ideation"],
    expectedLaunch: "Already Live",
    enabledFeatures: ["presentations", "speaking-drills", "certificates"],
    dashboardLayout: {
      tabs: ["dashboard", "drills", "recordings", "badges"],
      widgets: ["stats", "drill-tracker", "badges-shelf"]
    },
    navigationConfig: {
      sidebarItems: [
        { label: "Skills Booster", href: "/student/dashboard", icon: "TrendingUp" }
      ]
    }
  },
  {
    id: "kids",
    name: "Kids Academy",
    slug: "kids",
    description: "Creative coding, junior arts, storytelling, and early learning games for young minds.",
    icon: "Sparkles",
    coverImage: "/images/academies/kids.webp",
    themeColor: "#06b6d4",
    status: "Active",
    displayOrder: 7,
    targetAudience: "Children aged 5 to 12 eager to explore technology and arts in a playful way.",
    futureCourses: ["Block Coding for Kids", "Creative Storytelling", "Drawing & Sketching for Beginners"],
    expectedLaunch: "Already Live",
    enabledFeatures: ["parent-access", "gamification", "rewards"],
    dashboardLayout: {
      tabs: ["dashboard", "games", "rewards", "achievements"],
      widgets: ["stats", "avatar-customizer", "xp-coins"]
    },
    navigationConfig: {
      sidebarItems: [
        { label: "Kids Zone", href: "/student/dashboard", icon: "Sparkles" }
      ]
    }
  },
  {
    id: "corporate",
    name: "Corporate Academy",
    slug: "corporate",
    description: "Professional leadership training, corporate communications, and enterprise optimization.",
    icon: "Award",
    coverImage: "/images/academies/corporate.webp",
    themeColor: "#64748b",
    status: "Archived",
    displayOrder: 8,
    targetAudience: "Enterprises seeking team training and professional development resources.",
    futureCourses: ["Executive Leadership Skills", "Corporate Communication Skills", "Agile Product Management"],
    expectedLaunch: "TBD",
    enabledFeatures: ["assessments", "rankings", "certificates"],
    dashboardLayout: {
      tabs: ["dashboard", "assessments", "certificates", "analytics"],
      widgets: ["stats", "team-progress", "leaderboard"]
    },
    navigationConfig: {
      sidebarItems: [
        { label: "Enterprise Panel", href: "/student/dashboard", icon: "Award" }
      ]
    }
  }
];

export function getAcademyBySlug(slug: string): Academy | undefined {
  return ACADEMIES.find((a) => a.slug.toLowerCase() === slug.toLowerCase());
}
