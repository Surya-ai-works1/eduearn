"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Save, Plus, Play, Info } from "lucide-react";
import { Button } from "../../../../../components/ui/button";
import { Card } from "../../../../../components/ui/card";
import { toast } from "sonner";
import { PlatformWorkflow, WorkflowNode } from "./WorkflowCenter";

interface WorkflowBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  workflowId: string | null;
  workflows: PlatformWorkflow[];
  onSaveWorkflows: (updated: PlatformWorkflow[]) => void;
}

export default function WorkflowBuilder({
  isOpen,
  onClose,
  workflowId,
  workflows,
  onSaveWorkflows
}: WorkflowBuilderProps) {
  const [wfName, setWfName] = useState("");
  const [nodes, setNodes] = useState<WorkflowNode[]>([]);
  const [selectedTrigger, setSelectedTrigger] = useState("New Registration");

  // Load existing workflow
  useEffect(() => {
    const existing = workflows.find(w => w.id === workflowId);
    if (existing) {
      setWfName(existing.name);
      setNodes(existing.nodes);
      setSelectedTrigger(existing.trigger);
    } else {
      setWfName(`Workflow ${Date.now().toString().substring(8)}`);
      setNodes([
        { id: "node-1", type: "Trigger", name: "New Registration", info: "Student register webhook endpoint trigger" }
      ]);
    }
  }, [workflowId, workflows]);

  const handleAddNode = (type: "Condition" | "Action" | "Delay", name: string, info: string) => {
    // Security check: check duplicate trigger/mappings loops (Module 13)
    if (nodes.some(n => n.name === name)) {
      toast.error("Circular Dependency check: Duplicate action node check fails");
      return;
    }

    const newNode: WorkflowNode = {
      id: `node-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type,
      name,
      info
    };
    setNodes(prev => [...prev, newNode]);
    toast.success(`Appended ${type} step to pipeline flow`);
  };

  const handleRemoveNode = (id: string) => {
    if (nodes.find(n => n.id === id)?.type === "Trigger") {
      toast.error("Pipeline constraints: Cannot delete trigger master node!");
      return;
    }
    setNodes(prev => prev.filter(n => n.id !== id));
  };

  const handleSave = () => {
    if (!wfName.trim()) {
      toast.error("Please insert a valid workflow name.");
      return;
    }

    // Security constraints duplicate name check (Module 13)
    if (!workflowId && workflows.some(w => w.name.toLowerCase() === wfName.toLowerCase())) {
      toast.error("Workflow name already exists in database registry!");
      return;
    }

    let updated: PlatformWorkflow[] = [];
    if (workflowId) {
      updated = workflows.map(w => w.id === workflowId ? { ...w, name: wfName, trigger: selectedTrigger, nodes } : w);
    } else {
      const newWf: PlatformWorkflow = {
        id: `wf-${Date.now()}`,
        name: wfName,
        trigger: selectedTrigger,
        status: "Active",
        runsCount: 0,
        avgRuntime: "240ms",
        createdDate: new Date().toISOString().substring(0, 10),
        nodes
      };
      updated = [...workflows, newWf];
    }

    onSaveWorkflows(updated);
    toast.success("Workflow successfully registered.");
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-end select-none text-left">
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25 }}
        className="w-full max-w-lg bg-background border-l border-border h-full p-6 flex flex-col justify-between overflow-y-auto"
      >
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b border-border/30 pb-3">
            <h3 className="text-xs font-heading font-black text-foreground uppercase">Visual Pipeline Flow Builder</h3>
            <button onClick={onClose} className="p-1 hover:bg-muted rounded text-muted-foreground"><X size={15} /></button>
          </div>

          {/* Workflow parameters */}
          <div className="space-y-3.5">
            <div>
              <label className="text-[10px] font-black uppercase text-muted-foreground mb-1 block">Workflow Name</label>
              <input
                type="text"
                value={wfName}
                onChange={(e) => setWfName(e.target.value)}
                className="h-10 w-full rounded border border-border bg-card px-3.5 text-xs font-semibold focus:outline-none"
              />
            </div>
          </div>

          {/* Node graph flow */}
          <div className="p-4 border border-border/40 bg-muted/10 rounded-lg space-y-4 relative select-none">
            <span className="text-[10px] uppercase font-black tracking-wider text-muted-foreground block">Execution Steps pipeline flow</span>
            
            <div className="space-y-3 flex flex-col items-center">
              {nodes.map((node, idx) => (
                <div key={node.id} className="w-full flex flex-col items-center gap-2">
                  <div className="w-full p-3.5 bg-card border border-border rounded-lg flex items-center justify-between shadow-soft hover:border-primary/40 transition-colors">
                    <div>
                      <span className="text-[8px] font-black uppercase px-2 py-0.5 bg-primary/10 text-primary rounded border border-primary/20">{node.type}</span>
                      <h4 className="text-foreground font-black text-[12.5px] mt-1.5">{node.name}</h4>
                      <p className="text-[10px] text-muted-foreground/80 mt-1">{node.info}</p>
                    </div>
                    {node.type !== "Trigger" && (
                      <button onClick={() => handleRemoveNode(node.id)} className="p-1 hover:bg-rose-500/10 text-rose-500 rounded border border-border/40">
                        <X size={12} />
                      </button>
                    )}
                  </div>
                  {idx < nodes.length - 1 && (
                    <span className="text-muted-foreground/30 text-lg font-black">&darr;</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Node appenders */}
          <div className="p-4 border border-border/40 rounded-lg space-y-3 select-none">
            <span className="text-[10px] uppercase font-black tracking-wider text-muted-foreground block">Append execution action node</span>
            <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
              <Button variant="outline" onClick={() => handleAddNode("Condition", "Check Student GPA", "Verify grade averages >= 90%")} className="h-9 border-border bg-card uppercase text-[9px] font-black">
                + Add Condition
              </Button>
              <Button variant="outline" onClick={() => handleAddNode("Action", "Generate Certificate PDF", "Issue credential hash")} className="h-9 border-border bg-card uppercase text-[9px] font-black">
                + Issue Cert
              </Button>
              <Button variant="outline" onClick={() => handleAddNode("Delay", "Wait 48 hours delay", "Delay action execution")} className="h-9 border-border bg-card uppercase text-[9px] font-black">
                + Add Delay
              </Button>
              <Button variant="outline" onClick={() => handleAddNode("Action", "Send Webhook Callback", "Dispatch secure JSON body payload")} className="h-9 border-border bg-card uppercase text-[9px] font-black">
                + Dispatch Webhook
              </Button>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-border/30 flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1 uppercase font-bold text-[9px] h-10 border-border bg-card">Cancel</Button>
          <Button onClick={handleSave} className="flex-1 uppercase font-black text-[9.5px] h-10">
            <Save size={13} className="mr-1.5" /> Save Workflow
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
