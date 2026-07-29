import Link from "next/link";
import { ArrowUpRight, Clock3 } from "lucide-react";

type AdminModulePageProps = {
  title: string;
  description: string;
  legacyTab: string;
  pending?: boolean;
};

export function AdminModulePage({ title, description, legacyTab, pending = false }: AdminModulePageProps) {
  return <section className="space-y-6"><div><p className="text-sm font-semibold text-primary">Platform operations</p><h2 className="mt-1 text-2xl font-bold tracking-tight">{title}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{description}</p></div>
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm"><div className="flex items-start gap-4"><span className="rounded-lg bg-amber-500/10 p-2 text-amber-600"><Clock3 size={20} /></span><div className="flex-1"><h3 className="font-semibold">{pending ? "Route migration pending" : "Existing operational controls"}</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">{pending ? "This module remains available while its database-backed route workflow is separated in a later phase." : "The existing API-connected controls are preserved during the Phase 1 route migration."}</p><Link href={`/admin/dashboard?tab=${legacyTab}`} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">Open existing controls <ArrowUpRight size={15} /></Link></div></div></div>
  </section>;
}
