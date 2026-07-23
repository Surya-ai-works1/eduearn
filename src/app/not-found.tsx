"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Container } from "../components/layout/Container";
import { PageWrapper } from "../components/layout/PageWrapper";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { toast } from "sonner";
import { Search, Home, HelpCircle, BookOpen, Users } from "lucide-react";

export default function NotFoundPage() {
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    toast.info(`Searching database for: ${query}...`);
    window.location.href = `/courses?search=${encodeURIComponent(query)}`;
  };

  const suggestLinks = [
    { label: "Course Marketplace", url: "/courses", icon: <BookOpen size={13} /> },
    { tutor: true, label: "Tutors Directory", url: "/tutors", icon: <Users size={13} /> },
    { label: "Frequently Asked Questions", url: "/faq", icon: <HelpCircle size={13} /> },
  ];

  return (
    <PageWrapper>
      <section className="w-full py-24 select-none text-center">
        <Container className="flex flex-col items-center justify-center gap-6 max-w-xl">
          
          {/* SVG Illustration */}
          <div className="relative w-36 h-36 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center animate-pulse">
            <span className="text-4xl font-heading font-extrabold text-primary">404</span>
          </div>

          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-heading font-extrabold text-foreground">
              {"Whoops! Page Not Found"}
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-sm mx-auto">
              {"We couldn't locate the page you requested. It might have been updated or moved to another subdirectory."}
            </p>
          </div>

          {/* Search bar input override */}
          <form onSubmit={handleSearch} className="relative w-full max-w-md flex items-center mt-2">
            <Search size={14} className="absolute left-3.5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search course catalogs..."
              value={query}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
              className="w-full pl-9 pr-3 h-10 bg-card border-border/85 text-xs font-medium"
            />
          </form>

          {/* Recommended routes */}
          <div className="flex flex-col gap-3.5 w-full mt-4 text-left">
            <span className="text-[9px] uppercase tracking-wider font-extrabold text-muted-foreground/80 text-center">
              Suggested Directory Pages
            </span>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {suggestLinks.map((link, idx) => (
                <Link key={idx} href={link.url} className="block">
                  <Card variant="glass" className="p-3 border-border hover:border-primary/40 bg-card text-center flex flex-col items-center gap-1.5 cursor-pointer h-full justify-center">
                    <div className="text-primary">{link.icon}</div>
                    <span className="text-[9px] font-bold text-foreground leading-tight">{link.label}</span>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          <Link href="/" className="mt-4">
            <Button size="sm" className="flex items-center gap-1">
              <Home size={13} />
              Return Home
            </Button>
          </Link>

        </Container>
      </section>
    </PageWrapper>
  );
}
