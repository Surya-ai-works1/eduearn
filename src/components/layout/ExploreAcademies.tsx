"use client";

import React from "react";
import Link from "next/link";
import {
  Briefcase,
  GraduationCap,
  BookOpen,
  Palette,
  Heart,
  TrendingUp,
  Sparkles,
  Award,
  ArrowRight,
} from "lucide-react";
import { Container } from "./Container";
import { Card } from "../ui/card";
import { StaggerContainer, staggerChildVariants } from "../animations";
import { motion } from "framer-motion";
import { ACADEMIES } from "../../constants/academiesData";

const iconMap: Record<string, React.ReactNode> = {
  Briefcase: <Briefcase className="w-5 h-5" />,
  GraduationCap: <GraduationCap className="w-5 h-5" />,
  BookOpen: <BookOpen className="w-5 h-5" />,
  Palette: <Palette className="w-5 h-5" />,
  Heart: <Heart className="w-5 h-5" />,
  TrendingUp: <TrendingUp className="w-5 h-5" />,
  Sparkles: <Sparkles className="w-5 h-5" />,
  Award: <Award className="w-5 h-5" />,
};

export function ExploreAcademies() {
  // Filter out archived academies for public view, but keep all active/placeholder ones
  const visibleAcademies = ACADEMIES.filter((a) => a.status !== "Archived");

  return (
    <section className="w-full py-16 bg-muted/10 border-b border-border/40 select-none text-left">
      <Container>
        <div className="flex flex-col gap-2.5 mb-10 max-w-2xl">
          <span className="text-[10px] font-black uppercase tracking-widest text-primary">
            Scalable Learning Ecosystem
          </span>
          <h2 className="text-2xl md:text-3xl font-heading font-extrabold text-foreground tracking-tight">
            Explore Learning Academies
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
            Choose from specialized peer-led education hubs designed to take you from foundational concepts to advanced proficiency.
          </p>
        </div>

        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleAcademies.map((academy) => {
            const isActive = academy.status === "Active";
            const statusColor =
              academy.status === "Active"
                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                : academy.status === "Private Beta"
                ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                : "bg-slate-500/10 text-slate-500 border-slate-500/20";

            return (
              <motion.div key={academy.id} variants={staggerChildVariants}>
                <Card
                  variant="default"
                  hoverEffect="lift"
                  className="p-6 border border-border/60 bg-card h-full flex flex-col justify-between group transition-all duration-300 relative overflow-hidden"
                >
                  {/* Subtle Background Glow corresponding to Academy Theme Color */}
                  <div
                    className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-10 pointer-events-none group-hover:opacity-20 transition-opacity duration-300"
                    style={{ backgroundColor: academy.themeColor }}
                  />

                  <div className="flex flex-col gap-4">
                    {/* Header: Icon & Status Badge */}
                    <div className="flex items-center justify-between">
                      <div
                        className="w-10 h-10 rounded-button flex items-center justify-center text-white"
                        style={{ backgroundColor: academy.themeColor }}
                      >
                        {iconMap[academy.icon] || <GraduationCap className="w-5 h-5" />}
                      </div>
                      <span
                        className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 border rounded-full ${statusColor}`}
                      >
                        {academy.status}
                      </span>
                    </div>

                    {/* Title & Description */}
                    <div className="flex flex-col gap-1.5 mt-2">
                      <h3 className="text-base font-extrabold text-foreground group-hover:text-primary transition-colors duration-250">
                        {academy.name}
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {academy.description}
                      </p>
                    </div>
                  </div>

                  {/* Actions / CTA */}
                  <div className="mt-6 pt-4 border-t border-border/40 flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground font-semibold">
                      {isActive ? "10+ courses available" : `Expected: ${academy.expectedLaunch}`}
                    </span>

                    {isActive ? (
                      <Link href={`/academies/${academy.slug}`} className="inline-flex items-center gap-1.5 text-[11px] font-bold text-primary hover:underline cursor-pointer group-hover:translate-x-0.5 transition-transform">
                        <span>Explore Now</span>
                        <ArrowRight size={12} />
                      </Link>
                    ) : (
                      <Link href={`/academies/${academy.slug}`} className="inline-flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground hover:text-foreground hover:underline cursor-pointer">
                        <span>Coming Soon</span>
                        <ArrowRight size={12} />
                      </Link>
                    )}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </StaggerContainer>
      </Container>
    </section>
  );
}
