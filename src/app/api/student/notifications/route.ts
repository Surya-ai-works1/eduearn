// src/app/api/student/notifications/route.ts

import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";
import { notificationService } from "../../../../lib/services/notificationService";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase is unconfigured/disabled on localhost" }, { status: 503 });
    }
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "20", 10) || 20));

    const notifications = await notificationService.getNotifications(user.id);
    const activities = await notificationService.getActivities(user.id);
    const unreadCount = notificationService.getUnreadCount(notifications);
    const total = notifications.length;
    const totalPages = Math.ceil(total / pageSize);

    return NextResponse.json({
      items: notifications,
      notifications,
      activities,
      unreadCount,
      total,
      page,
      pageSize,
      totalPages,
    });
  } catch (err: any) {
    console.error("Failed to load notifications:", err);
    return NextResponse.json({ error: err.message || "Failed to load notifications" }, { status: 500 });
  }
}
