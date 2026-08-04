"use client";

import React, { useState, useEffect } from "react";
import { Card } from "../../../../../components/ui/card";
import { Clock, Play, RotateCw } from "lucide-react";
import { Button } from "../../../../../components/ui/button";
import { toast } from "sonner";

interface AutomationLog {
  id: string;
  workflowName: string;
  status: string;
  duration: string;
  triggeredBy: string;
  executedActions: string[];
  timestamp: string;
}

interface SubComponentProps {
  logAuditAction: (actionStr: string) => void;
}

export default function AutomationLogs({ logAuditAction }: SubComponentProps) {
  const [logs, setLogs] = useState<AutomationLog[]>([]);

  const loadLogs = () => {
    if (typeof window === "undefined") return;
    const defaults: AutomationLog[] = [
      {
        id: "run-1",
        workflowName: "Auto-Certify Course Completion",
        status: "Successful",
        duration: "420ms",
        triggeredBy: "System Event: Grade Updated",
        executedActions: ["Generate Certificate PDF", "Send congrats Push Notification"],
        timestamp: "2026-08-02 13:00"
      },
      {
        id: "run-2",
        workflowName: "Low Attendance Tutor Alert",
        status: "Successful",
        duration: "180ms",
        triggeredBy: "System Event: Attendance Updated",
        executedActions: ["Send Email notification to tutor"],
        timestamp: "2026-08-02 12:45"
      }
    ];

    const stored = localStorage.getItem("eduearn_automation_logs");
    if (stored) {
      try { setLogs(JSON.parse(stored)); } catch { setLogs(defaults); }
    } else {
      localStorage.setItem("eduearn_automation_logs", JSON.stringify(defaults));
      setLogs(defaults);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const handleRetryRun = (run: AutomationLog) => {
    logAuditAction(`Re-run manual execution for: ${run.workflowName}`);
    toast.success(`Workflow re-run execution queued: ${run.workflowName}`);
  };

  return (
    <Card className="p-5 border-border bg-card space-y-4 text-left select-none shadow-soft">
      <div className="flex justify-between items-center pb-3 border-b border-border/30">
        <h3 className="text-xs font-heading font-extrabold uppercase text-foreground flex items-center gap-1.5">
          <Clock size={14} className="text-primary animate-pulse" /> Platform Automation Runs Timeline logs
        </h3>
        <Button size="sm" onClick={loadLogs} className="h-8 text-[9px] uppercase font-black">Refresh Logs</Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs font-semibold min-w-[700px]">
          <thead>
            <tr className="border-b border-border/50 text-[9px] font-black uppercase text-muted-foreground">
              <th className="py-2.5 px-3">Workflow</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3">Triggered By</th>
              <th className="py-2.5 px-3">Runtime</th>
              <th className="py-2.5 px-3">Timestamp</th>
              <th className="py-2.5 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b border-border/10 hover:bg-muted/5">
                <td className="py-3 px-3 font-extrabold text-foreground">{log.workflowName}</td>
                <td className="py-3 px-3">
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded border border-emerald-500/20 text-emerald-500 bg-emerald-500/10">
                    {log.status}
                  </span>
                </td>
                <td className="py-3 px-3 text-muted-foreground">{log.triggeredBy}</td>
                <td className="py-3 px-3 text-muted-foreground/60">{log.duration}</td>
                <td className="py-3 px-3 text-muted-foreground/80">{log.timestamp}</td>
                <td className="py-3 px-3 text-right">
                  <button onClick={() => handleRetryRun(log)} className="p-1 hover:bg-emerald-500/10 text-emerald-500 border border-border/40 rounded" title="Re-run workflow">
                    <RotateCw size={11} />
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
