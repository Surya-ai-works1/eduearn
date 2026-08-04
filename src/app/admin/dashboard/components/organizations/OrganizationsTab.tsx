"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2, Users, BookOpen, Coins, HardDrive, Search, PlusCircle, Filter, Download,
  Settings, CheckCircle, ShieldAlert, X, ChevronRight, Layout, Activity, ShieldCheck,
  Globe, Award, Database, RefreshCw, Plus, Edit2, Play, Power, RotateCw, Trash2
} from "lucide-react";
import { Card } from "../../../../../components/ui/card";
import { Button } from "../../../../../components/ui/button";
import { toast } from "sonner";

const INPUT_CLASS =
  "h-11 w-full rounded-input border border-border bg-background px-3.5 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-150";

// Import Modular Sub-components
import OrganizationOverview from "./OrganizationOverview";
import OrganizationUsers from "./OrganizationUsers";
import OrganizationBranding from "./OrganizationBranding";
import OrganizationDomains from "./OrganizationDomains";
import OrganizationBilling from "./OrganizationBilling";
import OrganizationStorage from "./OrganizationStorage";
import OrganizationSecurity from "./OrganizationSecurity";
import OrganizationReports from "./OrganizationReports";
import OrganizationAudit from "./OrganizationAudit";

interface OrganizationsTabProps {
  logAuditAction: (actionStr: string) => void;
}

export interface TenantOrg {
  id: string;
  name: string;
  industry: string;
  country: string;
  plan: "Starter" | "Professional" | "Business" | "Enterprise";
  usersCount: number;
  coursesCount: number;
  status: "Active" | "Suspended" | "Archived";
  ownerName: string;
  ownerEmail: string;
  createdDate: string;
  storageUsed: number; // GB
  healthScore: number;
  domain: string;
  subdomain: string;
  sslStatus: "Active" | "Pending";
  dnsStatus: "Verified" | "Failed";
}

