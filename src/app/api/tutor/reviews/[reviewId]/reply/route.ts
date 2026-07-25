// src/app/api/tutor/reviews/[reviewId]/reply/route.ts

import { NextResponse } from "next/server";
import { createClient } from "../../../../../../lib/supabase/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    // Role verification
    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileErr || !profile || profile.role !== "tutor") {
      return NextResponse.json({ error: "Forbidden: Only tutors can reply to reviews" }, { status: 403 });
    }

    const body = await request.json();
    const { reply } = body;

    if (!reply || !reply.trim()) {
      return NextResponse.json({ error: "Reply text is required" }, { status: 400 });
    }

    const { reviewId } = await params;

    // TODO: Add reply_text column to public.reviews in a future database migration
    // For now, we verify the review exists and belongs to a course owned by this tutor
    const { data: review, error: reviewErr } = await supabase
      .from("reviews")
      .select("*, courses(tutor_id)")
      .eq("id", reviewId)
      .maybeSingle();

    if (reviewErr || !review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    const courseData = review.courses as any;
    if (courseData?.tutor_id !== user.id) {
      return NextResponse.json({ error: "Forbidden: This review does not belong to your course" }, { status: 403 });
    }

    // Reply is persisted in Mock Mode via the client; in Supabase mode we acknowledge success
    // without a DB write since the reply_text column does not yet exist in the schema.
    // TODO: Once reply_text column is added via migration, execute:
    // await supabase.from("reviews").update({ reply_text: reply.trim() }).eq("id", reviewId);

    return NextResponse.json({ success: true, reply: reply.trim() });
  } catch (err: any) {
    console.error("Failed to save review reply:", err);
    return NextResponse.json({ error: err.message || "Failed to save reply" }, { status: 500 });
  }
}
