"use client";

import React from "react";
import { motion, type Variants } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  Sparkles,
  Users,
  BookOpen,
  TrendingUp,
  ShieldCheck,
  Zap,
  Star,
} from "lucide-react";

import { Container } from "../../../components/layout/Container";
import { PageWrapper } from "../../../components/layout/PageWrapper";
import { Card } from "../../../components/ui/card";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { cn } from "../../../utils/cn";

// ─── Types ───────────────────────────────────────────────────────────────────

interface AuthShellProps {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
  backHref?: string;
  backLabel?: string;
  className?: string;
}

// ─── Branding stat card data ──────────────────────────────────────────────────

const BRAND_STATS = [
  { icon: Users, value: "50K+", label: "Active Learners" },
  { icon: BookOpen, value: "1,200+", label: "Live Courses" },
  { icon: TrendingUp, value: "₹2.4Cr+", label: "Tutor Earnings" },
] as const;

const TRUST_BADGES = [
  { icon: ShieldCheck, text: "SSL Secured" },
  { icon: Zap, text: "AI Verified" },
  { icon: Star, text: "4.9 Rated" },
] as const;

// ─── Animation Variants ───────────────────────────────────────────────────────

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

const formVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.35, ease: "easeOut" as const },
  },
};

// ─── Branding Panel ───────────────────────────────────────────────────────────

function BrandingPanel({ eyebrow }: { eyebrow: string }) {
  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="hidden lg:flex flex-col justify-center gap-8 relative"
      aria-hidden="true"
    >
      {/* Eyebrow badge */}
      <motion.div variants={itemVariants}>
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
          <Sparkles size={13} aria-hidden="true" />
          {eyebrow}
        </span>
      </motion.div>

      {/* Main headline */}
      <motion.div variants={itemVariants} className="space-y-3">
        <h1 className="font-heading text-[3.25rem] font-extrabold leading-[1.1] tracking-tight text-foreground">
          <span className="text-primary">Learn.</span>{" "}
          <span className="text-sky-500">Teach.</span>{" "}
          <span className="text-accent">Earn.</span>
        </h1>
        <p className="max-w-sm text-base leading-7 text-muted-foreground">
          India&apos;s most trusted AI-powered learning marketplace. Anyone can learn, students
          can teach, and everyone can grow.
        </p>
      </motion.div>

      {/* Stats cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-3 gap-3">
        {BRAND_STATS.map(({ icon: Icon, value, label }) => (
          <div
            key={label}
            className="flex flex-col items-center gap-1.5 rounded-[16px] border border-border bg-card/70 p-3 text-center shadow-soft backdrop-blur"
          >
            <Icon size={18} className="text-primary" aria-hidden="true" />
            <span className="font-heading text-lg font-extrabold text-foreground">{value}</span>
            <span className="text-[10px] font-semibold text-muted-foreground">{label}</span>
          </div>
        ))}
      </motion.div>

      {/* Trust badges */}
      <motion.div variants={itemVariants} className="flex items-center gap-3 flex-wrap">
        {TRUST_BADGES.map(({ icon: Icon, text }) => (
          <div
            key={text}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/60 px-2.5 py-1 text-[11px] font-semibold text-muted-foreground backdrop-blur"
          >
            <Icon size={12} className="text-accent" aria-hidden="true" />
            {text}
          </div>
        ))}
      </motion.div>

      {/* Decorative illustration placeholder — animated gradient orbs */}
      <motion.div
        variants={itemVariants}
        className="relative mt-2 h-40 w-full overflow-hidden rounded-[20px] border border-border bg-gradient-to-br from-primary/5 via-sky-500/5 to-accent/5"
      >
        {/* Animated blobs */}
        <motion.div
          animate={{ y: [0, -10, 0], x: [0, 6, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-6 -right-6 h-28 w-28 rounded-full bg-primary/20 blur-2xl"
        />
        <motion.div
          animate={{ y: [0, 8, 0], x: [0, -5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-0 left-4 h-24 w-24 rounded-full bg-accent/15 blur-2xl"
        />
        <motion.div
          animate={{ y: [0, -5, 0], x: [0, 4, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-1/2 left-1/3 h-20 w-20 rounded-full bg-sky-400/10 blur-xl"
        />

        {/* Inner content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center">
          <div className="flex items-center gap-2 rounded-full border border-primary/20 bg-card/80 px-4 py-2 shadow-soft backdrop-blur">
            <Sparkles size={14} className="text-primary" aria-hidden="true" />
            <span className="text-xs font-bold text-foreground">AI-Powered Learning</span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Personalized courses · Smart tutors · Real earnings
          </p>
        </div>
      </motion.div>

      {/* Bottom quote */}
      <motion.p
        variants={itemVariants}
        className="text-[11px] italic text-muted-foreground/70"
      >
        &ldquo;Education should create opportunities. Knowledge should generate income.&rdquo;
      </motion.p>
    </motion.section>
  );
}

// ─── AuthShell ────────────────────────────────────────────────────────────────

export function AuthShell({
  eyebrow,
  title,
  description,
  children,
  backHref,
  backLabel = "Back",
  className,
}: AuthShellProps) {
  return (
    <PageWrapper>
      <main className="relative flex min-h-[86vh] items-center overflow-y-auto lg:overflow-hidden py-16">
        {/* Background radial gradients */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.14),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.10),transparent_32%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-hero-gradient opacity-[0.06]"
        />

        <Container className="relative z-10 grid max-w-6xl items-center gap-12 lg:grid-cols-[1fr_1.1fr]">
          {/* Left: Premium branding panel */}
          <BrandingPanel eyebrow={eyebrow} />

          {/* Right: Auth form card */}
          <motion.section
            variants={formVariants}
            initial="hidden"
            animate="visible"
            className="mx-auto w-full max-w-[520px]"
          >
            <Card
              variant="glass"
              hoverEffect="none"
              className={cn("p-6 shadow-floating sm:p-8", className)}
            >
              {/* Back link */}
              {backHref && (
                <Link
                  href={backHref}
                  className="mb-6 inline-flex items-center gap-2 text-xs font-bold text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md"
                  aria-label={`${backLabel} — go back`}
                >
                  <ArrowLeft size={14} aria-hidden="true" />
                  {backLabel}
                </Link>
              )}

              {/* Card header */}
              <div className="mb-6 flex flex-col items-center text-center">
                <div className="mb-4">
                  <BrandLogo href="/" />
                </div>
                <span className="mb-3 inline-flex rounded-full bg-primary/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide text-primary">
                  {eyebrow}
                </span>
                <h2 className="font-heading text-2xl font-extrabold tracking-tight text-foreground">
                  {title}
                </h2>
                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                  {description}
                </p>
              </div>

              {/* Form content */}
              {children}
            </Card>
          </motion.section>
        </Container>
      </main>
    </PageWrapper>
  );
}
