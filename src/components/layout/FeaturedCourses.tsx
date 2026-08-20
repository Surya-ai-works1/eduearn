"use client";

import React from "react";
import { Container } from "./Container";
import { Tabs } from "../ui/tabs";
import { CourseCard } from "../ui/card";
import { MOCK_COURSES } from "../../constants/mockData";
import { StaggerContainer, staggerChildVariants } from "../animations";
import { motion } from "framer-motion";
import { createClient } from "../../lib/supabase/client";

export function FeaturedCourses() {
  const [dbCourses, setDbCourses] = React.useState<any[]>([]);

  React.useEffect(() => {
    async function fetchCourses() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("courses")
          .select("*, profiles:tutor_id(full_name)")
          .eq("approval_status", "approved");
        
        if (data && data.length > 0) {
          const mapped = data.map((c: any) => ({
            id: c.id,
            title: c.title,
            tutorName: c.profiles?.full_name || "Tutor",
            category: c.category || "General",
            price: Number(c.price || 0),
            rating: 4.8,
            duration: "8 hours",
            lessonsCount: 10,
            studentsCount: 120,
            thumbnail: c.thumbnail || ""
          }));
          setDbCourses(mapped);
        }
      } catch (err) {
        console.warn("Error fetching courses from database, falling back:", err);
      }
    }
    fetchCourses();
  }, []);

  const combinedCourses = React.useMemo(() => {
    if (dbCourses.length === 0) return MOCK_COURSES;
    const dbIds = new Set(dbCourses.map(c => c.id));
    const uniqueMocks = MOCK_COURSES.filter(c => !dbIds.has(c.id));
    return [...dbCourses, ...uniqueMocks];
  }, [dbCourses]);

  // Select courses dynamically for each category tab
  // 1. Trending: Ratings of 4.8 or 4.9
  const trendingCourses = combinedCourses.filter((c) => c.rating >= 4.8).slice(0, 6);
  
  // 2. New Arrivals: Sliced from the end of mock database representing recent additions
  const newCourses = combinedCourses.slice().reverse().slice(0, 6);

  // 3. Best Sellers: Sliced from courses with high enrollment values
  const bestSellerCourses = combinedCourses.filter((c) => c.studentsCount > 100).slice(0, 6);

  // Render course grids inside Stagger anim wrappers
  const renderCourseGrid = (courses: typeof MOCK_COURSES) => (
    <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course, idx) => (
        <motion.div key={course.id} variants={staggerChildVariants}>
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
            isAiVerified={idx % 2 === 0} // Mock AI Assessment badge toggles
            imageSrc={course.thumbnail}
          />
        </motion.div>
      ))}
    </StaggerContainer>
  );

  const tabItems = [
    {
      id: "trending",
      label: "Trending Courses",
      content: renderCourseGrid(trendingCourses),
    },
    {
      id: "new-arrivals",
      label: "New Arrivals",
      content: renderCourseGrid(newCourses),
    },
    {
      id: "best-sellers",
      label: "Best Sellers",
      content: renderCourseGrid(bestSellerCourses),
    },
  ];

  return (
    <section className="w-full py-20 bg-muted/20 border-y border-border/40 select-none">
      <Container className="flex flex-col gap-12">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/45 pb-6">
          <div className="flex flex-col text-left gap-2.5">
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-primary bg-primary/10 px-3 py-1 rounded-full w-fit">
              Top Catalogs
            </span>
            <h2 className="text-3xl md:text-4xl font-heading font-extrabold text-foreground tracking-tight">
              Top Rated, Recently Added & Most Enrolled Courses
            </h2>
            <p className="text-sm text-muted-foreground max-w-lg leading-relaxed">
              Unlock student-led learning guides across design, academics, programming, coding, and hobby crafts.
            </p>
          </div>
        </div>

        {/* Tab Selection Layout */}
        <Tabs items={tabItems} defaultTabId="trending" variant="solid" />

      </Container>
    </section>
  );
}

export default FeaturedCourses;
