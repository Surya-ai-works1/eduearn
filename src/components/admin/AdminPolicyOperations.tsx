"use client";

import React, { useState, useEffect, useCallback } from "react";
import { PolicyService, Policy, PolicyLog, DEFAULT_SEED_POLICIES } from "@/features/policies/services/policyService";
import { toast } from "sonner";
import { 
  Scale, 
  Plus, 
  Edit, 
  Trash, 
  Search, 
  Filter, 
  Check, 
  Eye, 
  Globe, 
  History, 
  ShieldCheck, 
  RefreshCw, 
  Calendar,
  EyeOff
} from "lucide-react";
import { Card } from "../ui/card";

export default function AdminPolicyOperations() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [auditLogs, setAuditLogs] = useState<PolicyLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [activeTab, setActiveTab] = useState<"documents" | "logs">("documents");

  // Form & Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Global");
  const [version, setVersion] = useState("1.0");
  const [effectiveDate, setEffectiveDate] = useState("");
  const [publishedStatus, setPublishedStatus] = useState<Policy["published_status"]>("published");
  const [applicableRoles, setApplicableRoles] = useState<string[]>([]);
  const [applicableAcademies, setApplicableAcademies] = useState<string[]>([]);
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterAcademy, setFilterAcademy] = useState("all");
  const [previewSlug, setPreviewSlug] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const pData = await PolicyService.getPolicies();
      setPolicies(pData || []);

      const logs = await PolicyService.getAuditLogs();
      setAuditLogs(logs || []);
    } catch (err: any) {
      toast.error("Failed to load policies database sync.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleOpenCreate = () => {
    setIsEditing(true);
    setSelectedPolicy(null);
    setTitle("");
    setSlug("");
    setContent("");
    setCategory("Global");
    setVersion("1.0");
    setEffectiveDate(new Date().toISOString().substring(0, 16));
    setPublishedStatus("published");
    setApplicableRoles([]);
    setApplicableAcademies([]);
    setSeoTitle("");
    setSeoDescription("");
  };

  const handleOpenEdit = (p: Policy) => {
    setIsEditing(true);
    setSelectedPolicy(p);
    setTitle(p.title);
    setSlug(p.slug);
    setContent(p.content);
    setCategory(p.category);
    setVersion(p.version);
    setEffectiveDate(new Date(p.effective_date).toISOString().substring(0, 16));
    setPublishedStatus(p.published_status);
    setApplicableRoles(p.applicable_roles || []);
    setApplicableAcademies(p.applicable_academies || []);
    setSeoTitle(p.seo_title || "");
    setSeoDescription(p.seo_description || "");
  };

  const handleSavePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !slug.trim() || !content.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setBusy(true);
    try {
      const payload: Policy = {
        id: selectedPolicy?.id,
        title: title.trim(),
        slug: slug.trim().toLowerCase(),
        content: content.trim(),
        category,
        version,
        effective_date: new Date(effectiveDate || Date.now()).toISOString(),
        last_updated: new Date().toISOString(),
        published_status: publishedStatus,
        applicable_roles: applicableRoles,
        applicable_academies: applicableAcademies,
        seo_title: seoTitle.trim() || undefined,
        seo_description: seoDescription.trim() || undefined
      };

      await PolicyService.savePolicy(payload, "admin@eduearn.com");
      toast.success(`Policy "${title}" saved successfully.`);
      setIsEditing(false);
      void loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to save policy.");
    } finally {
      setBusy(false);
    }
  };

  const handleDeletePolicy = async (policySlug: string) => {
    if (!window.confirm("Archive this policy permanently? This removes active client views.")) return;
    try {
      await PolicyService.deletePolicy(policySlug, "admin@eduearn.com");
      toast.success("Policy archived successfully.");
      void loadData();
    } catch (err: any) {
      toast.error("Failed to archive policy.");
    }
  };

  const toggleRole = (role: string) => {
    setApplicableRoles(prev => 
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
  };

  const toggleAcademy = (acad: string) => {
    setApplicableAcademies(prev => 
      prev.includes(acad) ? prev.filter(a => a !== acad) : [...prev, acad]
    );
  };

  const filteredPolicies = policies.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.slug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === "all" || (p.applicable_roles || []).includes(filterRole);
    const matchesAcademy = filterAcademy === "all" || (p.applicable_academies || []).includes(filterAcademy);
    return matchesSearch && matchesRole && matchesAcademy;
  });

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-primary">Governance operations</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight">Legal &amp; Policy Compliance Center</h2>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            Manage global and role-specific compliance disclosures, terms of service, AI usage consent, child safety, and audit logs.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadData}
            disabled={loading}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 text-xs font-semibold hover:bg-muted"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
          {!isEditing && (
            <button
              onClick={handleOpenCreate}
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground hover:opacity-90"
            >
              <Plus size={14} /> Create Policy
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => { setActiveTab("documents"); setIsEditing(false); }}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 -mb-[2px] transition-all ${
            activeTab === "documents"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Policies
        </button>
        <button
          onClick={() => { setActiveTab("logs"); setIsEditing(false); }}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 -mb-[2px] transition-all ${
            activeTab === "logs"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Compliance Logs
        </button>
      </div>

      {isEditing ? (
        <Card className="p-6 border-border bg-card shadow-soft space-y-6">
          <div className="flex items-center justify-between border-b border-border/40 pb-3">
            <h3 className="font-semibold text-sm">
              {selectedPolicy ? `Edit Document: ${selectedPolicy.title}` : "Create New Policy Document"}
            </h3>
            <button
              onClick={() => setIsEditing(false)}
              className="text-xs font-bold hover:underline"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSavePolicy} className="space-y-4 text-left">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Document Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (!selectedPolicy) {
                      setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
                    }
                  }}
                  placeholder="e.g. AI Usage Policy"
                  className="h-10 w-full rounded border border-border bg-background px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Slug *</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9\-]+/g, ""))}
                  placeholder="e.g. ai-policy"
                  className="h-10 w-full rounded border border-border bg-background px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  disabled={!!selectedPolicy}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="h-10 w-full rounded border border-border bg-background px-3 text-xs focus:outline-none"
                >
                  <option value="Global">Global / Public</option>
                  <option value="Student">Student Compliance</option>
                  <option value="Parent">Parent Controls</option>
                  <option value="Tutor">Tutor / Teacher Agreement</option>
                  <option value="Academy">Academy Specific</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Document Version</label>
                <input
                  type="text"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  placeholder="e.g. 1.0"
                  className="h-10 w-full rounded border border-border bg-background px-3 text-xs focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Effective Date</label>
                <input
                  type="datetime-local"
                  value={effectiveDate}
                  onChange={(e) => setEffectiveDate(e.target.value)}
                  className="h-10 w-full rounded border border-border bg-background px-3 text-xs focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border border-border bg-muted/20 p-4 rounded-xl">
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase block">Applicable Roles</span>
                <div className="flex flex-wrap gap-2">
                  {["student", "parent", "tutor", "admin"].map((r) => {
                    const active = applicableRoles.includes(r);
                    return (
                      <button
                        type="button"
                        key={r}
                        onClick={() => toggleRole(r)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                          active ? "bg-primary/10 border-primary text-primary" : "border-border text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        {r}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase block">Applicable Academies</span>
                <div className="flex flex-wrap gap-2">
                  {["school-tuition", "career-academy", "extra-curricular"].map((a) => {
                    const active = applicableAcademies.includes(a);
                    return (
                      <button
                        type="button"
                        key={a}
                        onClick={() => toggleAcademy(a)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                          active ? "bg-accent/10 border-accent text-accent" : "border-border text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        {a.replace("-", " ")}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Policy Content (Markdown / Rich Text) *</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter details using standard markdown headers..."
                className="w-full rounded border border-border bg-background p-3 text-xs focus:outline-none min-h-[250px] resize-y"
                required
              />
            </div>

            <div className="border-t border-border/30 pt-4 space-y-4 text-left">
              <h4 className="text-xs font-bold text-foreground">SEO Metadata &amp; Search Optimization</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">SEO Page Title</label>
                  <input
                    type="text"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    placeholder="e.g. Terms of Service | EduEarn"
                    className="h-10 w-full rounded border border-border bg-background px-3 text-xs focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">SEO Meta Description</label>
                  <input
                    type="text"
                    value={seoDescription}
                    onChange={(e) => setSeoDescription(e.target.value)}
                    placeholder="Brief description of this policy content..."
                    className="h-10 w-full rounded border border-border bg-background px-3 text-xs focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Publish Status</label>
                <select
                  value={publishedStatus}
                  onChange={(e) => setPublishedStatus(e.target.value as Policy["published_status"])}
                  className="h-10 w-full rounded border border-border bg-background px-3 text-xs focus:outline-none"
                >
                  <option value="published">Published (Active Online)</option>
                  <option value="draft">Draft (Private Archive)</option>
                  <option value="archived">Archived (Deleted from Index)</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  disabled={busy}
                  type="submit"
                  className="w-full flex items-center justify-center gap-1.5 h-10 rounded bg-primary text-primary-foreground font-semibold text-xs disabled:opacity-60"
                >
                  <Check size={14} /> {selectedPolicy ? "Update Policy" : "Publish Document"}
                </button>
              </div>
            </div>
          </form>
        </Card>
      ) : activeTab === "documents" ? (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Filters Sidebar */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4 h-fit text-left">
            <div className="flex items-center justify-between border-b border-border/20 pb-3">
              <div className="flex items-center gap-1.5 text-foreground font-semibold text-sm">
                <Filter size={15} /> Filters &amp; Search
              </div>
              <span className="text-[10px] uppercase font-bold text-muted-foreground">{filteredPolicies.length} matches</span>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Keywords</label>
                <div className="relative">
                  <Search size={12} className="absolute left-2.5 top-3 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search slug or titles..."
                    className="h-9 w-full rounded border border-border bg-background pl-8 pr-2.5 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Applicable Role</label>
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="h-9 w-full rounded border border-border bg-background px-2.5 text-xs focus:outline-none"
                >
                  <option value="all">All Roles</option>
                  <option value="student">Student</option>
                  <option value="parent">Parent</option>
                  <option value="tutor">Tutor / Teacher</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Academy Specific</label>
                <select
                  value={filterAcademy}
                  onChange={(e) => setFilterAcademy(e.target.value)}
                  className="h-9 w-full rounded border border-border bg-background px-2.5 text-xs focus:outline-none"
                >
                  <option value="all">All Academies</option>
                  <option value="school-tuition">School Tuition</option>
                  <option value="career-academy">Career Academy</option>
                  <option value="extra-curricular">Extra Curricular</option>
                </select>
              </div>
            </div>
          </div>

          {/* List Area */}
          <div className="lg:col-span-2 space-y-4">
            {filteredPolicies.map((p) => {
              const isPreviewOpen = previewSlug === p.slug;
              return (
                <Card key={p.slug} className="p-5 border-border bg-card shadow-soft text-left space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-heading font-extrabold text-foreground text-sm tracking-tight flex items-center gap-2">
                        {p.title}
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          p.published_status === "published" ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"
                        }`}>
                          {p.published_status}
                        </span>
                      </h3>
                      <p className="text-[10px] text-muted-foreground font-semibold mt-1">
                        Slug: <span className="font-mono text-primary font-bold">/{p.slug}</span> · Category: {p.category} · Version {p.version}
                      </p>
                    </div>

                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => setPreviewSlug(isPreviewOpen ? null : p.slug)}
                        className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded border border-border"
                        title="Toggle Preview"
                      >
                        {isPreviewOpen ? <EyeOff size={13} /> : <Eye size={13} />}
                      </button>
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="p-1.5 hover:bg-muted text-muted-foreground hover:text-primary rounded border border-border"
                        title="Edit Policy"
                      >
                        <Edit size={13} />
                      </button>
                      <button
                        onClick={() => handleDeletePolicy(p.slug)}
                        className="p-1.5 hover:bg-destructive/10 text-destructive rounded border border-border"
                        title="Archive Policy"
                      >
                        <Trash size={13} />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {p.applicable_roles?.map(r => (
                      <span key={r} className="text-[9px] font-bold px-2 py-0.5 border border-primary/20 bg-primary/5 text-primary rounded-full uppercase">
                        {r}
                      </span>
                    ))}
                    {p.applicable_academies?.map(a => (
                      <span key={a} className="text-[9px] font-bold px-2 py-0.5 border border-accent/20 bg-accent/5 text-accent rounded-full uppercase">
                        {a.replace("-", " ")}
                      </span>
                    ))}
                  </div>

                  {isPreviewOpen && (
                    <div className="border border-border bg-muted/30 p-4 rounded-xl text-xs space-y-2 max-h-[220px] overflow-y-auto pr-1">
                      <h4 className="font-bold border-b border-border/40 pb-1 mb-2">Live Document Preview:</h4>
                      <pre className="whitespace-pre-wrap leading-relaxed font-semibold font-sans">{p.content}</pre>
                    </div>
                  )}
                </Card>
              );
            })}

            {!filteredPolicies.length && (
              <div className="rounded-xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
                No policy documents match the current filters.
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Audit Logs Tab */
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border/20 pb-3">
            <h3 className="font-semibold text-sm flex items-center gap-1.5">
              <History size={16} className="text-primary" /> System Compliance Audit Trail
            </h3>
            <span className="text-[10px] uppercase font-bold text-muted-foreground">{auditLogs.length} Entries</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-xs">
              <thead className="border-b border-border bg-muted/40 uppercase tracking-wide text-muted-foreground font-bold">
                <tr>
                  <th className="px-3 py-2">Document Slug</th>
                  <th className="px-3 py-2">Action Mapped</th>
                  <th className="px-3 py-2">Admin Identity</th>
                  <th className="px-3 py-2 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-left">
                {auditLogs.map((log, idx) => (
                  <tr key={idx} className="hover:bg-muted/10">
                    <td className="px-3 py-3 font-semibold text-primary">/{log.policy_slug}</td>
                    <td className="px-3 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.action.includes("Created") ? "bg-blue-500/10 text-blue-600" :
                        log.action.includes("Updated") ? "bg-amber-500/10 text-amber-600" :
                        log.action.includes("Published") ? "bg-emerald-500/10 text-emerald-600" :
                        "bg-rose-500/10 text-rose-600"
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-muted-foreground font-semibold">{log.user_email}</td>
                    <td className="px-3 py-3 text-right text-muted-foreground">
                      {log.created_at ? new Date(log.created_at).toLocaleString() : "System Initialized"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
