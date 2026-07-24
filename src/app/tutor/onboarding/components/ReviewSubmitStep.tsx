"use client";
import React, { useState } from 'react';
import { useOnboarding } from '@/context/OnboardingContext';
import { Edit2, ShieldAlert, CheckSquare, Loader2 } from 'lucide-react';

export default function ReviewSubmitStep() {
  const { state, goToStep, goNext, goBack } = useOnboarding();
  const { personalInfo, professionalDetails, teachingSetup, verification, aiInterview } = state;

  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) return;

    setIsSubmitting(true);
    // Simulate API call to save onboarding details to database
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    goNext();
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Review & Submit</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Please review your information carefully before submitting your tutor registration. You can edit any section.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Section 1: Basic Profile */}
        <div className="p-5 border dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/10 relative">
          <button
            type="button"
            onClick={() => goToStep(1)}
            className="absolute top-4 right-4 text-blue-600 dark:text-blue-450 hover:underline flex items-center space-x-1 text-sm font-semibold"
          >
            <Edit2 className="w-4 h-4" />
            <span>Edit</span>
          </button>
          <h3 className="font-bold text-lg text-gray-800 dark:text-gray-250 mb-3">Basic Profile</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400 block">Full Name</span>
              <span className="text-gray-800 dark:text-gray-300 font-medium">{personalInfo.fullName || 'N/A'}</span>
            </div>
            <div>
              <span className="text-gray-400 block">Display Name</span>
              <span className="text-gray-800 dark:text-gray-300 font-medium">{personalInfo.displayName || personalInfo.fullName || 'N/A'}</span>
            </div>
            <div>
              <span className="text-gray-400 block">Date of Birth</span>
              <span className="text-gray-800 dark:text-gray-300 font-medium">{personalInfo.dob || 'N/A'}</span>
            </div>
            <div>
              <span className="text-gray-400 block">Phone</span>
              <span className="text-gray-800 dark:text-gray-300 font-medium">
                {personalInfo.phoneCountryCode} {personalInfo.phoneNumber}
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: Professional Details */}
        <div className="p-5 border dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/10 relative">
          <button
            type="button"
            onClick={() => goToStep(2)}
            className="absolute top-4 right-4 text-blue-600 dark:text-blue-450 hover:underline flex items-center space-x-1 text-sm font-semibold"
          >
            <Edit2 className="w-4 h-4" />
            <span>Edit</span>
          </button>
          <h3 className="font-bold text-lg text-gray-800 dark:text-gray-250 mb-3">Professional Details</h3>
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-gray-400 block">Teaching Categories</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {professionalDetails.selectedCategories.length > 0 ? (
                  professionalDetails.selectedCategories.map(cat => (
                    <span key={cat} className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs">
                      {cat}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500">None selected</span>
                )}
              </div>
            </div>

            <div>
              <span className="text-gray-400 block">Skills</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {professionalDetails.skillProficiencies.length > 0 ? (
                  professionalDetails.skillProficiencies.map(sk => (
                    <span key={sk.skill} className="px-2 py-0.5 bg-gray-155 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded text-xs">
                      {sk.skill} ({sk.level})
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500">None added</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Teaching Setup */}
        <div className="p-5 border dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/10 relative">
          <button
            type="button"
            onClick={() => goToStep(3)}
            className="absolute top-4 right-4 text-blue-600 dark:text-blue-450 hover:underline flex items-center space-x-1 text-sm font-semibold"
          >
            <Edit2 className="w-4 h-4" />
            <span>Edit</span>
          </button>
          <h3 className="font-bold text-lg text-gray-800 dark:text-gray-250 mb-3">Teaching Setup</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400 block">Teaching Mode</span>
              <span className="text-gray-800 dark:text-gray-300 font-medium">{teachingSetup.teachingMode}</span>
            </div>
            <div>
              <span className="text-gray-400 block">Hourly Rate</span>
              <span className="text-gray-800 dark:text-gray-300 font-medium">${teachingSetup.hourlyRate} / hour</span>
            </div>
            <div>
              <span className="text-gray-400 block">Session Duration</span>
              <span className="text-gray-800 dark:text-gray-300 font-medium">{teachingSetup.sessionDuration} Minutes</span>
            </div>
            <div>
              <span className="text-gray-400 block">Free Demo Class</span>
              <span className="text-gray-800 dark:text-gray-300 font-medium">{teachingSetup.freeDemo ? 'Yes, Offered' : 'No'}</span>
            </div>
          </div>
        </div>

        {/* Section 4: Document Uploads & AI Interview status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 border dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/10 relative">
            <button
              type="button"
              onClick={() => goToStep(4)}
              className="absolute top-4 right-4 text-blue-600 dark:text-blue-450 hover:underline flex items-center space-x-1 text-sm font-semibold"
            >
              <Edit2 className="w-4 h-4" />
              <span>Edit</span>
            </button>
            <h3 className="font-bold text-lg text-gray-800 dark:text-gray-250 mb-3">Verification</h3>
            <span className="text-xs font-semibold px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full">
              {verification.profileVerified ? 'Verified' : 'Pending Verification'}
            </span>
          </div>

          <div className="p-5 border dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/10 relative">
            <button
              type="button"
              onClick={() => goToStep(5)}
              className="absolute top-4 right-4 text-blue-600 dark:text-blue-450 hover:underline flex items-center space-x-1 text-sm font-semibold"
            >
              <Edit2 className="w-4 h-4" />
              <span>Edit</span>
            </button>
            <h3 className="font-bold text-lg text-gray-800 dark:text-gray-250 mb-3">AI Interview</h3>
            <span className="text-xs font-semibold px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full">
              Completed
            </span>
          </div>
        </div>

        {/* Terms Agreement */}
        <div className="flex items-start space-x-3 p-4 border border-amber-200 dark:border-amber-900/30 bg-amber-50/50 dark:bg-amber-950/10 rounded-lg">
          <input
            type="checkbox"
            id="terms"
            checked={agreed}
            onChange={e => setAgreed(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600"
          />
          <label htmlFor="terms" className="text-xs text-gray-600 dark:text-gray-400 leading-normal">
            By checking this box, you confirm that all information provided is accurate. 
            You agree to the EduEarn Tutor Policy, Code of Conduct, and Terms of Service.
          </label>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 border-t pt-6 dark:border-t-gray-700">
          <button
            type="button"
            onClick={goBack}
            className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 transition"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={!agreed || isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>Submit Application</span>
          </button>
        </div>
      </form>
    </div>
  );
}
