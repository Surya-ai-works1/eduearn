"use client";
import React, { useState } from 'react';
import { useOnboarding, OnboardingState } from '@/context/OnboardingContext';
import { verificationService } from '@/services/verificationService';
import { Upload, FileCheck, Loader2 } from 'lucide-react';

interface MockFile {
  name: string;
  type: string;
  progress: number;
}

export default function VerificationStep() {
  const { state, setState, goNext, goBack } = useOnboarding();
  const { verification } = state;

  const [files, setFiles] = useState<Record<string, MockFile>>({});
  const [isVerifying, setIsVerifying] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleMockUpload = (docType: string) => {
    const docNames: Record<string, string> = {
      profilePhoto: 'profile_picture.jpg',
      govtId: 'passport_scan.pdf',
      degree: 'bsc_computer_science.pdf',
      resume: 'resume_tutor.pdf',
      experienceDoc: 'experience_certificate.pdf',
    };

    setFiles(prev => ({
      ...prev,
      [docType]: { name: docNames[docType], type: docType, progress: 0 },
    }));

    // Simulate progress updates
    let prog = 0;
    const interval = setInterval(() => {
      prog += 25;
      setFiles(prev => {
        const file = prev[docType];
        if (!file) return prev;
        return { ...prev, [docType]: { ...file, progress: prog } };
      });
      if (prog >= 100) {
        clearInterval(interval);
      }
    }, 150);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    try {
      const response = await verificationService.verifyDocuments([]);
      setState((prev: OnboardingState) => ({
        ...prev,
        verification: {
          profileVerified: response.profileVerified,
          documents: response.documents,
        },
      }));
      setSuccessMsg('All documents verified successfully!');
      setTimeout(() => {
        goNext();
      }, 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsVerifying(false);
    }
  };

  const requiredDocTypes = [
    { type: 'profilePhoto', label: 'Profile Photo', desc: 'Clear, front-facing headshot' },
    { type: 'govtId', label: 'Government ID', desc: 'Passport, National ID or Driver\'s License' },
    { type: 'degree', label: 'Degree / Certificates', desc: 'Highest educational degree certificate' },
    { type: 'resume', label: 'Resume / CV', desc: 'Updated professional CV' },
    { type: 'experienceDoc', label: 'Teaching Experience Proof', desc: 'Previous employment letter or certificate' },
  ];

  const allFilesUploaded = requiredDocTypes.every(doc => files[doc.type]?.progress >= 100);

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Document Verification</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Please upload clear copies of the following documents. Once uploaded, click Verify to proceed.
      </p>

      {successMsg && (
        <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500 rounded-md text-emerald-700 dark:text-emerald-300 flex items-center space-x-3">
          <FileCheck className="w-5 h-5 flex-shrink-0" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleVerify} className="space-y-6">
        <div className="space-y-4">
          {requiredDocTypes.map(doc => {
            const uploadedFile = files[doc.type];
            return (
              <div key={doc.type} className="p-4 border dark:border-gray-700 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50 dark:bg-gray-900/20">
                <div>
                  <h4 className="font-bold text-gray-800 dark:text-gray-250">{doc.label}</h4>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{doc.desc}</p>
                  {uploadedFile && (
                    <div className="mt-2 flex items-center space-x-2">
                      <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold">{uploadedFile.name}</span>
                      <span className="text-xs text-gray-400">({uploadedFile.progress}%)</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end gap-2">
                  {!uploadedFile ? (
                    <button
                      type="button"
                      onClick={() => handleMockUpload(doc.type)}
                      className="px-4 py-2 border dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-xs font-semibold rounded flex items-center space-x-2 transition"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Upload Draft File</span>
                    </button>
                  ) : uploadedFile.progress < 100 ? (
                    <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-blue-600 h-full transition-all duration-300"
                        style={{ width: `${uploadedFile.progress}%` }}
                      />
                    </div>
                  ) : (
                    <span className="text-xs px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full font-semibold">
                      Ready to Verify
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
            className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={!allFilesUploaded || isVerifying || verification.profileVerified}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-2 transition"
          >
            {isVerifying && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{verification.profileVerified ? 'Verified' : 'Verify & Next'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
