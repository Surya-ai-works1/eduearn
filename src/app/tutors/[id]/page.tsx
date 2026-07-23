import React from "react";
import { MOCK_COURSES, MOCK_TUTORS, MOCK_REVIEWS } from "../../../constants/mockData";
import { TutorProfileClient } from "../../../components/layout/marketplace/TutorProfileClient";
import { PageWrapper } from "../../../components/layout/PageWrapper";
import { Container } from "../../../components/layout/Container";
import { Button } from "../../../components/ui/button";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TutorProfilePage({ params }: PageProps) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  const tutor = MOCK_TUTORS.find((t) => t.id === id);

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

  // 1. Sourced Courses Published by this Tutor
  const tutorCourses = MOCK_COURSES.filter((c) => c.tutorId === tutor.id);

  // 2. Sourced Reviews for this Tutor's courses
  const courseIds = tutorCourses.map((c) => c.id);
  const tutorReviews = MOCK_REVIEWS.filter((r) => courseIds.includes(r.courseId));

  return (
    <TutorProfileClient
      tutor={tutor}
      tutorCourses={tutorCourses}
      tutorReviews={tutorReviews}
    />
  );
}

// Generate static params for Next.js static HTML pre-compiles
export async function generateStaticParams() {
  return MOCK_TUTORS.map((tutor) => ({
    id: tutor.id,
  }));
}
