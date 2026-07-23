"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Lock, Home } from "lucide-react";
import { Container } from "../../components/layout/Container";
import { PageWrapper } from "../../components/layout/PageWrapper";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";

export default function ForbiddenPage() {
  return (
    <PageWrapper>
      <section className="w-full py-24 text-center min-h-[80vh] flex items-center justify-center relative overflow-hidden select-none">
        {/* Background glow effects */}
        <div className="absolute inset-0 bg-hero-gradient opacity-5 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.06),transparent_45%)] pointer-events-none" />

        <Container className="max-w-md relative z-10">
          <Card
            variant="glass"
            hoverEffect="none"
            className="p-8 border-border bg-card shadow-floating flex flex-col gap-6 text-center"
          >
            {/* Animated lock illustration badge */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 150, damping: 12 }}
              className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 mx-auto"
            >
              <Lock size={26} />
            </motion.div>

            {/* Error Message Header */}
            <div className="space-y-2">
              <span className="text-[9px] uppercase tracking-wider font-extrabold text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full mx-auto inline-block">
                Error 403 — Forbidden
              </span>

              <h1 className="text-2xl font-heading font-extrabold text-foreground tracking-tight mt-2">
                Restricted Access
              </h1>

              <p className="text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto">
                You do not have the required permissions to view this resource. Role-based security policies block this route for your profile classification.
              </p>
            </div>

            {/* Visual crop border decoration */}
            <div className="h-px w-full bg-border/40 my-1" />

            {/* Navigation buttons */}
            <div className="flex flex-col gap-3 w-full">
              <Link href="/" className="w-full">
                <Button className="w-full flex items-center justify-center gap-1.5 shadow-premium">
                  <Home size={14} />
                  Return to Home
                </Button>
              </Link>
              <Link href="/login" className="w-full">
                <Button variant="outline" className="w-full">
                  Sign In with Different Account
                </Button>
              </Link>
            </div>
          </Card>
        </Container>
      </section>
    </PageWrapper>
  );
}
