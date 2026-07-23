"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Users,
  Calendar,
  Sparkles,
  Plus,
  BarChart3,
} from "lucide-react";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

export const EmptyState = React.memo(function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className = "",
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col items-center justify-center text-center py-16 px-8 ${className}`}
    >
      {icon && (
        <div className="w-16 h-16 rounded-2xl bg-muted/50 border border-border/60 flex items-center justify-center mb-5 text-muted-foreground/60">
          {icon}
        </div>
      )}
      <h3 className="text-sm font-heading font-bold text-foreground mb-2">{title}</h3>
      <p className="text-xs text-muted-foreground max-w-xs leading-relaxed mb-6">{description}</p>
      <div className="flex items-center gap-3">
        {actionLabel && onAction && (
          <button
            onClick={onAction}
            className="h-9 px-4 bg-primary text-white text-xs font-bold rounded-button hover:bg-primary/90 transition-colors flex items-center gap-1.5 shadow-soft cursor-pointer"
          >
            <Plus size={13} />
            {actionLabel}
          </button>
        )}
        {secondaryActionLabel && onSecondaryAction && (
          <button
            onClick={onSecondaryAction}
            className="h-9 px-4 bg-muted text-foreground text-xs font-bold rounded-button hover:bg-muted/70 transition-colors cursor-pointer"
          >
            {secondaryActionLabel}
          </button>
        )}
      </div>
    </motion.div>
  );
});

// ─── PRESET EMPTY STATES ──────────────────────────────────────────────────────

export const NoCourses = ({ onAction }: { onAction: () => void }) => (
  <EmptyState
    icon={<BookOpen size={28} />}
    title="No courses yet"
    description="Create your first course to start earning. Your first published course unlocks full tutor analytics."
    actionLabel="Create Course"
    onAction={onAction}
  />
);

export const NoStudents = ({ onAction }: { onAction: () => void }) => (
  <EmptyState
    icon={<Users size={28} />}
    title="No students enrolled"
    description="Share your course link or publish to the marketplace to attract your first students."
    actionLabel="Share Course"
    onAction={onAction}
  />
);

export const NoClasses = ({ onAction }: { onAction: () => void }) => (
  <EmptyState
    icon={<Calendar size={28} />}
    title="No live classes scheduled"
    description="Schedule your first live class to engage students in real time. Supports Google Meet and Zoom."
    actionLabel="Schedule Class"
    onAction={onAction}
  />
);

export const NoEarnings = ({ onAction }: { onAction: () => void }) => (
  <EmptyState
    icon={<BarChart3 size={28} />}
    title="No earnings yet"
    description="Publish your first course to start earning. Once students enroll, your revenue will appear here."
    actionLabel="Publish First Course"
    onAction={onAction}
  />
);

export const NoReviews = () => (
  <EmptyState
    icon={<Sparkles size={28} />}
    title="No reviews yet"
    description="Student reviews will appear here once they complete your courses. Keep publishing quality content!"
  />
);
