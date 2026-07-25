// src/lib/repositories/financeManagement/MockFinanceManagementRepository.ts

import { IFinanceManagementRepository } from "./IFinanceManagementRepository";
import { TutorEarningsDetails, WithdrawalRequestItem } from "../../types/financeManagement";

const STORAGE_KEY_EARNINGS = "eduearn_mock_earnings";
const STORAGE_KEY_WITHDRAWALS = "eduearn_mock_withdrawals";

const DEFAULT_EARNINGS: TutorEarningsDetails = {
  total: 45000,
  available: 28000,
  withdrawn: 17000,
  pending: 0,
  commission: 10,
};

const DEFAULT_WITHDRAWALS: WithdrawalRequestItem[] = [
  {
    id: "wth-1",
    amount: 10000,
    method: "UPI",
    status: "Approved",
    date: new Date(Date.now() - 7 * 24 * 3600 * 1000).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
    bankDetails: "tutor@upi",
  },
  {
    id: "wth-2",
    amount: 7000,
    method: "Bank",
    status: "Approved",
    date: new Date(Date.now() - 14 * 24 * 3600 * 1000).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
    bankDetails: "A/C: 1234567890, IFSC: HDFC0000123",
  },
];

export class MockFinanceManagementRepository implements IFinanceManagementRepository {
  private getLocalEarnings(): TutorEarningsDetails {
    if (typeof window === "undefined") return DEFAULT_EARNINGS;
    try {
      const saved = localStorage.getItem(STORAGE_KEY_EARNINGS);
      if (saved) return JSON.parse(saved);
    } catch {}
    localStorage.setItem(STORAGE_KEY_EARNINGS, JSON.stringify(DEFAULT_EARNINGS));
    return DEFAULT_EARNINGS;
  }

  private saveLocalEarnings(earnings: TutorEarningsDetails) {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY_EARNINGS, JSON.stringify(earnings));
  }

  private getLocalWithdrawals(): WithdrawalRequestItem[] {
    if (typeof window === "undefined") return DEFAULT_WITHDRAWALS;
    try {
      const saved = localStorage.getItem(STORAGE_KEY_WITHDRAWALS);
      if (saved) return JSON.parse(saved);
    } catch {}
    localStorage.setItem(STORAGE_KEY_WITHDRAWALS, JSON.stringify(DEFAULT_WITHDRAWALS));
    return DEFAULT_WITHDRAWALS;
  }

  private saveLocalWithdrawals(withdrawals: WithdrawalRequestItem[]) {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY_WITHDRAWALS, JSON.stringify(withdrawals));
  }

  async getTutorEarnings(tutorId: string): Promise<TutorEarningsDetails> {
    return this.getLocalEarnings();
  }

  async getWithdrawalRequests(tutorId: string): Promise<WithdrawalRequestItem[]> {
    return this.getLocalWithdrawals();
  }

  async requestWithdrawal(
    tutorId: string,
    amount: number,
    method: "UPI" | "Bank",
    bankDetails: string
  ): Promise<WithdrawalRequestItem> {
    const earnings = this.getLocalEarnings();
    if (amount > earnings.available) {
      throw new Error("Insufficient balance");
    }

    // Deduct available, add to pending
    earnings.available -= amount;
    earnings.pending += amount;
    this.saveLocalEarnings(earnings);

    const newRequest: WithdrawalRequestItem = {
      id: `wth-${Date.now()}`,
      amount,
      method,
      status: "Pending",
      date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
      bankDetails,
    };

    const withdrawals = this.getLocalWithdrawals();
    withdrawals.unshift(newRequest);
    this.saveLocalWithdrawals(withdrawals);

    return newRequest;
  }
}
