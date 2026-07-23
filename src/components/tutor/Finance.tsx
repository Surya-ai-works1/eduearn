"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import {
  DollarSign,
  Clock,
  TrendingUp,
  ArrowDownCircle,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { NoEarnings } from "./EmptyState";
import type { EarningsBalance } from "./types";
import type { WithdrawalRequest } from "../../features/payments/services/paymentService";

interface FinanceProps {
  earningsBalance: EarningsBalance;
  withdrawalsState: WithdrawalRequest[];
  withdrawForm: { amount: string; method: string; bankDetails: string };
  setWithdrawForm: React.Dispatch<React.SetStateAction<{ amount: string; method: string; bankDetails: string }>>;
  handleWithdrawalRequest: (e: React.FormEvent) => void;
}

export const Finance = React.memo(function Finance({
  earningsBalance,
  withdrawalsState,
  withdrawForm,
  setWithdrawForm,
  handleWithdrawalRequest,
}: FinanceProps) {
  const balanceCards = useMemo(() => [
    { label: "Total Revenue", value: `₹${earningsBalance.total.toLocaleString()}`, color: "text-foreground", border: "border-primary/20", bg: "bg-primary/5" },
    { label: "Available Balance", value: `₹${earningsBalance.available.toLocaleString()}`, color: "text-emerald-500", border: "", bg: "" },
    { label: "Pending Payout", value: `₹${earningsBalance.pending.toLocaleString()}`, color: "text-amber-500", border: "", bg: "" },
    { label: "Withdrawn", value: `₹${earningsBalance.withdrawn.toLocaleString()}`, color: "text-muted-foreground", border: "", bg: "" },
    { label: "Platform Share (10%)", value: `₹${earningsBalance.commission.toLocaleString()}`, color: "text-rose-500/80", border: "", bg: "" },
  ], [earningsBalance]);

  if (earningsBalance.total === 0 && withdrawalsState.length === 0) {
    return (
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
        <NoEarnings onAction={() => {}} />
      </motion.div>
    );
  }

  return (
    <motion.div
      key="tutor-finance"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-8"
    >
      {/* Balance Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {balanceCards.map((card) => (
          <Card
            key={card.label}
            variant="glass"
            className={`p-5 flex flex-col gap-2 min-h-[96px] justify-between border border-border shadow-soft bg-card ${card.border} ${card.bg}`}
          >
            <span className="text-[10px] sm:text-xs font-extrabold text-muted-foreground uppercase tracking-wider select-none">{card.label}</span>
            <span className={`text-xl sm:text-2xl font-heading font-extrabold tracking-tight mt-1 ${card.color}`}>{card.value}</span>
          </Card>
        ))}
      </div>

      {/* Income breakdown */}
      <Card variant="glass" className="p-5 space-y-4 shadow-soft">
        <h4 className="text-sm font-heading font-extrabold uppercase text-foreground border-b border-border/40 pb-2">
          Income Breakdown &amp; Revenue Ledger
        </h4>
        <div className="space-y-3 font-semibold text-xs leading-relaxed">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Gross Sales (All Enrolled Students)</span>
            <span className="text-foreground font-extrabold">₹{(earningsBalance.total * 1.11).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
          </div>
          <div className="flex justify-between items-center text-rose-500">
            <span>Platform Commission (10%)</span>
            <span className="font-extrabold">-₹{(earningsBalance.total * 0.1).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
          </div>
          <div className="flex justify-between items-center text-rose-500">
            <span>TDS Deduction (1%)</span>
            <span className="font-extrabold">-₹{(earningsBalance.total * 0.01).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
          </div>
          <div className="flex justify-between items-center text-emerald-500 font-extrabold border-t border-border/40 pt-3 text-sm">
            <span>Net Creator Earnings</span>
            <span>₹{earningsBalance.total.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-6">
        {/* Transaction history */}
        <div className="space-y-4">
          <h3 className="text-sm sm:text-base font-heading font-extrabold uppercase tracking-wider text-foreground">
            Transaction &amp; Payout History
          </h3>
          {withdrawalsState.length === 0 ? (
            <div className="border border-border/65 bg-muted/10 p-8 rounded-card text-center text-xs text-muted-foreground select-none">
              <ArrowDownCircle size={24} className="text-muted-foreground/30 mx-auto mb-2" />
              <p className="font-extrabold">No withdrawal requests yet.</p>
              <p className="text-muted-foreground/70 mt-1">Submit a request when you have available balance.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {withdrawalsState.map((wth) => (
                <div
                  key={wth.id}
                  className="card-surface p-4 border border-border rounded-card flex items-center justify-between shadow-soft hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <ArrowDownCircle size={16} />
                    </div>
                    <div className="space-y-0.5">
                      <h5 className="font-extrabold text-foreground text-xs">Payout: ₹{wth.amount.toLocaleString()}</h5>
                      <span className="text-[10px] text-muted-foreground font-semibold block">
                        {wth.date} &bull; {wth.method} &bull; {wth.bankDetails}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`text-[9px] font-extrabold uppercase px-2 py-1 rounded flex items-center gap-1 shrink-0 ${
                      wth.status === "Approved"
                        ? "bg-emerald-500/10 text-emerald-500"
                        : wth.status === "Rejected"
                        ? "bg-rose-500/10 text-rose-500"
                        : "bg-amber-500/10 text-amber-500 animate-pulse"
                    }`}
                  >
                    {wth.status === "Approved" ? (
                      <CheckCircle size={10} />
                    ) : wth.status === "Rejected" ? (
                      <XCircle size={10} />
                    ) : (
                      <Loader2 size={10} className="animate-spin" />
                    )}
                    {wth.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Withdrawal form */}
        <Card variant="glass" className="p-5 h-fit shadow-soft">
          <form onSubmit={handleWithdrawalRequest} className="space-y-4">
            <h4 className="text-sm font-heading font-extrabold uppercase text-foreground border-b border-border/60 pb-2 mb-2">
              Request Withdrawal
            </h4>
            <div className="space-y-1.5 text-left text-xs font-semibold">
              <label className="text-[10px] font-extrabold text-foreground uppercase tracking-wider block">Amount (₹) *</label>
              <input
                type="number"
                required
                placeholder="e.g. 5000"
                value={withdrawForm.amount}
                onChange={(e) => setWithdrawForm((f) => ({ ...f, amount: e.target.value }))}
                className="h-11 w-full rounded-input border border-border bg-background px-3.5 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            <div className="space-y-1.5 text-left text-xs font-semibold">
              <label className="text-[10px] font-extrabold text-foreground uppercase tracking-wider block">Method *</label>
              <select
                value={withdrawForm.method}
                onChange={(e) => setWithdrawForm((f) => ({ ...f, method: e.target.value }))}
                className="h-11 w-full rounded-input border border-border bg-background px-3.5 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
              >
                <option value="UPI">UPI Transfer</option>
                <option value="Bank">Bank Transfer</option>
              </select>
            </div>
            <div className="space-y-1.5 text-left text-xs font-semibold">
              <label className="text-[10px] font-extrabold text-foreground uppercase tracking-wider block">UPI ID / Bank Details *</label>
              <input
                type="text"
                required
                placeholder="e.g. account@upi or account no"
                value={withdrawForm.bankDetails}
                onChange={(e) => setWithdrawForm((f) => ({ ...f, bankDetails: e.target.value }))}
                className="h-11 w-full rounded-input border border-border bg-background px-3.5 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            <Button type="submit" className="h-11 text-xs w-full shadow-soft font-bold uppercase tracking-wider">
              Submit Withdrawal
            </Button>
          </form>
        </Card>
      </div>

      {/* Tax Summary stub */}
      <Card variant="glass" className="p-5 shadow-soft">
        <h4 className="text-sm font-heading font-extrabold uppercase text-foreground border-b border-border/40 pb-2 mb-4">
          Tax Summary &amp; Retainers
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold">
          {[
            { label: "GST (18%)", value: `₹${(earningsBalance.total * 0.18).toLocaleString(undefined, { maximumFractionDigits: 0 })}`, note: "Collected on platform fees" },
            { label: "TDS (1%)", value: `₹${(earningsBalance.total * 0.01).toLocaleString(undefined, { maximumFractionDigits: 0 })}`, note: "Deducted at source" },
            { label: "Net Taxable", value: `₹{earningsBalance.total.toLocaleString()}`, note: "Report in ITR schedule" },
          ].map((item) => (
            <div key={item.label} className="p-4 border border-border/60 bg-muted/5 rounded-card space-y-1 select-none">
              <span className="text-[10px] font-extrabold uppercase text-muted-foreground tracking-wider block">{item.label}</span>
              <span className="text-lg font-heading font-extrabold text-foreground block">{item.value}</span>
              <span className="text-[10px] text-muted-foreground/60 block">{item.note}</span>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
});
