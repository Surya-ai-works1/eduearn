"use client";

import React from "react";
import Link from "next/link";
import { Container } from "../../components/layout/Container";
import { PageWrapper } from "../../components/layout/PageWrapper";
import { Card } from "../../components/ui/card";
import { Divider } from "../../components/ui/divider";

export default function TermsConditionsPage() {
  return (
    <PageWrapper>
      {/* Header section */}
      <section className="w-full py-12 bg-muted/20 border-b border-border/40 text-left select-none">
        <Container className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-semibold">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <span>/</span>
            <span className="text-foreground">Terms &amp; Conditions</span>
          </div>

          <div className="flex flex-col gap-2 mt-1">
            <h1 className="text-3xl md:text-4xl font-heading font-extrabold text-foreground tracking-tight">
              Terms &amp; Conditions
            </h1>
            <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
              {"Last updated: June 2026. Licensing guidelines, refund criteria, and student tutor obligations."}
            </p>
          </div>
        </Container>
      </section>

      {/* Content details */}
      <section className="w-full py-16 select-none text-left">
        <Container className="max-w-3xl">
          <Card variant="default" className="p-8 border-border bg-card flex flex-col gap-6 text-xs text-muted-foreground leading-relaxed">
            
            <div className="flex flex-col gap-2 text-left">
              <h3 className="text-sm font-heading font-extrabold text-foreground">1. User Account Licensing</h3>
              <p>
                {"By registering on EduEarn, you agree that access to courses is strictly personal. Sharing credentials or scraping video segments is prohibited and leads to immediate account deactivation."}
              </p>
            </div>

            <Divider variant="dashed" />

            <div className="flex flex-col gap-2 text-left">
              <h3 className="text-sm font-heading font-extrabold text-foreground">2. Tutor Payout Agreements</h3>
              <p>
                {"Student tutors must provide accurate bank routing credentials. EduEarn deducts a 15% service upkeep charge. Any course violating copyright guidelines will be retired, and pending payouts will be withheld."}
              </p>
            </div>

            <Divider variant="dashed" />

            <div className="flex flex-col gap-2 text-left">
              <h3 className="text-sm font-heading font-extrabold text-foreground">3. Live Classroom Guidelines</h3>
              <p>
                {"Live clearance doubt sessions must remain focus-driven. Mentors must not request personal off-platform payments from students. Violation of this safety rule leads to immediate profile suspension."}
              </p>
            </div>

            <Divider variant="dashed" />

            <div className="flex flex-col gap-2 text-left">
              <h3 className="text-sm font-heading font-extrabold text-foreground">4. Platform Disclaimers</h3>
              <p>
                {"EduEarn is an open marketplace platform for peer-to-peer student instruction. We do not provide degree accreditation or formal academic credits. Users use the services at their own discretion."}
              </p>
            </div>

          </Card>
        </Container>
      </section>
    </PageWrapper>
  );
}
