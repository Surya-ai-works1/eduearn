"use client";

import React from "react";
import { motion } from "framer-motion";

export function PageTransition({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
export default PageTransition;
