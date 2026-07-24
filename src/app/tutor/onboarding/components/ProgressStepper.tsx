"use client";
import React from 'react';
import { Check } from 'lucide-react';

interface ProgressStepperProps {
  currentStep: number;
  goToStep?: (step: number) => void;
}

export default function ProgressStepper({ currentStep, goToStep }: ProgressStepperProps) {
  const steps = [
    { number: 1, label: 'Profile' },
    { number: 2, label: 'Professional' },
    { number: 3, label: 'Teaching Setup' },
    { number: 4, label: 'Verification' },
    { number: 5, label: 'AI Interview' },
    { number: 6, label: 'Review' },
    { number: 7, label: 'Complete' },
  ];

  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between max-w-4xl mx-auto px-4">
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
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 ${
                    isCompleted
                      ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                      : isActive
                      ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] ring-4 ring-blue-100 dark:ring-blue-900/30'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : step.number}
                </button>
                <span
                  className={`mt-2 text-xs font-medium whitespace-nowrap hidden sm:inline-block ${
                    isActive
                      ? 'text-blue-600 dark:text-blue-400 font-bold'
                      : isCompleted
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-gray-400 dark:text-gray-500'
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {/* Connecting Line */}
              {index < steps.length - 1 && (
                <div className="flex-1 h-0.5 mx-2 bg-gray-200 dark:bg-gray-700 relative -mt-4 sm:-mt-6">
                  <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-500"
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
  );
}
