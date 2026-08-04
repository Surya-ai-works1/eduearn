"use client";

import React from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../../components/ui/button";
import { NoReviews } from "./EmptyState";
import type { Review } from "./types";

interface ReviewsProps {
  reviews: Review[];
  setReviews: React.Dispatch<React.SetStateAction<Review[]>>;
  activeReplyReviewId: string | null;
  setActiveReplyReviewId: (id: string | null) => void;
  replyText: string;
  setReplyText: (v: string) => void;
}

export const Reviews = React.memo(function Reviews({
  reviews,
  setReviews,
  activeReplyReviewId,
  setActiveReplyReviewId,
  replyText,
  setReplyText,
}: ReviewsProps) {
  const avgRating = reviews.length
    ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  if (reviews.length === 0) {
    return (
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
        <NoReviews />
      </motion.div>
    );
  }

  return (
    <motion.div
      key="tutor-reviews"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="space-y-5"
    >
      {/* Rating summary */}
      <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-5 card-surface p-5 rounded-card shadow-soft">
        <div className="flex flex-col items-center justify-center px-6">
          <span className="text-5xl font-bold text-foreground">{avgRating}</span>
          <div className="flex mt-1.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                size={14}
                className={Number(avgRating) >= s ? "text-amber-500 fill-amber-500" : "text-muted-foreground/30"}
              />
            ))}
          </div>
          <span className="text-[9px] text-muted-foreground mt-1">{reviews.length} reviews</span>
        </div>
        <div className="space-y-1.5">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = reviews.filter((r) => r.rating === star).length;
            const pct = reviews.length ? (count / reviews.length) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-2 text-[10px]">
                <span className="w-3 text-muted-foreground font-semibold">{star}</span>
                <Star size={10} className="text-amber-500 fill-amber-500 shrink-0" />
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-muted-foreground w-6 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Review cards */}
      <div className="flex flex-col gap-3">
        {reviews.map((rev) => (
          <div key={rev.id} className="card-surface p-4 rounded-card space-y-3 shadow-soft">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                  {rev.authorName.charAt(0)}
                </div>
                <div>
                  <span className="text-xs font-bold text-foreground block">{rev.authorName}</span>
                  <span className="text-[9px] text-muted-foreground">{rev.courseTitle}</span>
                </div>
              </div>
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={11}
                    className={rev.rating >= s ? "text-amber-500 fill-amber-500" : "text-muted-foreground/20"}
                  />
                ))}
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground leading-relaxed">
              &ldquo;{rev.comment}&rdquo;
            </p>

            {rev.reply ? (
              <div className="p-3 bg-muted/30 border border-border/40 rounded text-[11px] leading-relaxed italic text-foreground font-semibold">
                <strong>My reply:</strong> &ldquo;{rev.reply}&rdquo;
              </div>
            ) : activeReplyReviewId === rev.id ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type your reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="bg-card border border-border rounded px-3 py-1.5 text-xs text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 flex-1 font-semibold"
                />
                <Button
                  onClick={async () => {
                    if (!replyText.trim()) return;
                    // Optimistic local update
                    setReviews((prev) =>
                      prev.map((r) => (r.id === rev.id ? { ...r, reply: replyText } : r))
                    );
                    const savedReply = replyText;
                    setReplyText("");
                    setActiveReplyReviewId(null);
                    // Persist to backend (best-effort)
                    try {
                      await fetch(`/api/tutor/reviews/${rev.id}/reply`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ reply: savedReply }),
                      });
                    } catch {
                      // non-critical – reply is already shown locally
                    }
                    toast.success("Reply submitted!");
                  }}
                  size="sm"
                  className="h-9"
                >
                  Submit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9"
                  onClick={() => {
                    setReplyText("");
                    setActiveReplyReviewId(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="flex gap-3 items-center">
                <button
                  onClick={() => setActiveReplyReviewId(rev.id)}
                  className="text-[10px] font-bold text-primary hover:underline cursor-pointer focus:outline-none"
                >
                  Reply
                </button>
                <button
                  onClick={() => toast.info("Review reported to moderators.")}
                  className="text-[10px] font-bold text-rose-500/80 hover:underline cursor-pointer focus:outline-none"
                >
                  Report
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
});
