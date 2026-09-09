"use client";

/* eslint-disable react-hooks/incompatible-library */

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Eye, EyeOff, Lock, ShieldAlert } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Alert } from "../../components/ui/alert";
import { Button } from "../../components/ui/button";
import { AuthShell } from "../../features/auth/components/AuthShell";
import { AuthStatePanel } from "../../features/auth/components/AuthStatePanel";
import { FormField } from "../../features/auth/components/FormField";
import { PasswordStrengthMeter } from "../../features/auth/components/PasswordStrengthMeter";
import { resetPasswordSchema, type ResetPasswordFields } from "../../features/auth/validation/authSchemas";
import { useAuth } from "../../hooks/useAuth";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { resetPassword, isLoading, isAuthenticated } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  /**
   * Guard: The user must arrive here via the Supabase auth callback,
   * which sets a session. If there is no session, we cannot update the password,
   * so we redirect them to request a new reset link.
   *
   * NOTE: We check `isLoading` first to avoid a flash-redirect while the
   * auth store is still initialising on first render.
   */
  useEffect(() => {
    // Only redirect once the auth store has finished initialising
    if (!isLoading && !isAuthenticated) {
      toast.error("Your reset link has expired or is invalid. Please request a new one.");
      router.replace("/forgot-password");
    }
  }, [isLoading, isAuthenticated, router]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFields>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const password = watch("password");

  const onSubmit = async (values: ResetPasswordFields) => {
    setFormError(null);
    const result = await resetPassword(values.password);

    if (!result.ok) {
      setFormError(result.message);
      return;
    }

    toast.success("Password updated successfully. Please log in with your new password.");
    setIsSuccess(true);
  };

  return (
    <AuthShell
      eyebrow="Password Reset"
      title={isSuccess ? "Password updated" : "Set a new password"}
      description={
        isSuccess
          ? "Your password has been changed successfully. You can now log in."
          : "Choose a strong password to keep your EduEarn account safe."
      }
      backHref="/login"
      backLabel="Back to login"
    >
      {isSuccess ? (
        /* ── Success state ──────────────────────────────────────── */
        <AuthStatePanel
          icon={CheckCircle2}
          tone="success"
          title="Password updated!"
          description="Your new password is active. Log in to continue your EduEarn journey."
          primaryAction={{ href: "/login", label: "Go to login" }}
        />
      ) : (
        /* ── Reset password form ─────────────────────────────────── */
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          {/* Configuration / session error banner */}
          {formError && (
            <Alert
              variant="danger"
              title="Could not update password"
              description={formError}
            />
          )}

          {/* New password field */}
          <FormField
            label="New password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Create a strong new password"
            icon={<Lock size={17} aria-hidden="true" />}
            error={errors.password?.message}
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="flex h-9 w-9 items-center justify-center rounded-button text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label={showPassword ? "Hide new password" : "Show new password"}
                aria-pressed={showPassword}
              >
                {showPassword ? (
                  <EyeOff size={17} aria-hidden="true" />
                ) : (
                  <Eye size={17} aria-hidden="true" />
                )}
              </button>
            }
            {...register("password")}
          />

          {/* Password strength meter */}
          <PasswordStrengthMeter password={password} showRequirements />

          {/* Confirm password field */}
          <FormField
            label="Confirm new password"
            type={showConfirmPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Re-enter your new password"
            icon={<Lock size={17} aria-hidden="true" />}
            error={errors.confirmPassword?.message}
            rightElement={
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="flex h-9 w-9 items-center justify-center rounded-button text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label={
                  showConfirmPassword ? "Hide confirm password" : "Show confirm password"
                }
                aria-pressed={showConfirmPassword}
              >
                {showConfirmPassword ? (
                  <EyeOff size={17} aria-hidden="true" />
                ) : (
                  <Eye size={17} aria-hidden="true" />
                )}
              </button>
            }
            {...register("confirmPassword")}
          />

          {/* Security note */}
          <div className="flex items-start gap-2 rounded-[10px] border border-border bg-muted/30 px-3 py-2.5">
            <ShieldAlert
              size={14}
              className="mt-0.5 flex-shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
            <p className="text-[11px] leading-5 text-muted-foreground">
              Your password is encrypted and never stored in plain text. This link can only
              be used once.
            </p>
          </div>

          <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
            Update password
          </Button>

          <p className="text-center text-xs font-medium text-muted-foreground">
            Remembered your password?{" "}
            <Link href="/login" className="font-bold text-primary hover:underline">
              Log in
            </Link>
          </p>
        </form>
      )}
    </AuthShell>
  );
}
