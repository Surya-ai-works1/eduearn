// src/app/api/admin/dashboard/route.ts

import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/apiAuth";
import { adminService } from "@/lib/services/adminService";

export async function GET() {
  const auth = await getApiUser("admin");
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const stats = await adminService.getDashboardStats();
    return NextResponse.json(stats);
  } catch (err: any) {
    console.error("Admin dashboard stats load failure:", err);
    return NextResponse.json({ error: err.message || "Failed to load stats" }, { status: 500 });
  }
}
