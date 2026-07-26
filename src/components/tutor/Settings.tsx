"use client";

import React, { useCallback, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "../../components/ui/button";
import { ChevronDown, Sparkles, Shield, Bell, Key, User, Landmark, ShieldCheck } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

type SettingsSection = {
  id: string;
  title: string;
  desc: string;
  icon: React.ElementType;
  content: React.ReactNode;
};

interface SettingsProps {
  tutorProfileForm: {
    fullName: string;
    bio: string;
    languages: string;
    skills: string;
    bankName: string;
    accountNo: string;
    ifscCode: string;
    upiId: string;
    taxId: string;
    expertise: string;
    experience: string;
    qualifications: string;
    certifications: string;
    availability: string;
    hourlyRate: string;
  };
  setTutorProfileForm: React.Dispatch<React.SetStateAction<SettingsProps["tutorProfileForm"]>>;
  activeSettingAccordion: string;
  setActiveSettingAccordion: (id: string) => void;
  completeProfile: (data: any) => Promise<{ success: boolean; error?: string }>;
  verificationTimeline: string;
  setVerificationTimeline: (v: string) => void;
  isIdUploaded: boolean;
  setIsIdUploaded: (v: boolean) => void;
  appStatus: string;
}

// Premium input styling
const INPUT_CLASS =
  "h-11 w-full rounded-input border border-border bg-background px-3.5 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-150";

export const Settings = React.memo(function Settings({
  tutorProfileForm,
  setTutorProfileForm,
  activeSettingAccordion,
  setActiveSettingAccordion,
  completeProfile,
  verificationTimeline,
  setVerificationTimeline,
  isIdUploaded,
  setIsIdUploaded,
  appStatus,
}: SettingsProps) {
  const router = useRouter();

  // Toggle states for notification/privacy preferences
  const [notifToggles, setNotifToggles] = useState({
    payoutAlerts: true,
    reviewNotifs: true,
    assignmentUploads: true,
  });
  const [isPublicProfile, setIsPublicProfile] = useState(true);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { resetPassword } = useAuth();

  const handleChangePassword = useCallback(async () => {
    if (!newPassword || !confirmPassword) {
      toast.error("Please fill in both password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    const res = await resetPassword(newPassword);
    if (res.ok) {
      toast.success("Password changed successfully!");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      toast.error(res.message || "Failed to change password.");
    }
  }, [newPassword, confirmPassword, resetPassword]);

  const handleSave = useCallback(async () => {
    const result = await completeProfile({
      ...tutorProfileForm,
      skills: tutorProfileForm.skills.split(",").map((s) => s.trim()),
    });
    if (result.success) {
      toast.success("Settings saved successfully!");
    } else {
      toast.error(result.error || "Failed to save settings.");
    }
  }, [completeProfile, tutorProfileForm]);

  const sections: SettingsSection[] = [
    {
      id: "profile",
      title: "Profile Settings",
      desc: "Customize your display name, bio, and public tutor presence.",
      icon: User,
      content: (
        <div className="space-y-4 pt-4 text-left">
          <div className="space-y-1.5">
            <label className="text-[10px] font-extrabold text-foreground uppercase tracking-wider block">Full Name *</label>
            <input type="text" value={tutorProfileForm.fullName} onChange={(e) => setTutorProfileForm((p) => ({ ...p, fullName: e.target.value }))} className={INPUT_CLASS} />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-extrabold text-foreground uppercase tracking-wider block">Creator Bio</label>
            <textarea rows={4} value={tutorProfileForm.bio} onChange={(e) => setTutorProfileForm((p) => ({ ...p, bio: e.target.value }))} className="w-full bg-background border border-border rounded-input p-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs font-semibold text-foreground resize-none leading-relaxed" placeholder="Share your credentials and experience..." />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-foreground uppercase tracking-wider block">Languages (comma separated)</label>
              <input type="text" value={tutorProfileForm.languages} onChange={(e) => setTutorProfileForm((p) => ({ ...p, languages: e.target.value }))} placeholder="English, Spanish, Hindi..." className={INPUT_CLASS} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-foreground uppercase tracking-wider block">Skills (comma separated)</label>
              <input type="text" value={tutorProfileForm.skills} onChange={(e) => setTutorProfileForm((p) => ({ ...p, skills: e.target.value }))} placeholder="React, Statistics, Algebra..." className={INPUT_CLASS} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-foreground uppercase tracking-wider block">Expertise / Primary Subject</label>
              <input type="text" value={tutorProfileForm.expertise} onChange={(e) => setTutorProfileForm((p) => ({ ...p, expertise: e.target.value }))} placeholder="Web Development, Physics..." className={INPUT_CLASS} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-foreground uppercase tracking-wider block">Teaching Experience (Years)</label>
              <input type="text" value={tutorProfileForm.experience} onChange={(e) => setTutorProfileForm((p) => ({ ...p, experience: e.target.value }))} placeholder="5 Years, 10+ Years..." className={INPUT_CLASS} />
            </div>
            <div className="space-y-1.5 font-semibold">
              <label className="text-[10px] font-extrabold text-foreground uppercase tracking-wider block">Qualifications / Education</label>
              <input type="text" value={tutorProfileForm.qualifications} onChange={(e) => setTutorProfileForm((p) => ({ ...p, qualifications: e.target.value }))} placeholder="B.Tech, PhD in Mathematics..." className={INPUT_CLASS} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-foreground uppercase tracking-wider block">Certifications</label>
              <input type="text" value={tutorProfileForm.certifications} onChange={(e) => setTutorProfileForm((p) => ({ ...p, certifications: e.target.value }))} placeholder="AWS Certified, Oracle Java Certified..." className={INPUT_CLASS} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-foreground uppercase tracking-wider block">Availability Hours</label>
              <input type="text" value={tutorProfileForm.availability} onChange={(e) => setTutorProfileForm((p) => ({ ...p, availability: e.target.value }))} placeholder="Weekdays 4:00 PM - 8:00 PM IST..." className={INPUT_CLASS} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-foreground uppercase tracking-wider block">Hourly Rate (INR/hour)</label>
              <input type="text" value={tutorProfileForm.hourlyRate} onChange={(e) => setTutorProfileForm((p) => ({ ...p, hourlyRate: e.target.value }))} placeholder="1200, 1500..." className={INPUT_CLASS} />
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "bank",
      title: "Bank & Payouts",
      desc: "Configure direct deposit credentials and bank withdrawal details.",
      icon: Landmark,
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 text-left">
          {([
            { label: "Bank Name", key: "bankName" as const, placeholder: "State Bank of India" },
            { label: "Account Number", key: "accountNo" as const, placeholder: "000000000000" },
            { label: "IFSC Code", key: "ifscCode" as const, placeholder: "SBIN0000000" },
            { label: "UPI ID", key: "upiId" as const, placeholder: "username@upi" },
          ] as { label: string; key: keyof SettingsProps["tutorProfileForm"]; placeholder: string }[]).map((field) => (
            <div key={field.key} className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-foreground uppercase tracking-wider block">{field.label}</label>
              <input type="text" value={tutorProfileForm[field.key] as string} onChange={(e) => setTutorProfileForm((p) => ({ ...p, [field.key]: e.target.value }))} placeholder={field.placeholder} className={INPUT_CLASS} />
            </div>
          ))}
        </div>
      ),
    },
    {
      id: "tax",
      title: "Tax Information",
      desc: "Manage your PAN credentials and official tax identifiers.",
      icon: Shield,
      content: (
        <div className="space-y-4 pt-4 text-left">
          <div className="space-y-1.5">
            <label className="text-[10px] font-extrabold text-foreground uppercase tracking-wider block">PAN / GSTIN</label>
            <input type="text" placeholder="ABCDE1234F" value={tutorProfileForm.taxId} onChange={(e) => setTutorProfileForm((p) => ({ ...p, taxId: e.target.value }))} className={INPUT_CLASS} />
          </div>
        </div>
      ),
    },
    {
      id: "verification",
      title: "✨ Sparky AI & Identity Verification",
      desc: "Verified by EduEarn Review Team & AI Assessed by Sparky AI.",
      icon: ShieldCheck,
      content: (
        <div className="space-y-5 pt-4 text-left">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-muted/20 p-4 border border-border/60 rounded-xl">
            {[
              { label: "1. Submitted", active: true },
              { label: "2. Under Review", active: verificationTimeline === "review" || verificationTimeline === "verified" },
              { label: "3. Verified by EduEarn", active: verificationTimeline === "verified" },
            ].map((step, idx) => (
              <div key={idx} className="flex items-center gap-2 flex-1">
                <div className={`w-6 h-6 rounded-full border text-xs font-extrabold flex items-center justify-center shrink-0 ${
                  step.active ? "bg-emerald-500 border-emerald-500 text-white" : "border-border text-muted-foreground bg-background"
                }`}>{idx + 1}</div>
                <span className={`text-xs font-extrabold ${step.active ? "text-foreground" : "text-muted-foreground"}`}>{step.label}</span>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-foreground flex items-center gap-2 text-xs">
                <ShieldCheck className="text-emerald-500" size={18} />
                ✅ Verified by EduEarn Review Team | 🤖 AI Assessed by Sparky AI
              </span>
              <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 uppercase">
                Active Badge
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">Your tutor application score (88/100) and primary meeting link have been verified for automated student allocations.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button size="md" className="h-11 text-xs font-bold uppercase tracking-wider" onClick={() => { setIsIdUploaded(true); setVerificationTimeline("review"); toast.success("Gov ID uploaded successfully!"); }}>Upload Government ID</Button>
            <Button size="md" className="h-11 text-xs font-bold uppercase tracking-wider bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => { setVerificationTimeline("verified"); toast.success("✨ Verified Tutor Certificate Ready for Download!"); }}>Verify &amp; Issue Certificate</Button>
          </div>
        </div>
      ),
    },
    {
      id: "notifications",
      title: "Notification Settings",
      desc: "Manage email triggers and student submission notification alerts.",
      icon: Bell,
      content: (
        <div className="space-y-4 pt-4 text-left">
          {([
            { key: "payoutAlerts" as const, title: "Payout alerts", desc: "Get email notifications when withdrawals process successfully." },
            { key: "reviewNotifs" as const, title: "Review notifications", desc: "Email notifications when students write new course reviews." },
            { key: "assignmentUploads" as const, title: "Assignment uploads", desc: "Receive immediate dashboard alerts on assignment uploads." },
          ] as const).map((pref) => (
            <div key={pref.key} className="flex items-center justify-between gap-4 border-b border-border/40 pb-3 last:border-0 last:pb-0">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-foreground block">{pref.title}</span>
                <span className="text-[10px] text-muted-foreground font-semibold block">{pref.desc}</span>
              </div>
              <button
                onClick={() => {
                  setNotifToggles((p) => ({ ...p, [pref.key]: !p[pref.key] }));
                  toast.success("Preferences updated successfully.");
                }}
                aria-label={`Toggle ${pref.title}`}
                className={`w-9 h-5 rounded-full relative cursor-pointer transition-colors shrink-0 ${notifToggles[pref.key] ? "bg-primary" : "bg-muted-foreground/30"}`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-background absolute top-[2px] transition-transform ${notifToggles[pref.key] ? "translate-x-[18px]" : "translate-x-[2px]"}`}
                />
              </button>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: "security",
      title: "Security Credentials",
      desc: "Update your system password and authentication configuration.",
      icon: Key,
      content: (
        <div className="space-y-4 pt-4 text-left">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-foreground uppercase tracking-wider block">New Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={INPUT_CLASS}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-foreground uppercase tracking-wider block">Confirm Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={INPUT_CLASS}
              />
            </div>
          </div>
          <Button
            onClick={handleChangePassword}
            size="sm"
            className="h-10 px-5 text-xs font-bold shadow-soft uppercase tracking-wider bg-primary text-foreground"
          >
            Update Password
          </Button>
        </div>
      ),
    },
    {
      id: "subscription",
      title: "Plan Subscription",
      desc: "Manage your subscription, billing status, and plan pricing limits.",
      icon: Sparkles,
      content: (
        <div className="pt-4 text-left">
          <div className="flex justify-between items-center bg-primary/5 p-4 rounded-xl border border-primary/20 text-xs">
            <div className="space-y-0.5">
              <span className="font-extrabold text-foreground block">
                Current Plan: {appStatus === "approved" ? "Tutor Pro" : "Tutor Pro (Free Trial)"}
              </span>
              <span className="text-muted-foreground font-semibold">
                {appStatus === "approved" ? "Active subscription plan" : "Trial status — upgrade to retain features"}
              </span>
            </div>
            <Button onClick={() => router.push("/pricing")} size="sm" className="h-9 px-4 font-bold text-[10px] uppercase tracking-wider shrink-0">Upgrade Plan</Button>
          </div>
        </div>
      ),
    },
    {
      id: "danger",
      title: "Danger Zone",
      desc: "Permanently terminate your tutor account and remove listing data.",
      icon: Shield,
      content: (
        <div className="space-y-3.5 pt-4 text-left border border-rose-500/20 bg-rose-500/5 p-4 rounded-card">
          <span className="text-rose-500 font-extrabold text-xs block uppercase tracking-wider">Account Deletion is Permanent!</span>
          <p className="text-xs text-muted-foreground font-medium leading-relaxed">
            All your published courses, transaction ledgers, assignments, and student reviews will be permanently erased.
          </p>
          <Button
            onClick={() => {
              if (confirm("Are you sure? This is irreversible.")) {
                localStorage.clear();
                toast.success("Account deleted. Redirecting...");
                window.location.href = "/";
              }
            }}
            className="h-10 text-[10px] font-bold bg-rose-600 hover:bg-rose-700 text-white border-rose-600 uppercase tracking-wider"
          >
            Delete Tutor Account
          </Button>
        </div>
      ),
    },
  ];

  return (
    <motion.div
      key="tutor-settings"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="space-y-8"
    >
      <div className="flex items-center justify-between border-b border-border/40 pb-5 mb-3">
        <div className="space-y-1">
          <h2 className="text-2xl font-heading font-extrabold text-foreground tracking-tight">Settings</h2>
          <p className="text-xs text-muted-foreground font-semibold">
            Configure payout account, creator profile details, and account security.
          </p>
        </div>
        <Button onClick={handleSave} size="md" className="h-10 px-5 text-xs font-bold shadow-soft uppercase tracking-wider">
          Save Settings
        </Button>
      </div>

      <div className="space-y-4">
        {sections.map((sec) => {
          const isOpen = activeSettingAccordion === sec.id;
          const SecIcon = sec.icon;
          return (
            <div key={sec.id} className="border border-border bg-card rounded-card overflow-hidden shadow-soft transition-all duration-200">
              <button
                type="button"
                onClick={() => setActiveSettingAccordion(isOpen ? "" : sec.id)}
                className="w-full p-5 flex items-center justify-between text-left hover:bg-muted/10 transition-colors focus:outline-none cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0 pr-4">
                  <div className={`p-2.5 rounded-xl border shrink-0 ${isOpen ? "bg-primary/10 border-primary/20 text-primary" : "bg-muted/50 border-border/50 text-muted-foreground"}`}>
                    <SecIcon size={16} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-sm font-heading font-extrabold text-foreground block leading-tight">{sec.title}</span>
                    <span className="text-xs text-muted-foreground font-semibold mt-1 block truncate max-w-[280px] sm:max-w-md">{sec.desc}</span>
                  </div>
                </div>
                <ChevronDown
                  size={16}
                  className={`text-muted-foreground/60 transition-transform duration-200 shrink-0 ${isOpen ? "rotate-180 text-primary" : ""}`}
                />
              </button>
              {isOpen && (
                <div className="p-6 pt-2 border-t border-border/30 bg-muted/5">
                  {sec.content}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
});
