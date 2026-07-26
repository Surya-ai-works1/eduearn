"use client";

import React from "react";

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="h-32 bg-slate-100 dark:bg-slate-900/60 rounded-2xl p-4 flex flex-col justify-between"
        >
          <div className="flex justify-between items-start">
            <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-800" />
            <div className="w-12 h-6 rounded-lg bg-slate-200 dark:bg-slate-800" />
          </div>
          <div className="space-y-2 mt-4">
            <div className="w-14 h-3 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="w-20 h-5 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="w-16 h-2 rounded bg-slate-250 dark:bg-slate-850" />
          </div>
        </div>
      ))}
    </div>
  );
}
export default StatsSkeleton;
