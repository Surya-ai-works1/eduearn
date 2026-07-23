import { NextResponse } from "next/server";
import { emailService } from "../../../lib/email/service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, to, ...args } = body;

    if (!to || !type) {
      return NextResponse.json({ error: "Missing required fields (to, type)" }, { status: 400 });
    }

    let success = false;

    switch (type) {
      case "welcome":
        success = await emailService.sendWelcomeEmail(to, args.name || "User");
        break;
      case "verification":
        success = await emailService.sendVerificationEmail(to, args.code || "");
        break;
      case "reset_password":
        success = await emailService.sendPasswordResetEmail(to, args.resetLink || "");
        break;
      case "enrollment":
        success = await emailService.sendEnrollmentConfirmationEmail(to, args.name || "Student", args.courseTitle || "");
        break;
      case "tutor_registration":
        success = await emailService.sendTutorRegistrationConfirmation(to, args.name || "Tutor");
        break;
      case "tutor_approval":
        success = await emailService.sendTutorApprovalEmail(to, args.name || "Tutor", !!args.approved, args.reason);
        break;
      case "assignment_submission":
        success = await emailService.sendAssignmentSubmissionEmail(to, args.name || "Student", args.assignmentTitle || "");
        break;
      case "certificate":
        success = await emailService.sendCertificateEmail(to, args.name || "Student", args.courseTitle || "", args.certificateUrl || "");
        break;
      case "contact_form":
        success = await emailService.sendContactFormEmail(to, args.fromName || "", args.fromEmail || "", args.message || "");
        break;
      case "payment_receipt":
        success = await emailService.sendPaymentReceiptEmail(to, args.name || "Student", args.amount || "", args.txId || "");
        break;
      default:
        return NextResponse.json({ error: `Unsupported email type: ${type}` }, { status: 400 });
    }

    if (success) {
      return NextResponse.json({ success: true, message: "Email sent successfully" });
    } else {
      return NextResponse.json({ error: "Failed to send email via Brevo" }, { status: 500 });
    }
  } catch (err: any) {
    console.error("API Email Route Exception:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}
