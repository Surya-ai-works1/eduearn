"use client";

import React from "react";
import { Card } from "../../../../../components/ui/card";
import { TenantOrg } from "./OrganizationsTab";
import { Award, BarChart3, TrendingUp } from "lucide-react";

interface SubComponentProps {
  org: TenantOrg;
}

export default function OrganizationReports({ org }: SubComponentProps) {
  // Mock monthly data splits
  const revenueTrend = [15, 22, 18, 30, 28, 35]; // in thousands (INR)
  const months = ["Mar", "Apr", "May", "Jun", "Jul", "Aug"];

  return (
    <div className="space-y-6 text-left select-none">
      
      {/* Visual Revenue growth trend (Module 9, 18) */}
      <Card className="p-6 border-border bg-card space-y-4">
        <span className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground block flex items-center gap-1.5">
          <TrendingUp size={14} className="text-primary" /> Monthly Revenue Trend (thousands ₹)
        </span>
        <div className="h-32 flex items-end gap-4 pt-4 border-b border-l border-border/40 pl-2">
          {revenueTrend.map((val, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-1 group cursor-pointer">
              <div className="w-full bg-primary/20 hover:bg-primary rounded-t transition-all relative flex justify-center" style={{ height: `${val * 2.8}px` }}>
                <span className="absolute -top-6 text-[9px] font-black text-foreground opacity-0 group-hover:opacity-100 transition-opacity bg-card px-1 rounded border border-border/50">₹{val}k</span>
              </div>
              <span className="text-[9px] text-muted-foreground font-black uppercase mt-1">{months[idx]}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Ratios stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-5 border-border bg-card space-y-3">
          <span className="text-[10px] uppercase font-black tracking-wider text-muted-foreground block">Key performance ratios</span>
          <div className="space-y-3 text-xs font-semibold text-muted-foreground select-none">
            <div className="flex justify-between">
              <span>Avg Course Completion rate:</span>
              <span className="text-foreground font-extrabold">88.2%</span>
            </div>
            <div className="flex justify-between">
              <span>Student Satisfaction Index:</span>
              <span className="text-foreground font-extrabold">4.8 / 5.0</span>
            </div>
          </div>
        </Card>

        <Card className="p-5 border-border bg-card space-y-3">
          <span className="text-[10px] uppercase font-black tracking-wider text-muted-foreground block">Verifiable metrics</span>
          <div className="space-y-3 text-xs font-semibold text-muted-foreground select-none">
            <div className="flex justify-between">
              <span>Issued Certificates count:</span>
              <span className="text-foreground font-extrabold">{org.coursesCount * 4} issued</span>
            </div>
            <div className="flex justify-between">
              <span>Live Meeting sessions:</span>
              <span className="text-foreground font-extrabold">{org.coursesCount * 2} sessions</span>
            </div>
          </div>
        </Card>
      </div>

    </div>
  );
}
