"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Container } from "../../components/layout/Container";
import { PageWrapper } from "../../components/layout/PageWrapper";
import { Card, CourseCard } from "../../components/ui/card";
import { Skeleton } from "../../components/ui/skeleton";
import { Button } from "../../components/ui/button";
import { Divider } from "../../components/ui/divider";
import { toast } from "sonner";

// Marketplace sub-components
import { MarketplaceSearch } from "../../components/layout/marketplace/MarketplaceSearch";
import { MarketplaceFilters, FiltersState } from "../../components/layout/marketplace/MarketplaceFilters";
import { MarketplaceSidebar } from "../../components/layout/marketplace/MarketplaceSidebar";
import { CoursePreviewModal } from "../../components/layout/marketplace/CoursePreviewModal";

import { MOCK_COURSES, MOCK_TUTORS, ALL_SUBJECTS } from "../../constants/mockData";
import { scoreCourse, getImpliedCategory } from "../../utils/search";
import { StaggerContainer, staggerChildVariants } from "../../components/animations";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, BookOpen, WifiOff } from "lucide-react";

export default function CourseMarketplacePage() {
  return (
    <Suspense fallback={
      <PageWrapper>
        <section className="w-full py-24 select-none text-center bg-background">
          <Container className="flex flex-col items-center justify-center min-h-[300px]">
            <div className="text-sm font-bold text-muted-foreground animate-pulse">
              Loading Learning Marketplace...
            </div>
          </Container>
        </section>
      </PageWrapper>
    }>
      <MarketplaceContent />
    </Suspense>
  );
}

function MarketplaceContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  const subjectParam = searchParams.get("subject");

  const [filters, setFilters] = useState<FiltersState>(() => ({
    searchQuery: "",
    category: categoryParam || "",
    priceType: "all",
    maxPrice: 3000,
    rating: 0,
    level: "",
    language: "",
    durationRange: "all",
    isAiVerifiedTutor: false,
    isLiveClass: false,
    sortBy: "popular",
  }));

  const [currentPage, setCurrentPage] = useState(1);
  const [coursesList, setCoursesList] = useState<any[]>(MOCK_COURSES);

  useEffect(() => {
    async function loadPublishedCourses() {
      try {
        const { lmsDb } = await import("../../lib/lmsDb");
        const dbCourses = await lmsDb.getAllPublishedCourses();
        if (dbCourses && dbCourses.length > 0) {
          const { createClient } = await import("../../lib/supabase");
          const supabase = createClient();
          const mapped = [];
          
          for (const c of dbCourses) {
            let tutorName = "Tutor Instructor";
            let tutorAvatar = "https://api.dicebear.com/7.x/avataaars/svg?seed=Tutor%20Instructor";
            try {
              const { data: profile } = await supabase
                .from("profiles")
                .select("full_name, display_name, avatar_url")
                .eq("id", c.tutor_id)
                .maybeSingle();
              if (profile) {
                tutorName = profile.full_name || profile.display_name || "Tutor Instructor";
                tutorAvatar = profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(tutorName)}`;
              }
            } catch (err) {}

            mapped.push({
              id: c.id,
              title: c.title,
              tutorId: c.tutor_id,
              tutorName,
              tutorAvatar,
              category: c.category,
              categoryId: (c as any).category_id || c.category?.toLowerCase().replace(/\s+/g, "-"),
              subjectId: (c as any).subject_id || (c as any).subject || c.category?.toLowerCase().replace(/\s+/g, "-"),
              price: Number(c.price),
              rating: 4.8,
              duration: "10 hours",
              lessonsCount: c.lessons?.length || 0,
              studentsCount: 150,
              isAiVerified: true,
              imageSrc: c.thumbnail || null,
              level: c.level,
              language: "English",
              createdAt: c.created_at,
              description: c.description || c.subtitle || "",
            });
          }
          setCoursesList(mapped);
        } else {
          setCoursesList(MOCK_COURSES);
        }
      } catch (err) {
        console.warn("Failed to load courses from Supabase, falling back to mock courses:", err);
        setCoursesList(MOCK_COURSES);
      }
    }
    loadPublishedCourses();
  }, []);

  const [selectedCourse, setSelectedCourse] = useState<typeof MOCK_COURSES[number] | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Sync category param from URL if it changes dynamically
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
      priceType: "all",
      maxPrice: 3000,
      rating: 0,
      level: "",
      language: "",
      durationRange: "all",
      isAiVerifiedTutor: false,
      isLiveClass: false,
      sortBy: "popular",
    });
    setCurrentPage(1);
    toast.info("All search filters reset.");
  };

  // 1. FILTERING LOGIC
  const filteredCourses = coursesList.filter((course, idx) => {
    // URL Category filter
    if (categoryParam) {
      if (course.categoryId !== categoryParam) {
        return false;
      }
    }

    // URL Subject filter
    if (subjectParam) {
      if (course.subjectId !== subjectParam) {
        return false;
      }
    }

    // Search query check
    if (filters.searchQuery.trim()) {
      const score = scoreCourse(course, filters.searchQuery);
      if (score === 0) return false;
    }

    // Category sidebar filter (Only if categoryParam URL parameter is NOT set)
    if (!categoryParam && filters.category && course.categoryId !== filters.category) {
      return false;
    }

    // Price type check
    if (filters.priceType === "free" && course.price > 0) return false;
    if (filters.priceType === "premium" && course.price === 0) return false;

    // Max Price check
    if (course.price > filters.maxPrice) return false;

    // Rating check
    if (filters.rating > 0 && course.rating < filters.rating) return false;

    // Level check
    if (filters.level && course.level !== filters.level) return false;

    // Language check
    if (filters.language && course.language !== filters.language) return false;

    // Duration range check
    const durationHours = parseInt(course.duration) || 0;
    if (filters.durationRange === "short" && durationHours >= 10) return false;
    if (filters.durationRange === "medium" && (durationHours < 10 || durationHours > 15)) return false;
    if (filters.durationRange === "long" && durationHours <= 15) return false;

    // AI Verified check
    if (filters.isAiVerifiedTutor) {
      const tutor = MOCK_TUTORS.find((t) => t.id === course.tutorId);
      if (tutor?.verificationStatus !== "ai_verified") return false;
    }

    // Live Class check (Index-based mock)
    if (filters.isLiveClass && idx % 4 !== 0) {
      return false;
    }

    return true;
  });

  // 2. SORTING LOGIC
  const sortedCourses = [...filteredCourses].sort((a, b) => {
    if (filters.searchQuery.trim()) {
      const scoreA = scoreCourse(a, filters.searchQuery);
      const scoreB = scoreCourse(b, filters.searchQuery);
      if (scoreB !== scoreA) {
        return scoreB - scoreA;
      }
    }
    if (filters.sortBy === "newest") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (filters.sortBy === "highest-rated") {
      return b.rating - a.rating;
    }
    if (filters.sortBy === "price-low") {
      return a.price - b.price;
    }
    if (filters.sortBy === "price-high") {
      return b.price - a.price;
    }
    if (filters.sortBy === "trending") {
      return (b.studentsCount * b.rating) - (a.studentsCount * a.rating);
    }
    if (filters.sortBy === "recommended") {
      return b.rating - a.rating;
    }
    return b.studentsCount - a.studentsCount;
  });

  // 3. PAGINATION SLICING
  const itemsPerPage = 9;
  const totalCoursesCount = sortedCourses.length;
  const visibleCourses = sortedCourses.slice(0, currentPage * itemsPerPage);
  const hasMore = visibleCourses.length < totalCoursesCount;

  const handleCardClick = (course: typeof MOCK_COURSES[number]) => {
    setSelectedCourse(course);
    setIsPreviewOpen(true);
  };

  const handleCategorySidebarClick = (catId: string) => {
    setFilters((prev) => ({
      ...prev,
      category: prev.category === catId ? "" : catId,
    }));
    setCurrentPage(1);
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
            <span className="text-foreground">Courses</span>
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
              {activeSubjectName ? `${activeSubjectName} Marketplace` : "Peer-to-Peer Course Marketplace"}
            </h1>
            <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
              {activeSubjectName 
                ? `Learn ${activeSubjectName} from verified student tutors. Access live classes, doubt support, and study notes tailored to your needs.`
                : "Discover self-paced classes and live workshops structured by school/college students. Learn academic calculus, coding, photography, or music."}
            </p>
          </div>

          <Divider className="my-2" />

          {/* Search bar widget */}
          <MarketplaceSearch
            searchQuery={filters.searchQuery}
            onSearchChange={(q) => {
              setFilters((prev) => ({ ...prev, searchQuery: q }));
              setCurrentPage(1);
            }}
          />
        </Container>
      </section>

      {/* Catalog Grid Section */}
      <section className="w-full py-12 select-none">
        <Container className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* 1. Left Sidebar Filters & Widgets (Desktop Only) */}
          <div className="hidden lg:block lg:col-span-3 flex flex-col gap-6">
            <MarketplaceFilters
              filters={filters}
              onFilterChange={setFilters}
              onResetFilters={handleResetFilters}
              coursesCount={totalCoursesCount}
            />
            
            <MarketplaceSidebar
              activeCategory={filters.category}
              onCategorySelect={handleCategorySidebarClick}
            />
          </div>

          {/* 2. Right Catalog Feed (Main Grid) */}
          <div className="lg:col-span-9 flex flex-col gap-6 text-left">
            
            {/* Sorting controls bar */}
            <div className="flex items-center justify-between border-b border-border/45 pb-4">
              <span className="text-xs text-muted-foreground font-semibold">
                Showing {visibleCourses.length} of {totalCoursesCount} courses
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
                    onChange={(e) => {
                      setFilters((prev) => ({ ...prev, sortBy: e.target.value }));
                      setCurrentPage(1);
                    }}
                    className="bg-card border border-border shadow-sm hover:shadow-md transition-shadow duration-200/80 rounded-input px-2.5 py-1.5 text-xs font-bold text-foreground focus:outline-none focus:border-primary/50 cursor-pointer"
                  >
                    <option value="popular">Most Popular</option>
                    <option value="newest">Newest Arrivals</option>
                    <option value="highest-rated">Highest Rated</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="trending">Trending Index</option>
                    <option value="recommended">Recommended</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Courses Catalog Loop */}
            {isLoading ? (
              // Loading Skeleton Grid
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <div key={idx} className="flex flex-col gap-3.5 bg-card border border-border shadow-sm hover:shadow-md transition-shadow duration-200 p-4 rounded-card h-[290px]">
                    <Skeleton className="w-full aspect-video rounded-input" />
                    <Skeleton className="w-2/3 h-4" />
                    <Skeleton className="w-full h-8" />
                    <div className="flex justify-between items-center mt-4">
                      <Skeleton className="w-16 h-4" />
                      <Skeleton className="w-8 h-8 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : totalCoursesCount === 0 ? (
              // Empty State
              <Card
                variant="glass"
                className="flex flex-col items-center justify-center p-12 text-center gap-4 border-dashed border-border/75 bg-card min-h-[300px]"
              >
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground border border-border">
                  <BookOpen size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-heading font-extrabold text-foreground">
                    No Courses Found
                  </h4>
                  <p className="text-[10px] text-muted-foreground mt-1 max-w-sm leading-relaxed">
                    {"We couldn't find any courses matching this query or active filters. Try resetting search parameters."}
                  </p>
                </div>
                <Button onClick={handleResetFilters} size="sm" className="mt-2">
                  Clear Filters
                </Button>
              </Card>
            ) : (
              // Course Cards Grid
              <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {visibleCourses.map((course) => (
                  <motion.div
                    key={course.id}
                    variants={staggerChildVariants}
                    onClick={() => handleCardClick(course)}
                    className="cursor-pointer"
                  >
                    <CourseCard
                      id={course.id}
                      title={course.title}
                      tutorName={course.tutorName}
                      category={course.category}
                      price={course.price}
                      rating={course.rating}
                      duration={course.duration}
                      lessonsCount={course.lessonsCount}
                      studentsCount={course.studentsCount}
                      isAiVerified={MOCK_TUTORS.find(t => t.id === course.tutorId)?.verificationStatus === "ai_verified"}
                      imageSrc={course.thumbnail}
                    />
                  </motion.div>
                ))}
              </StaggerContainer>
            )}

            {/* Pagination Load More row */}
            {hasMore && !isLoading && (
              <div className="flex flex-col items-center justify-center gap-3.5 mt-10 pb-6">
                <span className="text-[10px] text-muted-foreground font-semibold">
                  {"You've viewed "}{visibleCourses.length} of {totalCoursesCount} courses
                </span>
                <div className="w-48 h-1 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${(visibleCourses.length / totalCoursesCount) * 100}%` }}
                  />
                </div>
                <Button
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  variant="outline"
                  size="sm"
                  className="mt-1"
                >
                  Load More Courses
                </Button>
              </div>
            )}

          </div>
        </Container>
      </section>

      {/* Course Detail Preview Modal sheet */}
      <CoursePreviewModal
        course={selectedCourse}
        isOpen={isPreviewOpen}
        onClose={() => {
          setIsPreviewOpen(false);
          setSelectedCourse(null);
        }}
      />

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

              <div className="grow overflow-y-auto">
                <MarketplaceFilters
                  filters={filters}
                  onFilterChange={setFilters}
                  onResetFilters={handleResetFilters}
                  coursesCount={totalCoursesCount}
                />
              </div>

              <Button onClick={() => setIsMobileFiltersOpen(false)} className="w-full">
                Apply Filters
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* No Internet banner */}
      <div className="w-full py-4 bg-muted/10 border-t border-border/40 select-none text-center">
        <Container className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground font-semibold">
          <WifiOff size={12} className="text-muted-foreground/60 shrink-0" />
          <span>Need offline mode? Download our future iOS or Android native application.</span>
        </Container>
      </div>

    </PageWrapper>
  );
}
