"use client";
import React, { useState, useEffect } from 'react';
import { useOnboarding, OnboardingState } from '@/context/OnboardingContext';
import { User, Phone, MapPin, Globe, Sparkles, CheckCircle2 } from 'lucide-react';
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


const PREDEFINED_AVATARS = [
  {
    id: "avatar-0",
    label: "Indigo Female Tutor",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="#6366f1"/><path d="M25 80 C25 65 35 60 50 60 C65 60 75 65 75 80 Z" fill="#e0e7ff"/><path d="M30 42 C26 48 26 68 30 74 C34 52 66 52 70 74 C74 68 74 48 70 42 C66 32 34 32 30 42 Z" fill="#78350f"/><rect x="46" y="50" width="8" height="12" rx="3" fill="#fed7aa"/><circle cx="50" cy="40" r="15" fill="#fed7aa"/><path d="M37 28 C37 28 50 32 63 28" fill="none" stroke="#18181b" stroke-width="4" stroke-linecap="round"/><polygon points="50,15 80,24 50,33 20,24" fill="#18181b"/><circle cx="50" cy="24" r="2.5" fill="#f59e0b"/><path d="M50 24 C58 24 68 34 68 38" fill="none" stroke="#f59e0b" stroke-width="1.5" stroke-linecap="round"/><polygon points="68,38 70,42 66,42" fill="#f59e0b"/><circle cx="44" cy="38" r="1.7" fill="#18181b"/><circle cx="56" cy="38" r="1.7" fill="#18181b"/><path d="M46 44 Q50 48 54 44" fill="none" stroke="#18181b" stroke-width="2" stroke-linecap="round"/></svg>`,
    dataUrl: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj4KICAgIDxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjQ2IiBmaWxsPSIjNjM2NmYxIi8+CiAgICA8cGF0aCBkPSJNMjUgODAgQzI1IDY1IDM1IDYwIDUwIDYwIEM2NSA2MCA3NSA2NSA3NSA4MCBaIiBmaWxsPSIjZTBlN2ZmIi8+CiAgICA8cGF0aCBkPSJNMzAgNDIgQzI2IDQ4IDI2IDY4IDMwIDc0IEMzNCA1MiA2NiA1MiA3MCA3NCBDNzQgNjggNzQgNDggNzAgNDIgQzY2IDMyIDM0IDMyIDMwIDQyIFoiIGZpbGw9IiM3ODM1MGYiLz4KICAgIDxyZWN0IHg9IjQ2IiB5PSI1MCIgd2lkdGg9IjgiIGhlaWdodD0iMTIiIHJ4PSIzIiBmaWxsPSIjZmVkN2FhIi8+CiAgICA8Y2lyY2xlIGN4PSI1MCIgY3k9IjQwIiByPSIxNSIgZmlsbD0iI2ZlZDdhYSIvPgog   fPHBhdGggZD0iTTM3IDI4IEMzNyAyOCA1MCAzMiA2MyAyOCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMTgxODFiIiBzdHJva2Utd2lkdGg9IjQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgogICAgPHBvbHlnb24gcG9pbnRzPSI1MCwxNSA4MCwyNCA1MCwzMyAyMCwyNCIgZmlsbD0iIzE4MTgxYiIvPgogICAgPGNpcmNsZSBjeD0iNTAiIGN5PSIyNCIgcj0iMi41IiBmaWxsPSIjZjU5ZTBiIi8+CiAgICA8cGF0aCBkPSJNNTAgMjQgQzU4IDI0IDY4IDM0IDY4IDM4IiBmaWxsPSJub25lIiBzdHJva2U9IiNmNTllMGIiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KICAgIDxwb2x5Z29uIHBvaW50cz0iNjgsMzggNzAsNDIgNjYsNDIiIGZpbGw9IiNmNTllMGIiLz4KICAgIDxjaXJjbGUgY3g9IjQ0IiBjeT0iMzgiIHI9IjEuNyIgZmlsbD0iIzE4MTgxYiIvPgogICAgPGNpcmNsZSBjeD0iNTYiIGN5PSIzOCIgcj0iMS43IiBmaWxsPSIjMTgxODFiIi8+CiAgICA8cGF0aCBkPSJNNzYgNDQgUTUwIDQ4IDU0IDQ0IiBmaWxsPSJub25lIiBzdHJva2U9IiMxODE4MWIiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PC9zdmc+"
  },
  {
    id: "avatar-1",
    label: "Teal Male Tutor (Glasses)",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="#0d9488"/><path d="M25 80 C25 65 35 60 50 60 C65 60 75 65 75 80 Z" fill="#ccfbf1"/><path d="M32 36 C32 26 68 26 68 36 C70 36 70 31 68 27 C60 23 40 23 32 27 Z" fill="#18181b"/><rect x="46" y="50" width="8" height="12" rx="3" fill="#fdba74"/><circle cx="50" cy="40" r="15" fill="#fdba74"/><path d="M37 28 C37 28 50 32 63 28" fill="none" stroke="#18181b" stroke-width="4" stroke-linecap="round"/><polygon points="50,15 80,24 50,33 20,24" fill="#18181b"/><circle cx="50" cy="24" r="2.5" fill="#f59e0b"/><path d="M50 24 C58 24 68 34 68 38" fill="none" stroke="#f59e0b" stroke-width="1.5" stroke-linecap="round"/><polygon points="68,38 70,42 66,42" fill="#f59e0b"/><circle cx="43" cy="38" r="5" fill="none" stroke="#18181b" stroke-width="1.5"/><circle cx="57" cy="38" r="5" fill="none" stroke="#18181b" stroke-width="1.5"/><line x1="48" y1="38" x2="52" y2="38" stroke="#18181b" stroke-width="1.5"/><circle cx="43" cy="38" r="1.5" fill="#18181b"/><circle cx="57" cy="38" r="1.5" fill="#18181b"/><path d="M46 45 Q50 49 54 45" fill="none" stroke="#18181b" stroke-width="2" stroke-linecap="round"/></svg>`,
    dataUrl: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0NiIgZmlsbD0iIzBkOTQ4OCIvPjxwYXRoIGQ9Ik0yNSA4MCBDMjUgNjUgMzUgNjAgNTAgNjAgQzY1IDYwIDc1IDY1IDc1IDgwIFoiIGZpbGw9IiNDQ0ZCRjEiLz48cGF0aCBkPSJNMzIgMzYgQzMyIDI2IDY4IDI2IDY4IDM2IEM3MCAzNiA3MCAzMSA2OCAyNyBDNjAgMjMgNDAgMjMgMzIgMjcgWiIgZmlsbD0iIzE4MTgxYiIvPjxyZWN0IHg9IjQ2IiB5PSI1MCIgd2lkdGg9IjgiIGhlaWdodD0iMTIiIHJ4PSIzIiBmaWxsPSIjZmRiYTc0Ii8+PGNpcmNsZSBjeD0iNTAiIGN5PSI0MCIgcj0iMTUiIGZpbGw9IiNmZGJhNzQiLz48cGF0aCBkPSJNMzcgMjggQzM3IDI4IDUwIDMyIDYzIDI4IiBmaWxsPSJub25lIiBzdHJva2U9IiMxODE4MWIiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBvbHlnb24gcG9pbnRzPSI1MCwxNSA4MCwyNCA1MCwzMyAyMCwyNCIgZmlsbD0iIzE4MTgxYiIvPjxjaXJjbGUgY3g9IjU5IiBjeT0iMjQiIHI9IjIuNSIgZmlsbD0iI2Y1OWUwYiIvPjxwYXRoIGQ9Ik01MCAyNCBDNTggMjQgNjggMzQgNjggMzgiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2Y1OWUwYiIgc3Ryb2tlLXdpZHRoPSIxLjUgIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48cG9seWdvbiBwb2ludHM9IjY4LDM4IDcwLDQyIDY2LDQyIiBmaWxsPSIjZjU5ZTBiIi8+PGNpcmNsZSBjeD0iNDMiIGN5PSIzOCIgcj0iNSIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMTgxODFiIiBzdHJva2Utd2lkdGg9IjEuNSIvPjxjaXJjbGUgY3g9IjU3IiBjeT0iMzgiIHI9IjUiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzE4MTgxYiIgc3Ryb2tlLXdpZHRoPSIxLjUiLz48bGluZSB4MT0iNDgiIHkxPSIzOCIgeDI9IjUyIiB5Mj0iMzgiIHN0cm9rZT0iIzE4MTgxYiIgc3Ryb2tlLXdpZHRoPSIxLjUiLz48Y2lyY2xlIGN4PSI0MyIgY3k9IjM4IiByPSIxLjUiIGZpbGw9IiMxODE4MWIiLz48Y2lyY2xlIGN4PSI1NyIgY3k9IjM4IiByPSIxLjUiIGZpbGw9IiMxODE4MWIiLz48cGF0aCBkPSJNNDYgNDUgUTUwIDQ5IDU0IDQ1IiBmaWxsPSJub25lIiBzdHJva2U9IiMxODE4MWIiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PC9zdmc+"
  },
  {
    id: "avatar-2",
    label: "Pink Afro Female Tutor",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="#db2777"/><path d="M25 80 C25 65 35 60 50 60 C65 60 75 65 75 80 Z" fill="#fce7f3"/><circle cx="34" cy="36" r="8" fill="#18181b"/><circle cx="66" cy="36" r="8" fill="#18181b"/><circle cx="31" cy="46" r="7" fill="#18181b"/><circle cx="69" cy="46" r="7" fill="#18181b"/><rect x="46" y="50" width="8" height="12" rx="3" fill="#7c2d12"/><circle cx="50" cy="40" r="15" fill="#7c2d12"/><path d="M37 28 C37 28 50 32 63 28" fill="none" stroke="#18181b" stroke-width="4" stroke-linecap="round"/><polygon points="50,15 80,24 50,33 20,24" fill="#18181b"/><circle cx="50" cy="24" r="2.5" fill="#f59e0b"/><path d="M50 24 C58 24 68 34 68 38" fill="none" stroke="#f59e0b" stroke-width="1.5" stroke-linecap="round"/><polygon points="68,38 70,42 66,42" fill="#f59e0b"/><circle cx="44" cy="38" r="1.7" fill="#ffffff"/><circle cx="56" cy="38" r="1.7" fill="#ffffff"/><path d="M46 44 Q50 48 54 44" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/></svg>`,
    dataUrl: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0NiIgZmlsbD0iI2RiMjc3NyIvPjxwYXRoIGQ9Ik0yNSA4MCBDMjUgNjUgMzUgNjAgNTAgNjAgQzY1IDYwIDc1IDY1IDc1IDgwIFoiIGZpbGw9IiNmY2U3ZjMiLz48Y2lyY2xlIGN4PSIzNCIgY3k9IjM2IiByPSI4IiBmaWxsPSIjMTgxODFiIi8+PGNpcmNsZSBjeD0iNjYiIGN5PSIzNiIgcj0iOCIgZmlsbD0iIzE4MTgxYiIvPjxjaXJjbGUgY3g9IjMxIiBjeT0iNDYiIHI9IjciIGZpbGw9IiMxODE4MWIiLz48Y2lyY2xlIGN4PSI2OSIgY3k9IjQ2IiByPSI3IiBmaWxsPSIjMTgxODFiIi8+PHJlY3QgeD0iNDYiIHk9IjUwIiB3aWR0aD0iOCIgaGVpZ2h0PSIxMiIgcngPSIzIiBmaWxsPSIjN2MyZDEyIi8+PGNpcmNsZSBjeD0iNTAiIGN5PSI0MCIgcj0iMTUiIGZpbGw9IiM3YzJkMTIiLz48cGF0aCBkPSJNMzcgMjggQzM3IDI4IDUwIDMyIDYzIDI4IiBmaWxsPSJub25lIiBzdHJva2U9IiMxODE4MWIiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBvbHlnb24gcG9pbnRzPSI1MCwxNSA4MCwyNCA1MCwzMyAyMCwyNCIgZmlsbD0iIzE4MTgxYiIvPjxjaXJjbGUgY3g9IjUwIiBjeT0iMjQiIHI9IjIuNSIgZmlsbD0iI2Y1OWUwYiIvPjxwYXRoIGQ9Ik05MCAyNCBDNTggMjQgNjggMzQgNjggMzgiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2Y1OWUwYiIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjxwb2x5Z29uIHBvaW50cz0iNjgsMzggNzAsNDIgNjYsNDIiIGZpbGw9IiNmNTllMGIiLz48Y2lyY2xlIGN4PSI0NCIgY3k9IjM4IiByPSIxLjciIGZpbGw9IiNmZmZmZmYiLz48Y2lyY2xlIGN4PSI1NiIgY3k9IjM4IiByPSIxLjciIGZpbGw9IiNmZmZmZmYiLz48cGF0aCBkPSJNNDYgNDQgUSUwIDQ4IDU0IDQ5IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmZmZmYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PC9zdmc+"
  },
  {
    id: "avatar-3",
    label: "Orange Spiky Male Tutor",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="#ea580c"/><path d="M25 80 C25 65 35 60 50 60 C65 60 75 65 75 80 Z" fill="#ffedd5"/><path d="M32 32 L36 24 L40 30 L45 22 L50 30 L55 22 L60 30 L64 24 L68 32 Z" fill="#eab308"/><rect x="46" y="50" width="8" height="12" rx="3" fill="#ffedd5"/><circle cx="50" cy="40" r="15" fill="#ffedd5"/><path d="M37 28 C37 28 50 32 63 28" fill="none" stroke="#18181b" stroke-width="4" stroke-linecap="round"/><polygon points="50,15 80,24 50,33 20,24" fill="#18181b"/><circle cx="50" cy="24" r="2.5" fill="#f59e0b"/><path d="M50 24 C58 24 68 34 68 38" fill="none" stroke="#f59e0b" stroke-width="1.5" stroke-linecap="round"/><polygon points="68,38 70,42 66,42" fill="#f59e0b"/><circle cx="44" cy="38" r="1.7" fill="#18181b"/><circle cx="56" cy="38" r="1.7" fill="#18181b"/><path d="M46 44 Q50 48 54 44" fill="none" stroke="#18181b" stroke-width="2" stroke-linecap="round"/></svg>`,
    dataUrl: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0NiIgZmlsbD0iI2VhNTgwYyIvPjxwYXRoIGQ9Ik0yNSA4MCBDMjUgNjUgMzUgNjAgNTAgNjAgQzY1IDYwIDc1IDY1IDc1IDgwIFoiIGZpbGw9IiNmZmVkZDUiLz48cGF0aCBkPSJNMzIgMzIgTDM2IDI0IEw0MCAzMCBMNDUgMjIgTDUwIDMwIEw1NSAyMiBMNjAgMzAgTDY0IDI0IEw2OCAzMiBaIiBmaWxsPSIjZWFiMzA4Ii8+PHJlY3QgeD0iNDYiIHk9IjUwIiB3aWR0aD0iOCIgaGVpZ2h0PSIxMiIgcngPSIzIiBmaWxsPSIjZmZlZGQ1Ii8+PGNpcmNsZSBjeD0iNTAiIGN5PSI0MCIgcj0iMTUiIGZpbGw9IiNmZmVkZDUiLz48cGF0aCBkPSJNMzcgMjggQzM3IDI4IDUwIDMyIDYzIDI4IiBmaWxsPSJub25lIiBzdHJva2U9IiMxODE4MWIiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBvbHlnb24gcG9pbnRzPSI1MCwxNSA4MCwyNCA1MCwzMyAyMCwyNCIgZmlsbD0iIzE4MTgxYiIvPjxjaXJjbGUgY3g9IjUwIiBjeT0iMjQiIHI9IjIuNSIgZmlsbD0iI2Y1OWUwYiIvPjxwYXRoIGQ9Ik01MCAyNCBDNTggMjQgNjggMzQgNjggMzgiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2Y1OWUwYiIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjxwb2x5Z29uIHBvaW50cz0iNjgsMzggNzAsNDIgNjYsNDIiIGZpbGw9IiNmNTllMGIiLz48Y2lyY2xlIGN4PSI0NCIgY3k9Ij3OCIgcj0iMS43IiBmaWxsPSIjMTgxODFiIi8+PGNpcmNsZSBjeD0iNTYiIGN5PSIzOCIgcj0iMS43IiBmaWxsPSIjMTgxODFiIi8+PHBhdGggZD0iTTQ2IDQ0IFFTimesNDggNTQgNDQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzE4MTgxYiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48L3N2Zz4="
  },
  {
    id: "avatar-4",
    label: "Blue Male Tutor (Glasses)",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="#2563eb"/><path d="M25 80 C25 65 35 60 50 60 C65 60 75 65 75 80 Z" fill="#dbeafe"/><path d="M34 33 C38 25 62 25 66 33 Z" fill="#451a03"/><rect x="46" y="50" width="8" height="12" rx="3" fill="#f59e0b"/><circle cx="50" cy="40" r="15" fill="#f59e0b"/><path d="M37 28 C37 28 50 32 63 28" fill="none" stroke="#18181b" stroke-width="4" stroke-linecap="round"/><polygon points="50,15 80,24 50,33 20,24" fill="#18181b"/><circle cx="50" cy="24" r="2.5" fill="#f59e0b"/><path d="M50 24 C58 24 68 34 68 38" fill="none" stroke="#f59e0b" stroke-width="1.5" stroke-linecap="round"/><polygon points="68,38 70,42 66,42" fill="#f59e0b"/><rect x="37" y="34" width="8" height="8" rx="1.5" fill="none" stroke="#18181b" stroke-width="1.5"/><rect x="55" y="34" width="8" height="8" rx="1.5" fill="none" stroke="#18181b" stroke-width="1.5"/><line x1="45" y1="38" x2="55" y2="38" stroke="#18181b" stroke-width="1.5"/><circle cx="41" cy="38" r="1.5" fill="#18181b"/><circle cx="59" cy="38" r="1.5" fill="#18181b"/><path d="M46 45 Q50 49 54 45" fill="none" stroke="#18181b" stroke-width="2" stroke-linecap="round"/></svg>`,
    dataUrl: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0NiIgZmlsbD0iIzI1NjNlYiIvPjxwYXRoIGQ9Ik0yNSA4MCBDMjUgNjUgMzUgNjAgNTAgNjAgQzY1IDYwIDc1IDY1IDc1IDgwIFoiIGZpbGw9IiNkYmVhZmUiLz48cGF0aCBkPSJNMzQgMzMgQzM4IDI1IDYyIDI1IDY2IDMzIFoiIGZpbGw9IiM0NTFhMDMiLz48cmVjdCB4PSI0NiIgeT0iNTAiIHdpZG0gZD0iOCIgaGVpZ2h0PSIxMiIgcngPSIzIiBmaWxsPSIjZjU5ZTBiIi8+PGNpcmNsZSBjeD0iNTAiIGN5PSI0MCIgcj0iMTUiIGZpbGw9IiNmNTllMGIiLz48cGF0aCBkPSJNMzcgMjggQzM3IDI4IDUwIDMyIDYzIDI4IiBmaWxsPSJub25lIiBzdHJva2U9IiMxODE4MWIiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBvbHlnb24gcG9pbnRzPSI1MCwxNSA4MCwyNCA1MCwzMyAyMCwyNCIgZmlsbD0iIzE4MTgxYiIvPjxjaXJjbGUgY3g9IjUwIiBjeT0iMjQiIHI9IjIuNSIgZmlsbD0iI2Y1OWUwYiIvPjxwYXRoIGQ9Ik01MCAyNCBDNTggMjQgNjggMzQgNjggMzgiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2Y1OWUwYiIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjxwb2x5Z29uIHBvaW50cz0iNjgsMzggNzAsNDIgNjYsNDIiIGZpbGw9IiNmNTllMGIiLz48cmVjdCB4PSIzNyIgeT0iMzQiIHdpZHRoPSI4IiBoZWlnaHQ9IjgiIHJ4PSIxLjUiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzE4MTgxYiIgc3Ryb2tlLXdpZHRoPSIxLjUiLz48cmVjdCB4PSI1NSIgeT0iMzQiIHdpZHRoPSI4IiBoZWlnaHQ9IjgiIHJ4PSIxLjUiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzE4MTgxYiIgc3Ryb2tlLXdpZHRoPSIxLjUiLz48bGluZSB4MT0iNDUiIHkxPSIzOCIgeDI9IjU1IiB5Mj0iMzgiIHN0cm9rZT0iIzE4MTgxYiIgc3Ryb2tlLXdpZHRoPSIxLjUiLz48Y2lyY2xlIGN4PSI0MSIgY3k9IjM4IiByPSIxLjUiIGZpbGw9IiMxODE4MWIiLz48Y2lyY2xlIGN4PSI1OSIgY3k9IjM4IiByPSIxLjUiIGZpbGw9IiMxODE4MWIiLz48cGF0aCBkPSJNNDYgNDUgUTUwIDQ5IDU0IDQ1IiBmaWxsPSJub25lIiBzdHJva2U9IiMxODE4MWIiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PC9zdmc+"
  },
  {
    id: "avatar-5",
    label: "Green Bob Female Tutor",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="#16a34a"/><path d="M25 80 C25 65 35 60 50 60 C65 60 75 65 75 80 Z" fill="#dcfce7"/><path d="M30 36 V58 C30 63 36 65 36 65 C36 65 64 65 64 65 C64 65 70 63 70 58 V36" fill="#ea580c"/><rect x="46" y="50" width="8" height="12" rx="3" fill="#fee2e2"/><circle cx="50" cy="40" r="15" fill="#fee2e2"/><path d="M37 28 C37 28 50 32 63 28" fill="none" stroke="#18181b" stroke-width="4" stroke-linecap="round"/><polygon points="50,15 80,24 50,33 20,24" fill="#18181b"/><circle cx="50" cy="24" r="2.5" fill="#f59e0b"/><path d="M50 24 C58 24 68 34 68 38" fill="none" stroke="#f59e0b" stroke-width="1.5" stroke-linecap="round"/><polygon points="68,38 70,42 66,42" fill="#f59e0b"/><circle cx="44" cy="38" r="1.7" fill="#18181b"/><circle cx="56" cy="38" r="1.7" fill="#18181b"/><path d="M46 44 Q50 48 54 44" fill="none" stroke="#18181b" stroke-width="2" stroke-linecap="round"/></svg>`,
    dataUrl: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0NiIgZmlsbD0iIzE2YTM0YSIvPjxwYXRoIGQ9Ik0yNSA4MCBDMjUgNjUgMzUgNjAgNTAgNjAgQzY1IDYwIDc1IDY1IDc1IDgwIFoiIGZpbGw9IiNkY2ZjZTciLz48cGF0aCBkPSJNMzAgMzYgVjU4IEMzMCA2MyAzNiA2NSAzNiA2NSBDMzYgNjUgNjQgNjUgNjQgNjUgQzY0IDY1IDcwIDYzIDcwIDU4IFYzNiIgZmlsbD0iI2VhNTgwYyIvPjxyZWN0IHg9IjQ2IiB5PSI1MCIgd2lkdGg9IjgiIGhlaWdodD0iMTIiIHJ4PSIzIiBmaWxsPSIjZmVlMmUyIi8+PGNpcmNsZSBjeD0iNTAiIGN5PSI0MCIgcj0iMTUiIGZpbGw9IiNmZWUyZTIiLz48cGF0aCBkPSJNMzcgMjggQzM3IDI4IDUwIDMyIDYzIDI4IiBmaWxsPSJub25lIiBzdHJva2U9IiMxODE4MWIiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBvbHlnb24gcG9pbnRzPSI1MCwxNSA4MCwyNCA1MCwzMyAyMCwyNCIgZmlsbD0iIzE4MTgxYiIvPjxjaXJjbGUgY3g9IjUwIiBjeT0iMjQiIHI9IjIuNSIgZmlsbD0iI2Y1OWUwYiIvPjxwYXRoIGQ9Ik01MCAyNCBDNTggMjQgNjggMzQgNjggMzgiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2Y1OWUwYiIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjxwb2x5Z29uIHBvaW50cz0iNjgsMzggNzAsNDIgNjYsNDIiIGZpbGw9IiNmNTllMGIiLz48Y2lyY2xlIGN4PSI0NCIgY3k9IjM4IiByPSIxLjciIGZpbGw9IiMxODE4MWIiLz48Y2lyY2xlIGN4PSI1NiIgY3k9IjM4IiByPSIxLjciIGZpbGw9IiMxODE4MWIiLz48cGF0aCBkPSJNNDYgNDQgUTUwIDggNTQgNDQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzE4MTgxYiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48L3N2Zz4="
  },
  {
    id: "avatar-6",
    label: "Purple Male Tutor (Mustache)",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="#7c3aed"/><path d="M25 80 C25 65 35 60 50 60 C65 60 75 65 75 80 Z" fill="#f3e8ff"/><path d="M32 35 C32 25 68 25 68 35 C70 35 70 30 68 26 C60 22 40 22 32 26 Z" fill="#18181b"/><rect x="46" y="50" width="8" height="12" rx="3" fill="#4c1d95"/><circle cx="50" cy="40" r="15" fill="#4c1d95"/><path d="M37 28 C37 28 50 32 63 28" fill="none" stroke="#18181b" stroke-width="4" stroke-linecap="round"/><polygon points="50,15 80,24 50,33 20,24" fill="#18181b"/><circle cx="50" cy="24" r="2.5" fill="#f59e0b"/><path d="M50 24 C58 24 68 34 68 38" fill="none" stroke="#f59e0b" stroke-width="1.5" stroke-linecap="round"/><polygon points="68,38 70,42 66,42" fill="#f59e0b"/><circle cx="44" cy="38" r="1.7" fill="#ffffff"/><circle cx="56" cy="38" r="1.7" fill="#ffffff"/><path d="M43 47 Q50 43 57 47" fill="none" stroke="#18181b" stroke-width="2.5" stroke-linecap="round"/><path d="M46 49 Q50 52 54 49" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/></svg>`,
    dataUrl: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0NiIgZmlsbD0iIzdjM2FlZCIvPjxwYXRoIGQ9Ik0yNSA4MCBDMjUgNjUgMzUgNjAgNTAgNjAgQzY1IDYwIDc1IDY1IDc1IDgwIFoiIGZpbGw9IiNmM2U4ZmYiLz48cGF0aCBkPSJNMzIgMzUgQzMyIDI1IDY4IDI1IDY4IDM1IEM3MCAzNiA3MCAzMSA2OCAyNyBDNjAgMjMgNDAgMjMgMzIgMjcgWiIgZmlsbD0iIzE4MTgxYiIvPjxyZWN0IHg9IjQ2IiB5PSI1MCIgd2lkdGg9IjgiIGhlaWdodD0iMTIiIHJ4PSIzIiBmaWxsPSIjNGMxZDk1Ii8+PGNpcmNsZSBjeD0iNTAiIGN5PSI0MCIgcj0iMTUiIGZpbGw9IiM0YzFkOTUiLz48cGF0aCBkPSJNMzcgMjggQzM3IDI4IDUwIDMyIDYzIDI4IiBmaWxsPSJub25lIiBzdHJva2U9IiMxODE4MWIiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBvbHlnb24gcG9pbnRzPSI1MCwxNSA4MCwyNCA1MCwzMyAyMCwyNCIgZmlsbD0iIzE4MTgxYiIvPjxjaXJjbGUgY3g9IjUwIiBjeT0iMjQiIHI9IjIuNSIgZmlsbD0iI2Y1OWUwYiIvPjxwYXRoIGQ9Ik01MCAyNCBDNTggMjQgNjggMzQgNjggMzgiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2Y1OWUwYiIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjxwb2x5Z29uIHBvaW50cz0iNjgsMzggNzAsNDIgNjYsNDIiIGZpbGw9IiNmNTllMGIiLz48Y2lyY2xlIGN4PSI0NCIgY3k9IjM4IiByPSIxLjciIGZpbGw9IiNmZmZmZmYiLz48Y2lyY2xlIGN4PSI1NiIgY3k9IjM4IiByPSIxLjciIGZpbGw9IiNmZmZmZmYiLz48cGF0aCBkPSJNNDMgNDcgUTUwIDQzIDU3IDQ3IiBmaWxsPSJub25lIiBzdHJva2U9IiMxODE4MWIiIHN0cm9rZS13aWR0aD0iMi41IiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48cGF0aCBkPSJNNDYgNDkgUTUwIDUyIDU0IDQ5IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmZmZmYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PC9zdmc+"
  },
  {
    id: "avatar-7",
    label: "Rose Ponytail Female Tutor",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="#e11d48"/><path d="M25 80 C25 65 35 60 50 60 C65 60 75 65 75 80 Z" fill="#ffe4e6"/><path d="M30 40 C30 30 70 30 70 40 V50 Z" fill="#18181b"/><circle cx="70" cy="48" r="8" fill="#18181b"/><rect x="46" y="50" width="8" height="12" rx="3" fill="#fdba74"/><circle cx="50" cy="40" r="15" fill="#fdba74"/><path d="M37 28 C37 28 50 32 63 28" fill="none" stroke="#18181b" stroke-width="4" stroke-linecap="round"/><polygon points="50,15 80,24 50,33 20,24" fill="#18181b"/><circle cx="50" cy="24" r="2.5" fill="#f59e0b"/><path d="M50 24 C58 24 68 34 68 38" fill="none" stroke="#f59e0b" stroke-width="1.5" stroke-linecap="round"/><polygon points="68,38 70,42 66,42" fill="#f59e0b"/><circle cx="44" cy="38" r="1.7" fill="#18181b"/><circle cx="56" cy="38" r="1.7" fill="#18181b"/><path d="M46 44 Q50 48 54 44" fill="none" stroke="#18181b" stroke-width="2" stroke-linecap="round"/></svg>`,
    dataUrl: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0NiIgZmlsbD0iI2UxMWQ0OCIvPjxwYXRoIGQ9Ik0yNSA4MCBDMjUgNjUgMzUgNjAgNTAgNjAgQzY1IDYwIDc1IDY1IDc1IDgwIFoiIGZpbGw9IiNmZmU0ZTYiLz48cGF0aCBkPSJNMzAgNDAgQzMwIDMwIDcwIDMwIDcwIDQwIFY1MCBaIiBmaWxsPSIjMTgxODFiIi8+PGNpcmNsZSBjeD0iNzAiIGN5PSI0OCIgcj0iOCIgZmlsbD0iIzE4MTgxYiIvPjxyZWN0IHg9IjQ2IiB5PSI1MCIgd2lkdGg9IjgiIGhlaWdodD0iMTIiIHJ4PSIzIiBmaWxsPSIjZmRiYTc0Ii8+PGNpcmNsZSBjeD0iNTAiIGN5PSI0MCIgcj0iMTUiIGZpbGw9IiNmZGJhNzQiLz48cGF0aCBkPSJNMzcgMjggQzM3IDI4IDUwIDMyIDYzIDI4IiBmaWxsPSJub25lIiBzdHJva2U9IiMxODE4MWIiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBvbHlnb24gcG9pbnRzPSI1MCwxNSA4MCwyNCA1MCwzMyAyMCwyNCIgZmlsbD0iIzE4MTgxYiIvPjxjaXJjbGUgY3g9IjUwIiBjeT0iMjQiIHI9IjIuNSIgZmlsbD0iI2Y1OWUwYiIvPjxwYXRoIGQ9Ik01MCAyNCBDNTggMjQgNjggMzQgNjggMzgiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2Y1OWUwYiIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjxwb2x5Z29uIHBvaW50cz0iNjgsMzggNzAsNDIgNjYsNDIiIGZpbGw9IiNmNTllMGIiLz48Y2lyY2xlIGN4PSI0NCIgY3k9IjM4IiByPSIxLjciIGZpbGw9IiMxODE4MWIiLz48Y2lyY2xlIGN4PSI1YiIgY3k9IjM4IiByPSIxLjciIGZpbGw9IiMxODE4MWIiLz48cGF0aCBkPSJNNDYgNDQgUTUwIDQ4IDU0IDQ0IiBmaWxsPSJub25lIiBzdHJva2U9IiMxODE4MWIiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PC9zdmc+"
  },
  {
    id: "avatar-8",
    label: "Sky Blue Male Tutor (Beard)",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="#0284c7"/><path d="M25 80 C25 65 35 60 50 60 C65 60 75 65 75 80 Z" fill="#e0f2fe"/><path d="M32 35 C32 25 68 25 68 35 C70 35 70 30 68 26 C60 22 40 22 32 26 Z" fill="#18181b"/><rect x="46" y="50" width="8" height="12" rx="3" fill="#fed7aa"/><circle cx="50" cy="40" r="15" fill="#fed7aa"/><path d="M37 28 C37 28 50 32 63 28" fill="none" stroke="#18181b" stroke-width="4" stroke-linecap="round"/><polygon points="50,15 80,24 50,33 20,24" fill="#18181b"/><circle cx="50" cy="24" r="2.5" fill="#f59e0b"/><path d="M50 24 C58 24 68 34 68 38" fill="none" stroke="#f59e0b" stroke-width="1.5" stroke-linecap="round"/><polygon points="68,38 70,42 66,42" fill="#f59e0b"/><path d="M35 39 C35 55 40 62 50 62 C60 62 65 55 65 39" fill="none" stroke="#27272a" stroke-width="3" stroke-dasharray="2 2" stroke-linecap="round"/><circle cx="44" cy="38" r="1.7" fill="#18181b"/><circle cx="56" cy="38" r="1.7" fill="#18181b"/><path d="M46 44 Q50 48 54 44" fill="none" stroke="#18181b" stroke-width="2" stroke-linecap="round"/></svg>`,
    dataUrl: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0NiIgZmlsbD0iIzAyODRjNyIvPjxwYXRoIGQ9Ik0yNSA4MCBDMjUgNjUgMzUgNjAgNTAgNjAgQzY1IDYwIDc1IDY1IDc1IDgwIFoiIGZpbGw9IiNlMGYyZmUiLz48cGF0aCBkPSJNMzIgMzUgQzMyIDI1IDY4IDI1IDY4IDM1IEM3MCAzNiA3MCAzMSA2OCAyNyBDNjAgMjMgNDAgMjMgMzIgMjcgWiIgZmlsbD0iIzE4MTgxYiIvPjxyZWN0IHg9IjQ2IiB5PSI1MCIgd2lkdGg9IjgiIGhlaWdodD0iMTIiIHJ4PSIzIiBmaWxsPSIjZmVkN2FhIi8+PGNpcmNsZSBjeD0iNTAiIGN5PSI0MCIgcj0iMTUiIGZpbGw9IiNmZWQ3YWEiLz48cGF0aCBkPSJNMzcgMjggQzM3IDI4IDUwIDMyIDYzIDI4IiBmaWxsPSJub25lIiBzdHJva2U9IiMxODE4MWIiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBvbHlnb24gcG9pbnRzPSI1MCwxNSA4MCwyNCA1MCwzMyAyMCwyNCIgZmlsbD0iIzE4MTgxYiIvPjxjaXJjbGUgY3g9IjUwIiBjeT0iMjQiIHI9IjIuNSIgZmlsbD0iI2Y1OWUwYiIvPjxwYXRoIGQ9Ik01MCAyNCBDNTggMjQgNjggMzQgNjggMzgiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2Y1OWUwYiIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjxwb2x5Z29uIHBvaW50cz0iNjgsMzggNzAsNDIgNjYsNDIiIGZpbGw9IiNmNTllMGIiLz48cGF0aCBkPSJNMzUgMzkgQzM1IDU1IDQwIDYyIDUwIDYyIEM2MCA2MiA2NSA1NSA2NSAzOSIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMjcyNzJhIiBzdHJva2Utd2lkdGg9IjMiIHN0cm9rZS1kYXNoYXJyYXk9IjIgMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PGNpcmNsZSBjeD0iNDQiIGN5PSIzOCIgcj0iMS43IiBmaWxsPSIjMTgxODFiIi8+PGNpcmNsZSBjeD0iNTYiIGN5PSIzOCIgcj0iMS43IiBmaWxsPSIjMTgxODFiIi8+PHBhdGggZD0iTTQ2IDQ0IFFTimesNDggNTQgNDQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzE4MTgxYiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48L3N2Zz4="
  },
  {
    id: "avatar-9",
    label: "Violet Wavy Female Tutor (Glasses)",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="#4f46e5"/><path d="M25 80 C25 65 35 60 50 60 C65 60 75 65 75 80 Z" fill="#e0e7ff"/><path d="M28 42 C24 47 24 62 26 74 C30 70 32 52 34 42 Z M72 42 C76 47 76 62 74 74 C70 70 68 52 66 42 Z" fill="#f59e0b"/><rect x="46" y="50" width="8" height="12" rx="3" fill="#ffe4e6"/><circle cx="50" cy="40" r="15" fill="#ffe4e6"/><path d="M37 28 C37 28 50 32 63 28" fill="none" stroke="#18181b" stroke-width="4" stroke-linecap="round"/><polygon points="50,15 80,24 50,33 20,24" fill="#18181b"/><circle cx="50" cy="24" r="2.5" fill="#f59e0b"/><path d="M50 24 C58 24 68 34 68 38" fill="none" stroke="#f59e0b" stroke-width="1.5" stroke-linecap="round"/><polygon points="68,38 70,42 66,42" fill="#f59e0b"/><circle cx="43" cy="38" r="5" fill="none" stroke="#18181b" stroke-width="1.5"/><circle cx="57" cy="38" r="5" fill="none" stroke="#18181b" stroke-width="1.5"/><line x1="48" y1="38" x2="52" y2="38" stroke="#18181b" stroke-width="1.5"/><circle cx="43" cy="38" r="1.5" fill="#18181b"/><circle cx="57" cy="38" r="1.5" fill="#18181b"/><path d="M46 44 Q50 48 54 44" fill="none" stroke="#18181b" stroke-width="2" stroke-linecap="round"/></svg>`,
    dataUrl: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0NiIgZmlsbD0iIzRmNDZlNSIvPjxwYXRoIGQ9Ik0yNSA4MCBDMjUgNjUgMzUgNjAgNTAgNjAgQzY1IDYwIDc1IDY1IDc1IDgwIFoiIGZpbGw9IiNlMGU3ZmYiLz48cGF0aCBkPSJNMjggNDIgQzI0IDQ3IDI0IDYyIDI2IDc0IEMzMCA3MCAzMiA1MiAzNCA0MiBaIE03MiA0MiBDNzYgNDcgNzYgNjIgNzQgNzQgQzcwIDcwIDY4IDUyIDY2IDQyIFoiIGZpbGw9IiNmNTllMGIiLz48cmVjdCB4PSI0NiIgeT0iNTAiIHdpZHRoPSI4IiBoZWlnaHQ9IjIiIHJ4PSIzIiBmaWxsPSIjZmZlNGU2Ii8+PGNpcmNsZSBjeD0iNTAiIGN5PSI0MCIgcj0iMTUiIGZpbGw9IiNmZmU0ZTYiLz48cGF0aCBkPSJNMzcgMjggQzM3IDI4IDUwIDMyIDYzIDI4IiBmaWxsPSJub25lIiBzdHJva2U9IiMxODE4MWIiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBvbHlnb24gcG9pbnRzPSI1MCwxNSA4MCwyNCA1MCwzMyAyMCwyNCIgZmlsbD0iIzE4MTgxYiIvPjxjaXJjbGUgY3g9IjUwIiBjeT0iMjQiIHI9IjIuNSIgZmlsbD0iI2Y1OWUwYiIvPjxwYXRoIGQ9Ik01MCAyNCBDNTggMjQgNjggMzQgNjggMzgiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2Y1OWUwYiIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjxwb2x5Z29uIHBvaW50cz0iNjgsMzggNzAsNDIgNjYsNDIiIGZpbGw9IiNmNTllMGIiLz48Y2lyY2xlIGN4PSI0MyIgY3k9IjM4IiByPSI1IiBmaWxsPSJub25lIiBzdHJva2U9IiMxODE4MWIiIHN0cm9rZS13aWR0aD0iMS41Ii8+PGNpcmNsZSBjeD0iNTciIGN5PSIzOCIgcj0iNSIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMTgxODFiIiBzdHJva2Utd2lkdGg9IjEuNSIvPjxsaW5lIHgxPSI0OCIgeTE9IjM4IiB4Mj0iNTIiIHkyPSIzOCIgc3Ryb2tlPSIjMTgxODFiIiBzdHJva2Utd2lkdGg9IjEuNSIvPjxjaXJjbGUgY3g9IjQzIiBjeT0iMzgiIHI9IjEuNSIgZmlsbD0iIzE4MTgxYiIvPjxjaXJjbGUgY3g9IjU3IiBjeT0iMzgiIHI9IjEuNSIgZmlsbD0iIzE4MTgxYiIvPjxGFdGggZD0iTTQ2IDQ0IFFTimesNDggNTQgNDQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzE4MTgxYiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48L3N2Zz4="
  },
  {
    id: "avatar-10",
    label: "Emerald Hijab Female Tutor",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="#059669"/><path d="M25 80 C25 65 35 60 50 60 C65 60 75 65 75 80 Z" fill="#d1fae5"/><path d="M30 38 C30 30 70 30 70 38 C70 50 66 66 50 69 C34 66 30 50 30 38 Z" fill="#f8fafc"/><rect x="46" y="50" width="8" height="12" rx="3" fill="#fdba74"/><circle cx="50" cy="44" r="11" fill="#fdba74"/><path d="M37 28 C37 28 50 32 63 28" fill="none" stroke="#18181b" stroke-width="4" stroke-linecap="round"/><polygon points="50,15 80,24 50,33 20,24" fill="#18181b"/><circle cx="50" cy="24" r="2.5" fill="#f59e0b"/><path d="M50 24 C58 24 68 34 68 38" fill="none" stroke="#f59e0b" stroke-width="1.5" stroke-linecap="round"/><polygon points="68,38 70,42 66,42" fill="#f59e0b"/><circle cx="45" cy="42" r="1.5" fill="#18181b"/><circle cx="55" cy="42" r="1.5" fill="#18181b"/><path d="M47 48 Q50 51 53 48" fill="none" stroke="#18181b" stroke-width="2" stroke-linecap="round"/></svg>`,
    dataUrl: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0NiIgZmlsbD0iIzA1OTY2OSIvPjxwYXRoIGQ9Ik0yNSA4MCBDMjUgNjUgMzUgNjAgNTAgNjAgQzY1IDYwIDc1IDY1IDc1IDgwIFoiIGZpbGw9IiNkMWZhZTUiLz48cGF0aCBkPSJNMzAgMzggQzMwIDMwIDcwIDMwIDcwIDM4IEM3MCA1MCA2NiA2NiA1MCA2OSBDMzQgNjYgMzAgNTAgMzAgMzggWiIgZmlsbD0iI2Y4ZmFmYyIvPjxyZWN0IHg9IjQ2IiB5PSI1MCIgd2lkdGg9IjgiIGhlaWdodD0iMTIiIHJ4PSIzIiBmaWxsPSIjZmRiYTc0Ii8+PGNpcmNsZSBjeD0iNTAiIGN5PSI0NCIgcj0iMTEiIGZpbGw9IiNmZGJhNzQiLz48cGF0aCBkPSJNMzcgMjggQzM3IDI4IDUwIDMyIDYzIDI4IiBmaWxsPSJub25lIiBzdHJva2U9IiMxODE4MWIiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBvbHlnb24gcG9pbnRzPSI1MCwxNSA4MCwyNCA1MCwzMyAyMCwyNCIgZmlsbD0iIzE4MTgxYiIvPjxjaXJjbGUgY3g9IjUwIiBjeT0iMjQiIHI9IjIuNSIgZmlsbD0iI2Y1OWUwYiIvPjxwYXRoIGQ9Ik01MCAyNCBDNTggMjQgNjggMzQgNjggMzgiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2Y1OWUwYiIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjxwb2x5Z29uIHBvaW50cz0iNjgsMzggNzAsNDIgNjYsNDIiIGZpbGw9IiNmNTllMGIiLz48Y2lyY2xlIGN4PSI0NSIgY3k9IjQyIiByPSIxLjUiIGZpbGw9IiMxODE4MWIiLz48Y2lyY2xlIGN4PSI1NSIgY3k9IjQyIiByPSIxLjUiIGZpbGw9IiMxODE4MWIiLz48cGF0aCBkPSJNNDcgNDggUTUwIDUxIDUzIDQ4IiBmaWxsPSJub25lIiBzdHJva2U9IiMxODE4MWIiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PC9zdmc+"
  },
  {
    id: "avatar-11",
    label: "Fuchsia Straight Hair Female Tutor",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="#c026d3"/><path d="M25 80 C25 65 35 60 50 60 C65 60 75 65 75 80 Z" fill="#fae8ff"/><path d="M30 35 V75 C30 75 28 75 26 66 V35 Z M70 35 V75 C70 75 72 75 74 66 V35 Z" fill="#7c2d12"/><rect x="46" y="50" width="8" height="12" rx="3" fill="#ffedd5"/><circle cx="50" cy="40" r="15" fill="#ffedd5"/><path d="M37 28 C37 28 50 32 63 28" fill="none" stroke="#18181b" stroke-width="4" stroke-linecap="round"/><polygon points="50,15 80,24 50,33 20,24" fill="#18181b"/><circle cx="50" cy="24" r="2.5" fill="#f59e0b"/><path d="M50 24 C58 24 68 34 68 38" fill="none" stroke="#f59e0b" stroke-width="1.5" stroke-linecap="round"/><polygon points="68,38 70,42 66,42" fill="#f59e0b"/><circle cx="44" cy="38" r="1.7" fill="#2563eb"/><circle cx="56" cy="38" r="1.7" fill="#2563eb"/><path d="M46 44 Q50 48 54 44" fill="none" stroke="#18181b" stroke-width="2" stroke-linecap="round"/></svg>`,
    dataUrl: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0NiIgZmlsbD0iI2MwMjZkMyIvPjxwYXRoIGQ9Ik0yNSA4MCBDMjUgNjUgMzUgNjAgNTAgNjAgQzY1IDYwIDc1IDY1IDc1IDgwIFoiIGZpbGw9IiNmYWU4ZmYiLz48cGF0aCBkPSJNMzAgMzUgVjc1IEMzMCA3NSAyOCA3NSAyNiA2NiBWMzUgWiBNNzAgMzUgVjc1IEM3MCA3NSA3MiA3NSA3NCA2NiBWMzUgWiIgZmlsbD0iIzdjMmQxMiIvPjxyZWN0IHg9IjQ2IiB5PSI1MCIgd2lkdGg9IjgiIGhlaWdodD0iMTIiIHJ4PSIzIiBmaWxsPSIjZmZlZGQ1Ii8+PGNpcmNsZSBjeD0iNTAiIGN5PSI0MCIgcj0iMTUiIGZpbGw9IiNmZmVkZDUiLz48cGF5aCBkPSJNMzcgMjggQzM3IDI4IDUwIDMyIDYzIDI4IiBmaWxsPSJub25lIiBzdHJva2U9IiMxODE4MWIiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBvbHlnb24gcG9pbnRzPSI1MCwxNSA4MCwyNCA1MCwzMyAyMCwyNCIgZmlsbD0iIzE4MTgxYiIvPjxjaXJjbGUgY3g9IjUwIiBjeT0iMjQiIHI9IjIuNSIgZmlsbD0iI2Y1OWUwYiIvPjxwYXRoIGQ9Ik01MCAyNCBDNTggMjQgNjggMzQgNjggMzgiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2Y1OWUwYiIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjxwb2x5Z29uIHBvaW50cz0iNjgsMzggNzAsNDIgNjYsNDIiIGZpbGw9IiNmNTllMGIiLz48Y2lyY2xlIGN4PSI0NCIgY3k9IjM4IiByPSIxLjciIGZpbGw9IiMyNTYzZWIiLz48Y2lyY2xlIGN4PSI1NiIgY3k9IjM4IiByPSIxLjciIGZpbGw9IiMyNTYzZWIiLz48cGF0aCBkPSJNNDYgNDQgUTUwIDQ4IDU0IDQ0IiBmaWxsPSJub25lIiBzdHJva2U9IiMxODE4MWIiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PC9zdmc+"
  }
];

