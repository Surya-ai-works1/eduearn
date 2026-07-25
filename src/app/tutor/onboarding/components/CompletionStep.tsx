"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { useOnboarding } from '@/context/OnboardingContext';
import { CheckCircle2, ShieldCheck, Mail, Calendar, ArrowRight, Sparkles } from 'lucide-react';

export default function CompletionStep() {
  const router = useRouter();
  const { resetOnboarding } = useOnboarding();

  const handleFinish = () => {
    // Reset onboarding state in context & localStorage
    resetOnboarding();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('tutor_onboarding_state');
    }
    // Redirect to Tutor Dashboard
    router.push('/tutor/dashboard');
  };

  return (
    <div className="max-w-[700px] mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-12 text-center space-y-8 shadow-xl">
      
      {/* Celebration Icon with animated glow */}
      <div className="relative w-22 h-22 mx-auto flex items-center justify-center bg-emerald-950/40 text-emerald-400 rounded-full shadow-[0_0_30px_rgba(16,185,129,0.15)] animate-bounce-subtle">
        <CheckCircle2 className="w-12 h-12" />
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
        </span>
      </div>

      <div className="space-y-3">
        <h2 className="text-3xl font-extrabold text-white flex items-center justify-center gap-2">
          Application Submitted!
          <Sparkles className="w-6 h-6 text-yellow-500 animate-pulse" />
        </h2>
        <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
          Thank you for applying to teach on EduEarn. Your tutor onboarding application is officially registered.
        </p>
      </div>

      {/* Review Details Panel */}
      <div className="p-6 border border-slate-800 rounded-2xl bg-slate-950/20 text-left space-y-5">
        <div className="flex items-start space-x-3.5">
          <div className="w-8 h-8 rounded-lg bg-blue-950/40 text-blue-400 flex items-center justify-center flex-shrink-0 mt-0.5">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-sm font-bold text-slate-200 block">AI & Manual Review Pending</span>
            <span className="text-xs text-slate-400 leading-relaxed block mt-1">
              Your profile documents, certificate attachments, and AI hardware doubt score evaluation are queued for manual verification. Approvals typically complete within 24 hours.
            </span>
          </div>
        </div>

        <div className="flex items-start space-x-3.5">
          <div className="w-8 h-8 rounded-lg bg-blue-950/40 text-blue-400 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <span className="text-sm font-bold text-slate-200 block">Email Notifications Sent</span>
            <span className="text-xs text-slate-400 leading-relaxed block mt-1">
              Check your inbox for status updates. We have sent a validation receipt tracking number to your registration email address.
            </span>
          </div>
        </div>

        <div className="flex items-start space-x-3.5">
          <div className="w-8 h-8 rounded-lg bg-blue-950/40 text-blue-400 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="text-sm font-bold text-slate-200 block">Setup Tutor Studio Workspace</span>
            <span className="text-xs text-slate-400 leading-relaxed block mt-1">
              You can now configure your tutor profile bio, add new courses, set up private booking slots, or plan lecture notes inside the dashboard.
            </span>
          </div>
        </div>
      </div>

      {/* Action triggers */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <button
          type="button"
          onClick={handleFinish}
          className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg hover:scale-[1.01] transition duration-200 flex items-center justify-center gap-2"
        >
          <span>Go to Tutor Dashboard</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
