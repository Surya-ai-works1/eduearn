// src/app/tutor/application-status/page.tsx

"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { 
  Loader2, CheckCircle2, Clock, XCircle, AlertCircle, 
  Brain, FileText, RefreshCw, LogOut, ArrowRight, ShieldCheck 
} from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

const STATUS_STEPS = [
  { name: 'Pending', label: 'Application Started', description: 'Personal details and credentials draft saved.' },
  { name: 'Documents Submitted', label: 'Documents Uploaded', description: 'Aadhaar, Degree and Resume successfully saved.' },
  { name: 'AI Test Scheduled', label: 'AI Test Scheduled', description: 'Your Socratic teaching test is ready.' },
  { name: 'AI Test Completed', label: 'AI Test Completed', description: 'Gemini evaluated your pedagogical subject score.' },
  { name: 'Under Review', label: 'Under Review', description: 'Platform administration reviewing credentials.' },
  { name: 'Approved', label: 'Approved', description: 'Promoted to Tutor role! Dashboard unlocked.' },
];

export default function ApplicationStatusPage() {
  const router = useRouter();
  const { logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [appDetails, setAppDetails] = useState<any>(null);
  const [resetting, setResetting] = useState(false);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tutor/application-status');
      if (!res.ok) throw new Error("Failed to load application status");
      const data = await res.json();
      setAppDetails(data);

      // Auto redirect if approved
      if (data.status === 'Approved') {
        toast.success("Welcome back! Your application is Approved.");
        setTimeout(() => {
          router.replace('/tutor/dashboard');
        }, 3000);
      }
    } catch (err: any) {
      toast.error(err.message || "Error checking application status");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleReapply = async () => {
    if (!window.confirm("Are you sure you want to reset your application? This will permanently delete your previous credentials and AI scores so you can start a fresh submission.")) {
      return;
    }

    setResetting(true);
    try {
      const res = await fetch('/api/tutor/application-status', {
        method: 'DELETE'
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to reset application");
      }

      toast.success("Application reset successfully. Starting new onboarding wizard...");
      setTimeout(() => {
        window.location.href = '/tutor/onboarding';
      }, 1000);
    } catch (err: any) {
      toast.error(err.message || "Failed to reset application");
      setResetting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-sm font-semibold text-muted-foreground">Checking application status...</p>
      </div>
    );
  }

  const currentStatus = appDetails?.status || 'Pending';
  const isRejected = currentStatus === 'Rejected';
  
  // Find index of current status in steps timeline
  const activeIndex = STATUS_STEPS.findIndex(step => step.name === currentStatus);

  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-border/40 pb-6 gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight">Onboarding Desk</h1>
            <p className="text-sm text-muted-foreground">
              Candidate: <strong className="text-foreground">{appDetails?.tutor_name || 'Tutor Candidate'}</strong>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchStatus()}
              className="p-2.5 rounded-xl border border-border hover:bg-muted transition-all"
              title="Refresh Status"
            >
              <RefreshCw size={16} />
            </button>
            <button
              onClick={async () => {
                await logout();
                window.location.href = '/';
              }}
              className="px-4 py-2 rounded-xl border border-border hover:bg-muted text-sm font-bold flex items-center gap-2 transition-all"
            >
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </div>

        {/* Status Callout Box */}
        {currentStatus === 'Approved' ? (
          <div className="p-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 flex flex-col md:flex-row items-center md:justify-between gap-6">
            <div className="flex items-start gap-4">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 shrink-0 mt-1" />
              <div className="space-y-1">
                <h3 className="font-extrabold text-lg text-emerald-600 dark:text-emerald-400">Application Approved!</h3>
                <p className="text-sm text-slate-500">Congratulations! Your credentials have been approved. You are being redirected to your Tutor Dashboard...</p>
              </div>
            </div>
            <a
              href="/tutor/dashboard"
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center gap-1.5 transition-all shrink-0"
            >
              Enter Dashboard <ArrowRight size={16} />
            </a>
          </div>
        ) : isRejected ? (
          <div className="p-6 rounded-2xl border border-rose-500/30 bg-rose-500/5 space-y-4">
            <div className="flex items-start gap-4">
              <XCircle className="w-10 h-10 text-rose-500 shrink-0 mt-1" />
              <div className="space-y-1">
                <h3 className="font-extrabold text-lg text-rose-600 dark:text-rose-400">Application Rejected</h3>
                <p className="text-sm text-slate-500">Our onboarding team reviewed your credentials and decided not to proceed at this time.</p>
              </div>
            </div>

            {/* Rejection Details & Feedback */}
            {appDetails?.rejection_reason && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs font-semibold text-rose-700 dark:text-rose-350 space-y-1">
                <span className="uppercase text-[9px] font-bold tracking-wider block text-rose-500">Official Feedback</span>
                <p>&quot;{appDetails.rejection_reason}&quot;</p>
              </div>
            )}

            {/* AI assessment feedback report */}
            {appDetails?.ai_evaluation && Object.keys(appDetails.ai_evaluation).length > 0 && (
              <div className="p-5 rounded-xl bg-background border border-border/40 space-y-4">
                <h4 className="font-extrabold text-xs text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <Brain size={14} /> Gemini AI Evaluation Report
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-semibold">
                  <div>
                    <span className="text-muted-foreground text-[10px] block">Overall Score</span>
                    <strong className="text-foreground text-sm">{appDetails.ai_evaluation.overall_score || 0}%</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[10px] block">Subject Knowledge</span>
                    <strong className="text-foreground text-sm">{appDetails.ai_evaluation.knowledge_score || 0}%</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[10px] block">Communication</span>
                    <strong className="text-foreground text-sm">{appDetails.ai_evaluation.communication_score || 0}%</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[10px] block">Teaching Style</span>
                    <strong className="text-foreground text-sm">{appDetails.ai_evaluation.teaching_style || "N/A"}</strong>
                  </div>
                </div>

                {appDetails.ai_evaluation.improvement_plan && (
                  <div className="pt-2 text-xs text-muted-foreground leading-relaxed">
                    <strong className="text-foreground block mb-0.5">Improvement Plan:</strong>
                    {appDetails.ai_evaluation.improvement_plan}
                  </div>
                )}
              </div>
            )}

            {/* Reapply Button */}
            <div className="flex justify-end pt-2">
              <button
                onClick={handleReapply}
                disabled={resetting}
                className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm flex items-center gap-2 transition-all disabled:opacity-50"
              >
                {resetting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Resetting application...
                  </>
                ) : (
                  <>
                    <RefreshCw size={14} /> Clear Application & Re-apply
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-2xl border border-blue-500/30 bg-blue-500/5 flex items-start gap-4">
            <Clock className="w-10 h-10 text-blue-500 shrink-0 mt-1 animate-pulse" />
            <div className="space-y-1">
              <h3 className="font-extrabold text-lg text-blue-600 dark:text-blue-400">Application Under Review</h3>
              <p className="text-sm text-slate-500">Your application details and Socratic AI assessment scores are currently being verified by platform administrators. We will update you here within 24–48 hours.</p>
            </div>
          </div>
        )}

        {/* Timeline Progress */}
        {!isRejected && (
          <div className="bg-card border border-border/40 p-8 rounded-3xl shadow-lg space-y-6">
            <h3 className="font-extrabold text-lg tracking-tight">Onboarding Timeline</h3>
            <div className="relative border-l border-border/60 pl-6 ml-3 space-y-8 pt-2">
              {STATUS_STEPS.map((step, idx) => {
                const isDone = activeIndex >= idx;
                const isCurrent = currentStatus === step.name;
                
                return (
                  <div key={step.name} className="relative">
                    {/* Node Circle */}
                    <div className={`absolute -left-10 top-0.5 w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                      isCurrent 
                        ? 'border-blue-500 bg-blue-500/10 text-blue-500 ring-4 ring-blue-500/10 scale-110 z-10' 
                        : isDone 
                        ? 'border-emerald-500 bg-emerald-500 text-white' 
                        : 'border-border bg-background text-muted-foreground'
                    }`}>
                      {isDone && !isCurrent ? (
                        <CheckCircle2 size={12} className="text-white fill-emerald-500" />
                      ) : (
                        <span className="text-[10px] font-extrabold">{idx + 1}</span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <h4 className={`font-bold text-sm leading-none ${isCurrent ? 'text-blue-500' : 'text-foreground'}`}>
                        {step.label}
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
