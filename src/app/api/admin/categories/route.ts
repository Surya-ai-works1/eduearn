// src/app/api/admin/categories/route.ts

import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/apiAuth";
import { adminService } from "@/lib/services/adminService";

export async function GET() {
  const auth = await getApiUser("admin");
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const list = await adminService.getCategories();
    return NextResponse.json(list);
  } catch (err: any) {
    console.error("Admin categories load failure:", err);
    return NextResponse.json({ error: err.message || "Failed to load categories" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await getApiUser("admin");
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const adminName = auth.user.user_metadata?.fullName || "Admin Operations";

  try {
    const body = await request.json();
    const { name, description } = body;
    if (!name) {
      return NextResponse.json({ error: "Missing required field: name" }, { status: 400 });
    }
    const cat = await adminService.createCategory(adminName, name, description);
    return NextResponse.json(cat);
  } catch (err: any) {
    console.error("Admin category creation failure:", err);
    return NextResponse.json({ error: err.message || "Failed to create category" }, { status: 500 });
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
    const { categoryId, name, status, description } = body;
    if (!categoryId) {
      return NextResponse.json({ error: "Missing required field: categoryId" }, { status: 400 });
    }
    const updated = await adminService.updateCategory(adminName, categoryId, { name, status, description });
    return NextResponse.json(updated);
  } catch (err: any) {
    console.error("Admin category update failure:", err);
    return NextResponse.json({ error: err.message || "Failed to update category" }, { status: 500 });
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
    const categoryId = searchParams.get("categoryId");
    if (!categoryId) {
      return NextResponse.json({ error: "Missing required query parameter: categoryId" }, { status: 400 });
    }
    const success = await adminService.deleteCategory(adminName, categoryId);
    return NextResponse.json({ success });
  } catch (err: any) {
    console.error("Admin category deletion failure:", err);
    return NextResponse.json({ error: err.message || "Failed to delete category" }, { status: 500 });
  }
}
