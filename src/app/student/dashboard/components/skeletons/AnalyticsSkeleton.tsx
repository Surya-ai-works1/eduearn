"use client";

import React from "react";

export function AnalyticsSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-[220px] bg-slate-100 dark:bg-slate-900/60 rounded-2xl p-5 flex flex-col justify-between"
        >
          <div className="space-y-2">
            <div className="w-24 h-3 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="w-36 h-5 rounded bg-slate-200 dark:bg-slate-800" />
          </div>
          <div className="flex-1 flex items-center justify-center my-4">
            <div className="w-16 h-16 rounded-full border-4 border-slate-200 dark:border-slate-800 animate-spin" />
          </div>
          <div className="w-full h-3 rounded bg-slate-200 dark:bg-slate-800" />
        </div>
      ))}
    </div>
  );
}
export default AnalyticsSkeleton;
