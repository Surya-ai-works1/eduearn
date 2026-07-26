"use client";

import React from "react";

export function CourseCardSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-[190px] bg-slate-100 dark:bg-slate-900/60 rounded-2xl p-4 flex flex-col justify-between"
        >
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-800" />
            <div className="space-y-1.5 flex-1">
              <div className="w-12 h-3.5 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="w-3/4 h-4 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="w-1/2 h-3 rounded bg-slate-200 dark:bg-slate-800" />
            </div>
          </div>
          <div className="space-y-2 mt-4">
            <div className="flex justify-between">
              <div className="w-20 h-3 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="w-10 h-3 rounded bg-slate-200 dark:bg-slate-800" />
            </div>
            <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800" />
          </div>
          <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-200 dark:border-slate-800">
            <div className="w-24 h-5 rounded-lg bg-slate-200 dark:bg-slate-800" />
            <div className="w-20 h-8 rounded-lg bg-slate-200 dark:bg-slate-800" />
          </div>
        </div>
      ))}
    </div>
  );
}
export default CourseCardSkeleton;
