"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Container } from "../../components/layout/Container";
import { PageWrapper } from "../../components/layout/PageWrapper";
import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Divider } from "../../components/ui/divider";
import { Skeleton } from "../../components/ui/skeleton";
import { toast } from "sonner";
import { createClient } from "../../lib/supabase";
import { useAuth } from "../../hooks/useAuth";
import { MOCK_TUTORS, MOCK_CATEGORIES, ALL_SUBJECTS } from "../../constants/mockData";
import { scoreTutor, getImpliedCategory } from "../../utils/search";
import { StaggerContainer, staggerChildVariants } from "../../components/animations";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Star,
  Users,
  Filter,
  SlidersHorizontal,
  RotateCcw,
  ShieldCheck,
  Languages,
} from "lucide-react";

interface TutorsFilterState {
  searchQuery: string;
  category: string;
  rating: number;
  isAiVerified: boolean;
  language: string;
  sortBy: string;
}

export default function TutorDirectoryPage() {
  return (
    <Suspense fallback={
      <PageWrapper>
        <section className="w-full py-24 select-none text-center bg-background">
          <Container className="flex flex-col items-center justify-center min-h-[300px]">
            <div className="text-sm font-bold text-muted-foreground animate-pulse">
              Loading Tutors Directory...
            </div>
          </Container>
        </section>
      </PageWrapper>
    }>
      <TutorsContent />
    </Suspense>
  );
}

// Helper mappings for mock tutors to valid UUID formats
function getUuidFromTutorId(tutorId: string): string {
  if (tutorId.startsWith("tutor-")) {
    const idx = parseInt(tutorId.replace("tutor-", ""), 10);
    return `00000000-0000-0000-0000-${String(idx).padStart(12, "0")}`;
  }
  return tutorId; // already a UUID
}

function getTutorIdFromUuid(uuid: string): string {
  if (uuid.startsWith("00000000-0000-0000-0000-")) {
    const idx = parseInt(uuid.replace("00000000-0000-0000-0000-", ""), 10);
    return `tutor-${idx}`;
  }
  return uuid;
}

function TutorsContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  const subjectParam = searchParams.get("subject");

  const [filters, setFilters] = useState<TutorsFilterState>(() => ({
    searchQuery: "",
    category: categoryParam || "",
    rating: 0,
    isAiVerified: false,
    language: "",
    sortBy: "trending",
  }));

  const [isLoading, setIsLoading] = useState(false);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [followedTutors, setFollowedTutors] = useState<string[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    async function loadFollowedTutors() {
      if (!user) return;
      const supabase = createClient();
      const { data, error } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", user.id);
      if (!error && data) {
        setFollowedTutors(data.map((f: any) => getTutorIdFromUuid(f.following_id)));
      }
    }
    loadFollowedTutors();
  }, [user]);

  // Sync category param
  useEffect(() => {
    if (categoryParam) {
      const timer = setTimeout(() => {
        setFilters((prev) => {
          if (prev.category === categoryParam) return prev;
          return { ...prev, category: categoryParam };
        });
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [categoryParam]);

  // Automatically update active category filter if the query implies a category
  useEffect(() => {
    if (filters.searchQuery.trim()) {
      const impliedCat = getImpliedCategory(filters.searchQuery);
      if (impliedCat && filters.category !== impliedCat) {
        const timer = setTimeout(() => {
          setFilters((prev) => ({ ...prev, category: impliedCat || "" }));
        }, 0);
        return () => clearTimeout(timer);
      }
    }
  }, [filters.searchQuery, filters.category]);

  // Simulate loading state on filters or query change for high-fidelity feel
  useEffect(() => {
    const startTimer = setTimeout(() => {
      setIsLoading(true);
    }, 0);
    const endTimer = setTimeout(() => {
      setIsLoading(false);
    }, 450);
    return () => {
      clearTimeout(startTimer);
      clearTimeout(endTimer);
    };
  }, [filters, categoryParam, subjectParam]);

  const handleResetFilters = () => {
    setFilters({
      searchQuery: "",
      category: "",
      rating: 0,
      isAiVerified: false,
      language: "",
      sortBy: "trending",
    });
    toast.info("All search filters reset.");
  };

  const handleFollowTutor = async (e: React.MouseEvent, tutorId: string, name: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast.error("Please log in to follow tutors.");
      return;
    }

    const supabase = createClient();
    const isCurrentlyFollowing = followedTutors.includes(tutorId);
    const dbUuid = getUuidFromTutorId(tutorId);

    // Optimistically update the UI
    if (isCurrentlyFollowing) {
      setFollowedTutors((prev) => prev.filter((id) => id !== tutorId));
      toast.info(`Unfollowed ${name}`);
      
      try {
        const { error } = await supabase
          .from("follows")
          .delete()
          .eq("follower_id", user.id)
          .eq("following_id", dbUuid);
        if (error) throw error;
      } catch (err) {
        // Rollback on error
        setFollowedTutors((prev) => [...prev, tutorId]);
        toast.error("Failed to unfollow tutor.");
      }
    } else {
      setFollowedTutors((prev) => [...prev, tutorId]);
      toast.success(`Following ${name}!`);
      
      try {
        const { error } = await supabase
          .from("follows")
          .insert({
            follower_id: user.id,
            following_id: dbUuid,
          });
        if (error) throw error;
      } catch (err) {
        // Rollback on error
        setFollowedTutors((prev) => prev.filter((id) => id !== tutorId));
        toast.error("Failed to follow tutor.");
      }
    }
  };

  // 1. FILTERING LOGIC
  const filteredTutors = MOCK_TUTORS.filter((tutor) => {
    // URL Category filter
    if (categoryParam) {
      const belongsToCategory = tutor.subjectsTaughtIds.some(subId => {
        const subObj = ALL_SUBJECTS.find(s => s.id === subId);
        return subObj?.category === categoryParam;
      });
      if (!belongsToCategory) return false;
    }

    // URL Subject filter
    if (subjectParam) {
      if (!tutor.subjectsTaughtIds.includes(subjectParam)) return false;
    }

    // Search query check (Name or expertise tags)
    if (filters.searchQuery.trim()) {
      const score = scoreTutor(tutor, filters.searchQuery);
      if (score === 0) return false;
    }

    // Local Sidebar Category check (Only if URL categoryParam is NOT set)
    if (!categoryParam && filters.category) {
      const belongsToCategory = tutor.subjectsTaughtIds.some(subId => {
        const subObj = ALL_SUBJECTS.find(s => s.id === subId);
        return subObj?.category === filters.category;
      });
      if (!belongsToCategory) return false;
    }

    // Rating check
    if (filters.rating > 0 && tutor.rating < filters.rating) return false;

    // AI Verified check
    if (filters.isAiVerified && tutor.verificationStatus !== "ai_verified") return false;

    // Language check
    if (filters.language) {
      const hasLang = tutor.languages.some(l => l.toLowerCase() === filters.language.toLowerCase());
      if (!hasLang) return false;
    }

    return true;
  });

  // 2. SORTING LOGIC
  const sortedTutors = [...filteredTutors].sort((a, b) => {
    if (filters.searchQuery.trim()) {
      const scoreA = scoreTutor(a, filters.searchQuery);
      const scoreB = scoreTutor(b, filters.searchQuery);
      if (scoreB !== scoreA) {
        return scoreB - scoreA;
      }
    }
    if (filters.sortBy === "highest-rated") {
      return b.rating - a.rating;
    }
    if (filters.sortBy === "most-students") {
      return b.totalStudents - a.totalStudents;
    }
    if (filters.sortBy === "newest") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (filters.sortBy === "alphabetical") {
      return a.fullName.localeCompare(b.fullName);
    }
    return (b.totalStudents * b.rating) - (a.totalStudents * a.rating);
  });

  // Helper check: are filters active?
  const hasActiveFilters =
    filters.category !== "" ||
    filters.rating !== 0 ||
    filters.isAiVerified ||
    filters.language !== "";

  // Render tutor cards custom layout satisfying specifications
  const renderTutorCard = (tutor: typeof MOCK_TUTORS[number]) => {
    const tutorLevel = tutor.rating >= 4.9 ? "Elite Tutor" : tutor.rating >= 4.7 ? "Top Rated" : "Mentor";
    const isFollowed = followedTutors.includes(tutor.id);

    return (
      <motion.div key={tutor.id} variants={staggerChildVariants}>
        <Link href={`/tutors/${tutor.id}`} className="block h-full">
          <Card
            variant="default"
            hoverEffect="lift"
            className="flex flex-col justify-between h-full p-5 text-left border-border bg-card group relative"
          >
            {/* Top block */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-sm text-primary shrink-0 relative overflow-hidden">
                  {tutor.avatar ? (
                    <Image
                      src={tutor.avatar}
                      alt={tutor.fullName}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    tutor.fullName.charAt(0)
                  )}
                  {tutor.verificationStatus === "ai_verified" && (
                    <span
                      className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-accent border-2 border-card flex items-center justify-center text-foreground z-10">
                      <ShieldCheck size={10} strokeWidth={3} className="text-white fill-emerald-500" />
                    </span>
                  )}
                </div>
                
                <div className="overflow-hidden">
                  <h4 className="text-sm font-heading font-extrabold text-foreground group-hover:text-primary transition-colors leading-tight truncate">
                    {tutor.fullName}
                  </h4>
                  
                  <div className="flex items-center gap-1.5 mt-1">
                    <Badge variant={tutorLevel === "Elite Tutor" ? "danger" : tutorLevel === "Top Rated" ? "primary" : "secondary"} className="text-[8px] px-1.5 py-0">
                      {tutorLevel}
                    </Badge>
                    <span className="text-[10px] text-amber-500 font-extrabold flex items-center gap-0.5">
                      <Star size={9} className="fill-amber-500 text-amber-500" />
                      {tutor.rating.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Expertise skills tags */}
              <div className="flex flex-wrap gap-1 mt-1">
                {tutor.expertise.slice(0, 3).map((skill, sIdx) => (
                  <span
                    key={sIdx}
                    className="text-[9px] font-bold bg-muted text-muted-foreground px-2 py-0.5 rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              {/* Tutor key stats */}
              <div className="grid grid-cols-3 gap-2 border-y border-border/40 py-2.5 mt-1 text-center">
                <div className="flex flex-col">
                  <span className="text-[8px] uppercase font-bold text-muted-foreground/80">Students</span>
                  <span className="text-[11px] font-extrabold text-foreground mt-0.5">
                    {tutor.totalStudents}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] uppercase font-bold text-muted-foreground/80">Experience</span>
                  <span className="text-[11px] font-extrabold text-foreground mt-0.5">
                    {tutor.experience}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] uppercase font-bold text-muted-foreground/80">Level</span>
                  <span className="text-[10px] font-extrabold text-primary mt-0.5 truncate">
                    {tutor.rating >= 4.9 ? "Elite" : tutor.rating >= 4.8 ? "Top Rated" : "Mentor"}
                  </span>
                </div>
              </div>

              {/* Language & Class levels */}
              <div className="flex items-center justify-between mt-2 text-[10px] text-muted-foreground font-semibold">
                <span className="flex items-center gap-1">
                  <Languages size={12} className="text-primary shrink-0" />
                  {tutor.languages.slice(0, 2).join(", ")}
                </span>
                <span className="text-[9px] font-extrabold text-muted-foreground/80 bg-muted px-2 py-0.5 rounded">
                  {tutor.classLevels[0]}
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-2 mt-6">
              <div
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleFollowTutor(e, tutor.id, tutor.fullName);
                }}
                className={`text-center py-2.5 rounded-button text-[9px] font-bold uppercase tracking-wider border border-border cursor-pointer select-none transition-colors focus:outline-none flex items-center justify-center ${
                  isFollowed ? "bg-primary text-white border-primary" : "bg-card hover:bg-muted text-foreground"
                }`}
              >
                {isFollowed ? "Following" : "Follow"}
              </div>
              <div className="block">
                <span className="block w-full text-center py-2.5 rounded-button text-[9px] font-bold uppercase tracking-wider bg-muted group-hover:bg-primary group-hover:text-white transition-colors cursor-pointer select-none">
                  Profile
                </span>
              </div>
            </div>
          </Card>
        </Link>
      </motion.div>
    );
  };

  const activeSubjectName = subjectParam ? (ALL_SUBJECTS.find(s => s.id === subjectParam)?.name || subjectParam) : "";

  return (
    <PageWrapper>
      {/* Search Header Banner */}
      <section className="w-full py-10 bg-muted/20 border-b border-border/40 text-left select-none">
        <Container className="flex flex-col gap-6">
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-semibold">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <span>/</span>
            <span className="text-foreground">Tutors</span>
            {(categoryParam || subjectParam) && (
              <>
                <span>/</span>
                <span className="text-primary font-bold capitalize">
                  {activeSubjectName || categoryParam}
                </span>
              </>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <h1 className="text-3xl md:text-4xl font-heading font-extrabold text-foreground tracking-tight">
              {activeSubjectName ? `${activeSubjectName} Student Tutors` : "AI Verified Student Tutors"}
            </h1>
            <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
              {activeSubjectName 
                ? `Connect with verified school and college student tutors specializing in ${activeSubjectName}. Check schedules, experience, ratings, and pricing.`
                : "Find, compare, and learn from verified school/college student mentors. Subject screening and communication style validated by AI."}
            </p>
          </div>

          <Divider className="my-2" />

          {/* Search bar input overlay */}
          <div className="relative w-full max-w-2xl flex items-center">
            <Search size={18} className="absolute left-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search tutor name or expert skills (e.g. React.js, Calculus, Hatha Yoga)..."
              value={filters.searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
              className="w-full pl-12 pr-10 h-12 bg-card border-border/85 text-sm font-medium"
            />
          </div>
        </Container>
      </section>

      {/* Main Grid Catalog */}
      <section className="w-full py-12 select-none">
        <Container className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* 1. Left Sidebar Filters (Desktop only) */}
          <div className="hidden lg:block lg:col-span-3 flex flex-col gap-6 text-left">
            <div className="flex flex-col gap-5 p-5 rounded-card border border-border bg-card shadow-soft">
              <div className="flex items-center justify-between">
                <span className="text-sm font-heading font-extrabold text-foreground flex items-center gap-1.5">
                  <Filter size={14} />
                  Filters
                </span>
                {hasActiveFilters && (
                  <button
                    onClick={handleResetFilters}
                    className="text-[10px] text-red-500 font-extrabold flex items-center gap-1 hover:underline cursor-pointer focus:outline-none"
                  >
                    <RotateCcw size={10} />
                    Reset
                  </button>
                )}
              </div>

              <Divider className="my-0.5" />

              {/* Ranks switches */}
              <label className="flex items-center gap-2.5 text-xs font-bold text-foreground cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={filters.isAiVerified}
                  onChange={() => setFilters((prev) => ({ ...prev, isAiVerified: !prev.isAiVerified }))}
                  className="w-4 h-4 rounded border-border accent-primary cursor-pointer"
                />
                <span>AI Verified Tutors only</span>
              </label>

              <Divider className="my-0.5" />

              {/* Categories */}
              <div className="flex flex-col gap-2">
                <span className="text-[9px] uppercase tracking-wider font-extrabold text-muted-foreground/80">Categories</span>
                {MOCK_CATEGORIES.map((cat) => (
                  <label key={cat.id} className="flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={filters.category === cat.id}
                      onChange={() => setFilters((prev) => ({ ...prev, category: prev.category === cat.id ? "" : cat.id }))}
                      className="w-3.5 h-3.5 rounded border-border accent-primary cursor-pointer"
                    />
                    <span className="truncate">{cat.name}</span>
                  </label>
                ))}
              </div>

              <Divider className="my-0.5" />

              {/* Ratings */}
              <div className="flex flex-col gap-2">
                <span className="text-[9px] uppercase tracking-wider font-extrabold text-muted-foreground/80">Minimum Rating</span>
                {[4.8, 4.5, 4.0].map((star) => (
                  <label key={star} className="flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={filters.rating === star}
                      onChange={() => setFilters((prev) => ({ ...prev, rating: prev.rating === star ? 0 : star }))}
                      className="w-3.5 h-3.5 rounded border-border accent-primary cursor-pointer"
                    />
                    <span>{star.toFixed(1)} ★ &amp; above</span>
                  </label>
                ))}
              </div>

              <Divider className="my-0.5" />

              {/* Languages */}
              <div className="flex flex-col gap-2">
                <span className="text-[9px] uppercase tracking-wider font-extrabold text-muted-foreground/80">Languages</span>
                {["English", "Hindi", "Telugu", "French", "German"].map((lang) => (
                  <label key={lang} className="flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={filters.language === lang}
                      onChange={() => setFilters((prev) => ({ ...prev, language: prev.language === lang ? "" : lang }))}
                      className="w-3.5 h-3.5 rounded border-border accent-primary cursor-pointer"
                    />
                    <span>{lang}</span>
                  </label>
                ))}
              </div>

            </div>
          </div>

          {/* 2. Right Feed Grids (Main Grid) */}
          <div className="lg:col-span-9 flex flex-col gap-6 text-left">
            
            {/* Sorting top bar */}
            <div className="flex items-center justify-between border-b border-border pb-4">
              <span className="text-xs text-muted-foreground font-semibold">
                Found {sortedTutors.length} student tutors
              </span>

              <div className="flex items-center gap-3">
                {/* Mobile Filter toggle trigger */}
                <button
                  type="button"
                  onClick={() => setIsMobileFiltersOpen(true)}
                  className="lg:hidden p-2 bg-card border border-border shadow-sm hover:shadow-md transition-shadow duration-200 rounded-input text-xs font-bold text-foreground flex items-center gap-1.5 cursor-pointer hover:bg-muted/40 transition-colors"
                >
                  <SlidersHorizontal size={13} />
                  Filters
                </button>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground font-semibold shrink-0">Sort by:</span>
                  <select
                    value={filters.sortBy}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilters((prev) => ({ ...prev, sortBy: e.target.value }))}
                    className="bg-card border border-border shadow-sm hover:shadow-md transition-shadow duration-200 rounded-input px-2 py-1.5 text-xs font-bold text-foreground focus:outline-none cursor-pointer"
                  >
                    <option value="trending">Trending Index</option>
                    <option value="highest-rated">Highest Rated</option>
                    <option value="most-students">Most Students Taught</option>
                    <option value="newest">Newest Mentors</option>
                    <option value="alphabetical">Alphabetical A-Z</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Grid listings */}
            {isLoading ? (
              // Loading Skeleton Grid
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <div key={idx} className="flex flex-col gap-3.5 bg-card border border-border shadow-sm hover:shadow-md transition-shadow duration-200 p-5 rounded-card h-[260px]">
                    <div className="flex items-center gap-4">
                      <Skeleton className="w-12 h-12 rounded-full" />
                      <div className="flex flex-col gap-1.5 grow">
                        <Skeleton className="w-2/3 h-4" />
                        <Skeleton className="w-16 h-3" />
                      </div>
                    </div>
                    <Skeleton className="w-full h-8 mt-4" />
                    <Skeleton className="w-full h-10 mt-2" />
                    <div className="flex justify-between items-center mt-6">
                      <Skeleton className="w-20 h-8 rounded-button" />
                      <Skeleton className="w-20 h-8 rounded-button" />
                    </div>
                  </div>
                ))}
              </div>
            ) : sortedTutors.length === 0 ? (
              // Empty State
              <Card
                variant="glass"
                className="flex flex-col items-center justify-center p-12 text-center gap-4 border-dashed border-border/75 bg-card min-h-[300px]"
              >
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground border border-border">
                  <Users size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-heading font-extrabold text-foreground">
                    No Tutors Found
                  </h4>
                  <p className="text-[10px] text-muted-foreground mt-1 max-w-sm leading-relaxed">
                    {"We couldn't find any student tutors matching your active filters. Try resetting search parameters."}
                  </p>
                </div>
                <Button onClick={handleResetFilters} size="sm" className="mt-2">
                  Clear Filters
                </Button>
              </Card>
            ) : (
              <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedTutors.map((tutor) => renderTutorCard(tutor))}
              </StaggerContainer>
            )}

          </div>
        </Container>
      </section>

      {/* Mobile Drawer filter popup */}
      <AnimatePresence>
        {isMobileFiltersOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end"
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-full max-w-sm bg-card h-full overflow-y-auto p-6 shadow-premium relative flex flex-col gap-6"
            >
              <div className="flex items-center justify-between border-b border-border pb-4">
                <span className="text-sm font-heading font-extrabold text-foreground">
                  Refine Search
                </span>
                <button
                  type="button"
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="text-xs font-bold text-red-500 cursor-pointer focus:outline-none"
                >
                  Close
                </button>
              </div>

              <div className="grow overflow-y-auto text-left flex flex-col gap-5">
                <label className="flex items-center gap-2.5 text-xs font-bold text-foreground cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={filters.isAiVerified}
                    onChange={() => setFilters((prev) => ({ ...prev, isAiVerified: !prev.isAiVerified }))}
                    className="w-4 h-4 rounded border-border accent-primary cursor-pointer"
                  />
                  <span>AI Verified Tutors only</span>
                </label>

                <Divider className="my-0.5" />

                <div className="flex flex-col gap-2">
                  <span className="text-[9px] uppercase tracking-wider font-extrabold text-muted-foreground/80">Categories</span>
                  {MOCK_CATEGORIES.map((cat) => (
                    <label key={cat.id} className="flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={filters.category === cat.id}
                        onChange={() => setFilters((prev) => ({ ...prev, category: prev.category === cat.id ? "" : cat.id }))}
                        className="w-3.5 h-3.5 rounded border-border accent-primary cursor-pointer"
                      />
                      <span>{cat.name}</span>
                    </label>
                  ))}
                </div>

                <Divider className="my-0.5" />

                <div className="flex flex-col gap-2">
                  <span className="text-[9px] uppercase tracking-wider font-extrabold text-muted-foreground/80">Minimum Rating</span>
                  {[4.8, 4.5, 4.0].map((star) => (
                    <label key={star} className="flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={filters.rating === star}
                        onChange={() => setFilters((prev) => ({ ...prev, rating: prev.rating === star ? 0 : star }))}
                        className="w-3.5 h-3.5 rounded border-border accent-primary cursor-pointer"
                      />
                      <span>{star.toFixed(1)} ★ &amp; above</span>
                    </label>
                  ))}
                </div>

                <Divider className="my-0.5" />

                <div className="flex flex-col gap-2">
                  <span className="text-[9px] uppercase tracking-wider font-extrabold text-muted-foreground/80">Languages</span>
                  {["English", "Hindi", "Telugu"].map((lang) => (
                    <label key={lang} className="flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={filters.language === lang}
                        onChange={() => setFilters((prev) => ({ ...prev, language: prev.language === lang ? "" : lang }))}
                        className="w-3.5 h-3.5 rounded border-border accent-primary cursor-pointer"
                      />
                      <span>{lang}</span>
                    </label>
                  ))}
                </div>
              </div>

              <Button onClick={() => setIsMobileFiltersOpen(false)} className="w-full">
                Apply Filters
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </PageWrapper>
  );
}
