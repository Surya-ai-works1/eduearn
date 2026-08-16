// src/app/api/admin/verifications/[id]/route.ts

import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/apiAuth";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getApiUser("admin");
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await params;

  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase is unconfigured/disabled on localhost" }, { status: 503 });
    }

    const { data, error } = await supabase
      .from("tutor_verifications")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    if (!data) {
      return NextResponse.json({ error: "Verification application not found." }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    console.error(`Error loading verification details for ID ${id}:`, err);
    return NextResponse.json({ error: err.message || "Failed to load application details" }, { status: 500 });
  }
}
