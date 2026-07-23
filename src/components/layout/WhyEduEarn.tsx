"use client";

import React from "react";
import { Container } from "./Container";
import { FeatureCard } from "../ui/card";
import {
  Bot,
  Users,
  TrendingDown,
  Award,
  Tv,
  TrendingUp,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { StaggerContainer, staggerChildVariants } from "../animations";
import { motion } from "framer-motion";

export function WhyEduEarn() {
  const features = [
    {
      title: "AI-Verified Tutors",
      description: "Every student tutor undergoes AI mock assessment and verification of subject matter expertise.",
      icon: <Bot size={20} />,
    },
    {
      title: "Learn from Peers",
      description: "Learn from friendly college students and young professionals who speak your language and share your context.",
      icon: <Users size={20} />,
    },
    {
      title: "Affordable Classes",
      description: "Student-led structures bypass administrative costs, translating directly into affordable course pricing.",
      icon: <TrendingDown size={20} />,
    },
    {
      title: "Verified Certificates",
      description: "Earn shareable course completion certificates verified by tutors and the EduEarn board.",
      icon: <Award size={20} />,
    },
    {
      title: "Live Doubt Workshops",
      description: "Attend interactive live doubt clearing code-alongs and community workshops weekly.",
      icon: <Tv size={20} />,
    },
    {
      title: "Earn while Studying",
      description: "High-performing students (16–24) can list custom classes and build an online income channel.",
      icon: <TrendingUp size={20} />,
    },
    {
      title: "Interactive Discussion",
      description: "Peer discussion groups let you ask questions, post work updates, and learn in groups.",
      icon: <MessageSquare size={20} />,
    },
    {
      title: "Premium Communities",
      description: "Get access to our student Discord channels, mock assessment keys, and project review panels.",
      icon: <Sparkles size={20} />,
    },
  ];

  return (
    <section className="w-full py-20 bg-background select-none">
      <Container className="flex flex-col gap-12">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center gap-3">
          <span className="text-[10px] uppercase tracking-wider font-extrabold text-primary bg-primary/10 px-3 py-1 rounded-full">
            Core Benefits
          </span>
          <h2 className="text-3xl md:text-4xl font-heading font-extrabold text-foreground tracking-tight">
            Why Choose EduEarn?
          </h2>
          <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
            Discover the advantages of peer-to-peer education backed by rigorous subject checks and AI review standards.
          </p>
        </div>

        {/* Features Staggered Grid */}
        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, idx) => (
            <motion.div key={idx} variants={staggerChildVariants} className="h-full">
              <FeatureCard
                title={feat.title}
                description={feat.description}
                icon={feat.icon}
                className="h-full border-border/70 hover:border-primary/30"
              />
            </motion.div>
          ))}
        </StaggerContainer>

      </Container>
    </section>
  );
}

export default WhyEduEarn;
