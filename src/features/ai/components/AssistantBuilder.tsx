"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Bot, Save, Eye, EyeOff, Sparkles, Settings2, Sliders,
  CheckCircle, ToggleLeft, ToggleRight, BookOpen, MessageSquare
} from "lucide-react";
import { toast } from "sonner";

import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { useAuth } from "../../../hooks/useAuth";
import { lmsHubsDb, AssistantConfig } from "../../../lib/lmsHubsDb";
import { AiChatWidget } from "../../../features/ai/components/AiChatWidget";

interface Course {
  id: string;
  title: string;
  description?: string;
}

const PERSONA_OPTIONS = [
  { value: "friendly", label: "Friendly Tutor", desc: "Warm, encouraging, uses simple language" },
  { value: "professional", label: "Professional Expert", desc: "Precise, formal, reference-based" },
  { value: "socratic", label: "Socratic Guide", desc: "Answers with questions to promote thinking" },
  { value: "strict", label: "Strict Examiner", desc: "Challenges students, high standards" },
];

const TONE_OPTIONS = [
  { value: "encouraging", label: "Encouraging" },
  { value: "neutral", label: "Neutral" },
  { value: "challenging", label: "Challenging" },
  { value: "playful", label: "Playful" },
];

interface AssistantBuilderProps {
  courses: Course[];
}

