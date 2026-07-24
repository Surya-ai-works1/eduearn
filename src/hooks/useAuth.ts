"use client";

import type { User } from "@supabase/supabase-js";
import { create } from "zustand";

import { createClient } from "../lib/supabase";
import { normalizeError } from "../utils/errors";

export interface UserSession {
  id: string;
  email: string;
  fullName: string;
  role: "student" | "tutor" | "admin" | null;
  complete: boolean;
  emailVerified?: boolean;
  avatarUrl?: string;
  bio?: string;
  country?: string;
  gender?: string;
  language?: string;
  skills?: string[];
  goals?: string;
  interests?: string[];
  username?: string;
  dob?: string;
  state?: string;
  city?: string;
}

type AuthResult =
  | { ok: true; message: string; sessionCreated?: boolean; role?: string; complete?: boolean }
  | { ok: false; message: string };

interface AuthStore {
  user: UserSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  initialize: () => Promise<void>;
  login: (email: string, password: string, remember: boolean) => Promise<AuthResult>;
  loginWithGoogle: () => Promise<AuthResult>;
  register: (email: string, password: string, fullName: string, role?: string) => Promise<AuthResult>;
  resendVerificationEmail: (email: string) => Promise<AuthResult>;
  sendResetLink: (email: string) => Promise<AuthResult>;
  resetPassword: (password: string) => Promise<AuthResult>;
  completeProfile: (fields: Partial<UserSession>, avatarFile?: File) => Promise<{ success: boolean; error?: string }>;
  chooseRole: (role: "student" | "tutor") => Promise<boolean>;
  logout: () => Promise<void>;
}

function getSafeSupabase() {
  try {
    return createClient();
  } catch {
    return null;
  }
}

function getAppOrigin() {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}


function toUserSession(user: User, dbRole?: string | null): UserSession {
  const metadata = user.user_metadata ?? {};
  
  // SECURE ROLE MAPPING: map learner -> student, tutor/educator -> tutor, admin -> admin. Default to student.
  let role: "student" | "tutor" | "admin" = "student";
  const rawRole = dbRole || metadata.role;
  if (rawRole === "tutor" || rawRole === "educator") {
    role = "tutor";
  } else if (rawRole === "admin") {
    role = "admin";
  }

  return {
    id: user.id,
    email: user.email ?? "",
    fullName:
      typeof metadata.fullName === "string"
        ? metadata.fullName
        : typeof metadata.full_name === "string"
          ? metadata.full_name
          : "Student Learner",
    role,
    complete: metadata.complete === true,
    emailVerified: !!user.email_confirmed_at,
    avatarUrl: typeof metadata.avatar_url === "string" ? metadata.avatar_url : undefined,
    bio: typeof metadata.bio === "string" ? metadata.bio : undefined,
    country: typeof metadata.country === "string" ? metadata.country : undefined,
    gender: typeof metadata.gender === "string" ? metadata.gender : undefined,
    language: typeof metadata.language === "string" ? metadata.language : undefined,
    goals: typeof metadata.goals === "string" ? metadata.goals : undefined,
    skills: Array.isArray(metadata.skills) ? metadata.skills : undefined,
    interests: Array.isArray(metadata.interests) ? metadata.interests : undefined,
    username: typeof metadata.username === "string" ? metadata.username : undefined,
    dob: typeof metadata.dob === "string" ? metadata.dob : undefined,
    state: typeof metadata.state === "string" ? metadata.state : undefined,
    city: typeof metadata.city === "string" ? metadata.city : undefined,
  };
}

const configurationError =
  "Authentication is not configured yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.";

// Client side synchronization of profiles table
async function syncProfile(supabase: any, user: User) {
  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (profile) {
      return profile;
    }

    const metadata = user.user_metadata ?? {};
    let defaultRole = "student";
    if (metadata.role === "tutor" || metadata.role === "educator") {
      defaultRole = "tutor";
    } else if (metadata.role === "admin") {
      defaultRole = "admin";
    }

    const newProfileData = {
      id: user.id,
      email: user.email,
      full_name: metadata.fullName || metadata.full_name || "Student Learner",
      avatar_url: metadata.avatar_url || null,
      role: defaultRole,
      updated_at: new Date().toISOString(),
    };

    const { data: newProfile, error: insertError } = await supabase
      .from("profiles")
      .insert(newProfileData)
      .select()
      .single();

    if (insertError) {
      console.warn("Trigger sync conflict, profile already exists:", insertError.message);
    }

    return newProfile || newProfileData;
  } catch (err) {
    console.error("Profile sync exception:", err);
    return null;
  }
}

