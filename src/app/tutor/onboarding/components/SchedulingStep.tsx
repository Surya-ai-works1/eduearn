"use client";
import React, { useState } from 'react';
import { useOnboarding, OnboardingState } from '@/context/OnboardingContext';
import { Calendar, Sparkles, ChevronRight, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TIME_SLOTS = [
  '09:00 AM - 10:00 AM (Morning)',
  '10:00 AM - 11:00 AM (Morning)',
  '11:00 AM - 12:00 PM (Morning)',
  '02:00 PM - 03:00 PM (Afternoon)',
  '03:00 PM - 04:00 PM (Afternoon)',
  '04:00 PM - 05:00 PM (Afternoon)',
  '06:00 PM - 07:00 PM (Evening)',
  '07:00 PM - 08:00 PM (Evening)',
];

export default function SchedulingStep() {
  const { state, setState, goBack } = useOnboarding();
  const { teachingSetup } = state;

  const [timezone, setTimezone] = useState(teachingSetup.availability.timezone || 'IST (UTC+5:30)');
  const [maxHoursPerDay, setMaxHoursPerDay] = useState(teachingSetup.availability.maxHoursPerDay || 4);
  const [maxStudents, setMaxStudents] = useState(teachingSetup.availability.maxStudents || 5);
  const [maxSessions, setMaxSessions] = useState(teachingSetup.availability.maxSessions || 10);
  const [holidayMode, setHolidayMode] = useState(teachingSetup.availability.holidayMode || false);
  const [slots, setSlots] = useState<Record<string, string[]>>(teachingSetup.availability.slots || {});

  React.useEffect(() => {
    setTimezone(teachingSetup.availability.timezone || 'IST (UTC+5:30)');
    setMaxHoursPerDay(teachingSetup.availability.maxHoursPerDay || 4);
    setMaxStudents(teachingSetup.availability.maxStudents || 5);
    setMaxSessions(teachingSetup.availability.maxSessions || 10);
    setHolidayMode(teachingSetup.availability.holidayMode || false);
    setSlots(teachingSetup.availability.slots || {});
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.keys(slots).length === 0 || Object.values(slots).every(s => s.length === 0)) {
      toast.warning('Please select at least one availability slot.');
      return;
    }

    setState((prev: OnboardingState) => ({
      ...prev,
      teachingSetup: {
        ...prev.teachingSetup,
        availability: {
          timezone,
          maxHoursPerDay,
          slots,
          maxStudents,
          maxSessions,
          holidayMode
        }
      },
      currentStep: prev.currentStep + 1
    }));
    toast.success('Availability slots saved ✓');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start max-w-[1200px] mx-auto">
      {/* FORM CARD */}
      <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.03)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] p-6 md:p-10 transition-all duration-300">
        <div className="mb-8 border-b border-slate-100 dark:border-slate-800 pb-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-8 h-8 text-blue-600" />
            Scheduling & Availability
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Set up your tutoring timezone, slot allocations, and holiday schedules.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Timezone</label>
              <select
                value={timezone}
                onChange={e => setTimezone(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition text-sm"
              >
                <option value="IST (UTC+5:30)">🇮🇳 India Standard Time (IST)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Max Hours / Day ({maxHoursPerDay} hrs)</label>
              <input
                type="range"
                min={1}
                max={12}
                value={maxHoursPerDay}
                onChange={e => setMaxHoursPerDay(parseInt(e.target.value) || 4)}
                className="mt-3.5 w-full accent-blue-600 bg-slate-100 dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-550 dark:text-slate-400 mb-2">Max Students / Class</label>
              <input
                type="number"
                min={1}
                value={maxStudents}
                onChange={e => setMaxStudents(parseInt(e.target.value) || 1)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-550 dark:text-slate-400 mb-2">Max Sessions / Week</label>
              <input
                type="number"
                min={1}
                value={maxSessions}
                onChange={e => setMaxSessions(parseInt(e.target.value) || 1)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition text-sm"
              />
            </div>

            <div className="md:col-span-2 flex items-center space-x-3 bg-slate-50 dark:bg-slate-950/20 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <input
                type="checkbox"
                id="holidayMode"
                checked={holidayMode}
                onChange={e => setHolidayMode(e.target.checked)}
                className="h-4 w-4 rounded border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="holidayMode" className="text-sm font-semibold text-slate-700 dark:text-slate-300 select-none cursor-pointer">
                Enable Holiday Mode (Mute bookings/scheduling temporarily)
              </label>
            </div>
          </div>

          {/* Weekly Scheduler */}
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Weekly Schedule Slots</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {DAYS_OF_WEEK.map(day => {
                const daySlots = slots[day] || [];
                return (
                  <div key={day} className="p-4 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/30 dark:bg-slate-950/15">
                    <span className="font-extrabold text-sm text-slate-700 dark:text-slate-300 block mb-3">{day}</span>
                    <div className="grid grid-cols-2 gap-2">
                      {TIME_SLOTS.map(slot => {
                        const isSelected = daySlots.includes(slot);
                        return (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => toggleSlot(day, slot)}
                            className={`p-2.5 text-[10px] font-bold rounded-lg text-center transition-all ${
                              isSelected
                                ? 'bg-blue-600 text-white shadow-[0_0_12px_rgba(37,99,235,0.3)]'
                                : 'bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-400'
                            }`}
                          >
                            {slot.split(' (')[0]}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

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
              className="px-8 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-650 hover:from-blue-700 hover:to-indigo-750 text-white font-bold rounded-xl shadow-lg transition"
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
            Scheduling Help
          </h4>
          <ul className="text-xs space-y-3 text-slate-600 dark:text-slate-400 leading-relaxed list-disc pl-4">
            <li>
              Select slots matching the times you are available to conduct live video calls.
            </li>
            <li>
              Students will book sessions inside these active intervals.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
