// src/app/api/admin/payments/route.ts

import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/apiAuth";
import { adminService } from "@/lib/services/adminService";

export async function GET() {
  const auth = await getApiUser("admin");
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const payouts = await adminService.getPayouts();
    const transactions = await adminService.getTransactions();
    return NextResponse.json({ payouts, transactions });
  } catch (err: any) {
    console.error("Admin payments dashboard load failure:", err);
    return NextResponse.json({ error: err.message || "Failed to load payments details" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const auth = await getApiUser("admin");
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const adminName = auth.user.user_metadata?.fullName || "Admin Operations";

  try {
    const body = await request.json();
    const { payoutId, status } = body;
    if (!payoutId || !status) {
      return NextResponse.json({ error: "Missing required fields: payoutId, status" }, { status: 400 });
    }
    const updated = await adminService.updateWithdrawalStatus(adminName, payoutId, status);
    return NextResponse.json(updated);
  } catch (err: any) {
    console.error("Admin withdrawal status update failure:", err);
    return NextResponse.json({ error: err.message || "Failed to update withdrawal status" }, { status: 500 });
  }
}
