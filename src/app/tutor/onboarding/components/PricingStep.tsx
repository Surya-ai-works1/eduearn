"use client";
import React, { useState } from 'react';
import { useOnboarding, OnboardingState } from '@/context/OnboardingContext';
import { 
  Users, Video, BookOpen, Zap, MessageCircle,
  Sparkles, ShieldCheck, CreditCard, Lock, FileText, 
  LayoutDashboard, BadgeCheck, ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';

/* ── DATA ── */

const TEACHING_FORMATS = [
  {
    id: 'live-1on1',
    label: 'Live 1-on-1',
    description: 'Private sessions tailored to individual students.',
    icon: <Users className="w-5 h-5" />,
  },
  {
    id: 'live-group',
    label: 'Live Group Classes',
    description: 'Teach multiple students simultaneously.',
    icon: <Video className="w-5 h-5" />,
  },
  {
    id: 'recorded',
    label: 'Recorded Courses',
    description: 'Pre-recorded lessons students access any time.',
    icon: <BookOpen className="w-5 h-5" />,
  },
  {
    id: 'workshops',
    label: 'Workshops / Bootcamps',
    description: 'Intensive short-format training programmes.',
    icon: <Zap className="w-5 h-5" />,
  },
  {
    id: 'doubt',
    label: 'Doubt Solving',
    description: 'On-demand sessions for quick student queries.',
    icon: <MessageCircle className="w-5 h-5" />,
  },
];

const EXPERIENCE_LEVELS = [
  {
    id: 'beginner',
    label: 'Beginner',
    description: 'New to formal instruction but knowledgeable in your subject.',
  },
  {
    id: 'intermediate',
    label: 'Intermediate',
    description: 'Some teaching or mentoring experience.',
  },
  {
    id: 'advanced',
    label: 'Advanced',
    description: 'Established track record of successful student outcomes.',
  },
  {
    id: 'expert',
    label: 'Industry Expert',
    description: 'Professional with real-world domain expertise.',
  },
];

const SESSION_DURATIONS = [
  { label: '30 min', value: 30 },
  { label: '45 min', value: 45 },
  { label: '60 min', value: 60 },
  { label: '90 min', value: 90 },
  { label: '120 min', value: 120 },
];

const CLASSES_PER_DAY = ['1', '2', '3', '4', '5', '6+'];

const PAYOUT_ITEMS = [
  { icon: <CreditCard className="w-4 h-4" />, text: 'Weekly payouts to your bank account' },
  { icon: <Lock className="w-4 h-4" />, text: 'Secure, encrypted bank transfers' },
  { icon: <FileText className="w-4 h-4" />, text: 'Automatic invoice generation' },
  { icon: <LayoutDashboard className="w-4 h-4" />, text: 'Earnings dashboard in Tutor Studio' },
  { icon: <BadgeCheck className="w-4 h-4" />, text: 'KYC verification before first payout' },
];

/* ── COMPONENT ── */

export default function PricingStep() {
  const { state, setState, goBack } = useOnboarding();
  const { teachingSetup } = state;

  const [selectedFormats, setSelectedFormats] = useState<string[]>(
    teachingSetup.teachingFormats || []
  );
  const [experienceLevel, setExperienceLevel] = useState<string>(
    teachingSetup.experienceLevel || 'beginner'
  );
  const [duration, setDuration] = useState<number>(
    teachingSetup.preferredDuration || 60
  );
  const [classesPerDay, setClassesPerDay] = useState<string>(
    teachingSetup.maxClassesPerDay || '3'
  );

  const toggleFormat = (id: string) =>
    setSelectedFormats(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFormats.length === 0) {
      toast.warning('Please select at least one teaching format.');
      return;
    }
    setState((prev: OnboardingState) => ({
      ...prev,
      teachingSetup: {
        ...prev.teachingSetup,
        teachingFormats: selectedFormats,
        experienceLevel,
        preferredDuration: duration,
        maxClassesPerDay: classesPerDay,
      },
      currentStep: prev.currentStep + 1,
    }));
    toast.success('Preferences saved ✓');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 items-start max-w-[1100px] mx-auto">
      {/* ── MAIN FORM ── */}
      <form
        onSubmit={handleSubmit}
        className="bg-slate-900 border border-slate-800 rounded-3xl shadow-xl overflow-hidden"
      >
        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b border-slate-800">
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Teaching Preferences &amp; Payouts
          </h1>
          <p className="text-sm text-slate-400 mt-1.5 leading-relaxed">
            Configure your teaching preferences. EduEarn manages pricing, billing and payouts automatically.
          </p>
        </div>

        <div className="px-8 py-8 space-y-10">
          {/* ── SECTION 1: Teaching Format ── */}
          <section className="space-y-4">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Teaching Format
              </h2>
              <p className="text-[11px] text-slate-550 mt-0.5">Select all formats you plan to offer.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {TEACHING_FORMATS.map(f => {
                const isSelected = selectedFormats.includes(f.id);
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => toggleFormat(f.id)}
                    className={`relative p-4 rounded-2xl text-left border transition-all duration-200 group ${
                      isSelected
                        ? 'bg-blue-600/8 border-blue-500 shadow-[0_0_16px_rgba(37,99,235,0.12)]'
                        : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                    }`}
                  >
                    {/* Checkmark */}
                    {isSelected && (
                      <span className="absolute top-3 right-3 w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center">
                        <svg viewBox="0 0 10 8" className="w-2.5 h-2" fill="none">
                          <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                    )}

                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 transition ${
                      isSelected ? 'bg-blue-600/15 text-blue-400' : 'bg-slate-900 text-slate-500 group-hover:text-slate-400'
                    }`}>
                      {f.icon}
                    </div>
                    <p className={`text-xs font-bold leading-tight ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                      {f.label}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">{f.description}</p>
                  </button>
                );
              })}
            </div>
          </section>

          {/* ── SECTION 2: Experience Level ── */}
          <section className="space-y-4">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Experience Level
              </h2>
              <p className="text-[11px] text-slate-550 mt-0.5">Select one — helps EduEarn match you with the right students.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {EXPERIENCE_LEVELS.map(lvl => {
                const isSelected = experienceLevel === lvl.id;
                return (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => setExperienceLevel(lvl.id)}
                    className={`p-4 rounded-2xl text-left border transition-all duration-200 ${
                      isSelected
                        ? 'bg-blue-600/8 border-blue-500 shadow-[0_0_14px_rgba(37,99,235,0.1)]'
                        : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <span className={`text-xs font-bold block mb-1.5 ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                      {lvl.label}
                    </span>
                    <span className="text-[10px] text-slate-500 leading-relaxed">{lvl.description}</span>
                    {isSelected && (
                      <div className="mt-2 w-full h-0.5 rounded-full bg-blue-600/40" />
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          {/* ── SECTION 3: Preferred Session Duration ── */}
          <section className="space-y-4">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Preferred Session Duration
              </h2>
              <p className="text-[11px] text-slate-550 mt-0.5">Select one option.</p>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {SESSION_DURATIONS.map(d => {
                const isSelected = duration === d.value;
                return (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => setDuration(d.value)}
                    className={`px-6 py-2.5 rounded-full text-xs font-bold border transition-all duration-200 hover:scale-[1.03] ${
                      isSelected
                        ? 'bg-blue-600 border-blue-600 text-white shadow-[0_0_12px_rgba(37,99,235,0.2)]'
                        : 'bg-transparent border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-300'
                    }`}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
          </section>

          {/* ── SECTION 4: Maximum Classes Per Day ── */}
          <section className="space-y-4">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Maximum Classes Per Day
              </h2>
              <p className="text-[11px] text-slate-550 mt-0.5">Select your daily teaching capacity.</p>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {CLASSES_PER_DAY.map(n => {
                const isSelected = classesPerDay === n;
                const isRecommended = n === '3';
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setClassesPerDay(n)}
                    className={`relative px-6 py-2.5 rounded-full text-xs font-bold border transition-all duration-200 hover:scale-[1.03] ${
                      isSelected
                        ? 'bg-blue-600 border-blue-600 text-white shadow-[0_0_12px_rgba(37,99,235,0.2)]'
                        : 'bg-transparent border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-300'
                    }`}
                  >
                    {n}
                    {isRecommended && !isSelected && (
                      <span className="absolute -top-2.5 -right-2 text-[8px] bg-emerald-600 text-white font-bold px-1.5 py-0.5 rounded-full leading-none whitespace-nowrap">
                        Recommended
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          {/* ── SECTION 5: Payments & Payouts ── */}
          <section>
            <div className="p-5 border border-slate-800 rounded-2xl bg-slate-950/30 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Payments &amp; Payouts
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PAYOUT_ITEMS.map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-xs text-slate-400">
                    <div className="w-7 h-7 rounded-lg bg-blue-950/40 text-blue-500 flex items-center justify-center flex-shrink-0">
                      {item.icon}
                    </div>
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* ── STICKY FOOTER BUTTONS ── */}
        <div className="px-8 py-5 border-t border-slate-800 bg-slate-900 flex justify-between gap-4">
          <button
            type="button"
            onClick={goBack}
            className="flex-1 md:flex-none md:w-32 py-3 border border-slate-700 text-slate-400 hover:bg-slate-800/50 font-bold rounded-xl text-sm transition"
          >
            Back
          </button>
          <button
            type="submit"
            className="flex-1 md:flex-none md:w-44 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl text-sm shadow-lg transition flex items-center justify-center gap-2"
          >
            Save &amp; Continue
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* ── RIGHT SIDEBAR ── */}
      <div className="lg:sticky lg:top-24 space-y-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
          <h4 className="font-bold text-xs text-blue-400 flex items-center gap-1.5 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            What Happens Next
          </h4>

          <ul className="space-y-2.5">
            {[
              'Pricing managed by EduEarn',
              'Weekly payouts after sessions',
              'Secure payment verification',
              'Automatic earnings reports',
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-2 text-[11px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>

          <div className="pt-3 border-t border-slate-800">
            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1">
              Estimated Approval
            </p>
            <p className="text-sm font-extrabold text-white">24–48 hours</p>
          </div>
        </div>
      </div>
    </div>
  );
}
