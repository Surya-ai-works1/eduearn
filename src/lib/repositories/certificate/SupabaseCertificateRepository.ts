// src/lib/repositories/certificate/SupabaseCertificateRepository.ts

import { ICertificateRepository } from "./ICertificateRepository";
import { Certificate } from "../../types/certificate";
import { createClient } from "../../supabase";

export class SupabaseCertificateRepository implements ICertificateRepository {
  private async mapEnrollmentToCertificate(enr: any): Promise<Certificate> {
    const supabase = createClient();
    
    // Resolve student full name
    const studentName = enr.profiles?.full_name || "Student Learner";

    // Resolve tutor name
    let tutorName = "Tutor Instructor";
    if (enr.courses?.tutor_id) {
      const { data: tutorProfile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", enr.courses.tutor_id)
        .maybeSingle();
      if (tutorProfile?.full_name) {
        tutorName = tutorProfile.full_name;
      }
    }

    return {
      id: enr.id,
      studentId: enr.learner_id,
      courseId: enr.course_id,
      certificateNumber: `EE-CERT-${enr.id.substring(0, 8).toUpperCase()}`,
      issuedAt: enr.created_at || new Date().toISOString(),
      status: "Issued",
      pdfUrl: enr.certificate_url || "",
      verificationCode: `EE-VERIFY-${enr.id.substring(0, 8).toUpperCase()}`,
      studentName,
      courseTitle: enr.courses?.title || "Enrolled Course",
      instructor: tutorName,
    };
  }

  async getCertificateByEnrollment(enrollmentId: string): Promise<Certificate | null> {
    const supabase = createClient();
    const { data: enr, error } = await supabase
      .from("enrollments")
      .select(`
        *,
        courses (
          title,
          tutor_id
        ),
        profiles:learner_id (
          full_name
        )
      `)
      .eq("id", enrollmentId)
      .maybeSingle();

    if (error || !enr || !enr.certificate_url) return null;

    return this.mapEnrollmentToCertificate(enr);
  }

  async getCertificatesByStudent(studentId: string): Promise<Certificate[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("enrollments")
      .select(`
        *,
        courses (
          title,
          tutor_id
        ),
        profiles:learner_id (
          full_name
        )
      `)
      .eq("learner_id", studentId)
      .not("certificate_url", "is", null);

    if (error || !data) return [];

    const certs = await Promise.all(
      data.map((enr: any) => this.mapEnrollmentToCertificate(enr))
    );
    return certs;
  }

  async issueCertificate(enrollmentId: string, pdfUrl: string): Promise<Certificate> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("enrollments")
      .update({ certificate_url: pdfUrl })
      .eq("id", enrollmentId)
      .select(`
        *,
        courses (
          title,
          tutor_id
        ),
        profiles:learner_id (
          full_name
        )
      `)
      .single();

    if (error) throw error;

    return this.mapEnrollmentToCertificate(data);
  }
}
