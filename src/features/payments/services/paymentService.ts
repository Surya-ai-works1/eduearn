// Payment and Monetization Service Layer
// Manages Razorpay order simulation, coupons, wallet credits, tutor withdrawals, refunds, platform commission configs, and escrow releases.

export interface WalletTransaction {
  id: string;
  type: "credit" | "debit";
  amount: number;
  description: string;
  category: "refund" | "referral" | "bonus" | "purchase";
  date: string;
}

export interface PurchaseHistoryItem {
  id: string;
  courseId: string;
  courseTitle: string;
  amount: number;
  date: string;
  status: "Success" | "Failed" | "Refunded" | "Refund Pending";
  invoiceNo: string;
}

export interface WithdrawalRequest {
  id: string;
  amount: number;
  method: "UPI" | "Bank";
  status: "Pending" | "Approved" | "Rejected" | "Cancelled" | "Processing" | "Paid" | "Failed";
  date: string;
  bankDetails?: string;
}

export interface Coupon {
  code: string;
  type: "percentage" | "flat" | "referral" | "festival" | "tutor";
  value: number; // percentage or flat amount
  minPurchase: number;
  maxDiscount?: number;
  expiryDate: string;
  usageLimit: number;
  usageCount: number;
  status?: "Active" | "Inactive";
}

export interface RefundRequest {
  id: string;
  courseId: string;
  courseTitle: string;
  studentName: string;
  amount: number;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
  date: string;
}

export interface EscrowLog {
  id: string;
  courseTitle: string;
  amount: number;
  platformShare: number;
  tutorShare: number;
  status: "Pending Release" | "Released";
  date: string;
}

export interface PlatformConfig {
  commission: number;
  applicationFee: number;
  tutorProPrice: number;
  freeTrialDays: number;
  studentLimit: number;
  earningsLimit: number;
  storageLimit: number; // in GB
  aiCredits: number;
}

export interface TutorNotification {
  id: string;
  title: string;
  time: string;
  desc: string;
  type: "system" | "course" | "welcome" | "enrollment" | "payment" | "subscription";
  unread: boolean;
}

const isClient = typeof window !== "undefined";

