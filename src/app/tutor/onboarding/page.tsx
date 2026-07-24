"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { supabase as supabaseClient } from '@/lib/supabaseClient';
import { OnboardingProvider, useOnboarding } from '@/context/OnboardingContext';
import BasicProfileStep from '@/app/tutor/onboarding/components/BasicProfileStep';
import ProfessionalDetailsStep from '@/app/tutor/onboarding/components/ProfessionalDetailsStep';
import TeachingSetupStep from '@/app/tutor/onboarding/components/TeachingSetupStep';
import VerificationStep from '@/app/tutor/onboarding/components/VerificationStep';
import AIInterviewStep from '@/app/tutor/onboarding/components/AIInterviewStep';
import ReviewSubmitStep from '@/app/tutor/onboarding/components/ReviewSubmitStep';
import CompletionStep from '@/app/tutor/onboarding/components/CompletionStep';
import ProgressStepper from '@/app/tutor/onboarding/components/ProgressStepper';export default function TutorOnboardingPage() {
  return (
    <OnboardingProvider>
      <OnboardingContent />
    </OnboardingProvider>
  );
}

function OnboardingContent() {
  const router = useRouter();
  const { state, goToStep, isHydrated } = useOnboarding();
  const [isLoading, setIsLoading] = React.useState(true);
  React.useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      const { data: { session } } = await supabaseClient.auth.getSession();
      if (!session?.user) {
        router.replace(`/tutor/login?redirect=${encodeURIComponent('/tutor/onboarding')}`);
      }
      setIsLoading(false);
    };
    checkAuth();
  }, [supabaseClient, router]);

  if (isLoading || !isHydrated) return null;
  const renderStep = () => {
    switch (state.currentStep) {
      case 1:
        return <BasicProfileStep />;
      case 2:
        return <ProfessionalDetailsStep />;
      case 3:
        return <TeachingSetupStep />;
      case 4:
        return <VerificationStep />;
      case 5:
        return <AIInterviewStep />;
      case 6:
        return <ReviewSubmitStep />;
      case 7:
        return <CompletionStep />;
      default:
        return <BasicProfileStep />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-950 dark:text-white">
            Tutor Onboarding
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Complete your registration details to start teaching on EduEarn
          </p>
        </div>

        <ProgressStepper currentStep={state.currentStep} goToStep={goToStep} />

        <div className="mt-6">
          {renderStep()}
        </div>
      </div>
    </div>
  );
}
