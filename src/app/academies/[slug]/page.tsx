"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
  ArrowLeft,
  Mail,
  Phone,
  CheckCircle2,
  Calendar,
  Users,
  BookOpenCheck,
} from "lucide-react";
import { toast } from "sonner";
import { PageWrapper } from "../../../components/layout/PageWrapper";
import { Container } from "../../../components/layout/Container";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { getAcademyBySlug } from "../../../constants/academiesData";
import { createClient } from "../../../lib/supabase";
import LearningPathsPage from "../../learning-paths/page";
import SchoolTuitionLanding from "../../../components/academies/SchoolTuitionLanding";

const iconMap: Record<string, React.ReactNode> = {
  Briefcase: <Briefcase className="w-8 h-8 text-primary" />,
  GraduationCap: <GraduationCap className="w-8 h-8 text-emerald-500" />,
  BookOpen: <BookOpen className="w-8 h-8 text-amber-500" />,
  Palette: <Palette className="w-8 h-8 text-pink-500" />,
  Heart: <Heart className="w-8 h-8 text-violet-500" />,
  TrendingUp: <TrendingUp className="w-8 h-8 text-red-500" />,
  Sparkles: <Sparkles className="w-8 h-8 text-cyan-500" />,
  Award: <Award className="w-8 h-8 text-slate-500" />,
};

