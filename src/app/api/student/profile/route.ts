// src/app/api/student/profile/route.ts

import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";
import { studentProfileService } from "../../../../lib/services/studentProfileService";

export async function GET() {
  try {
    const supabase = await createClient();
    if (!supabase) {
      const profile = await studentProfileService.getProfile("preview-student-id");
      const stats = await studentProfileService.getStudentStats("preview-student-id");
      return NextResponse.json({ profile, stats, isMock: true });
    }
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    const profile = await studentProfileService.getProfile(user.id);
    const stats = await studentProfileService.getStudentStats(user.id);

    return NextResponse.json({ profile, stats });
  } catch (err: any) {
    console.error("Failed to load profile:", err);
    return NextResponse.json({ error: err.message || "Failed to load profile" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { fullName, username, bio, country, language, skills, avatarUrl } = body;

    if (!supabase) {
      const profile = await studentProfileService.updateProfile("preview-student-id", {
        fullName,
        username,
        bio,
        country,
        language,
        skills,
        avatarUrl
      });
      return NextResponse.json({ success: true, profile, isMock: true });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    const profile = await studentProfileService.updateProfile(user.id, {
      fullName,
      username,
      bio,
      country,
      language,
      skills,
      avatarUrl
    });

    return NextResponse.json({ success: true, profile });
  } catch (err: any) {
    console.error("Failed to update profile:", err);
    return NextResponse.json({ error: err.message || "Failed to update profile" }, { status: 500 });
  }
}
