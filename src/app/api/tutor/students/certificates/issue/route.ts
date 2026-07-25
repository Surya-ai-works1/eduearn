// src/app/api/tutor/students/certificates/issue/route.ts

import { NextResponse } from "next/server";
import { createClient } from "../../../../../../lib/supabase/server";
import { CertificateRepository } from "../../../../../../lib/repositories/certificate";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    // Role Verification (RBAC)
    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileErr || !profile || profile.role !== "tutor") {
      return NextResponse.json(
        { error: "Forbidden: Only tutors can issue certificates" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { enrollmentId } = body;

    if (!enrollmentId) {
      return NextResponse.json({ error: "Enrollment ID is required." }, { status: 400 });
    }

    const shareableUrl = `/student/certificate/${enrollmentId}`;

    // Update enrollment status and generate certificate url
    const certificate = await CertificateRepository.issueCertificate(enrollmentId, shareableUrl);

    // Optionally: trigger notifications or email asynchronously here
    try {
      const { data: enr } = await supabase
        .from("enrollments")
        .select("*, courses(title), profiles:learner_id(full_name, email)")
        .eq("id", enrollmentId)
        .maybeSingle();

      if (enr) {
        const studentProfile = enr.profiles as any;
        const courseTitle = (enr.courses as any)?.title || "Course Module";
        if (studentProfile?.email) {
          const { emailClient } = await import("../../../../../../lib/email/client");
          const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://eduearn.org";
          const absoluteUrl = `${baseUrl}${shareableUrl}`;
          await emailClient.triggerCertificateEmail(
            studentProfile.email,
            studentProfile.full_name || "Student",
            courseTitle,
            absoluteUrl
          );
        }
      }
    } catch (emailErr) {
      console.warn("Async certificate email failed:", emailErr);
    }

    return NextResponse.json({ success: true, certificate });
  } catch (err: any) {
    console.error("Failed to issue certificate by tutor:", err);
    return NextResponse.json(
      { error: err.message || "Failed to generate certificate." },
      { status: 500 }
    );
  }
}
