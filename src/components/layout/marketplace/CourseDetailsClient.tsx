"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Container } from "../Container";
import { PageWrapper } from "../PageWrapper";
import { Card, CourseCard } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Divider } from "../../ui/divider";
import { Accordion } from "../../ui/accordion";
import { Avatar } from "../../ui/avatar";
import { toast } from "sonner";
import { formatCurrency } from "../../../utils/formatCurrency";
import { CheckoutModal } from "../../../features/payments/components/CheckoutModal";
import { useAuth } from "../../../hooks/useAuth";

import { MOCK_COURSES, MOCK_TUTORS, MOCK_REVIEWS } from "../../../constants/mockData";
import {
  Star,
  Clock,
  BookOpen,
  Award,
  Globe,
  Heart,
  Share2,
  Play,
  CheckCircle,
  HelpCircle,
  ShieldCheck,
  ChevronRight,
  QrCode,
} from "lucide-react";

interface CourseDetailsClientProps {
  course: typeof MOCK_COURSES[number];
  tutor: typeof MOCK_TUTORS[number];
  relatedCourses: typeof MOCK_COURSES;
  courseReviews: typeof MOCK_REVIEWS;
  isEnrolled?: boolean;
}

export function CourseDetailsClient({
  course,
  tutor,
  relatedCourses,
  courseReviews,
  isEnrolled = false,
}: CourseDetailsClientProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [reviewsSort, setReviewsSort] = useState("latest");
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [enrolledState, setEnrolledState] = useState(isEnrolled);

  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    setEnrolledState(isEnrolled);
  }, [isEnrolled]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please log in as a student to submit a review.");
      return;
    }
    if (!enrolledState) {
      toast.error("Only enrolled students can submit a course review.");
      return;
    }
    if (!userComment.trim()) {
      toast.error("Please write a short comment for your review.");
      return;
    }
    setIsSubmittingReview(true);
    try {
      const res = await fetch("/api/student/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: course.id,
          rating: userRating,
          comment: userComment,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit review");
      }
      toast.success("Thank you! Your course review has been published.");
      setUserComment("");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit review.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleEnroll = async () => {
    try {
      const res = await fetch('/api/student/enrollment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: course.id }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to enroll');
      }

      toast.success("Successfully enrolled in course! Redirecting to classroom...");
      setEnrolledState(true);
      
      // Navigate to the first lesson after a short delay
      setTimeout(() => {
        const lessonId = `${course.id}-lesson-1`;
        router.push(`/student/course/${course.id}/lesson/${lessonId}`);
      }, 1000);
    } catch (err: any) {
      console.error("Enrollment failed:", err);
      toast.error(err.message || "Failed to enroll. Please log in as a student.");
    }
  };


  const sortedReviews = [...courseReviews].sort((a, b) => {
    if (reviewsSort === "highest") return b.rating - a.rating;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Mock Pricing & Discount calculations
  const originalMarkupPrice = course.price === 0 ? 0 : Math.round(course.price * 1.4);
  const discountPercent = course.price === 0 ? 0 : 30;

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Course link copied to clipboard!");
    }
  };

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    toast.success(isWishlisted ? "Removed from wishlist" : "Added to wishlist");
  };

  // Curriculum accordion setup
  const curriculumItems = (course.curriculum || []).map((module: any) => ({
    id: module.id,
    trigger: module.trigger,
    content: (
      <div className="flex flex-col gap-2.5 pt-2 text-xs text-muted-foreground">
        {module.lessons.map((lesson: any, lIdx: number) => (
          <div key={lIdx} className="flex justify-between items-center py-1">
            <span className="font-semibold text-foreground flex items-center gap-1.5 font-sans">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              {lesson.title}
            </span>
            {lesson.isPreview ? (
              <span
                className="text-[10px] text-accent font-extrabold bg-accent/5 px-2 py-0.5 rounded cursor-pointer hover:bg-accent/15"
                onClick={() => {
                  setIsPlayingPreview(true);
                  toast.success(`Playing preview: ${lesson.title}`);
                }}
              >
                Preview Lesson
              </span>
            ) : (
              <span className="text-[10px] uppercase font-bold text-muted-foreground/80">
                {lesson.type || lesson.duration || "Lesson"}
              </span>
            )}
          </div>
        ))}
      </div>
    ),
  }));

  const courseFaqItems = (course.faqs || []).map((faq: any) => ({
    id: faq.id,
    trigger: faq.trigger,
    content: faq.content,
  }));

  return (
    <PageWrapper>
      {/* 1. Hero / Header Banner */}
      <section className="w-full py-12 bg-muted/20 border-b border-border/40 text-left select-none relative overflow-hidden">
        <Container className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
          
          {/* Left Hero Column */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-semibold">
              <Link href="/" className="hover:text-foreground">Home</Link>
              <ChevronRight size={10} />
              <Link href="/courses" className="hover:text-foreground">Courses</Link>
              <ChevronRight size={10} />
              <span className="text-foreground truncate">{course.title}</span>
            </div>

            <div className="flex flex-col gap-2.5 mt-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="primary" className="capitalize">
                  {course.category}
                </Badge>
                <Badge variant={course.level === "beginner" ? "success" : course.level === "intermediate" ? "primary" : "danger"}>
                  {course.level.replace("_", " ")}
                </Badge>
                {(tutor.verificationStatus === "verified" || tutor.verificationStatus === "approved" || tutor.verificationStatus === "ai_verified") && (
                  <Badge variant="success" className="text-white flex items-center gap-1 shadow-soft">
                    <ShieldCheck size={11} className="fill-white text-emerald-500" />
                    Verified Student Tutor
                  </Badge>
                )}
                {typeof course.id === 'string' && (course.id.startsWith("course-") || course.id.startsWith("00000000")) && (
                  <span className="text-[9px] font-extrabold uppercase bg-muted text-muted-foreground px-2 py-0.5 rounded border border-border/40">
                    Sample Catalog Course
                  </span>
                )}
              </div>

              <h1 className="text-2xl md:text-4xl font-heading font-extrabold text-foreground tracking-tight leading-tight mt-1 font-sans">
                {course.title}
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed max-w-2xl">
                {course.description}
              </p>
            </div>

            {/* Ratings, student stats */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-muted-foreground mt-2 border-t border-border/35 pt-4">
              <div className="flex items-center gap-1 text-amber-500">
                <Star size={14} className="fill-amber-500" />
                <span className="font-extrabold">{course.rating.toFixed(1)}</span>
                <span className="text-muted-foreground">({courseReviews.length} reviews)</span>
              </div>
              <span>•</span>
              <span>{course.studentsCount.toLocaleString("en-IN")} Students Enrolled</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Globe size={13} />
                Language: {course.language}
              </span>
              <span>•</span>
              <span>Last Updated: {new Date().getFullYear()}</span>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleWishlist}
                className="flex items-center gap-1.5"
              >
                <Heart size={13} className={isWishlisted ? "fill-red-500 text-red-500" : ""} />
                {isWishlisted ? "Wishlisted" : "Add to Wishlist"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="flex items-center gap-1.5 hover:bg-muted"
              >
                <Share2 size={13} />
                Share Course
              </Button>
            </div>
          </div>

          {/* Spacer to prevent overlaps with sticky purchase card on desktop */}
          <div className="hidden lg:block lg:col-span-4" />
        </Container>
      </section>

      {/* 2. Main Page Layout (Details + Sticky Sidebar) */}
      <section className="w-full py-12 select-none relative text-left">
        <Container className="grid grid-cols-1 lg:grid-cols-12 gap-12 relative items-start">
          
          {/* Left Details Column */}
          <div className="lg:col-span-8 flex flex-col gap-10">
            
            {/* Mock Video Preview */}
            <div className="flex flex-col gap-4">
              <h3 className="text-base font-heading font-extrabold text-foreground">
                Course Video Preview
              </h3>
              
              <div className="relative w-full aspect-video bg-muted dark:bg-slate-900 border border-border dark:border-border rounded-modal flex items-center justify-center overflow-hidden group shadow-premium">
                <div className="absolute inset-0 bg-hero-gradient opacity-15" />
                {isPlayingPreview ? (
                  <div className="flex flex-col items-center justify-center gap-2 text-center text-muted-foreground">
                    <span className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                    <span className="text-[10px] mt-1 font-mono uppercase tracking-wider">Streaming sample preview...</span>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsPlayingPreview(true)}
                    className="w-16 h-16 rounded-full bg-primary hover:bg-primary/95 text-white flex items-center justify-center cursor-pointer shadow-premium hover:scale-105 transition-transform duration-300 focus:outline-none"
                    aria-label="Play Course Preview"
                  >
                    <Play size={24} className="fill-white ml-1.5" />
                  </button>
                )}
                
                <span className="absolute bottom-3 right-3 bg-black/60 px-2 py-0.5 rounded text-[8px] font-mono text-white/90">
                  Preview (1:30 mins)
                </span>
              </div>
            </div>

            {/* What you'll learn outcome cards */}
            <div className="flex flex-col gap-4">
              <h3 className="text-base font-heading font-extrabold text-foreground">
                Learning Outcomes
              </h3>
              
              <div className={`grid grid-cols-1 ${course.supportsProjects ? "sm:grid-cols-2" : ""} gap-4`}>
                {course.supportsProjects && (
                  <Card variant="glass" className="p-5 border-border/50 bg-card flex items-start gap-3">
                    <CheckCircle size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-foreground">Build Practical Projects</span>
                      <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
                        Deploy 3 fully functional applications to check communication protocols and UI details.
                      </p>
                    </div>
                  </Card>
                )}

                <Card variant="glass" className="p-5 border-border/50 bg-card flex items-start gap-3">
                  <CheckCircle size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-foreground">Career &amp; Portfolio Growth</span>
                    <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
                      Construct clean case studies ready for interview panels or freelance tutor listings.
                    </p>
                  </div>
                </Card>
              </div>
            </div>

            {/* Course Highlights */}
            <div className="flex flex-col gap-4">
              <h3 className="text-base font-heading font-extrabold text-foreground">
                Course Highlights
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-900/30 border border-border/60 rounded-xl text-center flex flex-col gap-1.5 items-center select-none shadow-soft">
                  <span className="text-lg">🎓</span>
                  <span className="text-[10px] font-bold text-foreground">100% Student-Led</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-900/30 border border-border/60 rounded-xl text-center flex flex-col gap-1.5 items-center select-none shadow-soft">
                  <span className="text-lg">🤖</span>
                  <span className="text-[10px] font-bold text-foreground">Sparky AI Tools</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-900/30 border border-border/60 rounded-xl text-center flex flex-col gap-1.5 items-center select-none shadow-soft">
                  <span className="text-lg">💬</span>
                  <span className="text-[10px] font-bold text-foreground">Live Doubt Hours</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-900/30 border border-border/60 rounded-xl text-center flex flex-col gap-1.5 items-center select-none shadow-soft">
                  <span className="text-lg">📜</span>
                  <span className="text-[10px] font-bold text-foreground">Verified Certificates</span>
                </div>
              </div>
            </div>

            {/* Prerequisites */}
            <div className="flex flex-col gap-4">
              <h3 className="text-base font-heading font-extrabold text-foreground">
                Prerequisites
              </h3>
              <Card variant="glass" className="p-5 border-border/60 bg-card text-xs text-slate-600 dark:text-slate-400 font-semibold leading-relaxed">
                <ul className="list-disc pl-4 space-y-1.5 text-left">
                  <li>Basic computer navigation skills and internet connectivity.</li>
                  <li>No prior knowledge or background in {course.category} is required. We start from absolute scratch!</li>
                  <li>A desktop or laptop is recommended for coding and practice exercises.</li>
                </ul>
              </Card>
            </div>

            {/* Who This Course Is For */}
            <div className="flex flex-col gap-4">
              <h3 className="text-base font-heading font-extrabold text-foreground">
                Who This Course Is For
              </h3>
              <Card variant="glass" className="p-5 border-border/60 bg-card text-xs text-slate-600 dark:text-slate-400 font-semibold leading-relaxed">
                <ul className="list-disc pl-4 space-y-1.5 text-left">
                  <li>Students looking to master {course.category} from peer mentors who recently excelled in the subject.</li>
                  <li>Learners preparing for college coursework, semester exams, or practical lab projects.</li>
                  <li>Anyone seeking structured step-by-step guidance without overly academic or dry textbook theory.</li>
                </ul>
              </Card>
            </div>

            {/* Sample Lesson Preview */}
            <div className="flex flex-col gap-4">
              <h3 className="text-base font-heading font-extrabold text-foreground">
                Watch a Sample Lesson
              </h3>
              <div className="p-4 bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setIsPlayingPreview(true);
                      toast.success("Playing sample lesson audio/video explanation...");
                    }}
                    className="w-10 h-10 rounded-full bg-primary hover:scale-105 transition-transform flex items-center justify-center text-white cursor-pointer shrink-0 border-none focus:outline-none"
                  >
                    <Play size={16} className="fill-current ml-0.5" />
                  </button>
                  <div className="text-left">
                    <h5 className="text-xs font-bold text-foreground">Lesson 1.2: Environment Setup & Core Concepts</h5>
                    <span className="text-[9px] text-muted-foreground">Duration: 3m 45s · Free Preview</span>
                  </div>
                </div>
                <span className="text-[9px] font-black uppercase text-primary tracking-widest bg-primary/10 px-2 py-0.5 rounded">Free Preview</span>
              </div>
            </div>

            {/* Curriculum Accordion */}
            <div className="flex flex-col gap-4">
              <h3 className="text-base font-heading font-extrabold text-foreground">
                Course Curriculum
              </h3>
              <Accordion items={curriculumItems} allowMultiple={true} className="border-border/60" />
            </div>

            {/* Tutor Profile Card */}
            <div className="flex flex-col gap-4">
              <h3 className="text-base font-heading font-extrabold text-foreground">
                Your Educator
              </h3>
              
              <Card variant="default" className="p-6 border-border bg-card flex flex-col sm:flex-row gap-5 items-start">
                {(tutor as any)?.isPending || !tutor?.id ? (
                  <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                    <Clock size={24} className="text-amber-500" />
                  </div>
                ) : (
                  <Link href={`/tutors/${tutor.id}`}>
                    <Avatar src={tutor.avatar} name={(tutor as any).fullName || (tutor as any).name} size="lg" badge="verified" className="shrink-0 cursor-pointer" />
                  </Link>
                )}
                <div className="flex flex-col gap-3 grow">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-left">
                    <div>
                      {(tutor as any)?.isPending || !tutor?.id ? (
                        <h4 className="text-sm font-heading font-extrabold text-foreground">
                          {(tutor as any)?.name || "Awaiting Tutor Assignment"}
                        </h4>
                      ) : (
                        <Link href={`/tutors/${tutor.id}`}>
                          <h4 className="text-sm font-heading font-extrabold text-foreground hover:text-primary transition-colors cursor-pointer">
                            {(tutor as any).fullName || (tutor as any).name}
                          </h4>
                        </Link>
                      )}
                      {(tutor as any)?.isPending || !tutor?.id ? (
                        <span className="text-[9px] uppercase tracking-wider font-extrabold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded">
                          Tutor Assignment Pending
                        </span>
                      ) : (
                        <span className="text-[9px] uppercase tracking-wider font-extrabold text-primary bg-primary/10 px-2 py-0.5 rounded">
                          Verified Student Tutor
                        </span>
                      )}
                    </div>

                    {!((tutor as any)?.isPending || !tutor?.id) && (
                      <button
                        onClick={() => toast.success(`Followed ${(tutor as any).fullName || (tutor as any).name}!`)}
                        className="px-3 py-1 bg-muted hover:bg-primary hover:text-white rounded-button text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer focus:outline-none"
                      >
                        Follow Tutor
                      </button>
                    )}
                  </div>

                  <p className="text-[11px] text-muted-foreground leading-relaxed text-left">
                    {tutor.bio || "This course is currently awaiting assignment to a verified EduEarn student tutor."}
                  </p>

                  {/* Tutor stats */}
                  {!((tutor as any)?.isPending || !tutor?.id) && (
                    <div className="flex flex-wrap items-center gap-6 mt-1 text-[10px] text-muted-foreground font-semibold">
                      <span className="flex items-center gap-1">
                        <Star size={12} className="fill-amber-500 text-amber-500" />
                        {(tutor.rating || 0).toFixed(1)} Rating
                      </span>
                      <span>•</span>
                      <span>{(tutor as any).totalStudents || (tutor as any).studentsCount || 0} Students Taught</span>
                      <span>•</span>
                      <span>{(tutor as any).totalCourses || (tutor as any).coursesCount || 0} Courses Published</span>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Verified Certification */}
            <div className="flex flex-col gap-4">
              <h3 className="text-base font-heading font-extrabold text-foreground">
                Verified Certification
              </h3>
              
              <Card variant="glass" className="p-6 border-border bg-card flex flex-col md:flex-row gap-5 items-center justify-between text-left shadow-soft">
                <div className="space-y-3 max-w-md">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-extrabold uppercase tracking-wider text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">
                      LinkedIn Shareable
                    </span>
                    <span className="text-[9px] font-extrabold uppercase tracking-wider text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded">
                      Smart Verification
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-foreground">Earn Your Verified Completion Certificate</h4>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    Finish all assignment tasks, maintain over 75% attendance rate in scheduled classes, and score above 70% in weekly quizzes to unlock your credential.
                  </p>
                  <ul className="text-[9.5px] text-slate-650 dark:text-slate-400 font-semibold space-y-1">
                    <li>• Unique Certificate ID: <span className="font-mono text-foreground font-bold">ES-{course.id.substring(0, 6).toUpperCase()}-2026</span></li>
                    <li>• Fully verified URL registry mapping on EduEarn platform databases.</li>
                    <li>• Dynamic QR Code generation for physical resume screening scan verification.</li>
                  </ul>
                </div>

                {/* Mock Certificate Render */}
                <div className="w-48 h-32 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 flex flex-col justify-between shadow-soft select-none shrink-0 text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-hero-gradient opacity-[0.03] pointer-events-none" />
                  <div className="text-[7px] uppercase tracking-wider font-extrabold text-primary">EduEarn Certification</div>
                  <div className="space-y-0.5 mt-2">
                    <div className="text-[9px] font-black text-foreground">Student Learner</div>
                    <div className="text-[6px] text-muted-foreground font-light max-w-[120px] mx-auto truncate text-center">has successfully completed {course.title}</div>
                  </div>
                  <div className="flex justify-between items-end border-t border-border/40 pt-1.5 mt-2">
                    <div className="text-left">
                      <div className="text-[5px] text-muted-foreground">Verification ID</div>
                      <div className="text-[5.5px] font-mono text-foreground font-bold">ES-{course.id.substring(0, 4).toUpperCase()}</div>
                    </div>
                    <div className="w-6 h-6 border border-border bg-white flex items-center justify-center p-0.5">
                      <QrCode size={18} className="text-slate-900" />
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* FAQ Accordion */}
            <div className="flex flex-col gap-4">
              <h3 className="text-base font-heading font-extrabold text-foreground">
                FAQ &amp; Course Specifics
              </h3>
              <Accordion items={courseFaqItems} allowMultiple={true} className="border-border/60" />
            </div>

            {/* Reviews Section */}
            <div className="flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/45 pb-4">
                <h3 className="text-base font-heading font-extrabold text-foreground">
                  Student Feedback
                </h3>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground font-semibold">Sort reviews:</span>
                  <select
                    value={reviewsSort}
                    onChange={(e) => setReviewsSort(e.target.value)}
                    className="bg-card border border-border shadow-sm hover:shadow-md transition-shadow duration-200/80 rounded-input px-2.5 py-1.5 text-xs font-bold text-foreground focus:outline-none cursor-pointer"
                  >
                    <option value="latest">Latest Reviews</option>
                    <option value="highest">Highest Rating</option>
                  </select>
                </div>
              </div>

              {/* Average layout */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-4 flex flex-col items-center justify-center p-6 bg-muted/30 border border-border/30 rounded-card text-center gap-1.5">
                  <span className="text-4xl font-heading font-extrabold text-foreground">
                    {course.rating.toFixed(1)}
                  </span>
                  <div className="flex items-center gap-0.5 text-amber-500">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star key={idx} size={14} className={idx < Math.round(course.rating) ? "fill-amber-500" : ""} />
                    ))}
                  </div>
                  <span className="text-[10px] text-muted-foreground font-semibold">Course Rating</span>
                </div>

                {/* Rating distribution progress bars */}
                <div className="md:col-span-8 flex flex-col gap-2 text-[10px] font-bold text-muted-foreground text-left">
                  {[
                    { stars: 5, percent: 80 },
                    { stars: 4, percent: 15 },
                    { stars: 3, percent: 5 },
                  ].map((bar, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <span className="w-10 shrink-0">{bar.stars} Stars</span>
                      <div className="grow h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500" style={{ width: `${bar.percent}%` }} />
                      </div>
                      <span className="w-8 shrink-0 text-right">{bar.percent}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Student Review Form (Enrolled Students Only) */}
              {enrolledState ? (
                <Card variant="glass" className="p-5 border-primary/20 bg-primary/5 text-left space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">Write a Verified Course Review</span>
                    <span className="text-[9px] uppercase font-extrabold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">
                      Verified Enrolled Learner
                    </span>
                  </div>

                  <form onSubmit={handleReviewSubmit} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground font-semibold">Your Rating:</span>
                      <div className="flex items-center gap-1 cursor-pointer">
                        {[1, 2, 3, 4, 5].map((starVal) => (
                          <button
                            key={starVal}
                            type="button"
                            onClick={() => setUserRating(starVal)}
                            className="p-1 text-amber-500 hover:scale-110 transition-transform focus:outline-none"
                            title={`${starVal} Star${starVal > 1 ? "s" : ""}`}
                          >
                            <Star
                              size={18}
                              className={starVal <= userRating ? "fill-amber-500 text-amber-500" : "text-slate-400"}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <textarea
                      rows={2}
                      value={userComment}
                      onChange={(e) => setUserComment(e.target.value)}
                      placeholder="Share your learning experience, course quality, and feedback for fellow students..."
                      className="w-full bg-card border border-border rounded-xl p-3 text-xs font-medium text-foreground focus:outline-none focus:border-primary/50 placeholder:text-muted-foreground/70"
                    />

                    <Button type="submit" size="sm" disabled={isSubmittingReview} className="text-xs">
                      {isSubmittingReview ? "Submitting Review..." : "Publish Review"}
                    </Button>
                  </form>
                </Card>
              ) : (
                <div className="p-3 bg-muted/20 border border-border/40 rounded-xl text-center text-[10px] text-muted-foreground font-semibold">
                  ℹ️ Only verified enrolled learners can submit course reviews.
                </div>
              )}

              {/* Reviews grid list */}
              <div className="flex flex-col gap-4 mt-2">
                {sortedReviews.map((review) => (
                  <Card key={review.id} variant="glass" className="p-5 border-border/40 bg-card flex flex-col gap-3 text-left">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-[10px] text-primary shrink-0">
                          {review.authorName.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-foreground">{review.authorName}</span>
                          <span className="text-[8px] text-muted-foreground font-semibold">Verified Learner</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-0.5 text-amber-500">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <Star key={idx} size={11} className={idx < review.rating ? "fill-amber-500 text-amber-500" : ""} />
                        ))}
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-relaxed mt-1">
                      {review.comment}
                    </p>
                  </Card>
                ))}
              </div>
            </div>

            {/* Related Courses Carousel */}
            {relatedCourses.length > 0 && (
              <div className="flex flex-col gap-4 mt-4">
                <h3 className="text-base font-heading font-extrabold text-foreground">
                  Related Courses in Same Category
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {relatedCourses.map((rCourse) => (
                    <CourseCard
                      key={rCourse.id}
                      id={rCourse.id}
                      title={rCourse.title}
                      tutorName={rCourse.tutorName}
                      category={rCourse.category}
                      price={rCourse.price}
                      rating={rCourse.rating}
                      duration={rCourse.duration}
                      lessonsCount={rCourse.lessonsCount}
                      studentsCount={rCourse.studentsCount}
                      imageSrc={rCourse.thumbnail}
                    />
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* 3. Right Purchase Widget (Desktop Sticky, Mobile relative) */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 flex flex-col gap-6 w-full relative z-30">
            <Card variant="default" className="p-6 border-border bg-card shadow-floating text-left flex flex-col gap-6">
              
              {/* Pricing section */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[8px] uppercase tracking-wider font-extrabold text-muted-foreground/80">Course Payout</span>
                <div className="flex items-baseline gap-2.5">
                  <span className="text-2xl font-heading font-extrabold text-foreground tracking-tight">
                    {course.price === 0 ? "Free" : formatCurrency(course.price)}
                  </span>
                  {course.price > 0 && (
                    <>
                      <span className="text-xs text-muted-foreground line-through font-semibold">
                        {formatCurrency(originalMarkupPrice)}
                      </span>
                      <span className="text-[10px] text-accent font-extrabold bg-accent/10 px-2 py-0.5 rounded">
                        {discountPercent}% Off
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Action triggers */}
              <div className="flex flex-col gap-3">
                {enrolledState ? (
                  <Button
                    onClick={() => {
                      const lessonId = `${course.id}-lesson-1`;
                      router.push(`/student/course/${course.id}/lesson/${lessonId}`);
                    }}
                    size="md"
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                  >
                    Continue Learning
                  </Button>
                ) : (tutor as any)?.isPending || !tutor?.id ? (
                  <div className="space-y-1.5 w-full">
                    <Button
                      aria-disabled="true"
                      disabled
                      size="md"
                      className="w-full opacity-60 cursor-not-allowed bg-slate-700 text-slate-300"
                    >
                      Awaiting Tutor Assignment
                    </Button>
                    <p className="text-[10px] text-amber-500 font-semibold leading-relaxed text-center">
                      This course will become available for enrollment once a verified tutor is assigned.
                    </p>
                  </div>
                ) : user?.role === "tutor" ? (
                  <div className="space-y-1.5 w-full">
                    <Button
                      aria-disabled="true"
                      title="Tutor accounts cannot enroll in courses. Switch to a Student account to purchase this course."
                      onClick={() => {
                        toast.error("Enrollment is available only for Student accounts.");
                      }}
                      size="md"
                      className="w-full opacity-60 cursor-not-allowed"
                      aria-label={`${course.price === 0 ? "Enroll Now" : "Buy Now"}. Tutor accounts cannot enroll in courses. Switch to a Student account to purchase this course.`}
                    >
                      {course.price === 0 ? "Enroll Now" : `Buy Now for ₹${course.price}`}
                    </Button>
                    <p className="text-[10px] text-muted-foreground font-semibold leading-relaxed text-center">
                      Tutor accounts cannot enroll in courses. Switch to a Student account to purchase this course.
                    </p>
                  </div>
                ) : (
                  <Button
                    onClick={() => {
                      if (course.price === 0) {
                        handleEnroll();
                      } else {
                        setIsCheckoutOpen(true);
                      }
                    }}
                    size="md"
                    className="w-full"
                  >
                    {course.price === 0 ? "Enroll Now" : `Buy Now for ₹${course.price}`}
                  </Button>
                )}
                <Button
                  onClick={handleWishlist}
                  variant="outline"
                  size="md"
                  className="w-full"
                >
                  Add to Wishlist
                </Button>
                <Button
                  onClick={() => toast.info("Gifting workflow opens in Phase 3.3")}
                  variant="ghost"
                  size="md"
                  className="w-full hover:bg-muted"
                >
                  Gift this Course
                </Button>
              </div>

              <Divider variant="dashed" className="my-1" />

              {/* Key Features details */}
              <div className="flex flex-col gap-3.5 text-xs text-muted-foreground">
                <span className="text-[8px] uppercase tracking-wider font-extrabold text-muted-foreground/80">This course includes:</span>
                <div className="flex items-center gap-2 font-semibold">
                  <Clock size={14} className="text-primary shrink-0" />
                  <span>{course.duration} on-demand video</span>
                </div>
                <div className="flex items-center gap-2 font-semibold">
                  <BookOpen size={14} className="text-primary shrink-0" />
                  <span>{course.lessonsCount} lessons list</span>
                </div>
                <div className="flex items-center gap-2 font-semibold">
                  <Award size={14} className="text-amber-500 shrink-0" />
                  <span>Verified course completion certificate</span>
                </div>
                <div className="flex items-center gap-2 font-semibold">
                  <Globe size={14} className="text-primary shrink-0" />
                  <span>Access on iOS and Android devices</span>
                </div>
                <div className="flex items-center gap-2 font-semibold">
                  <HelpCircle size={14} className="text-primary shrink-0" />
                  <span>Direct UPI payout transfer support</span>
                </div>
              </div>
            </Card>
          </div>

        </Container>
      </section>

      {isCheckoutOpen && (
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          courseId={course.id}
          courseTitle={course.title}
          price={course.price}
          onSuccess={async () => {
            try {
              await fetch('/api/student/enrollment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ courseId: course.id }),
              });
            } catch (err) {
              console.warn("Failed to register enrollment in backend after payment:", err);
            }
            toast.success("Purchase recorded! Redirecting to classroom...");
            setTimeout(() => {
              const lessonId = `${course.id}-lesson-1`;
              router.push(`/student/course/${course.id}/lesson/${lessonId}`);
            }, 1000);
          }}
        />
      )}
      
    </PageWrapper>
  );
}

export default CourseDetailsClient;
