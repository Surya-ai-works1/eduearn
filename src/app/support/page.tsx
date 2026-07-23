"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Container } from "../../components/layout/Container";
import { PageWrapper } from "../../components/layout/PageWrapper";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Dialog } from "../../components/ui/dialog";
import { toast } from "sonner";
import { Search, MessageSquare, AlertCircle, FileText, Users } from "lucide-react";

const HELP_ARTICLES = [
  { title: "Tutor Setup Guide", category: "tutor", desc: "How to pass AI communication screenings, configure calendar slots, and list your first Calculus or React workshop." },
  { title: "SaaS Payment Cycles", category: "payments", desc: "Understanding platform uptakes (15%), tutor payouts (85%), monthly cycles, and linking UPI bank routing." },
  { title: "Doubt Clearance Classroom", category: "platform", desc: "How to operate screen-share interfaces, moderate questions, write on digital whiteboards, and recording guidelines." },
  { title: "Student Refund Policies", category: "payments", desc: "Eligibility rules for the 7-day refund policy, standard timelines, and automatic credit returns." },
];

export default function SupportPortalPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isTicketOpen, setIsTicketOpen] = useState(false);
  const [ticketData, setTicketData] = useState({ title: "", desc: "", priority: "low" });

  const handleRaiseTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketData.title.trim() || !ticketData.desc.trim()) {
      toast.error("Please fill in the ticket title and description.");
      return;
    }
    toast.success("Helpdesk ticket logged successfully! Queue position: #12");
    setTicketData({ title: "", desc: "", priority: "low" });
    setIsTicketOpen(false);
  };

  const filteredArticles = HELP_ARTICLES.filter((art) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return art.title.toLowerCase().includes(q) || art.desc.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <PageWrapper>
      {/* Header section */}
      <section className="w-full py-12 bg-muted/20 border-b border-border/40 text-left select-none">
        <Container className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-semibold">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <span>/</span>
            <span className="text-foreground">Support Portal</span>
          </div>

          <div className="flex flex-col gap-2 mt-1">
            <h1 className="text-3xl md:text-4xl font-heading font-extrabold text-foreground tracking-tight">
              Support Center &amp; Knowledge Base
            </h1>
            <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
              {"Search guides for publishing syllabi, setting hourly prices, clearing live doubts, or logging software bugs."}
            </p>
          </div>

          <div className="relative w-full max-w-xl flex items-center shrink-0 mt-2">
            <Search size={16} className="absolute left-3 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search help articles..."
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 h-11 bg-card border-border/85 text-xs font-medium"
            />
          </div>
        </Container>
      </section>

      {/* Grid listing */}
      <section className="w-full py-16 select-none text-left">
        <Container className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Articles Left Grid */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <h3 className="text-base font-heading font-extrabold text-foreground">
              Knowledge Base Guides
            </h3>

            {filteredArticles.length === 0 ? (
              <Card variant="glass" className="p-8 text-center border-dashed border-border/60 bg-card text-xs text-muted-foreground">
                No articles matches your query term.
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {filteredArticles.map((art, idx) => (
                  <Card
                    key={idx}
                    variant="default"
                    hoverEffect="lift"
                    className="p-5 border-border bg-card flex flex-col justify-between text-left group"
                  >
                    <div>
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 mb-3">
                        <FileText size={14} />
                      </div>
                      <h4 className="text-xs font-heading font-extrabold text-foreground group-hover:text-primary transition-colors leading-tight">
                        {art.title}
                      </h4>
                      <p className="text-[10px] text-muted-foreground leading-relaxed mt-2.5">
                        {art.desc}
                      </p>
                    </div>

                    <button
                      onClick={() => toast.info("Opening article detail template...")}
                      className="text-[9px] font-bold text-primary uppercase tracking-wider text-left mt-6 hover:underline cursor-pointer focus:outline-none bg-transparent"
                    >
                      Read Guide
                    </button>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Help Options Sidebar Right */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* Raise Helpdesk Ticket */}
            <Card variant="default" className="p-5 border-border bg-card shadow-soft text-left flex flex-col gap-4">
              <div className="flex items-center gap-1.5 text-primary">
                <MessageSquare size={16} />
                <h4 className="text-xs font-heading font-extrabold uppercase tracking-wider text-foreground">
                  Raise a Helpdesk Ticket
                </h4>
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                {"If you didn't find the answers in our articles list, log a direct support ticket with our engineering team."}
              </p>
              
              <Button onClick={() => setIsTicketOpen(true)} className="w-full">
                Create Help Ticket
              </Button>
            </Card>

            {/* Community policies guidelines */}
            <Card variant="default" className="p-5 border-border bg-card text-left flex flex-col gap-4">
              <div className="flex items-center gap-1.5 text-emerald-500">
                <Users size={16} />
                <h4 className="text-xs font-heading font-extrabold uppercase tracking-wider text-foreground">
                  Community Rules
                </h4>
              </div>
              
              <div className="flex flex-col gap-3 text-[10px] font-semibold text-muted-foreground leading-normal">
                <div className="flex items-start gap-2">
                  <AlertCircle size={13} className="text-primary shrink-0 mt-0.5" />
                  <span>Only students aged 16-24 can register to publish tutor portfolios.</span>
                </div>
                <div className="flex items-start gap-2">
                  <AlertCircle size={13} className="text-primary shrink-0 mt-0.5" />
                  <span>Maintain respectful communication protocols on live clearances.</span>
                </div>
                <div className="flex items-start gap-2">
                  <AlertCircle size={13} className="text-primary shrink-0 mt-0.5" />
                  <span>Adhere to platform fee models and standard withdrawal setups.</span>
                </div>
              </div>
            </Card>

          </div>

        </Container>
      </section>

      {/* Ticket dialogue popup */}
      <Dialog
        isOpen={isTicketOpen}
        onClose={() => setIsTicketOpen(false)}
        title="Raise Helpdesk Ticket"
        className="max-w-md"
      >
        <form onSubmit={handleRaiseTicket} className="flex flex-col gap-4 text-xs select-none">
          <div className="flex flex-col gap-1.5 text-left">
            <span className="font-bold text-foreground">Ticket Title *</span>
            <Input
              type="text"
              required
              placeholder="e.g. UPI payout routing error"
              value={ticketData.title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTicketData((prev) => ({ ...prev, title: e.target.value }))}
              className="w-full bg-card border-border/80"
            />
          </div>

          <div className="flex flex-col gap-1.5 text-left">
            <span className="font-bold text-foreground">Priority Level</span>
            <select
              value={ticketData.priority}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTicketData((prev) => ({ ...prev, priority: e.target.value }))}
              className="w-full bg-card border border-border shadow-sm hover:shadow-md transition-shadow duration-200 rounded-input px-3 h-10 text-xs font-semibold text-foreground focus:outline-none cursor-pointer"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High / Billing Blocking</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5 text-left">
            <span className="font-bold text-foreground">Describe Issue *</span>
            <textarea
              rows={4}
              required
              placeholder="Provide exact details regarding error triggers..."
              value={ticketData.desc}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setTicketData((prev) => ({ ...prev, desc: e.target.value }))}
              className="w-full bg-card border border-border shadow-sm hover:shadow-md transition-shadow duration-200/85 rounded-input p-3 focus:outline-none focus:border-primary/50 text-xs font-semibold text-foreground placeholder:text-muted-foreground/80 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-border/50 pt-4 mt-2">
            <Button variant="outline" size="sm" onClick={() => setIsTicketOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm">
              Log Ticket
            </Button>
          </div>
        </form>
      </Dialog>
    </PageWrapper>
  );
}
