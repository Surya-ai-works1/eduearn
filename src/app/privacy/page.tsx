"use client";

import React from "react";
import Link from "next/link";
import { Container } from "../../components/layout/Container";
import { PageWrapper } from "../../components/layout/PageWrapper";
import { Card } from "../../components/ui/card";
import { Divider } from "../../components/ui/divider";

export default function PrivacyPolicyPage() {
  return (
    <PageWrapper>
      {/* Header section */}
      <section className="w-full py-12 bg-muted/20 border-b border-border/40 text-left select-none">
        <Container className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-semibold">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <span>/</span>
            <span className="text-foreground">Privacy Policy</span>
          </div>

          <div className="flex flex-col gap-2 mt-1">
            <h1 className="text-3xl md:text-4xl font-heading font-extrabold text-foreground tracking-tight">
              Privacy Policy &amp; Security
            </h1>
            <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
              {"Last updated: June 2026. How we manage student credentials, wallet data, and browser cache security."}
            </p>
          </div>
        </Container>
      </section>

      {/* Content details */}
      <section className="w-full py-16 select-none text-left">
        <Container className="max-w-3xl">
          <Card variant="default" className="p-8 border-border bg-card flex flex-col gap-6 text-xs text-muted-foreground leading-relaxed">
            
            <div className="flex flex-col gap-2 text-left">
              <h3 className="text-sm font-heading font-extrabold text-foreground">1. Personal Credentials Collected</h3>
              <p>
                {"We collect basic registration inputs like your email handle, verified college ID card scans (for tutor applications), linked UPI handles (for payout transfers), and student profile name tags."}
              </p>
            </div>

            <Divider variant="dashed" />

            <div className="flex flex-col gap-2 text-left">
              <h3 className="text-sm font-heading font-extrabold text-foreground">2. Course Material Ownership</h3>
              <p>
                {"Student tutors retain absolute ownership over their recorded lectures, slide outlines, and syllabus files. By publishing on EduEarn, tutors grant a non-exclusive license for student subscribers to stream files."}
              </p>
            </div>

            <Divider variant="dashed" />

            <div className="flex flex-col gap-2 text-left">
              <h3 className="text-sm font-heading font-extrabold text-foreground">3. Payment &amp; Wallet Data</h3>
              <p>
                {"EduEarn does not process or cache credit card credentials. Subscription billing transactions and tutor payout transfers are processed via secure encrypted UPI gateways."}
              </p>
            </div>

            <Divider variant="dashed" />

            <div className="flex flex-col gap-2 text-left">
              <h3 className="text-sm font-heading font-extrabold text-foreground">4. Cookies &amp; Local Storage</h3>
              <p>
                {"We use browser localStorage to cache features like recent search history tags and layout theme selections (dark/light toggles). You can delete local cache files via your browser settings anytime."}
              </p>
            </div>

          </Card>
        </Container>
      </section>
    </PageWrapper>
  );
}
