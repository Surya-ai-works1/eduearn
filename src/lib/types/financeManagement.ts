// src/lib/types/financeManagement.ts

export interface TutorEarningsDetails {
  total: number;
  available: number;
  withdrawn: number;
  pending: number;
  commission: number;
}

export interface WithdrawalRequestItem {
  id: string;
  amount: number;
  method: "UPI" | "Bank";
  status: "Pending" | "Approved" | "Rejected";
  date: string;
  bankDetails: string;
}
