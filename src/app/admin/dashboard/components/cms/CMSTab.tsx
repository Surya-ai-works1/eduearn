"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check, Edit, Plus, Trash, Globe, FileText, Image } from "lucide-react";
import { toast } from "sonner";
import { Card } from "../../../../../components/ui/card";
import { Button } from "../../../../../components/ui/button";

interface CMSTabProps {
  logAuditAction: (actionStr: string) => void;
}

export default function CMSTab({ logAuditAction }: CMSTabProps) {
  // CMS Fields State
  const [heroTitle, setHeroTitle] = useState("Learn & Earn with India's Smartest Cohort Platform");
  const [heroSubtitle, setHeroSubtitle] = useState("Earn rewards, learn from expert industry tutors, and secure verifiable blockchain certificates.");
  const [footerText, setFooterText] = useState("© 2026 EduEarn Learning Marketplace. Empowering students, educators and creators globally.");
  
  // Testimonials Array State
  const [testimonials, setTestimonials] = useState([
    { name: "Rohan Das", text: "Best learning experience! The peer classroom whiteboard was extremely fluid." },
    { name: "Sneha Iyer", text: "Highly recommend the Web Design cohorts. I got an internship within 2 weeks of completing my certification!" }
  ]);
  const [newTestimonialName, setNewTestimonialName] = useState("");
  const [newTestimonialText, setNewTestimonialText] = useState("");

  // FAQs Array State
  const [faqs, setFaqs] = useState([
    { q: "How do I claim certificate codes?", a: "Once your course progress bar reaches 100%, check your student panel under certificates tab and copy your verified certificate hash." },
    { q: "What is the token reward coin ratio?", a: "Each coin represents ₹1. You can apply these coins to get direct flat discounts during product checks." }
  ]);
  const [newFaqQ, setNewFaqQ] = useState("");
  const [newFaqA, setNewFaqA] = useState("");

  // Blog Manager State
  const [blogs, setBlogs] = useState([
    { id: "blog-1", title: "Empowering Young Students to Earn through Mentorship", date: "June 28, 2026", author: "EduEarn Editorial" },
    { id: "blog-2", title: "Introduction to Next.js 16 and Tailwind CSS v4 design rules", date: "June 25, 2026", author: "Tech Team" }
  ]);
  const [newBlogTitle, setNewBlogTitle] = useState("");
  const [newBlogAuthor, setNewBlogAuthor] = useState("");

  const handleSaveCMS = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      const cmsData = {
        heroTitle,
        heroSubtitle,
        testimonials: JSON.stringify(testimonials),
        faqs: JSON.stringify(faqs)
      };
      localStorage.setItem("eduearn_landing_cms", JSON.stringify(cmsData));
      
      // Dispatch storage event to alert other tabs
      window.dispatchEvent(new Event("storage"));
    }
    logAuditAction("Updated platform Landing CMS copy details.");
    toast.success("CMS updates successfully saved.");
  };

  const handleAddTestimonial = () => {
    if (!newTestimonialName.trim() || !newTestimonialText.trim()) return;
    setTestimonials([...testimonials, { name: newTestimonialName.trim(), text: newTestimonialText.trim() }]);
    setNewTestimonialName("");
    setNewTestimonialText("");
    toast.success("Testimonial added to memory.");
  };

  const handleDeleteTestimonial = (index: number) => {
    setTestimonials(testimonials.filter((_, i) => i !== index));
    toast.info("Testimonial removed.");
  };

  const handleAddFaq = () => {
    if (!newFaqQ.trim() || !newFaqA.trim()) return;
    setFaqs([...faqs, { q: newFaqQ.trim(), a: newFaqA.trim() }]);
    setNewFaqQ("");
    setNewFaqA("");
    toast.success("FAQ added.");
  };

  const handleDeleteFaq = (index: number) => {
    setFaqs(faqs.filter((_, i) => i !== index));
    toast.info("FAQ removed.");
  };

  const handleAddBlog = () => {
    if (!newBlogTitle.trim()) return;
    const nextBlog = {
      id: `blog-${Date.now()}`,
      title: newBlogTitle.trim(),
      date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
      author: newBlogAuthor.trim() || "Admin Editor"
    };
    setBlogs([nextBlog, ...blogs]);
    setNewBlogTitle("");
    setNewBlogAuthor("");
    toast.success("Blog article published live.");
    logAuditAction(`Published new blog article: "${nextBlog.title}"`);
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
            Platform Content Management System (CMS) &amp; Blog Publisher
          </h3>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Modify homepage copywriting, testimonials lists, FAQs tabs, and write blogs without rebuilding codebase.
          </p>
        </div>
      </div>

      <form onSubmit={handleSaveCMS} className="space-y-6">
        {/* HOMEPAGE CORE HERO BANNER */}
        <Card className="p-5 border-border bg-card shadow-soft space-y-4">
          <h4 className="text-xs font-heading font-extrabold uppercase text-foreground border-b border-border/20 pb-2 flex items-center gap-1.5 select-none">
            <Globe size={14} className="text-primary" /> Homepage Core Copywriting &amp; Meta Info
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-foreground">Hero Headline Title</label>
              <input
                type="text"
                value={heroTitle}
                onChange={(e) => setHeroTitle(e.target.value)}
                className="h-9 w-full rounded border border-border bg-muted/15 px-3 text-xs focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-foreground">Hero Sub-headline Description</label>
              <input
                type="text"
                value={heroSubtitle}
                onChange={(e) => setHeroSubtitle(e.target.value)}
                className="h-9 w-full rounded border border-border bg-muted/15 px-3 text-xs focus:outline-none"
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-foreground">Footer Copyrights Text Label</label>
              <input
                type="text"
                value={footerText}
                onChange={(e) => setFooterText(e.target.value)}
                className="h-9 w-full rounded border border-border bg-muted/15 px-3 text-xs focus:outline-none"
              />
            </div>
          </div>
          <Button type="submit" size="sm">Save Homepage Layout</Button>
        </Card>
      </form>

      {/* TESTIMONIALS MANAGER */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5 border-border bg-card shadow-soft space-y-4">
          <h4 className="text-xs font-heading font-extrabold uppercase text-foreground border-b border-border/20 pb-2 select-none">
            Testimonials Feedback Manager
          </h4>
          <div className="space-y-3.5">
            {testimonials.map((t, idx) => (
              <div key={idx} className="p-3 bg-muted/10 border border-border/40 rounded-card flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <span className="font-bold text-foreground block">{t.name}</span>
                  <p className="text-[10px] text-muted-foreground/90 italic font-medium leading-relaxed">&ldquo;{t.text}&rdquo;</p>
                </div>
                <button
                  onClick={() => handleDeleteTestimonial(idx)}
                  className="p-1 hover:bg-destructive/10 text-muted-foreground hover:text-destructive border border-border/20 rounded cursor-pointer shrink-0 transition-colors"
                >
                  <Trash size={10} />
                </button>
              </div>
            ))}
          </div>

          <div className="border-t border-border/20 pt-4 space-y-3">
            <h5 className="font-bold text-foreground">Add Custom Student Quote</h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Student Name..."
                value={newTestimonialName}
                onChange={(e) => setNewTestimonialName(e.target.value)}
                className="h-8 rounded border border-border bg-muted/15 px-2 text-[10px] focus:outline-none"
              />
              <input
                type="text"
                placeholder="Student Review/Quote..."
                value={newTestimonialText}
                onChange={(e) => setNewTestimonialText(e.target.value)}
                className="h-8 rounded border border-border bg-muted/15 px-2 text-[10px] focus:outline-none"
              />
            </div>
            <Button onClick={handleAddTestimonial} size="sm" variant="outline" className="h-8 text-[10px]">
              Insert Testimonial
            </Button>
          </div>
        </Card>

        {/* FAQs LISTS MANAGER */}
        <Card className="p-5 border-border bg-card shadow-soft space-y-4">
          <h4 className="text-xs font-heading font-extrabold uppercase text-foreground border-b border-border/20 pb-2 select-none">
            Frequently Asked Questions (FAQs)
          </h4>
          <div className="space-y-3.5">
            {faqs.map((f, idx) => (
              <div key={idx} className="p-3 bg-muted/10 border border-border/40 rounded-card flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <span className="font-bold text-foreground block">Q: {f.q}</span>
                  <p className="text-[10px] text-muted-foreground/90 font-medium leading-relaxed">A: {f.a}</p>
                </div>
                <button
                  onClick={() => handleDeleteFaq(idx)}
                  className="p-1 hover:bg-destructive/10 text-muted-foreground hover:text-destructive border border-border/20 rounded cursor-pointer shrink-0 transition-colors"
                >
                  <Trash size={10} />
                </button>
              </div>
            ))}
          </div>

          <div className="border-t border-border/20 pt-4 space-y-3">
            <h5 className="font-bold text-foreground">Add Custom FAQ Node</h5>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Question Text..."
                value={newFaqQ}
                onChange={(e) => setNewFaqQ(e.target.value)}
                className="h-8 w-full rounded border border-border bg-muted/15 px-2 text-[10px] focus:outline-none"
              />
              <input
                type="text"
                placeholder="Answer Details..."
                value={newFaqA}
                onChange={(e) => setNewFaqA(e.target.value)}
                className="h-8 w-full rounded border border-border bg-muted/15 px-2 text-[10px] focus:outline-none"
              />
            </div>
            <Button onClick={handleAddFaq} size="sm" variant="outline" className="h-8 text-[10px]">
              Insert FAQ
            </Button>
          </div>
        </Card>
      </div>

      {/* BLOG ARTICLES PUBLISHER */}
      <Card className="p-5 border-border bg-card shadow-soft space-y-4">
        <h4 className="text-xs font-heading font-extrabold uppercase text-foreground border-b border-border/20 pb-2 select-none flex items-center gap-1.5">
          <FileText size={14} className="text-primary" /> Blog Articles Publisher
        </h4>
        <div className="space-y-3">
          {blogs.map((b) => (
            <div key={b.id} className="p-3 bg-muted/10 border border-border/40 rounded-card flex items-center justify-between">
              <div>
                <h5 className="font-bold text-foreground text-xs">{b.title}</h5>
                <p className="text-[9px] text-muted-foreground/80 font-semibold mt-0.5">Author: {b.author} · Published: {b.date}</p>
              </div>
              <button
                onClick={() => setBlogs(blogs.filter(item => item.id !== b.id))}
                className="p-1.5 hover:bg-destructive/10 text-muted-foreground hover:text-destructive border border-border/20 rounded cursor-pointer transition-colors"
              >
                <Trash size={11} />
              </button>
            </div>
          ))}
        </div>

        <div className="border-t border-border/20 pt-4 space-y-3">
          <h5 className="font-bold text-foreground">Publish New Article</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Article Title..."
              value={newBlogTitle}
              onChange={(e) => setNewBlogTitle(e.target.value)}
              className="h-9 w-full rounded border border-border bg-muted/15 px-3 text-xs focus:outline-none"
            />
            <input
              type="text"
              placeholder="Author Pen Name (optional)..."
              value={newBlogAuthor}
              onChange={(e) => setNewBlogAuthor(e.target.value)}
              className="h-9 w-full rounded border border-border bg-muted/15 px-3 text-xs focus:outline-none"
            />
          </div>
          <Button onClick={handleAddBlog} size="sm">
            Publish Live
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
