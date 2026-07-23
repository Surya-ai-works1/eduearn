"use client";

import React from "react";
import Link from "next/link";
import { Container } from "../../components/layout/Container";
import { PageWrapper } from "../../components/layout/PageWrapper";
import { Card } from "../../components/ui/card";
import { Divider } from "../../components/ui/divider";

export default function CopyrightPolicyPage() {
  return (
    <PageWrapper>
      <section className="w-full py-12 bg-muted/20 border-b border-border/40 text-left select-none">
        <Container className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-semibold">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <span>/</span>
            <span className="text-foreground">Copyright Policy</span>
          </div>
          <div className="flex flex-col gap-2 mt-1">
            <h1 className="text-3xl md:text-4xl font-heading font-extrabold text-foreground tracking-tight">
              Copyright &amp; IP Protection
            </h1>
            <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
              Last updated: July 2026. Submitting copyright complaints and intellectual property protection guidelines.
            </p>
          </div>
        </Container>
      </section>

      <section className="w-full py-16 select-none text-left">
        <Container className="max-w-3xl">
          <Card variant="default" className="p-8 border-border bg-card flex flex-col gap-6 text-xs text-muted-foreground leading-relaxed">
            <div className="flex flex-col gap-2 text-left">
              <h3 className="text-sm font-heading font-extrabold text-foreground">1. Content Intellectual Property</h3>
              <p>
                Tutors retain the copyright to original educational slideshows, lecture outlines, video sessions, and assignments created. Plagiarism from other sources is forbidden.
              </p>
            </div>
            <Divider variant="dashed" />
            <div className="flex flex-col gap-2 text-left">
              <h3 className="text-sm font-heading font-extrabold text-foreground">2. DMCA Takedown Process</h3>
              <p>
                If you believe content hosted on EduEarn violates your intellectual property copyright, you may submit a takedown notification to copyright@eduearn.com with proof of ownership.
              </p>
            </div>
            <Divider variant="dashed" />
            <div className="flex flex-col gap-2 text-left">
              <h3 className="text-sm font-heading font-extrabold text-foreground">3. Repeat Infringer Policy</h3>
              <p>
                EduEarn operates a three-strike policy. Tutors whose courses receive three verified copyright complaints will be suspended and banned permanently from onboarding.
              </p>
            </div>
          </Card>
        </Container>
      </section>
    </PageWrapper>
  );
}
