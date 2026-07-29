// src/app/api/admin/audit-logs/route.ts

import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/apiAuth";
import { adminService } from "@/lib/services/adminService";

export async function GET(request: Request) {
  const auth = await getApiUser("admin");
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);
  const page = searchParams.get("page") ? Number(searchParams.get("page")) : undefined;
  const pageSize = searchParams.get("pageSize") ? Number(searchParams.get("pageSize")) : undefined;
  const search = searchParams.get("search") || undefined;
  const moduleParam = searchParams.get("module") || undefined;
  const action = searchParams.get("action") || undefined;
  const startDate = searchParams.get("startDate") || undefined;
  const endDate = searchParams.get("endDate") || undefined;

  try {
    const result = await adminService.getAuditLogs({
      page,
      pageSize,
      search,
      module: moduleParam,
      action,
      startDate,
      endDate,
    });
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Admin audit logs load failure:", err);
    return NextResponse.json({ error: err.message || "Failed to load audit logs" }, { status: 500 });
  }
}
