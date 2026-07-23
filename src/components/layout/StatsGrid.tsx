"use client";

import React from "react";
import { Container } from "./Container";
import { Card } from "../ui/card";
import { AnimatedCounter } from "../animations";
import { BookOpen, Users, GraduationCap, Award, Globe, Tv } from "lucide-react";
import { StaggerContainer, staggerChildVariants } from "../animations";
import { motion } from "framer-motion";

export function StatsGrid() {
  const statsList = [
    {
      icon: <BookOpen size={20} className="text-primary" />,
      value: 100,
      label: "Verified Courses",
      suffix: "+",
    },
    {
      icon: <Users size={20} className="text-accent" />,
      value: 50,
      label: "Student Tutors",
      suffix: "+",
    },
    {
      icon: <GraduationCap size={20} className="text-purple-650" />,
      value: 10000,
      label: "Active Learners",
      suffix: "+",
    },
    {
      icon: <Award size={20} className="text-amber-500" />,
      value: 1500,
      label: "Certificates Earned",
      suffix: "+",
    },
    {
      icon: <Globe size={20} className="text-sky-500" />,
      value: 15,
      label: "Countries Reached",
      suffix: "+",
    },
    {
      icon: <Tv size={20} className="text-red-500" />,
      value: 250,
      label: "Live Classes Held",
      suffix: "+",
    },
  ];

  return (
    <section className="w-full py-20 bg-muted/20 border-y border-border/40 select-none">
      <Container className="flex flex-col gap-12">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center gap-3">
          <span className="text-[10px] uppercase tracking-wider font-extrabold text-primary bg-primary/10 px-3 py-1 rounded-full">
            Our Achievements
          </span>
          <h2 className="text-3xl md:text-4xl font-heading font-extrabold text-foreground tracking-tight">
            Platform Growth &amp; Statistics
          </h2>
          <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
            See the scale of our student-led network providing affordable classes globally.
          </p>
        </div>

        {/* Statistics Grid */}
        <StaggerContainer className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {statsList.map((stat, idx) => (
            <motion.div key={idx} variants={staggerChildVariants}>
              <Card
                variant="glass"
                hoverEffect="glow"
                className="flex flex-col items-center justify-center p-6 text-center gap-3 h-full border-border/60"
              >
                {/* Icon wrapper */}
                <div className="w-10 h-10 rounded-full bg-card flex items-center justify-center border border-border/50 shrink-0 shadow-sm">
                  {stat.icon}
                </div>
                
                {/* Counter value */}
                <div className="text-2xl md:text-3xl font-heading font-extrabold text-foreground tracking-tight flex items-baseline justify-center">
                  <AnimatedCounter value={stat.value} />
                  <span className="text-primary">{stat.suffix}</span>
                </div>
                
                <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                  {stat.label}
                </span>
              </Card>
            </motion.div>
          ))}
        </StaggerContainer>

      </Container>
    </section>
  );
}

export default StatsGrid;
