"use client";

import React from "react";
import { RequireAuth } from "../../features/auth/components/RouteGuard";
import { PageWrapper } from "../../components/layout/PageWrapper";
import { Container } from "../../components/layout/Container";
import { Card } from "../../components/ui/card";
import { useAuth } from "../../hooks/useAuth";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <RequireAuth>
      <PageWrapper>
        <section className="w-full py-16 text-left min-h-[80vh] flex items-center justify-center">
          <Container className="max-w-xl">
            <Card variant="default" className="p-8 border-border bg-card shadow-floating flex flex-col gap-6">
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Settings size={20} />
                </div>
                <div>
                  <h1 className="text-xl font-heading font-extrabold text-foreground">
                    Account Settings
                  </h1>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Placeholder for Phase 5 settings features.
                  </p>
                </div>
              </div>

              <div className="h-px w-full bg-border/50" />

              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between border-b border-border/40 pb-3">
                  <div>
                    <span className="font-bold text-foreground block">Email Address</span>
                    <span className="text-muted-foreground">{user?.email}</span>
                  </div>
                  <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded">Primary</span>
                </div>

                <div className="flex items-center justify-between border-b border-border/40 pb-3">
                  <div>
                    <span className="font-bold text-foreground block">Username</span>
                    <span className="text-muted-foreground">@{user?.username || "learner_user"}</span>
                  </div>
                  <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded">Public</span>
                </div>

                <div className="flex items-center justify-between border-b border-border/40 pb-3">
                  <div>
                    <span className="font-bold text-foreground block">Profile Visibility</span>
                    <span className="text-muted-foreground">Public feeds and category suggestions</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded">Active</span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-foreground block">Two-Factor Authentication (MFA)</span>
                    <span className="text-muted-foreground">Secure your login attempts using authenticator OTPs</span>
                  </div>
                  <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded">Inactive</span>
                </div>
              </div>

            </Card>
          </Container>
        </section>
      </PageWrapper>
    </RequireAuth>
  );
}
