import React, { useState, useId } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "../../utils/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: boolean;
  prefixIcon?: React.ReactNode;
  suffixIcon?: React.ReactNode;
  isFloating?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = "text",
      label,
      error,
      success,
      prefixIcon,
      suffixIcon,
      isFloating = false,
      id,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const inputType = isPassword ? (showPassword ? "text" : "password") : type;

    const generatedId = useId();
    const inputId = id || `input-${generatedId}`;

    return (
      <div className="w-full flex flex-col gap-1.5 text-left relative">
        {/* Static Label (Non-floating) */}
        {label && !isFloating && (
          <label htmlFor={inputId} className="text-xs font-bold text-foreground">
            {label}
          </label>
        )}

        <div className="relative flex items-center w-full">
          {/* Prefix Icon */}
          {prefixIcon && (
            <div className="absolute left-3.5 text-muted-foreground pointer-events-none flex items-center">
              {prefixIcon}
            </div>
          )}

          {/* Core Input Element */}
          <input
            id={inputId}
            type={inputType}
            ref={ref}
            className={cn(
              "w-full text-sm rounded-input border bg-card text-foreground transition-all placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed",
              {
                // Prefix and Suffix Padding adjustments
                "pl-10": prefixIcon,
                "pl-45": !prefixIcon,
                "pr-10": suffixIcon || isPassword,
                "pr-45": !suffixIcon && !isPassword,

                // Height and vertical padding
                "py-3 h-11": !isFloating,
                "pt-5 pb-1.5 h-12": isFloating,

                // Validation states
                "border-border hover:border-muted-foreground/30 focus:border-primary focus:ring-primary/10": !error && !success,
                "border-destructive focus:border-destructive focus:ring-destructive/10": error,
                "border-accent focus:border-accent focus:ring-accent/10": success,
              },
              className
            )}
            {...props}
          />

          {/* Floating Label overlay */}
          {label && isFloating && (
            <label
              htmlFor={inputId}
              className={cn(
                "absolute left-4.5 text-[10px] font-bold text-muted-foreground transition-all pointer-events-none transform -translate-y-2.5 top-5.5 origin-[0]"
              )}
            >
              {label}
            </label>
          )}

          {/* Suffix Icon or Password Toggle */}
          {isPassword ? (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 text-muted-foreground hover:text-foreground cursor-pointer focus:outline-none"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          ) : (
            suffixIcon && <div className="absolute right-3.5 text-muted-foreground">{suffixIcon}</div>
          )}
        </div>

        {/* Validation Sub-text */}
        {error && <p className="text-[10px] text-destructive font-medium px-1 mt-0.5">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
