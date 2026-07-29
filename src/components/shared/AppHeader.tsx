import React from "react";
import { Search, RefreshCw, Bell, Menu } from "lucide-react";

interface AppHeaderProps {
  activeTab: string;
  onSearchChange?: (val: string) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  isSidebarCollapsed: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  activeTab,
  onSearchChange,
  onRefresh,
  isRefreshing,
  setIsMobileMenuOpen,
  isSidebarCollapsed,
  setIsCommandPaletteOpen,
}) => {
  return (
    <header
      className={`h-16 px-4 sm:px-6 flex items-center justify-between navbar-surface-blur border-b border-border/20 fixed top-0 right-0 z-30 shrink-0 select-none transition-all duration-300 w-full ${
        isSidebarCollapsed ? "md:pl-20" : "md:pl-64"
      }`}
    >
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="md:hidden p-2 hover:bg-muted rounded-button cursor-pointer text-foreground"
          aria-label="Open mobile menu"
        >
          <Menu size={18} />
        </button>
        <h1 className="text-sm font-heading font-extrabold tracking-tight uppercase text-foreground">
          Command Panel / <span className="text-primary">{activeTab.replace("-", " ")}</span>
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 border border-border rounded-button bg-muted/20 text-[10px] text-muted-foreground font-semibold hover:border-primary/40 cursor-pointer"
        >
          <Search size={12} />
          <span>Search dashboard...</span>
          <span className="bg-muted px-1.5 py-0.5 rounded border border-border/50 text-[9px]">Ctrl+K</span>
        </button>

        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 hover:bg-muted rounded-full relative cursor-pointer text-foreground disabled:opacity-50 transition-colors"
            aria-label="Sync status refresh"
            title="Synchronize Live Database Stats"
          >
            <RefreshCw size={16} className={isRefreshing ? "animate-spin text-primary" : ""} />
          </button>
        )}

        <button className="p-2 hover:bg-muted rounded-full relative cursor-pointer text-foreground" aria-label="View notifications">
          <Bell size={16} />
          <span className="w-1.5 h-1.5 bg-rose-500 rounded-full absolute top-1.5 right-1.5 animate-pulse" />
        </button>
      </div>
    </header>
  );
};
