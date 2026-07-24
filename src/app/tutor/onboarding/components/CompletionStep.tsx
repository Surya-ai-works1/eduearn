"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { useOnboarding } from '@/context/OnboardingContext';
import { CheckCircle2, ShieldCheck, Mail, Calendar, ArrowRight } from 'lucide-react';

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
    <div className="max-w-2xl mx-auto p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg text-center space-y-6">
      
      {/* Celebration Icon */}
      <div className="relative w-20 h-20 mx-auto flex items-center justify-center bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-450 rounded-full animate-bounce">
        <CheckCircle2 className="w-12 h-12" />
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-450 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
        </span>
      </div>

      <div className="space-y-2">
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">Application Submitted!</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Thank you for applying to be a tutor on EduEarn. Your application is currently under review.
        </p>
      </div>

      {/* Review Details Panel */}
      <div className="p-6 border dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/30 text-left space-y-4">
        <div className="flex items-start space-x-3">
          <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-450 mt-0.5 flex-shrink-0" />
          <div>
            <span className="text-sm font-bold text-gray-800 dark:text-gray-250 block">Under Review</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Our administrator team will review your uploaded documents and AI Interview scores. 
              This typically takes 24-48 hours.
            </span>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <Mail className="w-5 h-5 text-blue-600 dark:text-blue-450 mt-0.5 flex-shrink-0" />
          <div>
            <span className="text-sm font-bold text-gray-800 dark:text-gray-250 block">Email Notification</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              You will receive an email once your profile has been approved or if we require additional information.
            </span>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-450 mt-0.5 flex-shrink-0" />
          <div>
            <span className="text-sm font-bold text-gray-800 dark:text-gray-250 block">Preparatory Next Steps</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              In the meantime, you can explore your Tutor Dashboard to draft course syllabus materials and plan live sessions.
            </span>
          </div>
        </div>
      </div>

      {/* Action button */}
      <div className="pt-4">
        <button
          onClick={handleFinish}
          className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-md shadow-md flex items-center justify-center space-x-2 transition"
        >
          <span>Go to Tutor Dashboard</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
