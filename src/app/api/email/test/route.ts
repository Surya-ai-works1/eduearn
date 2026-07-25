import { NextResponse } from "next/server";
import { emailService } from "../../../../lib/email/service";

export async function POST(request: Request) {
  // Security Check: Restrict test routes to development environment
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Unauthorized. Test utility is only accessible during development." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { to, type } = body;

    if (!to || !type) {
      return NextResponse.json({ error: "Missing 'to' or 'type' in body" }, { status: 400 });
    }

    const testCode = Math.floor(100000 + Math.random() * 900000).toString();
    const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || 
      (process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : "http://localhost:3000");
    const testResetLink = `${appBaseUrl}/reset-password?token=test_token_123`;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://omgdjkzkervioonhcpvh.supabase.co";
    const testCertUrl = `${supabaseUrl}/storage/v1/object/public/certificates/test_cert.png`;

    const result = await (async () => {
      switch (type) {
        case "welcome":
          return emailService.sendWelcomeEmail(to, "Test User");
        case "verification":
          return emailService.sendVerificationEmail(to, testCode);
        case "reset_password":
          return emailService.sendPasswordResetEmail(to, testResetLink);
        case "enrollment":
          return emailService.sendEnrollmentConfirmationEmail(to, "Test Student", "Full-Stack Web Development Course");
        case "tutor_registration":
          return emailService.sendTutorRegistrationConfirmation(to, "Test Candidate");
        case "tutor_approval":
          return emailService.sendTutorApprovalEmail(to, "Approved Tutor", true);
        case "tutor_rejection":
          return emailService.sendTutorApprovalEmail(to, "Rejected Candidate", false, "Credentials provided were incomplete.");
        case "assignment_submission":
          return emailService.sendAssignmentSubmissionEmail(to, "Test Student", "React Hooks Homework Project");
        case "certificate":
          return emailService.sendCertificateEmail(to, "Graduating Scholar", "Advanced Systems Engineering", testCertUrl);
        case "contact_form":
          return emailService.sendContactFormEmail(to, "Inquirer Name", "inquirer@example.com", "This is a test feedback submission message.");
        case "payment_receipt":
          return emailService.sendPaymentReceiptEmail(to, "Paying Customer", "₹1499", "TXN-999888");
        default:
          throw new Error(`Unsupported template: ${type}`);
      }
    })();

    if (result.success) {
      return NextResponse.json({ success: true, message: `Test '${type}' email sent to ${to}` });
    } else {
      return NextResponse.json({ error: result.error || "Brevo integration returned failure response. Check server logs." }, { status: 500 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Test API Route Error" }, { status: 500 });
  }
}
