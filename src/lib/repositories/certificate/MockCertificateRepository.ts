// src/lib/repositories/certificate/MockCertificateRepository.ts

import { ICertificateRepository } from "./ICertificateRepository";
import { Certificate } from "../../types/certificate";

const MOCK_COURSES: Record<string, { title: string; instructor: string }> = {
  "course-python": {
    title: "Python Programming Masterclass",
    instructor: "Vikram Rathore"
  },
  "course-keyboard": {
    title: "UI/UX Figma Design: Layouts & Grids Essentials",
    instructor: "Karan Malhotra"
  },
  "course-prompt": {
    title: "AI & Prompt Engineering Basics",
    instructor: "Rahul Sharma"
  }
};

export class MockCertificateRepository implements ICertificateRepository {
  private getLocalEnrollments(): any[] {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem("eduearn_enrollments");
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  }

  private saveLocalEnrollments(enrollments: any[]) {
    if (typeof window === "undefined") return;
    localStorage.setItem("eduearn_enrollments", JSON.stringify(enrollments));
  }

  async getCertificateByEnrollment(enrollmentId: string): Promise<Certificate | null> {
    const list = this.getLocalEnrollments();
    const enr = list.find((e) => e.id === enrollmentId);
    if (!enr || !enr.certificate_url) return null;

    const courseInfo = MOCK_COURSES[enr.courseId] || {
      title: enr.courseTitle || "Enrolled Course",
      instructor: enr.tutorName || "Tutor Instructor"
    };

    return {
      id: enr.id,
      studentId: enr.studentId || "student-1",
      courseId: enr.courseId,
      certificateNumber: `EE-CERT-${enr.id.substring(0, 8).toUpperCase()}`,
      issuedAt: enr.enrolledAt || new Date().toISOString(),
      status: "Issued",
      pdfUrl: enr.certificate_url,
      verificationCode: `EE-VERIFY-${enr.id.substring(0, 8).toUpperCase()}`,
      studentName: "Rahul Sharma",
      courseTitle: courseInfo.title,
      instructor: courseInfo.instructor,
    };
  }

  async getCertificatesByStudent(studentId: string): Promise<Certificate[]> {
    const list = this.getLocalEnrollments();
    const completedList = list.filter((e) => e.studentId === studentId && e.certificate_url);

    return completedList.map((enr) => {
      const courseInfo = MOCK_COURSES[enr.courseId] || {
        title: enr.courseTitle || "Enrolled Course",
        instructor: enr.tutorName || "Tutor Instructor"
      };

      return {
        id: enr.id,
        studentId: enr.studentId || studentId,
        courseId: enr.courseId,
        certificateNumber: `EE-CERT-${enr.id.substring(0, 8).toUpperCase()}`,
        issuedAt: enr.enrolledAt || new Date().toISOString(),
        status: "Issued",
        pdfUrl: enr.certificate_url,
        verificationCode: `EE-VERIFY-${enr.id.substring(0, 8).toUpperCase()}`,
        studentName: "Rahul Sharma",
        courseTitle: courseInfo.title,
        instructor: courseInfo.instructor,
      };
    });
  }

  async issueCertificate(enrollmentId: string, pdfUrl: string): Promise<Certificate> {
    const list = this.getLocalEnrollments();
    const existingIdx = list.findIndex((e) => e.id === enrollmentId);
    if (existingIdx < 0) throw new Error("Enrollment not found");

    list[existingIdx].certificate_url = pdfUrl;
    this.saveLocalEnrollments(list);

    const enr = list[existingIdx];
    const courseInfo = MOCK_COURSES[enr.courseId] || {
      title: enr.courseTitle || "Enrolled Course",
      instructor: enr.tutorName || "Tutor Instructor"
    };

    return {
      id: enr.id,
      studentId: enr.studentId || "student-1",
      courseId: enr.courseId,
      certificateNumber: `EE-CERT-${enr.id.substring(0, 8).toUpperCase()}`,
      issuedAt: new Date().toISOString(),
      status: "Issued",
      pdfUrl,
      verificationCode: `EE-VERIFY-${enr.id.substring(0, 8).toUpperCase()}`,
      studentName: "Rahul Sharma",
      courseTitle: courseInfo.title,
      instructor: courseInfo.instructor,
    };
  }
}
