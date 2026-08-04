"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sliders, Cpu, Play, Trash2, RotateCw, CheckCircle, AlertTriangle, Plus, Search,
  Settings, Award, DollarSign, Calendar, Layers, ShieldAlert, BarChart3, Terminal,
  HelpCircle, ChevronRight, X, Clock, HelpCircle as HelpIcon, Sparkles, Database, Globe,
  Download, Power
} from "lucide-react";
import { Card } from "../../../../../components/ui/card";
import { Button } from "../../../../../components/ui/button";
import { toast } from "sonner";

// Import sub-components
import WorkflowBuilder from "./WorkflowBuilder";
import BusinessRules from "./BusinessRules";
import AutomationLogs from "./AutomationLogs";
import WorkflowAnalytics from "./WorkflowAnalytics";
import SchedulerCenter from "./SchedulerCenter";
import AIWorkflowAssistant from "./AIWorkflowAssistant";

interface WorkflowCenterProps {
  logAuditAction: (actionStr: string) => void;
}

export interface WorkflowNode {
  id: string;
  type: "Trigger" | "Condition" | "Action" | "Delay";
  name: string;
  info: string;
}

export interface PlatformWorkflow {
  id: string;
  name: string;
  trigger: string;
  status: "Active" | "Paused";
  runsCount: number;
  avgRuntime: string;
  nodes: WorkflowNode[];
  createdDate: string;
}

function createRunLog(workflowName: string, avgRuntime: string, actions: string[]) {
  return {
    id: `run-${Date.now()}`,
    workflowName,
    status: "Successful",
    duration: avgRuntime,
    triggeredBy: "Manual Admin execute",
    executedActions: actions,
    timestamp: new Date().toLocaleString()
  };
}

