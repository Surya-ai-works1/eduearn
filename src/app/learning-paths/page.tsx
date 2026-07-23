"use client";

import React from "react";
import Link from "next/link";
import { Container } from "../../components/layout/Container";
import { PageWrapper } from "../../components/layout/PageWrapper";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Divider } from "../../components/ui/divider";
import { StaggerContainer, staggerChildVariants } from "../../components/animations";
import { motion } from "framer-motion";
import {
  Code,
  BrainCircuit,
  Compass,
  Award,
  Clock,
  BookOpen,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

const PATHS_DATA = [
  {
    id: "fullstack",
    title: "Full-Stack Web Developer",
    icon: <Code size={20} className="text-primary" />,
    desc: "From basic HTML/CSS layouts to production-ready React applications and SQL/Node backend APIs.",
    duration: "4 Months",
    coursesCount: 5,
    skills: ["HTML5", "CSS3", "JavaScript", "React", "NodeJS", "SQL"],
    outcome: "Junior Frontend/Backend Developer",
  },
  {
    id: "ai-engineer",
    title: "AI & Prompt Engineer",
    icon: <BrainCircuit size={20} className="text-accent" />,
    desc: "Master LLM architectures, customized system prompt layouts, model parameters tuning, and API integrations.",
    duration: "3 Months",
    coursesCount: 4,
    skills: ["OpenAI API", "LangChain", "Vector DBs", "JSON Output Tuning"],
    outcome: "AI Solutions Integrator",
  },
  {
    id: "data-science",
    title: "Data Analyst Specialist",
    icon: <TrendingUp size={20} className="text-emerald-500" />,
    desc: "Clean spreadsheet databases, plot charts in Python matplotlib, and structure interactive SQL query sheets.",
    duration: "3 Months",
    coursesCount: 4,
    skills: ["Python", "Pandas", "SQL Queries", "Excel Dashboards"],
    outcome: "Junior Data Analyst",
  },
  {
    id: "ui-ux",
    title: "UI/UX Designer",
    icon: <Compass size={20} className="text-purple-500" />,
    desc: "Wireframe responsive layouts in Figma, set typography hierarchies, and test interactive prototype user flows.",
    duration: "2 Months",
    coursesCount: 3,
    skills: ["Figma Wireframes", "Design Systems", "Prototyping", "UX Interviews"],
    outcome: "Junior Product Designer",
  },
];

export default function LearningPathsPage() {
  return (
    <PageWrapper>
      {/* Header Banner */}
      <section className="w-full py-12 bg-muted/20 border-b border-border/40 text-left select-none">
        <Container className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-semibold">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <span>/</span>
            <span className="text-foreground">Learning Paths</span>
          </div>

          <div className="flex flex-col gap-2 mt-1">
            <h1 className="text-3xl md:text-4xl font-heading font-extrabold text-foreground tracking-tight">
              Syllabus Learning Pathways
            </h1>
            <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
              {"Curated sequence of peer courses designed by elite student mentors to take you from absolute beginner to career-ready portfolio outcomes."}
            </p>
          </div>
        </Container>
      </section>

      {/* Grid listing */}
      <section className="w-full py-16 select-none text-left">
        <Container>
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {PATHS_DATA.map((path) => (
              <motion.div key={path.id} variants={staggerChildVariants}>
                <Card
                  variant="default"
                  hoverEffect="lift"
                  className="p-6 border-border bg-card flex flex-col justify-between h-full group"
                >
                  <div className="flex flex-col gap-5">
                    {/* Top Row header */}
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-muted border border-border/60 flex items-center justify-center shrink-0">
                        {path.icon}
                      </div>

                      <div>
                        <h4 className="text-sm font-heading font-extrabold text-foreground leading-tight group-hover:text-primary transition-colors">
                          {path.title}
                        </h4>
                        
                        <div className="flex items-center gap-3.5 mt-1.5 text-[9px] text-muted-foreground font-extrabold uppercase tracking-wider">
                          <span className="flex items-center gap-1">
                            <Clock size={11} className="text-primary" />
                            {path.duration}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <BookOpen size={11} className="text-primary" />
                            {path.coursesCount} Courses
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                      {path.desc}
                    </p>

                    {/* Skill tags */}
                    <div className="flex flex-wrap gap-1 mt-1">
                      {path.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="text-[9px] font-bold bg-muted text-muted-foreground px-2 py-0.5 rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>

                    <Divider variant="dashed" className="my-1" />

                    {/* Career Outcomes indicators */}
                    <div className="flex items-start gap-2.5 text-[10px] text-muted-foreground">
                      <Award size={14} className="text-amber-500 shrink-0 mt-0.5" />
                      <div className="flex flex-col">
                        <span className="font-extrabold text-foreground">Career Outcome</span>
                        <span className="text-[9px] mt-0.5 font-medium">{path.outcome}</span>
                      </div>
                    </div>
                  </div>

                  {/* bottom action CTA */}
                  <div className="mt-8 flex justify-between items-center">
                    {/* Mock Progress */}
                    <div className="flex flex-col gap-1 items-start">
                      <span className="text-[8px] uppercase tracking-wider font-extrabold text-muted-foreground/80">Progress</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: "0%" }} />
                        </div>
                        <span className="text-[9px] font-bold text-muted-foreground">Not Started</span>
                      </div>
                    </div>
                    <Link href={`/learning-paths/${path.id}`}>
                      <Button size="sm" className="flex items-center gap-1 shadow-soft">
                        Start Pathway
                        <ArrowRight size={12} />
                      </Button>
                    </Link>                  </div>
                </Card>
              </motion.div>
            ))}
          </StaggerContainer>
        </Container>
      </section>
    </PageWrapper>
  );
}
