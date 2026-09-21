import React from "react";
import { MOCK_COURSES, MOCK_TUTORS, MOCK_REVIEWS } from "../../../constants/mockData";
import { CourseDetailsClient } from "../../../components/layout/marketplace/CourseDetailsClient";
import { PageWrapper } from "../../../components/layout/PageWrapper";
import { Container } from "../../../components/layout/Container";
import { Button } from "../../../components/ui/button";
import Link from "next/link";
import { lmsDb } from "../../../lib/lmsDb";
import { createClient } from "../../../lib/supabase/server";
import { enrollmentService } from "../../../lib/services/enrollmentService";
import { getCourseThumbnail } from "../../../lib/courseThumbnailRegistry";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CourseDetailsPage({ params }: PageProps) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  let course: any = null;
  let tutor: any = null;
  let relatedCourses: any[] = [];
  let courseReviews: any[] = [];
  let isEnrolled = false;

  try {
    const dbCourse = await lmsDb.getCourseById(id);
    if (dbCourse) {
      const supabase = await createClient();
      let isTutorVerified = false;
      let tutorName = "Tutor Assignment Pending";
      let tutorBio = "This course is currently awaiting assignment to a verified EduEarn student tutor.";
      let tutorAvatar = "";

      if (supabase && dbCourse.tutor_id) {
        try {
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", dbCourse.tutor_id)
            .maybeSingle();
          if (profile && profile.role === "tutor") {
            tutorName = profile.full_name || profile.display_name || "EduEarn Tutor";
            tutorBio = profile.bio || "EduEarn Verified Tutor.";
            tutorAvatar = profile.avatar_url || "";
            isTutorVerified = true;
          }
        } catch (err) {}
      }

      // Map dbCourse to mock shape for UI components
      course = {
        id: dbCourse.id,
        title: dbCourse.title,
        price: Number(dbCourse.price),
        tutorId: isTutorVerified ? dbCourse.tutor_id : null,
        tutorName,
        tutorAvatar,
        rating: isTutorVerified ? 4.8 : 0,
        studentsCount: isTutorVerified ? 150 : 0,
        lessonsCount: dbCourse.lessons?.length || 0,
        level: dbCourse.level,
        category: dbCourse.category,
        categoryId: dbCourse.category.toLowerCase().replace(/\s+/g, "-"),
        subjectId: dbCourse.category.toLowerCase().replace(/\s+/g, "-"),
        duration: (dbCourse as any).duration || "10 hours",
        language: "English",
        createdAt: dbCourse.created_at,
        description: dbCourse.description || dbCourse.subtitle || "",
        image: getCourseThumbnail(dbCourse),
        imageSrc: getCourseThumbnail(dbCourse),
      };

      tutor = {
        id: isTutorVerified ? dbCourse.tutor_id : null,
        name: tutorName,
        avatar: tutorAvatar,
        rating: isTutorVerified ? 4.8 : 0,
        reviewsCount: isTutorVerified ? 42 : 0,
        studentsCount: isTutorVerified ? 150 : 0,
        coursesCount: isTutorVerified ? 3 : 0,
        bio: tutorBio,
        verificationStatus: isTutorVerified ? "verified" : "pending",
        isPending: !isTutorVerified,
      };

      // Fetch dynamic reviews
      if (supabase) {
        try {
          const { data: dbReviews } = await supabase
            .from("reviews")
            .select("*, profiles(*)")
            .eq("course_id", dbCourse.id);
          if (dbReviews && dbReviews.length > 0) {
            courseReviews = dbReviews.map((r: any) => ({
              id: r.id,
              courseId: r.course_id,
              studentName: r.profiles?.full_name || r.profiles?.display_name || "Student Learner",
              studentAvatar: r.profiles?.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=student",
              rating: r.rating,
              comment: r.comment || "",
              createdAt: r.created_at,
            }));
          }
        } catch (err) {}
      }

      // Fetch dynamic related courses
      try {
        const all = await lmsDb.getAllPublishedCourses();
        const related = all.filter((c: any) => c.category === dbCourse.category && c.id !== dbCourse.id);
        const mappedRelated = [];
        for (const rc of related) {
          let rcTutorName = "Tutor Instructor";
          let rcTutorAvatar = "https://api.dicebear.com/7.x/avataaars/svg?seed=Tutor%20Instructor";
          if (supabase) {
            try {
              const { data: rcProfile } = await supabase
                .from("profiles")
                .select("full_name, display_name, avatar_url")
                .eq("id", rc.tutor_id)
                .maybeSingle();
              if (rcProfile) {
                rcTutorName = rcProfile.full_name || rcProfile.display_name || "Tutor Instructor";
                rcTutorAvatar = rcProfile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(rcTutorName)}`;
              }
            } catch (err) {}
          }
          
          mappedRelated.push({
            id: rc.id,
            title: rc.title,
            tutorId: rc.tutor_id,
            tutorName: rcTutorName,
            tutorAvatar: rcTutorAvatar,
            category: rc.category,
            price: Number(rc.price),
            rating: 4.8,
            duration: (rc as any).duration || "10 hours",
            lessonsCount: rc.lessons?.length || 0,
            studentsCount: 150,
            isAiVerified: true,
            imageSrc: rc.thumbnail || null,
          });
        }
        relatedCourses = mappedRelated;
      } catch (err) {}

      // Check enrollment status
      if (supabase) {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const enrollResult = await enrollmentService.getEnrollment(user.id, id);
            isEnrolled = !!enrollResult;
          }
        } catch (err) {}
      }
    }
  } catch (err) {
    console.warn("Supabase course details load failed, falling back to mock courses:", err);
  }

  // Fallback to mock data if not found in database
  if (!course) {
    course = MOCK_COURSES.find((c) => c.id === id);
    if (course) {
      tutor = MOCK_TUTORS.find((t) => t.id === course.tutorId) || MOCK_TUTORS[0];
      relatedCourses = MOCK_COURSES.filter(
        (c) => c.categoryId === course.categoryId && c.id !== course.id
      ).slice(0, 3);
      courseReviews = MOCK_REVIEWS.filter((r) => r.courseId === course.id);

      // Check enrollment status for mock course
      try {
        const supabase = await createClient();
        if (supabase) {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const enrollResult = await enrollmentService.getEnrollment(user.id, id);
            isEnrolled = !!enrollResult;
          }
        }
      } catch (err) {}
    }
  }

  if (!course) {
    return (
      <PageWrapper>
        <section className="w-full py-24 select-none text-center">
          <Container className="flex flex-col items-center gap-4">
            <h2 className="text-xl font-heading font-extrabold text-foreground">Course Not Found</h2>
            <p className="text-xs text-muted-foreground max-w-sm leading-relaxed text-center">
              {"We couldn't locate the course you requested. It might have been retired or updated."}
            </p>
            <Link href="/courses">
              <Button size="sm" className="mt-2">
                Back to Marketplace
              </Button>
            </Link>
          </Container>
        </section>
      </PageWrapper>
    );
  }

  return (
    <CourseDetailsClient
      course={course}
      tutor={tutor}
      relatedCourses={relatedCourses}
      courseReviews={courseReviews}
      isEnrolled={isEnrolled}
    />
  );
}

export async function generateStaticParams() {
  return MOCK_COURSES.map((course) => ({
    id: course.id,
  }));
}

