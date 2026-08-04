"use client";

import React, { useState } from "react";
import { Card } from "../../../../../components/ui/card";
import { Calendar, Play, Clock } from "lucide-react";
import { Button } from "../../../../../components/ui/button";
import { toast } from "sonner";

interface SchedulerJob {
  id: string;
  name: string;
  cron: string;
  timezone: string;
  retryCount: number;
  lastRun: string;
}

interface SubComponentProps {
  logAuditAction: (actionStr: string) => void;
}

export default function SchedulerCenter({ logAuditAction }: SubComponentProps) {
  const [cronJobs, setCronJobs] = useState<SchedulerJob[]>([
    { id: "cron-1", name: "Daily Backup Database", cron: "0 4 * * *", timezone: "Asia/Kolkata", retryCount: 3, lastRun: "2026-08-02 04:00" },
    { id: "cron-2", name: "Weekly Payouts Distribution", cron: "0 0 * * 0", timezone: "Asia/Kolkata", retryCount: 2, lastRun: "2026-07-26 00:00" },
    { id: "cron-3", name: "Sync Live Classes Attendance", cron: "*/30 * * * *", timezone: "UTC", retryCount: 1, lastRun: "2026-08-02 13:00" }
  ]);

  const handleRunSchedulerJob = (job: SchedulerJob) => {
    logAuditAction(`Manually triggered scheduler cron job: ${job.name}`);
    toast.success(`Job manually executed successfully: ${job.name}`);
  };

  return (
    <Card className="p-5 border-border bg-card space-y-4 text-left select-none shadow-soft">
      <div className="flex justify-between items-center pb-3 border-b border-border/30">
        <h3 className="text-xs font-heading font-extrabold uppercase text-foreground flex items-center gap-1.5">
          <Calendar size={14} className="text-primary" /> Active Cron Scheduler recurring jobs
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs font-semibold min-w-[700px]">
          <thead>
            <tr className="border-b border-border/50 text-[9px] font-black uppercase text-muted-foreground">
              <th className="py-2.5 px-3">Job Name</th>
              <th className="py-2.5 px-3">Cron Expression</th>
              <th className="py-2.5 px-3">Timezone</th>
              <th className="py-2.5 px-3">Retry Limit</th>
              <th className="py-2.5 px-3">Last Run</th>
              <th className="py-2.5 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {cronJobs.map((job) => (
              <tr key={job.id} className="border-b border-border/10 hover:bg-muted/5">
                <td className="py-3 px-3 font-extrabold text-foreground">{job.name}</td>
                <td className="py-3 px-3 font-mono text-muted-foreground">{job.cron}</td>
                <td className="py-3 px-3 text-muted-foreground">{job.timezone}</td>
                <td className="py-3 px-3 text-muted-foreground/60">{job.retryCount} times</td>
                <td className="py-3 px-3 text-muted-foreground/80">{job.lastRun}</td>
                <td className="py-3 px-3 text-right">
                  <button onClick={() => handleRunSchedulerJob(job)} className="p-1 hover:bg-emerald-500/10 text-emerald-500 border border-border/40 rounded" title="Execute Cron manually">
                    <Play size={11} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
