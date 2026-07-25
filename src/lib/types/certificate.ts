// src/lib/types/certificate.ts

export interface Certificate {
  id: string; // matches enrollment ID
  studentId: string;
  courseId: string;
  certificateNumber: string;
  issuedAt: string; // ISO date
  status: "Issued" | "Revoked";
  pdfUrl: string; // shareable verification link: /student/certificate/{id}
  verificationCode: string;
  studentName?: string;
  courseTitle?: string;
  instructor?: string;
}
