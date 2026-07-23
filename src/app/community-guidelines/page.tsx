"use client";

import React from "react";
import Link from "next/link";
import { Container } from "../../components/layout/Container";
import { PageWrapper } from "../../components/layout/PageWrapper";
import { Card } from "../../components/ui/card";
import { Divider } from "../../components/ui/divider";

export default function CommunityGuidelinesPage() {
  return (
    <PageWrapper>
      <section className="w-full py-12 bg-muted/20 border-b border-border/40 text-left select-none">
        <Container className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-semibold">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <span>/</span>
            <span className="text-foreground">Community Guidelines</span>
          </div>
          <div className="flex flex-col gap-2 mt-1">
            <h1 className="text-3xl md:text-4xl font-heading font-extrabold text-foreground tracking-tight">
              Community Guidelines
            </h1>
            <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
              Last updated: July 2026. Rules for interaction, forums, and peer learning behavior.
            </p>
          </div>
        </Container>
      </section>

      <section className="w-full py-16 select-none text-left">
        <Container className="max-w-3xl">
          <Card variant="default" className="p-8 border-border bg-card flex flex-col gap-6 text-xs text-muted-foreground leading-relaxed">
            <div className="flex flex-col gap-2 text-left">
              <h3 className="text-sm font-heading font-extrabold text-foreground">1. Mutual Respect</h3>
              <p>
                EduEarn is a collaborative marketplace. Maintain professional courtesy in group whiteboard tabs, chat messages, and discussions.
              </p>
            </div>
            <Divider variant="dashed" />
            <div className="flex flex-col gap-2 text-left">
              <h3 className="text-sm font-heading font-extrabold text-foreground">2. Academic Integrity</h3>
              <p>
                Sharing answers, plagiarizing coursework, or completing assignments for other peers is strictly prohibited.
              </p>
            </div>
            <Divider variant="dashed" />
            <div className="flex flex-col gap-2 text-left">
              <h3 className="text-sm font-heading font-extrabold text-foreground">3. Safety Controls</h3>
              <p>
                Do not publish advertisements, links to third-party payment pages, or unverified files. Report breaches to moderators.
              </p>
            </div>
          </Card>
        </Container>
      </section>
    </PageWrapper>
  );
}
