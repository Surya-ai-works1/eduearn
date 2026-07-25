"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { useOnboarding, OnboardingProvider } from '@/context/OnboardingContext';
import { supabase } from '@/lib/supabaseClient';
import ProgressStepper from '@/app/tutor/onboarding/components/ProgressStepper';

// Steps imports
import BasicProfileStep from '@/app/tutor/onboarding/components/BasicProfileStep';
import EducationStep from '@/app/tutor/onboarding/components/EducationStep';
import ExperienceStep from '@/app/tutor/onboarding/components/ExperienceStep';
import CategoriesSkillsStep from '@/app/tutor/onboarding/components/CategoriesSkillsStep';
import PortfolioStep from '@/app/tutor/onboarding/components/PortfolioStep';
import SchedulingStep from '@/app/tutor/onboarding/components/SchedulingStep';
import PricingStep from '@/app/tutor/onboarding/components/PricingStep';
import AIAssessmentStep from '@/app/tutor/onboarding/components/AIAssessmentStep';
import CompletionStep from '@/app/tutor/onboarding/components/CompletionStep';

export default function TutorOnboardingPage() {
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
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // Fallback to mock session check
        const mockUser = typeof window !== 'undefined' ? localStorage.getItem('eduearn_mock_user') : null;
        if (!mockUser) {
          router.replace('/tutor/login?redirect=' + encodeURIComponent('/tutor/onboarding'));
          return;
        }
      }
      setIsLoading(false);
    };
    checkAuth();
  }, [router, supabase]);

  if (isLoading || !isHydrated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const renderStep = () => {
    switch (state.currentStep) {
      case 1:
        return <BasicProfileStep />;
      case 2:
        return <EducationStep />;
      case 3:
        return <ExperienceStep />;
      case 4:
        return <CategoriesSkillsStep />;
      case 5:
        return <PortfolioStep />;
      case 6:
        return <SchedulingStep />;
      case 7:
        return <PricingStep />;
      case 8:
        return <AIAssessmentStep />;
      case 9:
        return <CompletionStep />;
      default:
        return <BasicProfileStep />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-[1200px] mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Tutor Onboarding
          </h1>
          <p className="text-sm text-slate-400">
            Complete your registration details to start teaching on EduEarn
          </p>
        </div>

        {/* Progress Stepper - Hide on complete step (9) */}
        {state.currentStep <= 8 && (
          <ProgressStepper currentStep={state.currentStep} goToStep={goToStep} />
        )}

        <div className="mt-8">
          {renderStep()}
        </div>
      </div>
    </div>
  );
}
