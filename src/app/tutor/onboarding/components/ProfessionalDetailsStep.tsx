"use client";
import React, { useState } from 'react';
import { useOnboarding, OnboardingState } from '@/context/OnboardingContext';
import { teachingCategories } from '@/mock/data/categories';
import { skillSuggestions } from '@/mock/data/skills';
import { languageOptions } from '@/mock/data/languages';

interface EducationItem {
  id: string;
  degree: string;
  college: string;
  passingYear: string;
}

interface SkillItem {
  skill: string;
  level: string;
}

export default function ProfessionalDetailsStep() {
  const { state, setState, goNext, goBack } = useOnboarding();
  const { professionalDetails } = state;

  // Local UI state mirrors context state for edits
  const [selectedCategories, setSelectedCategories] = useState<string[]>(professionalDetails.selectedCategories);
  const [skillProficiencies, setSkillProficiencies] = useState<SkillItem[]>(professionalDetails.skillProficiencies);
  const [languages, setLanguages] = useState<string[]>(professionalDetails.languages);
  const [educationList, setEducationList] = useState<EducationItem[]>(professionalDetails.educationList);
  const [teachingExpYears, setTeachingExpYears] = useState(professionalDetails.teachingExpYears);
  const [achievements, setAchievements] = useState(professionalDetails.achievements);

  // Handlers
  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev: string[]) =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const addSkill = (skill: string, level: string) => {
    if (!skill) return;
    setSkillProficiencies((prev: SkillItem[]) => [...prev, { skill, level }]);
  };

  const removeSkill = (index: number) => {
    setSkillProficiencies((prev: SkillItem[]) => prev.filter((_, i) => i !== index));
  };

  const addEducation = () => {
    setEducationList((prev: EducationItem[]) => [
      ...prev,
      { id: `edu-${Date.now()}`, degree: '', college: '', passingYear: '' }
    ]);
  };

  const updateEducation = (id: string, field: keyof EducationItem, value: string) => {
    setEducationList((prev: EducationItem[]) =>
      prev.map((ed: EducationItem) => (ed.id === id ? { ...ed, [field]: value } : ed))
    );
  };

  const removeEducation = (id: string) => {
    setEducationList((prev: EducationItem[]) => prev.filter((ed: EducationItem) => ed.id !== id));
  };

  const handleSaveAndProceed = (e: React.FormEvent) => {
    e.preventDefault();
    // Persist to context
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
    }));
    goNext();
  };

  // UI for adding a new skill
  const [newSkill, setNewSkill] = useState('');
  const [newLevel, setNewLevel] = useState('Beginner');

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Professional Details</h2>
      <form onSubmit={handleSaveAndProceed} className="space-y-6">
        {/* Teaching Categories */}
        <section>
          <h3 className="text-lg font-medium mb-2 text-gray-800 dark:text-gray-200">Teaching Categories</h3>
          <div className="flex flex-wrap gap-2">
            {teachingCategories.map(cat => (
              <label key={cat} className="inline-flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox h-4 w-4 text-blue-600"
                  checked={selectedCategories.includes(cat)}
                  onChange={() => toggleCategory(cat)}
                />
                <span className="ml-2 text-gray-700 dark:text-gray-300">{cat}</span>
              </label>
            ))}
          </div>
        </section>

        {/* Skills */}
        <section>
          <h3 className="text-lg font-medium mb-2 text-gray-800 dark:text-gray-200">Skills</h3>
          <div className="flex flex-col gap-2">
            {skillProficiencies.map((s, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <span className="flex-1 bg-gray-100 dark:bg-gray-700 rounded px-2 py-1 text-sm">{s.skill} ({s.level})</span>
                <button type="button" onClick={() => removeSkill(idx)} className="text-red-600 hover:underline">Remove</button>
              </div>
            ))}
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Skill"
                list="skill-suggestions"
                value={newSkill}
                onChange={e => setNewSkill(e.target.value)}
                className="flex-1 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
              />
              <datalist id="skill-suggestions">
                {skillSuggestions.map(s => (<option key={s} value={s} />))}
              </datalist>
              <select
                value={newLevel}
                onChange={e => setNewLevel(e.target.value)}
                className="rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
              >
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
                <option>Expert</option>
              </select>
              <button type="button" onClick={() => { addSkill(newSkill, newLevel); setNewSkill(''); setNewLevel('Beginner'); }}
                className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700">
                Add
              </button>
            </div>
          </div>
        </section>

        {/* Languages */}
        <section>
          <h3 className="text-lg font-medium mb-2 text-gray-800 dark:text-gray-200">Languages</h3>
          <select
            multiple
            value={languages}
            onChange={e => {
              const options = Array.from(e.target.selectedOptions).map(o => o.value);
              setLanguages(options);
            }}
            className="w-full rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 p-2"
          >
            {languageOptions.map((l: string) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </section>

        {/* Education */}
        <section>
          <h3 className="text-lg font-medium mb-2 text-gray-800 dark:text-gray-200">Education</h3>
          <div className="space-y-2">
            {educationList.map((ed: EducationItem) => (
              <div key={ed.id} className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
                <input
                  type="text"
                  placeholder="Degree"
                  value={ed.degree}
                  onChange={e => updateEducation(ed.id, 'degree', e.target.value)}
                  className="rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 p-1"
                />
                <input
                  type="text"
                  placeholder="College"
                  value={ed.college}
                  onChange={e => updateEducation(ed.id, 'college', e.target.value)}
                  className="rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 p-1"
                />
                <input
                  type="text"
                  placeholder="Passing Year"
                  value={ed.passingYear}
                  onChange={e => updateEducation(ed.id, 'passingYear', e.target.value)}
                  className="rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 p-1"
                />
                <button type="button" onClick={() => removeEducation(ed.id)} className="col-span-3 md:col-span-1 text-red-600 hover:underline mt-1 md:mt-0">
                  Remove
                </button>
              </div>
            ))}
            <button type="button" onClick={addEducation} className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 mt-2">
              Add Education
            </button>
          </div>
        </section>

        {/* Experience */}
        <section>
          <h3 className="text-lg font-medium mb-2 text-gray-800 dark:text-gray-200">Experience</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Teaching Experience (Years)</label>
              <input
                type="text"
                value={teachingExpYears}
                onChange={e => setTeachingExpYears(e.target.value)}
                className="mt-1 block w-full rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 p-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Key Achievements</label>
              <textarea
                rows={3}
                value={achievements}
                onChange={e => setAchievements(e.target.value)}
                className="mt-1 block w-full rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 p-1"
              />
            </div>
          </div>
        </section>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6">
          <button type="button" onClick={goBack} className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500">
            Back
          </button>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Next
          </button>
        </div>
      </form>
    </div>
  );
}
