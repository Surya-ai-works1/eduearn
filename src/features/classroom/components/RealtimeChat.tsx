"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Pin, Smile, Volume2, Megaphone, X } from "lucide-react";
import { useSupabaseChat } from "../../../hooks/useSupabaseChat";

interface ChatMessage {
  id: string;
  author: string;
  role: "tutor" | "learner";
  text: string;
  time: string;
  pinned?: boolean;
  isAnnouncement?: boolean;
}

const EMOJIS = ["👍", "👏", "❤️", "😊", "🎉", "🤔", "✋", "🚀"];

interface RealtimeChatProps {
  isTutor?: boolean;
  localName?: string;
  classId?: string;
}

export function RealtimeChat({ isTutor = false, localName = "You", classId }: RealtimeChatProps) {
  const { messages: dbMessages, sendMessage: sendDbMessage } = useSupabaseChat("live_class", classId || "");
  const [input, setInput] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [pinnedMsg, setPinnedMsg] = useState<ChatMessage | null>(null);
  const [unread] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Map dbMessages to the UI format
  const uiMessages: ChatMessage[] = dbMessages.map((m) => ({
    id: m.id,
    author: m.sender_name || "User",
    role: m.sender_role === "tutor" ? "tutor" : "learner",
    text: m.content,
    time: new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    pinned: m.content.startsWith("📢"),
    isAnnouncement: m.content.startsWith("📢"),
  }));

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [uiMessages]);

  useEffect(() => {
    const lastAnnouncement = uiMessages.filter((m) => m.isAnnouncement).pop();
    if (lastAnnouncement) {
      setPinnedMsg(lastAnnouncement);
    }
  }, [dbMessages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    await sendDbMessage(input.trim());
    setInput("");
  };

  const sendAnnouncement = async () => {
    if (!input.trim()) return;
    await sendDbMessage(`📢 ${input.trim()}`);
    setInput("");
  };

  const handlePin = (msg: ChatMessage) => {
    setPinnedMsg(msg.id === pinnedMsg?.id ? null : msg);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/80 text-white overflow-hidden">
      {/* Pinned message banner */}
      <AnimatePresence>
        {pinnedMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex items-start gap-2 px-3 py-2 bg-blue-500/10 border-b border-blue-500/20 shrink-0"
          >
            <Pin size={11} className="text-blue-400 mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[9px] font-black text-blue-400 uppercase">Pinned Message</p>
              <p className="text-[10px] text-foreground truncate">{pinnedMsg.text}</p>
            </div>
            <button onClick={() => setPinnedMsg(null)} className="text-muted-foreground/80 hover:text-muted-foreground focus:outline-none">
              <X size={12} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 scrollbar-thin scrollbar-thumb-slate-700">
        {uiMessages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className={`group ${msg.isAnnouncement ? "bg-blue-500/5 border border-blue-500/20 rounded-lg p-2.5" : ""}`}
          >
            <div className="flex items-start gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black shrink-0 ${
                msg.role === "tutor" ? "bg-blue-500/20 text-blue-300" : "bg-slate-700 text-muted-foreground"
              }`}>
                {msg.author[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-black ${msg.role === "tutor" ? "text-blue-400" : "text-muted-foreground"}`}>
                    {msg.author}
                  </span>
                  <span className="text-[9px] text-muted-foreground">{msg.time}</span>
                </div>
                <p className="text-xs text-foreground mt-0.5 leading-relaxed break-words">{msg.text}</p>
              </div>
              <button
                onClick={() => handlePin(msg)}
                className={`opacity-0 group-hover:opacity-100 p-1 rounded transition-all focus:outline-none ${
                  pinnedMsg?.id === msg.id ? "opacity-100 text-blue-400" : "text-muted-foreground hover:text-muted-foreground"
                }`}
              >
                <Pin size={11} />
              </button>
            </div>
          </motion.div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-border p-3 shrink-0 space-y-2">
        {/* Emoji picker */}
        <AnimatePresence>
          {showEmoji && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex flex-wrap gap-1"
            >
              {EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => { setInput((p) => p + emoji); setShowEmoji(false); }}
                  className="text-lg hover:scale-125 transition-transform focus:outline-none"
                >
                  {emoji}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEmoji((p) => !p)}
            className="text-muted-foreground/80 hover:text-muted-foreground focus:outline-none transition-colors"
          >
            <Smile size={16} />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
            placeholder="Message the class..."
            className="flex-1 bg-slate-800/60 border border-border rounded-lg px-3 py-2 text-xs text-foreground placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
          />
          {isTutor && (
            <button
              onClick={sendAnnouncement}
              title="Send as Announcement"
              className="p-2 text-muted-foreground/80 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors focus:outline-none"
            >
              <Megaphone size={16} />
            </button>
          )}
          <button
            onClick={sendMessage}
            className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors focus:outline-none">
            <Send size={16} />
          </button>
        </div>
        {unread > 0 && (
          <p className="text-[9px] text-blue-400 font-bold text-center">
            <Volume2 size={10} className="inline mr-1" />
            {unread} new messages
          </p>
        )}
      </div>
    </div>
  );
}
