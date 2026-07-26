// src/lib/repositories/financeManagement/SupabaseFinanceManagementRepository.ts

import { IFinanceManagementRepository } from "./IFinanceManagementRepository";
import { TutorEarningsDetails, WithdrawalRequestItem } from "../../types/financeManagement";
import { createClient } from "../../supabase";

export class SupabaseFinanceManagementRepository implements IFinanceManagementRepository {
  async getTutorEarnings(tutorId: string): Promise<TutorEarningsDetails> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("tutor_earnings")
      .select("*")
      .eq("tutor_id", tutorId)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return {
        total: 0,
        available: 0,
        withdrawn: 0,
        pending: 0,
        commission: 10,
      };
    }

    return {
      total: Number(data.total_earnings || 0),
      available: Number(data.available_balance || 0),
      withdrawn: Number(data.withdrawn_amount || 0),
      pending: 0,
      commission: 10,
    };
  }

  async getWithdrawalRequests(tutorId: string): Promise<WithdrawalRequestItem[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("withdrawal_requests")
      .select("*")
      .eq("tutor_id", tutorId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return (data || []).map((w: any) => ({
      id: w.id,
      amount: Number(w.amount),
      method: "UPI", // Gracefully mapped (default)
      status: (w.status.charAt(0).toUpperCase() + w.status.slice(1)) as "Pending" | "Approved" | "Rejected",
      date: new Date(w.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
      bankDetails: "UPI", // Gracefully mapped (default)
    }));
  }

  async requestWithdrawal(
    tutorId: string,
    amount: number,
    method: "UPI" | "Bank",
    bankDetails: string
  ): Promise<WithdrawalRequestItem> {
    const supabase = createClient();

    // 1. Fetch current earnings row
    const { data: earningsData, error: earningsErr } = await supabase
      .from("tutor_earnings")
      .select("*")
      .eq("tutor_id", tutorId)
      .maybeSingle();

    if (earningsErr) throw earningsErr;

    const currentAvailable = Number(earningsData?.available_balance || 0);
    if (amount > currentAvailable) {
      throw new Error("Insufficient balance");
    }

    // 2. Insert withdrawal request with backward-compatible fallback
    let wthResult = await supabase
      .from("withdrawal_requests")
      .insert({
        tutor_id: tutorId,
        amount: amount,
        status: "pending",
        payment_method: method,
        bank_details: bankDetails,
      })
      .select()
      .single();

    if (wthResult.error && wthResult.error.code === "PGRST204") {
      // Fallback for older database schemas without payment_method/bank_details columns
      wthResult = await supabase
        .from("withdrawal_requests")
        .insert({
          tutor_id: tutorId,
          amount: amount,
          status: "pending",
        })
        .select()
        .single();
    }

    if (wthResult.error || !wthResult.data) {
      throw wthResult.error || new Error("Failed to insert withdrawal request");
    }

    const wthData = wthResult.data;

    // 3. Deduct available balance
    const newAvailable = Math.max(0, currentAvailable - amount);
    const { error: deductErr } = await supabase
      .from("tutor_earnings")
      .update({
        available_balance: newAvailable,
      })
      .eq("tutor_id", tutorId);

    if (deductErr) {
      throw new Error(`Failed to deduct balance: ${deductErr.message}`);
    }

    return {
      id: wthData.id,
      amount: Number(wthData.amount),
      method,
      status: "Pending",
      date: new Date(wthData.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
      bankDetails,
    };
  }
}
