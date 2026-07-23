"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Sliders, Play, Plus, Trash2, Edit2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Card } from "../../../../../components/ui/card";
import { Button } from "../../../../../components/ui/button";

interface AiControlTabProps {
  logAuditAction: (actionStr: string) => void;
}

export default function AiControlTab({ logAuditAction }: AiControlTabProps) {
  // AI System Config
  const [model, setModel] = useState("gemini-2.5-flash");
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2048);
  const [dailyQuota, setDailyQuota] = useState(500);

  // System Prompt Library State
  const [prompts, setPrompts] = useState([
    { id: "pr-1", title: "Sparky Assistant Core Persona", template: "Act as an empathetic peer study companion. Explain programming loops in simple terms.", active: true },
    { id: "pr-2", title: "Code Debugger Snippet Helper", template: "You are an expert compiler. Check syntax errors in JavaScript and suggest solutions.", active: false }
  ]);

  const [newTitle, setNewTitle] = useState("");
  const [newTemplate, setNewTemplate] = useState("");

  const handleSaveAiConfig = (e: React.FormEvent) => {
    e.preventDefault();
    logAuditAction(`Updated AI LLM settings: model=${model}, temperature=${temperature}`);
    toast.success("AI Configuration keys updated successfully.");
  };

  const handleAddPrompt = () => {
    if (!newTitle.trim() || !newTemplate.trim()) return;
    const nextPrompt = {
      id: `pr-${Date.now()}`,
      title: newTitle.trim(),
      template: newTemplate.trim(),
      active: false
    };
    setPrompts([...prompts, nextPrompt]);
    setNewTitle("");
    setNewTemplate("");
    toast.success("New system prompt template saved to library.");
    logAuditAction(`Added AI prompt template: "${nextPrompt.title}"`);
  };

  const handleTogglePrompt = (id: string, title: string) => {
    setPrompts(prompts.map(p => ({
      ...p,
      active: p.id === id ? true : false // Make only one active
    })));
    toast.success(`Prompt "${title}" activated globally.`);
    logAuditAction(`Activated global system prompt persona: "${title}"`);
  };

  const handleDeletePrompt = (id: string, title: string) => {
    setPrompts(prompts.filter(p => p.id !== id));
    toast.error("Prompt template removed.");
    logAuditAction(`Deleted prompt library item: "${title}"`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="space-y-6 text-left text-xs font-semibold"
    >
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-3 select-none">
        <div>
          <h3 className="text-xs font-heading font-extrabold uppercase tracking-wide text-foreground">
            Sparky AI Orchestration Control Center
          </h3>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Configure Google Gemini API engine models, temperature thresholds, credits, and active chatbot persona templates.
          </p>
        </div>
      </div>

      {/* PARAMETERS CONFIG */}
      <Card className="p-5 border-border bg-card shadow-soft">
        <h4 className="text-xs font-heading font-extrabold uppercase text-foreground border-b border-border/20 pb-2 mb-4 flex items-center gap-1.5 select-none">
          <Sliders size={14} className="text-primary animate-pulse" /> Gemini API Bindings Configuration
        </h4>
        <form onSubmit={handleSaveAiConfig} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-foreground">Default Target Model</label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="h-10 w-full rounded border border-border bg-muted/15 px-3 text-xs focus:outline-none"
              >
                <option value="gemini-2.5-flash">Gemini 2.5 Flash (default)</option>
                <option value="gemini-2.5-pro">Gemini 2.5 Pro (complex)</option>
                <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
              </select>
            </div>
            
            <div className="space-y-1">
              <label className="text-foreground flex justify-between">
                <span>Temperature</span>
                <span className="text-primary font-bold">{temperature}</span>
              </label>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(Number(e.target.value))}
                className="h-10 w-full cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <label className="text-foreground">Max Generation Tokens</label>
              <input
                type="number"
                value={maxTokens}
                onChange={(e) => setMaxTokens(Number(e.target.value))}
                className="h-10 w-full rounded border border-border bg-muted/15 px-3 text-xs focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-foreground">Daily Request Quota / User</label>
              <input
                type="number"
                value={dailyQuota}
                onChange={(e) => setDailyQuota(Number(e.target.value))}
                className="h-10 w-full rounded border border-border bg-muted/15 px-3 text-xs focus:outline-none"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" size="sm">Save AI Parameters</Button>
          </div>
        </form>
      </Card>

      {/* AI USAGE MONITOR & ANALYTICS PREVIEW */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 select-none">
        {[
          { label: "AI Requests Today", val: "8,943 calls", sub: "Gemini 2.5 Flash default" },
          { label: "Estimated Token Cost", val: "$0.0026", sub: "Approximate API split" },
          { label: "Active Prompts Persona", val: "Sparky Core Persona", sub: "Base persona outline v1" },
          { label: "API Provider Status", val: "Operational", sub: "Sandbox keys check pass" }
        ].map((item, i) => (
          <div key={i} className="border border-border bg-card p-4 rounded-card flex flex-col justify-between shadow-soft">
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide block truncate">
              {item.label}
            </span>
            <div className="mt-2">
              <span className="text-sm font-heading font-extrabold text-foreground block">{item.val}</span>
              <span className="text-[8px] text-muted-foreground/80 font-normal">{item.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* PROMPT PERSONA LIBRARY */}
      <Card className="p-5 border-border bg-card shadow-soft space-y-4">
        <h4 className="text-xs font-heading font-extrabold uppercase text-foreground border-b border-border/20 pb-2 flex items-center gap-1.5 select-none">
          <Sparkles size={14} className="text-primary" /> Prompt Library &amp; Personas
        </h4>
        <div className="space-y-3.5">
          {prompts.map((p) => (
            <div
              key={p.id}
              className="border border-border/40 p-3.5 bg-muted/5 rounded-card flex flex-col md:flex-row md:items-start justify-between gap-4"
            >
              <div>
                <h5 className="font-extrabold text-foreground text-xs flex items-center gap-2">
                  {p.title}
                  {p.active && (
                    <span className="text-[8px] bg-emerald-500/10 text-emerald-600 px-1.5 py-0.5 rounded font-extrabold uppercase tracking-wide">
                      ACTIVE PERSONA
                    </span>
                  )}
                </h5>
                <p className="text-[10px] text-muted-foreground/90 font-semibold mt-1.5 leading-relaxed font-mono bg-card/40 p-2 border border-border/20 rounded">
                  {p.template}
                </p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 self-end md:self-start select-none">
                {!p.active && (
                  <Button
                    onClick={() => handleTogglePrompt(p.id, p.title)}
                    size="sm"
                    className="h-7 text-[8px] bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                  >
                    Activate Persona
                  </Button>
                )}
                <button
                  onClick={() => handleDeletePrompt(p.id, p.title)}
                  className="p-1.5 hover:bg-destructive/10 text-muted-foreground hover:text-destructive border border-border/20 rounded cursor-pointer transition-colors"
                >
                  <Trash2 size={11} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Create Prompt form */}
        <div className="border-t border-border/20 pt-4 space-y-3">
          <h5 className="font-bold text-foreground">Write Custom Persona Prompt</h5>
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Persona Title (e.g. Science Tutor, Chemistry Explainer)..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="h-8 w-full rounded border border-border bg-muted/15 px-2.5 text-[10px] focus:outline-none"
            />
            <textarea
              rows={3}
              placeholder="System Prompt Instructions... (e.g., Act as a tutor, use simple English, add jokes...)"
              value={newTemplate}
              onChange={(e) => setNewTemplate(e.target.value)}
              className="w-full bg-muted/15 border border-border rounded p-2.5 focus:outline-none text-[10px] font-semibold text-foreground resize-none"
            />
          </div>
          <Button onClick={handleAddPrompt} size="sm">
            Save Prompt Persona
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
