"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { useOnboarding } from '@/context/OnboardingContext';
import { createClient } from '@/lib/supabase';
import { CheckCircle2, ShieldCheck, ArrowRight, Sparkles, Clock, Check } from 'lucide-react';

export default function CompletionStep() {
  const router = useRouter();
  const { resetOnboarding } = useOnboarding();
  const [isNavigating, setIsNavigating] = React.useState(false);

  const handleFinish = async () => {
    setIsNavigating(true);
    try {
      // Ensure the session reflects complete=true before navigating.
      // This prevents RequireTutor from bouncing the user back to onboarding.
      const supabase = createClient();
      await supabase.auth.refreshSession();
    } catch {
      // Non-fatal — proceed anyway
    }
    // Clear onboarding state from context and localStorage
    resetOnboarding();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('tutor_onboarding_state');
      sessionStorage.setItem("onboardingJustCompleted", "true");
    }
    router.push('/welcome');
  };

  return (
    <div className="max-w-[700px] mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 md:p-12 text-center space-y-8 shadow-xl transition-all duration-300">
      
      {/* Celebration Icon with animated glow */}
      <div className="relative w-24 h-24 mx-auto flex items-center justify-center bg-emerald-500/10 text-emerald-500 rounded-full shadow-[0_0_30px_rgba(16,185,129,0.15)] animate-bounce-subtle">
        <CheckCircle2 className="w-12 h-12" />
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
        </span>
      </div>

      <div className="space-y-3">
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center justify-center gap-2">
          Application Submitted
          <Sparkles className="w-6 h-6 text-yellow-500 animate-pulse" />
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
          Your onboarding application has been successfully registered. Here is your current profile evaluation status:
        </p>
      </div>

      {/* Application Checklist State */}
      <div className="p-6 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-950/20 text-left space-y-4">
        <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-xl">
          <div className="flex items-center space-x-3">
            <span className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-xs font-bold">
              <Check className="w-3.5 h-3.5" />
            </span>
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">Application Submitted</span>
          </div>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1 rounded-lg">Done</span>
        </div>

        <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-xl">
          <div className="flex items-center space-x-3">
            <span className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-xs font-bold">
              <Check className="w-3.5 h-3.5" />
            </span>
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">AI Evaluation Completed</span>
          </div>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1 rounded-lg">Passed</span>
        </div>

        <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-xl">
          <div className="flex items-center space-x-3">
            <span className="w-6 h-6 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center text-xs font-bold animate-pulse">
              <Clock className="w-3.5 h-3.5" />
            </span>
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">Student ID Under Review</span>
          </div>
          <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-2.5 py-1 rounded-lg">Pending Verification</span>
        </div>

        <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-xl">
          <div className="flex items-center space-x-3">
            <span className="w-6 h-6 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center text-xs font-bold">
              <Clock className="w-3.5 h-3.5" />
            </span>
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">Estimated Approval: 24–48 Hours</span>
          </div>
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 px-2.5 py-1 rounded-lg">24-48 Hours</span>
        </div>
      </div>

      <div className="p-6 border border-slate-200 dark:border-slate-800 rounded-2xl bg-blue-50/20 dark:bg-blue-950/10 text-left space-y-4">
        <h4 className="font-bold text-sm text-blue-800 dark:text-blue-400 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-blue-600" />
          Track Application Status
        </h4>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          You can track your verification status in real-time from your dashboard. Once approved, you can immediately begin creating course cards and answering peer doubts.
        </p>
      </div>

      {/* Action triggers */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <button
          type="button"
          onClick={handleFinish}
          disabled={isNavigating}
          className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg hover:scale-[1.01] disabled:opacity-70 disabled:cursor-not-allowed transition duration-200 flex items-center justify-center gap-2"
        >
          <span>Go to Tutor Dashboard</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
