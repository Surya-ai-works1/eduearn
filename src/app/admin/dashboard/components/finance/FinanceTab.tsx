"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Check, X, FileText, DollarSign, Wallet, ShieldAlert, ArrowRight,
  TrendingUp, Search, Download, Trash2, Play, HelpCircle, ArrowRightLeft, 
  SlidersHorizontal, RefreshCw, Layers, Plus, Calendar, AlertTriangle, 
  Eye, ShieldCheck, Clipboard, Globe, CheckCircle2, AlertCircle, Info, Ban,
  ChevronLeft, ChevronRight
} from "lucide-react";
import { toast } from "sonner";
import { Card } from "../../../../../components/ui/card";
import { Button } from "../../../../../components/ui/button";
import { cn } from "../../../../../utils/cn";
import { 
  PaymentService, WithdrawalRequest, EscrowLog, PlatformConfig, 
  PurchaseHistoryItem, RefundRequest 
} from "../../../../../features/payments/services/paymentService";

interface FinanceTabProps {
  logAuditAction: (actionStr: string) => void;
  activeTab?: string;
}

// --- EXTENDED SCHEMAS FOR ENTERPRISE FINANCE ---
interface CommissionRule {
  id: string;
  name: string;
  type: "standard" | "category" | "tutor";
  commissionPercent: number;
  target: string; // e.g. "Coding", "Amit Verma", or "Global"
  status: "Active" | "Inactive";
}

interface TaxRecord {
  id: string;
  type: "GST" | "TDS" | "Platform Tax" | "Country Tax";
  amount: number;
  ratePercent: number;
  transactionId: string;
  date: string;
}

interface GatewayHealth {
  name: string;
  status: "Operational" | "Degraded" | "Outage";
  latencyMs: number;
  successRatePercent: number;
}



// Global scope counter to avoid impure Date.now() / Math.random() inside components
let financeCounter = 0;
const generatePureFinanceId = (prefix: string): string => {
  financeCounter++;
  return `${prefix}_${financeCounter}_${Math.floor(Math.sin(financeCounter) * 100000).toString().replace("-", "")}`;
};

