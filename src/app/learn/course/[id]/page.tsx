"use client";

import React, { useEffect, useState, use, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useLmsAuth } from "../../../../hooks/useLmsAuth";
import { lmsDb } from "../../../../lib/lmsDb";
import { toast } from "sonner";
import { FaArrowLeft, FaHeart, FaShareAlt, FaGraduationCap, FaStar, FaUser } from "react-icons/fa";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CourseDetailsPage({ params }: PageProps) {
  const { id: courseId } = use(params);
  const router = useRouter();
  const { lmsUser, setLmsUser } = useLmsAuth();

  // State
  const [course, setCourse] = useState<any>(null);
  const [creator, setCreator] = useState<any>(null);
  const [relatedCourses, setRelatedCourses] = useState<any[]>([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);
  const [loading, setLoading] = useState(true);

  // Coupon checkout states
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  // Review states
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  // Load course details
  const fetchCourseDetails = useCallback(async () => {
    try {
      setLoading(true);
      const courseData = (await lmsDb.getCourseById(courseId)) as any;
      if (!courseData) {
        toast.error("Course not found");
        return;
      }

      // Fetch reviews dynamically from Supabase
      try {
        const { createClient } = await import("../../../../lib/supabase");
        const supabase = createClient();
        const { data: dbReviews } = await supabase
          .from("reviews")
          .select("*, profiles(*)")
          .eq("course_id", courseId)
          .order("created_at", { ascending: false });
        if (dbReviews) {
          courseData.reviews = dbReviews.map((r: any) => ({
            id: r.id,
            rating: r.rating,
            comment: r.comment,
            user: {
              name: r.profiles?.full_name || r.profiles?.display_name || "Anonymous Learner",
              avatar: r.profiles?.avatar_url || "",
            }
          }));
        }
      } catch (err) {
        console.warn("Failed to load reviews from Supabase:", err);
      }

      setCourse(courseData);

      // Set default creator details
      setCreator({
        name: "EduEarn Certified Educator",
        bio: "Experienced professional instructor teaching core curriculum modules.",
        avatar: "",
      });

      // Fetch related courses
      try {
        const all = await lmsDb.getAllPublishedCourses();
        const related = all.filter(
          (c: any) => c.category === courseData.category && c.id !== courseId
        );
        setRelatedCourses(related);
      } catch (e) {
        console.error("Error fetching related courses:", e);
      }

    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to load course details");
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchCourseDetails();
  }, [fetchCourseDetails]);

  // Check enrollment & wishlist status
  useEffect(() => {
    async function checkStatus() {
      if (!lmsUser || !course) return;
      try {
        const enrolledList = await lmsDb.getEnrolledCourses(lmsUser._id);
        const enrolled = enrolledList.some((c) => c.id === courseId);
        setIsEnrolled(enrolled);

        const { createClient } = await import("../../../../lib/supabase");
        const supabase = createClient();
        const { data: wish } = await supabase
          .from("wishlist")
          .select("*")
          .eq("user_id", lmsUser._id)
          .eq("course_id", courseId)
          .maybeSingle();
        if (wish) {
          setInWishlist(true);
        } else {
          setInWishlist(false);
        }
      } catch (err) {
        console.error("Error checking status:", err);
      }
    }
    checkStatus();
  }, [lmsUser, course, courseId]);

  // Wishlist toggle
  const handleWishlistToggle = async () => {
    if (!lmsUser) {
      toast.error("Please login to wishlist courses");
      router.push("/login");
      return;
    }
    try {
      const { createClient } = await import("../../../../lib/supabase");
      const supabase = createClient();
      if (inWishlist) {
        const { error } = await supabase
          .from("wishlist")
          .delete()
          .match({ user_id: lmsUser._id, course_id: courseId });
        if (error) throw error;
        setInWishlist(false);
        toast.success("Removed from wishlist");
      } else {
        const { error } = await supabase
          .from("wishlist")
          .insert({ user_id: lmsUser._id, course_id: courseId });
        if (error) throw error;
        setInWishlist(true);
        toast.success("Added to wishlist!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update wishlist");
    }
  };

  // Share link
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Course link copied to clipboard!");
  };

  // Coupon check
  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setAppliedCoupon({
      code: couponCode.toUpperCase(),
      discountType: "percentage",
      discountValue: 10,
    });
    toast.success("Coupon code simulated successfully!");
  };

  // Enroll checkout logic
  const handleEnroll = async () => {
    if (!lmsUser) {
      toast.error("Please log in to purchase this course");
      router.push("/login");
      return;
    }
    try {
      setLoading(true);
      await lmsDb.enrollStudent(lmsUser._id, courseId);
      setIsEnrolled(true);
      toast.success("Successfully enrolled in course!");
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to enroll in course");
    } finally {
      setLoading(false);
    }
  };

  // Review submission
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || !lmsUser) return;
    setSubmittingReview(true);
    try {
      const { createClient } = await import("../../../../lib/supabase");
      const supabase = createClient();
      const { error } = await supabase
        .from("reviews")
        .insert({
          user_id: lmsUser._id,
          course_id: courseId,
          rating: rating,
          comment: comment,
        });
      if (error) throw error;

      toast.success("Review submitted successfully!");
      setComment("");
      fetchCourseDetails();
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground pt-32 pb-12 px-6 lg:px-10 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background text-foreground pt-32 pb-12 px-6 lg:px-10 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-sm">
          <h2 className="text-lg font-bold text-red-400">Course Not Found</h2>
          <Link href="/learn/courses" className="text-xs text-blue-400 hover:underline">
            Back to Catalog
          </Link>
        </div>
      </div>
    );
  }

  // Price calculations
  const originalPrice = course.price || 0;
  let finalPrice = originalPrice;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === "percentage") {
      finalPrice = Math.max(0, originalPrice * (1 - appliedCoupon.discountValue / 100));
    } else {
      finalPrice = Math.max(0, originalPrice - appliedCoupon.discountValue);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground pt-32 pb-12 px-6 lg:px-10 flex justify-center">
      <div className="max-w-5xl w-full space-y-8">
        
        {/* Top Back bar */}
        <div className="flex justify-between items-center">
          <Link href="/learn/courses" className="flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition">
            <FaArrowLeft /> Back to marketplace
          </Link>
          
          <div className="flex gap-2">
            <button
              onClick={handleWishlistToggle}
              className={`p-2.5 rounded-lg border transition ${
                inWishlist
                  ? "text-red-500 bg-red-950/20 border-red-500/30"
                  : "text-muted-foreground border-border hover:text-white hover:border-border"
              }`}
            >
              <FaHeart />
            </button>
            <button onClick={handleShare} className="p-2.5 rounded-lg border border-border text-muted-foreground hover:text-white hover:border-border transition">
              <FaShareAlt />
            </button>
          </div>
        </div>

        {/* Hero Section */}
        <div className="bg-card rounded-3xl p-8 border border-border flex flex-col lg:flex-row gap-8 relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-[80px] pointer-events-none"></div>

          {/* Details */}
          <div className="flex-1 space-y-4">
            <span className="px-2.5 py-0.5 bg-blue-600/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-wider rounded-full">
              {course.category}
            </span>
            <h1 className="text-3xl font-extrabold text-foreground leading-tight">{course.title}</h1>
            <p className="text-xs text-muted-foreground leading-relaxed font-light">{course.subtitle}</p>

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>Level: {course.level}</span>
              <span>Modules: {course.lessons?.length || 0} Lessons</span>
            </div>

            {/* Checkouts Actions */}
            <div className="pt-4 border-t border-border flex flex-wrap items-center gap-6">
              <div>
                <p className="text-[10px] text-muted-foreground/80 uppercase tracking-wider font-semibold">Course Pricing</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <h3 className="text-2xl font-extrabold text-foreground font-mono">₹{finalPrice.toLocaleString()}</h3>
                  {appliedCoupon && (
                    <span className="text-xs text-muted-foreground/80 line-through font-mono">₹{originalPrice.toLocaleString()}</span>
                  )}
                </div>
              </div>

              {isEnrolled ? (
                <button
                  onClick={() => router.push(`/learn/lecture/${courseId}`)}
                  className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded-lg transition"
                >
                  Enter Classroom
                </button>
              ) : (
                <button
                  onClick={handleEnroll}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition shadow-lg shadow-blue-500/15">
                  Buy Course
                </button>
              )}
            </div>

            {/* Promo code form */}
            {!isEnrolled && (
              <form onSubmit={handleApplyCoupon} className="flex gap-2 max-w-sm pt-2">
                <input
                  type="text"
                  placeholder="Enter Promo Coupon (e.g. DIS50)"
                  className="flex-1 h-9 bg-background border border-border rounded-lg text-foreground text-xs px-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                />
                <button type="submit" className="px-4 py-1.5 bg-card border border-border hover:bg-muted/60 hover:border-border text-foreground text-xs rounded-lg transition">
                  {validatingCoupon ? "Checking..." : "Apply"}
                </button>
              </form>
            )}
            {appliedCoupon && (
              <p className="text-[10px] text-green-400 font-semibold mt-1">
                Coupon Applied! Saved {appliedCoupon.discountType === "percentage" ? `${appliedCoupon.discountValue}%` : `₹${appliedCoupon.discountValue}`}
              </p>
            )}
          </div>

          {/* Image Thumbnail Cover */}
          <div className="w-full lg:w-[350px] aspect-video lg:aspect-auto rounded-2xl overflow-hidden bg-slate-950 border border-border relative flex items-center justify-center">
            {course.thumbnail ? (
              /* eslint-disable-next-line @next/next/no-img-element -- Course thumbnails are loaded dynamically from external storage */
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <FaGraduationCap className="text-slate-800 text-6xl animate-pulse" />
            )}
          </div>
        </div>

        {/* Detailed details: Description, Curriculum */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Description */}
            <div className="bg-card rounded-2xl p-6 border border-border shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Course Summary</h3>
              <p className="text-xs text-muted-foreground leading-relaxed font-light whitespace-pre-wrap">
                {course.description || "No description provided."}
              </p>
            </div>

            {/* Curriculum */}
            <div className="bg-card rounded-2xl p-6 border border-border shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Syllabus Modules</h3>
              
              <div className="space-y-2">
                {course.lessons?.length > 0 ? (
                  course.lessons.map((lec: any, idx: number) => (
                    <div key={idx} className="bg-muted/40 p-3.5 border border-border rounded-xl flex justify-between items-center text-xs">
                      <span className="font-semibold text-muted-foreground truncate max-w-[80%]">{lec.title}</span>
                      <span className="text-[10px] text-muted-foreground/80">Module {idx + 1}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground/80 text-xs py-4 text-center">No lectures uploaded yet.</p>
                )}
              </div>
            </div>

            {/* Student Reviews & Ratings */}
            <div className="bg-card rounded-2xl p-6 border border-border shadow-sm space-y-6">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Student Reviews</h3>

              {/* Submit Review */}
              {isEnrolled && (
                <form onSubmit={handleReviewSubmit} className="space-y-3 border-b border-border pb-6">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground font-semibold uppercase">Rate Stars</span>
                    <select
                      className="bg-background border border-border text-xs p-1.5 rounded focus:outline-none"
                      value={rating}
                      onChange={(e) => setRating(parseInt(e.target.value))}
                    >
                      <option value={5}>⭐⭐⭐⭐⭐ (5/5)</option>
                      <option value={4}>⭐⭐⭐⭐ (4/5)</option>
                      <option value={3}>⭐⭐⭐ (3/5)</option>
                      <option value={2}>⭐⭐ (2/5)</option>
                      <option value={1}>⭐ (1/5)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <textarea
                      placeholder="Write comment feedback..."
                      className="w-full h-16 bg-background border border-border rounded-lg text-foreground text-xs p-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition resize-none"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      required
                    />
                  </div>

                  <button type="submit" className="px-5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition">
                    {submittingReview ? "Submitting..." : "Submit Review"}
                  </button>
                </form>
              )}

              {/* Reviews List */}
              <div className="space-y-3">
                {course.reviews?.length > 0 ? (
                  course.reviews.map((rev: any, idx: number) => (
                    <div key={idx} className="bg-muted/40 p-4 border border-border rounded-xl space-y-2 text-left">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-bold text-foreground">{rev.user?.name || "Anonymous Learner"}</span>
                        <span className="flex text-yellow-500 gap-0.5">
                          {Array.from({ length: rev.rating }).map((_, i) => <FaStar key={i} />)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground font-light leading-relaxed">{rev.comment}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground/80 text-xs text-center py-4">No reviews recorded yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar: Tutor Details, Related Courses */}
          <div className="space-y-8">
            {/* Tutor Bio card */}
            {creator && (
              <div className="bg-card rounded-2xl p-6 border border-border shadow-sm space-y-4 text-center">
                <div className="flex justify-center">
                  {creator.photoUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element -- Tutor profile images are loaded dynamically from external storage */
                    <img src={creator.photoUrl} alt="" className="w-16 h-16 rounded-full object-cover border border-border" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-blue-600/10 text-blue-400 flex items-center justify-center text-xl font-bold">
                      <FaUser />
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">{creator.name}</h4>
                  <p className="text-[10px] text-muted-foreground/80 mt-0.5">EduEarn Certified Mentor</p>
                </div>
                <p className="text-[10px] text-muted-foreground font-light leading-relaxed">
                  {creator.description || "Educator sharing curriculum knowledge and building custom courses."}
                </p>
              </div>
            )}

            {/* Related Courses */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-1">Related Courses</h3>
              
              {relatedCourses.length > 0 ? (
                <div className="space-y-3">
                  {relatedCourses.map((c) => (
                    <button
                      key={c._id}
                      onClick={() => router.push(`/learn/course/${c._id}`)}
                      className="w-full p-3 bg-card hover:bg-muted border border-border rounded-xl text-left transition flex justify-between items-center group shadow-sm"
                    >
                      <div className="truncate max-w-[80%]">
                        <p className="text-xs font-bold text-foreground group-hover:text-blue-400 transition truncate">{c.title}</p>
                        <span className="text-[9px] text-muted-foreground/80">{c.category}</span>
                      </div>
                      <span className="text-[10px] font-bold text-muted-foreground font-mono">₹{c.price}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-[10px] text-muted-foreground/80 pl-1 font-light">No other courses by this tutor.</p>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
