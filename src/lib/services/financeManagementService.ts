// src/lib/services/financeManagementService.ts

import { FinanceManagementRepository } from "../repositories/financeManagement";
import { TutorEarningsDetails, WithdrawalRequestItem } from "../types/financeManagement";

export class FinanceManagementService {
  async getTutorEarnings(tutorId: string): Promise<TutorEarningsDetails> {
    if (!tutorId) throw new Error("Tutor ID is required to fetch earnings");
    return FinanceManagementRepository.getTutorEarnings(tutorId);
  }

  async getWithdrawalRequests(tutorId: string): Promise<WithdrawalRequestItem[]> {
    if (!tutorId) throw new Error("Tutor ID is required to fetch withdrawal history");
    return FinanceManagementRepository.getWithdrawalRequests(tutorId);
  }

  async requestWithdrawal(
    tutorId: string,
    amount: number,
    method: "UPI" | "Bank",
    bankDetails: string
  ): Promise<WithdrawalRequestItem> {
    if (!tutorId) {
      throw new Error("Tutor ID is required");
    }
    if (!amount || amount <= 0) {
      throw new Error("Withdrawal amount must be greater than 0");
    }
    if (!bankDetails || !bankDetails.trim()) {
      throw new Error("UPI ID or Bank Details must be provided");
    }

    const earnings = await FinanceManagementRepository.getTutorEarnings(tutorId);
    if (amount > earnings.available) {
      throw new Error(`Insufficient balance. Your available balance is ${earnings.available}`);
    }

    return FinanceManagementRepository.requestWithdrawal(tutorId, amount, method, bankDetails);
  }
}

export const financeManagementService = new FinanceManagementService();
