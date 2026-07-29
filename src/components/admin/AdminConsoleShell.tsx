"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { RequireAdmin } from "@/features/auth/components/RouteGuard";
import { cn } from "@/utils/cn";
import { AdminHeader } from "./AdminHeader";
import { AdminSidebar } from "./AdminSidebar";
import { getAdminNavigationItem } from "./navigation";
import { usePathname } from "next/navigation";

export function AdminConsoleShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const item = getAdminNavigationItem(pathname);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const title = item?.label || "Admin Console";

  // The former dashboard remains an explicit compatibility route in Phase 1.
  // It retains its original shell so no existing controls are removed mid-migration.
  if (pathname.startsWith("/admin/dashboard")) return <>{children}</>;

  return <RequireAdmin><div className="min-h-screen bg-muted/25 text-foreground">
    <AdminSidebar collapsed={collapsed} onToggle={() => setCollapsed((value) => !value)} />
    {mobileOpen && <div className="fixed inset-0 z-50 bg-background md:hidden"><div className="flex h-16 items-center justify-end border-b border-border px-4"><button onClick={() => setMobileOpen(false)} className="rounded-lg p-2 hover:bg-muted" aria-label="Close navigation"><X size={19} /></button></div><AdminSidebar mobile collapsed={false} onToggle={() => undefined} onNavigate={() => setMobileOpen(false)} /></div>}
    <div className={cn("min-h-screen transition-[padding] duration-200", collapsed ? "md:pl-[76px]" : "md:pl-72")}>
      <AdminHeader title={title} onOpenNavigation={() => setMobileOpen(true)} />
      <main className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  </div></RequireAdmin>;
}
