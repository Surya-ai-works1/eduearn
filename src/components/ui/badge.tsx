import React from "react";
import { cn } from "../../utils/cn";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "primary" | "secondary" | "success" | "danger" | "warning" | "ai" | "live" | "outline";
  children: React.ReactNode;
}

export function Badge({ className, variant = "primary", children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider font-extrabold select-none border border-transparent",
        {
          "bg-primary/10 text-primary border-primary/10": variant === "primary",
          "bg-slate-900/10 dark:bg-slate-800/20 text-slate-900 dark:text-muted-foreground border-border/10 dark:border-border/40": variant === "secondary",
          "bg-accent/10 text-accent border-accent/10": variant === "success",
          "bg-destructive/10 text-destructive border-destructive/10": variant === "danger",
          "bg-amber-500/10 text-amber-500 border-amber-500/10": variant === "warning",
          "bg-ai-gradient text-white shadow-soft": variant === "ai",
          "bg-red-500 text-white animate-pulse": variant === "live",
          "border-border bg-card text-muted-foreground": variant === "outline",
        },
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
export default Badge;
