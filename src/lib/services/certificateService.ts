// src/lib/services/certificateService.ts

import { CertificateRepository } from "../repositories/certificate";
import { Certificate } from "../types/certificate";
import { createClient } from "../supabase";
import { assignmentService } from "./assignmentService";
import { quizService } from "./quizService";

export class CertificateService {
  async getStudentCertificates(studentId: string): Promise<Certificate[]> {
    return CertificateRepository.getCertificatesByStudent(studentId);
  }

  async verifyCertificate(enrollmentId: string): Promise<Certificate | null> {
    return CertificateRepository.getCertificateByEnrollment(enrollmentId);
  }

  async checkEligibility(
    studentId: string,
    courseId: string
  ): Promise<{ eligible: boolean; reason?: string; enrollmentId?: string }> {
    const supabase = createClient();

    // 1. Fetch enrollment
    const { data: enrollment, error } = await supabase
      .from("enrollments")
      .select("*")
      .eq("learner_id", studentId)
      .eq("course_id", courseId)
      .maybeSingle();

    if (error || !enrollment) {
      return { eligible: false, reason: "You are not enrolled in this course." };
    }

    const progressPercent = Number(enrollment.progress || 0);
    if (progressPercent < 100) {
      return {
        eligible: false,
        reason: `Course progress is only ${progressPercent}%. It must be 100% to qualify for a certificate.`,
        enrollmentId: enrollment.id
      };
    }

    // 2. Fetch quizzes and check pass attempts
    const quizzes = await quizService.getStudentQuizzes(studentId);
    const courseQuizzes = quizzes.filter((q) => q.courseId === courseId);
    const hasUnpassedQuiz = courseQuizzes.some((q) => !q.latestAttempt || !q.latestAttempt.passed);

    if (hasUnpassedQuiz) {
      return {
        eligible: false,
        reason: "You must attempt and pass all quizzes in this course before generating a certificate.",
        enrollmentId: enrollment.id
      };
    }

    // 3. Fetch assignments and check submissions
    const assignments = await assignmentService.getStudentAssignments(studentId);
    const courseAssignments = assignments.filter((a) => a.courseId === courseId);
    const hasUnsubmittedAsg = courseAssignments.some((a) => !a.submission || a.submission.status === "Pending");

    if (hasUnsubmittedAsg) {
      return {
        eligible: false,
        reason: "You must complete and submit all course assignments before generating a certificate.",
        enrollmentId: enrollment.id
      };
    }

    return { eligible: true, enrollmentId: enrollment.id };
  }

  async issueCertificate(studentId: string, courseId: string): Promise<Certificate> {
    const eligibility = await this.checkEligibility(studentId, courseId);
    if (!eligibility.eligible || !eligibility.enrollmentId) {
      throw new Error(eligibility.reason || "Not eligible for certificate.");
    }

    const enrollmentId = eligibility.enrollmentId;
    const shareableUrl = `/student/certificate/${enrollmentId}`;

    const certificate = await CertificateRepository.issueCertificate(enrollmentId, shareableUrl);

    // Trigger certificate email asynchronously
    (async () => {
      try {
        const supabase = createClient();
        const { data: profile } = await supabase
          .from("profiles")
          .select("email, full_name")
          .eq("id", studentId)
          .maybeSingle();

        if (profile?.email) {
          const { emailClient } = await import("../email/client");
          // Generate absolute URL for shareable link
          const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://eduearn.org";
          const absoluteUrl = `${baseUrl}${shareableUrl}`;

          await emailClient.triggerCertificateEmail(
            profile.email,
            profile.full_name || "Student",
            certificate.courseTitle || "Completed Course",
            absoluteUrl
          );
        }
      } catch (err) {
        console.warn("Failed to send certificate notification email:", err);
      }
    })();

    return certificate;
  }
}

export const certificateService = new CertificateService();
