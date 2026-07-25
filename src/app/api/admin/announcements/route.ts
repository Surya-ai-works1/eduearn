// src/app/api/admin/announcements/route.ts

import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/apiAuth";
import { adminService } from "@/lib/services/adminService";

export async function GET() {
  const auth = await getApiUser("admin");
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const list = await adminService.getAnnouncements();
    return NextResponse.json(list);
  } catch (err: any) {
    console.error("Admin announcements list load failure:", err);
    return NextResponse.json({ error: err.message || "Failed to load announcements" }, { status: 500 });
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
    const { title, content, targetAudience, scheduleDate } = body;
    if (!title || !content || !targetAudience) {
      return NextResponse.json({ error: "Missing required fields: title, content, targetAudience" }, { status: 400 });
    }
    const newAnn = await adminService.createAnnouncement(adminName, title, content, targetAudience, scheduleDate);
    return NextResponse.json(newAnn);
  } catch (err: any) {
    console.error("Admin announcement creation failure:", err);
    return NextResponse.json({ error: err.message || "Failed to create announcement" }, { status: 500 });
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
    const announcementId = searchParams.get("announcementId");
    if (!announcementId) {
      return NextResponse.json({ error: "Missing required query parameter: announcementId" }, { status: 400 });
    }
    const success = await adminService.deleteAnnouncement(adminName, announcementId);
    return NextResponse.json({ success });
  } catch (err: any) {
    console.error("Admin announcement deletion failure:", err);
    return NextResponse.json({ error: err.message || "Failed to delete announcement" }, { status: 500 });
  }
}
