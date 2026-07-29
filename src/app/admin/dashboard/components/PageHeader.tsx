import React from "react";
import Link from "next/link";

interface Breadcrumb {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: Breadcrumb[];
  toolbar?: React.ReactNode;
}

export default function PageHeader({ title, subtitle, breadcrumbs, toolbar }: PageHeaderProps) {
  return (
    <header className="border-b border-border/30 bg-card/80 backdrop-blur-sm p-4 md:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 rounded-t-lg shadow-sm">
      <div className="flex-1">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav aria-label="breadcrumb" className="mb-1">
            <ol className="flex flex-wrap text-sm text-muted-foreground/70">
              {breadcrumbs.map((bc, idx) => (
                <li key={idx} className="flex items-center">
                  {bc.href ? (
                    <Link href={bc.href} className="hover:underline">
                      {bc.label}
                    </Link>
                  ) : (
                    <span>{bc.label}</span>
                  )}
                  {idx < breadcrumbs.length - 1 && (
                    <span className="mx-1">/</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}
        <h1 className="text-xl font-bold text-foreground">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {toolbar && (
        <div className="flex-none flex items-center gap-2">{toolbar}</div>
      )}
    </header>
  );
}
