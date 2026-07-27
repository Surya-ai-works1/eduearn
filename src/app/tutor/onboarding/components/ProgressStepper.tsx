"use client";
import React from 'react';
import { Check } from 'lucide-react';

interface ProgressStepperProps {
  currentStep: number;
  goToStep?: (step: number) => void;
}

export default function ProgressStepper({ currentStep, goToStep }: ProgressStepperProps) {
  const steps = [
    { number: 1, label: 'Personal' },
    { number: 2, label: 'Academics' },
    { number: 3, label: 'Experience' },
    { number: 4, label: 'Subjects' },
    { number: 5, label: 'Documents' },
    { number: 6, label: 'Assessment' },
    { number: 7, label: 'Review' },
  ];

  return (
    <div className="w-full py-4">
      {/* Scrollable on mobile so 9 steps don't overflow */}
      <div className="overflow-x-auto pb-2 -mb-2">
        <div className="flex items-center justify-between min-w-[560px] max-w-5xl mx-auto px-4">
          {steps.map((step, index) => {
            const isCompleted = currentStep > step.number;
            const isActive = currentStep === step.number;
            const isPending = currentStep < step.number;

            return (
              <React.Fragment key={step.number}>
                {/* Step indicator */}
                <div className="flex flex-col items-center relative z-10">
                  <button
                    type="button"
                    disabled={isPending || !goToStep}
                    onClick={() => goToStep?.(step.number)}
                    title={step.label}
                    aria-label={`Step ${step.number}: ${step.label}${isCompleted ? ' (completed)' : isActive ? ' (current)' : ''}`}
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                      isCompleted
                        ? 'bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                        : isActive
                        ? 'bg-primary text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] ring-4 ring-primary/20'
                        : 'bg-muted text-muted-foreground border border-border cursor-not-allowed'
                    }`}
                  >
                    {isCompleted ? <Check className="w-4 h-4" /> : step.number}
                  </button>
                  <span
                    className={`mt-2 text-[10px] uppercase font-bold tracking-wider whitespace-nowrap hidden md:inline-block ${
                      isActive
                        ? 'text-primary font-extrabold'
                        : isCompleted
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>

                {/* Connecting Line */}
                {index < steps.length - 1 && (
                  <div className="flex-1 h-[2px] mx-1 bg-border relative -mt-5 md:-mt-7">
                    <div
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-emerald-500 transition-all duration-500"
                      style={{
                        width: isCompleted ? '100%' : isActive ? '50%' : '0%',
                      }}
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
