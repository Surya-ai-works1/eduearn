"use client";
import React, { useState } from 'react';
import { useOnboarding, OnboardingState } from '@/context/OnboardingContext';
import { teachingCategories } from '@/mock/data/categories';
import { 
  GraduationCap, Search, Code, Palette, Music, Activity, Camera, Brain, 
  Video, MessageSquare, Briefcase, TrendingUp, LineChart, Heart, Coffee, 
  Sparkles, Check 
} from 'lucide-react';
import { toast } from 'sonner';

interface SkillItem {
  skill: string;
  level: string;
}

const CATEGORY_TO_SKILLS: Record<string, string[]> = {
  "Academic Education": [
    "Mathematics", "Algebra", "Geometry", "Trigonometry", "Calculus", "Statistics",
    "Linear Algebra", "Probability", "Physics", "Chemistry", "Biology", "English Grammar",
    "Essay Writing", "Public Exams", "JEE", "NEET", "UPSC", "SSC", "CBSE", "ICSE"
  ],
  "Technology & Programming": [
    "C", "C++", "Java", "Python", "JavaScript", "TypeScript", "React", "Next.js",
    "Angular", "Vue", "Node.js", "Express", "NestJS", "Spring Boot", "Django", "Flask",
    "FastAPI", "HTML", "CSS", "Tailwind CSS", "Bootstrap", "SQL", "PostgreSQL",
    "MongoDB", "Redis", "Docker", "Kubernetes", "Git", "GitHub", "Linux", "AWS",
    "Azure", "Google Cloud", "REST APIs", "GraphQL", "Firebase", "Supabase"
  ],
  "AI & Data Science": [
    "Prompt Engineering", "ChatGPT", "Claude", "Gemini", "Cursor AI", "GitHub Copilot",
    "LangChain", "LangGraph", "CrewAI", "AutoGen", "RAG", "Vector Databases", "Pinecone",
    "Weaviate", "ChromaDB", "Machine Learning", "Deep Learning", "Computer Vision",
    "NLP", "TensorFlow", "PyTorch", "Scikit-learn", "Pandas", "NumPy", "Matplotlib",
    "Power BI", "Tableau"
  ],
  "Creative Arts & Design": [
    "UI Design", "UX Design", "Figma", "Adobe XD", "Photoshop", "Illustrator", "Canva",
    "Brand Identity", "Graphic Design", "Logo Design", "Typography", "Color Theory",
    "Wireframing", "Prototyping", "Motion Graphics"
  ],
  "Video Editing & Animation": [
    "Premiere Pro", "After Effects", "DaVinci Resolve", "Final Cut Pro", "CapCut",
    "Filmora", "Blender", "Cinema4D", "3D Animation", "Motion Graphics", "Color Grading"
  ],
  "Photography & Media": [
    "Photography", "Portrait Photography", "Product Photography", "Lighting",
    "Photo Editing", "Lightroom", "Photoshop", "Videography"
  ],
  "Music": [
    "Vocal Training", "Music Theory", "Keyboard", "Piano", "Guitar", "Violin", "Drums",
    "Music Production", "FL Studio", "Ableton Live", "Cubase"
  ],
  "Dance": [
    "Classical Dance", "Bharatanatyam", "Kuchipudi", "Kathak", "Hip Hop", "Contemporary",
    "Choreography"
  ],
  "Sports & Fitness": [
    "Yoga", "Gym Training", "Strength Training", "Cardio", "Nutrition", "Weight Loss",
    "Athletics", "Cricket", "Football", "Badminton", "Swimming"
  ],
  "Cooking & Lifestyle": [
    "Cooking", "Baking", "Healthy Diet", "Nutrition", "Meal Planning", "Food Presentation"
  ],
  "Business & Entrepreneurship": [
    "Startup", "Business Strategy", "Marketing", "Sales", "Finance", "Accounting",
    "Entrepreneurship", "Leadership", "Product Management", "Operations"
  ],
  "Marketing": [
    "Digital Marketing", "SEO", "SEM", "Google Ads", "Facebook Ads", "Instagram Marketing",
    "Content Marketing", "Email Marketing", "Copywriting", "Brand Marketing"
  ],
  "Communication": [
    "Public Speaking", "Presentation Skills", "Soft Skills", "Interview Preparation",
    "Personality Development", "Negotiation", "Leadership Communication"
  ],
  "Languages": [
    "English", "Hindi", "Telugu", "Tamil", "French", "German", "Japanese", "Spanish",
    "IELTS", "TOEFL", "Spoken English"
  ]
};

