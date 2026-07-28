import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// This route is ONLY active in development mode.
// It uses the Supabase Admin API to create users with email_confirm: true,
// completely bypassing email verification. It will return 404 in production.
export async function POST(request: Request) {
  // Hard gate: reject entirely if not in dev mode
  if (process.env.NEXT_PUBLIC_DEV_MODE !== "true") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const { email, password, fullName, role } = await request.json();

    if (!email || !password || !fullName || !role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabaseAdmin = createAdminClient();

    // Try to sign in first — the user may already exist
    const { data: existingUser, error: lookupError } =
      await supabaseAdmin.auth.admin.listUsers();

    const alreadyExists =
      !lookupError &&
      existingUser?.users?.some((u) => u.email === email);

    if (alreadyExists) {
      // User exists — update metadata to match requested role
      const existing = existingUser.users.find((u) => u.email === email)!;
      await supabaseAdmin.auth.admin.updateUserById(existing.id, {
        user_metadata: {
          fullName,
          full_name: fullName,
          role,
          complete: role !== "tutor",
        },
      });
      return NextResponse.json({
        success: true,
        existed: true,
        message: "Dev user already exists. Sign in with password.",
      });
    }

    // User does not exist — create with email pre-confirmed
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        fullName,
        full_name: fullName,
        role,
        complete: role !== "tutor",
        accepted_terms: true,
        accepted_privacy: true,
      },
    });

    if (error) {
      console.error("[Dev Auth] createUser failed:", error.message);
      return NextResponse.json(
        { error: error.message || "Dev user creation failed" },
        { status: 400 }
      );
    }

    console.log(`[Dev Auth] Created dev user ${data.user?.id} (${email})`);
    return NextResponse.json({
      success: true,
      existed: false,
      message: "Dev user created and confirmed.",
    });
  } catch (err: any) {
    console.error("[Dev Auth] Unhandled error:", err);
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
