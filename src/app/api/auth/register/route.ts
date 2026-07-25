import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { emailService } from "@/lib/email/service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, fullName, role = "student" } = body;

    if (!email || !password || !fullName) {
      return NextResponse.json({ error: "Missing required fields (email, password, fullName)" }, { status: 400 });
    }

    console.log(`[Register API] Processing registration for email: ${email}, role: ${role}`);

    const isDisableVerification = process.env.NEXT_PUBLIC_DISABLE_EMAIL_VERIFICATION === "true";
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // Fallback: If no service role key is present, return fallback flag so client can register via standard signUp
    if (!serviceRoleKey) {
      console.warn("[Register API] SUPABASE_SERVICE_ROLE_KEY is not configured. Returning fallback command.");
      return NextResponse.json({ 
        success: false, 
        fallback: true,
        message: "Server admin client not configured. Proceeding with standard client sign up."
      });
    }

    const supabaseAdmin = createAdminClient();

    if (isDisableVerification) {
      console.log(`[Register API] Email verification is disabled. Creating auto-confirmed user.`);
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          fullName,
          full_name: fullName,
          role,
          complete: false,
          accepted_terms: true,
          accepted_privacy: true,
        }
      });

      if (error || !data.user) {
        console.error("[Register API] Auto-confirmed user creation failed:", error);
        return NextResponse.json({ error: error?.message || "User creation failed" }, { status: 400 });
      }

      console.log(`[Register API] User ${data.user.id} created and confirmed successfully.`);
      return NextResponse.json({
        success: true,
        sessionCreated: true,
        message: "Account created successfully. You can now log in immediately!"
      });
    }

    // Normal path: verification is enabled.
    // Generate signup link using admin client.
    console.log(`[Register API] Generating signup confirmation link.`);
    const nextRoute = role === "tutor" ? "/tutor/onboarding" : "/complete-profile";
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 
      (process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : "http://localhost:3000");
    const redirectTo = `${appUrl}/auth/callback?next=${nextRoute}`;

    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'signup',
      email,
      password,
      options: {
        redirectTo,
        data: {
          fullName,
          full_name: fullName,
          role,
          complete: false,
          accepted_terms: true,
          accepted_privacy: true,
        }
      }
    });

    if (error || !data.user || !data.properties?.action_link) {
      console.error("[Register API] Generating confirmation link failed:", error);
      return NextResponse.json({ error: error?.message || "Generating confirmation link failed" }, { status: 400 });
    }

    const verificationLink = data.properties.action_link;
    console.log(`[Register API] Signup link generated. Dispatching verification email to: ${email}`);

    // Send verification email via Brevo SMTP
    const emailSent = await emailService.sendVerificationEmail(email, verificationLink);

    if (!emailSent) {
      console.error(`[Register API] Failed to send verification email via Brevo to: ${email}`);
      return NextResponse.json({ 
        error: "User was created but we failed to send the verification email. Please contact support." 
      }, { status: 500 });
    }

    console.log(`[Register API] Verification email sent successfully to ${email}.`);
    return NextResponse.json({
      success: true,
      sessionCreated: false,
      message: "Account created. Check your inbox to verify your email."
    });

  } catch (err: any) {
    console.error("[Register API] Unhandled exception:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}
