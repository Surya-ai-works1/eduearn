"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Container } from "../../components/layout/Container";
import { PageWrapper } from "../../components/layout/PageWrapper";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { useAuth } from "../../hooks/useAuth";
import { createClient } from "../../lib/supabase";
import { toast } from "sonner";
import { Mail, RotateCcw, CheckCircle, ShieldAlert } from "lucide-react";
import { normalizeError } from "../../utils/errors";

export default function VerifyEmailPage() {
  const { user, initialize, resendVerificationEmail } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  // Safely extract email from URL query parameter or user session state on client mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const queryEmail = params.get("email");
      if (queryEmail) {
        setEmail(queryEmail);
      } else if (user?.email) {
        setEmail(user.email);
      }
    }
  }, [user]);

  // Bypass this page automatically if email is already verified
  useEffect(() => {
    if (user?.emailVerified) {
      if (!user.role) {
        router.push("/choose-role");
      } else if (!user.complete) {
        router.push("/complete-profile");
      } else {
        router.push("/learn");
      }
    }
  }, [user, router]);

  const handleResend = async () => {
    if (!email) {
      toast.error("Please enter or verify your email address before resending.");
      return;
    }
    setIsResending(true);
    const result = await resendVerificationEmail(email);
    setIsResending(false);
    
    if (result.ok) {
      toast.success(`Verification email successfully resent to ${email}!`);
    } else {
      toast.error(normalizeError(result.message));
    }
  };

  const handleCheckStatus = async () => {
    setIsChecking(true);
    const supabase = createClient();
    if (!supabase) {
      setIsChecking(false);
      toast.error("Database connection configuration issue.");
      return;
    }

    // Authoritative session check
    let sessionResult;
    try {
      const { data: { session }, error: sessionErr } = await supabase.auth.getSession();
      if (sessionErr || !session) {
        const { data: refreshData, error: refreshErr } = await supabase.auth.refreshSession();
        if (refreshErr || !refreshData.session) {
          toast.error("Your session has expired. Please log in again.");
          router.push("/login");
          setIsChecking(false);
          return;
        }
        sessionResult = refreshData.session;
      } else {
        sessionResult = session;
      }
    } catch {
      toast.error("Authentication session check failed.");
      setIsChecking(false);
      return;
    }

    try {
      const { data: { user: updatedUser }, error } = await supabase.auth.getUser();
      setIsChecking(false);
      
      if (error || !updatedUser) {
        toast.error(normalizeError(error || "Could not fetch verification status. Try logging in again."));
        return;
      }
      
      if (updatedUser.email_confirmed_at) {
        toast.success("Email verified successfully!");
        await initialize(); // Refresh auth store session state
        
        // Onward flow: complete-profile
        router.push("/complete-profile");
      } else {
        toast.error("Verification pending. Please check your inbox and verify.");
      }
    } catch (err) {
      setIsChecking(false);
      toast.error(normalizeError(err));
    }
  };

  return (
    <PageWrapper>
      <section className="w-full py-16 select-none text-left min-h-[80vh] flex items-center justify-center">
        <Container className="max-w-md">
          <Card variant="default" className="p-8 border-border bg-card shadow-floating flex flex-col gap-6 text-center">
            
            <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto">
              <Mail size={22} />
            </div>

            <div>
              <h1 className="text-xl font-heading font-extrabold text-foreground tracking-tight">
                Verify Your Email
              </h1>
              <p className="text-[10px] text-muted-foreground mt-1 max-w-xs mx-auto leading-relaxed">
                {"We dispatched a verification email to your university address "}
                <span className="font-extrabold text-foreground">{email || "name@college.edu"}</span>
                {". Please check your inbox and verify."}
              </p>
            </div>

            <div className="flex flex-col gap-3 mt-2 w-full">
              {/* Check Verification Status */}
              <Button
                variant="primary"
                onClick={handleCheckStatus}
                disabled={isChecking}
                className="w-full flex items-center justify-center gap-1.5 shadow-premium"
              >
                <CheckCircle size={14} />
                {isChecking ? "Checking..." : "I've Verified My Email"}
              </Button>

              {/* Resend button */}
              <Button
                variant="outline"
                onClick={handleResend}
                disabled={isResending}
                className="w-full flex items-center justify-center gap-1.5"
              >
                <RotateCcw size={13} className={isResending ? "animate-spin" : ""} />
                {isResending ? "Resending..." : "Resend Verification Email"}
              </Button>
            </div>

            <div className="pt-2 border-t border-border/40 flex items-center justify-center gap-1.5 text-[9px] text-muted-foreground">
              <ShieldAlert size={12} className="text-amber-500" />
              <span>Verification email may take a few minutes to land. Check spam folder.</span>
            </div>

          </Card>
        </Container>
      </section>
    </PageWrapper>
  );
}
