"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Container } from "../Container";
import { PageWrapper } from "../PageWrapper";
import { Card } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Avatar } from "../../ui/avatar";
import { Dialog } from "../../ui/dialog";
import { Divider } from "../../ui/divider";
import { toast } from "sonner";
import { formatCurrency } from "../../../utils/formatCurrency";
import { PaymentService } from "../../../features/payments/services/paymentService";

import { MOCK_COURSES, MOCK_TUTORS, MOCK_REVIEWS } from "../../../constants/mockData";
import {
  Star,
  Award,
  ShieldCheck,
  ChevronRight,
  MessageSquare,
  Sparkles,
  Zap,
  Search,
  Languages,
  CheckCircle2,
  Clock,
  Briefcase,
  Play,
  Calendar as CalendarIcon,
  HelpCircle,
  Video,
  ExternalLink,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Ticket
} from "lucide-react";

interface TutorProfileClientProps {
  tutor: typeof MOCK_TUTORS[number];
  tutorCourses: typeof MOCK_COURSES;
  tutorReviews: typeof MOCK_REVIEWS;
}

export function TutorProfileClient({
  tutor,
  tutorCourses,
  tutorReviews,
}: TutorProfileClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isTrialOpen, setIsTrialOpen] = useState(false);
  const [trialDate, setTrialDate] = useState("");
  const [trialTimeSlot, setTrialTimeSlot] = useState("");

  useEffect(() => {
    if (searchParams && searchParams.get("bookTrial") === "true") {
      setIsTrialOpen(true);
    }
  }, [searchParams]);

  const handleBookFreeTrialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trialDate || !trialTimeSlot) {
      toast.error("Please select a date and time slot for your free trial");
      return;
    }

    const newBooking = {
      tutorId: tutor.id,
      tutorName: tutor.fullName,
      date: trialDate,
      time: trialTimeSlot,
      courseTitle: tutorCourses[0]?.title || "1-on-1 Mentorship",
      bookedAt: new Date().toISOString(),
    };

    if (typeof window !== "undefined") {
      const existing = localStorage.getItem("eduearn_bookings");
      let bookings = [];
      if (existing) {
        try {
          bookings = JSON.parse(existing);
        } catch {}
      }
      bookings.push(newBooking);
      localStorage.setItem("eduearn_bookings", JSON.stringify(bookings));
    }

    toast.success(`Success! Your free trial session with ${tutor.fullName} has been booked!`);
    setIsTrialOpen(false);
  };

  // Social Stats
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(124);
  const [isMessageOpen, setIsMessageOpen] = useState(false);
  const [messageText, setMessageText] = useState("");

  // Step 1: Course Selection States
  const [selectedCourse, setSelectedCourse] = useState<typeof MOCK_COURSES[number] | null>(null);

  // Step 2: Learning Plan States
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [planPrice, setPlanPrice] = useState<number>(0);

  // Step 3: Batch Selection States
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null);
  const [batchPlatform, setBatchPlatform] = useState<"Google Meet" | "Zoom">("Google Meet");

  // Step 4: 1-to-1 Booking States
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("");
  const [selectedTimezone, setSelectedTimezone] = useState<string>("IST (UTC+5:30)");

  // Sticky checkout states
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discount, setDiscount] = useState(0);

  // FAQ Accordion State
  const [faqOpenIdx, setFaqOpenIdx] = useState<number | null>(null);

  // Demo Video State
  const [isPlayingDemo, setIsPlayingDemo] = useState(false);

  // Follow Toggle
  const handleFollowToggle = () => {
    if (isFollowing) {
      setIsFollowing(false);
      setFollowersCount((prev) => prev - 1);
      toast.info(`Unfollowed ${tutor.fullName}`);
    } else {
      setIsFollowing(true);
      setFollowersCount((prev) => prev + 1);
      toast.success(`Following ${tutor.fullName}!`);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) {
      toast.error("Please write a message before sending.");
      return;
    }
    toast.success(`Message sent to ${tutor.fullName}!`);
    setMessageText("");
    setIsMessageOpen(false);
  };

  // Select Course Handler
  const handleSelectCourse = (course: typeof MOCK_COURSES[number]) => {
    setSelectedCourse(course);
    setSelectedPlan(null);
    setSelectedBatch(null);
    setSelectedDate("");
    setSelectedTimeSlot("");
    setDiscount(0);
    setAppliedCoupon(null);
    setCouponCode("");
  };

  // Select Plan Handler
  const handleSelectPlan = (planName: string, price: number) => {
    setSelectedPlan(planName);
    setPlanPrice(price);
    setSelectedBatch(null);
    setSelectedDate("");
    setSelectedTimeSlot("");
  };

  // Select Batch Handler
  const handleSelectBatch = (batchName: string, platform: "Google Meet" | "Zoom") => {
    setSelectedBatch(batchName);
    setBatchPlatform(platform);
  };

  // Promo Coupon Handler
  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }
    const res = PaymentService.validateCoupon(couponCode, planPrice);
    if (res.success) {
      setDiscount(res.discountAmount);
      setAppliedCoupon(couponCode);
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
  };

  // Checkout Redirect Trigger
  const handleCheckoutRedirect = () => {
    if (!selectedCourse) {
      toast.error("Please select a course to continue");
      return;
    }
    if (!selectedPlan) {
      toast.error("Please select a learning plan");
      return;
    }
    if (selectedPlan === "One-to-One Session" && (!selectedDate || !selectedTimeSlot)) {
      toast.error("Please choose a schedule slot for your 1-to-1 session");
      return;
    }
    if (selectedPlan !== "One-to-One Session" && !selectedBatch) {
      toast.error("Please select an upcoming class batch");
      return;
    }

    // Redirect to Checkout Page passing details dynamically
    router.push(
      `/checkout?tutorId=${tutor.id}` +
      `&courseId=${selectedCourse.id}` +
      `&planId=${encodeURIComponent(selectedPlan)}` +
      `&batchId=${encodeURIComponent(selectedBatch || "One-to-One Session")}` +
      `&amount=${planPrice}` +
      `&platform=${batchPlatform}` +
      `&coupon=${appliedCoupon || ""}`
    );
  };

  // Dynamic Plans options mapping based on Selected Course Price
  const learningPlans = selectedCourse ? [
    { name: "One-to-One Session", desc: "1-on-1 personalized tutoring session slots", price: Math.round(selectedCourse.price * 1.5), period: "session" },
    { name: "Group Batch", desc: "Interact dynamically in shared group cohorts", price: Math.round(selectedCourse.price * 0.8), period: "month" },
    { name: "Weekend Batch", desc: "Weekend-only live classes and doubt clearing sessions", price: Math.round(selectedCourse.price * 0.9), period: "month" },
    { name: "Crash Course", desc: "Fast-track coverage of entire syllabus core concepts", price: Math.round(selectedCourse.price * 0.6), period: "one-time" },
    { name: "Doubt Clearing Package", desc: "Dedicated access to daily doubt hours and Q&A chat", price: Math.round(selectedCourse.price * 0.4), period: "month" }
  ] : [];

  const batches = [
    { name: "Morning Batch", time: "07:30 AM - 09:00 AM", days: "Mon, Wed, Fri", platform: "Google Meet" as const, seats: 3, date: "Starts next Monday" },
    { name: "Evening Batch", time: "06:00 PM - 07:30 PM", days: "Tue, Thu, Sat", platform: "Zoom" as const, seats: 5, date: "Starts next Tuesday" },
    { name: "Weekend Batch", time: "10:00 AM - 01:00 PM", days: "Sat, Sun", platform: "Google Meet" as const, seats: 8, date: "Starts next Saturday" },
    { name: "Fast Track Cohort", time: "03:00 PM - 05:00 PM", days: "Mon to Fri", platform: "Zoom" as const, seats: 2, date: "Starts next Monday" }
  ];

  const timeSlots = ["10:00 AM - 11:30 AM", "02:00 PM - 03:30 PM", "04:30 PM - 06:00 PM", "07:00 PM - 08:30 PM"];

  const faqs = [
    { q: "Can I reschedule my 1-to-1 coaching slots?", a: "Yes, you can request rescheduling up to 2 hours before the scheduled time slot directly from your calendar panel." },
    { q: "Are study notes, lecture archives, and certificates included?", a: "Absolutely. All packages (excluding single session custom lessons) grant complete access to recorded archives and verified credentials." },
    { q: "Where will my live video classes be hosted?", a: "Interactive classes are hosted on Google Meet or Zoom. Access URLs are auto-generated on your dashboard 10 minutes prior to session starts." }
  ];

  const upcomingLiveClasses = [
    { title: "Live Cohort Orientation", date: "July 10, 2026", time: "6:00 PM IST", platform: "Google Meet", seats: "3 seats left" },
    { title: "Calculus Doubt Resolution", date: "July 12, 2026", time: "4:30 PM IST", platform: "Zoom", seats: "6 seats left" }
  ];



  const completionRate = "98%";
  
  // Deterministic Mock tutor attributes for S2S marketplace vision
  const tutorIdNum = parseInt(tutor.id.replace("tutor-", "")) || 1;
  const colleges = ["IIT Delhi", "BITS Pilani", "Delhi Technological University", "VIT Vellore", "SRM/VIT University", "St. Stephen's College", "Delhi University"];
  const college = colleges[tutorIdNum % colleges.length];
  
  const branches = ["Computer Science & Eng", "Mechanical Eng", "Electrical Eng", "Physics & Math", "Electronics & Comm", "Applied Chemistry"];
  const branch = branches[tutorIdNum % branches.length];
  
  const years = ["3rd Year B.Tech", "2nd Year B.Sc", "Final Year B.Tech", "1st Year M.Sc", "4th Year Dual Degree"];
  const year = years[tutorIdNum % years.length];
  
  const responseTimes = ["Within 30 mins", "< 1 Hour", "< 2 Hours", "Within 45 mins"];
  const responseTime = responseTimes[tutorIdNum % responseTimes.length];
  
  const tutorLevel = tutor.rating >= 4.9 ? "👑 Elite Mentor" : tutor.rating >= 4.8 ? "🏆 Top Mentor" : tutor.rating >= 4.7 ? "⭐ Popular Tutor" : "🌱 Rising Tutor";
  const liveClassesHeld = 12 + (tutor.totalCourses * 4);

  return (
    <PageWrapper>
      {/* 1. Tutor Profile Hero Header Banner */}
      <section className="w-full py-12 bg-muted/20 border-b border-border/40 text-left select-none relative overflow-hidden">
        <Container className="flex flex-col gap-4 relative z-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-semibold">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <ChevronRight size={10} />
            <Link href="/tutors" className="hover:text-foreground">Tutors</Link>
            <ChevronRight size={10} />
            <span className="text-foreground truncate">{tutor.fullName}</span>
          </div>

          <Card variant="glass" className="p-6 border-border/50 bg-card flex flex-col md:flex-row gap-6 items-start mt-2 shadow-premium">
            <Avatar src={tutor.avatar} name={tutor.fullName} size="lg" badge="verified" className="shrink-0" />
            
            <div className="flex flex-col gap-3 grow text-left">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-heading font-extrabold text-foreground">
                      {tutor.fullName}
                    </h1>
                    {tutor.verificationStatus === "ai_verified" && (
                      <Badge variant="ai" className="text-white flex items-center gap-0.5 shadow-soft animate-pulse">
                        <ShieldCheck size={11} className="fill-white text-emerald-500" />
                        AI Verified
                      </Badge>
                    )}
                  </div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground/80 bg-muted px-2.5 py-0.5 rounded inline-block mt-1">
                    {tutorLevel} • {tutor.experience} Experience
                  </span>
                  <div className="text-xs text-muted-foreground/90 font-medium mt-1">
                    🎓 {college} • {branch} • {year}
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <Button
                    variant={isFollowing ? "outline" : "primary"}
                    size="sm"
                    onClick={handleFollowToggle}
                  >
                    {isFollowing ? "Following" : "Follow Tutor"}
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsMessageOpen(true)}
                    className="flex items-center gap-1"
                  >
                    <MessageSquare size={13} />
                    Message
                  </Button>
                </div>
              </div>

              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed max-w-2xl mt-1">
                {tutor.bio}
              </p>

              {/* Bio quick metadata stats */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2.5 mt-2 border-t border-border/30 pt-4 text-xs font-semibold text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Star size={13} className="fill-amber-500 text-amber-500" />
                  {tutor.rating.toFixed(1)} Rating ({tutorReviews.length} reviews)
                </span>
                <span>•</span>
                <span>{followersCount} Followers</span>
                <span>•</span>
                <span>{tutor.totalStudents} Students Mentored</span>
                <span>•</span>
                <span>{tutor.totalCourses} Courses Created</span>
                <span>•</span>
                <span>Response: {responseTime}</span>
                <span>•</span>
                <span>Languages: {tutor.languages}</span>
              </div>
              <div className="text-[11px] text-muted-foreground mt-3 font-semibold select-none bg-muted/10 p-2.5 rounded-xl border border-border/40">
                📚 Mentoring Subjects: <span className="text-foreground">{tutor.subjectsTaught?.join(", ") || tutor.expertise?.join(", ")}</span>
              </div>
            </div>
          </Card>
        </Container>
      </section>

      {/* 2. Main Page Grid */}
      <section className="w-full py-12 select-none relative text-left">
        <Container className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* MAIN COLUMN (LEFT SIDE - col-span-8) */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            
            {/* Demo Video Section */}
            <Card variant="default" className="p-5 border-border bg-card overflow-hidden">
              <h3 className="text-sm font-heading font-extrabold uppercase tracking-wide text-foreground border-b border-border/40 pb-2.5 mb-4">
                Classroom Demo &amp; Portfolio Tour
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                <div className="md:col-span-7 relative aspect-video bg-slate-900 rounded-xl overflow-hidden group border border-border/40 flex items-center justify-center">
                  {isPlayingDemo ? (
                    <div className="p-6 text-center text-xs text-white bg-slate-900/90 w-full h-full flex flex-col items-center justify-center gap-3">
                      <Video size={36} className="text-primary animate-pulse" />
                      <div className="space-y-1">
                        <span className="font-bold block">Streaming Sample Class Lecture...</span>
                        <p className="text-[10px] text-muted-foreground leading-normal max-w-xs">
                          Demonstration sample active. Connect with this tutor to setup interactive live screen shares.
                        </p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setIsPlayingDemo(false)} className="text-[10px] h-8 text-white border-white/20">
                        Stop Video
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent z-10" />
                      <div className="absolute inset-0 bg-slate-800/20 group-hover:bg-slate-850/40 transition-colors" />
                      <button
                        onClick={() => setIsPlayingDemo(true)}
                        className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center hover:scale-110 shadow-soft transition-transform z-20 cursor-pointer"
                      >
                        <Play size={20} className="fill-current ml-0.5" />
                      </button>
                      <span className="absolute bottom-3 left-3 text-[10px] font-bold text-white z-20 flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded">
                        <Clock size={10} /> 2:15 Demo Preview
                      </span>
                    </>
                  )}
                </div>

                <div className="md:col-span-5 space-y-4">
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase font-bold text-primary tracking-wider">Meet the Tutor</span>
                    <h4 className="text-xs font-bold text-foreground">Active Learning Methods</h4>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                      Watch a 2-minute introductory session showing virtual whiteboard flows, live doubt resolutions, and step-by-step syllabus coaching.
                    </p>
                  </div>
                  
                  {/* Languages and Skills list */}
                  <div className="space-y-2 text-[10px]">
                    <span className="font-bold text-foreground block">Languages Spoken</span>
                    <div className="flex gap-1.5 flex-wrap">
                      {tutor.languages.map((l, i) => (
                        <span key={i} className="px-2 py-0.5 bg-muted rounded font-semibold text-muted-foreground border border-border/40">
                          {l}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Step 1: Tutor Course Selection */}
            <div className="space-y-4">
              <div className="border-b border-border pb-3">
                <h3 className="text-base font-heading font-extrabold text-foreground">
                  1. Choose Course / Subject Syllabus
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Select which course syllabus package you want to learn under this educator.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {tutorCourses.map((course) => {
                  const isSelected = selectedCourse?.id === course.id;
                  return (
                    <div
                      key={course.id}
                      onClick={() => handleSelectCourse(course)}
                      className={`card-surface p-4 rounded-xl cursor-pointer transition-all duration-300 border text-left flex flex-col justify-between gap-3 relative ${
                        isSelected
                          ? "border-primary bg-primary/5 shadow-soft ring-2 ring-primary/20 scale-[1.01]"
                          : "border-border hover:border-slate-400 hover:translate-y-[-2px]"
                      }`}
                    >
                      {/* Tick Icon Overlay */}
                      {isSelected && (
                        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center shadow-soft">
                          <CheckCircle2 size={12} className="fill-current" />
                        </div>
                      )}

                      <div>
                        <span className="text-[8px] font-extrabold uppercase bg-muted/60 text-muted-foreground px-2 py-0.5 rounded border border-border/40">
                          {course.category}
                        </span>
                        <h4 className="text-xs font-bold text-foreground mt-2.5 leading-snug pr-6">
                          {course.title}
                        </h4>
                        
                        <div className="flex items-center gap-3.5 mt-2.5 text-[10px] text-muted-foreground font-semibold">
                          <span className="flex items-center gap-0.5 text-amber-500">
                            ★ <strong className="text-foreground">{course.rating}</strong>
                          </span>
                          <span>👥 {course.studentsCount} students</span>
                          <span>⏱️ {course.duration}</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center border-t border-border/40 pt-2.5 mt-1">
                        <span className="text-xs font-black text-primary">
                          {formatCurrency(course.price)}
                        </span>
                        <span className="text-[9px] uppercase font-extrabold text-muted-foreground">
                          {course.level.replace("_", " ")}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Learning Plan Selection */}
            {selectedCourse && (
              <div className="space-y-4 animate-fade-in">
                <div className="border-b border-border pb-3">
                  <h3 className="text-base font-heading font-extrabold text-foreground">
                    2. Select Learning Plan Package
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Choose a subscription or payment package tailored for your weekly revision schedule.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {learningPlans.map((plan) => {
                    const isSelected = selectedPlan === plan.name;
                    return (
                      <div
                        key={plan.name}
                        onClick={() => handleSelectPlan(plan.name, plan.price)}
                        className={`card-surface p-4 rounded-xl cursor-pointer transition-all border text-left flex flex-col justify-between gap-3 relative ${
                          isSelected
                            ? "border-primary bg-primary/5 shadow-soft ring-2 ring-primary/20"
                            : "border-border hover:border-slate-400"
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center">
                            <CheckCircle2 size={12} className="fill-current" />
                          </div>
                        )}

                        <div>
                          <span className="text-xs font-extrabold text-foreground block">{plan.name}</span>
                          <p className="text-[10px] text-muted-foreground leading-normal mt-1 pr-6">
                            {plan.desc}
                          </p>
                        </div>

                        <div className="flex items-baseline justify-between border-t border-border/30 pt-2.5 mt-1">
                          <span className="text-xs font-black text-primary">
                            {formatCurrency(plan.price)}
                          </span>
                          <span className="text-[9px] text-muted-foreground font-semibold">
                            {plan.period === "one-time" ? "one-time buy" : `per ${plan.period}`}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 3 & 4: Batch / Schedule Selection */}
            {selectedPlan && (
              <div className="space-y-6 animate-fade-in">
                {selectedPlan === "One-to-One Session" ? (
                  /* Step 4: One-to-One Calendar Schedule booking */
                  <div className="space-y-4">
                    <div className="border-b border-border pb-3">
                      <h3 className="text-base font-heading font-extrabold text-foreground">
                        3. Schedule 1-on-1 Coaching Session
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Choose a date and time slot for your personal mentoring session.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                      {/* Date Picker Mock */}
                      <Card className="p-4 border-border md:col-span-7 space-y-3 bg-card">
                        <span className="text-[10px] font-bold text-foreground block">Select Date</span>
                        <div className="grid grid-cols-5 gap-2 text-center text-xs">
                          {Array.from({ length: 10 }).map((_, idx) => {
                            const date = new Date();
                            date.setDate(date.getDate() + idx);
                            const dayName = date.toLocaleDateString("en-IN", { weekday: 'short' });
                            const dayNum = date.getDate();
                            const dateStr = date.toISOString().split("T")[0];
                            const isChosen = selectedDate === dateStr;

                            return (
                              <button
                                key={idx}
                                onClick={() => setSelectedDate(dateStr)}
                                className={`p-2.5 rounded-lg flex flex-col items-center justify-center border cursor-pointer transition-all ${
                                  isChosen
                                    ? "border-primary bg-primary text-foreground font-bold"
                                    : "border-border hover:bg-muted/40 text-foreground"
                                }`}
                              >
                                <span className="text-[9px] uppercase tracking-wider block opacity-80">{dayName}</span>
                                <span className="text-xs font-extrabold block mt-0.5">{dayNum}</span>
                              </button>
                            );
                          })}
                        </div>
                      </Card>

                      {/* Time & Timezone Picker */}
                      <Card className="p-4 border-border md:col-span-5 space-y-4 bg-card text-xs">
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-bold text-foreground block">Choose Timing slot</span>
                          <div className="flex flex-col gap-2">
                            {timeSlots.map((slot) => (
                              <button
                                key={slot}
                                onClick={() => setSelectedTimeSlot(slot)}
                                className={`w-full py-2 px-3 rounded-lg border text-left font-bold transition-all ${
                                  selectedTimeSlot === slot
                                    ? "border-primary bg-primary/5 text-primary"
                                    : "border-border hover:bg-muted/30 text-muted-foreground"
                                }`}
                              >
                                ⏰ {slot}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-foreground block">Timezone</label>
                          <select
                            value={selectedTimezone}
                            onChange={(e) => setSelectedTimezone(e.target.value)}
                            className="w-full h-9 rounded border border-border bg-card px-2 text-[10px] font-semibold text-foreground focus:outline-none cursor-pointer"
                          >
                            <option>IST (UTC+5:30) - Mumbai, Kolkata</option>
                            <option>EST (UTC-5:00) - New York, Toronto</option>
                            <option>GMT (UTC+0:00) - London, Dublin</option>
                          </select>
                        </div>
                      </Card>
                    </div>
                  </div>
                ) : (
                  /* Step 3: Group Cohort Batch Selection */
                  <div className="space-y-4">
                    <div className="border-b border-border pb-3">
                      <h3 className="text-base font-heading font-extrabold text-foreground">
                        3. Choose Class Batch Schedule
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Select an upcoming group cohort batch. Class links are auto-configured for dashboard access.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {batches.map((batch) => {
                        const isChosen = selectedBatch === batch.name;
                        return (
                          <div
                            key={batch.name}
                            onClick={() => handleSelectBatch(batch.name, batch.platform)}
                            className={`card-surface p-4 rounded-xl cursor-pointer border text-left flex flex-col justify-between gap-3 relative transition-all ${
                              isChosen
                                ? "border-primary bg-primary/5 shadow-soft ring-2 ring-primary/20"
                                : "border-border hover:border-slate-400"
                            }`}
                          >
                            {isChosen && (
                              <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center">
                                <CheckCircle2 size={12} className="fill-current" />
                              </div>
                            )}

                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-foreground">{batch.name}</span>
                                <Badge variant="danger" className="text-[7px] py-0 px-1">{batch.seats} seats left</Badge>
                              </div>
                              <div className="text-[10px] text-muted-foreground mt-2 space-y-1 font-semibold">
                                <div className="flex items-center gap-1">⏰ <span>{batch.time}</span></div>
                                <div className="flex items-center gap-1">📅 <span>{batch.days}</span></div>
                                <div className="flex items-center gap-1">💻 <span className="text-primary">{batch.platform}</span></div>
                              </div>
                            </div>

                            <div className="border-t border-border/30 pt-2 text-[9px] text-muted-foreground font-bold flex justify-between">
                              <span>{batch.date}</span>
                              <span className="text-emerald-600">Simulated Link</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Upcoming Live Classes list */}
            <div className="border-t border-border/30 pt-8">
              
              {/* Upcoming live calendar */}
              <div className="space-y-4 max-w-md">
                <h4 className="text-xs font-heading font-extrabold uppercase tracking-wider text-foreground">
                  Upcoming Live Classes
                </h4>
                <div className="flex flex-col gap-3">
                  {upcomingLiveClasses.map((live, idx) => (
                    <div key={idx} className="p-3 border border-border/60 bg-muted/15 rounded-xl flex items-center justify-between text-xs">
                      <div className="text-left space-y-0.5">
                        <span className="font-bold text-foreground block">{live.title}</span>
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                          <span>{live.date}</span>
                          <span>•</span>
                          <span>{live.time}</span>
                        </div>
                      </div>
                      <Badge variant="primary" className="text-[8px] py-0.5 px-2 font-bold uppercase shrink-0">
                        {live.platform}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Frequently Asked Questions */}
            <div className="space-y-4 border-t border-border/30 pt-8 text-xs">
              <h3 className="text-sm font-heading font-extrabold uppercase text-foreground">
                Frequently Asked Questions (FAQs)
              </h3>
              <div className="flex flex-col gap-2.5">
                {faqs.map((faq, idx) => {
                  const isOpen = faqOpenIdx === idx;
                  return (
                    <div key={idx} className="border border-border bg-card rounded-lg overflow-hidden text-left">
                      <button
                        onClick={() => setFaqOpenIdx(isOpen ? null : idx)}
                        className="w-full p-3.5 font-bold flex justify-between items-center text-foreground cursor-pointer focus:outline-none"
                      >
                        <span className="pr-4">{faq.q}</span>
                        {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                      {isOpen && (
                        <div className="px-3.5 pb-3.5 text-muted-foreground text-[11px] leading-relaxed border-t border-border/20 pt-2">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Testimonials and Reviews */}
            <div className="flex flex-col gap-6 border-t border-border/30 pt-8">
              <h3 className="text-base font-heading font-extrabold text-foreground">
                Verified Student Reviews
              </h3>
              
              <div className="flex flex-col gap-4">
                {tutorReviews.map((review) => (
                  <Card key={review.id} variant="glass" className="p-5 border-border/40 bg-card flex flex-col gap-3 text-left">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-[10px] text-primary shrink-0">
                          {review.authorName.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-foreground">{review.authorName}</span>
                          <span className="text-[8px] text-muted-foreground font-semibold">Course: {review.courseName}</span>
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

          </div>

          {/* SIDE COLUMN (RIGHT SIDE - col-span-4) */}
          <div className="lg:col-span-4 flex flex-col gap-6 lg:sticky lg:top-24">
            
            {/* Dynamic Sticky Order Summary Box */}
            <Card variant="glass" className="p-5 border-primary/20 bg-card shadow-premium relative overflow-hidden flex flex-col gap-4">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-8 -mt-8 pointer-events-none" />
              
              <div>
                <span className="text-[9px] uppercase font-heading font-extrabold tracking-widest text-primary">
                  Order Summary
                </span>
                <h4 className="text-sm font-heading font-extrabold text-foreground mt-1">
                  Selected Checkout Specs
                </h4>
              </div>

              {!selectedCourse ? (
                <div className="py-8 text-center text-[10px] text-muted-foreground font-semibold bg-muted/10 rounded-xl border border-dashed border-border/80">
                  Please select a course syllabus to initiate order pricing.
                </div>
              ) : (
                <div className="space-y-4 animate-fade-in">
                  
                  {/* Selected Specs list */}
                  <div className="text-xs text-muted-foreground space-y-2.5 text-left leading-normal font-semibold">
                    <div className="flex justify-between items-start gap-3">
                      <span>Course</span>
                      <span className="text-foreground font-bold text-right truncate max-w-[150px]">{selectedCourse.title}</span>
                    </div>

                    {selectedPlan ? (
                      <>
                        <div className="flex justify-between">
                          <span>Plan</span>
                          <span className="text-primary font-bold">{selectedPlan}</span>
                        </div>

                        {selectedPlan === "One-to-One Session" ? (
                          <div className="flex justify-between items-start gap-3">
                            <span>Schedule</span>
                            <span className="text-foreground font-bold text-right">
                              {selectedDate ? `${selectedDate} @ ${selectedTimeSlot || "Select time"}` : "Choose date & time"}
                            </span>
                          </div>
                        ) : (
                          <div className="flex justify-between">
                            <span>Batch</span>
                            <span className="text-foreground font-bold">{selectedBatch || "Choose batch"}</span>
                          </div>
                        )}

                        <div className="flex justify-between">
                          <span>Meeting Platform</span>
                          <span className="text-foreground font-bold">{batchPlatform}</span>
                        </div>
                      </>
                    ) : (
                      <div className="text-[10px] text-center text-muted-foreground bg-muted/5 p-2 rounded border border-border/40">
                        Choose a learning plan to proceed
                      </div>
                    )}
                  </div>

                  {selectedPlan && (
                    <>
                      <Divider />

                      {/* Promo Code Input */}
                      <div className="space-y-1.5 text-left text-xs">
                        <label className="font-bold text-foreground flex items-center gap-1">
                          <Ticket size={11} className="text-primary" /> Apply Promo Code
                        </label>
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            placeholder="WELCOME10"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                            disabled={!!appliedCoupon}
                            className="h-8 grow rounded border border-border bg-card px-2.5 text-[11px] font-bold text-foreground placeholder:text-muted-foreground/80 focus:outline-none disabled:bg-muted/40 uppercase"
                          />
                          {appliedCoupon ? (
                            <button
                              onClick={() => {
                                setDiscount(0);
                                setAppliedCoupon(null);
                                setCouponCode("");
                              }}
                              className="text-[10px] text-red-500 font-bold px-2 hover:underline shrink-0"
                            >
                              Remove
                            </button>
                          ) : (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={handleApplyCoupon}
                              className="h-8 text-[10px]"
                            >
                              Apply
                            </Button>
                          )}
                        </div>
                      </div>

                      <Divider />

                      {/* Calculations breakdown */}
                      <div className="space-y-2 text-[11px] text-muted-foreground text-left font-semibold">
                        <div className="flex justify-between">
                          <span>Base Price</span>
                          <span className="text-foreground font-bold">{formatCurrency(planPrice)}</span>
                        </div>

                        {discount > 0 && (
                          <div className="flex justify-between text-emerald-600 font-bold">
                            <span>Promo Discount</span>
                            <span>-{formatCurrency(discount)}</span>
                          </div>
                        )}

                        <div className="flex justify-between">
                          <span>GST (18% Service Tax)</span>
                          <span className="text-foreground font-bold">
                            {formatCurrency(Math.round((planPrice - discount) * 0.18))}
                          </span>
                        </div>

                        <Divider className="my-1" />

                        <div className="flex justify-between text-xs font-black text-foreground pt-0.5">
                          <span>Final Amount Due</span>
                          <span className="text-primary font-black">
                            {formatCurrency(Math.round((planPrice - discount) * 1.18))}
                          </span>
                        </div>
                      </div>

                      <Button
                        onClick={handleCheckoutRedirect}
                        className="w-full h-10 text-[10px] font-bold mt-2 shadow-soft"
                      >
                        Enroll &amp; Pay Now
                      </Button>
                    </>
                  )}

                </div>
              )}
            </Card>

            {/* Statistics box */}
            <Card variant="default" className="p-5 border-border bg-card">
              <h4 className="text-xs font-heading font-extrabold uppercase tracking-wider text-foreground mb-4">
                Educator Statistics
              </h4>
              <div className="flex flex-col gap-4 text-xs text-muted-foreground">
                <div className="flex justify-between items-center py-0.5">
                  <span>Courses Published</span>
                  <span className="font-extrabold text-foreground">{tutor.totalCourses}</span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span>Students Taught</span>
                  <span className="font-extrabold text-foreground">{tutor.totalStudents}</span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span>Average Rating</span>
                  <span className="font-extrabold text-foreground flex items-center gap-0.5">
                    <Star size={11} className="fill-amber-500 text-amber-500" />
                    {tutor.rating.toFixed(1)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span>Course Completion Rate</span>
                  <span className="font-extrabold text-foreground">{completionRate}</span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span>Response Time</span>
                  <span className="font-extrabold text-foreground">{responseTime}</span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span>Live doubt classes conducted</span>
                  <span className="font-extrabold text-foreground">{liveClassesHeld}</span>
                </div>
              </div>
            </Card>

            {/* Achievements badges list */}
            <Card variant="default" className="p-5 border-border bg-card">
              <h4 className="text-xs font-heading font-extrabold uppercase tracking-wider text-foreground mb-4">
                Badges &amp; Achievements
              </h4>
              <div className="flex flex-col gap-3.5">
                {[
                  { title: "Elite Tutor", desc: "Maintains >4.8 average rating stars", icon: <Award size={15} className="text-red-500" /> },
                  { title: "Fast Responder", desc: "Averages replies within 2 hours", icon: <Zap size={15} className="text-amber-500" /> },
                  { title: "Community Mentor", desc: "Teaches over 100 active learners", icon: <Sparkles size={15} className="text-purple-600" /> },
                ].map((ach, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs text-muted-foreground leading-normal">
                    <div className="w-8 h-8 rounded-full bg-muted border border-border/50 flex items-center justify-center shrink-0 mt-0.5">
                      {ach.icon}
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="font-bold text-foreground">{ach.title}</span>
                      <span className="text-[10px] text-muted-foreground mt-0.5">{ach.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

          </div>

        </Container>
      </section>

      {/* Message overlay dialog popup */}
      <Dialog
        isOpen={isMessageOpen}
        onClose={() => setIsMessageOpen(false)}
        title={`Message ${tutor.fullName}`}
        className="max-w-md"
      >
        <form onSubmit={handleSendMessage} className="flex flex-col gap-4 text-xs select-none">
          <p className="text-muted-foreground text-[10px] text-left leading-relaxed">
            Send an instant message query regarding live schedule timings, syllabus parameters, or lesson files downloads.
          </p>
          <div className="flex flex-col gap-1.5 text-left">
            <span className="font-bold text-foreground">Your Message</span>
            <textarea
              rows={4}
              placeholder="Hi! I had a quick question regarding Unit 2.2..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="w-full bg-card border border-border shadow-sm hover:shadow-md transition-shadow duration-200/85 rounded-input p-3 focus:outline-none focus:border-primary/50 text-xs font-semibold text-foreground placeholder:text-muted-foreground/80 resize-none"
            />
          </div>
          <div className="flex items-center justify-end gap-2 border-t border-border/50 pt-4 mt-2">
            <Button variant="outline" size="sm" onClick={() => setIsMessageOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm">
              Send Message
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Free Trial booking dialog popup */}
      <Dialog
        isOpen={isTrialOpen}
        onClose={() => setIsTrialOpen(false)}
        title={`Book Free Trial Session with ${tutor.fullName}`}
        className="max-w-lg"
      >
        <form onSubmit={handleBookFreeTrialSubmit} className="flex flex-col gap-5 text-xs select-none">
          <p className="text-muted-foreground text-[10px] text-left leading-relaxed">
            Select an available schedule slot below. Your free trial is a 60-minute 1-on-1 video call focusing on doubt-clearance or introductory topics.
          </p>

          <div className="flex flex-col gap-2 text-left">
            <span className="font-bold text-foreground text-[10px] uppercase">1. Select Date</span>
            <div className="grid grid-cols-5 gap-2 text-center text-xs">
              {Array.from({ length: 5 }).map((_, idx) => {
                const date = new Date();
                date.setDate(date.getDate() + idx + 1); // start tomorrow
                const dayName = date.toLocaleDateString("en-IN", { weekday: 'short' });
                const dayNum = date.getDate();
                const dateStr = date.toISOString().split("T")[0];
                const isChosen = trialDate === dateStr;

                return (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => setTrialDate(dateStr)}
                    className={`p-2 rounded-lg flex flex-col items-center justify-center border cursor-pointer transition-all ${
                      isChosen
                        ? "border-primary bg-primary text-white font-bold"
                        : "border-border hover:bg-muted/40 text-foreground"
                    }`}
                  >
                    <span className="text-[8px] uppercase tracking-wider block opacity-80">{dayName}</span>
                    <span className="text-xs font-extrabold block mt-0.5">{dayNum}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-2 text-left">
            <span className="font-bold text-foreground text-[10px] uppercase">2. Select Time Slot</span>
            <div className="grid grid-cols-2 gap-2">
              {timeSlots.map((slot) => {
                const isChosen = trialTimeSlot === slot;
                return (
                  <button
                    type="button"
                    key={slot}
                    onClick={() => setTrialTimeSlot(slot)}
                    className={`py-2.5 px-3 rounded-lg border text-left font-bold transition-all ${
                      isChosen
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border hover:bg-muted/30 text-muted-foreground"
                    }`}
                  >
                    ⏰ {slot}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-border/50 pt-4 mt-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsTrialOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm">
              Confirm Free Booking
            </Button>
          </div>
        </form>
      </Dialog>
    </PageWrapper>
  );
}

export default TutorProfileClient;
