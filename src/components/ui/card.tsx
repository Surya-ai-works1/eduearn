"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Star, Award, Check, ArrowRight, ArrowUpRight, ArrowDownRight, Calendar, Heart } from "lucide-react";
import { toast } from "sonner";
import { cn } from "../../utils/cn";
import { formatCurrency } from "../../utils/formatCurrency";
import { getDefaultPricingRule } from "../../features/payments/services/marketplaceService";

// ==========================================
// 1. BASE CARD CONTAINER
// ==========================================
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: "default" | "glass" | "bordered" | "muted";
  hoverEffect?: "none" | "lift" | "glow";
}

export function Card({
  children,
  className,
  variant = "default",
  hoverEffect = "lift",
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-card p-6 border transition-all duration-300 relative overflow-hidden select-none",
        {
          // Variants
          "bg-card border-border shadow-soft": variant === "default",
          "glass-card-light dark:glass-card-dark": variant === "glass",
          "border-border bg-transparent": variant === "bordered",
          "bg-muted/40 border-transparent": variant === "muted",

          // Hover animations
          "hover:-translate-y-2.5 hover:shadow-premium": hoverEffect === "lift",
          "hover:border-primary/40 hover:ring-2 hover:ring-primary/5": hoverEffect === "glow",
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// ==========================================
// 2. CATEGORY CARD
// ==========================================
interface CategoryCardProps {
  id: string;
  name: string;
  count?: number;
  className?: string;
}

export function CategoryCard({ id, name, count = 0, className }: CategoryCardProps) {
  return (
    <Link href={`/courses?category=${id}`} className="block">
      <Card
        variant="default"
        hoverEffect="lift"
        className={cn("flex flex-col items-start gap-4 p-6 group cursor-pointer", className)}
      >
        <div className="w-12 h-12 rounded-input bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300">
          <Award size={22} />
        </div>
        <div>
          <h4 className="text-sm font-heading font-extrabold text-foreground group-hover:text-primary transition-colors">
            {name}
          </h4>
          {count > 0 && (
            <p className="text-[10px] text-muted-foreground font-semibold mt-1">
              {count} Courses
            </p>
          )}
        </div>
      </Card>
    </Link>
  );
}

// ==========================================
// 3. FEATURE CARD
// ==========================================
interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  className?: string;
}

export function FeatureCard({ title, description, icon, className }: FeatureCardProps) {
  return (
    <Card variant="glass" hoverEffect="glow" className={cn("p-6 flex flex-col items-start gap-4", className)}>
      <div className="w-10 h-10 rounded-input bg-primary/10 text-primary flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <h4 className="text-sm font-heading font-extrabold text-foreground mb-1.5">{title}</h4>
        <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </Card>
  );
}

// ==========================================
// 4. STATISTICS CARD
// ==========================================
interface StatisticsCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  change?: {
    value: string | number;
    type: "increase" | "decrease";
  };
  className?: string;
}

export function StatisticsCard({ label, value, icon, change, className }: StatisticsCardProps) {
  return (
    <Card variant="default" hoverEffect="none" className={cn("p-6 flex items-center justify-between gap-4", className)}>
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
        <span className="text-2xl md:text-3xl font-heading font-extrabold text-foreground tracking-tight">{value}</span>
        {change && (
          <div className="flex items-center gap-1 mt-1">
            {change.type === "increase" ? (
              <span className="text-accent flex items-center text-xs font-bold bg-accent/10 px-1.5 py-0.5 rounded">
                <ArrowUpRight size={12} className="mr-0.5" />
                {change.value}
              </span>
            ) : (
              <span className="text-destructive flex items-center text-xs font-bold bg-destructive/10 px-1.5 py-0.5 rounded">
                <ArrowDownRight size={12} className="mr-0.5" />
                {change.value}
              </span>
            )}
            <span className="text-[10px] text-muted-foreground font-medium">vs last month</span>
          </div>
        )}
      </div>
      <div className="w-12 h-12 rounded-input bg-muted flex items-center justify-center text-muted-foreground shrink-0 border border-border/40">
        {icon}
      </div>
    </Card>
  );
}

// ==========================================
// 5. REVIEW CARD
// ==========================================
interface ReviewCardProps {
  authorName: string;
  authorAvatar?: string;
  authorRole?: string;
  rating: number;
  comment: string;
  courseName?: string;
  className?: string;
}

export function ReviewCard({
  authorName,
  authorRole = "Student",
  rating,
  comment,
  courseName,
  className,
}: ReviewCardProps) {
  return (
    <Card variant="default" hoverEffect="glow" className={cn("p-6 flex flex-col justify-between gap-4", className)}>
      <div className="flex flex-col gap-3">
        {/* Rating stars */}
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, idx) => (
            <Star
              key={idx}
              size={14}
              className={idx < rating ? "fill-amber-500 text-amber-500" : "text-border"}
            />
          ))}
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed italic">
          &quot;{comment}&quot;
        </p>
      </div>

      <div className="flex items-center gap-3 mt-2 border-t border-border/40 pt-4">
        <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-xs text-primary shrink-0">
          {authorName.charAt(0)}
        </div>
        <div className="flex flex-col overflow-hidden">
          <span className="text-xs font-bold text-foreground truncate">{authorName}</span>
          <span className="text-[10px] text-muted-foreground truncate">
            {authorRole} {courseName && `• ${courseName}`}
          </span>
        </div>
      </div>
    </Card>
  );
}

