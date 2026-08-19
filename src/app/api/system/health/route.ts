import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const startTime = Date.now();
  let dbStatus: "CONNECTED" | "DEGRADED" | "NOT CONNECTED" = "NOT CONNECTED";
  let latencyMs = 0;
  let dbError: string | null = null;
  let totalProfiles = 0;

  try {
    const supabase = await createClient();
    const { count, error } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true });

    latencyMs = Date.now() - startTime;

    if (error) {
      dbStatus = "DEGRADED";
      dbError = error.message;
    } else {
      dbStatus = latencyMs > 2000 ? "DEGRADED" : "CONNECTED";
      totalProfiles = count ?? 0;
    }
  } catch (err: any) {
    latencyMs = Date.now() - startTime;
    dbStatus = "NOT CONNECTED";
    dbError = err.message || "Failed to reach database";
  }

  const overallStatus = dbStatus === "CONNECTED" ? "CONNECTED" : dbStatus === "DEGRADED" ? "DEGRADED" : "NOT CONNECTED";

  return NextResponse.json({
    status: overallStatus,
    timestamp: new Date().toISOString(),
    database: {
      status: dbStatus,
      latencyMs,
      error: dbError,
      profilesCount: dbStatus === "CONNECTED" ? totalProfiles : undefined,
    },
    services: {
      supabase: dbStatus,
      authentication: dbStatus === "CONNECTED" ? "OPERATIONAL" : "DEGRADED",
    },
    environment: process.env.NODE_ENV || "development",
  }, {
    status: dbStatus === "CONNECTED" ? 200 : 503,
    headers: {
      "Cache-Control": "no-store, max-age=0, must-revalidate",
    },
  });
}
