"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Container } from "../../components/layout/Container";
import { PageWrapper } from "../../components/layout/PageWrapper";
import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { toast } from "sonner";
import { Search, Calendar, ArrowRight, BookOpen, Clock } from "lucide-react";

const ARTICLES_DATA = [
  {
    id: "post-1",
    title: "How to Balance College Classes with Student Tutoring",
    category: "Peer Study",
    author: "Aditya Roy",
    date: "June 24, 2026",
    readTime: "4 min read",
    desc: "Tips from an elite Calculus mentor on structuring calendar blocks, managing homework prep, and hosting live clearances.",
  },
  {
    id: "post-2",
    title: "The Rise of Peer-to-Peer Learning in 2026",
    category: "Trends",
    author: "Neha Sharma",
    date: "June 18, 2026",
    readTime: "6 min read",
    desc: "Why school students learn academic algebra or coding logic twice as fast from college students compared to corporate slides.",
  },
  {
    id: "post-3",
    title: "How to Build Your First Web Portfolio in Under 30 Days",
    category: "Tech",
    author: "Surya Prakash",
    date: "May 29, 2026",
    readTime: "8 min read",
    desc: "A step-by-step roadmap for web design wireframes in Figma, HTML layout, responsive CSS, and dynamic React components.",
  },
  {
    id: "post-4",
    title: "Starting from Scratch: Master Photography on a Budget",
    category: "Creative",
    author: "Rohan Das",
    date: "May 12, 2026",
    readTime: "5 min read",
    desc: "You don't need a high-end DSLR setup to start learning camera composition. Here are 5 tricks for mobile phone photography.",
  },
];

export default function BlogListingPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter a valid email address.");
      return;
    }
    toast.success("Subscribed to the EduEarn newsletter!");
    setEmail("");
  };

  const filteredArticles = ARTICLES_DATA.filter((post) => {
    if (activeCategory !== "all" && post.category !== activeCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const titleMatch = post.title.toLowerCase().includes(q);
      const descMatch = post.desc.toLowerCase().includes(q);
      if (!titleMatch && !descMatch) return false;
    }
    return true;
  });

  const categories = ["all", "Peer Study", "Trends", "Tech", "Creative"];

  return (
    <PageWrapper>
      {/* Header section */}
      <section className="w-full py-12 bg-muted/20 border-b border-border/40 text-left select-none">
        <Container className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-semibold">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <span>/</span>
            <span className="text-foreground">Blog Articles</span>
          </div>

          <div className="flex flex-col gap-2 mt-1">
            <h1 className="text-3xl md:text-4xl font-heading font-extrabold text-foreground tracking-tight">
              Platform Articles &amp; Insights
            </h1>
            <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
              {"Explore guidebooks, study tips, design principles, and engineering updates compiled by student peer mentors."}
            </p>
          </div>
        </Container>
      </section>

      {/* Categories select + Search */}
      <section className="w-full py-10 border-b border-border/30 select-none text-left">
        <Container className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Categories tag rows */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize transition-colors cursor-pointer focus:outline-none ${
                  activeCategory === cat ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-muted/70"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search bar input */}
          <div className="relative w-full md:w-80 flex items-center shrink-0">
            <Search size={14} className="absolute left-3 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 h-10 bg-card border-border/85 text-xs font-medium"
            />
          </div>
        </Container>
      </section>

      {/* Main Grid feed */}
      <section className="w-full py-12 select-none text-left">
        <Container className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Articles list left column */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            {filteredArticles.length === 0 ? (
              <Card variant="glass" className="p-8 text-center border-dashed border-border/60 bg-card text-xs text-muted-foreground">
                No blog articles match your active search terms.
              </Card>
            ) : (
              filteredArticles.map((post) => (
                <Card
                  key={post.id}
                  variant="default"
                  hoverEffect="lift"
                  className="p-6 border-border bg-card flex flex-col gap-4 text-left group"
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                      <Badge variant="primary" className="text-[8px] font-extrabold uppercase tracking-wider px-2 py-0.5">
                        {post.category}
                      </Badge>
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-semibold">
                        <span className="flex items-center gap-1">
                          <Calendar size={11} />
                          {post.date}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock size={11} />
                          {post.readTime}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-base font-heading font-extrabold text-foreground group-hover:text-primary transition-colors leading-tight mt-1.5">
                      {post.title}
                    </h3>
                    <p className="text-[11px] text-muted-foreground leading-relaxed mt-1">
                      {post.desc}
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-border/30 pt-4 mt-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-[9px] text-primary shrink-0">
                        {post.author.charAt(0)}
                      </div>
                      <span className="text-[10px] font-bold text-foreground">{post.author}</span>
                    </div>

                    <button
                      onClick={() => toast.info(`Article details template opens in Phase 3.5`)}
                      className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1 hover:underline cursor-pointer focus:outline-none bg-transparent"
                    >
                      Read Full Post
                      <ArrowRight size={11} />
                    </button>
                  </div>
                </Card>
              ))
            )}
          </div>

          {/* Sidebar right column */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* Newsletter Subscription */}
            <Card variant="default" className="p-5 border-border bg-card shadow-soft text-left flex flex-col gap-4">
              <div className="flex items-center gap-1.5 text-primary">
                <BookOpen size={16} />
                <h4 className="text-xs font-heading font-extrabold uppercase tracking-wider text-foreground">
                  Weekly Insights
                </h4>
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                {"Sign up to receive study guides, syllabus outlines, and student earnings reports directly in your inbox."}
              </p>
              
              <form onSubmit={handleSubscribe} className="flex flex-col gap-2.5">
                <Input
                  type="email"
                  required
                  placeholder="name@college.edu"
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  className="w-full bg-card border-border/80 text-[11px] h-9"
                />
                <Button type="submit" size="sm" className="w-full">
                  Subscribe Now
                </Button>
              </form>
            </Card>

            {/* Trending post list */}
            <Card variant="default" className="p-5 border-border bg-card">
              <h4 className="text-xs font-heading font-extrabold uppercase tracking-wider text-foreground mb-4">
                Trending Articles
              </h4>
              <div className="flex flex-col gap-4">
                {[
                  "Calculus shortcuts for entrance exam prep",
                  "Why learning to prompt is the new programming foundation",
                  "How to structure an online recorded course syllabus",
                ].map((title, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-muted-foreground leading-normal hover:text-foreground cursor-pointer" onClick={() => toast.info("Opening post...")}>
                    <span className="font-extrabold text-primary shrink-0 mt-0.5">0{idx + 1}</span>
                    <span className="font-semibold text-foreground text-[10px] hover:underline">{title}</span>
                  </div>
                ))}
              </div>
            </Card>

          </div>

        </Container>
      </section>
    </PageWrapper>
  );
}