// ==========================================
// 6. PRICING CARD
// ==========================================
interface PricingCardProps {
  name: string;
  price: number;
  features: string[];
  ctaText?: string;
  isPopular?: boolean;
  className?: string;
}

export function PricingCard({
  name,
  price,
  features,
  ctaText = "Get Started",
  isPopular = false,
  className,
}: PricingCardProps) {
  return (
    <Card
      variant={isPopular ? "default" : "bordered"}
      hoverEffect="lift"
      className={cn(
        "p-8 flex flex-col justify-between h-full relative",
        isPopular && "ring-2 ring-primary border-primary",
        className
      )}
    >
      {isPopular && (
        <span className="absolute top-4 right-4 bg-primary text-white text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full">
          Most Popular
        </span>
      )}
      
      <div className="flex flex-col gap-6">
        <div>
          <h4 className="text-sm font-heading font-extrabold text-foreground uppercase tracking-wider">
            {name}
          </h4>
          <div className="flex items-baseline mt-4 gap-1">
            <span className="text-4xl font-heading font-extrabold text-foreground tracking-tight">
              {formatCurrency(price)}
            </span>
            <span className="text-xs text-muted-foreground font-semibold">/ course</span>
          </div>
        </div>

        <ul className="flex flex-col gap-3">
          {features.map((feat, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-xs text-muted-foreground">
              <Check size={14} className="text-accent shrink-0 mt-0.5" />
              <span>{feat}</span>
            </li>
          ))}
        </ul>
      </div>

      <button
        className={cn(
          "w-full text-center py-2.5 rounded-button text-xs font-bold tracking-wide transition-all mt-8 cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
          isPopular ? "bg-btn-gradient text-white shadow-soft" : "border border-border bg-card hover:bg-muted text-foreground"
        )}
      >
        {ctaText}
      </button>
    </Card>
  );
}

// ==========================================
// 7. CERTIFICATE CARD
// ==========================================
interface CertificateCardProps {
  id: string;
  courseName: string;
  tutorName: string;
  issueDate: string;
  className?: string;
}

export function CertificateCard({ id, courseName, tutorName, issueDate, className }: CertificateCardProps) {
  return (
    <Card variant="glass" hoverEffect="lift" className={cn("p-6 flex items-start gap-4 cursor-pointer", className)}>
      <div className="w-12 h-12 rounded-input bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
        <Award size={24} />
      </div>
      <div className="flex flex-col gap-2 grow">
        <div>
          <h4 className="text-sm font-heading font-extrabold text-foreground group-hover:text-primary transition-colors leading-tight">
            {courseName}
          </h4>
          <p className="text-[10px] text-muted-foreground font-semibold mt-1">Verified by {tutorName}</p>
        </div>
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/40">
          <span className="text-[9px] font-bold text-muted-foreground flex items-center gap-1 uppercase">
            <Calendar size={11} />
            {issueDate}
          </span>
          <span className="text-[9px] font-mono text-muted-foreground/80 font-medium">ID: {id.substr(0, 8)}</span>
        </div>
      </div>
    </Card>
  );
}

