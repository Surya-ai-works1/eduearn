"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  GraduationCap, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  User, 
  Users, 
  Star, 
  ArrowRight 
} from "lucide-react";
import { Container } from "./Container";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { MOCK_TUTORS } from "../../constants/mockData";

export function Tuitions() {
  const router = useRouter();

  const tuitionTutors = useMemo(() => {
    return MOCK_TUTORS.filter((tutor) => {
      if (tutor.approvalStatus !== "published") return false;
      if (!tutor.interestedInTuition) return false;

      const tuitionSubjects = [
        "biology", "english", "economics", "commerce", "accountancy", "mathematics", "physics", "chemistry",
        "class-1", "class-2", "class-3", "class-4", "class-5", "class-6", "class-7", "class-8", "class-9", "class-10"
      ];
      const hasTuitionSubject = tutor.subjectsTaughtIds?.some((id: string) => 
        tuitionSubjects.includes(id.toLowerCase())
      );
      if (!hasTuitionSubject) return false;

      const tuitionGrades = [
        "primary (class 1–5)",
        "middle school (class 6–8)",
        "secondary (class 9–10)",
        "all levels"
      ];
      const hasTuitionGrade = tutor.classLevels?.some((level: string) => 
        tuitionGrades.includes(level.toLowerCase())
      );
      if (!hasTuitionGrade) return false;

      return true;
    });
  }, []);

  const spotlightTutor = tuitionTutors[0];
  const tuitionStudentsCount = useMemo(() => {
    return tuitionTutors.reduce((acc, t) => acc + t.totalStudents, 0);
  }, [tuitionTutors]);

  const handleAskSparky = () => {
    if (typeof window !== "undefined") {
      const widget = document.getElementById("sparky-chat-widget-toggle");
      if (widget) {
        widget.click();
        return;
      }
    }
    router.push("/ai-assistant");
  };

  return (
    <section className="w-full py-16 bg-background select-none text-center">
      <Container className="flex flex-col gap-8">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center gap-3 mb-2">
          <span className="text-[10px] uppercase tracking-wider font-extrabold text-primary bg-primary/10 px-3 py-1 rounded-full w-fit">
            Online Tuition
          </span>
          <h2 className="text-3xl md:text-4xl font-heading font-extrabold text-foreground tracking-tight">
            Online Tuition for Grades 1–10
          </h2>
          <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
            Learn from qualified online tutors for school subjects, with structured classes tailored to Grades 1–10.
          </p>
        </div>

        <div className="w-full">
          <Card
            variant="glass"
            className="p-8 border border-border bg-card rounded-2xl transition-all duration-300 hover:shadow-xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Tuition Details */}
              <div className="lg:col-span-8 flex flex-col gap-6 text-left">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <div>
                    {/* Enhanced Badges */}
                    <div className="flex flex-wrap gap-1.5">
                      <span className="text-[8px] font-extrabold tracking-wide uppercase px-2 py-0.5 rounded border bg-emerald-500/10 text-emerald-400 border-emerald-500/20 flex items-center gap-0.5">
                        <Check className="w-2.5 h-2.5" /> Free Trial Available
                      </span>
                      <span className="text-[8px] font-extrabold tracking-wide uppercase px-2 py-0.5 rounded border bg-blue-500/10 text-blue-400 border-blue-500/20 flex items-center gap-0.5">
                        <ShieldCheck className="w-2.5 h-2.5" /> Background Checked
                      </span>
                    </div>
                    <h3 className="text-xl md:text-2xl font-heading font-extrabold text-foreground mt-2">
                      🎓 Online Tuition for Grades 1–10
                    </h3>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground max-w-xl leading-relaxed">
                  Learn from qualified online tutors for school subjects, with structured classes tailored to Grades 1–10.
                </p>

                {/* Grade and Subject chips */}
                <div className="flex flex-wrap gap-2">
                  {["🎒 Grades 1–5", "🏫 Grades 6–8", "🎓 Grades 9–10", "🔢 Mathematics", "🧪 Science", "📚 English"].map((chip, idx) => (
                    <span
                      key={idx}
                      className="text-[9px] font-extrabold tracking-wide bg-gradient-to-r from-primary/5 to-accent/5 text-primary border border-primary/15 px-3 py-1 rounded-full"
                    >
                      {chip}
                    </span>
                  ))}
                </div>

                {/* Quick Sections Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-2">
                  {[
                    "Mathematics Tuition",
                    "Science Tuition",
                    "English Tuition",
                    "Exam Preparation",
                    "Grades 1–5",
                    "Grades 6–10",
                  ].map((section, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-[10px] font-bold text-foreground">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      {section}
                    </div>
                  ))}
                </div>

                {/* Tuition Stats */}
                <div className="flex flex-wrap items-center gap-6 mt-4 pt-4 border-t border-border/40 text-[9px] text-muted-foreground font-extrabold uppercase tracking-wider">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-primary" />
                    {tuitionTutors.length} Tuition Tutors
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-primary" />
                    {tuitionStudentsCount.toLocaleString()} Students Learning
                  </span>
                  <span className="flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5 text-primary" />
                    Grades 1–10 Supported
                  </span>
                </div>
              </div>

              {/* Curated Spotlight Tuition Tutor */}
              <div className="lg:col-span-4 flex flex-col gap-4 w-full">
                {!spotlightTutor ? (
                  <Card variant="glass" className="p-6 text-center flex flex-col items-center justify-center gap-3">
                    <span className="text-3xl">📭</span>
                    <span className="text-xs font-bold text-foreground">
                      No tuition tutors are available right now.
                    </span>
                    <Link href="/tutors?category=academics&tuition=true">
                      <Button size="sm" variant="primary" className="text-[10px] font-bold mt-2">
                        Find Tuition Tutors
                      </Button>
                    </Link>
                  </Card>
                ) : (
                  <>
                    <div className="p-5 rounded-2xl border border-border bg-muted/30 text-left relative overflow-hidden">
                      <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
                        <span className="text-[7px] font-black uppercase bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/30">
                          BG Checked
                        </span>
                      </div>

                      <span className="text-[8px] font-extrabold uppercase tracking-widest text-accent font-heading">
                        Spotlight Tuition Tutor
                      </span>
                      
                      <div className="flex items-center gap-3 mt-3">
                        <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center text-primary font-heading font-extrabold text-xs shrink-0 border border-primary/20">
                          {spotlightTutor.fullName.split(" ").map((n: string) => n[0]).join("")}
                        </div>
                        <div>
                          <h5 className="text-xs font-extrabold text-foreground">
                            {spotlightTutor.fullName}
                          </h5>
                          <p className="text-[9px] text-muted-foreground font-semibold">
                            {spotlightTutor.expertise.join(" & ")}
                          </p>
                        </div>
                      </div>

                      <ul className="space-y-1.5 mt-4 text-[9px] text-muted-foreground font-semibold border-t border-border/40 pt-4">
                        <li className="flex items-center justify-between">
                          <span>Grades:</span>
                          <span className="text-foreground">{(() => {
                            const getGradeDisplay = (levels: string[]) => {
                              const list: string[] = [];
                              levels.forEach(lvl => {
                                const lower = lvl.toLowerCase();
                                if (lower.includes("class 1–5")) list.push("Grades 1–5");
                                else if (lower.includes("class 6–8")) list.push("Grades 6–8");
                                else if (lower.includes("class 9–10")) list.push("Grades 9–10");
                                else if (lower.includes("class 11-12")) list.push("Grades 11–12");
                                else if (lower.includes("high school")) list.push("Grades 9–12");
                                else if (lower.includes("all levels")) list.push("Grades 1–10");
                              });
                              return list.length > 0 ? list.join(" · ") : "Grades 1–10";
                            };
                            return getGradeDisplay(spotlightTutor.classLevels);
                          })()}</span>
                        </li>
                        <li className="flex items-center justify-between">
                          <span>Experience:</span>
                          <span className="text-foreground">{spotlightTutor.experience}</span>
                        </li>
                        <li className="flex items-center justify-between">
                          <span>Languages:</span>
                          <span className="text-foreground">{spotlightTutor.languages.join(", ")}</span>
                        </li>
                        <li className="flex items-center justify-between">
                          <span>Students Taught:</span>
                          <span className="text-foreground">{spotlightTutor.totalStudents}+ Students</span>
                        </li>
                      </ul>

                      <div className="flex items-center justify-between text-[9px] font-extrabold text-foreground mt-4 pt-3.5 border-t border-border/40">
                        <span className="flex items-center gap-0.5 text-amber-500">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          {spotlightTutor.rating.toFixed(1)} ({Math.round(spotlightTutor.totalStudents * 1.2)} reviews)
                        </span>
                        {spotlightTutor.allSubjectsPackage !== "N/A" && (
                          <span className="text-primary text-[10px]">
                            {spotlightTutor.allSubjectsPackage}
                          </span>
                        )}
                      </div>

                      <Link href={`/tutors/${spotlightTutor.id}`}>
                        <Button size="sm" className="w-full mt-4 text-[10px] font-bold">
                          Explore Tuition Profile
                        </Button>
                      </Link>
                    </div>

                    <div className="flex flex-col gap-2 w-full mt-1">
                      <Link href="/tutors?category=academics&tuition=true" className="w-full">
                        <Button variant="primary" className="w-full group text-[10px] font-bold py-5 rounded-xl">
                          Find Tuition Tutors
                          <ArrowRight className="w-3.5 h-3.5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    </div>
                  </>
                )}
              </div>

            </div>

            {/* Ask Sparky CTA Banner */}
            <div className="mt-8 p-4 rounded-xl border border-primary/20 bg-primary/5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-left">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h6 className="text-[11px] font-extrabold text-foreground">
                    Need help choosing the right tutor?
                  </h6>
                  <p className="text-[9px] text-muted-foreground">
                    Get personalized tutor matching and roadmap recommendations from Sparky.
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                onClick={handleAskSparky}
                className="text-[9.5px] font-extrabold py-1 px-4 shrink-0 bg-primary hover:bg-primary/95 text-primary-foreground shadow-sm flex items-center gap-1.5"
              >
                Ask Sparky <Sparkles className="w-3.5 h-3.5" />
              </Button>
            </div>

          </Card>
        </div>

      </Container>
    </section>
  );
}
