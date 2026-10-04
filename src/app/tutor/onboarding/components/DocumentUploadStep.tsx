// src/app/tutor/onboarding/components/DocumentUploadStep.tsx

"use client";
import React, { useState, useEffect } from 'react';
import { useOnboarding } from '@/context/OnboardingContext';
import { createClient } from '@/lib/supabase';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface UploadedFiles {
  gov_id_url?: string;
  degree_url?: string;
  certificates_url?: string;
  resume_url?: string;
  video_demo_url?: string;
}

function generateUniqueFilePath(userId: string, docType: string, fileExt: string): string {
  const timestamp = Date.now();
  return `tutor-files/${userId}/${docType}_${timestamp}.${fileExt}`;
}

export default function DocumentUploadStep() {
  const { state, setState, goNext, goBack } = useOnboarding();
  const [isUploading, setIsUploading] = useState<Record<string, boolean>>({});
  const [urls, setUrls] = useState<UploadedFiles>({});
  const [userId, setUserId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchSession = async () => {
      const supabase = createClient();
      if (!supabase) return;
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
      }
    };
    fetchSession();

    // Map existing URLs from state if they exist
    setUrls({
      gov_id_url: state.verification?.documents?.[0] || "",
      degree_url: state.verification?.documents?.[1] || "",
      certificates_url: state.verification?.documents?.[2] || "",
      resume_url: state.verification?.documents?.[3] || "",
      video_demo_url: state.verification?.documents?.[4] || "",
    });
  }, [state]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, docType: keyof UploadedFiles, bucket: string = 'documents') => {
    const file = event.target.files?.[0];
    if (!file) return;

    // File validation
    const allowedImagePdf = ['pdf', 'png', 'jpg', 'jpeg'];
    const allowedVideo = ['mp4', 'mkv', 'mov', 'avi'];
    const fileExt = file.name.split('.').pop()?.toLowerCase() || '';

    if (docType === 'video_demo_url') {
      if (!allowedVideo.includes(fileExt)) {
        toast.error("Invalid file format. Please upload an MP4, MKV, MOV, or AVI video.");
        return;
      }
      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        toast.error("Video file is too large (max 50MB).");
        return;
      }
    } else {
      if (!allowedImagePdf.includes(fileExt)) {
        toast.error("Invalid file format. Please upload a PDF, PNG, or JPG/JPEG image.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error("File is too large (max 5MB).");
        return;
      }
    }

    if (!userId) {
      toast.error("Unable to resolve session. Please log in again.");
      return;
    }

    setIsUploading(prev => ({ ...prev, [docType]: true }));

    try {
      const supabase = createClient();
      if (!supabase) {
        throw new Error("Supabase is not configured. Cannot upload documents.");
      }

      // Sanitize extension and construct unique filepath
      const cleanExt = fileExt.toLowerCase().replace(/[^a-z0-9]/g, '') || 'bin';
      const targetBucket = bucket || 'tutor-documents';
      const filePath = generateUniqueFilePath(userId, docType, cleanExt);

      const { data, error } = await supabase.storage
        .from(targetBucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        // Fallback to 'documents' bucket if targetBucket fails
        const fallbackRes = await supabase.storage
          .from('documents')
          .upload(filePath, file, { cacheControl: '3600', upsert: true });

        if (fallbackRes.error) {
          throw new Error(error.message || fallbackRes.error.message || "Storage upload failed");
        }
      }

      const { data: { publicUrl } } = supabase.storage
        .from(targetBucket)
        .getPublicUrl(filePath);

      const finalUrl = publicUrl || `/storage/${targetBucket}/${filePath}`;

      setUrls(prev => {
        const next = { ...prev, [docType]: finalUrl };
        // Sync back to onboarding state context only on successful upload
        setState((s: any) => ({
          ...s,
          verification: {
            ...s.verification,
            documents: [
              next.gov_id_url || "",
              next.degree_url || "",
              next.certificates_url || "",
              next.resume_url || "",
              next.video_demo_url || "",
            ]
          }
        }));
        return next;
      });

      toast.success(`${file.name} uploaded successfully!`);
    } catch (err: any) {
      console.error("Upload error:", err);
      toast.error(`Upload failed: ${err.message || "Unknown error"}`);
    } finally {
      setIsUploading(prev => ({ ...prev, [docType]: false }));
    }
  };

  const handleNext = async () => {
    // Validate mandatory documents
    if (!urls.gov_id_url) {
      toast.error("Please upload a valid Government ID.");
      return;
    }
    if (!urls.degree_url) {
      toast.error("Please upload your Degree Certificate.");
      return;
    }
    if (!urls.resume_url) {
      toast.error("Please upload your Professional Resume.");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/tutor/submit-step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stepName: 'documents',
          data: urls
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save document uploads");
      }

      toast.success("Documents draft saved successfully!");
      goNext();
    } catch (err: any) {
      toast.error(err.message || "Failed to save draft.");
    } finally {
      setIsSaving(false);
    }
  };

  const docTypesList = [
    { key: 'gov_id_url' as keyof UploadedFiles, label: 'Government ID', description: 'Aadhaar, Passport, or Driving License (PDF/JPG)', required: true },
    { key: 'degree_url' as keyof UploadedFiles, label: 'Degree Certificate', description: 'Your highest degree qualification certificate (PDF/JPG)', required: true },
    { key: 'resume_url' as keyof UploadedFiles, label: 'Professional Resume', description: 'Updated CV listing details of experience (PDF/JPG)', required: true },
    { key: 'certificates_url' as keyof UploadedFiles, label: 'Additional Certifications', description: 'Other pedagogical/domain certificates (PDF/JPG)', required: false },
    { key: 'video_demo_url' as keyof UploadedFiles, label: 'Teaching Demo Video', description: 'Short 2-3 min video showing your teaching style (MP4 max 50MB)', required: false },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-6 rounded-2xl border border-border/40 bg-card shadow-xl">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-extrabold tracking-tight">Credentials & Document Uploads</h2>
        <p className="text-sm text-muted-foreground">Upload required credentials. Supported formats: PDF, PNG, JPEG. Teaching video supports MP4.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        {docTypesList.map((doc) => {
          const hasUploaded = !!urls[doc.key];
          const uploading = !!isUploading[doc.key];

          return (
            <div
              key={doc.key}
              className={`p-5 rounded-xl border-2 transition-all flex flex-col justify-between ${
                hasUploaded 
                  ? 'border-emerald-500/30 bg-emerald-500/5' 
                  : 'border-dashed border-border/80 hover:border-primary/50 bg-background/50'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm flex items-center gap-1.5">
                    {doc.label}
                    {doc.required && <span className="text-rose-500">*</span>}
                  </span>
                  {hasUploaded ? (
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-500/10 flex items-center gap-1">
                      <CheckCircle2 size={12} /> Uploaded
                    </span>
                  ) : (
                    <span className="text-[10px] text-muted-foreground font-bold uppercase">
                      Missing
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{doc.description}</p>
              </div>

              <div className="mt-4 pt-2">
                {uploading ? (
                  <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground justify-center h-10">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" /> Uploading file...
                  </div>
                ) : hasUploaded ? (
                  <div className="flex items-center gap-3">
                    <a
                      href={urls[doc.key]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-primary hover:underline flex items-center gap-1.5 flex-1"
                    >
                      <FileText size={14} /> View Document
                    </a>
                    <label className="text-[11px] font-bold text-muted-foreground hover:text-foreground cursor-pointer transition-colors px-3 py-1.5 rounded-lg border border-border hover:bg-muted">
                      Change File
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, doc.key)}
                      />
                    </label>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-2 border border-border hover:border-primary/40 hover:bg-primary/5 text-xs font-bold h-10 rounded-lg cursor-pointer transition-all w-full text-foreground">
                    <Upload size={14} /> Choose File
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, doc.key)}
                    />
                  </label>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between border-t border-border/40 pt-6 mt-8">
        <button
          onClick={goBack}
          className="px-6 py-2.5 rounded-xl border border-border text-sm font-bold hover:bg-muted transition-all"
        >
          Previous Step
        </button>
        <button
          onClick={handleNext}
          disabled={isSaving}
          className="px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-all flex items-center gap-1.5 disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Saving...
            </>
          ) : (
            "Next Step"
          )}
        </button>
      </div>
    </div>
  );
}
