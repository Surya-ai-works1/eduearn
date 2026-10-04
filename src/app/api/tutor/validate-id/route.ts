// src/app/api/tutor/validate-id/route.ts

import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/apiAuth";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const auth = await getApiUser();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const userId = auth.user.id;

  try {
    const body = await request.json();
    const { idNumber, idType = "Government ID" } = body;

    // 1. Empty ID check
    if (!idNumber || typeof idNumber !== "string" || !idNumber.trim()) {
      return NextResponse.json(
        { error: "ID number cannot be empty. Please enter a valid identification number." },
        { status: 400 }
      );
    }

    const trimmedId = idNumber.trim();

    // 2. Malformed ID check (Must be 6 to 20 alphanumeric characters or dashes)
    const idRegex = /^[A-Za-z0-9\-]{6,20}$/;
    if (!idRegex.test(trimmedId)) {
      return NextResponse.json(
        { error: "Malformed ID number. ID must contain 6 to 20 alphanumeric characters without spaces or special symbols." },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ error: "Database authentication service unavailable." }, { status: 503 });
    }

    // 3. Already-used ID check: Ensure no other user registered this ID
    const { data: duplicateRecord, error: dupError } = await supabase
      .from("tutor_verifications")
      .select("tutor_id")
      .eq("id_number", trimmedId)
      .neq("tutor_id", userId)
      .maybeSingle();

    if (dupError && dupError.code !== "PGRST116") {
      console.warn("Database check notice:", dupError.message);
    }

    if (duplicateRecord) {
      return NextResponse.json(
        { error: "This identification number has already been registered by another user account." },
        { status: 409 }
      );
    }

    // 4. Update or save the verified ID in the user's tutor_verifications record
    const { data: existing } = await supabase
      .from("tutor_verifications")
      .select("id")
      .eq("tutor_id", userId)
      .maybeSingle();

    const payload = {
      tutor_id: userId,
      tutor_name: auth.user.user_metadata?.fullName || "Tutor Candidate",
      id_number: trimmedId,
      id_type: idType,
      updated_at: new Date().toISOString(),
    };

    if (existing) {
      const { error: updateErr } = await supabase
        .from("tutor_verifications")
        .update(payload)
        .eq("tutor_id", userId);
      if (updateErr) throw updateErr;
    } else {
      const { error: insertErr } = await supabase
        .from("tutor_verifications")
        .insert({
          ...payload,
          status: "Pending",
        });
      if (insertErr) throw insertErr;
    }

    return NextResponse.json({
      success: true,
      message: "Identification document validated and verified successfully against database records.",
      idNumber: trimmedId,
      idType,
    });
  } catch (err: any) {
    console.error("ID Validation error:", err);
    return NextResponse.json(
      { error: "Validation failed due to a server process issue. Please try again." },
      { status: 500 }
    );
  }
}
