"use client";

import React, { useState } from "react";
import { Container } from "./Container";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { toast } from "sonner";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }
    
    // basic regex check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Successfully subscribed to our newsletter!");
      setEmail("");
    }, 1000);
  };

  return (
    <section className="w-full py-16 bg-background select-none">
      <Container className="max-w-4xl">
        <Card
          variant="glass"
          hoverEffect="glow"
          className="p-8 md:p-12 rounded-modal border-border/50 bg-card flex flex-col md:flex-row md:items-center justify-between gap-8 relative overflow-hidden text-left shadow-soft"
        >
          {/* Shifting Glow background */}
          <div className="absolute -bottom-20 -left-20 w-44 h-44 rounded-full bg-primary/10 blur-[60px] pointer-events-none animate-pulse" />

          {/* Left Description Column */}
          <div className="flex flex-col gap-2 max-w-md relative z-10">
            <h3 className="text-xl md:text-2xl font-heading font-extrabold text-foreground tracking-tight leading-tight">
              Stay Ahead of the Learning Curve
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Subscribe to get notified about upcoming live workshops, new AI courses, student tutor assess keys, and career guides.
            </p>
          </div>

          <form
            onSubmit={handleSubscribe}
            className="flex flex-col gap-2 w-full md:max-w-sm shrink-0 relative z-10"
          >
            <div className="flex flex-col sm:flex-row items-stretch gap-2">
              <input
                type="email"
                required
                placeholder="you@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-11 bg-background border border-border rounded-button text-xs px-3.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-semibold"
              />
              <Button type="submit" isLoading={loading} size="sm" className="h-11 px-5 text-[10px] font-bold uppercase tracking-wider shrink-0">
                Subscribe
              </Button>
            </div>
            
            {/* Trust spam notice */}
            <span className="text-[9px] text-muted-foreground font-semibold mt-1 px-1">
              No spam. Only product updates and learning resources.
            </span>
          </form>

        </Card>
      </Container>
    </section>
  );
}

export default Newsletter;
