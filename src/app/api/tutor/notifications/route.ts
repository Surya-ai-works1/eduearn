// src/app/api/tutor/notifications/route.ts

import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";
import { notificationService } from "../../../../lib/services/notificationService";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileErr || !profile || profile.role !== "tutor") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const notifications = await notificationService.getNotifications(user.id);
    const unreadCount = notificationService.getUnreadCount(notifications);

    return NextResponse.json({ notifications, unreadCount });
  } catch (err: any) {
    console.error("Failed to load tutor notifications:", err);
    return NextResponse.json({ error: err.message || "Failed to load notifications" }, { status: 500 });
  }
}
