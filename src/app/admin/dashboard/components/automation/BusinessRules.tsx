"use client";

import React, { useState, useEffect } from "react";
import { Card } from "../../../../../components/ui/card";
import { Sliders, Plus, Trash2, ShieldAlert } from "lucide-react";
import { Button } from "../../../../../components/ui/button";
import { toast } from "sonner";

interface BusinessRule {
  id: string;
  ifField: string;
  operator: string;
  ifValue: string;
  thenAction: string;
  status: "Active" | "Inactive";
}

interface SubComponentProps {
  logAuditAction: (actionStr: string) => void;
}

export default function BusinessRules({ logAuditAction }: SubComponentProps) {
  const [rules, setRules] = useState<BusinessRule[]>([]);

  // Form states
  const [ifField, setIfField] = useState("Progress");
  const [ifValue, setIfValue] = useState("100");
  const [thenAction, setThenAction] = useState("Generate Certificate");

  const loadRules = () => {
    if (typeof window === "undefined") return;
    const defaults: BusinessRule[] = [
      { id: "rule-1", ifField: "Student Progress", operator: "==", ifValue: "100%", thenAction: "Generate Certificate", status: "Active" },
      { id: "rule-2", ifField: "Attendance", operator: "<", ifValue: "70%", thenAction: "Notify Tutor", status: "Active" },
      { id: "rule-3", ifField: "Payment Status", operator: "==", ifValue: "Failed", thenAction: "Suspend Enrollment", status: "Active" }
    ];
    const stored = localStorage.getItem("eduearn_business_rules");
    if (stored) {
      try { setRules(JSON.parse(stored)); } catch { setRules(defaults); }
    } else {
      localStorage.setItem("eduearn_business_rules", JSON.stringify(defaults));
      setRules(defaults);
    }
  };

  useEffect(() => {
    loadRules();
  }, []);

  const saveRules = (updated: BusinessRule[]) => {
    setRules(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("eduearn_business_rules", JSON.stringify(updated));
    }
  };

  const handleCreateRule = () => {
    if (!ifValue.trim()) {
      toast.error("Please specify a boundary condition value.");
      return;
    }

    const newRule: BusinessRule = {
      id: `rule-${Date.now()}`,
      ifField,
      operator: "==",
      ifValue,
      thenAction,
      status: "Active"
    };

    const updated = [...rules, newRule];
    saveRules(updated);
    logAuditAction(`Created IF/THEN rule: IF ${ifField} == ${ifValue} THEN ${thenAction}`);
    toast.success("Business automation rule registered successfully");

    setIfValue("");
  };

  const handleDeleteRule = (id: string) => {
    const updated = rules.filter(r => r.id !== id);
    saveRules(updated);
    logAuditAction(`Deleted business rule ID ${id}`);
    toast.success("Rule successfully deleted");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left select-none">
      
      {/* Rules Creator */}
      <Card className="lg:col-span-1 p-5 border-border bg-card space-y-4 flex flex-col justify-between">
        <div className="space-y-4">
          <span className="text-xs font-heading font-extrabold uppercase text-foreground flex items-center gap-1">
            <Sliders size={13} className="text-primary" /> Create Business automation rule
          </span>

          <div className="space-y-3.5 text-xs font-semibold select-none">
            <div>
              <label className="text-[9.5px] font-black uppercase text-muted-foreground mb-1 block">IF Parameter Field</label>
              <select
                value={ifField}
                onChange={(e) => setIfField(e.target.value)}
                className="h-10 w-full rounded border border-border bg-background px-3 text-xs text-foreground focus:outline-none"
              >
                <option value="Student Progress">Student Progress (%)</option>
                <option value="Attendance Rate">Attendance Rate (%)</option>
                <option value="Payment Status">Payment Status</option>
                <option value="Quiz Score">Exam Quiz Score (%)</option>
              </select>
            </div>

            <div>
              <label className="text-[9.5px] font-black uppercase text-muted-foreground mb-1 block">Boundary condition value</label>
              <input
                type="text"
                placeholder="e.g. 100% or Failed"
                value={ifValue}
                onChange={(e) => setIfValue(e.target.value)}
                className="h-10 w-full rounded border border-border bg-background px-3.5 text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[9.5px] font-black uppercase text-muted-foreground mb-1 block">THEN Action Trigger</label>
              <select
                value={thenAction}
                onChange={(e) => setThenAction(e.target.value)}
                className="h-10 w-full rounded border border-border bg-background px-3 text-xs text-foreground focus:outline-none"
              >
                <option value="Generate Certificate">Generate Certificate</option>
                <option value="Notify Tutor">Notify Assigned Tutor</option>
                <option value="Suspend Enrollment">Suspend Student Enrollment</option>
                <option value="Lock Account">Lock Learner Credentials</option>
              </select>
            </div>
          </div>
        </div>

        <Button onClick={handleCreateRule} className="w-full h-10 mt-5 uppercase font-black text-[9.5px]">
          <Plus size={12} className="mr-1" /> Add Rule
        </Button>
      </Card>

      {/* Rules list */}
      <Card className="lg:col-span-2 p-5 border-border bg-card space-y-4">
        <span className="text-xs font-heading font-extrabold uppercase text-foreground">Registered Business rules catalog</span>

        <div className="space-y-3.5">
          {rules.map(rule => (
            <div key={rule.id} className="p-4 bg-muted/15 border border-border/40 rounded-lg text-xs font-semibold flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-1.5 font-mono text-[10.5px]">
                  <span className="text-primary font-black uppercase text-[9px]">IF</span>
                  <span className="text-foreground font-bold">{rule.ifField}</span>
                  <span className="text-muted-foreground">{rule.operator}</span>
                  <span className="text-foreground font-bold">`{rule.ifValue}`</span>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-[10.5px] mt-1.5">
                  <span className="text-emerald-500 font-black uppercase text-[9px]">THEN</span>
                  <span className="text-foreground font-bold">{rule.thenAction}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <span className="text-[8.5px] font-black uppercase text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">{rule.status}</span>
                <button onClick={() => handleDeleteRule(rule.id)} className="p-1 hover:bg-rose-500/10 text-rose-500 border border-border/40 rounded">
                  <Trash2 size={11} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

    </div>
  );
}
