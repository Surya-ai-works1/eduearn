// src/app/api/student/certificates/route.ts

import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";
import { certificateService } from "../../../../lib/services/certificateService";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    const certificates = await certificateService.getStudentCertificates(user.id);
    return NextResponse.json({ certificates });
  } catch (err: any) {
    console.error("Failed to load certificates:", err);
    return NextResponse.json({ error: err.message || "Failed to load certificates" }, { status: 500 });
  }
}
