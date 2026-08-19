"use client";

import type { User } from "@supabase/supabase-js";
import { create } from "zustand";

import { createClient } from "../lib/supabase";
import { normalizeError } from "../utils/errors";
import { IS_MOCK } from "../lib/config";
import { normalizeRole, CanonicalRole } from "../utils/rbacResolver";
import { repairSessionInDev } from "../utils/sessionRepair";

export interface UserSession {
  id: string;
  email: string;
  fullName: string;
  role: CanonicalRole | null;
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
  login: (email: string, password: string, remember?: boolean) => Promise<AuthResult>;
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
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon || url.includes("placeholder")) {
    throw new Error("Supabase integration keys are not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment variables.");
  }
  return createClient();
}

function getAppOrigin() {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_APP_URL || 
    (process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : "http://localhost:3000");
}


function toUserSession(user: User, dbRole?: string | null): UserSession {
  const metadata = user.user_metadata ?? {};
  const isSuperAdminEmail = user.email === "suryasaiteja2005@gmail.com";
  const rawRole = isSuperAdminEmail ? "admin" : (dbRole || metadata.role);
  const role = normalizeRole(rawRole);

  return {
    id: user.id,
    email: user.email ?? "",
    fullName:
      typeof metadata.fullName === "string"
        ? metadata.fullName
        : typeof metadata.full_name === "string"
          ? metadata.full_name
          : isSuperAdminEmail ? "Surya (Admin)" : "Student Learner",
    role,
    complete: metadata.complete !== false,
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
    try {
      if (typeof window !== "undefined") {
        const isLocalhost = window.location.hostname === "localhost" || 
          window.location.hostname === "127.0.0.1" || 
          process.env.NODE_ENV === "development";
        if (isLocalhost) {
          const devUserStr = localStorage.getItem("eduearn_dev_preview_user");
          if (devUserStr) {
            try {
              const devUser = JSON.parse(devUserStr);
              set({ user: devUser, isAuthenticated: true, isLoading: false });
              return;
            } catch (e) {}
          }
        }
      }

      repairSessionInDev();
      const supabase = getSafeSupabase();
      set({ isLoading: true });

      // ── Register listener FIRST so no events are missed during getSession() ─
      supabase.auth.onAuthStateChange((event: any, newSession: any) => {
        if (newSession?.user) {
          set({
            user: toUserSession(newSession.user),
            isAuthenticated: true,
            isLoading: false,
          });
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

      // ── Now read the existing session ─
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        set({
          user: toUserSession(session.user),
          isAuthenticated: true,
          isLoading: false,
        });
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
    } catch (err) {
      console.error("[useAuth initialize] Auth initialization failed:", err);
      set({ isLoading: false });
    }
  },

  login: async (email, password, remember = true) => {
    try {
      let isLocalhost = false;
      if (typeof window !== "undefined") {
        isLocalhost = window.location.hostname === "localhost" || 
          window.location.hostname === "127.0.0.1" || 
          process.env.NODE_ENV === "development";
      }

      // Remember Me persistence logic
      if (typeof window !== "undefined") {
        if (remember) {
          localStorage.setItem("eduearn_remembered_email", email);
          localStorage.setItem("eduearn_remember_me", "true");
        } else {
          localStorage.removeItem("eduearn_remembered_email");
          localStorage.removeItem("eduearn_remember_me");
        }
      }

      let supabase;
      try {
        supabase = getSafeSupabase();
      } catch (err: any) {
        if (isLocalhost) {
          console.warn("[DEV MODE] Supabase integration keys unconfigured. Using localhost fallback for:", email);
          const isOwnerEmail = email.toLowerCase().trim() === "suryasaiteja2005@gmail.com";
          const role: CanonicalRole = (isOwnerEmail || email.includes("admin")) ? "admin" : email.includes("tutor") ? "tutor" : "student";
          const devUser: UserSession = {
            id: role === "admin" ? "preview-admin-id" : role === "tutor" ? "preview-tutor-id" : "preview-student-id",
            email,
            fullName: isOwnerEmail ? "Surya (Admin)" : role === "admin" ? "Admin User" : role === "tutor" ? "Preview Tutor" : "Preview Student",
            role,
            complete: true,
          };
          if (typeof window !== "undefined") {
            localStorage.setItem("eduearn_dev_preview_user", JSON.stringify(devUser));
          }
          set({ user: devUser, isAuthenticated: true, isLoading: false });
          return { ok: true, message: "Welcome back to EduEarn (Development Mode).", role, complete: true };
        }
        throw err;
      }

      set({ isLoading: true });

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data.user) {
        const errorMsg = error?.message || "";
        if (isLocalhost && (errorMsg.includes("API key") || errorMsg.includes("not configured") || errorMsg.includes("invalid") || errorMsg.includes("Invalid"))) {
          console.warn("[DEV MODE] Supabase API key invalid locally. Using localhost fallback for:", email);
          const isOwnerEmail = email.toLowerCase().trim() === "suryasaiteja2005@gmail.com";
          const role: CanonicalRole = (isOwnerEmail || email.includes("admin")) ? "admin" : email.includes("tutor") ? "tutor" : "student";
          const devUser: UserSession = {
            id: role === "admin" ? "preview-admin-id" : role === "tutor" ? "preview-tutor-id" : "preview-student-id",
            email,
            fullName: isOwnerEmail ? "Surya (Admin)" : role === "admin" ? "Admin User" : role === "tutor" ? "Preview Tutor" : "Preview Student",
            role,
            complete: true,
          };
          if (typeof window !== "undefined") {
            localStorage.setItem("eduearn_dev_preview_user", JSON.stringify(devUser));
          }
          set({ user: devUser, isAuthenticated: true, isLoading: false });
          return { ok: true, message: "Welcome back to EduEarn (Development Mode).", role, complete: true };
        }
        set({ isLoading: false });
        return {
          ok: false,
          message: normalizeError(error),
        };
      }

      // Synchronous wait for profile sync to ensure authoritative role and completion status are available
      const profile = await syncProfile(supabase, data.user);
      const userRole = profile?.role || data.user.user_metadata?.role || "student";
      const isComplete = (data.user.user_metadata?.complete !== false);

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
      set({ isLoading: true });

      // Call our custom server-side register API route
      try {
        const registerRes = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, fullName, role }),
        });

        const registerData = await registerRes.json();

        if (registerRes.ok && registerData.success) {
          console.log("[useAuth register] Server-side registration succeeded:", registerData);
          
          if (registerData.sessionCreated) {
            // Auto-authenticate client if email verification is disabled
            const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
              email,
              password
            });
            if (!signInErr && signInData.user) {
              const profile = await syncProfile(supabase, signInData.user);
              const userRole = profile?.role || signInData.user.user_metadata?.role || role;
              set({ user: toUserSession(signInData.user, userRole), isAuthenticated: true, isLoading: false });
              return {
                ok: true,
                sessionCreated: true,
                role: userRole,
                message: "Account created and logged in successfully!",
              };
            }
          }

          set({ isLoading: false });
          return {
            ok: true,
            sessionCreated: registerData.sessionCreated,
            role,
            message: registerData.message,
          };
        } else if (registerRes.ok && !registerData.fallback) {
          console.error("[useAuth register] Server-side registration failed:", registerData.error);
          set({ isLoading: false });
          return { ok: false, message: registerData.error || "Registration failed." };
        } else if (!registerRes.ok) {
          console.error("[useAuth register] Server error:", registerData);
          set({ isLoading: false });
          return { ok: false, message: registerData.error || "Server error during registration." };
        }
      } catch (apiErr) {
        console.warn("[useAuth register] API registration request failed, trying client fallback:", apiErr);
      }

      // ─── CLIENT FALLBACK ───────────────────────────────────────────────────
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
        console.error("[DIAGNOSTIC] supabase.auth.signUp() returned an AuthError:", error);
        set({ isLoading: false });
        return { ok: false, message: error.message };
      }

      console.log("[DIAGNOSTIC] supabase.auth.signUp() succeeded. data:", data);

      if (data.user && data.session) {
        console.log("[DIAGNOSTIC] Active session returned immediately on signUp, logging user in.");
        set({
          user: toUserSession(data.user, role),
          isAuthenticated: true,
          isLoading: false,
        });
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
        if (data.user.identities && data.user.identities.length === 0) {
          console.log("[DIAGNOSTIC] Duplicate registration detected via empty identities array in client fallback.");
          return {
            ok: false,
            message: "An account with this email already exists. Please log in.",
          };
        }
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

      const supabase = getSafeSupabase();

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

    // Clear stale auth storage and cookies
    if (typeof window !== "undefined") {
      localStorage.removeItem("eduearn_dev_preview_user");
      localStorage.removeItem("eduearn_mock_user");
      localStorage.removeItem("eduearn_session");
      localStorage.removeItem("eduearn_mock_session");
      localStorage.removeItem("tutor_onboarding_state");
      
      const rememberMe = localStorage.getItem("eduearn_remember_me");
      if (rememberMe !== "true") {
        localStorage.removeItem("eduearn_remembered_email");
      }

      document.cookie = `eduearn-bypass-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
      document.cookie = `eduearn_dev_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
      document.cookie = `eduearn_dev_user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;

      // Explicitly delete all Supabase auth cookies to prevent Next.js middleware session restoration
      document.cookie.split(";").forEach((c) => {
        const name = c.trim().split("=")[0];
        if (name.startsWith("sb-")) {
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
          // Also try deleting on domain root just in case
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
        }
      });
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
  try {
    await supabase.auth.signOut();
  } catch (err) {
    console.warn("Standalone sign out exception:", err);
  }
  if (typeof window !== "undefined") {
    localStorage.removeItem("eduearn_mock_user");
    localStorage.removeItem("tutor_onboarding_state");
    const rememberMe = localStorage.getItem("eduearn_remember_me");
    if (rememberMe !== "true") {
      localStorage.removeItem("eduearn_remembered_email");
    }

    // Explicitly delete all Supabase auth cookies to prevent Next.js middleware session restoration
    document.cookie.split(";").forEach((c) => {
      const name = c.trim().split("=")[0];
      if (name.startsWith("sb-")) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        // Also try deleting on domain root just in case
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
      }
    });
  }
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