export default function CategoriesSkillsStep() {
  const { state, setState, goBack } = useOnboarding();
  const { professionalDetails } = state;

  const [selectedCategories, setSelectedCategories] = useState<string[]>(professionalDetails.selectedCategories || []);
  const [skillProficiencies, setSkillProficiencies] = useState<SkillItem[]>(professionalDetails.skillProficiencies || []);
  const [searchCategory, setSearchCategory] = useState('');
  const [newSkill, setNewSkill] = useState('');
  const [newLevel, setNewLevel] = useState('Beginner');

  React.useEffect(() => {
    setSelectedCategories(professionalDetails.selectedCategories || []);
    setSkillProficiencies(professionalDetails.skillProficiencies || []);
  }, [professionalDetails]);

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const addSkill = (skill: string, level: string) => {
    if (!skill.trim()) return;
    if (skillProficiencies.some(s => s.skill.toLowerCase() === skill.trim().toLowerCase())) {
      toast.warning('Skill already added!');
      return;
    }
    setSkillProficiencies(prev => [...prev, { skill: skill.trim(), level }]);
    toast.success('Skill added ✓');
  };

  const removeSkill = (index: number) => {
    setSkillProficiencies(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCategories.length === 0) {
      toast.warning('Please select at least one teaching category.');
      return;
    }
    if (skillProficiencies.length === 0) {
      toast.warning('Please add at least one skill.');
      return;
    }

    const payload = {
      selectedCategories,
      skillProficiencies
    };

    try {
      const res = await fetch('/api/tutor/submit-step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stepName: 'subject_selection',
          data: payload
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save subjects draft");
      }

      setState((prev: OnboardingState) => ({
        ...prev,
        professionalDetails: {
          ...prev.professionalDetails,
          ...payload
        },
        currentStep: prev.currentStep + 1
      }));
      toast.success('Categories & skills saved ✓');
    } catch (err: any) {
      toast.error(err.message || "Failed to save subjects draft.");
    }
  };

  // Get icons for categories
  const getCategoryIcon = (cat: string) => {
    const c = cat.toLowerCase();
    if (c.includes('academic') || c.includes('education')) return <GraduationCap className="w-5 h-5" />;
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

  // Generate dynamic skills suggestions based on selected categories
  const getDynamicSuggestedSkills = () => {
    const allSkills: string[] = [];
    selectedCategories.forEach(cat => {
      const skills = CATEGORY_TO_SKILLS[cat] || [];
      allSkills.push(...skills);
    });
    // Remove duplicates and sort alphabetically
    const uniqueSkills = Array.from(new Set(allSkills));
    return uniqueSkills.sort((a, b) => a.localeCompare(b));
  };

  const dynamicSuggestedSkills = getDynamicSuggestedSkills();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start max-w-[1200px] mx-auto">
      {/* FORM CARD */}
      <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.03)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] p-6 md:p-10 transition-all duration-300">
        <div className="mb-8 border-b border-slate-100 dark:border-slate-800 pb-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Palette className="w-8 h-8 text-blue-600" />
            Categories & Skills
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Select your core tutoring domains and add specific skill proficiencies.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Categories Grid Section */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-550" />
              <input
                type="text"
                placeholder="Search tutoring categories..."
                value={searchCategory}
                onChange={e => setSearchCategory(e.target.value)}
                className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition text-sm"
              />
            </div>

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
                        ? 'bg-blue-600 border-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] ring-2 ring-blue-500'
                        : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900/30'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-500'
                    }`}>
                      {getCategoryIcon(cat)}
                    </div>
                    <span className="font-bold text-xs leading-snug">{cat}</span>
                  </button>
                );
              })}
            </div>
          </div>          {/* Dynamic Skill Suggestions Container */}
          <div className="space-y-4 border-t border-slate-100 dark:border-slate-800 pt-6">
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Dynamic Skill Suggestions</h4>
              <p className="text-[11px] text-slate-500">Add recommended skills based on your selected categories.</p>
            </div>

            {selectedCategories.length === 0 ? (
              <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/30 dark:bg-slate-950/10 text-xs text-slate-550 italic text-center">
                Select one or more tutoring categories to view recommended skills.
              </div>
            ) : dynamicSuggestedSkills.length === 0 ? (
              <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/30 dark:bg-slate-950/10 text-xs text-slate-550 italic text-center">
                No recommended skills found for selected categories.
              </div>
            ) : (
              <div className="flex flex-wrap gap-1.5 max-h-[140px] overflow-y-auto pr-1 custom-scrollbar">
                {dynamicSuggestedSkills.map(skill => {
                  const isSelected = skillProficiencies.some(s => s.skill.toLowerCase() === skill.toLowerCase());
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => addSkill(skill, 'Advanced')}
                      disabled={isSelected}
                      className={`px-3 py-1.5 text-[11px] font-bold rounded-full border flex items-center gap-1 transition ${
                        isSelected
                          ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/50 text-blue-600 dark:text-blue-400 cursor-not-allowed'
                          : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 text-blue-600 dark:text-blue-400" />}
                      <span>{skill}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Custom Skill Badge Form */}
          <div className="p-5 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/30 dark:bg-slate-950/20 space-y-4">
            <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">Add Custom Skill Badge</h4>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Python, Public Speaking, UI Design..."
                value={newSkill}
                onChange={e => setNewSkill(e.target.value)}
                className="flex-1 px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              
              <select
                value={newLevel}
                onChange={e => setNewLevel(e.target.value)}
                className="px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
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
                }}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition"
              >
                Add Badge
              </button>
            </div>

            {skillProficiencies.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {skillProficiencies.map((s, idx) => (
                  <span 
                  key={s.skill} 
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-bold rounded-xl text-xs"
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

          {/* Action buttons */}
          <div className="flex justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={goBack}
              className="px-6 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 font-bold rounded-xl transition"
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
            Skills Mapping
          </h4>
          <ul className="text-xs space-y-3 text-slate-600 dark:text-slate-400 leading-relaxed list-disc pl-4">
            <li>
              Pills are rounded exactly to help rank search relevancy.
            </li>
            <li>
              Skills matching selected categories get indexing priority.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
