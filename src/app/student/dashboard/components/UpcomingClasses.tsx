"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Calendar, Clock, Activity, ArrowUpRight } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { CalendarView, CalendarEvent } from "../../../../components/ui/CalendarView";
import { DashboardCard } from "./DashboardCard";
import { navigateToClassroom } from "../../../../features/classroom/utils/navigation";

interface UpcomingClassesProps {
  countdownSeconds: number;
  formattedCountdown: string;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  dateEventsList: Array<{ title: string; time: string; type: string }>;
  calendarEvents: CalendarEvent[];
  setActiveTab: (tab: string) => void;
}

export function UpcomingClasses({
  countdownSeconds,
  formattedCountdown,
  selectedDate,
  setSelectedDate,
  dateEventsList,
  calendarEvents,
  setActiveTab,
}: UpcomingClassesProps) {
  const router = useRouter();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 pb-2">
        <h3 className="text-xs font-heading font-extrabold uppercase tracking-widest text-slate-800 dark:text-slate-200">
          Upcoming Schedule &amp; Classes
        </h3>
        <button
          onClick={() => setActiveTab("live-classes")}
          className="text-xs text-primary hover:underline font-bold focus:outline-none"
        >
          View full calendar
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.8fr_1fr] gap-6">
        {/* Left block: Live classes countdown & interactive calendar */}
        <div className="space-y-6">
          {/* Live Countdown & Join card */}
          <DashboardCard
            variant="glass"
            className="p-5 border-rose-500/20 bg-gradient-to-r from-rose-500/5 to-orange-500/5 dark:bg-slate-900/65 flex flex-col md:flex-row items-center justify-between gap-5 shadow-soft"
          >
            <div className="space-y-1.5 text-left w-full">
              <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest bg-rose-500/10 px-2.5 py-1 rounded-full inline-block">
                Starts In
              </span>
              <h4 className="text-2xl font-heading font-black text-slate-800 dark:text-slate-100 mt-1.5">
                {formattedCountdown}
              </h4>
              <p className="text-xs text-slate-700 dark:text-slate-350 font-bold">
                🎹 Keyboard Practice Session with Aarav Sharma
              </p>
              <div className="flex items-center gap-4 text-[10px] text-slate-500 dark:text-slate-400 mt-2 font-medium">
                <span>Teacher: Aarav Sharma</span>
                <span>·</span>
                <span>Duration: 60 mins</span>
              </div>
            </div>

            <div className="shrink-0 flex flex-col gap-2 w-full md:w-auto">
              <Button
                onClick={() => navigateToClassroom(router, "live-keyboard")}
                className="bg-rose-500 hover:bg-rose-600 border-rose-500 text-white gap-2 text-xs h-10 w-full md:w-auto font-bold rounded-xl"
              >
                <Calendar size={14} /> Join Live Class
              </Button>
              <span className="text-[9px] text-slate-400 dark:text-slate-500 text-center flex items-center justify-center gap-1 font-semibold">
                <Activity size={10} className="text-emerald-500" /> Hosted on Google Meet classroom
              </span>
            </div>
          </DashboardCard>

          {/* Interactive Calendar view details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CalendarView
              events={calendarEvents}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
            />

            {/* Custom date events render panel */}
            <DashboardCard
              variant="default"
              hoverEffect="none"
              className="p-5 flex flex-col gap-4 text-left border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900/60"
            >
              <h4 className="text-[10px] font-heading font-black uppercase text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-1.5 tracking-wider">
                Events for {selectedDate.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
              </h4>
              
              <div className="flex flex-col gap-3 grow overflow-y-auto max-h-[160px] scrollbar-none">
                {dateEventsList.map((evt, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-850 rounded-xl flex flex-col gap-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[8px] font-black uppercase bg-primary/10 text-primary px-1.5 py-0.5 rounded-lg">
                        {evt.type}
                      </span>
                      <span className="text-[9px] font-semibold text-slate-400">{evt.time}</span>
                    </div>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-350 mt-1 leading-snug">{evt.title}</span>
                  </div>
                ))}
              </div>
            </DashboardCard>
          </div>
        </div>

        {/* Right column: Quick events log or slot booking */}
        <DashboardCard
          variant="default"
          hoverEffect="none"
          className="p-5 flex flex-col justify-between border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900/60"
        >
          <div className="space-y-4">
            <h4 className="text-[10px] font-heading font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-1.5">
              Available Tutors Online
            </h4>
            <div className="space-y-3">
              {[
                { name: "Sneha Iyer", category: "💃 Kuchipudi Dance", status: "Active Now" },
                { name: "Vikram Rathore", category: "💻 Python Programming", status: "Active Now" },
                { name: "Aarav Sharma", category: "🎹 Keyboard/Music", status: "Online" },
              ].map((tutor, index) => (
                <div key={index} className="flex items-center justify-between text-xs p-1">
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{tutor.name}</span>
                    <span className="text-[9px] text-slate-400">{tutor.category}</span>
                  </div>
                  <span className="text-[9px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-lg font-bold">
                    {tutor.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Button
            onClick={() => router.push("/tutors")}
            variant="outline"
            className="w-full text-xs font-bold h-9 mt-4 rounded-xl gap-1 justify-center border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300"
          >
            Find peer tutors <ArrowUpRight className="w-3.5 h-3.5" />
          </Button>
        </DashboardCard>
      </div>
    </div>
  );
}
export default UpcomingClasses;
