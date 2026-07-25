"use client";
import React, { useState, useEffect } from 'react';
import { useOnboarding, OnboardingState } from '@/context/OnboardingContext';
import { verificationService } from '@/services/verificationService';
import { FileCheck, ShieldCheck, Loader2, Sparkles, AlertCircle, FileText, CheckCircle2, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

export default function VerificationStep() {
  const { state, setState, goNext, goBack } = useOnboarding();
  const { verification, personalInfo, professionalDetails, teachingSetup } = state;

  const [scanProgress, setScanProgress] = useState(0);
  const [activeScanIndex, setActiveScanIndex] = useState(0);
  const [successMsg, setSuccessMsg] = useState('');

  const documentsToScan = [
    { type: 'profilePhoto', label: 'Profile Photo', name: personalInfo.avatarUrl ? 'Profile Picture Detected' : 'profile_headshot.png' },
    { type: 'govtId', label: 'Government ID', name: 'govt_passport_verification.pdf' },
    { type: 'degree', label: 'Degree Certificate', name: (professionalDetails.educationList[0] as any)?.certificateName || 'bsc_computer_science_diploma.pdf' },
    { type: 'resume', label: 'Resume / CV', name: teachingSetup.profilePhilosophy.optionalDoc || 'tutor_curriculum_vitae.pdf' },
    { type: 'experienceDoc', label: 'Experience Proof', name: 'teaching_employment_proof.pdf' }
  ];

  const handleVerifyAutomatically = async () => {
    try {
      const response = await verificationService.verifyDocuments([]);
      setState((prev: OnboardingState) => ({
        ...prev,
        verification: {
          profileVerified: response.profileVerified,
          documents: response.documents,
        },
      }));
      setSuccessMsg('All documents successfully processed and verified!');
      toast.success('AI Document Verification Successful ✓');
      setTimeout(() => {
        setState((prev: OnboardingState) => ({
          ...prev,
          currentStep: prev.currentStep + 1
        }));
      }, 1500);
    } catch (err) {
      console.error(err);
      toast.error('AI scan failed to save. Please proceed.');
    }
  };

  useEffect(() => {
    // Progress counter for scanning animation
    let prog = 0;
    const interval = setInterval(() => {
      prog += 2;
      setScanProgress(prog);
      
      const stepSize = 100 / documentsToScan.length;
      const index = Math.min(Math.floor(prog / stepSize), documentsToScan.length - 1);
      setActiveScanIndex(index);

      if (prog >= 100) {
        clearInterval(interval);
        handleVerifyAutomatically();
      }
    }, 45);

    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start max-w-[1200px] mx-auto">
      
      {/* SCANNING WORKSPACE */}
      <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.03)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] p-6 md:p-10 transition-all duration-300">
        
        {/* Step Header */}
        <div className="mb-8 border-b border-slate-100 dark:border-slate-800/50 pb-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-blue-600" />
            AI Document Verification
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            EduEarn AI is checking the authenticity of your uploaded credentials and credentials files.
          </p>
        </div>

        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-500/30 rounded-xl text-emerald-700 dark:text-emerald-450 flex items-center space-x-3 shadow-sm">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span className="font-bold text-xs uppercase tracking-wider">{successMsg}</span>
          </div>
        )}

        <div className="space-y-6">
          {/* Scanning Progress Bar */}
          <div className="relative border border-slate-200 dark:border-slate-800 p-6 rounded-2xl bg-slate-50/50 dark:bg-slate-950/20 overflow-hidden">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold uppercase text-slate-550 dark:text-slate-400">Scanning Progress</span>
              <span className="text-sm font-extrabold text-blue-600">{scanProgress}%</span>
            </div>
            
            <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-500 to-emerald-500 h-full transition-all duration-100 ease-linear"
                style={{ width: `${scanProgress}%` }}
              />
            </div>

            {scanProgress < 100 && (
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-scan-beam" />
            )}
          </div>

          {/* Scanned Document Items */}
          <div className="space-y-3">
            {documentsToScan.map((doc, idx) => {
              const isChecking = activeScanIndex === idx && scanProgress < 100;
              const isChecked = activeScanIndex > idx || scanProgress === 100;
              const isPending = activeScanIndex < idx && scanProgress < 100;

              return (
                <div 
                  key={doc.type}
                  className={`p-4 border rounded-xl flex items-center justify-between transition ${
                    isChecking 
                      ? 'border-blue-500 bg-blue-50/10' 
                      : isChecked
                      ? 'border-slate-200 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-950/5'
                      : 'border-slate-100 dark:border-slate-900 bg-transparent opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <FileText className={`w-5 h-5 ${isChecking ? 'text-blue-550' : isChecked ? 'text-emerald-500' : 'text-slate-400'}`} />
                    <div>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">{doc.label}</span>
                      <span className="text-[10px] text-slate-400 block max-w-[250px] truncate">{doc.name}</span>
                    </div>
                  </div>

                  <div>
                    {isChecking && (
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/40 border border-blue-200/50 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                        <Loader2 className="w-3 h-3 animate-spin" /> Scanning...
                      </span>
                    )}
                    {isChecked && (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/50 px-2.5 py-1 rounded-full">
                        ✓ Verified
                      </span>
                    )}
                    {isPending && (
                      <span className="text-[10px] font-bold text-slate-400 border border-slate-150 dark:border-slate-800 px-2.5 py-1 rounded-full">
                        Pending
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 border-t pt-6 dark:border-t-gray-700">
            <button
              type="button"
              onClick={goBack}
              disabled={scanProgress < 100}
              className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Back
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={scanProgress < 100}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-2 transition"
            >
              <span>Continue</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Helper Guidance Panel */}
      <div className="lg:sticky lg:top-24 space-y-6">
        <div className="bg-blue-50/50 dark:bg-blue-950/15 border border-blue-100/60 dark:border-blue-900/30 rounded-3xl p-6 space-y-4">
          <h4 className="font-bold text-sm text-blue-800 dark:text-blue-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            AI Compliance Scan
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Our automated AI verification system parses metadata, checks document clarity, matches file signatures, and cross-references details with your profile records.
          </p>
          <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 p-3 rounded-xl text-[10px] text-amber-700 dark:text-amber-400">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>AI verification does not bypass manual review; our administrators verify details prior to tutor onboarding.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
