"use client";

import React, { useState, useEffect } from "react";
import { RequireAuth } from "../../features/auth/components/RouteGuard";
import { PageWrapper } from "../../components/layout/PageWrapper";
import { Container } from "../../components/layout/Container";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { useAuth } from "../../hooks/useAuth";
import { Mail, Globe, Edit3, Save, X, Loader2, Check, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "../../lib/supabase/client";

export default function ProfilePage() {
  const { user, completeProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    bio: "",
    country: "",
    language: "",
    avatarUrl: "",
    interests: "",
  });

  useEffect(() => {
    if (user) {
      setForm({
        fullName: user.fullName || "",
        bio: user.bio || "",
        country: user.country || "India",
        language: user.language || "English",
        avatarUrl: user.avatarUrl || "",
        interests: (user.interests || user.skills || []).join(", "),
      });
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName.trim()) {
      toast.error("Full name cannot be empty.");
      return;
    }

    setIsSaving(true);

    try {
      const supabase = createClient();
      const interestsArray = form.interests.split(",").map((s) => s.trim()).filter(Boolean);

      if (supabase && user?.id) {
        await supabase
          .from("profiles")
          .update({
            full_name: form.fullName.trim(),
            bio: form.bio.trim(),
            country: form.country.trim(),
            language: form.language.trim(),
            avatar_url: form.avatarUrl.trim(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id);
      }

      await completeProfile({
        fullName: form.fullName.trim(),
        bio: form.bio.trim(),
        country: form.country.trim(),
        language: form.language.trim(),
        avatarUrl: form.avatarUrl.trim(),
        interests: interestsArray,
        skills: interestsArray,
      });

      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (err: any) {
      console.error("Profile save error:", err);
      toast.error("Failed to update profile. Saved locally.");
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <RequireAuth>
      <PageWrapper>
        <section className="w-full py-16 text-left min-h-[80vh] flex items-center justify-center select-none">
          <Container className="max-w-xl">
            <Card variant="default" className="p-8 border-border bg-card shadow-floating flex flex-col gap-6">
              
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-border/40 pb-6">
                <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                  <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-2xl relative overflow-hidden shrink-0">
                    {user?.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      user?.fullName?.charAt(0) || "U"
                    )}
                  </div>
                  <div className="space-y-1">
                    <h1 className="text-2xl font-heading font-extrabold text-foreground tracking-tight">
                      {user?.fullName}
                    </h1>
                    <p className="text-xs text-muted-foreground">
                      @{user?.username || "learner_user"}
                    </p>
                    <span className="inline-block text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded bg-primary/15 text-primary">
                      {user?.role}
                    </span>
                  </div>
                </div>

                {!isEditing && (
                  <Button
                    onClick={() => setIsEditing(true)}
                    size="sm"
                    variant="outline"
                    className="h-9 text-xs font-bold gap-1.5 border-border/80 hover:bg-muted"
                  >
                    <Edit3 size={14} />
                    Edit Profile
                  </Button>
                )}
              </div>

              {isEditing ? (
                <form onSubmit={handleSave} className="space-y-4 text-xs font-semibold">
                  <div className="space-y-1">
                    <label className="font-bold text-foreground">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={form.fullName}
                      onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
                      className="h-10 w-full rounded-xl border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-foreground">Biography</label>
                    <textarea
                      rows={3}
                      value={form.bio}
                      onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
                      placeholder="Tell us about yourself..."
                      className="w-full rounded-xl border border-border bg-card p-3 text-xs font-semibold text-foreground focus:outline-none resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-foreground">Country</label>
                      <input
                        type="text"
                        value={form.country}
                        onChange={(e) => setForm((p) => ({ ...p, country: e.target.value }))}
                        className="h-10 w-full rounded-xl border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-foreground">Language</label>
                      <input
                        type="text"
                        value={form.language}
                        onChange={(e) => setForm((p) => ({ ...p, language: e.target.value }))}
                        className="h-10 w-full rounded-xl border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-foreground">Profile Picture Avatar URL</label>
                    <input
                      type="text"
                      value={form.avatarUrl}
                      onChange={(e) => setForm((p) => ({ ...p, avatarUrl: e.target.value }))}
                      placeholder="https://..."
                      className="h-10 w-full rounded-xl border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-foreground">
                      {user?.role === "tutor" ? "Teaching Skills" : "Learning Interests"} (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={form.interests}
                      onChange={(e) => setForm((p) => ({ ...p, interests: e.target.value }))}
                      placeholder="Mathematics, Python, Photography"
                      className="h-10 w-full rounded-xl border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
                    />
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-border/40">
                    <Button type="submit" size="sm" disabled={isSaving} className="h-9 text-xs font-bold gap-1.5">
                      {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                      Save Profile
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      size="sm"
                      variant="outline"
                      className="h-9 text-xs font-bold"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4 text-xs">
                  <div className="flex items-center gap-3">
                    <Mail size={16} className="text-muted-foreground shrink-0" />
                    <span className="text-foreground font-semibold">{user?.email}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <Globe size={16} className="text-muted-foreground shrink-0" />
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
              )}

            </Card>
          </Container>
        </section>
      </PageWrapper>
    </RequireAuth>
  );
}
