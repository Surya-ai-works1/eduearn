"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, X, FileText, DollarSign, Wallet, ShieldAlert, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Card } from "../../../../../components/ui/card";
import { Button } from "../../../../../components/ui/button";
import { PaymentService, WithdrawalRequest, EscrowLog, PlatformConfig } from "../../../../../features/payments/services/paymentService";

interface FinanceTabProps {
  logAuditAction: (actionStr: string) => void;
}

export default function FinanceTab({ logAuditAction }: FinanceTabProps) {
  const [payouts, setPayouts] = useState<WithdrawalRequest[]>([]);
  const [escrows, setEscrows] = useState<EscrowLog[]>([]);
  const [config, setConfig] = useState<PlatformConfig>({
    commission: 10,
    applicationFee: 100,
    tutorProPrice: 499,
    freeTrialDays: 30,
    studentLimit: 5,
    earningsLimit: 5000,
    storageLimit: 50,
    aiCredits: 1000
  });

  // Additional mock parameters
  const [gstRate, setGstRate] = useState(18);
  const [processingFee, setProcessingFee] = useState(2);
  const [withdrawalFee, setWithdrawalFee] = useState(25);
  const [referralReward, setReferralReward] = useState(50);
  const [isDirty, setIsDirty] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadFinanceData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/payments");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load finance data");

      setPayouts(data.payouts || []);
      // Map API transactions to escrows format so it fits nicely
      const mappedEscrows = (data.transactions || []).map((tx: any) => ({
        id: tx.id,
        studentName: tx.studentName,
        courseTitle: tx.courseTitle,
        amount: tx.amount,
        status: tx.status === "Success" ? "Released" : "Escrowed",
        date: tx.date,
        tutorShare: Math.round(tx.amount * 0.8),
        platformShare: tx.amount - Math.round(tx.amount * 0.8),
      }));
      setEscrows(mappedEscrows);
      setConfig(PaymentService.getPlatformConfig());
    } catch (err: any) {
      console.warn("Failed to load backend finance details, falling back to local memory:", err);
      setPayouts(PaymentService.getWithdrawalHistory() as any);
      setEscrows(PaymentService.getEscrowLogs() as any);
      setConfig(PaymentService.getPlatformConfig());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFinanceData();
  }, []);

  const handleReleasePayout = async (id: string, amount: number) => {
    try {
      const res = await fetch("/api/admin/payments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payoutId: id, status: "Released" })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to release payout");

      PaymentService.approveWithdrawal(id);
      logAuditAction(`Released tutor payout request: ID ${id} of ₹${amount}`);
      toast.success("Payout request approved and released.");
      loadFinanceData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleHoldPayout = async (id: string, amount: number) => {
    try {
      const res = await fetch("/api/admin/payments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payoutId: id, status: "Rejected" })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reject payout");

      PaymentService.rejectWithdrawal(id);
      logAuditAction(`Rejected tutor payout request: ID ${id} of ₹${amount}`);
      toast.info("Payout request rejected.");
      loadFinanceData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleReleaseEscrow = (escrowId: string, courseTitle: string, tutorShare: number) => {
    const success = PaymentService.releasePayout(escrowId);
    if (success) {
      logAuditAction(`Manually released escrow to tutor for course: "${courseTitle}"`);
      toast.success(`Released ₹${tutorShare} to tutor available wallet.`);
      loadFinanceData();
    } else {
      toast.error("Failed to release escrow. It might already be released.");
    }
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (config.commission < 0 || config.commission > 100) {
      toast.error("Commission split must be between 0% and 100%");
      return;
    }
    if (config.tutorProPrice < 0) {
      toast.error("Tutor Pro subscription price cannot be negative");
      return;
    }
    if (config.freeTrialDays < 0) {
      toast.error("Free trial days cannot be negative");
      return;
    }
    if (gstRate < 0 || gstRate > 100) {
      toast.error("GST rate must be between 0% and 100%");
      return;
    }
    if (processingFee < 0 || processingFee > 100) {
      toast.error("Processing fee must be between 0% and 100%");
      return;
    }
    if (withdrawalFee < 0) {
      toast.error("Withdrawal fee cannot be negative");
      return;
    }
    if (referralReward < 0) {
      toast.error("Referral reward cannot be negative");
      return;
    }

    PaymentService.updatePlatformConfig(config);
    logAuditAction(`Updated platform configurations. Commission: ${config.commission}%, Pro Price: ₹${config.tutorProPrice}`);
    setIsDirty(false);
    toast.success("Pricing configurations saved successfully!");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="space-y-6 text-left text-xs font-semibold"
    >
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-3 select-none">
        <div>
          <h3 className="text-xs font-heading font-extrabold uppercase tracking-wide text-foreground">
            Platform Finance &amp; Payout Escrow Command
          </h3>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Audit payments escrow logs, verify tutor withdrawals, and manage platform fee configurations.
          </p>
        </div>
      </div>

      {/* PRICING CONFIG RULES FORM */}
      <Card className="p-5 border-border/40 bg-card shadow-soft">
        <h4 className="text-xs font-heading font-extrabold uppercase text-foreground border-b border-border/40 pb-2.5 mb-4">
          Global Pricing &amp; Fee Configurations
        </h4>
        <form onSubmit={handleSaveConfig} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-foreground font-bold block text-[10px] uppercase text-muted-foreground">Platform Commission Split (%)</label>
              <input
                type="number"
                value={config.commission}
                onChange={(e) => {
                  setConfig({ ...config, commission: Number(e.target.value) });
                  setIsDirty(true);
                }}
                className="h-9 w-full rounded-xl border border-border bg-background px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary font-bold"
              />
            </div>
            <div className="space-y-1">
              <label className="text-foreground font-bold block text-[10px] uppercase text-muted-foreground">Tutor Pro Subscription Price (₹/mo)</label>
              <input
                type="number"
                value={config.tutorProPrice}
                onChange={(e) => {
                  setConfig({ ...config, tutorProPrice: Number(e.target.value) });
                  setIsDirty(true);
                }}
                className="h-9 w-full rounded-xl border border-border bg-background px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary font-bold"
              />
            </div>
            <div className="space-y-1">
              <label className="text-foreground font-bold block text-[10px] uppercase text-muted-foreground">Tutor Free Trial Duration (Days)</label>
              <input
                type="number"
                value={config.freeTrialDays}
                onChange={(e) => {
                  setConfig({ ...config, freeTrialDays: Number(e.target.value) });
                  setIsDirty(true);
                }}
                className="h-9 w-full rounded-xl border border-border bg-background px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary font-bold"
              />
            </div>
            <div className="space-y-1">
              <label className="text-foreground font-bold block text-[10px] uppercase text-muted-foreground">Student Referral Reward (Coins)</label>
              <input
                type="number"
                value={referralReward}
                onChange={(e) => {
                  setReferralReward(Number(e.target.value));
                  setIsDirty(true);
                }}
                className="h-9 w-full rounded-xl border border-border bg-background px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary font-bold"
              />
            </div>
            <div className="space-y-1">
              <label className="text-foreground font-bold block text-[10px] uppercase text-muted-foreground">GST &amp; Taxes Rate (%)</label>
              <input
                type="number"
                value={gstRate}
                onChange={(e) => {
                  setGstRate(Number(e.target.value));
                  setIsDirty(true);
                }}
                className="h-9 w-full rounded-xl border border-border bg-background px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary font-bold"
              />
            </div>
            <div className="space-y-1">
              <label className="text-foreground font-bold block text-[10px] uppercase text-muted-foreground">Processing Gateway Fee (%)</label>
              <input
                type="number"
                value={processingFee}
                onChange={(e) => {
                  setProcessingFee(Number(e.target.value));
                  setIsDirty(true);
                }}
                className="h-9 w-full rounded-xl border border-border bg-background px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary font-bold"
              />
            </div>
            <div className="space-y-1">
              <label className="text-foreground font-bold block text-[10px] uppercase text-muted-foreground">Withdrawal Settlement Fee (₹)</label>
              <input
                type="number"
                value={withdrawalFee}
                onChange={(e) => {
                  setWithdrawalFee(Number(e.target.value));
                  setIsDirty(true);
                }}
                className="h-9 w-full rounded-xl border border-border bg-background px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary font-bold"
              />
            </div>
          </div>
          <div className="flex items-center justify-between pt-2">
            {isDirty ? (
              <span className="text-[10px] text-amber-500 font-extrabold flex items-center gap-1.5 animate-pulse">
                <ShieldAlert size={12} /> You have unsaved configuration changes
              </span>
            ) : (
              <div />
            )}
            <Button type="submit" size="sm" className="rounded-xl px-4 py-2 font-bold text-xs cursor-pointer">
              Save Pricing Settings
            </Button>
          </div>
        </form>
      </Card>

      {/* WITHDRAWALS APPROVAL QUEUE */}
      <Card className="p-5 border-border/40 bg-card shadow-soft">
        <h4 className="text-xs font-heading font-extrabold uppercase text-foreground border-b border-border/40 pb-2.5 mb-4 flex items-center gap-2">
          <Wallet size={14} className="text-primary animate-pulse" /> Tutor Withdrawal Requests Queue
        </h4>
        {isLoading ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse animate-pulse">
              <thead>
                <tr className="border-b border-border/40 text-[10px] text-muted-foreground font-extrabold uppercase tracking-wider select-none">
                  <th className="py-3 px-3">Request ID</th>
                  <th className="py-3 px-3">Date Submitted</th>
                  <th className="py-3 px-3">Settlement Method</th>
                  <th className="py-3 px-3">Payout Destination Details</th>
                  <th className="py-3 px-3">Amount Requested</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20 text-xs font-semibold">
                {[1, 2, 3].map((n) => (
                  <tr key={n}>
                    <td className="py-4 px-3"><div className="h-4 bg-muted rounded w-16"></div></td>
                    <td className="py-4 px-3"><div className="h-4 bg-muted rounded w-20"></div></td>
                    <td className="py-4 px-3"><div className="h-5 bg-muted rounded w-14"></div></td>
                    <td className="py-4 px-3"><div className="h-4 bg-muted rounded w-32"></div></td>
                    <td className="py-4 px-3"><div className="h-5 bg-muted rounded w-16"></div></td>
                    <td className="py-4 px-3"><div className="h-5 bg-muted rounded w-12"></div></td>
                    <td className="py-4 px-3 text-right"><div className="h-8 bg-muted rounded w-24 ml-auto"></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : payouts.length === 0 ? (
          <div className="text-center py-8 px-4 border border-dashed border-border/50 rounded-xl bg-muted/10 text-muted-foreground/70 flex flex-col items-center justify-center gap-1.5">
            <Wallet size={18} className="text-muted-foreground/40" />
            <span>No withdrawal requests pending audit.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border/40 text-[10px] text-muted-foreground font-extrabold uppercase tracking-wider select-none">
                  <th className="py-3 px-3">Request ID</th>
                  <th className="py-3 px-3">Date Submitted</th>
                  <th className="py-3 px-3">Settlement Method</th>
                  <th className="py-3 px-3">Payout Destination Details</th>
                  <th className="py-3 px-3">Amount Requested</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20 text-xs font-semibold">
                {payouts.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-4 px-3 text-foreground font-bold">{p.id}</td>
                    <td className="py-4 px-3 text-muted-foreground">{p.date}</td>
                    <td className="py-4 px-3">
                      <span className="px-2 py-0.5 rounded bg-muted text-[10px] font-extrabold uppercase">{p.method}</span>
                    </td>
                    <td className="py-4 px-3 text-muted-foreground font-mono text-[11px] truncate max-w-[200px]" title={p.bankDetails}>
                      {p.bankDetails || "N/A"}
                    </td>
                    <td className="py-4 px-3 text-foreground font-extrabold text-sm">₹{p.amount.toLocaleString()}</td>
                    <td className="py-4 px-3">
                      <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded ${
                        p.status === "Approved" ? "bg-emerald-500/10 text-emerald-600" :
                        p.status === "Rejected" ? "bg-rose-500/10 text-rose-600" : "bg-amber-500/10 text-amber-600"
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-4 px-3 text-right">
                      {p.status === "Pending" && (
                        <div className="flex gap-2 justify-end">
                          <Button
                            onClick={() => handleReleasePayout(p.id, p.amount)}
                            size="sm"
                            className="h-8 text-[9px] bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-3 rounded-xl cursor-pointer"
                          >
                            Approve Release
                          </Button>
                          <Button
                            onClick={() => handleHoldPayout(p.id, p.amount)}
                            variant="outline"
                            size="sm"
                            className="h-8 text-[9px] font-extrabold border-rose-500/20 hover:bg-rose-500/10 text-rose-500 rounded-xl cursor-pointer"
                          >
                            Reject Payout
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* ESCROW BALANCE LOGS */}
      <Card className="p-5 border-border/40 bg-card shadow-soft">
        <h4 className="text-xs font-heading font-extrabold uppercase text-foreground border-b border-border/40 pb-2.5 mb-4 flex items-center gap-2">
          <ShieldAlert size={14} className="text-indigo-500" /> Platform Escrow Balance Logs
        </h4>
        {isLoading ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse animate-pulse">
              <thead>
                <tr className="border-b border-border/40 text-[10px] text-muted-foreground font-extrabold uppercase tracking-wider select-none">
                  <th className="py-3 px-3">Escrow ID</th>
                  <th className="py-3 px-3">Course Purchased</th>
                  <th className="py-3 px-3">Checkout Date</th>
                  <th className="py-3 px-3">Order Total</th>
                  <th className="py-3 px-3">Tutor Share</th>
                  <th className="py-3 px-3">Platform Commission</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20 text-xs font-semibold">
                {[1, 2, 3].map((n) => (
                  <tr key={n}>
                    <td className="py-4 px-3"><div className="h-4 bg-muted rounded w-16"></div></td>
                    <td className="py-4 px-3"><div className="h-4 bg-muted rounded w-40"></div></td>
                    <td className="py-4 px-3"><div className="h-4 bg-muted rounded w-20"></div></td>
                    <td className="py-4 px-3"><div className="h-4 bg-muted rounded w-14"></div></td>
                    <td className="py-4 px-3"><div className="h-4 bg-muted rounded w-14"></div></td>
                    <td className="py-4 px-3"><div className="h-4 bg-muted rounded w-14"></div></td>
                    <td className="py-4 px-3"><div className="h-5 bg-muted rounded w-12"></div></td>
                    <td className="py-4 px-3 text-right"><div className="h-8 bg-muted rounded w-24 ml-auto"></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : escrows.length === 0 ? (
          <div className="text-center py-8 px-4 border border-dashed border-border/50 rounded-xl bg-muted/10 text-muted-foreground/70 flex flex-col items-center justify-center gap-1.5">
            <ShieldAlert size={18} className="text-muted-foreground/40" />
            <span>No active escrow balances found. Purchases from student checkouts will create escrow entries here.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border/40 text-[10px] text-muted-foreground font-extrabold uppercase tracking-wider select-none">
                  <th className="py-3 px-3">Escrow ID</th>
                  <th className="py-3 px-3">Course Purchased</th>
                  <th className="py-3 px-3">Checkout Date</th>
                  <th className="py-3 px-3">Order Total</th>
                  <th className="py-3 px-3">Tutor Share</th>
                  <th className="py-3 px-3">Platform Commission</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20 text-xs font-semibold">
                {escrows.map((esc) => (
                  <tr key={esc.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-4 px-3 font-bold text-foreground">{esc.id}</td>
                    <td className="py-4 px-3 text-foreground font-bold">{esc.courseTitle}</td>
                    <td className="py-4 px-3 text-muted-foreground">{esc.date}</td>
                    <td className="py-4 px-3 font-bold text-foreground">₹{esc.amount.toLocaleString()}</td>
                    <td className="py-4 px-3 text-emerald-700 font-extrabold">₹{esc.tutorShare.toLocaleString()}</td>
                    <td className="py-4 px-3 text-muted-foreground font-bold">₹{esc.platformShare.toLocaleString()}</td>
                    <td className="py-4 px-3">
                      <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded ${
                        esc.status === "Released" ? "bg-emerald-500/10 text-emerald-700" : "bg-amber-500/10 text-amber-700 animate-pulse"
                      }`}>
                        {esc.status}
                      </span>
                    </td>
                    <td className="py-4 px-3 text-right">
                      {esc.status === "Pending Release" && (
                        <Button
                          onClick={() => handleReleaseEscrow(esc.id, esc.courseTitle, esc.tutorShare)}
                          size="sm"
                          className="h-8 text-[9px] bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl cursor-pointer"
                        >
                          Release to Tutor
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </motion.div>
  );
}
