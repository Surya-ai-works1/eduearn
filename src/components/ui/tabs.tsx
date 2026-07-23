"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "../../utils/cn";

export interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface TabsProps {
  items: TabItem[];
  defaultTabId?: string;
  className?: string;
  tabsClassName?: string;
  contentClassName?: string;
  variant?: "solid" | "underline";
}

export function Tabs({
  items,
  defaultTabId,
  className,
  tabsClassName,
  contentClassName,
  variant = "solid",
}: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTabId || items[0]?.id);

  return (
    <div className={cn("w-full flex flex-col gap-6 select-none", className)}>
      {/* Tabs list trigger */}
      <div
        className={cn(
          "flex items-center gap-1 relative",
          {
            "p-1 bg-muted rounded-card w-fit": variant === "solid",
            "border-b border-border w-full gap-6": variant === "underline",
          },
          tabsClassName
        )}
        role="tablist"
      >
        {items.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "relative text-xs font-bold transition-colors py-2 px-4 focus:outline-none cursor-pointer focus-visible:ring-2 focus-visible:ring-primary rounded-button",
                {
                  "text-muted-foreground hover:text-foreground": !isActive,
                  "text-foreground z-10": isActive && variant === "solid",
                  "text-primary pb-2.5 rounded-none": isActive && variant === "underline",
                }
              )}
            >
              <span className="relative z-10">{tab.label}</span>
              
              {/* Framer motion moving indicator background */}
              {isActive && variant === "solid" && (
                <motion.div
                  layoutId="activeTabBackground"
                  className="absolute inset-0 bg-card rounded-button shadow-soft border border-border/45"
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                />
              )}
              {isActive && variant === "underline" && (
                <motion.div
                  layoutId="activeTabUnderline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Tabs content panel */}
      <div className={cn("w-full", contentClassName)}>
        {items.find((item) => item.id === activeTab)?.content}
      </div>
    </div>
  );
}
export default Tabs;
