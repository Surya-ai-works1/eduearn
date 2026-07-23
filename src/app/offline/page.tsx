"use client";

import React from "react";
import { WifiOff, RefreshCw, Home } from "lucide-react";
import Link from "next/link";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { PageWrapper } from "../../components/layout/PageWrapper";

export default function OfflinePage() {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <PageWrapper>
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-background px-4 text-center select-none">
        <Card variant="glass" className="p-8 max-w-md w-full border-destructive/10 flex flex-col items-center gap-6 shadow-premium">
          <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center animate-pulse">
            <WifiOff size={32} />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-heading font-extrabold text-foreground">
              No Internet Connection
            </h1>
            <p className="text-xs text-muted-foreground leading-relaxed">
              It looks like you are currently offline. Please check your network cables or Wi-Fi status and try again.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
            <Button
              onClick={handleRetry}
              className="w-full sm:w-auto h-10 px-5 text-xs font-bold gap-2"
            >
              <RefreshCw size={14} className="animate-spin-slow" />
              Retry Connection
            </Button>
            
            <Link href="/" passHref className="w-full sm:w-auto">
              <Button
                variant="outline"
                className="w-full sm:w-auto h-10 px-5 text-xs font-bold gap-2"
              >
                <Home size={14} />
                Go to Home
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </PageWrapper>
  );
}
