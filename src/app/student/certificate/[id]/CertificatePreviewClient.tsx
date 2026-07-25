// src/app/student/certificate/[id]/CertificatePreviewClient.tsx

"use client";

import React, { useState } from "react";
import { Certificate } from "../../../../lib/types/certificate";
import { toast } from "sonner";

interface Props {
  certificate: Certificate;
}

export default function CertificatePreviewClient({ certificate }: Props) {
  const [copied, setCopied] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      const url = window.location.href;
      navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Shareable certificate link copied!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formattedDate = certificate.issuedAt
    ? new Date(certificate.issuedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : new Date().toLocaleDateString();

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-4xl">
      {/* Action Toolbar (Hidden during print) */}
      <div className="flex gap-3 print:hidden w-full justify-between items-center bg-white dark:bg-zinc-900 p-4 border border-border/40 rounded-card shadow-soft">
        <div className="flex flex-col items-start select-none">
          <span className="text-[9px] font-black text-emerald-600 uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded">
            ✓ Verified Credential
          </span>
          <span className="text-[10px] text-muted-foreground mt-0.5">
            Issued on {formattedDate}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCopyLink}
            className="px-4 py-2 border border-border bg-card hover:bg-muted/40 text-xs font-bold rounded cursor-pointer transition-all"
          >
            {copied ? "Copied!" : "Share Link"}
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-primary text-white text-xs font-bold rounded hover:bg-primary/95 cursor-pointer transition-all shadow-soft"
          >
            Print / Save as PDF
          </button>
        </div>
      </div>

      {/* Certificate Container */}
      <div
        id="certificate-container"
        className="w-full aspect-[1.414/1] bg-white dark:bg-zinc-950 p-8 sm:p-12 border-8 border-double border-amber-500/50 rounded-card shadow-floating flex flex-col justify-between items-center text-center relative overflow-hidden select-none"
      >
        {/* Decorative corner accents */}
        <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-amber-500/30"></div>
        <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-amber-500/30"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-amber-500/30"></div>
        <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-amber-500/30"></div>

        {/* Top Section */}
        <div className="space-y-2 mt-4">
          <div className="text-[10px] font-black tracking-widest text-primary uppercase">
            EduEarn Online Academy
          </div>
          <h2 className="text-xl sm:text-3xl font-heading font-black text-amber-600 dark:text-amber-500 tracking-wider">
            CERTIFICATE OF COMPLETION
          </h2>
          <div className="h-0.5 w-24 bg-amber-500/30 mx-auto mt-2"></div>
        </div>

        {/* Body Section */}
        <div className="my-6 space-y-4">
          <p className="text-[11px] italic text-muted-foreground">
            This is proudly presented to
          </p>
          <h1 className="text-2xl sm:text-4xl font-heading font-black text-foreground border-b border-border/60 pb-2 max-w-lg mx-auto leading-tight">
            {certificate.studentName}
          </h1>
          <p className="text-[11px] text-muted-foreground max-w-md mx-auto leading-relaxed">
            for successfully satisfying all course prerequisites, completing the
            graded modules, and demonstrating proficiency in
          </p>
          <h3 className="text-sm sm:text-lg font-bold text-foreground bg-primary/5 px-4 py-1.5 rounded-full inline-block border border-primary/10">
            {certificate.courseTitle}
          </h3>
          <p className="text-[11px] text-muted-foreground">
            under instruction of <span className="font-bold text-foreground">{certificate.instructor}</span>
          </p>
        </div>

        {/* Footer Info Section */}
        <div className="w-full flex justify-between items-end border-t border-border/40 pt-6 mt-4 text-left text-[9px] text-muted-foreground select-none">
          <div className="space-y-1">
            <div>
              Date Issued:{" "}
              <span className="font-bold text-foreground">{formattedDate}</span>
            </div>
            <div>
              Verification Code:{" "}
              <span className="font-bold text-foreground">
                {certificate.verificationCode}
              </span>
            </div>
          </div>
          
          {/* Decorative Seal / Medal */}
          <div className="flex flex-col items-center gap-1 select-none">
            <div className="w-12 h-12 rounded-full border-4 border-amber-500/40 bg-amber-500/10 flex items-center justify-center relative">
              <span className="text-[8px] font-black text-amber-600">SEAL</span>
              {/* ribbon tails */}
              <div className="absolute -bottom-2 -left-1 w-2 h-6 bg-amber-500/30 transform rotate-12"></div>
              <div className="absolute -bottom-2 -right-1 w-2 h-6 bg-amber-500/30 transform -rotate-12"></div>
            </div>
          </div>

          <div className="text-right space-y-1">
            <div>
              Credential Number:{" "}
              <span className="font-bold text-foreground">
                {certificate.certificateNumber}
              </span>
            </div>
            <div>
              Board Director:{" "}
              <span className="font-bold text-foreground">EduEarn Board</span>
            </div>
          </div>
        </div>
      </div>

      {/* Embedded Print Styling */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #certificate-container,
          #certificate-container * {
            visibility: visible;
          }
          #certificate-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: none !important;
            box-shadow: none !important;
            padding: 2cm !important;
          }
        }
      `}</style>
    </div>
  );
}
