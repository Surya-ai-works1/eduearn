import { NextResponse } from "next/server";
import { emailService } from "../../../lib/email/service";
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, to, ...args } = body;

    // Security Check: Restrict sensitive emails to authenticated sessions
    try {
      const { createClient } = await import("@/lib/supabase");
      const supabase = createClient();
      if (!supabase) {
        return NextResponse.json({ error: "Supabase is unconfigured/disabled on localhost" }, { status: 503 });
      }
      const { data: { user }, error: authErr } = await supabase.auth.getUser();
      if (authErr || !user) {
        if (type !== "verification" && type !== "reset_password" && type !== "welcome") {
          return NextResponse.json({ error: "Unauthorized. Authentication required." }, { status: 401 });
        }
      }
    } catch (e) {
      console.warn("Auth check failed in email route:", e);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!to || !type) {
      return NextResponse.json({ error: "Missing required fields (to, type)" }, { status: 400 });
    }

    const result = await (async () => {
      switch (type) {
        case "welcome":
          return emailService.sendWelcomeEmail(to, args.name || "User");
        case "verification":
          return emailService.sendVerificationEmail(to, args.code || "");
        case "reset_password":
          return emailService.sendPasswordResetEmail(to, args.resetLink || "");
        case "enrollment":
          return emailService.sendEnrollmentConfirmationEmail(to, args.name || "Student", args.courseTitle || "");
        case "tutor_registration":
          return emailService.sendTutorRegistrationConfirmation(to, args.name || "Tutor");
        case "tutor_approval":
          return emailService.sendTutorApprovalEmail(to, args.name || "Tutor", !!args.approved, args.reason);
        case "assignment_submission":
          return emailService.sendAssignmentSubmissionEmail(to, args.name || "Student", args.assignmentTitle || "");
        case "certificate":
          return emailService.sendCertificateEmail(to, args.name || "Student", args.courseTitle || "", args.certificateUrl || "");
        case "contact_form":
          return emailService.sendContactFormEmail(to, args.fromName || "", args.fromEmail || "", args.message || "");
        case "payment_receipt":
          return emailService.sendPaymentReceiptEmail(to, args.name || "Student", args.amount || "", args.txId || "");
        default:
          throw new Error(`Unsupported email type: ${type}`);
      }
    })();

    if (result.success) {
      return NextResponse.json({ success: true, message: "Email sent successfully" });
    } else {
      return NextResponse.json({ error: result.error || "Failed to send email via Brevo" }, { status: 500 });
    }
  } catch (err: any) {
    console.error("API Email Route Exception:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}
