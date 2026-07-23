"use client";

import React from "react";
import Link from "next/link";
import { Container } from "../../components/layout/Container";
import { PageWrapper } from "../../components/layout/PageWrapper";
import { Card } from "../../components/ui/card";
import { Divider } from "../../components/ui/divider";

export default function StudentPolicyPage() {
  return (
    <PageWrapper>
      <section className="w-full py-12 bg-muted/20 border-b border-border/40 text-left select-none">
        <Container className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-semibold">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <span>/</span>
            <span className="text-foreground">Student Policy</span>
          </div>
          <div className="flex flex-col gap-2 mt-1">
            <h1 className="text-3xl md:text-4xl font-heading font-extrabold text-foreground tracking-tight">
              Student Policy &amp; Guidelines
            </h1>
            <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
              Last updated: July 2026. Code of conduct, payment safety, and subscription rules.
            </p>
          </div>
        </Container>
      </section>

      <section className="w-full py-16 select-none text-left">
        <Container className="max-w-3xl">
          <Card variant="default" className="p-8 border-border bg-card flex flex-col gap-6 text-xs text-muted-foreground leading-relaxed">
            <div className="flex flex-col gap-2 text-left">
              <h3 className="text-sm font-heading font-extrabold text-foreground">1. Learning Access License</h3>
              <p>
                Subscription plans grant a single, personal license to watch course lectures and attend live sessions. Group sharing or downloading video content violates platform policies.
              </p>
            </div>
            <Divider variant="dashed" />
            <div className="flex flex-col gap-2 text-left">
              <h3 className="text-sm font-heading font-extrabold text-foreground">2. Refund Eligibility</h3>
              <p>
                Refunds can be requested within 7 days of course purchase if watch progress is under 15% and no assignments have been submitted. All refunds are reviewed and credited directly to student wallets.
              </p>
            </div>
            <Divider variant="dashed" />
            <div className="flex flex-col gap-2 text-left">
              <h3 className="text-sm font-heading font-extrabold text-foreground">3. Live Classroom Interaction</h3>
              <p>
                Students must interact respectfully in classrooms, whiteboard tabs, and chat logs. Any forms of spam or abuse lead to immediate deactivation.
              </p>
            </div>
          </Card>
        </Container>
      </section>
    </PageWrapper>
  );
}
