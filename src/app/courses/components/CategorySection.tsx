import React from "react";
import { Code, Cpu, Smartphone, Database, Terminal, Shield, Palette, Layout, Box } from "lucide-react";
import { motion } from "framer-motion";

interface CategorySectionProps {
  onCategorySelect: (catId: string) => void;
  activeCategory: string;
}

export const CategorySection: React.FC<CategorySectionProps> = ({
  onCategorySelect,
  activeCategory,
}) => {
  const categories = [
    { id: "web-development", name: "Web Development", icon: Code, color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
    { id: "ai-ml", name: "AI/ML", icon: Cpu, color: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
    { id: "app-development", name: "App Development", icon: Smartphone, color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
    { id: "data-science", name: "Data Science", icon: Database, color: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
    { id: "data-analytics", name: "Data Analytics", icon: Layout, color: "bg-pink-500/10 text-pink-500 border-pink-500/20" },
    { id: "ethical-hacking", name: "Ethical Hacking", icon: Shield, color: "bg-red-500/10 text-red-500 border-red-500/20" },
    { id: "ui-ux-designing", name: "UI UX Designing", icon: Palette, color: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20" },
    { id: "ai-tools", name: "AI Tools", icon: Terminal, color: "bg-teal-500/10 text-teal-500 border-teal-500/20" },
    { id: "others", name: "Others", icon: Box, color: "bg-slate-500/10 text-slate-500 border-slate-500/20" },
  ];

  return (
    <section className="w-full py-12 select-none text-left">
      <div className="max-w-6xl mx-auto px-6 space-y-6">
        <div>
          <h2 className="text-xl font-heading font-extrabold text-foreground tracking-tight">
            Browse Subject Categories
          </h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Discover peer tutoring courses tailored to your specific field of study.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = activeCategory === cat.id;

            return (
              <motion.button
                key={cat.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onCategorySelect(cat.id)}
                className={`flex flex-col items-center justify-center p-4 border rounded-2xl shadow-soft transition-all duration-300 gap-3 cursor-pointer ${
                  isSelected
                    ? "bg-primary border-primary text-primary-foreground"
                    : "bg-card border-border/80 text-foreground hover:border-primary/50"
                }`}
                role="checkbox"
                aria-checked={isSelected}
              >
                <div className={`p-2.5 rounded-xl border flex items-center justify-center ${
                  isSelected ? "bg-white/10 border-white/20 text-white" : cat.color
                }`}>
                  <Icon size={18} />
                </div>
                <span className="text-[10px] font-heading font-black text-center truncate max-w-full">
                  {cat.name}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
