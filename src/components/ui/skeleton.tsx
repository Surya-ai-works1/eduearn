import React from "react";
import { cn } from "../../utils/cn";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "rect" | "circle" | "course" | "tutor" | "card" | "table" | "dashboard" | "hero";
}

export function Skeleton({ className, variant = "rect", ...props }: SkeletonProps) {
  const baseClass = "bg-muted animate-pulse rounded-md";

  // Course card loading skeleton
  if (variant === "course") {
    return (
      <div className="border border-border rounded-card bg-card overflow-hidden flex flex-col h-full select-none">
        <div className="w-full aspect-video bg-muted animate-pulse" />
        <div className="p-5 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <div className="w-24 h-3 bg-muted animate-pulse rounded" />
            <div className="w-full h-5 bg-muted animate-pulse rounded mt-1" />
            <div className="w-2/3 h-5 bg-muted animate-pulse rounded" />
            <div className="w-28 h-3.5 bg-muted animate-pulse rounded mt-2" />
          </div>
          <div className="flex items-center justify-between border-t border-border/40 pt-4 mt-2">
            <div className="w-16 h-6 bg-muted animate-pulse rounded" />
            <div className="w-8 h-8 bg-muted animate-pulse rounded-button" />
          </div>
        </div>
      </div>
    );
  }

  // Tutor card loading skeleton
  if (variant === "tutor") {
    return (
      <div className="border border-border rounded-card bg-card p-6 flex flex-col justify-between h-full select-none">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-muted animate-pulse shrink-0" />
          <div className="flex flex-col gap-2 grow">
            <div className="w-28 h-4 bg-muted animate-pulse rounded" />
            <div className="w-16 h-3 bg-muted animate-pulse rounded" />
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <div className="w-12 h-4.5 bg-muted animate-pulse rounded-full" />
          <div className="w-14 h-4.5 bg-muted animate-pulse rounded-full" />
        </div>
        <div className="w-full h-8 bg-muted animate-pulse rounded-button mt-6" />
      </div>
    );
  }

  // Table rows loading skeleton
  if (variant === "table") {
    return (
      <div className="w-full flex flex-col gap-3 py-2">
        {Array.from({ length: 5 }).map((_, idx) => (
          <div key={idx} className="flex items-center justify-between py-2 border-b border-border/60">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-muted animate-pulse" />
              <div className="flex flex-col gap-1.5">
                <div className="w-36 h-3.5 bg-muted animate-pulse rounded" />
                <div className="w-20 h-2.5 bg-muted animate-pulse rounded" />
              </div>
            </div>
            <div className="w-16 h-4 bg-muted animate-pulse rounded" />
          </div>
        ))}
      </div>
    );
  }

  // Dashboard skeleton layout
  if (variant === "dashboard") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 flex flex-col gap-6">
          <div className="w-full h-48 bg-muted animate-pulse rounded-card" />
          <div className="w-full h-64 bg-muted animate-pulse rounded-card" />
        </div>
        <div className="flex flex-col gap-6">
          <div className="w-full h-32 bg-muted animate-pulse rounded-card" />
          <div className="w-full h-80 bg-muted animate-pulse rounded-card" />
        </div>
      </div>
    );
  }

  // Hero skeleton layout
  if (variant === "hero") {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center py-16">
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="w-3/4 h-12 bg-muted animate-pulse rounded-md" />
          <div className="w-1/2 h-12 bg-muted animate-pulse rounded-md" />
          <div className="w-full h-16 bg-muted animate-pulse rounded-md mt-4" />
          <div className="flex gap-4 mt-6">
            <div className="w-32 h-11 bg-muted animate-pulse rounded-button" />
            <div className="w-28 h-11 bg-muted animate-pulse rounded-button" />
          </div>
        </div>
        <div className="lg:col-span-5 w-full aspect-square bg-muted animate-pulse rounded-card" />
      </div>
    );
  }

  // Primitives
  return (
    <div
      className={cn(
        baseClass,
        {
          "w-full h-4": variant === "text",
          "w-full h-24": variant === "rect",
          "w-12 h-12 rounded-full": variant === "circle",
        },
        className
      )}
      {...props}
    />
  );
}
export default Skeleton;
