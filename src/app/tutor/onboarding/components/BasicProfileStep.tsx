"use client";
import React, { useState, useEffect } from 'react';
import { useOnboarding, OnboardingState } from '@/context/OnboardingContext';
import { User, Phone, MapPin, Globe, Sparkles, Upload, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase';

const STATE_CITY_DATA: Record<string, string[]> = {
  'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Tirupati', 'Kurnool', 'Nellore'],
  'Telangana': ['Hyderabad', 'Secunderabad', 'Warangal', 'Karimnagar', 'Khammam', 'Nizamabad'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Salem', 'Tiruchirappalli', 'Vellore'],
  'Karnataka': ['Bengaluru', 'Mysuru', 'Hubballi', 'Mangaluru', 'Belagavi', 'Davangere'],
  'Kerala': ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kollam', 'Palakkad'],
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Aurangabad'],
  'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar'],
  'Rajasthan': ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer', 'Bikaner'],
  'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Agra', 'Varanasi', 'Meerut', 'Allahabad'],
  'Delhi': ['New Delhi', 'Dwarka', 'Rohini', 'Saket', 'Noida', 'Gurugram'],
  'West Bengal': ['Kolkata', 'Howrah', 'Asansol', 'Siliguri', 'Durgapur', 'Bardhaman'],
  'Bihar': ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Darbhanga', 'Purnia'],
  'Punjab': ['Chandigarh', 'Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda'],
  'Haryana': ['Gurugram', 'Faridabad', 'Panipat', 'Ambala', 'Karnal', 'Rohtak'],
  'Madhya Pradesh': ['Bhopal', 'Indore', 'Gwalior', 'Jabalpur', 'Ujjain', 'Sagar'],
  'Odisha': ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Berhampur', 'Sambalpur', 'Puri'],
  'Assam': ['Guwahati', 'Dibrugarh', 'Silchar', 'Jorhat', 'Tezpur', 'Bongaigaon'],
  'Jharkhand': ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Deoghar', 'Hazaribagh'],
  'Himachal Pradesh': ['Shimla', 'Manali', 'Dharamshala', 'Solan', 'Mandi', 'Kullu'],
  'Uttarakhand': ['Dehradun', 'Haridwar', 'Roorkee', 'Rishikesh', 'Nainital', 'Haldwani'],
};

