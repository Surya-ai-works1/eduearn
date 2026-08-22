"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DollarSign,
  Clock,
  TrendingUp,
  ArrowDownCircle,
  CheckCircle,
  BookOpen,
  Plus,
  Users,
  Video,
  BarChart3,
  XCircle,
  Loader2,
  Download,
  Building,
  CreditCard,
  Check,
  Shield,
  HelpCircle,
  Search,
  Filter,
  FileText,
  AlertTriangle,
  FileDown,
  Info,
  Calendar,
  Lock
} from "lucide-react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { toast } from "sonner";
import type { EarningsBalance } from "./types";
import type { WithdrawalRequest } from "../../features/payments/services/paymentService";
import { useTutor } from "../../context/TutorContext";

interface FinanceProps {
  earningsBalance: EarningsBalance;
  withdrawalsState: WithdrawalRequest[];
  withdrawForm: { amount: string; method: string; bankDetails: string };
  setWithdrawForm: React.Dispatch<
    React.SetStateAction<{ amount: string; method: string; bankDetails: string }>
  >;
  handleWithdrawalRequest: (e: React.FormEvent) => void;
}

export const Finance = React.memo(function Finance({
  earningsBalance,
  withdrawalsState,
  withdrawForm,
  setWithdrawForm,
  handleWithdrawalRequest,
}: FinanceProps) {
  const { handleTabChange } = useTutor();
  // Navigation tabs: "dashboard" | "transactions" | "bank" | "taxes"
  const [activeTab, setActiveTab] = useState<"dashboard" | "transactions" | "bank" | "taxes">("dashboard");

  // Chart range: "daily" | "weekly" | "monthly" | "yearly"
  const [earningsPeriod, setEarningsPeriod] = useState<"daily" | "weekly" | "monthly" | "yearly">("monthly");

  // Bank Details States
  const [bankDetails, setBankDetails] = useState({
    accountHolder: "Sahiti",
    bankName: "HDFC Bank Ltd",
    accountNumber: "5010043219087",
    ifsc: "HDFC0000120",
    upiId: "sahiti@hdfcbank",
    isPrimary: true,
    isVerified: true
  });
  const [isEditingBank, setIsEditingBank] = useState(false);

  // Invoices Center State
  const [selectedInvoice, setSelectedInvoice] = useState<string | null>(null);

  // Transaction Ledger Filters
  const [ledgerSearch, setLedgerSearch] = useState("");
  const [ledgerType, setLedgerType] = useState("All");
  const [ledgerStatus, setLedgerStatus] = useState("All");

  // Mock ledger data combining income payouts adjustments etc
  const mockTransactions = useMemo(() => {
    return [
      { id: "TXN-1082", date: "2026-08-01", type: "Income", amount: 4500, details: "Student enrollment: Linear Algebra (Aarav Mehta)", status: "Completed" },
      { id: "TXN-1081", date: "2026-07-28", type: "Withdrawal", amount: -15000, details: "Payout to HDFC Bank", status: "Completed" },
      { id: "TXN-1080", date: "2026-07-25", type: "Income", amount: 4500, details: "Student enrollment: Full-Stack Web Dev (Sahiti)", status: "Completed" },
      { id: "TXN-1079", date: "2026-07-22", type: "Taxes", amount: -450, details: "ITR source TDS deduction (10%)", status: "Completed" },
      { id: "TXN-1078", date: "2026-07-20", type: "Bonus", amount: 5000, details: "Milestone Incentive: Top Rated Tutor Course", status: "Completed" },
      { id: "TXN-1077", date: "2026-07-15", type: "Platform Commission", amount: -450, details: "EduEarn platforms processing commission fee (10%)", status: "Completed" }
    ];
  }, []);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return mockTransactions.filter(txn => {
      const matchesSearch = txn.details.toLowerCase().includes(ledgerSearch.toLowerCase()) || txn.id.toLowerCase().includes(ledgerSearch.toLowerCase());
      const matchesType = ledgerType === "All" || txn.type === ledgerType;
      const matchesStatus = ledgerStatus === "All" || txn.status === ledgerStatus;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [mockTransactions, ledgerSearch, ledgerType, ledgerStatus]);

  // Earnings graph simulated datasets
  const earningsChartData = useMemo(() => {
    if (earningsPeriod === "daily") {
      return [
        { label: "Mon", amount: 4500 },
        { label: "Tue", amount: 9000 },
        { label: "Wed", amount: 0 },
        { label: "Thu", amount: 13500 },
        { label: "Fri", amount: 4500 },
        { label: "Sat", amount: 18000 },
        { label: "Sun", amount: 22500 }
      ];
    }
    if (earningsPeriod === "weekly") {
      return [
        { label: "Week 1", amount: 35000 },
        { label: "Week 2", amount: 48000 },
        { label: "Week 3", amount: 25000 },
        { label: "Week 4", amount: 62000 }
      ];
    }
    if (earningsPeriod === "yearly") {
      return [
        { label: "2023", amount: 180000 },
        { label: "2024", amount: 320000 },
        { label: "2025", amount: 550000 },
        { label: "2026", amount: 720000 }
      ];
    }
    // Monthly (default)
    return [
      { label: "Jan", amount: 28000 },
      { label: "Feb", amount: 35000 },
      { label: "Mar", amount: 42000 },
      { label: "Apr", amount: 48000 },
      { label: "May", amount: 52000 },
      { label: "Jun", amount: 68000 },
      { label: "Jul", amount: 85000 }
    ];
  }, [earningsPeriod]);

  // Processing Fee & Arrival Dates preview
  const estimatedProcessingDetails = useMemo(() => {
    const amt = parseFloat(withdrawForm.amount) || 0;
    const fee = amt * 0.02; // 2% gateway processing fee
    const arrivalDate = new Date();
    arrivalDate.setDate(arrivalDate.getDate() + 3); // 3 working days
    return {
      fee: fee.toFixed(2),
      arrival: arrivalDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    };
  }, [withdrawForm.amount]);

  // Invoices download simulator
  const handleDownloadInvoice = (txnId: string) => {
    toast.success(`Invoice for ${txnId} downloaded successfully!`);
  };

  return (
    <motion.div
      key="tutor-wallet-hub"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="space-y-6"
    >
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground font-heading">Finance &amp; Earnings Wallet</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Monitor course sales, submit payouts, manage bank accounts, and configure taxation statements.
          </p>
        </div>
      </div>

      {/* Top 6 KPI summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 select-none">
        {[
          { label: "Total Earnings", value: `₹${earningsBalance.total.toLocaleString()}`, badge: "Lifetime", color: "text-primary", border: "border-primary/20 bg-primary/5", icon: DollarSign },
          { label: "Available Balance", value: `₹${earningsBalance.available.toLocaleString()}`, badge: "Withdrawable", color: "text-emerald-500", border: "border-emerald-500/20 bg-emerald-500/[0.03]", icon: TrendingUp },
          { label: "Pending Payouts", value: `₹${earningsBalance.pending.toLocaleString()}`, badge: "In Escrow", color: "text-amber-500", border: "border-amber-500/20 bg-amber-500/[0.03]", icon: Clock },
          { label: "Lifetime Gross", value: `₹${(earningsBalance.total + earningsBalance.commission).toLocaleString()}`, badge: "Pre-tax", color: "text-muted-foreground", border: "border-border/60 bg-muted/5", icon: Building },
          { label: "This Month Gross", value: `₹${Math.round(earningsBalance.total * 0.35).toLocaleString()}`, badge: "August", color: "text-indigo-500", border: "border-indigo-500/20 bg-indigo-500/5", icon: Calendar },
          { label: "Next Payout Cycle", value: "Aug 25, 2026", badge: "Automatic", color: "text-violet-600", border: "border-violet-500/20 bg-violet-500/5", icon: Lock }
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <Card key={idx} className={`p-4 border ${item.border} shadow-soft hover:shadow-md transition-all flex flex-col justify-between min-h-[105px] text-left`}>
              <div className="flex justify-between items-start">
                <span className="text-[9px] font-black text-muted-foreground/80 uppercase tracking-wider">{item.label}</span>
                <span className="text-[8px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-background text-muted-foreground border border-border/40 select-none">
                  {item.badge}
                </span>
              </div>
              <div className="flex justify-between items-end mt-2.5">
                <h4 className={`text-base font-black tracking-tight leading-none ${item.color}`}>{item.value}</h4>
                <Icon size={14} className="text-muted-foreground/60 shrink-0" />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Tabs navigation */}
      <div className="flex bg-muted/40 p-0.5 rounded-button text-[10.5px] font-extrabold w-fit max-w-full overflow-x-auto">
        {[
          { id: "dashboard", label: "Earnings Dashboard" },
          { id: "transactions", label: "Transaction History Ledger" },
          { id: "bank", label: "Bank Account Details" },
          { id: "taxes", label: "Tax Summary Center" }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-1.5 rounded-button transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === tab.id
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT: DASHBOARD */}
      {activeTab === "dashboard" && (
        <div className="grid grid-cols-1 lg:grid-cols-[1.8fr_1.2fr] gap-6">
          {/* Left Column: Earnings Graph & Payout List */}
          <div className="space-y-6">
            <Card className="p-5 border border-border bg-card shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1">
                  <TrendingUp size={13} className="text-primary animate-pulse" /> Monthly Earnings Trend
                </h4>
                <div className="flex bg-muted/40 p-0.5 rounded text-[9px] font-bold">
                  {["daily", "weekly", "monthly", "yearly"].map(period => (
                    <button
                      key={period}
                      onClick={() => setEarningsPeriod(period as any)}
                      className={`px-2 py-1 rounded capitalize transition-all ${earningsPeriod === period ? "bg-card text-foreground" : "text-muted-foreground"}`}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bar graph simulation */}
              <div className="h-44 flex items-end justify-between px-2 pt-4 border-b border-border/30 relative">
                {earningsChartData.map((d, idx) => {
                  const barPct = (d.amount / 100000) * 100;
                  return (
                    <div key={idx} className="flex flex-col items-center gap-1 h-full justify-end flex-1 relative z-10 group">
                      <span className="text-[8px] font-extrabold text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity absolute -top-2">
                        ₹{d.amount.toLocaleString()}
                      </span>
                      <div
                        className="w-8 bg-primary hover:bg-primary/95 rounded-t transition-all cursor-default"
                        style={{ height: `${Math.max(barPct, 6)}%` }}
                        title={`${d.label}: ₹${d.amount}`}
                      />
                      <span className="text-[9px] font-extrabold text-muted-foreground mt-1.5">{d.label}</span>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Payout History Ledger */}
            <div className="space-y-3">
              <h3 className="text-xs font-extrabold uppercase text-muted-foreground tracking-wider flex items-center gap-1.5">
                <Clock size={12} className="text-primary" /> Payout Requests &amp; Approvals
              </h3>
              <div className="space-y-2">
                {withdrawalsState.map(wth => (
                  <Card
                    key={wth.id}
                    className="p-4 border border-border bg-card shadow-sm hover:shadow-soft transition-shadow flex items-center justify-between gap-3 text-xs font-semibold"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded bg-primary/10 text-primary flex items-center justify-center">
                        <ArrowDownCircle size={15} />
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground">
                          Payout request of ₹{wth.amount.toLocaleString()}
                        </h4>
                        <p className="text-[9px] text-muted-foreground mt-0.5">
                          {wth.date} &bull; Method: {wth.method} &bull; Reference: {wth.bankDetails}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`text-[8px] font-extrabold uppercase px-2 py-0.5 rounded border ${
                          wth.status === "Approved"
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600"
                            : wth.status === "Rejected"
                            ? "bg-rose-500/10 border-rose-500/20 text-rose-600"
                            : "bg-amber-500/10 border-amber-500/20 text-amber-600 animate-pulse"
                        }`}
                      >
                        {wth.status}
                      </span>
                      <Button
                        onClick={() => handleDownloadInvoice(wth.id)}
                        variant="ghost"
                        size="sm"
                        className="h-7 text-[9px] font-bold text-primary"
                      >
                        Receipt
                      </Button>
                    </div>
                  </Card>
                ))}
                {withdrawalsState.length === 0 && (
                  <p className="text-xs text-muted-foreground italic text-center py-8 bg-muted/10 border border-dashed border-border/40 rounded-card">
                    No payout request history logged.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Request Withdrawal Form & Security Settings */}
          <div className="space-y-6">
            {/* Request Withdrawal Box */}
            <Card variant="glass" className="p-5 space-y-4 shadow-sm text-xs font-semibold">
              <h4 className="text-xs font-bold uppercase text-foreground border-b border-border/60 pb-2">
                Request Withdrawal Payout
              </h4>
              <form onSubmit={handleWithdrawalRequest} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-extrabold uppercase text-muted-foreground">Enter Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 5000"
                    value={withdrawForm.amount}
                    onChange={e => setWithdrawForm(f => ({ ...f, amount: e.target.value }))}
                    className="h-10 w-full rounded border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
                  />
                  <div className="flex justify-between text-[8px] text-muted-foreground/80 mt-0.5">
                    <span>Processing Fee (2%): ₹{estimatedProcessingDetails.fee}</span>
                    <span>Arrival Est: {estimatedProcessingDetails.arrival}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-extrabold uppercase text-muted-foreground">Select Payout Channel *</label>
                  <select
                    value={withdrawForm.method}
                    onChange={e => setWithdrawForm(f => ({ ...f, method: e.target.value }))}
                    className="h-10 w-full rounded border border-border bg-card px-2 text-xs font-semibold text-foreground focus:outline-none"
                  >
                    <option value="UPI">UPI (Immediate Transfer)</option>
                    <option value="Bank">Direct Bank NEFT / RTGS</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-extrabold uppercase text-muted-foreground">UPI ID / Bank details Mapped *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. account@upi or HDFC bank IFSC details"
                    value={withdrawForm.bankDetails}
                    onChange={e => setWithdrawForm(f => ({ ...f, bankDetails: e.target.value }))}
                    className="h-10 w-full rounded border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-10 bg-primary hover:bg-primary/95 text-white font-bold uppercase tracking-wider text-xs"
                >
                  Initiate Payout
                </Button>
              </form>
            </Card>

            {/* Payout Security Details */}
            <Card variant="glass" className="p-5 space-y-4 text-xs font-semibold">
              <h4 className="text-xs font-bold uppercase text-foreground flex items-center gap-1.5 border-b border-border/60 pb-2">
                <Shield size={12} className="text-primary animate-pulse" /> Payout Channel Security
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Bank Identity verification</span>
                  <span className="text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 text-[9px] uppercase">
                    Verified
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">2FA Authentication status</span>
                  <span className="text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 text-[9px] uppercase">
                    Enabled
                  </span>
                </div>
                <div className="flex justify-between items-center border-t border-border/40 pt-2 text-[10px] text-muted-foreground">
                  <span>Last Withdrawal</span>
                  <span className="text-foreground font-bold">Yesterday, 11:30 AM</span>
                </div>
              </div>
            </Card>

            {/* Creator Actions Shortcuts */}
            <Card variant="glass" className="p-5 space-y-3 text-xs font-semibold select-none">
              <h4 className="text-xs font-bold uppercase text-foreground border-b border-border/60 pb-2 flex items-center gap-1.5">
                <Plus size={12} className="text-primary" /> Creator Actions
              </h4>
              <div className="grid grid-cols-2 gap-2 text-center">
                {[
                  { label: "Create Course", action: () => handleTabChange("courses"), bg: "bg-primary/5 border border-primary/20 text-primary hover:bg-primary/10", icon: BookOpen },
                  { label: "Schedule Live", action: () => handleTabChange("live-classes"), bg: "bg-rose-500/5 border border-rose-500/20 text-rose-500 hover:bg-rose-500/10", icon: Video },
                  { label: "View Students", action: () => handleTabChange("students"), bg: "bg-sky-500/5 border border-sky-500/20 text-sky-500 hover:bg-sky-500/10", icon: Users },
                  { label: "View Performance", action: () => handleTabChange("analytics"), bg: "bg-emerald-500/5 border border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/10", icon: BarChart3 }
                ].map((item, idx) => (
                  <button
                    key={idx}
                    onClick={item.action}
                    className={`p-2.5 rounded-xl text-[10px] font-bold cursor-pointer transition flex flex-col items-center gap-1.5 justify-center ${item.bg}`}
                  >
                    <item.icon size={12} />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* TAB CONTENT: TRANSACTION HISTORY LEDGER */}
      {activeTab === "transactions" && (
        <div className="space-y-4">
          <Card className="p-4 border border-border bg-card shadow-sm flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search reference numbers, courses..."
                value={ledgerSearch}
                onChange={e => setLedgerSearch(e.target.value)}
                className="h-9 w-full pl-9 pr-3 rounded border border-border bg-card text-xs font-semibold text-foreground focus:outline-none"
              />
            </div>

            <select
              value={ledgerType}
              onChange={e => setLedgerType(e.target.value)}
              className="h-9 rounded border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
            >
              <option value="All">All Types</option>
              <option value="Income">Income</option>
              <option value="Withdrawal">Withdrawal</option>
              <option value="Taxes">Taxes</option>
              <option value="Bonus">Bonus</option>
              <option value="Platform Commission">Platform Commission</option>
            </select>

            <select
              value={ledgerStatus}
              onChange={e => setLedgerStatus(e.target.value)}
              className="h-9 rounded border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
            </select>
          </Card>

          <Card className="p-4 border border-border bg-card shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse font-semibold">
                <thead>
                  <tr className="border-b border-border/60 text-muted-foreground text-[10px] font-extrabold uppercase">
                    <th className="py-2.5">TXN Reference</th>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30 text-foreground">
                  {filteredTransactions.map(txn => (
                    <tr key={txn.id} className="hover:bg-muted/15 transition-colors">
                      <td className="py-3 font-bold text-primary">{txn.id}</td>
                      <td>{txn.date}</td>
                      <td>
                        <span className={`text-[8.5px] font-bold uppercase px-1.5 py-0.5 rounded border ${
                          txn.type === "Income" || txn.type === "Bonus"
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600"
                            : "bg-gray-500/10 border-gray-500/20 text-gray-600"
                        }`}>
                          {txn.type}
                        </span>
                      </td>
                      <td className="max-w-[240px] truncate">{txn.details}</td>
                      <td className={`font-bold ${txn.amount > 0 ? "text-emerald-500" : "text-rose-500"}`}>
                        {txn.amount > 0 ? `+₹${txn.amount}` : `-₹${Math.abs(txn.amount)}`}
                      </td>
                      <td>
                        <span className="text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded border bg-emerald-500/10 border-emerald-500/20 text-emerald-600">
                          {txn.status}
                        </span>
                      </td>
                      <td>
                        <Button
                          onClick={() => handleDownloadInvoice(txn.id)}
                          variant="ghost"
                          size="sm"
                          className="h-6 text-[9px] font-bold text-primary p-0"
                        >
                          Invoice
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* TAB CONTENT: BANK DETAILS MANAGER */}
      {activeTab === "bank" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-semibold">
          <Card className="p-5 border border-border bg-card shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-border/40 pb-2.5">
              <h4 className="text-xs font-bold uppercase text-foreground flex items-center gap-1.5">
                <Building size={14} className="text-primary" /> Verified Bank Account details
              </h4>
              <Button
                onClick={() => setIsEditingBank(!isEditingBank)}
                variant="outline"
                className="h-7 text-[10px]"
              >
                {isEditingBank ? "Cancel" : "Edit bank"}
              </Button>
            </div>

            {isEditingBank ? (
              <form
                onSubmit={e => {
                  e.preventDefault();
                  setIsEditingBank(false);
                  toast.success("Bank details updated successfully!");
                }}
                className="space-y-3"
              >
                <div className="space-y-1">
                  <label className="text-[9px] uppercase text-muted-foreground">Account Holder Name</label>
                  <input
                    type="text"
                    value={bankDetails.accountHolder}
                    onChange={e => setBankDetails(prev => ({ ...prev, accountHolder: e.target.value }))}
                    className="h-9 w-full rounded border border-border bg-card px-2.5"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase text-muted-foreground">Bank Name</label>
                  <input
                    type="text"
                    value={bankDetails.bankName}
                    onChange={e => setBankDetails(prev => ({ ...prev, bankName: e.target.value }))}
                    className="h-9 w-full rounded border border-border bg-card px-2.5"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase text-muted-foreground">Account Number</label>
                  <input
                    type="text"
                    value={bankDetails.accountNumber}
                    onChange={e => setBankDetails(prev => ({ ...prev, accountNumber: e.target.value }))}
                    className="h-9 w-full rounded border border-border bg-card px-2.5"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase text-muted-foreground">IFSC Code</label>
                  <input
                    type="text"
                    value={bankDetails.ifsc}
                    onChange={e => setBankDetails(prev => ({ ...prev, ifsc: e.target.value }))}
                    className="h-9 w-full rounded border border-border bg-card px-2.5"
                  />
                </div>
                <Button type="submit" className="h-9 w-full bg-primary text-white">
                  Save bank details
                </Button>
              </form>
            ) : (
              <div className="space-y-3 text-xs">
                <div className="flex justify-between border-b border-border/20 pb-1.5">
                  <span className="text-muted-foreground">Account Holder</span>
                  <span className="text-foreground font-bold">{bankDetails.accountHolder}</span>
                </div>
                <div className="flex justify-between border-b border-border/20 pb-1.5">
                  <span className="text-muted-foreground">Bank name</span>
                  <span className="text-foreground font-bold">{bankDetails.bankName}</span>
                </div>
                <div className="flex justify-between border-b border-border/20 pb-1.5">
                  <span className="text-muted-foreground">Account number</span>
                  <span className="text-foreground font-bold">{bankDetails.accountNumber}</span>
                </div>
                <div className="flex justify-between border-b border-border/20 pb-1.5">
                  <span className="text-muted-foreground">IFSC</span>
                  <span className="text-foreground font-bold">{bankDetails.ifsc}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Primary payout account</span>
                  <span className="text-emerald-500 font-bold flex items-center gap-1"><Check size={11} /> Primary</span>
                </div>
              </div>
            )}
          </Card>

          <Card className="p-5 border border-border bg-card shadow-sm space-y-4 h-fit">
            <h4 className="text-xs font-bold uppercase text-foreground flex items-center gap-1.5 border-b border-border/40 pb-2.5">
              <CreditCard size={14} className="text-primary" /> UPI &amp; Digital Payments
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between border-b border-border/20 pb-1.5">
                <span className="text-muted-foreground">Registered UPI ID</span>
                <span className="text-foreground font-bold">{bankDetails.upiId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">PayPal Linked (Future Ready)</span>
                <span className="text-muted-foreground font-bold italic">Not configured</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB CONTENT: TAX SUMMARY CENTER */}
      {activeTab === "taxes" && (
        <Card variant="glass" className="p-5 space-y-4 shadow-sm text-xs font-semibold">
          <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
            <h4 className="text-xs font-bold uppercase text-foreground flex items-center gap-1">
              <FileText size={14} className="text-primary" /> Financial Year Tax Statement Summary
            </h4>
            <Button
              onClick={() => toast.success("Tax schedule documentation summary downloaded successfully!")}
              size="sm"
              className="h-8 text-[10px] font-bold bg-primary text-white gap-1.5"
            >
              <Download size={12} /> Download Tax Summary
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-center font-bold">
            <div className="p-3 bg-muted/20 border border-border/40 rounded">
              <span className="text-[9px] uppercase text-muted-foreground">Gross earnings</span>
              <p className="text-lg font-bold text-foreground mt-1">
                ₹{(earningsBalance.total * 1.11).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
            </div>
            <div className="p-3 bg-muted/20 border border-border/40 rounded">
              <span className="text-[9px] uppercase text-muted-foreground">EduEarn commission (10%)</span>
              <p className="text-lg font-bold text-rose-500 mt-1">
                -₹{(earningsBalance.total * 0.1).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
            </div>
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 rounded">
              <span className="text-[9px] uppercase text-rose-500/90 block">TDS Deductions (1%)</span>
              <p className="text-lg font-bold mt-1">
                -₹{(earningsBalance.total * 0.01).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
            </div>
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded">
              <span className="text-[9px] uppercase text-emerald-600/90 block">ITR taxable net income</span>
              <p className="text-lg font-bold mt-1">
                ₹{earningsBalance.total.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>

          <div className="p-3 bg-muted/30 border border-border/40 rounded text-[10px] text-muted-foreground flex items-start gap-2.5">
            <Info size={13} className="text-primary shrink-0 mt-0.5 animate-pulse" />
            <p className="leading-relaxed">
              TDS deductions are deposited directly to your PAN under section 194J/194M. Make sure your PAN details match your account profile to claim credits on your returns file.
            </p>
          </div>
        </Card>
      )}
    </motion.div>
  );
});
