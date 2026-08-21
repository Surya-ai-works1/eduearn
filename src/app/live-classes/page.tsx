"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Video, Clock, User, ArrowRight, AlertCircle, FileText, Lock } from "lucide-react";
import { PageWrapper } from "../../components/layout/PageWrapper";
import { Container } from "../../components/layout/Container";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { useAuth } from "../../hooks/useAuth";

interface LiveClass {
  id: string;
  title: string;
  tutorName: string;
  category: string;
  time: string;
  duration: string;
  status: "live" | "scheduled";
  participantsCount: number;
  platform: "Google Meet" | "Zoom" | "Microsoft Teams";
  meetingLink: string;
  password?: string;
  recordingUrl?: string;
  attachments?: string;
  notes?: string;
}

const MOCK_LIVE_SESSIONS: LiveClass[] = [
  {
    id: "live-session-1",
    title: "Acoustic Guitar Chord Progressions & Song Practice",
    tutorName: "Aarav Sharma",
    category: "Music",
    time: "Live Now",
    duration: "60 mins",
    status: "live",
    participantsCount: 18,
    platform: "Google Meet",
    meetingLink: "https://meet.google.com/xyz-abc-def",
    notes: "Review basic open chords before starting."
  },
  {
    id: "live-session-2",
    title: "Figma UI/UX Layouts & Grid Systems Review",
    tutorName: "Priya Patel",
    category: "Design",
    time: "Live Now",
    duration: "45 mins",
    status: "live",
    participantsCount: 22,
    platform: "Zoom",
    meetingLink: "https://zoom.us/j/912345678",
    password: "figma_secret_key"
  },
  {
    id: "live-session-3",
    title: "Calculus Limits & Derivatives Revision (UPSC/JEE Prep)",
    tutorName: "Rohan Das",
    category: "Academics",
    time: "Today, 6:00 PM IST",
    duration: "90 mins",
    status: "scheduled",
    participantsCount: 0,
    platform: "Google Meet",
    meetingLink: "https://meet.google.com/mno-pqr-stu"
  },
  {
    id: "live-session-4",
    title: "Hip Hop Street Dance: Dance Steps & Choreography",
    tutorName: "Sneha Iyer",
    category: "Dance",
    time: "Today, 7:30 PM IST",
    duration: "60 mins",
    status: "scheduled",
    participantsCount: 0,
    platform: "Zoom",
    meetingLink: "https://zoom.us/j/987654321",
    password: "dance_passcode"
  },
  {
    id: "live-session-5",
    title: "Italian Pasta & Creamy Risottos Cooking Class",
    tutorName: "Neha Nair",
    category: "Cooking",
    time: "Tomorrow, 4:00 PM IST",
    duration: "75 mins",
    status: "scheduled",
    participantsCount: 0,
    platform: "Google Meet",
    meetingLink: "https://meet.google.com/cooking-risotto"
  },
];

