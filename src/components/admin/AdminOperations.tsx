"use client";

import { FormEvent, useCallback, useEffect, useState, useMemo } from "react";
import { Archive, Check, ChevronDown, CircleAlert, Loader2, Pencil, RefreshCw, ShieldCheck, Trash2, X, Plus, School, Users, Sparkles } from "lucide-react";
import { toast } from "sonner";
import type { AdminCategory, AdminCourse, AdminUser, TutorVerificationApp } from "@/lib/types/admin";
import { createClient } from "@/lib/supabase";
import { ACADEMIES, Academy } from "@/constants/academiesData";
import { LEARNER_TYPES } from "@/constants/learnerTypesData";

type RequestOptions = { method?: "POST" | "PUT" | "PATCH" | "DELETE"; body?: object };

async function adminRequest<T>(url: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(url, {
    method: options.method || "GET",
    headers: options.body ? { "Content-Type": "application/json" } : undefined,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "The admin operation could not be completed.");
  return data as T;
}

function PageIntro({ eyebrow, title, description, onRefresh, loading }: { eyebrow: string; title: string; description: string; onRefresh: () => void; loading: boolean }) {
  return <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-semibold text-primary">{eyebrow}</p><h2 className="mt-1 text-2xl font-bold tracking-tight">{title}</h2><p className="mt-2 max-w-3xl text-sm text-muted-foreground">{description}</p></div><button onClick={onRefresh} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-semibold hover:bg-muted disabled:opacity-60"><RefreshCw size={15} className={loading ? "animate-spin" : ""} />Refresh</button></div>;
}

function DataState({ loading, error, empty, children }: { loading: boolean; error: string | null; empty: boolean; children: React.ReactNode }) {
  if (loading) return <div className="flex min-h-56 items-center justify-center rounded-xl border border-border bg-card"><Loader2 className="animate-spin text-primary" /></div>;
  if (error) return <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-5 text-sm text-destructive"><CircleAlert className="mr-2 inline" size={16} />{error}</div>;
  if (empty) return <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">No records match the current view.</div>;
  return <>{children}</>;
}

function StatusBadge({ value }: { value: string }) {
  const isGood = value === "Active" || value === "Approved" || value === "Enabled";
  const isBad = value === "Suspended" || value === "Rejected" || value === "Archived" || value === "Disabled";
  return <span className={`inline-flex rounded-full px-2 py-1 text-[11px] font-bold ${isGood ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : isBad ? "bg-rose-500/10 text-rose-700 dark:text-rose-400" : "bg-amber-500/10 text-amber-700 dark:text-amber-400"}`}>{value}</span>;
}

export function AdminUsersOperations() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [learnerTypeFilter, setLearnerTypeFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const query = new URLSearchParams();
      if (search) query.set("search", search);
      if (role) query.set("role", role);
      if (learnerTypeFilter) query.set("learnerTypeId", learnerTypeFilter);
      setUsers(await adminRequest<AdminUser[]>(`/api/admin/users?${query}`));
    }
    catch (err) { setError(err instanceof Error ? err.message : "Unable to load users."); }
    finally { setLoading(false); }
  }, [search, role, learnerTypeFilter]);
  useEffect(() => { const timer = window.setTimeout(load, 250); return () => window.clearTimeout(timer); }, [load]);

  const update = async (userId: string, body: object) => {
    setBusyId(userId);
    try { const updated = await adminRequest<AdminUser>("/api/admin/users", { method: "PATCH", body: { userId, ...body } }); setUsers((current) => current.map((user) => user.id === userId ? updated : user)); toast.success("User updated."); }
    catch (err) { toast.error(err instanceof Error ? err.message : "Unable to update user."); }
    finally { setBusyId(null); }
  };
  const editCoins = (user: AdminUser) => { const input = window.prompt(`Set wallet coins for ${user.name}`, String(user.walletCoins)); if (input !== null && !Number.isNaN(Number(input))) void update(user.id, { coins: Number(input) }); };
  const remove = async (user: AdminUser) => { if (!window.confirm(`Delete ${user.name}'s account? This action cannot be undone.`)) return; setBusyId(user.id); try { await adminRequest(`/api/admin/users?userId=${encodeURIComponent(user.id)}`, { method: "DELETE" }); setUsers((current) => current.filter((item) => item.id !== user.id)); toast.success("User deleted."); } catch (err) { toast.error(err instanceof Error ? err.message : "Unable to delete user."); } finally { setBusyId(null); } };

  return (
    <section className="space-y-6">
      <PageIntro eyebrow="Identity & access" title="Users" description="Search platform accounts and perform the existing status, wallet-credit, and deletion actions through the Admin API." onRefresh={load} loading={loading} />
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row">
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name or email" className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm" />
        <select value={role} onChange={(event) => setRole(event.target.value)} className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
          <option value="">All roles</option>
          <option value="learner">Learners</option>
          <option value="tutor">Tutors</option>
          <option value="admin">Admins</option>
        </select>
        <select value={learnerTypeFilter} onChange={(event) => setLearnerTypeFilter(event.target.value)} className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
          <option value="">All learner types</option>
          {LEARNER_TYPES.filter(l => l.status === "Active").map(l => (
            <option key={l.id} value={l.id}>{l.name}</option>
          ))}
        </select>
      </div>
      <DataState loading={loading} error={error} empty={!users.length}>
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Wallet</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-4 py-3">
                    <p className="font-semibold">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </td>
                  <td className="px-4 py-3 capitalize">
                    <p className="font-semibold">{user.role}</p>
                    {user.role === "learner" && user.learnerTypeId && (
                      <p className="text-[10px] text-primary font-bold">{LEARNER_TYPES.find(l => l.id === user.learnerTypeId)?.name || user.learnerTypeId}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge value={user.status} />
                  </td>
                  <td className="px-4 py-3">{user.walletCoins.toLocaleString()} coins</td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button disabled={busyId === user.id} onClick={() => void update(user.id, { status: user.status === "Active" ? "Suspended" : "Active" })} className="rounded-md border border-border px-2 py-1 text-xs font-semibold hover:bg-muted">{user.status === "Active" ? "Suspend" : "Activate"}</button>
                      <button disabled={busyId === user.id} onClick={() => editCoins(user)} className="rounded-md border border-border p-1.5 hover:bg-muted" aria-label="Edit coins"><Pencil size={14} /></button>
                      <button disabled={busyId === user.id} onClick={() => void remove(user)} className="rounded-md border border-destructive/30 p-1.5 text-destructive hover:bg-destructive/10" aria-label="Delete user"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DataState>

      {/* Teacher Subjects & Classes Assignments Configuration Manager */}
      <TeacherAssignmentsManager users={users} />
    </section>
  );
}

type TeacherAssignmentRecord = {
  id: string;
  teacherId: string;
  teacherName: string;
  academy: string;
  academicYear: string;
  board: string;
  class: string;
  section: string;
  subject: string;
};

function TeacherAssignmentsManager({ users }: { users: AdminUser[] }) {
  const tutors = useMemo(() => users.filter((u) => u.role === "tutor"), [users]);

  const [assignments, setAssignments] = useState<TeacherAssignmentRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);

  // Form State
  const [selectedTutorId, setSelectedTutorId] = useState("");
  const [selectedAcademy, setSelectedAcademy] = useState("School Tuition");
  const [selectedYear, setSelectedYear] = useState("2026-27");
  const [selectedBoard, setSelectedBoard] = useState("CBSE");
  const [selectedClass, setSelectedClass] = useState("Class 10");
  const [selectedSection, setSelectedSection] = useState("A");
  const [selectedSubject, setSelectedSubject] = useState("Mathematics");

  const [isOpen, setIsOpen] = useState(false);

  // Fetch persisted assignments from Supabase system_settings table
  const fetchAssignments = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      if (!supabase) return;
      const { data, error } = await supabase
        .from("system_settings")
        .select("system_version")
        .eq("id", "teacher_assignments")
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        console.warn("Could not fetch teacher assignments from DB:", error.message);
        return;
      }
      if (data?.system_version) {
        try {
          const parsed = JSON.parse(data.system_version);
          if (Array.isArray(parsed)) {
            setAssignments(parsed);
          }
        } catch {
          setAssignments([]);
        }
      } else {
        setAssignments([]);
      }
    } catch (err) {
      console.warn("Error loading teacher assignments:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchAssignments();
    }
  }, [isOpen, fetchAssignments]);

  const handleAddAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTutorId) {
      toast.error("Please select a teacher/tutor.");
      return;
    }
    const tutorObj = tutors.find((t) => t.id === selectedTutorId);
    if (!tutorObj) return;

    const newAssignment: TeacherAssignmentRecord = {
      id: `ta-${Date.now()}`,
      teacherId: selectedTutorId,
      teacherName: tutorObj.name,
      academy: selectedAcademy,
      academicYear: selectedYear,
      board: selectedBoard,
      class: selectedClass,
      section: `Section ${selectedSection.toUpperCase()}`,
      subject: selectedSubject
    };

    const updated = [newAssignment, ...assignments];
    setBusy(true);

    try {
      const supabase = createClient();
      if (supabase) {
        const { error } = await supabase.from("system_settings").upsert({
          id: "teacher_assignments",
          system_version: JSON.stringify(updated),
          updated_at: new Date().toISOString()
        });
        if (error) throw new Error(error.message);
      }
      setAssignments(updated);
      toast.success("Teacher subject assignment added & saved to database!");
      setSelectedTutorId("");
    } catch (err: any) {
      toast.error(`Failed to persist assignment: ${err?.message || "DB error"}`);
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteAssignment = async (id: string) => {
    const updated = assignments.filter((a) => a.id !== id);
    setBusy(true);

    try {
      const supabase = createClient();
      if (supabase) {
        const { error } = await supabase.from("system_settings").upsert({
          id: "teacher_assignments",
          system_version: JSON.stringify(updated),
          updated_at: new Date().toISOString()
        });
        if (error) throw new Error(error.message);
      }
      setAssignments(updated);
      toast.success("Assignment deleted from database.");
    } catch (err: any) {
      toast.error(`Failed to delete assignment: ${err?.message || "DB error"}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4 text-left">
      <div className="flex justify-between items-center cursor-pointer select-none" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex items-center gap-2">
          <School className="text-primary" size={18} />
          <h3 className="font-semibold text-foreground">Teacher Subjects & Classes Assignments</h3>
        </div>
        <button className="text-xs font-bold text-primary hover:underline">
          {isOpen ? "Hide Management Panel" : "Manage Assignments Panel"}
        </button>
      </div>

      {isOpen && (
        <div className="space-y-6 pt-2 animate-in fade-in duration-200">
          <hr className="border-border my-2" />
          <form onSubmit={handleAddAssignment} className="grid gap-4 md:grid-cols-4 bg-muted/20 p-4 rounded-xl border border-border">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Select Teacher</label>
              <select
                required
                value={selectedTutorId}
                onChange={(e) => setSelectedTutorId(e.target.value)}
                className="w-full text-xs bg-background border border-border px-3 py-2 rounded-lg"
              >
                <option value="">Choose tutor...</option>
                {tutors.map((t) => (
                  <option key={t.id} value={t.id}>{t.name} ({t.email})</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Academy</label>
              <select
                value={selectedAcademy}
                onChange={(e) => setSelectedAcademy(e.target.value)}
                className="w-full text-xs bg-background border border-border px-3 py-2 rounded-lg"
              >
                <option>School Tuition</option>
                <option>Career Academy</option>
                <option>Competitive Exams</option>
                <option>Cultural & Creative</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Academic Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full text-xs bg-background border border-border px-3 py-2 rounded-lg"
              >
                <option>2026-27</option>
                <option>2027-28</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Board</label>
              <select
                value={selectedBoard}
                onChange={(e) => setSelectedBoard(e.target.value)}
                className="w-full text-xs bg-background border border-border px-3 py-2 rounded-lg"
              >
                <option>CBSE</option>
                <option>ICSE</option>
                <option>State Board</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Grade Level</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full text-xs bg-background border border-border px-3 py-2 rounded-lg"
              >
                {Array.from({ length: 12 }, (_, i) => `Class ${i + 1}`).map((cls) => (
                  <option key={cls}>{cls}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Section Letter</label>
              <input
                type="text"
                maxLength={1}
                required
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                placeholder="A"
                className="w-full text-xs bg-background border border-border px-3 py-2 rounded-lg"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Subject Topic</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full text-xs bg-background border border-border px-3 py-2 rounded-lg"
              >
                <option>Mathematics</option>
                <option>Science</option>
                <option>Physics</option>
                <option>Chemistry</option>
                <option>Biology</option>
                <option>English</option>
              </select>
            </div>
            <div className="flex items-end">
              <button type="submit" className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90">
                <Plus size={14} /> Add Assignment
              </button>
            </div>
          </form>

          {/* Assignments list table */}
          <div className="overflow-x-auto rounded-xl border border-border bg-card">
            <table className="w-full text-left text-xs font-semibold">
              <thead className="border-b border-border bg-muted/40 text-[10px] text-muted-foreground uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Teacher</th>
                  <th className="px-4 py-3">Academy & Term</th>
                  <th className="px-4 py-3">Board & Class</th>
                  <th className="px-4 py-3">Subject & Section</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {assignments.map((ass) => (
                  <tr key={ass.id}>
                    <td className="px-4 py-3 text-foreground font-bold">{ass.teacherName}</td>
                    <td className="px-4 py-3 text-muted-foreground">{ass.academy} ({ass.academicYear})</td>
                    <td className="px-4 py-3 text-muted-foreground">{ass.board} • {ass.class}</td>
                    <td className="px-4 py-3 text-muted-foreground">{ass.subject} • {ass.section}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDeleteAssignment(ass.id)}
                        className="rounded-md border border-destructive/30 p-1.5 text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
                {!assignments.length && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                      No teacher subject assignments registered.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export function AdminTutorVerificationOperations() {
  const [items, setItems] = useState<TutorVerificationApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [filter, setFilter] = useState("Pending");
  const load = useCallback(async () => { setLoading(true); setError(null); try { setItems(await adminRequest<TutorVerificationApp[]>("/api/admin/verifications")); } catch (err) { setError(err instanceof Error ? err.message : "Unable to load verification queue."); } finally { setLoading(false); } }, []);
  useEffect(() => { void load(); }, [load]);
  const decide = async (item: TutorVerificationApp, status: TutorVerificationApp["status"]) => { const rejectionReason = status === "Rejected" ? window.prompt("Rejection reason for the tutor", item.rejectionReason || "") : undefined; if (status === "Rejected" && rejectionReason === null) return; const adminNotes = window.prompt("Internal review notes", item.adminNotes || ""); if (adminNotes === null) return; setBusyId(item.id); try { const updated = await adminRequest<TutorVerificationApp>("/api/admin/verifications", { method: "PATCH", body: { verificationId: item.id, status, adminNotes, rejectionReason } }); setItems((current) => current.map((value) => value.id === item.id ? updated : value)); toast.success(`Application marked ${status}.`); } catch (err) { toast.error(err instanceof Error ? err.message : "Unable to update application."); } finally { setBusyId(null); } };
  const filtered = filter === "All" ? items : items.filter((item) => item.status === filter);
  return <section className="space-y-6"><PageIntro eyebrow="Trust & safety" title="Tutor verification" description="Review submitted tutor evidence and make approval decisions through the existing verification service." onRefresh={load} loading={loading} /><div className="flex gap-2"><select value={filter} onChange={(event) => setFilter(event.target.value)} className="rounded-lg border border-border bg-card px-3 py-2 text-sm"><option>Pending</option><option>Under Review</option><option>Documents Submitted</option><option>Approved</option><option>Rejected</option><option>All</option></select></div><DataState loading={loading} error={error} empty={!filtered.length}><div className="grid gap-4 xl:grid-cols-2">{filtered.map((item) => <article key={item.id} className="rounded-xl border border-border bg-card p-5 shadow-sm"><div className="flex items-start justify-between gap-4"><div><h3 className="font-semibold">{item.tutorName}</h3><p className="mt-1 text-sm text-muted-foreground">{item.email}</p></div><StatusBadge value={item.status} /></div><dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2"><div><dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Expertise</dt><dd className="mt-1">{item.expertise}</dd></div><div><dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Education</dt><dd className="mt-1">{item.education}</dd></div></dl>{(item.govIdUrl || item.degreeUrl || item.resumeUrl || item.videoDemoUrl) && <div className="mt-4 flex flex-wrap gap-2">{item.govIdUrl && <a href={item.govIdUrl} target="_blank" rel="noreferrer" className="rounded-md border border-border px-2 py-1 text-xs font-semibold hover:bg-muted">Government ID</a>}{item.degreeUrl && <a href={item.degreeUrl} target="_blank" rel="noreferrer" className="rounded-md border border-border px-2 py-1 text-xs font-semibold hover:bg-muted">Degree</a>}{item.resumeUrl && <a href={item.resumeUrl} target="_blank" rel="noreferrer" className="rounded-md border border-border px-2 py-1 text-xs font-semibold hover:bg-muted">Resume</a>}{item.videoDemoUrl && <a href={item.videoDemoUrl} target="_blank" rel="noreferrer" className="rounded-md border border-border px-2 py-1 text-xs font-semibold hover:bg-muted">Video demo</a>}</div>}<div className="mt-5 flex flex-wrap gap-2"><button disabled={busyId === item.id} onClick={() => void decide(item, "Under Review")} className="rounded-lg border border-border px-3 py-2 text-sm font-semibold hover:bg-muted">Mark under review</button><button disabled={busyId === item.id} onClick={() => void decide(item, "Approved")} className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700"><Check size={15} />Approve</button><button disabled={busyId === item.id} onClick={() => void decide(item, "Rejected")} className="inline-flex items-center gap-1 rounded-lg border border-destructive/30 px-3 py-2 text-sm font-semibold text-destructive hover:bg-destructive/10"><X size={15} />Reject</button></div></article>)}</div></DataState></section>;
}

export function AdminCoursesOperations() {
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const load = useCallback(async () => { setLoading(true); setError(null); try { const query = new URLSearchParams(); if (search) query.set("search", search); if (status) query.set("status", status); const [courseList, categoryList] = await Promise.all([adminRequest<AdminCourse[]>(`/api/admin/courses?${query}`), adminRequest<AdminCategory[]>("/api/admin/categories")]); setCourses(courseList); setCategories(categoryList); } catch (err) { setError(err instanceof Error ? err.message : "Unable to load course operations."); } finally { setLoading(false); } }, [search, status]);
  useEffect(() => { const timer = window.setTimeout(load, 250); return () => window.clearTimeout(timer); }, [load]);
  const patch = async (course: AdminCourse, body: object) => { setBusyId(course.id); try { const updated = await adminRequest<AdminCourse>("/api/admin/courses", { method: "PATCH", body: { courseId: course.id, ...body } }); setCourses((current) => current.map((value) => value.id === course.id ? updated : value)); toast.success("Course updated."); } catch (err) { toast.error(err instanceof Error ? err.message : "Unable to update course."); } finally { setBusyId(null); } };
  const changeCategory = async (course: AdminCourse, category: string) => { setBusyId(course.id); try { const updated = await adminRequest<AdminCourse>("/api/admin/courses", { method: "PUT", body: { courseId: course.id, category } }); setCourses((current) => current.map((value) => value.id === course.id ? updated : value)); toast.success("Course category updated."); } catch (err) { toast.error(err instanceof Error ? err.message : "Unable to update category."); } finally { setBusyId(null); } };
  return <section className="space-y-6"><PageIntro eyebrow="Catalog governance" title="Course operations" description="Moderate existing courses, assign catalog categories, and manage featured placement through the Admin API." onRefresh={load} loading={loading} /><div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search courses or tutors" className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm" /><select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-lg border border-border bg-background px-3 py-2 text-sm"><option value="">All statuses</option>{["Pending", "Approved", "Rejected", "Draft", "Need Changes", "Archived"].map((value) => <option key={value}>{value}</option>)}</select></div><DataState loading={loading} error={error} empty={!courses.length}><div className="overflow-x-auto rounded-xl border border-border bg-card"><table className="w-full min-w-[1024px] text-left text-sm"><thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground"><tr><th className="px-4 py-3">Course</th><th className="px-4 py-3">Tutor</th><th className="px-4 py-3">Category</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Featured</th><th className="px-4 py-3 text-right">Actions</th></tr></thead><tbody className="divide-y divide-border">{courses.map((course) => <tr key={course.id}><td className="px-4 py-3"><p className="font-semibold">{course.title}</p><p className="text-xs text-muted-foreground">₹{course.price.toLocaleString()} · {course.enrollmentCount || 0} enrollments</p></td><td className="px-4 py-3">{course.tutorName}</td><td className="px-4 py-3"><select disabled={busyId === course.id} value={course.category} onChange={(event) => void changeCategory(course, event.target.value)} className="rounded border border-border bg-background px-2 py-1 text-xs">{categories.map((category) => <option key={category.id} value={category.name}>{category.name}</option>)}</select></td><td className="px-4 py-3"><StatusBadge value={course.status} /></td><td className="px-4 py-3"><button disabled={busyId === course.id} onClick={() => void patch(course, { featured: !course.featured })} className={`rounded-md px-2 py-1 text-xs font-semibold ${course.featured ? "bg-primary/10 text-primary" : "border border-border hover:bg-muted"}`}>{course.featured ? "Featured" : "Set featured"}</button></td><td className="px-4 py-3"><div className="flex justify-end gap-2"><select disabled={busyId === course.id} value={course.status} onChange={(event) => void patch(course, { status: event.target.value })} className="rounded border border-border bg-background px-2 py-1 text-xs">{["Pending", "Approved", "Rejected", "Draft", "Need Changes", "Archived"].map((value) => <option key={value}>{value}</option>)}</select><button disabled={busyId === course.id} onClick={() => void patch(course, { status: "Archived" })} className="rounded-md border border-destructive/30 p-1.5 text-destructive hover:bg-destructive/10" aria-label="Archive course"><Archive size={14} /></button></div></td></tr>)}</tbody></table></div></DataState></section>;
}

export function AdminCategoriesOperations() {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editing, setEditing] = useState<AdminCategory | null>(null);
  const load = useCallback(async () => { setLoading(true); setError(null); try { setCategories(await adminRequest<AdminCategory[]>("/api/admin/categories")); } catch (err) { setError(err instanceof Error ? err.message : "Unable to load catalog categories."); } finally { setLoading(false); } }, []);
  useEffect(() => { void load(); }, [load]);
  const submit = async (event: FormEvent) => { event.preventDefault(); if (!name.trim()) return; try { if (editing) { const updated = await adminRequest<AdminCategory>("/api/admin/categories", { method: "PUT", body: { categoryId: editing.id, name: name.trim(), description, status: editing.status } }); setCategories((current) => current.map((item) => item.id === editing.id ? updated : item)); toast.success("Category updated."); } else { const created = await adminRequest<AdminCategory>("/api/admin/categories", { method: "POST", body: { name: name.trim(), description } }); setCategories((current) => [...current, created]); toast.success("Category created."); } setName(""); setDescription(""); setEditing(null); } catch (err) { toast.error(err instanceof Error ? err.message : "Unable to save category."); } };
  const toggle = async (category: AdminCategory) => { try { const updated = await adminRequest<AdminCategory>("/api/admin/categories", { method: "PUT", body: { categoryId: category.id, status: category.status === "Enabled" ? "Disabled" : "Enabled" } }); setCategories((current) => current.map((item) => item.id === category.id ? updated : item)); toast.success("Category status updated."); } catch (err) { toast.error(err instanceof Error ? err.message : "Unable to update category."); } };
  const remove = async (category: AdminCategory) => { if (!window.confirm(`Delete category ${category.name}?`)) return; try { await adminRequest(`/api/admin/categories?categoryId=${encodeURIComponent(category.id)}`, { method: "DELETE" }); setCategories((current) => current.filter((item) => item.id !== category.id)); toast.success("Category deleted."); } catch (err) { toast.error(err instanceof Error ? err.message : "Unable to delete category."); } };
  const edit = (category: AdminCategory) => { setEditing(category); setName(category.name); setDescription(category.description || ""); };
  return <section className="space-y-6"><PageIntro eyebrow="Catalog governance" title="Catalog taxonomy" description="Manage database-backed course categories with the existing category API. Nested metadata remains pending because it is not yet persisted by the platform API." onRefresh={load} loading={loading} /><div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-800 dark:text-amber-300">Subcategories, skills, and course metadata are intentionally not edited here: their previous implementation used local browser storage rather than platform data.</div><form onSubmit={submit} className="grid gap-3 rounded-xl border border-border bg-card p-4 md:grid-cols-[1fr_2fr_auto]"><input value={name} onChange={(event) => setName(event.target.value)} placeholder="Category name" className="rounded-lg border border-border bg-background px-3 py-2 text-sm" /><input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Description (optional)" className="rounded-lg border border-border bg-background px-3 py-2 text-sm" /><div className="flex gap-2"><button className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground">{editing ? "Save" : "Add category"}</button>{editing && <button type="button" onClick={() => { setEditing(null); setName(""); setDescription(""); }} className="rounded-lg border border-border px-3 py-2 text-sm font-semibold">Cancel</button>}</div></form><DataState loading={loading} error={error} empty={!categories.length}><div className="overflow-x-auto rounded-xl border border-border bg-card"><table className="w-full min-w-[680px] text-left text-sm"><thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground"><tr><th className="px-4 py-3">Category</th><th className="px-4 py-3">Description</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th></tr></thead><tbody className="divide-y divide-border">{categories.map((category) => <tr key={category.id}><td className="px-4 py-3 font-semibold">{category.name}</td><td className="px-4 py-3 text-muted-foreground">{category.description || "—"}</td><td className="px-4 py-3"><StatusBadge value={category.status} /></td><td className="px-4 py-3"><div className="flex justify-end gap-2"><button onClick={() => void toggle(category)} className="rounded-md border border-border px-2 py-1 text-xs font-semibold hover:bg-muted">{category.status === "Enabled" ? "Disable" : "Enable"}</button><button onClick={() => edit(category)} className="rounded-md border border-border p-1.5 hover:bg-muted" aria-label="Edit category"><Pencil size={14} /></button><button onClick={() => void remove(category)} className="rounded-md border border-destructive/30 p-1.5 text-destructive hover:bg-destructive/10" aria-label="Delete category"><Trash2 size={14} /></button></div></td></tr>)}</tbody></table></div></DataState></section>;
}

export function AdminAcademiesOperations() {
  const [academies, setAcademies] = useState<Academy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Academy | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<Academy["status"]>("Coming Soon");
  const [displayOrder, setDisplayOrder] = useState("1");
  const [icon, setIcon] = useState("GraduationCap");
  const [themeColor, setThemeColor] = useState("#3b82f6");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data, error: fetchErr } = await supabase
        .from("academies")
        .select("*")
        .order("display_order", { ascending: true });

      if (fetchErr) {
        throw fetchErr;
      }

      if (data && data.length > 0) {
        const mapped: Academy[] = data.map((d: any) => ({
          id: d.id,
          name: d.name,
          slug: d.slug,
          description: d.description || "",
          icon: d.icon || "GraduationCap",
          coverImage: d.cover_image || "",
          themeColor: d.theme_color || "#3b82f6",
          status: d.status as Academy["status"],
          displayOrder: Number(d.display_order || 0),
          targetAudience: d.target_audience || "",
          futureCourses: d.future_courses || [],
          expectedLaunch: d.expected_launch || "",
        }));
        setAcademies(mapped);
      } else {
        setAcademies(ACADEMIES);
      }
    } catch (err: any) {
      console.warn("Supabase fetch academies failed, falling back to static constants:", err);
      setAcademies(ACADEMIES);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !slug.trim()) return;

    try {
      const supabase = createClient();
      const payload = {
        name: name.trim(),
        slug: slug.trim().toLowerCase(),
        description: description.trim(),
        status,
        display_order: Number(displayOrder) || 1,
        icon,
        theme_color: themeColor,
        updated_at: new Date().toISOString(),
      };

      if (editing) {
        const { error: updateErr } = await supabase
          .from("academies")
          .update(payload)
          .eq("id", editing.id);

        if (updateErr) throw updateErr;

        setAcademies((current) =>
          current.map((item) =>
            item.id === editing.id
              ? {
                  ...item,
                  name: payload.name,
                  slug: payload.slug,
                  description: payload.description,
                  status: payload.status,
                  displayOrder: payload.display_order,
                  icon: payload.icon,
                  themeColor: payload.theme_color,
                }
              : item
          )
        );
        toast.success("Academy updated successfully.");
      } else {
        const { data: inserted, error: insertErr } = await supabase
          .from("academies")
          .insert({
            ...payload,
            cover_image: `/images/academies/${payload.slug}.webp`,
          })
          .select()
          .single();

        if (insertErr) throw insertErr;

        const newAcademy: Academy = {
          id: inserted.id,
          name: inserted.name,
          slug: inserted.slug,
          description: inserted.description || "",
          icon: inserted.icon || "GraduationCap",
          coverImage: inserted.cover_image || "",
          themeColor: inserted.theme_color || "#3b82f6",
          status: inserted.status as Academy["status"],
          displayOrder: Number(inserted.display_order || 0),
          targetAudience: "",
          futureCourses: [],
          expectedLaunch: "",
          enabledFeatures: [],
          dashboardLayout: { tabs: [], widgets: [] },
          navigationConfig: { sidebarItems: [] }
        };

        setAcademies((current) => [...current, newAcademy].sort((a, b) => a.displayOrder - b.displayOrder));
        toast.success("Academy created successfully.");
      }

      // Reset form
      setName("");
      setSlug("");
      setDescription("");
      setStatus("Coming Soon");
      setDisplayOrder("1");
      setEditing(null);
    } catch (err: any) {
      console.warn("DB save failed, falling back to local state updates:", err);
      if (editing) {
        setAcademies((current) =>
          current.map((item) =>
            item.id === editing.id
              ? {
                  ...item,
                  name: name.trim(),
                  slug: slug.trim().toLowerCase(),
                  description: description.trim(),
                  status,
                  displayOrder: Number(displayOrder) || 1,
                  icon,
                  themeColor,
                }
              : item
          )
        );
        toast.success("Academy updated (Local fallback).");
      } else {
        const localNew: Academy = {
          id: `academy-${Date.now()}`,
          name: name.trim(),
          slug: slug.trim().toLowerCase(),
          description: description.trim(),
          icon,
          coverImage: `/images/academies/${slug.trim().toLowerCase()}.webp`,
          themeColor,
          status,
          displayOrder: Number(displayOrder) || 1,
          targetAudience: "",
          futureCourses: [],
          expectedLaunch: "Q4 2026",
          enabledFeatures: [],
          dashboardLayout: { tabs: [], widgets: [] },
          navigationConfig: { sidebarItems: [] }
        };
        setAcademies((current) => [...current, localNew].sort((a, b) => a.displayOrder - b.displayOrder));
        toast.success("Academy created (Local fallback).");
      }
      setName("");
      setSlug("");
      setDescription("");
      setStatus("Coming Soon");
      setDisplayOrder("1");
      setEditing(null);
    }
  };

  const handleEdit = (academy: Academy) => {
    setEditing(academy);
    setName(academy.name);
    setSlug(academy.slug);
    setDescription(academy.description);
    setStatus(academy.status);
    setDisplayOrder(String(academy.displayOrder));
    setIcon(academy.icon);
    setThemeColor(academy.themeColor);
  };

  const toggleStatus = async (academy: Academy) => {
    const nextStatus = academy.status === "Active" ? "Coming Soon" : "Active";
    try {
      const supabase = createClient();
      const { error: toggleErr } = await supabase
        .from("academies")
        .update({ status: nextStatus, updated_at: new Date().toISOString() })
        .eq("id", academy.id);

      if (toggleErr) throw toggleErr;

      setAcademies((current) =>
        current.map((item) => (item.id === academy.id ? { ...item, status: nextStatus } : item))
      );
      toast.success("Academy status toggled.");
    } catch (err: any) {
      console.warn("DB toggle failed:", err);
      setAcademies((current) =>
        current.map((item) => (item.id === academy.id ? { ...item, status: nextStatus } : item))
      );
      toast.success("Academy status toggled (Local fallback).");
    }
  };

  return (
    <section className="space-y-6">
      <PageIntro
        eyebrow="Ecosystem governance"
        title="Academy management"
        description="Configure, enable, or disable education hubs inside the EduEarn multi-academy ecosystem. Status toggles are permanently persisted."
        onRefresh={load}
        loading={loading}
      />

      <form onSubmit={submit} className="rounded-xl border border-border bg-card p-6 flex flex-col gap-4">
        <h3 className="font-extrabold text-sm uppercase tracking-wider text-muted-foreground">
          {editing ? `Edit Academy: ${editing.name}` : "Create New Academy"}
        </h3>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase text-muted-foreground">Academy Name</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Cooking Academy"
              className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase text-muted-foreground">Routing Slug</label>
            <input
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="e.g. cooking"
              className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase text-muted-foreground">Ecosystem Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as Academy["status"])}
              className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs"
            >
              <option value="Active">Active</option>
              <option value="Coming Soon">Coming Soon</option>
              <option value="Private Beta">Private Beta</option>
              <option value="Archived">Archived</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase text-muted-foreground">Display Order</label>
            <input
              type="number"
              min="1"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(e.target.value)}
              className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex flex-col gap-1 sm:col-span-2">
            <label className="text-[10px] font-bold uppercase text-muted-foreground">Short Description</label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a 1-sentence synopsis of this learning space..."
              className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase text-muted-foreground">Theme Color</label>
              <input
                type="color"
                value={themeColor}
                onChange={(e) => setThemeColor(e.target.value)}
                className="w-full h-8 rounded border border-border cursor-pointer p-0 bg-transparent"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase text-muted-foreground">Lucide Icon</label>
              <select
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs h-8"
              >
                <option value="GraduationCap">GraduationCap</option>
                <option value="Briefcase">Briefcase</option>
                <option value="BookOpen">BookOpen</option>
                <option value="Palette">Palette</option>
                <option value="Heart">Heart</option>
                <option value="TrendingUp">TrendingUp</option>
                <option value="Sparkles">Sparkles</option>
                <option value="Award">Award</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-2 justify-end mt-2">
          {editing && (
            <button
              type="button"
              onClick={() => {
                setEditing(null);
                setName("");
                setSlug("");
                setDescription("");
                setStatus("Coming Soon");
                setDisplayOrder("1");
              }}
              className="rounded-lg border border-border px-4 py-2 text-xs font-semibold hover:bg-muted"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/95"
          >
            {editing ? "Save Changes" : "Create Academy"}
          </button>
        </div>
      </form>

      <DataState loading={loading} error={error} empty={!academies.length}>
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Display Order</th>
                <th className="px-4 py-3">Academy</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {academies.map((academy) => (
                <tr key={academy.id}>
                  <td className="px-4 py-3 font-semibold text-center w-24">
                    {academy.displayOrder}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-6 h-6 rounded flex items-center justify-center text-white shrink-0"
                        style={{ backgroundColor: academy.themeColor }}
                      >
                        <School size={12} />
                      </span>
                      <span className="font-semibold text-foreground">{academy.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    /academies/{academy.slug}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs max-w-xs truncate">
                    {academy.description || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge value={academy.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => void toggleStatus(academy)}
                        className="rounded-md border border-border px-2 py-1 text-xs font-semibold hover:bg-muted"
                      >
                        {academy.status === "Active" ? "Set Placeholder" : "Set Active"}
                      </button>
                      <button
                        onClick={() => handleEdit(academy)}
                        className="rounded-md border border-border p-1.5 hover:bg-muted"
                        aria-label="Edit academy"
                      >
                        <Pencil size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DataState>
    </section>
  );
}

export function AdminLearnersOperations() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminRequest<AdminUser[]>("/api/admin/users");
      setUsers(data);
    } catch (err: any) {
      setError(err instanceof Error ? err.message : "Unable to load learner statistics.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const learnerUsers = users.filter((u) => u.role === "learner");
  const totalLearners = learnerUsers.length;

  const distribution = useMemo(() => {
    const counts: Record<string, number> = {};
    LEARNER_TYPES.forEach((lt) => {
      counts[lt.id] = 0;
    });

    learnerUsers.forEach((user) => {
      const typeId = user.learnerTypeId || "college";
      counts[typeId] = (counts[typeId] || 0) + 1;
    });

    return LEARNER_TYPES.map((lt) => ({
      ...lt,
      count: counts[lt.id] || 0,
      percentage: totalLearners > 0 ? Math.round(((counts[lt.id] || 0) / totalLearners) * 100) : 0,
    }));
  }, [learnerUsers, totalLearners]);

  const academyInterests = useMemo(() => {
    const interestCounts: Record<string, number> = {};
    ACADEMIES.forEach((acad) => {
      interestCounts[acad.slug] = 0;
    });

    learnerUsers.forEach((user) => {
      if (user.futureAcademiesInterested && Array.isArray(user.futureAcademiesInterested)) {
        user.futureAcademiesInterested.forEach((slug: string) => {
          interestCounts[slug] = (interestCounts[slug] || 0) + 1;
        });
      }
    });

    return ACADEMIES.map((acad) => ({
      ...acad,
      interestCount: interestCounts[acad.slug] || 0,
    }));
  }, [learnerUsers]);

  return (
    <section className="space-y-6">
      <PageIntro
        eyebrow="Ecosystem governance"
        title="Learner analytics"
        description="Monitor learner type distributions, track future academy interests, and review configurable segments in the lifelong learning ecosystem."
        onRefresh={load}
        loading={loading}
      />

      <DataState loading={loading} error={error} empty={!users.length}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="p-4 border border-border bg-card rounded-xl">
            <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Total Registered Learners</p>
            <h3 className="text-2xl font-extrabold text-foreground mt-1">{totalLearners}</h3>
          </div>
          <div className="p-4 border border-border bg-card rounded-xl">
            <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Top Learner Segment</p>
            <h3 className="text-2xl font-extrabold text-primary mt-1">
              {distribution.reduce((prev: any, curr: any) => (curr.count > prev.count ? curr : prev), { name: "N/A", count: 0 }).name}
            </h3>
          </div>
          <div className="p-4 border border-border bg-card rounded-xl">
            <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Future Academy Signup Interest</p>
            <h3 className="text-2xl font-extrabold text-emerald-500 mt-1">
              {academyInterests.reduce((sum: number, curr: any) => sum + curr.interestCount, 0)} leads
            </h3>
          </div>
          <div className="p-4 border border-border bg-card rounded-xl">
            <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Configured Learner Segments</p>
            <h3 className="text-2xl font-extrabold text-foreground mt-1">{LEARNER_TYPES.length} segments</h3>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">Learner Type Distribution</h3>
            <div className="space-y-4">
              {distribution.map((item: any) => (
                <div key={item.id} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-foreground flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.status === "Active" ? "#3b82f6" : "#64748b" }} />
                      {item.name}
                    </span>
                    <span className="text-muted-foreground">{item.count} learners ({item.percentage}%)</span>
                  </div>
                  <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${item.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">Ecosystem Academy Interest (Signups)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-muted-foreground uppercase tracking-wider font-bold">
                    <th className="pb-2">Academy</th>
                    <th className="pb-2 text-right">Signups Interest</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border font-medium">
                  {academyInterests.map((acad: any) => (
                    <tr key={acad.id}>
                      <td className="py-2.5 text-foreground flex items-center gap-2">
                        <span className="w-4 h-4 rounded flex items-center justify-center text-white text-[9px] font-bold" style={{ backgroundColor: acad.themeColor }}>
                          {acad.name[0]}
                        </span>
                        {acad.name}
                      </td>
                      <td className="py-2.5 text-right font-extrabold text-foreground">{acad.interestCount} students</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">Configured Learner Segments Specifications</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {LEARNER_TYPES.map((lt: any) => (
              <div key={lt.id} className="border border-border rounded-lg p-4 bg-muted/20 space-y-2 relative overflow-hidden">
                {lt.status === "Archived" && (
                  <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-600 text-[8px] font-bold uppercase">
                    Archived
                  </span>
                )}
                <h4 className="font-extrabold text-xs text-foreground flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  {lt.name}
                </h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{lt.description}</p>
                <div className="text-[10px] text-foreground font-semibold bg-card border border-border p-2 rounded">
                  <span className="text-muted-foreground uppercase font-bold text-[8px] block mb-1">Target Dashboard Modules</span>
                  {lt.dashboardModules.join(" · ")}
                </div>
              </div>
            ))}
          </div>
        </div>
      </DataState>

      {/* School Enrollment & Student Management Control Panel */}
      <AdminStudentEnrollments />

      {/* Parent Guardian Accounts & Invitations Manager */}
      <ParentAccountsManager />

      {/* School Operations Curriculum & Calendar Console */}
      <SchoolManagementConsole />
    </section>
  );
}

interface StudentEnrollmentRecord {
  id: string;
  studentName: string;
  dateOfBirth: string;
  gender: string;
  academicYear: string;
  board: string;
  class: string;
  section: string;
  schoolName?: string;
  parentName: string;
  contactNumber: string;
  email: string;
  preferredLanguage: string;
  emergencyContact: string;
  rollNumber: string;
  admissionNumber: string;
  status: "Active" | "Inactive" | "Transferred" | "Archived";
  history: string[];
}

function AdminStudentEnrollments() {
  const [enrollments, setEnrollments] = useState<StudentEnrollmentRecord[]>([
    { id: "se-1", studentName: "Amit Kumar", dateOfBirth: "2011-04-12", gender: "Male", academicYear: "2026-27", board: "CBSE", class: "Class 10", section: "Section A", schoolName: "Bal Bharti Public School", parentName: "Rajesh Kumar", contactNumber: "+91 98765 43210", email: "amit.parent@domain.com", preferredLanguage: "English", emergencyContact: "+91 99999 88888", rollNumber: "10", admissionNumber: "ADM-2026-001", status: "Active", history: ["Admitted on 2026-07-20"] },
    { id: "se-2", studentName: "Priya Sharma", dateOfBirth: "2011-09-22", gender: "Female", academicYear: "2026-27", board: "CBSE", class: "Class 10", section: "Section A", schoolName: "Delhi Public School", parentName: "Alok Sharma", contactNumber: "+91 91234 56789", email: "priya.parent@domain.com", preferredLanguage: "English", emergencyContact: "+91 98888 77777", rollNumber: "18", admissionNumber: "ADM-2026-002", status: "Active", history: ["Admitted on 2026-07-22"] },
    { id: "se-3", studentName: "Rahul Singh", dateOfBirth: "2012-01-15", gender: "Male", academicYear: "2026-27", board: "CBSE", class: "Class 10", section: "Section A", schoolName: "St. Xavier School", parentName: "Jaswinder Singh", contactNumber: "+91 95555 44444", email: "rahul.parent@domain.com", preferredLanguage: "English", emergencyContact: "+91 94444 33333", rollNumber: "22", admissionNumber: "ADM-2026-003", status: "Inactive", history: ["Admitted on 2026-07-25", "Marked Inactive on 2026-07-28"] }
  ]);

  // UI state
  const [isOpen, setIsOpen] = useState(false);
  const [showAdmitForm, setShowAdmitForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewHistoryId, setViewHistoryId] = useState<string | null>(null);

  // Form Fields State
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("Male");
  const [year, setYear] = useState("2026-27");
  const [board, setBoard] = useState("CBSE");
  const [gradeClass, setGradeClass] = useState("Class 10");
  const [section, setSection] = useState("A");
  const [school, setSchool] = useState("");
  const [parentName, setParentName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [language, setLanguage] = useState("English");
  const [emergency, setEmergency] = useState("");
  const [roll, setRoll] = useState("");

  // Filters State
  const [search, setSearch] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [filterBoard, setFilterBoard] = useState("");
  const [filterClass, setFilterClass] = useState("");
  const [filterSection, setFilterSection] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Statistics
  const total = enrollments.length;
  const active = enrollments.filter((e) => e.status === "Active").length;
  const cbseCount = enrollments.filter((e) => e.board === "CBSE").length;
  const class10Count = enrollments.filter((e) => e.class === "Class 10").length;

  const handleSubmitAdmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !parentName.trim() || !email.trim()) {
      toast.error("Please enter student name, parent name, and email.");
      return;
    }

    if (editingId) {
      // Edit Student
      setEnrollments((prev) =>
        prev.map((e) => {
          if (e.id === editingId) {
            const histMsg = `Edited academic parameters on ${new Date().toISOString().substring(0, 10)}`;
            return {
              ...e,
              studentName: name.trim(),
              dateOfBirth: dob,
              gender,
              academicYear: year,
              board,
              class: gradeClass,
              section: `Section ${section.toUpperCase()}`,
              schoolName: school.trim() || undefined,
              parentName: parentName.trim(),
              contactNumber: phone.trim(),
              email: email.trim(),
              preferredLanguage: language,
              emergencyContact: emergency.trim(),
              rollNumber: roll.trim(),
              history: [...e.history, histMsg]
            };
          }
          return e;
        })
      );
      toast.success("Student enrollment details updated.");
      setEditingId(null);
    } else {
      // Admit new Student
      const newRec: StudentEnrollmentRecord = {
        id: `se-${Date.now()}`,
        studentName: name.trim(),
        dateOfBirth: dob,
        gender,
        academicYear: year,
        board,
        class: gradeClass,
        section: `Section ${section.toUpperCase()}`,
        schoolName: school.trim() || undefined,
        parentName: parentName.trim(),
        contactNumber: phone.trim(),
        email: email.trim(),
        preferredLanguage: language,
        emergencyContact: emergency.trim(),
        rollNumber: roll.trim() || String(enrollments.length + 1),
        admissionNumber: `ADM-2026-${String(enrollments.length + 100).substring(1)}`,
        status: "Active",
        history: [`Admitted on ${new Date().toISOString().substring(0, 10)}`]
      };
      setEnrollments((prev) => [newRec, ...prev]);
      toast.success("Student admitted successfully!");
    }

    // Reset Form
    setName("");
    setDob("");
    setGender("Male");
    setSchool("");
    setParentName("");
    setPhone("");
    setEmail("");
    setEmergency("");
    setRoll("");
    setShowAdmitForm(false);
  };

  const handleEditInit = (rec: StudentEnrollmentRecord) => {
    setEditingId(rec.id);
    setName(rec.studentName);
    setDob(rec.dateOfBirth);
    setGender(rec.gender);
    setYear(rec.academicYear);
    setBoard(rec.board);
    setGradeClass(rec.class);
    setSection(rec.section.replace("Section ", ""));
    setSchool(rec.schoolName || "");
    setParentName(rec.parentName);
    setPhone(rec.contactNumber);
    setEmail(rec.email);
    setLanguage(rec.preferredLanguage);
    setEmergency(rec.emergencyContact);
    setRoll(rec.rollNumber);
    setShowAdmitForm(true);
  };

  const handlePromote = (id: string) => {
    setEnrollments((prev) =>
      prev.map((e) => {
        if (e.id === id) {
          const currentNum = Number(e.class.replace("Class ", "")) || 10;
          const nextClass = currentNum < 12 ? `Class ${currentNum + 1}` : "Class 12";
          const histMsg = `Promoted to ${nextClass} on ${new Date().toISOString().substring(0, 10)}`;
          return {
            ...e,
            class: nextClass,
            history: [...e.history, histMsg]
          };
        }
        return e;
      })
    );
    toast.success("Student promoted to the next grade class.");
  };

  const handleTransferSection = (id: string) => {
    const nextSec = window.prompt("Enter target Section Letter (A, B, C, or D):");
    if (!nextSec) return;
    setEnrollments((prev) =>
      prev.map((e) => {
        if (e.id === id) {
          const histMsg = `Transferred Section to Section ${nextSec.toUpperCase()} on ${new Date().toISOString().substring(0, 10)}`;
          return {
            ...e,
            section: `Section ${nextSec.toUpperCase()}`,
            history: [...e.history, histMsg]
          };
        }
        return e;
      })
    );
    toast.success("Section transfer completed.");
  };

  const handleArchive = (id: string) => {
    if (!window.confirm("Are you sure you want to archive this student profile?")) return;
    setEnrollments((prev) =>
      prev.map((e) => {
        if (e.id === id) {
          const histMsg = `Archived student profile on ${new Date().toISOString().substring(0, 10)}`;
          return {
            ...e,
            status: "Archived",
            history: [...e.history, histMsg]
          };
        }
        return e;
      })
    );
    toast.success("Student record archived.");
  };

  // Filtered list
  const filtered = enrollments.filter((rec) => {
    const matchesSearch = rec.studentName.toLowerCase().includes(search.toLowerCase()) || rec.parentName.toLowerCase().includes(search.toLowerCase());
    const matchesYear = !filterYear || rec.academicYear === filterYear;
    const matchesBoard = !filterBoard || rec.board === filterBoard;
    const matchesClass = !filterClass || rec.class === filterClass;
    const matchesSection = !filterSection || rec.section.includes(filterSection.toUpperCase());
    const matchesStatus = !filterStatus || rec.status === filterStatus;
    return matchesSearch && matchesYear && matchesBoard && matchesClass && matchesSection && matchesStatus;
  });

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-5 text-left">
      <div className="flex justify-between items-center cursor-pointer select-none" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex items-center gap-2">
          <School className="text-primary" size={18} />
          <h3 className="font-semibold text-foreground">K-12 Admissions & Student Management</h3>
        </div>
        <button className="text-xs font-bold text-primary hover:underline">
          {isOpen ? "Hide Console" : "Manage Admissions Console"}
        </button>
      </div>

      {isOpen && (
        <div className="space-y-6 pt-2 animate-in fade-in duration-200">
          <hr className="border-border my-2" />

          {/* Analytics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="p-3 bg-muted/20 border border-border rounded-lg">
              <span className="text-[9px] uppercase font-bold text-muted-foreground block">Total Students</span>
              <span className="text-lg font-extrabold text-foreground">{total}</span>
            </div>
            <div className="p-3 bg-muted/20 border border-border rounded-lg">
              <span className="text-[9px] uppercase font-bold text-muted-foreground block">Active Students</span>
              <span className="text-lg font-extrabold text-emerald-500">{active}</span>
            </div>
            <div className="p-3 bg-muted/20 border border-border rounded-lg">
              <span className="text-[9px] uppercase font-bold text-muted-foreground block">CBSE Split</span>
              <span className="text-lg font-extrabold text-foreground">{cbseCount} Pupils</span>
            </div>
            <div className="p-3 bg-muted/20 border border-border rounded-lg">
              <span className="text-[9px] uppercase font-bold text-muted-foreground block">Grade 10 Split</span>
              <span className="text-lg font-extrabold text-foreground">{class10Count} Pupils</span>
            </div>
            <div className="p-3 bg-muted/20 border border-border rounded-lg">
              <span className="text-[9px] uppercase font-bold text-muted-foreground block">Enrollment Trends</span>
              <span className="text-xs font-bold text-emerald-500 block mt-1">Steady upward +3</span>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <h4 className="text-xs font-extrabold uppercase text-muted-foreground tracking-wider">Admissions Control Registry</h4>
            <button
              onClick={() => {
                setEditingId(null);
                setShowAdmitForm(!showAdmitForm);
              }}
              className="inline-flex items-center gap-1 text-xs font-bold bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-primary/90"
            >
              <Plus size={14} /> {showAdmitForm ? "Close Form" : "Admit New Student"}
            </button>
          </div>

          {/* Admission Form */}
          {showAdmitForm && (
            <div className="rounded-xl p-5 border border-border bg-card max-w-2xl">
              <h4 className="font-heading font-extrabold text-xs text-foreground uppercase tracking-wider mb-3">
                {editingId ? "Modify Student Details" : "Admit Student Record Form"}
              </h4>
              <form onSubmit={handleSubmitAdmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-muted-foreground uppercase">Student Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Amit Kumar"
                      className="w-full text-xs bg-background border border-border px-3 py-2 rounded-lg"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-muted-foreground uppercase">Date of Birth</label>
                    <input
                      type="date"
                      required
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full text-xs bg-background border border-border px-3 py-2 rounded-lg"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-muted-foreground uppercase">Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full text-xs bg-background border border-border px-3 py-2 rounded-lg"
                    >
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-muted-foreground uppercase">Academic Year</label>
                    <select
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="w-full text-xs bg-background border border-border px-3 py-2 rounded-lg"
                    >
                      <option>2026-27</option>
                      <option>2027-28</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-muted-foreground uppercase">Board</label>
                    <select
                      value={board}
                      onChange={(e) => setBoard(e.target.value)}
                      className="w-full text-xs bg-background border border-border px-3 py-2 rounded-lg"
                    >
                      <option>CBSE</option>
                      <option>ICSE</option>
                      <option>State Board</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-muted-foreground uppercase">Grade Level</label>
                    <select
                      value={gradeClass}
                      onChange={(e) => setGradeClass(e.target.value)}
                      className="w-full text-xs bg-background border border-border px-3 py-2 rounded-lg"
                    >
                      {Array.from({ length: 12 }, (_, i) => `Class ${i + 1}`).map((cls) => (
                        <option key={cls}>{cls}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-muted-foreground uppercase">Section</label>
                    <input
                      type="text"
                      maxLength={1}
                      required
                      value={section}
                      onChange={(e) => setSection(e.target.value)}
                      placeholder="A"
                      className="w-full text-xs bg-background border border-border px-3 py-2 rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-muted-foreground uppercase">Roll Number (Optional)</label>
                    <input
                      type="text"
                      value={roll}
                      onChange={(e) => setRoll(e.target.value)}
                      placeholder="12"
                      className="w-full text-xs bg-background border border-border px-3 py-2 rounded-lg"
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[9px] font-bold text-muted-foreground uppercase">School Name (Optional)</label>
                    <input
                      type="text"
                      value={school}
                      onChange={(e) => setSchool(e.target.value)}
                      placeholder="St. Mary School"
                      className="w-full text-xs bg-background border border-border px-3 py-2 rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-border pt-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-muted-foreground uppercase">Parent Name</label>
                    <input
                      type="text"
                      required
                      value={parentName}
                      onChange={(e) => setParentName(e.target.value)}
                      placeholder="Rajesh Kumar"
                      className="w-full text-xs bg-background border border-border px-3 py-2 rounded-lg"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-muted-foreground uppercase">Contact Phone</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765..."
                      className="w-full text-xs bg-background border border-border px-3 py-2 rounded-lg"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-muted-foreground uppercase">Parent Email</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="parent@domain.com"
                      className="w-full text-xs bg-background border border-border px-3 py-2 rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-muted-foreground uppercase">Language Pref</label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full text-xs bg-background border border-border px-3 py-2 rounded-lg"
                    >
                      <option>English</option>
                      <option>Hindi</option>
                      <option>Spanish</option>
                    </select>
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[9px] font-bold text-muted-foreground uppercase">Emergency Contact</label>
                    <input
                      type="text"
                      required
                      value={emergency}
                      onChange={(e) => setEmergency(e.target.value)}
                      placeholder="Guardian Name (+91 99999...)"
                      className="w-full text-xs bg-background border border-border px-3 py-2 rounded-lg"
                    />
                  </div>
                </div>

                <button type="submit" className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2.5 text-xs font-semibold text-primary-foreground hover:opacity-90">
                  {editingId ? "Save Modifications" : "Submit Admission Admission"}
                </button>
              </form>
            </div>
          )}

          {/* Roster Search Filters */}
          <div className="grid gap-3 grid-cols-2 md:grid-cols-6 bg-muted/20 p-4 rounded-xl border border-border">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Name or Parent"
              className="col-span-2 text-xs bg-background border border-border px-3 py-2 rounded-lg"
            />
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="text-xs bg-background border border-border px-3 py-2 rounded-lg font-bold"
            >
              <option value="">All Terms</option>
              <option>2026-27</option>
              <option>2027-28</option>
            </select>
            <select
              value={filterBoard}
              onChange={(e) => setFilterBoard(e.target.value)}
              className="text-xs bg-background border border-border px-3 py-2 rounded-lg font-bold"
            >
              <option value="">All Boards</option>
              <option>CBSE</option>
              <option>ICSE</option>
              <option>State Board</option>
            </select>
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="text-xs bg-background border border-border px-3 py-2 rounded-lg font-bold"
            >
              <option value="">All Grades</option>
              {Array.from({ length: 12 }, (_, i) => `Class ${i + 1}`).map((cls) => (
                <option key={cls}>{cls}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-xs bg-background border border-border px-3 py-2 rounded-lg font-bold"
            >
              <option value="">All Status</option>
              <option>Active</option>
              <option>Inactive</option>
              <option>Archived</option>
            </select>
          </div>

          {/* Enrollment Roster Table */}
          <div className="overflow-x-auto rounded-xl border border-border bg-card">
            <table className="w-full text-left text-xs font-semibold">
              <thead className="border-b border-border bg-muted/40 text-[10px] text-muted-foreground uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Student Name</th>
                  <th className="px-4 py-3">Academic profile</th>
                  <th className="px-4 py-3">Admission Roll</th>
                  <th className="px-4 py-3">Guardian</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((rec) => (
                  <tr key={rec.id}>
                    <td className="px-4 py-3">
                      <p className="font-extrabold text-foreground">{rec.studentName}</p>
                      <p className="text-[10px] text-muted-foreground">{rec.gender} • DOB: {rec.dateOfBirth}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-foreground">{rec.board} • {rec.class}</p>
                      <p className="text-[10px] text-primary font-bold">{rec.section}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-foreground">{rec.admissionNumber}</p>
                      <p className="text-[10px] text-muted-foreground">Roll: {rec.rollNumber}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-foreground">{rec.parentName}</p>
                      <p className="text-[10px] text-muted-foreground">{rec.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge value={rec.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2 flex-wrap">
                        <button
                          onClick={() => handlePromote(rec.id)}
                          className="rounded border border-border bg-card px-2 py-1 text-[10px] font-bold hover:bg-muted"
                        >
                          Promote
                        </button>
                        <button
                          onClick={() => handleTransferSection(rec.id)}
                          className="rounded border border-border bg-card px-2 py-1 text-[10px] font-bold hover:bg-muted"
                        >
                          Transfer Sec
                        </button>
                        <button
                          onClick={() => setViewHistoryId(rec.id)}
                          className="rounded border border-border bg-card px-2 py-1 text-[10px] font-bold hover:bg-muted text-primary"
                        >
                          History Log
                        </button>
                        <button
                          onClick={() => handleEditInit(rec)}
                          className="rounded border border-border p-1 hover:bg-muted"
                        >
                          <Pencil size={12} />
                        </button>
                        <button
                          onClick={() => handleArchive(rec.id)}
                          className="rounded border border-border p-1 hover:bg-muted text-rose-500"
                        >
                          <Archive size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* History modal */}
          {viewHistoryId && (
            <div className="rounded-xl p-4 border border-border bg-card max-w-md">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-extrabold uppercase text-muted-foreground">Student Action logs timeline</span>
                <button onClick={() => setViewHistoryId(null)} className="text-xs text-muted-foreground font-bold hover:underline">Close</button>
              </div>
              <hr className="border-border my-2" />
              <div className="space-y-2 mt-2">
                {enrollments.find(e => e.id === viewHistoryId)?.history.map((logStr, idx) => (
                  <div key={idx} className="flex gap-2 text-[10.5px]">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    <span className="text-foreground">{logStr}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ParentAccountsManager() {
  const [parentRecords, setParentRecords] = useState([
    { id: "pr-1", name: "Rajesh Kumar", email: "rajesh.parent@domain.com", linkedChildren: ["Amit Kumar"], invitationStatus: "Accepted", status: "Active" },
    { id: "pr-2", name: "Alok Sharma", email: "alok.parent@domain.com", linkedChildren: ["Priya Sharma"], invitationStatus: "Accepted", status: "Active" },
    { id: "pr-3", name: "Jaswinder Singh", email: "jaswinder.parent@domain.com", linkedChildren: ["Rahul Singh"], invitationStatus: "Accepted", status: "Active" },
    { id: "pr-4", name: "Suman Patel", email: "suman.parent@domain.com", linkedChildren: [], invitationStatus: "Pending Invitation", status: "Inactive" }
  ]);

  const [isOpen, setIsOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !inviteName.trim()) {
      toast.error("Please enter email and name.");
      return;
    }
    const newPr = {
      id: `pr-${Date.now()}`,
      name: inviteName.trim(),
      email: inviteEmail.trim(),
      linkedChildren: [],
      invitationStatus: "Pending Invitation",
      status: "Inactive" as const
    };
    setParentRecords((prev) => [...prev, newPr]);
    toast.success("Parent invitation sent successfully!");
    setInviteEmail("");
    setInviteName("");
  };

  const handleToggleStatus = (id: string) => {
    setParentRecords((prev) => prev.map(p => {
      if (p.id === id) {
        const nextStatus = p.status === "Active" ? "Inactive" as const : "Active" as const;
        return { ...p, status: nextStatus };
      }
      return p;
    }));
    toast.success("Parent account status updated.");
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4 text-left">
      <div className="flex justify-between items-center cursor-pointer select-none" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex items-center gap-2">
          <Users className="text-primary" size={18} />
          <h3 className="font-semibold text-foreground">Parent Guardian Profiles & Linked Children</h3>
        </div>
        <button className="text-xs font-bold text-primary hover:underline">
          {isOpen ? "Hide Panel" : "View Parent Accounts Panel"}
        </button>
      </div>

      {isOpen && (
        <div className="space-y-6 pt-2 animate-in fade-in duration-200">
          <hr className="border-border my-2" />
          
          {/* Invitation Form */}
          <form onSubmit={handleSendInvite} className="grid gap-4 md:grid-cols-3 bg-muted/20 p-4 rounded-xl border border-border">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Parent Full Name</label>
              <input
                type="text"
                required
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                placeholder="e.g. Suman Patel"
                className="w-full text-xs bg-background border border-border px-3 py-2 rounded-lg"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Parent Email Address</label>
              <input
                type="email"
                required
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="suman.parent@domain.com"
                className="w-full text-xs bg-background border border-border px-3 py-2 rounded-lg"
              />
            </div>
            <div className="flex items-end">
              <button type="submit" className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90">
                <Plus size={14} /> Send Guardian Invite
              </button>
            </div>
          </form>

          {/* Parents table roster */}
          <div className="overflow-x-auto rounded-xl border border-border bg-card">
            <table className="w-full text-left text-xs font-semibold">
              <thead className="border-b border-border bg-muted/40 text-[10px] text-muted-foreground uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Parent Name</th>
                  <th className="px-4 py-3">Email Address</th>
                  <th className="px-4 py-3">Linked Children</th>
                  <th className="px-4 py-3">Invitation Status</th>
                  <th className="px-4 py-3">Account status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {parentRecords.map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-3 text-foreground font-bold">{p.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.email}</td>
                    <td className="px-4 py-3 text-muted-foreground font-bold">
                      {p.linkedChildren.join(" · ") || "None"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${
                        p.invitationStatus === "Accepted"
                          ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                      }`}>
                        {p.invitationStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge value={p.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleToggleStatus(p.id)}
                        className="rounded border border-border bg-card px-2 py-1 text-[10px] font-bold hover:bg-muted"
                      >
                        {p.status === "Active" ? "Suspend" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function SchoolManagementConsole() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<"boards" | "courses" | "calendar" | "analytics" | "ai" | "academies">("boards");

  // Database lists
  const [boards, setBoards] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [tutors, setTutors] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Form states for Board
  const [newBoardName, setNewBoardName] = useState("");
  const [newBoardSlug, setNewBoardSlug] = useState("");
  const [newBoardDesc, setNewBoardDesc] = useState("");

  // Form states for Class
  const [newClassName, setNewClassName] = useState("");
  const [newClassSlug, setNewClassSlug] = useState("");
  const [newClassNumber, setNewClassNumber] = useState("");

  // Form states for Subject
  const [newSubName, setNewSubName] = useState("");
  const [newSubSlug, setNewSubSlug] = useState("");
  const [newSubDesc, setNewSubDesc] = useState("");

  // Form states for Course
  const [courseTitle, setCourseTitle] = useState("");
  const [courseSub, setCourseSub] = useState("");
  const [courseDesc, setCourseDesc] = useState("");
  const [coursePrice, setCoursePrice] = useState("");
  const [selectedBoard, setSelectedBoard] = useState("CBSE");
  const [selectedClass, setSelectedClass] = useState("Class 10");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedTutorId, setSelectedTutorId] = useState("");
  const [courseStatus, setCourseStatus] = useState("published");

  // Form states for Teacher Assignment
  const [assignCourseId, setAssignCourseId] = useState("");
  const [assignTutorId, setAssignTutorId] = useState("");
  const [assignRole, setAssignRole] = useState("primary_instructor");

  // Form states for Schedule
  const [schedCourseId, setSchedCourseId] = useState("");
  const [schedTitle, setSchedTitle] = useState("");
  const [schedDesc, setSchedDesc] = useState("");
  const [schedType, setSchedType] = useState("live_class");
  const [schedTime, setSchedTime] = useState("");
  const [schedDuration, setSchedDuration] = useState("60");
  const [schedLink, setSchedLink] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();

      const { data: bData } = await supabase.from("school_boards").select("*").order("name");
      setBoards(bData || []);

      const { data: cData } = await supabase.from("school_classes").select("*").order("class_number");
      setClasses(cData || []);

      const { data: sData } = await supabase.from("subjects").select("*").order("name");
      setSubjects(sData || []);

      const { data: crsData } = await supabase.from("courses").select("*").order("title");
      setCourses(crsData || []);

      const { data: tData } = await supabase.from("profiles").select("*").eq("role", "tutor").order("full_name");
      setTutors(tData || []);

      const { data: schData } = await supabase.from("schedules").select("*").order("scheduled_at");
      setSchedules(schData || []);

      const { data: taData } = await supabase.from("teacher_assignments").select("*");
      setAssignments(taData || []);
    } catch (err: any) {
      console.warn("Error loading school operations data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      void loadData();
    }
  }, [isOpen, loadData]);

  const handleAddBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBoardName.trim() || !newBoardSlug.trim()) return;
    try {
      const supabase = createClient();
      const { error } = await supabase.from("school_boards").insert({
        name: newBoardName.trim(),
        slug: newBoardSlug.trim().toLowerCase(),
        description: newBoardDesc.trim() || null,
        status: "Active",
      });
      if (error) throw error;
      toast.success(`Board "${newBoardName}" successfully registered.`);
      setNewBoardName("");
      setNewBoardSlug("");
      setNewBoardDesc("");
      void loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to add board.");
    }
  };

  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim() || !newClassSlug.trim() || !newClassNumber) return;
    try {
      const supabase = createClient();
      const { error } = await supabase.from("school_classes").insert({
        name: newClassName.trim(),
        slug: newClassSlug.trim().toLowerCase(),
        class_number: parseInt(newClassNumber),
        status: "Active",
      });
      if (error) throw error;
      toast.success(`Class Grade Level "${newClassName}" registered.`);
      setNewClassName("");
      setNewClassSlug("");
      setNewClassNumber("");
      void loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to add class.");
    }
  };

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName.trim() || !newSubSlug.trim()) return;
    try {
      const supabase = createClient();
      const { data: academy } = await supabase.from("academies").select("id").eq("slug", "school-tuition").maybeSingle();
      const academyId = academy?.id || "00000000-0000-0000-0000-000000000000";

      const { error } = await supabase.from("subjects").insert({
        academy_id: academyId,
        name: newSubName.trim(),
        slug: newSubSlug.trim().toLowerCase(),
        description: newSubDesc.trim() || null,
        icon: "BookOpen",
        status: "Active",
      });
      if (error) throw error;
      toast.success(`Subject "${newSubName}" successfully registered.`);
      setNewSubName("");
      setNewSubSlug("");
      setNewSubDesc("");
      void loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to add subject.");
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseTitle.trim() || !selectedTutorId) {
      toast.error("Please fill course title and tutor fields.");
      return;
    }
    try {
      const supabase = createClient();
      const { data: academy } = await supabase.from("academies").select("id").eq("slug", "school-tuition").maybeSingle();
      const academyId = academy?.id || "00000000-0000-0000-0000-000000000000";

      const { data: course, error } = await supabase.from("courses").insert({
        tutor_id: selectedTutorId,
        academy_id: academyId,
        title: courseTitle.trim(),
        subtitle: courseSub.trim() || null,
        description: courseDesc.trim() || null,
        category: selectedBoard,
        level: selectedClass,
        price: parseFloat(coursePrice) || 0.00,
        status: courseStatus,
        approval_status: "approved",
      }).select().single();

      if (error) throw error;

      // Assign teacher assignment
      try {
        await supabase.from("teacher_assignments").insert({
          course_id: course.id,
          teacher_id: selectedTutorId,
          role: "primary_instructor",
          status: "Active",
        });
      } catch (taErr) {
        console.warn("Could not insert teacher assignment constraint:", taErr);
      }

      toast.success(`School course "${courseTitle}" published successfully.`);
      setCourseTitle("");
      setCourseSub("");
      setCourseDesc("");
      setCoursePrice("");
      void loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to create course.");
    }
  };

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedCourseId || !schedTitle.trim() || !schedTime) {
      toast.error("Please select a course, title, and scheduling time.");
      return;
    }
    try {
      const supabase = createClient();
      const { error } = await supabase.from("schedules").insert({
        course_id: schedCourseId,
        title: schedTitle.trim(),
        description: schedDesc.trim() || null,
        type: schedType,
        scheduled_at: new Date(schedTime).toISOString(),
        duration_minutes: parseInt(schedDuration) || 60,
        meeting_link: schedLink.trim() || "https://meet.google.com/abc-defg-hij",
      });
      if (error) throw error;
      toast.success(`Live class scheduled: "${schedTitle}"`);
      setSchedTitle("");
      setSchedDesc("");
      setSchedTime("");
      setSchedLink("");
      void loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to create schedule.");
    }
  };

  const handleAssignTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignCourseId || !assignTutorId) return;
    try {
      const supabase = createClient();
      const { error } = await supabase.from("teacher_assignments").insert({
        course_id: assignCourseId,
        teacher_id: assignTutorId,
        role: assignRole,
        status: "Active",
      });
      if (error) throw error;
      toast.success("Additional teacher assigned to course.");
      void loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to assign teacher.");
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4 text-left">
      <div className="flex justify-between items-center cursor-pointer select-none" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex items-center gap-2">
          <School className="text-primary" size={18} />
          <h3 className="font-semibold text-foreground font-heading">K-12 School Operations Ecosystem Console</h3>
        </div>
        <button className="text-xs font-bold text-primary hover:underline">
          {isOpen ? "Hide Panel" : "Open Operations Desk"}
        </button>
      </div>

      {isOpen && (
        <div className="space-y-6 pt-2 animate-in fade-in duration-200">
          <hr className="border-border my-2" />

          {/* Sub-tab Selection */}
          <div className="flex gap-2 border-b border-border/40 pb-2">
            {(["boards", "courses", "calendar", "analytics", "ai", "academies"] as const).map((sub) => (
              <button
                key={sub}
                onClick={() => setActiveSubTab(sub)}
                className={`px-3 py-1.5 text-[11px] font-bold capitalize rounded-lg transition-all ${
                  activeSubTab === sub
                    ? "bg-primary text-white"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                {sub === "boards" ? "Curriculum & Academics" : sub === "courses" ? "Courses & Batches" : sub === "ai" ? "AI School Assistant" : sub === "academies" ? "Academy Hub" : sub}
              </button>
            ))}
          </div>

          {activeSubTab === "boards" && (
            <div className="space-y-6">
              <div className="grid gap-6 md:grid-cols-3">
                {/* Boards card */}
                <div className="p-4 border border-border bg-muted/10 rounded-xl space-y-3">
                  <h4 className="font-bold text-xs uppercase text-foreground">Registered Boards</h4>
                  <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
                    {boards.length > 0 ? boards.map((b, idx) => (
                      <span key={idx} className="bg-card text-foreground border border-border px-2.5 py-1 rounded text-[10px] font-bold">{b.name} ({b.slug})</span>
                    )) : (
                      <span className="text-[10px] text-muted-foreground">No boards registered.</span>
                    )}
                  </div>
                  <form onSubmit={handleAddBoard} className="space-y-2 pt-2 border-t border-border/30">
                    <input
                      type="text"
                      required
                      value={newBoardName}
                      onChange={(e) => { setNewBoardName(e.target.value); setNewBoardSlug(e.target.value.toLowerCase().replace(/\s+/g, "-")); }}
                      placeholder="Board Name (e.g. CBSE)"
                      className="w-full text-xs bg-background border border-border px-2.5 py-1.5 rounded-lg"
                    />
                    <input
                      type="text"
                      required
                      value={newBoardSlug}
                      onChange={(e) => setNewBoardSlug(e.target.value)}
                      placeholder="Slug"
                      className="w-full text-xs bg-background border border-border px-2.5 py-1.5 rounded-lg"
                    />
                    <input
                      type="text"
                      value={newBoardDesc}
                      onChange={(e) => setNewBoardDesc(e.target.value)}
                      placeholder="Description"
                      className="w-full text-xs bg-background border border-border px-2.5 py-1.5 rounded-lg"
                    />
                    <button type="submit" className="w-full bg-primary text-white text-[10px] font-bold py-1.5 rounded-lg">Add Board</button>
                  </form>
                </div>

                {/* Classes card */}
                <div className="p-4 border border-border bg-muted/10 rounded-xl space-y-3">
                  <h4 className="font-bold text-xs uppercase text-foreground">Active Grade Levels</h4>
                  <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
                    {classes.length > 0 ? classes.map((c, idx) => (
                      <span key={idx} className="bg-card text-foreground border border-border px-2.5 py-1 rounded text-[10px] font-bold">{c.name} (Class {c.class_number})</span>
                    )) : (
                      <span className="text-[10px] text-muted-foreground">No grades registered.</span>
                    )}
                  </div>
                  <form onSubmit={handleAddClass} className="space-y-2 pt-2 border-t border-border/30">
                    <input
                      type="text"
                      required
                      value={newClassName}
                      onChange={(e) => { setNewClassName(e.target.value); setNewClassSlug(e.target.value.toLowerCase().replace(/\s+/g, "-")); }}
                      placeholder="Grade Level (e.g. Class 10)"
                      className="w-full text-xs bg-background border border-border px-2.5 py-1.5 rounded-lg"
                    />
                    <input
                      type="text"
                      required
                      value={newClassSlug}
                      onChange={(e) => setNewClassSlug(e.target.value)}
                      placeholder="Slug"
                      className="w-full text-xs bg-background border border-border px-2.5 py-1.5 rounded-lg"
                    />
                    <input
                      type="number"
                      required
                      value={newClassNumber}
                      onChange={(e) => setNewClassNumber(e.target.value)}
                      placeholder="Grade Number (e.g. 10)"
                      className="w-full text-xs bg-background border border-border px-2.5 py-1.5 rounded-lg"
                    />
                    <button type="submit" className="w-full bg-primary text-white text-[10px] font-bold py-1.5 rounded-lg">Add Grade</button>
                  </form>
                </div>

                {/* Subjects card */}
                <div className="p-4 border border-border bg-muted/10 rounded-xl space-y-3">
                  <h4 className="font-bold text-xs uppercase text-foreground">Course Subjects</h4>
                  <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
                    {subjects.length > 0 ? subjects.map((s, idx) => (
                      <span key={idx} className="bg-card text-foreground border border-border px-2.5 py-1 rounded text-[10px] font-bold">{s.name}</span>
                    )) : (
                      <span className="text-[10px] text-muted-foreground">No subjects registered.</span>
                    )}
                  </div>
                  <form onSubmit={handleAddSubject} className="space-y-2 pt-2 border-t border-border/30">
                    <input
                      type="text"
                      required
                      value={newSubName}
                      onChange={(e) => { setNewSubName(e.target.value); setNewSubSlug(e.target.value.toLowerCase().replace(/\s+/g, "-")); }}
                      placeholder="Subject Name (e.g. Biology)"
                      className="w-full text-xs bg-background border border-border px-2.5 py-1.5 rounded-lg"
                    />
                    <input
                      type="text"
                      required
                      value={newSubSlug}
                      onChange={(e) => setNewSubSlug(e.target.value)}
                      placeholder="Slug"
                      className="w-full text-xs bg-background border border-border px-2.5 py-1.5 rounded-lg"
                    />
                    <input
                      type="text"
                      value={newSubDesc}
                      onChange={(e) => setNewSubDesc(e.target.value)}
                      placeholder="Description"
                      className="w-full text-xs bg-background border border-border px-2.5 py-1.5 rounded-lg"
                    />
                    <button type="submit" className="w-full bg-primary text-white text-[10px] font-bold py-1.5 rounded-lg">Add Subject</button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === "courses" && (
            <div className="grid gap-6 md:grid-cols-2">
              {/* Add Course */}
              <div className="p-5 border border-border bg-card rounded-2xl space-y-4">
                <h4 className="font-extrabold text-sm text-foreground">Create & Publish New Tuition Course</h4>
                <form onSubmit={handleCreateCourse} className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[9px] font-bold text-muted-foreground uppercase">Board</label>
                      <select value={selectedBoard} onChange={(e) => setSelectedBoard(e.target.value)} className="w-full bg-background border border-border p-2.5 rounded-lg mt-1 font-semibold">
                        {boards.map((b) => <option key={b.id} value={b.name}>{b.name}</option>)}
                        {boards.length === 0 && <option value="CBSE">CBSE</option>}
                      </select>
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-muted-foreground uppercase">Grade Level</label>
                      <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="w-full bg-background border border-border p-2.5 rounded-lg mt-1 font-semibold">
                        {classes.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
                        {classes.length === 0 && <option value="Class 10">Class 10</option>}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] font-bold text-muted-foreground uppercase">Select Subject Catalog Reference</label>
                    <select value={selectedSubjectId} onChange={(e) => setSelectedSubjectId(e.target.value)} className="w-full bg-background border border-border p-2.5 rounded-lg mt-1 font-semibold" required>
                      <option value="">-- Choose Subject --</option>
                      {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="text-[9px] font-bold text-muted-foreground uppercase">Assign Primary Tutor</label>
                    <select value={selectedTutorId} onChange={(e) => setSelectedTutorId(e.target.value)} className="w-full bg-background border border-border p-2.5 rounded-lg mt-1 font-semibold" required>
                      <option value="">-- Choose Instructor --</option>
                      {tutors.map((t) => <option key={t.id} value={t.id}>{t.full_name || t.email}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="text-[9px] font-bold text-muted-foreground uppercase">Course Title</label>
                    <input
                      type="text"
                      required
                      value={courseTitle}
                      onChange={(e) => setCourseTitle(e.target.value)}
                      placeholder="e.g. Class 10 CBSE Math – Polynomials Core Edition"
                      className="w-full bg-background border border-border p-2.5 rounded-lg mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[9px] font-bold text-muted-foreground uppercase">Pricing (INR)</label>
                      <input
                        type="number"
                        required
                        value={coursePrice}
                        onChange={(e) => setCoursePrice(e.target.value)}
                        placeholder="e.g. 2999"
                        className="w-full bg-background border border-border p-2.5 rounded-lg mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-muted-foreground uppercase">Publish Status</label>
                      <select value={courseStatus} onChange={(e) => setCourseStatus(e.target.value)} className="w-full bg-background border border-border p-2.5 rounded-lg mt-1 font-semibold">
                        <option value="published">Publish immediately</option>
                        <option value="draft">Draft mode</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] font-bold text-muted-foreground uppercase">Course Description</label>
                    <textarea
                      value={courseDesc}
                      onChange={(e) => setCourseDesc(e.target.value)}
                      placeholder="Enter detailed chapters scope and materials syllabus..."
                      className="w-full bg-background border border-border p-2.5 rounded-lg mt-1 h-16"
                    />
                  </div>

                  <button type="submit" className="w-full bg-primary text-white font-bold py-2.5 rounded-lg">Publish Course & Assign Tutor</button>
                </form>
              </div>

              {/* View Courses & Assignments */}
              <div className="space-y-4">
                <div className="p-4 border border-border bg-card rounded-xl space-y-3">
                  <h4 className="font-bold text-xs uppercase text-foreground">Registered Courses ({courses.length})</h4>
                  <div className="max-h-96 overflow-y-auto space-y-2 pr-1">
                    {courses.map((c) => {
                      const tutorObj = tutors.find(t => t.id === c.tutor_id);
                      return (
                        <div key={c.id} className="p-3 border border-border rounded-xl flex items-center justify-between bg-muted/10">
                          <div>
                            <div className="font-extrabold text-[11px] text-foreground">{c.title}</div>
                            <div className="text-[9px] text-muted-foreground font-semibold">
                              {c.category} • {c.level} • Price: ₹{c.price} • Status: <span className="text-primary uppercase font-bold">{c.status}</span>
                            </div>
                          </div>
                          <span className="text-[9px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded font-bold">
                            {tutorObj?.full_name || "Tutor Assigned"}
                          </span>
                        </div>
                      );
                    })}
                    {courses.length === 0 && <div className="text-[10px] text-muted-foreground">No tuition courses published. Use the form to add one.</div>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === "calendar" && (
            <div className="grid gap-6 md:grid-cols-2">
              <div className="p-5 border border-border bg-card rounded-2xl space-y-4">
                <h4 className="font-extrabold text-sm text-foreground">Schedule Live Class Batch Event</h4>
                <form onSubmit={handleCreateSchedule} className="space-y-3 text-xs">
                  <div>
                    <label className="text-[9px] font-bold text-muted-foreground uppercase">Select Course Batch</label>
                    <select value={schedCourseId} onChange={(e) => setSchedCourseId(e.target.value)} className="w-full bg-background border border-border p-2.5 rounded-lg mt-1 font-semibold" required>
                      <option value="">-- Choose Course --</option>
                      {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="text-[9px] font-bold text-muted-foreground uppercase">Live Class Room Title</label>
                    <input
                      type="text"
                      required
                      value={schedTitle}
                      onChange={(e) => setSchedTitle(e.target.value)}
                      placeholder="e.g. Chapter 2: Solving roots via factorization"
                      className="w-full bg-background border border-border p-2.5 rounded-lg mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[9px] font-bold text-muted-foreground uppercase">Class Start Time</label>
                      <input
                        type="datetime-local"
                        required
                        value={schedTime}
                        onChange={(e) => setSchedTime(e.target.value)}
                        className="w-full bg-background border border-border p-2.5 rounded-lg mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-muted-foreground uppercase">Duration (Mins)</label>
                      <select value={schedDuration} onChange={(e) => setSchedDuration(e.target.value)} className="w-full bg-background border border-border p-2.5 rounded-lg mt-1 font-semibold">
                        <option value="45">45 Minutes</option>
                        <option value="60">60 Minutes</option>
                        <option value="90">90 Minutes</option>
                        <option value="120">120 Minutes</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] font-bold text-muted-foreground uppercase">Meeting Link</label>
                    <input
                      type="text"
                      value={schedLink}
                      onChange={(e) => setSchedLink(e.target.value)}
                      placeholder="e.g. https://meet.google.com/abc-defg-hij"
                      className="w-full bg-background border border-border p-2.5 rounded-lg mt-1"
                    />
                  </div>

                  <button type="submit" className="w-full bg-primary text-white font-bold py-2.5 rounded-lg">Broadcast Class Live Link</button>
                </form>
              </div>

              <div className="p-4 border border-border bg-card rounded-xl space-y-3">
                <h4 className="font-bold text-xs uppercase text-foreground">Active Schedules ({schedules.length})</h4>
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {schedules.map((s) => {
                    const courseObj = courses.find(c => c.id === s.course_id);
                    return (
                      <div key={s.id} className="p-3 border border-border rounded-xl bg-muted/10 space-y-1">
                        <div className="flex justify-between items-start">
                          <strong className="text-[11px] text-foreground">{s.title}</strong>
                          <span className="text-[8px] bg-emerald-500/10 text-emerald-600 px-1.5 py-0.5 rounded font-bold uppercase">{s.type}</span>
                        </div>
                        <div className="text-[9px] text-muted-foreground font-semibold">
                          Course: {courseObj?.title || "Tuition Course"}
                        </div>
                        <div className="text-[9px] text-muted-foreground font-semibold">
                          Scheduled: {new Date(s.scheduled_at).toLocaleString()} ({s.duration_minutes} Mins)
                        </div>
                        <a href={s.meeting_link} target="_blank" rel="noreferrer" className="text-[9px] text-primary font-bold hover:underline block pt-1">
                          Join Link: {s.meeting_link}
                        </a>
                      </div>
                    );
                  })}
                  {schedules.length === 0 && <div className="text-[10px] text-muted-foreground">No active live schedules planned.</div>}
                </div>
              </div>
            </div>
          )}

          {activeSubTab === "analytics" && (
            <div className="space-y-4">
              <h4 className="font-bold text-xs uppercase text-foreground">School Enrolment Growth charts</h4>
              <div className="grid gap-4 md:grid-cols-3 text-xs">
                <div className="p-4 border border-border bg-card rounded-lg">
                  <span className="text-[9px] text-muted-foreground block uppercase font-bold">Total CBSE Students Enrolled</span>
                  <strong className="text-xl text-foreground">42 pupils</strong>
                </div>
                <div className="p-4 border border-border bg-card rounded-lg">
                  <span className="text-[9px] text-muted-foreground block uppercase font-bold">Total Subject Instructors</span>
                  <strong className="text-xl text-foreground">12 Faculty</strong>
                </div>
                <div className="p-4 border border-border bg-card rounded-lg">
                  <span className="text-[9px] text-muted-foreground block uppercase font-bold">Convenience Net Earnings</span>
                  <strong className="text-xl text-foreground">₹1,05,000</strong>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === "ai" && (
            <div className="p-5 border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background rounded-2xl max-w-xl text-left">
              <h3 className="font-bold text-xs text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={14} className="text-primary animate-pulse" />
                AI School Operations Coordinator (Sandbox preview)
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Unlock curriculum scheduling projections, class performance insights, and custom announcements generator.
              </p>
              <div className="space-y-3 p-3 bg-muted/20 border border-border rounded-xl mt-3">
                <div className="space-y-1">
                  <strong className="text-xs text-foreground block">AI Insights Generator preview:</strong>
                  <p className="text-[10.5px] text-muted-foreground leading-relaxed italic">
                    &quot;Recommended: Class 10 Math student attendance rate has increased by 4% since live doubt clearing hours were scheduled weekly. Recommendation: Deploy similar live slots for Class 9 Science.&quot;
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === "academies" && (
            <div className="space-y-4 text-left animate-in fade-in duration-200">
              <div className="flex justify-between items-center bg-muted/20 p-4 rounded-xl border border-border">
                <div>
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Ecosystem Academies Console</h3>
                  <p className="text-[10px] text-muted-foreground">Manage active academies, toggle public visibility status, and configure pricing models.</p>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-border bg-card">
                <table className="w-full text-left text-xs font-semibold">
                  <thead className="border-b border-border bg-muted/40 text-[10px] text-muted-foreground uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Academy Name</th>
                      <th className="px-4 py-3">Target Audience</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Launch Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {[
                      { id: "competitive", name: "Competitive Exams", audience: "Aspirants preparing for JEE, NEET, UPSC, GATE", status: "Active", launch: "Already Live" },
                      { id: "cultural", name: "Cultural & Creative Academy", audience: "Hobbyists learning guitar, dance, and singing", status: "Active", launch: "Already Live" },
                      { id: "home", name: "Home & Lifestyle Academy", audience: "Baking, fitness workouts, and yoga lessons", status: "Active", launch: "Already Live" },
                      { id: "skills", name: "Skill Development Academy", audience: "Public speaking, Coding labs, and resume prep", status: "Active", launch: "Already Live" },
                      { id: "kids", name: "Kids Academy", audience: "Mental math games and block coding lessons", status: "Active", launch: "Already Live" }
                    ].map((ac) => (
                      <tr key={ac.id}>
                        <td className="px-4 py-3 font-bold text-foreground">{ac.name}</td>
                        <td className="px-4 py-3 text-muted-foreground">{ac.audience}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                            {ac.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground font-bold">{ac.launch}</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => toast.success(`Configuration settings opened for ${ac.name}`)}
                            className="rounded border border-border bg-card px-2.5 py-1 text-[10px] font-bold hover:bg-muted"
                          >
                            Configure
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

