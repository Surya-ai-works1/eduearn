"use client";

import React from "react";
import { useTheme } from "../hooks/useTheme";
import { useMounted } from "../hooks/useMounted";
import { Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function ThemeToggle() {
  const { resolvedTheme, toggleTheme } = useTheme();
  const mounted = useMounted();

  // Avoid hydration mismatch by rendering a skeleton placeholder button
  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-button border border-border bg-card flex items-center justify-center shrink-0" />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={toggleTheme}
      className="relative w-9 h-9 rounded-button border border-border bg-card hover:bg-muted/80 text-foreground flex items-center justify-center shrink-0 transition-colors cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      aria-label="Toggle theme"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={isDark ? "dark" : "light"}
          initial={{ y: -10, opacity: 0, rotate: -45 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: 10, opacity: 0, rotate: 45 }}
          transition={{ duration: 0.15 }}
          className="flex items-center justify-center"
        >
          {isDark ? (
            <Moon className="w-[18px] h-[18px] text-primary" />
          ) : (
            <Sun className="w-[18px] h-[18px] text-amber-500" />
          )}
        </motion.div>
      </AnimatePresence>
    </button>
  );
}
export default ThemeToggle;
