import React, { useMemo } from "react";
import { Heart, Scale, Eye, Share2, Star, Users, Clock, Award } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface CourseCardProps {
  id: string;
  title: string;
  tutorName: string;
  tutorAvatar?: string;
  category: string;
  price: number;
  rating: number;
  duration: string;
  lessonsCount?: number;
  studentsCount: number;
  isAiVerified?: boolean;
  imageSrc?: string | null;
  level: string;
  isWishlisted: boolean;
  isCompared: boolean;
  onWishlistToggle: (e: React.MouseEvent) => void;
  onCompareToggle: (e: React.MouseEvent) => void;
  onPreviewClick: (e: React.MouseEvent) => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  id,
  title,
  tutorName,
  tutorAvatar,
  category,
  price,
  rating,
  duration,
  lessonsCount = 5,
  studentsCount,
  isAiVerified = false,
  imageSrc,
  level,
  isWishlisted,
  isCompared,
  onWishlistToggle,
  onCompareToggle,
  onPreviewClick,
}) => {
  // Mock badges for high-fidelity look
  const isBestseller = useMemo(() => studentsCount > 250, [studentsCount]);
  const isNew = useMemo(() => id.includes("000000000002") || id.includes("000000000005") || id.includes("000000000009") || id.includes("course-2") || id.includes("course-5") || id.includes("course-9"), [id]);

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}/courses/${id}`);
      toast.success("Share link copied to clipboard!");
    } else {
      toast.info(`Sharing: ${title}`);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="group relative flex flex-col h-full bg-card border border-border/80 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 select-none cursor-pointer focus-within:ring-2 focus-within:ring-primary/45"
      role="article"
      aria-label={`Course: ${title}`}
    >
      {/* 1. Header Media Thumbnail */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-950/20 border-b border-border/40">
        {imageSrc ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={imageSrc}
            alt=""
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/20 text-primary/40 text-4xl">
            <Award size={48} className="animate-pulse" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {isBestseller && (
            <span className="px-2.5 py-0.5 bg-yellow-500 text-black text-[9px] font-heading font-extrabold uppercase rounded-full shadow-lg">
              Bestseller
            </span>
          )}
          {isNew && (
            <span className="px-2.5 py-0.5 bg-primary text-primary-foreground text-[9px] font-heading font-extrabold uppercase rounded-full shadow-lg">
              New
            </span>
          )}
        </div>

        {/* Quick action overlay buttons */}
        <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 z-10">
          <button
            onClick={onWishlistToggle}
            className={`p-2.5 rounded-full backdrop-blur-md border transition-all ${
              isWishlisted
                ? "bg-red-500 border-red-500 text-white"
                : "bg-white/90 border-white/20 text-slate-800 hover:bg-red-500 hover:text-white"
            }`}
            title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            aria-label="Wishlist"
          >
            <Heart size={15} fill={isWishlisted ? "currentColor" : "none"} />
          </button>
          
          <button
            onClick={onCompareToggle}
            className={`p-2.5 rounded-full backdrop-blur-md border transition-all ${
              isCompared
                ? "bg-primary border-primary text-primary-foreground"
                : "bg-white/90 border-white/20 text-slate-800 hover:bg-primary hover:text-white"
            }`}
            title={isCompared ? "Remove from comparison" : "Compare this course"}
            aria-label="Compare"
          >
            <Scale size={15} />
          </button>

          <button
            onClick={onPreviewClick}
            className="p-2.5 bg-white/90 hover:bg-white text-slate-800 rounded-full border border-white/20 hover:scale-110 transition-all"
            title="Quick preview details"
            aria-label="Quick preview"
          >
            <Eye size={15} />
          </button>

          <button
            onClick={handleShare}
            className="p-2.5 bg-white/90 hover:bg-white text-slate-800 rounded-full border border-white/20 hover:scale-110 transition-all"
            title="Copy course link"
            aria-label="Share"
          >
            <Share2 size={15} />
          </button>
        </div>
      </div>

      {/* 2. Card Content details */}
      <div className="p-5 flex flex-col grow justify-between gap-4 text-left">
        <div className="space-y-2">
          {/* Category & Level tag */}
          <div className="flex items-center justify-between text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
            <span>{category}</span>
            <span className="px-2 py-0.5 bg-muted/65 rounded font-medium">{level}</span>
          </div>

          {/* Title */}
          <h3 className="font-heading font-extrabold text-sm text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors duration-300">
            <span className="outline-none" tabIndex={0}>
              {title}
            </span>
          </h3>

          {/* Tutor Name & Status */}
          <div className="flex items-center gap-1.5 pt-0.5">
            {tutorName === "Awaiting Tutor Assignment" || !tutorAvatar ? (
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded">
                Awaiting Tutor Assignment
              </span>
            ) : (
              <>
                <img
                  src={tutorAvatar}
                  alt=""
                  className="w-5 h-5 rounded-full border border-border object-cover"
                />
                <span className="text-[11px] text-muted-foreground font-semibold hover:text-foreground transition-colors">
                  {tutorName}
                </span>
                {isAiVerified && (
                  <span className="inline-block w-1.5 h-1.5 bg-emerald-500 rounded-full" title="Verified Student Tutor" />
                )}
              </>
            )}
          </div>
        </div>

        {/* 3. Metrics & Footer */}
        <div className="border-t border-border/40 pt-4 flex flex-col gap-2.5">
          {/* Ratings & Students */}
          <div className="flex items-center justify-between text-[11px] text-muted-foreground select-none font-medium">
            {rating > 0 ? (
              <div className="flex items-center gap-1">
                <Star size={13} className="text-yellow-500 fill-current" />
                <span className="font-bold text-foreground">{rating.toFixed(1)}</span>
                <span>({studentsCount} learners)</span>
              </div>
            ) : (
              <span className="text-[10px] text-muted-foreground italic">Catalog Template</span>
            )}
            <div className="flex items-center gap-1">
              <Users size={12} />
              <span>{lessonsCount} lessons</span>
            </div>
          </div>

          {/* Price & Duration */}
          <div className="flex items-center justify-between">
            <span className="font-heading font-black text-base text-foreground">
              {price === 0 ? (
                <span className="text-emerald-500">Free</span>
              ) : (
                `₹${price.toLocaleString()}`
              )}
            </span>
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-semibold uppercase">
              <Clock size={11} />
              <span>{duration}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
