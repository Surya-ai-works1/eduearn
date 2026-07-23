"use client";

import React from "react";
import { Card } from "../../ui/card";
import { Avatar } from "../../ui/avatar";
import { MOCK_CATEGORIES, MOCK_TUTORS } from "../../../constants/mockData";
import { Sparkles, Star, TrendingUp, Award } from "lucide-react";
import Link from "next/link";

interface MarketplaceSidebarProps {
  onCategorySelect: (catId: string) => void;
  activeCategory: string;
}

export function MarketplaceSidebar({
  onCategorySelect,
  activeCategory,
}: MarketplaceSidebarProps) {
  // Take 5 popular categories
  const featuredCats = MOCK_CATEGORIES.slice(0, 5);

  // Take 3 top student tutors
  const topTutors = MOCK_TUTORS.slice(0, 3);

  // Trending skills tag cloud
  const trendingSkills = [
    "React Server",
    "Figma Auto-Layout",
    "Calculus Integrals",
    "Prompt Patterns",
    "SIPs & Mutual Funds",
    "DSLR Manual",
  ];

  return (
    <div className="w-full flex flex-col gap-6 select-none text-left">
      
      {/* Widget 1: Featured Categories */}
      <Card variant="glass" className="p-5 flex flex-col gap-4 border-border/60 bg-card">
        <h4 className="text-xs font-heading font-extrabold text-foreground uppercase tracking-wider flex items-center gap-1.5">
          <TrendingUp size={13} className="text-primary" />
          Featured Categories
        </h4>
        <div className="flex flex-col gap-2">
          {featuredCats.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onCategorySelect(cat.id)}
              className={`w-full flex justify-between items-center text-xs font-semibold py-1.5 px-2 rounded-md hover:bg-muted transition-colors cursor-pointer text-left ${
                activeCategory === cat.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="truncate">{cat.name}</span>
              <span className="text-[10px] text-muted-foreground font-mono font-bold bg-muted/65 px-1.5 py-0.5 rounded">
                {cat.count}
              </span>
            </button>
          ))}
        </div>
      </Card>

      {/* Widget 2: Top Tutors */}
      <Card variant="default" className="p-5 flex flex-col gap-4 border-border/60 bg-card">
        <h4 className="text-xs font-heading font-extrabold text-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Star size={13} className="text-amber-500 fill-amber-500" />
          Top Tutors This Week
        </h4>
        <div className="flex flex-col gap-3.5">
          {topTutors.map((tutor) => (
            <Link key={tutor.id} href={`/tutors/${tutor.id}`} className="flex items-center gap-3 group">
              <Avatar src={tutor.avatar} name={tutor.fullName} size="sm" badge="verified" />
              <div className="flex flex-col overflow-hidden">
                <span className="text-[11px] font-extrabold text-foreground group-hover:text-primary transition-colors truncate">
                  {tutor.fullName}
                </span>
                <span className="text-[9px] text-muted-foreground font-semibold flex items-center gap-0.5 mt-0.5">
                  <Star size={8} className="fill-amber-500 text-amber-500" />
                  {tutor.rating.toFixed(1)} ({tutor.totalStudents} students)
                </span>
              </div>
            </Link>
          ))}
        </div>
      </Card>

      {/* Widget 3: Trending Skills tag cloud */}
      <Card variant="glass" className="p-5 flex flex-col gap-4 border-border/60 bg-card">
        <h4 className="text-xs font-heading font-extrabold text-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles size={13} className="text-accent" />
          Trending Skills
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {trendingSkills.map((skill, idx) => (
            <span
              key={idx}
              className="px-2 py-1 rounded text-[9px] font-extrabold bg-muted text-white/90 hover:bg-primary/5 hover:text-primary border border-border/30 cursor-pointer transition-colors"
            >
              {skill}
            </span>
          ))}
        </div>
      </Card>

      {/* Widget 4: Learning Pathways quick promo */}
      <Card variant="default" className="p-5 flex flex-col gap-3 border-border/60 bg-card relative overflow-hidden group">
        <div className="absolute -top-10 -right-10 w-20 h-20 rounded-full bg-accent/5 group-hover:scale-150 transition-transform duration-500 pointer-events-none" />
        <h4 className="text-xs font-heading font-extrabold text-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Award size={13} className="text-accent" />
          Learning Pathways
        </h4>
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          Follow curated sequences of courses designed by student mentors to go from beginner to job-ready.
        </p>
        <Link
          href="/#learning-paths"
          className="text-[9px] font-extrabold text-primary uppercase tracking-wider hover:underline mt-1 flex items-center gap-0.5"
        >
          View Roadmaps &rarr;
        </Link>
      </Card>

    </div>
  );
}

export default MarketplaceSidebar;
