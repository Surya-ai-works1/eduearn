// src/app/api/admin/audit-logs/route.ts

import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/apiAuth";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const auth = await getApiUser("admin");
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize")) || 20));
  const search = searchParams.get("search")?.trim();
  const action = searchParams.get("action")?.trim();

  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ logs: [], total: 0, page, pageSize });
    }

    let query = supabase
      .from("audit_logs")
      .select("id, user_id, action, details, created_at", { count: "exact" })
      .order("created_at", { ascending: false });

    if (search) {
      query = query.ilike("action", `%${search}%`);
    }
    if (action) {
      query = query.eq("action", action);
    }

    const start = (page - 1) * pageSize;
    const end = start + pageSize - 1;
    query = query.range(start, end);

    const { data, count, error } = await query;
    if (error) {
      console.error("Audit logs query error:", error);
      return NextResponse.json({ error: "Failed to load audit logs" }, { status: 500 });
    }

    const userIds = Array.from(new Set((data || []).map((l: any) => l.user_id).filter(Boolean)));
    let userMap: Record<string, string> = {};
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", userIds);
      if (profiles) {
        userMap = Object.fromEntries(profiles.map((p: any) => [p.id, p.full_name || p.email || "Admin"]));
      }
    }

    const logs = (data || []).map((l: any) => ({
      id: l.id,
      timestamp: l.created_at,
      adminName: userMap[l.user_id] || "Admin Operations",
      action: l.action,
      details: l.details || ""
    }));

    const total = count || 0;
    const totalPages = Math.ceil(total / pageSize);

    return NextResponse.json({
      items: logs,
      logs,
      total,
      page,
      pageSize,
      totalPages,
    });
  } catch (err: any) {
    console.error("Admin audit logs load failure:", err);
    return NextResponse.json({ error: "Failed to load audit logs" }, { status: 500 });
  }
}
