// src/lib/repositories/financeManagement/IFinanceManagementRepository.ts

import { TutorEarningsDetails, WithdrawalRequestItem } from "../../types/financeManagement";

export interface IFinanceManagementRepository {
  getTutorEarnings(tutorId: string): Promise<TutorEarningsDetails>;

  getWithdrawalRequests(tutorId: string): Promise<WithdrawalRequestItem[]>;

  requestWithdrawal(
    tutorId: string,
    amount: number,
    method: "UPI" | "Bank",
    bankDetails: string
  ): Promise<WithdrawalRequestItem>;
}
