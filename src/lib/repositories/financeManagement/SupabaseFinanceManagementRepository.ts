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

    // 2. Insert withdrawal request
    // TODO: Add payment_method and bank_details columns to public.withdrawal_requests table in future database migration
    const { data: wthData, error: wthErr } = await supabase
      .from("withdrawal_requests")
      .insert({
        tutor_id: tutorId,
        amount: amount,
        status: "pending",
      })
      .select()
      .single();

    if (wthErr || !wthData) {
      throw wthErr || new Error("Failed to insert withdrawal request");
    }

    // 3. Deduct available balance
    const newAvailable = Math.max(0, currentAvailable - amount);
    await supabase
      .from("tutor_earnings")
      .update({
        available_balance: newAvailable,
      })
      .eq("tutor_id", tutorId);

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
