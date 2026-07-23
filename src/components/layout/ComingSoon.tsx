"use client";

import React from "react";
import Link from "next/link";
import { Home, HelpCircle } from "lucide-react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { PageWrapper } from "./PageWrapper";
import { Container } from "./Container";

interface ComingSoonProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export function ComingSoon({ title, description, icon }: ComingSoonProps) {
  return (
    <PageWrapper>
      <div className="min-h-[75vh] flex items-center justify-center bg-background px-4 py-16 text-center select-none relative overflow-hidden">
        {/* Background gradients */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.08),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.06),transparent_32%)]"
        />

        <Container className="max-w-md relative z-10">
          <Card variant="glass" className="p-8 border-primary/10 flex flex-col items-center gap-6 shadow-premium">
            {icon && (
              <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center animate-pulse">
                {icon}
              </div>
            )}
            
            <div className="space-y-2">
              <h1 className="text-2xl font-heading font-extrabold text-foreground tracking-tight">
                {title}
              </h1>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {description}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center mt-2">
              <Link href="/" passHref className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto h-10 px-5 text-xs font-bold gap-2">
                  <Home size={14} />
                  Go Home
                </Button>
              </Link>
              
              <Link href="/support" passHref className="w-full sm:w-auto">
                <Button variant="outline" className="w-full sm:w-auto h-10 px-5 text-xs font-bold gap-2">
                  <HelpCircle size={14} />
                  Support
                </Button>
              </Link>
            </div>
          </Card>
        </Container>
      </div>
    </PageWrapper>
  );
}
