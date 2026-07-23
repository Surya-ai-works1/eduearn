import React from "react";
import { cn } from "../../utils/cn";
import { Container } from "./Container";

interface SectionWrapperProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  bg?: "default" | "muted" | "dark" | "transparent" | "glass";
  noContainer?: boolean;
}

export function SectionWrapper({
  children,
  className,
  bg = "default",
  noContainer = false,
  ...props
}: SectionWrapperProps) {
  return (
    <section
      className={cn(
        "py-16 md:py-24 overflow-hidden relative", // standard 96px section padding
        {
          "bg-background text-foreground": bg === "default",
          "bg-muted/40 text-foreground": bg === "muted",
          "bg-brand-navy text-white dark:bg-black/30": bg === "dark",
          "bg-transparent": bg === "transparent",
          "glassmorphism text-foreground": bg === "glass",
        },
        className
      )}
      {...props}
    >
      {noContainer ? children : <Container>{children}</Container>}
    </section>
  );
}
export default SectionWrapper;
