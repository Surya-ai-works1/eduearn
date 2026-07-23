"use client";

import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff } from "lucide-react";
import { cn } from "../../../utils/cn";

interface VoiceOrbProps {
  isListening: boolean;
  isSpeaking?: boolean;
  onToggle: () => void;
  size?: "sm" | "md" | "lg";
  className?: string;
}

// ─── Animated Ring ─────────────────────────────────────────────────────────────
function PulseRing({ delay = 0, scale = 1.4 }: { delay?: number; scale?: number }) {
  return (
    <motion.span
      className="absolute inset-0 rounded-full bg-primary/30"
      initial={{ scale: 1, opacity: 0.6 }}
      animate={{ scale, opacity: 0 }}
      transition={{ duration: 1.4, delay, repeat: Infinity, ease: "easeOut" }}
    />
  );
}

// ─── Canvas Waveform ──────────────────────────────────────────────────────────
function Waveform({ isActive }: { isActive: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bars = 24;
    let frame = 0;

    function draw() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barW = canvas.width / (bars * 1.8);
      const gap = barW * 0.8;

      for (let i = 0; i < bars; i++) {
        const x = i * (barW + gap) + gap / 2;
        const height = isActive
          ? (Math.sin(frame * 0.12 + i * 0.5) * 0.5 + 0.5) * canvas.height * 0.7 + canvas.height * 0.1
          : canvas.height * 0.15;

        const gradient = ctx.createLinearGradient(0, canvas.height - height, 0, canvas.height);
        gradient.addColorStop(0, "rgba(139,92,246,0.9)");
        gradient.addColorStop(1, "rgba(59,130,246,0.6)");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, canvas.height - height, barW, height, barW / 2);
        ctx.fill();
      }
      frame++;
      rafRef.current = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, [isActive]);

  return (
    <canvas
      ref={canvasRef}
      width={120}
      height={40}
      className="opacity-80"
      style={{ imageRendering: "pixelated" }}
    />
  );
}

// ─── Main Voice Orb ───────────────────────────────────────────────────────────
export function VoiceOrb({
  isListening,
  isSpeaking = false,
  onToggle,
  size = "md",
  className,
}: VoiceOrbProps) {
  const isActive = isListening || isSpeaking;

  const sizeMap = {
    sm: { orb: "w-12 h-12", icon: 16, waveScale: 0.5 },
    md: { orb: "w-16 h-16", icon: 20, waveScale: 0.75 },
    lg: { orb: "w-24 h-24", icon: 28, waveScale: 1 },
  };

  const { orb, icon } = sizeMap[size];

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      {/* Orb button */}
      <button
        onClick={onToggle}
        className={cn(
          "relative rounded-full flex items-center justify-center focus:outline-none transition-all duration-300",
          orb,
          isActive
            ? "bg-gradient-to-br from-primary to-violet-600 shadow-lg shadow-primary/40"
            : "bg-muted border border-border hover:bg-muted/80"
        )}
        aria-label={isListening ? "Stop listening" : "Start voice input"}
      >
        {/* Pulse rings when active */}
        <AnimatePresence>
          {isActive && (
            <>
              <PulseRing delay={0} scale={1.4} />
              <PulseRing delay={0.4} scale={1.7} />
              <PulseRing delay={0.8} scale={2.0} />
            </>
          )}
        </AnimatePresence>

        {/* Orb inner glow */}
        {isActive && (
          <motion.div
            className="absolute inset-2 rounded-full bg-white/10"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}

        {/* Icon */}
        <motion.div
          animate={{ scale: isActive ? [1, 1.08, 1] : 1 }}
          transition={{ duration: 0.6, repeat: isActive ? Infinity : 0 }}
          className="relative z-10"
        >
          {isListening ? (
            <Mic size={icon} className="text-white" />
          ) : (
            <MicOff size={icon} className={isActive ? "text-white" : "text-muted-foreground"} />
          )}
        </motion.div>
      </button>

      {/* Waveform */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
          >
            <Waveform isActive={isActive} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Label */}
      <span className="text-[10px] text-muted-foreground font-medium">
        {isListening ? "Sparky is listening..." : isSpeaking ? "Sparky is speaking..." : "Voice Input"}
      </span>
    </div>
  );
}

export default VoiceOrb;
