"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X } from "lucide-react";

import { Progress } from "../../../components/ui/progress";
import { getPasswordStrength } from "../utils/passwordStrength";

// ─── Types ───────────────────────────────────────────────────────────────────

interface PasswordStrengthMeterProps {
  password: string;
  /** When true, shows the individual requirement checklist below the bar */
  showRequirements?: boolean;
}

// ─── Requirement definitions ──────────────────────────────────────────────────

const REQUIREMENTS = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter (A–Z)", test: (p: string) => /[A-Z]/.test(p) },
  { label: "One lowercase letter (a–z)", test: (p: string) => /[a-z]/.test(p) },
  { label: "One number (0–9)", test: (p: string) => /\d/.test(p) },
  { label: "One special character (!@#…)", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
] as const;

// ─── Requirement Row ──────────────────────────────────────────────────────────

function RequirementRow({ label, met }: { label: string; met: boolean }) {
  return (
    <motion.li
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="flex items-center gap-2"
    >
      <AnimatePresence mode="wait" initial={false}>
        {met ? (
          <motion.span
            key="check"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "backOut" }}
            className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-accent text-white"
            aria-hidden="true"
          >
            <Check size={10} strokeWidth={3} />
          </motion.span>
        ) : (
          <motion.span
            key="x"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border border-border bg-muted/60 text-muted-foreground"
            aria-hidden="true"
          >
            <X size={9} strokeWidth={2.5} />
          </motion.span>
        )}
      </AnimatePresence>
      <span
        className={`text-[11px] font-medium transition-colors duration-200 ${
          met ? "text-accent" : "text-muted-foreground"
        }`}
      >
        {label}
      </span>
    </motion.li>
  );
}

// ─── PasswordStrengthMeter ────────────────────────────────────────────────────

export function PasswordStrengthMeter({
  password,
  showRequirements = true,
}: PasswordStrengthMeterProps) {
  const strength = getPasswordStrength(password);
  const variant =
    strength.score >= 80 ? "success" : strength.score >= 60 ? "primary" : "ai";

  return (
    <div className="space-y-3" aria-live="polite" aria-label="Password strength indicator">
      {/* Strength bar row */}
      <div className="flex items-center justify-between gap-3 text-xs">
        <span className="font-bold text-foreground">Password strength</span>
        <motion.span
          key={strength.label}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className={`font-extrabold ${
            strength.score >= 80
              ? "text-accent"
              : strength.score >= 60
                ? "text-primary"
                : strength.score >= 40
                  ? "text-amber-500"
                  : "text-destructive"
          }`}
        >
          {strength.label}
        </motion.span>
      </div>

      <Progress value={strength.score} variant={variant} className="h-1.5" />

      {/* Helper description */}
      <p className="text-[11px] leading-5 text-muted-foreground">{strength.description}</p>

      {/* Requirement checklist */}
      {showRequirements && password.length > 0 && (
        <motion.ul
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="space-y-1.5 overflow-hidden rounded-[10px] border border-border bg-muted/30 px-3 py-3"
          aria-label="Password requirements"
          role="list"
        >
          {REQUIREMENTS.map(({ label, test }) => (
            <RequirementRow key={label} label={label} met={test(password)} />
          ))}
        </motion.ul>
      )}
    </div>
  );
}
