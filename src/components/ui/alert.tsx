import React from "react";
import { CheckCircle, AlertTriangle, AlertOctagon, Info } from "lucide-react";
import { cn } from "../../utils/cn";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "success" | "warning" | "danger" | "info";
  title?: string;
  description: string;
}

export function Alert({ className, variant = "info", title, description, ...props }: AlertProps) {
  const icons = {
    info: <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />,
    success: <CheckCircle size={16} className="text-accent shrink-0 mt-0.5" />,
    warning: <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />,
    danger: <AlertOctagon size={16} className="text-destructive shrink-0 mt-0.5" />,
  };

  return (
    <div
      className={cn(
        "p-4 rounded-input border flex items-start gap-3 text-left w-full",
        {
          "bg-blue-500/5 border-blue-500/10 text-blue-900 dark:text-blue-300": variant === "info",
          "bg-accent/5 border-accent/10 text-accent-foreground": variant === "success",
          "bg-amber-500/5 border-amber-500/10 text-amber-900 dark:text-amber-400": variant === "warning",
          "bg-destructive/5 border-destructive/10 text-destructive": variant === "danger",
        },
        className
      )}
      role="alert"
      {...props}
    >
      {icons[variant]}
      <div className="flex flex-col gap-1 overflow-hidden">
        {title && <span className="text-xs font-bold font-heading">{title}</span>}
        <span className="text-xs leading-relaxed opacity-90">{description}</span>
      </div>
    </div>
  );
}
export default Alert;
