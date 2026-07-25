// src/app/api/admin/roles/route.ts

import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/apiAuth";
import { adminService } from "@/lib/services/adminService";

export async function GET() {
  const auth = await getApiUser("admin");
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const matrix = await adminService.getPermissionMatrix();
    return NextResponse.json(matrix);
  } catch (err: any) {
    console.error("Admin permission matrix load failure:", err);
    return NextResponse.json({ error: err.message || "Failed to load roles matrix" }, { status: 500 });
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
    const { matrix } = body;
    if (!matrix || !Array.isArray(matrix)) {
      return NextResponse.json({ error: "Missing or invalid field: matrix array" }, { status: 400 });
    }
    const updated = await adminService.updatePermissionMatrix(adminName, matrix);
    return NextResponse.json(updated);
  } catch (err: any) {
    console.error("Admin permission matrix update failure:", err);
    return NextResponse.json({ error: err.message || "Failed to update permission matrix" }, { status: 500 });
  }
}
