"use client";

import React, { useState } from "react";
import { 
  Download, Award, Star, Clock, Heart, AlertTriangle, TrendingUp, Filter, MessageSquare, Video
} from "lucide-react";
import { toast } from "sonner";
import { Card } from "../../../../../components/ui/card";
import { Button } from "../../../../../components/ui/button";
import { TutorMetrics } from "./AcademicOperationsStore";

interface TutorPerformanceTabProps {
  tutorMetrics: TutorMetrics[];
  onOpenTutor: (id: string) => void;
  logAuditAction: (action: string) => void;
}

export default function TutorPerformanceTab({
  tutorMetrics,
  onOpenTutor,
  logAuditAction
}: TutorPerformanceTabProps) {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("All");

  const filtered = tutorMetrics.filter(t => {
    const matchesSearch = t.tutorName.toLowerCase().includes(search.toLowerCase());
    if (filterType === "Top Performers") return matchesSearch && t.topPerformer;
    if (filterType === "Needs Attention") return matchesSearch && t.needsImprovement;
    return matchesSearch;
  });

  const handleExportCSV = () => {
    const headers = "Tutor ID,Tutor Name,Teaching Hours,Courses,Avg Rating,Response Time,Revenue,Satisfaction Rate\n";
    const rows = filtered.map(t => 
      `"${t.tutorId}","${t.tutorName}",${t.teachingHours},${t.courseCount},${t.avgRating},${t.responseTime},${t.revenue},${t.satisfactionRate}`
    ).join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("href", url);
    a.setAttribute("download", `eduearn_tutors_performance_${Date.now()}.csv`);
    a.click();
    toast.success("Tutors performance CSV report downloaded.");
  };

  return (
    <div className="space-y-6 text-left select-none">
      {/* Summary KPI rows */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Elite Educators", val: String(tutorMetrics.filter(t => t.topPerformer).length), sub: "Satisfaction rate >95%", color: "text-amber-500 bg-amber-500/10 border-amber-500/15" },
          { label: "Needs Supervision", val: String(tutorMetrics.filter(t => t.needsImprovement).length), sub: "Delayed assignment reviews", color: "text-rose-500 bg-rose-500/10 border-rose-500/15" },
          { label: "Total Teaching Hours", val: `${tutorMetrics.reduce((sum, t) => sum + t.teachingHours, 0)} Hrs`, sub: "Across all active batches", color: "text-primary bg-primary/10 border-primary/15" },
          { label: "Average Rating", val: "4.7 / 5.0", sub: "Based on 452 student reviews", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/15" }
        ].map((kpi, idx) => (
          <Card key={idx} className={`p-5 rounded-xl border flex flex-col justify-between shadow-soft ${kpi.color}`}>
            <span className="text-[10px] uppercase font-black tracking-wider opacity-85">{kpi.label}</span>
            <span className="text-2xl font-black mt-3 block">{kpi.val}</span>
            <span className="text-[9.5px] font-extrabold mt-1 block opacity-70">{kpi.sub}</span>
          </Card>
        ))}
      </div>

      {/* Roster Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-4 rounded-xl border border-border shadow-soft">
        <div className="flex flex-wrap gap-2">
          {["All Tutors", "Top Performers", "Needs Attention"].map(tType => (
            <button
              key={tType}
              onClick={() => setFilterType(tType)}
              className={`text-[10px] uppercase tracking-wider font-extrabold px-3 py-1.5 rounded-button border ${
                filterType === tType ? "bg-primary text-white border-primary" : "bg-card text-muted-foreground border-border hover:bg-muted/50"
              }`}
            >
              {tType}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search tutor name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 max-w-xs rounded border border-border bg-card px-3 focus:outline-none text-xs font-semibold"
          />
          <Button onClick={handleExportCSV} variant="outline" size="sm" className="gap-1 h-9 border-border bg-card">
            <Download size={13} /> Export Metrics
          </Button>
        </div>
      </div>

      {/* Performance Grid */}
      <Card className="p-4 border-border bg-card overflow-x-auto shadow-soft">
        {filtered.length === 0 ? (
          <div className="text-center py-10 text-xs text-muted-foreground/60">
            No tutor profiles match filter configurations.
          </div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-border/40 text-[10px] text-muted-foreground font-extrabold uppercase tracking-wider">
                <th className="py-3 px-3">Educator Name</th>
                <th className="py-3 px-2 text-center">Active Courses</th>
                <th className="py-3 px-2 text-center">Satisfaction Rate</th>
                <th className="py-3 px-2 text-center">Classroom Attendance</th>
                <th className="py-3 px-2 text-center">Average Review Speed</th>
                <th className="py-3 px-2 text-center">Live Classes Held</th>
                <th className="py-3 px-2 text-center">Status Badges</th>
                <th className="py-3 px-3 text-right">Action Logs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20 text-xs font-semibold">
              {filtered.map(t => (
                <tr key={t.tutorId} className="hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-3">
                    <span className="font-extrabold text-foreground hover:text-primary cursor-pointer block" onClick={() => onOpenTutor(t.tutorId)}>{t.tutorName}</span>
                    <span className="text-[9px] text-muted-foreground mt-0.5 block">TDS/GST verified</span>
                  </td>
                  <td className="py-3 px-2 text-center font-bold text-foreground">{t.courseCount} Classes</td>
                  <td className="py-3 px-2 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Star size={11} className="text-amber-400 fill-amber-400 shrink-0" />
                      <span className="font-black text-foreground">{t.avgRating.toFixed(1)}</span>
                      <span className="text-[9.5px] text-muted-foreground/60">({t.satisfactionRate}% happy)</span>
                    </div>
                  </td>
                  <td className="py-3 px-2 text-center font-bold text-foreground">{t.attendanceRate}% check-in</td>
                  <td className="py-3 px-2 text-center">
                    <div className="flex items-center justify-center gap-1 text-muted-foreground">
                      <Clock size={11} />
                      <span>{t.avgReviewTime} hours avg</span>
                    </div>
                  </td>
                  <td className="py-3 px-2 text-center text-foreground font-extrabold">{t.liveClassesCount} classes</td>
                  <td className="py-3 px-2 text-center">
                    <div className="flex gap-1.5 justify-center">
                      {t.topPerformer && (
                        <span className="text-[8px] font-extrabold bg-amber-500/10 text-amber-500 border border-amber-500/25 px-2 py-0.5 rounded uppercase tracking-wider">
                          ★ Elite
                        </span>
                      )}
                      {t.needsImprovement && (
                        <span className="text-[8px] font-extrabold bg-rose-500/10 text-rose-500 border border-rose-500/25 px-2 py-0.5 rounded uppercase tracking-wider">
                          ⚠ Needs Improvement
                        </span>
                      )}
                      {!t.topPerformer && !t.needsImprovement && (
                        <span className="text-muted-foreground/30 text-[9px]">Normal Status</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <Button variant="outline" size="sm" onClick={() => onOpenTutor(t.tutorId)} className="h-7 px-2 text-[9px] uppercase font-bold border-border bg-card">
                      View Profile
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
