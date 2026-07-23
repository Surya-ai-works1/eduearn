import React from "react";
import { Compass, AlertOctagon, WifiOff, FolderSearch, ShieldAlert } from "lucide-react";
import { cn } from "../../utils/cn";

export interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: "404" | "500" | "offline" | "no-results" | "denied" | "default";
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export function ErrorState({
  type = "default",
  title,
  description,
  action,
  className,
  ...props
}: ErrorStateProps) {
  const defaults = {
    "404": {
      title: "Screen not found",
      description: "The page you are looking for does not exist. It may have been moved or renamed.",
      icon: <Compass size={36} className="text-primary animate-[spin_10s_linear_infinite]" />,
    },
    "500": {
      title: "Internal server error",
      description: "Our systems encountered a problem. Please try reloading or contact support.",
      icon: <AlertOctagon size={36} className="text-destructive" />,
    },
    offline: {
      title: "No internet connection",
      description: "Please check your network cables, WiFi signals, and try reconnecting again.",
      icon: <WifiOff size={36} className="text-muted-foreground" />,
    },
    "no-results": {
      title: "No results match queries",
      description: "No listings matched your criteria. Try adjusting filters or resetting queries.",
      icon: <FolderSearch size={36} className="text-amber-500" />,
    },
    denied: {
      title: "Permission denied",
      description: "You do not have administrative clearance to access this portal path.",
      icon: <ShieldAlert size={36} className="text-red-650" />,
    },
    default: {
      title: "An error occurred",
      description: "An unexpected error occurred. Please try again later.",
      icon: <AlertOctagon size={36} className="text-destructive" />,
    },
  };

  const current = defaults[type];
  const displayTitle = title || current.title;
  const displayDesc = description || current.description;
  const displayIcon = current.icon;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 rounded-card border border-destructive/20 bg-destructive/5 max-w-md mx-auto my-6 select-none",
        className
      )}
      {...props}
    >
      <div className="w-16 h-16 rounded-full bg-card border border-border shadow-sm hover:shadow-md transition-shadow duration-200/40 flex items-center justify-center mb-5 shrink-0 shadow-soft">
        {displayIcon}
      </div>
      <h3 className="text-base font-heading font-extrabold text-foreground mb-2">
        {displayTitle}
      </h3>
      <p className="text-xs text-muted-foreground leading-relaxed mb-6 max-w-sm">
        {displayDesc}
      </p>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
export default ErrorState;
