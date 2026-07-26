"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Container } from "../../components/layout/Container";
import { PageWrapper } from "../../components/layout/PageWrapper";
import { Card } from "../../components/ui/card";
import { Skeleton } from "../../components/ui/skeleton";
import { Button } from "../../components/ui/button";
import { Divider } from "../../components/ui/divider";
import { SlidersHorizontal, BookOpen, Heart, Scale } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Marketplace components & hooks
import { useMarketplace } from "./hooks/useMarketplace";
import {
  CourseCard,
  MarketplaceHero,
  CategorySection,
  LearningPathsSection,
  TutorsSection,
  WishlistDrawer,
  ComparisonDrawer,
} from "./components";
import { MarketplaceFilters } from "../../components/layout/marketplace/MarketplaceFilters";
import { MarketplaceSidebar } from "../../components/layout/marketplace/MarketplaceSidebar";
import { CoursePreviewModal } from "../../components/layout/marketplace/CoursePreviewModal";
import { StaggerContainer, staggerChildVariants } from "../../components/animations";

export default function CourseMarketplacePage() {
  return (
    <Suspense
      fallback={
        <PageWrapper>
          <section className="w-full py-24 select-none text-center bg-background">
            <Container className="flex flex-col items-center justify-center min-h-[300px]">
              <div className="text-sm font-bold text-muted-foreground animate-pulse">
                Loading Learning Marketplace...
              </div>
            </Container>
          </section>
        </PageWrapper>
      }
    >
      <MarketplaceContent />
    </Suspense>
  );
}

function MarketplaceContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  const subjectParam = searchParams.get("subject");

  const {
    filters,
    setFilters,
    coursesList,
    wishlist,
    toggleWishlist,
    compareList,
    toggleCompare,
    clearCompare,
    suggestions,
    visibleCourses,
    totalCoursesCount,
    hasMore,
    isLoading,
    resetFilters,
    loadMore,
  } = useMarketplace(categoryParam || undefined, subjectParam || undefined);

  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  const handleFilterChange = React.useCallback(
    (updater: (prev: any) => any) => {
      setFilters(updater);
    },
    [setFilters]
  );

  // Check if search or sidebar category filter is active
  const isSearchOrFilterActive =
    filters.searchQuery.trim().length > 0 ||
    filters.category.trim().length > 0 ||
    filters.level.trim().length > 0 ||
    filters.language.trim().length > 0 ||
    filters.rating > 0 ||
    filters.priceType !== "all" ||
    filters.isLiveClass ||
    filters.isAiVerifiedTutor ||
    !!categoryParam ||
    !!subjectParam;

  // Curated landing rows (Featured, Trending, New, Recommended)
  const featuredCourses = coursesList.slice(0, 3);
  const trendingCourses = [...coursesList].sort((a, b) => b.studentsCount - a.studentsCount).slice(0, 3);
  const newCourses = [...coursesList].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 3);
  const recommendedCourses = [...coursesList].sort((a, b) => b.rating - a.rating).slice(0, 3);

  const handleCardClick = (course: any) => {
    setSelectedCourse(course);
    setIsPreviewOpen(true);
  };

  const handleSuggestionClick = (query: string) => {
    setFilters((prev) => ({ ...prev, searchQuery: query }));
  };

  const handleCategorySidebarClick = (catId: string) => {
    setFilters((prev) => ({
      ...prev,
      category: prev.category === catId ? "" : catId,
    }));
  };

  return (
    <PageWrapper>
      {/* 1. Header Hero Panel with Instant Search Suggestions */}
      <MarketplaceHero
        searchQuery={filters.searchQuery}
        onSearchChange={(q) => setFilters((prev) => ({ ...prev, searchQuery: q }))}
        suggestions={suggestions}
        onSuggestionClick={handleSuggestionClick}
        onQuickCategoryClick={handleCategorySidebarClick}
      />

      {/* Floating Wishlist Button */}
      {wishlist.length > 0 && (
        <button
          type="button"
          onClick={() => setIsWishlistOpen(true)}
          className="fixed right-6 top-24 z-40 bg-red-500 hover:bg-red-600 text-white p-3 rounded-full shadow-lg flex items-center justify-center hover:scale-105 transition-all duration-300"
          aria-label="View Wishlist"
        >
          <Heart size={20} fill="currentColor" />
          <span className="absolute -top-1 -right-1 bg-card border border-border text-[9px] text-foreground font-black w-4.5 h-4.5 rounded-full flex items-center justify-center">
            {wishlist.length}
          </span>
        </button>
      )}

      {/* 2. DUAL-VIEW RENDERING */}
      {!isSearchOrFilterActive ? (
        // ─── VIEW A: Discovery Landing View ──────────────────
        <div className="space-y-4">
          {/* Categories Grid */}
          <CategorySection
            activeCategory={filters.category}
            onCategorySelect={handleCategorySidebarClick}
          />

          {/* Curated Grid Lists (Featured, Trending, New, Recommended) */}
          <section className="w-full py-6 select-none text-left">
            <Container className="space-y-12">
              {/* Featured row */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-heading font-extrabold text-foreground tracking-tight">
                    Featured Masterclasses
                  </h3>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Premium handpicked courses with highest student engagement rates.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredCourses.map((c) => (
                    <CourseCard
                      key={c.id}
                      id={c.id}
                      title={c.title}
                      tutorName={c.tutorName}
                      tutorAvatar={c.tutorAvatar}
                      category={c.category}
                      price={c.price}
                      rating={c.rating}
                      duration={c.duration}
                      lessonsCount={c.lessonsCount}
                      studentsCount={c.studentsCount}
                      isAiVerified={c.isAiVerified}
                      imageSrc={c.imageSrc}
                      level={c.level}
                      isWishlisted={wishlist.includes(c.id)}
                      isCompared={compareList.some((comp) => comp.id === c.id)}
                      onWishlistToggle={(e) => {
                        e.stopPropagation();
                        toggleWishlist(c.id);
                      }}
                      onCompareToggle={(e) => {
                        e.stopPropagation();
                        toggleCompare(c);
                      }}
                      onPreviewClick={(e) => {
                        e.stopPropagation();
                        handleCardClick(c);
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Trending row */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-heading font-extrabold text-foreground tracking-tight">
                    Trending in Your Area
                  </h3>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    What learners are studying right now.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {trendingCourses.map((c) => (
                    <CourseCard
                      key={c.id}
                      id={c.id}
                      title={c.title}
                      tutorName={c.tutorName}
                      tutorAvatar={c.tutorAvatar}
                      category={c.category}
                      price={c.price}
                      rating={c.rating}
                      duration={c.duration}
                      lessonsCount={c.lessonsCount}
                      studentsCount={c.studentsCount}
                      isAiVerified={c.isAiVerified}
                      imageSrc={c.imageSrc}
                      level={c.level}
                      isWishlisted={wishlist.includes(c.id)}
                      isCompared={compareList.some((comp) => comp.id === c.id)}
                      onWishlistToggle={(e) => {
                        e.stopPropagation();
                        toggleWishlist(c.id);
                      }}
                      onCompareToggle={(e) => {
                        e.stopPropagation();
                        toggleCompare(c);
                      }}
                      onPreviewClick={(e) => {
                        e.stopPropagation();
                        handleCardClick(c);
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Recommended row */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-heading font-extrabold text-foreground tracking-tight">
                    Recommended For You
                  </h3>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Personalized recommendations based on student preferences.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recommendedCourses.map((c) => (
                    <CourseCard
                      key={c.id}
                      id={c.id}
                      title={c.title}
                      tutorName={c.tutorName}
                      tutorAvatar={c.tutorAvatar}
                      category={c.category}
                      price={c.price}
                      rating={c.rating}
                      duration={c.duration}
                      lessonsCount={c.lessonsCount}
                      studentsCount={c.studentsCount}
                      isAiVerified={c.isAiVerified}
                      imageSrc={c.imageSrc}
                      level={c.level}
                      isWishlisted={wishlist.includes(c.id)}
                      isCompared={compareList.some((comp) => comp.id === c.id)}
                      onWishlistToggle={(e) => {
                        e.stopPropagation();
                        toggleWishlist(c.id);
                      }}
                      onCompareToggle={(e) => {
                        e.stopPropagation();
                        toggleCompare(c);
                      }}
                      onPreviewClick={(e) => {
                        e.stopPropagation();
                        handleCardClick(c);
                      }}
                    />
                  ))}
                </div>
              </div>
            </Container>
          </section>

          {/* Curated Pathways */}
          <LearningPathsSection />

          {/* Popular Tutors */}
          <TutorsSection />
        </div>
      ) : (
        // ─── VIEW B: Catalog Grid View (Filtered Search Mode) ───
        <section className="w-full py-12 select-none">
          <Container className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Sidebar Filters */}
            <div className="hidden lg:block lg:col-span-3 flex flex-col gap-6">
              <MarketplaceFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                onResetFilters={resetFilters}
                coursesCount={totalCoursesCount}
              />

              <MarketplaceSidebar
                activeCategory={filters.category}
                onCategorySelect={handleCategorySidebarClick}
              />
            </div>

            {/* Catalog list */}
            <div className="lg:col-span-9 flex flex-col gap-6 text-left">
              {/* Sorting Header */}
              <div className="flex items-center justify-between border-b border-border pb-4">
                <span className="text-xs text-muted-foreground font-semibold">
                  Showing {visibleCourses.length} of {totalCoursesCount} courses
                </span>

                <div className="flex items-center gap-3">
                  {/* Mobile Filters button */}
                  <button
                    type="button"
                    onClick={() => setIsMobileFiltersOpen(true)}
                    className="lg:hidden p-2 bg-card border border-border shadow-sm rounded-input text-xs font-bold text-foreground flex items-center gap-1.5 cursor-pointer hover:bg-muted/40 transition-colors"
                  >
                    <SlidersHorizontal size={13} />
                    Filters
                  </button>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground font-semibold shrink-0">Sort by:</span>
                    <select
                      value={filters.sortBy}
                      onChange={(e) => setFilters((prev) => ({ ...prev, sortBy: e.target.value }))}
                      className="bg-card border border-border rounded-input px-2.5 py-1.5 text-xs font-bold text-foreground focus:outline-none focus:border-primary/50 cursor-pointer"
                    >
                      <option value="popular">Most Popular</option>
                      <option value="newest">Newest Arrivals</option>
                      <option value="highest-rated">Highest Rated</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="trending">Trending Index</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Grid or Skeletons */}
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col gap-3.5 bg-card border border-border shadow-sm p-4 rounded-card h-[290px]"
                    >
                      <Skeleton className="w-full aspect-video rounded-input" />
                      <Skeleton className="w-2/3 h-4" />
                      <Skeleton className="w-full h-8" />
                    </div>
                  ))}
                </div>
              ) : totalCoursesCount === 0 ? (
                <Card className="flex flex-col items-center justify-center p-12 text-center gap-4 border-dashed border-border/75 bg-card min-h-[300px]">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground border border-border">
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-heading font-extrabold text-foreground">
                      No Courses Found
                    </h4>
                    <p className="text-[10px] text-muted-foreground mt-1 max-w-sm leading-relaxed">
                      {"We couldn't find any courses matching your search query. Try resetting filters."}
                    </p>
                  </div>
                  <Button onClick={resetFilters} size="sm">
                    Reset Filters
                  </Button>
                </Card>
              ) : (
                <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {visibleCourses.map((c) => (
                    <motion.div
                      key={c.id}
                      variants={staggerChildVariants}
                      onClick={() => handleCardClick(c)}
                    >
                      <CourseCard
                        id={c.id}
                        title={c.title}
                        tutorName={c.tutorName}
                        tutorAvatar={c.tutorAvatar}
                        category={c.category}
                        price={c.price}
                        rating={c.rating}
                        duration={c.duration}
                        lessonsCount={c.lessonsCount}
                        studentsCount={c.studentsCount}
                        isAiVerified={c.isAiVerified}
                        imageSrc={c.imageSrc}
                        level={c.level}
                        isWishlisted={wishlist.includes(c.id)}
                        isCompared={compareList.some((comp) => comp.id === c.id)}
                        onWishlistToggle={(e) => {
                          e.stopPropagation();
                          toggleWishlist(c.id);
                        }}
                        onCompareToggle={(e) => {
                          e.stopPropagation();
                          toggleCompare(c);
                        }}
                        onPreviewClick={(e) => {
                          e.stopPropagation();
                          handleCardClick(c);
                        }}
                      />
                    </motion.div>
                  ))}
                </StaggerContainer>
              )}

              {/* Load More pagination indicator */}
              {hasMore && !isLoading && (
                <div className="flex flex-col items-center justify-center gap-3.5 mt-10">
                  <span className="text-[10px] text-muted-foreground font-semibold">
                    Viewing {visibleCourses.length} of {totalCoursesCount} courses
                  </span>
                  <Button onClick={loadMore} variant="outline" size="sm">
                    Load More Courses
                  </Button>
                </div>
              )}
            </div>
          </Container>
        </section>
      )}

      {/* Course Detail Preview Modal */}
      <CoursePreviewModal
        course={selectedCourse}
        isOpen={isPreviewOpen}
        onClose={() => {
          setIsPreviewOpen(false);
          setSelectedCourse(null);
        }}
      />

      {/* Wishlist Drawer */}
      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlistIds={wishlist}
        coursesList={coursesList}
        onRemoveItem={toggleWishlist}
      />

      {/* Sticky Bottom Comparison Drawer */}
      <ComparisonDrawer
        compareList={compareList}
        onRemoveItem={toggleCompare}
        onClearAll={clearCompare}
      />

      {/* Mobile Drawer Filter panel */}
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
              className="w-full max-w-sm bg-card h-full overflow-y-auto p-6 shadow-premium relative flex flex-col justify-between"
            >
              <div className="flex items-center justify-between border-b border-border pb-4">
                <span className="text-sm font-heading font-extrabold text-foreground">
                  Refine Search
                </span>
                <button
                  type="button"
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="text-xs font-bold text-red-500 cursor-pointer"
                >
                  Close
                </button>
              </div>

              <div className="grow overflow-y-auto my-6">
                <MarketplaceFilters
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  onResetFilters={resetFilters}
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
    </PageWrapper>
  );
}
