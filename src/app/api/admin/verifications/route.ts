// src/app/api/admin/verifications/route.ts

import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/apiAuth";
import { adminService } from "@/lib/services/adminService";

export async function GET() {
  const auth = await getApiUser("admin");
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const list = await adminService.getVerifications();
    return NextResponse.json(list);
  } catch (err: any) {
    console.error("Admin verification apps load failure:", err);
    return NextResponse.json({ error: err.message || "Failed to load verifications" }, { status: 500 });
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
    const { verificationId, status, adminNotes, adminFeedback, rejectionReason, liveInterviewDetails } = body;
    if (!verificationId || !status) {
      return NextResponse.json({ error: "Missing required fields: verificationId, status" }, { status: 400 });
    }
    const updated = await adminService.updateVerificationStatus(adminName, verificationId, status, {
      adminNotes,
      adminFeedback,
      rejectionReason,
      liveInterviewDetails
    });
    return NextResponse.json(updated);
  } catch (err: any) {
    console.error("Admin verification app approval failure:", err);
    return NextResponse.json({ error: err.message || "Failed to update verification status" }, { status: 500 });
  }
}
