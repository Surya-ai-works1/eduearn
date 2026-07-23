"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../utils/cn";
import { useOutsideClick } from "../../hooks/useOutsideClick";
import { useMounted } from "../../hooks/useMounted";

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Dialog({ isOpen, onClose, title, children, className }: DialogProps) {
  const mounted = useMounted();
  const modalRef = useOutsideClick<HTMLDivElement>(onClose);

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

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", duration: 0.35, bounce: 0.1 }}
            ref={modalRef}
            className={cn(
              "relative bg-card border border-border shadow-sm hover:shadow-md transition-shadow duration-200 rounded-modal shadow-floating p-6 w-full max-w-lg z-10 flex flex-col focus:outline-none",
              className
            )}
            role="dialog"
            aria-modal="true"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/60 pb-4 mb-4">
              <h3 className="text-sm font-heading font-extrabold text-foreground">
                {title || "Notification"}
              </h3>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-button border border-border bg-muted/20 hover:bg-muted text-muted-foreground flex items-center justify-center cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label="Close modal dialog"
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
export default Dialog;
