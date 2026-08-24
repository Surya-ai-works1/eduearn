"use client";
import React, { useState } from 'react';
import { useOnboarding, OnboardingState } from '@/context/OnboardingContext';
import { Briefcase, Upload, CheckCircle2, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import { languageOptions } from '@/mock/data/languages';
import { toast } from 'sonner';

// Custom Searchable Multi-Select for Languages
function SearchableMultiSelect({
  label,
  selected,
  onChange,
  options,
  placeholder
}: {
  label: string;
  selected: string[];
  onChange: (val: string[]) => void;
  options: string[];
  placeholder: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = options.filter(opt =>
    opt.toLowerCase().includes(search.toLowerCase()) && !selected.includes(opt)
  );

  const toggleOption = (opt: string) => {
    if (selected.includes(opt)) {
      onChange(selected.filter(x => x !== opt));
    } else {
      onChange([...selected, opt]);
    }
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
        {label}
      </label>
      
      {/* Selected Chips */}
      <div className="flex flex-wrap gap-1.5 mb-2.5">
        {selected.length === 0 ? (
          <span className="text-xs text-slate-500 italic">No languages selected yet.</span>
        ) : (
          selected.map(opt => (
            <span
              key={opt}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-bold border border-blue-200 dark:border-blue-800"
            >
              {opt}
              <button
                type="button"
                onClick={() => toggleOption(opt)}
                className="text-blue-500 hover:text-red-500 text-xs font-extrabold"
              >
                ×
              </button>
            </span>
          ))
        )}
      </div>

      <button
        type="button"
        onClick={() => { setIsOpen(!isOpen); setSearch(''); }}
        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 text-left text-slate-700 dark:text-slate-300 flex items-center justify-between focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition text-sm"
      >
        <span className="text-slate-400 dark:text-slate-500">Add languages...</span>
        <span className="text-slate-400 text-xs">▼</span>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1.5 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg max-h-60 overflow-y-auto">
          <div className="p-2 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 sticky top-0 z-10">
            <input
              type="text"
              placeholder="Search languages..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="py-1">
            {filtered.length === 0 ? (
              <div className="px-4 py-2 text-xs text-slate-400 text-center">No languages found</div>
            ) : (
              filtered.map(opt => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    toggleOption(opt);
                    setSearch('');
                  }}
                  className="w-full px-4 py-2 text-left text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  + {opt}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Premium Drag and Drop Upload Component
function DragDropUploadZone({
  label,
  fileName,
  progress,
  onUpload,
  onRemove
}: {
  label: string;
  fileName: string | null;
  progress: number | undefined;
  onUpload: (name: string) => void;
  onRemove: () => void;
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      onUpload(files[0].name);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onUpload(files[0].name);
    }
  };

  return (
    <div className="space-y-1.5 w-full">
      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {label}
      </label>
      
      {fileName ? (
        <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950/40 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-emerald-500 font-bold text-sm">✓</span>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 max-w-[200px] truncate">{fileName}</span>
            {progress !== undefined && progress < 100 && (
              <span className="text-[10px] text-slate-500">({progress}%)</span>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="text-[10px] font-bold text-blue-500 hover:underline uppercase tracking-wider"
            >
              Replace File
            </button>
            <button
              type="button"
              onClick={onRemove}
              className="text-[10px] font-bold text-red-500 hover:underline uppercase tracking-wider"
            >
              Remove
            </button>
          </div>
          <input
            type="file"
            ref={inputRef}
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all duration-200 ${
            isDragOver 
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' 
              : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/10 hover:border-blue-500/50'
          }`}
        >
          <div className="flex flex-col items-center gap-1.5 text-slate-500">
            <Upload className="w-5 h-5 text-blue-600 dark:text-blue-500" />
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Drag &amp; Drop file or <span className="text-blue-600 dark:text-blue-500 hover:underline">browse</span>
            </span>
            <span className="text-[10px] text-slate-500">Supports: PDF, Image, DOC</span>
          </div>
          <input
            type="file"
            ref={inputRef}
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
}

export default function ExperienceStep() {
  const { state, setState, goBack } = useOnboarding();
  const { professionalDetails } = state;

  const [teachingExpYears, setTeachingExpYears] = useState(professionalDetails.teachingExpYears || '');
  const [achievements, setAchievements] = useState(professionalDetails.achievements || '');
  const [languages, setLanguages] = useState<string[]>(professionalDetails.languages || []);
  const [experienceDocName, setExperienceDocName] = useState<string | null>(professionalDetails.experienceDocName || null);
  const [experienceDocProgress, setExperienceDocProgress] = useState<number | undefined>(professionalDetails.experienceDocProgress || undefined);

  React.useEffect(() => {
    setTeachingExpYears(professionalDetails.teachingExpYears || '');
    setAchievements(professionalDetails.achievements || '');
    setLanguages(professionalDetails.languages || []);
    setExperienceDocName(professionalDetails.experienceDocName || null);
    setExperienceDocProgress(professionalDetails.experienceDocProgress || undefined);
  }, [professionalDetails]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teachingExpYears.trim()) {
      toast.warning('Please enter your teaching experience.');
      return;
    }
    if (languages.length === 0) {
      toast.warning('Please select at least one language.');
      return;
    }

    const payload = {
      teachingExpYears,
      achievements,
      languages,
      experienceDocName: experienceDocName || undefined,
      experienceDocProgress: experienceDocProgress || undefined
    };

    try {
      const res = await fetch('/api/tutor/submit-step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stepName: 'teaching_experience',
          data: payload
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save experience draft");
      }

      setState((prev: OnboardingState) => ({
        ...prev,
        professionalDetails: {
          ...prev.professionalDetails,
          ...payload
        },
        currentStep: prev.currentStep + 1
      }));
      toast.success('Experience details saved ✓');
    } catch (err: any) {
      toast.error(err.message || "Failed to save experience draft.");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start max-w-[1200px] mx-auto">
      {/* FORM CARD */}
      <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.03)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] p-6 md:p-10 transition-all duration-300">
        <div className="mb-8 border-b border-slate-100 dark:border-slate-800 pb-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Briefcase className="w-8 h-8 text-blue-600" />
            Experience & Mentoring
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Outline your peer tutoring or academic mentoring accomplishments and spoken languages.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Mentoring Experience (Years)</label>
              <input
                type="number"
                min={0}
                value={teachingExpYears}
                onChange={e => setTeachingExpYears(e.target.value)}
                placeholder="e.g. 1"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition text-sm"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Key Accomplishments</label>
              <textarea
                rows={2}
                value={achievements}
                onChange={e => setAchievements(e.target.value)}
                placeholder="e.g., Led peer study groups in Calculus, active coding club member, hackathon participant, mentored Class 10 students."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition text-sm"
              />
            </div>
          </div>

          <DragDropUploadZone
            label="Activity Proof / Recommendation Letter (Optional)"
            fileName={experienceDocName}
            progress={experienceDocProgress}
            onUpload={(name) => {
              setExperienceDocName(name);
              setExperienceDocProgress(0);
              let p = 0;
              const interval = setInterval(() => {
                p += 25;
                setExperienceDocProgress(p);
                if (p >= 100) {
                  clearInterval(interval);
                  toast.success('Experience letter attached ✓');
                }
              }, 150);
            }}
            onRemove={() => {
              setExperienceDocName(null);
              setExperienceDocProgress(undefined);
            }}
          />

          <SearchableMultiSelect
            label="Spoken Languages"
            selected={languages}
            onChange={setLanguages}
            options={languageOptions}
            placeholder="Select languages..."
          />

          {/* Action buttons */}
          <div className="flex justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={goBack}
              className="px-6 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 font-bold rounded-xl transition"
            >
              Back
            </button>
            <button
              type="submit"
              className="px-8 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg transition"
            >
              Save & Proceed
            </button>
          </div>
        </form>
      </div>

      {/* RIGHT SIDEBAR */}
      <div className="lg:sticky lg:top-24 space-y-6">
        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100/80 dark:border-slate-800 rounded-3xl p-6 space-y-4">
          <h4 className="font-bold text-sm text-blue-700 dark:text-blue-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Student Tutor Guidance
          </h4>
          <ul className="text-xs space-y-3 text-slate-600 dark:text-slate-400 leading-relaxed list-disc pl-4">
            <li>
              Outline your student tutoring, mentoring, or school/college project leadership accomplishments.
            </li>
            <li>
              Optional: Attach recommendation letters, club participation certificates, or volunteer proofs.
            </li>
            <li>
              Pick multiple languages to connect with student peers across diverse regions in India.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
