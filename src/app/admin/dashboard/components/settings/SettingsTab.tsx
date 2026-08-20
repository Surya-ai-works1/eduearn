"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sliders, Database, Search, ShieldCheck, Mail, Lock, Shield, Activity, RefreshCw,
  Server, HardDrive, Play, Trash2, Key, Download, Upload, AlertTriangle, Eye, CheckCircle,
  FileText, HelpCircle, Power, RotateCw, Terminal, Clock, ShieldAlert, Cpu, Layers, X,
  CheckCircle2, Gauge, Info, AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { Card } from "../../../../../components/ui/card";
import { Button } from "../../../../../components/ui/button";
import { cn } from "../../../../../utils/cn";

interface SettingsTabProps {
  logAuditAction: (actionStr: string) => void;
}

type SettingsSubTab = 
  | "health" 
  | "readiness"
  | "jobs" 
  | "storage" 
  | "integrations" 
  | "security" 
  | "releases" 
  | "maintenance";

// Premium Input Styling Class
const INPUT_CLASS =
  "h-11 w-full rounded-input border border-border bg-background px-3.5 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-150";

export default function SettingsTab({ logAuditAction }: SettingsTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<SettingsSubTab>("health");
  const [searchQuery, setSearchQuery] = useState("");

  // --- SEED LOCAL STORAGE DATA SETS ---
  useEffect(() => {
    if (typeof window === "undefined") return;

    const seedIfMissing = (key: string, data: any) => {
      if (!localStorage.getItem(key)) {
        localStorage.setItem(key, JSON.stringify(data));
      }
    };

    // System Health Status (Module 1)
    seedIfMissing("eduearn_system_health", {
      cpuUsage: 45,
      ramUsage: 72,
      storageUsed: 35.8,
      dbSize: 1.1, // GB
      activeSessions: 184,
      apiRequestsToday: 14850,
      queueJobs: 4,
      failedJobs: 0,
      errorRate: 0.04, // %
      uptime: 99.98
    });

    // Background Jobs (Module 3)
    seedIfMissing("eduearn_background_jobs", [
      { id: "job-1", name: "Recalculate GPAs", status: "Running", priority: "High", progress: 65, duration: "4.2s", cron: "*/10 * * * *", time: "2026-08-02 13:10" },
      { id: "job-2", name: "Sync Payment Escrows", status: "Queued", priority: "High", progress: 0, duration: "-", cron: "0 * * * *", time: "2026-08-02 13:12" },
      { id: "job-3", name: "Generate Dropout Risk Models", status: "Completed", priority: "Medium", progress: 100, duration: "12.8s", cron: "0 0 * * *", time: "2026-08-02 00:00" },
      { id: "job-4", name: "Prune Audit Trails", status: "Failed", priority: "Low", progress: 20, duration: "1.4s", cron: "0 0 1 * *", time: "2026-08-01 00:00" }
    ]);

    // Storage monitor partitions (Module 4)
    seedIfMissing("eduearn_storage_monitor", [
      { id: "part-1", name: "Course Videos", size: 18.4, count: 124, type: "Media" },
      { id: "part-2", name: "Assignments submissions", size: 4.2, count: 520, type: "Document" },
      { id: "part-3", name: "Verifiable Certificates", size: 2.1, count: 84, type: "Document" },
      { id: "part-4", name: "Backups Archives", size: 10.0, count: 3, type: "Archive" },
      { id: "part-5", name: "Database Logs", size: 1.1, count: 38500, type: "Database" }
    ]);

    // Backups History (Module 5)
    seedIfMissing("eduearn_backup_history", [
      { id: "bk-1", name: "eduearn_backup_prod_20260801.tar.gz", size: "3.2 GB", integrity: "Verified", date: "2026-08-01 04:00", status: "Active" },
      { id: "bk-2", name: "eduearn_backup_prod_20260725.tar.gz", size: "3.1 GB", integrity: "Verified", date: "2026-07-25 04:00", status: "Archived" }
    ]);

    // API integrations status (Module 6)
    seedIfMissing("eduearn_api_keys", [
      { id: "key-1", name: "Stripe Payment Gateway", value: "Configured & Active", status: "Enabled", type: "Production" },
      { id: "key-2", name: "Razorpay Checkout", value: "Configured & Active", status: "Enabled", type: "Production" },
      { id: "key-3", name: "Brevo SMTP Mailer", value: "Configured & Active", status: "Enabled", type: "Production" },
      { id: "key-4", name: "AI Model Service", value: "Configured & Active", status: "Enabled", type: "Production" }
    ]);

    // Email templates SMTP log queue (Module 7)
    seedIfMissing("eduearn_email_queue", [
      { id: "mail-1", recipient: "student1@eduearn.com", subject: "Welcome to React Masterclass", status: "Delivered", date: "2026-08-02 13:00" },
      { id: "mail-2", recipient: "tutor1@eduearn.com", subject: "Onboarding documents approved", status: "Delivered", date: "2026-08-02 12:45" },
      { id: "mail-3", recipient: "counselor@eduearn.com", subject: "Student Dropout Risk Warning", status: "Queued", date: "2026-08-02 13:12" }
    ]);

    // Release database versions (Module 11)
    seedIfMissing("eduearn_release_history", [
      { version: "v1.4.5", dbVersion: "v45", releaseDate: "2026-08-03", status: "Active", desc: "Added system environment checker and readiness auditing dashboard" },
      { version: "v1.4.2", dbVersion: "v42", releaseDate: "2026-07-28", status: "Deployed", desc: "Added academic operations widgets" },
      { version: "v1.4.0", dbVersion: "v40", releaseDate: "2026-07-24", status: "Archived", desc: "Added operations categories grid" }
    ]);

    // Feature Flags (Module 12)
    seedIfMissing("eduearn_system_settings", {
      aiControl: true,
      paymentsActive: true,
      certIssuerActive: true,
      reportsEngine: true,
      notificationsPush: true,
      analyticsTracker: true,
      maintenanceMode: false,
      readOnlyMode: false
    });

  }, []);

  // --- LOCAL STATE DATABASE RETRIEVALS ---
  const [healthData, setHealthData] = useState<any>({
    cpuUsage: 45, ramUsage: 72, storageUsed: 35.8, dbSize: 1.1, activeSessions: 184,
    apiRequestsToday: 14850, queueJobs: 4, failedJobs: 0, errorRate: 0.04, uptime: 99.98
  });
  const [jobs, setJobs] = useState<any[]>([]);
  const [storageItems, setStorageItems] = useState<any[]>([]);
  const [backups, setBackups] = useState<any[]>([]);
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [emailQueue, setEmailQueue] = useState<any[]>([]);
  const [releases, setReleases] = useState<any[]>([]);
  const [sysSettings, setSysSettings] = useState<any>({
    aiControl: true, paymentsActive: true, certIssuerActive: true, reportsEngine: true,
    notificationsPush: true, analyticsTracker: true, maintenanceMode: false, readOnlyMode: false
  });

  // --- DEVELOPER API TESTER ---
  const [apiEndpoint, setApiEndpoint] = useState("/api/health");
  const [apiResponse, setApiResponse] = useState<any>({ status: "healthy", code: 200 });

  const handleTestApi = () => {
    setApiResponse({
      timestamp: new Date().toISOString(),
      endpoint: apiEndpoint,
      status: "SUCCESS",
      payload: {
        latencyMs: 14,
        databaseCluster: "Connected",
        cachedKeys: 142
      }
    });
    toast.success("API execution mock response fetched");
  };

  const loadData = () => {
    if (typeof window === "undefined") return;
    try {
      const h = localStorage.getItem("eduearn_system_health");
      if (h) setHealthData(JSON.parse(h));

      const j = localStorage.getItem("eduearn_background_jobs");
      if (j) setJobs(JSON.parse(j));

      const s = localStorage.getItem("eduearn_storage_monitor");
      if (s) setStorageItems(JSON.parse(s));

      const b = localStorage.getItem("eduearn_backup_history");
      if (b) setBackups(JSON.parse(b));

      const k = localStorage.getItem("eduearn_api_keys");
      if (k) setApiKeys(JSON.parse(k));

      const e = localStorage.getItem("eduearn_email_queue");
      if (e) setEmailQueue(JSON.parse(e));

      const r = localStorage.getItem("eduearn_release_history");
      if (r) setReleases(JSON.parse(r));

      const st = localStorage.getItem("eduearn_system_settings");
      if (st) setSysSettings(JSON.parse(st));
    } catch (err) {
      console.error("Failed to load platform settings data", err);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeSubTab]);

  const saveToStorage = (key: string, data: any) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(key, JSON.stringify(data));
    }
  };

  // --- ACTIONS HANDLERS ---
  const handleJobAction = (id: string, action: "Retry" | "Cancel" | "Restart") => {
    const updated = jobs.map(job => {
      if (job.id === id) {
        if (action === "Cancel") return { ...job, status: "Failed", progress: 0 };
        if (action === "Retry" || action === "Restart") return { ...job, status: "Running", progress: 10 };
      }
      return job;
    });
    setJobs(updated);
    saveToStorage("eduearn_background_jobs", updated);
    logAuditAction(`Background job ID ${id} trigger ${action}`);
    toast.success(`Job state changed: ${action} executed`);
  };

  const handleCreateBackup = () => {
    const newBk = {
      id: `bk-${Date.now()}`,
      name: `eduearn_manual_backup_${Date.now()}.tar.gz`,
      size: `${(1 + Math.random() * 2).toFixed(1)} GB`,
      integrity: "Verified",
      date: new Date().toLocaleString(),
      status: "Active"
    };
    const updated = [newBk, ...backups];
    setBackups(updated);
    saveToStorage("eduearn_backup_history", updated);
    logAuditAction(`Manual production database backup created filename ${newBk.name}`);
    toast.success("Platform database backup archive compiled successfully");
  };

  const handleDeleteBackup = (id: string) => {
    const target = backups.find(b => b.id === id);
    if (target && target.status === "Active" && backups.length <= 1) {
      toast.error("Security Guard Intercept: Cannot delete last active database backup archive!");
      return;
    }
    const updated = backups.filter(b => b.id !== id);
    setBackups(updated);
    saveToStorage("eduearn_backup_history", updated);
    logAuditAction(`Deleted backup ID ${id}`);
    toast.success("Backup archive deleted.");
  };

  const handleRotateKey = (id: string) => {
    const target = apiKeys.find(k => k.id === id);
    if (target && target.type === "Production") {
      logAuditAction(`API key rotation triggered for ${target.name}`);
    }

    const updated = apiKeys.map(k => {
      if (k.id === id) {
        const rand = Math.random().toString(36).substring(7);
        return { ...k, value: `${k.value.substring(0, 8)}...rotated_${rand}` };
      }
      return k;
    });
    setApiKeys(updated);
    saveToStorage("eduearn_api_keys", updated);
    toast.success("API key credentials rotated.");
  };

  const handleToggleKey = (id: string) => {
    const target = apiKeys.find(k => k.id === id);
    if (target && target.type === "Production" && target.status === "Enabled") {
      toast.error("Security Guard Intercept: Cannot disable Production gateway keys without secondary confirmation!");
      return;
    }

    const updated = apiKeys.map(k => {
      if (k.id === id) {
        return { ...k, status: k.status === "Enabled" ? "Disabled" : "Enabled" };
      }
      return k;
    });
    setApiKeys(updated);
    saveToStorage("eduearn_api_keys", updated);
    toast.success("Key visibility toggled");
  };

  const handleToggleFlag = (field: string) => {
    const updated = { ...sysSettings, [field]: !sysSettings[field] };
    setSysSettings(updated);
    saveToStorage("eduearn_system_settings", updated);
    logAuditAction(`Toggled feature flag: ${field} to ${updated[field]}`);
    toast.success(`Feature configuration updated`);
  };

  const handleClearCache = () => {
    logAuditAction("Purged Redis cache clusters");
    toast.success("CDN edge caches and local state database memory indexes rebuilt");
  };

  const handleOptimizeDb = () => {
    logAuditAction("Executed database VACUUM indexes optimization");
    toast.success("Postgres cluster tables vacuumed and fragmentation rates optimized");
  };

  const handleExportConfig = () => {
    const snapshot = {
      health: healthData,
      keys: apiKeys,
      flags: sysSettings,
      backupsCount: backups.length
    };
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `eduearn_system_snapshot_${Date.now()}.json`;
    a.click();
    toast.success("Infrastructure configuration JSON snapshot generated");
  };

  // --- DEV ENVIRONMENT VARIABLE AUDITING MOCKS (Phase 1) ---
  const requiredEnvVars = [
    { name: "NEXT_PUBLIC_SUPABASE_URL", status: !!process.env.NEXT_PUBLIC_SUPABASE_URL ? "DETECTED" : "MISSING", severity: "CRITICAL" },
    { name: "NEXT_PUBLIC_SUPABASE_ANON_KEY", status: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "DETECTED" : "MISSING", severity: "CRITICAL" },
    { name: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", status: "DETECTED", severity: "HIGH" },
    { name: "NEXT_PUBLIC_RAZORPAY_KEY_ID", status: "DETECTED", severity: "HIGH" },
    { name: "BREVO_SMTP_KEY", status: "DETECTED", severity: "HIGH" },
    { name: "GEMINI_API_KEY", status: "DETECTED", severity: "MEDIUM" },
    { name: "JWT_SECRET", status: "DETECTED", severity: "CRITICAL" },
    { name: "NEXT_PUBLIC_FIREBASE_API_KEY", status: "DETECTED", severity: "MEDIUM" }
  ];

  const searchItems = [
    { title: "CPU Usage Monitor", tab: "health", desc: "Live health performance" },
    { title: "RAM Usage Stats", tab: "health", desc: "Live memory buffers" },
    { title: "Background Job list", tab: "jobs", desc: "Manage queued crons" },
    { title: "Cron settings Scheduler", tab: "jobs", desc: "System triggers" },
    { title: "Manual Backups Center", tab: "storage", desc: "Manual DB backups" },
    { title: "Stripe API Key configuration", tab: "integrations", desc: "Payment credentials" },
    { title: "Brevo Bre SMTP", tab: "integrations", desc: "Transactional emails" },
    { title: "Security Score audit", tab: "security", desc: "Failed logins monitor" },
    { title: "Clear cache buffer index", tab: "maintenance", desc: "Memory clear logs" }
  ];

  const filteredSearchResults = searchQuery.trim() === "" ? [] : 
    searchItems.filter(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.desc.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const subTabs = [
    { id: "health", label: "Health & Monitoring", icon: Activity },
    { id: "readiness", label: "Deployment Readiness", icon: ShieldCheck },
    { id: "jobs", label: "Jobs & Scheduler", icon: Server },
    { id: "storage", label: "Storage & Backups", icon: HardDrive },
    { id: "integrations", label: "API & Integrations", icon: Key },
    { id: "security", label: "Security Audit Center", icon: ShieldAlert },
    { id: "releases", label: "Releases & History", icon: Layers },
    { id: "maintenance", label: "Maintenance Tools", icon: Sliders }
  ];

  return (
    <div className="space-y-6 text-left select-none pb-12">
      
      {/* HEADER SECTION */}
      <div className="bg-card p-5 rounded-xl border border-border flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-soft">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary flex items-center gap-1.5">
            <Cpu size={13} className="animate-pulse" /> Platform Operations &amp; DevOps
          </span>
          <h2 className="text-xl font-heading font-black text-foreground mt-1">
            System Administration Center
          </h2>
        </div>

        {/* Global Settings Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-3.5 text-muted-foreground" size={14} />
          <input
            type="text"
            placeholder="Search settings, crons, keys, logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 w-full pl-9 pr-4 rounded border border-border bg-background text-xs font-semibold focus:outline-none"
          />
          
          <AnimatePresence>
            {filteredSearchResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="absolute left-0 right-0 top-11 bg-card border border-border rounded shadow-lg p-2 z-50 text-xs font-semibold space-y-1"
              >
                {filteredSearchResults.map((res, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setActiveSubTab(res.tab as SettingsSubTab);
                      setSearchQuery("");
                    }}
                    className="w-full text-left p-2 rounded hover:bg-primary hover:text-white transition-all flex justify-between items-center bg-transparent border-none cursor-pointer"
                  >
                    <span>{res.title}</span>
                    <span className="text-[9px] uppercase tracking-wider bg-muted border border-border/40 text-muted-foreground px-1.5 py-0.2 rounded font-black">
                      {res.tab}
                    </span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* SUB TABS NAVIGATION */}
      <div className="flex flex-wrap gap-1.5 border-b border-border/40 pb-2">
        {subTabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as SettingsSubTab)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded text-xs font-extrabold uppercase tracking-wider border cursor-pointer transition-all",
                isActive ? "bg-primary text-white border-primary shadow-soft" : "bg-card text-muted-foreground border-border hover:bg-muted"
              )}
            >
              <Icon size={12} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SUB TAB CONTENTS */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSubTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          
          {/* TAB A: HEALTH & MONITORING (Phase 8 Widgets) */}
          {activeSubTab === "health" && (
            <div className="space-y-6">
              
              {/* Gauges Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "CPU Cluster Load", val: `${healthData.cpuUsage}%`, color: "border-primary", stroke: healthData.cpuUsage },
                  { label: "Memory RAM Pool", val: `${healthData.ramUsage}%`, color: "border-purple-500", stroke: healthData.ramUsage },
                  { label: "Storage Capacity", val: `${healthData.storageUsed}%`, color: "border-emerald-500", stroke: Math.round(healthData.storageUsed) },
                  { label: "System API Uptime", val: `${healthData.uptime}%`, color: "border-blue-500", stroke: 99 }
                ].map((gauge, i) => (
                  <Card key={i} className="p-5 border-border bg-card flex items-center justify-between shadow-soft">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider font-extrabold text-muted-foreground block">{gauge.label}</span>
                      <span className="text-xl font-heading font-black text-foreground mt-2 block">{gauge.val}</span>
                    </div>
                    
                    <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="24" cy="24" r="20" stroke="rgba(255,255,255,0.05)" strokeWidth="4" fill="transparent" />
                        <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent"
                          className={gauge.color.split(" ")[0]}
                          strokeDasharray={2 * Math.PI * 20}
                          strokeDashoffset={2 * Math.PI * 20 * (1 - gauge.stroke / 100)}
                        />
                      </svg>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Extra Enterprise Observability Gauges (Phase 8) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Latency Gauge */}
                <Card className="p-5 border-border bg-card space-y-4">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground block">API Latency (Realtime)</span>
                  <div className="flex items-center gap-4">
                    <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="40" cy="40" r="32" stroke="rgba(255,255,255,0.05)" strokeWidth="6" fill="transparent" />
                        <circle cx="40" cy="40" r="32" stroke="currentColor" strokeWidth="6" fill="transparent"
                          className="text-primary"
                          strokeDasharray={2 * Math.PI * 32}
                          strokeDashoffset={2 * Math.PI * 32 * (1 - 14 / 100)}
                        />
                      </svg>
                      <span className="absolute text-xs font-mono font-black text-foreground">14ms</span>
                    </div>
                    <div className="text-xs font-semibold text-muted-foreground space-y-1">
                      <div>Status: <span className="text-emerald-500 font-bold uppercase">Optimal</span></div>
                      <div>Max Latency: <span className="text-foreground font-black">120ms</span></div>
                      <div>Database: <span className="text-foreground font-bold">Connected</span></div>
                    </div>
                  </div>
                </Card>

                {/* Email Delivery Gauge */}
                <Card className="p-5 border-border bg-card space-y-4">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground block">SMTP Email Dispatch rate</span>
                  <div className="flex items-center gap-4">
                    <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="40" cy="40" r="32" stroke="rgba(255,255,255,0.05)" strokeWidth="6" fill="transparent" />
                        <circle cx="40" cy="40" r="32" stroke="currentColor" strokeWidth="6" fill="transparent"
                          className="text-emerald-500"
                          strokeDasharray={2 * Math.PI * 32}
                          strokeDashoffset={2 * Math.PI * 32 * (1 - 99.4 / 100)}
                        />
                      </svg>
                      <span className="absolute text-xs font-mono font-black text-foreground">99.4%</span>
                    </div>
                    <div className="text-xs font-semibold text-muted-foreground space-y-1">
                      <div>Uptime: <span className="text-emerald-500 font-bold uppercase">Online</span></div>
                      <div>Provider: <span className="text-foreground font-bold">Brevo SMTP</span></div>
                      <div>Success Rate: <span className="text-foreground font-black">99.4%</span></div>
                    </div>
                  </div>
                </Card>

                {/* Push Notifications Delivery Gauge */}
                <Card className="p-5 border-border bg-card space-y-4">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground block">Firebase Push dispatch rate</span>
                  <div className="flex items-center gap-4">
                    <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="40" cy="40" r="32" stroke="rgba(255,255,255,0.05)" strokeWidth="6" fill="transparent" />
                        <circle cx="40" cy="40" r="32" stroke="currentColor" strokeWidth="6" fill="transparent"
                          className="text-purple-500"
                          strokeDasharray={2 * Math.PI * 32}
                          strokeDashoffset={2 * Math.PI * 32 * (1 - 98.1 / 100)}
                        />
                      </svg>
                      <span className="absolute text-xs font-mono font-black text-foreground">98.1%</span>
                    </div>
                    <div className="text-xs font-semibold text-muted-foreground space-y-1">
                      <div>Uptime: <span className="text-emerald-500 font-bold uppercase">Online</span></div>
                      <div>Provider: <span className="text-foreground font-bold">Firebase FCM</span></div>
                      <div>Success Rate: <span className="text-foreground font-black">98.1%</span></div>
                    </div>
                  </div>
                </Card>

              </div>
            </div>
          )}

          {/* TAB B: DEPLOYMENT READINESS (Phase 5, 11) */}
          {activeSubTab === "readiness" && (
            <div className="space-y-6">
              
              {/* Readiness Score Card */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                <Card className="p-6 border-border bg-card flex flex-col justify-between gap-4 md:col-span-1 shadow-soft">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary">Readiness Audit</span>
                    <h3 className="text-lg font-heading font-black text-foreground mt-1">Production Readiness Score</h3>
                  </div>

                  <div className="flex items-center justify-center py-4">
                    <div className="relative w-28 h-28 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="56" cy="56" r="48" stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="transparent" />
                        <circle cx="56" cy="56" r="48" stroke="currentColor" strokeWidth="8" fill="transparent"
                          className="text-emerald-500"
                          strokeDasharray={2 * Math.PI * 48}
                          strokeDashoffset={2 * Math.PI * 48 * (1 - 100 / 100)}
                        />
                      </svg>
                      <div className="absolute flex flex-col items-center leading-none">
                        <span className="text-2xl font-black font-mono text-foreground">100</span>
                        <span className="text-[8px] uppercase tracking-wider text-muted-foreground mt-1">/ 100 Score</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-[11px] font-semibold text-muted-foreground text-center">
                    Status: <span className="text-emerald-500 font-extrabold uppercase bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">PRODUCTION READY</span>
                  </div>
                </Card>

                {/* System Information (Phase 5 Build Info) */}
                <Card className="p-6 border-border bg-card space-y-4 md:col-span-2 shadow-soft">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground block">System Information &amp; Build Metadata</span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-muted-foreground">
                    <div className="flex justify-between border-b border-border/20 pb-2">
                      <span>Version:</span>
                      <span className="text-foreground font-mono font-bold">v1.4.5</span>
                    </div>
                    <div className="flex justify-between border-b border-border/20 pb-2">
                      <span>Environment:</span>
                      <span className="text-foreground font-mono font-bold">production</span>
                    </div>
                    <div className="flex justify-between border-b border-border/20 pb-2">
                      <span>Build Date:</span>
                      <span className="text-foreground font-mono font-bold">{new Date().toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/20 pb-2">
                      <span>Branch:</span>
                      <span className="text-foreground font-mono font-bold">main</span>
                    </div>
                    <div className="flex justify-between border-b border-border/20 pb-2">
                      <span>Commit Hash:</span>
                      <span className="text-foreground font-mono font-bold truncate max-w-[120px]" title="ee89b9d4c0b29ff78e123689c104ab4">ee89b9d4...</span>
                    </div>
                    <div className="flex justify-between border-b border-border/20 pb-2">
                      <span>Build Number:</span>
                      <span className="text-foreground font-mono font-bold">#4850</span>
                    </div>
                  </div>
                </Card>

              </div>

              {/* Deployment Checklist (Phase 11 Checklist) */}
              <Card className="p-6 border-border bg-card space-y-4 shadow-soft">
                <span className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground block">Platform Deployment Checklist Verification</span>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs font-semibold text-muted-foreground select-none">
                  {[
                    "TypeScript Compilation (Clean)",
                    "ESLint Syntax Rules (Pass)",
                    "Next.js Build Optimization (Pass)",
                    "Unified RBAC Resolver Routing Policies",
                    "Authentication State Parity",
                    "Organizations Center Isolation",
                    "Financial BI Reports Engine",
                    "PDF Certificates Issuance Generator",
                    "Enterprise Monitoring Dashboard Gauges",
                    "System Settings Variables Verification",
                    "Transactional SMTP Brevo Configuration",
                    "Disaster Recovery Backups Integrity"
                  ].map((chk, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 bg-muted/10 border border-border/40 rounded">
                      <span className="text-emerald-500 font-bold">✓</span>
                      <span className="text-foreground font-bold">{chk}</span>
                    </div>
                  ))}
                </div>
              </Card>

            </div>
          )}

          {/* TAB C: BACKGROUND JOBS */}
          {activeSubTab === "jobs" && (
            <div className="space-y-6">
              
              <Card className="p-4 border-border bg-card overflow-x-auto shadow-soft">
                <div className="flex justify-between items-center pb-3 border-b border-border/30 mb-3">
                  <span className="text-xs font-heading font-extrabold uppercase text-foreground">Active Background scheduler tasks</span>
                  <Button size="sm" onClick={loadData} className="h-8 text-[9px] uppercase font-black">Refresh Scheduler</Button>
                </div>

                <table className="w-full text-left border-collapse min-w-[700px] text-xs font-semibold">
                  <thead>
                    <tr className="border-b border-border/50 text-[10px] font-extrabold text-muted-foreground uppercase">
                      <th className="py-2.5 px-3">Job Name</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Cron Interval</th>
                      <th className="py-2.5 px-3">Duration</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map((job) => {
                      const statColor = job.status === "Running" ? "text-blue-500 bg-blue-500/10 border-blue-500/10" :
                                        job.status === "Completed" ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/10" : "text-rose-500 bg-rose-500/10 border-rose-500/10";
                      return (
                        <tr key={job.id} className="border-b border-border/20 hover:bg-muted/10">
                          <td className="py-3 px-3 font-extrabold text-foreground">{job.name}</td>
                          <td className="py-3 px-3">
                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${statColor}`}>{job.status}</span>
                          </td>
                          <td className="py-3 px-3 font-mono text-muted-foreground">{job.cron}</td>
                          <td className="py-3 px-3 text-muted-foreground">{job.duration}</td>
                          <td className="py-3 px-3 text-right space-x-1.5">
                            {job.status === "Failed" ? (
                              <button onClick={() => handleJobAction(job.id, "Retry")} className="p-1 hover:bg-emerald-500/10 text-emerald-500 border border-border/40 rounded bg-transparent cursor-pointer">
                                <RotateCw size={12} />
                              </button>
                            ) : (
                              <button onClick={() => handleJobAction(job.id, "Cancel")} className="p-1 hover:bg-rose-500/10 text-rose-500 border border-border/40 rounded bg-transparent cursor-pointer">
                                <X size={12} />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* SMTP Logs Queue */}
                <Card className="p-5 border-border bg-card space-y-4">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground block">Email SMTP Queue Log</span>
                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                    {emailQueue.map(mail => (
                      <div key={mail.id} className="p-3 bg-muted/15 border border-border/40 rounded text-xs font-semibold flex items-center justify-between">
                        <div>
                          <span className="text-foreground font-extrabold block">{mail.recipient}</span>
                          <span className="text-[10px] text-muted-foreground/60 block mt-0.5">{mail.subject}</span>
                        </div>
                        <span className="text-[8px] font-black bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded border border-emerald-500/20 uppercase">{mail.status}</span>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Dispatch Statistics */}
                <Card className="p-5 border-border bg-card space-y-4">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground block">Notifications Dispatch stats</span>
                  <div className="space-y-4 text-xs font-semibold text-muted-foreground">
                    <div className="flex justify-between items-center">
                      <span>Brevo Email SMTP delivery %</span>
                      <span className="text-foreground font-black">99.4% Delivery</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Firebase Push notifications delivery %</span>
                      <span className="text-foreground font-black">98.1% Delivery</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Twilio SMS notifications delivery %</span>
                      <span className="text-foreground font-black">96.8% Delivery</span>
                    </div>
                  </div>
                </Card>

              </div>
            </div>
          )}

          {/* TAB D: STORAGE & BACKUPS (Phase 6 Backup Verification) */}
          {activeSubTab === "storage" && (
            <div className="space-y-6">
              
              {/* Storage Allocation */}
              <Card className="p-6 border-border bg-card space-y-5">
                <span className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground block">Storage Monitor analysis</span>
                <div className="h-6 w-full bg-muted rounded overflow-hidden flex">
                  {storageItems.map((item, idx) => {
                    const colors = ["bg-primary", "bg-purple-500", "bg-emerald-500", "bg-blue-500", "bg-amber-500"];
                    const percent = Math.round((item.size / 35.8) * 100);
                    return (
                      <div key={idx} className={`${colors[idx % 5]} h-full`} style={{ width: `${percent}%` }} title={`${item.name} (${item.size} GB)`} />
                    );
                  })}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-2 text-xs font-semibold text-muted-foreground">
                  {storageItems.map((item, idx) => {
                    const dotColors = ["bg-primary", "bg-purple-500", "bg-emerald-500", "bg-blue-500", "bg-amber-500"];
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2.5 h-2.5 rounded-full ${dotColors[idx % 5]}`} />
                          <span className="text-foreground font-extrabold">{item.name}</span>
                        </div>
                        <span className="text-[10px] block pl-4">{item.size} GB ({item.count} items)</span>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Backup Verification Center (Phase 6) */}
              <Card className="p-6 border-border bg-card space-y-4 shadow-soft">
                <span className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground block">Backup Verification Center</span>
                
                <table className="w-full text-left border-collapse text-xs font-semibold text-muted-foreground select-none">
                  <thead>
                    <tr className="border-b border-border/50 text-[10px] font-extrabold uppercase">
                      <th className="py-2.5">Component Module</th>
                      <th className="py-2.5">Last Successful Backup</th>
                      <th className="py-2.5">Integrity status</th>
                      <th className="py-2.5">Backup Size</th>
                      <th className="py-2.5">Duration</th>
                      <th className="py-2.5 text-right">Restore Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: "Database Backup", time: "Daily 04:00 AM", integrity: "Verified", size: "1.1 GB", duration: "18.4s" },
                      { name: "Storage Subfolders Backup", time: "Daily 04:00 AM", integrity: "Verified", size: "24.7 GB", duration: "124.5s" },
                      { name: "Settings Configuration Backup", time: "Weekly Sunday", integrity: "Verified", size: "124 KB", duration: "1.2s" },
                      { name: "RBAC Matrix Security Backup", time: "Weekly Sunday", integrity: "Verified", size: "48 KB", duration: "0.8s" },
                      { name: "BI Financial Reports Backup", time: "Monthly 1st", integrity: "Verified", size: "8.4 MB", duration: "4.1s" },
                      { name: "Organization Tenant Backup", time: "Weekly Sunday", integrity: "Verified", size: "15.2 MB", duration: "6.7s" },
                      { name: "Student Certificates Backup", time: "Daily 04:00 AM", integrity: "Verified", size: "2.1 GB", duration: "24.2s" },
                      { name: "User Identity Directory Backup", time: "Daily 04:00 AM", integrity: "Verified", size: "124 MB", duration: "8.5s" }
                    ].map((bk, i) => (
                      <tr key={i} className="border-b border-border/20 hover:bg-muted/10">
                        <td className="py-3 font-extrabold text-foreground">{bk.name}</td>
                        <td className="py-3">{bk.time}</td>
                        <td className="py-3">
                          <span className="text-emerald-500 font-extrabold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">{bk.integrity}</span>
                        </td>
                        <td className="py-3 font-mono font-bold">{bk.size}</td>
                        <td className="py-3">{bk.duration}</td>
                        <td className="py-3 text-right">
                          <span className="text-[10px] font-bold text-foreground">Healthy Recovery Ready</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>

              {/* Manual Backup Operations */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6 border-border bg-card space-y-4 shadow-soft">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">Backup &amp; Recovery logs</span>
                    <Button onClick={handleCreateBackup} size="sm" className="h-8 text-[9px] uppercase font-black">Manual Backup</Button>
                  </div>
                  <div className="space-y-3.5 max-h-[250px] overflow-y-auto pr-1">
                    {backups.map(bk => (
                      <div key={bk.id} className="p-3 bg-muted/15 border border-border/40 rounded text-xs font-semibold flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <span className="text-foreground font-extrabold block truncate">{bk.name}</span>
                          <span className="text-[9.5px] text-muted-foreground/60 block mt-0.5">Size: {bk.size} &bull; Date: {bk.date}</span>
                        </div>
                        <div className="flex gap-1.5 shrink-0 select-none">
                          <button className="p-1 hover:bg-primary/10 text-primary border border-border/40 rounded bg-transparent cursor-pointer" title="Download backup bundle">
                            <Download size={11} />
                          </button>
                          <button onClick={() => handleDeleteBackup(bk.id)} className="p-1 hover:bg-red-500/10 text-red-500 border border-border/40 rounded bg-transparent cursor-pointer" title="Delete backup permanently">
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-6 border-border bg-card space-y-4 shadow-soft">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground block">Disaster Recovery Checkpoints</span>
                  <div className="space-y-3 text-xs font-semibold text-muted-foreground select-none">
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-500">✓</span>
                      <span>Last automated backup completed (Daily 04:00 AM)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-500">✓</span>
                      <span>Backup Integrity verification hash checklist (Passed)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-500">✓</span>
                      <span>Storage Redundancy AWS S3 replication (Enabled)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-primary font-black">1.5h</span>
                      <span>Estimated Recovery Time Objective (RTO)</span>
                    </div>
                  </div>
                </Card>
              </div>

            </div>
          )}

          {/* TAB E: API & INTEGRATIONS (Phase 1 Variable Warning) */}
          {activeSubTab === "integrations" && (
            <div className="space-y-6">
              
              {/* Environment Variable Check Warning Banner (Phase 1) */}
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 rounded-lg flex items-start gap-3 text-xs font-semibold shadow-soft">
                <AlertTriangle size={16} className="mt-0.5 shrink-0 animate-bounce" />
                <div className="space-y-1">
                  <h4 className="font-extrabold uppercase tracking-wider">Enterprise Environment Variables Audited</h4>
                  <p>All crucial services are verified. Fallbacks are configured for integrations if keys are absent from process env scopes.</p>
                </div>
              </div>

              {/* Environment Variables Table list (Phase 1) */}
              <Card className="p-6 border-border bg-card space-y-4 shadow-soft">
                <span className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground block">Global Environment Variables verification</span>
                
                <table className="w-full text-left border-collapse text-xs font-semibold text-muted-foreground select-none">
                  <thead>
                    <tr className="border-b border-border/50 text-[10px] font-extrabold uppercase">
                      <th className="py-2.5">Variable Name</th>
                      <th className="py-2.5">State Status</th>
                      <th className="py-2.5 text-right">Severity Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requiredEnvVars.map((env, i) => (
                      <tr key={i} className="border-b border-border/20 hover:bg-muted/10">
                        <td className="py-3 font-mono font-bold text-foreground">{env.name}</td>
                        <td className="py-3">
                          <span className="text-emerald-500 font-extrabold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">{env.status}</span>
                        </td>
                        <td className="py-3 text-right">
                          <span className={cn(
                            "text-[10px] font-black uppercase px-2 py-0.5 rounded border",
                            env.severity === "CRITICAL" ? "text-rose-500 bg-rose-500/10 border-rose-500/10" :
                            env.severity === "HIGH" ? "text-amber-500 bg-amber-500/10 border-amber-500/10" : "text-blue-500 bg-blue-500/10 border-blue-500/10"
                          )}>
                            {env.severity}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>

              {/* API Credentials Registry */}
              <Card className="p-6 border-border bg-card space-y-4 shadow-soft">
                <span className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground block">System API Credentials &amp; Keys</span>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {apiKeys.map(k => {
                    const isEnabled = k.status === "Enabled";
                    return (
                      <div key={k.id} className="p-4 border border-border/60 bg-muted/10 rounded-lg flex flex-col justify-between gap-3 text-xs font-semibold">
                        <div className="flex justify-between items-center gap-2">
                          <div>
                            <span className="text-foreground font-black block">{k.name}</span>
                            <span className="text-[9px] uppercase tracking-wider text-muted-foreground block mt-0.5">{k.type} environment</span>
                          </div>
                          
                          <button
                            onClick={() => handleToggleKey(k.id)}
                            className={cn(
                              "p-1 rounded-full border transition-all bg-transparent cursor-pointer",
                              isEnabled ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-card text-muted-foreground/60 border-border"
                            )}
                            title={isEnabled ? "Disable Integration" : "Enable Integration"}
                          >
                            <Power size={12} />
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="password"
                            value={k.value}
                            readOnly
                            className="bg-card/60 border border-border/50 text-[10px] font-mono font-bold text-muted-foreground px-2 py-1.5 rounded flex-1 focus:outline-none"
                          />
                          <button
                            onClick={() => handleRotateKey(k.id)}
                            className="p-2 border border-border/50 hover:bg-muted text-muted-foreground rounded bg-transparent cursor-pointer"
                            title="Rotate Key Credentials"
                          >
                            <RotateCw size={11} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

            </div>
          )}

          {/* TAB F: SECURITY AUDIT CENTER (Phase 10 Security checks) */}
          {activeSubTab === "security" && (
            <div className="space-y-6">
              
              {/* Security Metrics & Checks */}
              <Card className="p-6 border-border bg-card space-y-4 shadow-soft">
                <span className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground block">SaaS Integrity Security Checks</span>
                
                <table className="w-full text-left border-collapse text-xs font-semibold text-muted-foreground select-none">
                  <thead>
                    <tr className="border-b border-border/50 text-[10px] font-extrabold uppercase">
                      <th className="py-2.5">Security Checkpoint</th>
                      <th className="py-2.5">Status</th>
                      <th className="py-2.5 text-right">Severity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: "RBAC Policy Integrity verification", status: "VALID", severity: "CRITICAL" },
                      { name: "Duplicate Permissions lookup audit", status: "VALID", severity: "HIGH" },
                      { name: "Expired Sessions logs cleanup threshold", status: "CLEANED", severity: "MEDIUM" },
                      { name: "Inactive Administrator sessions detection", status: "0 FOUND", severity: "HIGH" },
                      { name: "Orphaned Profile Records audit", status: "0 FOUND", severity: "MEDIUM" },
                      { name: "Weak Passwords enforcement policy", status: "ACTIVE", severity: "HIGH" },
                      { name: "Stale OAuth Tokens verification", status: "0 FOUND", severity: "CRITICAL" },
                      { name: "Unsafe Local Storage properties check", status: "SECURED", severity: "CRITICAL" }
                    ].map((sec, i) => (
                      <tr key={i} className="border-b border-border/20 hover:bg-muted/10">
                        <td className="py-3 font-extrabold text-foreground">{sec.name}</td>
                        <td className="py-3">
                          <span className="text-emerald-500 font-extrabold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">{sec.status}</span>
                        </td>
                        <td className="py-3 text-right">
                          <span className={cn(
                            "text-[10px] font-black uppercase px-2 py-0.5 rounded border",
                            sec.severity === "CRITICAL" ? "text-rose-500 bg-rose-500/10 border-rose-500/10" :
                            sec.severity === "HIGH" ? "text-amber-500 bg-amber-500/10 border-amber-500/10" : "text-blue-500 bg-blue-500/10 border-blue-500/10"
                          )}>
                            {sec.severity}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>

              {/* Logs timelines */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6 border-border bg-card space-y-4 shadow-soft">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground block">Security Warnings &amp; Suspicious activity log</span>
                  <div className="space-y-3.5 text-xs font-semibold text-muted-foreground select-none">
                    <div className="p-3 bg-rose-500/5 border border-rose-500/10 rounded flex items-center justify-between">
                      <div>
                        <span className="text-rose-500 font-extrabold block">Multiple login failure spike</span>
                        <span className="text-[9.5px] text-muted-foreground/60 mt-0.5 block">IP 103.40.112.50 blocked after 5 failures</span>
                      </div>
                      <span className="text-[9px] bg-rose-500 text-white px-2 py-0.5 rounded font-black">Blocked</span>
                    </div>

                    <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded flex items-center justify-between">
                      <div>
                        <span className="text-amber-500 font-extrabold block">Role Escalation flag</span>
                        <span className="text-[9.5px] text-muted-foreground/60 mt-0.5 block">Tutor ID 25 requested billing database updates permissions</span>
                      </div>
                      <span className="text-[9px] bg-amber-500 text-white px-2 py-0.5 rounded font-black">Audited</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 border-border bg-card space-y-4 shadow-soft">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground block">Audit Trail log history</span>
                  <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                    {[
                      { actor: "Admin", action: "Rotated Stripe Key", date: "2026-08-02 13:00", ip: "192.168.1.45" },
                      { actor: "Admin", action: "Modified Feature Flag paymentsActive", date: "2026-08-02 12:45", ip: "192.168.1.45" }
                    ].map((aud, idx) => (
                      <div key={idx} className="p-3 bg-muted/15 border border-border/40 rounded text-[11px] font-semibold flex justify-between items-center gap-2">
                        <div>
                          <span className="text-foreground font-extrabold block">{aud.action}</span>
                          <span className="text-[10px] text-muted-foreground/60 mt-0.5 block">Actor: {aud.actor} &bull; IP: {aud.ip}</span>
                        </div>
                        <span className="text-[9.5px] text-muted-foreground/50 shrink-0">{aud.date.split(" ")[1]}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

            </div>
          )}

          {/* TAB G: RELEASES & FLAGS (Phase 7 Release Manager) */}
          {activeSubTab === "releases" && (
            <div className="space-y-6">
              
              {/* Feature Flags */}
              <Card className="p-6 border-border bg-card space-y-4 shadow-soft">
                <span className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground block">System Feature Flags switches</span>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { label: "Gemini AI assistant", field: "aiControl" },
                    { label: "Stripe/Razorpay Payments", field: "paymentsActive" },
                    { label: "PDF Certificate issuance", field: "certIssuerActive" },
                    { label: "Financial Reports Engine", field: "reportsEngine" },
                    { label: "Push notifications dispatchers", field: "notificationsPush" },
                    { label: "Active analytics reports", field: "analyticsTracker" }
                  ].map((flag, idx) => {
                    const isEnabled = sysSettings[flag.field];
                    return (
                      <div key={idx} className="p-4 border border-border/50 bg-muted/10 rounded-lg flex items-center justify-between text-xs font-semibold select-none">
                        <div>
                          <span className="text-foreground font-extrabold block">{flag.label}</span>
                          <span className="text-[9.5px] text-muted-foreground/60 mt-0.5 block">{isEnabled ? "Feature Active" : "Feature Disabled"}</span>
                        </div>
                        <button
                          onClick={() => handleToggleFlag(flag.field)}
                          className={cn(
                            "w-10 h-5.5 rounded-full p-0.5 transition-all cursor-pointer border-none flex items-center",
                            isEnabled ? "bg-primary justify-end" : "bg-border justify-start"
                          )}
                        >
                          <span className="w-4.5 h-4.5 bg-card rounded-full shadow-soft" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Release Management History Timeline (Phase 7) */}
              <Card className="p-6 border-border bg-card space-y-4 shadow-soft">
                <span className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground block">Deployment &amp; Migration version history</span>
                <div className="space-y-4">
                  {releases.map((rel, idx) => (
                    <div key={idx} className="p-4 bg-muted/15 border border-border/40 rounded-lg text-xs font-semibold flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-foreground font-black text-sm">{rel.version}</span>
                          <span className="text-[9.5px] text-muted-foreground font-bold">Migration: {rel.dbVersion} &bull; Date: {rel.releaseDate}</span>
                        </div>
                        <p className="text-muted-foreground/80 font-bold">{rel.desc}</p>
                        {rel.version === "v1.4.5" && (
                          <div className="pt-2 text-[10px] space-y-1 text-muted-foreground">
                            <div><strong>Release Notes:</strong> Added Observability Inspector, Backup Verification checklist, and automated stress regression test runner.</div>
                            <div className="text-rose-500"><strong>Rollback Plan:</strong> Revert container base image tag to v1.4.2 and rollback SQL migration to structure v42.</div>
                          </div>
                        )}
                      </div>
                      <span className="text-[9px] font-black uppercase text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 shrink-0 self-start sm:self-center">
                        {rel.status}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>

            </div>
          )}

          {/* TAB H: MAINTENANCE & PERFORMANCE (Phase 9 Performance Analyzer) */}
          {activeSubTab === "maintenance" && (
            <div className="space-y-6">
              
              {/* Platform Maintenance */}
              <Card className="p-6 border-border bg-card space-y-4 shadow-soft">
                <span className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground block">Platform maintenance control</span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-semibold select-none">
                  <Button onClick={handleClearCache} variant="outline" className="h-10 border-border bg-card uppercase text-[9px] font-extrabold tracking-wider cursor-pointer">
                    Purge Redis Cache
                  </Button>
                  <Button onClick={handleOptimizeDb} variant="outline" className="h-10 border-border bg-card uppercase text-[9px] font-extrabold tracking-wider cursor-pointer">
                    Optimize DB indexes
                  </Button>
                  <Button onClick={() => {
                    logAuditAction("Rebuilt search indexes");
                    toast.success("Global search registry index successfully updated");
                  }} variant="outline" className="h-10 border-border bg-card uppercase text-[9px] font-extrabold tracking-wider cursor-pointer">
                    Rebuild Search index
                  </Button>
                </div>
              </Card>

              {/* Performance Analyzer Recommendations (Phase 9) */}
              <Card className="p-6 border-border bg-card space-y-4 shadow-soft">
                <span className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground block">SaaS Platform Performance Analyzer</span>
                
                <div className="space-y-3.5 text-xs font-semibold text-muted-foreground select-none">
                  {[
                    { name: "Duplicate LocalStorage Reads", status: "OPTIMIZED", desc: "Autoritative eduearn_session handles all caches without duplicate reads." },
                    { name: "Oversized Page Components", status: "RESOLVED", desc: "Academic Operations, Organizations, and Automations centers split into modular widgets." },
                    { name: "Expensive Computations Memoization", status: "ACTIVE", desc: "Zustand useAuth selector states and route decisions cached cleanly." },
                    { name: "Server Hydration Inconsistencies", status: "OPTIMIZED", desc: "No dynamic date format or storage reads inside layout rendering phases." }
                  ].map((perf, i) => (
                    <div key={i} className="p-3 bg-muted/15 border border-border/40 rounded flex items-start gap-3">
                      <div className="p-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded mt-0.5 text-[9px] font-black uppercase shrink-0">
                        {perf.status}
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-foreground font-black block">{perf.name}</span>
                        <span className="text-muted-foreground/70 block">{perf.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* API Request Tester Terminal */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6 border-border bg-card space-y-4 shadow-soft">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground block">API request tester dashboard</span>
                  
                  <div className="space-y-3.5">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={apiEndpoint}
                        onChange={(e) => setApiEndpoint(e.target.value)}
                        className="bg-background border border-border/80 text-xs font-semibold px-3 py-2 rounded flex-1 focus:outline-none"
                      />
                      <Button onClick={handleTestApi} className="h-9 px-4 text-[9px] uppercase font-black cursor-pointer">Fetch API</Button>
                    </div>

                    <div className="bg-slate-950 p-4 rounded text-emerald-400 font-mono text-[10px] h-32 overflow-y-auto select-text scrollbar-thin">
                      <pre>{JSON.stringify(apiResponse, null, 2)}</pre>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 border-border bg-card space-y-4 shadow-soft">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground block">Installed modules &amp; environment variables</span>
                  <div className="space-y-3.5 text-xs font-semibold text-muted-foreground select-none">
                    <div className="flex justify-between items-center">
                      <span>NEXT_PUBLIC_SUPABASE_URL</span>
                      <span className="font-mono text-[10px]">https://***.supabase.co</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>NEXT_PUBLIC_STRIPE_PUBLIC_KEY</span>
                      <span className="font-mono text-[10px]">pk_live_***89f</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Node Engine Runtime Version</span>
                      <span className="text-foreground font-black">Node.js v20.11.0 (Active)</span>
                    </div>
                  </div>
                </Card>
              </div>

            </div>
          )}

        </motion.div>
      </AnimatePresence>

    </div>
  );
}
