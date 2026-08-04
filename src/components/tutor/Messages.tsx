"use client";

import React from "react";
import { motion } from "framer-motion";
import { MessageSquare, Send } from "lucide-react";
import { Button } from "../../components/ui/button";
import { toast } from "sonner";

// Static mock data — defined outside component to avoid re-creation on renders
const MOCK_CONVERSATIONS = [
  { id: "1", name: "Rahul Verma", preview: "Sir, when is the next session?", time: "2h ago", unread: 2, avatar: "R" },
  { id: "2", name: "Priya Sharma", preview: "Thanks for the feedback on my assignment!", time: "1d ago", unread: 0, avatar: "P" },
  { id: "3", name: "Aditya Nair", preview: "Can I get an extension on the quiz?", time: "2d ago", unread: 1, avatar: "A" },
];

export const Messages = React.memo(function Messages() {
  const unreadCount = MOCK_CONVERSATIONS.reduce((acc, c) => acc + c.unread, 0);

  return (
    <motion.div
      key="tutor-messages"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-5"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-foreground">Messages</h2>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {MOCK_CONVERSATIONS.length} conversations
            {unreadCount > 0 && ` · ${unreadCount} unread`}
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="h-9 gap-1 font-bold"
          onClick={() => toast.info("Full messaging coming soon!")}
        >
          <Send size={13} /> New Message
        </Button>
      </div>

      <div className="card-surface rounded-card shadow-soft divide-y divide-border/40">
        {MOCK_CONVERSATIONS.map((conv) => (
          <button
            key={conv.id}
            onClick={() => toast.info(`Opening chat with ${conv.name}...`)}
            className="w-full flex items-center gap-3 p-4 hover:bg-muted/20 transition-colors cursor-pointer text-left focus:outline-none focus-visible:bg-muted/20"
          >
            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                {conv.avatar}
              </div>
              {conv.unread > 0 && (
                <div className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-primary-foreground rounded-full text-[8px] font-bold flex items-center justify-center">
                  {conv.unread}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-foreground">{conv.name}</h4>
                <span className="text-[9px] text-muted-foreground shrink-0">{conv.time}</span>
              </div>
              <p className="text-[10px] text-muted-foreground truncate mt-0.5">{conv.preview}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Coming soon banner */}
      <div className="border border-border/40 bg-muted/20 rounded-card p-6 text-center">
        <MessageSquare size={28} className="text-primary/40 mx-auto mb-3" />
        <h3 className="text-sm font-heading font-bold text-foreground mb-1">
          Real-time Messaging Coming Soon
        </h3>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
          Full-featured messaging with file sharing, video calls, and student group chats will launch soon.
        </p>
      </div>
    </motion.div>
  );
});
