"use client";

import { Menu, Search, ShieldCheck } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

type AdminHeaderProps = {
  title: string;
  onOpenNavigation: () => void;
};

export function AdminHeader({ title, onOpenNavigation }: AdminHeaderProps) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border/70 bg-background/95 px-4 backdrop-blur md:px-7">
      <button onClick={onOpenNavigation} className="rounded-lg p-2 text-muted-foreground hover:bg-muted md:hidden" aria-label="Open navigation"><Menu size={19} /></button>
      <div className="min-w-0 flex-1"><p className="text-xs font-medium text-muted-foreground">Admin Console</p><h1 className="truncate text-base font-bold tracking-tight">{title}</h1></div>
      <div className="hidden max-w-xs flex-1 items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs text-muted-foreground lg:flex"><Search size={15} /> Global search is coming soon</div>
      <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-2.5 py-1.5"><span className="grid h-7 w-7 place-items-center rounded-full bg-primary/10 text-primary"><ShieldCheck size={15} /></span><span className="hidden max-w-32 truncate text-xs font-semibold sm:block">{user?.fullName || "Administrator"}</span></div>
    </header>
  );
}
