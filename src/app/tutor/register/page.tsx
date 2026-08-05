"use client";

/* eslint-disable react-hooks/incompatible-library */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Alert } from "../../../components/ui/alert";
import { Button } from "../../../components/ui/button";
import { AuthShell } from "../../../features/auth/components/AuthShell";
import { FormField } from "../../../features/auth/components/FormField";
import { PasswordStrengthMeter } from "../../../features/auth/components/PasswordStrengthMeter";
import { registerSchema, type RegisterFields } from "../../../features/auth/validation/authSchemas";
import { useAuth } from "../../../hooks/useAuth";
import { normalizeError } from "../../../utils/errors";

// ─── Animation variants ───────────────────────────────────────────────────────

const fieldVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" as const, delay: i * 0.06 },
  }),
};

// ─── TutorRegisterPage ────────────────────────────────────────────────────────

export default function TutorRegisterPage() {
  const router = useRouter();
  const { register: registerUser, chooseRole, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFields>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptedTerms: false as never,
      acceptedPrivacy: false as never,
    },
  });

  const password = watch("password");

  const onSubmit = async (values: RegisterFields) => {
    try {
      setFormError(null);
      
      // Save temporary onboarding role selector to resolve post-verification landing
      if (typeof window !== "undefined") {
        localStorage.setItem("onboarding_role", "tutor");
      }
      
      const result = await registerUser(values.email, values.password, values.fullName, "tutor");
      
      if (!result.ok) {
        setFormError(normalizeError(result.message));
        return;
      }
      
      toast.success(result.message);
      
      if (result.sessionCreated) {
        // If auto-login is active or mock mode is active, proceed to onboarding
        await chooseRole("tutor");
        router.replace("/tutor/onboarding");
      } else {
        // If email verification is required, redirect to the verify-otp page
        router.push(`/verify-otp?email=${encodeURIComponent(values.email)}`);
      }
    } catch (err: any) {
      setFormError(normalizeError(err));
    }
  };

  return (
    <AuthShell
      eyebrow="Tutor Registration"
      title="Teach on EduEarn"
      description="Create a tutor account. Teach live courses, automate evaluations with Sparky AI, and earn 70% share."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {/* Error banner */}
        {formError && <Alert variant="danger" description={formError} />}

        {/* Full name */}
        <motion.div custom={0} variants={fieldVariants} initial="hidden" animate="visible">
          <FormField
            label="Full name"
            type="text"
            autoComplete="name"
            placeholder="Enter your full name"
            icon={<User size={17} aria-hidden="true" />}
            error={errors.fullName?.message}
            {...register("fullName")}
          />
        </motion.div>

        {/* Email */}
        <motion.div custom={1} variants={fieldVariants} initial="hidden" animate="visible">
          <FormField
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="name@example.com"
            icon={<Mail size={17} aria-hidden="true" />}
            error={errors.email?.message}
            {...register("email")}
          />
        </motion.div>

        {/* Password */}
        <motion.div
          custom={2}
          variants={fieldVariants}
          initial="hidden"
          animate="visible"
          className="relative"
        >
          <FormField
            label="Password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Create a secure password"
            icon={<Lock size={17} aria-hidden="true" />}
            error={errors.password?.message}
            className="pr-12"
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute bottom-8 right-3 flex h-9 w-9 items-center justify-center rounded-button text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff size={17} aria-hidden="true" />
            ) : (
              <Eye size={17} aria-hidden="true" />
            )}
          </button>
        </motion.div>

        {/* Password strength meter with checklist */}
        <motion.div custom={3} variants={fieldVariants} initial="hidden" animate="visible">
          <PasswordStrengthMeter password={password} showRequirements />
        </motion.div>

        {/* Confirm password */}
        <motion.div
          custom={4}
          variants={fieldVariants}
          initial="hidden"
          animate="visible"
          className="relative"
        >
          <FormField
            label="Confirm password"
            type={showConfirmPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Re-enter your password"
            icon={<Lock size={17} aria-hidden="true" />}
            error={errors.confirmPassword?.message}
            className="pr-12"
            {...register("confirmPassword")}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((prev) => !prev)}
            className="absolute bottom-8 right-3 flex h-9 w-9 items-center justify-center rounded-button text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
          >
            {showConfirmPassword ? (
              <EyeOff size={17} aria-hidden="true" />
            ) : (
              <Eye size={17} aria-hidden="true" />
            )}
          </button>
        </motion.div>

        {/* Terms & Privacy checkboxes */}
        <motion.div
          custom={5}
          variants={fieldVariants}
          initial="hidden"
          animate="visible"
          className="space-y-3 rounded-[14px] border border-border bg-card p-4"
        >
          <label className="flex items-start gap-3 text-sm font-semibold text-muted-foreground cursor-pointer select-none">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 rounded border-border accent-primary"
              aria-describedby={errors.acceptedTerms ? "terms-error" : undefined}
              {...register("acceptedTerms")}
            />
            <span>
              I accept the{" "}
              <Link href="/terms" className="font-bold text-primary hover:underline">
                Terms &amp; Conditions
              </Link>
              .
            </span>
          </label>
          {errors.acceptedTerms && (
            <p id="terms-error" className="text-xs font-semibold text-destructive" role="alert">
              {errors.acceptedTerms.message}
            </p>
          )}

          <label className="flex items-start gap-3 text-sm font-semibold text-muted-foreground cursor-pointer select-none">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 rounded border-border accent-primary"
              aria-describedby={errors.acceptedPrivacy ? "privacy-error" : undefined}
              {...register("acceptedPrivacy")}
            />
            <span>
              I accept the{" "}
              <Link href="/privacy" className="font-bold text-primary hover:underline">
                Privacy Policy
              </Link>
              .
            </span>
          </label>
          {errors.acceptedPrivacy && (
            <p
              id="privacy-error"
              className="text-xs font-semibold text-destructive"
              role="alert"
            >
              {errors.acceptedPrivacy.message}
            </p>
          )}
        </motion.div>



        {/* Submit */}
        <motion.div custom={7} variants={fieldVariants} initial="hidden" animate="visible">
          <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
            Create tutor account
          </Button>
        </motion.div>
      </form>

      <motion.p
        custom={8}
        variants={fieldVariants}
        initial="hidden"
        animate="visible"
        className="mt-6 text-center text-sm font-medium text-muted-foreground"
      >
        Already have a tutor account?{" "}
        <Link href="/tutor/login" className="font-bold text-primary hover:underline">
          Log in
        </Link>
      </motion.p>
    </AuthShell>
  );
}
