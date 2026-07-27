"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';


export interface PersonalInfo {
  fullName: string;
  displayName: string;
  headline: string;
  dob: string;
  gender: string;
  phoneCountryCode: string;
  phoneNumber: string;
  email: string;
  country: string;
  state: string;
  city: string;
  language: string;
  bio: string;
  avatarUrl?: string;
}

export interface ProfessionalDetails {
  selectedCategories: string[];
  skillProficiencies: { skill: string; level: string }[];
  languages: string[];
  educationList: { id: string; degree: string; college: string; passingYear: string; certificateName?: string; certificateProgress?: number }[];
  teachingExpYears: string;
  achievements: string;
  experienceDocName?: string;
  experienceDocProgress?: number;
}

export interface TeachingSetup {
  teachingMode: 'Online' | 'Offline' | 'Hybrid';
  targetStudentLevels: string[];
  teachingStyles: string[];
  hourlyRate: number;
  sessionDuration: number; // in minutes
  freeDemo: boolean;
  preferredLanguage: string;
  coursePrice?: number;
  subscriptionRate?: number;
  groupRate?: number;
  couponCode?: string;
  cancellationPolicy?: string;
  teachingFormats?: string[];
  experienceLevel?: string;
  preferredDuration?: number;
  maxClassesPerDay?: string;
  profilePhilosophy: {
    professionalBio: string;
    whyTeach: string;
    uniqueStyle: string;
    demoVideoLink: string;
    github: string;
    linkedin: string;
    behance: string;
    youtube: string;
    optionalDoc: string;
    instagram?: string;
    portfolioWebsite?: string;
    portfolioPdf?: string;
    coverImage?: string;
    resume?: string;
  };
  availability: {
    timezone: string;
    maxHoursPerDay: number;
    slots: Record<string, string[]>;
    maxStudents?: number;
    maxSessions?: number;
    holidayMode?: boolean;
  };
  liveClassSetup: {
    preferredPlatform: string;
    primaryMeetingLink: string;
    backupMeetingLink: string;
    formats: string[];
    preferredBatchSize: number;
  };
}

export interface AIInterview {
  aiQuizAnswers: Record<string, string>;
  aiCodingCode: string;
  teachingDemoText: string;
  studentDoubtText: string;
}

export type Review = Record<string, any>;
export type Submission = Record<string, any>;

export interface Verification {
  profileVerified: boolean;
  documents: string[]; // placeholder for uploaded document IDs
}

export interface OnboardingState {
  currentStep: number;
  personalInfo: PersonalInfo;
  professionalDetails: ProfessionalDetails;
  teachingSetup: TeachingSetup;
  verification: Verification;
  aiInterview: AIInterview;
  review: Review;
  submission: Submission;
}

const defaultState: OnboardingState = {
  currentStep: 1,
  personalInfo: {
    fullName: '',
    displayName: '',
    headline: '',
    dob: '',
    gender: 'Male',
    phoneCountryCode: '+91',
    phoneNumber: '',
    email: '',
    country: 'India',
    state: 'Telangana',
    city: 'Hyderabad',
    language: 'English, Hindi',
    bio: '',
    avatarUrl: '',
  },
  professionalDetails: {
    selectedCategories: [],
    skillProficiencies: [],
    languages: [],
    educationList: [],
    teachingExpYears: '',
    achievements: '',
  },
  teachingSetup: {
    teachingMode: 'Online',
    targetStudentLevels: [],
    teachingStyles: [],
    hourlyRate: 300,       // INR per hour
    sessionDuration: 60,
    freeDemo: true,
    preferredLanguage: 'English',
    coursePrice: 499,       // INR
    subscriptionRate: 299,  // INR per month
    groupRate: 149,          // INR per session
    couponCode: '',
    cancellationPolicy: '24 hrs notice required',
    teachingFormats: [],
    experienceLevel: 'Beginner Tutor',
    preferredDuration: 60,
    maxClassesPerDay: '3',
    profilePhilosophy: {
      professionalBio: '',
      whyTeach: '',
      uniqueStyle: '',
      demoVideoLink: '',
      github: '',
      linkedin: '',
      behance: '',
      youtube: '',
      optionalDoc: '',
      instagram: '',
      portfolioWebsite: '',
      portfolioPdf: '',
      coverImage: '',
      resume: '',
    },
    availability: {
      timezone: 'IST (UTC+5:30)',
      maxHoursPerDay: 4,
      slots: {},
      maxStudents: 5,
      maxSessions: 10,
      holidayMode: false,
    },
    liveClassSetup: {
      preferredPlatform: 'Google Meet',
      primaryMeetingLink: '',
      backupMeetingLink: '',
      formats: [],
      preferredBatchSize: 25,
    },
  },
  aiInterview: {
    aiQuizAnswers: {},
    aiCodingCode: '',
    teachingDemoText: '',
    studentDoubtText: '',
  },
  verification: { profileVerified: false, documents: [] },
  review: {},
  submission: {},
};

interface OnboardingContextProps {
  state: OnboardingState;
  setState: React.Dispatch<React.SetStateAction<OnboardingState>>;
  goNext: () => void;
  goBack: () => void;
  goToStep: (step: number) => void;
  saveDraft: () => void;
  loadDraft: () => void;
  resetOnboarding: () => void;
  isHydrated: boolean;
}

const OnboardingContext = createContext<OnboardingContextProps | undefined>(undefined);

export const OnboardingProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<OnboardingState>(defaultState);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load persisted state on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem('tutor_onboarding_state');
    if (saved) {
      try {
        setState(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse onboarding state', e);
      }
    }
    setIsHydrated(true);
  }, []);

  // Auto‑save on any state change ONLY AFTER hydration is complete
  useEffect(() => {
    if (typeof window === 'undefined' || !isHydrated) return;
    localStorage.setItem('tutor_onboarding_state', JSON.stringify(state));
  }, [state, isHydrated]);

  const goNext = () => setState((prev: OnboardingState) => ({ ...prev, currentStep: Math.min(7, prev.currentStep + 1) }));
  const goBack = () => setState((prev: OnboardingState) => ({ ...prev, currentStep: Math.max(1, prev.currentStep - 1) }));
  const goToStep = (step: number) => setState((prev: OnboardingState) => ({ ...prev, currentStep: Math.max(1, Math.min(7, step)) }));
  const saveDraft = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('tutor_onboarding_state', JSON.stringify(state));
    }
  };
  const loadDraft = () => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem('tutor_onboarding_state');
    if (saved) {
      try {
        setState(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved onboarding draft', e);
      }
    }
  };
  const resetOnboarding = () => setState(defaultState);
  return (
    <OnboardingContext.Provider
      value={{ state, setState, goNext, goBack, goToStep, saveDraft, loadDraft, resetOnboarding, isHydrated }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be used within OnboardingProvider');
  return ctx;
};
