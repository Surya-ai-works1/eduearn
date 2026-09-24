"use client";

import React, { use, useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Card, CourseCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  getFallbackCareerPath, 
  CareerPath,
  CAREER_PATHS
} from "@/constants/careerPathsData";
import { lmsDb } from "@/lib/lmsDb";
import { CareerHero } from "@/app/career-paths/[id]/components/CareerHero";
import { 
  ArrowLeft, 
  ArrowRight, 
  Clock, 
  TrendingUp, 
  Award, 
  CheckCircle, 
  Code, 
  Briefcase, 
  HelpCircle,
  Play,
  Layers,
  ChevronDown,
  Info,
  Calendar,
  Sparkles,
  Percent,
  CheckSquare,
  Lock,
  MessageSquare,
  DollarSign,
  Users,
  Compass,
  Tv,
  GraduationCap,
  BookOpen,
  Map,
  Check,
  Bookmark,
  Users2,
  BookmarkCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CareerPathDetailPage({ params }: PageProps) {
  const { id } = use(params);
  
  const pathData = useMemo<CareerPath>(() => {
    return getFallbackCareerPath(id);
  }, [id]);

  const [dbCourses, setDbCourses] = useState<any[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const coursesSectionRef = useRef<HTMLDivElement>(null);
  const bundleSectionRef = useRef<HTMLDivElement>(null);

  // Load published courses
  useEffect(() => {
    async function loadCourses() {
      try {
        setLoadingCourses(true);
        const published = await lmsDb.getAllPublishedCourses();
        setDbCourses(published || []);
      } catch (err) {
        console.warn("Failed to fetch database courses", err);
        setDbCourses([]);
      } finally {
        setLoadingCourses(false);
      }
    }
    loadCourses();
  }, []);

  // Filter courses based on pathway keywords
  const recommendedCourses = useMemo(() => {
    if (!dbCourses || dbCourses.length === 0) return [];
    
    const keywords = pathData.recommendedKeywords.map(k => k.toLowerCase());
    
    return dbCourses.filter(course => {
      const title = course.title?.toLowerCase() || "";
      const cat = course.category?.toLowerCase() || "";
      return keywords.some(kw => title.includes(kw) || cat.includes(kw));
    });
  }, [dbCourses, pathData]);

  // Main course reference for bundle purchase link fallback
  const primaryCourseId = useMemo(() => {
    return recommendedCourses[0]?.id || "00000000-0000-4000-8000-000000000001";
  }, [recommendedCourses]);

  const scrollToCourses = () => {
    coursesSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToBundle = () => {
    bundleSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleBuyBundle = () => {
    toast.success(`Redirecting to secure checkout for the ${pathData.title} Track Bundle!`);
  };

  const handleBookmarkToggle = () => {
    setIsBookmarked(prev => {
      const next = !prev;
      if (next) {
        toast.success(`Bookmarked the ${pathData.title} Pathway!`);
      } else {
        toast.info(`Removed bookmark for ${pathData.title} Pathway.`);
      }
      return next;
    });
  };

  // Readiness checklist calculations
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({});

  const toggleChecklist = (item: string) => {
    setCompletedItems(prev => ({
      ...prev,
      [item]: !prev[item]
    }));
  };

  const readinessScore = useMemo(() => {
    const total = pathData.readinessChecklist.length;
    if (total === 0) return 0;
    const completed = Object.values(completedItems).filter(Boolean).length;
    return Math.round((completed / total) * 100);
  }, [completedItems, pathData]);

  return (
    <PageWrapper>
      {/* SECTION 1: Career Hero */}
      <CareerHero pathData={pathData} onBookmarkToggle={handleBookmarkToggle} isBookmarked={isBookmarked} scrollToCourses={scrollToCourses} scrollToBundle={scrollToBundle} />

      {/* NEW SECTION 1: Why Learn with EduEarn? */}
      <section className="w-full py-16 border-b border-border/40 select-none text-left bg-muted/5">
        <Container className="space-y-10">
          <div className="space-y-2 text-center">
            <span className="text-[10px] uppercase tracking-widest font-extrabold text-primary">Platform Values</span>
            <h2 className="text-2xl md:text-3xl font-heading font-extrabold text-foreground">Why Learn with EduEarn?</h2>
            <p className="text-xs text-muted-foreground max-w-xl mx-auto">
              Our unique educational ecosystem focuses on outcomes, mentoring, and dynamic earnings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card variant="default" className="p-6 border-border bg-card shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Compass size={20} />
              </div>
              <h4 className="text-xs font-heading font-extrabold text-foreground">Career-Focused Learning</h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Rather than studying isolated random courses, follow structured pathways mapped directly to job roles.
              </p>
            </Card>

            <Card variant="default" className="p-6 border-border bg-card shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Sparkles size={20} />
              </div>
              <h4 className="text-xs font-heading font-extrabold text-foreground">AI Tutor Assistance</h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Get instant conceptual explanations, sandbox code debugging guidance, and mock feedback 24/7.
              </p>
            </Card>

            <Card variant="default" className="p-6 border-border bg-card shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Users size={20} />
              </div>
              <h4 className="text-xs font-heading font-extrabold text-foreground">Ecosystem: Learn → Teach → Earn</h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Graduate to become a verified tutor, publish your own modules, review assignments, and earn payouts.
              </p>
            </Card>
          </div>
        </Container>
      </section>

      {/* SECTION 2: What Does This Career Do? */}
      <section className="w-full py-16 border-b border-border/40 select-none text-left">
        <Container className="max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-8 space-y-4">
            <div className="space-y-2">
              <span className="text-[10px] uppercase tracking-widest font-extrabold text-primary">Career Scope</span>
              <h2 className="text-2xl font-heading font-extrabold text-foreground">What does this career involve?</h2>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {pathData.involves}
            </p>
          </div>
          <div className="md:col-span-4 p-5 bg-muted/20 border border-border/50 rounded-2xl space-y-3">
            <span className="text-[9px] uppercase font-bold text-foreground block">Key Deliverables</span>
            <ul className="text-[10px] text-muted-foreground space-y-2 font-medium">
              <li className="flex items-center gap-2">
                <CheckCircle size={12} className="text-primary" /> Solve complex structural problems
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle size={12} className="text-primary" /> Build production automation APIs
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle size={12} className="text-primary" /> Scale cloud SaaS integrations
              </li>
            </ul>
          </div>
        </Container>
      </section>

      {/* SECTION 3: Who Should Choose This Career? */}
      <section className="w-full py-16 bg-muted/10 border-b border-border/40 select-none text-left">
        <Container className="max-w-4xl space-y-8">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-[10px] uppercase tracking-widest font-extrabold text-primary">Target Match</span>
            <h2 className="text-2xl font-heading font-extrabold text-foreground">Who should choose this career?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pathData.suitableFor.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 p-4 bg-card border border-border/60 rounded-2xl shadow-sm hover:border-primary/20 transition duration-300">
                <CheckCircle className="text-emerald-500 shrink-0 mt-0.5" size={16} />
                <span className="text-xs font-semibold text-foreground leading-normal">{item}</span>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* SECTION 4 & 5: Career Readiness & Prerequisites */}
      <section className="w-full py-16 border-b border-border/40 select-none text-left">
        <Container className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Readiness Checklist */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <span className="text-[10px] uppercase tracking-widest font-extrabold text-primary">Skill Assessment</span>
              <h2 className="text-2xl font-heading font-extrabold text-foreground">Career Readiness Checklist</h2>
              
              <div className="p-3.5 bg-primary/5 border border-primary/10 rounded-xl text-[10px] text-white/90 leading-normal flex items-start gap-2">
                <Info size={14} className="text-primary shrink-0 mt-0.5" />
                <p>
                  <strong>No Experience Required:</strong> You do not need to know everything before starting. This score is only to help you understand your current preparation and align syllabus starting points. Complete beginners are welcome!
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {pathData.readinessChecklist.map((item, idx) => {
                const checked = !!completedItems[item];
                return (
                  <div 
                    key={idx}
                    onClick={() => toggleChecklist(item)}
                    className={`flex items-center justify-between p-4 border rounded-2xl cursor-pointer select-none transition-all duration-200 ${checked ? "bg-primary/5 border-primary/40 shadow-sm" : "bg-card border-border hover:border-border-hover"}`}
                  >
                    <span className="text-xs font-semibold text-foreground">{item}</span>
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${checked ? "bg-primary border-primary text-white" : "border-border/80 bg-muted/20"}`}>
                      {checked && <CheckSquare size={13} />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Readiness Score & Prerequisites */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Score Card */}
            <Card variant="glass" className="p-6 border-border/60 bg-card/60 flex flex-col gap-4 justify-center items-center text-center shadow-premium">
              <span className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground">Overall Readiness Score</span>
              
              <div className="relative w-32 h-32 flex items-center justify-center">
                {/* SVG Progress Ring */}
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="64" cy="64" r="54" className="stroke-muted-foreground/15 fill-transparent" strokeWidth="10" />
                  <circle 
                    cx="64" 
                    cy="64" 
                    r="54" 
                    className="stroke-primary fill-transparent transition-all duration-500 ease-out" 
                    strokeWidth="10" 
                    strokeDasharray={2 * Math.PI * 54}
                    strokeDashoffset={2 * Math.PI * 54 * (1 - readinessScore / 100)}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute text-2xl font-heading font-black text-foreground">{readinessScore}%</span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-extrabold text-foreground block">Dashboard Guidance Note</span>
                <p className="text-[9px] text-muted-foreground/80 leading-normal max-w-xs">
                  This score acts as personal career guidance. The rating updates automatically as you complete relevant dashboard lessons and capstones.
                </p>
              </div>
            </Card>

            {/* Prerequisites banner */}
            <Card variant="default" className="p-5 border-border bg-card shadow-sm flex items-start gap-3">
              <Lock className="text-amber-500 shrink-0 mt-0.5" size={16} />
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-foreground block">Career Prerequisites</span>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {pathData.prerequisites}
                </p>
              </div>
            </Card>

          </div>

        </Container>
      </section>

      {/* NEW SECTION 2: Career Journey Ecosystem */}
      <section className="w-full py-16 border-b border-border/40 select-none text-left bg-muted/5">
        <Container className="space-y-10">
          <div className="space-y-2 text-center">
            <span className="text-[10px] uppercase tracking-widest font-extrabold text-primary">Student Flow</span>
            <h2 className="text-2xl md:text-3xl font-heading font-extrabold text-foreground">Your Educational Career Journey</h2>
            <p className="text-xs text-muted-foreground max-w-xl mx-auto">
              Follow this verified pipeline to go from career discovery to a verified tutor generating revenue.
            </p>
          </div>

          {/* Timeline Pipeline */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {[
              { title: "1. Discovery", desc: "Explore Portal Details" },
              { title: "2. Purchase", desc: "Enroll in Bundle Track" },
              { title: "3. Lectures", desc: "Complete Core Syllabus" },
              { title: "4. Sandbox", desc: "Build Portfolio Projects" },
              { title: "5. Graduating", desc: "Earn Verified Certificate" },
              { title: "6. Earning", desc: "Apply to Teach & Earn" }
            ].map((step, idx) => (
              <div key={idx} className="p-4 bg-card border border-border/80 rounded-2xl relative shadow-soft space-y-1 flex flex-col justify-between">
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-primary uppercase block">Step {idx + 1}</span>
                  <h4 className="text-[10px] font-heading font-extrabold text-foreground leading-snug">{step.title}</h4>
                  <p className="text-[9px] text-muted-foreground leading-normal">{step.desc}</p>
                </div>
                {idx < 5 && (
                  <div className="absolute right-[-8px] top-1/2 transform -translate-y-1/2 z-20 text-muted-foreground hidden md:block">
                    <ArrowRight size={14} className="text-border" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* NEW SECTION 3: Study Plan Paces */}
      <section className="w-full py-16 border-b border-border/40 select-none text-left">
        <Container className="space-y-8">
          <div className="space-y-2 text-center">
            <span className="text-[10px] uppercase tracking-widest font-extrabold text-primary">Flexible Learning</span>
            <h2 className="text-2xl font-heading font-extrabold text-foreground">Suggested Study Paces</h2>
            <p className="text-xs text-muted-foreground">Select a pace that aligns best with your current work or college schedule.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { pace: "Casual", hours: "3-5 Hours / Week", duration: "8 Months Target", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
              { pace: "Regular (Recommended)", hours: "8-10 Hours / Week", duration: "4 Months Target", color: "bg-primary/10 text-primary border-primary/20" },
              { pace: "Intensive", hours: "15+ Hours / Week", duration: "2 Months Target", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" }
            ].map((plan, idx) => (
              <Card key={idx} variant="default" className="p-6 border-border bg-card flex flex-col justify-between h-full hover:border-primary/20 transition-all duration-300">
                <div className="space-y-4">
                  <Badge variant="secondary" className={`text-[8px] font-extrabold uppercase px-2.5 py-0.5 ${plan.color}`}>{plan.pace}</Badge>
                  <h4 className="text-xs font-heading font-black text-foreground">{plan.hours}</h4>
                  <p className="text-[10px] text-muted-foreground leading-normal">Ideal for balancing with other commitments.</p>
                </div>
                <div className="mt-6 pt-4 border-t border-border/40 text-[10px] font-bold text-foreground">
                  Est. Completion: {plan.duration}
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* SECTION 6 & 7: Skills & Tools */}
      <section className="w-full py-16 bg-muted/10 border-b border-border/40 select-none text-left">
        <Container className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Skills Breakdown */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <span className="text-[10px] uppercase tracking-widest font-extrabold text-primary">Syllabus Breakdown</span>
              <h2 className="text-2xl font-heading font-extrabold text-foreground">Skills You&apos;ll Learn</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {pathData.skills.map((skillGroup, idx) => (
                <div key={idx} className="border border-border/60 rounded-2xl overflow-hidden bg-card shadow-sm">
                  <div className="p-3 bg-muted/30 border-b border-border/40 font-heading font-extrabold text-[11px] text-foreground flex justify-between items-center">
                    <span>{skillGroup.category}</span>
                    <Badge variant="secondary" className="text-[8px] px-2 py-0.5 font-bold">{skillGroup.list.length} Items</Badge>
                  </div>
                  <div className="p-3.5 flex flex-wrap gap-1.5">
                    {skillGroup.list.map((skill, sIdx) => (
                      <span key={sIdx} className="text-[9px] bg-muted/50 text-muted-foreground font-bold px-2 py-0.5 rounded-lg border border-border/30">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tools Grid */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-2">
              <span className="text-[10px] uppercase tracking-widest font-extrabold text-primary">Tooling Integration</span>
              <h2 className="text-2xl font-heading font-extrabold text-foreground">Tools You&apos;ll Master</h2>
            </div>
            
            <Card variant="glass" className="p-6 border-border/60 bg-card/60 flex flex-wrap gap-2.5 shadow-sm">
              {pathData.tools.map((tool, idx) => (
                <div key={idx} className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/40 border border-border/40 rounded-xl shadow-soft">
                  <Code size={12} className="text-primary" />
                  <span className="text-[10px] font-extrabold text-foreground">{tool}</span>
                </div>
              ))}
            </Card>
          </div>

        </Container>
      </section>

      {/* SECTION 8: Projects You'll Build */}
      <section className="w-full py-16 border-b border-border/40 select-none text-left">
        <Container className="space-y-8">
          <div className="space-y-2 text-center">
            <span className="text-[10px] uppercase tracking-widest font-extrabold text-primary">Hands-on Sandbox</span>
            <h2 className="text-2xl md:text-3xl font-heading font-extrabold text-foreground">Projects You&apos;ll Build</h2>
            <p className="text-xs text-muted-foreground max-w-xl mx-auto">
              Construct complex, resume-ready codebase capstones. Every project is fully verified by industry mentors.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pathData.projects.map((project, idx) => (
              <Card key={idx} variant="default" className="p-6 border-border bg-card flex flex-col justify-between h-full group hover:shadow-lg transition">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Badge variant="secondary" className="text-[9px] font-extrabold uppercase">{project.difficulty}</Badge>
                    <span className="text-[8px] font-black uppercase text-amber-500 flex items-center gap-1">
                      <Sparkles size={11} /> Project {idx + 1}
                    </span>
                  </div>

                  <h4 className="text-sm font-heading font-extrabold text-foreground leading-tight">{project.title}</h4>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{project.desc}</p>
                  
                  <div className="flex flex-wrap gap-1 pt-1">
                    {project.skills.map((sk, sIdx) => (
                      <span key={sIdx} className="text-[8px] bg-muted/80 text-muted-foreground font-bold px-2 py-0.5 rounded">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-border/40 space-y-2">
                  <div className="text-[9px] text-muted-foreground">
                    <strong className="text-foreground uppercase tracking-wider block mb-0.5 text-[8px]">Recruiter Value</strong>
                    {project.recruiterValue}
                  </div>
                  <div className="text-[9px] text-muted-foreground">
                    <strong className="text-foreground uppercase tracking-wider block mb-0.5 text-[8px]">Portfolio Value</strong>
                    {project.portfolioValue}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* SECTION 9: Career Roadmap Timeline */}
      <section className="w-full py-16 bg-muted/10 border-b border-border/40 select-none text-left">
        <Container className="max-w-3xl space-y-10">
          <div className="space-y-2 text-center">
            <span className="text-[10px] uppercase tracking-widest font-extrabold text-primary">Syllabus Chronology</span>
            <h2 className="text-2xl font-heading font-extrabold text-foreground">Timeline Learning Roadmap</h2>
            <p className="text-xs text-muted-foreground">Your week-by-week blueprint mapped directly to industry milestones.</p>
          </div>

          <div className="relative pl-6 border-l-2 border-border/80 space-y-8 max-w-xl mx-auto">
            {pathData.roadmap.map((step, idx) => (
              <div key={idx} className="relative group">
                {/* Marker Dot */}
                <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-card border-2 border-primary z-10 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] uppercase tracking-wider font-extrabold text-primary">Phase {idx + 1}</span>
                  <p className="text-xs font-extrabold text-foreground leading-tight group-hover:text-primary transition-colors">{step}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* SECTION 10, 11 & 12: Outcomes, Salary, Why Companies Hire */}
      <section className="w-full py-16 border-b border-border/40 select-none text-left">
        <Container className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Opportunities and Roles */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-2">
              <span className="text-[10px] uppercase tracking-widest font-extrabold text-primary">Target Job Titles</span>
              <h2 className="text-2xl font-heading font-extrabold text-foreground">Career Outcomes</h2>
              <p className="text-xs text-muted-foreground">Qualify for these highly sought-after industry positions.</p>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {pathData.opportunities.map((role, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-card border border-border/50 rounded-xl shadow-soft">
                  <Briefcase size={14} className="text-primary" />
                  <span className="text-xs font-bold text-foreground">{role}</span>
                </div>
              ))}
            </div>

            <div className="space-y-3 pt-4 border-t border-border/40">
              <span className="text-[9px] uppercase tracking-wider font-bold text-foreground block">Why Companies Hire This Role</span>
              <ul className="text-[10px] text-muted-foreground space-y-2 font-medium">
                {pathData.whyCompaniesHire.map((reason, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle size={12} className="text-primary shrink-0 mt-0.5" />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Salary progression */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-2">
              <span className="text-[10px] uppercase tracking-widest font-extrabold text-primary">Salary Insights</span>
              <h2 className="text-2xl font-heading font-extrabold text-foreground">Estimated Compensation</h2>
              <p className="text-xs text-muted-foreground">Compensation guidelines structured across professional experience ranges.</p>
            </div>

            <Card variant="glass" className="p-6 border-border/60 bg-card/60 space-y-4 shadow-sm">
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-foreground">
                  <span>Entry Level</span>
                  <span>{pathData.salaryInsights.entry}</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500" style={{ width: "30%" }} />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-foreground">
                  <span>Mid Level</span>
                  <span>{pathData.salaryInsights.mid}</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500" style={{ width: "60%" }} />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-foreground">
                  <span>Senior Track</span>
                  <span>{pathData.salaryInsights.senior}</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: "95%" }} />
                </div>
              </div>
              <p className="text-[9px] text-muted-foreground/80 leading-normal flex items-start gap-1 pt-2 border-t border-border/40">
                <Info size={11} className="shrink-0 mt-0.5 text-primary" />
                <span>Estimated ranges are approximate. Actual compensations vary widely based on geographical location, corporate size, experience, and current hiring conditions.</span>
              </p>
            </Card>
          </div>

        </Container>
      </section>

      {/* SECTION 13: Portfolio & Career Outcomes Checklist */}
      <section className="w-full py-16 bg-muted/10 border-b border-border/40 select-none text-left">
        <Container className="max-w-4xl space-y-8">
          <div className="space-y-2 text-center">
            <span className="text-[10px] uppercase tracking-widest font-extrabold text-primary">Student Deliverables</span>
            <h2 className="text-2xl font-heading font-extrabold text-foreground">Portfolio & Graduation Outcomes</h2>
            <p className="text-xs text-muted-foreground">Every graduate completes this structured career toolkit checklist.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              "Production Portfolio Website",
              "Resume-ready Project Codebases",
              "Polished GitHub Profile",
              "Verifiable Course Certificates",
              "Mock Interview Preparations",
              "Vetted Technical Skills",
              "Confidence to Apply for Jobs"
            ].map((outcome, idx) => (
              <div key={idx} className="p-4 bg-card border border-border/50 rounded-2xl flex items-center gap-3 shadow-soft">
                <CheckCircle size={16} className="text-emerald-500 shrink-0" />
                <span className="text-xs font-bold text-foreground">{outcome}</span>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* NEW SECTION 4: Discussion & Support Community */}
      <section className="w-full py-16 border-b border-border/40 select-none text-left">
        <Container className="space-y-10">
          <div className="space-y-2 text-center">
            <span className="text-[10px] uppercase tracking-widest font-extrabold text-primary">Community Access</span>
            <h2 className="text-2xl md:text-3xl font-heading font-extrabold text-foreground">Student Support Community</h2>
            <p className="text-xs text-muted-foreground max-w-xl mx-auto">
              Never learn alone. All enrollments include lifetime entry into our dedicated learning guilds.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { title: "Discussion Community", desc: "Interact 24/7 in chat guilds" },
              { title: "Mentor Q&A Channels", desc: "Weekly doubt-clearing sessions" },
              { title: "Project Showcases", desc: "Receive peer code audits" },
              { title: "Peer Study Rooms", desc: "Co-study with pathway cohorts" },
              { title: "SaaS Networking", desc: "Access hiring team portals" }
            ].map((item, idx) => (
              <div key={idx} className="p-4 bg-card border border-border/80 rounded-2xl shadow-soft space-y-1 flex flex-col justify-between">
                <div className="space-y-1">
                  <h4 className="text-[10px] font-heading font-black text-foreground leading-snug">{item.title}</h4>
                  <p className="text-[9px] text-muted-foreground leading-normal">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* NEW SECTION 5: Course Comparison Table */}
      <section className="w-full py-16 bg-muted/5 border-b border-border/40 select-none text-left">
        <Container className="space-y-8 max-w-4xl">
          <div className="space-y-2 text-center">
            <span className="text-[10px] uppercase tracking-widest font-extrabold text-primary">Compare Plans</span>
            <h2 className="text-2xl font-heading font-extrabold text-foreground">Individual Modules vs Career Bundle</h2>
            <p className="text-xs text-muted-foreground">Select the enrollment path that matches your budget and objectives.</p>
          </div>

          {/* Comparison Table */}
          <div className="overflow-x-auto rounded-2xl border border-border/80 bg-card shadow-soft">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/30 font-heading font-bold text-foreground">
                  <th className="p-4">Feature Metric</th>
                  <th className="p-4">Individual Modules</th>
                  <th className="p-4 text-primary">Complete Pathway Bundle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-muted-foreground">
                <tr>
                  <td className="p-4 font-bold text-foreground">Price Rate</td>
                  <td className="p-4">Standard pricing per course</td>
                  <td className="p-4 font-black text-foreground">₹{pathData.bundle.price}</td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-foreground">Savings</td>
                  <td className="p-4">0% Discount</td>
                  <td className="p-4 text-emerald-500 font-extrabold">Save 55% Today</td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-foreground">Verifiable Certificate</td>
                  <td className="p-4">Granted per course module</td>
                  <td className="p-4">Graduation Track Certificate</td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-foreground">Sandbox Projects</td>
                  <td className="p-4">Limited projects</td>
                  <td className="p-4">All Capstone Portfolios included</td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-foreground">Mentor Q&A Sessions</td>
                  <td className="p-4">Basic discussion forums</td>
                  <td className="p-4">Full doubt-solving access</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Container>
      </section>

      {/* SECTION 14: Recommended Courses */}
      <section ref={coursesSectionRef} className="w-full py-16 border-b border-border/40 select-none text-left">
        <Container className="space-y-8">
          <div className="space-y-2 text-center">
            <span className="text-[10px] uppercase tracking-widest font-extrabold text-primary">Syllabus Curriculum</span>
            <h2 className="text-2xl md:text-3xl font-heading font-extrabold text-foreground">Recommended Learning Modules</h2>
            <p className="text-xs text-muted-foreground">Only published, verified course modules are recommended below.</p>
          </div>

          {loadingCourses ? (
            <div className="py-12 flex justify-center items-center gap-2">
              <span className="w-4 h-4 border-2 border-t-transparent border-primary rounded-full animate-spin" />
              <span className="text-xs font-bold text-muted-foreground animate-pulse">Loading recommended modules...</span>
            </div>
          ) : recommendedCourses.length === 0 ? (
            <div className="py-16 text-center border border-dashed border-border/80 rounded-3xl bg-card max-w-md mx-auto space-y-4 shadow-soft">
              <HelpCircle size={32} className="text-primary mx-auto animate-bounce" />
              <div className="space-y-1 px-4">
                <p className="text-xs font-extrabold text-foreground">No courses available yet.</p>
                <p className="text-[10px] text-muted-foreground/80 leading-normal max-w-xs mx-auto">
                  Our curriculum experts are currently designing modules for this pathway. Bookmarking this page will keep you updated!
                </p>
              </div>
              <button 
                onClick={handleBookmarkToggle}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-[9px] font-heading font-black uppercase tracking-wider bg-primary text-primary-foreground rounded-full shadow hover:bg-primary-hover transition cursor-pointer"
              >
                {isBookmarked ? "Bookmarked Pathway" : "Bookmark Pathway"}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recommendedCourses.map((course) => (
                <div key={course.id} className="relative flex flex-col justify-between bg-card border border-border rounded-3xl overflow-hidden shadow-soft group h-full">
                  <div className="grow">
                    <CourseCard
                      id={course.id}
                      title={course.title}
                      tutorName={course.tutorName || course.instructor || "Instructor"}
                      category={course.category}
                      price={course.price}
                      rating={course.rating || 4.7}
                      duration={course.duration || "10 hours"}
                      lessonsCount={course.lessonsCount}
                      studentsCount={course.studentsCount || 120}
                      isAiVerified={course.isAiVerified ?? true}
                      imageSrc={course.imageSrc || course.thumbnailUrl}
                    />
                  </div>
                  <div className="p-4 pt-0 bg-card border-t border-border/40">
                    <Link href={`/checkout?courseId=${course.id}&amount=${course.price}&tutorId=${course.tutorId || "tutor-1"}`} className="block w-full">
                      <Button variant="outline" size="sm" className="w-full font-bold uppercase tracking-wider text-[9px] h-9">
                        Buy Individual Course
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Container>
      </section>

      {/* SECTION 15 & 16: Bundle Offer & Live Mentor Support */}
      <section ref={bundleSectionRef} className="w-full py-16 bg-muted/10 border-b border-border/40 select-none text-left">
        <Container className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Bundle offer card */}
          <div className="lg:col-span-7">
            <Card variant="glass" className="p-6 border-primary/20 bg-card/85 shadow-premium space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-primary/10 border-b border-l border-primary/20 px-3 py-1 rounded-bl-xl text-[8px] uppercase tracking-wider font-extrabold text-primary flex items-center gap-1">
                <Sparkles size={10} /> Track Bundle
              </div>

              <div className="space-y-2">
                <span className="text-[9px] uppercase tracking-wider font-extrabold text-primary">Save 55% Today</span>
                <h3 className="text-xl md:text-2xl font-heading font-black text-foreground">{pathData.bundle.title}</h3>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Secure full lifetime credentials access to all recommended modules for this career path inside a single transaction checkout.
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-[8px] uppercase tracking-wider font-bold text-muted-foreground">Included Courses</span>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] font-semibold text-foreground">
                  {pathData.bundle.courses.map((cName, idx) => (
                    <li key={idx} className="flex items-center gap-1.5">
                      <CheckCircle size={12} className="text-primary shrink-0" />
                      <span className="truncate">{cName}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-end justify-between gap-4 pt-4 border-t border-border/40">
                <div className="flex flex-col">
                  <span className="text-[9px] text-muted-foreground line-through">Original: ₹{pathData.bundle.originalPrice}</span>
                  <span className="text-2xl font-heading font-black text-foreground">₹{pathData.bundle.price}</span>
                </div>
                
                <Link href={`/checkout?courseId=${primaryCourseId}&planId=Complete%20Career%20Bundle&amount=${pathData.bundle.price}`}>
                  <Button onClick={handleBuyBundle} size="lg" className="font-heading font-bold shadow-soft flex items-center gap-1.5">
                    Buy Pathway Bundle <ArrowRight size={15} />
                  </Button>
                </Link>
              </div>
            </Card>
          </div>

          {/* Mentorship explanation */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-2">
              <span className="text-[10px] uppercase tracking-widest font-extrabold text-primary">Live Mentorship</span>
              <h2 className="text-2xl font-heading font-extrabold text-foreground">Live Doubt-Solving</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                All recorded syllabus curriculum programs package complete self-paced assets alongside designated interactive doubt-solving support.
              </p>
            </div>

            <Card variant="glass" className="p-4 border-border/50 bg-card/40 text-[10px] space-y-2.5 font-semibold text-muted-foreground">
              <div className="flex items-center gap-2 text-foreground font-extrabold">
                <Calendar size={13} className="text-primary" /> One Scheduled Live Q&A Session per week
              </div>
              <p className="leading-relaxed">
                Interact live with campus mentors to clear learning bottlenecks, inspect assignment logs, and align sandbox files.
              </p>
              <p className="text-[9px] leading-normal text-muted-foreground/80 border-t border-border/40 pt-2 font-medium">
                * Note: Live Mentor Doubt Sessions are specifically structured for weekly concept alignments and troubleshooting. Daily live classroom teaching is not provided.
              </p>
            </Card>
          </div>

        </Container>
      </section>

      {/* NEW SECTION 6: Testimonials reserved state */}
      <section className="w-full py-16 border-b border-border/40 select-none text-left">
        <Container className="max-w-xl text-center space-y-4 border border-dashed border-border/80 bg-card p-8 rounded-3xl shadow-soft">
          <Users2 size={32} className="text-primary mx-auto" />
          <div className="space-y-1">
            <span className="text-[9px] uppercase tracking-widest font-extrabold text-primary block">Student Success</span>
            <p className="text-xs font-bold text-foreground">Success Testimonials</p>
            <p className="text-[10px] text-muted-foreground/80 leading-normal max-w-xs mx-auto">
              Student success stories will appear here as learners complete this pathway.
            </p>
          </div>
        </Container>
      </section>

      {/* SECTION 17: FAQ Accordions */}
      <section className="w-full py-16 border-b border-border/40 select-none text-left">
        <Container className="max-w-3xl space-y-8">
          <div className="space-y-2 text-center">
            <span className="text-[10px] uppercase tracking-widest font-extrabold text-primary">Support FAQ</span>
            <h2 className="text-2xl md:text-3xl font-heading font-extrabold text-foreground">Frequently Asked Questions</h2>
            <p className="text-xs text-muted-foreground">Get answers to the most common queries regarding career learning tracks.</p>
          </div>

          <div className="space-y-3">
            {[
              {
                q: "Can complete beginners join?",
                a: "Yes, our recommended learning sequence starts with core fundamental programming principles before advancing to specialized modules."
              },
              {
                q: "Do I need coding knowledge beforehand?",
                a: "No prior coding background is required. We structure the prerequisites clearly for each pathway and start with zero-to-one concepts."
              },
              {
                q: "Will I receive mentor support?",
                a: "Yes, recorded lessons package dedicated online forums and weekly doubt-solving support sessions."
              },
              {
                q: "Can I learn while working?",
                a: "Absolutely. Our self-paced recorded syllabus dashboard is designed for flexible commitments. Choose our Casual study plan."
              },
              {
                q: "Do I get lifetime access?",
                a: "Yes. All purchases (individual or bundle) include full, unrestricted lifetime dashboard access."
              },
              {
                q: "Can I become a tutor later?",
                a: "Yes. Once you complete the pathway and graduations checks, you can apply to become a verified tutor inside the EduEarn ecosystem."
              }
            ].map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div key={idx} className="border border-border/80 rounded-2xl overflow-hidden bg-card shadow-soft transition">
                  <button 
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full p-4 text-left font-heading font-extrabold text-xs text-foreground flex justify-between items-center cursor-pointer select-none bg-muted/10 hover:bg-muted/20 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/45"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown size={14} className={`transform transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 border-t border-border/40 text-[11px] text-muted-foreground leading-relaxed">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* SECTION 18: Related Career Paths */}
      <section className="w-full py-16 bg-muted/5 select-none text-left">
        <Container className="space-y-8">
          <div className="space-y-2 text-center">
            <span className="text-[10px] uppercase tracking-widest font-extrabold text-primary">Discover More</span>
            <h2 className="text-2xl font-heading font-extrabold text-foreground">Related Career Paths</h2>
            <p className="text-xs text-muted-foreground">Recommend similar high-demand careers you might find interesting.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {pathData.relatedPaths.map((related) => {
              const fullRelated = CAREER_PATHS[related.id] || getFallbackCareerPath(related.id);
              return (
                <Link href={`/career-paths/${related.id}`} key={related.id} className="block group">
                  <Card variant="default" className="p-5 border-border bg-card flex flex-col justify-between h-full group-hover:border-primary/40 group-hover:shadow-md transition">
                    <div className="space-y-2.5">
                      <div className="flex justify-between items-center">
                        <Badge variant="secondary" className="text-[8px] font-extrabold uppercase">{fullRelated.level}</Badge>
                        <span className="text-[9px] text-muted-foreground font-semibold">{fullRelated.duration}</span>
                      </div>
                      <h4 className="text-xs font-heading font-black text-foreground group-hover:text-primary transition-colors">{fullRelated.title}</h4>
                      <p className="text-[10px] text-muted-foreground leading-relaxed truncate-2-lines">{fullRelated.description}</p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-border/40 flex justify-between items-center text-[9px] font-bold text-foreground">
                      <span>Salary: {fullRelated.salaryRange}</span>
                      <span className="text-primary flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                        Explore <ArrowRight size={10} />
                      </span>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </Container>
      </section>

    </PageWrapper>
  );
}
