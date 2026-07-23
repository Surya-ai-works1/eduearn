"use client";

import React from "react";
import { Accordion } from "../../ui/accordion";
import { Divider } from "../../ui/divider";
import { MOCK_CATEGORIES } from "../../../constants/mockData";
import { Filter, RotateCcw } from "lucide-react";

export interface FiltersState {
  searchQuery: string;
  category: string;
  priceType: "all" | "free" | "premium";
  maxPrice: number;
  rating: number;
  level: string;
  language: string;
  durationRange: string; // "all" | "short" | "medium" | "long"
  isAiVerifiedTutor: boolean;
  isLiveClass: boolean;
  sortBy: string;
}

interface MarketplaceFiltersProps {
  filters: FiltersState;
  onFilterChange: (updater: (prev: FiltersState) => FiltersState) => void;
  onResetFilters: () => void;
  coursesCount: number;
}

export function MarketplaceFilters({
  filters,
  onFilterChange,
  onResetFilters,
  coursesCount,
}: MarketplaceFiltersProps) {
  
  const handleCategorySelect = (id: string) => {
    onFilterChange((prev) => ({
      ...prev,
      category: prev.category === id ? "" : id,
    }));
  };

  const handlePriceTypeSelect = (type: "all" | "free" | "premium") => {
    onFilterChange((prev) => ({
      ...prev,
      priceType: type,
      maxPrice: type === "free" ? 0 : 3000,
    }));
  };

  const handleLevelSelect = (level: string) => {
    onFilterChange((prev) => ({
      ...prev,
      level: prev.level === level ? "" : level,
    }));
  };

  const handleRatingSelect = (rating: number) => {
    onFilterChange((prev) => ({
      ...prev,
      rating: prev.rating === rating ? 0 : rating,
    }));
  };

  const handleLanguageSelect = (lang: string) => {
    onFilterChange((prev) => ({
      ...prev,
      language: prev.language === lang ? "" : lang,
    }));
  };

  const handleDurationSelect = (range: string) => {
    onFilterChange((prev) => ({
      ...prev,
      durationRange: prev.durationRange === range ? "all" : range,
    }));
  };

  const toggleAiVerified = () => {
    onFilterChange((prev) => ({
      ...prev,
      isAiVerifiedTutor: !prev.isAiVerifiedTutor,
    }));
  };

  const toggleLiveClass = () => {
    onFilterChange((prev) => ({
      ...prev,
      isLiveClass: !prev.isLiveClass,
    }));
  };

  // Helper check: are filters active?
  const hasActiveFilters =
    filters.category !== "" ||
    filters.priceType !== "all" ||
    filters.level !== "" ||
    filters.rating !== 0 ||
    filters.language !== "" ||
    filters.durationRange !== "all" ||
    filters.isAiVerifiedTutor ||
    filters.isLiveClass;

  const accordionItems = [
    {
      id: "filter-categories",
      trigger: "Categories",
      content: (
        <div className="flex flex-col gap-2 pt-2 text-xs max-h-48 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-muted">
          {MOCK_CATEGORIES.map((cat) => (
            <label
              key={cat.id}
              className="flex items-center gap-2 font-semibold text-muted-foreground hover:text-foreground cursor-pointer select-none"
            >
              <input
                type="checkbox"
                checked={filters.category === cat.id}
                onChange={() => handleCategorySelect(cat.id)}
                className="w-3.5 h-3.5 rounded border-border accent-primary cursor-pointer"
              />
              <span className="truncate">{cat.name}</span>
            </label>
          ))}
        </div>
      ),
    },
    {
      id: "filter-pricing",
      trigger: "Price Model",
      content: (
        <div className="flex flex-col gap-3.5 pt-2 text-xs text-muted-foreground">
          {/* Price Types */}
          <div className="flex flex-col gap-2">
            {(["all", "free", "premium"] as const).map((type) => (
              <label key={type} className="flex items-center gap-2 font-semibold capitalize cursor-pointer select-none">
                <input
                  type="radio"
                  name="priceType"
                  checked={filters.priceType === type}
                  onChange={() => handlePriceTypeSelect(type)}
                  className="w-3.5 h-3.5 accent-primary cursor-pointer"
                />
                <span>{type === "all" ? "All Price Models" : type}</span>
              </label>
            ))}
          </div>

          {/* Price slider (Only visible if not free) */}
          {filters.priceType !== "free" && (
            <div className="flex flex-col gap-2 mt-2">
              <div className="flex justify-between items-center text-[10px] font-bold">
                <span>Max budget:</span>
                <span className="text-foreground">₹{filters.maxPrice}</span>
              </div>
              <input
                type="range"
                min="0"
                max="3000"
                step="250"
                value={filters.maxPrice}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  onFilterChange((prev) => ({ ...prev, maxPrice: val }));
                }}
                className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>
          )}
        </div>
      ),
    },
    {
      id: "filter-levels",
      trigger: "Difficulty Level",
      content: (
        <div className="flex flex-col gap-2 pt-2 text-xs">
          {["beginner", "intermediate", "advanced", "all_levels"].map((level) => (
            <label
              key={level}
              className="flex items-center gap-2 font-semibold text-muted-foreground hover:text-foreground capitalize cursor-pointer select-none"
            >
              <input
                type="checkbox"
                checked={filters.level === level}
                onChange={() => handleLevelSelect(level)}
                className="w-3.5 h-3.5 rounded border-border accent-primary cursor-pointer"
              />
              <span>{level.replace("_", " ")}</span>
            </label>
          ))}
        </div>
      ),
    },
    {
      id: "filter-ratings",
      trigger: "Average Rating",
      content: (
        <div className="flex flex-col gap-2 pt-2 text-xs">
          {[4.8, 4.5, 4.0].map((star) => (
            <label
              key={star}
              className="flex items-center gap-2 font-semibold text-muted-foreground hover:text-foreground cursor-pointer select-none"
            >
              <input
                type="checkbox"
                checked={filters.rating === star}
                onChange={() => handleRatingSelect(star)}
                className="w-3.5 h-3.5 rounded border-border accent-primary cursor-pointer"
              />
              <span>{star.toFixed(1)} ★ &amp; above</span>
            </label>
          ))}
        </div>
      ),
    },
    {
      id: "filter-languages",
      trigger: "Video Language",
      content: (
        <div className="flex flex-col gap-2 pt-2 text-xs">
          {["English", "Hindi"].map((lang) => (
            <label
              key={lang}
              className="flex items-center gap-2 font-semibold text-muted-foreground hover:text-foreground cursor-pointer select-none"
            >
              <input
                type="checkbox"
                checked={filters.language === lang}
                onChange={() => handleLanguageSelect(lang)}
                className="w-3.5 h-3.5 rounded border-border accent-primary cursor-pointer"
              />
              <span>{lang}</span>
            </label>
          ))}
        </div>
      ),
    },
    {
      id: "filter-duration",
      trigger: "Course Duration",
      content: (
        <div className="flex flex-col gap-2 pt-2 text-xs text-muted-foreground">
          {[
            { id: "short", label: "Short (< 10 hours)" },
            { id: "medium", label: "Medium (10 - 15 hours)" },
            { id: "long", label: "Long (> 15 hours)" },
          ].map((d) => (
            <label
              key={d.id}
              className="flex items-center gap-2 font-semibold hover:text-foreground cursor-pointer select-none"
            >
              <input
                type="checkbox"
                checked={filters.durationRange === d.id}
                onChange={() => handleDurationSelect(d.id)}
                className="w-3.5 h-3.5 rounded border-border accent-primary cursor-pointer"
              />
              <span>{d.label}</span>
            </label>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6 text-left select-none p-5 rounded-card border border-border bg-card shadow-soft">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-heading font-extrabold text-foreground">
          <Filter size={15} />
          <span>Filters</span>
          <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded font-mono font-bold">
            {coursesCount}
          </span>
        </div>
        
        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="text-[10px] text-red-500 font-extrabold flex items-center gap-1 hover:underline cursor-pointer focus:outline-none"
          >
            <RotateCcw size={10} />
            Reset
          </button>
        )}
      </div>

      <Divider className="my-1" />

      {/* Feature quick switches */}
      <div className="flex flex-col gap-3">
        <label className="flex items-center gap-2.5 text-xs font-bold text-foreground cursor-pointer select-none">
          <input
            type="checkbox"
            checked={filters.isAiVerifiedTutor}
            onChange={toggleAiVerified}
            className="w-4 h-4 rounded border-border accent-primary cursor-pointer"
          />
          <span>AI Verified Tutors</span>
        </label>
        <label className="flex items-center gap-2.5 text-xs font-bold text-foreground cursor-pointer select-none">
          <input
            type="checkbox"
            checked={filters.isLiveClass}
            onChange={toggleLiveClass}
            className="w-4 h-4 rounded border-border accent-primary cursor-pointer"
          />
          <span>Live Interactive Rooms</span>
        </label>
      </div>

      <Divider className="my-1" />

      {/* Advanced filters accordions */}
      <Accordion items={accordionItems} allowMultiple={true} className="border-border/60" />
      
    </div>
  );
}

export default MarketplaceFilters;
