"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Mail, XCircle } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Alert } from "../../components/ui/alert";
import { Button } from "../../components/ui/button";
import { AuthShell } from "../../features/auth/components/AuthShell";
import { AuthStatePanel } from "../../features/auth/components/AuthStatePanel";
import { FormField } from "../../features/auth/components/FormField";
import {
  forgotPasswordSchema,
  type ForgotPasswordFields,
} from "../../features/auth/validation/authSchemas";
import { useAuth } from "../../hooks/useAuth";

// ─── Animation variants ───────────────────────────────────────────────────────

const fieldVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" as const, delay: i * 0.07 },
  }),
};

// ─── ForgotPasswordPage ───────────────────────────────────────────────────────

export default function ForgotPasswordPage() {
  const { sendResetLink } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [successEmail, setSuccessEmail] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFields>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (values: ForgotPasswordFields) => {
    setIsLoading(true);
    setFormError(null);

    const result = await sendResetLink(values.email);
    setIsLoading(false);

    if (!result.ok) {
      setFormError(result.message);
      return;
    }

    setSuccessEmail(values.email);
    toast.success(result.message);
  };

  return (
    <AuthShell
      eyebrow="Password Recovery"
      title={successEmail ? "Check your inbox" : "Reset your password"}
      description="We will send a secure reset link to the email connected to your EduEarn account."
      backHref="/login"
      backLabel="Back to login"
    >
      {successEmail ? (
        /* ── Success state ────────────────────────────────────── */
        <AuthStatePanel
          icon={CheckCircle2}
          tone="success"
          title="Reset link sent"
          description={`A password reset link has been sent to ${successEmail}. Open it in this browser to create a new password. Check your spam folder if it doesn't arrive in a few minutes.`}
          primaryAction={{ href: "/login", label: "Return to login" }}
          secondaryAction={
            <button
              type="button"
              onClick={() => {
                setSuccessEmail(null);
                setFormError(null);
              }}
              className="text-xs font-semibold text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
            >
              Try a different email
            </button>
          }
        />
      ) : (
        /* ── Reset request form ────────────────────────────────── */
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          {/* Error banner */}
          {formError && (
            <Alert
              variant="danger"
              title="Unable to send reset link"
              description={formError}
            />
          )}

          {/* Email */}
          <motion.div custom={0} variants={fieldVariants} initial="hidden" animate="visible">
            <FormField
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="name@example.com"
              icon={
                formError ? (
                  <XCircle size={17} aria-hidden="true" />
                ) : (
                  <Mail size={17} aria-hidden="true" />
                )
              }
              error={errors.email?.message}
              {...register("email")}
            />
          </motion.div>

          {/* Help note */}
          <motion.p
            custom={1}
            variants={fieldVariants}
            initial="hidden"
            animate="visible"
            className="text-[11px] leading-5 text-muted-foreground"
          >
            Enter the email address you used to create your EduEarn account. If it&apos;s
            registered, you&apos;ll receive a password reset link within a few minutes.
          </motion.p>

          {/* Submit */}
          <motion.div custom={2} variants={fieldVariants} initial="hidden" animate="visible">
            <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
              Send reset link
            </Button>
          </motion.div>
        </form>
      )}
    </AuthShell>
  );
}
