"use client";

import Link from "next/link";
import type React from "react";
import type { LucideIcon } from "lucide-react";

import { Button } from "../../../components/ui/button";
import { cn } from "../../../utils/cn";

interface AuthStatePanelProps {
  icon: LucideIcon;
  title: string;
  description: string;
  tone?: "primary" | "success" | "danger" | "warning";
  primaryAction?: {
    href: string;
    label: string;
  };
  secondaryAction?: React.ReactNode;
}

export function AuthStatePanel({
  icon: Icon,
  title,
  description,
  tone = "primary",
  primaryAction,
  secondaryAction,
}: AuthStatePanelProps) {
  return (
    <div className="flex flex-col items-center gap-5 py-3 text-center">
      <div
        className={cn(
          "flex h-14 w-14 items-center justify-center rounded-full border",
          tone === "primary" && "border-primary/20 bg-primary/10 text-primary",
          tone === "success" && "border-accent/20 bg-accent/10 text-accent",
          tone === "danger" && "border-destructive/20 bg-destructive/10 text-destructive",
          tone === "warning" && "border-amber-500/20 bg-amber-500/10 text-amber-600"
        )}
      >
        <Icon size={26} aria-hidden="true" />
      </div>
      <div>
        <h1 className="font-heading text-xl font-extrabold tracking-tight text-foreground">{title}</h1>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      {primaryAction && (
        <Link href={primaryAction.href} className="w-full">
          <Button className="w-full">{primaryAction.label}</Button>
        </Link>
      )}
      {secondaryAction}
    </div>
  );
}
