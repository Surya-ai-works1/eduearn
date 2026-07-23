export const emailClient = {
  async triggerEmail(type: string, to: string, args: Record<string, any> = {}): Promise<boolean> {
    try {
      const response = await fetch("/api/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type,
          to,
          ...args,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || `HTTP ${response.status}`);
      }

      const resData = await response.json();
      return !!resData.success;
    } catch (err) {
      console.error(`Failed to trigger ${type} email to ${to}:`, err);
      return false;
    }
  },

  async triggerWelcomeEmail(to: string, name: string): Promise<boolean> {
    return this.triggerEmail("welcome", to, { name });
  },

  async triggerVerificationEmail(to: string, code: string): Promise<boolean> {
    return this.triggerEmail("verification", to, { code });
  },

  async triggerPasswordResetEmail(to: string, resetLink: string): Promise<boolean> {
    return this.triggerEmail("reset_password", to, { resetLink });
  },

  async triggerEnrollmentEmail(to: string, name: string, courseTitle: string): Promise<boolean> {
    return this.triggerEmail("enrollment", to, { name, courseTitle });
  },

  async triggerTutorRegistrationEmail(to: string, name: string): Promise<boolean> {
    return this.triggerEmail("tutor_registration", to, { name });
  },

  async triggerTutorApprovalEmail(to: string, name: string, approved: boolean, reason?: string): Promise<boolean> {
    return this.triggerEmail("tutor_approval", to, { name, approved, reason });
  },

  async triggerAssignmentSubmissionEmail(to: string, name: string, assignmentTitle: string): Promise<boolean> {
    return this.triggerEmail("assignment_submission", to, { name, assignmentTitle });
  },

  async triggerCertificateEmail(to: string, name: string, courseTitle: string, certificateUrl: string): Promise<boolean> {
    return this.triggerEmail("certificate", to, { name, courseTitle, certificateUrl });
  },

  async triggerContactFormEmail(to: string, fromName: string, fromEmail: string, message: string): Promise<boolean> {
    return this.triggerEmail("contact_form", to, { fromName, fromEmail, message });
  },

  async triggerPaymentReceiptEmail(to: string, name: string, amount: string, txId: string): Promise<boolean> {
    return this.triggerEmail("payment_receipt", to, { name, amount, txId });
  },
};
