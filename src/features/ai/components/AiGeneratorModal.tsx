"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Loader2, FileText, CheckCircle2 } from "lucide-react";
import { AiService } from "../services/aiService";
import { Button } from "../../../components/ui/button";
import { MarkdownViewer } from "./MarkdownViewer";

interface AiGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  promptTemplate: string;
  placeholder?: string;
  onGenerateSuccess?: (result: string) => void;
}

export function AiGeneratorModal({
  isOpen,
  onClose,
  title,
  promptTemplate,
  placeholder = "Describe what you want to generate...",
  onGenerateSuccess,
}: AiGeneratorModalProps) {
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState("");

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isGenerating) return;

    setIsGenerating(true);
    setResult("");

    await AiService.streamChatCompletion(
      promptTemplate,
      input.trim(),
      (chunk) => {
        setResult((prev) => prev + chunk);
      },
      () => {
        setIsGenerating(false);
      }
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !isGenerating && onClose()}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow duration-200 shadow-floating z-[101] rounded-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-4 border-b border-border/50 flex items-center justify-between bg-card shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary/20 to-purple-500/20 flex items-center justify-center text-primary shrink-0 border border-primary/30">
                  <Sparkles size={16} />
                </div>
                <h3 className="text-sm font-heading font-extrabold text-foreground">{title}</h3>
              </div>
              <button
                onClick={onClose}
                disabled={isGenerating}
                className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-button transition-colors focus:outline-none disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 flex flex-col gap-6">
              
              <form onSubmit={handleGenerate} className="space-y-3 shrink-0">
                <label className="text-xs font-bold text-foreground">AI Instruction Prompt</label>
                <div className="relative">
                  <textarea
                    rows={3}
                    placeholder={placeholder}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={isGenerating}
                    className="w-full bg-muted/30 border border-border rounded-xl p-3 text-sm font-semibold text-foreground focus:outline-none focus:border-primary/50 resize-none disabled:opacity-50"
                  />
                  <div className="absolute bottom-3 right-3">
                    <Button
                      type="submit"
                      disabled={!input.trim() || isGenerating}
                      className="h-8 text-xs rounded-full px-4 gap-2 shadow-soft"
                    >
                      {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                      Generate
                    </Button>
                  </div>
                </div>
              </form>

              {/* Result Preview */}
              {(result || isGenerating) && (
                <div className="flex-1 flex flex-col border border-border rounded-xl bg-card/50 overflow-hidden">
                  <div className="p-3 border-b border-border/50 bg-muted/20 flex items-center gap-2">
                    <FileText size={14} className="text-primary" />
                    <span className="text-xs font-bold text-foreground">Generated Output Preview</span>
                  </div>
                  <div className="p-4 flex-1 overflow-y-auto">
                    <MarkdownViewer content={result} className="text-xs" />
                    {isGenerating && (
                      <span className="inline-block w-1.5 h-3 ml-1 bg-primary animate-pulse align-middle" />
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            {result && !isGenerating && (
              <div className="p-4 border-t border-border/50 bg-card shrink-0 flex justify-end gap-3">
                <Button variant="ghost" onClick={onClose} className="h-9 text-xs">
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (onGenerateSuccess) onGenerateSuccess(result);
                    onClose();
                  }}
                  className="h-9 text-xs gap-2"
                >
                  <CheckCircle2 size={14} />
                  Insert into Workspace
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
