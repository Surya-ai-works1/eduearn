import React, { useState } from "react";
import { X, Scale, Check, Plus, Trash2, ArrowRight, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../../../components/ui/button";

interface ComparisonDrawerProps {
  compareList: any[];
  onRemoveItem: (course: any) => void;
  onClearAll: () => void;
}

export const ComparisonDrawer: React.FC<ComparisonDrawerProps> = ({
  compareList,
  onRemoveItem,
  onClearAll,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (compareList.length === 0) return null;

  return (
    <>
      {/* 1. STICKY BOTTOM DRAWER */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-card/95 backdrop-blur-md border-t border-border shadow-premium px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 select-none">
        {/* Left info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0">
            <Scale size={18} />
          </div>
          <div className="text-left">
            <h4 className="font-heading font-extrabold text-xs text-foreground">
              Course Comparison Deck ({compareList.length}/3)
            </h4>
            <p className="text-[10px] text-muted-foreground">
              Select up to 3 courses to compare syllabus metrics side-by-side.
            </p>
          </div>
        </div>

        {/* Selected cards row */}
        <div className="flex items-center gap-3 overflow-x-auto max-w-full">
          {compareList.map((course) => (
            <div
              key={course.id}
              className="bg-muted/40 border border-border p-2 rounded-xl flex items-center gap-2 max-w-[180px] shrink-0 group relative"
            >
              <div className="w-10 aspect-video rounded bg-slate-900 overflow-hidden shrink-0">
                {course.thumbnail || course.imageSrc ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={course.thumbnail || course.imageSrc} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-primary/10" />
                )}
              </div>
              <span className="text-[9px] font-bold text-foreground truncate max-w-[100px]" title={course.title}>
                {course.title}
              </span>
              <button
                type="button"
                onClick={() => onRemoveItem(course)}
                className="p-1 hover:bg-red-500/10 text-muted-foreground hover:text-red-500 rounded"
              >
                <X size={10} />
              </button>
            </div>
          ))}

          {compareList.length < 3 && (
            <div className="border border-dashed border-border p-2 rounded-xl flex items-center gap-2 w-[150px] justify-center select-none text-[9px] text-muted-foreground font-semibold">
              <Plus size={10} />
              <span>Add course...</span>
            </div>
          )}
        </div>

        {/* Action CTAs */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onClearAll}
            className="text-[10px] font-bold text-muted-foreground hover:text-foreground cursor-pointer focus:outline-none"
          >
            Clear All
          </button>
          
          <Button
            disabled={compareList.length < 2}
            onClick={() => setIsModalOpen(true)}
            size="sm"
            className="font-heading font-extrabold text-[10px] uppercase tracking-wide gap-1"
          >
            Compare Now
            <ArrowRight size={12} />
          </Button>
        </div>
      </div>

      {/* 2. COMPARISON TABLE MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            role="dialog"
            aria-modal="true"
            aria-label="Course Comparison Modal"
          >
            {/* Backdrop click close */}
            <div className="absolute inset-0 cursor-pointer" onClick={() => setIsModalOpen(false)} />

            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-card border border-border shadow-premium rounded-3xl p-6 w-full max-w-4xl max-h-[85vh] overflow-y-auto relative z-10 flex flex-col gap-6"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border pb-4">
                <h3 className="text-sm font-heading font-extrabold text-foreground flex items-center gap-1.5 uppercase">
                  <Scale className="text-primary" size={16} />
                  Side-by-Side Course Comparison
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-full cursor-pointer focus:outline-none"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Specs Table */}
              <div className="overflow-x-auto select-none">
                <table className="w-full border-collapse text-xs text-left">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="py-3 px-4 font-bold text-muted-foreground w-1/4">Specs</th>
                      {compareList.map((course) => (
                        <th key={course.id} className="py-3 px-4 w-1/4 font-heading font-extrabold text-foreground">
                          <div className="space-y-2">
                            <div className="aspect-video w-full rounded-lg overflow-hidden bg-slate-900 border border-border">
                              {course.thumbnail || course.imageSrc ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img src={course.thumbnail || course.imageSrc} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-primary/10" />
                              )}
                            </div>
                            <span className="block truncate max-w-[180px] font-heading font-black">{course.title}</span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border/40 hover:bg-muted/15 transition-colors">
                      <td className="py-3 px-4 font-bold text-muted-foreground">Tutor</td>
                      {compareList.map((course) => (
                        <td key={course.id} className="py-3 px-4 text-foreground font-semibold">
                          {course.tutorName}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-border/40 hover:bg-muted/15 transition-colors">
                      <td className="py-3 px-4 font-bold text-muted-foreground">Category</td>
                      {compareList.map((course) => (
                        <td key={course.id} className="py-3 px-4 text-foreground font-semibold">
                          {course.category}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-border/40 hover:bg-muted/15 transition-colors">
                      <td className="py-3 px-4 font-bold text-muted-foreground">Price</td>
                      {compareList.map((course) => (
                        <td key={course.id} className="py-3 px-4 text-foreground font-mono font-bold">
                          {course.price === 0 ? <span className="text-emerald-500">Free</span> : `₹${course.price.toLocaleString()}`}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-border/40 hover:bg-muted/15 transition-colors">
                      <td className="py-3 px-4 font-bold text-muted-foreground">Duration</td>
                      {compareList.map((course) => (
                        <td key={course.id} className="py-3 px-4 text-foreground font-semibold">
                          {course.duration || "10 hours"}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-border/40 hover:bg-muted/15 transition-colors">
                      <td className="py-3 px-4 font-bold text-muted-foreground">Complexity</td>
                      {compareList.map((course) => (
                        <td key={course.id} className="py-3 px-4 text-foreground uppercase font-bold text-[10px]">
                          {course.level || "Beginner"}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-border/40 hover:bg-muted/15 transition-colors">
                      <td className="py-3 px-4 font-bold text-muted-foreground">Rating</td>
                      {compareList.map((course) => (
                        <td key={course.id} className="py-3 px-4 text-foreground font-bold flex items-center gap-1">
                          <Star size={12} className="text-yellow-500 fill-current shrink-0" />
                          <span>{(course.rating || 4.8).toFixed(1)}</span>
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-border/40 hover:bg-muted/15 transition-colors">
                      <td className="py-3 px-4 font-bold text-muted-foreground">Lessons</td>
                      {compareList.map((course) => (
                        <td key={course.id} className="py-3 px-4 text-foreground font-semibold">
                          {course.lessonsCount || 8} lectures
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-border/40 hover:bg-muted/15 transition-colors">
                      <td className="py-3 px-4 font-bold text-muted-foreground">Certificate</td>
                      {compareList.map((course) => (
                        <td key={course.id} className="py-3 px-4 text-foreground font-semibold flex items-center gap-1">
                          <Check size={13} className="text-emerald-500 shrink-0" />
                          <span>Includes Certificate</span>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Close Button */}
              <div className="flex justify-end pt-2 border-t border-border">
                <Button onClick={() => setIsModalOpen(false)} size="sm">
                  Close Comparison
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
