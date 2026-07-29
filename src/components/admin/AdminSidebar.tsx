"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeftClose, PanelLeftOpen, Shield } from "lucide-react";
import { cn } from "@/utils/cn";
import { adminNavigation } from "./navigation";

type AdminSidebarProps = {
  collapsed: boolean;
  onToggle: () => void;
  onNavigate?: () => void;
  mobile?: boolean;
};

export function AdminSidebar({ collapsed, onToggle, onNavigate, mobile = false }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className={cn(
      "fixed inset-y-0 left-0 z-40 border-r border-border/70 bg-card flex flex-col",
      !mobile && "hidden md:flex",
      "transition-[width] duration-200",
      collapsed ? "w-[76px]" : "w-72"
    )}>
      <div className="flex h-16 items-center border-b border-border/70 px-4">
        <Link href="/admin" className="flex min-w-0 items-center gap-3" aria-label="EduEarn Admin Console">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Shield size={19} />
          </span>
          {!collapsed && <span className="truncate text-sm font-black tracking-tight">EduEarn Console</span>}
        </Link>
        <button onClick={onToggle} className="ml-auto rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
          {collapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}
        </button>
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-5" aria-label="Admin navigation">
        {adminNavigation.map((group) => (
          <section key={group.label}>
            {!collapsed && <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">{group.label}</p>}
            <div className="space-y-1">
              {group.items.map((item) => {
                const active = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href} onClick={onNavigate} title={collapsed ? item.label : undefined}
                    className={cn("flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors", active ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted hover:text-foreground")}>
                    <Icon size={17} className="shrink-0" />
                    {!collapsed && <><span className="min-w-0 flex-1 truncate">{item.label}</span>{item.pending && <span className={cn("rounded border px-1.5 py-0.5 text-[9px] font-bold uppercase", active ? "border-primary-foreground/30" : "border-border text-muted-foreground")}>Pending</span>}</>}
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </nav>
    </aside>
  );
}
