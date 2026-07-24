"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  Search,
  Bell,
  ChevronDown,
  LogOut,
  Shield,
  User as UserIcon,
  Settings,
  Sun,
  Moon,
  HelpCircle,
  FileText,
  Coins,
} from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "../../hooks/useAuth";
import { useNotifications } from "../../providers/NotificationProvider";
import { ThemeToggle } from "../theme-toggle";
import { navigationConfig } from "../../config/navigation";
import { siteConfig } from "../../config/site";
import { useMounted } from "../../hooks/useMounted";
import { useScrollPosition } from "../../hooks/useScrollPosition";
import { useOutsideClick } from "../../hooks/useOutsideClick";
import { useTheme } from "../../hooks/useTheme";
import { cn } from "../../utils/cn";
import {
  Code2,
  Palette,
  Sparkles,
  Video,
  Camera,
  Music,
  GraduationCap,
  ChefHat,
  Dumbbell,
  Briefcase,
  Megaphone,
  Mic,
  Globe,
  Activity,
  Laptop
} from "lucide-react";
import { MarketplaceService } from "../../features/payments/services/marketplaceService";

const categoryIconMap: Record<string, React.ComponentType<any>> = {
  "academics": GraduationCap,
  "technology-programming": Laptop,
  "ai-data-science": Sparkles,
  "creative-arts-design": Palette,
  "video-editing-animation": Video,
  "photography-media": Camera,
  "music": Music,
  "dance": Activity,
  "sports-fitness": Dumbbell,
  "cooking-lifestyle": ChefHat,
  "business-entrepreneurship": Briefcase,
  "marketing": Megaphone,
  "communication": Mic,
  "languages": Globe
};

