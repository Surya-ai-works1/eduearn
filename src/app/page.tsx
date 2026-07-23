"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { useRouter } from "next/navigation";

import { PageWrapper } from "../components/layout/PageWrapper";
import { HeroLayout } from "../components/layout/HeroLayout";
import { HeroIllustration } from "../components/layout/HeroIllustration";
import { Button } from "../components/ui/button";
import { Dialog } from "../components/ui/dialog";
// Homepage Sections (Phase 2.2)
import { TrustedBy } from "../components/layout/TrustedBy";
import { ExploreCategories } from "../components/layout/ExploreCategories";
import { FeaturedCourses } from "../components/layout/FeaturedCourses";
import { LearningPaths } from "../components/layout/LearningPaths";
import { StatsGrid } from "../components/layout/StatsGrid";
import { WhyEduEarn } from "../components/layout/WhyEduEarn";

// Homepage Sections (Phase 2.3)
import { TopTutors } from "../components/layout/TopTutors";
import { LiveClasses } from "../components/layout/LiveClasses";
import { AiFeatures } from "../components/layout/AiFeatures";
import { BecomeTutor } from "../components/layout/BecomeTutor";
import { SuccessStories } from "../components/layout/SuccessStories";
import { MobileAppPreview } from "../components/layout/MobileAppPreview";
import { FaqSection } from "../components/layout/FaqSection";
import { Newsletter } from "../components/layout/Newsletter";
import { useAuth } from "../hooks/useAuth";

import {
  HoverLift,
  FloatingAnimation,
  AnimatedCounter,
  RevealOnScroll,
} from "../components/animations";

