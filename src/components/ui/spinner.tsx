import React from "react";
import { cn } from "../../utils/cn";

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
}

export function Spinner({ className, size = "md", ...props }: SpinnerProps) {
  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-muted border-t-primary shrink-0",
        {
          "w-4 h-4 border-2": size === "sm",
          "w-8 h-8 border-2": size === "md",
          "w-12 h-12 border-3": size === "lg",
        },
        className
      )}
      role="status"
      aria-label="loading"
      {...props}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}
export default Spinner;
