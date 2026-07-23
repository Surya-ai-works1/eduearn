"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShieldAlert, Home, LogIn } from "lucide-react";
import { Container } from "../../components/layout/Container";
import { PageWrapper } from "../../components/layout/PageWrapper";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";

export default function UnauthorizedPage() {
  return (
    <PageWrapper>
      <section className="w-full py-24 text-center min-h-[80vh] flex items-center justify-center relative overflow-hidden select-none">
        {/* Background glow effects */}
        <div className="absolute inset-0 bg-hero-gradient opacity-5 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.06),transparent_45%)] pointer-events-none" />

        <Container className="max-w-md relative z-10">
          <Card
            variant="glass"
            hoverEffect="none"
            className="p-8 border-border bg-card shadow-floating flex flex-col gap-6 text-center"
          >
            {/* Animated alert illustration badge */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 150, damping: 12 }}
              className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-destructive mx-auto"
            >
              <ShieldAlert size={28} />
            </motion.div>

            {/* Error Message Header */}
            <div className="space-y-2">
              <span className="text-[9px] uppercase tracking-wider font-extrabold text-destructive bg-destructive/10 px-3 py-1 rounded-full mx-auto inline-block">
                Error 401 — Unauthorized
              </span>

              <h1 className="text-2xl font-heading font-extrabold text-foreground tracking-tight mt-2">
                Access Denied
              </h1>

              <p className="text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto">
                You must be logged in to view this page. Please sign in with your credentials to access this section of the EduEarn platform.
              </p>
            </div>

            {/* Visual crop border decoration */}
            <div className="h-px w-full bg-border/40 my-1" />

            {/* Navigation buttons */}
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Link href="/login" className="flex-1">
                <Button className="w-full flex items-center justify-center gap-1.5 shadow-premium">
                  <LogIn size={14} />
                  Login
                </Button>
              </Link>
              <Link href="/" className="flex-1">
                <Button variant="outline" className="w-full flex items-center justify-center gap-1.5">
                  <Home size={14} />
                  Return Home
                </Button>
              </Link>
            </div>
          </Card>
        </Container>
      </section>
    </PageWrapper>
  );
}
