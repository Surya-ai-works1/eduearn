"use client";
import React, { useState } from 'react';
import { useOnboarding, OnboardingState } from '@/context/OnboardingContext';
import { languageOptions } from '@/mock/data/languages';

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

  const toggleSlot = (day: string, slot: string) => {
    setSlots(prev => {
      const daySlots = prev[day] || [];
      const updated = daySlots.includes(slot)
        ? daySlots.filter(s => s !== slot)
        : [...daySlots, slot];
      return { ...prev, [day]: updated };
    });
  };

  const handleSaveAndProceed = (e: React.FormEvent) => {
    e.preventDefault();
    setState((prev: OnboardingState) => ({
      ...prev,
      teachingSetup: {
        ...prev.teachingSetup,
        teachingMode,
        hourlyRate,
        sessionDuration,
        freeDemo,
        preferredLanguage,
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
    }));
    goNext();
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Teaching Setup</h2>
      <form onSubmit={handleSaveAndProceed} className="space-y-6">
        
        {/* Row 1: Mode, Language, Batch Size */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Teaching Mode</label>
            <select
              value={teachingMode}
              onChange={e => setTeachingMode(e.target.value as any)}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 p-2"
            >
              <option value="Online">Online Only</option>
              <option value="Offline">Offline Only</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Preferred Language</label>
            <select
              value={preferredLanguage}
              onChange={e => setPreferredLanguage(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 p-2"
            >
              {languageOptions.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Max Students / Batch</label>
            <input
              type="number"
              min={1}
              max={100}
              value={preferredBatchSize}
              onChange={e => setPreferredBatchSize(parseInt(e.target.value) || 25)}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 p-2"
            />
          </div>
        </div>

        {/* Row 2: Timezone, Session Duration, Max Hours */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Timezone</label>
            <select
              value={timezone}
              onChange={e => setTimezone(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 p-2"
            >
              <option value="IST (UTC+5:30)">India Standard Time (IST)</option>
              <option value="EST (UTC-5:00)">Eastern Standard Time (EST)</option>
              <option value="GMT (UTC+0:00)">Greenwich Mean Time (GMT)</option>
              <option value="PST (UTC-8:00)">Pacific Standard Time (PST)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Session Duration</label>
            <select
              value={sessionDuration}
              onChange={e => setSessionDuration(parseInt(e.target.value) || 60)}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 p-2"
            >
              <option value={30}>30 Minutes</option>
              <option value={45}>45 Minutes</option>
              <option value={60}>60 Minutes</option>
              <option value={90}>90 Minutes</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Max Hours / Day ({maxHoursPerDay} hrs)</label>
            <input
              type="range"
              min={1}
              max={12}
              value={maxHoursPerDay}
              onChange={e => setMaxHoursPerDay(parseInt(e.target.value) || 4)}
              className="mt-2 w-full accent-blue-600"
            />
          </div>
        </div>

        {/* Row 3: Pricing & Demo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Hourly Rate (USD / hr)</label>
            <div className="relative mt-1 rounded-md shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <span className="text-gray-500 dark:text-gray-400 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                min={5}
                max={200}
                value={hourlyRate}
                onChange={e => setHourlyRate(parseInt(e.target.value) || 30)}
                className="block w-full rounded-md border-gray-300 dark:border-gray-600 pl-7 bg-white dark:bg-gray-700 p-2"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3 mt-4 md:mt-6">
            <input
              type="checkbox"
              id="freeDemo"
              checked={freeDemo}
              onChange={e => setFreeDemo(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="freeDemo" className="text-sm font-medium text-gray-700 dark:text-gray-200 select-none">
              Offer a 30-minute free demo class
            </label>
          </div>
        </div>

        {/* Availability Scheduler */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Weekly Schedule</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DAYS_OF_WEEK.map(day => {
              const daySlots = slots[day] || [];
              return (
                <div key={day} className="p-4 border dark:border-gray-700 rounded bg-gray-50 dark:bg-gray-900/40">
                  <span className="font-bold text-gray-800 dark:text-gray-300 block mb-2">{day}</span>
                  <div className="grid grid-cols-2 gap-2">
                    {TIME_SLOTS.map(slot => {
                      const isSelected = daySlots.includes(slot);
                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => toggleSlot(day, slot)}
                          className={`p-2 text-xs rounded text-center transition-all ${
                            isSelected
                              ? 'bg-blue-600 text-white font-semibold'
                              : 'bg-white dark:bg-gray-850 hover:bg-gray-100 dark:hover:bg-gray-700 border dark:border-gray-700 text-gray-600 dark:text-gray-400'
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

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 border-t pt-6 dark:border-t-gray-700">
          <button
            type="button"
            onClick={goBack}
            className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            Back
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Next
          </button>
        </div>
      </form>
    </div>
  );
}
