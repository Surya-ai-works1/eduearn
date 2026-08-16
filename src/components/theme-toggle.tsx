"use client";

import React from "react";
import { useTheme } from "../hooks/useTheme";
import { useMounted } from "../hooks/useMounted";
import { Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function ThemeToggle() {
  const { resolvedTheme, toggleTheme } = useTheme();
  const mounted = useMounted();

  // Avoid hydration mismatch by rendering a placeholder
  if (!mounted) {
    return (
      <div className="w-8 h-8 rounded-full border border-border bg-card flex items-center justify-center shrink-0" />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={toggleTheme}
      className="w-8 h-8 rounded-full border border-border bg-card hover:bg-muted/80 text-foreground flex items-center justify-center shrink-0 transition-colors cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={isDark ? "light-icon" : "dark-icon"}
          initial={{ y: -8, opacity: 0, rotate: -45 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: 8, opacity: 0, rotate: 45 }}
          transition={{ duration: 0.15 }}
          className="flex items-center justify-center"
        >
          {isDark ? (
            <Sun className="w-[15px] h-[15px] text-amber-500 fill-amber-500/20" />
          ) : (
            <Moon className="w-[15px] h-[15px] text-slate-700 dark:text-slate-300 fill-slate-700/10 dark:fill-slate-300/10" />
          )}
        </motion.div>
      </AnimatePresence>
    </button>
  );
}

export default ThemeToggle;
