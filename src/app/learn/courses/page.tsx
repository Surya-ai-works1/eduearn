"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { lmsDb } from "../../../lib/lmsDb";
import { FaSearch, FaFilter, FaStar, FaChevronRight, FaGraduationCap } from "react-icons/fa";

export default function CoursesCatalog() {
  const router = useRouter();
  const [courses, setCourses] = useState<any[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLevel, setSelectedLevel] = useState("All");
  const [priceMax, setPriceMax] = useState(10000);
  const [sortBy, setSortBy] = useState("newest"); // "newest" | "price-asc" | "price-desc"

  const categoriesList = [
    "All",
    "App Development",
    "AI/ML",
    "AI Tools",
    "Data Science",
    "Data Analytics",
    "Ethical Hacking",
    "UI UX Designing",
    "Web Development",
    "Others",
  ];

  useEffect(() => {
    async function fetchCatalog() {
      try {
        const data = await lmsDb.getAllPublishedCourses();
        setCourses(data || []);
        setFilteredCourses(data || []);
      } catch (err) {
        console.error("Error fetching courses catalog:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCatalog();
  }, []);

  // Filter & Sort Logic
  useEffect(() => {
    let result = [...courses];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.subtitle?.toLowerCase().includes(q) ||
          c.description?.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (selectedCategory !== "All") {
      result = result.filter((c) => c.category === selectedCategory);
    }

    // Level filter
    if (selectedLevel !== "All") {
      result = result.filter((c) => c.level === selectedLevel);
    }

    // Price limit
    result = result.filter((c) => (c.price || 0) <= priceMax);

    // Sorting
    if (sortBy === "newest") {
      result.sort((a, b) => new Date(b.created_at || "").getTime() - new Date(a.created_at || "").getTime());
    } else if (sortBy === "price-asc") {
      result.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => (b.price || 0) - (a.price || 0));
    }

    setFilteredCourses(result);
  }, [searchQuery, selectedCategory, selectedLevel, priceMax, sortBy, courses]);

  return (
    <div className="min-h-screen bg-background text-foreground pt-32 pb-12 px-6 lg:px-10 flex justify-center">
      <div className="max-w-7xl w-full space-y-8">
        
        {/* Marketplace Banner */}
        <div className="relative rounded-3xl p-8 overflow-hidden bg-gradient-to-r from-blue-50 via-white to-indigo-50 dark:bg-none dark:bg-card border border-blue-100 dark:border-border flex flex-col md:flex-row justify-between items-center gap-6 shadow-sm dark:shadow-none">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-[80px] pointer-events-none"></div>
          
          <div className="space-y-3 max-w-xl text-center md:text-left">
            <span className="px-3 py-1 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-wider">
              EduEarn Course Catalog
            </span>
            <h1 className="text-xl md:text-2xl font-extrabold text-foreground leading-tight">
              Expand Your Skills with LMS Modules
            </h1>
            <p className="text-xs text-muted-foreground font-light leading-relaxed">
              Explore professional-grade, instructor-led training courses. Access interactive classrooms, assignments, and smart AI study buddies.
            </p>
          </div>

          <div className="flex-shrink-0 bg-blue-600/10 border border-blue-500/20 p-5 rounded-2xl flex items-center gap-4">
            <div className="text-3xl text-blue-400">
              <FaGraduationCap />
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground/80 block uppercase tracking-wider font-semibold">Total Catalog</span>
              <span className="text-lg font-extrabold text-foreground font-mono">{courses.length} Courses</span>
            </div>
          </div>
        </div>

        {/* Catalog layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* Left Sidebar Filters */}
          <div className="bg-card border border-border shadow-sm hover:shadow-md transition-shadow duration-200 p-6 rounded-2xl space-y-6 text-left">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-border">
              <FaFilter /> Search Filters
            </h3>

            {/* Search Input */}
            <div className="space-y-1.5">
              <label className="text-[9px] text-muted-foreground font-bold uppercase">Search keywords</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="React, Docker, AI..."
                  className="w-full h-9 bg-background border border-border rounded-lg text-foreground text-xs pl-8 pr-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <FaSearch className="absolute left-3 top-3 text-[10px] text-muted-foreground/80" />
              </div>
            </div>

            {/* Category Select */}
            <div className="space-y-1.5">
              <label className="text-[9px] text-muted-foreground font-bold uppercase">Subject category</label>
              <select
                className="w-full h-9 bg-background border border-border rounded-lg text-foreground text-xs px-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categoriesList.map((cat, idx) => (
                  <option key={idx} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Complexity Level */}
            <div className="space-y-1.5">
              <label className="text-[9px] text-muted-foreground font-bold uppercase">Difficulty level</label>
              <select
                className="w-full h-9 bg-background border border-border rounded-lg text-foreground text-xs px-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
              >
                <option value="All">All Levels</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            {/* Price Max slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[9px] text-muted-foreground font-bold uppercase">
                <span>Max Price</span>
                <span className="font-mono text-foreground text-xs">₹{priceMax.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="0"
                max="10000"
                step="500"
                className="w-full accent-blue-600 cursor-pointer"
                value={priceMax}
                onChange={(e) => setPriceMax(parseInt(e.target.value))}
              />
            </div>

            {/* Sort order */}
            <div className="space-y-1.5">
              <label className="text-[9px] text-muted-foreground font-bold uppercase">Sort Catalog</label>
              <select
                className="w-full h-9 bg-background border border-border rounded-lg text-foreground text-xs px-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Newest Releases</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Right Column: Courses Grid Listing */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex justify-center items-center py-32">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="bg-card border border-border shadow-md rounded-2xl p-12 text-center space-y-4 max-w-md mx-auto">
                <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2 animate-pulse"><FaGraduationCap size={24} /></div>
                <h3 className="text-sm font-bold text-foreground">No Matching Courses Found</h3>
                <p className="text-xs text-muted-foreground font-light max-w-sm mx-auto">
                  Try adjusting your search criteria or clearing filters to find what you are looking for.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {filteredCourses.map((course: any) => (
                  <div
                    key={course.id}
                    className="bg-card border border-border shadow-sm hover:shadow-md transition-shadow duration-200 hover:border-border/80 rounded-2xl overflow-hidden flex flex-col justify-between group transition duration-300"
                  >
                    <div>
                      <div className="aspect-video w-full bg-slate-950 overflow-hidden relative border-b border-border">
                        {course.thumbnail ? (
                          /* eslint-disable-next-line @next/next/no-img-element -- Course thumbnails are loaded dynamically from external storage */
                          <img
                            src={course.thumbnail}
                            alt={course.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-background text-slate-700 text-4xl">
                            <FaGraduationCap />
                          </div>
                        )}
                        <span className="absolute top-3 left-3 px-2 py-0.5 bg-blue-600/10 border border-blue-500/20 text-blue-400 text-[9px] font-bold uppercase tracking-wider rounded-full backdrop-blur-md">
                          {course.category}
                        </span>
                      </div>
                      <div className="p-5 space-y-2 text-left">
                        <h2 className="text-sm font-bold text-foreground leading-snug line-clamp-1 group-hover:text-blue-400 transition duration-300">
                          {course.title}
                        </h2>
                        <p className="text-xs text-muted-foreground font-light line-clamp-2 leading-relaxed">
                          {course.subtitle}
                        </p>
                      </div>
                    </div>

                    <div className="p-5 pt-0 flex items-center justify-between border-t border-border/50 mt-4">
                      <div className="text-left">
                        <span className="text-[9px] text-muted-foreground/80 block uppercase tracking-wider">Price</span>
                        <span className="text-sm font-extrabold text-foreground font-mono">₹{(course.price || 0).toLocaleString()}</span>
                      </div>
                      <button
                        onClick={() => router.push(`/learn/course/${course.id}`)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition flex items-center gap-1 cursor-pointer"
                      >
                        Details <FaChevronRight className="text-[8px]" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}
