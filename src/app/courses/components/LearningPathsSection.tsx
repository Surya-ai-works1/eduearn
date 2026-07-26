import React, { useState } from "react";
import { Award, Compass, Play, BookOpen, Clock, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PathStep {
  title: string;
  desc: string;
  duration: string;
}

interface Path {
  id: string;
  name: string;
  duration: string;
  steps: PathStep[];
}

export const LearningPathsSection: React.FC = () => {
  const paths: Path[] = [
    {
      id: "frontend",
      name: "Frontend Development",
      duration: "45 hours",
      steps: [
        { title: "HTML5, CSS3, & Modern Flexbox", desc: "Build responsive web page structures and style layouts using vanilla CSS.", duration: "10 hours" },
        { title: "JavaScript Fundamentals & ES6+", desc: "Master basic logic, functions, promises, arrays, and DOM manipulation.", duration: "15 hours" },
        { title: "React Context & State Management", desc: "Build modern web apps using components, custom hooks, and API fetching.", duration: "20 hours" },
      ],
    },
    {
      id: "ai-ml",
      name: "AI & Machine Learning",
      duration: "65 hours",
      steps: [
        { title: "Linear Algebra & Statistics with Python", desc: "Learn essential math theories, NumPy, and Pandas manipulation.", duration: "18 hours" },
        { title: "Supervised & Unsupervised Models", desc: "Master classification, regression, k-means, and sklearn pipelines.", duration: "22 hours" },
        { title: "Neural Networks & Deep Learning", desc: "Deploy TensorFlow and PyTorch architectures for computer vision.", duration: "25 hours" },
      ],
    },
    {
      id: "python",
      name: "Python Programming",
      duration: "30 hours",
      steps: [
        { title: "Variables, Loops, & Conditionals", desc: "Write scripts and understand syntax commands.", duration: "8 hours" },
        { title: "Data Structures & File Handlers", desc: "Manage lists, dictionaries, tuples, and file reads/writes.", duration: "10 hours" },
        { title: "Object Oriented Design Pattern", desc: "Write reusable classes, methods, and error catchers.", duration: "12 hours" },
      ],
    },
    {
      id: "uiux",
      name: "UI/UX & Product Design",
      duration: "35 hours",
      steps: [
        { title: "User Research & Information Architecture", desc: "Build user personas and draw wireframe low-fidelity sketches.", duration: "10 hours" },
        { title: "Figma Prototyping & Design Systems", desc: "Master autolayouts, variant states, and interactive components.", duration: "15 hours" },
        { title: "Usability Audits & Portfolio Capstone", desc: "Analyze user drop-offs and build a case-study portfolio.", duration: "10 hours" },
      ],
    },
  ];

  const [activePathId, setActivePathId] = useState("frontend");
  const activePath = paths.find((p) => p.id === activePathId) || paths[0];

  return (
    <section className="w-full py-12 bg-muted/15 border-y border-border/40 select-none text-left">
      <div className="max-w-6xl mx-auto px-6 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-xl font-heading font-extrabold text-foreground tracking-tight flex items-center gap-2">
              <Award className="text-primary" size={20} />
              Curated Learning Pathways
            </h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Follow step-by-step roadmap sequences designed by campus mentors to achieve topic mastery.
            </p>
          </div>

          <div className="flex bg-card border border-border p-1 rounded-xl text-xs gap-1">
            {paths.map((p) => (
              <button
                key={p.id}
                onClick={() => setActivePathId(p.id)}
                className={`px-3 py-1.5 rounded-lg font-heading font-extrabold transition-all cursor-pointer ${
                  activePathId === p.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {p.name.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Steps Timeline Grid */}
        <div className="bg-card border border-border/80 shadow-md rounded-3xl p-6 md:p-8">
          <div className="flex items-center justify-between border-b border-border pb-4 select-none mb-6">
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
              Sequence Roadmap: <strong className="text-foreground">{activePath.name}</strong>
            </span>
            <span className="flex items-center gap-1 text-[10px] bg-primary/10 border border-primary/20 text-primary px-2.5 py-0.5 rounded-full font-bold uppercase">
              <Clock size={11} />
              {activePath.duration} Est.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {activePath.steps.map((step, idx) => (
              <div key={idx} className="relative flex flex-col gap-3 group">
                {/* Horizontal line connector (desktop only) */}
                {idx < 2 && (
                  <div className="hidden md:block absolute top-4 left-1/2 right-[-50%] h-[1.5px] bg-border z-0" />
                )}

                {/* Step indicator circle */}
                <div className="flex items-center gap-3 relative z-10">
                  <div className="w-8 h-8 rounded-full bg-primary/15 text-primary border border-primary/25 font-heading font-black text-xs flex items-center justify-center shrink-0 shadow-soft">
                    {idx + 1}
                  </div>
                  <span className="text-[9px] bg-muted/65 text-muted-foreground px-2 py-0.5 rounded font-bold uppercase">
                    Step {idx + 1} • {step.duration}
                  </span>
                </div>

                {/* Info Card */}
                <div className="bg-muted/30 border border-border p-4 rounded-2xl space-y-1.5 grow hover:bg-muted/50 hover:border-primary/25 transition duration-300">
                  <h4 className="font-heading font-extrabold text-xs text-foreground group-hover:text-primary transition-colors">
                    {step.title}
                  </h4>
                  <p className="text-[10px] text-muted-foreground font-light leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
