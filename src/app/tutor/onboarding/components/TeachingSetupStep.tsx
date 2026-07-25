"use client";
import React, { useState } from 'react';
import { useOnboarding, OnboardingState } from '@/context/OnboardingContext';
import { languageOptions } from '@/mock/data/languages';
import { 
  Sliders, Video, Link as LinkIcon, 
  Globe, Sparkles, DollarSign, Clock, Users, ArrowRight, 
  ChevronLeft, ChevronRight, CheckCircle2, Upload, Calendar 
} from 'lucide-react';
import { FaLinkedin, FaGithub } from 'react-icons/fa';
import { toast } from 'sonner';

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const TIME_SLOTS = [
  '09:00 - 12:00 (Morning)',
  '12:00 - 15:00 (Afternoon)',
  '15:00 - 18:00 (Late Afternoon)',
  '18:00 - 21:00 (Evening)',
];

export default function TeachingSetupStep() {
  const { state, setState, goNext, goBack } = useOnboarding();
  const { teachingSetup } = state;

  const [subStep, setSubStep] = useState(1); // 1: Creator Portfolio, 2: Availability & Pricing

  // Local state initialized from context
  const [teachingMode, setTeachingMode] = useState(teachingSetup.teachingMode);
  const [timezone, setTimezone] = useState(teachingSetup.availability.timezone);
  const [maxHoursPerDay, setMaxHoursPerDay] = useState(teachingSetup.availability.maxHoursPerDay);
  const [hourlyRate, setHourlyRate] = useState(teachingSetup.hourlyRate);
  const [sessionDuration, setSessionDuration] = useState(teachingSetup.sessionDuration);
  const [freeDemo, setFreeDemo] = useState(teachingSetup.freeDemo);
  const [preferredLanguage, setPreferredLanguage] = useState(teachingSetup.preferredLanguage);
  const [preferredBatchSize, setPreferredBatchSize] = useState(teachingSetup.liveClassSetup.preferredBatchSize);
  const [slots, setSlots] = useState<Record<string, string[]>>(teachingSetup.availability.slots || {});

  // Links
  const [demoVideoLink, setDemoVideoLink] = useState(teachingSetup.profilePhilosophy.demoVideoLink || '');
  const [github, setGithub] = useState(teachingSetup.profilePhilosophy.github || '');
  const [linkedin, setLinkedin] = useState(teachingSetup.profilePhilosophy.linkedin || '');
  const [youtube, setYoutube] = useState(teachingSetup.profilePhilosophy.youtube || '');
  const [behance, setBehance] = useState(teachingSetup.profilePhilosophy.behance || '');

  // Mock uploads
  const [resumeName, setResumeName] = useState<string | null>(teachingSetup.profilePhilosophy.optionalDoc || null);
  const [portfolioName, setPortfolioName] = useState<string | null>(null);

  // Dynamic pricing states
  const [coursePrice, setCoursePrice] = useState(250);
  const [subscriptionPrice, setSubscriptionPrice] = useState(49);
  const [groupClassPrice, setGroupClassPrice] = useState(15);
  const [discountPercent, setDiscountPercent] = useState(10);
  const [cancellationPolicy, setCancellationPolicy] = useState('Flexible');

  // Synchronise local state with context when context loads/hydrates
  React.useEffect(() => {
    setTeachingMode(teachingSetup.teachingMode);
    setTimezone(teachingSetup.availability.timezone);
    setMaxHoursPerDay(teachingSetup.availability.maxHoursPerDay);
    setHourlyRate(teachingSetup.hourlyRate);
    setSessionDuration(teachingSetup.sessionDuration);
    setFreeDemo(teachingSetup.freeDemo);
    setPreferredLanguage(teachingSetup.preferredLanguage);
    setPreferredBatchSize(teachingSetup.liveClassSetup.preferredBatchSize);
    setSlots(teachingSetup.availability.slots || {});
    setDemoVideoLink(teachingSetup.profilePhilosophy.demoVideoLink || '');
    setGithub(teachingSetup.profilePhilosophy.github || '');
    setLinkedin(teachingSetup.profilePhilosophy.linkedin || '');
    setYoutube(teachingSetup.profilePhilosophy.youtube || '');
    setBehance(teachingSetup.profilePhilosophy.behance || '');
  }, [teachingSetup]);

  const toggleSlot = (day: string, slot: string) => {
    setSlots(prev => {
      const daySlots = prev[day] || [];
      const updated = daySlots.includes(slot)
        ? daySlots.filter(s => s !== slot)
        : [...daySlots, slot];
      return { ...prev, [day]: updated };
    });
  };

  const handleNextSubStep = () => {
    if (subStep === 1) {
      if (!demoVideoLink.trim()) {
        toast.warning('Please enter a YouTube intro video link.');
        return;
      }
      setSubStep(2);
    }
  };

  const handleSaveAndProceed = (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.keys(slots).length === 0 || Object.values(slots).every(s => s.length === 0)) {
      toast.warning('Please select at least one availability slot.');
      return;
    }

    setState((prev: OnboardingState) => ({
      ...prev,
      teachingSetup: {
        ...prev.teachingSetup,
        teachingMode,
        hourlyRate,
        sessionDuration,
        freeDemo,
        preferredLanguage,
        profilePhilosophy: {
          ...prev.teachingSetup.profilePhilosophy,
          demoVideoLink,
          github,
          linkedin,
          youtube,
          behance,
          optionalDoc: resumeName || '',
        },
        availability: {
          timezone,
          maxHoursPerDay,
          slots,
        },
        liveClassSetup: {
          ...prev.teachingSetup.liveClassSetup,
          preferredBatchSize,
        },
      },
      currentStep: prev.currentStep + 1
    }));
    toast.success('Teaching setup saved successfully ✓');
  };

  // Helper for YouTube ID extraction
  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const ytId = getYouTubeId(demoVideoLink);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start max-w-[1200px] mx-auto">
      
      {/* FORM CARD */}
      <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.03)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] p-6 md:p-10 transition-all duration-300">
        
        {/* Step Header */}
        <div className="mb-8 border-b border-slate-100 dark:border-slate-800/50 pb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-8 h-8 text-blue-600" />
              {subStep === 1 ? "Creator Portfolio" : "Availability & Pricing"}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              {subStep === 1 
                ? "Connect your online channels and upload your professional credentials."
                : "Set your hourly rate, cancellation policies, and weekly working slots."
              }
            </p>
          </div>
          <span className="text-xs font-bold bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-full">
            Step {subStep} of 2
          </span>
        </div>

        {/* ─── SUB STEP 1: PORTFOLIO ─── */}
        {subStep === 1 && (
          <form onSubmit={e => { e.preventDefault(); handleNextSubStep(); }} className="space-y-6">
            
            {/* YouTube Intro */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                YouTube Intro Video Link
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Video className="w-4 h-4 text-slate-450" />
                </div>
                <input
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                  value={demoVideoLink}
                  onChange={e => setDemoVideoLink(e.target.value)}
                  className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 text-slate-900 dark:text-slate-100 placeholder-slate-450"
                  required
                />
              </div>

              {/* YouTube Thumbnail Preview */}
              {ytId && (
                <div className="mt-3 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 max-w-sm">
                  <img 
                    src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`} 
                    alt="YouTube Video Thumbnail" 
                    className="w-full h-44 object-cover" 
                  />
                  <div className="bg-slate-50 dark:bg-slate-950 p-2.5 text-center text-xs text-slate-500 font-bold border-t dark:border-t-slate-800">
                    Video preview loaded successfully ✓
                  </div>
                </div>
              )}
            </div>

            {/* Social channels */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  LinkedIn Profile
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <FaLinkedin className="w-4 h-4 text-slate-450" />
                  </div>
                  <input
                    type="url"
                    placeholder="https://linkedin.com/in/username"
                    value={linkedin}
                    onChange={e => setLinkedin(e.target.value)}
                    className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 text-slate-900 dark:text-slate-100 placeholder-slate-450"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  GitHub Profile
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <FaGithub className="w-4 h-4 text-slate-450" />
                  </div>
                  <input
                    type="url"
                    placeholder="https://github.com/username"
                    value={github}
                    onChange={e => setGithub(e.target.value)}
                    className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 text-slate-900 dark:text-slate-100 placeholder-slate-450"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Portfolio / Personal Website
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Globe className="w-4 h-4 text-slate-450" />
                  </div>
                  <input
                    type="url"
                    placeholder="https://mywebsite.com"
                    value={behance}
                    onChange={e => setBehance(e.target.value)}
                    className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 text-slate-900 dark:text-slate-100 placeholder-slate-450"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Instagram (Optional)
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <LinkIcon className="w-4 h-4 text-slate-450" />
                  </div>
                  <input
                    type="url"
                    placeholder="https://instagram.com/username"
                    value={youtube}
                    onChange={e => setYoutube(e.target.value)}
                    className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 text-slate-900 dark:text-slate-100 placeholder-slate-450"
                  />
                </div>
              </div>
            </div>

            {/* Resume Upload Drag and Drop card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Upload Resume / CV</label>
                <div
                  onClick={() => {
                    setResumeName('tutor_resume_standard.pdf');
                    toast.success('Resume attached ✓');
                  }}
                  className="border border-dashed border-slate-200 dark:border-slate-800 hover:border-blue-500/50 rounded-2xl p-6 text-center cursor-pointer transition-all bg-slate-50/20 dark:bg-slate-950/10"
                >
                  {resumeName ? (
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">{resumeName}</span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-450 font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Ready</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1.5">
                      <Upload className="w-5 h-5 text-blue-500" />
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-350">Upload Resume PDF</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Upload Portfolio PDF</label>
                <div
                  onClick={() => {
                    setPortfolioName('tutor_portfolio_projects.pdf');
                    toast.success('Portfolio attached ✓');
                  }}
                  className="border border-dashed border-slate-200 dark:border-slate-800 hover:border-blue-500/50 rounded-2xl p-6 text-center cursor-pointer transition-all bg-slate-50/20 dark:bg-slate-950/10"
                >
                  {portfolioName ? (
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">{portfolioName}</span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-450 font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Ready</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1.5">
                      <Upload className="w-5 h-5 text-blue-500" />
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-350">Upload Portfolio PDF</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={goBack}
                className="px-6 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-350 font-bold rounded-xl transition hover:bg-slate-50"
              >
                Back
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-md animate-pulse-subtle"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* ─── SUB STEP 2: AVAILABILITY & PRICING ─── */}
        {subStep === 2 && (
          <form onSubmit={handleSaveAndProceed} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* LEFT COLUMN: AVAILABILITY */}
              <div className="space-y-6">
                <h3 className="font-extrabold text-base text-slate-800 dark:text-slate-200 border-b pb-2 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" /> Availability
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Teaching Mode</label>
                    <select
                      value={teachingMode}
                      onChange={e => setTeachingMode(e.target.value as any)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50"
                    >
                      <option value="Online">Online</option>
                      <option value="Offline">Offline</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Timezone</label>
                    <select
                      value={timezone}
                      onChange={e => setTimezone(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50 text-ellipsis overflow-hidden"
                    >
                      <option value="IST (UTC+5:30)">India (IST)</option>
                      <option value="EST (UTC-5:00)">Eastern (EST)</option>
                      <option value="GMT (UTC+0:00)">London (GMT)</option>
                      <option value="PST (UTC-8:00)">Pacific (PST)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Max Hours / Day</label>
                    <input
                      type="range"
                      min={1}
                      max={12}
                      value={maxHoursPerDay}
                      onChange={e => setMaxHoursPerDay(parseInt(e.target.value) || 4)}
                      className="w-full accent-blue-600 mt-2"
                    />
                    <span className="text-[10px] text-slate-450 font-bold block mt-1">{maxHoursPerDay} hours maximum</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Max Students / Batch</label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={preferredBatchSize}
                      onChange={e => setPreferredBatchSize(parseInt(e.target.value) || 25)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50"
                    />
                  </div>
                </div>

                {/* Slots grid */}
                <div className="space-y-3">
                  <span className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Weekly Slots</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                    {DAYS_OF_WEEK.map(day => {
                      const daySlots = slots[day] || [];
                      return (
                        <div key={day} className="p-3 border dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/20">
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">{day}</span>
                          <div className="grid grid-cols-2 gap-1.5">
                            {TIME_SLOTS.map(slot => {
                              const isSelected = daySlots.includes(slot);
                              const shortSlot = slot.split(' (')[1].replace(')', '');
                              return (
                                <button
                                  key={slot}
                                  type="button"
                                  onClick={() => toggleSlot(day, slot)}
                                  className={`py-1 px-1.5 text-[10px] font-bold rounded-lg text-center transition-all ${
                                    isSelected
                                      ? 'bg-blue-600 text-white'
                                      : 'bg-white dark:bg-slate-900 border dark:border-slate-800 text-slate-500 hover:bg-slate-50'
                                  }`}
                                >
                                  {shortSlot}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: PRICING & LIVE CALCULATOR */}
              <div className="space-y-6 bg-slate-50/50 dark:bg-slate-950/10 border border-slate-200/50 dark:border-slate-850 p-5 rounded-2xl">
                <h3 className="font-extrabold text-base text-slate-800 dark:text-slate-200 border-b pb-2 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-blue-600" /> Pricing
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 font-semibold">Hourly Rate (USD)</label>
                    <div className="relative rounded-lg shadow-sm">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5">
                        <span className="text-slate-500 text-xs">$</span>
                      </div>
                      <input
                        type="number"
                        min={5}
                        max={300}
                        value={hourlyRate}
                        onChange={e => setHourlyRate(parseInt(e.target.value) || 30)}
                        className="w-full pl-6 pr-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50 text-slate-900 dark:text-slate-100"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 font-semibold">Course Price (USD)</label>
                    <div className="relative rounded-lg shadow-sm">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5">
                        <span className="text-slate-500 text-xs">$</span>
                      </div>
                      <input
                        type="number"
                        value={coursePrice}
                        onChange={e => setCoursePrice(parseInt(e.target.value) || 0)}
                        className="w-full pl-6 pr-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Monthly Sub (USD)</label>
                    <div className="relative rounded-lg shadow-sm">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5">
                        <span className="text-slate-500 text-xs">$</span>
                      </div>
                      <input
                        type="number"
                        value={subscriptionPrice}
                        onChange={e => setSubscriptionPrice(parseInt(e.target.value) || 0)}
                        className="w-full pl-6 pr-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Group Price (USD)</label>
                    <div className="relative rounded-lg shadow-sm">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5">
                        <span className="text-slate-500 text-xs">$</span>
                      </div>
                      <input
                        type="number"
                        value={groupClassPrice}
                        onChange={e => setGroupClassPrice(parseInt(e.target.value) || 0)}
                        className="w-full pl-6 pr-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Discount (%)</label>
                    <input
                      type="number"
                      value={discountPercent}
                      onChange={e => setDiscountPercent(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Cancellation Policy</label>
                    <select
                      value={cancellationPolicy}
                      onChange={e => setCancellationPolicy(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50"
                    >
                      <option>Flexible</option>
                      <option>Medium</option>
                      <option>Strict</option>
                    </select>
                  </div>
                </div>

                {/* Dynamic Live Earnings Calculator */}
                <div className="mt-6 p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-150/40 space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-450 block">Live Earnings Calculator</span>
                  
                  <div className="flex items-center justify-between text-xs text-slate-650 dark:text-slate-400">
                    <span>Hourly Rate</span>
                    <span className="font-semibold text-slate-850 dark:text-slate-200">${hourlyRate}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-650 dark:text-slate-400">
                    <span>Platform Fee (20%)</span>
                    <span className="font-semibold text-red-500">-${(hourlyRate * 0.20).toFixed(1)}</span>
                  </div>

                  <div className="border-t dark:border-t-slate-800 pt-2 flex items-center justify-between text-sm">
                    <span className="font-bold text-slate-800 dark:text-slate-250">Your Take-Home</span>
                    <span className="font-extrabold text-blue-600 dark:text-blue-450">${(hourlyRate * 0.80).toFixed(1)}/hr</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSubStep(1)}
                className="px-6 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-350 font-bold rounded-xl transition hover:bg-slate-50 flex items-center gap-1.5"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <button
                type="submit"
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-500/20 hover:scale-[1.02] transition-all duration-200"
              >
                Save & Proceed
              </button>
            </div>
          </form>
        )}
      </div>

      {/* RIGHT SIDE: Guidance Panel */}
      <div className="lg:sticky lg:top-24 space-y-6">
        <div className="bg-blue-50/50 dark:bg-blue-950/15 border border-blue-100/60 dark:border-blue-900/30 rounded-3xl p-6 space-y-4">
          <h4 className="font-bold text-sm text-blue-800 dark:text-blue-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Instructor Guidance
          </h4>
          <ul className="text-xs space-y-3 text-slate-600 dark:text-slate-400 leading-relaxed list-disc pl-4">
            {subStep === 1 ? (
              <>
                <li>
                  Tutors with high-quality <strong>intro videos</strong> receive up to 3x more students.
                </li>
                <li>
                  Briefly explain your teaching format and showcase your setup in the video.
                </li>
              </>
            ) : (
              <>
                <li>
                  Recommended pricing range based on category average: <strong>$30 - $50/hr</strong>.
                </li>
                <li>
                  Students look for active slots between <strong>6 PM and 9 PM</strong> local time timezone.
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
