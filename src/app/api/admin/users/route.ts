// src/app/api/admin/users/route.ts

import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/apiAuth";
import { adminService } from "@/lib/services/adminService";

export async function GET(request: Request) {
  const auth = await getApiUser("admin");
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || undefined;
  const role = searchParams.get("role") || undefined;
  const status = searchParams.get("status") || undefined;

  try {
    const list = await adminService.getUsers(search, role, status);
    return NextResponse.json(list);
  } catch (err: any) {
    console.error("Admin user directory load failure:", err);
    return NextResponse.json({ error: err.message || "Failed to load users" }, { status: 500 });
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
    const { userId, status } = body;
    if (!userId || !status) {
      return NextResponse.json({ error: "Missing required fields: userId, status" }, { status: 400 });
    }
    const updated = await adminService.updateUserStatus(adminName, userId, status);
    return NextResponse.json(updated);
  } catch (err: any) {
    console.error("Admin user status update failure:", err);
    return NextResponse.json({ error: err.message || "Failed to update user status" }, { status: 500 });
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
    const userId = searchParams.get("userId");
    if (!userId) {
      return NextResponse.json({ error: "Missing required query parameter: userId" }, { status: 400 });
    }
    const success = await adminService.deleteUser(adminName, userId);
    return NextResponse.json({ success });
  } catch (err: any) {
    console.error("Admin user account deletion failure:", err);
    return NextResponse.json({ error: err.message || "Failed to delete user" }, { status: 500 });
  }
}
