import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../../lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const body = await req.json();
    const { productId, itemType = "course", action, adminOverridePrice } = body;
    // action: 'APPROVE' | 'REJECT' | 'SUSPEND' | 'PUBLISH' | 'ARCHIVE'

    if (!productId || !action) {
      return NextResponse.json(
        { error: "Missing required parameters (productId, action)." },
        { status: 400 }
      );
    }

    let status = "draft";
    let approval_status = "under_review";

    switch (action) {
      case "APPROVE":
        approval_status = "approved";
        status = "published";
        break;
      case "PUBLISH":
        approval_status = "approved";
        status = "published";
        break;
      case "REJECT":
        approval_status = "rejected";
        status = "draft";
        break;
      case "SUSPEND":
        approval_status = "under_review";
        status = "archived";
        break;
      case "ARCHIVE":
        status = "archived";
        break;
      default:
        return NextResponse.json({ error: "Invalid action specified." }, { status: 400 });
    }

    if (itemType === "project") {
      const updateData: any = {
        status,
        approval_status,
        updated_at: new Date().toISOString(),
      };
      if (adminOverridePrice) updateData.learning_fee = adminOverridePrice;

      const { data, error } = await supabase
        .from("projects")
        .update(updateData)
        .eq("id", productId)
        .select()
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true, product: data, message: `Project ${action}D successfully.` });
    }

    // Default Course Approval
    const updateData: any = {
      status,
      approval_status,
      updated_at: new Date().toISOString(),
    };
    if (adminOverridePrice) {
      updateData.selling_price = adminOverridePrice;
      updateData.price = adminOverridePrice;
    }

    const { data, error } = await supabase
      .from("courses")
      .update(updateData)
      .eq("id", productId)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({
      success: true,
      product: data,
      message: `Course ${action}D successfully by EduEarn Admin.`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Internal server error performing product approval." },
      { status: 500 }
    );
  }
}
