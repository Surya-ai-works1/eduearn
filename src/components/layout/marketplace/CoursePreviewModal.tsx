"use client";

import React from "react";
import { Dialog } from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Divider } from "../../ui/divider";
import { Star, Clock, User, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "../../../utils/formatCurrency";

interface CourseType {
  id: string;
  title: string;
  tutorName: string;
  category: string;
  price: number;
  level: string;
  rating: number;
  duration: string;
  lessonsCount: number;
  description: string;
  studentsCount?: number;
}

interface CoursePreviewModalProps {
  course: CourseType | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CoursePreviewModal({
  course,
  isOpen,
  onClose,
}: CoursePreviewModalProps) {
  if (!course) return null;

  // Render mock curriculum preview lectures based on course title
  const curriculumSample = [
    "Introduction to course foundations and environment setup",
    "Deep dive into intermediate modules, models, and practices",
    "Hands-on project: Building and deploying a real-world task",
    "Expert feedback panel, doubt clearing workshop, and exit exam",
  ];

  const handleEnroll = () => {
    toast.success(`Successfully registered interest for ${course.title}! Enrollments open in Phase 3.2.`);
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Quick Course Preview"
      className="max-w-lg"
    >
      <div className="flex flex-col gap-4 text-left select-none text-xs">
        
        {/* Course Header */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <Badge variant="primary" className="capitalize">
              {course.category}
            </Badge>
            <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
              <Clock size={11} />
              {course.duration}
            </span>
          </div>
          
          <h3 className="text-sm font-heading font-extrabold text-foreground mt-1 leading-tight">
            {course.title}
          </h3>
          
          <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1 mt-0.5">
            <User size={11} className="text-primary" />
            Taught by {course.tutorName}
          </span>
        </div>

        <Divider variant="solid" className="my-0.5" />

        {/* Course Description */}
        <div className="flex flex-col gap-1">
          <span className="text-[8px] uppercase tracking-wider font-extrabold text-muted-foreground">Description</span>
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            {course.description}
          </p>
        </div>

        {/* Curriculum Preview List */}
        <div className="flex flex-col gap-2">
          <span className="text-[8px] uppercase tracking-wider font-extrabold text-muted-foreground">Syllabus Highlights</span>
          <div className="flex flex-col gap-1.5 pl-1.5 border-l border-border">
            {curriculumSample.map((lecture, idx) => (
              <div key={idx} className="flex items-start gap-2 text-[10px] text-foreground font-semibold">
                <CheckCircle2 size={12} className="text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  Unit {idx + 1}: {lecture}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Metadata stats */}
        <div className="grid grid-cols-3 gap-3.5 bg-muted/40 p-2.5 rounded-input border border-border/30 text-center">
          <div className="flex flex-col">
            <span className="text-[8px] uppercase font-bold text-muted-foreground/80">Rating</span>
            <span className="text-xs font-extrabold text-amber-500 flex items-center justify-center gap-0.5 mt-0.5">
              <Star size={11} className="fill-amber-500 text-amber-500" />
              {course.rating.toFixed(1)}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[8px] uppercase font-bold text-muted-foreground/80">Lessons</span>
            <span className="text-xs font-extrabold text-foreground mt-0.5">
              {course.lessonsCount} lessons
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[8px] uppercase font-bold text-muted-foreground/80">Level</span>
            <span className="text-xs font-extrabold text-foreground capitalize mt-0.5 truncate">
              {course.level.replace("_", " ")}
            </span>
          </div>
        </div>

        {/* Actions Row */}
        <div className="flex items-center justify-between border-t border-border/60 pt-4 mt-2">
          <div className="flex flex-col">
            <span className="text-[8px] uppercase font-bold text-muted-foreground/80">Course Price</span>
            <span className="text-base font-heading font-extrabold text-foreground mt-0.5 tracking-tight">
              {course.price === 0 ? "Free" : formatCurrency(course.price)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleEnroll}>
              Enroll Now
            </Button>
          </div>
        </div>

      </div>
    </Dialog>
  );
}

export default CoursePreviewModal;
