"use client";

import React from "react";
import Link from "next/link";
import { Container } from "./Container";
import { ChevronRight, RefreshCw, Home } from "lucide-react";
import { Button } from "../ui/button"; // we will create Button soon
import { Spinner } from "../ui/spinner"; // we will create Spinner soon

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageWrapperProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export function PageWrapper({
  children,
  title,
  subtitle,
  breadcrumbs,
  actions,
  isLoading = false,
  error = null,
  onRetry,
}: PageWrapperProps) {
  return (
    <div className="min-h-screen pt-24 pb-16 bg-background text-foreground transition-colors duration-300">
      <Container>
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center space-x-1.5 text-xs text-muted-foreground mb-6" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1">
              <Home size={13} />
              <span>Home</span>
            </Link>
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                <ChevronRight size={12} className="text-muted-foreground/60" />
                {crumb.href ? (
                  <Link href={crumb.href} className="hover:text-primary transition-colors">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-foreground font-medium">{crumb.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}

        {/* Page Header */}
        {(title || subtitle || actions) && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6 mb-8">
            <div>
              {title && (
                <h1 className="text-3xl md:text-4xl font-heading font-extrabold tracking-tight text-foreground">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-muted-foreground mt-2 max-w-2xl text-sm md:text-base">
                  {subtitle}
                </p>
              )}
            </div>
            {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
          </div>
        )}

        {/* Dynamic States */}
        {isLoading ? (
          <div className="min-h-[400px] flex flex-col items-center justify-center" role="status" aria-busy="true">
            <Spinner size="lg" className="text-primary mb-4" />
            <p className="text-muted-foreground animate-pulse text-sm">Loading content, please wait...</p>
          </div>
        ) : error ? (
          <div className="min-h-[400px] flex flex-col items-center justify-center text-center p-6 border border-dashed border-destructive/30 rounded-2xl bg-destructive/5 max-w-lg mx-auto">
            <h3 className="text-lg font-bold text-destructive mb-2">Something went wrong</h3>
            <p className="text-muted-foreground text-sm mb-6">{error}</p>
            {onRetry ? (
              <Button variant="outline" size="sm" onClick={onRetry} className="gap-2">
                <RefreshCw size={14} />
                Try Again
              </Button>
            ) : (
              <Link href="/">
                <Button size="sm">Back Home</Button>
              </Link>
            )}
          </div>
        ) : (
          /* Page Content */
          <main className="animate-fade-in">{children}</main>
        )}
      </Container>
    </div>
  );
}
export default PageWrapper;
