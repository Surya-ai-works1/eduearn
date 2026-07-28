import { toast } from "sonner";

export interface EmailPayload {
  to: string;
  subject: string;
  htmlContent: string;
}

// Reusable email builder helper
function getBrandedEmailTemplate(title: string, contentHtml: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${title}</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #020617;
            color: #f1f5f9;
            margin: 0;
            padding: 20px;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #0f172a;
            border: 1px solid #1e293b;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            border-bottom: 1px solid #1e293b;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 24px;
            font-weight: 800;
            color: #3b82f6;
            text-decoration: none;
            letter-spacing: -0.025em;
          }
          .content {
            font-size: 15px;
            line-height: 1.625;
            color: #cbd5e1;
          }
          .footer {
            margin-top: 40px;
            border-top: 1px solid #1e293b;
            padding-top: 20px;
            text-align: center;
            font-size: 11px;
            color: #64748b;
          }
          .social-links {
            margin-top: 10px;
            margin-bottom: 10px;
          }
          .social-links a {
            color: #475569;
            text-decoration: none;
            margin: 0 10px;
          }
          .social-links a:hover {
            color: #3b82f6;
          }
          .btn {
            display: inline-block;
            background-color: #2563eb;
            color: #ffffff !important;
            font-weight: 600;
            text-decoration: none;
            padding: 10px 24px;
            border-radius: 8px;
            margin-top: 20px;
            font-size: 13px;
          }
          .btn:hover {
            background-color: #1d4ed8;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <a href="https://eduearn.com" class="logo">EduSpark</a>
          </div>
          <div class="content">
            ${contentHtml}
          </div>
          <div class="footer">
            <p>You received this email because you are registered with EduSpark Academy.</p>
            <div class="social-links">
              <a href="#">Twitter</a> | <a href="#">LinkedIn</a> | <a href="#">GitHub</a>
            </div>
            <p>&copy; ${new Date().getFullYear()} EduSpark Inc. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

// Logger helper
function logEmailEvent(event: string, recipient: string, template: string, success: boolean, errorMsg?: string) {
  const logData = {
    timestamp: new Date().toISOString(),
    event,
    recipient,
    template,
    success,
    error: errorMsg || null,
  };
  console.log(`[Email Service Logger] ${JSON.stringify(logData)}`);
}

// Startup check for Brevo configuration
if (typeof process !== "undefined" && process.env) {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  
  const exists = !!(apiKey && apiKey.trim() !== "" && apiKey !== "undefined");
  const length = apiKey ? apiKey.length : 0;
  const initialized = exists && !!senderEmail;

  console.log(`[Email Service Startup] Configuration status:`, {
    brevoApiKeyExists: exists,
    brevoApiKeyLength: length,
    senderEmailConfigured: !!senderEmail,
    emailServiceInitializedSuccessfully: initialized
  });
}

export const emailService = {
  async sendEmail(payload: EmailPayload): Promise<{ success: boolean; error?: string }> {
    const apiKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.BREVO_SENDER_EMAIL || "noreply@eduearn.com";
    const senderName = process.env.BREVO_SENDER_NAME || "EduSpark";

    if (!apiKey || apiKey.trim() === "" || apiKey === "undefined") {
      throw new Error("BREVO_API_KEY is not configured.");
    }

    const maxRetries = 2;
    let attempt = 0;
    let lastErrorMsg = "";

    while (attempt <= maxRetries) {
      try {
        const response = await fetch("https://api.brevo.com/v3/smtp/email", {
          method: "POST",
          headers: {
            "accept": "application/json",
            "content-type": "application/json",
            "api-key": apiKey,
          },
          body: JSON.stringify({
            sender: { name: senderName, email: senderEmail },
            to: [{ email: payload.to }],
            subject: payload.subject,
            htmlContent: payload.htmlContent,
          }),
        });

        if (response.ok) {
          logEmailEvent("SEND_SUCCESS", payload.to, payload.subject, true);
          return { success: true };
        }

        const errText = await response.text();
        if (response.status === 401) {
          console.error(`[Brevo API 401 Unauthorized Error] Full response body:`, errText);
        }
        lastErrorMsg = `Brevo HTTP ${response.status}: ${errText}`;
        throw new Error(lastErrorMsg);
      } catch (err: any) {
        attempt++;
        lastErrorMsg = err.message || "Unknown SMTP Network Error";
        console.error(`Email send attempt ${attempt} failed:`, err);
        if (attempt > maxRetries) {
          logEmailEvent("SEND_FAILURE", payload.to, payload.subject, false, lastErrorMsg);
          return { success: false, error: lastErrorMsg };
        }
        // Wait 1 second before retry
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
    return { success: false, error: lastErrorMsg || "Email delivery failed" };
  },

  async sendWelcomeEmail(to: string, name: string): Promise<{ success: boolean; error?: string }> {
    const subject = "Welcome to EduSpark! 🎉";
    const html = getBrandedEmailTemplate(
      subject,
      `
        <h2>Welcome aboard, ${name}!</h2>
        <p>We are absolutely thrilled to welcome you to EduSpark Academy! Here, you can learn at your own pace, connect with expert industry tutors, and secure verifiable certificates.</p>
        <p>Explore your dashboard, browse the course catalog, and kickstart your learning journey today!</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="btn">Go to Dashboard</a>
      `
    );
    return this.sendEmail({ to, subject, htmlContent: html });
  },

  async sendVerificationEmail(to: string, codeOrLink: string): Promise<{ success: boolean; error?: string }> {
    const isLink = codeOrLink.startsWith("http") || codeOrLink.startsWith("/");
    const subject = "Verify Your Email Address";
    const contentHtml = isLink 
      ? `
        <h2>Verify Your Email</h2>
        <p>Thank you for registering with EduSpark. Please click the button below to confirm your account status:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${codeOrLink}" class="btn" style="background-color: #3b82f6; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Verify Email</a>
        </div>
        <p>Alternatively, copy and paste this link into your browser:</p>
        <p style="word-break: break-all; font-size: 11px; color: #64748b;">${codeOrLink}</p>
        <p>If you did not make this request, please ignore this email.</p>
      `
      : `
        <h2>Verify Your Email</h2>
        <p>Thank you for registering with EduSpark. Please use the verification code below to confirm your account status:</p>
        <div style="font-size: 24px; font-weight: 800; letter-spacing: 0.1em; text-align: center; margin: 20px 0; color: #3b82f6; background-color: #0f172a; padding: 10px; border-radius: 8px; border: 1px dashed #1e293b;">
          ${codeOrLink}
        </div>
        <p>If you did not make this request, please safely ignore this email.</p>
      `;
    const html = getBrandedEmailTemplate(subject, contentHtml);
    return this.sendEmail({ to, subject, htmlContent: html });
  },

  async sendPasswordResetEmail(to: string, resetLink: string): Promise<{ success: boolean; error?: string }> {
    const subject = "Reset Your Password";
    const html = getBrandedEmailTemplate(
      subject,
      `
        <h2>Password Reset Request</h2>
        <p>We received a request to reset the password for your EduSpark account. Click the button below to set a new password:</p>
        <a href="${resetLink}" class="btn">Reset Password</a>
        <p style="margin-top: 20px; font-size: 12px; color: #64748b;">If you cannot click the button, copy and paste this link in your browser: <br>${resetLink}</p>
        <p>If you did not request a password reset, your password will remain unchanged.</p>
      `
    );
    return this.sendEmail({ to, subject, htmlContent: html });
  },

  async sendEnrollmentConfirmationEmail(to: string, name: string, courseTitle: string): Promise<{ success: boolean; error?: string }> {
    const subject = "Course Enrollment Confirmed 📚";
    const html = getBrandedEmailTemplate(
      subject,
      `
        <h2>Enrollment Confirmed!</h2>
        <p>Congratulations ${name}, you have successfully enrolled in: <strong>${courseTitle}</strong>.</p>
        <p>Your classroom is now open. Jump in to view syllabus lessons, download assignment outlines, and ask the AI Tutor any doubt queries!</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/learn" class="btn">Start Learning</a>
      `
    );
    return this.sendEmail({ to, subject, htmlContent: html });
  },

  async sendTutorRegistrationConfirmation(to: string, name: string): Promise<{ success: boolean; error?: string }> {
    const subject = "Tutor Application Received";
    const html = getBrandedEmailTemplate(
      subject,
      `
        <h2>Application Under Review</h2>
        <p>Dear ${name}, thank you for applying to become an instructor on EduSpark.</p>
        <p>Our quality review team is currently verifying your degree transcripts and scanning submitted certifications. We will notify you of the approval status shortly!</p>
      `
    );
    return this.sendEmail({ to, subject, htmlContent: html });
  },

  async sendTutorApprovalEmail(to: string, name: string, approved: boolean, reason?: string): Promise<{ success: boolean; error?: string }> {
    const subject = approved ? "Tutor Application Approved! 🎉" : "Tutor Application Status Update";
    const html = getBrandedEmailTemplate(
      subject,
      approved
        ? `
            <h2>Congratulations ${name}!</h2>
            <p>Your tutor application has been officially approved! You now have full access to the EduSpark Tutor Studio workspace.</p>
            <p>Start building courses, uploading outline lectures, and grading assignment submissions today.</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/tutor/studio" class="btn">Go to Tutor Studio</a>
          `
        : `
            <h2>Application Status Update</h2>
            <p>Dear ${name}, thank you for your interest in teaching on EduSpark.</p>
            <p>Unfortunately, our review team could not approve your application at this time.</p>
            ${reason ? `<p><strong>Feedback:</strong> ${reason}</p>` : ""}
            <p>You are welcome to submit updated materials or apply again in the future.</p>
          `
    );
    return this.sendEmail({ to, subject, htmlContent: html });
  },

  async sendAssignmentSubmissionEmail(to: string, name: string, assignmentTitle: string): Promise<{ success: boolean; error?: string }> {
    const subject = "Assignment Submitted Successfully";
    const html = getBrandedEmailTemplate(
      subject,
      `
        <h2>Homework Received</h2>
        <p>Hi ${name}, your submission for <strong>${assignmentTitle}</strong> has been successfully received.</p>
        <p>Your tutor will review and grade your answers shortly. We will notify you here once grading feedback is posted!</p>
      `
    );
    return this.sendEmail({ to, subject, htmlContent: html });
  },

  async sendCertificateEmail(to: string, name: string, courseTitle: string, certificateUrl: string): Promise<{ success: boolean; error?: string }> {
    const subject = "Congratulations on your Certificate! 🎓";
    const html = getBrandedEmailTemplate(
      subject,
      `
        <h2>Certificate Awarded!</h2>
        <p>Congratulations ${name}, you have completed all lessons in <strong>${courseTitle}</strong> and officially earned your Course Certificate!</p>
        <p>Your verifiable digital credential is ready for download:</p>
        <a href="${certificateUrl}" class="btn">Download Certificate</a>
      `
    );
    return this.sendEmail({ to, subject, htmlContent: html });
  },

  async sendContactFormEmail(to: string, fromName: string, fromEmail: string, message: string): Promise<{ success: boolean; error?: string }> {
    const subject = "New Contact Form Submission";
    const html = getBrandedEmailTemplate(
      subject,
      `
        <h2>New Message Received</h2>
        <p>You have a new contact message on EduSpark:</p>
        <div style="background-color: #0f172a; padding: 20px; border-radius: 8px; border: 1px solid #1e293b; color: #cbd5e1;">
          <p><strong>Name:</strong> ${fromName}</p>
          <p><strong>Email:</strong> ${fromEmail}</p>
          <p><strong>Message:</strong></p>
          <p>${message}</p>
        </div>
      `
    );
    return this.sendEmail({ to, subject, htmlContent: html });
  },

  async sendPaymentReceiptEmail(to: string, name: string, amount: string, txId: string): Promise<{ success: boolean; error?: string }> {
    const subject = "Your Payment Receipt 🧾";
    const html = getBrandedEmailTemplate(
      subject,
      `
        <h2>Payment Received</h2>
        <p>Thank you for your purchase, ${name}. Here is your transaction invoice:</p>
        <div style="background-color: #0f172a; padding: 20px; border-radius: 8px; border: 1px solid #1e293b; color: #cbd5e1; font-family: monospace;">
          <p>----------------------------------------</p>
          <p><strong>Transaction ID:</strong> ${txId}</p>
          <p><strong>Amount Paid:</strong> ${amount}</p>
          <p><strong>Status:</strong> Success</p>
          <p>----------------------------------------</p>
        </div>
        <p>If you have any questions, feel free to contact our support desk.</p>
      `
    );
    return this.sendEmail({ to, subject, htmlContent: html });
  },
};
