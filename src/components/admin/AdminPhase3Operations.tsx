"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { Check, CircleAlert, CreditCard, Loader2, MessageSquareWarning, RefreshCw, ShieldAlert, Trash2, WalletCards } from "lucide-react";
import { toast } from "sonner";
import type { AdminPayout, AdminTransaction, SupportTicket } from "@/lib/types/admin";

type RequestOptions = { method?: "PATCH" | "POST" | "DELETE"; body?: object };
async function adminRequest<T>(url: string, options: RequestOptions = {}): Promise<T> { const response = await fetch(url, { method: options.method || "GET", headers: options.body ? { "Content-Type": "application/json" } : undefined, body: options.body ? JSON.stringify(options.body) : undefined }); const data = await response.json().catch(() => ({})); if (!response.ok) throw new Error(data.error || "The request could not be completed."); return data as T; }
function Loading({ active }: { active: boolean }) { return active ? <div className="flex min-h-48 items-center justify-center rounded-xl border border-border bg-card"><Loader2 className="animate-spin text-primary" /></div> : null; }
function Notice({ children, tone = "amber" }: { children: React.ReactNode; tone?: "amber" | "rose" }) { return <div className={`rounded-xl border p-4 text-sm ${tone === "rose" ? "border-rose-500/30 bg-rose-500/10 text-rose-800 dark:text-rose-300" : "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300"}`}>{children}</div>; }
function Title({ label, title, description, refresh, loading }: { label: string; title: string; description: string; refresh?: () => void; loading?: boolean }) { return <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-semibold text-primary">{label}</p><h2 className="mt-1 text-2xl font-bold tracking-tight">{title}</h2><p className="mt-2 max-w-3xl text-sm text-muted-foreground">{description}</p></div>{refresh && <button onClick={refresh} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-semibold hover:bg-muted"><RefreshCw size={15} className={loading ? "animate-spin" : ""} />Refresh</button>}</div>; }
function Badge({ value }: { value: string }) { const success = value === "Success" || value === "Released" || value === "Resolved"; const negative = value === "Failed" || value === "Rejected"; return <span className={`rounded-full px-2 py-1 text-[11px] font-bold ${success ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : negative ? "bg-rose-500/10 text-rose-700 dark:text-rose-400" : "bg-amber-500/10 text-amber-700 dark:text-amber-400"}`}>{value}</span>; }

