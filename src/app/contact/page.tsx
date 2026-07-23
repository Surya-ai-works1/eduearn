"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Container } from "../../components/layout/Container";
import { PageWrapper } from "../../components/layout/PageWrapper";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { toast } from "sonner";
import { Mail, Phone, MapPin, ArrowRight, HelpCircle } from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "general",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast.error("Please fill in all required form fields.");
      return;
    }
    toast.success("Message dispatched successfully! A support peer will reply within 24 hours.");
    setFormData({ name: "", email: "", subject: "general", message: "" });
  };

  const contactOptions = [
    { label: "Email Support", desc: "support@eduearn.org", icon: <Mail size={16} className="text-primary" /> },
    { label: "Peer Helpline", desc: "+91 800 234 5678", icon: <Phone size={16} className="text-accent" /> },
    { label: "Incubation Office", desc: "IIT Madras Research Park, Chennai, IN", icon: <MapPin size={16} className="text-emerald-500" /> },
  ];

  return (
    <PageWrapper>
      {/* Header section */}
      <section className="w-full py-12 bg-muted/20 border-b border-border/40 text-left select-none">
        <Container className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-semibold">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <span>/</span>
            <span className="text-foreground">Contact Us</span>
          </div>

          <div className="flex flex-col gap-2 mt-1">
            <h1 className="text-3xl md:text-4xl font-heading font-extrabold text-foreground tracking-tight">
              Get in Touch
            </h1>
            <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
              {"Have a query regarding tutor registration credentials, subscription payments, or workspace bugs? Send us a ticket."}
            </p>
          </div>
        </Container>
      </section>

      {/* Main Form + Info Layout */}
      <section className="w-full py-16 select-none text-left">
        <Container className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Info & Map Left Column */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <h3 className="text-lg font-heading font-extrabold text-foreground">
              Contact Channels
            </h3>
            
            <div className="flex flex-col gap-4">
              {contactOptions.map((opt, idx) => (
                <Card key={idx} variant="glass" className="p-4 border-border bg-card flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted border border-border/60 flex items-center justify-center shrink-0">
                    {opt.icon}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground/80">{opt.label}</span>
                    <span className="text-xs font-bold text-foreground mt-0.5">{opt.desc}</span>
                  </div>
                </Card>
              ))}
            </div>

            {/* Google Maps static placeholder SVG canvas */}
            <div className="flex flex-col gap-3.5 mt-2">
              <span className="text-[9px] uppercase tracking-wider font-extrabold text-muted-foreground/80">Location Map</span>
              <div className="relative w-full aspect-video bg-muted border border-border rounded-modal flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-hero-gradient opacity-10" />
                <div className="flex flex-col items-center gap-1.5 z-10 text-center">
                  <MapPin size={22} className="text-primary animate-bounce" />
                  <span className="text-[10px] font-bold text-foreground">IIT Madras Research Park Campus</span>
                  <span className="text-[8px] text-muted-foreground">Chennai, Tamil Nadu 600113</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form Right Column */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <h3 className="text-lg font-heading font-extrabold text-foreground">
              Submit a Ticket
            </h3>
            
            <Card variant="default" className="p-6 border-border bg-card shadow-soft">
              <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs">
                
                {/* Name */}
                <div className="flex flex-col gap-1.5">
                  <span className="font-bold text-foreground">Full Name *</span>
                  <Input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-card border-border/85"
                  />
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <span className="font-bold text-foreground">Email Address *</span>
                  <Input
                    type="email"
                    required
                    placeholder="name@college.edu"
                    value={formData.email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    className="w-full bg-card border-border/85"
                  />
                </div>

                {/* Subject Select */}
                <div className="flex flex-col gap-1.5 text-left">
                  <span className="font-bold text-foreground">Topic of Inquiry</span>
                  <select
                    value={formData.subject}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData((prev) => ({ ...prev, subject: e.target.value }))}
                    className="w-full bg-card border border-border shadow-sm hover:shadow-md transition-shadow duration-200 rounded-input px-3 h-10 text-xs font-semibold text-foreground focus:outline-none cursor-pointer"
                  >
                    <option value="general">General Inquiry</option>
                    <option value="tutor">Becoming a Tutor / Wallet Payouts</option>
                    <option value="payment">Subscription Billing Support</option>
                    <option value="abuse">Report Course / Abuse Report</option>
                  </select>
                </div>

                {/* Message */}
                <div className="flex flex-col gap-1.5">
                  <span className="font-bold text-foreground">Message Body *</span>
                  <textarea
                    rows={5}
                    required
                    placeholder="Describe your question or issue in detail..."
                    value={formData.message}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
                    className="w-full bg-card border border-border shadow-sm hover:shadow-md transition-shadow duration-200/85 rounded-input p-3 focus:outline-none focus:border-primary/50 text-xs font-semibold text-foreground placeholder:text-muted-foreground/80 resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 border-t border-border/40 pt-4 mt-2">
                  <Button type="submit" size="md">
                    Send Message
                  </Button>
                </div>

              </form>
            </Card>
          </div>

        </Container>
      </section>

      {/* Support links bottom row */}
      <section className="w-full py-12 bg-muted/10 border-t border-border/40 select-none text-left">
        <Container className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex flex-col">
            <h4 className="text-sm font-heading font-extrabold text-foreground">Looking for instant answers?</h4>
            <p className="text-[10px] text-muted-foreground mt-0.5">Explore our frequently asked questions or visit the Knowledge Base.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/faq">
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <HelpCircle size={13} />
                Explore FAQs
              </Button>
            </Link>
            <Link href="/support">
              <Button size="sm" className="flex items-center gap-1">
                Help Portal
                <ArrowRight size={13} />
              </Button>
            </Link>
          </div>
        </Container>
      </section>
    </PageWrapper>
  );
}
