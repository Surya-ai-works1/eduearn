import React from "react";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  toolbar?: React.ReactNode;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumbs = [],
  toolbar,
  actions,
}) => {
  return (
    <header className="flex flex-col gap-2 py-4 border-b border-border/20 bg-card/95 backdrop-blur-md md:pl-64 lg:pl-64 md:pr-4">
      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <nav className="flex items-center text-xs text-muted-foreground space-x-1">
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              {crumb.href ? (
                <a href={crumb.href} className="hover:underline">
                  {crumb.label}
                </a>
              ) : (
                <span>{crumb.label}</span>
              )}
              {idx < breadcrumbs.length - 1 && (
                <ChevronRight size={12} className="inline-block" />
              )}
            </React.Fragment>
          ))}
        </nav>
      )}
      {/* Title & Subtitle */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1">
              {subtitle}
            </p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      {/* Toolbar */}
      {toolbar && <div className="flex items-center gap-2 mt-2">{toolbar}</div>}
    </header>
  );
};
