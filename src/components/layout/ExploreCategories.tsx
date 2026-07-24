"use client";

import React from "react";
import {
  Code2,
  Cpu,
  Music,
  Camera,
  UtensilsCrossed,
  Dumbbell,
  Sparkles,
  Briefcase,
  Globe,
  Palette,
  Mic,
  PenTool,
  Bot,
  GraduationCap,
  Megaphone,
} from "lucide-react";
import { Container } from "./Container";
import { Card } from "../ui/card";
import Link from "next/link";
import Image from "next/image";
import { MOCK_CATEGORIES } from "../../constants/mockData";
import { getCategoryBanner } from "../../lib/courseThumbnailRegistry";
import { StaggerContainer, staggerChildVariants } from "../animations";
import { motion } from "framer-motion";

const iconMap: Record<string, React.ReactNode> = {
  academics: <GraduationCap size={16} />,
  "technology-programming": <Code2 size={16} />,
  programming: <Code2 size={16} />,
  "ai-data-science": <Bot size={16} />,
  ai: <Cpu size={16} />,
  "creative-arts-design": <Palette size={16} />,
  skills: <Sparkles size={16} />,
  "video-editing-animation": <PenTool size={16} />,
  "photography-media": <Camera size={16} />,
  photography: <Camera size={16} />,
  music: <Music size={16} />,
  dance: <Sparkles size={16} />,
  "sports-fitness": <Dumbbell size={16} />,
  fitness: <Dumbbell size={16} />,
  "cooking-lifestyle": <UtensilsCrossed size={16} />,
  cooking: <UtensilsCrossed size={16} />,
  "business-entrepreneurship": <Briefcase size={16} />,
  business: <Briefcase size={16} />,
  marketing: <Megaphone size={16} />,
  communication: <Mic size={16} />,
  "public-speaking": <Mic size={16} />,
  languages: <Globe size={16} />,
  "competitive-exams": <GraduationCap size={16} />,
};

// Helper map to match Category IDs to Slugs
const getCategorySlug = (id: string) => {
  switch (id) {
    case "academics": return "academic-education";
    case "technology-programming": return "technology-programming";
    case "ai-data-science": return "ai-data-science";
    case "business-entrepreneurship": return "business-entrepreneurship";
    case "creative-arts-design": return "creative-arts";
    case "photography-media": return "photography-media";
    case "video-editing-animation": return "video-editing";
    case "music": return "music";
    case "dance": return "dance";
    case "sports-fitness": return "sports-fitness";
    case "languages": return "languages";
    case "communication": return "communication";
    case "cooking-lifestyle": return "cooking-lifestyle";
    case "marketing": return "marketing";
    default: return id;
  }
};

export function ExploreCategories() {
  const [failedImages, setFailedImages] = React.useState<Record<string, boolean>>({});
  const [loadedImages, setLoadedImages] = React.useState<Record<string, boolean>>({});
  const [categories, setCategories] = React.useState(() => [
    { id: "academics", name: "Academic Education", type: "academic", count: 36 },
    { id: "skills", name: "Skills & Extracurriculars", type: "skills", count: 32 },
    { id: "ai", name: "AI & Innovation", type: "ai", count: 10 }
  ]);

  React.useEffect(() => {
    setCategories(MOCK_CATEGORIES);
  }, []);

  const handleImageError = (id: string) => {
    setFailedImages((prev) => ({ ...prev, [id]: true }));
  };

  // Take all categories to show
  const showCategories = categories;

  return (
    <section className="w-full py-20 bg-background select-none">
      <Container className="flex flex-col gap-12">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center gap-3">
          <span className="text-[10px] uppercase tracking-wider font-extrabold text-primary bg-primary/10 px-3 py-1 rounded-full">
            Discover Subjects
          </span>
          <h2 className="text-3xl md:text-4xl font-heading font-extrabold text-foreground tracking-tight">
            Trending Skills & Featured Categories
          </h2>
          <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
            Find peer-to-peer classes covering academic courses, technical training, creative arts, and lifestyle wellness.
          </p>
        </div>

        {/* Categories Grid */}
        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {showCategories.map((cat) => {
            const icon = iconMap[cat.id] || <Code2 size={16} />;
            const img = getCategoryBanner(cat.id);

            return (
              <motion.div key={cat.id} variants={staggerChildVariants}>
                <Link href={`/categories/${getCategorySlug(cat.id)}`} className="block">
                  <Card
                    variant="glass"
                    hoverEffect="lift"
                    className="flex flex-col p-0 h-full group cursor-pointer border-border hover:border-primary/30 overflow-hidden"
                  >
                    {/* Category Image Cover */}
                    <div className="relative w-full h-36 sm:h-42 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 overflow-hidden">
                      {!failedImages[cat.id] ? (
                        <>
                          <Image
                            src={img}
                            alt={`${cat.name} learning category banner illustration`}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            loading="lazy"
                            decoding="async"
                            onLoad={() => setLoadedImages((prev) => ({ ...prev, [cat.id]: true }))}
                            onError={() => handleImageError(cat.id)}
                            className={`object-cover object-center group-hover:scale-105 transition-all duration-700 ease-out ${
                              loadedImages[cat.id] ? "opacity-100 blur-0" : "opacity-0 blur-sm"
                            }`}
                          />
                          {/* Subtle dark bottom scrim overlay for crisp icon contrast and depth */}
                          <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-background/20 to-transparent opacity-70 group-hover:opacity-50 transition-opacity duration-300 pointer-events-none" />
                        </>
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/5 dark:from-primary/20 dark:to-accent/10 flex items-center justify-center" />
                      )}
                      {/* Icon overlay */}
                      <div className="absolute bottom-2.5 left-2.5 w-8 h-8 rounded-lg bg-background/90 backdrop-blur-md text-primary flex items-center justify-center shadow-md z-10 border border-border/40 group-hover:border-primary/40 group-hover:scale-105 transition-all duration-300">
                        {icon}
                      </div>
                    </div>

                    {/* Content padding */}
                    <div className="p-4 flex flex-col justify-between grow">
                      <div>
                        <h4 className="text-xs font-heading font-extrabold text-foreground group-hover:text-primary transition-colors leading-tight">
                          {cat.name}
                        </h4>
                        <p className="text-[10px] text-muted-foreground font-semibold mt-1">
                          {cat.count} courses
                        </p>
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </StaggerContainer>

      </Container>
    </section>
  );
}

export default ExploreCategories;
