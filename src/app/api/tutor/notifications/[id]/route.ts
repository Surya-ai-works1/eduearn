// src/app/api/tutor/notifications/[id]/route.ts

import { NextResponse } from "next/server";
import { createClient } from "../../../../../lib/supabase/server";
import { notificationService } from "../../../../../lib/services/notificationService";

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    const { id } = await params;
    await notificationService.markAsRead(id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Failed to mark tutor notification as read:", err);
    return NextResponse.json({ error: err.message || "Failed to mark as read" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    const { id } = await params;
    await notificationService.deleteNotification(id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Failed to delete tutor notification:", err);
    return NextResponse.json({ error: err.message || "Failed to delete notification" }, { status: 500 });
  }
}
