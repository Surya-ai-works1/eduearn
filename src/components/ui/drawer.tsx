"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../utils/cn";
import { useOutsideClick } from "../../hooks/useOutsideClick";
import { useMounted } from "../../hooks/useMounted";

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  side?: "left" | "right" | "bottom";
  className?: string;
}

export function Drawer({ isOpen, onClose, title, children, side = "right", className }: DrawerProps) {
  const mounted = useMounted();
  const drawerRef = useOutsideClick<HTMLDivElement>(onClose);

  // Esc key closure listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!mounted) return null;

  // Coordinate animation parameters depending on slide side
  const slideVariants = {
    left: { initial: { x: "-100%" }, animate: { x: 0 }, exit: { x: "-100%" } },
    right: { initial: { x: "100%" }, animate: { x: 0 }, exit: { x: "100%" } },
    bottom: { initial: { y: "100%" }, animate: { y: 0 }, exit: { y: "100%" } },
  };

  const sideClasses = {
    left: "left-0 top-0 bottom-0 h-full w-80 border-r rounded-r-card",
    right: "right-0 top-0 bottom-0 h-full w-80 border-l rounded-l-card",
    bottom: "bottom-0 left-0 right-0 w-full h-[50vh] border-t rounded-t-card",
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden select-none">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
          />

          {/* Drawer Body Panel */}
          <motion.div
            {...slideVariants[side]}
            transition={{ type: "spring", bounce: 0, duration: 0.35 }}
            ref={drawerRef}
            className={cn(
              "fixed bg-card border-border shadow-floating p-6 z-10 flex flex-col focus:outline-none overflow-y-auto",
              sideClasses[side],
              className
            )}
            role="dialog"
            aria-modal="true"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/60 pb-4 mb-4">
              <h3 className="text-sm font-heading font-extrabold text-foreground">
                {title || "Navigation"}
              </h3>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-button border border-border bg-muted/20 hover:bg-muted text-muted-foreground flex items-center justify-center cursor-pointer transition-colors focus:outline-none"
                aria-label="Close drawer panel"
              >
                <X size={14} />
              </button>
            </div>

            {/* Content Body */}
            <div className="w-full flex-grow">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
export default Drawer;
