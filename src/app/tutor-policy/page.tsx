"use client";

import React from "react";
import Link from "next/link";
import { Container } from "../../components/layout/Container";
import { PageWrapper } from "../../components/layout/PageWrapper";
import { Card } from "../../components/ui/card";
import { Divider } from "../../components/ui/divider";

export default function TutorPolicyPage() {
  return (
    <PageWrapper>
      <section className="w-full py-12 bg-muted/20 border-b border-border/40 text-left select-none">
        <Container className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-semibold">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <span>/</span>
            <span className="text-foreground">Tutor Policy</span>
          </div>
          <div className="flex flex-col gap-2 mt-1">
            <h1 className="text-3xl md:text-4xl font-heading font-extrabold text-foreground tracking-tight">
              Tutor Policy &amp; Terms
            </h1>
            <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
              Last updated: July 2026. Guidelines and rules of conduct for verified tutors.
            </p>
          </div>
        </Container>
      </section>

      <section className="w-full py-16 select-none text-left">
        <Container className="max-w-3xl">
          <Card variant="default" className="p-8 border-border bg-card flex flex-col gap-6 text-xs text-muted-foreground leading-relaxed">
            <div className="flex flex-col gap-2 text-left">
              <h3 className="text-sm font-heading font-extrabold text-foreground">1. Eligibility Criteria</h3>
              <p>
                Tutors must be verified students or professionals aged 16-24. You must provide a valid college ID or certification documents for verification.
              </p>
            </div>
            <Divider variant="dashed" />
            <div className="flex flex-col gap-2 text-left">
              <h3 className="text-sm font-heading font-extrabold text-foreground">2. Escrow Revenue Splits</h3>
              <p>
                EduEarn operates on an 80/20 revenue split. 80% of student payments are credited to the tutor pending wallet. Platform fees of 20% go to operating costs. Payouts are reviewed and released every 15 days by admins.
              </p>
            </div>
            <Divider variant="dashed" />
            <div className="flex flex-col gap-2 text-left">
              <h3 className="text-sm font-heading font-extrabold text-foreground">3. Conduct &amp; Safety</h3>
              <p>
                Tutors must not solicit direct payments or collect student contact details off-platform. Live classes must remain respectful and adhere strictly to the syllabus mapping.
              </p>
            </div>
          </Card>
        </Container>
      </section>
    </PageWrapper>
  );
}
