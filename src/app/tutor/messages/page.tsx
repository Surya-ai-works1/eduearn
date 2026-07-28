"use client";

import React from "react";
import { Messages } from "../../../components/tutor/Messages";
import { motion } from "framer-motion";

export default function TutorMessagesPage() {
  return (
    <motion.div
      key="messages"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
    >
      <Messages />
    </motion.div>
  );
}
