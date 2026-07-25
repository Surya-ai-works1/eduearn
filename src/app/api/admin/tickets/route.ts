// src/app/api/admin/tickets/route.ts

import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/apiAuth";
import { adminService } from "@/lib/services/adminService";

export async function GET() {
  const auth = await getApiUser("admin");
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const list = await adminService.getTickets();
    return NextResponse.json(list);
  } catch (err: any) {
    console.error("Admin support tickets load failure:", err);
    return NextResponse.json({ error: err.message || "Failed to load support tickets" }, { status: 500 });
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
    const { ticketId, replyText, action } = body;
    if (!ticketId) {
      return NextResponse.json({ error: "Missing required field: ticketId" }, { status: 400 });
    }

    let updatedTicket;
    if (action === "resolve") {
      updatedTicket = await adminService.resolveTicket(adminName, ticketId);
    } else if (replyText) {
      updatedTicket = await adminService.replyTicket(adminName, ticketId, replyText);
    } else {
      return NextResponse.json({ error: "Invalid action or empty reply content" }, { status: 400 });
    }

    return NextResponse.json(updatedTicket);
  } catch (err: any) {
    console.error("Admin support ticket operation failure:", err);
    return NextResponse.json({ error: err.message || "Failed to process support ticket" }, { status: 500 });
  }
}