// ==========================================
// 8. TUTOR CARD
// ==========================================
interface TutorCardProps {
  id: string;
  name: string;
  expertise: string[];
  rating: number;
  studentsCount?: number;
  coursesCount?: number;
  earningsPreview?: number;
  avatarUrl?: string;
  isAiVerified?: boolean;
  className?: string;
}

export function TutorCard({
  id,
  name,
  expertise,
  rating,
  studentsCount = 0,
  coursesCount = 0,
  earningsPreview,
  avatarUrl,
  isAiVerified = false,
  className,
}: TutorCardProps) {
  return (
    <Link href={`/tutors/${id}`} className="block h-full">
      <Card variant="default" hoverEffect="lift" className={cn("p-6 flex flex-col justify-between h-full group", className)}>
        <div className="flex flex-col gap-4 text-left">
          {/* Tutor profile top */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-sm text-primary shrink-0 relative overflow-hidden">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={name}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              ) : (
                name.charAt(0)
              )}
              {isAiVerified && (
                <span
                  className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-accent border-2 border-card flex items-center justify-center text-foreground z-10">
                  <Check size={10} strokeWidth={3} className="text-white fill-emerald-500" />
                </span>
              )}
            </div>
            <div>
              <h4 className="text-sm font-heading font-extrabold text-foreground group-hover:text-primary transition-colors leading-tight">
                {name}
              </h4>
              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                <span className="text-[10px] text-amber-500 font-bold flex items-center gap-0.5 mr-1">
                  <Star size={10} className="fill-amber-500 text-amber-500" />
                  {rating.toFixed(1)}
                </span>
                {studentsCount > 0 && (
                  <>
                    <span className="text-muted-foreground text-[10px]">•</span>
                    <span className="text-[10px] text-muted-foreground font-semibold">
                      {studentsCount} Students
                    </span>
                  </>
                )}
                {coursesCount > 0 && (
                  <>
                    <span className="text-muted-foreground text-[10px]">•</span>
                    <span className="text-[10px] text-muted-foreground font-semibold">
                      {coursesCount} Courses
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Expertise tags */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {expertise.map((exp, idx) => (
              <span
                key={idx}
                className="text-[9px] font-bold bg-muted text-muted-foreground px-2 py-0.5 rounded-full"
              >
                {exp}
              </span>
            ))}
          </div>

          {/* Experience & Languages */}
          <div className="flex items-center justify-between text-[9px] text-muted-foreground font-semibold border-t border-border/30 pt-2.5 mt-1">
            <span>Exp: {(id.charCodeAt(id.length - 1) % 3) + 1}+ years</span>
            <span>Languages: {id.charCodeAt(id.length - 1) % 2 === 0 ? "English, Hindi" : "English"}</span>
          </div>

          {/* Earnings Preview Badge */}
          {earningsPreview !== undefined && (
            <div className="mt-1 text-[9px] text-accent font-extrabold bg-accent/5 border border-accent/15 px-2.5 py-1 rounded w-fit flex items-center gap-1 uppercase tracking-wider">
              <span>Income Generated:</span>
              <span>{formatCurrency(earningsPreview)}</span>
            </div>
          )}
        </div>

        <div className="mt-6">
          <span className="block w-full text-center py-2.5 rounded-button text-[10px] font-bold uppercase tracking-wider bg-muted group-hover:bg-primary group-hover:text-white transition-colors cursor-pointer select-none">
            View Profile
          </span>
        </div>
      </Card>
    </Link>
  );
}

// ==========================================
// 9. COURSE CARD
// ==========================================
interface CourseCardProps {
  id: string;
  title: string;
  tutorName: string;
  category: string;
  price: number;
  rating: number;
  duration?: string;
  lessonsCount?: number;
  studentsCount?: number;
  isAiVerified?: boolean;
  imageSrc?: string;
  className?: string;
}


function getImageFitMode(src?: string): { fitClass: string; bgClass: string; scaleClass: string } {
  if (!src) return { fitClass: "object-cover", bgClass: "bg-muted", scaleClass: "scale-100 group-hover:scale-105" };
  const filename = src.split("/").pop()?.toLowerCase() || "";
  
  const ignored = ["english", "languages", "classroom", "communication", "fallback", "academic-education", "generic-education", "generic-business"];
  if (ignored.some(word => filename.includes(word))) {
    return {
      fitClass: "object-cover",
      bgClass: "bg-muted",
      scaleClass: "scale-100 group-hover:scale-105"
    };
  }
  
  if (filename.includes("commerce")) {
    return {
      fitClass: "object-contain p-3.5",
      bgClass: "bg-slate-50 dark:bg-slate-900/60",
      scaleClass: "scale-[1.02] group-hover:scale-[1.08]"
    };
  }
  if (filename.includes("accountancy") || filename.includes("accounting")) {
    return {
      fitClass: "object-contain p-2.5",
      bgClass: "bg-slate-50 dark:bg-slate-900/60",
      scaleClass: "scale-[1.06] group-hover:scale-[1.12]"
    };
  }
  if (filename.includes("ai") || filename.includes("ai-data-science") || filename.includes("business")) {
    return {
      fitClass: "object-contain p-2.5",
      bgClass: "bg-slate-50 dark:bg-slate-900/60",
      scaleClass: "scale-[1.10] group-hover:scale-[1.16]"
    };
  }
  if (filename.includes("python") || filename.includes("web-dev")) {
    return {
      fitClass: "object-contain p-2.5",
      bgClass: "bg-slate-50 dark:bg-slate-900/60",
      scaleClass: "scale-[1.10] group-hover:scale-[1.16]"
    };
  }
  if (filename.includes("music") || filename.includes("dance") || filename.includes("photography") || filename.includes("video-editing")) {
    return {
      fitClass: "object-contain p-2",
      bgClass: "bg-slate-50 dark:bg-slate-900/60",
      scaleClass: "scale-[1.05] group-hover:scale-[1.11]"
    };
  }
  if (filename.includes("sports") || filename.includes("fitness")) {
    return {
      fitClass: "object-contain p-2",
      bgClass: "bg-slate-50 dark:bg-slate-900/60",
      scaleClass: "scale-[1.08] group-hover:scale-[1.14]"
    };
  }
  if (filename.includes("mathematics") || filename.includes("physics") || filename.includes("chemistry") || filename.includes("biology") || filename.includes("academics") || filename.includes("academic")) {
    return {
      fitClass: "object-contain p-2.5",
      bgClass: "bg-slate-50 dark:bg-slate-900/60",
      scaleClass: "scale-[1.08] group-hover:scale-[1.14]"
    };
  }
  if (filename.includes("technology") || filename.includes("coding") || filename.includes("computer-science") || filename.includes("generic-programming")) {
    return {
      fitClass: "object-contain p-2.5",
      bgClass: "bg-slate-50 dark:bg-slate-900/60",
      scaleClass: "scale-[1.08] group-hover:scale-[1.14]"
    };
  }
  if (filename.includes("creative") || filename.includes("arts") || filename.includes("drawing") || filename.includes("painting") || filename.includes("sketching") || filename.includes("cooking")) {
    return {
      fitClass: "object-contain p-2.5",
      bgClass: "bg-slate-50 dark:bg-slate-900/60",
      scaleClass: "scale-[1.08] group-hover:scale-[1.14]"
    };
  }
  
  return {
    fitClass: "object-contain p-2.5",
    bgClass: "bg-slate-50 dark:bg-slate-900/60",
    scaleClass: "scale-[1.08] group-hover:scale-[1.14]"
  };
}

export function CourseCard({
  id,
  title,
  tutorName,
  category,
  price,
  rating,
  duration = "Self-paced",
  lessonsCount = 0,
  studentsCount = 0,
  isAiVerified = false,
  imageSrc,
  className,
}: CourseCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const { fitClass, bgClass, scaleClass } = getImageFitMode(imageSrc);

  const rules = getDefaultPricingRule(category);
  const discountPercent = rules.defaultDiscount || 0;
  const offerPrice = discountPercent > 0 
    ? Math.round(price * (1 - discountPercent / 100))
    : price;

  return (
    <Link href={`/courses/${id}`} className="block h-full">
      <Card
        variant="default"
        hoverEffect="lift"
        className={cn(
          "p-3 pb-4 flex flex-col h-full group overflow-hidden border-border bg-card rounded-2xl",
          className
        )}
      >
        {/* Thumbnail Placeholder with 4:3 Aspect Ratio (Visual Hero +33% larger) */}
        <div className={cn("relative w-full aspect-[4/3] rounded-xl overflow-hidden border border-border/30", bgClass)}>
          {imageSrc && !imageError ? (
            <Image
              src={imageSrc}
              alt={title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              className={cn(
                "transition-all duration-700 ease-out",
                fitClass,
                scaleClass,
                imageLoaded ? "opacity-100 blur-0" : "opacity-0 blur-sm"
              )}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-hero-gradient opacity-10">
              <Award className="w-12 h-12 text-primary/30 group-hover:scale-110 transition-transform duration-300" />
            </div>
          )}
          
          {/* Category badge overlay (aligned inside image container) */}
          <span className="absolute top-3 left-3 bg-card/90 backdrop-blur-sm border border-border shadow-sm text-[9px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full text-foreground z-10">
            {category}
          </span>

          {/* AI Badge Overlay (aligned inside image container) */}
          {isAiVerified && (
            <span className="absolute bottom-3 left-3 bg-ai-gradient text-foreground text-[8px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full shadow-soft z-10">
              AI Verified
            </span>
          )}

          {/* Wishlist Button Overlay (aligned inside image container) */}
          <div
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsWishlisted(!isWishlisted);
              toast.success(isWishlisted ? "Removed from wishlist" : "Added to wishlist");
            }}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-card/90 backdrop-blur-sm border border-border/40 flex items-center justify-center text-muted-foreground hover:text-red-500 cursor-pointer select-none transition-colors shadow-sm z-20"
          >
            <Heart size={14} className={isWishlisted ? "fill-red-500 text-red-500" : ""} />
          </div>
        </div>

        {/* Course metadata - Optimized spacious spacing with compact layout */}
        <div className="p-2 pt-4 flex flex-col justify-between grow gap-4">
          <div className="flex flex-col gap-2">
            {/* Header: Taught by & rating row */}
            <div className="flex items-center justify-between text-[10px] text-muted-foreground font-semibold">
              <span>Taught by {tutorName}</span>
              <span className="text-amber-500 font-bold flex items-center gap-0.5">
                <Star size={10} className="fill-amber-500 text-amber-500" />
                {rating.toFixed(1)}
                {studentsCount > 0 && (
                  <span className="text-[9px] text-muted-foreground font-normal ml-0.5">
                    ({studentsCount.toLocaleString("en-IN")})
                  </span>
                )}
              </span>
            </div>

            <h4 className="text-sm font-heading font-extrabold text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2 mt-0.5">
              {title}
            </h4>

            {/* Sub-details: Lessons & duration */}
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-semibold mt-1">
              {lessonsCount > 0 && <span>{lessonsCount} lessons</span>}
              {lessonsCount > 0 && <span className="text-muted-foreground/60">•</span>}
              <span>{duration}</span>
            </div>
          </div>

          {/* Pricing & CTA */}
          <div className="flex items-center justify-between border-t border-border/40 pt-3 mt-1">
            <div className="flex flex-col text-left">
              {price === 0 ? (
                <span className="text-base font-heading font-extrabold text-foreground tracking-tight">Free</span>
              ) : discountPercent > 0 ? (
                <div className="flex items-baseline gap-1.5">
                  <span className="text-base font-heading font-extrabold text-foreground tracking-tight">
                    {formatCurrency(offerPrice)}
                  </span>
                  <span className="text-[10px] text-muted-foreground line-through font-medium">
                    {formatCurrency(price)}
                  </span>
                  <span className="text-[9px] font-black text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded uppercase">
                    {discountPercent}% OFF
                  </span>
                </div>
              ) : (
                <span className="text-base font-heading font-extrabold text-foreground tracking-tight">
                  {formatCurrency(price)}
                </span>
              )}
            </div>

            <span className="w-8 h-8 rounded-button bg-primary/10 hover:bg-primary text-primary hover:text-white flex items-center justify-center transition-colors cursor-pointer select-none">
              <ArrowRight size={14} />
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