export default function RootLandingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isDemoOpen, setIsDemoOpen] = useState(false);

  // Active index for headline words highlight cycling (0: Learn, 1: Teach, 2: Earn)
  const [activeHeadlineIndex, setActiveHeadlineIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveHeadlineIndex((prev) => (prev + 1) % 3);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // Left column smooth-cycling animated header
  const animatedTitle = (
    <div
      className="text-5xl md:text-6xl lg:text-7xl font-heading font-extrabold tracking-tight select-none leading-[1.05] flex flex-col items-start gap-1"
    >
      <span
        style={{
          transform: activeHeadlineIndex === 0 ? "translateX(6px) scale(1.025)" : "translateX(0px) scale(1)",
          filter: activeHeadlineIndex === 0 ? "brightness(1.15)" : "brightness(1)",
          transition: "transform 600ms cubic-bezier(0.4, 0, 0.2, 1), filter 600ms cubic-bezier(0.4, 0, 0.2, 1)",
          willChange: "transform, filter",
        }}
        className="text-blue-600 dark:text-blue-500 inline-block origin-left"
      >
        Learn.
      </span>
      <span
        style={{
          transform: activeHeadlineIndex === 1 ? "translateX(6px) scale(1.025)" : "translateX(0px) scale(1)",
          filter: activeHeadlineIndex === 1 ? "brightness(1.15)" : "brightness(1)",
          transition: "transform 600ms cubic-bezier(0.4, 0, 0.2, 1), filter 600ms cubic-bezier(0.4, 0, 0.2, 1)",
          willChange: "transform, filter",
        }}
        className="text-slate-900 dark:text-white inline-block origin-left"
      >
        Teach.
      </span>
      <span
        style={{
          transform: activeHeadlineIndex === 2 ? "translateX(6px) scale(1.025)" : "translateX(0px) scale(1)",
          filter: activeHeadlineIndex === 2 ? "brightness(1.15)" : "brightness(1)",
          transition: "transform 600ms cubic-bezier(0.4, 0, 0.2, 1), filter 600ms cubic-bezier(0.4, 0, 0.2, 1)",
          willChange: "transform, filter",
        }}
        className="text-emerald-600 dark:text-emerald-400 inline-block origin-left"
      >
        Earn.
      </span>
    </div>
  );

  // Floating badge widgets positioned around the hero illustration
  const floatingWidgets = (
    <div className="absolute inset-0 w-full h-full pointer-events-none z-20">

      {/* AI Verified Badge (Top-Left) */}
      <div className="absolute top-[5%] left-[-20px] sm:left-[-40px] pointer-events-auto">
        <FloatingAnimation duration={3.4} yRange={5}>
          <HoverLift lift={-4}>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-border/50 dark:border-border/50 shadow-sm text-slate-800 dark:text-white font-extrabold text-[10px]">
              <span className="text-emerald-500">✓</span>
              <span>AI Verified</span>
            </div>
          </HoverLift>
        </FloatingAnimation>
      </div>

      {/* Live Classes (Top-Right) */}
      <div className="absolute top-[2%] right-[-20px] sm:right-[-40px] pointer-events-auto">
        <FloatingAnimation duration={4.2} yRange={6}>
          <HoverLift lift={-4}>
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-border/50 dark:border-border/50 shadow-sm text-slate-800 dark:text-white font-extrabold text-[10px]">
              <span>🎥</span>
              <span>Live Classes</span>
            </div>
          </HoverLift>
        </FloatingAnimation>
      </div>

      {/* Tutor Earnings (Bottom-Left) */}
      <div className="absolute bottom-[20%] left-[-30px] sm:left-[-50px] pointer-events-auto">
        <FloatingAnimation duration={4.0} yRange={5}>
          <HoverLift lift={-4}>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-border/50 dark:border-border/50 shadow-sm text-slate-800 dark:text-white font-extrabold text-[10px]">
              <span>💰</span>
              <span>Tutor Earnings</span>
            </div>
          </HoverLift>
        </FloatingAnimation>
      </div>

      {/* Certificate Earned (Bottom-Right) */}
      <div className="absolute bottom-[8%] right-[-25px] sm:right-[-45px] pointer-events-auto">
        <FloatingAnimation duration={3.8} yRange={5}>
          <HoverLift lift={-4}>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-border/50 dark:border-border/50 shadow-sm text-slate-800 dark:text-white font-extrabold text-[10px]">
              <span>🏆</span>
              <span>Certificate Earned</span>
            </div>
          </HoverLift>
        </FloatingAnimation>
      </div>

    </div>
  );

  return (
    <div className="w-full relative min-h-screen bg-background text-foreground transition-colors duration-300 overflow-x-hidden">
      {/* 1. Landing Page Hero Grid */}
      <HeroLayout
        title={animatedTitle}
        subtitle="Learn from Students. Teach Students. Grow Together. India's AI-Powered Student-to-Student Learning Marketplace."
        illustration={<HeroIllustration />}
        floatingWidgets={floatingWidgets}
        ctas={
          <div className="flex flex-wrap items-center gap-3.5">
            <Button
              onClick={() => {
                router.push("/courses");
              }}
              size="md"
            >
              Explore Skills
            </Button>
            <Button
              onClick={() => {
                router.push("/become-tutor");
              }}
              variant="outline"
              size="md"
            >
              Become a Tutor
            </Button>
            <Button
              onClick={() => setIsDemoOpen(true)}
              variant="ghost"
              size="md"
              className="flex items-center gap-2 text-foreground font-bold hover:bg-muted"
            >
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                <Play size={10} className="fill-primary ml-0.5" />
              </div>
              Watch Demo
            </Button>
          </div>
        }
        statistics={[
          {
            value: (
              <span className="flex items-baseline">
                <AnimatedCounter value={5000} />+
              </span>
            ),
            label: "Learners",
          },
          {
            value: (
              <span className="flex items-baseline">
                <AnimatedCounter value={200} />+
              </span>
            ),
            label: "Tutors",
          },
          {
            value: (
              <span className="flex items-baseline">
                <AnimatedCounter value={250} />+
              </span>
            ),
            label: "Skill Categories",
          },
          {
            value: (
              <span className="flex items-baseline">
                <AnimatedCounter value={150} />+
              </span>
            ),
            label: "Live Classes",
          },
        ]}
      />

      {/* 2. Trusted By logo wall */}
      <RevealOnScroll direction="fade" delay={0.1}>
        <TrustedBy />
      </RevealOnScroll>

      {/* 3. Explore Categories Grid */}
      <RevealOnScroll direction="up" delay={0.15}>
        <ExploreCategories />
      </RevealOnScroll>

      {/* 4. Featured Courses catalog */}
      <RevealOnScroll direction="up" delay={0.15}>
        <FeaturedCourses />
      </RevealOnScroll>

      {/* 5. Learning Paths roadmaps */}
      <RevealOnScroll direction="up" delay={0.15}>
        <LearningPaths />
      </RevealOnScroll>

      {/* 6. Top-Rated Tutors Grid */}
      <RevealOnScroll direction="up" delay={0.15}>
        <TopTutors />
      </RevealOnScroll>

      {/* 7. Live Classes Doubt Sessions */}
      <RevealOnScroll direction="up" delay={0.15}>
        <LiveClasses />
      </RevealOnScroll>

      {/* 8. AI Innovation Capabilities */}
      <RevealOnScroll direction="up" delay={0.15}>
        <AiFeatures />
      </RevealOnScroll>

      {/* 9. Become a Tutor CTA */}
      {user?.role !== "tutor" && (
        <RevealOnScroll direction="up" delay={0.15}>
          <BecomeTutor />
        </RevealOnScroll>
      )}

      {/* 10. Success Stories Testimonials */}
      <RevealOnScroll direction="fade" delay={0.1}>
        <SuccessStories />
      </RevealOnScroll>

      {/* 11. Stats Achievements counters */}
      <RevealOnScroll direction="fade" delay={0.1}>
        <StatsGrid />
      </RevealOnScroll>

      {/* 12. Why Choose EduEarn Feature Grid */}
      <RevealOnScroll direction="up" delay={0.15}>
        <WhyEduEarn />
      </RevealOnScroll>

      {/* 13. Mobile App Preview mockup */}
      <RevealOnScroll direction="up" delay={0.15}>
        <MobileAppPreview />
      </RevealOnScroll>

      {/* 14. Interactive FAQ Accordion */}
      <RevealOnScroll direction="up" delay={0.15}>
        <FaqSection />
      </RevealOnScroll>

      {/* 15. Newsletter Subscribe Card */}
      <RevealOnScroll direction="fade" delay={0.1}>
        <Newsletter />
      </RevealOnScroll>

      {/* Watch Demo Mock Dialog Popup */}
      <Dialog
        isOpen={isDemoOpen}
        onClose={() => setIsDemoOpen(false)}
        title="EduEarn Platform Demo Video"
        className="max-w-2xl"
      >
        <div className="flex flex-col gap-4 text-xs select-none">
          {/* Mock Video Canvas */}
          <div className="relative w-full aspect-video bg-slate-900 border border-border rounded-card flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-hero-gradient opacity-10" />
            <div className="flex flex-col items-center justify-center gap-3 text-center z-10 p-6">
              <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-white shadow-premium">
                <Play size={22} className="fill-white ml-1" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground uppercase tracking-wider">EduEarn Overview</h4>
                <p className="text-[10px] text-muted-foreground mt-1 max-w-sm leading-relaxed">
                  A peer learning network helping students teach and earn, while offering high-quality courses for kids, parents, and young learners.
                </p>
              </div>
            </div>
            <div className="absolute bottom-3 right-3 flex items-center gap-2 bg-black/60 px-2 py-0.5 rounded text-[8px] font-mono text-white/90">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              0:00 / 1:45
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-border/60 pt-4 mt-2">
            <span className="text-[10px] text-muted-foreground font-semibold">Ready to start? Discover student tutor options.</span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsDemoOpen(false)}>
                Close
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setIsDemoOpen(false);
                  router.push("/become-tutor");
                }}
              >
                Become a Tutor
              </Button>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