export default function OrganizationsTab({ logAuditAction }: OrganizationsTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<string>("overview");

  // --- SAAS DATABASE SEEDING ---
  const [tenants, setTenants] = useState<TenantOrg[]>([]);

  const loadTenants = () => {
    if (typeof window === "undefined") return;
    const defaults: TenantOrg[] = [
      {
        id: "org-1",
        name: "Acme Corporate University",
        industry: "Technology",
        country: "India",
        plan: "Enterprise",
        usersCount: 450,
        coursesCount: 22,
        status: "Active",
        ownerName: "Alice Sen",
        ownerEmail: "alice@acme.com",
        createdDate: "2026-05-10",
        storageUsed: 18.2,
        healthScore: 96,
        domain: "university.acme.com",
        subdomain: "acme",
        sslStatus: "Active",
        dnsStatus: "Verified"
      },
      {
        id: "org-2",
        name: "Beta Design Institute",
        industry: "Design & Arts",
        country: "United States",
        plan: "Professional",
        usersCount: 120,
        coursesCount: 8,
        status: "Active",
        ownerName: "Bob Roy",
        ownerEmail: "bob@beta.org",
        createdDate: "2026-06-15",
        storageUsed: 5.4,
        healthScore: 92,
        domain: "beta-design.org",
        subdomain: "betadesign",
        sslStatus: "Active",
        dnsStatus: "Verified"
      },
      {
        id: "org-3",
        name: "Delta Coding Academy",
        industry: "Education",
        country: "Canada",
        plan: "Starter",
        usersCount: 15,
        coursesCount: 2,
        status: "Suspended",
        ownerName: "David Vance",
        ownerEmail: "david@deltacode.ca",
        createdDate: "2026-07-01",
        storageUsed: 1.1,
        healthScore: 60,
        domain: "deltacoding.ca",
        subdomain: "deltacode",
        sslStatus: "Pending",
        dnsStatus: "Failed"
      }
    ];

    const stored = localStorage.getItem("eduearn_tenants");
    if (stored) {
      try {
        setTenants(JSON.parse(stored));
      } catch {
        setTenants(defaults);
      }
    } else {
      localStorage.setItem("eduearn_tenants", JSON.stringify(defaults));
      setTenants(defaults);
    }
  };

  useEffect(() => {
    loadTenants();
  }, []);

  const saveTenants = (updated: TenantOrg[]) => {
    setTenants(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("eduearn_tenants", JSON.stringify(updated));
    }
  };

  // --- MODULE 1: KPI CALCULATIONS ---
  const totalOrgs = tenants.length;
  const activeOrgs = tenants.filter(t => t.status === "Active").length;
  const enterpriseOrgs = tenants.filter(t => t.plan === "Enterprise").length;
  const totalUsers = tenants.reduce((sum, t) => sum + t.usersCount, 0);
  const totalCourses = tenants.reduce((sum, t) => sum + t.coursesCount, 0);
  const totalStorage = parseFloat(tenants.reduce((sum, t) => sum + t.storageUsed, 0).toFixed(1));
  const estimatedRevenue = tenants.reduce((sum, t) => {
    const rates = { Starter: 2900, Professional: 7900, Business: 14900, Enterprise: 29900 };
    return sum + (rates[t.plan] || 0);
  }, 0);

  // --- MODULE 12: CREATION WIZARD STATES ---
  const [wizardStep, setWizardStep] = useState(1);
  const [wizName, setWizName] = useState("");
  const [wizIndustry, setWizIndustry] = useState("Technology");
  const [wizOwner, setWizOwner] = useState("");
  const [wizEmail, setWizEmail] = useState("");
  const [wizPlan, setWizPlan] = useState<"Starter" | "Professional" | "Business" | "Enterprise">("Starter");
  const [wizDomain, setWizDomain] = useState("");
  const [wizSubdomain, setWizSubdomain] = useState("");

  const handleCreateOrg = () => {
    // Validations (Module 18 - Duplicate checks)
    if (!wizName.trim() || !wizOwner.trim() || !wizEmail.trim() || !wizDomain.trim()) {
      toast.error("Please fill in all wizard details.");
      return;
    }

    if (tenants.some(t => t.name.toLowerCase() === wizName.toLowerCase())) {
      toast.error("Security Guard Intercept: Duplicate organization name is not permitted!");
      return;
    }

    if (tenants.some(t => t.domain.toLowerCase() === wizDomain.toLowerCase())) {
      toast.error("Security Guard Intercept: Custom domain must be unique!");
      return;
    }

    const newOrg: TenantOrg = {
      id: `org-${Date.now()}`,
      name: wizName,
      industry: wizIndustry,
      country: "India",
      plan: wizPlan,
      usersCount: wizPlan === "Enterprise" ? 150 : 25,
      coursesCount: 5,
      status: "Active",
      ownerName: wizOwner,
      ownerEmail: wizEmail,
      createdDate: new Date().toISOString().substring(0, 10),
      storageUsed: 2.5,
      healthScore: 98,
      domain: wizDomain,
      subdomain: wizSubdomain,
      sslStatus: "Pending",
      dnsStatus: "Verified"
    };

    const updated = [...tenants, newOrg];
    saveTenants(updated);
    logAuditAction(`Created new SaaS tenant organization: ${newOrg.name}`);
    toast.success(`Organization '${newOrg.name}' provisioned successfully`);

    // Reset wizard
    setIsWizardOpen(false);
    setWizardStep(1);
    setWizName("");
    setWizOwner("");
    setWizEmail("");
    setWizDomain("");
    setWizSubdomain("");
  };

  // --- MODULE 14: LIFECYCLE CONTROLS ---
  const handleToggleStatus = (id: string) => {
    const target = tenants.find(t => t.id === id);
    if (!target) return;

    // Security Rules (Module 18)
    if (target.plan === "Enterprise" && target.status === "Active") {
      toast.error("Security Guard Intercept: Suspensions on Enterprise organizations require physical board approval!");
      return;
    }

    const updated = tenants.map(t => {
      if (t.id === id) {
        const nextStatus = t.status === "Active" ? "Suspended" as const : "Active" as const;
        return { ...t, status: nextStatus };
      }
      return t;
    });
    saveTenants(updated);
    logAuditAction(`Toggled lifecycle status of org ${target.name}`);
    toast.success(`Tenant organization state updated.`);
  };

  const handleDeleteOrg = (id: string) => {
    const target = tenants.find(t => t.id === id);
    if (!target) return;

    if (target.plan === "Enterprise") {
      toast.error("Security Guard Intercept: Active Enterprise tenants cannot be deleted via admin control dashboards!");
      return;
    }

    if (target.usersCount > 50) {
      toast.error(`Security Guard Intercept: Cannot delete organization containing ${target.usersCount} active users!`);
      return;
    }

    const updated = tenants.filter(t => t.id !== id);
    saveTenants(updated);
    logAuditAction(`Deleted SaaS tenant organization ID ${id}`);
    toast.success("Organization directory record deleted.");
  };

  // --- MODULE 15: SEARCH CONTROLS ---
  const filteredOrgs = tenants.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.domain.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedOrg = tenants.find(t => t.id === selectedOrgId);

  return (
    <div className="space-y-6 text-left select-none pb-12">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-5 rounded-xl border border-border shadow-soft">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary flex items-center gap-1.5">
            <Building2 size={13} className="animate-pulse" /> Multi-Tenant SaaS Console
          </span>
          <h2 className="text-xl font-heading font-black text-foreground mt-1">
            Organization Management Center
          </h2>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsWizardOpen(true)} className="h-9 px-4 text-xs font-black uppercase shadow-soft">
            <PlusCircle size={14} className="mr-1.5" /> Provision Tenant
          </Button>
        </div>
      </div>

      {/* WORKSPACE MODE OR LIST DIRECTORY */}
      {selectedOrgId && selectedOrg ? (
        
        // --- WORKSPACE VIEW ---
        <div className="space-y-6">
          <Button variant="outline" size="sm" onClick={() => setSelectedOrgId(null)} className="h-8 border-border bg-card font-extrabold uppercase text-[9px] tracking-wider">
            ← Back to Directory
          </Button>

          {/* Org Workspace Title */}
          <div className="bg-card p-5 rounded-xl border border-border flex items-center gap-4">
            <div className="w-12 h-12 rounded bg-primary/10 text-primary flex items-center justify-center font-heading font-black text-lg">
              {selectedOrg.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-md font-heading font-black text-foreground">{selectedOrg.name}</h3>
                <span className="text-[8px] bg-primary/10 text-primary font-black uppercase px-2 py-0.5 rounded border border-primary/20">{selectedOrg.plan}</span>
              </div>
              <span className="text-[10px] text-muted-foreground mt-1 block">Custom Domain: {selectedOrg.domain} &bull; Owner: {selectedOrg.ownerName}</span>
            </div>
          </div>

          {/* Workspace Subtabs list */}
          <div className="flex flex-wrap gap-1 border-b border-border/40 pb-2">
            {[
              { id: "overview", label: "Overview", icon: Activity },
              { id: "users", label: "User cohorts", icon: Users },
              { id: "branding", label: "Branding Customizer", icon: Layout },
              { id: "domains", label: "DNS Domains", icon: Globe },
              { id: "billing", label: "Billing & Plans", icon: Coins },
              { id: "storage", label: "Tenant Storage", icon: HardDrive },
              { id: "security", label: "Password Policy", icon: ShieldCheck },
              { id: "reports", label: "CSS Analytics", icon: Award },
              { id: "audit", label: "Audit logs", icon: Database }
            ].map(tab => {
              const isActive = activeWorkspaceTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveWorkspaceTab(tab.id)}
                  className={`px-3 py-1.5 rounded text-[10px] font-extrabold uppercase tracking-wider border cursor-pointer ${
                    isActive ? "bg-primary text-white border-primary shadow-soft" : "bg-card text-muted-foreground border-border hover:bg-muted"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Render Active Workspace Tab View */}
          <div className="min-h-[300px]">
            {activeWorkspaceTab === "overview" && <OrganizationOverview org={selectedOrg} />}
            {activeWorkspaceTab === "users" && <OrganizationUsers org={selectedOrg} />}
            {activeWorkspaceTab === "branding" && <OrganizationBranding org={selectedOrg} />}
            {activeWorkspaceTab === "domains" && <OrganizationDomains org={selectedOrg} />}
            {activeWorkspaceTab === "billing" && <OrganizationBilling org={selectedOrg} />}
            {activeWorkspaceTab === "storage" && <OrganizationStorage org={selectedOrg} />}
            {activeWorkspaceTab === "security" && <OrganizationSecurity org={selectedOrg} />}
            {activeWorkspaceTab === "reports" && <OrganizationReports org={selectedOrg} />}
            {activeWorkspaceTab === "audit" && <OrganizationAudit org={selectedOrg} />}
          </div>
        </div>

      ) : (

        // --- DIRECTORY MAIN VIEW ---
        <div className="space-y-6">
          
          {/* Module 1: KPI Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total SaaS Tenants", val: String(totalOrgs), desc: "Registered accounts", icon: Building2 },
              { label: "Active Organizations", val: String(activeOrgs), desc: "Online workspaces", icon: CheckCircle },
              { label: "Total Integrated Users", val: String(totalUsers), desc: "Active students/tutors", icon: Users },
              { label: "Monthly SaaS ARR", val: `₹${estimatedRevenue.toLocaleString("en-IN")}`, desc: "Recurring billing volume", icon: Coins }
            ].map((kpi, i) => {
              const Icon = kpi.icon;
              return (
                <Card key={i} className="p-5 border-border bg-card flex items-center justify-between shadow-soft">
                  <div>
                    <span className="text-[10px] uppercase font-extrabold text-muted-foreground tracking-wider block">{kpi.label}</span>
                    <span className="text-xl font-heading font-black text-foreground mt-2 block">{kpi.val}</span>
                    <span className="text-[9px] text-muted-foreground/60 font-semibold mt-1 block">{kpi.desc}</span>
                  </div>
                  <span className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
                    <Icon size={16} />
                  </span>
                </Card>
              );
            })}
          </div>

          {/* Search bar & Grid Directory list */}
          <Card className="p-5 border-border bg-card space-y-4">
            <div className="flex flex-col md:flex-row gap-3 justify-between items-center pb-3 border-b border-border/30">
              <span className="text-xs font-heading font-extrabold uppercase text-foreground">SaaS Organization Directory</span>
              
              <div className="relative w-full md:w-64 select-none">
                <Search className="absolute left-2.5 top-2.5 text-muted-foreground" size={13} />
                <input
                  type="text"
                  placeholder="Filter orgs, owners, domains..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8.5 w-full pl-8.5 pr-3 rounded border border-border bg-background text-[11px] font-semibold focus:outline-none"
                />
              </div>
            </div>

            {/* Organizations Grid Table (Responsive) */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px] text-xs font-semibold">
                <thead>
                  <tr className="border-b border-border/60 text-[9.5px] font-black uppercase text-muted-foreground">
                    <th className="py-2.5 px-3">Organization</th>
                    <th className="py-2.5 px-3">Plan</th>
                    <th className="py-2.5 px-3">Users</th>
                    <th className="py-2.5 px-3">Courses</th>
                    <th className="py-2.5 px-3">Custom Domain</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrgs.map(org => {
                    const statusColor = org.status === "Active" ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/10" : "text-rose-500 bg-rose-500/10 border-rose-500/10";
                    return (
                      <tr key={org.id} className="border-b border-border/20 hover:bg-muted/10">
                        <td className="py-3 px-3">
                          <button onClick={() => setSelectedOrgId(org.id)} className="text-foreground hover:text-primary font-extrabold text-left cursor-pointer focus:outline-none">
                            {org.name}
                            <span className="text-[10px] text-muted-foreground/60 block mt-0.5 font-semibold">Owner: {org.ownerName}</span>
                          </button>
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-[9.5px] font-bold text-foreground">{org.plan}</span>
                        </td>
                        <td className="py-3 px-3 text-muted-foreground">{org.usersCount} users</td>
                        <td className="py-3 px-3 text-muted-foreground">{org.coursesCount} courses</td>
                        <td className="py-3 px-3 font-mono text-muted-foreground">{org.domain}</td>
                        <td className="py-3 px-3">
                          <span className={`text-[9.5px] font-black uppercase px-2 py-0.5 rounded border ${statusColor}`}>{org.status}</span>
                        </td>
                        <td className="py-3 px-3 text-right space-x-1.5">
                          <button onClick={() => setSelectedOrgId(org.id)} className="p-1 hover:bg-primary/10 text-primary border border-border/40 rounded" title="Open workspace">
                            <Settings size={12} />
                          </button>
                          <button onClick={() => handleToggleStatus(org.id)} className="p-1 hover:bg-muted text-muted-foreground border border-border/40 rounded" title="Toggle Active/Suspended status">
                            <Power size={12} />
                          </button>
                          <button onClick={() => handleDeleteOrg(org.id)} className="p-1 hover:bg-rose-500/10 text-rose-500 border border-border/40 rounded" title="Delete permanently">
                            <Trash2 size={12} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* --- MODULE 12: WIZARD STEP-BY-STEP MODAL (Creation Wizard) --- */}
      <AnimatePresence>
        {isWizardOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }} onClick={() => setIsWizardOpen(false)} className="fixed inset-0 bg-black z-50 cursor-pointer" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed inset-x-4 top-24 max-w-md mx-auto bg-card border border-border p-6 rounded-xl shadow-modal z-55 text-left flex flex-col justify-between max-h-[500px]">
              <div>
                <div className="flex justify-between items-center border-b border-border/30 pb-3 mb-4 select-none">
                  <h3 className="text-sm font-heading font-black text-foreground uppercase flex items-center gap-1.5">
                    <Building2 size={16} className="text-primary" /> Provision Tenant Organization Wizard
                  </h3>
                  <button onClick={() => setIsWizardOpen(false)} className="p-1 text-muted-foreground hover:text-foreground"><X size={15} /></button>
                </div>

                {/* Steps tracker indicators */}
                <div className="flex justify-between items-center mb-5 text-[9px] font-black uppercase text-muted-foreground/60 tracking-wider select-none">
                  <span className={wizardStep >= 1 ? "text-primary font-black" : ""}>1. Details</span>
                  <span className={wizardStep >= 2 ? "text-primary font-black" : ""}>2. Owner</span>
                  <span className={wizardStep >= 3 ? "text-primary font-black" : ""}>3. DNS Domain</span>
                </div>

                {/* Step 1: Details */}
                {wizardStep === 1 && (
                  <div className="space-y-3.5">
                    <div>
                      <label className="text-[10px] font-black uppercase text-muted-foreground mb-1 block">Organization Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Acme Tech University"
                        value={wizName}
                        onChange={(e) => setWizName(e.target.value)}
                        className={INPUT_CLASS}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-muted-foreground mb-1 block">SaaS Plan tier</label>
                      <select
                        value={wizPlan}
                        onChange={(e) => setWizPlan(e.target.value as any)}
                        className={INPUT_CLASS}
                      >
                        <option value="Starter">Starter Plan (₹2,900/mo)</option>
                        <option value="Professional">Professional Plan (₹7,900/mo)</option>
                        <option value="Business">Business Plan (₹14,900/mo)</option>
                        <option value="Enterprise">Enterprise Plan (₹29,900/mo)</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Step 2: Owner */}
                {wizardStep === 2 && (
                  <div className="space-y-3.5">
                    <div>
                      <label className="text-[10px] font-black uppercase text-muted-foreground mb-1 block">Owner Full Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Alice Sen"
                        value={wizOwner}
                        onChange={(e) => setWizOwner(e.target.value)}
                        className={INPUT_CLASS}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-muted-foreground mb-1 block">Owner Email address</label>
                      <input
                        type="email"
                        placeholder="e.g. owner@acme.com"
                        value={wizEmail}
                        onChange={(e) => setWizEmail(e.target.value)}
                        className={INPUT_CLASS}
                      />
                    </div>
                  </div>
                )}

                {/* Step 3: Domain Custom DNS */}
                {wizardStep === 3 && (
                  <div className="space-y-3.5">
                    <div>
                      <label className="text-[10px] font-black uppercase text-muted-foreground mb-1 block">Custom Primary DNS Domain</label>
                      <input
                        type="text"
                        placeholder="e.g. university.acme.com"
                        value={wizDomain}
                        onChange={(e) => setWizDomain(e.target.value)}
                        className={INPUT_CLASS}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-muted-foreground mb-1 block">Subdomain Routing Namespace</label>
                      <input
                        type="text"
                        placeholder="e.g. acme"
                        value={wizSubdomain}
                        onChange={(e) => setWizSubdomain(e.target.value)}
                        className={INPUT_CLASS}
                      />
                    </div>
                  </div>
                )}

              </div>

              {/* Action buttons */}
              <div className="pt-4 border-t border-border/30 flex gap-2 mt-5 select-none">
                {wizardStep > 1 && (
                  <Button variant="outline" onClick={() => setWizardStep(prev => prev - 1)} className="flex-1 uppercase font-bold text-[9px] h-9 border-border bg-card">Back</Button>
                )}
                {wizardStep < 3 ? (
                  <Button onClick={() => setWizardStep(prev => prev + 1)} className="flex-1 uppercase font-bold text-[9px] h-9">Continue</Button>
                ) : (
                  <Button onClick={handleCreateOrg} className="flex-1 uppercase font-black text-[9.5px] h-9 bg-emerald-600 hover:bg-emerald-700 text-white shadow-soft">Provision Tenant</Button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
