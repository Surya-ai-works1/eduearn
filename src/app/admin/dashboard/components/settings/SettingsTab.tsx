"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sliders, Database, Search, ShieldCheck, Mail, Lock, Shield } from "lucide-react";
import { toast } from "sonner";
import { Card } from "../../../../../components/ui/card";
import { Button } from "../../../../../components/ui/button";

interface SettingsTabProps {
  logAuditAction: (actionStr: string) => void;
}

type SubTabType = "general" | "infrastructure" | "search" | "gateways" | "security";

// Premium Input Styling Class
const INPUT_CLASS =
  "h-11 w-full rounded-input border border-border bg-background px-3.5 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-150";

export default function SettingsTab({ logAuditAction }: SettingsTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<SubTabType>("general");

  // --- GENERAL SETTINGS ---
  const [platformName, setPlatformName] = useState("EduEarn Platform");
  const [brandingTitle, setBrandingTitle] = useState("EduEarn Admin Operations Center");
  const [logoUrl, setLogoUrl] = useState("/images/logo.png");
  const [faviconUrl, setFaviconUrl] = useState("/favicon.ico");
  const [defaultCurrency, setDefaultCurrency] = useState("INR");
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [brandColor, setBrandColor] = useState("#6366F1");

  // --- INFRASTRUCTURE LIMITS ---
  const [maxUploadSize, setMaxUploadSize] = useState(50); // MB
  const [maxVideoLength, setMaxVideoLength] = useState(120); // Minutes
  const [maxCourseSize, setMaxCourseSize] = useState(10); // GB
  const [defaultAiCredits, setDefaultAiCredits] = useState(1000);
  const [defaultStorageLimit, setDefaultStorageLimit] = useState(50); // GB

  // --- SEARCH & SEO MANAGEMENT ---
  const [seoMetaDescription, setSeoMetaDescription] = useState("Empowering students and creators to host cohorts, learn skills, and verify certificates.");
  const [popularSearches, setPopularSearches] = useState("react, figmas, python, live math, drawing, vfx");
  const [searchSuggestions, setSearchSuggestions] = useState("React Basics, Figma typography, Python Loops");
  const [courseRankingMultiplier, setCourseRankingMultiplier] = useState(1.2);

  // --- CREDENTIALS & GATEWAYS ---
  const [supabaseUrl, setSupabaseUrl] = useState("https://eduearn-supabase.co");
  const [supabaseAnonKey, setSupabaseAnonKey] = useState("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.anonkey");
  const [cloudinaryCloudName, setCloudinaryCloudName] = useState("eduearn-media");
  const [smtpServer, setSmtpServer] = useState("smtp.eduearn.com");
  const [smtpUser, setSmtpUser] = useState("no-reply@eduearn.com");
  const [twilioSid, setTwilioSid] = useState("AC78427842...");

  // --- SECURITY ---
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  // Load saved settings from localStorage if they exist
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedName = localStorage.getItem("eduearn_platform_name");
      if (savedName) setPlatformName(savedName);
      
      const savedTitle = localStorage.getItem("eduearn_branding_title");
      if (savedTitle) setBrandingTitle(savedTitle);

      const savedMaintenance = localStorage.getItem("eduearn_maintenance_mode");
      if (savedMaintenance) setMaintenanceMode(savedMaintenance === "true");
    }
  }, []);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      localStorage.setItem("eduearn_platform_name", platformName);
      localStorage.setItem("eduearn_branding_title", brandingTitle);
      localStorage.setItem("eduearn_maintenance_mode", String(maintenanceMode));
      
      // Dispatch storage event to alert other frames
      window.dispatchEvent(new Event("storage"));
    }
    logAuditAction(`Updated global platform settings: subtab=${activeSubTab}`);
    toast.success("Global configurations saved successfully!");
  };

  const handleToggleMaintenance = () => {
    const nextMode = !maintenanceMode;
    setMaintenanceMode(nextMode);
    if (typeof window !== "undefined") {
      localStorage.setItem("eduearn_maintenance_mode", String(nextMode));
      window.dispatchEvent(new Event("storage"));
    }
    logAuditAction(`Toggled maintenance mode lock to ${nextMode ? "ON" : "OFF"}`);
    toast.warning(`Maintenance Mode toggled ${nextMode ? "ON (simulating platform lock)" : "OFF"}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="space-y-6 text-left"
    >
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-5 select-none">
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-foreground tracking-tight">
            System Settings &amp; Infrastructure
          </h2>
          <p className="text-xs text-muted-foreground font-semibold">
            Configure default currency settings, upload limits, SEO search tags, and maintenance lockouts.
          </p>
        </div>
      </div>

      {/* SUB-TABS SELECTOR */}
      <div className="flex flex-wrap border-b border-border/40 pb-3 gap-2.5 select-none">
        {[
          { id: "general", label: "General Settings", icon: Sliders },
          { id: "infrastructure", label: "Infrastructure Limits", icon: Database },
          { id: "search", label: "Search & SEO Mappings", icon: Search },
          { id: "gateways", label: "Credentials & Gateways", icon: Mail },
          { id: "security", label: "Maintenance & Security", icon: Lock }
        ].map((sub) => {
          const Icon = sub.icon;
          return (
            <button
              key={sub.id}
              onClick={() => setActiveSubTab(sub.id as SubTabType)}
              className={`px-4 py-2 border rounded-button text-[10px] sm:text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all ${
                activeSubTab === sub.id
                  ? "bg-primary border-primary text-white shadow-soft"
                  : "border-border text-muted-foreground hover:bg-muted/50 bg-card"
              }`}
            >
              <Icon size={14} className="shrink-0" />
              <span>{sub.label}</span>
            </button>
          );
        })}
      </div>

      {/* CORE FORMS BASED ON SUB-TABS */}
      <Card className="p-6 sm:p-7 border-border bg-card shadow-soft">
        <form onSubmit={handleSaveSettings} className="space-y-6">
          
          {/* GENERAL SETTINGS */}
          {activeSubTab === "general" && (
            <div className="space-y-6 animate-fadeIn">
              <h4 className="text-sm font-heading font-extrabold uppercase text-foreground border-b border-border/20 pb-2 select-none">
                General Brand &amp; Location Configuration
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 text-xs font-semibold">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-foreground uppercase tracking-wider block">Platform Brand Name</label>
                  <input
                    type="text"
                    value={platformName}
                    onChange={(e) => setPlatformName(e.target.value)}
                    className={INPUT_CLASS}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-foreground uppercase tracking-wider block">Operations Dashboard Brand Title</label>
                  <input
                    type="text"
                    value={brandingTitle}
                    onChange={(e) => setBrandingTitle(e.target.value)}
                    className={INPUT_CLASS}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-foreground uppercase tracking-wider block">Branding Logo Asset URL</label>
                  <input
                    type="text"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    className={INPUT_CLASS}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-foreground uppercase tracking-wider block">Favicon URL Link</label>
                  <input
                    type="text"
                    value={faviconUrl}
                    onChange={(e) => setFaviconUrl(e.target.value)}
                    className={INPUT_CLASS}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-foreground uppercase tracking-wider block">Default Platform Currency</label>
                  <select
                    value={defaultCurrency}
                    onChange={(e) => setDefaultCurrency(e.target.value)}
                    className="h-11 w-full rounded-input border border-border bg-background px-3.5 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
                  >
                    <option value="INR">Indian Rupee (₹ INR)</option>
                    <option value="USD">US Dollar ($ USD)</option>
                    <option value="EUR">Euro (€ EUR)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-foreground uppercase tracking-wider block">Timezone Alignment</label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="h-11 w-full rounded-input border border-border bg-background px-3.5 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
                  >
                    <option value="Asia/Kolkata">Kolkata (IST - UTC+5:30)</option>
                    <option value="UTC">Coordinated Universal Time (UTC)</option>
                    <option value="America/New_York">New York (EST - UTC-5:00)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* INFRASTRUCTURE LIMITS */}
          {activeSubTab === "infrastructure" && (
            <div className="space-y-6 animate-fadeIn">
              <h4 className="text-sm font-heading font-extrabold uppercase text-foreground border-b border-border/20 pb-2 select-none">
                Platform Storage &amp; Upload Constraints
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 text-xs font-semibold">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-foreground uppercase tracking-wider block">Max Attachment Upload Size (MB)</label>
                  <input
                    type="number"
                    value={maxUploadSize}
                    onChange={(e) => setMaxUploadSize(Number(e.target.value))}
                    className={INPUT_CLASS}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-foreground uppercase tracking-wider block">Max Single Lecture Length (Min)</label>
                  <input
                    type="number"
                    value={maxVideoLength}
                    onChange={(e) => setMaxVideoLength(Number(e.target.value))}
                    className={INPUT_CLASS}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-foreground uppercase tracking-wider block">Max Total Course Size (GB)</label>
                  <input
                    type="number"
                    value={maxCourseSize}
                    onChange={(e) => setMaxCourseSize(Number(e.target.value))}
                    className={INPUT_CLASS}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-foreground uppercase tracking-wider block">Default Student AI Prompt Credits</label>
                  <input
                    type="number"
                    value={defaultAiCredits}
                    onChange={(e) => setDefaultAiCredits(Number(e.target.value))}
                    className={INPUT_CLASS}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-foreground uppercase tracking-wider block">Default Educator Cloud Storage (GB)</label>
                  <input
                    type="number"
                    value={defaultStorageLimit}
                    onChange={(e) => setDefaultStorageLimit(Number(e.target.value))}
                    className={INPUT_CLASS}
                  />
                </div>
              </div>
            </div>
          )}

          {/* SEARCH & SEO */}
          {activeSubTab === "search" && (
            <div className="space-y-6 animate-fadeIn">
              <h4 className="text-sm font-heading font-extrabold uppercase text-foreground border-b border-border/20 pb-2 select-none">
                SEO Metadata &amp; Suggestions Catalog
              </h4>
              <div className="space-y-4 text-xs font-semibold">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-foreground uppercase tracking-wider block">Default Meta SEO Description Copy</label>
                  <textarea
                    rows={3}
                    value={seoMetaDescription}
                    onChange={(e) => setSeoMetaDescription(e.target.value)}
                    className="w-full bg-background border border-border rounded-input p-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs font-semibold text-foreground resize-none leading-relaxed"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-foreground uppercase tracking-wider block">Popular Search Tags (Comma separated)</label>
                    <input
                      type="text"
                      value={popularSearches}
                      onChange={(e) => setPopularSearches(e.target.value)}
                      className={INPUT_CLASS}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-foreground uppercase tracking-wider block">Spotlight Search Suggestions (Comma separated)</label>
                    <input
                      type="text"
                      value={searchSuggestions}
                      onChange={(e) => setSearchSuggestions(e.target.value)}
                      className={INPUT_CLASS}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-foreground uppercase tracking-wider block">Cohort Ranking Weight multiplier (1.0 = Default)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={courseRankingMultiplier}
                      onChange={(e) => setCourseRankingMultiplier(Number(e.target.value))}
                      className={INPUT_CLASS}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* GATEWAYS & KEYS */}
          {activeSubTab === "gateways" && (
            <div className="space-y-6 animate-fadeIn">
              <h4 className="text-sm font-heading font-extrabold uppercase text-foreground border-b border-border/20 pb-2 select-none">
                Cloud Credentials &amp; SMTP Relay servers
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 text-xs font-semibold">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-foreground uppercase tracking-wider block">Supabase Project Endpoint URL</label>
                  <input
                    type="text"
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                    className={INPUT_CLASS}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-foreground uppercase tracking-wider block">Supabase Anon Public API Key</label>
                  <input
                    type="password"
                    value={supabaseAnonKey}
                    onChange={(e) => setSupabaseAnonKey(e.target.value)}
                    className={INPUT_CLASS}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-foreground uppercase tracking-wider block">Cloudinary Media Storage Bucket Name</label>
                  <input
                    type="text"
                    value={cloudinaryCloudName}
                    onChange={(e) => setCloudinaryCloudName(e.target.value)}
                    className={INPUT_CLASS}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-foreground uppercase tracking-wider block">SMTP Default Relay Host</label>
                  <input
                    type="text"
                    value={smtpServer}
                    onChange={(e) => setSmtpServer(e.target.value)}
                    className={INPUT_CLASS}
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECURITY & MAINTENANCE */}
          {activeSubTab === "security" && (
            <div className="space-y-6 animate-fadeIn">
              <h4 className="text-sm font-heading font-extrabold uppercase text-foreground border-b border-border/20 pb-2 select-none">
                Platform Safety &amp; Lockout Control
              </h4>
              <div className="p-5 border border-rose-500/20 bg-rose-500/5 rounded-card flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-semibold leading-relaxed">
                <div className="space-y-1 text-left">
                  <span className="text-foreground font-extrabold block">Activate Platform Maintenance Mode Lock</span>
                  <p className="text-xs text-muted-foreground max-w-lg mt-1 font-medium">
                    Enabling this mode will redirect all public traffic to a placeholder page. Current students and tutors will be temporarily locked out of active lessons.
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={handleToggleMaintenance}
                  className={`h-11 px-5 font-bold shrink-0 shadow-soft uppercase tracking-wider ${maintenanceMode ? "bg-emerald-600 hover:bg-emerald-700 text-white animate-pulse" : "bg-rose-600 hover:bg-rose-700 text-white"}`}
                >
                  {maintenanceMode ? "Deactivate Maintenance Lock" : "Lock Platform Mode Now"}
                </Button>
              </div>
            </div>
          )}

          {activeSubTab !== "security" && (
            <div className="flex justify-end pt-2">
              <Button type="submit" size="md" className="h-11 px-6 text-xs uppercase tracking-wider font-extrabold shadow-soft">
                Save Settings
              </Button>
            </div>
          )}

        </form>
      </Card>
    </motion.div>
  );
}
