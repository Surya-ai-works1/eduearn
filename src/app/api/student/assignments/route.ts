// src/app/api/student/assignments/route.ts

import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";
import { assignmentService } from "../../../../lib/services/assignmentService";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    const assignments = await assignmentService.getStudentAssignments(user.id);
    return NextResponse.json({ assignments });
  } catch (err: any) {
    console.error("Failed to load student assignments:", err);
    return NextResponse.json({ error: err.message || "Failed to load assignments" }, { status: 500 });
  }
}
