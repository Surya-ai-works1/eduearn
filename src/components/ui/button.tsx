import React from "react";
import { cn } from "../../utils/cn";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "success" | "danger" | "ai";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading = false, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center font-heading font-semibold rounded-button transition-all duration-200 select-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/80 disabled:opacity-50 disabled:cursor-not-allowed",
          {
            // Variants
            "bg-btn-gradient text-white shadow-soft hover:opacity-95 active:scale-[0.98]": variant === "primary",
            "bg-secondary text-secondary-foreground shadow-soft hover:opacity-95 active:scale-[0.98]": variant === "secondary",
            "border border-border bg-card hover:bg-muted text-foreground active:scale-[0.98]": variant === "outline",
            "text-foreground hover:bg-muted active:bg-muted/80": variant === "ghost",
            "bg-success-gradient text-white shadow-soft hover:opacity-95 active:scale-[0.98]": variant === "success",
            "bg-red-650 hover:bg-red-700 text-white active:scale-[0.98]": variant === "danger",
            "bg-ai-gradient text-white shadow-soft hover:opacity-95 active:scale-[0.98]": variant === "ai",
            
            // Sizes
            "text-xs px-3 py-1.5 h-8 gap-1.5": size === "sm",
            "text-sm px-5 py-2.5 h-10 gap-2": size === "md",
            "text-base px-6 py-3 h-12 gap-2.5": size === "lg",
          },
          className
        )}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