export function AssistantBuilder({ courses }: AssistantBuilderProps) {
  const { user } = useAuth();
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(courses[0] ?? null);
  const [config, setConfig] = useState<Partial<AssistantConfig>>({
    name: "Course Assistant",
    persona: "friendly",
    tone: "encouraging",
    system_prompt: "",
    enabled: true,
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    if (!selectedCourse) return;
    setLoading(true);
    lmsHubsDb.getAssistantConfig(selectedCourse.id)
      .then((existing) => {
        if (existing) setConfig(existing);
        else setConfig({
          name: `${selectedCourse.title} Assistant`,
          persona: "friendly",
          tone: "encouraging",
          system_prompt: `You are a helpful AI tutor for the course "${selectedCourse.title}". ${selectedCourse.description ?? ""}`,
          enabled: true,
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedCourse]);

  const handleSave = async () => {
    if (!user || !selectedCourse) return;
    setSaving(true);
    try {
      const personaObj = PERSONA_OPTIONS.find((p) => p.value === config.persona);
      const systemPrompt = config.system_prompt || [
        `You are an AI tutor for the course "${selectedCourse.title}".`,
        `Persona: ${personaObj?.label ?? "Friendly Tutor"} — ${personaObj?.desc ?? ""}`,
        `Tone: ${config.tone}`,
        selectedCourse.description ? `Course context: ${selectedCourse.description}` : "",
        "Answer questions clearly and in markdown format.",
      ].filter(Boolean).join("\n");

      await lmsHubsDb.upsertAssistantConfig({
        tutor_id: user.id,
        course_id: selectedCourse.id,
        name: config.name ?? "Course Assistant",
        persona: config.persona ?? "friendly",
        tone: config.tone ?? "encouraging",
        system_prompt: systemPrompt,
        enabled: config.enabled ?? true,
      });
      toast.success("Assistant configuration saved!");
    } catch {
      toast.error("Save failed. Run the Supabase migration for assistant_configs table.");
    } finally {
      setSaving(false);
    }
  };

  if (!courses.length) {
    return (
      <div className="text-center py-16 space-y-2">
        <Bot size={36} className="text-muted-foreground/40 mx-auto" />
        <p className="text-sm text-muted-foreground">Create a course first to configure its AI assistant.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Left: Configuration */}
        <div className="flex-1 space-y-4">

          {/* Course selector */}
          <Card variant="default" className="p-4 border-border bg-card space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
              <BookOpen size={14} /> Select Course
            </div>
            <div className="space-y-1.5">
              {courses.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCourse(c)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs border transition ${
                    selectedCourse?.id === c.id
                      ? "bg-primary/10 border-primary/30 text-primary font-semibold"
                      : "bg-muted border-border text-foreground hover:bg-muted/80"
                  }`}
                >
                  {c.title}
                </button>
              ))}
            </div>
          </Card>

          {/* Config fields */}
          {selectedCourse && (
            <motion.div
              key={selectedCourse.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <Card variant="default" className="p-4 border-border bg-card space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    <Settings2 size={14} /> Assistant Settings
                  </div>
                  <button
                    onClick={() => setConfig((c) => ({ ...c, enabled: !c.enabled }))}
                    className={`flex items-center gap-1.5 text-xs font-semibold transition ${
                      config.enabled ? "text-emerald-500" : "text-muted-foreground"
                    }`}
                  >
                    {config.enabled ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                    {config.enabled ? "Enabled" : "Disabled"}
                  </button>
                </div>

                {loading ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Name */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Assistant Name</label>
                      <input
                        value={config.name ?? ""}
                        onChange={(e) => setConfig((c) => ({ ...c, name: e.target.value }))}
                        className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition"
                        placeholder="e.g. Calculus Tutor"
                      />
                    </div>

                    {/* Persona */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Persona</label>
                      <div className="grid grid-cols-2 gap-2">
                        {PERSONA_OPTIONS.map((p) => (
                          <button
                            key={p.value}
                            onClick={() => setConfig((c) => ({ ...c, persona: p.value }))}
                            className={`text-left p-2.5 rounded-lg border text-xs transition ${
                              config.persona === p.value
                                ? "bg-primary/10 border-primary/30"
                                : "bg-muted border-border hover:bg-muted/80"
                            }`}
                          >
                            <p className="font-semibold text-foreground">{p.label}</p>
                            <p className="text-muted-foreground text-[10px] mt-0.5 leading-tight">{p.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Tone */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Tone</label>
                      <div className="flex flex-wrap gap-2">
                        {TONE_OPTIONS.map((t) => (
                          <button
                            key={t.value}
                            onClick={() => setConfig((c) => ({ ...c, tone: t.value }))}
                            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${
                              config.tone === t.value
                                ? "bg-primary text-white border-primary"
                                : "bg-muted border-border text-muted-foreground hover:bg-muted/80"
                            }`}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Custom system prompt */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        Custom System Prompt <span className="text-muted-foreground font-normal">(optional)</span>
                      </label>
                      <textarea
                        value={config.system_prompt ?? ""}
                        onChange={(e) => setConfig((c) => ({ ...c, system_prompt: e.target.value }))}
                        rows={4}
                        className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-xs text-foreground font-mono focus:outline-none focus:border-primary transition resize-none"
                        placeholder="Override the auto-generated system prompt. Leave blank to auto-generate from persona + tone."
                      />
                    </div>
                  </div>
                )}
              </Card>

              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={saving} className="gap-2 flex-1">
                  <Save size={14} />
                  {saving ? "Saving..." : "Save Configuration"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setPreview(!preview)}
                  className="gap-2"
                >
                  {preview ? <EyeOff size={14} /> : <Eye size={14} />}
                  {preview ? "Hide Preview" : "Preview"}
                </Button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Right: Preview */}
        {preview && selectedCourse && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-80 shrink-0"
          >
            <Card variant="default" className="p-4 border-border bg-card space-y-3 h-full">
              <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                <MessageSquare size={14} /> Live Preview
              </div>
              <p className="text-[10px] text-muted-foreground">
                This is how students will see the assistant on the course page.
              </p>
              <div className="relative h-80 bg-muted/40 rounded-xl border border-border/50 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-[10px] text-muted-foreground text-center px-4">
                    The chat widget appears as a floating button in the bottom-right corner of the course page.
                    <br /><br />
                    <span className="font-semibold text-primary">{config.name}</span>
                    <br />
                    Persona: {config.persona} · Tone: {config.tone}
                  </p>
                </div>
                <div className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center shadow-lg">
                  <Sparkles size={16} className="text-white" />
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs">
                {config.enabled
                  ? <CheckCircle size={13} className="text-emerald-500" />
                  : <div className="w-3 h-3 rounded-full bg-muted-foreground/40" />
                }
                <span className="text-muted-foreground">
                  {config.enabled ? "Assistant is active for students" : "Assistant is disabled"}
                </span>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default AssistantBuilder;
