"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { PageWrapper } from "../../../../components/layout/PageWrapper";
import { Container } from "../../../../components/layout/Container";
import { Card } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Badge } from "../../../../components/ui/badge";
import { toast } from "sonner";
import {
  BookOpen,
  Star,
  Users,
  Video,
  Clock,
  PlayCircle,
  CheckCircle,
  ChevronRight,
  Award,
  FileText,
  Calendar,
  MessageSquare,
  TrendingUp,
  Download,
  HelpCircle,
} from "lucide-react";
import { SCHOOL_SUBJECTS, SCHOOL_BOARDS, SCHOOL_CLASSES, MOCK_SCHEDULES } from "../../../../constants/schoolTuitionData";
import { MOCK_TUTORS } from "../../../../constants/mockData";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function SchoolSubjectPage({ params }: PageProps) {
  return (
    <Suspense fallback={
      <PageWrapper>
        <section className="w-full py-24 text-center">
          <Container>
            <div className="text-sm font-bold text-muted-foreground animate-pulse">Loading Subject Details...</div>
          </Container>
        </section>
      </PageWrapper>
    }>
      <SubjectContent params={params} />
    </Suspense>
  );
}

function SubjectContent({ params }: PageProps) {
  const searchParams = useSearchParams();
  const boardSlug = searchParams.get("board") || "cbse";
  const classSlug = searchParams.get("class") || "class-10";

  // Resolve the slug from params — we do it synchronously via use() in Next.js 15
  // Since this is a client component, we use a pattern of reading the slug from URL-level param
  // The slug is passed via the URL — we'll match it from SCHOOL_SUBJECTS
  const [resolvedSlug, setResolvedSlug] = React.useState<string | null>(null);

  React.useEffect(() => {
    params.then(p => setResolvedSlug(p.slug));
  }, [params]);

  const subject = SCHOOL_SUBJECTS.find(s => s.slug === resolvedSlug);
  const board = SCHOOL_BOARDS.find(b => b.slug === boardSlug);
  const cls = SCHOOL_CLASSES.find(c => c.slug === classSlug);

  if (!resolvedSlug) {
    return (
      <PageWrapper>
        <section className="w-full py-24 text-center">
          <Container>
            <div className="text-sm font-bold text-muted-foreground animate-pulse">Loading Subject Details...</div>
          </Container>
        </section>
      </PageWrapper>
    );
  }

  if (!subject) {
    return (
      <PageWrapper>
        <section className="w-full py-24 text-center">
          <Container className="flex flex-col items-center gap-4">
            <h2 className="text-xl font-heading font-extrabold">Subject Not Found</h2>
            <p className="text-xs text-muted-foreground">The subject you requested does not exist.</p>
            <Link href="/academies/school-tuition">
              <Button size="sm">Back to School Tuition</Button>
            </Link>
          </Container>
        </section>
      </PageWrapper>
    );
  }

  const subjectTrans = subject.translations["en"];

  // Mock course catalogue for the subject
  const mockCourses = [
    {
      id: `${subject.slug}-complete`,
      title: `${board?.name || "CBSE"} ${cls?.name || "Class 10"} ${subjectTrans.name} – Complete Course`,
      description: `Full syllabus coverage with live classes, recorded videos, notes, and assessments.`,
      type: "Live + Recorded",
      duration: "4 months",
      language: "English / Hindi",
      teacher: "Mr. Rajesh Kumar",
      price: 4999,
      discountedPrice: 2999,
      enrolledCount: 1240,
      rating: 4.8,
      certificate: true,
    },
    {
      id: `${subject.slug}-crash`,
      title: `${board?.name || "CBSE"} ${cls?.name || "Class 10"} ${subjectTrans.name} – Crash Course`,
      description: `Intensive 6-week revision covering all key chapters with practice tests.`,
      type: "Recorded",
      duration: "6 weeks",
      language: "English",
      teacher: "Ms. Priya Sharma",
      price: 1999,
      discountedPrice: 999,
      enrolledCount: 870,
      rating: 4.6,
      certificate: false,
    },
    {
      id: `${subject.slug}-revision`,
      title: `${board?.name || "CBSE"} ${cls?.name || "Class 10"} ${subjectTrans.name} – Revision Batch`,
      description: `Dedicated revision sessions focusing on previous year papers and model tests.`,
      type: "Live",
      duration: "8 weeks",
      language: "Hindi",
      teacher: "Mr. Sanjay Verma",
      price: 2999,
      discountedPrice: 1999,
      enrolledCount: 430,
      rating: 4.5,
      certificate: true,
    },
  ];

  // Mock batches
  const mockBatches = [
    { name: "Morning Batch", time: "6:00 AM – 7:30 AM", days: "Mon–Sat", seats: 24, filled: 18, teacher: "Mr. Rajesh Kumar", startDate: "Aug 05, 2026", mode: "Online", price: 2999 },
    { name: "Evening Batch", time: "6:00 PM – 7:30 PM", days: "Mon–Sat", seats: 30, filled: 12, teacher: "Ms. Priya Sharma", startDate: "Aug 07, 2026", mode: "Online", price: 2999 },
    { name: "Weekend Batch", time: "10:00 AM – 1:00 PM", days: "Sat & Sun", seats: 20, filled: 8, teacher: "Mr. Sanjay Verma", startDate: "Aug 09, 2026", mode: "Online", price: 1999 },
  ];

  // Mock syllabus chapters
  const mockChapters = [
    `Chapter 1: Introduction to ${subjectTrans.name}`,
    `Chapter 2: Core Concepts & Theorems`,
    `Chapter 3: Problem Solving Techniques`,
    `Chapter 4: Advanced Applications`,
    `Chapter 5: Previous Year Question Analysis`,
    `Chapter 6: Model Test Papers & Solutions`,
  ];

  // Subject tutors (reuse Marketplace tutors)
  const subjectTutors = MOCK_TUTORS.slice(0, 3);

  // FAQ
  const faqs = [
    { q: "Are the classes live or recorded?", a: "We offer both live interactive batches and self-paced recorded video courses." },
    { q: "Is a certificate provided?", a: "Yes, EduEarn completion certificates are issued for eligible courses." },
    { q: "Can I access classes on mobile?", a: "Yes, our platform is fully mobile-responsive and PWA-ready." },
    { q: "What is the refund policy?", a: "Full refund within 7 days of enrollment if no class has been attended." },
  ];

  return (
    <PageWrapper>
      {/* Hero */}
      <section className="py-12 bg-gradient-to-br from-primary/5 via-background to-background border-b border-border/40 text-left select-none">
        <Container className="space-y-4">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1 text-[10px] text-muted-foreground font-semibold flex-wrap">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight size={10} />
            <Link href="/academies" className="hover:text-primary transition-colors">Academies</Link>
            <ChevronRight size={10} />
            <Link href="/academies/school-tuition" className="hover:text-primary transition-colors">School Tuition</Link>
            <ChevronRight size={10} />
            <span className="text-foreground font-bold">{subjectTrans.name}</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" className="text-[9px]">{board?.name || "CBSE"}</Badge>
                <Badge variant="secondary" className="text-[9px]">{cls?.name || "Class 10"}</Badge>
                <Badge variant="secondary" className="text-[9px]">School Tuition</Badge>
              </div>
              <h1 className="text-2xl md:text-3xl font-heading font-extrabold text-foreground">
                {subjectTrans.name} – {board?.name} {cls?.name}
              </h1>
              <p className="text-sm text-muted-foreground leading-relaxed">{subjectTrans.description}</p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground font-semibold">
                <span className="flex items-center gap-1"><Star size={12} className="fill-amber-500 text-amber-500" /> 4.7 Rating</span>
                <span className="flex items-center gap-1"><Users size={12} /> 2,500+ Students</span>
                <span className="flex items-center gap-1"><BookOpen size={12} /> {mockCourses.length} Courses</span>
                <span className="flex items-center gap-1"><Award size={12} /> Certificate Available</span>
              </div>
            </div>

            <Card className="p-5 border-primary/20 bg-card shadow-premium min-w-[220px] shrink-0 space-y-3">
              <div className="text-center">
                <div className="text-[10px] uppercase font-bold text-muted-foreground">Starting From</div>
                <div className="text-2xl font-extrabold text-primary mt-1">₹999</div>
                <div className="text-[10px] text-muted-foreground">per month</div>
              </div>
              <Button className="w-full" size="sm" onClick={() => toast.success("Redirecting to enrollment checkout...")}>
                Enroll Now
              </Button>
              <button
                onClick={() => toast.info("Free trial demo class booked! You will receive a confirmation shortly.")}
                className="w-full text-[10px] text-primary font-bold hover:underline text-center block"
              >
                Book Free Trial Class →
              </button>
            </Card>
          </div>
        </Container>
      </section>

      {/* Courses */}
      <section className="py-12 text-left select-none">
        <Container className="space-y-6">
          <h2 className="text-base font-heading font-extrabold text-foreground flex items-center gap-2">
            <BookOpen size={16} className="text-primary" /> Available Courses
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {mockCourses.map((course) => (
              <Card key={course.id} className="p-5 border-border bg-card hover:shadow-lg transition-all flex flex-col gap-3 text-left">
                <div className="flex justify-between items-start">
                  <Badge variant="secondary" className="text-[8px]">{course.type}</Badge>
                  {course.certificate && <Badge variant="secondary" className="text-[8px] bg-emerald-500/10 text-emerald-600">Certificate</Badge>}
                </div>
                <h3 className="text-[11px] font-extrabold text-foreground leading-snug">{course.title}</h3>
                <p className="text-[10px] text-muted-foreground leading-relaxed">{course.description}</p>

                <div className="grid grid-cols-2 gap-2 text-[9px] text-muted-foreground font-semibold">
                  <span className="flex items-center gap-1"><Clock size={9} /> {course.duration}</span>
                  <span className="flex items-center gap-1"><Users size={9} /> {course.enrolledCount} enrolled</span>
                  <span className="flex items-center gap-1"><MessageSquare size={9} /> {course.language}</span>
                  <span className="flex items-center gap-1"><Star size={9} className="fill-amber-500 text-amber-500" /> {course.rating}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-extrabold text-foreground">₹{course.discountedPrice.toLocaleString()}</span>
                  <span className="text-[10px] line-through text-muted-foreground">₹{course.price.toLocaleString()}</span>
                  <Badge variant="secondary" className="text-[8px] bg-rose-500/10 text-rose-600 ml-auto">
                    {Math.round((1 - course.discountedPrice / course.price) * 100)}% OFF
                  </Badge>
                </div>

                <div className="text-[10px] text-muted-foreground">by <span className="font-bold text-foreground">{course.teacher}</span></div>

                <Button
                  size="sm"
                  className="w-full mt-auto"
                  onClick={() => toast.success(`Enrolled in "${course.title}"! Check your student dashboard.`)}
                >
                  Enroll in Course
                </Button>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Live Batches */}
      <section className="py-12 bg-muted/10 border-y border-border/30 text-left select-none">
        <Container className="space-y-6">
          <h2 className="text-base font-heading font-extrabold text-foreground flex items-center gap-2">
            <Video size={16} className="text-primary" /> Live Batches
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {mockBatches.map((batch, idx) => {
              const availableSeats = batch.seats - batch.filled;
              const isEnrolled = idx === 0; // mock: first batch appears as enrolled
              return (
                <Card key={idx} className="p-5 border-border bg-card hover:shadow-md transition-all flex flex-col gap-3 text-left">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-extrabold text-foreground">{batch.name}</h3>
                    <Badge variant="secondary" className="text-[8px]">{batch.mode}</Badge>
                  </div>

                  <div className="space-y-1.5 text-[10px] text-muted-foreground font-semibold">
                    <div className="flex items-center gap-1.5"><Clock size={10} /> {batch.time} • {batch.days}</div>
                    <div className="flex items-center gap-1.5"><Calendar size={10} /> Starts {batch.startDate}</div>
                    <div className="flex items-center gap-1.5"><Users size={10} /> {batch.teacher}</div>
                    <div className="flex items-center gap-1.5">
                      <div className="flex-1 bg-muted h-1.5 rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${(batch.filled / batch.seats) * 100}%` }} />
                      </div>
                      <span className="text-[9px]">{availableSeats} seats left</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm font-extrabold text-foreground">₹{batch.price.toLocaleString()}<span className="text-[9px] font-normal text-muted-foreground">/mo</span></span>
                    {isEnrolled ? (
                      <Button size="sm" variant="secondary" onClick={() => toast.info("Joining live class room...")}>
                        Join Class
                      </Button>
                    ) : (
                      <Button size="sm" onClick={() => toast.success(`Enrolled in ${batch.name}! Batch starts ${batch.startDate}.`)}>
                        Enroll Batch
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Syllabus */}
      <section className="py-12 text-left select-none">
        <Container className="space-y-6">
          <h2 className="text-base font-heading font-extrabold text-foreground flex items-center gap-2">
            <FileText size={16} className="text-primary" /> Syllabus & Chapters
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {mockChapters.map((chapter, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 border border-border/50 rounded-xl bg-card hover:border-primary/30 transition-colors">
                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-[10px] font-extrabold flex items-center justify-center shrink-0">
                  {idx + 1}
                </div>
                <span className="text-xs font-semibold text-foreground">{chapter}</span>
                <PlayCircle size={12} className="text-muted-foreground ml-auto shrink-0" />
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Tutors */}
      <section className="py-12 bg-muted/10 border-y border-border/30 text-left select-none">
        <Container className="space-y-6">
          <h2 className="text-base font-heading font-extrabold text-foreground flex items-center gap-2">
            <Users size={16} className="text-primary" /> Expert Tutors
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {subjectTutors.map((tutor) => (
              <Card key={tutor.id} className="p-5 border-border bg-card hover:shadow-md transition-all flex flex-col gap-3 text-left">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-extrabold text-sm shrink-0">
                    {tutor.fullName.charAt(0)}
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-foreground">{tutor.fullName}</div>
                    <div className="text-[9px] text-muted-foreground font-semibold">{tutor.expertise?.join(", ") || subjectTrans.name}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-[9px] text-muted-foreground font-semibold">
                  <span className="flex items-center gap-1"><Star size={9} className="fill-amber-500 text-amber-500" /> {tutor.rating?.toFixed(1)}</span>
                  <span className="flex items-center gap-1"><Users size={9} /> {tutor.totalStudents} students</span>
                  <span className="flex items-center gap-1"><MessageSquare size={9} /> {tutor.languages}</span>
                </div>
                <div className="flex gap-2 mt-auto">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-[9px] h-7"
                    onClick={() => toast.info(`Demo class request sent to ${tutor.fullName}!`)}
                  >
                    Book Demo
                  </Button>
                  <Link href={`/tutors/${tutor.id}`} className="flex-1">
                    <Button size="sm" variant="primary" className="w-full text-[9px] h-7">
                      View Profile
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Student Reviews */}
      <section className="py-12 text-left select-none">
        <Container className="space-y-6">
          <h2 className="text-base font-heading font-extrabold text-foreground flex items-center gap-2">
            <Star size={16} className="text-primary" /> Student Reviews
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: "Arjun S.", review: "Amazing structured content! The live doubt sessions helped me clear all my concepts before exams.", rating: 5 },
              { name: "Divya R.", review: "The Morning Batch teacher explains everything so clearly. Highly recommended for Class 10 students.", rating: 5 },
              { name: "Kiran M.", review: "Downloaded notes are very useful for revision. The practice tests are exactly like the board pattern.", rating: 4 },
              { name: "Neha P.", review: "Good curriculum coverage. Would be better with more mock test series.", rating: 4 },
            ].map((r, idx) => (
              <Card key={idx} className="p-4 border-border bg-card flex flex-col gap-2 text-left">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-[10px]">{r.name[0]}</div>
                    <span className="text-[10px] font-bold text-foreground">{r.name}</span>
                  </div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={10} className={i < r.rating ? "fill-amber-500 text-amber-500" : "text-muted"} />
                    ))}
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed">{r.review}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <section className="py-12 bg-muted/10 border-t border-border/30 text-left select-none">
        <Container className="space-y-6">
          <h2 className="text-base font-heading font-extrabold text-foreground flex items-center gap-2">
            <HelpCircle size={16} className="text-primary" /> Frequently Asked Questions
          </h2>
          <div className="space-y-3 max-w-2xl">
            {faqs.map((faq, idx) => (
              <div key={idx} className="p-4 border border-border/50 rounded-xl bg-card space-y-1.5">
                <div className="text-xs font-extrabold text-foreground flex items-center gap-2">
                  <span className="text-primary">Q{idx + 1}.</span> {faq.q}
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed pl-5">{faq.a}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Sticky CTA Bar */}
      <section className="py-8 border-t border-border/40 bg-background select-none">
        <Container className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="text-sm font-extrabold text-foreground">{subjectTrans.name} – {board?.name} {cls?.name}</div>
            <div className="text-[11px] text-muted-foreground">Enroll today and start your first live class within 24 hours.</div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => toast.info("Free trial demo class booked!")}
              className="text-xs font-bold text-primary hover:underline"
            >
              Free Trial
            </button>
            <Button onClick={() => toast.success("Redirecting to checkout...")}>
              Enroll Now – From ₹999/mo
            </Button>
          </div>
        </Container>
      </section>
    </PageWrapper>
  );
}
