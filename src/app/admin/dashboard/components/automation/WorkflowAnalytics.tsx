"use client";

import React from "react";
import { Card } from "../../../../../components/ui/card";
import { BarChart3, TrendingUp } from "lucide-react";

export default function WorkflowAnalytics() {
  const successRate = 96; // %
  const failureRate = 4; // %
  const executionFrequencies = [25, 42, 38, 55, 62, 70]; // hourly executions
  const hours = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00"];

  return (
    <div className="space-y-6 text-left select-none">
      
      {/* Visual Execution Frequency bar chart */}
      <Card className="p-6 border-border bg-card space-y-4">
        <span className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground block flex items-center gap-1.5">
          <TrendingUp size={14} className="text-primary" /> Hourly Execution Frequency
        </span>
        <div className="h-32 flex items-end gap-4 pt-4 border-b border-l border-border/40 pl-2">
          {executionFrequencies.map((val, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-1 group cursor-pointer">
              <div className="w-full bg-primary/20 hover:bg-primary rounded-t transition-all relative flex justify-center" style={{ height: `${val * 1.5}px` }}>
                <span className="absolute -top-6 text-[9px] font-black text-foreground opacity-0 group-hover:opacity-100 transition-opacity bg-card px-1 rounded border border-border/50">{val} runs</span>
              </div>
              <span className="text-[9px] text-muted-foreground font-black uppercase mt-1">{hours[idx]}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Ratios stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-5 border-border bg-card space-y-3">
          <span className="text-[10px] uppercase font-black tracking-wider text-muted-foreground block">Reliability Ratios</span>
          <div className="space-y-3 text-xs font-semibold text-muted-foreground select-none">
            <div className="flex justify-between">
              <span>Overall Success Rate:</span>
              <span className="text-emerald-500 font-extrabold">{successRate}% Successful</span>
            </div>
            <div className="flex justify-between">
              <span>Overall Failure Rate:</span>
              <span className="text-rose-500 font-extrabold">{failureRate}% Failed</span>
            </div>
          </div>
        </Card>

        <Card className="p-5 border-border bg-card space-y-3">
          <span className="text-[10px] uppercase font-black tracking-wider text-muted-foreground block">Usage metrics</span>
          <div className="space-y-3 text-xs font-semibold text-muted-foreground select-none">
            <div className="flex justify-between">
              <span>Most Triggered Event:</span>
              <span className="text-foreground font-black">Grade Updated Event</span>
            </div>
            <div className="flex justify-between">
              <span>Most Executed Action:</span>
              <span className="text-foreground font-black">PDF Certificate Issuance</span>
            </div>
          </div>
        </Card>
      </div>

    </div>
  );
}
