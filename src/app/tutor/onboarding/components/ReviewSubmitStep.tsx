"use client";
import React, { useState } from 'react';
import { useOnboarding, OnboardingState } from '@/context/OnboardingContext';
import { 
  Edit2, ShieldAlert, CheckSquare, Loader2, Sparkles, 
  User, BookOpen, Sliders, CheckCircle2, ChevronRight 
} from 'lucide-react';
import { toast } from 'sonner';

export default function ReviewSubmitStep() {
  const { state, setState, goToStep, goBack } = useOnboarding();
  const { personalInfo, professionalDetails, teachingSetup, verification } = state;

  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) return;

    setIsSubmitting(true);
    // Simulate API call to save onboarding details to database
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    toast.success('Onboarding Application Submitted ✓');
    setState((prev: OnboardingState) => ({
      ...prev,
      currentStep: prev.currentStep + 1
    }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start max-w-[1200px] mx-auto">
      
      {/* REVIEW WORKSPACE */}
      <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.03)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] p-6 md:p-10 transition-all duration-300">
        
        {/* Step Header */}
        <div className="mb-8 border-b border-slate-100 dark:border-slate-800/50 pb-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <CheckCircle2 className="w-8 h-8 text-blue-600" />
            Review & Submit
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Please carefully verify your details prior to submitting your onboarding file. You can jump back to modify fields.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Section 1: Basic Profile */}
          <div className="p-6 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl bg-slate-50/20 dark:bg-slate-950/10 relative">
            <button
              type="button"
              onClick={() => goToStep(1)}
              className="absolute top-6 right-6 text-blue-600 dark:text-blue-450 hover:underline flex items-center space-x-1 text-xs font-bold uppercase tracking-wider"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Modify</span>
            </button>
            <h3 className="font-extrabold text-base text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" /> Basic Profile
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-450 block font-bold uppercase tracking-wider text-[10px]">Full Name</span>
                <span className="text-slate-850 dark:text-slate-205 font-semibold text-sm mt-0.5 block">{personalInfo.fullName || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-450 block font-bold uppercase tracking-wider text-[10px]">Display Name</span>
                <span className="text-slate-850 dark:text-slate-205 font-semibold text-sm mt-0.5 block">{personalInfo.displayName || personalInfo.fullName || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-450 block font-bold uppercase tracking-wider text-[10px]">Headline</span>
                <span className="text-slate-850 dark:text-slate-205 font-semibold text-sm mt-0.5 block">{personalInfo.headline || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-450 block font-bold uppercase tracking-wider text-[10px]">Phone</span>
                <span className="text-slate-850 dark:text-slate-205 font-semibold text-sm mt-0.5 block">
                  {personalInfo.phoneCountryCode} {personalInfo.phoneNumber || 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Professional Details */}
          <div className="p-6 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl bg-slate-50/20 dark:bg-slate-950/10 relative">
            <button
              type="button"
              onClick={() => goToStep(2)}
              className="absolute top-6 right-6 text-blue-600 dark:text-blue-450 hover:underline flex items-center space-x-1 text-xs font-bold uppercase tracking-wider"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Modify</span>
            </button>
            <h3 className="font-extrabold text-base text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" /> Professional Credentials
            </h3>
            <div className="space-y-4 text-xs">
              <div>
                <span className="text-slate-450 block font-bold uppercase tracking-wider text-[10px] mb-1.5">Categories</span>
                <div className="flex flex-wrap gap-1.5">
                  {professionalDetails.selectedCategories.length > 0 ? (
                    professionalDetails.selectedCategories.map(cat => (
                      <span key={cat} className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-650 dark:text-blue-400 font-bold rounded-lg text-xs">
                        {cat}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-500">None selected</span>
                  )}
                </div>
              </div>

              <div>
                <span className="text-slate-450 block font-bold uppercase tracking-wider text-[10px] mb-1.5">Skills</span>
                <div className="flex flex-wrap gap-1.5">
                  {professionalDetails.skillProficiencies.length > 0 ? (
                    professionalDetails.skillProficiencies.map(sk => (
                      <span key={sk.skill} className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-lg text-xs">
                        {sk.skill} • {sk.level}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-500">None added</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-450 block font-bold uppercase tracking-wider text-[10px]">Teaching Experience</span>
                  <span className="text-slate-850 dark:text-slate-205 font-semibold text-sm mt-0.5 block">{professionalDetails.teachingExpYears} Years</span>
                </div>
                <div>
                  <span className="text-slate-450 block font-bold uppercase tracking-wider text-[10px]">Spoken Languages</span>
                  <span className="text-slate-850 dark:text-slate-205 font-semibold text-sm mt-0.5 block">{professionalDetails.languages.join(', ')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Teaching Setup */}
          <div className="p-6 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl bg-slate-50/20 dark:bg-slate-950/10 relative">
            <button
              type="button"
              onClick={() => goToStep(3)}
              className="absolute top-6 right-6 text-blue-600 dark:text-blue-450 hover:underline flex items-center space-x-1 text-xs font-bold uppercase tracking-wider"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Modify</span>
            </button>
            <h3 className="font-extrabold text-base text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-blue-600" /> Teaching Setup & Pricing
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-450 block font-bold uppercase tracking-wider text-[10px]">Teaching Mode</span>
                <span className="text-slate-850 dark:text-slate-205 font-semibold text-sm mt-0.5 block">{teachingSetup.teachingMode}</span>
              </div>
              <div>
                <span className="text-slate-450 block font-bold uppercase tracking-wider text-[10px]">Hourly Rate</span>
                <span className="text-slate-850 dark:text-slate-250 font-semibold text-sm mt-0.5 block">${teachingSetup.hourlyRate} / hour</span>
              </div>
              <div>
                <span className="text-slate-450 block font-bold uppercase tracking-wider text-[10px]">Session Duration</span>
                <span className="text-slate-850 dark:text-slate-205 font-semibold text-sm mt-0.5 block">{teachingSetup.sessionDuration} Minutes</span>
              </div>
              <div>
                <span className="text-slate-450 block font-bold uppercase tracking-wider text-[10px]">Free Demo Class</span>
                <span className="text-slate-850 dark:text-slate-205 font-semibold text-sm mt-0.5 block">{teachingSetup.freeDemo ? 'Offered' : 'No'}</span>
              </div>
            </div>
          </div>

          {/* Section 4: Document Uploads & AI Assessment status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl bg-slate-50/20 dark:bg-slate-950/10 relative">
              <button
                type="button"
                onClick={() => goToStep(4)}
                className="absolute top-6 right-6 text-blue-600 dark:text-blue-450 hover:underline flex items-center space-x-1 text-xs font-bold uppercase tracking-wider"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Modify</span>
              </button>
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 mb-3">Verification</h3>
              <span className="text-[10px] font-bold px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-450 rounded-full border border-emerald-250/20">
                {verification.profileVerified ? 'Verified' : 'Ready'}
              </span>
            </div>

            <div className="p-6 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl bg-slate-50/20 dark:bg-slate-950/10 relative">
              <button
                type="button"
                onClick={() => goToStep(5)}
                className="absolute top-6 right-6 text-blue-600 dark:text-blue-450 hover:underline flex items-center space-x-1 text-xs font-bold uppercase tracking-wider"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Modify</span>
              </button>
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 mb-3">AI Assessment</h3>
              <span className="text-[10px] font-bold px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-450 rounded-full border border-emerald-250/20">
                Competency Checked
              </span>
            </div>
          </div>

          {/* Terms Agreement */}
          <div className="flex items-start space-x-3.5 p-5 border border-amber-200/60 dark:border-amber-900/30 bg-amber-50/30 dark:bg-amber-950/10 rounded-2xl">
            <input
              type="checkbox"
              id="terms"
              checked={agreed}
              onChange={e => setAgreed(e.target.checked)}
              className="mt-1 h-4.5 w-4.5 rounded border-slate-200 dark:border-slate-800 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="terms" className="text-xs text-slate-550 dark:text-slate-400 leading-normal select-none">
              By checking this box, I confirm that all information provided is accurate and authentic. 
              I agree to the EduEarn Tutor Policy, Code of Conduct, and Terms of Service.
            </label>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 border-t border-slate-100 dark:border-slate-800 pt-6">
            <button
              type="button"
              onClick={goBack}
              className="px-6 py-2.5 border border-slate-205 dark:border-slate-800 text-slate-650 dark:text-slate-350 font-bold rounded-xl transition hover:bg-slate-50"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={!agreed || isSubmitting}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-all duration-200"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Submit Tutor Application</span>
            </button>
          </div>
        </form>
      </div>

      {/* RIGHT SIDE: Helper Guidance Panel */}
      <div className="lg:sticky lg:top-24 space-y-6">
        <div className="bg-blue-50/50 dark:bg-blue-950/15 border border-blue-100/60 dark:border-blue-900/30 rounded-3xl p-6 space-y-4">
          <h4 className="font-bold text-sm text-blue-800 dark:text-blue-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Final Checklist
          </h4>
          <ul className="text-xs space-y-3 text-slate-600 dark:text-slate-400 leading-relaxed list-disc pl-4">
            <li>
              Once submitted, application processing takes approximately <strong>24-48 hours</strong>.
            </li>
            <li>
              Our support team will verify certificates and contact reference emails where needed.
            </li>
            <li>
              Profiles with completed social linkages (LinkedIn/GitHub) gain priority verification status.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
