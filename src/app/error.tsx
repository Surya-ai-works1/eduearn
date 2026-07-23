"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, Home, HelpCircle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error internally (could hook up to monitoring services in later phases)
    console.error("EduEarn Platform Error Boundary caught: ", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 text-center select-none">
      <div className="w-16 h-16 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mb-6 animate-bounce">
        <AlertCircle size={32} />
      </div>
      <h1 className="text-2xl md:text-3xl font-heading font-extrabold text-foreground mb-3">
        Unexpected Application Error
      </h1>
      <p className="text-muted-foreground max-w-md text-sm md:text-base mb-8">
        We ran into a temporary issue loading this page. Please try reloading the view or contact our support team.
      </p>
      
      <div className="flex flex-wrap items-center gap-4 justify-center">
        <button
          onClick={reset}
          className="px-5 py-2.5 rounded-button bg-btn-gradient hover:opacity-95 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">
          <RefreshCw size={14} />
          Retry View
        </button>
        
        <Link
          href="/"
          className="px-5 py-2.5 rounded-button border border-border bg-card hover:bg-muted/80 text-foreground text-xs font-bold flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <Home size={14} />
          Go Home
        </Link>
        
        <Link
          href="/support"
          className="px-5 py-2.5 rounded-button border border-border bg-card hover:bg-muted/80 text-foreground text-xs font-bold flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <HelpCircle size={14} />
          Support
        </Link>
      </div>
    </div>
  );
}
