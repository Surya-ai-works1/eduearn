"use client";

import React, { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { createClient } from "../../lib/supabase";
import { PageWrapper } from "../../components/layout/PageWrapper";
import { Container } from "../../components/layout/Container";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Divider } from "../../components/ui/divider";
import { 
  GraduationCap, 
  Sparkles, 
  CheckCircle, 
  Video, 
  ClipboardList, 
  FileText, 
  Users, 
  BookOpen, 
  HelpCircle, 
  ChevronRight,
  TrendingUp,
  Award,
  Globe,
  Loader2
} from "lucide-react";
import { 
  SCHOOL_BOARDS, 
  SCHOOL_CLASSES, 
  SCHOOL_SUBJECTS, 
  SubjectSpec 
} from "../../constants/schoolTuitionData";

export default function SchoolTuitionLanding() {
  const [selectedBoard, setSelectedBoard] = useState("cbse");
  const [selectedClass, setSelectedClass] = useState("class-10");
  const [selectedLanguage, setSelectedLanguage] = useState<"en" | "hi" | "es">("en");

  // Waitlist form state
  const [email, setEmail] = useState("");
  const [phoneVal, setPhoneVal] = useState("");
  const [loading, setLoading] = useState(false);
  const [joined, setJoined] = useState(false);

  const handleJoinWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();

      // Check for school-tuition academy ID
      const { data: academy } = await supabase
        .from("academies")
        .select("id")
        .eq("slug", "school-tuition")
        .single();

      const academyId = academy?.id || "00000000-0000-0000-0000-000000000000";

      const { error } = await supabase
        .from("academy_waitlist")
        .insert({
          academy_id: academyId,
          email: email.trim().toLowerCase(),
          phone: phoneVal.trim() || null
        });

      if (error) throw error;

      toast.success("Successfully registered on the waitlist!");
      setJoined(true);
    } catch (err: any) {
      toast.error(err.message || "Failed to join waitlist.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      {/* Hero Section */}
      <section className="relative py-20 md:py-28 overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background text-left">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px_32px] pointer-events-none" />
        <Container className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-[10px] font-extrabold uppercase tracking-wide">
              <Sparkles size={12} className="animate-spin" style={{ animationDuration: "3s" }} />
              Live Online Tuition Academies
            </div>
            <h1 className="text-4xl md:text-5xl font-heading font-extrabold text-foreground tracking-tight leading-tight">
              Interactive School Tuition <br />
              <span className="text-primary bg-clip-text">For Class 1 to 12</span>
            </h1>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-xl">
              Elevate your child&apos;s grades with premium syllabus coaching, structured homework sheets, weekly mock assessments, and personalized 1-on-1 doubt clearing rooms.
            </p>

            {/* Boards selector badges */}
            <div className="space-y-2.5">
              <span className="text-[10px] uppercase tracking-widest font-extrabold text-muted-foreground">Select Learning Board</span>
              <div className="flex flex-wrap gap-2">
                {SCHOOL_BOARDS.map((board) => (
                  <button
                    key={board.id}
                    onClick={() => setSelectedBoard(board.slug)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition border ${
                      selectedBoard === board.slug
                        ? "bg-primary border-primary text-white shadow-lg shadow-primary/25"
                        : "bg-card border-border hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    {board.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Multilingual Selector */}
            <div className="space-y-2.5 pt-2">
              <span className="text-[10px] uppercase tracking-widest font-extrabold text-muted-foreground flex items-center gap-1">
                <Globe size={11} /> Choose Subject Translation Language
              </span>
              <div className="flex gap-2">
                {(["en", "hi", "es"] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setSelectedLanguage(lang)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase transition border ${
                      selectedLanguage === lang
                        ? "bg-foreground border-foreground text-background"
                        : "bg-card border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {lang === "en" ? "English" : lang === "hi" ? "हिंदी (Hindi)" : "Español"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Registration waitlist card */}
          <div className="lg:col-span-5">
            <Card variant="glass" className="p-6 md:p-8 border-border bg-card/60 backdrop-blur shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
              <div className="space-y-4">
                <h3 className="font-heading font-extrabold text-lg text-foreground flex items-center gap-2">
                  <GraduationCap className="text-primary" />
                  Secure Free Trial Spot
                </h3>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Join our exclusive waiting list to receive 3 trial classes free of cost as soon as registrations open for your board and grade.
                </p>

                <Divider />

                {joined ? (
                  <div className="py-6 text-center space-y-3 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto text-emerald-500">
                      <CheckCircle size={24} />
                    </div>
                    <div className="px-4">
                      <p className="text-xs font-bold text-foreground">You&apos;re Registered!</p>
                      <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
                        We will notify you at <strong className="text-foreground">{email}</strong> about the class timetable and trial scheduler links.
                      </p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleJoinWaitlist} className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase">Email Address</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="parent@domain.com"
                        className="w-full text-xs bg-background border border-border px-3 py-2 rounded-lg focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase">Phone Number (Optional)</label>
                      <input
                        type="tel"
                        value={phoneVal}
                        onChange={(e) => setPhoneVal(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full text-xs bg-background border border-border px-3 py-2 rounded-lg focus:outline-none focus:border-primary"
                      />
                    </div>
                    <Button disabled={loading} type="submit" className="w-full py-2.5 text-xs font-bold mt-2 flex items-center justify-center gap-1.5">
                      {loading ? (
                        <>
                          <Loader2 className="animate-spin" size={14} /> Registering...
                        </>
                      ) : (
                        "Join Waitlist & Get Free Trial"
                      )}
                    </Button>
                  </form>
                )}
              </div>
            </Card>
          </div>
        </Container>
      </section>

      {/* Grade / Class grid selection */}
      <section className="py-16 bg-muted/20 border-y border-border/40 select-none text-left">
        <Container className="space-y-8">
          <div className="space-y-2 text-center max-w-xl mx-auto">
            <span className="text-[10px] uppercase tracking-widest font-extrabold text-primary">Class Curriculums</span>
            <h2 className="text-2xl md:text-3xl font-heading font-extrabold text-foreground">Choose Student Grade Level</h2>
            <p className="text-xs text-muted-foreground">
              Select a class below to view custom available topics, subject specifications, and structural materials.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {SCHOOL_CLASSES.map((cls) => (
              <button
                key={cls.id}
                onClick={() => setSelectedClass(cls.slug)}
                className={`p-4 rounded-xl border transition text-center flex flex-col items-center justify-center gap-1 bg-card ${
                  selectedClass === cls.slug
                    ? "border-primary bg-primary/5 shadow-soft shadow-primary/10"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <GraduationCap size={16} className={selectedClass === cls.slug ? "text-primary" : "text-muted-foreground"} />
                <span className="text-xs font-extrabold text-foreground">{cls.name}</span>
                <span className="text-[9px] text-muted-foreground">Syllabus Active</span>
              </button>
            ))}
          </div>

          {/* Subjects showcase based on selected Class/Board */}
          <div className="space-y-4 pt-4">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen size={16} className="text-primary" />
              Available Subjects ({SCHOOL_BOARDS.find(b => b.slug === selectedBoard)?.name || selectedBoard} - {SCHOOL_CLASSES.find(c => c.slug === selectedClass)?.name || selectedClass})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {SCHOOL_SUBJECTS.map((subject: SubjectSpec, idx: number) => {
                const trans = subject.translations[selectedLanguage] || subject.translations.en;
                // Mock metadata per subject for rich card display
                const meta = {
                  courseCount: 3 + (idx % 4),
                  tutorCount: 8 + (idx * 3),
                  startingPrice: 499 + idx * 100,
                  rating: (4.3 + (idx % 3) * 0.2).toFixed(1),
                  nextBatch: idx % 2 === 0 ? "Morning Batch – 6:00 AM" : "Evening Batch – 6:00 PM",
                };
                return (
                  <Card key={subject.id} className="p-5 border-border bg-card hover:shadow-lg transition-all duration-200 text-left flex flex-col justify-between group">
                    <div className="space-y-3">
                      {/* Icon & Name */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-extrabold text-sm shrink-0 group-hover:bg-primary/20 transition-colors">
                          {subject.name[0]}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-xs text-foreground leading-tight">{trans.name}</h4>
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className="text-amber-500 text-[9px]">★</span>
                            <span className="text-[9px] font-bold text-muted-foreground">{meta.rating} Rating</span>
                          </div>
                        </div>
                      </div>

                      <p className="text-[11px] text-muted-foreground leading-relaxed">{trans.description}</p>

                      {/* Stats row */}
                      <div className="grid grid-cols-3 gap-2 py-2 border-y border-border/30">
                        <div className="text-center">
                          <div className="text-xs font-extrabold text-foreground">{meta.courseCount}</div>
                          <div className="text-[9px] text-muted-foreground font-semibold">Courses</div>
                        </div>
                        <div className="text-center border-x border-border/30">
                          <div className="text-xs font-extrabold text-foreground">{meta.tutorCount}+</div>
                          <div className="text-[9px] text-muted-foreground font-semibold">Tutors</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs font-extrabold text-primary">₹{meta.startingPrice}</div>
                          <div className="text-[9px] text-muted-foreground font-semibold">Starting</div>
                        </div>
                      </div>

                      {/* Next Batch */}
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-semibold">
                        <Video size={11} className="text-primary shrink-0" />
                        <span>Next: <span className="text-foreground font-bold">{meta.nextBatch}</span></span>
                      </div>
                    </div>

                    {/* CTA */}
                    <Link
                      href={`/school/subject/${subject.slug}?board=${selectedBoard}&class=${selectedClass}`}
                      className="mt-4 w-full flex items-center justify-center gap-1.5 bg-primary/10 hover:bg-primary text-primary hover:text-white text-[10px] font-extrabold py-2 rounded-xl transition-all duration-200 border border-primary/30"
                    >
                      View Courses
                      <ChevronRight size={12} />
                    </Link>
                  </Card>
                );
              })}
            </div>
          </div>
        </Container>
      </section>

      {/* Academy Premium Features comparison */}
      <section className="py-16 text-left">
        <Container className="space-y-12">
          <div className="space-y-2 text-center max-w-xl mx-auto">
            <span className="text-[10px] uppercase tracking-widest font-extrabold text-primary">EduEarn Advantages</span>
            <h2 className="text-2xl md:text-3xl font-heading font-extrabold text-foreground">Why Online School Tuition?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="w-10 h-10 bg-primary/10 text-primary flex items-center justify-center rounded-xl">
                <Video size={18} />
              </div>
              <h3 className="font-extrabold text-xs text-foreground">Daily Live Learning Rooms</h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Live interactive classes led by premium board subject experts. Breakout doubt rooms resolve pupil queries in real-time.
              </p>
            </div>
            <div className="space-y-3">
              <div className="w-10 h-10 bg-emerald-500/10 text-emerald-500 flex items-center justify-center rounded-xl">
                <ClipboardList size={18} />
              </div>
              <h3 className="font-extrabold text-xs text-foreground">Daily Homework Assignments</h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Concept worksheets automatically graded. Feedback and step-by-step video solutions provided right on your dashboard.
              </p>
            </div>
            <div className="space-y-3">
              <div className="w-10 h-10 bg-amber-500/10 text-amber-500 flex items-center justify-center rounded-xl">
                <Users size={18} />
              </div>
              <h3 className="font-extrabold text-xs text-foreground">Parent-Teacher Progress Portal</h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Prepare updates tracking child attendance logs, homework grades, monthly milestones, and text alerts with mentors.
              </p>
            </div>
          </div>
        </Container>
      </section>
    </PageWrapper>
  );
}