export default function FinanceTab({ logAuditAction, activeTab }: FinanceTabProps) {
  // --- CORE STATE VARIABLES ---
  const [activeFinanceTab, setActiveFinanceTab] = useState<"dashboard" | "transactions" | "withdrawals" | "tutors" | "commissions" | "refunds" | "tax" | "gateways">("dashboard");
  const [currentTime] = useState(() => Date.now());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (activeTab === "payments") {
      setActiveFinanceTab("transactions");
    } else {
      setActiveFinanceTab("dashboard");
    }
  }, [activeTab]);

  // Synchronized service states
  const [payouts, setPayouts] = useState<WithdrawalRequest[]>([]);
  const [escrows, setEscrows] = useState<EscrowLog[]>([]);
  const [purchases, setPurchases] = useState<PurchaseHistoryItem[]>([]);
  const [refundRequests, setRefundRequests] = useState<RefundRequest[]>([]);
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

  // Enterprise specific custom state configs
  const [commissionRules, setCommissionRules] = useState<CommissionRule[]>([]);
  const [taxRecords, setTaxRecords] = useState<TaxRecord[]>([]);
  
  // Custom interactive search / filters
  const [txSearchText, setTxSearchText] = useState("");
  const [txStatusFilter, setTxStatusFilter] = useState("all");
  const [txMethodFilter, setTxMethodFilter] = useState("all");

  const [wthSearchText, setWthSearchText] = useState("");
  const [wthStatusFilter, setWthStatusFilter] = useState("all");
  const [wthPage, setWthPage] = useState(1);
  const itemsPerPage = 8;

  const [selectedTxIds, setSelectedTxIds] = useState<string[]>([]);
  const [selectedWthIds, setSelectedWthIds] = useState<string[]>([]);

  // Detailed Modal states
  const [viewInvoiceTx, setViewInvoiceTx] = useState<PurchaseHistoryItem | null>(null);
  const [viewWthDetails, setViewWthDetails] = useState<WithdrawalRequest | null>(null);
  const [viewRefundDetails, setViewRefundDetails] = useState<RefundRequest | null>(null);

  // Time Analytics reports picker
  const [analyticsReportPeriod, setAnalyticsReportPeriod] = useState<"daily" | "weekly" | "monthly" | "quarterly" | "yearly">("monthly");

  // Config parameters
  const [gstRate, setGstRate] = useState(18);
  const [tdsRate, setTdsRate] = useState(10);
  const [processingFee, setProcessingFee] = useState(2);
  const [withdrawalFee, setWithdrawalFee] = useState(25);
  const [isDirty, setIsDirty] = useState(false);

  // --- INITIALIZERS & DATA ACCESS SYNC ---
  const loadEnterpriseFinanceData = () => {
    setIsLoading(true);
    try {
      // 1. Fetch from service layers
      const savedPurchases = PaymentService.getPurchaseHistory();
      setPurchases(savedPurchases);
      
      const savedPayouts = PaymentService.getWithdrawalHistory();
      setPayouts(savedPayouts);

      const savedEscrows = PaymentService.getEscrowLogs();
      setEscrows(savedEscrows);

      const savedRefunds = PaymentService.getRefundRequests();
      setRefundRequests(savedRefunds);

      setConfig(PaymentService.getPlatformConfig());

      // 2. Load custom rules or seed defaults
      const rulesSaved = localStorage.getItem("eduearn_commission_rules");
      if (rulesSaved) {
        setCommissionRules(JSON.parse(rulesSaved));
      } else {
        const seedRules: CommissionRule[] = [
          { id: "rule-1", name: "Standard Platform Split", type: "standard", commissionPercent: 10, target: "Global", status: "Active" },
          { id: "rule-2", name: "Coding Class Premium Tier", type: "category", commissionPercent: 20, target: "Coding", status: "Active" },
          { id: "rule-3", name: "Amit Verma Partnership Split", type: "tutor", commissionPercent: 15, target: "Amit Verma", status: "Active" }
        ];
        setCommissionRules(seedRules);
        localStorage.setItem("eduearn_commission_rules", JSON.stringify(seedRules));
      }

      // 3. Generate Tax records dynamically based on purchases
      const seededTaxes: TaxRecord[] = savedPurchases.map((p, idx) => ({
        id: `tax-${idx + 1}`,
        type: "GST",
        amount: Math.round(p.amount * 0.18),
        ratePercent: 18,
        transactionId: p.id,
        date: p.date
      }));
      setTaxRecords(seededTaxes);
    } catch (e) {
      console.error("Failed loading backend finance", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEnterpriseFinanceData();
  }, []);

  // --- MOCKED AUDIT TRAIL LOGGING ---
  const recordFinanceAudit = (action: string, oldValue: string, newValue: string) => {
    const newLog = {
      id: generatePureFinanceId("audit"),
      timestamp: new Date().toISOString(),
      actor: "Super Admin",
      action,
      roleName: "Finance",
      oldValue,
      newValue,
      ip: "192.168.1.100"
    };

    const saved = localStorage.getItem("eduearn_rbac_audit_logs");
    let currentLogs = [];
    if (saved) {
      try { currentLogs = JSON.parse(saved); } catch (e) {}
    }
    localStorage.setItem("eduearn_rbac_audit_logs", JSON.stringify([newLog, ...currentLogs]));

    logAuditAction(`[Finance Manager] ${action}`);
  };

  // --- WITHDRAWAL SETTLEMENT QUEUE ACTIONS ---
  const handleApproveWithdrawalRequest = (id: string, amount: number) => {
    // Prevent double payouts
    const target = payouts.find(w => w.id === id);
    if (!target || target.status !== "Pending") {
      toast.error("This withdrawal request is not pending and cannot be modified.");
      return;
    }

    const success = PaymentService.approveWithdrawal(id);
    if (success) {
      recordFinanceAudit("Approved Withdrawal Request", `ID ${id}`, `Approved (₹${amount})`);
      toast.success("Payout request successfully approved and released.");
      loadEnterpriseFinanceData();
    } else {
      toast.error("Failed to approve withdrawal request.");
    }
  };

  const handleHoldWithdrawalRequest = (id: string) => {
    // Move status to Processing
    const updated = payouts.map(w => {
      if (w.id === id) {
        return { ...w, status: "Processing" as const };
      }
      return w;
    });
    setPayouts(updated);
    localStorage.setItem("eduearn_tutor_withdrawals", JSON.stringify(updated));

    recordFinanceAudit("Placed Payout Hold", `ID ${id}`, "Processing Hold");
    toast.info("Withdrawal request placed on hold (Processing).");
  };

  const handleRejectWithdrawalRequest = (id: string, amount: number) => {
    const target = payouts.find(w => w.id === id);
    if (!target || target.status === "Approved") {
      toast.error("Approved payouts cannot be rejected.");
      return;
    }

    const success = PaymentService.rejectWithdrawal(id);
    if (success) {
      recordFinanceAudit("Rejected Withdrawal Request", `ID ${id}`, `Rejected (₹${amount})`);
      toast.warning("Payout request rejected and balance refunded to tutor.");
      loadEnterpriseFinanceData();
    } else {
      toast.error("Failed to reject withdrawal request.");
    }
  };

  const handleMarkAsPaid = (id: string) => {
    const updated = payouts.map(w => {
      if (w.id === id) {
        return { ...w, status: "Approved" as const }; // Mark Approved / Paid
      }
      return w;
    });
    setPayouts(updated);
    localStorage.setItem("eduearn_tutor_withdrawals", JSON.stringify(updated));

    recordFinanceAudit("Mark Payout Settled", `ID ${id}`, "Paid");
    toast.success("Settlement flagged as paid manually.");
  };

  // --- BULK OPERATIONS TOOLBAR ---
  const handleBulkApproveWithdrawals = () => {
    if (selectedWthIds.length === 0) {
      toast.warning("No items selected.");
      return;
    }

    let approvedCount = 0;
    selectedWthIds.forEach(id => {
      const target = payouts.find(w => w.id === id);
      if (target && target.status === "Pending") {
        PaymentService.approveWithdrawal(id);
        approvedCount++;
      }
    });

    recordFinanceAudit("Bulk Approved Withdrawals", `${selectedWthIds.length} items`, "Succeeded");
    toast.success(`Successfully approved ${approvedCount} withdrawal requests.`);
    setSelectedWthIds([]);
    loadEnterpriseFinanceData();
  };

  const handleBulkRejectWithdrawals = () => {
    if (selectedWthIds.length === 0) {
      toast.warning("No items selected.");
      return;
    }

    let rejectedCount = 0;
    selectedWthIds.forEach(id => {
      const target = payouts.find(w => w.id === id);
      if (target && target.status === "Pending") {
        PaymentService.rejectWithdrawal(id);
        rejectedCount++;
      }
    });

    recordFinanceAudit("Bulk Rejected Withdrawals", `${selectedWthIds.length} items`, "Succeeded");
    toast.warning(`Successfully rejected ${rejectedCount} withdrawal requests.`);
    setSelectedWthIds([]);
    loadEnterpriseFinanceData();
  };

  // --- REFUND MANAGEMENT ACTIONS ---
  const handleApproveRefund = (refundId: string) => {
    const matched = refundRequests.find(r => r.id === refundId);
    if (!matched || matched.status !== "Pending") return;

    // Security: Double refund checks
    const courseHistory = purchases.find(p => p.courseId === matched.courseId);
    if (courseHistory && courseHistory.status === "Refunded") {
      toast.error("Security Lock: Course has already been refunded. Double refund blocked.");
      return;
    }

    const success = PaymentService.updateRefundStatus(refundId, "Approved");
    if (success) {
      recordFinanceAudit("Refund Request Approved", `ID ${refundId}`, `Approved (₹${matched.amount})`);
      toast.success("Refund approved. Credits refunded to student wallet.");
      loadEnterpriseFinanceData();
    } else {
      toast.error("Failed to approve refund.");
    }
  };

  const handleRejectRefund = (refundId: string) => {
    const matched = refundRequests.find(r => r.id === refundId);
    if (!matched || matched.status !== "Pending") return;

    const success = PaymentService.updateRefundStatus(refundId, "Rejected");
    if (success) {
      recordFinanceAudit("Refund Request Rejected", `ID ${refundId}`, "Rejected");
      toast.info("Refund request rejected.");
      loadEnterpriseFinanceData();
    } else {
      toast.error("Failed to reject refund.");
    }
  };

  // --- COMMISSION CONFIGURATION RULES ---
  const handleCreateCommissionRule = (e: React.FormEvent) => {
    e.preventDefault();
    const targetForm = e.currentTarget as HTMLFormElement;
    const name = (targetForm.elements.namedItem("ruleName") as HTMLInputElement).value;
    const type = (targetForm.elements.namedItem("ruleType") as HTMLSelectElement).value as "standard" | "category" | "tutor";
    const target = (targetForm.elements.namedItem("ruleTarget") as HTMLInputElement).value;
    const commissionPercent = Number((targetForm.elements.namedItem("rulePercent") as HTMLInputElement).value);

    if (commissionPercent < 0 || commissionPercent > 100) {
      toast.error("Commission must be between 0% and 100%");
      return;
    }

    const newRule: CommissionRule = {
      id: generatePureFinanceId("rule"),
      name,
      type,
      commissionPercent,
      target: target || "Global",
      status: "Active"
    };

    const updated = [newRule, ...commissionRules];
    setCommissionRules(updated);
    localStorage.setItem("eduearn_commission_rules", JSON.stringify(updated));

    recordFinanceAudit("Commission Rule Added", "-", `${name} (${commissionPercent}%)`);
    toast.success("Commission rule added successfully.");
    targetForm.reset();
  };

  const handleToggleRuleStatus = (ruleId: string) => {
    const updated = commissionRules.map(rule => {
      if (rule.id === ruleId) {
        const nextStatus = rule.status === "Active" ? "Inactive" : "Active";
        recordFinanceAudit("Toggled Commission Rule Status", rule.name, nextStatus);
        return { ...rule, status: nextStatus as "Active" | "Inactive" };
      }
      return rule;
    });
    setCommissionRules(updated);
    localStorage.setItem("eduearn_commission_rules", JSON.stringify(updated));
    toast.success("Commission rule toggled.");
  };

  const handleSaveGlobalPricing = (e: React.FormEvent) => {
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

    PaymentService.updatePlatformConfig(config);
    recordFinanceAudit("Updated Platform Configuration", `Commission: ${config.commission}%`, "Saved Configuration");
    setIsDirty(false);
    toast.success("Pricing configurations saved successfully!");
  };

  // --- FILTERS PIPELINES ---
  const filteredTransactions = useMemo(() => {
    return purchases.filter(p => {
      const matchesSearch = 
        p.id.toLowerCase().includes(txSearchText.toLowerCase()) ||
        p.courseTitle.toLowerCase().includes(txSearchText.toLowerCase()) ||
        p.invoiceNo.toLowerCase().includes(txSearchText.toLowerCase());
      if (!matchesSearch) return false;

      if (txStatusFilter !== "all" && p.status.toLowerCase() !== txStatusFilter.toLowerCase()) return false;
      return true;
    });
  }, [purchases, txSearchText, txStatusFilter]);

  const filteredWithdrawals = useMemo(() => {
    return payouts.filter(w => {
      const matchesSearch = 
        w.id.toLowerCase().includes(wthSearchText.toLowerCase()) ||
        (w.bankDetails && w.bankDetails.toLowerCase().includes(wthSearchText.toLowerCase()));
      if (!matchesSearch) return false;

      if (wthStatusFilter !== "all" && w.status.toLowerCase() !== wthStatusFilter.toLowerCase()) return false;
      return true;
    });
  }, [payouts, wthSearchText, wthStatusFilter]);

  const paginatedWths = useMemo(() => {
    const startIndex = (wthPage - 1) * itemsPerPage;
    return filteredWithdrawals.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredWithdrawals, wthPage]);

  // --- KPI ANALYTICS CALCULATION DERIVATIONS ---
  const metrics = useMemo(() => {
    const gross = purchases.reduce((acc, curr) => acc + curr.amount, 0);
    const platform = Math.round((gross * config.commission) / 100);
    const tutor = gross - platform;
    const net = gross - platform; // Gross minus Platform commission
    const pendingWithdrawalSum = payouts.filter(w => w.status === "Pending").reduce((acc, curr) => acc + curr.amount, 0);
    const completedPayoutSum = payouts.filter(w => w.status === "Approved").reduce((acc, curr) => acc + curr.amount, 0);
    const failedTransactionsCount = purchases.filter(p => p.status === "Failed").length + 2; // Add mock fails

    return { gross, platform, tutor, net, pendingWithdrawalSum, completedPayoutSum, failedTransactionsCount };
  }, [purchases, payouts, config.commission]);

  // --- PAYMENT GATEWAYS MOCK INTEGRATION STATUS ---
  const GATEWAYS_ROSTER: GatewayHealth[] = [
    { name: "Stripe Gateway Integration", status: "Operational", latencyMs: 45, successRatePercent: 99.8 },
    { name: "Razorpay Checkout API", status: "Operational", latencyMs: 60, successRatePercent: 99.4 },
    { name: "PayPal Wallet Services", status: "Operational", latencyMs: 120, successRatePercent: 98.7 },
    { name: "NEFT/IMPS Direct Bank Transfer", status: "Operational", latencyMs: 5, successRatePercent: 100.0 }
  ];

  // --- REPORT EXPORTS ---
  const handleExportCSV = (type: "transactions" | "withdrawals") => {
    let headers = "";
    let rows = "";

    if (type === "transactions") {
      headers = "Transaction ID,Course,Amount,Status,Invoice No,Date\n";
      rows = purchases.map(p => `${p.id},"${p.courseTitle}",${p.amount},${p.status},${p.invoiceNo},${p.date}`).join("\n");
    } else {
      headers = "Request ID,Amount,Method,Status,Date,Bank Details\n";
      rows = payouts.map(w => `${w.id},${w.amount},${w.method},${w.status},${w.date},"${w.bankDetails || "N/A"}"`).join("\n");
    }

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `finance_${type}_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV report exported successfully.");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="space-y-6 text-left text-xs font-semibold select-none text-foreground"
    >
      
      {/* 🚀 ENTERPRISE FINANCE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-4 select-none">
        {activeTab === "payments" ? (
          <div>
            <h3 className="text-sm font-heading font-extrabold uppercase tracking-wide text-foreground">
              Enterprise Transaction &amp; Payments Ledger
            </h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Manage individual client payments, refund requests, failed transactions, and check webhook integrations.
            </p>
          </div>
        ) : (
          <div>
            <h3 className="text-sm font-heading font-extrabold uppercase tracking-wide text-foreground">
              Platform Financial &amp; Payout Ledger
            </h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Analyze platform gross/net revenue splits, track commissions, review pending tutor withdrawal requests, and download tax statements.
            </p>
          </div>
        )}
      </div>

      {/* 📊 Financial KPI Summary widget Cards Grid */}
      {activeTab === "payments" ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-3 bg-card border border-border/40 space-y-1 shadow-soft flex flex-col justify-between">
            <span className="text-[8px] text-muted-foreground font-black uppercase tracking-wider block">Gross Revenue Intake</span>
            <strong className="text-xl font-heading font-extrabold mt-1 text-primary">₹{metrics.gross.toLocaleString()}</strong>
          </Card>
          <Card className="p-3 bg-card border border-border/40 space-y-1 shadow-soft flex flex-col justify-between">
            <span className="text-[8px] text-muted-foreground font-black uppercase tracking-wider block">Successful Payments</span>
            <strong className="text-xl font-heading font-extrabold mt-1 text-emerald-500">{purchases.filter(p => p.status === "Success").length}</strong>
          </Card>
          <Card className="p-3 bg-card border border-border/40 space-y-1 shadow-soft flex flex-col justify-between">
            <span className="text-[8px] text-muted-foreground font-black uppercase tracking-wider block font-bold text-rose-500">Failed Payments</span>
            <strong className="text-xl font-heading font-extrabold mt-1 text-rose-600 dark:text-rose-400 font-extrabold">{metrics.failedTransactionsCount}</strong>
          </Card>
          <Card className="p-3 bg-card border border-border/40 space-y-1 shadow-soft flex flex-col justify-between">
            <span className="text-[8px] text-muted-foreground font-black uppercase tracking-wider block">Pending Refunds Volume</span>
            <strong className="text-xl font-heading font-extrabold mt-1 text-amber-500">₹{refundRequests.filter(r => r.status === "Pending").reduce((sum, r) => sum + r.amount, 0).toLocaleString()}</strong>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          <Card className="p-3 bg-card border border-border/40 space-y-1 shadow-soft flex flex-col justify-between">
            <span className="text-[8px] text-muted-foreground font-black uppercase tracking-wider block">Gross Revenue</span>
            <strong className="text-xl font-heading font-extrabold mt-1 text-primary">₹{metrics.gross.toLocaleString()}</strong>
          </Card>
          <Card className="p-3 bg-card border border-border/40 space-y-1 shadow-soft flex flex-col justify-between">
            <span className="text-[8px] text-muted-foreground font-black uppercase tracking-wider block">Net Revenue</span>
            <strong className="text-xl font-heading font-extrabold mt-1 text-emerald-500">₹{metrics.net.toLocaleString()}</strong>
          </Card>
          <Card className="p-3 bg-card border border-border/40 space-y-1 shadow-soft flex flex-col justify-between">
            <span className="text-[8px] text-muted-foreground font-black uppercase tracking-wider block">Platform Commission</span>
            <strong className="text-xl font-heading font-extrabold mt-1 text-cyan-500">₹{metrics.platform.toLocaleString()}</strong>
          </Card>
          <Card className="p-3 bg-card border border-border/40 space-y-1 shadow-soft flex flex-col justify-between">
            <span className="text-[8px] text-muted-foreground font-black uppercase tracking-wider block">Tutor Earnings</span>
            <strong className="text-xl font-heading font-extrabold mt-1 text-blue-500">₹{metrics.tutor.toLocaleString()}</strong>
          </Card>
          <Card className="p-3 bg-card border border-border/40 space-y-1 shadow-soft flex flex-col justify-between">
            <span className="text-[8px] text-muted-foreground font-black uppercase tracking-wider block">Pending Withdrawals</span>
            <strong className="text-xl font-heading font-extrabold mt-1 text-amber-500">₹{metrics.pendingWithdrawalSum.toLocaleString()}</strong>
          </Card>
          <Card className="p-3 bg-card border border-border/40 space-y-1 shadow-soft flex flex-col justify-between">
            <span className="text-[8px] text-muted-foreground font-black uppercase tracking-wider block">Completed Payouts</span>
            <strong className="text-xl font-heading font-extrabold mt-1 text-emerald-600 dark:text-emerald-400 font-extrabold">₹{metrics.completedPayoutSum.toLocaleString()}</strong>
          </Card>
        </div>
      )}

      {/* ── WORKSPACE TABS SWITCHER NAVIGATION ── */}
      <div className="flex border-b border-border/40 pb-px gap-4 select-none overflow-x-auto">
        {(["dashboard", "transactions", "withdrawals", "tutors", "commissions", "refunds", "tax", "gateways"] as const)
          .filter(tab => {
            if (activeTab === "payments") {
              return tab === "transactions" || tab === "refunds" || tab === "gateways";
            }
            if (activeTab === "finance") {
              return tab === "dashboard" || tab === "withdrawals" || tab === "tutors" || tab === "commissions" || tab === "tax";
            }
            return true;
          })
          .map(tab => (
            <button
              key={tab}
              onClick={() => setActiveFinanceTab(tab)}
              className={cn(
                "pb-3 text-[10px] font-black uppercase tracking-wider border-b-2 transition-all relative focus:outline-none shrink-0",
                activeFinanceTab === tab 
                  ? 'border-primary text-primary font-extrabold' 
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              {tab === "dashboard" && "📈 Revenue Dashboard"}
              {tab === "transactions" && "💸 Transaction Ledger"}
              {tab === "withdrawals" && `📥 Withdrawals Queue (${payouts.filter(w => w.status === "Pending").length})`}
              {tab === "tutors" && "👥 Tutor Balances"}
              {tab === "commissions" && "⚙️ Commission Configs"}
              {tab === "refunds" && `🔄 Refund requests (${refundRequests.filter(r => r.status === "Pending").length})`}
              {tab === "tax" && "🏛️ Tax Management"}
              {tab === "gateways" && "🔌 Gateways Health"}
            </button>
          ))}
      </div>

      {/* ── WORKSPACE CONTENT VIEWS PANEL ── */}
      <div className="min-h-[450px]">
        
        {/* SUB TAB 1: REVENUE DASHBOARD & REPORTS */}
        {activeFinanceTab === "dashboard" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Report Picker Picker */}
            <div className="flex items-center justify-between border-b border-border/10 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-foreground">Revenue Analytics Report period</span>
                <p className="text-[9px] text-muted-foreground mt-0.5">Toggle reports timelines to inspect gross net platform conversions.</p>
              </div>
              
              <div className="flex border border-border bg-card p-1 rounded-xl gap-1">
                {(["daily", "weekly", "monthly", "quarterly", "yearly"] as const).map(period => (
                  <button
                    key={period}
                    onClick={() => setAnalyticsReportPeriod(period)}
                    className={cn(
                      "px-2.5 py-1 text-[9px] font-black uppercase rounded-lg transition-all focus:outline-none",
                      analyticsReportPeriod === period ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>

            {/* Performance Gauges */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-4 border-border bg-card shadow-soft space-y-3">
                <span className="font-extrabold text-[9px] uppercase tracking-wider text-muted-foreground block">Revenue Stream Share</span>
                <div className="space-y-3 pt-1">
                  {[
                    { label: "Coding course sales", amount: Math.round(metrics.gross * 0.55), percent: 55, color: "bg-primary" },
                    { label: "Dance course sales", amount: Math.round(metrics.gross * 0.3), percent: 30, color: "bg-emerald-500" },
                    { label: "Academics course sales", amount: Math.round(metrics.gross * 0.15), percent: 15, color: "bg-amber-500" }
                  ].map(stream => (
                    <div key={stream.label} className="space-y-1">
                      <div className="flex items-center justify-between text-[9px]">
                        <span className="font-extrabold text-foreground">{stream.label}</span>
                        <span className="text-muted-foreground font-bold">₹{stream.amount.toLocaleString()} ({stream.percent}%)</span>
                      </div>
                      <div className="h-1.5 w-full bg-muted/30 rounded-full overflow-hidden border border-border/10">
                        <div 
                          className={cn("h-full rounded-full transition-all duration-500", stream.color)} 
                          style={{ width: `${stream.percent}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-4 border-border bg-card shadow-soft space-y-3 flex flex-col justify-between">
                <div>
                  <span className="font-extrabold text-[9px] uppercase tracking-wider text-muted-foreground block">Net Platform Retention Rate</span>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Calculated ratio of net platform margins relative to gross checkouts.</p>
                </div>
                
                <div className="py-2 flex flex-col items-center justify-center">
                  <div className="relative w-20 h-20 rounded-full border-8 border-muted/20 flex items-center justify-center font-heading font-extrabold text-base text-primary">
                    {config.commission}%
                    <div className="absolute inset-[-8px] rounded-full border-8 border-cyan-500 border-t-transparent border-l-transparent transition-transform duration-500" />
                  </div>
                </div>
              </Card>

              <Card className="p-4 border-border bg-card shadow-soft space-y-3 flex flex-col justify-between">
                <div>
                  <span className="font-extrabold text-[9px] uppercase tracking-wider text-muted-foreground block">Monthly Registrations Growth</span>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Growth metrics comparing student enrollment checkouts relative to last month.</p>
                </div>
                <div className="h-14 w-full flex items-end gap-1 px-2 select-none">
                  {[25, 45, 30, 55, 40, 70, 60, 90, 85, 100].map((val, idx) => (
                    <div key={idx} className="flex-1 bg-primary/25 hover:bg-primary/50 transition-colors rounded-t" style={{ height: `${val}%` }} title={`Data node: ${val}%`} />
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* SUB TAB 2: TRANSACTION CENTER */}
        {activeFinanceTab === "transactions" && (
          <div className="space-y-4 animate-fadeIn">
            {/* Filters Row */}
            <Card className="p-4 border-border/40 bg-card shadow-soft space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="md:col-span-2 relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search transaction ID, course title, invoice..."
                    value={txSearchText}
                    onChange={(e) => setTxSearchText(e.target.value)}
                    className="w-full h-9 pl-9 pr-3 rounded border border-border bg-muted/10 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary/20"
                  />
                </div>

                <select
                  value={txStatusFilter}
                  onChange={(e) => setTxStatusFilter(e.target.value)}
                  className="h-9 border border-border rounded bg-card px-2 text-[10px] font-bold focus:outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="success">Success</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                  <option value="refund pending">Refund Pending</option>
                </select>

                <div className="flex gap-2">
                  <Button 
                    onClick={() => handleExportCSV("transactions")}
                    variant="outline"
                    className="w-full h-9 border-border text-[9px] font-black uppercase flex items-center gap-1.5 focus:outline-none"
                  >
                    <Download size={12} className="text-primary" /> Export CSV Ledger
                  </Button>
                </div>
              </div>
            </Card>

            {/* Grid list */}
            <Card className="p-4 border-border bg-card shadow-soft">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-[10px]">
                  <thead>
                    <tr className="border-b border-border/60 text-[8px] uppercase tracking-wider font-extrabold text-muted-foreground select-none">
                      <th className="py-3.5 px-3">Transaction ID</th>
                      <th className="py-3.5 px-3">Purchased Course</th>
                      <th className="py-3.5 px-3">Order Total</th>
                      <th className="py-3.5 px-3">Tutor Share</th>
                      <th className="py-3.5 px-3">Commission</th>
                      <th className="py-3.5 px-3">Invoice No</th>
                      <th className="py-3.5 px-3">Status</th>
                      <th className="py-3.5 px-3">Date Checkout</th>
                      <th className="py-3.5 px-3 text-right pr-6">Invoice</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="text-center py-12 text-muted-foreground">
                          No matching transaction logs found.
                        </td>
                      </tr>
                    ) : (
                      filteredTransactions.map((tx) => {
                        const platCommission = Math.round((tx.amount * config.commission) / 100);
                        const tutShare = tx.amount - platCommission;

                        return (
                          <tr key={tx.id} className="border-b border-border/40 hover:bg-muted/15 transition-colors font-semibold">
                            <td className="py-3.5 px-3 text-foreground font-bold">{tx.id}</td>
                            <td className="py-3.5 px-3 text-foreground font-bold truncate max-w-[200px]" title={tx.courseTitle}>{tx.courseTitle}</td>
                            <td className="py-3.5 px-3 font-extrabold text-foreground">₹{tx.amount.toLocaleString()}</td>
                            <td className="py-3.5 px-3 text-emerald-500 font-extrabold">₹{tutShare.toLocaleString()}</td>
                            <td className="py-3.5 px-3 text-muted-foreground font-bold">₹{platCommission.toLocaleString()}</td>
                            <td className="py-3.5 px-3 text-muted-foreground font-mono text-[9px]">{tx.invoiceNo}</td>
                            <td className="py-3.5 px-3">
                              <span className={cn(
                                "px-2 py-0.5 rounded text-[8px] font-extrabold uppercase",
                                tx.status === "Success" ? "bg-emerald-500/10 text-emerald-600" :
                                tx.status === "Failed" ? "bg-rose-500/10 text-rose-600" : "bg-amber-500/10 text-amber-600"
                              )}>
                                {tx.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-3 text-muted-foreground">{new Date(tx.date).toLocaleDateString()}</td>
                            <td className="py-3.5 px-3 text-right">
                              <Button
                                variant="ghost"
                                onClick={() => setViewInvoiceTx(tx)}
                                className="h-7 px-2.5 text-[9px] font-black uppercase text-primary hover:bg-primary/5 focus:outline-none"
                              >
                                <Eye size={11} className="mr-1" /> View Invoice
                              </Button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* SUB TAB 3: WITHDRAWALS QUEUE */}
        {activeFinanceTab === "withdrawals" && (
          <div className="space-y-4 animate-fadeIn">
            {/* Bulk Toolbar */}
            {selectedWthIds.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between gap-3 p-3 rounded-card border border-primary/20 bg-primary/5 text-xs font-bold select-none"
              >
                <span className="text-[10px] text-primary font-black uppercase">Selected {selectedWthIds.length} withdrawals</span>
                <div className="flex gap-2">
                  <Button onClick={handleBulkApproveWithdrawals} size="sm" className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-bold">
                    Bulk Release Approved
                  </Button>
                  <Button onClick={handleBulkRejectWithdrawals} size="sm" className="h-8 bg-rose-600 hover:bg-rose-700 text-white text-[9px] font-bold">
                    Bulk Reject Requests
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Filters Row */}
            <Card className="p-4 border-border/40 bg-card shadow-soft space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="md:col-span-2 relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search request ID, destination details..."
                    value={wthSearchText}
                    onChange={(e) => setWthSearchText(e.target.value)}
                    className="w-full h-9 pl-9 pr-3 rounded border border-border bg-muted/10 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary/20"
                  />
                </div>

                <select
                  value={wthStatusFilter}
                  onChange={(e) => setWthStatusFilter(e.target.value)}
                  className="h-9 border border-border rounded bg-card px-2 text-[10px] font-bold focus:outline-none"
                >
                  <option value="all">All Request Statuses</option>
                  <option value="pending">Pending review</option>
                  <option value="approved">Approved / Settled</option>
                  <option value="rejected">Rejected / Cancelled</option>
                </select>

                <div className="flex gap-2">
                  <Button 
                    onClick={() => handleExportCSV("withdrawals")}
                    variant="outline"
                    className="w-full h-9 border-border text-[9px] font-black uppercase flex items-center gap-1.5 focus:outline-none"
                  >
                    <Download size={12} className="text-primary" /> Export CSV Queue
                  </Button>
                </div>
              </div>
            </Card>

            {/* Withdrawals List Table */}
            <Card className="p-4 border-border bg-card shadow-soft">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-[10px]">
                  <thead>
                    <tr className="border-b border-border/60 text-[8px] uppercase tracking-wider font-extrabold text-muted-foreground select-none">
                      <th className="py-3.5 px-3 w-8">
                        <input
                          type="checkbox"
                          checked={selectedWthIds.length === paginatedWths.length && paginatedWths.length > 0}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedWthIds(paginatedWths.map(w => w.id));
                            } else {
                              setSelectedWthIds([]);
                            }
                          }}
                          className="rounded border-border text-primary focus:ring-primary/20 cursor-pointer h-3.5 w-3.5"
                        />
                      </th>
                      <th className="py-3.5 px-3">Request ID</th>
                      <th className="py-3.5 px-3">Date Submitted</th>
                      <th className="py-3.5 px-3">Settlement Method</th>
                      <th className="py-3.5 px-3">Settlement Destination</th>
                      <th className="py-3.5 px-3">Amount Requested</th>
                      <th className="py-3.5 px-3">Status</th>
                      <th className="py-3.5 px-3 text-right pr-6">Queue Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedWths.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-12 text-muted-foreground">
                          No matching withdrawal requests found.
                        </td>
                      </tr>
                    ) : (
                      paginatedWths.map((w) => (
                        <tr key={w.id} className="border-b border-border/40 hover:bg-muted/15 transition-colors font-semibold">
                          <td className="py-3.5 px-3">
                            <input
                              type="checkbox"
                              checked={selectedWthIds.includes(w.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedWthIds([...selectedWthIds, w.id]);
                                } else {
                                  setSelectedWthIds(selectedWthIds.filter(id => id !== w.id));
                                }
                              }}
                              className="rounded border-border text-primary focus:ring-primary/20 cursor-pointer h-3.5 w-3.5"
                            />
                          </td>
                          <td className="py-3.5 px-3 text-foreground font-bold">{w.id}</td>
                          <td className="py-3.5 px-3 text-muted-foreground">{new Date(w.date).toLocaleDateString()}</td>
                          <td className="py-3.5 px-3">
                            <span className="bg-muted px-2 py-0.5 rounded text-[8px] font-black uppercase border">{w.method}</span>
                          </td>
                          <td className="py-3.5 px-3 text-muted-foreground font-mono text-[9px] truncate max-w-[200px]" title={w.bankDetails}>
                            {w.bankDetails || "N/A"}
                          </td>
                          <td className="py-3.5 px-3 font-extrabold text-foreground text-xs">₹{w.amount.toLocaleString()}</td>
                          <td className="py-3.5 px-3">
                            <span className={cn(
                              "px-2 py-0.5 rounded text-[8px] font-extrabold uppercase",
                              w.status === "Approved" ? "bg-emerald-500/10 text-emerald-600" :
                              w.status === "Rejected" ? "bg-rose-500/10 text-rose-600" : "bg-amber-500/10 text-amber-600"
                            )}>
                              {w.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {w.status === "Pending" ? (
                                <>
                                  <Button
                                    onClick={() => handleApproveWithdrawalRequest(w.id, w.amount)}
                                    size="sm"
                                    className="h-7 text-[9px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                                  >
                                    Approve
                                  </Button>
                                  <Button
                                    onClick={() => handleRejectWithdrawalRequest(w.id, w.amount)}
                                    variant="outline"
                                    size="sm"
                                    className="h-7 text-[9px] border-rose-500/25 hover:bg-rose-500/5 text-rose-500"
                                  >
                                    Reject
                                  </Button>
                                  <select
                                    onChange={(e) => {
                                      if (e.target.value === "hold") handleHoldWithdrawalRequest(w.id);
                                      if (e.target.value === "paid") handleMarkAsPaid(w.id);
                                      e.target.value = "none";
                                    }}
                                    className="h-7 border border-border rounded bg-card text-[9px] font-bold focus:outline-none"
                                  >
                                    <option value="none">More...</option>
                                    <option value="hold">Hold</option>
                                    <option value="paid">Mark Paid</option>
                                  </select>
                                </>
                              ) : (
                                <span className="text-muted-foreground/60 italic text-[9px] font-medium pr-2">Settlement complete</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {Math.ceil(filteredWithdrawals.length / itemsPerPage) > 1 && (
                <div className="flex items-center justify-between border-t border-border/40 pt-4 mt-2 select-none">
                  <span className="text-xs text-muted-foreground">Showing {(wthPage - 1) * itemsPerPage + 1} to {Math.min(wthPage * itemsPerPage, filteredWithdrawals.length)} of {filteredWithdrawals.length} requests</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setWthPage(p => Math.max(1, p - 1))}
                      disabled={wthPage === 1}
                      className="p-2 border border-border rounded-xl hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <button
                      onClick={() => setWthPage(p => Math.min(Math.ceil(filteredWithdrawals.length / itemsPerPage), p + 1))}
                      disabled={wthPage === Math.ceil(filteredWithdrawals.length / itemsPerPage)}
                      className="p-2 border border-border rounded-xl hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* SUB TAB 4: TUTOR BALANCES */}
        {activeFinanceTab === "tutors" && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <span className="text-[10px] font-black uppercase text-foreground">Tutor Wallets Available Balances</span>
              <p className="text-[9px] text-muted-foreground mt-0.5">Audit per-tutor revenue, commission margins, withdrawn balance sheets, and available wallet totals.</p>
            </div>

            <Card className="p-4 border-border bg-card shadow-soft">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-[10px]">
                  <thead>
                    <tr className="border-b border-border/60 text-[8px] uppercase tracking-wider font-extrabold text-muted-foreground select-none">
                      <th className="py-3 px-3">Tutor educator Name</th>
                      <th className="py-3 px-3">Gross sales revenue</th>
                      <th className="py-3 px-3">Platform share</th>
                      <th className="py-3 px-3">Pending release</th>
                      <th className="py-3 px-3">Total Withdrawn</th>
                      <th className="py-3 px-3">Available Wallet balance</th>
                      <th className="py-3 px-3">Refund rates</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: "Amit Verma", gross: 25000, platform: 2500, pending: 4200, withdrawn: 8000, available: 10300, refunds: 0 },
                      { name: "Priya Patel", gross: 18000, platform: 1800, pending: 3500, withdrawn: 2500, available: 10200, refunds: 1 },
                      { name: "Applied Tutor", gross: 2000, platform: 200, pending: 700, withdrawn: 0, available: 1100, refunds: 0 }
                    ].map((tutor, idx) => (
                      <tr key={idx} className="border-b border-border/40 hover:bg-muted/15 transition-colors font-semibold">
                        <td className="py-4 px-3 text-foreground font-bold">{tutor.name}</td>
                        <td className="py-4 px-3 font-extrabold text-foreground">₹{tutor.gross.toLocaleString()}</td>
                        <td className="py-4 px-3 text-muted-foreground font-bold">₹{tutor.platform.toLocaleString()}</td>
                        <td className="py-4 px-3 text-amber-500 font-bold">₹{tutor.pending.toLocaleString()}</td>
                        <td className="py-4 px-3 text-muted-foreground font-bold">₹{tutor.withdrawn.toLocaleString()}</td>
                        <td className="py-4 px-3 text-emerald-500 font-extrabold text-xs">₹{tutor.available.toLocaleString()}</td>
                        <td className="py-4 px-3 text-rose-500 font-bold">{tutor.refunds} requests</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* SUB TAB 5: COMMISSION CONFIGS */}
        {activeFinanceTab === "commissions" && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-fadeIn">
            
            {/* Config rule builder */}
            <div className="xl:col-span-1 space-y-4">
              <Card className="p-4 border-border bg-card shadow-soft space-y-3">
                <span className="font-extrabold text-[10px] uppercase text-foreground block">Add Commission Split Rule</span>
                
                <form onSubmit={handleCreateCommissionRule} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[8px] uppercase tracking-wider text-muted-foreground font-black">Rule Label Name</label>
                    <input
                      name="ruleName"
                      type="text"
                      required
                      placeholder="e.g. Coding Tier rule"
                      className="w-full h-8 border border-border rounded bg-muted/15 px-3 text-xs focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[8px] uppercase tracking-wider text-muted-foreground font-black">Rule Scope target type</label>
                    <select
                      name="ruleType"
                      className="w-full h-8 border border-border rounded bg-card px-2 text-xs focus:outline-none text-foreground font-semibold"
                    >
                      <option value="standard">Standard Global</option>
                      <option value="category">Category Based</option>
                      <option value="tutor">Tutor Based</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[8px] uppercase tracking-wider text-muted-foreground font-black">Target Target Category / Tutor</label>
                    <input
                      name="ruleTarget"
                      type="text"
                      placeholder="e.g. Coding or Amit Verma"
                      className="w-full h-8 border border-border rounded bg-muted/15 px-3 text-xs focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[8px] uppercase tracking-wider text-muted-foreground font-black">Commission Split Percent (%)</label>
                    <input
                      name="rulePercent"
                      type="number"
                      required
                      placeholder="15%"
                      className="w-full h-8 border border-border rounded bg-muted/15 px-3 text-xs focus:outline-none font-bold"
                    />
                  </div>

                  <Button type="submit" size="sm" className="w-full h-8.5 text-[10px] font-bold uppercase mt-2">
                    Create split Rule
                  </Button>
                </form>
              </Card>

              {/* Global config parameters form */}
              <Card className="p-4 border-border bg-card shadow-soft space-y-3">
                <span className="font-extrabold text-[10px] uppercase text-foreground block">Global Fee Parameters</span>
                <form onSubmit={handleSaveGlobalPricing} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[8px] uppercase tracking-wider text-muted-foreground font-black">Platform standard Commission (%)</label>
                    <input
                      type="number"
                      value={config.commission}
                      onChange={(e) => {
                        setConfig({ ...config, commission: Number(e.target.value) });
                        setIsDirty(true);
                      }}
                      className="h-8 w-full border border-border rounded bg-muted/15 px-3 text-xs focus:outline-none font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] uppercase tracking-wider text-muted-foreground font-black">Tutor Pro Subscription Price (₹)</label>
                    <input
                      type="number"
                      value={config.tutorProPrice}
                      onChange={(e) => {
                        setConfig({ ...config, tutorProPrice: Number(e.target.value) });
                        setIsDirty(true);
                      }}
                      className="h-8 w-full border border-border rounded bg-muted/15 px-3 text-xs focus:outline-none font-bold"
                    />
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    {isDirty && <span className="text-[7px] text-amber-500 font-extrabold animate-pulse">⚠️ Unsaved changes</span>}
                    <Button type="submit" size="sm" className="h-7 px-3 text-[9px] font-bold">Save Settings</Button>
                  </div>
                </form>
              </Card>
            </div>

            {/* Config rules registry */}
            <div className="xl:col-span-2 space-y-4">
              <Card className="p-4 border-border bg-card shadow-soft space-y-3">
                <span className="font-extrabold text-[10px] uppercase text-foreground block">Active Commission Split overrides</span>
                
                <div className="space-y-2">
                  {commissionRules.map((rule) => (
                    <div key={rule.id} className="border border-border/40 p-3 rounded bg-muted/5 hover:border-primary/20 transition-all flex items-center justify-between gap-3">
                      <div className="space-y-0.5">
                        <span className="font-extrabold text-foreground block text-[11px]">{rule.name}</span>
                        <span className="text-[9px] text-muted-foreground block">
                          Scope: <span className="text-foreground uppercase font-black">{rule.type}</span> | Target: {rule.target}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-primary font-heading font-extrabold text-sm">{rule.commissionPercent}%</span>
                        <button
                          onClick={() => handleToggleRuleStatus(rule.id)}
                          className={cn(
                            "px-2 py-0.5 rounded text-[8px] font-black uppercase border focus:outline-none",
                            rule.status === "Active" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/25" : "bg-muted text-muted-foreground"
                          )}
                        >
                          {rule.status}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

          </div>
        )}

        {/* SUB TAB 6: REFUND REQUESTS */}
        {activeFinanceTab === "refunds" && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <span className="text-[10px] font-black uppercase text-foreground">Student Course Refund Request queue</span>
              <p className="text-[9px] text-muted-foreground mt-0.5">Audit student course refund requests. Approving a refund credits the student available wallet balance and updates checkout logs.</p>
            </div>

            <Card className="p-4 border-border bg-card shadow-soft">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-[10px]">
                  <thead>
                    <tr className="border-b border-border/60 text-[8px] uppercase tracking-wider font-extrabold text-muted-foreground select-none">
                      <th className="py-3.5 px-3">Refund ID</th>
                      <th className="py-3.5 px-3">Candidate Course</th>
                      <th className="py-3.5 px-3">Student Name</th>
                      <th className="py-3.5 px-3">Refund Amount</th>
                      <th className="py-3.5 px-3">Reason / Details</th>
                      <th className="py-3.5 px-3">Status</th>
                      <th className="py-3.5 px-3 text-right pr-6">Review Decisions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {refundRequests.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-12 text-muted-foreground">
                          No active refund requests found.
                        </td>
                      </tr>
                    ) : (
                      refundRequests.map((r) => (
                        <tr key={r.id} className="border-b border-border/40 hover:bg-muted/15 transition-colors font-semibold">
                          <td className="py-3.5 px-3 text-foreground font-bold">{r.id}</td>
                          <td className="py-3.5 px-3 text-foreground font-bold truncate max-w-[200px]">{r.courseTitle}</td>
                          <td className="py-3.5 px-3 text-muted-foreground">{r.studentName}</td>
                          <td className="py-3.5 px-3 font-extrabold text-foreground text-xs">₹{r.amount.toLocaleString()}</td>
                          <td className="py-3.5 px-3 text-muted-foreground max-w-[180px] truncate" title={r.reason}>{r.reason}</td>
                          <td className="py-3.5 px-3">
                            <span className={cn(
                              "px-2 py-0.5 rounded text-[8px] font-extrabold uppercase",
                              r.status === "Approved" ? "bg-emerald-500/10 text-emerald-600" :
                              r.status === "Rejected" ? "bg-rose-500/10 text-rose-600" : "bg-amber-500/10 text-amber-600"
                            )}>
                              {r.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {r.status === "Pending" ? (
                                <>
                                  <Button
                                    onClick={() => handleApproveRefund(r.id)}
                                    size="sm"
                                    className="h-7 text-[9px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                                  >
                                    Approve
                                  </Button>
                                  <Button
                                    onClick={() => handleRejectRefund(r.id)}
                                    variant="outline"
                                    size="sm"
                                    className="h-7 text-[9px] border-rose-500/25 hover:bg-rose-500/5 text-rose-500"
                                  >
                                    Reject
                                  </Button>
                                </>
                              ) : (
                                <span className="text-muted-foreground/60 italic text-[9px] font-medium pr-2">Decision logged</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* SUB TAB 7: TAX MANAGEMENT */}
        {activeFinanceTab === "tax" && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <span className="text-[10px] font-black uppercase text-foreground">Tax Statement Roster logs</span>
              <p className="text-[9px] text-muted-foreground mt-0.5">Audit platform and tutor tax collections detailing GST, TDS, and country collections splits.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Roster logs */}
              <Card className="md:col-span-2 p-4 border-border bg-card shadow-soft space-y-3">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-[10px]">
                    <thead>
                      <tr className="border-b border-border/60 text-[8px] uppercase tracking-wider font-extrabold text-muted-foreground select-none">
                        <th className="pb-2">Tax ID</th>
                        <th className="pb-2">Type</th>
                        <th className="pb-2">Tax Rate</th>
                        <th className="pb-2">Tax Collected</th>
                        <th className="pb-2">Checkout Date</th>
                        <th className="pb-2">Source Order ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {taxRecords.map(tax => (
                        <tr key={tax.id} className="border-b border-border/30 hover:bg-muted/10 font-semibold">
                          <td className="py-2.5 text-foreground font-bold">{tax.id}</td>
                          <td className="py-2.5">
                            <span className="bg-primary/10 text-primary px-1.5 py-0.2 rounded text-[8px] font-black border border-primary/25">{tax.type}</span>
                          </td>
                          <td className="py-2.5 text-muted-foreground">{tax.ratePercent}%</td>
                          <td className="py-2.5 text-foreground font-extrabold">₹{tax.amount.toLocaleString()}</td>
                          <td className="py-2.5 text-muted-foreground">{new Date(tax.date).toLocaleDateString()}</td>
                          <td className="py-2.5 text-muted-foreground font-mono text-[9px]">{tax.transactionId}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Tax totals panel */}
              <Card className="p-4 border-border bg-card shadow-soft flex flex-col justify-between min-h-[220px]">
                <div className="space-y-2">
                  <span className="font-extrabold text-[10px] uppercase text-foreground block">Tax Collections Breakdown</span>
                  <div className="space-y-3 pt-2 text-[10px]">
                    <div className="flex items-center justify-between border-b border-border/10 pb-1.5">
                      <span className="text-muted-foreground font-bold">Total GST (18%) Collected</span>
                      <strong className="text-foreground">₹{taxRecords.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}</strong>
                    </div>
                    <div className="flex items-center justify-between border-b border-border/10 pb-1.5">
                      <span className="text-muted-foreground font-bold">TDS (10%) Reserved</span>
                      <strong className="text-foreground">₹{Math.round(metrics.gross * 0.1).toLocaleString()}</strong>
                    </div>
                    <div className="flex items-center justify-between border-b border-border/10 pb-1.5">
                      <span className="text-muted-foreground font-bold font-bold text-primary">Total Tax Collections</span>
                      <strong className="text-primary font-heading">₹{Math.round(taxRecords.reduce((acc, curr) => acc + curr.amount, 0) + (metrics.gross * 0.1)).toLocaleString()}</strong>
                    </div>
                  </div>
                </div>

                <Button variant="outline" className="w-full h-8.5 text-[9px] font-black uppercase mt-4">
                  Export IRS/GST tax statements
                </Button>
              </Card>

            </div>
          </div>
        )}

        {/* SUB TAB 8: GATEWAYS HEALTH */}
        {activeFinanceTab === "gateways" && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <span className="text-[10px] font-black uppercase text-foreground">Payment Gateways Checkout health status</span>
              <p className="text-[9px] text-muted-foreground mt-0.5">Live status metrics monitoring sandbox gateway integration latency and success rates logs.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {GATEWAYS_ROSTER.map((gw, idx) => (
                <Card key={idx} className="p-4 border-border bg-card shadow-soft flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="font-extrabold text-[11px] text-foreground block">{gw.name}</span>
                    <span className="text-[9px] text-muted-foreground block">
                      Latency: <span className="text-foreground font-bold">{gw.latencyMs} ms</span> | Success Rate: <span className="text-foreground font-bold">{gw.successRatePercent}%</span>
                    </span>
                  </div>

                  <span className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/25 px-2 py-0.5 rounded text-[8px] font-black uppercase">
                    {gw.status}
                  </span>
                </Card>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* --- INVOICE CENTER DETAIL MODAL --- */}
      <AnimatePresence>
        {viewInvoiceTx && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 select-none text-foreground">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewInvoiceTx(null)}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm cursor-pointer"
            />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card border border-border shadow-premium rounded-modal w-full max-w-lg p-6 relative z-10 text-left space-y-4"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border/20 pb-3">
                <div className="flex items-center gap-2 text-primary">
                  <FileText size={18} />
                  <span className="font-heading font-extrabold uppercase tracking-wide text-foreground">Invoice Statement Details</span>
                </div>
                <button onClick={() => setViewInvoiceTx(null)} className="p-1 rounded hover:bg-muted text-muted-foreground">
                  <X size={15} />
                </button>
              </div>

              {/* Invoice Body */}
              <div className="space-y-4 text-[10px] font-semibold">
                <div className="flex justify-between border-b border-border/10 pb-3">
                  <div>
                    <span className="text-[8px] text-muted-foreground uppercase font-black">Platform Vendor</span>
                    <strong className="block text-foreground mt-0.5">EduEarn LMS Portal</strong>
                    <span className="text-muted-foreground block mt-0.5">12th Floor, Tech Hub, Mumbai</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[8px] text-muted-foreground uppercase font-black">Invoice metadata</span>
                    <strong className="block text-foreground mt-0.5">{viewInvoiceTx.invoiceNo}</strong>
                    <span className="text-muted-foreground block mt-0.5">Date: {new Date(viewInvoiceTx.date).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Items grid */}
                <table className="w-full text-left border-collapse text-[10px]">
                  <thead>
                    <tr className="border-b border-border/20 text-[8px] uppercase tracking-wider font-extrabold text-muted-foreground">
                      <th className="pb-1.5">Description item</th>
                      <th className="pb-1.5 text-right">Gross Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border/10 font-bold">
                      <td className="py-2.5">
                        <span className="text-foreground font-extrabold">{viewInvoiceTx.courseTitle}</span>
                        <span className="text-[8px] text-muted-foreground block mt-0.5">Access license granted to learner candidate</span>
                      </td>
                      <td className="py-2.5 text-right font-extrabold text-foreground">₹{viewInvoiceTx.amount.toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td className="py-2 text-muted-foreground">GST Tax component (18% included)</td>
                      <td className="py-2 text-right text-muted-foreground">₹{Math.round(viewInvoiceTx.amount * 0.18).toLocaleString()}</td>
                    </tr>
                    <tr className="border-t border-border/20 font-black text-xs">
                      <td className="py-2.5 text-primary">Invoice Total Due Paid</td>
                      <td className="py-2.5 text-right text-primary">₹{viewInvoiceTx.amount.toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border/15">
                <Button variant="ghost" size="sm" onClick={() => setViewInvoiceTx(null)} className="h-8.5 text-[10px] font-bold uppercase">
                  Close Statement
                </Button>
                <Button size="sm" className="h-8.5 px-4 text-[10px] font-bold uppercase" onClick={() => toast.success("PDF statement print dispatched.")}>
                  Print Invoice
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}