export function AdminFinanceOperations() {
  const [payouts, setPayouts] = useState<AdminPayout[]>([]); const [transactions, setTransactions] = useState<AdminTransaction[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState<string | null>(null); const [busyId, setBusyId] = useState<string | null>(null);
  const load = useCallback(async () => { setLoading(true); setError(null); try { const data = await adminRequest<{ payouts: AdminPayout[]; transactions: AdminTransaction[] }>("/api/admin/payments"); setPayouts(data.payouts); setTransactions(data.transactions); } catch (err) { setError(err instanceof Error ? err.message : "Unable to load finance data."); } finally { setLoading(false); } }, []);
  useEffect(() => { void load(); }, [load]);
  const updatePayout = async (payout: AdminPayout, status: "Released" | "Rejected") => { setBusyId(payout.id); try { const updated = await adminRequest<AdminPayout>("/api/admin/payments", { method: "PATCH", body: { payoutId: payout.id, status } }); setPayouts((items) => items.map((item) => item.id === payout.id ? updated : item)); toast.success(`Payout ${status.toLowerCase()}.`); } catch (err) { toast.error(err instanceof Error ? err.message : "Unable to update payout."); } finally { setBusyId(null); } };
  return <section className="space-y-7"><Title label="Financial operations" title="Payments & payouts" description="Review persisted payment transactions and process existing tutor withdrawal requests through the Admin API." refresh={load} loading={loading} /><Notice>Refund requests are not available here because the current platform has no Supabase refunds table or Admin refund API. The previous refund view is browser-state only and is intentionally not used.</Notice>{error && <Notice tone="rose">{error}</Notice>}<Loading active={loading} />{!loading && !error && <><div className="rounded-xl border border-border bg-card shadow-sm"><div className="flex items-center gap-2 border-b border-border p-5"><CreditCard size={18} className="text-primary" /><h3 className="font-semibold">Transactions</h3></div><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="border-b border-border bg-muted/40 text-xs uppercase text-muted-foreground"><tr><th className="px-4 py-3">Student</th><th className="px-4 py-3">Course</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Status</th></tr></thead><tbody className="divide-y divide-border">{transactions.map((transaction) => <tr key={transaction.id}><td className="px-4 py-3 font-semibold">{transaction.studentName}</td><td className="px-4 py-3">{transaction.courseTitle}</td><td className="px-4 py-3">₹{transaction.amount.toLocaleString()}</td><td className="px-4 py-3 text-muted-foreground">{transaction.date}</td><td className="px-4 py-3"><Badge value={transaction.status} /></td></tr>)}</tbody></table></div></div><div className="rounded-xl border border-border bg-card shadow-sm"><div className="flex items-center gap-2 border-b border-border p-5"><WalletCards size={18} className="text-primary" /><h3 className="font-semibold">Tutor withdrawals</h3></div><div className="overflow-x-auto"><table className="w-full min-w-[820px] text-left text-sm"><thead className="border-b border-border bg-muted/40 text-xs uppercase text-muted-foreground"><tr><th className="px-4 py-3">Tutor</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Method</th><th className="px-4 py-3">Requested</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th></tr></thead><tbody className="divide-y divide-border">{payouts.map((payout) => <tr key={payout.id}><td className="px-4 py-3 font-semibold">{payout.tutorName}</td><td className="px-4 py-3">₹{payout.amount.toLocaleString()}</td><td className="px-4 py-3">{payout.method}</td><td className="px-4 py-3 text-muted-foreground">{payout.date}</td><td className="px-4 py-3"><Badge value={payout.status} /></td><td className="px-4 py-3"><div className="flex justify-end gap-2">{payout.status === "Pending" && <><button disabled={busyId === payout.id} onClick={() => void updatePayout(payout, "Released")} className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2 py-1 text-xs font-semibold text-white"><Check size={13} />Release</button><button disabled={busyId === payout.id} onClick={() => void updatePayout(payout, "Rejected")} className="rounded-md border border-destructive/30 px-2 py-1 text-xs font-semibold text-destructive">Reject</button></>}</div></td></tr>)}</tbody></table></div></div></>}</section>;
}

export function AdminSupportOperations() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState<string | null>(null); const [busyId, setBusyId] = useState<string | null>(null);
  const load = useCallback(async () => { setLoading(true); setError(null); try { setTickets(await adminRequest<SupportTicket[]>("/api/admin/tickets")); } catch (err) { setError(err instanceof Error ? err.message : "Unable to load tickets."); } finally { setLoading(false); } }, []);
  useEffect(() => { void load(); }, [load]);
  const resolve = async (ticket: SupportTicket) => { setBusyId(ticket.id); try { const updated = await adminRequest<SupportTicket>("/api/admin/tickets", { method: "POST", body: { ticketId: ticket.id, action: "resolve" } }); setTickets((items) => items.map((item) => item.id === ticket.id ? updated : item)); toast.success("Ticket resolved."); } catch (err) { toast.error(err instanceof Error ? err.message : "Unable to resolve ticket."); } finally { setBusyId(null); } };
  return <section className="space-y-6"><Title label="Customer operations" title="Support tickets" description="View and resolve persisted support tickets from Supabase using the existing Admin support API." refresh={load} loading={loading} /><Notice>Ticket replies are not shown as an available action: the current schema has no persisted ticket-message table, so the route does not simulate delivery.</Notice>{error && <Notice tone="rose">{error}</Notice>}<Loading active={loading} />{!loading && !error && <div className="grid gap-4 xl:grid-cols-2">{tickets.map((ticket) => <article key={ticket.id} className="rounded-xl border border-border bg-card p-5 shadow-sm"><div className="flex items-start justify-between gap-4"><div><h3 className="font-semibold">{ticket.title}</h3><p className="mt-1 text-sm text-muted-foreground">{ticket.user}{ticket.email ? ` · ${ticket.email}` : ""}</p></div><Badge value={ticket.status} /></div><p className="mt-4 text-sm leading-6 text-muted-foreground">{ticket.description}</p><div className="mt-5 flex items-center justify-between"><span className="text-xs font-semibold text-muted-foreground">{ticket.priority} priority · {ticket.date}</span>{ticket.status === "Open" && <button disabled={busyId === ticket.id} onClick={() => void resolve(ticket)} className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground">Resolve ticket</button>}</div></article>)}{!tickets.length && <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground xl:col-span-2">No support tickets found.</div>}</div>}</section>;
}

export function AdminReportsOperations() {
  const [reviewId, setReviewId] = useState(""); const [busy, setBusy] = useState(false);
  const deleteReview = async (event: FormEvent) => { event.preventDefault(); if (!reviewId.trim()) return; if (!window.confirm("Delete this review permanently?")) return; setBusy(true); try { await adminRequest(`/api/admin/reports?reviewId=${encodeURIComponent(reviewId.trim())}`, { method: "DELETE" }); setReviewId(""); toast.success("Review deleted."); } catch (err) { toast.error(err instanceof Error ? err.message : "Unable to delete review."); } finally { setBusy(false); } };
  return <section className="space-y-6"><Title label="Trust & safety" title="Reports & review moderation" description="Use the existing review-deletion endpoint for confirmed moderation decisions." /><Notice><strong>User report queue unavailable.</strong> The repository currently has no Supabase reports table, and the existing reports list uses browser fallback data. A persisted report model and list API are required before a real user-report queue can be migrated.</Notice><div className="rounded-xl border border-border bg-card p-5 shadow-sm"><div className="flex items-center gap-2"><ShieldAlert size={18} className="text-primary" /><h3 className="font-semibold">Review moderation</h3></div><p className="mt-2 text-sm text-muted-foreground">The current API supports deleting a review by ID, but does not expose a review-list or flagged-review queue endpoint.</p><form onSubmit={deleteReview} className="mt-5 flex max-w-xl gap-3"><input value={reviewId} onChange={(event) => setReviewId(event.target.value)} placeholder="Review ID" className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm" /><button disabled={busy} className="inline-flex items-center gap-2 rounded-lg border border-destructive/30 px-3 py-2 text-sm font-semibold text-destructive hover:bg-destructive/10"><Trash2 size={15} />Delete review</button></form></div></section>;
}

import { createClient } from "@/lib/supabase";
import { Plus, Calendar, Clock, Link as LinkIcon } from "lucide-react";

export function AdminLiveClassesOperations() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  // Form states
  const [courseId, setCourseId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("live_class");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState("60");
  const [link, setLink] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: schData } = await supabase.from("schedules").select("*").order("scheduled_at", { ascending: false });
      setSchedules(schData || []);

      const { data: crsData } = await supabase.from("courses").select("id, title").order("title");
      setCourses(crsData || []);
    } catch (err: any) {
      console.error("Error loading schedules:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleAddSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !time) {
      toast.error("Please enter a title and scheduled time.");
      return;
    }
    setBusy(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("schedules").insert({
        course_id: courseId || null,
        title: title.trim(),
        description: description.trim() || null,
        type,
        scheduled_at: new Date(time).toISOString(),
        duration_minutes: parseInt(duration, 10),
        meeting_link: link.trim() || null,
        status: "scheduled"
      });
      if (error) throw error;
      toast.success("Timetable session successfully scheduled.");
      setTitle("");
      setDescription("");
      setLink("");
      setTime("");
      void load();
    } catch (err: any) {
      toast.error(err.message || "Failed to schedule session.");
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    if (!window.confirm("Delete this scheduled session?")) return;
    try {
      const supabase = createClient();
      const { error } = await supabase.from("schedules").delete().eq("id", id);
      if (error) throw error;
      toast.success("Schedule deleted successfully.");
      void load();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete schedule.");
    }
  };

  return (
    <section className="space-y-6">
      <Title
        label="Learning operations"
        title="Live Class Planner & Timetable"
        description="Schedule live classes, recorded lecture slot plans, doubt rooms, and assign them directly to academy courses."
        refresh={load}
        loading={loading}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Scheduler Form */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4 h-fit">
          <div className="flex items-center gap-2 border-b border-border/20 pb-3">
            <Plus size={16} className="text-primary" />
            <h3 className="font-semibold text-sm">Schedule Session</h3>
          </div>
          <form onSubmit={handleAddSchedule} className="space-y-3 text-left">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Associated Course (Optional)</label>
              <select
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className="h-10 w-full rounded border border-border bg-background px-3 text-xs focus:outline-none"
              >
                <option value="">Select a course</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Session Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Algebra Chapter 2 Live doubt class"
                className="h-10 w-full rounded border border-border bg-background px-3 text-xs focus:outline-none"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Session coverage details..."
                className="w-full rounded border border-border bg-background p-3 text-xs focus:outline-none"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="h-10 w-full rounded border border-border bg-background px-3 text-xs focus:outline-none"
                >
                  <option value="live_class">Live Class</option>
                  <option value="doubt_session">Doubt Session</option>
                  <option value="recorded_session">Recorded Slot</option>
                  <option value="workshop">Workshop</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Duration (mins)</label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="h-10 w-full rounded border border-border bg-background px-3 text-xs focus:outline-none"
                  min="5"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Scheduled At *</label>
              <input
                type="datetime-local"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="h-10 w-full rounded border border-border bg-background px-3 text-xs focus:outline-none"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Meeting Link / Video URL</label>
              <input
                type="url"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://meet.google.com/..."
                className="h-10 w-full rounded border border-border bg-background px-3 text-xs focus:outline-none"
              />
            </div>
            <button
              disabled={busy}
              type="submit"
              className="w-full flex items-center justify-center gap-1.5 h-10 rounded bg-primary text-primary-foreground font-semibold text-xs mt-2 disabled:opacity-60"
            >
              <Plus size={14} /> Schedule Now
            </button>
          </form>
        </div>

        {/* Timetable Schedule Grid */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border/20 pb-3">
            <h3 className="font-semibold text-sm">Scheduled Timetables</h3>
            <span className="text-[10px] uppercase font-bold text-muted-foreground">{schedules.length} Sessions</span>
          </div>

          <Loading active={loading} />

          {!loading && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px] text-left text-xs">
                <thead className="border-b border-border bg-muted/40 uppercase tracking-wide text-muted-foreground font-bold">
                  <tr>
                    <th className="px-3 py-2">Session Info</th>
                    <th className="px-3 py-2">Type</th>
                    <th className="px-3 py-2">Time & Duration</th>
                    <th className="px-3 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-left">
                  {schedules.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/10">
                      <td className="px-3 py-3">
                        <p className="font-semibold text-foreground">{item.title}</p>
                        {item.description && <p className="text-[10px] text-muted-foreground mt-0.5">{item.description}</p>}
                        {item.meeting_link && (
                          <a href={item.meeting_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline mt-1 font-bold">
                            <LinkIcon size={10} /> Link
                          </a>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <span className="capitalize font-bold text-muted-foreground">{item.type.replace("_", " ")}</span>
                      </td>
                      <td className="px-3 py-3 text-muted-foreground">
                        <p className="font-semibold text-foreground">{new Date(item.scheduled_at).toLocaleString()}</p>
                        <p className="text-[10px] mt-0.5">{item.duration_minutes} minutes</p>
                      </td>
                      <td className="px-3 py-3 text-right">
                        <button onClick={() => handleDeleteSchedule(item.id)} className="p-1 hover:bg-destructive/10 text-destructive rounded" title="Delete Schedule">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!schedules.length && (
                    <tr>
                      <td colSpan={4} className="text-center py-6 text-muted-foreground">No timetable sessions scheduled yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
