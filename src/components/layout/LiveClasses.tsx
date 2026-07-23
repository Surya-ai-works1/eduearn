"use client";

import React from "react";
import { Container } from "./Container";
import { Card } from "../ui/card";
import { Progress } from "../ui/progress";
import { Calendar, Users, Star } from "lucide-react";
import { StaggerContainer, staggerChildVariants } from "../animations";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface LiveSessionItem {
  id: string;
  title: string;
  tutorName: string;
  dateTime: string;
  seatsTotal: number;
  seatsLeft: number;
  rating: number;
}

export function LiveClasses() {
  const sessions: LiveSessionItem[] = [
    {
      id: "live-1",
      title: "Next.js 15 App Router & Server Components Code-Along",
      tutorName: "Aarav Sharma",
      dateTime: "Today, 6:00 PM IST",
      seatsTotal: 30,
      seatsLeft: 8,
      rating: 4.9,
    },
    {
      id: "live-2",
      title: "Calculus II: Double Integrals & Area Coordinates Doubt Clearing",
      tutorName: "Rohan Das",
      dateTime: "Tomorrow, 4:00 PM IST",
      seatsTotal: 25,
      seatsLeft: 5,
      rating: 4.7,
    },
    {
      id: "live-3",
      title: "Photography: Manual Exposure, DSLR Settings & Framing",
      tutorName: "Vikram Rathore",
      dateTime: "30 Jun, 3:00 PM IST",
      seatsTotal: 40,
      seatsLeft: 22,
      rating: 4.8,
    },
  ];

  return (
    <section className="w-full py-20 bg-muted/20 border-y border-border/40 select-none">
      <Container className="flex flex-col gap-12">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center gap-3">
          <span className="text-[10px] uppercase tracking-wider font-extrabold text-primary bg-primary/10 px-3 py-1 rounded-full">
            Live Interactive Rooms
          </span>
          <h2 className="text-3xl md:text-4xl font-heading font-extrabold text-foreground tracking-tight">
            Upcoming Live Classes & Doubt Rooms
          </h2>
          <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
            Reserve your seat in upcoming interactive screen-shares hosted by top student tutors. Ask questions live.
          </p>
        </div>

        {/* Live Classes Grid */}
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sessions.map((session, idx) => {
            const seatsFilled = session.seatsTotal - session.seatsLeft;
            const occupancyPercentage = Math.round((seatsFilled / session.seatsTotal) * 100);
            
            return (
              <motion.div key={session.id} variants={staggerChildVariants}>
                <Card
                  variant="default"
                  hoverEffect="lift"
                  className="flex flex-col justify-between h-full p-6 text-left border-border bg-card group relative overflow-hidden"
                >
                  <div>
                    {/* Live indicator block */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-[8px] font-extrabold text-red-500 uppercase tracking-wider">
                          {idx === 0 ? "Starting Soon" : "Upcoming Class"}
                        </span>
                      </div>
                      
                      <span className="text-[9px] text-amber-500 font-extrabold flex items-center gap-0.5">
                        <Star size={9} className="fill-amber-500" />
                        {session.rating.toFixed(1)}
                      </span>
                    </div>

                    <h4 className="text-sm font-heading font-extrabold text-foreground mt-4 group-hover:text-primary transition-colors leading-tight min-h-[40px]">
                      {session.title}
                    </h4>
                    
                    {/* Date and Time Badge */}
                    <div className="mt-4 p-2.5 rounded bg-muted/40 border border-border/30 flex items-center gap-2 text-[10px] text-muted-foreground font-semibold">
                      <Calendar size={13} className="text-primary" />
                      <span>{session.dateTime}</span>
                    </div>

                    {/* Seats Occupancy Meter */}
                    <div className="flex flex-col gap-2 mt-6">
                      <div className="flex justify-between items-center text-[9px] font-bold text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users size={11} />
                          {seatsFilled}/{session.seatsTotal} Seats Reserved
                        </span>
                        {session.seatsLeft <= 5 && (
                          <span className="text-destructive font-extrabold animate-pulse">
                            Only {session.seatsLeft} left!
                          </span>
                        )}
                      </div>
                      <Progress value={occupancyPercentage} variant={session.seatsLeft <= 5 ? "success" : "primary"} className="h-1.5" />
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      toast.success(`Registered for ${session.title}! We'll mail you the meet link.`);
                    }}
                    className="w-full text-center py-2.5 rounded-button text-[10px] font-bold uppercase tracking-wider bg-muted group-hover:bg-primary group-hover:text-white transition-colors cursor-pointer mt-8 focus:outline-none"
                  >
                    Join Free
                  </button>
                </Card>
              </motion.div>
            );
          })}
        </StaggerContainer>

      </Container>
    </section>
  );
}

export default LiveClasses;
