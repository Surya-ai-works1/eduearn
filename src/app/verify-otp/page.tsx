"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Container } from "../../components/layout/Container";
import { PageWrapper } from "../../components/layout/PageWrapper";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { useAuth } from "../../hooks/useAuth";
import { createClient } from "../../lib/supabase";
import { toast } from "sonner";
import { ShieldCheck, RotateCcw, Loader2, Clock } from "lucide-react";

const TIMER_INITIAL_SECONDS = 60;

function VerifyOtpContent() {
  const { initialize } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(TIMER_INITIAL_SECONDS);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Initialize and clear countdown timer safely
  const startTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setTimerSeconds(TIMER_INITIAL_SECONDS);
    
    timerRef.current = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // 2. Submit and verify OTP token
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || isResending) return;

    if (!code || code.length !== 6) {
      toast.error("Please enter a valid 6-digit numeric verification code.");
      return;
    }

    setIsLoading(true);
    const supabase = createClient();
    try {
      if (!supabase) {
        throw new Error("Authentication service is unavailable.");
      }

      // First attempt with signup type
      let { error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: "signup"
      });

      // Fallback attempt with email type if signup type failed
      if (error) {
        const fallback = await supabase.auth.verifyOtp({
          email,
          token: code,
          type: "email"
        });
        if (!fallback.error) {
          error = null;
        }
      }

      setIsLoading(false);

      if (error) {
        if (error.status === 429) {
          toast.error("Too many verification attempts. Please wait a moment before trying again.");
        } else if (error.message?.toLowerCase().includes("expired")) {
          toast.error("Verification OTP has expired. Please click 'Resend OTP Code'.");
        } else {
          toast.error(error.message || "Invalid OTP verification code.");
        }
        return;
      }

      toast.success("OTP verified successfully ✓");
      
      // Synchronize auth state session
      await initialize();
      
      const sessionUser = useAuth.getState().user;
      if (!sessionUser?.role) {
        router.push("/choose-role");
      } else if (sessionUser.complete === false) {
        if (sessionUser.role === "tutor") {
          router.push("/tutor/onboarding");
        } else {
          router.push("/complete-profile");
        }
      } else {
        if (sessionUser.role === "admin" || sessionUser.role === "super-admin") {
          router.push("/admin/dashboard");
        } else if (sessionUser.role === "tutor") {
          router.push("/tutor/dashboard");
        } else {
          router.push("/student/dashboard");
        }
      }
    } catch (err: any) {
      setIsLoading(false);
      toast.error(err?.message || "Verification connection failed.");
    }
  };

  // 3. Resend OTP handler
  const handleResend = async () => {
    if (timerSeconds > 0 || isResending || isLoading) return;

    if (!email) {
      toast.error("No target email address found for resending code.");
      return;
    }

    setIsResending(true);
    const supabase = createClient();
    try {
      if (!supabase) {
        throw new Error("Authentication service is unavailable.");
      }

      let { error } = await supabase.auth.resend({
        type: "signup",
        email,
      });

      if (error) {
        const fallbackRes = await supabase.auth.resend({
          type: "email_change",
          email,
        });
        if (!fallbackRes.error) {
          error = null;
        }
      }

      setIsResending(false);
      if (error) {
        if (error.status === 429 || error.message?.toLowerCase().includes("rate limit")) {
          toast.error("Rate limit reached. Please wait 60 seconds before requesting another code.");
        } else {
          toast.error(error.message || "Failed to resend verification code.");
        }
      } else {
        toast.success("New verification code sent to your inbox!");
        startTimer(); // Restart 60s countdown timer
      }
    } catch (err: any) {
      setIsResending(false);
      toast.error(err?.message || "Failed to resend verification code.");
    }
  };

  return (
    <PageWrapper>
      <section className="w-full py-16 select-none text-left min-h-[80vh] flex items-center justify-center">
        <Container className="max-w-md">
          <Card variant="default" className="p-8 border-border bg-card shadow-floating flex flex-col gap-6 text-center">
            
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 mx-auto">
              <ShieldCheck size={22} />
            </div>

            <div>
              <h1 className="text-xl font-heading font-extrabold text-foreground tracking-tight">
                OTP Verification
              </h1>
              <p className="text-[10px] text-muted-foreground mt-1 max-w-xs mx-auto leading-relaxed">
                {"Enter the 6-digit verification code sent to "}
                <span className="font-extrabold text-foreground">{email || "your inbox"}</span>
                {". Check your email inbox or spam folder."}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs font-semibold">
              <div className="flex flex-col gap-1.5 text-center">
                <input
                  type="text"
                  maxLength={6}
                  required
                  placeholder="0 0 0 0 0 0"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  disabled={isLoading}
                  className="w-full bg-card border border-border shadow-sm hover:shadow-md transition-shadow duration-200 rounded-input h-12 text-center text-lg font-mono font-extrabold tracking-[8px] text-foreground focus:outline-none focus:border-primary/50 placeholder:text-muted-foreground/80 disabled:opacity-50"
                />
              </div>

              <Button type="submit" size="md" className="w-full mt-2" disabled={isLoading || code.length !== 6}>
                {isLoading ? (
                  <span className="flex items-center gap-2 justify-center">
                    <Loader2 className="animate-spin" size={14} /> Verifying OTP...
                  </span>
                ) : (
                  "Verify OTP Code"
                )}
              </Button>
            </form>

            <div className="pt-2 border-t border-border/40 flex items-center justify-center">
              <button
                type="button"
                onClick={handleResend}
                disabled={timerSeconds > 0 || isResending || isLoading}
                className="text-[10px] text-muted-foreground/90 font-extrabold uppercase tracking-wider flex items-center justify-center gap-1.5 hover:text-foreground cursor-pointer focus:outline-none bg-transparent disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                {isResending ? (
                  <>
                    <RotateCcw size={12} className="animate-spin" />
                    <span>Resending Code...</span>
                  </>
                ) : timerSeconds > 0 ? (
                  <>
                    <Clock size={12} className="text-amber-500" />
                    <span>Resend OTP available in {timerSeconds}s</span>
                  </>
                ) : (
                  <>
                    <RotateCcw size={12} />
                    <span>Resend OTP Code</span>
                  </>
                )}
              </button>
            </div>

          </Card>
        </Container>
      </section>
    </PageWrapper>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={
      <div className="py-24 flex flex-col items-center justify-center gap-2 min-h-[80vh]">
        <Loader2 className="animate-spin text-primary" size={32} />
        <span className="text-xs text-muted-foreground font-bold">Loading OTP verification...</span>
      </div>
    }>
      <VerifyOtpContent />
    </Suspense>
  );
}
