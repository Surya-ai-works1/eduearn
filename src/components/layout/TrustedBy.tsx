"use client";

import React from "react";
import { Container } from "./Container";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const MARQUEE_SKILLS = [
  { label: "Guitar", emoji: "🎸", id: "music" },
  { label: "Piano", emoji: "🎹", id: "music" },
  { label: "Singing", emoji: "🎤", id: "music" },
  { label: "Bharatanatyam", emoji: "💃", id: "dance" },
  { label: "Hip Hop", emoji: "🕺", id: "dance" },
  { label: "Acting", emoji: "🎭", id: "public-speaking" },
  { label: "Painting", emoji: "🎨", id: "arts" },
  { label: "Sketching", emoji: "🖌", id: "arts" },
  { label: "Photography", emoji: "📷", id: "photography" },
  { label: "Videography", emoji: "🎥", id: "videography" },
  { label: "Cooking", emoji: "🍳", id: "cooking" },
  { label: "Baking", emoji: "🧁", id: "baking" },
  { label: "Programming", emoji: "💻", id: "programming" },
  { label: "Artificial Intelligence", emoji: "🤖", id: "ai-prompting" },
  { label: "Data Science", emoji: "📊", id: "programming" },
  { label: "Business", emoji: "📈", id: "business" },
  { label: "Stock Market", emoji: "💰", id: "finance" },
  { label: "Yoga", emoji: "🧘", id: "fitness" },
  { label: "Sports", emoji: "🏸", id: "sports" },
  { label: "Chess", emoji: "♟", id: "chess" },
  { label: "Languages", emoji: "🌎", id: "languages" },
  { label: "Makeup", emoji: "💄", id: "beauty" },
  { label: "Tailoring", emoji: "🪡", id: "fashion" },
  { label: "Crochet", emoji: "🧵", id: "crafts" },
  { label: "Interior Design", emoji: "🏡", id: "interior-design" },
  { label: "Content Creation", emoji: "📱", id: "content-creation" },
  { label: "Podcasting", emoji: "🎙", id: "podcasting" },
  { label: "Film Making", emoji: "🎬", id: "videography" },
  { label: "School Subjects", emoji: "📚", id: "mathematics" },
  { label: "Competitive Exams", emoji: "🧠", id: "competitive-exams" },
];

export function TrustedBy() {
  // Duplicate list to make infinite scroll seamless
  const duplicatedSkills = [...MARQUEE_SKILLS, ...MARQUEE_SKILLS, ...MARQUEE_SKILLS];

  return (
    <section className="w-full bg-muted/20 border-y border-border/40 py-10 select-none overflow-hidden relative">
      {/* Edge gradient masks for fade styling */}
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

      <Container className="flex flex-col gap-6 text-center items-center">
        <div className="flex flex-col items-center gap-1.5">
          <span className="text-[10px] uppercase tracking-wider font-extrabold text-primary bg-primary/10 px-3 py-1 rounded-full w-fit">
            Explore 300+ Skills
          </span>
          <h3 className="text-xl md:text-2xl font-heading font-extrabold text-foreground tracking-tight mt-1">
            Discover Trending Subjects
          </h3>
        </div>
        
        {/* Infinite scroller */}
        <div className="w-full flex overflow-hidden relative mt-2">
          <div
            className="flex items-center gap-6 whitespace-nowrap animate-marquee motion-reduce:animate-none"
          >
            {duplicatedSkills.map((skill, idx) => (
              <Link key={idx} href={`/courses?category=${skill.id}`} className="block shrink-0">
                <div
                  className="flex items-center justify-between w-52 shrink-0 px-4 py-3 rounded-full border bg-card text-foreground border-border/50 shadow-soft hover:border-primary/30 hover:bg-primary/5 hover:scale-105 transition-all duration-300 cursor-pointer text-xs font-bold group select-none"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-base shrink-0">{skill.emoji}</span>
                    <span className="truncate">{skill.label}</span>
                  </div>
                  <ArrowUpRight size={13} className="text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

export default TrustedBy;
