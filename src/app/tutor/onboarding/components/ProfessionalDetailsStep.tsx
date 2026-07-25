"use client";
import React, { useState } from 'react';
import { useOnboarding, OnboardingState } from '@/context/OnboardingContext';
import { teachingCategories } from '@/mock/data/categories';
import { skillSuggestions } from '@/mock/data/skills';
import { languageOptions } from '@/mock/data/languages';
import { 
  GraduationCap, Calendar, Award, BookOpen, Sparkles, Plus, Trash2, 
  ChevronRight, ChevronLeft, Search, Code, Palette, Music, 
  Activity, Camera, Brain, Video, MessageSquare, Briefcase, 
  TrendingUp, LineChart, Heart, Coffee, Upload, CheckCircle2,
  ChevronDown, ChevronUp, AlertCircle, FileText
} from 'lucide-react';
import { toast } from 'sonner';

interface EducationItem {
  id: string;
  degree: string;
  college: string;
  passingYear: string;
  certificateName?: string;
  certificateProgress?: number;
}

interface SkillItem {
  skill: string;
  level: string;
}

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
          <span className="text-xs text-slate-400 italic">No languages selected yet.</span>
        ) : (
          selected.map(opt => (
            <span
              key={opt}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-bold border border-blue-200/50"
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
        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 text-left text-slate-900 dark:text-slate-100 flex items-center justify-between focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200 text-sm"
      >
        <span className="text-slate-450">Add languages...</span>
        <span className="text-slate-400 text-xs">▼</span>
      </button>

      {isOpen && (
        <div className="absolute z-55 mt-1.5 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg max-h-60 overflow-y-auto">
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
                  className="w-full px-4 py-2 text-left text-xs text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
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
  onRemove,
  acceptDocs = "PDF, Image, DOC"
}: {
  label: string;
  fileName: string | null;
  progress: number | undefined;
  onUpload: (name: string) => void;
  onRemove: () => void;
  acceptDocs?: string;
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
        <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/20 dark:bg-slate-950/10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-emerald-600 dark:text-emerald-450 font-bold text-sm">✓</span>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-350 max-w-[200px] truncate">{fileName}</span>
            {progress !== undefined && progress < 100 && (
              <span className="text-[10px] text-slate-400">({progress}%)</span>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="text-[10px] font-bold text-blue-600 hover:underline uppercase tracking-wider transition-colors"
            >
              Replace File
            </button>
            <button
              type="button"
              onClick={onRemove}
              className="text-[10px] font-bold text-red-500 hover:underline uppercase tracking-wider transition-colors"
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
              ? 'border-blue-500 bg-blue-50/10' 
              : 'border-slate-200 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-950/10 hover:border-blue-500/50 dark:hover:border-blue-500/50'
          }`}
        >
          <div className="flex flex-col items-center gap-1.5 text-slate-500">
            <Upload className="w-6 h-6 text-blue-500" />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-350">
              Drag & Drop file or <span className="text-blue-600 hover:underline">browse</span>
            </span>
            <span className="text-[10px] text-slate-400">Supports: {acceptDocs}</span>
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

export default function ProfessionalDetailsStep() {
  const { state, setState, goBack } = useOnboarding();
  const { professionalDetails } = state;

  const [subStep, setSubStep] = useState(1); // 1: Education, 2: Experience, 3: Categories & Skills

  // Local UI state
  const [selectedCategories, setSelectedCategories] = useState<string[]>(professionalDetails.selectedCategories || []);
  const [skillProficiencies, setSkillProficiencies] = useState<SkillItem[]>(professionalDetails.skillProficiencies || []);
  const [languages, setLanguages] = useState<string[]>(professionalDetails.languages || []);
  const [educationList, setEducationList] = useState<EducationItem[]>(professionalDetails.educationList || []);
  const [teachingExpYears, setTeachingExpYears] = useState(professionalDetails.teachingExpYears || '');
  const [achievements, setAchievements] = useState(professionalDetails.achievements || '');

  const [searchCategory, setSearchCategory] = useState('');
  const [newSkill, setNewSkill] = useState('');
  const [newLevel, setNewLevel] = useState('Beginner');
  const [experienceDocName, setExperienceDocName] = useState<string | null>(null);
  const [experienceDocProgress, setExperienceDocProgress] = useState<number | undefined>(undefined);

  const [collapsedCards, setCollapsedCards] = useState<string[]>([]);

  // Sync context
  React.useEffect(() => {
    setSelectedCategories(professionalDetails.selectedCategories || []);
    setSkillProficiencies(professionalDetails.skillProficiencies || []);
    setLanguages(professionalDetails.languages || []);
    setEducationList(professionalDetails.educationList || []);
    setTeachingExpYears(professionalDetails.teachingExpYears || '');
    setAchievements(professionalDetails.achievements || '');
  }, [professionalDetails]);

  // Load skills recommendations immediately on categories change
  React.useEffect(() => {
    if (selectedCategories.length > 0) {
      // Autoload skills recommendations when domain changes
      // E.g. make sure skills recommendations show up
    }
  }, [selectedCategories]);

  // Handlers
  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev: string[]) =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const addSkill = (skill: string, level: string) => {
    if (!skill) return;
    if (skillProficiencies.some(s => s.skill.toLowerCase() === skill.toLowerCase())) {
      toast.warning('Skill already added!');
      return;
    }
    setSkillProficiencies((prev: SkillItem[]) => [...prev, { skill, level }]);
    toast.success('Skill added ✓');
  };

  const removeSkill = (index: number) => {
    setSkillProficiencies((prev: SkillItem[]) => prev.filter((_, i) => i !== index));
  };

  const addEducation = () => {
    const newId = `edu-${Date.now()}`;
    setEducationList((prev: EducationItem[]) => [
      ...prev,
      { id: newId, degree: '', college: '', passingYear: '' }
    ]);
  };

  const updateEducation = (id: string, field: keyof EducationItem, value: any) => {
    setEducationList((prev: EducationItem[]) =>
      prev.map((ed: EducationItem) => (ed.id === id ? { ...ed, [field]: value } : ed))
    );
  };

  const removeEducation = (id: string) => {
    setEducationList((prev: EducationItem[]) => prev.filter((ed: EducationItem) => ed.id !== id));
  };

  const toggleCollapse = (id: string) => {
    setCollapsedCards(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const simulateCertUpload = (id: string, fileName: string) => {
    updateEducation(id, 'certificateName', fileName);
    updateEducation(id, 'certificateProgress', 0);
    
    let prog = 0;
    const interval = setInterval(() => {
      prog += 25;
      updateEducation(id, 'certificateProgress', prog);
      if (prog >= 100) {
        clearInterval(interval);
        toast.success(`Uploaded ${fileName} ✓`);
      }
    }, 150);
  };

  const handleNextSubStep = () => {
    if (subStep === 1) {
      if (educationList.length === 0) {
        toast.warning('Please add at least one education record.');
        return;
      }
      if (educationList.some(e => !e.degree.trim() || !e.college.trim() || !e.passingYear.trim())) {
        toast.warning('Please complete all education fields.');
        return;
      }
      setSubStep(2);
    } else if (subStep === 2) {
      if (!teachingExpYears.trim()) {
        toast.warning('Please enter your teaching experience.');
        return;
      }
      if (languages.length === 0) {
        toast.warning('Please select at least one language.');
        return;
      }
      setSubStep(3);
    }
  };

  const handleSaveAndProceed = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCategories.length === 0) {
      toast.warning('Please select at least one teaching category.');
      return;
    }
    if (skillProficiencies.length === 0) {
      toast.warning('Please add at least one skill.');
      return;
    }

    // Atomic context update: Save and proceed in a single state change tick
    setState((prev: OnboardingState) => ({
      ...prev,
      professionalDetails: {
        selectedCategories,
        skillProficiencies,
        languages,
        educationList,
        teachingExpYears,
        achievements,
      },
      currentStep: prev.currentStep + 1
    }));
    toast.success('Professional details saved successfully ✓');
  };

  // Get icons for categories
  const getCategoryIcon = (cat: string) => {
    const c = cat.toLowerCase();
    if (c.includes('academic') || c.includes('education')) return <BookOpen className="w-5 h-5" />;
    if (c.includes('programming') || c.includes('tech')) return <Code className="w-5 h-5" />;
    if (c.includes('art') || c.includes('design')) return <Palette className="w-5 h-5" />;
    if (c.includes('music')) return <Music className="w-5 h-5" />;
    if (c.includes('dance')) return <Activity className="w-5 h-5" />;
    if (c.includes('photography')) return <Camera className="w-5 h-5" />;
    if (c.includes('ai') || c.includes('data science')) return <Brain className="w-5 h-5" />;
    if (c.includes('video') || c.includes('editing')) return <Video className="w-5 h-5" />;
    if (c.includes('communication') || c.includes('language')) return <MessageSquare className="w-5 h-5" />;
    if (c.includes('business') || c.includes('entrepreneur')) return <Briefcase className="w-5 h-5" />;
    if (c.includes('marketing')) return <TrendingUp className="w-5 h-5" />;
    if (c.includes('finance') || c.includes('investing')) return <LineChart className="w-5 h-5" />;
    if (c.includes('health') || c.includes('fitness')) return <Heart className="w-5 h-5" />;
    return <Coffee className="w-5 h-5" />;
  };

  const filteredCategories = teachingCategories.filter(cat => 
    cat.toLowerCase().includes(searchCategory.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start max-w-[1200px] mx-auto">
      {/* FORM CARD */}
      <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.03)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] p-6 md:p-10 transition-all duration-300">
        
        {/* Step Header */}
        <div className="mb-8 border-b border-slate-100 dark:border-slate-800/50 pb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <GraduationCap className="w-8 h-8 text-blue-600" />
              {subStep === 1 && "Education & Credentials"}
              {subStep === 2 && "Experience & Teaching"}
              {subStep === 3 && "Categories & Skills"}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              {subStep === 1 && "Highlight your academic qualifications and upload diplomas."}
              {subStep === 2 && "Outline your professional teaching experience and accomplishments."}
              {subStep === 3 && "Select your core domains and assign expertise level badges."}
            </p>
          </div>
          <span className="text-xs font-bold bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-full">
            Step {subStep} of 3
          </span>
        </div>

        {/* ─── SUB STEP 1: EDUCATION ─── */}
        {subStep === 1 && (
          <div className="space-y-6">
            <div className="space-y-4">
              {educationList.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-950/20 flex flex-col items-center justify-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-350">No Education Records Added</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-450">Please add your college or university degree records.</p>
                  </div>
                  <button
                    type="button"
                    onClick={addEducation}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-sm mt-1"
                  >
                    <Plus className="w-4 h-4" /> Add Education Record
                  </button>
                </div>
              ) : (
                educationList.map((ed, idx) => {
                  const isCollapsed = collapsedCards.includes(ed.id);
                  return (
                    <div 
                      key={ed.id} 
                      className="relative p-5 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl bg-slate-50/20 dark:bg-slate-950/10 space-y-4 transition-all duration-200 shadow-sm"
                    >
                      {/* Collapse/Expand, Delete Card buttons */}
                      <div className="absolute top-4 right-4 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleCollapse(ed.id)}
                          className="p-1 rounded text-slate-450 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          title={isCollapsed ? "Expand card" : "Collapse card"}
                        >
                          {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => removeEducation(ed.id)}
                          className="p-1 rounded text-slate-450 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          title="Remove record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xs uppercase tracking-wider text-slate-400">
                          Record #{idx + 1}
                        </span>
                        {isCollapsed && (
                          <span className="text-xs text-slate-650 dark:text-slate-350 font-bold truncate max-w-[200px] md:max-w-md">
                            {ed.degree ? `${ed.degree} — ${ed.college || 'N/A'}` : '(Empty record)'}
                          </span>
                        )}
                      </div>

                      {!isCollapsed && (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                            <div>
                              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Degree / Diploma</label>
                              <input
                                type="text"
                                placeholder="BSc Computer Science"
                                value={ed.degree}
                                onChange={e => updateEducation(ed.id, 'degree', e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50 text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">College / University</label>
                              <input
                                type="text"
                                placeholder="Stanford University"
                                value={ed.college}
                                onChange={e => updateEducation(ed.id, 'college', e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50 text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Passing Year</label>
                              <input
                                type="text"
                                placeholder="2022"
                                value={ed.passingYear}
                                onChange={e => updateEducation(ed.id, 'passingYear', e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50 text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                              />
                            </div>
                          </div>

                          {/* Certificate upload - Premium Drag and Drop */}
                          <DragDropUploadZone
                            label="Certificate Upload"
                            fileName={ed.certificateName || null}
                            progress={ed.certificateProgress}
                            onUpload={(fileName) => simulateCertUpload(ed.id, fileName)}
                            onRemove={() => {
                              updateEducation(ed.id, 'certificateName', undefined);
                              updateEducation(ed.id, 'certificateProgress', undefined);
                            }}
                          />
                        </>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {educationList.length > 0 && (
              <button
                type="button"
                onClick={addEducation}
                className="w-full py-3.5 border border-dashed border-slate-300 dark:border-slate-850 text-blue-650 hover:text-blue-700 font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-blue-50/20 dark:hover:bg-slate-950/10 transition"
              >
                <Plus className="w-4 h-4" /> Add Another Education Record
              </button>
            )}

            <div className="flex justify-between pt-6 border-t border-slate-100 dark:border-slate-850">
              <button
                type="button"
                onClick={goBack}
                className="px-6 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-355 font-bold rounded-xl transition hover:bg-slate-50"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleNextSubStep}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-1.5 transition shadow-md"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ─── SUB STEP 2: EXPERIENCE ─── */}
        {subStep === 2 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              <div className="md:col-span-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Teaching Experience (Years)</label>
                <input
                  type="number"
                  min={0}
                  value={teachingExpYears}
                  onChange={e => setTeachingExpYears(e.target.value)}
                  placeholder="3"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Key Accomplishments</label>
                <textarea
                  rows={2}
                  value={achievements}
                  onChange={e => setAchievements(e.target.value)}
                  placeholder="E.g., Co-authored AI research papers, taught over 500+ successful software engineering bootcamp graduates."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Experience Proof - Premium Drag and Drop */}
            <DragDropUploadZone
              label="Teaching Experience Proof"
              fileName={experienceDocName}
              progress={experienceDocProgress}
              onUpload={(fileName) => {
                setExperienceDocName(fileName);
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

            {/* Spoken Languages - Searchable Multi-Select */}
            <SearchableMultiSelect
              label="Spoken Languages"
              selected={languages}
              onChange={setLanguages}
              options={languageOptions}
              placeholder="Select spoken languages..."
            />

            <div className="flex justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSubStep(1)}
                className="px-6 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-350 font-bold rounded-xl transition hover:bg-slate-50 flex items-center gap-1.5"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <button
                type="button"
                onClick={handleNextSubStep}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-1.5 transition shadow-md"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ─── SUB STEP 3: CATEGORIES & SKILLS ─── */}
        {subStep === 3 && (
          <div className="space-y-6">
            
            {/* Category Search & 3-Column Responsive Grid */}
            <div className="space-y-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-450" />
                <input
                  type="text"
                  placeholder="Search teaching categories..."
                  value={searchCategory}
                  onChange={e => setSearchCategory(e.target.value)}
                  className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
                />
              </div>

              {/* Reduced height & Responsive 3-Column Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                {filteredCategories.map(cat => {
                  const isSelected = selectedCategories.includes(cat);
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleCategory(cat)}
                      className={`p-4 rounded-2xl text-left border flex items-center gap-3 transition-all duration-200 hover:scale-[1.01] ${
                        isSelected
                          ? 'bg-blue-600 border-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] ring-2 ring-blue-550 dark:ring-blue-400'
                          : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-900/50'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-blue-50 dark:bg-blue-950/30 text-blue-600'
                      }`}>
                        {getCategoryIcon(cat)}
                      </div>
                      <span className="font-bold text-xs leading-snug">{cat}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Skill tags */}
            {selectedCategories.length > 0 && (
              <div className="space-y-4 border-t border-slate-100 dark:border-slate-800/80 pt-6">
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Dynamic Skill Suggestions</h4>
                  <p className="text-[11px] text-slate-400">Add recommended skill tag proficiencies for your selected categories.</p>
                </div>

                <div className="flex flex-wrap gap-1.5 max-h-[140px] overflow-y-auto pr-1">
                  {skillSuggestions.map(skill => {
                    const hasSkill = skillProficiencies.some(s => s.skill.toLowerCase() === skill.toLowerCase());
                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => addSkill(skill, 'Advanced')}
                        disabled={hasSkill}
                        className={`px-3 py-1.5 text-[11px] font-bold rounded-lg border transition ${
                          hasSkill
                            ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-550 cursor-not-allowed'
                            : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600'
                        }`}
                      >
                        + {skill}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Custom Skill tag form */}
            <div className="p-5 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl bg-slate-50/20 dark:bg-slate-950/10 space-y-4">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">Add Skill Badge</h4>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="Python, Public Speaking, UI Design..."
                  value={newSkill}
                  onChange={e => setNewSkill(e.target.value)}
                  className="flex-1 px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50 text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                
                <select
                  value={newLevel}
                  onChange={e => setNewLevel(e.target.value)}
                  className="px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50 text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                  <option>Expert</option>
                </select>

                <button
                  type="button"
                  onClick={() => {
                    addSkill(newSkill, newLevel);
                    setNewSkill('');
                    setNewLevel('Beginner');
                  }}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition"
                >
                  Add Badge
                </button>
              </div>

              {/* Added Skills chip display */}
              {skillProficiencies.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {skillProficiencies.map((s, idx) => (
                    <span 
                      key={idx} 
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/30 text-blue-700 dark:text-blue-300 font-bold rounded-xl text-xs animate-fade-in"
                    >
                      {s.skill} • {s.level}
                      <button
                        type="button"
                        onClick={() => removeSkill(idx)}
                        className="text-blue-500 hover:text-red-500 transition-colors ml-1 font-bold text-xs"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSubStep(2)}
                className="px-6 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-350 font-bold rounded-xl transition hover:bg-slate-50 flex items-center gap-1.5"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <button
                onClick={handleSaveAndProceed}
                type="button"
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-500/20 hover:scale-[1.02] transition-all duration-200"
              >
                Save & Proceed
              </button>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT SIDE: Helper Guidance Panel */}
      <div className="lg:sticky lg:top-24 space-y-6">
        <div className="bg-blue-50/50 dark:bg-blue-950/15 border border-blue-100/60 dark:border-blue-900/30 rounded-3xl p-6 space-y-4">
          <h4 className="font-bold text-sm text-blue-800 dark:text-blue-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Verification Tips
          </h4>
          <ul className="text-xs space-y-3 text-slate-600 dark:text-slate-400 leading-relaxed list-disc pl-4">
            {subStep === 1 && (
              <>
                <li>
                  <strong>Verified credentials</strong> improve approval speeds by up to 85%.
                </li>
                <li>
                  Upload high-quality PDF, Image or DOC file scans of your highest graduation degree.
                </li>
              </>
            )}
            {subStep === 2 && (
              <>
                <li>
                  Briefly mention key stats in achievements (e.g. &ldquo;98% pass rate&rdquo;).
                </li>
                <li>
                  Attach active teaching proof such as certificates or employment letters.
                </li>
              </>
            )}
            {subStep === 3 && (
              <>
                <li>
                  Select specific domains to gain relevance in search ranking.
                </li>
                <li>
                  Skills matching your certification categories gain priority indexing.
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
