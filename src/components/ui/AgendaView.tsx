"use client";

import React from "react";
import { Clock, User, CalendarDays, Video } from "lucide-react";
import { Button } from "./button";
import { CalendarEvent } from "./CalendarView";

interface AgendaViewProps {
  events: CalendarEvent[];
  selectedDate: Date;
  onJoinEvent: (eventId: string) => void;
  emptyStateMessage?: string;
}

export function AgendaView({
  events,
  selectedDate,
  onJoinEvent,
  emptyStateMessage = "No live sessions scheduled for this date."
}: AgendaViewProps) {
  // Filter events for the selected date
  const filteredEvents = events.filter((event) => {
    const eDate = new Date(event.date);
    return (
      eDate.getDate() === selectedDate.getDate() &&
      eDate.getMonth() === selectedDate.getMonth() &&
      eDate.getFullYear() === selectedDate.getFullYear()
    );
  });

  const formattedDate = selectedDate.toLocaleDateString("default", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
  });

  return (
    <div className="bg-card text-card-foreground border border-border rounded-card p-5 shadow-soft select-none text-xs flex flex-col h-full min-h-[300px]">
      <div className="border-b border-border/60 pb-3 mb-4 flex justify-between items-center shrink-0">
        <div>
          <h4 className="font-heading font-extrabold uppercase text-foreground text-xs">
            Agenda Details
          </h4>
          <p className="text-[10px] text-muted-foreground mt-0.5 font-semibold">
            {formattedDate}
          </p>
        </div>
        <span className="text-[9px] text-muted-foreground bg-muted px-2 py-0.5 rounded font-black">
          {filteredEvents.length} {filteredEvents.length === 1 ? "Session" : "Sessions"}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
        {filteredEvents.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-muted-foreground/80">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-2 border border-border/40">
              <CalendarDays size={18} />
            </div>
            <p className="font-medium text-[10px] leading-relaxed text-muted-foreground max-w-[200px]">
              {emptyStateMessage}
            </p>
          </div>
        ) : (
          filteredEvents.map((event) => {
            const isLive = event.type === "live";
            
            return (
              <div
                key={event.id}
                className="border border-border/80 bg-card p-4 rounded-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-soft"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${
                    event.color === "blue"
                      ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                      : event.color === "rose"
                      ? "bg-rose-500/10 text-rose-500 border-rose-500/20"
                      : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                  }`}>
                    <Video size={18} />
                  </div>
                  <div className="min-w-0">
                    <h5 className="font-bold text-foreground truncate text-xs">
                      {event.title}
                    </h5>
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 mt-1 text-[10px] text-muted-foreground font-semibold">
                      <span className="flex items-center gap-1">
                        <Clock size={11} />
                        {event.time}
                      </span>
                      {event.tutorName && (
                        <span className="flex items-center gap-1">
                          <User size={11} />
                          Tutor: {event.tutorName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {isLive && (
                    <span className="text-[9px] font-black text-rose-500 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20 uppercase tracking-wide">
                      Live
                    </span>
                  )}
                  <Button
                    size="sm"
                    onClick={() => onJoinEvent(event.id)}
                    className="h-8 text-[10px] font-bold shadow-soft"
                  >
                    Join Classroom
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
export default AgendaView;
