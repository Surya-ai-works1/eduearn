// src/app/api/admin/courses/route.ts

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
  const category = searchParams.get("category") || undefined;
  const status = searchParams.get("status") || undefined;

  try {
    const list = await adminService.getCourses(search, category, status);
    return NextResponse.json(list);
  } catch (err: any) {
    console.error("Admin courses inventory load failure:", err);
    return NextResponse.json({ error: err.message || "Failed to load courses" }, { status: 500 });
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
    const { courseId, status, price, featured } = body;
    if (!courseId) {
      return NextResponse.json({ error: "Missing required field: courseId" }, { status: 400 });
    }

    let result;
    if (status || price !== undefined) {
      result = await adminService.updateCourseStatus(adminName, courseId, status, price !== undefined ? Number(price) : undefined);
    } else if (featured !== undefined) {
      result = await adminService.updateCourseFeature(adminName, courseId, featured);
    } else {
      return NextResponse.json({ error: "Missing updates (status, price, or featured parameter)" }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Admin course status update failure:", err);
    return NextResponse.json({ error: err.message || "Failed to update course" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const auth = await getApiUser("admin");
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const adminName = auth.user.user_metadata?.fullName || "Admin Operations";

  try {
    const body = await request.json();
    const { courseId, category } = body;
    if (!courseId || !category) {
      return NextResponse.json({ error: "Missing required fields: courseId, category" }, { status: 400 });
    }
    const updated = await adminService.assignCourseCategory(adminName, courseId, category);
    return NextResponse.json(updated);
  } catch (err: any) {
    console.error("Admin course category assignment failure:", err);
    return NextResponse.json({ error: err.message || "Failed to assign category" }, { status: 500 });
  }
}
