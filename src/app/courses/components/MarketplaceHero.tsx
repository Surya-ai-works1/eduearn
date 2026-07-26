import React, { useState, useRef, useEffect } from "react";
import { Search, Sparkles, X, Compass, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface MarketplaceHeroProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  suggestions: any[];
  onSuggestionClick: (title: string) => void;
  onQuickCategoryClick: (catId: string) => void;
}

export const MarketplaceHero: React.FC<MarketplaceHeroProps> = ({
  searchQuery,
  onSearchChange,
  suggestions,
  onSuggestionClick,
  onQuickCategoryClick,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleClear = () => {
    onSearchChange("");
  };

  const quickSearches = ["Python", "Calculus", "React", "Excel", "Guitar", "Chess"];

  return (
    <section className="relative w-full py-16 bg-gradient-to-b from-primary/5 via-muted/20 to-transparent border-b border-border/40 select-none text-left overflow-hidden">
      <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-60 h-60 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 flex flex-col gap-8 relative z-10">
        {/* Title greeting */}
        <div className="space-y-3">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 border border-primary/20 text-primary text-[10px] font-heading font-extrabold uppercase rounded-full"
          >
            <Sparkles size={11} className="animate-spin" />
            <span>EduEarn Peer Marketplace</span>
          </motion.div>
          
          <h1 className="text-3xl md:text-5xl font-heading font-black text-foreground tracking-tight max-w-2xl leading-none">
            Learn from <span className="text-primary">Peer Mentors</span>, Master New Skills.
          </h1>
          <p className="text-sm text-muted-foreground max-w-xl leading-relaxed font-medium">
            Discover courses created and taught by school and college student experts. Access live interactive workshops, doubt solving, and curated notes.
          </p>
        </div>

        {/* Search Bar Input */}
        <div className="max-w-lg w-full relative" ref={dropdownRef}>
          <div className="relative flex items-center bg-card border border-border shadow-md rounded-2xl p-1 focus-within:ring-2 focus-within:ring-primary/45 transition-all">
            <div className="pl-3.5 text-muted-foreground">
              <Search size={16} />
            </div>
            
            <input
              type="text"
              placeholder="Search courses, student tutors, coding, math..."
              className="w-full h-11 bg-transparent border-0 rounded-xl text-foreground text-xs font-semibold px-3 focus:outline-none placeholder:text-muted-foreground/75"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={() => setIsFocused(true)}
              aria-label="Search learning catalog"
            />

            {searchQuery && (
              <button
                type="button"
                onClick={handleClear}
                className="p-2 hover:bg-muted text-muted-foreground hover:text-foreground rounded-full mr-1"
                aria-label="Clear search query"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown suggestions list */}
          <AnimatePresence>
            {isFocused && suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="absolute inset-x-0 top-full mt-2 bg-card border border-border/80 shadow-premium rounded-2xl overflow-hidden z-40 max-h-64 overflow-y-auto"
              >
                <div className="p-3 bg-muted/30 border-b border-border/30 text-[10px] font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                  <Compass size={11} />
                  Instant Matches
                </div>
                <div className="flex flex-col p-1">
                  {suggestions.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        onSuggestionClick(c.title);
                        setIsFocused(false);
                      }}
                      className="w-full text-left p-2.5 hover:bg-muted rounded-xl flex items-center justify-between text-xs transition duration-200"
                    >
                      <div className="truncate max-w-[80%]">
                        <span className="font-bold text-foreground block truncate">{c.title}</span>
                        <span className="text-[10px] text-muted-foreground block truncate mt-0.5">{c.category} • {c.tutorName}</span>
                      </div>
                      <ChevronRight size={12} className="text-muted-foreground" />
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Quick searches shortcuts */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-muted-foreground select-none">
          <span>Popular searches:</span>
          {quickSearches.map((qs) => (
            <button
              key={qs}
              type="button"
              onClick={() => onSuggestionClick(qs)}
              className="px-3 py-1 bg-card border border-border rounded-lg text-foreground hover:bg-primary/10 hover:text-primary transition duration-300"
            >
              {qs}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
