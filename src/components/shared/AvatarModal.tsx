"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Sparkles, ArrowRight } from "lucide-react";
import { PREDEFINED_AVATARS, PredefinedAvatar } from "../../constants/predefinedAvatars";

export interface AvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAvatar: (dataUrl: string, avatarId: string) => void;
  currentAvatarUrl?: string | null;
}

export function AvatarModal({
  isOpen,
  onClose,
  onSelectAvatar,
  currentAvatarUrl,
}: AvatarModalProps) {
  // Find initial avatar index or id if matched
  const initialAvatar = PREDEFINED_AVATARS.find(
    (a) => a.dataUrl === currentAvatarUrl || a.id === currentAvatarUrl
  ) || PREDEFINED_AVATARS[0];

  const [tempSelectedAvatar, setTempSelectedAvatar] = useState<PredefinedAvatar>(initialAvatar);

  // Sync temp state whenever modal opens or currentAvatarUrl changes
  useEffect(() => {
    if (isOpen) {
      const match = PREDEFINED_AVATARS.find(
        (a) => a.dataUrl === currentAvatarUrl || a.id === currentAvatarUrl
      );
      setTempSelectedAvatar(match || PREDEFINED_AVATARS[0]);
    }
  }, [isOpen, currentAvatarUrl]);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleApply = () => {
    onSelectAvatar(tempSelectedAvatar.dataUrl, tempSelectedAvatar.id);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Modal Window */}
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="avatar-modal-title"
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="relative w-full max-w-2xl bg-card border border-border shadow-2xl rounded-3xl z-10 overflow-hidden p-6 sm:p-8 flex flex-col gap-6 text-left my-auto"
        >
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h3
                id="avatar-modal-title"
                className="text-xl sm:text-2xl font-heading font-extrabold text-foreground tracking-tight flex items-center gap-2"
              >
                Choose Your <span className="text-purple-600 dark:text-purple-400">Avatar</span>
                <Sparkles size={20} className="text-purple-500 fill-purple-400/20" />
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-medium leading-relaxed">
                Pick an avatar that represents your learning journey. You can change it anytime.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-purple-600 shrink-0 cursor-pointer"
              aria-label="Close dialog"
            >
              <X size={20} />
            </button>
          </div>

          {/* 12 Avatars Grid (Desktop: 4 columns x 3 rows, Mobile: 2 columns) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 max-h-[62vh] overflow-y-auto pr-1">
            {PREDEFINED_AVATARS.map((avatar) => {
              const isSelected = tempSelectedAvatar.id === avatar.id;
              return (
                <button
                  key={avatar.id}
                  type="button"
                  onClick={() => setTempSelectedAvatar(avatar)}
                  className={`group relative flex flex-col items-center p-3.5 rounded-2xl border-2 transition-all duration-200 cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-purple-600 ${
                    isSelected
                      ? "border-purple-600 bg-purple-500/10 ring-4 ring-purple-600/20 shadow-md scale-[1.02]"
                      : "border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 hover:border-purple-300 hover:bg-white dark:hover:bg-slate-800/80 hover:shadow-soft"
                  }`}
                  aria-label={`Select ${avatar.label}`}
                  aria-pressed={isSelected}
                >
                  {/* Avatar Circular Image Container */}
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden shrink-0 flex items-center justify-center bg-purple-50 dark:bg-slate-800 border border-purple-100 dark:border-slate-700 shadow-inner transition-transform duration-200 group-hover:scale-105">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={avatar.dataUrl}
                      alt={avatar.label}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Friendly Short Label */}
                  <span className="text-xs font-extrabold text-foreground text-center truncate w-full mt-2.5 px-1">
                    {avatar.label}
                  </span>

                  {/* Selection Check Indicator Badge */}
                  {isSelected && (
                    <div className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-md animate-in zoom-in-50 duration-150">
                      <Check size={14} strokeWidth={3} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-border/50 pt-4 mt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-2xl border border-border bg-card text-xs sm:text-sm font-extrabold text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-6 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm font-extrabold shadow-soft transition-colors cursor-pointer flex items-center gap-2"
            >
              <span>Apply Avatar</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default AvatarModal;
