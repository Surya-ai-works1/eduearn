"use client";

import React from "react";
import Link from "next/link";
import { Container } from "../../components/layout/Container";
import { PageWrapper } from "../../components/layout/PageWrapper";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { useAuth } from "../../hooks/useAuth";
import { Sparkles, ArrowRight, BookOpen } from "lucide-react";

export default function WelcomePage() {
  const { user } = useAuth();
  const name = user?.fullName || "Student Learner";
  const role = user?.role || "learner";

  return (
    <PageWrapper>
      <section className="w-full py-24 select-none text-center min-h-[80vh] flex items-center justify-center relative overflow-hidden">
        
        {/* Background glow illustrations */}
        <div className="absolute inset-0 bg-hero-gradient opacity-10 pointer-events-none" />

        <Container className="max-w-md relative z-10">
          <Card variant="glass" className="p-8 border-border bg-card shadow-floating flex flex-col gap-6 text-center">
            
            <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center text-accent mx-auto animate-bounce">
              <Sparkles size={26} />
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-[9px] uppercase tracking-wider font-extrabold text-primary bg-primary/10 px-3 py-1 rounded-full mx-auto inline-block">
                Onboarding Successful
              </span>
              
              <h1 className="text-2xl font-heading font-extrabold text-foreground tracking-tight mt-2">
                {"Welcome to EduEarn, "}{name}!
              </h1>
              
              <p className="text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto mt-1">
                {role === "tutor"
                  ? "Your tutor application has been logged! While our administrators audit your university credentials, you can explore peer courses."
                  : "Your learner account is fully active. Start browsing Calculus roadmaps, programming sandboxes, and competitive tests."}
              </p>
            </div>

            <div className="flex flex-col gap-3 mt-4 w-full">
              <Link href="/courses" className="w-full">
                <Button className="w-full flex items-center justify-center gap-1.5 shadow-premium">
                  <BookOpen size={14} />
                  Explore Course Catalog
                  <ArrowRight size={13} />
                </Button>
              </Link>
              
              {role === "tutor" ? (
                <Link href="/pricing" className="w-full">
                  <Button variant="outline" className="w-full">
                    View Tutor Pricing Models
                  </Button>
                </Link>
              ) : (
                <Link href="/learning-paths" className="w-full">
                  <Button variant="outline" className="w-full">
                    Explore Study Roadmaps
                  </Button>
                </Link>
              )}
            </div>

          </Card>
        </Container>
      </section>
    </PageWrapper>
  );
}
