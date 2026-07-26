"use client";

import React, { useState, useEffect, useRef } from "react";
import { Container } from "../../components/layout/Container";
import { PageWrapper } from "../../components/layout/PageWrapper";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Divider } from "../../components/ui/divider";
import { 
  Send, 
  Search, 
  Paperclip, 
  Smile, 
  Clock, 
  Check, 
  CheckCheck,
  Video,
  User,
  MoreVertical
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { communicationService, Conversation, Message } from "../../features/communication/services/communicationService";

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string>("conv-1");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const list = communicationService.getConversations();
    setConversations(list);
    if (list.length > 0) {
      setMessages(communicationService.getMessages(activeConvId));
    }
  }, [activeConvId]);

  // Auto-scroll messages to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const newMsg = communicationService.sendMessage(activeConvId, inputText);
    setMessages((prev) => [...prev, newMsg]);
    setInputText("");

    // Simulate typing indicator and tutor response
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const responses = [
        "That sounds good. I will review it shortly.",
        "Perfect! I will share the meet link here.",
        "Understood. Let me know if you run into any more bugs.",
        "Thanks for update."
      ];
      const randomReply = responses[Math.floor(Math.random() * responses.length)];
      
      const replyMsg: Message = {
        id: `m-reply-${Date.now()}`,
        senderId: "them",
        content: randomReply,
        status: "read",
        createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      // Save reply message in memory/localstorage
      const savedMessages = communicationService.getMessages(activeConvId);
      savedMessages.push(replyMsg);
      localStorage.setItem(`eduearn_messages_${activeConvId}`, JSON.stringify(savedMessages));

      setMessages((prev) => [...prev, replyMsg]);
      
      // Update last message in conversation row
      const updatedConversations = conversations.map((c) => 
        c.id === activeConvId
          ? { ...c, lastMessage: randomReply, lastMessageTime: replyMsg.createdAt }
          : c
      );
      setConversations(updatedConversations);
      communicationService.saveConversations(updatedConversations);
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  const handleAttach = () => {
    toast.info("Attachments picker: Uploading documents placeholder");
  };

  const activeConv = conversations.find((c) => c.id === activeConvId);

  // Search filter
  const filteredConversations = conversations.filter((c) => 
    c.participantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PageWrapper>
      <Container className="py-8 max-w-6xl select-none text-left">
        <div className="bg-card border border-border/80 shadow-premium rounded-3xl overflow-hidden grid grid-cols-1 md:grid-cols-12 h-[80vh]">
          
          {/* 1. Left Side: Chat threads list */}
          <div className="md:col-span-4 border-r border-border/60 flex flex-col justify-between">
            {/* Header Search */}
            <div className="p-4 space-y-3">
              <h2 className="text-sm font-heading font-black text-foreground uppercase tracking-wider">Messages Inbox</h2>
              <div className="relative flex items-center bg-muted/40 border border-border rounded-xl px-3 focus-within:ring-2 focus-within:ring-primary/45 transition">
                <Search size={14} className="text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search chats, names..."
                  className="w-full h-9 bg-transparent border-0 px-2 text-xs focus:outline-none placeholder:text-muted-foreground/75"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <Divider />

            {/* Scrollable chat threads list */}
            <div className="grow overflow-y-auto p-2 space-y-1">
              {filteredConversations.length === 0 ? (
                <div className="py-12 text-center text-xs text-muted-foreground">No conversations found.</div>
              ) : (
                filteredConversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setActiveConvId(conv.id)}
                    className={`w-full text-left p-3 rounded-2xl flex gap-3 transition cursor-pointer ${
                      activeConvId === conv.id
                        ? "bg-primary/10 border border-primary/20"
                        : "hover:bg-muted/40 border border-transparent"
                    }`}
                  >
                    {/* Avatar with online status */}
                    <div className="relative shrink-0 w-10 h-10 rounded-full bg-slate-900 border border-border">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={conv.participantAvatar} alt="" className="w-full h-full object-cover" />
                      {conv.online && (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-card" />
                      )}
                    </div>

                    <div className="grow min-w-0 space-y-0.5">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-xs font-bold text-foreground truncate">{conv.participantName}</span>
                          <span className="text-[8px] bg-muted/80 text-muted-foreground px-1.5 py-0.5 rounded font-black uppercase">
                            {conv.participantRole}
                          </span>
                        </div>
                        <span className="text-[9px] text-muted-foreground font-mono">{conv.lastMessageTime}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground truncate leading-normal">
                        {conv.lastMessage}
                      </p>
                    </div>

                    {/* Unread dot */}
                    {conv.unreadCount > 0 && (
                      <span className="shrink-0 w-2.5 h-2.5 bg-primary rounded-full mt-2" />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* 2. Right Side: Message Thread */}
          <div className="md:col-span-8 flex flex-col justify-between bg-muted/10 h-full relative">
            {activeConv ? (
              <>
                {/* Header info */}
                <div className="p-4 bg-card border-b border-border/60 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="relative w-9 h-9 rounded-full bg-slate-900 border border-border">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={activeConv.participantAvatar} alt="" className="w-full h-full object-cover" />
                      {activeConv.online && (
                        <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 rounded-full border border-card" />
                      )}
                    </div>
                    <div className="text-left space-y-0.5">
                      <h4 className="text-xs font-bold text-foreground">{activeConv.participantName}</h4>
                      <span className="text-[9px] text-muted-foreground block font-medium">
                        {activeConv.online ? "Online Now" : "Offline"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-muted text-muted-foreground hover:text-foreground rounded-full transition">
                      <Video size={15} />
                    </button>
                    <button className="p-2 hover:bg-muted text-muted-foreground hover:text-foreground rounded-full transition">
                      <MoreVertical size={15} />
                    </button>
                  </div>
                </div>

                {/* Message logs */}
                <div className="grow overflow-y-auto p-4 space-y-4">
                  {messages.map((msg) => {
                    const isMe = msg.senderId === "me";

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col max-w-[70%] space-y-1 ${
                          isMe ? "ml-auto items-end" : "mr-auto items-start"
                        }`}
                      >
                        <div
                          className={`p-3 rounded-2xl text-xs leading-relaxed font-light ${
                            isMe
                              ? "bg-primary text-primary-foreground rounded-tr-none text-right"
                              : "bg-card border border-border text-foreground rounded-tl-none text-left"
                          }`}
                        >
                          {msg.content}
                        </div>
                        <div className="flex items-center gap-1 text-[8px] text-muted-foreground font-mono">
                          <span>{msg.createdAt}</span>
                          {isMe && (
                            msg.status === "read" ? (
                              <CheckCheck size={10} className="text-primary" />
                            ) : (
                              <Check size={10} />
                            )
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Typing Indicator bubble */}
                  {isTyping && (
                    <div className="mr-auto items-start max-w-[70%] flex gap-2">
                      <div className="bg-card border border-border p-3 rounded-2xl rounded-tl-none flex gap-1 items-center shrink-0">
                        <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Text entry field */}
                <div className="p-4 bg-card border-t border-border/60 flex items-center gap-3 shrink-0">
                  <button
                    onClick={handleAttach}
                    className="p-2 hover:bg-muted text-muted-foreground hover:text-foreground rounded-full transition"
                    title="Add attachment"
                  >
                    <Paperclip size={16} />
                  </button>

                  <input
                    type="text"
                    placeholder={`Type message to ${activeConv.participantName}...`}
                    className="grow h-10 bg-muted/40 border border-border rounded-xl px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/45"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyPress}
                  />

                  <button
                    onClick={handleSend}
                    className="p-2.5 bg-primary hover:bg-primary/95 text-primary-foreground rounded-xl transition shadow-soft cursor-pointer"
                    title="Send message"
                  >
                    <Send size={15} />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center grow text-muted-foreground text-xs space-y-2 select-none">
                <span>Select a conversation to start chat.</span>
              </div>
            )}
          </div>

        </div>
      </Container>
    </PageWrapper>
  );
}
