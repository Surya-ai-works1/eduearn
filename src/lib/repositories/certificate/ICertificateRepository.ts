// src/lib/repositories/certificate/ICertificateRepository.ts

import { Certificate } from "../../types/certificate";

export interface ICertificateRepository {
  getCertificateByEnrollment(enrollmentId: string): Promise<Certificate | null>;
  getCertificatesByStudent(studentId: string): Promise<Certificate[]>;
  issueCertificate(enrollmentId: string, pdfUrl: string): Promise<Certificate>;
}
