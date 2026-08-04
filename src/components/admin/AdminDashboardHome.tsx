"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpenCheck, CircleDollarSign, ShieldCheck, Users } from "lucide-react";

type DashboardStats = { totalUsers?: number; students?: number; tutors?: number; totalCourses?: number; pendingCourses?: number; totalRevenue?: number; pendingVerifications?: number };
interface DashboardCard {
  label: string;
  value: keyof DashboardStats;
  icon: React.ComponentType<any>;
  href: string;
  currency?: boolean;
}

const cards: DashboardCard[] = [
  { label: "Platform users", value: "totalUsers", icon: Users, href: "/admin/users" },
  { label: "Tutors", value: "tutors", icon: ShieldCheck, href: "/admin/tutor-verification" },
  { label: "Courses", value: "totalCourses", icon: BookOpenCheck, href: "/admin/courses" },
  { label: "Revenue", value: "totalRevenue", icon: CircleDollarSign, href: "/admin/payments", currency: true },
];

export function AdminDashboardHome() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => { fetch("/api/admin/dashboard").then((response) => response.ok ? response.json() : Promise.reject()).then(setStats).catch(() => setError(true)); }, []);
  return <section className="space-y-7"><div><p className="text-sm font-semibold text-primary">Operations overview</p><h2 className="mt-1 text-2xl font-bold tracking-tight">Command center</h2><p className="mt-2 text-sm text-muted-foreground">A route-based workspace for platform operations, governance, and financial oversight.</p></div>
    {error && <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-800 dark:text-amber-300">Live metrics are currently unavailable. Existing Admin controls remain accessible from the navigation.</div>}
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(({ label, value, icon: Icon, href, currency }) => <Link key={label} href={href} className="rounded-xl border border-border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40"><div className="flex items-center justify-between"><p className="text-sm font-medium text-muted-foreground">{label}</p><Icon size={18} className="text-primary" /></div><p className="mt-4 text-2xl font-bold">{stats ? `${currency ? "₹" : ""}${Number(stats[value] || 0).toLocaleString()}` : "—"}</p></Link>)}</div>
    <div className="grid gap-4 lg:grid-cols-2"><div className="rounded-xl border border-border bg-card p-6 shadow-sm"><h3 className="font-semibold">Priority queues</h3><div className="mt-4 divide-y divide-border"><Queue label="Tutor verification" value={stats?.pendingVerifications} href="/admin/tutor-verification" /><Queue label="Course moderation" value={stats?.pendingCourses} href="/admin/courses" /><Queue label="Support & broadcasts" href="/admin/communication" /></div></div><div className="rounded-xl border border-border bg-card p-6 shadow-sm"><h3 className="font-semibold">Phase 2 status</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">Users, tutor verification, course moderation, and database-backed categories now run directly from route-based Admin pages. Remaining modules stay available while their workflows are migrated.</p><Link href="/admin/audit-logs" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">Review governance workspace <ArrowRight size={15} /></Link></div></div>
  </section>;
}
function Queue({ label, value, href }: { label: string; value?: number; href: string }) { return <Link href={href} className="flex items-center justify-between py-3 text-sm hover:text-primary"><span>{label}</span><span className="font-semibold">{value === undefined ? "Open" : `${value} pending`} <ArrowRight className="ml-1 inline" size={14} /></span></Link>; }
