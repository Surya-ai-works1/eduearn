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

  const loadFinanceData = () => {
    setPayouts(PaymentService.getWithdrawalHistory());
    setEscrows(PaymentService.getEscrowLogs());
    setConfig(PaymentService.getPlatformConfig());
  };

  useEffect(() => {
    loadFinanceData();
  }, []);

  const handleReleasePayout = (id: string, amount: number) => {
    PaymentService.approveWithdrawal(id);
    PaymentService.addNotification("Withdrawal Release Approved", `Your payout request of ₹${amount} has been approved and released.`, "system");
    logAuditAction(`Released tutor payout request: ID ${id} of ₹${amount}`);
    toast.success("Payout request approved and released.");
    loadFinanceData();
  };

  const handleHoldPayout = (id: string, amount: number) => {
    PaymentService.rejectWithdrawal(id);
    PaymentService.addNotification("Withdrawal Request Rejected", `Your payout request of ₹${amount} has been rejected.`, "system");
    logAuditAction(`Rejected tutor payout request: ID ${id} of ₹${amount}`);
    toast.info("Payout request rejected.");
    loadFinanceData();
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
    PaymentService.updatePlatformConfig(config);
    logAuditAction(`Updated platform configurations. Commission: ${config.commission}%, Pro Price: ₹${config.tutorProPrice}`);
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
      <Card className="p-5 border-border bg-card shadow-soft">
        <h4 className="text-xs font-heading font-extrabold uppercase text-foreground border-b border-border/20 pb-2 mb-4">
          Global Pricing &amp; Fee Configurations
        </h4>
        <form onSubmit={handleSaveConfig} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-foreground">Platform Commission Split (%)</label>
              <input
                type="number"
                value={config.commission}
                onChange={(e) => setConfig({ ...config, commission: Number(e.target.value) })}
                className="h-9 w-full rounded border border-border bg-muted/15 px-3 text-xs focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-foreground">Tutor Pro Subscription Price (₹/mo)</label>
              <input
                type="number"
                value={config.tutorProPrice}
                onChange={(e) => setConfig({ ...config, tutorProPrice: Number(e.target.value) })}
                className="h-9 w-full rounded border border-border bg-muted/15 px-3 text-xs focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-foreground">Tutor Free Trial Duration (Days)</label>
              <input
                type="number"
                value={config.freeTrialDays}
                onChange={(e) => setConfig({ ...config, freeTrialDays: Number(e.target.value) })}
                className="h-9 w-full rounded border border-border bg-muted/15 px-3 text-xs focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-foreground">Student Referral Reward (Coins)</label>
              <input
                type="number"
                value={referralReward}
                onChange={(e) => setReferralReward(Number(e.target.value))}
                className="h-9 w-full rounded border border-border bg-muted/15 px-3 text-xs focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-foreground">GST &amp; Taxes Rate (%)</label>
              <input
                type="number"
                value={gstRate}
                onChange={(e) => setGstRate(Number(e.target.value))}
                className="h-9 w-full rounded border border-border bg-muted/15 px-3 text-xs focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-foreground">Processing Gateway Fee (%)</label>
              <input
                type="number"
                value={processingFee}
                onChange={(e) => setProcessingFee(Number(e.target.value))}
                className="h-9 w-full rounded border border-border bg-muted/15 px-3 text-xs focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-foreground">Withdrawal Settlement Fee (₹)</label>
              <input
                type="number"
                value={withdrawalFee}
                onChange={(e) => setWithdrawalFee(Number(e.target.value))}
                className="h-9 w-full rounded border border-border bg-muted/15 px-3 text-xs focus:outline-none"
              />
            </div>
          </div>
          <Button type="submit" size="sm">Save Pricing Settings</Button>
        </form>
      </Card>

      {/* WITHDRAWALS APPROVAL QUEUE */}
      <Card className="p-5 border-border bg-card shadow-soft">
        <h4 className="text-xs font-heading font-extrabold uppercase text-foreground border-b border-border/20 pb-2 mb-3 flex items-center gap-2">
          <Wallet size={14} className="text-primary animate-pulse" /> Tutor Withdrawal Requests Queue
        </h4>
        <div className="space-y-3">
          {payouts.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground/60">
              No withdrawal requests pending audit.
            </div>
          ) : (
            payouts.map((p) => (
              <div
                key={p.id}
                className="border border-border/40 p-3.5 bg-muted/5 rounded-card flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div>
                  <h5 className="font-bold text-foreground text-xs">Request ID: {p.id}</h5>
                  <div className="flex flex-wrap gap-4 text-[10px] text-muted-foreground mt-1 font-semibold">
                    <span>Amount: <span className="text-foreground font-bold">₹{p.amount}</span></span>
                    <span>Method: {p.method}</span>
                    {p.bankDetails && <span>Details: {p.bankDetails}</span>}
                    <span>Date: {p.date}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center select-none">
                  <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded ${
                    p.status === "Approved" ? "bg-emerald-500/10 text-emerald-600" :
                    p.status === "Rejected" ? "bg-red-500/10 text-red-600" : "bg-amber-500/10 text-amber-600"
                  }`}>
                    {p.status}
                  </span>
                  
                  {p.status === "Pending" && (
                    <div className="flex gap-1">
                      <Button
                        onClick={() => handleReleasePayout(p.id, p.amount)}
                        size="sm"
                        className="h-8 text-[9px] bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        Approve Release
                      </Button>
                      <Button
                        onClick={() => handleHoldPayout(p.id, p.amount)}
                        variant="outline"
                        size="sm"
                        className="h-8 text-[9px]"
                      >
                        Reject Payout
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* ESCROW BALANCE LOGS */}
      <Card className="p-5 border-border bg-card shadow-soft">
        <h4 className="text-xs font-heading font-extrabold uppercase text-foreground border-b border-border/20 pb-2 mb-3 flex items-center gap-2">
          <ShieldAlert size={14} className="text-indigo-500" /> Platform Escrow Balance Logs
        </h4>
        <div className="space-y-3">
          {escrows.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground/60">
              No active escrow balances found. Purchases from student checkouts will create escrow entries here.
            </div>
          ) : (
            escrows.map((esc) => (
              <div
                key={esc.id}
                className="border border-border/40 p-3.5 bg-muted/5 rounded-card flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div>
                  <h5 className="font-bold text-foreground text-xs">Course: {esc.courseTitle}</h5>
                  <div className="flex flex-wrap gap-4 text-[10px] text-muted-foreground mt-1">
                    <span>Transaction Total: ₹{esc.amount}</span>
                    <span>Tutor Available Split: ₹{esc.tutorShare}</span>
                    <span>Platform Commission: ₹{esc.platformShare}</span>
                    <span>Date: {esc.date}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center select-none">
                  <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded ${
                    esc.status === "Released" ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"
                  }`}>
                    {esc.status}
                  </span>

                  {esc.status === "Pending Release" && (
                    <Button
                      onClick={() => handleReleaseEscrow(esc.id, esc.courseTitle, esc.tutorShare)}
                      size="sm"
                      className="h-8 text-[9px] bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      Release to Tutor
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </motion.div>
  );
}
