// src/app/api/tutor/notifications/read-all/route.ts

import { NextResponse } from "next/server";
import { createClient } from "../../../../../lib/supabase/server";
import { notificationService } from "../../../../../lib/services/notificationService";

export async function POST() {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase is unconfigured/disabled on localhost" }, { status: 503 });
    }
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    await notificationService.markAllAsRead(user.id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Failed to mark all tutor notifications as read:", err);
    return NextResponse.json({ error: err.message || "Failed to mark all as read" }, { status: 500 });
  }
}
