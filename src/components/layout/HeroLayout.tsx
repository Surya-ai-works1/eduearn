"use client";

import React from "react";
import { Users, ShieldCheck, GraduationCap, Tv } from "lucide-react";
import { Container } from "./Container";
import { cn } from "../../utils/cn";

interface HeroLayoutProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title: React.ReactNode;
  subtitle: string;
  ctas?: React.ReactNode;
  illustration?: React.ReactNode;
  statistics?: { value: React.ReactNode; label: string }[];
  floatingWidgets?: React.ReactNode;
}

export function HeroLayout({
  title,
  subtitle,
  ctas,
  illustration,
  statistics,
  floatingWidgets,
  className,
  ...props
}: HeroLayoutProps) {
  return (
    <div
      className={cn(
        "relative min-h-[90vh] flex items-center justify-center pt-24 pb-16 overflow-hidden bg-background text-foreground transition-colors duration-300",
        className
      )}
      {...props}
    >
      {/* Premium Grid Background Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-0 pointer-events-none" />

      {/* Decorative Blob Glows */}
      <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-primary/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-accent/5 blur-[120px] pointer-events-none" />

      <Container className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Side Content Column (~52%) */}
        <div className="lg:col-span-7 flex flex-col items-start text-left">
          <div className="w-full">
            {title}
          </div>
          
          <p className="text-muted-foreground text-base md:text-lg lg:text-xl font-normal leading-relaxed mt-6 max-w-2xl">
            {subtitle}
          </p>

          {/* Action CTAs */}
          {ctas && <div className="mt-8 flex flex-wrap items-center gap-4 w-full">{ctas}</div>}

          {/* Statistics Counters */}
          {statistics && statistics.length > 0 && (
            <div className="flex flex-wrap items-center gap-6 md:gap-8 border-t border-border/40 pt-8 mt-12 w-full">
              {statistics.map((stat, idx) => {
                let icon = <Users size={16} />;
                let colorClass = "bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400";
                if (idx === 1) {
                  icon = <ShieldCheck size={16} />;
                  colorClass = "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400";
                } else if (idx === 2) {
                  icon = <GraduationCap size={16} />;
                  colorClass = "bg-purple-500/10 border-purple-500/20 text-purple-600 dark:text-purple-400";
                } else if (idx === 3) {
                  icon = <Tv size={16} />;
                  colorClass = "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400";
                }

                return (
                  <div key={idx} className="flex items-center gap-3">
                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center border", colorClass)}>
                      {icon}
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-sm md:text-base font-heading font-extrabold text-foreground tracking-tight leading-tight">
                        {stat.value}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                        {stat.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Side Illustration Column (~48%) */}
        <div className="lg:col-span-5 relative w-full flex justify-center items-center">
          <div className="relative w-full max-w-[720px] flex items-center justify-center">
            {/* Base Illustration */}
            {illustration}

            {/* Floating widget overlays */}
            {floatingWidgets && (
              <div className="absolute inset-0 pointer-events-none select-none">
                {floatingWidgets}
              </div>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}
export default HeroLayout;
