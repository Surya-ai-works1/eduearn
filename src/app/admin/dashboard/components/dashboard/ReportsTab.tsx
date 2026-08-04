"use client";

import React, { useState, useEffect } from "react";
import { ClipboardList, Search, Eye, CheckCircle2, ShieldAlert, AlertTriangle, Filter, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ModerationReport {
  id: string;
  title: string;
  category: "Copyright Infringement" | "Abusive Conduct" | "Inappropriate Content" | "Spam/Scam";
  reporter: string;
  accused: string;
  reportedItemId: string; // Course ID or User ID
  description: string;
  severity: "Low" | "Medium" | "High";
  status: "Open" | "Investigation" | "Resolved";
  dateReported: string;
}

export default function ReportsTab() {
  const [reports, setReports] = useState<ModerationReport[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Open" | "Investigation" | "Resolved">("All");
  const [selectedReport, setSelectedReport] = useState<ModerationReport | null>(null);

  const defaultReports: ModerationReport[] = [
    { id: "rep-1", title: "Flagged Course Content - React Native Hacks", category: "Copyright Infringement", reporter: "Deepak S.", accused: "Amit Verma", reportedItemId: "c-1", description: "The section on custom hooks has copy-pasted slides directly from paid Udemy contents.", severity: "Medium", status: "Open", dateReported: "2026-07-30" },
    { id: "rep-2", title: "Unprofessional chat conduct during Live Session", category: "Abusive Conduct", reporter: "Pooja Hegde", accused: "Rahul Verma", reportedItemId: "u-1", description: "The student used inappropriate words and spammed the meeting chat box.", severity: "High", status: "Investigation", dateReported: "2026-08-01" },
    { id: "rep-3", title: "Spammy course template blueprint description", category: "Spam/Scam", reporter: "Surya K", accused: "Sneha Iyer", reportedItemId: "v-2", description: "Creating multiple identical placeholder drafts with referral code links.", severity: "Low", status: "Resolved", dateReported: "2026-07-25" }
  ];

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("eduearn_moderation_reports");
      if (stored) {
        try {
          setReports(JSON.parse(stored));
        } catch {
          setReports(defaultReports);
        }
      } else {
        localStorage.setItem("eduearn_moderation_reports", JSON.stringify(defaultReports));
        setReports(defaultReports);
      }
    }
  }, []);

  const saveReports = (updated: ModerationReport[]) => {
    setReports(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("eduearn_moderation_reports", JSON.stringify(updated));
    }
  };

  const handleResolve = (id: string) => {
    const updated = reports.map(r => r.id === id ? { ...r, status: "Resolved" as const } : r);
    saveReports(updated);
    if (selectedReport && selectedReport.id === id) {
      setSelectedReport({ ...selectedReport, status: "Resolved" });
    }
    toast.success("Moderation ticket resolved successfully.");
  };

  const handleInvestigate = (id: string) => {
    const updated = reports.map(r => r.id === id ? { ...r, status: "Investigation" as const } : r);
    saveReports(updated);
    if (selectedReport && selectedReport.id === id) {
      setSelectedReport({ ...selectedReport, status: "Investigation" });
    }
    toast.success("Ticket set to active investigation.");
  };

  const handleDismiss = (id: string) => {
    const updated = reports.filter(r => r.id !== id);
    saveReports(updated);
    setSelectedReport(null);
    toast.success("Moderation report dismissed.");
  };

  const filteredReports = reports.filter(r => {
    const matchesSearch = 
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.reporter.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.accused.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = statusFilter === "All" || r.status === statusFilter;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 text-left select-none pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-4 rounded-xl border border-border shadow-soft">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary flex items-center gap-1.5">
            <ClipboardList size={13} className="animate-pulse" /> Operations Trust &amp; Safety
          </span>
          <h2 className="text-xl font-heading font-black text-foreground tracking-tight mt-1">
            System Moderation Reports
          </h2>
        </div>
        <div className="flex gap-2">
          {["All", "Open", "Investigation", "Resolved"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status as any)}
              className={`text-[9.5px] uppercase font-extrabold px-3 py-1 rounded-full border transition-all ${
                statusFilter === status 
                  ? "bg-primary text-white border-primary/25 shadow-soft" 
                  : "bg-card text-muted-foreground hover:text-foreground border-border"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Search Filter Bar */}
      <div className="flex items-center gap-3 bg-card border border-border p-3.5 rounded-xl shadow-soft">
        <div className="relative border border-border rounded-button bg-muted/20 flex items-center px-3 gap-2 py-1.5 flex-grow">
          <Search size={14} className="text-muted-foreground shrink-0" />
          <input
            type="text"
            placeholder="Search moderation reports by title, description, reporter, or accused party..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none text-xs text-foreground placeholder:text-muted-foreground focus:outline-none w-full font-bold"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Reports List */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border border-border/80 bg-card/60 shadow-soft p-4 space-y-3.5">
            <div className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest block border-b border-border/30 pb-2">
              Recent Incident Log Listings ({filteredReports.length})
            </div>

            <div className="space-y-3">
              {filteredReports.length === 0 ? (
                <div className="py-12 text-center text-xs text-muted-foreground/60 font-semibold">
                  No moderation reports matching criteria.
                </div>
              ) : (
                filteredReports.map((r) => {
                  const sevColor = 
                    r.severity === "High" ? "bg-rose-500/10 text-rose-500 border-rose-500/15" :
                    r.severity === "Medium" ? "bg-amber-500/10 text-amber-500 border-amber-500/15" :
                    "bg-slate-500/10 text-slate-500 border-slate-500/15";
                  
                  const statusColor = 
                    r.status === "Open" ? "bg-red-500/10 text-red-500 border-red-500/15" :
                    r.status === "Investigation" ? "bg-amber-500/10 text-amber-500 border-amber-500/15" :
                    "bg-emerald-500/10 text-emerald-500 border-emerald-500/15";

                  return (
                    <div 
                      key={r.id}
                      onClick={() => setSelectedReport(r)}
                      className={`p-4 border rounded-xl cursor-pointer transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 ${
                        selectedReport?.id === r.id 
                          ? "bg-primary/5 border-primary shadow-soft" 
                          : "bg-card hover:bg-muted/15 border-border"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${sevColor}`}>{r.severity}</span>
                          <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${statusColor}`}>{r.status}</span>
                        </div>
                        <h4 className="font-extrabold text-foreground text-xs sm:text-sm mt-1">{r.title}</h4>
                        <div className="text-[10px] text-muted-foreground/60 font-semibold">
                          Reporter: <span className="text-foreground">{r.reporter}</span> &bull; Accused: <span className="text-foreground">{r.accused}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 shrink-0 select-none">
                        <span className="text-[10px] text-muted-foreground font-semibold"><Calendar size={12} className="inline mr-1" /> {r.dateReported}</span>
                        <Button size="sm" variant="ghost" className="p-1.5"><Eye size={13} /></Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>

        {/* Report Inspection Sidebar details */}
        <div>
          {selectedReport ? (
            <Card className="border border-border/80 bg-card p-6 space-y-5 shadow-soft">
              <div className="border-b border-border/40 pb-3">
                <span className="text-[9px] font-black uppercase tracking-wider text-primary">Incident Audit Workspace</span>
                <h3 className="font-heading font-black text-foreground text-sm mt-1">{selectedReport.title}</h3>
                <span className="text-[9.5px] text-muted-foreground font-semibold">ID: {selectedReport.id}</span>
              </div>

              <div className="space-y-4 text-xs font-semibold text-muted-foreground">
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="p-2.5 bg-muted/20 border border-border/30 rounded-lg">
                    <span className="text-[9px] text-muted-foreground uppercase block mb-1">Reporter</span>
                    <span className="text-foreground font-extrabold">{selectedReport.reporter}</span>
                  </div>
                  <div className="p-2.5 bg-muted/20 border border-border/30 rounded-lg">
                    <span className="text-[9px] text-muted-foreground uppercase block mb-1">Accused</span>
                    <span className="text-foreground font-extrabold">{selectedReport.accused}</span>
                  </div>
                </div>

                <div className="p-3 bg-muted/10 border border-border/30 rounded-lg">
                  <span className="text-[9px] text-muted-foreground uppercase block mb-1">Violation Category</span>
                  <span className="text-primary font-black uppercase tracking-wide text-[10px]">{selectedReport.category}</span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold block mb-1">Incident Report Description</span>
                  <p className="p-3.5 bg-muted/25 border border-border/40 rounded-lg text-foreground text-[10px] leading-relaxed font-semibold">
                    {selectedReport.description}
                  </p>
                </div>

                <div className="border-t border-border/40 pt-4 flex flex-col gap-2 select-none">
                  {selectedReport.status !== "Resolved" && (
                    <Button 
                      onClick={() => handleResolve(selectedReport.id)}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[10px] h-9 shadow-soft"
                    >
                      <CheckCircle2 size={13} className="mr-1.5" /> Mark as Resolved
                    </Button>
                  )}
                  {selectedReport.status === "Open" && (
                    <Button 
                      onClick={() => handleInvestigate(selectedReport.id)}
                      variant="outline"
                      className="w-full border-amber-500/30 text-amber-500 bg-amber-500/5 hover:bg-amber-500/10 font-black uppercase text-[10px] h-9"
                    >
                      <AlertTriangle size={13} className="mr-1.5" /> Initiate Investigation
                    </Button>
                  )}
                  <Button 
                    onClick={() => handleDismiss(selectedReport.id)}
                    variant="ghost"
                    className="w-full text-rose-500 hover:bg-rose-500/5 font-black uppercase text-[10px] h-9"
                  >
                    <ShieldAlert size={13} className="mr-1.5" /> Dismiss &amp; Close Log
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="border border-border/80 bg-card/40 p-12 text-center shadow-soft flex flex-col items-center justify-center min-h-[300px] select-none">
              <ClipboardList size={32} className="text-muted-foreground/30 animate-pulse mb-3" />
              <div className="text-xs text-muted-foreground font-bold">
                Select an incident report from the list view to start audit operations.
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
