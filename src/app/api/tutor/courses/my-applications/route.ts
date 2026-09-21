// src/app/api/tutor/courses/my-applications/route.ts

import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/apiAuth";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const auth = await getApiUser();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const userId = auth.user.id;

  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase is unconfigured on server" }, { status: 503 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle();

    if (!profile || profile.role !== "tutor") {
      return NextResponse.json({ error: "Forbidden: Only tutors can view applications." }, { status: 403 });
    }

    const { data: apps, error } = await supabase
      .from("course_tutor_applications")
      .select("*, courses:course_id(id, title, category, price)")
      .eq("tutor_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ applications: apps || [] });
  } catch (err: any) {
    console.error("Fetch my course applications error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch course applications" }, { status: 500 });
  }
}
