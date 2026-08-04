"use client";

import React from "react";
import { ExploreAcademies } from "../../components/layout/ExploreAcademies";
import { PageWrapper } from "../../components/layout/PageWrapper";
import { Container } from "../../components/layout/Container";
import Link from "next/link";

export default function AcademiesIndexPage() {
  return (
    <PageWrapper>
      {/* Banner */}
      <section className="w-full py-12 bg-muted/20 border-b border-border/40 text-left select-none">
        <Container className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-semibold">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <span>/</span>
            <span className="text-foreground">Academies</span>
          </div>

          <div className="flex flex-col gap-2 mt-1">
            <h1 className="text-3xl md:text-4xl font-heading font-extrabold text-foreground tracking-tight">
              EduEarn Academies
            </h1>
            <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
              Explore specialized learning academies tailored to different academic levels, technical career paths, and lifestyle interests.
            </p>
          </div>
        </Container>
      </section>

      {/* Grid */}
      <ExploreAcademies />
    </PageWrapper>
  );
}
