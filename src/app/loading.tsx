import React from "react";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        {/* Pulsing Loading Spinner Ring */}
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-4 border-primary/15" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin" />
        </div>
        <h4 className="text-xs font-heading font-extrabold text-muted-foreground tracking-widest uppercase animate-pulse mt-2">
          EduEarn
        </h4>
      </div>
    </div>
  );
}
