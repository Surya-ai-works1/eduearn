"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Send, Bell, Ticket, Mail, HelpCircle, MessageSquare, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Card } from "../../../../../components/ui/card";
import { Button } from "../../../../../components/ui/button";

interface SupportTicket {
  id: string;
  type: string;
  title: string;
  user: string;
  status: string;
  assignedTo: string;
}

interface CommunicationTabProps {
  tickets: SupportTicket[];
  setTickets: React.Dispatch<React.SetStateAction<SupportTicket[]>>;
  logAuditAction: (actionStr: string) => void;
}

export default function CommunicationTab({
  tickets,
  setTickets,
  logAuditAction
}: CommunicationTabProps) {
  // Broadcast State
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastTarget, setBroadcastTarget] = useState("Everyone");
  const [broadcastText, setBroadcastText] = useState("");

  // Tickets Response State
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [ticketReplyText, setTicketReplyText] = useState("");

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastText.trim()) return;

    logAuditAction(`Sent targeted broadcast announcement to ${broadcastTarget}: "${broadcastTitle}"`);
    toast.success(`Broadcast announcement successfully sent to ${broadcastTarget}!`);
    setBroadcastTitle("");
    setBroadcastText("");
  };

  const handleTicketResolve = (id: string, title: string) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status: "Resolved" } : t));
    logAuditAction(`Resolved support ticket: "${title}"`);
    toast.success(`Ticket "${title}" marked as Resolved.`);
    setActiveTicketId(null);
  };

  const handleTicketReply = (e: React.FormEvent, ticket: SupportTicket) => {
    e.preventDefault();
    if (!ticketReplyText.trim()) return;

    logAuditAction(`Replied to support ticket "${ticket.title}": "${ticketReplyText.trim()}"`);
    toast.success(`Reply successfully dispatched to ${ticket.user}.`);
    setTicketReplyText("");
    setActiveTicketId(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="space-y-6 text-left text-xs font-semibold"
    >
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-3 select-none">
        <div>
          <h3 className="text-xs font-heading font-extrabold uppercase tracking-wide text-foreground">
            Platform Communication &amp; Support Ticket Desk
          </h3>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Broadcast announcement campaigns, push mobile notifications, resolve support tickets, and review bugs.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* BROADCAST GENERATOR */}
        <Card className="p-5 border-border bg-card shadow-soft space-y-4">
          <h4 className="text-xs font-heading font-extrabold uppercase text-foreground border-b border-border/20 pb-2 flex items-center gap-1.5 select-none">
            <Bell size={14} className="text-primary animate-pulse" /> Launch Target Broadcast Announcement
          </h4>
          <form onSubmit={handleBroadcast} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-foreground">Broadcast Campaign Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Platform System Maintenance Updates"
                value={broadcastTitle}
                onChange={(e) => setBroadcastTitle(e.target.value)}
                className="h-9 w-full rounded border border-border bg-muted/15 px-3 text-xs focus:outline-none"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-foreground">Target Recipient Segment</label>
              <select
                value={broadcastTarget}
                onChange={(e) => setBroadcastTarget(e.target.value)}
                className="h-9 w-full rounded border border-border bg-muted/15 px-3 text-xs focus:outline-none"
              >
                <option value="Everyone">Everyone (All Students &amp; Tutors)</option>
                <option value="Students">Students Only</option>
                <option value="Tutors">Tutors Only</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-foreground">Message Details</label>
              <textarea
                rows={4}
                required
                placeholder="Write your email/push announcement contents here..."
                value={broadcastText}
                onChange={(e) => setBroadcastText(e.target.value)}
                className="w-full bg-muted/15 border border-border rounded p-2.5 focus:outline-none text-[10px] font-semibold text-foreground resize-none"
              />
            </div>

            <Button type="submit" size="sm" className="w-full gap-1">
              <Send size={12} /> Broadcast Live Alert
            </Button>
          </form>
        </Card>

        {/* SUPPORT TICKETS QUEUE */}
        <Card className="p-5 border-border bg-card shadow-soft space-y-4">
          <h4 className="text-xs font-heading font-extrabold uppercase text-foreground border-b border-border/20 pb-2 flex items-center gap-1.5 select-none">
            <Ticket size={14} className="text-indigo-500 animate-pulse" /> Support Ticket Center ({tickets.filter(t => t.status === "Open").length} Open)
          </h4>
          <div className="space-y-3.5 max-h-[350px] overflow-y-auto pr-1">
            {tickets.map((t) => {
              const isTicketActive = activeTicketId === t.id;
              return (
                <div
                  key={t.id}
                  className="border border-border/40 p-3 bg-muted/5 rounded-card flex flex-col gap-3 transition-colors hover:border-primary/20"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-1.5 select-none">
                        <span className="text-[9px] font-bold bg-muted text-muted-foreground/80 px-1.5 py-0.5 rounded uppercase">
                          {t.type}
                        </span>
                        <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                          t.status === "Resolved" ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600 animate-pulse"
                        }`}>
                          {t.status}
                        </span>
                      </div>
                      <h5 className="font-bold text-foreground text-xs mt-2 leading-snug">{t.title}</h5>
                      <p className="text-[9px] text-muted-foreground mt-0.5">From: {t.user} · Assigned: {t.assignedTo}</p>
                    </div>
                    
                    {t.status === "Open" && (
                      <Button
                        variant="outline"
                        onClick={() => setActiveTicketId(isTicketActive ? null : t.id)}
                        className="text-[9px] h-7 px-2.5 shrink-0"
                      >
                        {isTicketActive ? "Close panel" : "Reply Ticket"}
                      </Button>
                    )}
                  </div>

                  {isTicketActive && (
                    <motion.form
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      onSubmit={(e) => handleTicketReply(e, t)}
                      className="border-t border-border/30 pt-3.5 space-y-2"
                    >
                      <textarea
                        rows={2}
                        required
                        placeholder="Write support reply template..."
                        value={ticketReplyText}
                        onChange={(e) => setTicketReplyText(e.target.value)}
                        className="w-full bg-card border border-border rounded p-2 focus:outline-none text-[10px] font-semibold text-foreground resize-none"
                      />
                      <div className="flex gap-1.5">
                        <Button type="submit" size="sm" className="h-7 text-[9px]">
                          Dispatch Response
                        </Button>
                        <Button
                          type="button"
                          onClick={() => handleTicketResolve(t.id, t.title)}
                          size="sm"
                          className="h-7 text-[9px] bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          Mark Resolved
                        </Button>
                      </div>
                    </motion.form>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </motion.div>
  );
}
