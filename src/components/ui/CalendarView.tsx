"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "./button";

export interface CalendarEvent {
  id: string;
  title: string;
  time: string; // e.g. "5:00 PM"
  date: Date;
  tutorName?: string;
  type?: "live" | "recorded" | "assignment" | "quiz";
  color?: string; // e.g. "rose", "blue", "emerald"
}

interface CalendarViewProps {
  events: CalendarEvent[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

export function CalendarView({ events, selectedDate, onSelectDate }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const monthName = currentMonth.toLocaleString("default", { month: "long" });
  const year = currentMonth.getFullYear();

  // Create array of empty slots for first day offset
  const blankDays = Array(firstDay).fill(null);
  
  // Create array of days in month
  const monthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Check if a day has events
  const getEventsForDay = (dayNum: number) => {
    return events.filter((event) => {
      const eDate = new Date(event.date);
      return (
        eDate.getDate() === dayNum &&
        eDate.getMonth() === currentMonth.getMonth() &&
        eDate.getFullYear() === currentMonth.getFullYear()
      );
    });
  };

  const isToday = (dayNum: number) => {
    const today = new Date();
    return (
      today.getDate() === dayNum &&
      today.getMonth() === currentMonth.getMonth() &&
      today.getFullYear() === currentMonth.getFullYear()
    );
  };

  const isSelected = (dayNum: number) => {
    return (
      selectedDate.getDate() === dayNum &&
      selectedDate.getMonth() === currentMonth.getMonth() &&
      selectedDate.getFullYear() === currentMonth.getFullYear()
    );
  };

  return (
    <div className="bg-card text-card-foreground border border-border rounded-card p-5 shadow-soft select-none text-xs">
      {/* Month & Year header */}
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-heading font-extrabold uppercase text-foreground text-xs flex items-center gap-2">
          <CalendarIcon size={14} className="text-primary-blue" />
          {monthName} {year}
        </h4>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrevMonth}
            className="h-8 w-8 p-0 hover:bg-muted/60"
            aria-label="Previous month"
          >
            <ChevronLeft size={16} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNextMonth}
            className="h-8 w-8 p-0 hover:bg-muted/60"
            aria-label="Next month"
          >
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 text-center font-bold text-[9px] uppercase tracking-wider text-muted-foreground mb-2">
        <span>Sun</span>
        <span>Mon</span>
        <span>Tue</span>
        <span>Wed</span>
        <span>Thu</span>
        <span>Fri</span>
        <span>Sat</span>
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {blankDays.map((_, index) => (
          <div key={`blank-${index}`} className="aspect-square" />
        ))}
        {monthDays.map((day) => {
          const dayEvents = getEventsForDay(day);
          const hasEvents = dayEvents.length > 0;
          const selected = isSelected(day);
          const today = isToday(day);

          return (
            <button
              key={day}
              onClick={() => {
                onSelectDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day));
              }}
              title={hasEvents ? dayEvents.map(e => `[${e.type?.toUpperCase() || "EVENT"}] ${e.title} (${e.time})`).join("\n") : "No events"}
              className={`aspect-square rounded-lg flex flex-col items-center justify-center relative hover:bg-muted/60 cursor-pointer focus:outline-none transition-all ${
                selected
                  ? "bg-primary text-white hover:bg-primary/95 shadow-sm font-bold"
                  : today
                  ? "border border-primary-blue/30 text-primary-blue font-bold"
                  : "text-foreground"
              }`}
            >
              <span>{day}</span>
              {/* Event indicators */}
              {hasEvents && (
                <div className="absolute bottom-1.5 flex gap-0.5 justify-center">
                  {dayEvents.slice(0, 3).map((event, idx) => (
                    <span
                      key={event.id + idx}
                      className={`w-1 h-1 rounded-full ${
                        selected
                          ? "bg-white"
                          : event.color === "blue"
                          ? "bg-blue-500"
                          : event.color === "rose"
                          ? "bg-rose-500"
                          : "bg-emerald-500"
                      }`}
                    />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
export default CalendarView;