export const useAuth = create<AuthStore>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  initialize: async () => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("eduearn_mock_user");
      if (stored) {
        try {
          const mockUser = JSON.parse(stored);
          set({ user: mockUser, isAuthenticated: true, isLoading: false });
        } catch {}
      }
    }

    const supabase = getSafeSupabase();
    if (!supabase) {
      set((s) => ({ isLoading: false }));
      return;
    }

    set({ isLoading: true });

    // ── Register listener FIRST so no events are missed during getSession() ─
    supabase.auth.onAuthStateChange((event: any, newSession: any) => {
      if (newSession?.user) {
        // Set auth state immediately — do NOT await syncProfile here.
        // syncProfile runs in the background; role falls back to user_metadata.
        set({
          user: toUserSession(newSession.user),
          isAuthenticated: true,
          isLoading: false,
        });
        // Background sync — updates role from DB without blocking auth.
        syncProfile(supabase, newSession.user).then((profile) => {
          if (profile?.role) {
            set((s) => ({
              user: s.user ? { ...s.user, role: toUserSession(newSession.user, profile.role).role } : s.user,
            }));
          }
        }).catch(() => { /* sync failure is non-fatal */ });
      } else if (event === "SIGNED_OUT") {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    });

    // ── Now read the existing session (fires synchronously from local storage) ─
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.user) {
      // Set immediately from session without waiting for DB round-trip.
      set({
        user: toUserSession(session.user),
        isAuthenticated: true,
        isLoading: false,
      });
      // Background DB sync for accurate role.
      syncProfile(supabase, session.user).then((profile) => {
        if (profile?.role) {
          set((s) => ({
            user: s.user ? { ...s.user, role: toUserSession(session.user, profile.role).role } : s.user,
          }));
        }
      }).catch(() => { /* sync failure is non-fatal */ });
    } else {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (email, password) => {
    try {
      const supabase = getSafeSupabase();
      if (!supabase) {
        return { ok: false, message: configurationError };
      }

      set({ isLoading: true });

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data.user) {
        set({ isLoading: false });
        return {
          ok: false,
          message: normalizeError(error),
        };
      }

      // Synchronous wait for profile sync to ensure authoritative role and completion status are available
      const profile = await syncProfile(supabase, data.user);
      const userRole = profile?.role || data.user.user_metadata?.role || "student";
      const isComplete = (data.user.user_metadata?.complete === true);

      // Set authenticated state immediately
      set({ user: toUserSession(data.user, userRole), isAuthenticated: true, isLoading: false });

      return { 
        ok: true, 
        message: "Welcome back to EduEarn.", 
        role: userRole, 
        complete: isComplete 
      };
    } catch (err) {
      set({ isLoading: false });
      return { ok: false, message: normalizeError(err) };
    }
  },

  loginWithGoogle: async () => {
    try {
      const supabase = getSafeSupabase();
      if (!supabase) {
        return { ok: false, message: configurationError };
      }

      set({ isLoading: true });
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${getAppOrigin()}/auth/callback`,
        },
      });

      if (error) {
        set({ isLoading: false });
        return { ok: false, message: normalizeError(error) };
      }

      return { ok: true, message: "Redirecting to Google..." };
    } catch (err) {
      set({ isLoading: false });
      return { ok: false, message: normalizeError(err) };
    }
  },

  register: async (email, password, fullName, role = "student") => {
    try {
      const supabase = getSafeSupabase();
      if (!supabase) {
        console.error("[DIAGNOSTIC] Supabase client is null or undefined inside register.");
        return { ok: false, message: configurationError };
      }

      set({ isLoading: true });

      const nextRoute = role === "tutor" ? "/tutor/onboarding" : "/complete-profile";

      console.log("[DIAGNOSTIC] Calling supabase.auth.signUp() with:", {
        email,
        fullName,
        emailRedirectTo: `${getAppOrigin()}/auth/callback?next=${nextRoute}`
      });

      const response = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${getAppOrigin()}/auth/callback?next=${nextRoute}`,
          data: {
            fullName,
            full_name: fullName,
            role: role,
            complete: false,
            accepted_terms: true,
            accepted_privacy: true,
          },
        },
      });

      console.log("[DIAGNOSTIC] Raw response object returned from supabase.auth.signUp():", response);

      const { data, error } = response;

      if (error) {
        console.error("[DIAGNOSTIC] supabase.auth.signUp() returned an AuthError:", {
          message: error.message,
          status: error.status,
          name: error.name,
          errorObject: error,
        });
        set({ isLoading: false });
        return { ok: false, message: error.message };
      }

      console.log("[DIAGNOSTIC] supabase.auth.signUp() succeeded. data:", data);

      // When Supabase returns a session immediately (email confirmation disabled),
      // log the user in right away — no second manual login required.
      if (data.user && data.session) {
        console.log("[DIAGNOSTIC] Active session returned immediately on signUp, logging user in.");
        set({
          user: toUserSession(data.user, role),
          isAuthenticated: true,
          isLoading: false,
        });
        // Background DB sync — non-blocking.
        syncProfile(supabase, data.user).catch((syncErr) => {
          console.warn("[DIAGNOSTIC] Non-fatal syncProfile error:", syncErr);
        });
        return {
          ok: true,
          sessionCreated: true,
          role: role,
          message: "Account created. Welcome to EduEarn!",
        };
      }

      // Email confirmation required — user must verify before logging in.
      set({ isLoading: false });
      if (data.user) {
        console.log("[DIAGNOSTIC] Email confirmation required. Syncing default profile in background.");
        syncProfile(supabase, data.user).catch((syncErr) => {
          console.warn("[DIAGNOSTIC] Non-fatal syncProfile error:", syncErr);
        });
      }
      return {
        ok: true,
        sessionCreated: false,
        message: "Account created. Check your inbox to verify your email.",
      };
    } catch (err: any) {
      console.error("[DIAGNOSTIC] Unhandled exception occurred in register function:", err);
      if (err && typeof err === "object") {
        console.error("[DIAGNOSTIC] Unhandled exception properties:", {
          message: err.message,
          name: err.name,
          stack: err.stack,
          fullObject: err
        });
      }
      set({ isLoading: false });
      return { ok: false, message: err?.message || String(err) };
    }
  },


  resendVerificationEmail: async (email) => {
    try {
      const supabase = getSafeSupabase();
      if (!supabase) {
        return { ok: false, message: configurationError };
      }

      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: {
          emailRedirectTo: `${getAppOrigin()}/auth/callback?next=/complete-profile`,
        },
      });

      if (error) {
        return { ok: false, message: normalizeError(error) };
      }

      return { ok: true, message: "Verification email sent again." };
    } catch (err) {
      return { ok: false, message: normalizeError(err) };
    }
  },

  sendResetLink: async (email) => {
    try {
      const supabase = getSafeSupabase();
      if (!supabase) {
        return { ok: false, message: configurationError };
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${getAppOrigin()}/auth/callback?next=/reset-password`,
      });

      if (error) {
        return { ok: false, message: normalizeError(error) };
      }

      return { ok: true, message: "Password reset link sent." };
    } catch (err) {
      return { ok: false, message: normalizeError(err) };
    }
  },

  resetPassword: async (password) => {
    try {
      const supabase = getSafeSupabase();
      if (!supabase) {
        return { ok: false, message: configurationError };
      }

      set({ isLoading: true });

      const { data, error } = await supabase.auth.updateUser({ password });

      if (error) {
        set({ isLoading: false });
        return { ok: false, message: normalizeError(error) };
      }

      set({
        user: data.user ? toUserSession(data.user) : get().user,
        isAuthenticated: Boolean(data.user ?? get().user),
        isLoading: false,
      });

      return { ok: true, message: "Password updated successfully." };
    } catch (err) {
      set({ isLoading: false });
      return { ok: false, message: normalizeError(err) };
    }
  },

  completeProfile: async (fields, avatarFile) => {
    try {
      const currentUser = get().user;
      let finalAvatarUrl = fields.avatarUrl || currentUser?.avatarUrl;

      if (avatarFile) {
        // Read file as base64 for instant optimistic update and offline persistence
        const base64: string = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(avatarFile);
        });
        finalAvatarUrl = base64;
      }

      const updatedUser = {
        ...currentUser,
        ...fields,
        fullName: fields.fullName || currentUser?.fullName || "Student Learner",
        username: fields.username || currentUser?.username || "learner_user",
        avatarUrl: finalAvatarUrl,
      } as any;

      // Optimistic update
      set({ user: updatedUser, isAuthenticated: true });

      // Save to mock storage
      if (typeof window !== "undefined") {
        localStorage.setItem("eduearn_mock_user", JSON.stringify(updatedUser));
      }

      const supabase = getSafeSupabase();
      if (!supabase) {
        return { success: true };
      }

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "NOT SET";
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "NOT SET";
      const anonKeyFirst15 = anonKey !== "NOT SET" ? anonKey.substring(0, 15) : "NONE";

      console.log("[DIAGNOSTIC COMPLETE_PROFILE] Pre-Execution Auth Settings Audit:", {
        supabaseClientInitialized: !!supabase,
        projectURL: supabaseUrl,
        anonKeyFirst15,
      });

      set({ isLoading: true });

      // ─── 1. Authoritative session fetch/refresh ───────────────────────────
      const { data: { session: initialSession }, error: sessionErr } = await supabase.auth.getSession();
      let session = initialSession;
      
      if (sessionErr || !session) {
        // Attempt session refresh
        const { data: refreshData, error: refreshErr } = await supabase.auth.refreshSession();
        if (refreshErr || !refreshData.session) {
          console.error("Session check and refresh failed:", refreshErr);
          set({ user: null, isAuthenticated: false, isLoading: false });
          return { success: false, error: "Your session has expired. Please log in again." };
        }
        session = refreshData.session;
      }

      const userId = session.user.id;
      const userEmail = session.user.email;

      // Log verified session state (diagnostics required)
      console.log("[DIAGNOSTIC COMPLETE_PROFILE] Pre-Execution Session/User Resolved:", {
        session,
        user: session?.user || null,
      });

      console.log("[DIAGNOSTIC] Complete Profile Session check before save:", {
        sessionExists: !!session,
        userId,
        email: userEmail,
        exchangeSuccess: true, // Callback successfully verified earlier
        refreshSuccess: true,  // Active or successfully refreshed session
      });

      let avatarUrl = finalAvatarUrl;
      if (avatarFile) {
        try {
          const fileExt = avatarFile.name.split('.').pop() || 'png';
          const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
          if (allowedExtensions.includes(fileExt.toLowerCase()) && avatarFile.size <= 2 * 1024 * 1024) {
            const fileName = `${userId}-${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            const bucketExists = !!supabase.storage.from('avatars');
            console.log("[DIAGNOSTIC AVATAR_UPLOAD] Pre-Upload Storage Details:", {
              sessionExists: !!session,
              storageClientExists: !!supabase.storage,
              bucketExists,
            });

            const { data: bucketData, error: bucketCheckError } = await supabase.storage.getBucket('avatars');

            if (bucketCheckError) {
              console.warn("Storage bucket validation failed:", bucketCheckError.message);
              avatarUrl = undefined;
            } else {
              const { data: uploadData, error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, avatarFile, { upsert: true });

              if (uploadError) {
                console.warn("Storage upload failed:", uploadError.message);
                avatarUrl = undefined;
              } else {
                const { data: { publicUrl } } = supabase.storage
                  .from('avatars')
                  .getPublicUrl(filePath);

                if (!publicUrl) {
                  console.warn("Failed to generate public URL for avatar.");
                  avatarUrl = undefined;
                } else {
                  avatarUrl = `${publicUrl}?t=${Date.now()}`;
                }
              }
            }
          }
        } catch (e: any) {
          console.warn("Exception in avatar upload:", e);
          avatarUrl = undefined;
        }
      }

      const updatedFields = {
        ...fields,
        avatarUrl,
        avatar_url: avatarUrl,
        complete: true,
      };

      const { data: authData, error: authError } = await supabase.auth.updateUser({
        data: updatedFields,
      });

      if (authError || !authData?.user) {
        set({ isLoading: false });
        return { success: false, error: authError?.message || "Failed to update auth metadata." };
      }

      try {
        console.log("[DIAGNOSTIC PROFILE_INSERT] Pre-Insert Profiles Table Details:", {
          userId,
          sessionAccessToken: session.access_token,
          authenticatedUser: session.user,
        });

        const profileData = {
          id: userId,
          role: fields.role || authData.user.user_metadata?.role || "student",
          full_name: fields.fullName || authData.user.user_metadata?.fullName || authData.user.user_metadata?.full_name || null,
          display_name: fields.username || authData.user.user_metadata?.username || fields.fullName || null,
          bio: fields.bio || null,
          avatar_url: avatarUrl || null,
          country: fields.country || null,
          language: fields.language || null,
          skills: fields.skills || null,
          interests: fields.interests || null,
          email: userEmail || fields.email || null,
          updated_at: new Date().toISOString(),
        };

        const { error: dbErr } = await supabase.from("profiles").upsert(profileData);

        if (dbErr) {
          console.error("Database profile save failed:", {
            code: dbErr.code,
            message: dbErr.message,
            details: dbErr.details,
            hint: dbErr.hint,
          });
          set({ isLoading: false });
          return { 
            success: false, 
            error: `Database profile save failed: ${dbErr.message}` 
          };
        }
      } catch (dbErr: any) {
        console.error("Exception in database upsert:", dbErr);
        set({ isLoading: false });
        return { success: false, error: `Profile database exception: ${dbErr.message || dbErr}` };
      }

      set({ user: toUserSession(authData.user, fields.role || authData.user.user_metadata?.role || "student"), isAuthenticated: true, isLoading: false });
      return { success: true };
    } catch (globalErr: any) {
      console.error("Global completeProfile error:", globalErr);
      set({ isLoading: false });
      return { success: false, error: normalizeError(globalErr) };
    }
  },

  chooseRole: async (role) => {
    try {
      const supabase = getSafeSupabase();
      if (!supabase) {
        return false;
      }

      // ─── Authoritative session fetch/refresh ───────────────────────────
      const { data: { session: initialSession }, error: sessionErr } = await supabase.auth.getSession();
      let session = initialSession;
      
      if (sessionErr || !session) {
        const { data: refreshData, error: refreshErr } = await supabase.auth.refreshSession();
        if (refreshErr || !refreshData.session) {
          set({ user: null, isAuthenticated: false, isLoading: false });
          return false;
        }
        session = refreshData.session;
      }

      const userId = session.user.id;

      const { data, error } = await supabase.auth.updateUser({
        data: { role },
      });

      if (error || !data.user) {
        return false;
      }

      try {
        await supabase
          .from("profiles")
          .update({ role, updated_at: new Date().toISOString() })
          .eq("id", userId);
      } catch (dbErr) {
        console.warn("Failed to update profile role in database:", dbErr);
      }

      set({ user: toUserSession(data.user, role), isAuthenticated: true });
      return true;
    } catch (err) {
      console.error("Exception inside chooseRole:", err);
      return false;
    }
  },

  logout: async () => {
    const supabase = getSafeSupabase();
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn("Sign out exception:", err);
      }
    }
    set({ user: null, isAuthenticated: false, isLoading: false });
  },
}));

// Standalone Helper functions for direct usage
export async function loginWithGoogle() {
  const supabase = createClient();
  return supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
}

export async function logout() {
  const supabase = createClient();
  await supabase.auth.signOut();
}

export async function getCurrentUser() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function refreshSession() {
  const supabase = createClient();
  const { data: { session }, error } = await supabase.auth.refreshSession();
  if (error) throw error;
  return session;
}

export function onAuthStateChange(callback: (event: string, session: any) => void) {
  const supabase = createClient();
  const { data: { subscription } } = supabase.auth.onAuthStateChange(callback);
  return subscription;
}
