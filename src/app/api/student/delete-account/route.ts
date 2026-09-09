// src/app/api/student/delete-account/route.ts

import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";
import { createAdminClient } from "../../../../lib/supabase/admin";
import { studentProfileService } from "../../../../lib/services/studentProfileService";

export async function POST() {
  try {
    const supabase = await createClient();

    // Local / Mock mode fallback when Supabase is not configured
    if (!supabase) {
      await studentProfileService.deleteProfile("preview-student-id");
      return NextResponse.json({
        success: true,
        isMock: true,
        message: "Learner account deleted successfully in mock mode."
      });
    }

    // 1. Authoritative server-side session check (NEVER trust user ID from client request body)
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthenticated session" }, { status: 401 });
    }

    const userId = user.id;

    // 2. Delete learner-owned profile record
    await studentProfileService.deleteProfile(userId);

    // 3. Delete learner enrollments and quiz attempts (learner-owned data only)
    try {
      await supabase.from("enrollments").delete().eq("learner_id", userId);
    } catch (e) {
      console.warn("Non-fatal error deleting enrollments:", e);
    }

    try {
      await supabase.from("quiz_attempts").delete().eq("user_id", userId);
    } catch (e) {
      console.warn("Non-fatal error deleting quiz attempts:", e);
    }

    // 4. Delete user from Supabase Auth using server-side admin client
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const adminClient = createAdminClient();
      const { error: adminDeleteErr } = await adminClient.auth.admin.deleteUser(userId);
      if (adminDeleteErr) {
        console.error("Failed to delete user from Supabase Auth:", adminDeleteErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Learner account deleted successfully."
    });
  } catch (err: any) {
    console.error("Failed to delete learner account:", err);
    return NextResponse.json(
      { error: err.message || "Failed to delete account" },
      { status: 500 }
    );
  }
}
