"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { useOnboarding, OnboardingProvider } from '@/context/OnboardingContext';
import { createClient } from '@/lib/supabase';
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
import ReviewSubmitStep from '@/app/tutor/onboarding/components/ReviewSubmitStep';
import CompletionStep from '@/app/tutor/onboarding/components/CompletionStep';

// Step flow:
// 1: Basic Profile → 2: Education → 3: Experience → 4: Categories & Skills
// 5: Portfolio → 6: Scheduling → 7: Pricing → 8: AI Assessment
// 9: Review & Submit → 10: Completion

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
  const [authError, setAuthError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      setAuthError(null);
      try {
        const supabase = createClient();
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (!session) {
          // Fallback to mock session check (dev mode only)
          const mockUser = typeof window !== 'undefined' ? localStorage.getItem('eduearn_mock_user') : null;
          if (!mockUser) {
            router.replace('/tutor/login?redirect=' + encodeURIComponent('/tutor/onboarding'));
            return;
          }
        } else {
          // If already complete, redirect to dashboard
          const isComplete = session.user.user_metadata?.complete === true;
          if (isComplete) {
            router.replace('/tutor/dashboard');
            return;
          }
        }
      } catch (err) {
        console.error('[TutorOnboarding] Auth check failed:', err);
        setAuthError('Authentication check failed. Please refresh the page.');
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, [router]);

  if (isLoading || !isHydrated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (authError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-sm">
          <p className="text-destructive font-semibold text-sm">{authError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const TOTAL_STEPS = 9; // Steps 1–9; step 10 is the completion screen

  const renderStep = () => {
    switch (state.currentStep) {
      case 1:  return <BasicProfileStep />;
      case 2:  return <EducationStep />;
      case 3:  return <ExperienceStep />;
      case 4:  return <CategoriesSkillsStep />;
      case 5:  return <PortfolioStep />;
      case 6:  return <SchedulingStep />;
      case 7:  return <PricingStep />;
      case 8:  return <AIAssessmentStep />;
      case 9:  return <ReviewSubmitStep />;
      case 10: return <CompletionStep />;
      default: return <BasicProfileStep />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-[1200px] mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Tutor Onboarding
          </h1>
          <p className="text-sm text-muted-foreground">
            Complete your registration details to start tutoring on EduEarn
          </p>
        </div>

        {/* Progress Stepper — visible for steps 1–9 */}
        {state.currentStep <= TOTAL_STEPS && (
          <ProgressStepper currentStep={state.currentStep} goToStep={goToStep} />
        )}

        <div className="mt-8">
          {renderStep()}
        </div>
      </div>
    </div>
  );
}
