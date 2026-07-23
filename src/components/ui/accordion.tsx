"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../utils/cn";

export interface AccordionItem {
  id: string;
  trigger: string;
  content: React.ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  className?: string;
}

export function Accordion({ items, allowMultiple = false, className }: AccordionProps) {
  const [openIds, setOpenIds] = useState<string[]>([]);

  const toggleItem = (id: string) => {
    if (allowMultiple) {
      setOpenIds((prev) =>
        prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
      );
    } else {
      setOpenIds((prev) => (prev.includes(id) ? [] : [id]));
    }
  };

  return (
    <div className={cn("w-full flex flex-col border border-border rounded-card bg-card divide-y divide-border/60 overflow-hidden select-none", className)}>
      {items.map((item) => {
        const isOpen = openIds.includes(item.id);
        return (
          <div key={item.id} className="flex flex-col">
            {/* Accordion header button */}
            <button
              onClick={() => toggleItem(item.id)}
              className="flex items-center justify-between p-4 text-xs font-bold text-foreground text-left cursor-pointer hover:bg-muted/40 transition-colors focus:outline-none focus-visible:bg-muted"
              aria-expanded={isOpen}
            >
              <span>{item.trigger}</span>
              <ChevronDown
                size={14}
                className={cn("text-muted-foreground transition-transform duration-200", isOpen && "rotate-185")}
              />
            </button>

            {/* Accordion body panel */}
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="p-4 pt-1.5 text-xs text-muted-foreground leading-relaxed border-t border-border/40 bg-muted/10">
                    {item.content}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
export default Accordion;
