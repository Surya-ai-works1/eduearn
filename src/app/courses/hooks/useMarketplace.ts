import { useState, useEffect, useCallback, useMemo } from "react";
import { MOCK_COURSES } from "../../../constants/mockData";
import { lmsDb } from "../../../lib/lmsDb";
import { createClient } from "../../../lib/supabase";
import { toast } from "sonner";
import { getCourseThumbnail } from "../../../lib/courseThumbnailRegistry";
import {
  getCanonicalCategoryId,
  getCanonicalSubjectId,
  isCategoryMatch,
  isSubjectMatch,
} from "../../../utils/slugify";

export interface FiltersState {
  searchQuery: string;
  category: string;
  priceType: "all" | "free" | "premium";
  maxPrice: number;
  rating: number;
  level: string;
  language: string;
  durationRange: string;
  isAiVerifiedTutor: boolean;
  isLiveClass: boolean;
  sortBy: string;
}

const defaultFilters: FiltersState = {
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
};

export function useMarketplace(categoryParam?: string, subjectParam?: string) {
  const [filters, setFilters] = useState<FiltersState>({
    ...defaultFilters,
    category: categoryParam || "",
  });

  const [coursesList, setCoursesList] = useState<any[]>(MOCK_COURSES);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [compareList, setCompareList] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Sync category param from URL if it changes
  useEffect(() => {
    if (categoryParam) {
      setFilters((prev) => ({ ...prev, category: categoryParam }));
    }
  }, [categoryParam]);

  // Load wishlist from local storage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("eduearn_wishlist");
      if (saved) {
        try {
          setWishlist(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to parse wishlist", e);
        }
      }
    }
  }, []);

  // Fetch published courses & catalog templates from Supabase with fallback to mock data
  const loadCourses = useCallback(async () => {
    try {
      setIsLoading(true);
      const dbCourses = await lmsDb.getMarketplaceCourses();
      if (dbCourses && dbCourses.length > 0) {
        const supabase = createClient();
        const mapped = [];

        for (const c of dbCourses) {
          let tutorName = "Awaiting Tutor Assignment";
          let tutorAvatar = "";
          let isTemplate = !c.tutor_id || c.status === "draft";

          if (supabase && c.tutor_id) {
            try {
              const { data: profile } = await supabase
                .from("profiles")
                .select("full_name, display_name, avatar_url, role")
                .eq("id", c.tutor_id)
                .maybeSingle();
              if (profile && profile.role === "tutor") {
                tutorName = profile.full_name || profile.display_name || "EduEarn Tutor";
                tutorAvatar = profile.avatar_url || "";
                isTemplate = false;
              }
            } catch (err) {}
          }

          const catId = getCanonicalCategoryId(c.category);
          const subId = getCanonicalSubjectId((c as any).subcategory || c.title || c.category);

          mapped.push({
            id: c.id,
            title: c.title,
            tutorId: isTemplate ? null : c.tutor_id,
            tutorName,
            tutorAvatar,
            isTemplate,
            category: c.category,
            categoryId: catId,
            subjectId: subId,
            price: Number((c as any).selling_price || c.price || 0),
            rating: isTemplate ? 0 : 4.8,
            duration: (c as any).duration || "10 hours",
            lessonsCount: c.lessons?.length || 0,
            studentsCount: isTemplate ? 0 : 150,
            isAiVerified: !isTemplate,
            imageSrc: getCourseThumbnail(c),
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
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  // Wishlist toggle
  const toggleWishlist = useCallback((courseId: string) => {
    setWishlist((prev) => {
      const next = prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId];
      if (typeof window !== "undefined") {
        localStorage.setItem("eduearn_wishlist", JSON.stringify(next));
      }
      if (next.includes(courseId)) {
        toast.success("Course added to wishlist.");
      } else {
        toast.info("Course removed from wishlist.");
      }
      return next;
    });
  }, []);

  // Comparison list toggle (Max 3)
  const toggleCompare = useCallback((course: any) => {
    setCompareList((prev) => {
      const exists = prev.some((c) => c.id === course.id);
      if (exists) {
        toast.info("Removed from comparison.");
        return prev.filter((c) => c.id !== course.id);
      }
      if (prev.length >= 3) {
        toast.warning("You can compare up to 3 courses only.");
        return prev;
      }
      toast.success("Added to comparison.");
      return [...prev, course];
    });
  }, []);

  const clearCompare = useCallback(() => {
    setCompareList([]);
    toast.info("Comparison cleared.");
  }, []);

  // Auto-complete suggestions based on query
  const suggestions = useMemo(() => {
    if (!filters.searchQuery.trim()) return [];
    const query = filters.searchQuery.toLowerCase();
    return coursesList
      .filter(
        (c) =>
          c.title.toLowerCase().includes(query) ||
          c.category.toLowerCase().includes(query) ||
          c.tutorName.toLowerCase().includes(query) ||
          (c.description && c.description.toLowerCase().includes(query)) ||
          (c.subjectId && c.subjectId.toLowerCase().includes(query)) ||
          (c.level && c.level.toLowerCase().includes(query))
      )
      .slice(0, 5);
  }, [filters.searchQuery, coursesList]);

  // Filtered & Sorted result set
  const filteredCourses = useMemo(() => {
    return coursesList.filter((course, idx) => {
      // Category check (Canonical alias matching)
      const targetCat = categoryParam || filters.category;
      if (
        targetCat &&
        !isCategoryMatch(course.categoryId, targetCat) &&
        !isCategoryMatch(course.category, targetCat)
      ) {
        return false;
      }

      // Subject check (Canonical subject matching)
      if (
        subjectParam &&
        !isSubjectMatch(course.subjectId, subjectParam) &&
        !isSubjectMatch(course.subjectName, subjectParam) &&
        !isSubjectMatch(course.title, subjectParam)
      ) {
        return false;
      }

      // Search query check
      if (filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase();
        const matchesTitle = course.title.toLowerCase().includes(query);
        const matchesCategory = course.category.toLowerCase().includes(query);
        const matchesTutor = course.tutorName.toLowerCase().includes(query);
        const matchesDescription = Boolean(course.description && course.description.toLowerCase().includes(query));
        const matchesSubject = Boolean(
          (course.subjectId && course.subjectId.toLowerCase().includes(query)) ||
          (course.subjectName && course.subjectName.toLowerCase().includes(query))
        );
        const matchesLevel = Boolean(course.level && course.level.toLowerCase().includes(query));
        if (
          !matchesTitle &&
          !matchesCategory &&
          !matchesTutor &&
          !matchesDescription &&
          !matchesSubject &&
          !matchesLevel
        ) {
          return false;
        }
      }

      // Price type
      if (filters.priceType === "free" && course.price > 0) return false;
      if (filters.priceType === "premium" && course.price === 0) return false;

      // Max price
      if (course.price > filters.maxPrice) return false;

      // Rating
      if (filters.rating > 0 && course.rating < filters.rating) return false;

      // Level
      if (filters.level && course.level.toLowerCase() !== filters.level.toLowerCase()) return false;

      // Language
      if (filters.language && course.language.toLowerCase() !== filters.language.toLowerCase()) return false;

      // Duration Range
      const durationHours = parseInt(course.duration) || 10;
      if (filters.durationRange === "short" && durationHours >= 10) return false;
      if (filters.durationRange === "medium" && (durationHours < 10 || durationHours > 15)) return false;
      if (filters.durationRange === "long" && durationHours <= 15) return false;

      // Live Class (Simulated modulo check)
      if (filters.isLiveClass && idx % 4 !== 0) return false;

      return true;
    });
  }, [coursesList, filters, categoryParam, subjectParam]);

  const sortedCourses = useMemo(() => {
    return [...filteredCourses].sort((a, b) => {
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
        return b.studentsCount * b.rating - a.studentsCount * a.rating;
      }
      return b.studentsCount - a.studentsCount;
    });
  }, [filteredCourses, filters.sortBy]);

  // Pagination slicing
  const itemsPerPage = 9;
  const totalCoursesCount = sortedCourses.length;
  const visibleCourses = useMemo(() => {
    return sortedCourses.slice(0, currentPage * itemsPerPage);
  }, [sortedCourses, currentPage]);

  const hasMore = visibleCourses.length < totalCoursesCount;

  const resetFilters = useCallback(() => {
    setFilters({
      ...defaultFilters,
      category: categoryParam || "",
    });
    setCurrentPage(1);
    toast.info("All marketplace filters reset.");
  }, [categoryParam]);

  const loadMore = useCallback(() => {
    setCurrentPage((prev) => prev + 1);
  }, []);

  return {
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
  };
}
