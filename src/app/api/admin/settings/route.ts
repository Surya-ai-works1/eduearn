// src/app/api/admin/settings/route.ts

import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/apiAuth";
import { adminService } from "@/lib/services/adminService";

export async function GET() {
  const auth = await getApiUser("admin");
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const settings = await adminService.getSettings();
    return NextResponse.json(settings);
  } catch (err: any) {
    console.error("Admin system settings load failure:", err);
    return NextResponse.json({ error: err.message || "Failed to load system settings" }, { status: 500 });
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
    const updated = await adminService.updateSettings(adminName, body);
    return NextResponse.json(updated);
  } catch (err: any) {
    console.error("Admin system settings update failure:", err);
    return NextResponse.json({ error: err.message || "Failed to update settings" }, { status: 500 });
  }
}
