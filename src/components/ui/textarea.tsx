import React from "react";
import { cn } from "../../utils/cn";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        {label && (
          <label htmlFor={textareaId} className="text-xs font-bold text-foreground">
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          className={cn(
            "w-full text-sm rounded-input border bg-card text-foreground px-4.5 py-3 min-h-[100px] transition-all placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed",
            {
              "border-border hover:border-muted-foreground/30 focus:border-primary focus:ring-primary/10": !error,
              "border-destructive focus:border-destructive focus:ring-destructive/10": error,
            },
            className
          )}
          {...props}
        />
        {error && <p className="text-[10px] text-destructive font-medium px-1 mt-0.5">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
export default Textarea;
