import React from 'react';
import Link from 'next/link';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, Bookmark, BookmarkCheck, TrendingUp, Clock, DollarSign } from 'lucide-react';
import { CareerPath } from '@/constants/careerPathsData';

interface CareerHeroProps {
  pathData: CareerPath;
  onBookmarkToggle: () => void;
  isBookmarked: boolean;
  scrollToCourses: () => void;
  scrollToBundle: () => void;
}

export const CareerHero: React.FC<CareerHeroProps> = ({
  pathData,
  onBookmarkToggle,
  isBookmarked,
  scrollToCourses,
  scrollToBundle,
}) => {
  return (
    <section className="relative w-full py-20 bg-gradient-to-b from-muted/30 to-background border-b border-border/40 select-none text-left overflow-hidden">
      <div className="absolute inset-0 bg-hero-gradient opacity-[0.03] pointer-events-none" />
      <Container className="relative z-10 flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4 text-xs text-muted-foreground font-semibold">
          <div className="flex items-center gap-2">
            <Link href="/" className="hover:text-foreground flex items-center gap-1">
              <ArrowLeft size={12} /> Back to Home
            </Link>
            <span>/</span>
            <span className="text-foreground">Career Guidance Portal</span>
            <span>/</span>
            <span className="text-foreground font-bold">{pathData.title}</span>
          </div>
          <button
            onClick={onBookmarkToggle}
            aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark pathway'}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-card/85 text-foreground hover:bg-muted/30 transition-colors shadow-soft cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/45"
          >
            {isBookmarked ? (
              <>
                <BookmarkCheck size={14} className="text-primary fill-primary" />
                <span className="text-[10px] font-bold">Bookmarked</span>
              </>
            ) : (
              <>
                <Bookmark size={14} className="text-muted-foreground" />
                <span className="text-[10px] font-bold">Bookmark Path</span>
              </>
            )}
          </button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mt-2">
          <div className="lg:col-span-8 flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="primary" className="py-1 px-3 uppercase tracking-wider font-extrabold text-[9px]">
                {pathData.level} Path
              </Badge>
              <Badge variant="success" className="py-1 px-3 uppercase tracking-wider font-extrabold text-[9px] flex items-center gap-1">
                <TrendingUp size={11} /> {pathData.growth}
              </Badge>
              <Badge variant="secondary" className="py-1 px-3 uppercase tracking-wider font-extrabold text-[9px] bg-red-500/10 text-red-500 border border-red-500/20">
                {pathData.demand}
              </Badge>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-extrabold text-foreground tracking-tight leading-tight">
              Career Path:<br />
              <span className="text-transparent bg-clip-text bg-ai-gradient font-black">{pathData.title}</span>
            </h1>
            <p className="text-sm md:text-base text-muted-foreground max-w-2xl leading-relaxed mt-2">
              {pathData.description} Explore this detailed career guidance dashboard to assess your skills, verify market opportunities, analyze salary growth, and review curriculum modules.
            </p>
            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 max-w-3xl">
              <div className="p-3.5 bg-card/60 border border-border/80 rounded-2xl flex flex-col gap-1 shadow-sm">
                <span className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground">Duration</span>
                <span className="text-xs font-black text-foreground flex items-center gap-1.5">
                  <Clock size={14} className="text-primary" /> {pathData.duration}
                </span>
              </div>
              <div className="p-3.5 bg-card/60 border border-border/80 rounded-2xl flex flex-col gap-1 shadow-sm">
                <span className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground">Est. Salary Range</span>
                <span className="text-xs font-black text-foreground flex items-center gap-1">
                  <DollarSign size={13} className="text-emerald-500" /> {pathData.salaryRange}
                </span>
              </div>
              <div className="p-3.5 bg-card/60 border border-border/80 rounded-2xl flex flex-col gap-1 shadow-sm">
                <span className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground">Complexity</span>
                <span className="text-xs font-black text-foreground uppercase tracking-widest">{pathData.difficulty}</span>
              </div>
              <div className="p-3.5 bg-card/60 border border-border/80 rounded-2xl flex flex-col gap-1 shadow-sm">
                <span className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground">Curriculum</span>
                <span className="text-xs font-black text-foreground text-primary">
                  {pathData.projects.length} Recommended Modules
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 mt-6">
              <Button size="lg" onClick={scrollToCourses} className="shadow-premium flex items-center gap-2">
                Explore Courses <ArrowRight size={16} />
              </Button>
              <Button size="lg" variant="outline" onClick={scrollToBundle} className="flex items-center gap-2">
                Buy Career Bundle
              </Button>
            </div>
          </div>
          <div className="lg:col-span-4 hidden lg:flex justify-center relative">
            <div className="w-64 h-64 rounded-3xl bg-gradient-to-br from-primary/10 to-accent/20 border border-border/60 flex items-center justify-center p-6 relative overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-hero-gradient opacity-10" />
              {/* Placeholder icon */}
              <svg className="w-24 h-24 text-primary" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zM11 17l-5-5 1.41-1.42L11 14.17l7.59-7.59L20 8l-9 9z"/></svg>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};