const categoryMetaMap: Record<string, { courses: number; badge?: "Popular" | "Trending" | "NEW"; badgeColor?: string }> = {
  "academics": { courses: 382, badge: "Popular", badgeColor: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  "technology-programming": { courses: 248, badge: "Popular", badgeColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
  "ai-data-science": { courses: 195, badge: "NEW", badgeColor: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
  "creative-arts-design": { courses: 142, badge: "Trending", badgeColor: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
  "video-editing-animation": { courses: 110, badge: "Trending", badgeColor: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
  "photography-media": { courses: 76 },
  "music": { courses: 125, badge: "Popular", badgeColor: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  "dance": { courses: 142 },
  "sports-fitness": { courses: 98 },
  "cooking-lifestyle": { courses: 64 },
  "business-entrepreneurship": { courses: 118, badge: "Popular", badgeColor: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  "marketing": { courses: 88 },
  "communication": { courses: 134 },
  "languages": { courses: 160, badge: "NEW", badgeColor: "bg-purple-500/10 text-purple-500 border-purple-500/20" }
};

const getPopularSkills = (catId: string, fallbackSkills: { name: string; id: string }[]) => {
  const mapping: Record<string, string[]> = {
    "academics": ["Mathematics", "Physics", "Chemistry"],
    "technology-programming": ["Python", "Java", "React"],
    "ai-data-science": ["ChatGPT", "Gemini", "Claude"],
    "creative-arts-design": ["Drawing", "Painting", "Sketching"],
    "photography-media": ["Mobile Photography", "DSLR", "Portraits"],
    "languages": ["English", "Spanish", "French"],
    "business-entrepreneurship": ["Finance", "Marketing", "Startup MBA"],
    "video-editing-animation": ["Premiere Pro", "After Effects", "DaVinci Resolve"],
    "music": ["Guitar", "Piano", "Vocal Training"],
  };
  
  const names = mapping[catId];
  if (names) {
    return names.map(name => ({ name, id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-") }));
  }
  return fallbackSkills.slice(0, 3);
};

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const mounted = useMounted();
  const scrollY = useScrollPosition();
  const { user, isAuthenticated, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { resolvedTheme, toggleTheme } = useTheme();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [activeCategoryTab, setActiveCategoryTab] = useState("academics");
  const [searchFocused, setSearchFocused] = useState(false);
  const [openMobileCategories, setOpenMobileCategories] = useState<Record<string, boolean>>({});
  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const MENU_LAYOUT: "classic" | "grid" = "grid";
  const COMPACT_ITEMS = true;

  const getCategorySlug = (id: string) => {
    switch (id) {
      case "academics": return "academic-education";
      case "technology-programming": return "technology-programming";
      case "ai-data-science": return "ai-data-science";
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

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCategoriesList(MarketplaceService.getCategories());
    }
  }, [activeDropdown]);

  const toggleMobileCategory = (catId: string) => {
    setOpenMobileCategories((prev) => {
      const isOpen = !prev[catId];
      return isOpen ? { [catId]: true } : {};
    });
  };

  const isDashboard = pathname?.includes("/dashboard") || false;
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Sync with body classes indicating dashboard layout sidebar collapsed state
  useEffect(() => {
    if (!isDashboard) return;

    if (typeof document !== "undefined") {
      const observer = new MutationObserver(() => {
        setIsSidebarCollapsed(document.body.classList.contains("sidebar-collapsed"));
      });

      const timer = setTimeout(() => {
        setIsSidebarCollapsed(document.body.classList.contains("sidebar-collapsed"));
      }, 0);

      observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
      return () => {
        observer.disconnect();
        clearTimeout(timer);
      };
    }
  }, [pathname, isDashboard]);

  const categoriesRef = useOutsideClick<HTMLDivElement>(() => {
    if (activeDropdown === "categories") setActiveDropdown(null);
  });
  
  const userMenuRef = useOutsideClick<HTMLDivElement>(() => {
    if (activeDropdown === "user") setActiveDropdown(null);
  });

  const notificationsRef = useOutsideClick<HTMLDivElement>(() => {
    if (activeDropdown === "notifications") setActiveDropdown(null);
  });

  const [tutorStatus, setTutorStatus] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setTutorStatus(localStorage.getItem("tutor_application_status"));
    }
  }, [user, pathname]);

  let resolvedMainNav: { title: string; href: string }[] = [];

  if (isAuthenticated) {
    if (user?.role === "tutor") {
      resolvedMainNav = [
        { title: "Tutor Studio", href: "/tutor/studio" },
        { title: "Dashboard", href: "/tutor/dashboard" },
        { title: "Courses", href: "/tutor/dashboard?tab=courses" },
        { title: "Students", href: "/tutor/dashboard?tab=students" },
        { title: "Live Classes", href: "/tutor/dashboard?tab=live-classes" },
        { title: "Analytics", href: "/tutor/dashboard?tab=analytics" },
        { title: "Wallet", href: "/tutor/dashboard?tab=finance" },
      ];
    } else if (user?.role === "admin") {
      resolvedMainNav = [
        { title: "Dashboard", href: "/admin/dashboard" },
        { title: "Students", href: "/admin/dashboard?tab=students" },
        { title: "Tutors", href: "/admin/dashboard?tab=tutors" },
        { title: "Courses", href: "/admin/dashboard?tab=courses" },
        { title: "Payments", href: "/admin/dashboard?tab=payments" },
        { title: "CMS", href: "/admin/dashboard?tab=cms" },
        { title: "Analytics", href: "/admin/dashboard?tab=analytics" },
        { title: "Settings", href: "/admin/dashboard?tab=settings" },
      ];
    } else {
      // Student
      resolvedMainNav = [
        { title: "My Learn", href: "/learn" },
        { title: "LMS Catalog", href: "/learn/courses" },
        { title: "AI Hub", href: "/ai-hub" },
        { title: "Notes Library", href: "/notes" },
        { title: "Community", href: "/community" },
        { title: "Career Hub", href: "/career" },
        { title: "Tutors", href: "/tutors" },
        { title: "Wishlist", href: "/student/dashboard?tab=wishlist" },
      ];
    }
  } else {
    // Guest
    resolvedMainNav = [
      { title: "Courses", href: "/courses" },
      { title: "Tutors", href: "/tutors" },
      { title: "Live Classes", href: "/live-classes" },
      { title: "AI Features", href: "/ai-assistant" },
    ];
  }

  const isScrolled = scrollY > 20;

  // Toggle dropdown helper
  const toggleDropdown = (name: string) => {
    setActiveDropdown((prev) => (prev === name ? null : name));
  };

  // Close menus on path transition
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMobileMenuOpen(false);
      setActiveDropdown(null);
    }, 0);
    return () => clearTimeout(timer);
  }, [pathname]);

  const logoSrc = resolvedTheme === "dark" ? "/logo-light.svg" : "/logo-dark.svg";

  return (
    <header
      className={cn(
        "fixed top-0 transition-all duration-300 select-none",
        isScrolled
          ? "glass-navbar py-3 shadow-soft"
          : "bg-transparent py-5",
        isDashboard
          ? cn(
              "z-40",
              isSidebarCollapsed
                ? "md:left-20 md:w-[calc(100%-5rem)] left-0 w-full"
                : "md:left-64 md:w-[calc(100%-16rem)] left-0 w-full"
            )
          : "left-0 right-0 w-full z-50"
      )}
    >
      <div
        className={cn(
          "w-full flex items-center justify-between gap-4",
          isDashboard
            ? "px-6 max-w-none"
            : "mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8"
        )}
      >
        {/* Brand Logo */}
        <Link href="/" className="shrink-0 flex items-center gap-2 relative z-50">
          {mounted ? (
            <Image
              src={logoSrc}
              alt={siteConfig.name}
              width={112}
              height={32}
              priority
              className="w-full h-auto object-contain dark:brightness-100"
            />
          ) : (
            <div className="w-28 h-8 bg-muted rounded-input animate-pulse" />
          )}
        </Link>

        {/* Desktop Left Nav Wrapper */}
        <div className="hidden lg:flex items-center gap-6 relative" ref={categoriesRef}>
          {/* Categories Trigger Button */}
          {user?.role !== "tutor" && (
            <div className="relative">
              <button
                onClick={() => toggleDropdown("categories")}
                className={cn(
                  "flex items-center gap-1.5 text-xs font-bold text-foreground hover:text-primary transition-colors cursor-pointer py-1",
                  activeDropdown === "categories" && "text-primary"
                )}
              >
                <span>Categories</span>
                <ChevronDown
                  size={14}
                  className={cn("transition-transform duration-200", activeDropdown === "categories" && "rotate-180")}
                />
              </button>

              {/* Mega Menu Dropdown */}
              <AnimatePresence>
                {activeDropdown === "categories" && (
                  <motion.div
                    initial={{ opacity: 0, y: 12, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute left-0 mt-3 w-[880px] bg-white dark:bg-card/95 border border-slate-200 dark:border-border/80 shadow-2xl rounded-3xl p-6 pb-8 focus:outline-none max-h-[70vh] overflow-y-auto z-[99999] scrollbar-thin scrollbar-thumb-muted/40"
                  >
                    {/* Quick Shortcuts Header */}
                    <div className="flex items-center flex-wrap gap-2.5 border-b border-border/40 pb-3.5 mb-4 text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground select-none">
                      <span className="text-foreground mr-1.5 font-black text-primary">Quick Shortcuts:</span>
                      <Link
                        href="/courses?sort=trending"
                        onClick={() => setActiveDropdown(null)}
                        className="inline-flex items-center justify-center h-8 gap-1.5 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-full text-[9.5px] font-bold text-slate-700 dark:text-slate-300 hover:text-primary hover:bg-primary/5 hover:border-primary/30 transition-all cursor-pointer"
                      >
                        <span>🔥</span> <span>Trending</span>
                      </Link>
                      <Link
                        href="/courses?sort=popular"
                        onClick={() => setActiveDropdown(null)}
                        className="inline-flex items-center justify-center h-8 gap-1.5 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-full text-[9.5px] font-bold text-slate-700 dark:text-slate-300 hover:text-primary hover:bg-primary/5 hover:border-primary/30 transition-all cursor-pointer"
                      >
                        <span>⭐</span> <span>Popular</span>
                      </Link>
                      <Link
                        href="/courses?sort=new"
                        onClick={() => setActiveDropdown(null)}
                        className="inline-flex items-center justify-center h-8 gap-1.5 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-full text-[9.5px] font-bold text-slate-700 dark:text-slate-300 hover:text-primary hover:bg-primary/5 hover:border-primary/30 transition-all cursor-pointer"
                      >
                        <span>📚</span> <span>New Courses</span>
                      </Link>
                      <Link
                        href="/tutors"
                        onClick={() => setActiveDropdown(null)}
                        className="inline-flex items-center justify-center h-8 gap-1.5 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-full text-[9.5px] font-bold text-slate-700 dark:text-slate-300 hover:text-primary hover:bg-primary/5 hover:border-primary/30 transition-all cursor-pointer"
                      >
                        <span>🎓</span> <span>Tuition</span>
                      </Link>
                      <Link
                        href="/courses?category=ai"
                        onClick={() => setActiveDropdown(null)}
                        className="inline-flex items-center justify-center h-8 gap-1.5 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-full text-[9.5px] font-bold text-slate-700 dark:text-slate-300 hover:text-primary hover:bg-primary/5 hover:border-primary/30 transition-all cursor-pointer"
                      >
                        <span>🤖</span> <span>AI Skills</span>
                      </Link>
                    </div>

                    {MENU_LAYOUT === "grid" ? (
                      /* Premium Card Grid Layout */
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                        {categoriesList.filter(c => c.status === "Enabled").map((cat) => {
                          const Icon = categoryIconMap[cat.id] || Sparkles;
                          return (
                            <div 
                              key={cat.id} 
                              onClick={(e) => {
                                if ((e.target as HTMLElement).closest('a')) return;
                                router.push(`/categories/${getCategorySlug(cat.id)}`);
                                setActiveDropdown(null);
                              }}
                              className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30 hover:bg-slate-50 dark:hover:bg-slate-900/60 hover:shadow-lg hover:border-primary/20 transition-all duration-300 flex flex-col justify-between group min-h-[160px] cursor-pointer"
                            >
                              <div className="space-y-3">
                                {/* Header with icon and badge */}
                                <div className="space-y-1">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-1.5 text-slate-900 dark:text-slate-100 font-extrabold text-xs select-none">
                                      <div className="w-6 h-6 rounded bg-primary/5 border border-primary/10 flex items-center justify-center text-primary shrink-0">
                                        <Icon size={12} />
                                      </div>
                                      <span className="leading-tight">{cat.name}</span>
                                    </div>
                                    {categoryMetaMap[cat.id]?.badge && (
                                      <span className={cn("text-[7.5px] font-extrabold px-1.5 py-0.5 rounded border uppercase tracking-wider shrink-0 scale-90", categoryMetaMap[cat.id]?.badgeColor)}>
                                        {categoryMetaMap[cat.id]?.badge}
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[8.5px] text-slate-500 dark:text-slate-400 font-bold pl-8 leading-none select-none">
                                    {categoryMetaMap[cat.id]?.courses || 45} Courses
                                  </div>
                                </div>
 
                                {/* Subjects List */}
                                <ul className="space-y-1.5 pl-2 border-l border-slate-200 dark:border-slate-800/60">
                                  {(() => {
                                    const allSkills = cat.subcategories.flatMap((subcat: any) => subcat.skills);
                                    const visibleSkills = getPopularSkills(cat.id, allSkills);
                                    return visibleSkills.map((skill: any, skIdx: number) => (
                                      <li key={skIdx}>
                                        <Link
                                          href={`/courses?category=${cat.id}&subject=${skill.id}`}
                                          onClick={() => setActiveDropdown(null)}
                                          className="text-[10px] text-slate-600 dark:text-slate-400 hover:text-primary transition-all font-semibold block hover:translate-x-0.5"
                                        >
                                          • {skill.name}
                                        </Link>
                                      </li>
                                    ));
                                  })()}
                                </ul>
                              </div>
 
                              {/* Footer Action link */}
                              <div className="pt-3 border-t border-slate-200 dark:border-slate-800/40 mt-3 flex justify-between items-center select-none">
                                <span
                                  className="text-[9px] font-extrabold text-primary group-hover:underline flex items-center gap-0.5"
                                >
                                  View All &rarr;
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      /* Classic 4-Column Layout */
                      <div className="grid grid-cols-4 gap-6">
                        {/* Column 1: Academics & Languages */}
                        <div className="space-y-8">
                          <div className="border-b border-border/40 pb-2">
                            <h5 className="text-[10px] font-heading font-extrabold uppercase tracking-wider text-primary">
                              Academics & Soft Skills
                            </h5>
                          </div>
                          <div className="space-y-6">
                            {categoriesList.filter(c => ["academics", "languages", "communication"].includes(c.id) && c.status === "Enabled").map(cat => {
                              const Icon = categoryIconMap[cat.id] || Sparkles;
                              return (
                                <div key={cat.id} className="space-y-2">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-1.5 text-foreground font-bold text-xs select-none">
                                      <Icon size={14} className="text-primary/70 shrink-0" />
                                      <span className="truncate">{cat.name}</span>
                                      {categoryMetaMap[cat.id]?.badge && (
                                        <span className={cn("text-[8px] font-extrabold px-1.5 py-0.2 rounded border uppercase tracking-wider shrink-0 ml-1 scale-95", categoryMetaMap[cat.id]?.badgeColor)}>
                                          {categoryMetaMap[cat.id]?.badge}
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-[9px] text-muted-foreground/75 font-semibold pl-5 select-none leading-none">
                                      {categoryMetaMap[cat.id]?.courses || 45} Courses
                                    </div>
                                  </div>
                                  <ul className="space-y-1.5 pl-5">
                                    {(() => {
                                      const allSkills = cat.subcategories.flatMap((subcat: any) => subcat.skills);
                                      const visibleSkills = COMPACT_ITEMS ? allSkills.slice(0, 3) : allSkills;
                                      return visibleSkills.map((skill: any, skIdx: number) => (
                                        <li key={skIdx}>
                                          <Link
                                            href={`/courses?category=${cat.id}&subject=${skill.id}`}
                                            onClick={() => setActiveDropdown(null)}
                                            className="text-[11px] text-muted-foreground hover:text-primary transition-all font-medium block hover:translate-x-0.5"
                                          >
                                            {skill.name}
                                          </Link>
                                        </li>
                                      ));
                                    })()}
                                  </ul>
                                  <div className="pt-1 pl-5">
                                    <Link
                                      href={`/categories/${getCategorySlug(cat.id)}`}
                                      onClick={() => setActiveDropdown(null)}
                                      className="text-[9px] font-bold text-primary hover:underline flex items-center gap-0.5"
                                    >
                                      View All &rarr;
                                    </Link>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Column 2: Tech, Programming & AI */}
                        <div className="space-y-8">
                          <div className="border-b border-border/40 pb-2">
                            <h5 className="text-[10px] font-heading font-extrabold uppercase tracking-wider text-primary">
                              Tech & Innovation
                            </h5>
                          </div>
                          <div className="space-y-6">
                            {categoriesList.filter(c => ["technology-programming", "ai-data-science", "business-entrepreneurship"].includes(c.id) && c.status === "Enabled").map(cat => {
                              const Icon = categoryIconMap[cat.id] || Sparkles;
                              return (
                                <div key={cat.id} className="space-y-2">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-1.5 text-foreground font-bold text-xs select-none">
                                      <Icon size={14} className="text-primary/70 shrink-0" />
                                      <span className="truncate">{cat.name}</span>
                                      {categoryMetaMap[cat.id]?.badge && (
                                        <span className={cn("text-[8px] font-extrabold px-1.5 py-0.2 rounded border uppercase tracking-wider shrink-0 ml-1 scale-95", categoryMetaMap[cat.id]?.badgeColor)}>
                                          {categoryMetaMap[cat.id]?.badge}
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-[9px] text-muted-foreground/75 font-semibold pl-5 select-none leading-none">
                                      {categoryMetaMap[cat.id]?.courses || 45} Courses
                                    </div>
                                  </div>
                                  <ul className="space-y-1.5 pl-5">
                                    {(() => {
                                      const allSkills = cat.subcategories.flatMap((subcat: any) => subcat.skills);
                                      const visibleSkills = COMPACT_ITEMS ? allSkills.slice(0, 3) : allSkills;
                                      return visibleSkills.map((skill: any, skIdx: number) => (
                                        <li key={skIdx}>
                                          <Link
                                            href={`/courses?category=${cat.id}&subject=${skill.id}`}
                                            onClick={() => setActiveDropdown(null)}
                                            className="text-[11px] text-muted-foreground hover:text-primary transition-all font-medium block hover:translate-x-0.5"
                                          >
                                            {skill.name}
                                          </Link>
                                        </li>
                                      ));
                                    })()}
                                  </ul>
                                  <div className="pt-1 pl-5">
                                    <Link
                                      href={`/categories/${getCategorySlug(cat.id)}`}
                                      onClick={() => setActiveDropdown(null)}
                                      className="text-[9px] font-bold text-primary hover:underline flex items-center gap-0.5"
                                    >
                                      View All &rarr;
                                    </Link>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Column 3: Creative Arts & Media */}
                        <div className="space-y-8">
                          <div className="border-b border-border/40 pb-2">
                            <h5 className="text-[10px] font-heading font-extrabold uppercase tracking-wider text-primary">
                              Creative & Media
                            </h5>
                          </div>
                          <div className="space-y-6">
                            {categoriesList.filter(c => ["creative-arts-design", "video-editing-animation", "photography-media"].includes(c.id) && c.status === "Enabled").map(cat => {
                              const Icon = categoryIconMap[cat.id] || Sparkles;
                              return (
                                <div key={cat.id} className="space-y-2">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-1.5 text-foreground font-bold text-xs select-none">
                                      <Icon size={14} className="text-primary/70 shrink-0" />
                                      <span className="truncate">{cat.name}</span>
                                      {categoryMetaMap[cat.id]?.badge && (
                                        <span className={cn("text-[8px] font-extrabold px-1.5 py-0.2 rounded border uppercase tracking-wider shrink-0 ml-1 scale-95", categoryMetaMap[cat.id]?.badgeColor)}>
                                          {categoryMetaMap[cat.id]?.badge}
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-[9px] text-muted-foreground/75 font-semibold pl-5 select-none leading-none">
                                      {categoryMetaMap[cat.id]?.courses || 45} Courses
                                    </div>
                                  </div>
                                  <ul className="space-y-1.5 pl-5">
                                    {(() => {
                                      const allSkills = cat.subcategories.flatMap((subcat: any) => subcat.skills);
                                      const visibleSkills = COMPACT_ITEMS ? allSkills.slice(0, 3) : allSkills;
                                      return visibleSkills.map((skill: any, skIdx: number) => (
                                        <li key={skIdx}>
                                          <Link
                                            href={`/courses?category=${cat.id}&subject=${skill.id}`}
                                            onClick={() => setActiveDropdown(null)}
                                            className="text-[11px] text-muted-foreground hover:text-primary transition-all font-medium block hover:translate-x-0.5"
                                          >
                                            {skill.name}
                                          </Link>
                                        </li>
                                      ));
                                    })()}
                                  </ul>
                                  <div className="pt-1 pl-5">
                                    <Link
                                      href={`/categories/${getCategorySlug(cat.id)}`}
                                      onClick={() => setActiveDropdown(null)}
                                      className="text-[9px] font-bold text-primary hover:underline flex items-center gap-0.5"
                                    >
                                      View All &rarr;
                                    </Link>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Column 4: Music, Dance & Lifestyle */}
                        <div className="space-y-8">
                          <div className="border-b border-border/40 pb-2">
                            <h5 className="text-[10px] font-heading font-extrabold uppercase tracking-wider text-primary">
                              Lifestyle & Music
                            </h5>
                          </div>
                          <div className="space-y-6">
                            {categoriesList.filter(c => ["music", "dance", "sports-fitness", "cooking-lifestyle", "marketing"].includes(c.id) && c.status === "Enabled").map(cat => {
                              const Icon = categoryIconMap[cat.id] || Sparkles;
                              return (
                                <div key={cat.id} className="space-y-2">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-1.5 text-foreground font-bold text-xs select-none">
                                      <Icon size={14} className="text-primary/70 shrink-0" />
                                      <span className="truncate">{cat.name}</span>
                                      {categoryMetaMap[cat.id]?.badge && (
                                        <span className={cn("text-[8px] font-extrabold px-1.5 py-0.2 rounded border uppercase tracking-wider shrink-0 ml-1 scale-95", categoryMetaMap[cat.id]?.badgeColor)}>
                                          {categoryMetaMap[cat.id]?.badge}
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-[9px] text-muted-foreground/75 font-semibold pl-5 select-none leading-none">
                                      {categoryMetaMap[cat.id]?.courses || 45} Courses
                                    </div>
                                  </div>
                                  <ul className="space-y-1.5 pl-5">
                                    {(() => {
                                      const allSkills = cat.subcategories.flatMap((subcat: any) => subcat.skills);
                                      const visibleSkills = COMPACT_ITEMS ? allSkills.slice(0, 3) : allSkills;
                                      return visibleSkills.map((skill: any, skIdx: number) => (
                                        <li key={skIdx}>
                                          <Link
                                            href={`/courses?category=${cat.id}&subject=${skill.id}`}
                                            onClick={() => setActiveDropdown(null)}
                                            className="text-[11px] text-muted-foreground hover:text-primary transition-all font-medium block hover:translate-x-0.5"
                                          >
                                            {skill.name}
                                          </Link>
                                        </li>
                                      ));
                                    })()}
                                  </ul>
                                  <div className="pt-1 pl-5">
                                    <Link
                                      href={`/categories/${getCategorySlug(cat.id)}`}
                                      onClick={() => setActiveDropdown(null)}
                                      className="text-[9px] font-bold text-primary hover:underline flex items-center gap-0.5"
                                    >
                                      View All &rarr;
                                    </Link>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Main Navigation Links */}
          <nav className="flex items-center gap-6">
            {resolvedMainNav.map((item, idx) => {
              const hasQuery = item.href.includes("?");
              const pathPart = hasQuery ? item.href.split("?")[0] : item.href;
              const tabPart = hasQuery ? new URLSearchParams(item.href.split("?")[1]).get("tab") : null;
              
              const isPathMatch = pathname === pathPart;
              const currentTab = searchParams ? searchParams.get("tab") : null;
              const isActive = tabPart 
                ? (isPathMatch && currentTab === tabPart)
                : (isPathMatch && !currentTab);

              return (
                <Link
                  key={idx}
                  href={item.href}
                  className={cn(
                    "text-xs font-bold transition-colors hover:text-foreground relative py-1 focus:outline-none focus-visible:text-primary cursor-pointer",
                    isActive ? "text-primary font-black" : "text-muted-foreground"
                  )}
                >
                  {item.title}
                  {isActive && (
                    <motion.div
                      layoutId="navActiveUnderline"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Search Input bar */}
          <div
            className={cn(
              "relative max-w-xs w-full transition-all duration-300 border rounded-button bg-card flex items-center px-3 gap-2 py-1.5",
              searchFocused ? "border-primary ring-2 ring-primary/10 w-80" : "border-border hover:border-muted-foreground/45"
            )}
          >
            <Search size={16} className="text-muted-foreground shrink-0" />
            <input
              type="text"
              placeholder="Search courses, skills, tutors..."
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="bg-transparent border-none text-xs text-foreground placeholder:text-muted-foreground focus:outline-none w-full"
            />
          </div>
        </div>

        {/* Right Actions Block */}
        <div className="flex items-center gap-3 relative z-50 shrink-0">
          <ThemeToggle />

          {/* Authed vs Guest display */}
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              {/* Notification bell */}
              <div className="relative" ref={notificationsRef}>
                <button
                  onClick={() => toggleDropdown("notifications")}
                  className={cn(
                    "relative w-9 h-9 rounded-button border border-border bg-card hover:bg-muted/80 text-foreground flex items-center justify-center cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                    activeDropdown === "notifications" && "bg-muted"
                  )}
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-accent text-[8px] font-black text-foreground rounded-full flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {activeDropdown === "notifications" && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute right-0 mt-3 w-80 bg-card border border-border shadow-sm hover:shadow-md transition-shadow duration-200 rounded-card p-3 shadow-premium text-foreground flex flex-col z-50"
                    >
                      <div className="flex items-center justify-between border-b border-border/60 pb-2 mb-2">
                        <span className="text-xs font-heading font-extrabold">Notifications ({unreadCount} unread)</span>
                        {unreadCount > 0 && (
                          <button
                            onClick={() => {
                              markAllAsRead();
                              setActiveDropdown(null);
                            }}
                            className="text-[9px] font-black text-primary hover:underline cursor-pointer focus:outline-none"
                          >
                            Mark All Read
                          </button>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1 scrollbar-thin">
                        {notifications.length === 0 ? (
                          <p className="text-[10px] text-muted-foreground text-center py-4">No notifications yet.</p>
                        ) : (
                          notifications.slice(0, 5).map((item) => (
                            <div
                              key={item.id}
                              onClick={() => {
                                markAsRead(item.id);
                              }}
                              className={cn(
                                "p-2.5 rounded-button text-[10px] cursor-pointer text-left transition-colors border",
                                item.isRead
                                  ? "bg-card border-border/40 text-muted-foreground"
                                  : "bg-primary/5 border-primary/20 text-foreground font-bold"
                              )}
                            >
                              <div className="flex justify-between items-start gap-2">
                                <span className="font-bold line-clamp-1">{item.title}</span>
                                <span className="text-[8px] text-muted-foreground/60 shrink-0">
                                  {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p className="text-[9px] text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                                {item.message}
                              </p>
                            </div>
                          ))
                        )}
                      </div>

                      <div className="border-t border-border/40 pt-2 mt-2 flex justify-center">
                        <Link
                          href="/student/dashboard?tab=notifications"
                          onClick={() => setActiveDropdown(null)}
                          className="text-[10px] font-extrabold text-primary hover:underline"
                        >
                          View All Notifications
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* User Dropdown */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => toggleDropdown("user")}
                  className="flex items-center gap-1.5 focus:outline-none cursor-pointer hover:opacity-90 transition-opacity"
                >
                  <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-extrabold text-xs sm:text-sm shadow-soft overflow-hidden">
                    {user?.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.fullName || "User"} className="w-full h-full object-cover" />
                    ) : (
                      user?.fullName?.charAt(0) || "U"
                    )}
                  </div>
                  <ChevronDown
                    size={14}
                    className={cn(
                      "text-muted-foreground transition-transform duration-200 hidden md:block",
                      activeDropdown === "user" && "rotate-180"
                    )}
                  />
                </button>

                <AnimatePresence>
                  {activeDropdown === "user" && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute right-0 mt-3 w-56 bg-card border border-border/80 shadow-floating rounded-modal p-2.5 text-foreground flex flex-col z-[99999]"
                    >
                      <div className="px-3 py-2 border-b border-border/60 select-none mb-1.5">
                        <p className="text-xs font-extrabold truncate text-foreground">{user?.fullName}</p>
                        <p className="text-[10px] text-muted-foreground font-semibold truncate mt-0.5">{user?.email}</p>
                      </div>
                      
                      <Link
                        href={user?.role === "tutor" ? "/tutor/dashboard" : "/student/dashboard"}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-button transition-colors"
                      >
                        <Shield size={14} className="text-primary shrink-0" />
                        <span>Dashboard</span>
                      </Link>

                      <Link
                        href="/profile"
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-button transition-colors"
                      >
                        <UserIcon size={14} className="text-primary shrink-0" />
                        <span>Profile</span>
                      </Link>

                      <Link
                        href="/settings"
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-button transition-colors"
                      >
                        <Settings size={14} className="text-primary shrink-0" />
                        <span>Settings</span>
                      </Link>

                      <Link
                        href={user?.role === "tutor" ? "/tutor/dashboard?tab=notifications" : "/student/dashboard?tab=notifications"}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-button transition-colors"
                      >
                        <Bell size={14} className="text-primary shrink-0" />
                        <span>Notifications</span>
                      </Link>

                      <div className="border-t border-border/40 my-1.5" />

                      <Link
                        href="/privacy"
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-button transition-colors"
                      >
                        <FileText size={14} className="text-muted-foreground/60 shrink-0" />
                        <span>Privacy Policy</span>
                      </Link>

                      <Link
                        href="/terms"
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-button transition-colors"
                      >
                        <FileText size={14} className="text-muted-foreground/60 shrink-0" />
                        <span>Terms &amp; Conditions</span>
                      </Link>

                      <Link
                        href="/refunds"
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-button transition-colors"
                      >
                        <Coins size={14} className="text-muted-foreground/60 shrink-0" />
                        <span>Refund Policy</span>
                      </Link>

                      <Link
                        href="/support"
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-button transition-colors mb-1.5"
                      >
                        <HelpCircle size={14} className="text-muted-foreground/60 shrink-0" />
                        <span>Help Center</span>
                      </Link>

                      <button
                        onClick={async () => {
                          await logout();
                          toast.success("Signed out securely.");
                        }}
                        className="flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold text-destructive hover:bg-destructive/5 rounded-button transition-colors cursor-pointer w-full text-left border-t border-border/40 pt-2.5"
                      >
                        <LogOut size={14} className="shrink-0" />
                        <span>Logout</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-1.5 focus:outline-none"
              >
                Log in
              </Link>
              <Link
                href="/tutor/onboarding"
                className="text-sm font-semibold bg-btn-gradient hover:opacity-95 text-white shadow-soft rounded-button px-4 py-1.5 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                Become a Tutor
              </Link>
              <Link
                href="/register"
                className="text-sm font-semibold bg-btn-gradient hover:opacity-95 text-white shadow-soft rounded-button px-4 py-1.5 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                Start Learning
              </Link>
            </div>
          )}

          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden text-foreground w-9 h-9 rounded-button border border-border bg-card hover:bg-muted/80 flex items-center justify-center cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Slide Drawer Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop filter overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
            />
            {/* Menu Body Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.35 }}
              className="fixed top-0 right-0 bottom-0 z-40 w-80 bg-card border-l border-border p-6 shadow-floating overflow-y-auto flex flex-col justify-between lg:hidden"
            >
              <div className="flex flex-col gap-6 mt-14">
                {/* Mobile Search input */}
                <div className="relative border border-border rounded-button bg-muted/30 flex items-center px-3 gap-2 py-2">
                  <Search size={16} className="text-muted-foreground shrink-0" />
                  <input
                    type="text"
                    placeholder="Search courses..."
                    className="bg-transparent border-none text-xs text-foreground placeholder:text-muted-foreground focus:outline-none w-full"
                  />
                </div>

                {/* Mobile Menu Links */}
                <nav className="flex flex-col gap-4">
                  {resolvedMainNav.map((item, idx) => (
                    <Link
                      key={idx}
                      href={item.href}
                      className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors border-b border-border/40 pb-2"
                    >
                      {item.title}
                    </Link>
                  ))}
                </nav>

                  {/* Mobile Categories Collapsible */}
                  {user?.role !== "tutor" && (
                    <div>
                      <h4 className="text-[10px] font-heading font-extrabold uppercase tracking-wider text-muted-foreground mb-3 select-none">
                        Categories
                      </h4>
                      <div className="flex flex-col gap-2.5 pl-1">
                        {categoriesList.filter(c => c.status === "Enabled").map((group) => {
                          const isOpen = !!openMobileCategories[group.id];
                          const groupSkills: any[] = [];
                          group.subcategories.forEach((sub: any) => {
                            sub.skills.forEach((sk: any) => {
                              if (!sk.isHidden) {
                                groupSkills.push({
                                  title: sk.name,
                                  href: `/courses?category=${group.id}&subject=${sk.id}`
                                });
                              }
                            });
                          });

                          return (
                            <div key={group.id} className="border border-border/50 bg-card rounded-lg overflow-hidden transition-all">
                              <button
                                type="button"
                                onClick={() => toggleMobileCategory(group.id)}
                                className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-bold text-foreground bg-muted/10 hover:bg-muted/30 transition-colors cursor-pointer"
                              >
                                <span>{group.name}</span>
                                <span className="text-[10px] text-muted-foreground">{isOpen ? "▼" : "▶"}</span>
                              </button>
                              
                              {isOpen && (
                                <div className="p-3 bg-card border-t border-border/40 flex flex-wrap gap-1.5 pl-4 select-none">
                                  {groupSkills.slice(0, 10).map((item, itemIdx) => (
                                    <Link
                                      key={itemIdx}
                                      href={item.href}
                                      onClick={() => setIsMobileMenuOpen(false)}
                                      className="text-[10px] bg-muted/50 text-white/90 hover:text-primary hover:bg-primary/5 px-2.5 py-1 rounded-full border border-border/40 font-semibold transition-colors"
                                    >
                                      {item.title}
                                    </Link>
                                  ))}
                                  {groupSkills.length > 10 && (
                                    <Link
                                      href={`/categories/${getCategorySlug(group.id)}`}
                                      onClick={() => setIsMobileMenuOpen(false)}
                                      className="text-[10px] bg-primary/10 text-primary hover:bg-primary/20 px-2.5 py-1 rounded-full font-bold transition-colors"
                                    >
                                      View All
                                    </Link>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

              {/* Mobile Auth actions */}
              <div className="flex flex-col gap-3 mt-8 border-t border-border pt-6">
                {isAuthenticated ? (
                  <>
                    <Link
                      href={user?.role === "tutor" ? "/tutor/dashboard" : "/student/dashboard"}
                      className="w-full text-center py-2 rounded-button bg-muted hover:bg-muted/80 text-xs font-bold text-foreground transition-colors"
                    >
                      Go to Dashboard
                    </Link>
                    <button
                      onClick={async () => {
                        await logout();
                        toast.success("Signed out securely.");
                      }}
                      className="w-full text-center py-2 rounded-button bg-destructive/10 text-destructive text-xs font-bold transition-colors cursor-pointer"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="w-full text-center py-2 rounded-button border border-border text-xs font-bold text-foreground hover:bg-muted/50 transition-colors"
                    >
                      Log in
                    </Link>
                    <Link
                      href="/tutor/onboarding"
                      className="w-full text-center py-2 rounded-button bg-btn-gradient text-xs font-bold text-white shadow-soft transition-all"
                    >
                      Become a Tutor
                    </Link>
                    <Link
                      href="/register"
                      className="w-full text-center py-2 rounded-button bg-btn-gradient text-xs font-bold text-white shadow-soft transition-all"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
export default Navbar;
