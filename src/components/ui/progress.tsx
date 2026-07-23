import React from "react";
import { cn } from "../../utils/cn";

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0 to 100
  variant?: "primary" | "success" | "ai";
}

export function Progress({ className, value, variant = "primary", ...props }: ProgressProps) {
  const percentage = Math.min(Math.max(value, 0), 100);

  return (
    <div
      className={cn("w-full h-2 rounded-full bg-muted overflow-hidden relative select-none", className)}
      role="progressbar"
      aria-valuenow={percentage}
      aria-valuemin={0}
      aria-valuemax={100}
      {...props}
    >
      <div
        className={cn("h-full rounded-full transition-all duration-300 ease-out", {
          "bg-primary": variant === "primary",
          "bg-accent": variant === "success",
          "bg-ai-gradient": variant === "ai",
        })}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
export default Progress;
