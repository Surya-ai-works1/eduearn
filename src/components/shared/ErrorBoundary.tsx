"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RotateCw, Copy, CheckCircle } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { toast } from "sonner";
import { logger } from "../../lib/logger";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
  copied: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    errorId: "",
    copied: false
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const errorId = `err_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`;
    this.setState({ errorInfo, errorId });

    // Automatic Enterprise Logging (Phase 2 & 3)
    logger.error(`[ErrorBoundary] Caught crash ID: ${errorId} | Message: ${error.message}`, {
      errorId,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: "",
      copied: false
    });
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  private handleCopyDiagnostics = () => {
    const report = {
      errorId: this.state.errorId,
      message: this.state.error?.message || "Unknown error",
      stack: this.state.error?.stack || "",
      componentStack: this.state.errorInfo?.componentStack || "",
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "Unknown",
      url: typeof window !== "undefined" ? window.location.href : "Unknown",
      timestamp: new Date().toISOString()
    };

    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(JSON.stringify(report, null, 2)).then(() => {
        this.setState({ copied: true });
        toast.success("Diagnostic report copied to clipboard!");
        setTimeout(() => this.setState({ copied: false }), 2000);
      });
    }
  };

  public render() {
    if (this.state.hasError) {
      const isDev = process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_DEV_MODE === "true";

      return (
        <div className="flex min-h-screen w-full items-center justify-center bg-background p-4 text-left select-none">
          <Card className="w-full max-w-2xl border-border bg-card shadow-lg p-6 space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-rose-500/10 text-rose-500 rounded-full shrink-0">
                <AlertTriangle size={32} />
              </div>
              <div className="space-y-1.5">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-rose-500">
                  System Exception Intercepted
                </span>
                <h1 className="text-xl font-heading font-black text-foreground">
                  An unexpected runtime error has occurred
                </h1>
                <p className="text-xs text-muted-foreground font-semibold">
                  The application crashed, but the session has been isolated. You can copy the diagnostic logs for support or retry reloading the workspace.
                </p>
              </div>
            </div>

            <div className="p-4 bg-muted/20 border border-border/60 rounded-lg space-y-3 font-semibold text-xs text-muted-foreground">
              <div className="flex justify-between items-center">
                <span>Unique Error ID:</span>
                <span className="text-foreground font-mono font-bold select-all bg-card border border-border px-2 py-0.5 rounded">
                  {this.state.errorId}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Error Message:</span>
                <span className="text-rose-500 font-bold max-w-[320px] truncate">
                  {this.state.error?.message || "Render compilation exception"}
                </span>
              </div>
            </div>

            {/* Development Stack Trace (Phase 2) */}
            {isDev && this.state.error && (
              <div className="space-y-2">
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-muted-foreground">
                  Stack Trace (Developer Mode)
                </span>
                <div className="bg-slate-950 p-4 rounded-lg text-rose-400 font-mono text-[10px] max-h-48 overflow-y-auto overflow-x-auto select-text scrollbar-thin">
                  <div className="font-bold border-b border-rose-500/20 pb-1.5 mb-1.5">
                    {this.state.error.name}: {this.state.error.message}
                  </div>
                  <pre className="whitespace-pre-wrap leading-relaxed">{this.state.error.stack}</pre>
                  {this.state.errorInfo && (
                    <pre className="whitespace-pre-wrap leading-relaxed mt-4 border-t border-rose-500/20 pt-2 text-sky-400">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/40 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={this.handleCopyDiagnostics}
                className="h-10 text-[9.5px] uppercase font-black border-border bg-card flex items-center gap-1.5 cursor-pointer"
              >
                {this.state.copied ? <CheckCircle size={13} className="text-emerald-500" /> : <Copy size={13} />}
                <span>{this.state.copied ? "Diagnostics Copied" : "Copy Diagnostic Report"}</span>
              </Button>

              <div className="flex gap-2">
                <Button
                  onClick={this.handleRetry}
                  className="h-10 text-[9.5px] uppercase font-black flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCw size={13} />
                  <span>Reload Session</span>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
export default ErrorBoundary;
