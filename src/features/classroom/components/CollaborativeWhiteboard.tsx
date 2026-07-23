"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Pen, Eraser, Square, Circle, Type, Minus,
  Undo2, Redo2, Trash2, Download, Palette,
} from "lucide-react";
type Tool = "pen" | "eraser" | "rect" | "circle" | "line" | "text";


const COLORS = [
  "#ffffff", "#f8fafc", "#e2e8f0",
  "#f87171", "#fb923c", "#fbbf24", "#4ade80", "#60a5fa", "#a78bfa", "#f472b6",
  "#dc2626", "#d97706", "#16a34a", "#2563eb", "#7c3aed", "#db2777",
];

export function CollaborativeWhiteboard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<Tool>("pen");
  const [color, setColor] = useState("#60a5fa");
  const [lineWidth, setLineWidth] = useState(3);
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [showColorPicker, setShowColorPicker] = useState(false);

  const getCtx = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.getContext("2d");
  }, []);

  const saveSnapshot = useCallback(() => {
    const ctx = getCtx();
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;
    const snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory((prev) => {
      const newHistory = prev.slice(0, historyIdx + 1);
      newHistory.push(snapshot);
      if (newHistory.length > 30) newHistory.shift();
      return newHistory;
    });
    setHistoryIdx((prev) => Math.min(prev + 1, 29));
  }, [getCtx, historyIdx]);

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = getCtx();
    if (!canvas || !ctx) return;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveSnapshot();
  }, [getCtx, saveSnapshot]);

  useEffect(() => {
    initCanvas();
    const handleResize = () => initCanvas();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const getPos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const pos = getPos(e);
    const ctx = getCtx();
    if (!ctx) return;
    setIsDrawing(true);
    setStartPos(pos);

    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    ctx.strokeStyle = tool === "eraser" ? "#0f172a" : color;
    ctx.lineWidth = tool === "eraser" ? lineWidth * 4 : lineWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing) return;
    const pos = getPos(e);
    const ctx = getCtx();
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;

    if (tool === "pen" || tool === "eraser") {
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    } else {
      // For shapes restore snapshot and draw preview
      if (history[historyIdx]) {
        ctx.putImageData(history[historyIdx], 0, 0);
      }
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.beginPath();

      if (tool === "rect") {
        ctx.strokeRect(startPos.x, startPos.y, pos.x - startPos.x, pos.y - startPos.y);
      } else if (tool === "circle") {
        const radius = Math.sqrt(Math.pow(pos.x - startPos.x, 2) + Math.pow(pos.y - startPos.y, 2)) / 2;
        const cx = (startPos.x + pos.x) / 2;
        const cy = (startPos.y + pos.y) / 2;
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.stroke();
      } else if (tool === "line") {
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
      }
    }
  };

  const endDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing) return;
    setIsDrawing(false);
    saveSnapshot();
  };

  const handleUndo = () => {
    const ctx = getCtx();
    if (!ctx || historyIdx <= 0) return;
    const newIdx = historyIdx - 1;
    ctx.putImageData(history[newIdx], 0, 0);
    setHistoryIdx(newIdx);
  };

  const handleRedo = () => {
    const ctx = getCtx();
    if (!ctx || historyIdx >= history.length - 1) return;
    const newIdx = historyIdx + 1;
    ctx.putImageData(history[newIdx], 0, 0);
    setHistoryIdx(newIdx);
  };

  const handleClear = () => {
    const ctx = getCtx();
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveSnapshot();
  };

  const tools: { id: Tool; icon: React.ReactNode; label: string }[] = [
    { id: "pen", icon: <Pen size={16} />, label: "Pen" },
    { id: "eraser", icon: <Eraser size={16} />, label: "Eraser" },
    { id: "line", icon: <Minus size={16} />, label: "Line" },
    { id: "rect", icon: <Square size={16} />, label: "Rectangle" },
    { id: "circle", icon: <Circle size={16} />, label: "Circle" },
    { id: "text", icon: <Type size={16} />, label: "Text" },
  ];

  return (
    <div className="flex flex-col h-full bg-[#0f172a] rounded-xl overflow-hidden border border-border">
      {/* Whiteboard Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 bg-slate-900/80 border-b border-border flex-wrap shrink-0">
        {/* Tool buttons */}
        <div className="flex items-center gap-1 border-r border-border pr-2 mr-1">
          {tools.map((t) => (
            <button
              key={t.id}
              title={t.label}
              onClick={() => setTool(t.id)}
              className={`p-1.5 rounded transition-colors focus:outline-none ${
                tool === t.id
                  ? "bg-blue-500/20 text-blue-400 border border-blue-500/40"
                  : "text-muted-foreground hover:text-white hover:bg-slate-800"
              }`}
            >
              {t.icon}
            </button>
          ))}
        </div>

        {/* Color picker */}
        <div className="relative border-r border-border pr-2 mr-1">
          <button
            title="Color"
            onClick={() => setShowColorPicker((p) => !p)}
            className="p-1.5 rounded hover:bg-slate-800 focus:outline-none flex items-center gap-1"
          >
            <Palette size={16} className="text-muted-foreground" />
            <div className="w-4 h-4 rounded-full border border-slate-600" style={{ backgroundColor: color }} />
          </button>
          {showColorPicker && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-full left-0 mt-1 p-2 bg-slate-900 border border-slate-700 rounded-lg grid grid-cols-8 gap-1 z-50 shadow-2xl"
            >
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => { setColor(c); setShowColorPicker(false); }}
                  className={`w-5 h-5 rounded-full border-2 transition-transform hover:scale-125 focus:outline-none ${
                    color === c ? "border-white scale-110" : "border-transparent"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </motion.div>
          )}
        </div>

        {/* Line width */}
        <div className="flex items-center gap-2 border-r border-border pr-2 mr-1">
          <span className="text-[9px] text-muted-foreground/80 font-bold uppercase">Width</span>
          <input
            type="range"
            min={1}
            max={20}
            value={lineWidth}
            onChange={(e) => setLineWidth(Number(e.target.value))}
            className="w-16 h-1 accent-blue-500"
          />
          <span className="text-[9px] text-muted-foreground font-bold w-4">{lineWidth}</span>
        </div>

        {/* History controls */}
        <button title="Undo" onClick={handleUndo} disabled={historyIdx <= 0} className="p-1.5 rounded text-muted-foreground hover:text-white hover:bg-slate-800 disabled:opacity-30 focus:outline-none transition-colors">
          <Undo2 size={16} />
        </button>
        <button title="Redo" onClick={handleRedo} disabled={historyIdx >= history.length - 1} className="p-1.5 rounded text-muted-foreground hover:text-white hover:bg-slate-800 disabled:opacity-30 focus:outline-none transition-colors">
          <Redo2 size={16} />
        </button>
        <button title="Clear" onClick={handleClear} className="p-1.5 rounded text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 focus:outline-none transition-colors">
          <Trash2 size={16} />
        </button>
        <button title="Export (placeholder)" onClick={() => {}} className="p-1.5 rounded text-muted-foreground hover:text-white hover:bg-slate-800 focus:outline-none transition-colors ml-auto">
          <Download size={16} />
        </button>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-crosshair touch-none"
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
        />
        <div className="absolute bottom-2 right-2 text-[9px] font-bold text-muted-foreground uppercase select-none pointer-events-none">
          Collaborative Whiteboard
        </div>
      </div>
    </div>
  );
}