export default function LiveClassesPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [filter, setFilter] = useState<"all" | "live" | "scheduled">("all");
  const [sessions, setSessions] = useState<LiveClass[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const loadSessions = () => {
      const savedStr = localStorage.getItem("eduearn_live_classes");
      const defaults = MOCK_LIVE_SESSIONS;
      if (savedStr) {
        try {
          const parsed = JSON.parse(savedStr) as any[];
          const dynamicList = parsed.map((item: any) => ({
            id: item.id,
            title: item.title,
            tutorName: "Sneha Iyer (Verified Tutor)",
            category: item.platform === "Zoom" ? "Creative Media" : "Technology",
            time: item.time,
            duration: "60 mins",
            status: item.status === "Cancelled" ? "scheduled" as const : "live" as const,
            participantsCount: 12,
            platform: item.platform,
            meetingLink: item.meetingLink,
            password: item.password,
            recordingUrl: item.recordingUrl,
            attachments: item.attachments,
            notes: item.notes,
            cancelled: item.status === "Cancelled"
          }));
          
          // Filter out cancelled classes
          const activeDynamics = dynamicList.filter((d: any) => !d.cancelled);
          setSessions([...activeDynamics, ...defaults]);
        } catch {
          setSessions(defaults);
        }
      } else {
        setSessions(defaults);
      }
    };

    loadSessions();
    window.addEventListener("storage", loadSessions);
    return () => window.removeEventListener("storage", loadSessions);
  }, []);

  const filteredSessions = sessions.filter((s) => {
    if (filter === "all") return true;
    return s.status === filter;
  });

  return (
    <PageWrapper>
      <div className="min-h-[85vh] py-12 bg-background select-none text-left relative overflow-hidden">
        {/* Background gradients */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.08),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(244,63,94,0.05),transparent_32%)]"
        />

        <Container className="max-w-5xl relative z-10 flex flex-col gap-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border/40 pb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-rose-500 mb-1">
                <Video size={14} className="animate-pulse" />
                <span>EduEarn Virtual Campus</span>
              </div>
              <h1 className="text-3xl font-heading font-extrabold text-foreground tracking-tight">
                Live Peer Classrooms
              </h1>
              <p className="text-sm text-muted-foreground max-w-xl">
                Join live video sessions, share code-alongs, draw on collaborative whiteboards, and get your doubts cleared in real-time.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-card border border-border shadow-sm hover:shadow-md transition-shadow duration-200 p-1 rounded-button shrink-0 shadow-soft">
              {(["all", "live", "scheduled"] as const).map((opt) => (
                <button
                  key={opt}
                  onClick={() => setFilter(opt)}
                  className={`px-4 py-1.5 text-xs font-bold rounded-button cursor-pointer capitalize transition-all focus:outline-none ${
                    filter === opt
                      ? "bg-primary text-white shadow-soft"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSessions.map((session) => {
              const isLive = session.status === "live";
              return (
                <Card
                  key={session.id}
                  variant="glass"
                  className={`p-6 border-border/40 flex flex-col justify-between h-[280px] shadow-soft relative overflow-hidden group hover:border-primary/30 transition-all duration-300 ${
                    isLive ? "bg-rose-500/[0.01]" : "bg-card"
                  }`}
                >
                  {/* Badge & Platform */}
                  <div className="flex items-center justify-between">
                    <Badge variant={isLive ? "danger" : "secondary"} className="text-[9px] font-extrabold tracking-wider uppercase px-2 py-0.5">
                      {isLive ? "🔴 LIVE NOW" : "📅 SCHEDULED"}
                    </Badge>
                    <span className="text-[9px] font-extrabold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/10 select-none">
                      {session.platform}
                    </span>
                  </div>

                  {/* Title & Tutor */}
                  <div className="space-y-1.5 mt-4">
                    <h3 className="text-xs font-heading font-extrabold text-foreground tracking-tight line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                      {session.title}
                    </h3>
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground font-semibold">
                      <span className="flex items-center gap-1.5"><User size={11} /> {session.tutorName}</span>
                      <span className="text-[9px] bg-muted/65 px-1.5 py-0.5 rounded font-bold">{session.category}</span>
                    </div>
                  </div>

                  {/* Class Notes */}
                  {session.notes && (
                    <p className="text-[9px] italic text-muted-foreground/80 line-clamp-2 leading-snug mt-2 bg-muted/20 p-2 rounded border border-border/20">
                      &ldquo;Notes: {session.notes}&rdquo;
                    </p>
                  )}

                  {/* Actions & Timings */}
                  <div className="flex items-center justify-between border-t border-border/30 pt-4 mt-4">
                    <div className="flex flex-col gap-1 text-left font-bold text-muted-foreground text-[10px]">
                      <span className="flex items-center gap-1"><Clock size={11} /> {session.time}</span>
                      {isAuthenticated && session.password && (
                        <span className="flex items-center gap-1 text-[8px] text-indigo-500 font-extrabold"><Lock size={9} /> Passcode: {session.password}</span>
                      )}
                      {!isAuthenticated && (
                        <span className="text-[9px] text-muted-foreground font-semibold">Live access included with enrolled course</span>
                      )}
                      {session.attachments && isAuthenticated && (
                        <a
                          href={session.attachments}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[9px] text-primary underline hover:text-primary-hover font-semibold flex items-center gap-0.5 mt-0.5"
                        >
                          <FileText size={10} /> Resources PDF
                        </a>
                      )}
                    </div>

                    {isAuthenticated ? (
                      <Button
                        onClick={() => {
                          window.open(session.meetingLink, "_blank");
                        }}
                        size="sm"
                        className={`h-8 px-4 text-[10px] font-extrabold gap-1.5 shadow-soft ${
                          isLive ? "bg-rose-500 hover:bg-rose-600 text-white" : ""
                        }`}
                      >
                        Join Class
                        <ArrowRight size={11} />
                      </Button>
                    ) : (
                      <Button
                        onClick={() => {
                          router.push("/courses");
                        }}
                        variant="outline"
                        size="sm"
                        className="h-8 px-3 text-[10px] font-bold"
                      >
                        View Course
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}

            {filteredSessions.length === 0 && (
              <div className="col-span-full py-16 flex flex-col items-center justify-center text-center gap-3">
                <AlertCircle size={32} className="text-muted-foreground/80" />
                <div>
                  <h4 className="text-sm font-bold text-foreground">No Live Classes Found</h4>
                  <p className="text-xs text-muted-foreground mt-1">Check back later for active schedules.</p>
                </div>
              </div>
            )}
          </div>
        </Container>
      </div>
    </PageWrapper>
  );
}
