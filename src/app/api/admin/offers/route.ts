// src/app/api/admin/offers/route.ts

import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/apiAuth";
import { adminService } from "@/lib/services/adminService";

export async function GET() {
  const auth = await getApiUser("admin");
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const list = await (adminService as any).getOffers();
    return NextResponse.json(list);
  } catch (err: any) {
    console.error("Admin offers load failure:", err);
    return NextResponse.json({ error: err.message || "Failed to load offers" }, { status: 500 });
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
    const { code, type, value, minPurchase, maxDiscount, expiresAt, usageLimit } = body;

    // Check required fields
    if (!code || !type || value === undefined || !expiresAt || usageLimit === undefined) {
      return NextResponse.json({ error: "Missing required fields: code, type, value, expiresAt, usageLimit" }, { status: 400 });
    }

    const newOffer = await (adminService as any).createOffer(adminName, {
      code,
      type,
      value: Number(value),
      minPurchase: minPurchase ? Number(minPurchase) : undefined,
      maxDiscount: maxDiscount ? Number(maxDiscount) : undefined,
      expiresAt,
      usageLimit: Number(usageLimit)
    });

    return NextResponse.json(newOffer, { status: 201 });
  } catch (err: any) {
    console.error("Admin offer creation failure:", err);
    const isValidationErr = err.message && (
      err.message.includes("Coupon code") ||
      err.message.includes("Discount value") ||
      err.message.includes("Percentage") ||
      err.message.includes("Usage limit") ||
      err.message.includes("Expiration")
    );
    return NextResponse.json({ error: err.message || "Failed to create offer" }, { status: isValidationErr ? 400 : 500 });
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
    const { offerId, ...updates } = body;
    if (!offerId) {
      return NextResponse.json({ error: "Missing required field: offerId" }, { status: 400 });
    }

    const updated = await (adminService as any).updateOffer(adminName, offerId, updates);
    return NextResponse.json(updated);
  } catch (err: any) {
    console.error("Admin offer update failure:", err);
    const isValidationErr = err.message && (
      err.message.includes("Coupon code") ||
      err.message.includes("Discount value") ||
      err.message.includes("Percentage") ||
      err.message.includes("Usage limit") ||
      err.message.includes("Expiration")
    );
    return NextResponse.json({ error: err.message || "Failed to update offer" }, { status: isValidationErr ? 400 : 500 });
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
    const offerId = searchParams.get("offerId");
    if (!offerId) {
      return NextResponse.json({ error: "Missing required query parameter: offerId" }, { status: 400 });
    }

    const success = await (adminService as any).deleteOffer(adminName, offerId);
    return NextResponse.json({ success });
  } catch (err: any) {
    console.error("Admin offer deletion failure:", err);
    return NextResponse.json({ error: err.message || "Failed to delete offer" }, { status: 500 });
  }
}
