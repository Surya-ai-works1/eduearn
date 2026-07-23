"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Container } from "../../components/layout/Container";
import { PageWrapper } from "../../components/layout/PageWrapper";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "sonner";
import { ShieldCheck, RotateCcw } from "lucide-react";

export default function VerifyOtpPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // NOTE: verifyOtp is a Phase 4.3 feature. This page is a placeholder.
  // The sandbox simulation below keeps the UI functional during development.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      toast.error("Please enter a valid 6-digit numeric verification code.");
      return;
    }

    setIsLoading(true);
    // Sandbox simulation — real Supabase OTP verification is Phase 4.3
    await new Promise<void>((resolve) => setTimeout(resolve, 800));
    setIsLoading(false);

    const success = code === "123456";
    if (success) {
      toast.success("OTP verified successfully!");
      if (user && !user.role) {
        router.push("/choose-role");
      } else {
        router.push("/complete-profile");
      }
    } else {
      toast.error("Invalid OTP code. Use 123456 for sandbox testing.");
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
                {"Enter the 6-digit verification code sent to your mobile phone or university inbox. Try code "}
                <span className="font-extrabold text-foreground">123456</span>
                {" for local sandbox testing."}
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
              onClick={() => toast.success("OTP verification code resent!")}
              className="text-[9px] text-muted-foreground/80 font-extrabold uppercase tracking-wider flex items-center justify-center gap-1 hover:text-foreground cursor-pointer focus:outline-none bg-transparent"
            >
              <RotateCcw size={10} />
              Resend OTP Code
            </button>

          </Card>
        </Container>
      </section>
    </PageWrapper>
  );
}