export default function WorkflowCenter({ logAuditAction }: WorkflowCenterProps) {
  const [activeSubTab, setActiveSubTab] = useState<string>("workflows");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);

  // --- SEED LOCAL STORAGE DATA ---
  const [workflows, setWorkflows] = useState<PlatformWorkflow[]>([]);

  const loadWorkflows = () => {
    if (typeof window === "undefined") return;
    const defaults: PlatformWorkflow[] = [
      {
        id: "wf-1",
        name: "Auto-Certify Course Completion",
        trigger: "Grade Updated",
        status: "Active",
        runsCount: 142,
        avgRuntime: "450ms",
        createdDate: "2026-06-01",
        nodes: [
          { id: "node-1", type: "Trigger", name: "Grade Updated", info: "Evaluated quiz >= 90%" },
          { id: "node-2", type: "Condition", name: "Check Course Completion", info: "All modules marked completed" },
          { id: "node-3", type: "Action", name: "Generate Certificate", info: "Issue PDF & register blockchain hash" },
          { id: "node-4", type: "Action", name: "Send Notification", info: "Push in-app congrats alert" }
        ]
      },
      {
        id: "wf-2",
        name: "Low Attendance Tutor Alert",
        trigger: "Attendance Updated",
        status: "Active",
        runsCount: 38,
        avgRuntime: "180ms",
        createdDate: "2026-07-10",
        nodes: [
          { id: "node-1", type: "Trigger", name: "Attendance Updated", info: "Student attendance drops < 70%" },
          { id: "node-2", type: "Action", name: "Send Email notification", info: "Dispatch warning notice to tutor" }
        ]
      },
      {
        id: "wf-3",
        name: "Escrow release on Course Published",
        trigger: "Course Published",
        status: "Paused",
        runsCount: 12,
        avgRuntime: "1.2s",
        createdDate: "2026-07-20",
        nodes: [
          { id: "node-1", type: "Trigger", name: "Course Published", info: "Admin approves draft pipeline status" },
          { id: "node-2", type: "Delay", name: "Wait for 24 hours", info: "Escrow buffer duration" },
          { id: "node-3", type: "Action", name: "Update Wallet Balances", info: "Credit tutor wallet shares" }
        ]
      }
    ];

    const stored = localStorage.getItem("eduearn_workflows");
    if (stored) {
      try {
        setWorkflows(JSON.parse(stored));
      } catch {
        setWorkflows(defaults);
      }
    } else {
      localStorage.setItem("eduearn_workflows", JSON.stringify(defaults));
      setWorkflows(defaults);
    }
  };

  useEffect(() => {
    loadWorkflows();
  }, []);

  const saveWorkflows = (updated: PlatformWorkflow[]) => {
    setWorkflows(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("eduearn_workflows", JSON.stringify(updated));
    }
  };

  // --- ACTIONS HANDLERS ---
  const handleToggleWorkflow = (id: string) => {
    const updated = workflows.map(wf => {
      if (wf.id === id) {
        const nextStatus = wf.status === "Active" ? "Paused" as const : "Active" as const;
        return { ...wf, status: nextStatus };
      }
      return wf;
    });
    saveWorkflows(updated);
    logAuditAction(`Toggled status of workflow ID ${id}`);
    toast.success("Workflow status updated successfully");
  };

  const handleDeleteWorkflow = (id: string) => {
    const target = workflows.find(w => w.id === id);
    if (target && target.status === "Active") {
      toast.error("Security Guard Intercept: Active workflows cannot be deleted! Please pause it first.");
      return;
    }
    const updated = workflows.filter(wf => wf.id !== id);
    saveWorkflows(updated);
    logAuditAction(`Deleted workflow ID ${id}`);
    toast.success("Workflow deleted successfully");
  };

  // Run manually (Module 7 - Logs triggered manually)
  const handleTriggerWorkflow = (id: string) => {
    const target = workflows.find(w => w.id === id);
    if (!target) return;

    // Simulate Workflow Log addition
    const newRun = createRunLog(
      target.name,
      target.avgRuntime,
      target.nodes.filter(n => n.type === "Action").map(n => n.name)
    );

    const storedLogs = localStorage.getItem("eduearn_automation_logs");
    const logs = storedLogs ? JSON.parse(storedLogs) : [];
    logs.unshift(newRun);
    localStorage.setItem("eduearn_automation_logs", JSON.stringify(logs.slice(0, 150)));

    // Increment count
    const updated = workflows.map(w => w.id === id ? { ...w, runsCount: w.runsCount + 1 } : w);
    saveWorkflows(updated);

    logAuditAction(`Manually triggered workflow: ${target.name}`);
    toast.success(`Workflow '${target.name}' run executed successfully`);
  };

  const handleCreateNewWorkflow = () => {
    setIsBuilderOpen(true);
    setSelectedWorkflowId(null);
  };

  const handleEditWorkflow = (id: string) => {
    setSelectedWorkflowId(id);
    setIsBuilderOpen(true);
  };

  // --- EXPORT Snap config ---
  const handleExportConfig = () => {
    const blob = new Blob([JSON.stringify(workflows, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `eduearn_workflows_snapshot_${Date.now()}.json`;
    a.click();
    toast.success("Workflow definitions snapshot exported.");
  };

  // --- FILTERED WORKFLOWS LIST ---
  const filteredWorkflows = workflows.filter(w => 
    w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.trigger.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // KPI calculations
  const totalWfs = workflows.length;
  const activeWfs = workflows.filter(w => w.status === "Active").length;
  const pausedWfs = workflows.filter(w => w.status === "Paused").length;
  const successfulRuns = workflows.reduce((sum, w) => sum + w.runsCount, 0);

  return (
    <div className="space-y-6 text-left select-none pb-12">
      
      {/* 1. HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-5 rounded-xl border border-border shadow-soft">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary flex items-center gap-1.5">
            <Cpu size={13} className="animate-pulse" /> Automation &amp; Business Rules
          </span>
          <h2 className="text-xl font-heading font-black text-foreground mt-1">
            Workflow Orchestrator Center
          </h2>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleCreateNewWorkflow} className="h-9 px-4 text-xs font-black uppercase shadow-soft">
            <Plus size={14} className="mr-1.5" /> Create Workflow
          </Button>
          <Button variant="outline" onClick={handleExportConfig} className="h-9 px-3 border-border bg-card uppercase text-[9px] font-extrabold tracking-wider">
            <Download size={12} className="mr-1" /> Export config
          </Button>
        </div>
      </div>

      {/* 2. SUB NAVIGATION TABS */}
      <div className="flex flex-wrap gap-1.5 border-b border-border/40 pb-2 select-none">
        {[
          { id: "workflows", label: "Workflows Catalog", icon: Layers },
          { id: "rules", label: "IF/THEN Rules Engine", icon: Sliders },
          { id: "scheduler", label: "Cron scheduler", icon: Calendar },
          { id: "logs", label: "Run timeline logs", icon: Clock },
          { id: "analytics", label: "Flow Analytics", icon: BarChart3 },
          { id: "ai", label: "AI Co-pilot Assistant", icon: Sparkles }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded text-xs font-extrabold uppercase tracking-wider border cursor-pointer transition-all ${
                isActive ? "bg-primary text-white border-primary shadow-soft" : "bg-card text-muted-foreground border-border hover:bg-muted"
              }`}
            >
              <Icon size={12} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. TABS CONTAINER WINDOW */}
      <div className="min-h-[300px]">
        {activeSubTab === "workflows" && (
          <div className="space-y-6">
            
            {/* KPI Summary cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 select-none">
              {[
                { label: "Total Workflows", val: String(totalWfs), desc: "Registered flows", icon: Layers },
                { label: "Active Pipelines", val: String(activeWfs), desc: "Online monitoring", icon: CheckCircle },
                { label: "Paused Pipelines", val: String(pausedWfs), desc: "Paused schedules", icon: AlertTriangle },
                { label: "Successful Runs", val: String(successfulRuns), desc: "Flow executions today", icon: Play }
              ].map((kpi, i) => {
                const Icon = kpi.icon;
                return (
                  <Card key={i} className="p-5 border-border bg-card flex items-center justify-between shadow-soft">
                    <div>
                      <span className="text-[10px] uppercase font-extrabold text-muted-foreground tracking-wider block">{kpi.label}</span>
                      <span className="text-xl font-heading font-black text-foreground mt-2 block">{kpi.val}</span>
                      <span className="text-[9px] text-muted-foreground/60 font-semibold mt-1 block">{kpi.desc}</span>
                    </div>
                    <span className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
                      <Icon size={16} />
                    </span>
                  </Card>
                );
              })}
            </div>

            {/* List Catalog */}
            <Card className="p-5 border-border bg-card space-y-4">
              <div className="flex flex-col md:flex-row gap-3 justify-between items-center pb-3 border-b border-border/30 select-none">
                <span className="text-xs font-heading font-extrabold uppercase text-foreground">Active Workflows Catalog</span>
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-2.5 top-2.5 text-muted-foreground" size={13} />
                  <input
                    type="text"
                    placeholder="Search workflows, triggers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-8.5 w-full pl-8.5 pr-3 rounded border border-border bg-background text-[11px] font-semibold focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredWorkflows.map(wf => {
                  const isActive = wf.status === "Active";
                  return (
                    <div key={wf.id} className="p-5 border border-border bg-muted/10 hover:bg-muted/15 rounded-xl flex flex-col justify-between gap-4 text-xs font-semibold">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <span className="text-foreground font-black text-[13px] block">{wf.name}</span>
                          <span className="text-[9px] uppercase tracking-wider text-muted-foreground block mt-1">Trigger: {wf.trigger}</span>
                        </div>
                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${
                          isActive ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" : "text-rose-500 bg-rose-500/10 border-rose-500/20"
                        }`}>{wf.status}</span>
                      </div>

                      <div className="p-3 border border-border/40 bg-card rounded-lg space-y-1.5 select-none">
                        <span className="text-[9px] uppercase font-black tracking-wider text-muted-foreground block">Nodes Execution Pipeline</span>
                        <div className="flex flex-wrap gap-1 pt-1">
                          {wf.nodes.map((node, nIdx) => (
                            <div key={nIdx} className="flex items-center gap-1">
                              <span className="bg-muted text-muted-foreground px-1.5 py-0.5 rounded border border-border/60 text-[8.5px] uppercase font-extrabold" title={node.info}>
                                {node.name.split(" ")[0]}
                              </span>
                              {nIdx < wf.nodes.length - 1 && <span className="text-muted-foreground/30 text-[9px] select-none">&rarr;</span>}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-between items-center border-t border-border/10 pt-3 select-none">
                        <span className="text-[9.5px] text-muted-foreground/60">Executed {wf.runsCount} times</span>
                        
                        <div className="flex gap-1.5">
                          <button onClick={() => handleTriggerWorkflow(wf.id)} className="p-1 hover:bg-emerald-500/10 text-emerald-500 border border-border/40 rounded" title="Manual Execute Flow">
                            <Play size={11} />
                          </button>
                          <button onClick={() => handleEditWorkflow(wf.id)} className="p-1 hover:bg-primary/10 text-primary border border-border/40 rounded" title="Edit flow">
                            <Settings size={11} />
                          </button>
                          <button onClick={() => handleToggleWorkflow(wf.id)} className="p-1 hover:bg-muted text-muted-foreground border border-border/40 rounded" title="Toggle active status">
                            <Power size={11} />
                          </button>
                          <button onClick={() => handleDeleteWorkflow(wf.id)} className="p-1 hover:bg-rose-500/10 text-rose-500 border border-border/40 rounded" title="Delete permanently">
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

          </div>
        )}

        {activeSubTab === "rules" && <BusinessRules logAuditAction={logAuditAction} />}
        {activeSubTab === "scheduler" && <SchedulerCenter logAuditAction={logAuditAction} />}
        {activeSubTab === "logs" && <AutomationLogs logAuditAction={logAuditAction} />}
        {activeSubTab === "analytics" && <WorkflowAnalytics />}
        {activeSubTab === "ai" && <AIWorkflowAssistant onAddWorkflow={(newWf) => {
          const updated = [...workflows, newWf];
          saveWorkflows(updated);
          toast.success(`Workflow parsed by AI Co-pilot: ${newWf.name}`);
        }} />}
      </div>

      {/* --- MODULE 2: VISUAL WORKFLOW BUILDER DRAWER OVERLAY --- */}
      <AnimatePresence>
        {isBuilderOpen && (
          <WorkflowBuilder
            isOpen={isBuilderOpen}
            onClose={() => setIsBuilderOpen(false)}
            workflowId={selectedWorkflowId}
            workflows={workflows}
            onSaveWorkflows={(updated) => {
              saveWorkflows(updated);
              setIsBuilderOpen(false);
              logAuditAction("Updated workflow nodes configuration inside Visual Builder");
            }}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
