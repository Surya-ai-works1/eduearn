import React from "react";
import { BookOpen, Users, Search, Heart, Award, LayoutDashboard } from "lucide-react";
import { cn } from "../../utils/cn";

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: "courses" | "tutors" | "search" | "wishlist" | "certificates" | "dashboard" | "default";
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({
  type = "default",
  title,
  description,
  action,
  className,
  ...props
}: EmptyStateProps) {
  const defaults = {
    courses: {
      title: "No courses found",
      description: "We couldn't find any courses matching your selection. Try browsing other categories.",
      icon: <BookOpen size={36} className="text-primary" />,
    },
    tutors: {
      title: "No tutors found",
      description: "There are currently no tutors available for this search. Check back later.",
      icon: <Users size={36} className="text-accent" />,
    },
    search: {
      title: "No search results",
      description: "No results matched your search queries. Try checking your spelling or use general keywords.",
      icon: <Search size={36} className="text-muted-foreground" />,
    },
    wishlist: {
      title: "Your wishlist is empty",
      description: "Explore our verified courses catalog and save your favorites here.",
      icon: <Heart size={36} className="text-red-500" />,
    },
    certificates: {
      title: "No certificates yet",
      description: "Complete course assignments and finish quizzes to earn verified certificates.",
      icon: <Award size={36} className="text-amber-500" />,
    },
    dashboard: {
      title: "No active progress",
      description: "You haven't enrolled in any courses yet. Start your learning journey today.",
      icon: <LayoutDashboard size={36} className="text-purple-650" />,
    },
    default: {
      title: "No data available",
      description: "There is currently no information to show on this view.",
      icon: <BookOpen size={36} className="text-muted-foreground" />,
    },
  };

  const current = defaults[type];
  const displayTitle = title || current.title;
  const displayDesc = description || current.description;
  const displayIcon = current.icon;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 rounded-card border border-dashed border-border bg-card max-w-md mx-auto my-6 select-none shadow-soft",
        className
      )}
      {...props}
    >
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-5 shrink-0 border border-border/40">
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
export default EmptyState;
