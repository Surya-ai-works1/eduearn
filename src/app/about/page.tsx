"use client";

import React from "react";
import Link from "next/link";
import { Container } from "../../components/layout/Container";
import { PageWrapper } from "../../components/layout/PageWrapper";
import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Award, Users, BookOpen, Clock, Heart, ShieldCheck, Milestone } from "lucide-react";

export default function AboutUsPage() {
  const stats = [
    { label: "Active Learners", value: "24,000+", icon: <Users size={16} className="text-primary" /> },
    { label: "Verified Tutors", value: "1,200+", icon: <ShieldCheck size={16} className="text-accent" /> },
    { label: "Courses Published", value: "4,500+", icon: <BookOpen size={16} className="text-emerald-500" /> },
    { label: "Hours Learned", value: "120K+", icon: <Clock size={16} className="text-amber-500" /> },
  ];

  const milestones = [
    { year: "2024 Q3", title: "EduEarn Project Conceived", desc: "First design system and wireframe outlines coded to support student tutor directories." },
    { year: "2025 Q1", title: "Alpha Prototype Release", desc: "Alpha assessment tests launched with mock course catalogs and student wallets." },
    { year: "2025 Q4", title: "10K Students Milestone", desc: "Successfully scaled registration databases to over 10,000 active learners." },
    { year: "2026 Q2", title: "Premium Homepage Release", desc: "Phased rollout of premium categories grids, responsive syllabi, and tutor listings." },
  ];

  const team = [
    { name: "Surya Prakash", role: "Founding Engineer & Architect", desc: "Builds responsive pages and UI frameworks using Next.js 15 & Tailwind." },
    { name: "Gemini", role: "AI Assistant Developer", desc: "Generates mock databases, refactors type schemas, and resolves linter warnings." },
  ];

  return (
    <PageWrapper>
      {/* Header section */}
      <section className="w-full py-12 bg-muted/20 border-b border-border/40 text-left select-none">
        <Container className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-semibold">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <span>/</span>
            <span className="text-foreground">About Us</span>
          </div>

          <div className="flex flex-col gap-2 mt-1">
            <h1 className="text-3xl md:text-4xl font-heading font-extrabold text-foreground tracking-tight">
              Platform Mission &amp; Vision
            </h1>
            <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
              {"EduEarn is a peer-learning network enabling school & college students to learn subjects, teach peers, and earn income."}
            </p>
          </div>
        </Container>
      </section>

      {/* Stats Counter Section */}
      <section className="w-full py-12 select-none border-b border-border/30 text-left">
        <Container>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, idx) => (
              <Card key={idx} variant="glass" className="p-5 border-border bg-card text-center flex flex-col items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-muted border border-border/60 flex items-center justify-center shrink-0">
                  {stat.icon}
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-heading font-extrabold text-foreground">{stat.value}</span>
                  <span className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider mt-0.5">{stat.label}</span>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Story & Core Pillars */}
      <section className="w-full py-16 select-none text-left">
        <Container className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Story left column */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <h3 className="text-lg font-heading font-extrabold text-foreground">
              Our Journey
            </h3>
            
            <p className="text-xs text-muted-foreground leading-relaxed">
              {"Traditional learning platforms are built around corporate tutors charging heavy fees. EduEarn flips the model: peer-to-peer student instruction. A college junior who recently mastered Vector Calculus is the absolute best mentor to teach a high school sophomore. By keeping education student-led, learning remains highly interactive, affordable, and actionable."}
            </p>

            <p className="text-xs text-muted-foreground leading-relaxed mt-1">
              {"Since our initial prototype layouts, we have focused on building tools like dynamic calendar links, direct UPI payouts, and AI validated tutor assessments, ensuring that quality education remains accessible to all learners globally."}
            </p>

            {/* Core Values grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <Card variant="default" className="p-5 border-border bg-card text-left flex items-start gap-3">
                <Award size={15} className="text-primary shrink-0 mt-0.5" />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-foreground">Learn &amp; Excel</span>
                  <p className="text-[9px] text-muted-foreground mt-1 leading-normal">
                    Get custom study materials and test prep files designed by student peers.
                  </p>
                </div>
              </Card>

              <Card variant="default" className="p-5 border-border bg-card text-left flex items-start gap-3">
                <Heart size={15} className="text-red-500 shrink-0 mt-0.5" />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-foreground">Teach &amp; Earn</span>
                  <p className="text-[9px] text-muted-foreground mt-1 leading-normal">
                    Create courses based on your skills, manage calendars, and earn 85% payouts.
                  </p>
                </div>
              </Card>
            </div>
          </div>

          {/* Platform Timeline right column */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <h3 className="text-lg font-heading font-extrabold text-foreground flex items-center gap-1.5">
              <Milestone size={18} className="text-primary" />
              Startup Milestones
            </h3>
            
            <div className="relative border-l border-border/80 pl-6 ml-2 flex flex-col gap-6">
              {milestones.map((mil, idx) => (
                <div key={idx} className="relative text-xs text-left">
                  {/* Timeline dot */}
                  <span className="absolute -left-[30px] top-1 w-2.5 h-2.5 rounded-full bg-primary border-2 border-card" />
                  
                  <Badge variant="primary" className="text-[8px] font-extrabold px-1.5 py-0">
                    {mil.year}
                  </Badge>
                  <h5 className="font-extrabold text-foreground mt-1.5">
                    {mil.title}
                  </h5>
                  <p className="text-[10px] text-muted-foreground leading-relaxed mt-1">
                    {mil.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </Container>
      </section>

      {/* Team Placeholders grid */}
      <section className="w-full py-12 bg-muted/10 border-t border-border/40 select-none text-left">
        <Container className="flex flex-col gap-8">
          <div className="text-center max-w-lg mx-auto">
            <h3 className="text-lg font-heading font-extrabold text-foreground">
              Core Engineering Team
            </h3>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              {"Meet the developers behind the Next.js layouts, components, and type-checks compiler operations."}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-2xl mx-auto w-full">
            {team.map((mem, idx) => (
              <Card key={idx} variant="default" className="p-6 border-border bg-card text-center flex flex-col items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-sm text-primary">
                  {mem.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-xs font-heading font-extrabold text-foreground">{mem.name}</h4>
                  <span className="text-[9px] uppercase tracking-wider font-extrabold text-primary bg-primary/10 px-2 py-0.5 rounded inline-block mt-1">
                    {mem.role}
                  </span>
                  <p className="text-[10px] text-muted-foreground leading-relaxed mt-3.5 max-w-xs">
                    {mem.desc}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </section>
    </PageWrapper>
  );
}