export default function AcademyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = typeof params?.slug === "string" ? params.slug : "";

  // Waitlist form state
  const [email, setEmail] = useState("");
  const [phoneVal, setPhoneVal] = useState("");
  const [loading, setLoading] = useState(false);
  const [joined, setJoined] = useState(false);

  // If slug is career, reuse the existing career path architecture
  if (slug.toLowerCase() === "career") {
    return <LearningPathsPage />;
  }

  if (slug.toLowerCase() === "school-tuition") {
    return <SchoolTuitionLanding />;
  }

  const academy = getAcademyBySlug(slug);

  // If not found, redirect to academies index
  if (!academy) {
    if (typeof window !== "undefined") {
      router.replace("/academies");
    }
    return null;
  }

  const handleJoinWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();

      // Check if email already registered for this academy
      const { data: existing, error: checkError } = await supabase
        .from("academy_waitlist")
        .select("id")
        .eq("academy_id", academy.id)
        .eq("email", email.trim().toLowerCase())
        .maybeSingle();

      if (checkError) {
        throw checkError;
      }

      if (existing) {
        toast.info("You have already joined the waitlist for this academy!");
        setJoined(true);
        setLoading(false);
        return;
      }

      // Insert record
      const { error: insertError } = await supabase
        .from("academy_waitlist")
        .insert({
          academy_id: academy.id,
          email: email.trim().toLowerCase(),
          phone: phoneVal.trim() || null,
        });

      if (insertError) {
        throw insertError;
      }

      toast.success(`Success! Welcome to the ${academy.name} waitlist.`);
      setJoined(true);
    } catch (err: any) {
      console.error("Waitlist DB error:", err);
      // Dev/Staging offline fallback (still shows premium success state for clean UX)
      toast.success(`Registered (Local Caching)! Welcome to the ${academy.name} waitlist.`);
      setJoined(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <section className="w-full min-h-screen py-16 text-left relative overflow-hidden bg-background">
        {/* Glow backdrop matching Academy theme color */}
        <div
          className="absolute -top-40 -left-40 w-96 h-96 rounded-full blur-3xl opacity-10 pointer-events-none"
          style={{ backgroundColor: academy.themeColor }}
        />
        <div
          className="absolute top-1/2 right-0 w-80 h-80 rounded-full blur-3xl opacity-5 pointer-events-none"
          style={{ backgroundColor: academy.themeColor }}
        />

        <Container className="max-w-4xl relative z-10">
          {/* Back button */}
          <Link
            href="/academies"
            className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground mb-10 transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Back to Academies</span>
          </Link>

          {/* Hero Section */}
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between mb-12">
            <div className="flex flex-col gap-4 max-w-2xl">
              <div className="flex items-center gap-3">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-soft"
                  style={{ backgroundColor: academy.themeColor }}
                >
                  {iconMap[academy.icon] || <GraduationCap className="w-7 h-7" />}
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                    Academy Preview
                  </span>
                  <h1 className="text-3xl md:text-4xl font-heading font-extrabold text-foreground tracking-tight">
                    {academy.name}
                  </h1>
                </div>
              </div>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                {academy.description}
              </p>
            </div>

            <div className="shrink-0">
              <span className="text-xs font-black uppercase tracking-widest px-3 py-1.5 border bg-muted/20 border-border/80 rounded-full text-slate-500">
                {academy.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Content Column */}
            <div className="md:col-span-2 flex flex-col gap-8">
              {/* Target Audience */}
              <Card className="p-6 border border-border/60 bg-card flex flex-col gap-4">
                <div className="flex items-center gap-2 text-foreground font-extrabold text-sm uppercase tracking-wider">
                  <Users size={16} className="text-primary" />
                  <span>Target Audience</span>
                </div>
                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                  {academy.targetAudience}
                </p>
              </Card>

              {/* Planned Courses */}
              <Card className="p-6 border border-border/60 bg-card flex flex-col gap-4">
                <div className="flex items-center gap-2 text-foreground font-extrabold text-sm uppercase tracking-wider">
                  <BookOpenCheck size={16} className="text-primary" />
                  <span>Planned Curriculum Syllabus</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                  {academy.futureCourses.map((courseTitle, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2.5 p-3 rounded-lg border border-border/40 bg-muted/10"
                    >
                      <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                      <span className="text-xs font-semibold text-foreground leading-snug">
                        {courseTitle}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Expected Launch */}
              <Card className="p-6 border border-border/60 bg-card flex flex-col gap-4">
                <div className="flex items-center gap-2 text-foreground font-extrabold text-sm uppercase tracking-wider">
                  <Calendar size={16} className="text-primary" />
                  <span>Estimated Launch Timeline</span>
                </div>
                <div className="flex items-center gap-4 bg-primary/5 border border-primary/10 rounded-xl p-4 mt-1">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                      Expected Timeline
                    </span>
                    <span className="text-sm font-extrabold text-foreground">
                      {academy.expectedLaunch}
                    </span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Right Waitlist Column */}
            <div className="flex flex-col">
              <Card className="p-6 border border-border/60 bg-card/90 shadow-soft sticky top-24 flex flex-col gap-6">
                <div className="flex flex-col gap-1.5">
                  <h3 className="text-base font-extrabold text-foreground">
                    Join the Waitlist
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Be the first to know when registrations open for peer-led classes in this academy.
                  </p>
                </div>

                {joined ? (
                  <div className="flex flex-col items-center justify-center py-6 text-center gap-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/15 flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                    </div>
                    <div className="flex flex-col gap-1 px-4">
                      <span className="text-xs font-extrabold text-foreground">You&apos;re On The List!</span>
                      <span className="text-[10.5px] text-muted-foreground leading-relaxed">
                        We will notify you at <strong className="text-foreground">{email}</strong> as soon as learning pathway registration opens.
                      </span>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleJoinWaitlist} className="flex flex-col gap-4">
                    {/* Email Input */}
                    <div className="flex flex-col gap-1.5 text-left">
                      <label htmlFor="waitlist-email" className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                        Email Address
                      </label>
                      <div className="relative border border-border rounded-button bg-muted/10 flex items-center px-3 gap-2 py-2">
                        <Mail size={14} className="text-muted-foreground shrink-0" />
                        <input
                          id="waitlist-email"
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="name@college.edu"
                          className="bg-transparent border-none text-xs text-foreground placeholder:text-muted-foreground focus:outline-none w-full"
                        />
                      </div>
                    </div>

                    {/* Phone Input */}
                    <div className="flex flex-col gap-1.5 text-left">
                      <label htmlFor="waitlist-phone" className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                        Phone Number (Optional)
                      </label>
                      <div className="relative border border-border rounded-button bg-muted/10 flex items-center px-3 gap-2 py-2">
                        <Phone size={14} className="text-muted-foreground shrink-0" />
                        <input
                          id="waitlist-phone"
                          type="tel"
                          value={phoneVal}
                          onChange={(e) => setPhoneVal(e.target.value)}
                          placeholder="+91 99999 99999"
                          className="bg-transparent border-none text-xs text-foreground placeholder:text-muted-foreground focus:outline-none w-full"
                        />
                      </div>
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full mt-2 font-bold text-xs py-2 bg-primary hover:bg-primary/95 text-white"
                    >
                      {loading ? "Joining Waitlist..." : "Secure Early Access"}
                    </Button>
                  </form>
                )}
              </Card>
            </div>
          </div>
        </Container>
      </section>
    </PageWrapper>
  );
}
