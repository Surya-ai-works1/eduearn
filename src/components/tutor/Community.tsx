"use client";

import React from "react";
import { motion } from "framer-motion";
import { Globe2, MessageSquare, Users, Hash } from "lucide-react";
import { Button } from "../../components/ui/button";
import { toast } from "sonner";

export const Community = React.memo(function Community() {
  return (
    <motion.div
      key="tutor-community"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="space-y-5"
    >
      <div>
        <h2 className="text-base font-heading font-extrabold text-foreground">Community</h2>
        <p className="text-[10px] text-muted-foreground mt-0.5">Connect with students and other tutors</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          {
            icon: MessageSquare,
            title: "Tutor Forums",
            desc: "Discuss teaching strategies with the educator community.",
            count: "1.2k members",
            color: "text-primary bg-primary/10 border-primary/20",
          },
          {
            icon: Users,
            title: "Student Q&A",
            desc: "Answer questions from your enrolled students.",
            count: "248 questions",
            color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
          },
          {
            icon: Hash,
            title: "Study Groups",
            desc: "Create or join collaborative learning groups.",
            count: "43 active groups",
            color: "text-purple-500 bg-purple-500/10 border-purple-500/20",
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="card-surface rounded-card p-5 shadow-soft flex flex-col gap-3">
              <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${item.color}`}>
                <Icon size={18} />
              </div>
              <div>
                <h3 className="text-sm font-heading font-bold text-foreground">{item.title}</h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">{item.desc}</p>
              </div>
              <div className="flex items-center justify-between mt-auto">
                <span className="text-[9px] text-muted-foreground font-semibold">{item.count}</span>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-[10px] font-bold"
                  onClick={() => toast.info(`${item.title} feature coming soon!`)}
                >
                  Join
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Coming soon notice */}
      <div className="border border-border/40 bg-muted/20 rounded-card p-6 text-center">
        <Globe2 size={32} className="text-primary/30 mx-auto mb-3" />
        <h3 className="text-sm font-heading font-bold text-foreground mb-1">Full Community Hub Coming Soon</h3>
        <p className="text-[10px] text-muted-foreground max-w-sm mx-auto">
          The full community experience — live discussions, mentorship boards, and tutor spotlights — is being built.
        </p>
      </div>
    </motion.div>
  );
});
