"use client";
import React, { useState } from 'react';
import { useOnboarding, OnboardingState } from '@/context/OnboardingContext';
import { 
  Edit2, Loader2, Sparkles, User, BookOpen, Sliders, 
  CheckCircle2, GraduationCap, Link, 
  Brain, FileText, Check
} from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase';

export default function ReviewSubmitStep() {
  const { state, setState, goToStep, goBack } = useOnboarding();
  const { personalInfo, professionalDetails, teachingSetup, verification, aiInterview } = state;

  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) return;

    setIsSubmitting(true);
    try {
      const supabase = createClient();
      if (!supabase) {
        if (process.env.NEXT_PUBLIC_DEV_MODE === "true") {
          toast.success('Onboarding Application Submitted ✓ (Mock Mode)');
          localStorage.removeItem('tutor_onboarding_state');
          window.location.href = '/tutor/application-status';
          return;
        }
        throw new Error("Supabase is not configured. Cannot submit onboarding application.");
      }
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // 1. Update Auth user metadata — mark onboarding complete
        const { error: authErr } = await supabase.auth.updateUser({
          data: { complete: true }
        });
        if (authErr) throw authErr;

        // 2. Submit application via backend API
        const res = await fetch('/api/tutor/submit-application', {
          method: 'POST'
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to submit application");
        }

        // 3. Clear local onboarding state
        localStorage.removeItem('tutor_onboarding_state');

        // 4. Refresh session
        await supabase.auth.refreshSession();

        toast.success('Onboarding Application Submitted ✓');
        
        // 5. Redirect to status page
        window.location.href = '/tutor/application-status';
      }
    } catch (err: any) {
      console.error("Error submitting onboarding details:", err);
      toast.error(err.message || 'Submission failed. Please check your connection and try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start max-w-[1200px] mx-auto">
      
      {/* REVIEW WORKSPACE */}
      <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-10 transition-all duration-300">
        
        {/* Step Header */}
        <div className="mb-8 border-b border-slate-100 dark:border-slate-800 pb-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <CheckCircle2 className="w-8 h-8 text-blue-600" />
            Review & Submit
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Please carefully verify your details prior to submitting your onboarding application. You can click Modify on any section to go back and edit fields.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Section 1: Basic Profile */}
          <div className="p-6 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-950/10 relative">
            <button
              type="button"
              onClick={() => goToStep(1)}
              className="absolute top-6 right-6 text-blue-600 dark:text-blue-500 hover:underline flex items-center space-x-1 text-xs font-bold uppercase tracking-wider transition"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Modify</span>
            </button>
            <h3 className="font-extrabold text-base text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600 dark:text-blue-500" /> Student Profile
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 dark:text-slate-500 block font-bold uppercase tracking-wider text-[10px]">Full Name</span>
                <span className="text-slate-800 dark:text-slate-200 font-semibold text-sm mt-0.5 block">{personalInfo.fullName || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 dark:text-slate-500 block font-bold uppercase tracking-wider text-[10px]">Display Name</span>
                <span className="text-slate-800 dark:text-slate-200 font-semibold text-sm mt-0.5 block">{personalInfo.displayName || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 dark:text-slate-500 block font-bold uppercase tracking-wider text-[10px]">Date of Birth</span>
                <span className="text-slate-800 dark:text-slate-200 font-semibold text-sm mt-0.5 block">{personalInfo.dob || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 dark:text-slate-500 block font-bold uppercase tracking-wider text-[10px]">Gender</span>
                <span className="text-slate-800 dark:text-slate-200 font-semibold text-sm mt-0.5 block">{personalInfo.gender || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 dark:text-slate-500 block font-bold uppercase tracking-wider text-[10px]">Phone</span>
                <span className="text-slate-800 dark:text-slate-200 font-semibold text-sm mt-0.5 block">
                  {personalInfo.phoneCountryCode} {personalInfo.phoneNumber || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 dark:text-slate-500 block font-bold uppercase tracking-wider text-[10px]">Location</span>
                <span className="text-slate-800 dark:text-slate-200 font-semibold text-sm mt-0.5 block">
                  {personalInfo.city}, {personalInfo.state}, {personalInfo.country}
                </span>
              </div>
              <div className="md:col-span-2">
                <span className="text-slate-400 dark:text-slate-500 block font-bold uppercase tracking-wider text-[10px]">Headline</span>
                <span className="text-slate-800 dark:text-slate-200 font-semibold text-sm mt-0.5 block">{personalInfo.headline || 'N/A'}</span>
              </div>
              <div className="md:col-span-2">
                <span className="text-slate-400 dark:text-slate-500 block font-bold uppercase tracking-wider text-[10px]">Bio / Teaching Style Description</span>
                <span className="text-slate-700 dark:text-slate-300 font-normal text-xs mt-1 block leading-relaxed whitespace-pre-wrap">{personalInfo.bio || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Education & Student ID */}
          <div className="p-6 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-950/10 relative">
            <button
              type="button"
              onClick={() => goToStep(2)}
              className="absolute top-6 right-6 text-blue-600 dark:text-blue-500 hover:underline flex items-center space-x-1 text-xs font-bold uppercase tracking-wider transition"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Modify</span>
            </button>
            <h3 className="font-extrabold text-base text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-blue-600 dark:text-blue-500" /> Academic & Student Verification
            </h3>
            <div className="space-y-4 text-xs">
              {professionalDetails.educationList.length > 0 ? (
                <div className="space-y-4">
                  {professionalDetails.educationList.map((edu, idx) => (
                    <div key={edu.id || idx} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/50">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <span className="text-slate-400 dark:text-slate-500 block font-bold uppercase tracking-wider text-[9px]">Course / Degree</span>
                          <span className="text-slate-800 dark:text-slate-200 font-semibold text-xs mt-0.5 block">{edu.degree || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 dark:text-slate-500 block font-bold uppercase tracking-wider text-[9px]">School / College</span>
                          <span className="text-slate-800 dark:text-slate-200 font-semibold text-xs mt-0.5 block">{edu.college || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 dark:text-slate-500 block font-bold uppercase tracking-wider text-[9px]">Passing Year</span>
                          <span className="text-slate-800 dark:text-slate-200 font-semibold text-xs mt-0.5 block">{edu.passingYear || 'N/A'}</span>
                        </div>
                      </div>
                      {edu.certificateName && (
                        <div className="mt-3 flex items-center space-x-2 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                          <Check className="w-3.5 h-3.5" />
                          <span>Student ID Uploaded: {edu.certificateName}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 dark:text-slate-400 italic">No academic verification records added.</p>
              )}
            </div>
          </div>

          {/* Section 3: Tutoring Setup & Categories */}
          <div className="p-6 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-950/10 relative">
            <button
              type="button"
              onClick={() => goToStep(4)}
              className="absolute top-6 right-6 text-blue-600 dark:text-blue-500 hover:underline flex items-center space-x-1 text-xs font-bold uppercase tracking-wider transition"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Modify</span>
            </button>
            <h3 className="font-extrabold text-base text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-500" /> Tutoring Subjects & Experience
            </h3>
            <div className="space-y-4 text-xs">
              <div>
                <span className="text-slate-400 dark:text-slate-500 block font-bold uppercase tracking-wider text-[10px] mb-1.5">Selected Subjects</span>
                <div className="flex flex-wrap gap-1.5">
                  {professionalDetails.selectedCategories.length > 0 ? (
                    professionalDetails.selectedCategories.map(cat => (
                      <span key={cat} className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 font-bold rounded-lg text-xs border border-blue-100 dark:border-blue-900/30">
                        {cat}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-500 dark:text-slate-400 italic">None selected</span>
                  )}
                </div>
              </div>

              <div>
                <span className="text-slate-400 dark:text-slate-500 block font-bold uppercase tracking-wider text-[10px] mb-1.5">Skill Proficiencies</span>
                <div className="flex flex-wrap gap-1.5">
                  {professionalDetails.skillProficiencies.length > 0 ? (
                    professionalDetails.skillProficiencies.map(sk => (
                      <span key={sk.skill} className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-lg text-xs border border-slate-200 dark:border-slate-700/60">
                        {sk.skill} • {sk.level}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-500 dark:text-slate-400 italic">None added</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <span className="text-slate-400 dark:text-slate-500 block font-bold uppercase tracking-wider text-[10px]">Mentoring Experience</span>
                  <span className="text-slate-800 dark:text-slate-200 font-semibold text-sm mt-0.5 block">{professionalDetails.teachingExpYears || '0'} Years</span>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-slate-500 block font-bold uppercase tracking-wider text-[10px]">Tutoring Format Mode</span>
                  <span className="text-slate-800 dark:text-slate-200 font-semibold text-sm mt-0.5 block">{teachingSetup.teachingMode}</span>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-slate-500 block font-bold uppercase tracking-wider text-[10px]">Spoken Languages</span>
                  <span className="text-slate-800 dark:text-slate-200 font-semibold text-sm mt-0.5 block">{professionalDetails.languages.join(', ') || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Schedule & Pricing */}
          <div className="p-6 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-950/10 relative">
            <button
              type="button"
              onClick={() => goToStep(7)}
              className="absolute top-6 right-6 text-blue-600 dark:text-blue-500 hover:underline flex items-center space-x-1 text-xs font-bold uppercase tracking-wider transition"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Modify</span>
            </button>
            <h3 className="font-extrabold text-base text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-blue-600 dark:text-blue-500" /> Tutoring Setup & Pricing
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 dark:text-slate-500 block font-bold uppercase tracking-wider text-[10px]">Hourly Tutoring Rate</span>
                <span className="text-slate-800 dark:text-slate-200 font-semibold text-sm mt-0.5 block">₹{teachingSetup.hourlyRate} / hour</span>
              </div>
              <div>
                <span className="text-slate-400 dark:text-slate-500 block font-bold uppercase tracking-wider text-[10px]">Session Duration</span>
                <span className="text-slate-800 dark:text-slate-200 font-semibold text-sm mt-0.5 block">{teachingSetup.sessionDuration} Minutes</span>
              </div>
              <div>
                <span className="text-slate-400 dark:text-slate-500 block font-bold uppercase tracking-wider text-[10px]">Free Demo Class</span>
                <span className="text-slate-800 dark:text-slate-200 font-semibold text-sm mt-0.5 block">{teachingSetup.freeDemo ? 'Offered to students' : 'No demo offered'}</span>
              </div>
              <div>
                <span className="text-slate-400 dark:text-slate-500 block font-bold uppercase tracking-wider text-[10px]">Experience Level Tier</span>
                <span className="text-slate-800 dark:text-slate-200 font-semibold text-sm mt-0.5 block">{teachingSetup.experienceLevel || 'Beginner Tutor'}</span>
              </div>
              <div className="md:col-span-2 border-t border-slate-100 dark:border-slate-800/80 pt-3 mt-1">
                <span className="text-slate-400 dark:text-slate-500 block font-bold uppercase tracking-wider text-[10px] mb-1">Timezone Slot Mapping</span>
                <span className="text-slate-800 dark:text-slate-200 font-medium text-xs block">
                  Timezone: {teachingSetup.availability?.timezone || 'Asia/Kolkata (IST)'} 
                  {teachingSetup.availability?.holidayMode ? ' • Holiday Mode Active' : ''}
                </span>
              </div>
            </div>
          </div>

          {/* Section 5: Portfolio & Social Links */}
          <div className="p-6 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-950/10 relative">
            <button
              type="button"
              onClick={() => goToStep(5)}
              className="absolute top-6 right-6 text-blue-600 dark:text-blue-500 hover:underline flex items-center space-x-1 text-xs font-bold uppercase tracking-wider transition"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Modify</span>
            </button>
            <h3 className="font-extrabold text-base text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
              <Link className="w-5 h-5 text-blue-600 dark:text-blue-500" /> Portfolio & Social Accounts
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 dark:text-slate-500 block font-bold uppercase tracking-wider text-[10px]">LinkedIn URL</span>
                <span className="text-slate-800 dark:text-slate-200 font-medium block truncate mt-0.5">{teachingSetup.profilePhilosophy?.linkedin || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 dark:text-slate-500 block font-bold uppercase tracking-wider text-[10px]">GitHub Profile</span>
                <span className="text-slate-800 dark:text-slate-200 font-medium block truncate mt-0.5">{teachingSetup.profilePhilosophy?.github || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 dark:text-slate-500 block font-bold uppercase tracking-wider text-[10px]">YouTube Demo Video</span>
                <span className="text-slate-800 dark:text-slate-200 font-medium block truncate mt-0.5">{teachingSetup.profilePhilosophy?.demoVideoLink || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 dark:text-slate-500 block font-bold uppercase tracking-wider text-[10px]">Portfolio / Social Website</span>
                <span className="text-slate-800 dark:text-slate-200 font-medium block truncate mt-0.5">{teachingSetup.profilePhilosophy?.portfolioWebsite || 'N/A'}</span>
              </div>
              {teachingSetup.profilePhilosophy?.portfolioPdf && (
                <div className="md:col-span-2 flex items-center space-x-2 text-[11px] text-blue-600 dark:text-blue-400 font-semibold pt-1">
                  <FileText className="w-4 h-4" />
                  <span>Portfolio Document Attached: {teachingSetup.profilePhilosophy.portfolioPdf}</span>
                </div>
              )}
            </div>
          </div>

          {/* Section 6: AI Competency Assessment */}
          <div className="p-6 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-950/10 relative">
            <button
              type="button"
              onClick={() => goToStep(8)}
              className="absolute top-6 right-6 text-blue-600 dark:text-blue-500 hover:underline flex items-center space-x-1 text-xs font-bold uppercase tracking-wider transition"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Modify</span>
            </button>
            <h3 className="font-extrabold text-base text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-blue-600 dark:text-blue-500" /> AI Competency Assessment
            </h3>
            <div className="space-y-4 text-xs">
              {aiInterview.teachingDemoText && (
                <span className="text-[10px] font-bold px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-full border border-emerald-500/10">
                  Assessment Completed ✓
                </span>
              )}
              {aiInterview.teachingDemoText && (
                <div>
                  <span className="text-slate-400 dark:text-slate-500 block font-bold uppercase tracking-wider text-[10px] mb-1">Teaching Scenario Response</span>
                  <p className="text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-xl p-3 leading-relaxed max-h-36 overflow-y-auto italic">
                  &ldquo;{aiInterview.teachingDemoText.length > 300 ? aiInterview.teachingDemoText.slice(0, 300) + '...' : aiInterview.teachingDemoText}&rdquo;
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Terms Agreement */}
          <div className="flex items-start space-x-3.5 p-5 border border-amber-200 dark:border-amber-900/30 bg-amber-50/30 dark:bg-amber-950/10 rounded-2xl">
            <input
              type="checkbox"
              id="terms"
              checked={agreed}
              onChange={e => setAgreed(e.target.checked)}
              className="mt-1 h-4.5 w-4.5 rounded border-slate-200 dark:border-slate-800 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <label htmlFor="terms" className="text-xs text-slate-600 dark:text-slate-400 leading-normal select-none cursor-pointer">
              By checking this box, I confirm that all information provided is accurate and authentic. 
              I agree to the EduEarn Tutor Policy, Code of Conduct, and Terms of Service.
            </label>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 border-t border-slate-200 dark:border-slate-800 pt-6">
            <button
              type="button"
              onClick={goBack}
              className="px-6 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold rounded-xl transition hover:bg-slate-50 dark:hover:bg-slate-800/50"
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
        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4">
          <h4 className="font-bold text-sm text-blue-700 dark:text-blue-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Final Checklist
          </h4>
          <ul className="text-xs space-y-3 text-slate-600 dark:text-slate-400 leading-relaxed list-disc pl-4">
            <li>
              Once submitted, application processing takes approximately <strong>24-48 hours</strong>.
            </li>
            <li>
              Our support team will verify your Student ID cards and optional documents.
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
