"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { normalizeError } from "../../../utils/errors";

import { Button } from "../../../components/ui/button";
import { Alert } from "../../../components/ui/alert";
import { AuthShell } from "../../../features/auth/components/AuthShell";
import { FormField } from "../../../features/auth/components/FormField";
import { loginSchema, type LoginFields } from "../../../features/auth/validation/authSchemas";
import { useAuth } from "../../../hooks/useAuth";

// ─── Animation variants ───────────────────────────────────────────────────────

const fieldVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" as const, delay: i * 0.07 },
  }),
};

// ─── Error messages from auth callback ───────────────────────────────────────

const CALLBACK_ERRORS: Record<string, string> = {
  missing_code: "The authentication link is invalid or has already been used.",
  exchange_failed: "Your session link has expired. Please request a new one.",
  configuration: "Authentication is not configured. Contact support.",
};

// ─── TutorLoginPage ──────────────────────────────────────────────────────────

export default function TutorLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, user, isAuthenticated, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  // Auto-redirect already authenticated users to their correct journeys
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === "tutor") {
        if (user.complete) {
          router.replace("/tutor/dashboard");
        } else {
          router.replace("/tutor/onboarding");
        }
      } else if (user.role === "admin") {
        router.replace("/admin/dashboard");
      } else {
        router.replace("/student/dashboard");
      }
    }
  }, [user, isAuthenticated, router]);

  // Read callback errors at render time
  const callbackErrorKey = searchParams.get("error");
  const callbackError =
    callbackErrorKey && CALLBACK_ERRORS[callbackErrorKey]
      ? CALLBACK_ERRORS[callbackErrorKey]
      : null;

  const [formError, setFormError] = useState<string | null>(callbackError);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFields>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: true,
    },
  });

  const onSubmit = async (values: LoginFields) => {
    try {
      setFormError(null);
      const result = await login(values.email, values.password, values.rememberMe);

      if (!result.ok) {
        setFormError(normalizeError(result.message));
        return;
      }

      toast.success(result.message);

      // Immediately determine correct redirect route based on returned profile details
      const role = result.role;
      const complete = result.complete;

      if (role === "tutor") {
        if (complete) {
          router.replace("/tutor/dashboard");
        } else {
          router.replace("/tutor/onboarding");
        }
      } else if (role === "admin") {
        router.replace("/admin/dashboard");
      } else {
        router.replace("/student/dashboard");
      }
    } catch (err) {
      setFormError(normalizeError(err));
    }
  };



  return (
    <AuthShell
      eyebrow="Tutor Portal"
      title="Tutor Login"
      description="Sign in to access your Tutor Studio, manage batches, evaluate clearances, and track payouts."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {/* Error banner */}
        {formError && <Alert variant="danger" description={formError} />}

        {/* Email */}
        <motion.div custom={0} variants={fieldVariants} initial="hidden" animate="visible">
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
          custom={1}
          variants={fieldVariants}
          initial="hidden"
          animate="visible"
          className="relative"
        >
          <FormField
            label="Password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Enter your password"
            icon={<Lock size={17} aria-hidden="true" />}
            error={errors.password?.message}
            className="pr-12"
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute bottom-1.5 right-1.5 flex h-9 w-9 items-center justify-center rounded-button text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff size={17} aria-hidden="true" />
            ) : (
              <Eye size={17} aria-hidden="true" />
            )}
          </button>
        </motion.div>

        {/* Remember me & Forgot Password placement */}
        <motion.div
          custom={2}
          variants={fieldVariants}
          initial="hidden"
          animate="visible"
          className="flex items-center justify-between"
        >
          <label className="flex items-center gap-2.5 text-xs font-semibold text-muted-foreground cursor-pointer select-none">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-border bg-card accent-primary"
              {...register("rememberMe")}
            />
            <span>Remember me</span>
          </label>
          <Link
            href="/forgot-password"
            className="text-xs font-bold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
          >
            Forgot password?
          </Link>
        </motion.div>

        {/* Submit */}
        <motion.div custom={3} variants={fieldVariants} initial="hidden" animate="visible">
          <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
            Log in
          </Button>
        </motion.div>
      </form>



      <motion.p
        custom={4}
        variants={fieldVariants}
        initial="hidden"
        animate="visible"
        className="mt-6 text-center text-sm font-medium text-muted-foreground"
      >
        New to teaching?{" "}
        <Link href="/tutor/register" className="font-bold text-primary hover:underline">
          Create a tutor account
        </Link>
      </motion.p>
    </AuthShell>
  );
}
