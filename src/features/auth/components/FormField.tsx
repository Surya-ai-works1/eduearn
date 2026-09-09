"use client";

import React from "react";
import { AlertCircle } from "lucide-react";

import { cn } from "../../../utils/cn";

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
  action?: React.ReactNode;
}

export const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, icon, rightElement, action, className, id, ...props }, ref) => {
    const inputId = id ?? props.name;
    const errorId = error && inputId ? `${inputId}-error` : undefined;

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <label htmlFor={inputId} className="text-sm font-bold text-foreground">
            {label}
          </label>
          {action}
        </div>
        <div className="relative">
          {icon && (
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
              {icon}
            </span>
          )}
          <input
            id={inputId}
            ref={ref}
            aria-invalid={Boolean(error)}
            aria-describedby={errorId}
            className={cn(
              "h-12 w-full rounded-input border border-border bg-card/85 px-4 text-sm font-medium text-foreground shadow-soft transition-all placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-60",
              icon && "pl-11",
              rightElement && "pr-12",
              error && "border-destructive focus:border-destructive focus:ring-destructive/10",
              className
            )}
            {...props}
          />
          {rightElement && (
            <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center justify-center">
              {rightElement}
            </div>
          )}
        </div>
        {error && (
          <p id={errorId} className="flex items-center gap-1.5 text-xs font-semibold text-destructive" role="alert">
            <AlertCircle size={13} aria-hidden="true" />
            {error}
          </p>
        )}
      </div>
    );
  }
);

FormField.displayName = "FormField";
