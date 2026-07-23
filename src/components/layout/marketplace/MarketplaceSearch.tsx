"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, Mic, Sparkles, X, RotateCcw, TrendingUp, Loader2 } from "lucide-react";
import { Input } from "../../ui/input";
import { Badge } from "../../ui/badge";
import { toast } from "sonner";
import { SearchService, SearchResultItem, SearchResults } from "../../../features/payments/services/searchService";
import { cn } from "../../../utils/cn";

interface MarketplaceSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function MarketplaceSearch({
  searchQuery,
  onSearchChange,
}: MarketplaceSearchProps) {
  const [searchResults, setSearchResults] = useState<SearchResults>({
    categories: [],
    skills: [],
    courses: [],
    tutors: [],
    liveClasses: [],
    aiTools: [],
  });
  const [flatResults, setFlatResults] = useState<SearchResultItem[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  const popularSearches = ["Next.js", "Python", "Figma", "Calculus", "Cooking"];
  const trendingSearches = ["AI Prompt Engineering", "Kathak Dance", "Spoken English", "Guitar Chords", "AWS Cloud"];

  // 1. Keyboard shortcut listener Ctrl+K / Cmd+K
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setShowSuggestions(true);
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  // 2. Fetch recent searches on mount
  useEffect(() => {
    setRecentSearches(SearchService.getRecentSearches());
  }, []);

  // 3. Search debounce implementation
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults({
        categories: [],
        skills: [],
        courses: [],
        tutors: [],
        liveClasses: [],
        aiTools: [],
      });
      setFlatResults([]);
      setActiveIndex(-1);
      return;
    }

    setIsLoading(true);
    const handler = setTimeout(() => {
      const results = SearchService.search(searchQuery);
      setSearchResults(results);

      // Flatten list for keyboard navigation index tracking
      const flat = [
        ...results.categories,
        ...results.skills,
        ...results.courses,
        ...results.tutors,
        ...results.liveClasses,
        ...results.aiTools,
      ];
      setFlatResults(flat);
      setActiveIndex(flat.length > 0 ? 0 : -1);
      setIsLoading(false);
    }, 250); // 250ms debounce

    return () => clearTimeout(handler);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const updated = SearchService.addRecentSearch(searchQuery);
      setRecentSearches(updated);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (title: string) => {
    onSearchChange(title);
    const updated = SearchService.addRecentSearch(title);
    setRecentSearches(updated);
    setShowSuggestions(false);
  };

  const handleVoiceSearch = () => {
    toast.info("Voice search listening... (Microphone permissions not granted)");
  };

  const handleAiSearch = () => {
    onSearchChange("AI Prompt Engineering");
    toast.success("AI Search Assist active: Suggesting Artificial Intelligence tracks.");
  };

  const clearRecentSearches = () => {
    SearchService.clearRecentSearches();
    setRecentSearches([]);
    toast.info("Recent searches cleared.");
  };

  // 4. Keyboard Navigation keys listener (ArrowUp, ArrowDown, Enter, Escape)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || flatResults.length === 0) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        setShowSuggestions(true);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % flatResults.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + flatResults.length) % flatResults.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < flatResults.length) {
        handleSuggestionClick(flatResults[activeIndex].title);
      } else {
        handleSearchSubmit(e);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  // Helper count variables for grouped rendering highlight match
  let globalItemCounter = 0;
  const totalMatchesCount = flatResults.length;

  return (
    <div className="w-full flex flex-col gap-4 text-left select-none relative z-40">
      
      {/* Search Input Form */}
      <form onSubmit={handleSearchSubmit} className="relative w-full">
        <div className="relative flex items-center">
          {isLoading ? (
            <Loader2 size={18} className="absolute left-4 text-primary animate-spin" />
          ) : (
            <Search size={18} className="absolute left-4 text-muted-foreground" />
          )}
          
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search academic math, programming, guitar chords, cooking..."
            value={searchQuery}
            onChange={(e) => {
              onSearchChange(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            className="w-full pl-12 pr-44 h-12 bg-card border-border focus:border-primary/50 text-sm font-semibold text-foreground"
          />

          {/* Controls overlays */}
          <div className="absolute right-3 flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground/60 bg-muted/65 px-1.5 py-0.5 rounded border border-border font-mono font-bold select-none pointer-events-none mr-1 shrink-0">
              Ctrl K
            </span>

            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  onSearchChange("");
                  setSearchResults({
                    categories: [],
                    skills: [],
                    courses: [],
                    tutors: [],
                    liveClasses: [],
                    aiTools: [],
                  });
                  setFlatResults([]);
                  setActiveIndex(-1);
                }}
                className="p-1 hover:bg-muted rounded text-muted-foreground cursor-pointer"
              >
                <X size={14} />
              </button>
            )}

            <button
              type="button"
              onClick={handleVoiceSearch}
              className="p-1.5 hover:bg-muted text-muted-foreground hover:text-primary rounded cursor-pointer transition-colors"
              title="Voice Search"
            >
              <Mic size={15} />
            </button>

            <Badge
              onClick={handleAiSearch}
              className="bg-ai-gradient text-white text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded cursor-pointer shadow-soft hover:opacity-95 select-none shrink-0"
            >
              <Sparkles size={9} className="mr-1 inline fill-white" />
              AI Search
            </Badge>
          </div>
        </div>

        {/* Suggestions Autocomplete Panel */}
        {showSuggestions && searchQuery.trim() && (
          <div className="absolute top-13 left-0 right-0 bg-card border border-border shadow-sm hover:shadow-md transition-shadow duration-200 rounded-input shadow-premium z-50 p-3 overflow-hidden flex flex-col gap-3 max-h-[420px] overflow-y-auto">
            {totalMatchesCount === 0 && !isLoading ? (
              <div className="text-center py-6 select-none">
                <p className="text-xs text-muted-foreground font-semibold">No results found for &ldquo;{searchQuery}&rdquo;</p>
                <p className="text-[10px] text-muted-foreground/60 mt-1">Try searching for other academic, programming, or extracurricular subjects.</p>
              </div>
            ) : (
              <>
                {/* 1. Category Matches */}
                {searchResults.categories.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[8px] uppercase tracking-wider font-extrabold text-primary px-2.5 block select-none border-b border-border/30 pb-0.5">
                      Categories
                    </span>
                    {searchResults.categories.map((item) => {
                      const currentIdx = globalItemCounter++;
                      const isHighlighted = activeIndex === currentIdx;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleSuggestionClick(item.title)}
                          className={cn(
                            "w-full text-left px-2.5 py-1.5 rounded text-xs font-semibold flex items-center justify-between cursor-pointer transition-colors",
                            isHighlighted ? "bg-primary/10 text-primary border border-primary/20" : "text-foreground hover:bg-muted"
                          )}
                        >
                          <span className="truncate">{item.title}</span>
                          <span className="text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground font-extrabold ml-2 shrink-0 select-none">
                            {item.type}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* 2. Skill Matches */}
                {searchResults.skills.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[8px] uppercase tracking-wider font-extrabold text-primary px-2.5 block select-none border-b border-border/30 pb-0.5">
                      Skills
                    </span>
                    {searchResults.skills.map((item) => {
                      const currentIdx = globalItemCounter++;
                      const isHighlighted = activeIndex === currentIdx;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleSuggestionClick(item.title)}
                          className={cn(
                            "w-full text-left px-2.5 py-1.5 rounded text-xs font-semibold flex items-center justify-between cursor-pointer transition-colors",
                            isHighlighted ? "bg-primary/10 text-primary border border-primary/20" : "text-foreground hover:bg-muted"
                          )}
                        >
                          <div className="flex flex-col text-left">
                            <span className="truncate">{item.title}</span>
                            <span className="text-[9px] text-muted-foreground font-normal">{item.subtitle}</span>
                          </div>
                          <span className="text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground font-extrabold ml-2 shrink-0 select-none">
                            {item.type}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* 3. Course Matches */}
                {searchResults.courses.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[8px] uppercase tracking-wider font-extrabold text-primary px-2.5 block select-none border-b border-border/30 pb-0.5">
                      Courses
                    </span>
                    {searchResults.courses.map((item) => {
                      const currentIdx = globalItemCounter++;
                      const isHighlighted = activeIndex === currentIdx;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleSuggestionClick(item.title)}
                          className={cn(
                            "w-full text-left px-2.5 py-1.5 rounded text-xs font-semibold flex items-center justify-between cursor-pointer transition-colors",
                            isHighlighted ? "bg-primary/10 text-primary border border-primary/20" : "text-foreground hover:bg-muted"
                          )}
                        >
                          <div className="flex flex-col text-left">
                            <span className="truncate">{item.title}</span>
                            <span className="text-[9px] text-muted-foreground font-normal">{item.subtitle}</span>
                          </div>
                          <span className="text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground font-extrabold ml-2 shrink-0 select-none">
                            {item.type}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* 4. Tutor Matches */}
                {searchResults.tutors.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[8px] uppercase tracking-wider font-extrabold text-primary px-2.5 block select-none border-b border-border/30 pb-0.5">
                      Tutors
                    </span>
                    {searchResults.tutors.map((item) => {
                      const currentIdx = globalItemCounter++;
                      const isHighlighted = activeIndex === currentIdx;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleSuggestionClick(item.title)}
                          className={cn(
                            "w-full text-left px-2.5 py-1.5 rounded text-xs font-semibold flex items-center justify-between cursor-pointer transition-colors",
                            isHighlighted ? "bg-primary/10 text-primary border border-primary/20" : "text-foreground hover:bg-muted"
                          )}
                        >
                          <div className="flex flex-col text-left">
                            <span className="truncate">{item.title}</span>
                            <span className="text-[9px] text-muted-foreground font-normal">{item.subtitle}</span>
                          </div>
                          <span className="text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground font-extrabold ml-2 shrink-0 select-none">
                            {item.type}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* 5. Live Classes Matches */}
                {searchResults.liveClasses.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[8px] uppercase tracking-wider font-extrabold text-primary px-2.5 block select-none border-b border-border/30 pb-0.5">
                      Live Classes
                    </span>
                    {searchResults.liveClasses.map((item) => {
                      const currentIdx = globalItemCounter++;
                      const isHighlighted = activeIndex === currentIdx;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleSuggestionClick(item.title)}
                          className={cn(
                            "w-full text-left px-2.5 py-1.5 rounded text-xs font-semibold flex items-center justify-between cursor-pointer transition-colors",
                            isHighlighted ? "bg-primary/10 text-primary border border-primary/20" : "text-foreground hover:bg-muted"
                          )}
                        >
                          <div className="flex flex-col text-left">
                            <span className="truncate">{item.title}</span>
                            <span className="text-[9px] text-muted-foreground font-normal">{item.subtitle}</span>
                          </div>
                          <span className="text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground font-extrabold ml-2 shrink-0 select-none">
                            {item.type}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* 6. AI Tools Matches */}
                {searchResults.aiTools.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[8px] uppercase tracking-wider font-extrabold text-primary px-2.5 block select-none border-b border-border/30 pb-0.5">
                      AI Tools
                    </span>
                    {searchResults.aiTools.map((item) => {
                      const currentIdx = globalItemCounter++;
                      const isHighlighted = activeIndex === currentIdx;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleSuggestionClick(item.title)}
                          className={cn(
                            "w-full text-left px-2.5 py-1.5 rounded text-xs font-semibold flex items-center justify-between cursor-pointer transition-colors",
                            isHighlighted ? "bg-primary/10 text-primary border border-primary/20" : "text-foreground hover:bg-muted"
                          )}
                        >
                          <div className="flex flex-col text-left max-w-[80%]">
                            <span className="truncate">{item.title}</span>
                            <span className="text-[9px] text-muted-foreground font-normal truncate">{item.subtitle}</span>
                          </div>
                          <span className="text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground font-extrabold ml-2 shrink-0 select-none">
                            {item.type}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </form>

      {/* Tags row: Recent & Popular */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs border-t border-border/30 pt-3 mt-1">
        
        {/* Recent Searches */}
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground font-bold flex items-center gap-1 shrink-0">
            <RotateCcw size={11} />
            Recent:
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {recentSearches.length > 0 ? (
              <>
                {recentSearches.map((tag, idx) => (
                  <span
                    key={idx}
                    onClick={() => onSearchChange(tag)}
                    className="px-2.5 py-0.5 rounded-full bg-muted hover:bg-primary/10 hover:text-primary text-[10px] font-bold text-white/90 cursor-pointer transition-all"
                  >
                    {tag}
                  </span>
                ))}
                <button
                  type="button"
                  onClick={clearRecentSearches}
                  className="text-[9px] text-red-500 font-extrabold cursor-pointer hover:underline pl-1 focus:outline-none"
                >
                  Clear
                </button>
              </>
            ) : (
              <span className="text-[10px] text-muted-foreground/60 italic font-semibold">No recent searches</span>
            )}
          </div>
        </div>

        {/* Popular & Trending Tags */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground font-bold shrink-0">Popular:</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {popularSearches.map((tag, idx) => (
                <span
                  key={idx}
                  onClick={() => onSearchChange(tag)}
                  className="px-2 py-0.5 rounded bg-card border border-border shadow-sm hover:shadow-md transition-shadow duration-200/60 hover:border-primary/30 text-[10px] font-bold text-foreground cursor-pointer hover:bg-muted/40 transition-all"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground font-bold flex items-center gap-1 shrink-0">
              <TrendingUp size={11} className="text-amber-500" />
              Trending:
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {trendingSearches.map((tag, idx) => (
                <span
                  key={idx}
                  onClick={() => onSearchChange(tag)}
                  className="px-2 py-0.5 rounded bg-amber-500/5 text-amber-600 border border-amber-500/20 hover:bg-amber-500/10 text-[10px] font-bold cursor-pointer transition-all"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

export default MarketplaceSearch;
