"use client";

import React from "react";
import Link from "next/link";
import { Container } from "./Container";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Clock, Award } from "lucide-react";
import { StaggerContainer, staggerChildVariants } from "../animations";
import { motion } from "framer-motion";
import { Divider } from "../ui/divider";
import { toast } from "sonner";

interface LearningPathItem {
  id: string;
  title: string;
  description: string;
  duration: string;
  coursesCount: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  certificate: string;
  steps: string[];
}

export function LearningPaths() {
  const paths: LearningPathItem[] = [
    {
      id: "fullstack",
      title: "Full Stack Developer",
      description: "Go from HTML basics to building complex cloud-deployed React/Node applications.",
      duration: "12 Weeks",
      coursesCount: 4,
      difficulty: "intermediate",
      certificate: "Professional Web Dev Certificate",
      steps: ["HTML & CSS", "JavaScript & DOM", "React & Next.js", "Node.js & MongoDB"],
    },
    {
      id: "ai-engineer",
      title: "AI Engineer",
      description: "Master Prompt Engineering, fine-tune models, and build LLM-driven agents.",
      duration: "8 Weeks",
      coursesCount: 3,
      difficulty: "advanced",
      certificate: "AI Prompt Specialist Certificate",
      steps: ["Prompt Patterns", "Gemini API integrations", "RAG & Vector Databases"],
    },
    {
      id: "ui-ux",
      title: "UI/UX Designer",
      description: "Master typography, layout grids, wireframes, prototypes, and Figma Design Systems.",
      duration: "10 Weeks",
      coursesCount: 3,
      difficulty: "beginner",
      certificate: "Creative Design Certificate",
      steps: ["Design Principles", "Figma Advanced Skills", "High-Fidelity Prototypes"],
    },
    {
      id: "digital-marketing",
      title: "Digital Marketing",
      description: "Master Google SEO, pay-per-click Ads, content strategies, and web analytics.",
      duration: "6 Weeks",
      coursesCount: 2,
      difficulty: "beginner",
      certificate: "Growth Marketing Certificate",
      steps: ["SEO Fundamentals", "Content Copywriting", "PPC Campaigns"],
    },
    {
      id: "data-science",
      title: "Data Science",
      description: "Learn Python data analysis, regression forecasting, and machine learning models.",
      duration: "14 Weeks",
      coursesCount: 5,
      difficulty: "advanced",
      certificate: "Advanced Analytics Certificate",
      steps: ["Pandas & NumPy", "Statistical Math", "Scikit-Learn Regression"],
    },
    {
      id: "photography-mastery",
      title: "Photography Mastery",
      description: "Master camera exposure, lighting composition, lens selection, and Lightroom presets.",
      duration: "8 Weeks",
      coursesCount: 3,
      difficulty: "intermediate",
      certificate: "Visual Arts Certificate",
      steps: ["Exposure Triangle", "Visual Composition", "Lightroom Presets"],
    },
    {
      id: "music-learning",
      title: "Music Learning",
      description: "Learn acoustic chord transitions, rhythm counting, and basic music theory scales.",
      duration: "12 Weeks",
      coursesCount: 4,
      difficulty: "beginner",
      certificate: "Performance Arts Certificate",
      steps: ["Chord Fingerings", "Strumming Patterns", "Scale Transitions"],
    },
    {
      id: "cooking-essentials",
      title: "Cooking Essentials",
      description: "Learn professional chef knife handling, baking temperatures, and pasta foundations.",
      duration: "4 Weeks",
      coursesCount: 2,
      difficulty: "beginner",
      certificate: "Culinary Arts Certificate",
      steps: ["Knife Techniques", "Sauces Foundations", "Baking Formulas"],
    },
  ];

  return (
    <section className="w-full py-20 bg-background select-none">
      <Container className="flex flex-col gap-12">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center gap-3">
          <span className="text-[10px] uppercase tracking-wider font-extrabold text-primary bg-primary/10 px-3 py-1 rounded-full">
            Guided Roadmaps
          </span>
          <h2 className="text-3xl md:text-4xl font-heading font-extrabold text-foreground tracking-tight">
            Curated Learning Paths
          </h2>
          <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
            Follow sequential course paths designed by expert student tutors to take you from beginner to job-ready.
          </p>
        </div>

        {/* Learning Paths Grid */}
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {paths.map((path, idx) => (
            <motion.div key={idx} variants={staggerChildVariants}>
              <Card
                variant="default"
                hoverEffect="lift"
                className="flex flex-col justify-between h-full p-6 text-left border-border bg-card group relative"
              >
                <div>
                  {/* Difficulty Badge */}
                  <div className="flex items-center justify-between">
                    <Badge variant={path.difficulty === "beginner" ? "success" : path.difficulty === "intermediate" ? "primary" : "danger"}>
                      {path.difficulty}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
                      <Clock size={11} />
                      {path.duration}
                    </span>
                  </div>

                  <h4 className="text-sm font-heading font-extrabold text-foreground mt-4 group-hover:text-primary transition-colors leading-tight">
                    {path.title}
                  </h4>
                  <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed line-clamp-3">
                    {path.description}
                  </p>

                  <Divider variant="dashed" className="my-4" />

                  {/* Path Steps (Visual Roadmap dots/links) */}
                  <div className="flex flex-col gap-2.5">
                    <span className="text-[8px] uppercase tracking-wider font-extrabold text-muted-foreground">Roadmap steps</span>
                    <ul className="flex flex-col gap-2 relative pl-3.5 border-l border-border/80">
                      {path.steps.map((step, sIdx) => (
                        <li key={sIdx} className="text-[10px] text-foreground font-semibold flex items-center gap-1.5 relative">
                          {/* Dot indicator */}
                          <span className="absolute -left-[18.5px] w-2 h-2 rounded-full bg-primary border-2 border-card z-10" />
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-border/40 flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-[9px] text-muted-foreground font-semibold uppercase">
                    <Award size={13} className="text-amber-500" />
                    <span className="truncate">{path.certificate}</span>
                  </div>

                  <Link
                    href={`/learning-paths/${path.id}`}
                    className="w-full text-center py-2.5 rounded-button text-[10px] font-bold uppercase tracking-wider bg-muted group-hover:bg-primary group-hover:text-white transition-colors cursor-pointer focus:outline-none block"
                  >
                    Start Pathway
                  </Link>
                </div>
              </Card>
            </motion.div>
          ))}
        </StaggerContainer>

      </Container>
    </section>
  );
}

export default LearningPaths;