export const PaymentService = {
  // --- CONFIG DETAILS ---
  getPlatformConfig(): PlatformConfig {
    const defaults: PlatformConfig = {
      commission: 10, // Changed default to 10% to align with original layout/FAQ
      applicationFee: 100,
      tutorProPrice: 499,
      freeTrialDays: 30,
      studentLimit: 5,
      earningsLimit: 5000,
      storageLimit: 50,
      aiCredits: 1000,
    };
    if (!isClient) return defaults;
    const saved = localStorage.getItem("eduearn_platform_config");
    return saved ? JSON.parse(saved) : defaults;
  },

  updatePlatformConfig(config: PlatformConfig) {
    if (isClient) {
      localStorage.setItem("eduearn_platform_config", JSON.stringify(config));
    }
  },

  // --- NOTIFICATIONS HELPERS ---
  getNotifications(): TutorNotification[] {
    const defaults: TutorNotification[] = [
      { id: "noti-1", title: "Payout Approved & Released", time: "2 hours ago", desc: "Your payout release of ₹4,500 has been verified by EduEarn Finance Audit and dispatched to your bank.", type: "system", unread: true },
      { id: "noti-2", title: "Course Verification Success", time: "1 day ago", desc: "Congratulations! Your course 'Mastering React Native Hooks & Layouts' has passed the platform commission review.", type: "course", unread: false },
      { id: "noti-3", title: "Welcome to EduEarn Creator Suite", time: "3 days ago", desc: "Congratulations on setting up your tutor account. You have 30 days of free, zero-commission access active.", type: "welcome", unread: false }
    ];
    if (!isClient) return defaults;
    const saved = localStorage.getItem("eduearn_tutor_notifications");
    if (!saved) {
      localStorage.setItem("eduearn_tutor_notifications", JSON.stringify(defaults));
      return defaults;
    }
    return JSON.parse(saved);
  },

  addNotification(title: string, desc: string, type: TutorNotification["type"]) {
    if (!isClient) return;
    const notifications = this.getNotifications();
    const newNoti: TutorNotification = {
      id: `noti-${Date.now()}`,
      title,
      time: "Just now",
      desc,
      type,
      unread: true,
    };
    notifications.unshift(newNoti);
    localStorage.setItem("eduearn_tutor_notifications", JSON.stringify(notifications));
  },

  markAllNotificationsRead() {
    if (!isClient) return;
    const notifications = this.getNotifications();
    const updated = notifications.map((n) => ({ ...n, unread: false }));
    localStorage.setItem("eduearn_tutor_notifications", JSON.stringify(updated));
  },

  // --- WALLET METHODS ---
  getWalletBalance() {
    const defaults = {
      total: 550,
      refund: 200,
      referral: 250,
      bonus: 100,
    };
    if (!isClient) return defaults;
    const saved = localStorage.getItem("eduearn_wallet_balance");
    if (!saved) {
      localStorage.setItem("eduearn_wallet_balance", JSON.stringify(defaults));
      return defaults;
    }
    return JSON.parse(saved);
  },

  getWalletTransactions(): WalletTransaction[] {
    const defaults: WalletTransaction[] = [
      { id: "tx-1", type: "credit", amount: 250, description: "Referral Bonus - Invited Alex", category: "referral", date: "2026-06-25 14:30" },
      { id: "tx-2", type: "credit", amount: 200, description: "Course Refund - Intro to Figma", category: "refund", date: "2026-06-20 09:15" },
      { id: "tx-3", type: "credit", amount: 100, description: "Welcome Signup Bonus", category: "bonus", date: "2026-06-15 10:00" },
    ];
    if (!isClient) return defaults;
    const saved = localStorage.getItem("eduearn_wallet_txs");
    if (!saved) {
      localStorage.setItem("eduearn_wallet_txs", JSON.stringify(defaults));
      return defaults;
    }
    return JSON.parse(saved);
  },

  deductWalletCredits(amount: number) {
    const balance = this.getWalletBalance();
    if (amount > balance.total) return false;
    
    let remaining = amount;
    if (balance.bonus >= remaining) {
      balance.bonus -= remaining;
      remaining = 0;
    } else {
      remaining -= balance.bonus;
      balance.bonus = 0;
    }

    if (remaining > 0 && balance.referral >= remaining) {
      balance.referral -= remaining;
      remaining = 0;
    } else if (remaining > 0) {
      remaining -= balance.referral;
      balance.referral = 0;
    }

    if (remaining > 0 && balance.refund >= remaining) {
      balance.refund -= remaining;
      remaining = 0;
    } else if (remaining > 0) {
      remaining -= balance.refund;
      balance.refund = 0;
    }

    balance.total -= amount;
    
    if (isClient) {
      localStorage.setItem("eduearn_wallet_balance", JSON.stringify(balance));
      const txs = this.getWalletTransactions();
      txs.unshift({
        id: `tx-${Date.now()}`,
        type: "debit",
        amount,
        description: "Applied credits at checkout",
        category: "purchase",
        date: new Date().toISOString().replace("T", " ").substring(0, 16),
      });
      localStorage.setItem("eduearn_wallet_txs", JSON.stringify(txs));
    }
    return true;
  },

  addWalletRefund(amount: number) {
    const balance = this.getWalletBalance();
    balance.refund += amount;
    balance.total += amount;
    if (isClient) {
      localStorage.setItem("eduearn_wallet_balance", JSON.stringify(balance));
      const txs = this.getWalletTransactions();
      txs.unshift({
        id: `tx-${Date.now()}`,
        type: "credit",
        amount,
        description: "Refund credited to wallet",
        category: "refund",
        date: new Date().toISOString().replace("T", " ").substring(0, 16),
      });
      localStorage.setItem("eduearn_wallet_txs", JSON.stringify(txs));
    }
  },

  // --- PURCHASE HISTORY METHODS ---
  getPurchaseHistory(): PurchaseHistoryItem[] {
    const defaults: PurchaseHistoryItem[] = [
      { id: "pur-1", courseId: "course-1", courseTitle: "Next.js 16 Masterclass", amount: 1499, date: "2026-06-10", status: "Success", invoiceNo: "INV-2026-001" },
      { id: "pur-2", courseId: "course-2", courseTitle: "UI/UX Advanced Blueprint", amount: 1999, date: "2026-06-12", status: "Success", invoiceNo: "INV-2026-002" },
    ];
    if (!isClient) return defaults;
    const saved = localStorage.getItem("eduearn_purchase_history");
    if (!saved) {
      localStorage.setItem("eduearn_purchase_history", JSON.stringify(defaults));
      return defaults;
    }
    return JSON.parse(saved);
  },

  async addPurchase(courseId: string, courseTitle: string, amount: number) {
    const { createClient } = require("../../../lib/supabase/client");
    const supabase = createClient();
    
    let category = "Programming";
    let basePrice = amount;
    try {
      const { data: dbCourse } = await supabase
        .from("courses")
        .select("category, price")
        .eq("id", courseId)
        .maybeSingle();
      if (dbCourse) {
        category = dbCourse.category;
        basePrice = Number(dbCourse.price || amount);
      }
    } catch (err) {
      console.warn("Failed to fetch course details for purchase split:", err);
    }

    // 2. Fetch category pricing rule from Supabase
    const { BusinessRulesDb } = require("../../../lib/businessRulesDb");
    const rules = await BusinessRulesDb.getCategoryRules();
    const rule = rules.find((r: any) => 
      r.id === category.toLowerCase().replace(/[&\s]+/g, "-").replace(/[^\w\-]+/g, "") ||
      r.name.toLowerCase() === category.toLowerCase()
    );

    const tutorBaseEarning = rule ? rule.tutorBaseEarning : Math.round(basePrice * 0.8);
    const recommendedSellingPrice = rule ? rule.recommendedSellingPrice : basePrice;
    const discountFunding = rule ? rule.discountFunding : "Platform-funded";

    const discountAmount = Math.max(0, basePrice - amount);

    let tutorShare = tutorBaseEarning;
    let platformShare = basePrice - tutorBaseEarning;

    if (discountAmount > 0) {
      if (discountFunding === "Platform-funded") {
        platformShare = Math.max(0, platformShare - discountAmount);
        tutorShare = tutorBaseEarning;
      } else if (discountFunding === "Tutor-funded") {
        tutorShare = Math.max(0, tutorBaseEarning - discountAmount);
        platformShare = basePrice - tutorBaseEarning;
      } else if (discountFunding === "Shared") {
        const tutorProp = tutorBaseEarning / (recommendedSellingPrice || 1);
        const tutorAbsorb = Math.round(discountAmount * tutorProp);
        const platformAbsorb = discountAmount - tutorAbsorb;

        tutorShare = Math.max(0, tutorBaseEarning - tutorAbsorb);
        platformShare = Math.max(0, (basePrice - tutorBaseEarning) - platformAbsorb);
      }
    }

    const difference = amount - (tutorShare + platformShare);
    if (difference !== 0) {
      platformShare += difference;
    }

    if (platformShare < 0) {
      tutorShare = Math.max(0, tutorShare + platformShare);
      platformShare = 0;
    }

    const history = this.getPurchaseHistory();
    const invNo = `INV-2026-${String(history.length + 1).padStart(3, "0")}`;
    const newPurchase: PurchaseHistoryItem = {
      id: `pur-${Date.now()}`,
      courseId,
      courseTitle,
      amount,
      date: new Date().toISOString().split("T")[0],
      status: "Success",
      invoiceNo: invNo,
    };
    
    history.unshift(newPurchase);
    if (isClient) {
      localStorage.setItem("eduearn_purchase_history", JSON.stringify(history));
    }

    // Update Tutor Earnings
    const earnings = this.getTutorEarnings();
    earnings.total += tutorShare;
    earnings.pending += tutorShare;
    earnings.commission += platformShare;
    this.saveTutorEarnings(earnings);

    // Save transaction in Admin escrow history
    const escrowTx: EscrowLog = {
      id: `escrow-${Date.now()}`,
      courseTitle,
      amount,
      platformShare,
      tutorShare,
      status: "Pending Release",
      date: new Date().toISOString().split("T")[0],
    };
    const escrowLogs = this.getEscrowLogs();
    escrowLogs.unshift(escrowTx);
    if (isClient) {
      localStorage.setItem("eduearn_escrow_logs", JSON.stringify(escrowLogs));
    }

    try {
      await supabase.from("audit_logs").insert({
        action: `Purchase Success: "${courseTitle}"`,
        details: `Student paid ₹${amount}. Tutor earning: ₹${tutorShare}, Platform: ₹${platformShare}. Funding: ${discountFunding}.`,
        ip_address: "127.0.0.1"
      });
    } catch (err) {
      console.warn("Failed to write purchase audit log to Supabase:", err);
    }

    return newPurchase;
  },

  // --- ESCROW LOGS ---
  getEscrowLogs(): EscrowLog[] {
    const defaults: EscrowLog[] = [];
    if (!isClient) return defaults;
    const saved = localStorage.getItem("eduearn_escrow_logs");
    if (!saved) {
      localStorage.setItem("eduearn_escrow_logs", JSON.stringify(defaults));
      return defaults;
    }
    return JSON.parse(saved);
  },

  releasePayout(escrowId: string) {
    const logs = this.getEscrowLogs();
    const idx = logs.findIndex(l => l.id === escrowId);
    if (idx !== -1 && logs[idx].status === "Pending Release") {
      logs[idx].status = "Released";
      if (isClient) {
        localStorage.setItem("eduearn_escrow_logs", JSON.stringify(logs));
      }

      // Shift tutor earnings from pending to available
      const earnings = this.getTutorEarnings();
      earnings.pending -= logs[idx].tutorShare;
      earnings.available += logs[idx].tutorShare;
      this.saveTutorEarnings(earnings);
      return true;
    }
    return false;
  },
  // --- COUPONS METHODS ---
  getCoupons(): Coupon[] {
    const defaults: Coupon[] = [
      { code: "WELCOME10", type: "percentage", value: 10, minPurchase: 500, maxDiscount: 200, expiryDate: "2026-12-31", usageLimit: 1000, usageCount: 142, status: "Active" },
      { code: "EDUSPARK500", type: "flat", value: 500, minPurchase: 1500, expiryDate: "2026-08-31", usageLimit: 500, usageCount: 88, status: "Active" },
      { code: "FESTIVAL30", type: "festival", value: 30, minPurchase: 1000, maxDiscount: 500, expiryDate: "2026-07-15", usageLimit: 200, usageCount: 12, status: "Inactive" },
      { code: "REF-LEARN", type: "referral", value: 15, minPurchase: 500, expiryDate: "2026-12-31", usageLimit: 100, usageCount: 4, status: "Active" },
    ];
    
    if (isClient) {
      const win = window as any;
      if (!win.__eduearn_synced_coupons) {
        win.__eduearn_synced_coupons = true;
        try {
          const { BusinessRulesDb } = require("../../../lib/businessRulesDb");
          BusinessRulesDb.getCoupons().then((dbCoupons: any[]) => {
            if (dbCoupons && dbCoupons.length > 0) {
              localStorage.setItem("eduearn_coupons", JSON.stringify(dbCoupons));
            } else {
              BusinessRulesDb.saveCoupons(defaults).catch(console.error);
            }
          }).catch(console.error);
        } catch (err) {
          console.error("Async pull of coupons from Supabase failed:", err);
        }
      }
    }

    if (!isClient) return defaults;
    const saved = localStorage.getItem("eduearn_coupons");
    if (!saved) {
      localStorage.setItem("eduearn_coupons", JSON.stringify(defaults));
      return defaults;
    }
    return JSON.parse(saved);
  },

  saveCoupons(coupons: Coupon[]): void {
    if (typeof window === "undefined") return;
    localStorage.setItem("eduearn_coupons", JSON.stringify(coupons));
    
    try {
      const { BusinessRulesDb } = require("../../../lib/businessRulesDb");
      BusinessRulesDb.saveCoupons(coupons).catch(console.error);
    } catch (err) {
      console.error("Async push of coupons to Supabase failed:", err);
    }
  },

  validateCoupon(code: string, purchaseAmount: number): { success: boolean; discountAmount: number; message: string } {
    const coupons = this.getCoupons();
    const coupon = coupons.find((c) => c.code.toUpperCase() === code.toUpperCase());
    if (!coupon) {
      return { success: false, discountAmount: 0, message: "Coupon code does not exist." };
    }
    
    if (coupon.status === "Inactive") {
      return { success: false, discountAmount: 0, message: "Coupon is currently inactive." };
    }

    if (new Date(coupon.expiryDate) < new Date()) {
      return { success: false, discountAmount: 0, message: "Coupon has expired." };
    }

    if (coupon.usageCount >= coupon.usageLimit) {
      return { success: false, discountAmount: 0, message: "Coupon usage limit reached." };
    }

    if (purchaseAmount < coupon.minPurchase) {
      return { success: false, discountAmount: 0, message: `Minimum purchase of ₹${coupon.minPurchase} required.` };
    }

    let discount = 0;
    if (coupon.type === "flat") {
      discount = coupon.value;
    } else {
      discount = (purchaseAmount * coupon.value) / 100;
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    }

    return { success: true, discountAmount: Math.round(discount), message: "Coupon applied successfully!" };
  },

  createCoupon(newCoupon: Omit<Coupon, "usageCount">) {
    const coupons = this.getCoupons();
    const coupon: Coupon = {
      ...newCoupon,
      usageCount: 0,
    };
    coupons.unshift(coupon);
    this.saveCoupons(coupons);
    return coupon;
  },

  deleteCoupon(code: string) {
    const coupons = this.getCoupons();
    const idx = coupons.findIndex(c => c.code.toUpperCase() === code.toUpperCase());
    if (idx !== -1) {
      coupons.splice(idx, 1);
      this.saveCoupons(coupons);
      return true;
    }
    return false;
  },

  // --- TUTOR EARNINGS & WITHDRAWALS ---
  getTutorEarnings() {
    const defaults = {
      total: 31500, // 45000 gross * 0.7 net share
      pending: 8400,  // 12000 * 0.7
      available: 12600, // 18000 * 0.7
      withdrawn: 10500, // 15000 * 0.7
      commission: 13500, // 45000 gross * 0.3 commission
    };
    if (!isClient) return defaults;
    const saved = localStorage.getItem("eduearn_tutor_earnings_balance");
    if (!saved) {
      localStorage.setItem("eduearn_tutor_earnings_balance", JSON.stringify(defaults));
      return defaults;
    }
    return JSON.parse(saved);
  },

  saveTutorEarnings(earnings: { total: number; pending: number; available: number; withdrawn: number; commission: number }) {
    if (isClient) {
      localStorage.setItem("eduearn_tutor_earnings_balance", JSON.stringify(earnings));
    }
  },

  getWithdrawalHistory(): WithdrawalRequest[] {
    const defaults: WithdrawalRequest[] = [
      { id: "wth-1", amount: 5000, method: "UPI", status: "Approved", date: "2026-06-22", bankDetails: "upi@paytm" },
      { id: "wth-2", amount: 10000, method: "Bank", status: "Approved", date: "2026-06-24", bankDetails: "A/C: ****5678" },
      { id: "wth-3", amount: 3000, method: "UPI", status: "Pending", date: "2026-06-28", bankDetails: "upi@okaxis" },
    ];
    if (!isClient) return defaults;
    const saved = localStorage.getItem("eduearn_tutor_withdrawals");
    if (!saved) {
      localStorage.setItem("eduearn_tutor_withdrawals", JSON.stringify(defaults));
      return defaults;
    }
    return JSON.parse(saved);
  },

  requestWithdrawal(amount: number, method: "UPI" | "Bank", bankDetails: string) {
    const earnings = this.getTutorEarnings();
    if (amount > earnings.available) {
      return { success: false, message: "Insufficient available balance." };
    }

    earnings.available -= amount;
    earnings.pending += amount;
    this.saveTutorEarnings(earnings);

    const withdrawals = this.getWithdrawalHistory();
    const request: WithdrawalRequest = {
      id: `wth-${Date.now()}`,
      amount,
      method,
      status: "Pending",
      date: new Date().toISOString().split("T")[0],
      bankDetails,
    };
    withdrawals.unshift(request);
    
    if (isClient) {
      localStorage.setItem("eduearn_tutor_withdrawals", JSON.stringify(withdrawals));
    }
    return { success: true, request };
  },

  approveWithdrawal(id: string) {
    const withdrawals = this.getWithdrawalHistory();
    const idx = withdrawals.findIndex((w) => w.id === id);
    if (idx !== -1 && withdrawals[idx].status === "Pending") {
      withdrawals[idx].status = "Approved";
      
      const earnings = this.getTutorEarnings();
      earnings.pending -= withdrawals[idx].amount;
      earnings.withdrawn += withdrawals[idx].amount;
      this.saveTutorEarnings(earnings);

      if (isClient) {
        localStorage.setItem("eduearn_tutor_withdrawals", JSON.stringify(withdrawals));
      }
      return true;
    }
    return false;
  },

  rejectWithdrawal(id: string) {
    const withdrawals = this.getWithdrawalHistory();
    const idx = withdrawals.findIndex((w) => w.id === id);
    if (idx !== -1 && withdrawals[idx].status === "Pending") {
      withdrawals[idx].status = "Rejected";
      
      const earnings = this.getTutorEarnings();
      earnings.pending -= withdrawals[idx].amount;
      earnings.available += withdrawals[idx].amount; // Refund balance
      this.saveTutorEarnings(earnings);

      if (isClient) {
        localStorage.setItem("eduearn_tutor_withdrawals", JSON.stringify(withdrawals));
      }
      return true;
    }
    return false;
  },

  // --- REFUNDS MANAGEMENT ---
  getRefundRequests(): RefundRequest[] {
    const defaults: RefundRequest[] = [
      { id: "ref-1", courseId: "course-3", courseTitle: "Python Backend Mastery", studentName: "Rohan Das", amount: 999, reason: "Course content is too basic.", status: "Pending", date: "2026-06-27" },
      { id: "ref-2", courseId: "course-4", courseTitle: "TypeScript Fundamentals", studentName: "Preeti Sen", amount: 499, reason: "Accidental purchase.", status: "Approved", date: "2026-06-25" },
    ];
    if (!isClient) return defaults;
    const saved = localStorage.getItem("eduearn_refund_requests");
    if (!saved) {
      localStorage.setItem("eduearn_refund_requests", JSON.stringify(defaults));
      return defaults;
    }
    return JSON.parse(saved);
  },

  requestRefund(courseId: string, courseTitle: string, amount: number, reason: string) {
    const refunds = this.getRefundRequests();
    const duplicate = refunds.find((r) => r.courseId === courseId && r.status === "Pending");
    if (duplicate) return { success: false, message: "Refund already pending for this course." };

    const request: RefundRequest = {
      id: `ref-${Date.now()}`,
      courseId,
      courseTitle,
      studentName: "Current Student",
      amount,
      reason,
      status: "Pending",
      date: new Date().toISOString().split("T")[0],
    };
    
    refunds.unshift(request);
    if (isClient) {
      localStorage.setItem("eduearn_refund_requests", JSON.stringify(refunds));
      
      // Update purchase history status
      const history = this.getPurchaseHistory();
      const purchase = history.find((p) => p.courseId === courseId);
      if (purchase) {
        purchase.status = "Refund Pending";
        localStorage.setItem("eduearn_purchase_history", JSON.stringify(history));
      }
    }

    return { success: true, request };
  },

  updateRefundStatus(id: string, status: "Approved" | "Rejected") {
    const refunds = this.getRefundRequests();
    const idx = refunds.findIndex((r) => r.id === id);
    if (idx !== -1 && refunds[idx].status === "Pending") {
      refunds[idx].status = status;
      
      if (isClient) {
        localStorage.setItem("eduearn_refund_requests", JSON.stringify(refunds));
        
        // Update purchase history status
        const history = this.getPurchaseHistory();
        const purchase = history.find((p) => p.courseId === refunds[idx].courseId);
        if (purchase) {
          purchase.status = status === "Approved" ? "Refunded" : "Success";
          localStorage.setItem("eduearn_purchase_history", JSON.stringify(history));
        }
      }

      if (status === "Approved") {
        this.addWalletRefund(refunds[idx].amount);
      }
      return true;
    }
    return false;
  },

  // --- RAZORPAY SIMULATION API ---
  async createRazorpayOrder(amount: number) {
    return {
      id: `order_${Math.random().toString(36).substring(2, 15)}`,
      amount: amount * 100, // paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };
  },
};
