"use client";

import React from "react";
import { RequireAuth } from "../../features/auth/components/RouteGuard";
import { PageWrapper } from "../../components/layout/PageWrapper";
import { Container } from "../../components/layout/Container";
import { Card } from "../../components/ui/card";
import { useAuth } from "../../hooks/useAuth";
import { Mail, Globe } from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <RequireAuth>
      <PageWrapper>
        <section className="w-full py-16 text-left min-h-[80vh] flex items-center justify-center">
          <Container className="max-w-xl">
            <Card variant="default" className="p-8 border-border bg-card shadow-floating flex flex-col gap-6">
              
              <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-2xl relative overflow-hidden select-none">
                  {user?.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    user?.fullName.charAt(0) || "U"
                  )}
                </div>
                <div className="space-y-1">
                  <h1 className="text-2xl font-heading font-extrabold text-foreground tracking-tight">
                    {user?.fullName}
                  </h1>
                  <p className="text-xs text-muted-foreground">
                    @{user?.username || "learner_user"}
                  </p>
                  <span className="inline-block text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded bg-primary/15 text-primary">
                    {user?.role}
                  </span>
                </div>
              </div>

              <div className="h-px w-full bg-border/50" />

              <div className="space-y-4 text-xs">
                <div className="flex items-center gap-3">
                  <Mail size={16} className="text-muted-foreground" />
                  <span className="text-foreground font-semibold">{user?.email}</span>
                </div>

                <div className="flex items-center gap-3">
                  <Globe size={16} className="text-muted-foreground" />
                  <span className="text-foreground font-semibold">{user?.country} ({user?.language})</span>
                </div>

                {user?.bio && (
                  <div className="space-y-1 border-t border-border/40 pt-3">
                    <span className="font-bold text-muted-foreground block">Biography</span>
                    <p className="text-foreground leading-relaxed font-medium">{user.bio}</p>
                  </div>
                )}

                {user?.role === "student" && user?.interests && user.interests.length > 0 && (
                  <div className="space-y-2 border-t border-border/40 pt-3">
                    <span className="font-bold text-muted-foreground block">Interests</span>
                    <div className="flex flex-wrap gap-2">
                      {user.interests.map((interest) => (
                        <span key={interest} className="px-2.5 py-1 bg-muted rounded-full text-[10px] font-bold text-foreground border border-border/60">
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {user?.role === "tutor" && user?.skills && user.skills.length > 0 && (
                  <div className="space-y-2 border-t border-border/40 pt-3">
                    <span className="font-bold text-muted-foreground block">Skills</span>
                    <div className="flex flex-wrap gap-2">
                      {user.skills.map((skill) => (
                        <span key={skill} className="px-2.5 py-1 bg-accent/10 rounded-full text-[10px] font-bold text-accent border border-accent/20">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            </Card>
          </Container>
        </section>
      </PageWrapper>
    </RequireAuth>
  );
}
