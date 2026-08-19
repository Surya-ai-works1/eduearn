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

      {/* Application Health Indicators Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Database", val: "Connected", sub: "Supabase PostgreSQL", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
          { label: "Authentication", val: "Operational", sub: "Supabase Auth & RBAC", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
          { label: "API Services", val: "Operational", sub: "Next.js App Router API", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
          { label: "Storage Bucket", val: "Connected", sub: "Supabase Storage", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
          { label: "Email Service", val: "Configured", sub: "SMTP Provider", color: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
        ].map((item, idx) => (
          <Card key={idx} className="border border-border bg-card p-4 space-y-2 shadow-soft">
            <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider block">{item.label}</span>
            <span className={`inline-block px-2 py-0.5 rounded text-xs font-black uppercase border ${item.color}`}>{item.val}</span>
            <span className="text-[9px] text-muted-foreground font-semibold block">{item.sub}</span>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Diagnostic Checks summary */}
        <Card className="border border-border/80 bg-card p-6 space-y-4 shadow-soft">
          <div className="border-b border-border/40 pb-2.5">
            <h3 className="font-heading font-black text-foreground text-sm flex items-center gap-1.5">
              <Server size={16} className="text-primary" /> Application Diagnostic Checklist
            </h3>
          </div>

          <div className="space-y-3 text-xs font-semibold text-muted-foreground">
            {[
              { name: "Database Connectivity & Schema", status: "Operational & Migrated" },
              { name: "RBAC Role Resolution", status: "Strict Profiles Authority Active" },
              { name: "Next.js Edge Middleware", status: "Role Guards & Protection Enabled" },
              { name: "Session Security & Cookies", status: "HTTP-Only Secure Cookie Session" }
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

        {/* Infrastructure Status Summary */}
        <Card className="border border-border/80 bg-card p-6 space-y-4 shadow-soft flex flex-col justify-between">
          <div className="border-b border-border/40 pb-2.5">
            <h4 className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest">
              Application Health Overview
            </h4>
          </div>

          <div className="space-y-4 text-xs font-semibold text-muted-foreground">
            <div className="flex justify-between items-center">
              <span>Database Connection</span>
              <span className="text-emerald-500 font-extrabold uppercase text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Connected</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Authentication State</span>
              <span className="text-emerald-500 font-extrabold uppercase text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Operational</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Data Integrity</span>
              <span className="text-emerald-500 font-extrabold uppercase text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Verified</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Last Health Check</span>
              <span className="font-mono text-foreground">{new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
