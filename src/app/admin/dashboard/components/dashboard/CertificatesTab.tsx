"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Award, Search, Trash2, Eye, Plus, ShieldCheck, RefreshCw, X, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Certificate {
  id: string;
  studentName: string;
  studentEmail: string;
  courseTitle: string;
  issueDate: string;
  certHash: string;
  status: "Active" | "Revoked";
}

export default function CertificatesTab() {
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showIssueModal, setShowIssueModal] = useState(false);
  
  // New certificate form state
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formCourse, setFormCourse] = useState("");

  const defaultCerts: Certificate[] = [
    { id: "cert-1", studentName: "Rahul Verma", studentEmail: "rahul@eduearn.com", courseTitle: "Mastering React Native Hooks & Layouts", issueDate: "2026-07-15", certHash: "EE-7489-AB23", status: "Active" },
    { id: "cert-2", studentName: "Surya K", studentEmail: "surya@learner.com", courseTitle: "Kuchipudi Mudras & Coordination Masterclass", issueDate: "2026-07-20", certHash: "EE-8912-CD45", status: "Active" },
    { id: "cert-3", studentName: "Rohan Das", studentEmail: "rohan@example.com", courseTitle: "Double-Entry Accounting & Taxation Basics", issueDate: "2026-07-28", certHash: "EE-5231-EF89", status: "Active" }
  ];

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("eduearn_certificates");
      if (stored) {
        try {
          setCerts(JSON.parse(stored));
        } catch {
          setCerts(defaultCerts);
        }
      } else {
        localStorage.setItem("eduearn_certificates", JSON.stringify(defaultCerts));
        setCerts(defaultCerts);
      }
    }
  }, []);

  const saveCerts = (updated: Certificate[]) => {
    setCerts(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("eduearn_certificates", JSON.stringify(updated));
    }
  };

  const handleRevoke = (id: string) => {
    const updated = certs.map(c => c.id === id ? { ...c, status: "Revoked" as const } : c);
    saveCerts(updated);
    toast.success("Certificate has been revoked successfully.");
  };

  const handleReactivate = (id: string) => {
    const updated = certs.map(c => c.id === id ? { ...c, status: "Active" as const } : c);
    saveCerts(updated);
    toast.success("Certificate reactivated successfully.");
  };

  const handleIssueCertificate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim() || !formCourse.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }

    const randomHash = `EE-${Math.floor(1000 + Math.random() * 9000)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const newCert: Certificate = {
      id: `cert-${Date.now()}`,
      studentName: formName,
      studentEmail: formEmail,
      courseTitle: formCourse,
      issueDate: new Date().toISOString().split("T")[0],
      certHash: randomHash,
      status: "Active"
    };

    saveCerts([newCert, ...certs]);
    toast.success("Manual Certificate issued successfully!");
    
    // reset form and modal
    setFormName("");
    setFormEmail("");
    setFormCourse("");
    setShowIssueModal(false);
  };

  const filteredCerts = certs.filter(c => 
    c.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.studentEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.courseTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.certHash.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 text-left select-none pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-4 rounded-xl border border-border shadow-soft">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary flex items-center gap-1.5">
            <Award size={13} className="animate-pulse" /> Platform Credential Issuance
          </span>
          <h2 className="text-xl font-heading font-black text-foreground tracking-tight mt-1">
            Verifiable Certificates Directory
          </h2>
        </div>
        <Button size="sm" onClick={() => setShowIssueModal(true)} className="h-8 text-[10px] uppercase font-black tracking-wider bg-primary text-white shadow-soft">
          <Plus size={12} className="mr-1" /> Issue Certificate
        </Button>
      </div>

      {/* Search Filter Bar */}
      <div className="flex items-center gap-3 bg-card border border-border p-3.5 rounded-xl shadow-soft">
        <div className="relative border border-border rounded-button bg-muted/20 flex items-center px-3 gap-2 py-1.5 flex-grow">
          <Search size={14} className="text-muted-foreground shrink-0" />
          <input
            type="text"
            placeholder="Search certificates by name, email, course title, or hash ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none text-xs text-foreground placeholder:text-muted-foreground focus:outline-none w-full font-bold"
          />
        </div>
      </div>

      {/* Certificates Data Table */}
      <Card className="border border-border/80 bg-card/60 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs select-none">
            <thead>
              <tr className="border-b border-border/60 bg-muted/20 text-muted-foreground font-extrabold uppercase tracking-wider text-[9px]">
                <th className="p-4 pl-6">Recipient Info</th>
                <th className="p-4">Academic Course Program</th>
                <th className="p-4">Verifiable ID Hash</th>
                <th className="p-4">Issue Date</th>
                <th className="p-4">Status Status</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filteredCerts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground/60 font-semibold">
                    No matching verifiable credentials found in the database.
                  </td>
                </tr>
              ) : (
                filteredCerts.map((c) => (
                  <tr key={c.id} className="hover:bg-muted/10 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="font-extrabold text-foreground">{c.studentName}</div>
                      <div className="text-[10px] text-muted-foreground font-semibold mt-0.5">{c.studentEmail}</div>
                    </td>
                    <td className="p-4 font-bold text-foreground max-w-xs truncate">{c.courseTitle}</td>
                    <td className="p-4 font-mono font-bold text-primary/80 uppercase">{c.certHash}</td>
                    <td className="p-4 text-muted-foreground font-semibold">
                      <span className="flex items-center gap-1"><Calendar size={12} /> {c.issueDate}</span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 text-[9px] uppercase font-black px-2 py-0.5 rounded-full border ${
                        c.status === "Active" 
                          ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
                          : "bg-rose-500/10 text-rose-500 border-rose-500/20"
                      }`}>
                        <span className={`w-1 h-1 rounded-full ${c.status === "Active" ? "bg-emerald-500" : "bg-rose-500"}`} />
                        {c.status}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right space-x-1.5">
                      <Link 
                        href={`/student/certificate/${c.id}`} 
                        target="_blank"
                        className="inline-flex items-center justify-center p-2 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        title="View Certificate Web View"
                      >
                        <Eye size={13} />
                      </Link>
                      {c.status === "Active" ? (
                        <button
                          onClick={() => handleRevoke(c.id)}
                          className="p-2 rounded hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-colors cursor-pointer"
                          title="Revoke Certificate Access"
                        >
                          <Trash2 size={13} />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleReactivate(c.id)}
                          className="p-2 rounded hover:bg-emerald-500/10 text-muted-foreground hover:text-emerald-500 transition-colors cursor-pointer"
                          title="Reactivate Revoked Certificate"
                        >
                          <RefreshCw size={13} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Manual Issuance Modal */}
      {showIssueModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border shadow-modal rounded-xl w-full max-w-md overflow-hidden p-6 text-left">
            <div className="flex items-center justify-between border-b border-border/40 pb-3 mb-4 select-none">
              <h3 className="text-sm font-heading font-extrabold text-foreground flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-primary" /> Manually Issue Verifiable Certificate
              </h3>
              <button onClick={() => setShowIssueModal(false)} className="p-1 hover:bg-muted rounded text-muted-foreground"><X size={16} /></button>
            </div>

            <form onSubmit={handleIssueCertificate} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-[10px] text-muted-foreground uppercase font-bold mb-1.5">Candidate Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Priyanshu Sen"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full h-9 px-3 rounded-button border border-border bg-background text-foreground focus:border-primary/85 focus:outline-none transition-all font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] text-muted-foreground uppercase font-bold mb-1.5">Candidate Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. priyanshu@example.com"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full h-9 px-3 rounded-button border border-border bg-background text-foreground focus:border-primary/85 focus:outline-none transition-all font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] text-muted-foreground uppercase font-bold mb-1.5">Course Program Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mastering React Native Hooks & Layouts"
                  value={formCourse}
                  onChange={(e) => setFormCourse(e.target.value)}
                  className="w-full h-9 px-3 rounded-button border border-border bg-background text-foreground focus:border-primary/85 focus:outline-none transition-all font-bold"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/40 select-none">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowIssueModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-primary text-white shadow-soft">
                  Discharge &amp; Sign
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
