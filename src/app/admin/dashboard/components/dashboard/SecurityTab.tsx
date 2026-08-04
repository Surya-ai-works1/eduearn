"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, ShieldAlert, Lock, RefreshCw, Key, LogOut, Terminal, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface SecurityAlert {
  id: string;
  type: string;
  severity: "Low" | "Medium" | "High";
  timestamp: string;
  ip: string;
  actor: string;
  description: string;
  status: "Flagged" | "Dismissed";
}

interface AdminSession {
  id: string;
  adminName: string;
  role: string;
  ip: string;
  browser: string;
  activeSince: string;
}

export default function SecurityTab() {
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [sessions, setSessions] = useState<AdminSession[]>([]);
  const [sessionTimeout, setSessionTimeout] = useState("30");
  const [twoFactorForce, setTwoFactorForce] = useState(true);

  const defaultAlerts: SecurityAlert[] = [
    { id: "sec-1", type: "Multiple Failed Logins", severity: "High", timestamp: "2026-08-03 14:22:10", ip: "192.168.1.182", actor: "unknown", description: "5 consecutive failed login attempts on student account rahul@eduearn.com.", status: "Flagged" },
    { id: "sec-2", type: "Escrow Withdrawal Deviation", severity: "Medium", timestamp: "2026-08-03 15:45:00", ip: "192.168.1.205", actor: "Amit Verma", description: "Withdrawal amount request of ₹18,400 deviates from median tutor payout patterns.", status: "Flagged" },
    { id: "sec-3", type: "API Token Rotation Warning", severity: "Low", timestamp: "2026-08-02 09:12:00", ip: "192.168.1.10", actor: "System Cron", description: "Gemini AI model API keys are approaching rotation threshold timer limits.", status: "Dismissed" }
  ];

  const defaultSessions: AdminSession[] = [
    { id: "ses-1", adminName: "Surya (Admin)", role: "Super Admin", ip: "192.168.1.14", browser: "Chrome on Windows 11", activeSince: "Today, 09:30 AM" },
    { id: "ses-2", adminName: "Sanjay Dutt", role: "Auditor", ip: "192.168.1.55", browser: "Firefox on macOS", activeSince: "Yesterday, 04:15 PM" }
  ];

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedAlerts = localStorage.getItem("eduearn_security_alerts");
      const storedSessions = localStorage.getItem("eduearn_security_sessions");
      
      if (storedAlerts) {
        try { setAlerts(JSON.parse(storedAlerts)); } catch { setAlerts(defaultAlerts); }
      } else {
        localStorage.setItem("eduearn_security_alerts", JSON.stringify(defaultAlerts));
        setAlerts(defaultAlerts);
      }

      if (storedSessions) {
        try { setSessions(JSON.parse(storedSessions)); } catch { setSessions(defaultSessions); }
      } else {
        localStorage.setItem("eduearn_security_sessions", JSON.stringify(defaultSessions));
        setSessions(defaultSessions);
      }
    }
  }, []);

  const saveAlerts = (updated: SecurityAlert[]) => {
    setAlerts(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("eduearn_security_alerts", JSON.stringify(updated));
    }
  };

  const saveSessions = (updated: AdminSession[]) => {
    setSessions(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("eduearn_security_sessions", JSON.stringify(updated));
    }
  };

  const handleDismissAlert = (id: string) => {
    const updated = alerts.map(a => a.id === id ? { ...a, status: "Dismissed" as const } : a);
    saveAlerts(updated);
    toast.success("Security alert dismissed.");
  };

  const handlePurgeSession = (id: string) => {
    const updated = sessions.filter(s => s.id !== id);
    saveSessions(updated);
    toast.success("Active session terminated & JWT revoked.");
  };

  const handleSaveConfig = () => {
    toast.success("Enterprise security configuration updated & saved.");
  };

  return (
    <div className="space-y-6 text-left select-none pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-4 rounded-xl border border-border shadow-soft">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary flex items-center gap-1.5">
            <Lock size={13} className="animate-pulse" /> Platform Governance &amp; Controls
          </span>
          <h2 className="text-xl font-heading font-black text-foreground tracking-tight mt-1">
            Centralized Security Operations Center
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] uppercase font-black px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            Threat Level: Zero Active
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Security Alerts List */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border border-border/80 bg-card/60 shadow-soft p-5 space-y-4">
            <div className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest block border-b border-border/30 pb-2">
              Operational Security Incident Logs
            </div>

            <div className="space-y-3.5">
              {alerts.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground/60 font-semibold">
                  No active security events found.
                </div>
              ) : (
                alerts.map((a) => {
                  const isHigh = a.severity === "High";
                  const statusColor = a.status === "Flagged" ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-muted text-muted-foreground border-border";
                  return (
                    <div key={a.id} className="p-4 border border-border/50 bg-card/40 rounded-xl flex flex-col sm:flex-row justify-between items-start gap-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className={`text-[8.5px] font-black uppercase px-2 py-0.5 rounded ${isHigh ? "bg-rose-500/15 text-rose-500" : "bg-amber-500/15 text-amber-500"}`}>
                            {a.severity} Risk
                          </span>
                          <span className={`text-[8.5px] font-black uppercase px-2 py-0.5 rounded border ${statusColor}`}>
                            {a.status}
                          </span>
                        </div>
                        <h4 className="font-extrabold text-foreground text-xs sm:text-sm mt-1">{a.type}</h4>
                        <p className="text-[10px] text-muted-foreground font-semibold leading-relaxed">{a.description}</p>
                        <div className="text-[9px] text-muted-foreground/50 font-mono mt-1">
                          IP: {a.ip} &bull; User: {a.actor} &bull; Timestamp: {a.timestamp}
                        </div>
                      </div>
                      
                      {a.status === "Flagged" && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleDismissAlert(a.id)}
                          className="text-[9px] uppercase font-bold tracking-wider shrink-0 mt-1"
                        >
                          Dismiss
                        </Button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </Card>

          {/* Active Admin Sessions */}
          <Card className="border border-border/80 bg-card/60 shadow-soft p-5 space-y-4">
            <div className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest block border-b border-border/30 pb-2">
              Active Administrative Sessions
            </div>

            <div className="space-y-3.5">
              {sessions.map((s) => (
                <div key={s.id} className="p-4 border border-border/50 bg-card/40 rounded-xl flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-foreground text-xs sm:text-sm">{s.adminName}</span>
                      <span className="text-[8px] uppercase tracking-wider font-extrabold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{s.role}</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground font-semibold mt-0.5">
                      Browser: {s.browser} &bull; IP Host: <span className="font-mono text-primary/80">{s.ip}</span>
                    </div>
                    <div className="text-[9px] text-muted-foreground/50 font-semibold">Active Since: {s.activeSince}</div>
                  </div>
                  
                  {sessions.length > 1 && (
                    <Button
                      size="sm"
                      onClick={() => handlePurgeSession(s.id)}
                      className="h-7 text-[8.5px] uppercase font-black bg-rose-600 hover:bg-rose-700 text-white shadow-soft shrink-0"
                    >
                      <LogOut size={10} className="mr-1" /> Terminate
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Security Policy Settings */}
        <div className="space-y-6">
          <Card className="border border-border/80 bg-card p-6 space-y-5 shadow-soft">
            <div className="border-b border-border/40 pb-3">
              <h3 className="font-heading font-black text-foreground text-sm flex items-center gap-1.5">
                <Key size={16} className="text-primary" /> Security Policy Config
              </h3>
              <p className="text-[10px] text-muted-foreground mt-1">Configure global authentication parameters</p>
            </div>

            <div className="space-y-4 text-xs font-semibold text-muted-foreground">
              <div className="space-y-1.5">
                <label className="block text-[10px] text-muted-foreground uppercase font-bold">Session Expiry Timeout</label>
                <select
                  value={sessionTimeout}
                  onChange={(e) => setSessionTimeout(e.target.value)}
                  className="w-full h-9 px-3 rounded-button border border-border bg-background text-foreground focus:border-primary/80 focus:outline-none transition-all font-bold"
                >
                  <option value="15">15 Minutes (High Security)</option>
                  <option value="30">30 Minutes (Recommended)</option>
                  <option value="60">60 Minutes (Standard)</option>
                  <option value="120">120 Minutes (Extended)</option>
                </select>
              </div>

              <div className="p-3 bg-muted/20 border border-border/30 rounded-xl flex items-center justify-between">
                <div>
                  <h5 className="font-extrabold text-foreground text-xs">Force 2FA Verification</h5>
                  <p className="text-[9.5px] text-muted-foreground font-semibold mt-0.5">Enforce Two-Factor code on login</p>
                </div>
                <input
                  type="checkbox"
                  checked={twoFactorForce}
                  onChange={(e) => setTwoFactorForce(e.target.checked)}
                  className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary cursor-pointer"
                />
              </div>

              <Button 
                onClick={handleSaveConfig}
                className="w-full bg-primary text-white font-black uppercase text-[10px] h-9 shadow-soft pt-1 select-none"
              >
                <Check size={13} className="mr-1.5" /> Save Policies
              </Button>
            </div>
          </Card>

          {/* Platform API Keys status */}
          <Card className="border border-border/80 bg-card p-6 space-y-4 shadow-soft">
            <div className="border-b border-border/40 pb-2.5 select-none">
              <h4 className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest">
                API Integration Keys
              </h4>
            </div>

            <div className="space-y-3.5 text-xs font-semibold text-muted-foreground">
              {[
                { name: "Supabase JWT Issuer", status: "Active & Secure", key: "sb.jwt.secret.*****" },
                { name: "Gemini 2.5 Flash API Key", status: "Active & Secure", key: "gm.flash25.*****" },
                { name: "Brevo SMTP Mail Service", status: "Active & Secure", key: "bv.smtp.token.*****" }
              ].map((k, idx) => (
                <div key={idx} className="p-3 bg-muted/15 border border-border/40 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-foreground">{k.name}</span>
                    <span className="text-[8.5px] font-black text-emerald-500 uppercase">{k.status}</span>
                  </div>
                  <div className="text-[10px] font-mono text-primary/70">{k.key}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
