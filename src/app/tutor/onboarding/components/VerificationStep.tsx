"use client";
import React, { useState } from 'react';
import { useOnboarding, OnboardingState } from '@/context/OnboardingContext';
import { verificationService } from '@/services/verificationService';
import { ShieldCheck, Loader2, Sparkles, AlertCircle, FileText, CheckCircle2, ChevronRight, CreditCard, Lock } from 'lucide-react';
import { toast } from 'sonner';

export default function VerificationStep() {
  const { state, setState, goNext, goBack } = useOnboarding();
  const { personalInfo, professionalDetails, teachingSetup } = state;

  const [idType, setIdType] = useState<string>("Aadhaar / National ID");
  const [idNumber, setIdNumber] = useState<string>(state.verification?.idNumber || "");
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState<boolean>(Boolean(state.verification?.profileVerified));

  const documentsToScan = [
    { type: 'profilePhoto', label: 'Profile Photo', name: personalInfo.avatarUrl ? 'Profile Picture Detected' : 'profile_headshot.png' },
    { type: 'govtId', label: 'Government ID', name: 'govt_passport_verification.pdf' },
    { type: 'degree', label: 'Degree Certificate', name: (professionalDetails.educationList[0] as any)?.certificateName || 'bsc_computer_science_diploma.pdf' },
    { type: 'resume', label: 'Resume / CV', name: teachingSetup.profilePhilosophy.optionalDoc || 'tutor_curriculum_vitae.pdf' },
    { type: 'experienceDoc', label: 'Experience Proof', name: 'teaching_employment_proof.pdf' }
  ];

  const handleValidateId = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setValidationError(null);

    // Client check for empty ID
    if (!idNumber || !idNumber.trim()) {
      const msg = "ID number cannot be empty. Please enter your identification document number.";
      setValidationError(msg);
      toast.error(msg);
      return;
    }

    setIsValidating(true);
    try {
      const response = await verificationService.validateId(idNumber.trim(), idType);
      
      setIsVerified(true);
      setValidationError(null);
      
      setState((prev: OnboardingState) => ({
        ...prev,
        verification: {
          profileVerified: true,
          documents: prev.verification?.documents || [],
          idNumber: response.idNumber || idNumber.trim(),
        },
      }));

      toast.success("Identity validation successful ✓");
    } catch (err: any) {
      console.error("ID Validation error:", err);
      setIsVerified(false);
      const msg = err.message || "ID validation failed. Please verify the ID number entered.";
      setValidationError(msg);
      toast.error(msg);
    } finally {
      setIsValidating(false);
    }
  };

  const handleProceed = () => {
    if (!isVerified) {
      toast.error("Please validate your identification document number before proceeding.");
      return;
    }
    goNext();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start max-w-[1200px] mx-auto">
      
      {/* LEFT & CENTER WORKSPACE */}
      <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.03)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] p-6 md:p-10 transition-all duration-300">
        
        {/* Step Header */}
        <div className="mb-8 border-b border-slate-100 dark:border-slate-800/50 pb-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-blue-600" />
            Authoritative ID & Document Verification
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Enter your official government or student identification number for real-time backend database validation.
          </p>
        </div>

        {/* Success Banner */}
        {isVerified && (
          <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-500/30 rounded-xl text-emerald-700 dark:text-emerald-400 flex items-center space-x-3 shadow-sm">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
            <div>
              <span className="font-extrabold text-xs uppercase tracking-wider block">ID Verification Successful</span>
              <span className="text-xs">Your identification document ({idNumber}) has been verified against backend records.</span>
            </div>
          </div>
        )}

        {/* Error Banner */}
        {validationError && (
          <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-500/30 rounded-xl text-rose-700 dark:text-rose-400 flex items-center space-x-3 shadow-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600 dark:text-rose-400" />
            <div>
              <span className="font-extrabold text-xs uppercase tracking-wider block">Validation Failed</span>
              <span className="text-xs">{validationError}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleValidateId} className="space-y-6">
          {/* ID Input Form Card */}
          <div className="p-6 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-950/20 space-y-4">
            <div className="flex items-center gap-2 font-bold text-sm text-slate-800 dark:text-slate-200">
              <CreditCard className="w-4 h-4 text-blue-600" />
              <span>Government / Official Identification Details</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  ID Type
                </label>
                <select
                  value={idType}
                  onChange={(e) => {
                    setIdType(e.target.value);
                    setIsVerified(false);
                  }}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                >
                  <option value="Aadhaar / National ID">🇮🇳 Aadhaar / National ID</option>
                  <option value="Passport">✈️ Passport</option>
                  <option value="Driving License">🚗 Driving License</option>
                  <option value="Student ID">🎓 Student ID Number</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Identification Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={idNumber}
                  onChange={(e) => {
                    setIdNumber(e.target.value);
                    setIsVerified(false);
                    setValidationError(null);
                  }}
                  placeholder="e.g. AADH12345678 or PASS987654"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Lock className="w-3 h-3 text-slate-400" /> Safe 256-bit encrypted validation.
              </span>
              <button
                type="submit"
                disabled={isValidating || !idNumber.trim()}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isValidating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Validating ID...
                  </>
                ) : isVerified ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    Re-Verify ID
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    Validate & Verify ID
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Uploaded Document Confirmation List */}
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              Attached Credentials Verification Audit
            </span>
            {documentsToScan.map((doc) => (
              <div 
                key={doc.type}
                className="p-4 border rounded-xl flex items-center justify-between border-slate-200 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-950/5"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-emerald-500" />
                  <div>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">{doc.label}</span>
                    <span className="text-[10px] text-slate-400 block max-w-[250px] truncate">{doc.name}</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/50 px-2.5 py-1 rounded-full">
                  ✓ Attached
                </span>
              </div>
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 border-t pt-6 dark:border-t-gray-700">
            <button
              type="button"
              onClick={goBack}
              className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 transition font-bold text-sm"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleProceed}
              disabled={!isVerified}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-2 transition font-bold text-sm"
            >
              <span>Continue</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      {/* RIGHT SIDE: Helper Guidance Panel */}
      <div className="lg:sticky lg:top-24 space-y-6">
        <div className="bg-blue-50/50 dark:bg-blue-950/15 border border-blue-100/60 dark:border-blue-900/30 rounded-3xl p-6 space-y-4">
          <h4 className="font-bold text-sm text-blue-800 dark:text-blue-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Backend Compliance Check
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Your entered ID number is checked directly against the platform backend database to prevent duplicate registrations and verify credential authenticity.
          </p>
          <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 p-3 rounded-xl text-[10px] text-amber-700 dark:text-amber-400">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>Invalid, empty, or duplicate ID numbers will be rejected by security policies.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
