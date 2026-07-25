// src/app/api/admin/reports/route.ts

import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/apiAuth";
import { adminService } from "@/lib/services/adminService";

export async function GET() {
  const auth = await getApiUser("admin");
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const list = await adminService.getReports();
    return NextResponse.json(list);
  } catch (err: any) {
    console.error("Admin moderation reports load failure:", err);
    return NextResponse.json({ error: err.message || "Failed to load reports" }, { status: 500 });
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
    const { reportId, status } = body;
    if (!reportId || !status) {
      return NextResponse.json({ error: "Missing required fields: reportId, status" }, { status: 400 });
    }
    const updated = await adminService.resolveReport(adminName, reportId, status);
    return NextResponse.json(updated);
  } catch (err: any) {
    console.error("Admin moderation report resolve failure:", err);
    return NextResponse.json({ error: err.message || "Failed to resolve report" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const auth = await getApiUser("admin");
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const adminName = auth.user.user_metadata?.fullName || "Admin Operations";

  try {
    const { searchParams } = new URL(request.url);
    const reviewId = searchParams.get("reviewId");
    if (!reviewId) {
      return NextResponse.json({ error: "Missing required query parameter: reviewId" }, { status: 400 });
    }
    const success = await adminService.deleteReview(adminName, reviewId);
    return NextResponse.json({ success });
  } catch (err: any) {
    console.error("Admin flagged review deletion failure:", err);
    return NextResponse.json({ error: err.message || "Failed to delete review" }, { status: 500 });
  }
}
