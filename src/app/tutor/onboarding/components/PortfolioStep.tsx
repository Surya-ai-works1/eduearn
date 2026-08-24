"use client";
import React, { useState } from 'react';
import { useOnboarding, OnboardingState } from '@/context/OnboardingContext';
import { Globe, Upload, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

// Premium Drag and Drop Upload Component
function DragDropUploadZone({
  label,
  fileName,
  progress,
  onUpload,
  onRemove,
  acceptDocs = "PDF, Image"
}: {
  label: string;
  fileName: string | null;
  progress: number | undefined;
  onUpload: (name: string) => void;
  onRemove: () => void;
  acceptDocs?: string;
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      onUpload(files[0].name);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onUpload(files[0].name);
    }
  };

  return (
    <div className="space-y-1.5 w-full">
      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {label}
      </label>
      
      {fileName ? (
        <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950/40 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-emerald-500 font-bold text-sm">✓</span>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 max-w-[200px] truncate">{fileName}</span>
            {progress !== undefined && progress < 100 && (
              <span className="text-[10px] text-slate-500">({progress}%)</span>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="text-[10px] font-bold text-blue-500 hover:underline uppercase tracking-wider animate-fade-in"
            >
              Replace File
            </button>
            <button
              type="button"
              onClick={onRemove}
              className="text-[10px] font-bold text-red-500 hover:underline uppercase tracking-wider animate-fade-in"
            >
              Remove
            </button>
          </div>
          <input
            type="file"
            ref={inputRef}
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all duration-200 ${
            isDragOver 
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' 
              : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/10 hover:border-blue-500/50'
          }`}
        >
          <div className="flex flex-col items-center gap-1.5 text-slate-500">
            <Upload className="w-5 h-5 text-blue-600 dark:text-blue-500" />
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-350">
              Drag & Drop file or <span className="text-blue-600 dark:text-blue-500 hover:underline">browse</span>
            </span>
            <span className="text-[10px] text-slate-500">Supports: {acceptDocs}</span>
          </div>
          <input
            type="file"
            ref={inputRef}
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
}

export default function PortfolioStep() {
  const { state, setState, goBack } = useOnboarding();
  const { teachingSetup } = state;

  const [demoVideoLink, setDemoVideoLink] = useState(teachingSetup.profilePhilosophy.demoVideoLink || '');
  const [linkedin, setLinkedin] = useState(teachingSetup.profilePhilosophy.linkedin || '');
  const [portfolioWebsite, setPortfolioWebsite] = useState(teachingSetup.profilePhilosophy.portfolioWebsite || '');
  const [github, setGithub] = useState(teachingSetup.profilePhilosophy.github || '');
  const [instagram, setInstagram] = useState(teachingSetup.profilePhilosophy.instagram || '');

  const [portfolioPdfName, setPortfolioPdfName] = useState<string | null>(teachingSetup.profilePhilosophy.portfolioPdf || null);
  const [portfolioPdfProgress, setPortfolioPdfProgress] = useState<number | undefined>(undefined);

  const [resumeName, setResumeName] = useState<string | null>(teachingSetup.profilePhilosophy.resume || null);
  const [resumeProgress, setResumeProgress] = useState<number | undefined>(undefined);

  const [coverImageName, setCoverImageName] = useState<string | null>(teachingSetup.profilePhilosophy.coverImage || null);
  const [coverImageProgress, setCoverImageProgress] = useState<number | undefined>(undefined);

  React.useEffect(() => {
    setDemoVideoLink(teachingSetup.profilePhilosophy.demoVideoLink || '');
    setLinkedin(teachingSetup.profilePhilosophy.linkedin || '');
    setPortfolioWebsite(teachingSetup.profilePhilosophy.portfolioWebsite || '');
    setGithub(teachingSetup.profilePhilosophy.github || '');
    setInstagram(teachingSetup.profilePhilosophy.instagram || '');
    setPortfolioPdfName(teachingSetup.profilePhilosophy.portfolioPdf || null);
    setResumeName(teachingSetup.profilePhilosophy.resume || null);
    setCoverImageName(teachingSetup.profilePhilosophy.coverImage || null);
  }, [teachingSetup]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setState((prev: OnboardingState) => ({
      ...prev,
      teachingSetup: {
        ...prev.teachingSetup,
        profilePhilosophy: {
          ...prev.teachingSetup.profilePhilosophy,
          demoVideoLink,
          linkedin,
          portfolioWebsite,
          github,
          instagram,
          portfolioPdf: portfolioPdfName || undefined,
          resume: resumeName || undefined,
          coverImage: coverImageName || undefined
        }
      },
      currentStep: prev.currentStep + 1
    }));
    toast.success('Portfolio details saved ✓');
  };

  // Helper for YouTube ID extraction
  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const ytId = getYouTubeId(demoVideoLink);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start max-w-[1200px] mx-auto">
      {/* FORM CARD */}
      <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.03)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] p-6 md:p-10 transition-all duration-300">
        <div className="mb-8 border-b border-slate-100 dark:border-slate-800 pb-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Globe className="w-8 h-8 text-blue-600" />
            Portfolio Links & Media
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Add demo intro video, links to social/educational profiles, and resume documents.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Demo Video URL (YouTube)</label>
              <input
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={demoVideoLink}
                onChange={e => setDemoVideoLink(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">LinkedIn Profile URL</label>
              <input
                type="url"
                placeholder="https://linkedin.com/in/..."
                value={linkedin}
                onChange={e => setLinkedin(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Portfolio Website URL</label>
              <input
                type="url"
                placeholder="https://yourportfolio.com"
                value={portfolioWebsite}
                onChange={e => setPortfolioWebsite(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">GitHub Profile URL</label>
              <input
                type="url"
                placeholder="https://github.com/..."
                value={github}
                onChange={e => setGithub(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition text-sm"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Instagram Handle URL</label>
              <input
                type="url"
                placeholder="https://instagram.com/..."
                value={instagram}
                onChange={e => setInstagram(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition text-sm"
              />
            </div>
          </div>

          {/* YouTube Video Player Preview */}
          {ytId && (
            <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 aspect-video relative bg-slate-50 dark:bg-slate-950 shadow-inner">
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${ytId}`}
                title="Demo Video Preview"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

          {/* Upload items */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <DragDropUploadZone
              label="Portfolio PDF"
              fileName={portfolioPdfName}
              progress={portfolioPdfProgress}
              acceptDocs="PDF"
              onUpload={(name) => {
                setPortfolioPdfName(name);
                setPortfolioPdfProgress(0);
                let p = 0;
                const interval = setInterval(() => {
                  p += 25;
                  setPortfolioPdfProgress(p);
                  if (p >= 100) clearInterval(interval);
                }, 150);
              }}
              onRemove={() => {
                setPortfolioPdfName(null);
                setPortfolioPdfProgress(undefined);
              }}
            />

            <DragDropUploadZone
              label="Student Resume / CV"
              fileName={resumeName}
              progress={resumeProgress}
              acceptDocs="PDF, DOC"
              onUpload={(name) => {
                setResumeName(name);
                setResumeProgress(0);
                let p = 0;
                const interval = setInterval(() => {
                  p += 25;
                  setResumeProgress(p);
                  if (p >= 100) clearInterval(interval);
                }, 150);
              }}
              onRemove={() => {
                setResumeName(null);
                setResumeProgress(undefined);
              }}
            />

            <DragDropUploadZone
              label="Cover banner Image"
              fileName={coverImageName}
              progress={coverImageProgress}
              acceptDocs="JPEG, PNG"
              onUpload={(name) => {
                setCoverImageName(name);
                setCoverImageProgress(0);
                let p = 0;
                const interval = setInterval(() => {
                  p += 25;
                  setCoverImageProgress(p);
                  if (p >= 100) clearInterval(interval);
                }, 150);
              }}
              onRemove={() => {
                setCoverImageName(null);
                setCoverImageProgress(undefined);
              }}
            />
          </div>

          {/* Action buttons */}
          <div className="flex justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={goBack}
              className="px-6 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 font-bold rounded-xl transition"
            >
              Back
            </button>
            <button
              type="submit"
              className="px-8 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg transition"
            >
              Save & Proceed
            </button>
          </div>
        </form>
      </div>

      {/* RIGHT SIDEBAR */}
      <div className="lg:sticky lg:top-24 space-y-6">
        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100/80 dark:border-slate-800 rounded-3xl p-6 space-y-4">
          <h4 className="font-bold text-sm text-blue-700 dark:text-blue-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Media Guidance
          </h4>
          <ul className="text-xs space-y-3 text-slate-600 dark:text-slate-400 leading-relaxed list-disc pl-4">
            <li>
              A <strong>2-minute video introduction</strong> speaking on your course structure boosts registrations.
            </li>
            <li>
              Attach portfolio projects links to showcase practical work outputs.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
