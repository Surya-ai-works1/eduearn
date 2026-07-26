"use client";

import React, { useState, useMemo } from "react";
import { Sparkles, CheckSquare, BrainCircuit, RefreshCw, Compass } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { DashboardCard } from "./DashboardCard";

interface AiAssistantWidgetProps {
  stats: any;
  setAiAssistantOpen: (open: boolean) => void;
  setAiAssistantType: (type: any) => void;
  setAiInputText: (text: string) => void;
}

export function AiAssistantWidget({
  stats,
  setAiAssistantOpen,
  setAiAssistantType,
  setAiInputText,
}: AiAssistantWidgetProps) {
  const [recIndex, setRecIndex] = useState(0);

  // Rotating study recommendations with detailed sub-tasks
  const rotatingRecs = useMemo(() => {
    return [
      {
        topic: "Recursion Base Cases",
        status: "Needs Focus (45% mastery)",
        reason: "Calculus Limits & Python data trees rely on recursion. Let's fix this core concept.",
        actionMessage: "Explain recursion base cases with easy code examples",
        actionLabel: "Doubt solver",
        actionType: "homework" as const,
      },
      {
        topic: "React useEffect cleanup",
        status: "Review Required (68% mastery)",
        reason: "You completed modular programming yesterday. Cleanup memory loops is next.",
        actionMessage: "Provide a quick roadmap to master React useEffect and cleanup hooks",
        actionLabel: "Generate Roadmap",
        actionType: "roadmap" as const,
      },
      {
        topic: "Calculus: Derivatives Challenge",
        status: "Practice Quiz (Goal: 80%)",
        reason: "Weekly calculus challenge is closing. Review derivatives to secure 50 coins.",
        actionMessage: "Give me 3 practice quiz questions on calculus derivatives",
        actionLabel: "Practice Quiz",
        actionType: "quiz" as const,
      },
      {
        topic: "Python Dictionary comprehensions",
        status: "Optimize Code (85% mastery)",
        reason: "You used loops in the calculator task. Comprehensions will make it Stripe-quality.",
        actionMessage: "Explain Python dictionary comprehensions with real-life examples",
        actionLabel: "Analyze code",
        actionType: "study" as const,
      },
    ];
  }, []);

  const currentRec = rotatingRecs[recIndex];

  const handleRotate = () => {
    setRecIndex((prev) => (prev + 1) % rotatingRecs.length);
  };

  const handleAction = () => {
    setAiInputText(currentRec.actionMessage);
    setAiAssistantType(currentRec.actionType);
    setAiAssistantOpen(true);
  };

  return (
    <DashboardCard
      variant="premium"
      hoverEffect="glow"
      className="p-6 border-blue-200/50 dark:border-indigo-900/30 bg-gradient-to-br from-blue-50/50 via-indigo-50/30 to-violet-50/30 dark:from-slate-900 dark:to-indigo-950/20 text-left shadow-soft flex flex-col justify-between"
    >
      <div className="space-y-4 w-full">
        <div className="flex items-center justify-between border-b border-blue-100/50 dark:border-indigo-950 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-primary animate-pulse fill-primary/10" />
            <h3 className="text-xs font-heading font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">
              ✨ Sparky AI Assistant Widget
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRotate}
              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 rounded-lg transition-colors cursor-pointer focus:outline-none"
              title="Next Recommendation"
            >
              <RefreshCw size={13} className="hover:rotate-180 transition-transform duration-500" />
            </button>
            <span className="text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-black">
              AI Active
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Daily Study Recommendations */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-250 flex items-center gap-1.5">
              <BrainCircuit className="w-3.5 h-3.5 text-primary" /> Rotating Recommendations
            </h4>
            
            <div className="p-3 bg-white/60 dark:bg-slate-950/40 border border-blue-100/40 dark:border-slate-800/40 rounded-2xl space-y-1">
              <div className="flex justify-between items-start gap-2">
                <span className="text-xs font-bold text-slate-850 dark:text-slate-200">{currentRec.topic}</span>
              </div>
              <span className="text-[9px] font-black text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded inline-block mt-1">
                {currentRec.status}
              </span>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 leading-relaxed font-medium">
                {currentRec.reason}
              </p>
            </div>
          </div>

          {/* AI-Generated Revision Plan */}
          <div className="space-y-3 border-t lg:border-t-0 lg:border-x border-slate-200/50 dark:border-slate-800/40 pt-4 lg:pt-0 lg:px-6">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-250 flex items-center gap-1.5">
              <CheckSquare className="w-3.5 h-3.5 text-emerald-500" /> AI Revision Checklist
            </h4>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[10px] text-slate-650 dark:text-slate-350">
                <input type="checkbox" defaultChecked className="rounded border-slate-300 dark:border-slate-800 text-primary" />
                <span className="line-through opacity-70">Complete Python comprehensions</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-650 dark:text-slate-350">
                <input type="checkbox" className="rounded border-slate-300 dark:border-slate-800 text-primary" />
                <span>Test Calculus limits base quiz</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-650 dark:text-slate-350">
                <input type="checkbox" className="rounded border-slate-300 dark:border-slate-800 text-primary" />
                <span>Practice 3 Keyboard chord flows</span>
              </div>
            </div>
          </div>

          {/* Sparky Action Plan CTA */}
          <div className="space-y-3 pt-4 lg:pt-0 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-250 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-purple-500" /> Recommended Action
              </h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed mt-1">
                Sparky recommends generating a prompt query to solve this doubt right now.
              </p>
            </div>

            <Button
              onClick={handleAction}
              size="sm"
              className="w-full text-[10px] h-8.5 font-bold shadow-soft rounded-xl bg-gradient-to-r from-blue-600 to-indigo-650 text-white border-0 mt-3"
            >
              Ask AI: {currentRec.actionLabel}
            </Button>
          </div>
        </div>
      </div>
    </DashboardCard>
  );
}
export default AiAssistantWidget;
