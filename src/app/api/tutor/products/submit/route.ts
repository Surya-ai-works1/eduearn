import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getApiUser } from "@/lib/apiAuth";

export async function POST(req: NextRequest) {
  try {
    const auth = await getApiUser("tutor");
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase unconfigured on server" }, { status: 503 });
    }

    const tutor_id = auth.user.id;
    const body = await req.json();
    const {
      title,
      subtitle,
      description,
      category,
      subcategory,
      product_type = "INDIVIDUAL_COURSE",
      delivery_type = "LIVE",
      base_price = 0,
      selling_price = 0,
      duration = "1 Month",
      total_sessions = 16,
      sessions_per_month = 16,
      is_project = false,
      hardware_required = false,
      hardware_cost = 0,
      bom = [],
      skills = [],
      learning_outcomes = [],
    } = body;

    if (!title || !category) {
      return NextResponse.json(
        { error: "Missing required product parameters (title, category)." },
        { status: 400 }
      );
    }

    if (is_project || product_type === "PROJECT") {
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const { data, error } = await supabase.from("projects").insert({
        title,
        slug: `${slug}-${Date.now().toString().slice(-4)}`,
        description,
        category,
        subcategory,
        difficulty: "Intermediate",
        duration,
        total_sessions,
        learning_fee: selling_price || base_price,
        hardware_required,
        hardware_cost,
        bom,
        skills,
        learning_outcomes,
        status: "draft",
        approval_status: "submitted",
        created_by: tutor_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }).select().single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        product: data,
        message: "Project submitted successfully for EduEarn Admin review.",
      });
    }

    // Default Individual Course Submission
    const { data, error } = await supabase.from("courses").insert({
      tutor_id,
      title,
      subtitle,
      description,
      category,
      subcategory,
      product_type,
      delivery_type,
      base_price,
      selling_price,
      price: selling_price || base_price,
      level: "Intermediate",
      duration,
      total_sessions,
      sessions_per_month,
      status: "draft",
      approval_status: "submitted",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).select().single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      product: data,
      message: "Course submitted successfully for EduEarn Admin review.",
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Internal server error submitting product." },
      { status: 500 }
    );
  }
}
