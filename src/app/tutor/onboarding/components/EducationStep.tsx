"use client";
import React, { useState } from 'react';
import { useOnboarding, OnboardingState } from '@/context/OnboardingContext';
import { GraduationCap, Plus, Trash2, ChevronDown, ChevronUp, Upload, CheckCircle2, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface EducationItem {
  id: string;
  degree: string;
  college: string;
  passingYear: string;
  certificateName?: string;
  certificateProgress?: number;
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
      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
        {label}
      </label>
      
      {fileName ? (
        <div className="p-4 border border-slate-800 rounded-xl bg-slate-950/40 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-emerald-500 font-bold text-sm">✓</span>
            <span className="text-xs font-semibold text-slate-300 max-w-[200px] truncate">{fileName}</span>
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
              ? 'border-blue-500 bg-blue-950/20' 
              : 'border-slate-800 bg-slate-950/10 hover:border-blue-500/50'
          }`}
        >
          <div className="flex flex-col items-center gap-1.5 text-slate-500">
            <Upload className="w-5 h-5 text-blue-500" />
            <span className="text-xs font-semibold text-slate-350">
              Drag & Drop file or <span className="text-blue-500 hover:underline">browse</span>
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

export default function EducationStep() {
  const { state, setState, goBack } = useOnboarding();
  const { professionalDetails } = state;
  const [educationList, setEducationList] = useState<EducationItem[]>(professionalDetails.educationList || []);
  const [collapsedCards, setCollapsedCards] = useState<string[]>([]);

  React.useEffect(() => {
    setEducationList(professionalDetails.educationList || []);
  }, [professionalDetails]);

  const addEducation = () => {
    const newId = `edu-${Date.now()}`;
    setEducationList(prev => [...prev, { id: newId, degree: '', college: '', passingYear: '' }]);
  };

  const removeEducation = (id: string) => {
    setEducationList(prev => prev.filter(e => e.id !== id));
  };

  const updateEducation = (id: string, field: keyof EducationItem, value: any) => {
    setEducationList(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const toggleCollapse = (id: string) => {
    setCollapsedCards(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const simulateCertUpload = (id: string, fileName: string) => {
    updateEducation(id, 'certificateName', fileName);
    updateEducation(id, 'certificateProgress', 0);
    let p = 0;
    const interval = setInterval(() => {
      p += 25;
      updateEducation(id, 'certificateProgress', p);
      if (p >= 100) {
        clearInterval(interval);
        toast.success(`Uploaded ${fileName} ✓`);
      }
    }, 150);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (educationList.length === 0) {
      toast.warning('Please add at least one education record.');
      return;
    }
    if (educationList.some(ed => !ed.degree.trim() || !ed.college.trim() || !ed.passingYear.trim())) {
      toast.warning('Please complete all education fields.');
      return;
    }

    setState((prev: OnboardingState) => ({
      ...prev,
      professionalDetails: {
        ...prev.professionalDetails,
        educationList
      },
      currentStep: prev.currentStep + 1
    }));
    toast.success('Education credentials saved ✓');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start max-w-[1200px] mx-auto">
      {/* FORM CARD */}
      <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-10 shadow-xl">
        <div className="mb-8 border-b border-slate-800 pb-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <GraduationCap className="w-8 h-8 text-blue-500" />
            Education & Credentials
          </h1>
          <p className="text-sm text-slate-450 mt-2">
            Highlight your academic qualifications and upload diplomas/certificates.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {educationList.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-slate-800 rounded-2xl bg-slate-950/20 flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-500">
                <GraduationCap className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="font-extrabold text-base text-slate-300">No Education Records Added</h4>
                <p className="text-xs text-slate-500">Add your degrees and diploma certifications below.</p>
              </div>
              <button
                type="button"
                onClick={addEducation}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-750 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition shadow-md"
              >
                <Plus className="w-4 h-4" /> Add Education Record
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {educationList.map((ed, idx) => {
                const isCollapsed = collapsedCards.includes(ed.id);
                return (
                  <div 
                    key={ed.id} 
                    className="relative p-5 border border-slate-800 rounded-2xl bg-slate-950/10 space-y-4 transition shadow-sm"
                  >
                    {/* Controls */}
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleCollapse(ed.id)}
                        className="p-1 rounded text-slate-500 hover:text-blue-500 hover:bg-slate-800 transition"
                      >
                        {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeEducation(ed.id)}
                        className="p-1 rounded text-slate-500 hover:text-red-500 hover:bg-slate-800 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs uppercase tracking-wider text-slate-500">
                        Record #{idx + 1}
                      </span>
                      {isCollapsed && (
                        <span className="text-xs text-slate-300 font-bold truncate max-w-[200px] md:max-w-md">
                          {ed.degree ? `${ed.degree} — ${ed.college || 'N/A'}` : '(Empty record)'}
                        </span>
                      )}
                    </div>

                    {!isCollapsed && (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Degree / Diploma</label>
                            <input
                              type="text"
                              placeholder="e.g. BSc Computer Science"
                              value={ed.degree}
                              onChange={e => updateEducation(ed.id, 'degree', e.target.value)}
                              className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-800 bg-slate-950/30 text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">College / University</label>
                            <input
                              type="text"
                              placeholder="e.g. Stanford University"
                              value={ed.college}
                              onChange={e => updateEducation(ed.id, 'college', e.target.value)}
                              className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-800 bg-slate-950/30 text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Passing Year</label>
                            <input
                              type="text"
                              placeholder="e.g. 2022"
                              value={ed.passingYear}
                              onChange={e => updateEducation(ed.id, 'passingYear', e.target.value)}
                              className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-800 bg-slate-950/30 text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                              required
                            />
                          </div>
                        </div>

                        <DragDropUploadZone
                          label="Certificate File Upload"
                          fileName={ed.certificateName || null}
                          progress={ed.certificateProgress}
                          onUpload={(name) => simulateCertUpload(ed.id, name)}
                          onRemove={() => {
                            updateEducation(ed.id, 'certificateName', undefined);
                            updateEducation(ed.id, 'certificateProgress', undefined);
                          }}
                        />
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {educationList.length > 0 && (
            <button
              type="button"
              onClick={addEducation}
              className="w-full py-3.5 border border-dashed border-slate-800 text-blue-500 hover:text-blue-400 font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-950/10 transition"
            >
              <Plus className="w-4 h-4" /> Add Another Education Record
            </button>
          )}

          {/* Action buttons */}
          <div className="flex justify-between pt-6 border-t border-slate-800">
            <button
              type="button"
              onClick={goBack}
              className="px-6 py-2.5 border border-slate-800 text-slate-400 hover:bg-slate-800/50 font-bold rounded-xl transition"
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
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <h4 className="font-bold text-sm text-blue-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Verification Checklist
          </h4>
          <ul className="text-xs space-y-3 text-slate-400 leading-relaxed list-disc pl-4">
            <li>
              Attach diploma certificates for rapid registration approval.
            </li>
            <li>
              Clear digital formats like PDF, PNG, and DOC are preferred.
            </li>
            <li>
              Check that all name details exactly match your profile passport details.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
