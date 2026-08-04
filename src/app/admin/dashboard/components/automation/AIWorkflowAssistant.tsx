"use client";

import React, { useState } from "react";
import { Card } from "../../../../../components/ui/card";
import { Sparkles, Send } from "lucide-react";
import { Button } from "../../../../../components/ui/button";
import { toast } from "sonner";
import { PlatformWorkflow } from "./WorkflowCenter";

interface AIWorkflowAssistantProps {
  onAddWorkflow: (newWf: PlatformWorkflow) => void;
}

export default function AIWorkflowAssistant({ onAddWorkflow }: AIWorkflowAssistantProps) {
  const [description, setDescription] = useState("");

  const handleGenerateWorkflow = () => {
    if (!description.trim()) {
      toast.error("Please input a natural language description first.");
      return;
    }

    // Mock natural language parsing engine
    const query = description.toLowerCase();
    let name = "AI Generated Custom Workflow";
    let trigger = "New Registration";
    let nodes: any[] = [{ id: "node-1", type: "Trigger", name: "New Registration", info: "Student registers" }];

    if (query.includes("grade") || query.includes("quiz") || query.includes("completes every assignment")) {
      name = "AI: Auto-Issue Grade Certificates";
      trigger = "Grade Updated";
      nodes = [
        { id: "node-1", type: "Trigger" as const, name: "Grade Updated", info: "Student quiz grade processed" },
        { id: "node-2", type: "Condition" as const, name: "Score > 90%", info: "Check if final score reaches threshold" },
        { id: "node-3", type: "Action" as const, name: "Generate Certificate", info: "Produce blockchain verified PDF credentials" },
        { id: "node-4", type: "Action" as const, name: "Notify Tutor", info: "Push congrats alert notification" }
      ];
    } else if (query.includes("attendance") || query.includes("late")) {
      name = "AI: Attendance Threshold Alerts";
      trigger = "Attendance Updated";
      nodes = [
        { id: "node-1", type: "Trigger" as const, name: "Attendance Updated", info: "Daily roll-call recorded" },
        { id: "node-2", type: "Condition" as const, name: "Check Attendance rate < 70%", info: "Alert dropout metrics warnings" },
        { id: "node-3", type: "Action" as const, name: "Notify Tutor", info: "Dispatch warning report notice" }
      ];
    } else {
      // Default template fallback
      name = "AI: Platform Event Hook alert";
      trigger = "New Registration";
      nodes = [
        { id: "node-1", type: "Trigger" as const, name: "New Registration", info: "New learner onboarded" },
        { id: "node-2", type: "Action" as const, name: "Send Notification", info: "Welcome notification sent to learner" }
      ];
    }

    const newWf: PlatformWorkflow = {
      id: `wf-${Date.now()}`,
      name,
      trigger,
      status: "Active",
      runsCount: 0,
      avgRuntime: "320ms",
      createdDate: new Date().toISOString().substring(0, 10),
      nodes
    };

    onAddWorkflow(newWf);
    setDescription("");
  };

  return (
    <Card className="p-5 border-border bg-card space-y-4 text-left select-none shadow-soft">
      <div className="flex justify-between items-center pb-3 border-b border-border/30">
        <h3 className="text-xs font-heading font-extrabold uppercase text-foreground flex items-center gap-1.5">
          <Sparkles size={14} className="text-primary animate-pulse" /> AI Automation Co-pilot Assistant
        </h3>
      </div>

      <div className="space-y-4 text-xs font-semibold select-none">
        <p className="text-muted-foreground leading-relaxed text-[11px]">
          Describe the business rule or automation you want to set up in natural language.
          The AI Co-pilot will automatically parse the trigger events, conditional limits, and target actions to construct the execution nodes list.
        </p>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="e.g. When a student completes every assignment with above 90%, automatically issue a certificate and notify the tutor."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="h-11 w-full rounded border border-border bg-background px-3.5 focus:outline-none"
          />
          <Button onClick={handleGenerateWorkflow} className="h-11 px-5 uppercase font-black text-[9px] flex items-center gap-1">
            <Send size={12} /> Generate
          </Button>
        </div>
      </div>
    </Card>
  );
}
