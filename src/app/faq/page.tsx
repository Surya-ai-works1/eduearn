"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Container } from "../../components/layout/Container";
import { PageWrapper } from "../../components/layout/PageWrapper";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Accordion } from "../../components/ui/accordion";
import { Search, Mail, ArrowRight } from "lucide-react";

const FAQ_CATEGORIES = [
  { id: "all", name: "All Questions" },
  { id: "tutor", name: "Becoming a Tutor" },
  { id: "payments", name: "Billing & Payouts" },
  { id: "platform", name: "Platform & Classroom" },
];

const FAQ_DATA = [
  {
    id: "faq-1",
    category: "tutor",
    trigger: "Who is eligible to become a tutor on EduEarn?",
    content: "Any school or college student aged 16 to 24 with demonstrated academic, creative, or technical skills can register. All tutors go through an AI-assisted syllabus evaluation and communication review before listing courses.",
  },
  {
    id: "faq-2",
    category: "payments",
    trigger: "How do subscriptions and payment collections work?",
    content: "Learners pay course fees or subscribe via standard secure channels. EduEarn deducts a 15% platform upkeep fee, and transfers the remaining 85% directly to your UPI ID on the 5th of every calendar month.",
  },
  {
    id: "faq-3",
    category: "platform",
    trigger: "What is an AI Verified badge on a tutor's profile?",
    content: "The badge indicates that the tutor's subject knowledge, college ID credentials, and lesson delivery metrics have been audited and validated by our automated evaluation sandbox system.",
  },
  {
    id: "faq-4",
    category: "tutor",
    trigger: "Can I publish more than one course catalog?",
    content: "Yes! There are no limits to how many courses or workshops a student mentor can publish. We suggest starting with one topic and building a student subscriber list first.",
  },
  {
    id: "faq-5",
    category: "payments",
    trigger: "Is there a refund policy if I am not satisfied?",
    content: "Absolutely. We offer a 7-day refund policy on all course enrollments. Refund queries can be initiated directly from the student subscription dashboard.",
  },
  {
    id: "faq-6",
    category: "platform",
    trigger: "Do I need special equipment to teach on the site?",
    content: "No. You only need a computer with a stable internet connection, a functional webcam, and a quiet environment for hosting live doubt clearance screen-shares.",
  },
];

export default function FAQDirectoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredFaqs = FAQ_DATA.filter((faq) => {
    if (activeCategory !== "all" && faq.category !== activeCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const triggerMatch = faq.trigger.toLowerCase().includes(q);
      const contentMatch = faq.content.toLowerCase().includes(q);
      if (!triggerMatch && !contentMatch) return false;
    }
    return true;
  });

  const accordionItems = filteredFaqs.map((faq) => ({
    id: faq.id,
    trigger: faq.trigger,
    content: faq.content,
  }));

  return (
    <PageWrapper>
      {/* Header section */}
      <section className="w-full py-12 bg-muted/20 border-b border-border/40 text-left select-none">
        <Container className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-semibold">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <span>/</span>
            <span className="text-foreground">FAQs</span>
          </div>

          <div className="flex flex-col gap-2 mt-1">
            <h1 className="text-3xl md:text-4xl font-heading font-extrabold text-foreground tracking-tight">
              Frequently Asked Questions
            </h1>
            <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
              {"Find quick answers regarding tutor screening procedures, monthly payouts, classroom tools, and cancellation keys."}
            </p>
          </div>
        </Container>
      </section>

      {/* Categories select + Search */}
      <section className="w-full py-10 border-b border-border/30 select-none text-left">
        <Container className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Categories tag rows */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {FAQ_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize transition-colors cursor-pointer focus:outline-none ${
                  activeCategory === cat.id ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-muted/70"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Search bar input */}
          <div className="relative w-full md:w-80 flex items-center shrink-0">
            <Search size={14} className="absolute left-3 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 h-10 bg-card border-border/85 text-xs font-medium"
            />
          </div>
        </Container>
      </section>

      {/* Main Accordion Lists */}
      <section className="w-full py-16 select-none text-left">
        <Container className="max-w-3xl">
          {accordionItems.length === 0 ? (
            <Card variant="glass" className="p-8 text-center border-dashed border-border/60 bg-card text-xs text-muted-foreground">
              No matching questions found. Try typing another search term.
            </Card>
          ) : (
            <Accordion items={accordionItems} allowMultiple={true} className="border-border/60" />
          )}
        </Container>
      </section>

      {/* CTA Box */}
      <section className="w-full py-12 bg-muted/10 border-t border-border/40 select-none text-left">
        <Container className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col">
            <h4 className="text-sm font-heading font-extrabold text-foreground">Still have questions?</h4>
            <p className="text-[10px] text-muted-foreground mt-0.5">{"Our support team of college mentors is here to help you get started."}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/contact">
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Mail size={13} />
                Submit Ticket
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
