"use client";

import React from "react";
import { Skeleton } from "../../../../../components/ui/skeleton";
import { StatsSkeleton } from "./StatsSkeleton";
import { CourseCardSkeleton } from "./CourseCardSkeleton";
import { AnalyticsSkeleton } from "./AnalyticsSkeleton";

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse select-none">
      {/* Hero Banner Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-56 bg-slate-100 dark:bg-slate-900/60 rounded-3xl" />
        <div className="h-56 bg-slate-100 dark:bg-slate-900/60 rounded-3xl" />
      </div>

      {/* Quick Actions Shortcuts Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-28 rounded-lg" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-20 bg-slate-100 dark:bg-slate-900/60 rounded-2xl" />
          ))}
        </div>
      </div>

      {/* Stats Cards Skeleton */}
      <StatsSkeleton />

      {/* Continue Learning Skeleton */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-32 rounded-lg" />
          <Skeleton className="h-4 w-20 rounded-lg" />
        </div>
        <CourseCardSkeleton />
      </div>

      {/* Analytics Charts Skeleton */}
      <AnalyticsSkeleton />
    </div>
  );
}
export default DashboardSkeleton;
