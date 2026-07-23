"use client";

import React from "react";
import { Container } from "./Container";
import { TutorCard } from "../ui/card";
import { MOCK_TUTORS } from "../../constants/mockData";
import { StaggerContainer, staggerChildVariants } from "../animations";
import { motion } from "framer-motion";

export function TopTutors() {
  // Take top-rated tutors from mock database
  const topTutors = MOCK_TUTORS.slice(0, 4);

  return (
    <section className="w-full py-20 bg-background select-none">
      <Container className="flex flex-col gap-12">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center gap-3">
          <span className="text-[10px] uppercase tracking-wider font-extrabold text-primary bg-primary/10 px-3 py-1 rounded-full">
            Featured Educators
          </span>
          <h2 className="text-3xl md:text-4xl font-heading font-extrabold text-foreground tracking-tight">
            Popular Tutors & Top Creators
          </h2>
          <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
            Connect with verified school/college students and young professionals who excel in their subjects and love to teach.
          </p>
        </div>

        {/* Tutors Grid */}
        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {topTutors.map((tutor, idx) => (
            <motion.div key={tutor.id} variants={staggerChildVariants}>
              <TutorCard
                id={tutor.id}
                name={tutor.fullName}
                expertise={tutor.expertise}
                rating={tutor.rating}
                studentsCount={tutor.totalStudents}
                coursesCount={tutor.totalCourses}
                earningsPreview={tutor.earnings}
                isAiVerified={idx % 2 === 0} // Toggle AI verified tags
                avatarUrl={tutor.avatar}
              />
            </motion.div>
          ))}
        </StaggerContainer>

      </Container>
    </section>
  );
}

export default TopTutors;
