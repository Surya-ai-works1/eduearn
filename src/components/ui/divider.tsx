import React from "react";
import { cn } from "../../utils/cn";

export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
  variant?: "solid" | "dashed" | "gradient";
}

export function Divider({
  className,
  orientation = "horizontal",
  variant = "solid",
  ...props
}: DividerProps) {
  return (
    <div
      className={cn(
        "shrink-0 select-none",
        {
          // Orientations
          "w-full": orientation === "horizontal",
          "h-full min-h-[1em] w-[1px]": orientation === "vertical",

          // Variants
          "border-t border-border": orientation === "horizontal" && variant === "solid",
          "border-t border-dashed border-border": orientation === "horizontal" && variant === "dashed",
          "h-[1px] bg-gradient-to-right bg-gradient-to-r from-transparent via-border to-transparent":
            orientation === "horizontal" && variant === "gradient",

          "border-l border-border": orientation === "vertical" && variant === "solid",
          "border-l border-dashed border-border": orientation === "vertical" && variant === "dashed",
          "w-[1px] bg-gradient-to-t bg-gradient-to-b from-transparent via-border to-transparent":
            orientation === "vertical" && variant === "gradient",
        },
        className
      )}
      role="separator"
      {...props}
    />
  );
}
export default Divider;
