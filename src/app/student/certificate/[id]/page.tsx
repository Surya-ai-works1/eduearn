// src/app/student/certificate/[id]/page.tsx

import React from "react";
import { redirect } from "next/navigation";
import { certificateService } from "../../../../lib/services/certificateService";
import CertificatePreviewClient from "./CertificatePreviewClient";

export default async function CertificatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const enrollmentId = resolvedParams.id;

  if (!enrollmentId) {
    redirect("/student/dashboard");
  }

  // Load certificate details directly from the service layer (Server Component convention)
  const certificate = await certificateService.verifyCertificate(enrollmentId);

  return (
    <div className="min-h-screen bg-muted/20 dark:bg-zinc-950 flex flex-col items-center justify-center p-4">
      {certificate ? (
        <CertificatePreviewClient certificate={certificate} />
      ) : (
        <div className="max-w-md w-full p-6 bg-white dark:bg-zinc-900 border border-rose-500/20 rounded-card shadow-soft text-center space-y-4">
          <div className="text-rose-500 font-extrabold text-3xl">⚠️ Invalid Credential</div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            The certificate verification code or link is invalid. This credential could not be verified by the EduEarn board.
          </p>
          <a
            href="/student/dashboard"
            className="inline-block px-4 py-2 bg-primary text-white text-xs font-bold rounded hover:bg-primary/95 transition-all"
          >
            Go to Student Dashboard
          </a>
        </div>
      )}
    </div>
  );
}
