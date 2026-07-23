"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Container } from "./Container";
import { ReviewCard } from "../ui/card";
import { MOCK_TESTIMONIALS } from "../../constants/mockData";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../ui/button";

export function SuccessStories() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % MOCK_TESTIMONIALS.length);
    }, 7500); // 7.5 seconds autoplay
    return () => clearInterval(timer);
  }, []);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + MOCK_TESTIMONIALS.length) % MOCK_TESTIMONIALS.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % MOCK_TESTIMONIALS.length);
  };

  const activeTestimonial = MOCK_TESTIMONIALS[currentIndex];

  return (
    <section className="w-full py-20 bg-background select-none overflow-hidden relative">
      <Container className="flex flex-col gap-12 text-center items-center">
        
        {/* Section Header */}
        <div className="flex flex-col items-center gap-3">
          <span className="text-[10px] uppercase tracking-wider font-extrabold text-primary bg-primary/10 px-3 py-1 rounded-full">
            Success Stories
          </span>
          <h2 className="text-3xl md:text-4xl font-heading font-extrabold text-foreground tracking-tight">
            Student Success Stories & Testimonials
          </h2>
          <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
            Read how school and college students support their education by teaching, while helping learners score better grades and master new skills.
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative w-full max-w-2xl flex items-center justify-center gap-4 mt-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrev}
            className="hidden sm:flex shrink-0 hover:bg-muted text-muted-foreground rounded-full w-10 h-10 border border-border/40 focus:outline-none"
            aria-label="Previous Success Story"
          >
            <ChevronLeft size={20} />
          </Button>

          <div className="grow overflow-hidden relative min-h-[200px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              {activeTestimonial && (
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.7, ease: "easeInOut" }} // 700ms transition
                  className="w-full"
                >
                  <ReviewCard
                    authorName={activeTestimonial.name}
                    authorRole={activeTestimonial.role}
                    rating={5}
                    comment={activeTestimonial.text}
                    className="bg-card border-border hover:border-primary/20 shadow-premium p-8 text-left rounded-3xl"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleNext}
            className="hidden sm:flex shrink-0 hover:bg-muted text-muted-foreground rounded-full w-10 h-10 border border-border/40 focus:outline-none"
            aria-label="Next Success Story"
          >
            <ChevronRight size={20} />
          </Button>
        </div>

        {/* Indicator dots */}
        <div className="flex gap-2 justify-center mt-2">
          {MOCK_TESTIMONIALS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-2 h-2 rounded-full transition-all focus:outline-none ${
                currentIndex === idx ? "bg-primary w-5" : "bg-muted-foreground/30 hover:bg-muted-foreground/60"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

      </Container>
    </section>
  );
}

export default SuccessStories;
