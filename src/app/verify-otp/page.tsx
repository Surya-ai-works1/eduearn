"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Container } from "../../components/layout/Container";
import { PageWrapper } from "../../components/layout/PageWrapper";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { useAuth } from "../../hooks/useAuth";
import { createClient } from "../../lib/supabase";
import { toast } from "sonner";
import { ShieldCheck, RotateCcw, Loader2 } from "lucide-react";

function VerifyOtpContent() {
  const { initialize } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      toast.error("Please enter a valid 6-digit numeric verification code.");
      return;
    }

    setIsLoading(true);
    const supabase = createClient();
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: "signup"
      });

      setIsLoading(false);

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("OTP verified successfully!");
      
      // Authoritatively initialize session store state
      await initialize();
      
      const sessionUser = useAuth.getState().user;
      if (!sessionUser?.role) {
        router.push("/choose-role");
      } else if (sessionUser.complete === false) {
        router.push("/complete-profile");
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

  const handleResend = async () => {
    if (!email) {
      toast.error("No email address found to resend verification code.");
      return;
    }
    setIsResending(true);
    const supabase = createClient();
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
      });
      setIsResending(false);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Verification code resent to your inbox!");
      }
    } catch (err: any) {
      setIsResending(false);
      toast.error(err?.message || "Failed to resend code.");
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
                {". Please check your email to verify your account."}
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
                  className="w-full bg-card border border-border shadow-sm hover:shadow-md transition-shadow duration-200 rounded-input h-12 text-center text-lg font-mono font-extrabold tracking-[8px] text-foreground focus:outline-none focus:border-primary/50 placeholder:text-muted-foreground/80"
                />
              </div>

              <Button type="submit" size="md" className="w-full mt-2" disabled={isLoading}>
                {isLoading ? "Verifying..." : "Verify OTP Code"}
              </Button>
            </form>

            <button
              onClick={handleResend}
              disabled={isResending}
              className="text-[9px] text-muted-foreground/80 font-extrabold uppercase tracking-wider flex items-center justify-center gap-1 hover:text-foreground cursor-pointer focus:outline-none bg-transparent disabled:opacity-50"
            >
              <RotateCcw size={10} className={isResending ? "animate-spin" : ""} />
              {isResending ? "Resending..." : "Resend OTP Code"}
            </button>

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
