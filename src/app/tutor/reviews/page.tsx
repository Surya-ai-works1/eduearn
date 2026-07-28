"use client";

import React from "react";
import { useTutor } from "../../../context/TutorContext";
import { Reviews } from "../../../components/tutor/Reviews";
import { motion } from "framer-motion";

export default function TutorReviewsPage() {
  const {
    reviews,
    setReviews,
    activeReplyReviewId,
    setActiveReplyReviewId,
    replyText,
    setReplyText,
  } = useTutor();

  return (
    <motion.div
      key="reviews"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
    >
      <Reviews
        reviews={reviews}
        setReviews={setReviews}
        activeReplyReviewId={activeReplyReviewId}
        setActiveReplyReviewId={setActiveReplyReviewId}
        replyText={replyText}
        setReplyText={setReplyText}
      />
    </motion.div>
  );
}
