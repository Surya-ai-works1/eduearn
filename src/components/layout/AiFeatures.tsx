"use client";

import React from "react";
import { Container } from "./Container";
import { Card } from "../ui/card";
import {
  MessageSquareCode,
  ShieldCheck,
  Compass,
  Sparkles,
  HelpCircle,
  LineChart,
} from "lucide-react";
import { StaggerContainer, staggerChildVariants } from "../animations";
import { motion } from "framer-motion";

export function AiFeatures() {
  const aiList = [
    {
      title: "AI Study Assistant",
      description: "Ask doubts anytime! Our chatbot analyzes course transcripts to resolve questions instantly.",
      icon: <MessageSquareCode size={20} className="text-primary" />,
      gradientClass: "from-blue-500/10 to-indigo-500/5",
    },
    {
      title: "AI Tutor Assessment",
      description: "Strict applicant screening verifying subject qualifications, communication, and teaching style.",
      icon: <ShieldCheck size={20} className="text-emerald-500" />,
      gradientClass: "from-emerald-500/10 to-teal-500/5",
    },
    {
      title: "Personalized Learning Paths",
      description: "Get customized roadmaps and module sequences matching your specific background and pace.",
      icon: <Compass size={20} className="text-amber-500" />,
      gradientClass: "from-amber-500/10 to-orange-500/5",
    },
    {
      title: "AI Course Recommendations",
      description: "Smart engine suggesting topics based on your career interests and skill check scores.",
      icon: <Sparkles size={20} className="text-purple-650" />,
      gradientClass: "from-purple-500/10 to-pink-500/5",
    },
    {
      title: "AI Quiz Generator",
      description: "Generate customized practice test sheets based on chapters you struggled with.",
      icon: <HelpCircle size={20} className="text-sky-500" />,
      gradientClass: "from-sky-500/10 to-blue-500/5",
    },
    {
      title: "AI Progress Analytics",
      description: "Interactive reports forecasting learning milestones and tracking course completions.",
      icon: <LineChart size={20} className="text-red-500" />,
      gradientClass: "from-red-500/10 to-orange-500/5",
    },
  ];

  return (
    <section className="w-full py-20 bg-background select-none">
      <Container className="flex flex-col gap-12">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center gap-3">
          <span className="text-[10px] uppercase tracking-wider font-extrabold text-foreground bg-ai-gradient px-3 py-1 rounded-full shadow-soft animate-pulse">
            AI Powered Platform
          </span>
          <h2 className="text-3xl md:text-4xl font-heading font-extrabold text-foreground tracking-tight">
            Intelligent Peer Learning Features
          </h2>
          <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
            EduEarn blends student mentorship with artificial intelligence to optimize study flows and check credentials.
          </p>
        </div>

        {/* AI Features Grid */}
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {aiList.map((ai, idx) => (
            <motion.div key={idx} variants={staggerChildVariants}>
              <Card
                variant="glass"
                hoverEffect="glow"
                className="flex flex-col items-start text-left p-6 gap-4 h-full border-border/50 overflow-hidden relative group"
              >
                {/* Background glowing ring inside card */}
                <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-primary/5 group-hover:scale-150 transition-transform duration-500 pointer-events-none" />
                
                {/* Icon wrapper */}
                <div className="w-10 h-10 rounded-input bg-card border border-border shadow-sm hover:shadow-md transition-shadow duration-200/40 flex items-center justify-center shadow-soft">
                  {ai.icon}
                </div>
                
                {/* Text Content */}
                <div>
                  <h4 className="text-xs font-heading font-extrabold text-foreground group-hover:text-primary transition-colors leading-tight">
                    {ai.title}
                  </h4>
                  <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
                    {ai.description}
                  </p>
                </div>
              </Card>
            </motion.div>
          ))}
        </StaggerContainer>

      </Container>
    </section>
  );
}

export default AiFeatures;