function SearchableDropdown({
  label,
  value,
  onChange,
  options,
  placeholder,
  disabled = false
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: string[];
  placeholder: string;
  disabled?: boolean;
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
    opt.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
        {label}
      </label>
      <button
        type="button"
        disabled={disabled}
        onClick={() => { setIsOpen(!isOpen); setSearch(''); }}
        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 text-left text-slate-900 dark:text-slate-100 flex items-center justify-between focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className={value ? 'text-slate-900 dark:text-slate-105' : 'text-slate-450'}>
          {value || placeholder}
        </span>
        <span className="text-slate-400 text-xs">▼</span>
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-50 mt-1.5 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg max-h-60 overflow-y-auto">
          <div className="p-2 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 sticky top-0 z-10">
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="py-1">
            {filtered.length === 0 ? (
              <div className="px-4 py-2 text-xs text-slate-400 text-center">No options found</div>
            ) : (
              filtered.map(opt => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    onChange(opt);
                    setIsOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left text-xs text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  {opt}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function BasicProfileStep() {
  const { state, setState } = useOnboarding();
  const { personalInfo } = state;
  const [photoUploading, setPhotoUploading] = useState(false);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setState((prev: OnboardingState) => ({
            ...prev,
            personalInfo: {
              ...prev.personalInfo,
              email: prev.personalInfo.email || session.user.email || '',
              fullName: prev.personalInfo.fullName || session.user.user_metadata?.fullName || session.user.user_metadata?.full_name || '',
            }
          }));
        }
      } catch (err) {
        console.warn("Could not pre-populate profile fields from session:", err);
      }
    };
    fetchSession();
  }, [setState]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setState((prev: OnboardingState) => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [name]: value },
    }));
  };

  const handleStateChange = (selectedState: string) => {
    setState((prev: OnboardingState) => ({
      ...prev,
      personalInfo: { 
        ...prev.personalInfo, 
        state: selectedState,
        city: '' // Clear city when state changes
      },
    }));
  };

  const handleCityChange = (selectedCity: string) => {
    setState((prev: OnboardingState) => ({
      ...prev,
      personalInfo: { 
        ...prev.personalInfo, 
        city: selectedCity 
      },
    }));
  };

  // Mock Avatar Upload
  const handlePhotoUpload = () => {
    setPhotoUploading(true);
    setTimeout(() => {
      setState((prev: OnboardingState) => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=250&h=250&fit=crop',
        },
      }));
      setPhotoUploading(false);
      toast.success('Profile photo uploaded successfully!');
    }, 1200);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!personalInfo.state) {
      toast.error('Please select a State.');
      return;
    }
    if (!personalInfo.city) {
      toast.error('Please select a City.');
      return;
    }

    const dob = personalInfo.dob;
    if (!dob) {
      toast.error('Please enter your Date of Birth.');
      return;
    }

    // Age validation
    const dobDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - dobDate.getFullYear();
    const m = today.getMonth() - dobDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dobDate.getDate())) {
      age--;
    }

    if (age < 15 || age > 24) {
      toast.error(`You must be between 15 and 24 years old to become a Student Tutor on EduEarn. Your current age is ${age}.`);
      return;
    }

    // Atomic state update: Save and proceed in a single tick
    setState((prev: OnboardingState) => ({
      ...prev,
      currentStep: prev.currentStep + 1
    }));
    toast.success('Profile saved successfully ✓');
  };

  const availableCities = personalInfo.state ? STATE_CITY_DATA[personalInfo.state] || [] : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start max-w-[1200px] mx-auto">
      {/* LEFT & CENTER: Form Card */}
      <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.03)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] p-6 md:p-10 transition-all duration-300">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <User className="w-8 h-8 text-blue-600" />
            Basic Profile
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Set up your public-facing tutor identity. This information will be shown to prospective students.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Identity Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Full Name
              </label>
              <input
                name="fullName"
                type="text"
                value={personalInfo.fullName}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Display Name
              </label>
              <input
                name="displayName"
                type="text"
                value={personalInfo.displayName}
                onChange={handleChange}
                placeholder="Rahul S."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Student Tutor Headline
            </label>
            <input
              name="headline"
              type="text"
              value={personalInfo.headline}
              onChange={handleChange}
              placeholder="B.Tech 3rd Year | DSA & Web Dev Peer Mentor"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
            />
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Country Code
              </label>
              <select
                name="phoneCountryCode"
                value={personalInfo.phoneCountryCode}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
              >
                <option value="+91">🇮🇳 India (+91)</option>
                <option value="+1">🇺🇸 US (+1)</option>
                <option value="+44">🇬🇧 UK (+44)</option>
                <option value="+971">🇦🇪 UAE (+971)</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Phone Number
              </label>
              <input
                name="phoneNumber"
                type="tel"
                value={personalInfo.phoneNumber}
                onChange={handleChange}
                placeholder="9876543210"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
                required
              />
            </div>
          </div>

          {/* Geographic Details (Searchable Dependent Dropdowns) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SearchableDropdown
              label="State"
              value={personalInfo.state}
              onChange={handleStateChange}
              options={Object.keys(STATE_CITY_DATA)}
              placeholder="Select State"
            />

            <SearchableDropdown
              label="City"
              value={personalInfo.city}
              onChange={handleCityChange}
              options={availableCities}
              placeholder="Select City"
              disabled={!personalInfo.state}
            />
          </div>

          {/* DOB & Gender */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Date of Birth (Eligible Age: 15–24 Years)
              </label>
              <input
                name="dob"
                type="date"
                value={personalInfo.dob || ""}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Gender
              </label>
              <select
                name="gender"
                value={personalInfo.gender || "Male"}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
                required
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Languages */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Spoken Languages (comma separated)
            </label>
            <input
              name="language"
              type="text"
              value={personalInfo.language}
              onChange={handleChange}
              placeholder="English, Hindi, Telugu, Tamil"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
            />
          </div>

          {/* Bio */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Student Tutor Bio (Optional)
              </label>
              <span className="text-[10px] text-slate-400 font-semibold">
                {(personalInfo.bio || '').length} / 500
              </span>
            </div>
            <textarea
              name="bio"
              rows={4}
              maxLength={500}
              value={personalInfo.bio || ''}
              onChange={handleChange}
              placeholder="Share a brief overview of your background, values, and teaching philosophy..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
            />
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
              Tell students about your teaching style, expertise and experience. This field is optional but highly recommended.
            </p>
          </div>

          {/* Profile Photo drag and drop area */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
              Profile Photo
            </label>
            <div
              onClick={handlePhotoUpload}
              className="border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-blue-500/50 dark:hover:border-blue-500/50 rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 bg-slate-50/30 dark:bg-slate-950/10"
            >
              {personalInfo.avatarUrl ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-16 h-16 rounded-full overflow-hidden border border-slate-200">
                    <img src={personalInfo.avatarUrl} alt="Avatar preview" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 mt-1">
                    <CheckCircle2 className="w-4 h-4" /> Ready to save
                  </span>
                  <span className="text-[10px] text-slate-400">Click to change picture</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center text-blue-600">
                    <Upload className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-350">
                    {photoUploading ? 'Simulating upload...' : 'Upload your photo'}
                  </span>
                  <span className="text-xs text-slate-400">Drag & drop or click to choose headshot</span>
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="submit"
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-500/20 hover:scale-[1.02] transition-all duration-200"
            >
              Save & Proceed
            </button>
          </div>
        </form>
      </div>

      {/* RIGHT SIDE: Preview & Sticky Help Panel */}
      <div className="space-y-6 lg:sticky lg:top-24">
        {/* Profile Card Preview */}
        <div className="bg-gradient-to-b from-slate-900 to-slate-950 text-white rounded-3xl border border-slate-800 p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
          <span className="absolute top-4 right-4 text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 bg-blue-600/30 text-blue-450 border border-blue-500/20 rounded-full">
            Public Card Preview
          </span>

          <div className="flex flex-col items-center text-center mt-4">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-slate-800 shadow-md bg-slate-800 flex items-center justify-center text-slate-400 font-bold text-2xl">
              {personalInfo.avatarUrl ? (
                <img src={personalInfo.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                personalInfo.displayName?.substring(0, 2).toUpperCase() || personalInfo.fullName?.substring(0, 2).toUpperCase() || 'TR'
              )}
            </div>

            <h3 className="font-extrabold text-lg mt-3 tracking-tight">
              {personalInfo.displayName || personalInfo.fullName || 'Your Name'}
            </h3>
            <p className="text-xs text-blue-400 mt-1 font-semibold max-w-[200px] line-clamp-1">
              {personalInfo.headline || 'Student Tutor Headline'}
            </p>
          </div>

          <div className="border-t border-slate-800/80 my-4 pt-4 space-y-2 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span>
                {personalInfo.city && personalInfo.state ? `${personalInfo.city}, ${personalInfo.state}` : 'Location'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span>Speaks: {personalInfo.language || 'Languages'}</span>
            </div>
          </div>

          <p className="text-xs text-slate-400 line-clamp-3 italic text-center border-t border-slate-850 pt-3">
            &ldquo;{personalInfo.bio || 'Your bio statement will appear here. Keep it concise, engaging, and friendly!'}&rdquo;
          </p>
        </div>

        {/* Tutor Eligibility Panel */}
        <div className="bg-emerald-50/50 dark:bg-emerald-950/15 border border-emerald-100/60 dark:border-emerald-900/30 rounded-3xl p-6 space-y-4">
          <h4 className="font-bold text-sm text-emerald-800 dark:text-emerald-450 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Who Can Become a Tutor?
          </h4>
          <div className="text-xs text-slate-650 dark:text-slate-350">
            Eligible Age Range: <span className="font-bold text-emerald-600 dark:text-emerald-400">15–24 Years</span>
          </div>
          <ul className="text-xs space-y-2 text-slate-600 dark:text-slate-400 leading-relaxed list-none pl-0">
            <li className="flex items-center gap-2"><span className="text-emerald-500 font-bold">✓</span> Class 10 Student</li>
            <li className="flex items-center gap-2"><span className="text-emerald-500 font-bold">✓</span> Intermediate Student</li>
            <li className="flex items-center gap-2"><span className="text-emerald-500 font-bold">✓</span> Diploma / Polytechnic Student</li>
            <li className="flex items-center gap-2"><span className="text-emerald-500 font-bold">✓</span> Undergraduate Student (B.Tech, B.Sc, BCA, etc.)</li>
            <li className="flex items-center gap-2"><span className="text-emerald-500 font-bold">✓</span> Postgraduate Student (M.Tech, MCA, M.Sc, etc.)</li>
            <li className="flex items-center gap-2"><span className="text-emerald-500 font-bold">✓</span> Fresh Graduate (within age limit)</li>
          </ul>
        </div>

        {/* Guidance Panel */}
        <div className="bg-blue-50/50 dark:bg-blue-950/15 border border-blue-100/60 dark:border-blue-900/30 rounded-3xl p-6 space-y-4">
          <h4 className="font-bold text-sm text-blue-800 dark:text-blue-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Student Tutor Guidance
          </h4>
          <ul className="text-xs space-y-3 text-slate-600 dark:text-slate-400 leading-relaxed list-disc pl-4">
            <li>
              Use your <strong>real name</strong> or public nickname for display.
            </li>
            <li>
              A short, punchy <strong>peer-tutor headline</strong> (e.g. B.Tech 3rd Year) attracts 40% more student enrollees.
            </li>
            <li>
              Keep your bio conversational and highlight your hobby projects or hackathon accomplishments.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
