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
    { number: 2, label: 'Education' },
    { number: 3, label: 'Experience' },
    { number: 4, label: 'Skills' },
    { number: 5, label: 'Portfolio' },
    { number: 6, label: 'Scheduling' },
    { number: 7, label: 'Pricing' },
    { number: 8, label: 'Assessment' },
  ];

  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between max-w-5xl mx-auto px-4">
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
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                    isCompleted
                      ? 'bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                      : isActive
                      ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] ring-4 ring-blue-900/30'
                      : 'bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : step.number}
                </button>
                <span
                  className={`mt-2 text-[10px] uppercase font-bold tracking-wider whitespace-nowrap hidden md:inline-block ${
                    isActive
                      ? 'text-blue-500 font-extrabold'
                      : isCompleted
                      ? 'text-emerald-500'
                      : 'text-slate-500'
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {/* Connecting Line */}
              {index < steps.length - 1 && (
                <div className="flex-1 h-[2px] mx-1 bg-slate-800 relative -mt-5 md:-mt-7">
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
