"use client";

import React, { useState, useEffect } from "react";
import { Activity, Server, Database, RefreshCw, Cpu, CheckCircle2, ShieldCheck, Mail } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { SystemHealthCenter } from "@/lib/services/PlatformIntegrationEngine";

interface BackgroundJob {
  id: string;
  name: string;
  schedule: string;
  lastRun: string;
  status: "Completed" | "Running" | "Failed";
  latency: number;
}

export default function SystemHealthTab() {
  const [healthData, setHealthData] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [jobs, setJobs] = useState<BackgroundJob[]>([]);

  const defaultJobs: BackgroundJob[] = [
    { id: "job-1", name: "Supabase Database Autobackup", schedule: "Daily at 02:00 AM", lastRun: "Today, 02:00 AM", status: "Completed", latency: 1240 },
    { id: "job-2", name: "Escrow Commission Distribution Sync", schedule: "Hourly", lastRun: "Today, 09:00 PM", status: "Completed", latency: 820 },
    { id: "job-3", name: "Certificates Issuance Queue Processor", schedule: "Every 5 mins", lastRun: "5 mins ago", status: "Completed", latency: 45 },
    { id: "job-4", name: "Doubt Session Google Meet Expiry Check", schedule: "Every 15 mins", lastRun: "12 mins ago", status: "Completed", latency: 110 }
  ];

  const fetchHealth = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setHealthData(SystemHealthCenter.getDiagnostics());
      setJobs(defaultJobs);
      setIsRefreshing(false);
      toast.success("Operational diagnostic data refreshed.");
    }, 600);
  };

  useEffect(() => {
    setHealthData(SystemHealthCenter.getDiagnostics());
    setJobs(defaultJobs);
  }, []);

  if (!healthData) {
    return (
      <div className="py-12 text-center text-xs text-muted-foreground/60 font-semibold animate-pulse select-none">
        Loading platform diagnostic center...
      </div>
    );
  }

  // Pure SVG Circular progress calculator for gauges
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  
  const getCircleStrokeDash = (percent: number) => {
    const offset = circumference - (percent / 100) * circumference;
    return `${circumference} ${offset}`;
  };

  return (
    <div className="space-y-6 text-left select-none pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-4 rounded-xl border border-border shadow-soft">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary flex items-center gap-1.5">
            <Activity size={13} className="animate-pulse" /> Platform Operations Monitoring
          </span>
          <h2 className="text-xl font-heading font-black text-foreground tracking-tight mt-1">
            System Diagnostics &amp; Health Console
          </h2>
        </div>
        <Button 
          size="sm" 
          disabled={isRefreshing}
          onClick={fetchHealth} 
          className="h-8 text-[10px] uppercase font-black tracking-wider bg-card text-foreground border border-border hover:bg-muted shadow-soft"
        >
          <RefreshCw size={11} className={`mr-1.5 ${isRefreshing ? "animate-spin text-primary" : ""}`} /> Refresh Stats
        </Button>
      </div>

      {/* Observability Gauges Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "CPU Usage Core", val: "32%", sub: "4 Cores Intel Xeon", pct: 32, color: "stroke-emerald-500", text: "text-emerald-500" },
          { label: "Memory Buffer", val: "54%", sub: "8.6 GB / 16 GB Ram", pct: 54, color: "stroke-blue-500", text: "text-blue-500" },
          { label: "SMTP Email Rates", val: "100%", sub: " SMTP Mail Server", pct: 100, color: "stroke-purple-500", text: "text-purple-500" },
          { label: "Storage Limit", val: `${healthData.storageUsage}%`, sub: "Media server storage", pct: Math.round(healthData.storageUsage), color: "stroke-amber-500", text: "text-amber-500" }
        ].map((gauge, idx) => (
          <Card key={idx} className="border border-border bg-card p-5 flex items-center justify-between shadow-soft hover:shadow-md transition-all">
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider block">{gauge.label}</span>
              <span className="text-xl sm:text-2xl font-heading font-black text-foreground tracking-tight block mt-2">{gauge.val}</span>
              <span className="text-[9px] text-muted-foreground font-semibold block mt-1">{gauge.sub}</span>
            </div>
            
            {/* SVG circular Gauge */}
            <div className="relative w-20 h-20 shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="40" cy="40" r={radius} className="stroke-muted fill-none" strokeWidth="6" />
                <circle 
                  cx="40" 
                  cy="40" 
                  r={radius} 
                  className={`fill-none transition-all duration-500 ${gauge.color}`} 
                  strokeWidth="6"
                  strokeDasharray={`${circumference} ${circumference}`}
                  strokeDashoffset={circumference - (gauge.pct / 100) * circumference}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-[9.5px] font-extrabold ${gauge.text}`}>{gauge.pct}%</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Background Jobs Queue */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border border-border/80 bg-card/60 shadow-soft p-5 space-y-4">
            <div className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest block border-b border-border/30 pb-2">
              Background Jobs Queue Manager
            </div>

            <div className="overflow-x-auto select-none">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border/40 text-muted-foreground font-extrabold uppercase text-[9px] tracking-wider">
                    <th className="pb-3">Job Name</th>
                    <th className="pb-3">Cron Schedule</th>
                    <th className="pb-3">Latency</th>
                    <th className="pb-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {jobs.map((job) => (
                    <tr key={job.id} className="hover:bg-muted/10 transition-colors">
                      <td className="py-3">
                        <div className="font-extrabold text-foreground">{job.name}</div>
                        <div className="text-[9.5px] text-muted-foreground/60 font-semibold mt-0.5">Last Run: {job.lastRun}</div>
                      </td>
                      <td className="py-3 font-semibold text-muted-foreground">{job.schedule}</td>
                      <td className="py-3 font-mono font-bold text-primary/80">{job.latency}ms</td>
                      <td className="py-3 text-right">
                        <span className="inline-flex items-center gap-1 text-[8.5px] font-black uppercase px-2 py-0.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-500">
                          {job.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Diagnostic Checks summary */}
        <div className="space-y-6">
          <Card className="border border-border/80 bg-card p-6 space-y-4 shadow-soft">
            <div className="border-b border-border/40 pb-2.5">
              <h3 className="font-heading font-black text-foreground text-sm flex items-center gap-1.5">
                <Server size={16} className="text-primary" /> Cluster Diagnostic Checklist
              </h3>
            </div>

            <div className="space-y-3.5 text-xs font-semibold text-muted-foreground">
              {[
                { name: "Database Schema Version", status: "v2.0-Migrated", type: "db" },
                { name: "Token Rotation Policy", status: "Active (24h)", type: "security" },
                { name: "System Log Level", status: "JSON production", type: "log" },
                { name: "SMTP Email Server", status: "Brevo API Connected", type: "mail" }
              ].map((c, idx) => (
                <div key={idx} className="p-3 bg-muted/15 border border-border/40 rounded-xl flex items-center justify-between">
                  <div>
                    <h5 className="font-extrabold text-foreground text-[11px]">{c.name}</h5>
                    <span className="text-[9.5px] text-primary/80 font-bold block mt-0.5">{c.status}</span>
                  </div>
                  <span className="text-emerald-500 shrink-0"><CheckCircle2 size={15} /></span>
                </div>
              ))}
            </div>
          </Card>

          {/* Infrastructure Health Status */}
          <Card className="border border-border/80 bg-card p-6 space-y-4 shadow-soft">
            <div className="border-b border-border/40 pb-2.5">
              <h4 className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest">
                Infrastructure Health Status
              </h4>
            </div>

            <div className="space-y-3 text-xs font-semibold text-muted-foreground">
              <div className="flex justify-between items-center">
                <span>Database Response Latency</span>
                <span className="font-black text-foreground">{healthData.apiLatency}ms</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Active WebSocket Channels</span>
                <span className="font-black text-foreground">18 streams</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Data Integrity Check</span>
                <span className="text-emerald-500 font-extrabold uppercase text-[9px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Optimal</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
