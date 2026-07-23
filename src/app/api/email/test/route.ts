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

    let success = false;
    const testCode = Math.floor(100000 + Math.random() * 900000).toString();
    const testResetLink = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=test_token_123`;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://omgdjkzkervioonhcpvh.supabase.co";
    const testCertUrl = `${supabaseUrl}/storage/v1/object/public/certificates/test_cert.png`;

    switch (type) {
      case "welcome":
        success = await emailService.sendWelcomeEmail(to, "Test User");
        break;
      case "verification":
        success = await emailService.sendVerificationEmail(to, testCode);
        break;
      case "reset_password":
        success = await emailService.sendPasswordResetEmail(to, testResetLink);
        break;
      case "enrollment":
        success = await emailService.sendEnrollmentConfirmationEmail(to, "Test Student", "Full-Stack Web Development Course");
        break;
      case "tutor_registration":
        success = await emailService.sendTutorRegistrationConfirmation(to, "Test Candidate");
        break;
      case "tutor_approval":
        success = await emailService.sendTutorApprovalEmail(to, "Approved Tutor", true);
        break;
      case "tutor_rejection":
        success = await emailService.sendTutorApprovalEmail(to, "Rejected Candidate", false, "Credentials provided were incomplete.");
        break;
      case "assignment_submission":
        success = await emailService.sendAssignmentSubmissionEmail(to, "Test Student", "React Hooks Homework Project");
        break;
      case "certificate":
        success = await emailService.sendCertificateEmail(to, "Graduating Scholar", "Advanced Systems Engineering", testCertUrl);
        break;
      case "contact_form":
        success = await emailService.sendContactFormEmail(to, "Inquirer Name", "inquirer@example.com", "This is a test feedback submission message.");
        break;
      case "payment_receipt":
        success = await emailService.sendPaymentReceiptEmail(to, "Paying Customer", "₹1499", "TXN-999888");
        break;
      default:
        return NextResponse.json({ error: `Unsupported template: ${type}` }, { status: 400 });
    }

    if (success) {
      return NextResponse.json({ success: true, message: `Test '${type}' email sent to ${to}` });
    } else {
      return NextResponse.json({ error: "Brevo integration returned failure response. Check server logs." }, { status: 500 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Test API Route Error" }, { status: 500 });
  }
}