export default function BasicProfileStep() {
  const { state, setState } = useOnboarding();
  const { personalInfo } = state;
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsSelectorOpen(false);
      }
    };
    if (isSelectorOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSelectorOpen]);

  const selectAvatar = (avatar: { id: string; svg: string }) => {
    // Use URL-encoded SVG — always renders correctly without base64 corruption
    const dataUrl = `data:image/svg+xml,${encodeURIComponent(avatar.svg.trim())}`;
    setState((prev: OnboardingState) => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        avatarUrl: dataUrl,
        selectedAvatarId: avatar.id,
      },
    }));
    toast.success("Profile avatar selected ✓");
  };

  const activeAvatarId = personalInfo.selectedAvatarId || null;


  useEffect(() => {
    const fetchSession = async () => {
      try {
        const supabase = createClient();
        if (!supabase) return;
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

  const handleSubmit = async (e: React.FormEvent) => {
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

    try {
      const res = await fetch('/api/tutor/submit-step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stepName: 'personal_info',
          data: personalInfo
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save profile draft");
      }

      setState((prev: OnboardingState) => ({
        ...prev,
        currentStep: prev.currentStep + 1
      }));
      toast.success('Profile saved successfully ✓');
    } catch (err: any) {
      toast.error(err.message || "Failed to save profile draft.");
    }
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

          {/* Profile Avatar Selection Section */}
          <div className="flex flex-col items-center sm:items-start gap-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Profile Avatar
            </label>

            <div className="relative">
              <button
                type="button"
                onClick={() => setIsSelectorOpen(true)}
                className="w-24 h-24 rounded-full overflow-hidden border-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 flex items-center justify-center relative group"
                aria-label="Choose profile avatar"
              >
                {personalInfo.avatarUrl ? (
                  <img src={personalInfo.avatarUrl} alt="Selected Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-slate-400 group-hover:text-blue-500 flex flex-col items-center">
                    <User className="w-8 h-8" />
                  </div>
                )}
                {/* Visual hover hint overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                  <span className="text-[10px] text-white font-extrabold uppercase tracking-wider">Change</span>
                </div>
              </button>

              <span className="text-[10px] text-slate-400 block mt-2 text-center sm:text-left select-none">
                Click photo to choose avatar
              </span>
            </div>
          </div>

          {/* Modal popup for Avatar Selection */}
          {isSelectorOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              {/* Overlay */}
              <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-200"
                onClick={() => setIsSelectorOpen(false)}
              />

              {/* Modal Container */}
              <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg p-6 md:p-8 shadow-2xl transition-all duration-300 z-10 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                    Select Profile Avatar
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsSelectorOpen(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-650 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                    aria-label="Close modal"
                  >
                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                  {PREDEFINED_AVATARS.map((avatar) => {
                    const isSelected = activeAvatarId === avatar.id;
                    return (
                      <button
                        key={avatar.id}
                        type="button"
                        onClick={() => {
                          selectAvatar(avatar);
                          setIsSelectorOpen(false);
                        }}
                        aria-label={`Select ${avatar.label}`}
                        aria-pressed={isSelected}
                        className={`aspect-square rounded-full overflow-hidden border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                          isSelected
                            ? "border-blue-500 scale-105 shadow-[0_0_12px_rgba(59,130,246,0.3)]"
                            : "border-slate-200 dark:border-slate-800 hover:border-blue-500/50 hover:scale-[1.03]"
                        }`}
                      >
                        <div
                          dangerouslySetInnerHTML={{ __html: avatar.svg }}
                          className="w-full h-full"
                        />
                      </button>
                    );
                  })}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setIsSelectorOpen(false)}
                    className="px-5 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-650 dark:text-slate-350 font-bold rounded-xl text-xs transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

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
