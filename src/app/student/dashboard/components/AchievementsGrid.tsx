"use client";

import React, { useState } from "react";
import { Award, ShieldAlert, Sparkles, Star, Trophy, Flame } from "lucide-react";
import { DashboardCard } from "./DashboardCard";

interface AchievementsGridProps {
  xp: number;
  coins: number;
  streak: number;
  learningLevel: string;
}

export function AchievementsGrid({ xp, coins, streak, learningLevel }: AchievementsGridProps) {
  const [selectedBadge, setSelectedBadge] = useState<any>(null);

  const badges = [
    {
      id: "streak-champ",
      title: "Streak Champion",
      description: "Maintained a daily learning streak for 7 consecutive days",
      icon: Flame,
      color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
      unlocked: true,
      xpReward: 150,
    },
    {
      id: "calc-king",
      title: "Calculus Conqueror",
      description: "Scored 100% on the Calculus derivatives challenge quiz",
      icon: Trophy,
      color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
      unlocked: true,
      xpReward: 300,
    },
    {
      id: "quick-learner",
      title: "Quick Learner",
      description: "Completed 3 full video lectures within 24 hours",
      icon: Sparkles,
      color: "text-purple-500 bg-purple-500/10 border-purple-500/20",
      unlocked: true,
      xpReward: 200,
    },
    {
      id: "code-warrior",
      title: "Python Code Warrior",
      description: "Submit 5 python assignments verified by peer tutors",
      icon: Award,
      color: "text-slate-400 bg-slate-100 dark:bg-slate-800/40 border-slate-300 dark:border-slate-800",
      unlocked: false,
      xpReward: 500,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 pb-2">
        <h3 className="text-xs font-heading font-extrabold uppercase tracking-widest text-slate-800 dark:text-slate-200">
          Achievements &amp; Gamification
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: XP Points & Rank progression card */}
        <DashboardCard variant="default" className="md:col-span-1 border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900/60 p-5 flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[9px] uppercase font-black tracking-widest text-slate-400 dark:text-slate-500">Student Rank</span>
            <h4 className="text-sm font-black text-slate-800 dark:text-slate-200">Level {learningLevel}</h4>
          </div>

          <div className="my-5 space-y-3">
            <div className="flex justify-between items-baseline text-xs">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">{xp} / 2500 XP</span>
              <span className="text-xs font-black text-primary">Rank: Scholar</span>
            </div>
            <div className="h-2 w-full bg-slate-100 dark:bg-slate-850 rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: "74%" }} />
            </div>
            <p className="text-[9px] text-slate-400 leading-normal">
              Earn 650 more XP to rank up to <strong>Elite Mentor</strong> status.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/40 text-center select-none">
            <div className="p-2 bg-slate-50 dark:bg-slate-950/40 rounded-xl">
              <span className="text-base">🪙</span>
              <span className="text-[8px] uppercase font-black text-slate-400 block mt-1">Wallet</span>
              <span className="text-[11px] font-black text-slate-700 dark:text-slate-350">{coins} Coins</span>
            </div>
            <div className="p-2 bg-slate-50 dark:bg-slate-950/40 rounded-xl">
              <span className="text-base">🔥</span>
              <span className="text-[8px] uppercase font-black text-slate-400 block mt-1">Streak</span>
              <span className="text-[11px] font-black text-slate-700 dark:text-slate-350">{streak} Days</span>
            </div>
          </div>
        </DashboardCard>

        {/* Right: Unlocked Badges shelf */}
        <DashboardCard variant="default" className="md:col-span-2 border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900/60 p-5 flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[9px] uppercase font-black tracking-widest text-slate-400 dark:text-slate-500">Milestone Badges</span>
            <h4 className="text-sm font-black text-slate-800 dark:text-slate-200">Collect Rewards</h4>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-5">
            {badges.map((b) => {
              const Icon = b.icon;
              return (
                <button
                  key={b.id}
                  onClick={() => setSelectedBadge(b)}
                  className={`p-3.5 border rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 focus:outline-none ${
                    b.unlocked 
                      ? `${b.color} hover:scale-105 shadow-sm` 
                      : "opacity-40 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 cursor-not-allowed"
                  }`}
                >
                  <Icon className="w-6 h-6 mb-2" />
                  <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 truncate max-w-full">
                    {b.title.split(" ")[0]}
                  </span>
                  <span className="text-[8px] text-slate-400 font-extrabold mt-0.5">
                    {b.unlocked ? "Unlocked" : "Locked"}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 rounded-2xl min-h-[50px] flex items-center justify-between text-left">
            {selectedBadge ? (
              <div className="flex-1">
                <h5 className="text-[11px] font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  🏆 {selectedBadge.title} <span className="text-[9px] text-emerald-500">+{selectedBadge.xpReward} XP</span>
                </h5>
                <p className="text-[10px] text-slate-450 dark:text-slate-400 mt-0.5 leading-relaxed">{selectedBadge.description}</p>
              </div>
            ) : (
              <span className="text-[10px] text-slate-400 italic">Click a milestone badge to inspect details &amp; rules.</span>
            )}
          </div>
        </DashboardCard>
      </div>
    </div>
  );
}
export default AchievementsGrid;
