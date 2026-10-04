import React from "react";
import { MOCK_COURSES, MOCK_TUTORS, MOCK_REVIEWS } from "../../../constants/mockData";
import { TutorProfileClient } from "../../../components/layout/marketplace/TutorProfileClient";
import { PageWrapper } from "../../../components/layout/PageWrapper";
import { Container } from "../../../components/layout/Container";
import { Button } from "../../../components/ui/button";
import Link from "next/link";
import { createClient } from "../../../lib/supabase/server";
import { lmsDb } from "../../../lib/lmsDb";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TutorProfilePage({ params }: PageProps) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  let tutor: any = MOCK_TUTORS.find((t) => t.id === id);
  let tutorCourses: any[] = [];
  let tutorReviews: any[] = [];

  if (tutor) {
    tutorCourses = MOCK_COURSES.filter((c) => c.tutorId === tutor.id && (c.status === "published" || !c.status));
    const courseIds = tutorCourses.map((c) => c.id);
    tutorReviews = MOCK_REVIEWS.filter((r) => courseIds.includes(r.courseId));
  } else {
    try {
      const supabase = await createClient();
      if (supabase) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        if (profile) {
          tutor = {
            id: profile.id,
            name: profile.full_name || profile.display_name || "EduEarn Tutor",
            avatar: profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(profile.full_name || "Tutor")}`,
            bio: profile.bio || "EduEarn Verified Student Tutor",
            rating: 4.9,
            reviewsCount: 15,
            studentsCount: 120,
            coursesCount: 3,
            verificationStatus: "verified",
            category: "Academic & Tech",
            hourlyRate: "₹500/hr",
            location: profile.country || "India",
            skills: profile.skills || ["Programming", "Mathematics"],
          };

          try {
            const dbCourses = await lmsDb.getCourses(profile.id);
            const publishedCourses = dbCourses.filter(
              (c: any) => c.status === "published" && (c.approval_status === "approved" || !c.approval_status)
            );
            tutorCourses = publishedCourses.map((c: any) => ({
              id: c.id,
              title: c.title,
              tutorId: c.tutor_id,
              tutorName: tutor.name,
              tutorAvatar: tutor.avatar,
              category: c.category,
              price: Number(c.price),
              rating: 4.8,
              duration: "10 hours",
              lessonsCount: c.lessons?.length || 0,
              studentsCount: 45,
              isAiVerified: true,
              imageSrc: c.thumbnail || null,
            }));
          } catch (e) {
            tutorCourses = [];
          }
        }
      }
    } catch (err) {
      console.warn("Failed fetching tutor profile from database:", err);
    }
  }

  if (!tutor) {
    return (
      <PageWrapper>
        <section className="w-full py-24 select-none text-center">
          <Container className="flex flex-col items-center gap-4">
            <h2 className="text-xl font-heading font-extrabold text-foreground">Tutor Not Found</h2>
            <p className="text-xs text-muted-foreground max-w-sm leading-relaxed text-center">
              {"We couldn't locate the student tutor you requested. They might have updated their profile settings."}
            </p>
            <Link href="/tutors">
              <Button size="sm" className="mt-2">
                Back to Tutors Directory
              </Button>
            </Link>
          </Container>
        </section>
      </PageWrapper>
    );
  }

  return (
    <TutorProfileClient
      tutor={tutor}
      tutorCourses={tutorCourses}
      tutorReviews={tutorReviews}
    />
  );
}

export async function generateStaticParams() {
  return MOCK_TUTORS.map((tutor) => ({
    id: tutor.id,
  }));
}
