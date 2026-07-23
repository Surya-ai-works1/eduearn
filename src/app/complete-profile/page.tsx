"use client";

/* eslint-disable react-hooks/incompatible-library */

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import * as z from "zod";
import { toast } from "sonner";
import {
  Camera,
  Check,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  Award,
  Sparkles,
  ShieldAlert,
  Loader2,
  Trash2,
  ExternalLink,
} from "lucide-react";

import { Container } from "../../components/layout/Container";
import { PageWrapper } from "../../components/layout/PageWrapper";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { FormField } from "../../features/auth/components/FormField";
import { useAuth } from "../../hooks/useAuth";
import { createClient } from "../../lib/supabase";
import { normalizeError } from "../../utils/errors";
import { MarketplaceService } from "../../features/payments/services/marketplaceService";

// ─── ZOD SCHEMA ─────────────────────────────────────────────────────────────

const onboardingSchema = z.object({
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters."),
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters.")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores."),
  dob: z.string().min(1, "Date of birth is required."),
  gender: z.string().min(1, "Gender selection is required."),
  country: z.string().min(1, "Country selection is required."),
  state: z.string().trim().min(1, "State is required."),
  city: z.string().trim().min(1, "City is required."),
  language: z.string().min(1, "Preferred language is required."),
  bio: z.string().trim().min(10, "Biography must be at least 10 characters."),
  role: z.enum(["learner", "tutor"]),
  // Dynamic fields
  interests: z.array(z.string()).optional(),
  skills: z.string().trim().optional(),
  experience: z.string().optional(),
  education: z.string().trim().optional(),
  portfolioUrl: z.string().trim().url("Please enter a valid URL.").or(z.literal("")).optional(),
  linkedInUrl: z.string().trim().url("Please enter a URL.").or(z.literal("")).optional(),
  areasOfExpertise: z.string().trim().optional(),
});

type OnboardingFields = z.infer<typeof onboardingSchema>;

// ─── CONSTANTS ───────────────────────────────────────────────────────────────

const LEARNER_INTERESTS = [
  "Programming",
  "AI",
  "Music",
  "Photography",
  "Cooking",
  "Fitness",
  "Business",
  "Languages",
  "Graphic Design",
  "School Subjects",
  "Competitive Exams",
  "Digital Marketing",
];

const LANGUAGES = ["English", "Hindi", "Spanish", "French", "German", "Mandarin", "Bengali"];
const COUNTRIES = ["India", "United States", "United Kingdom", "Canada", "Australia"];
const GENDERS = ["Male", "Female", "Non-binary", "Prefer not to say"];
const EXPERIENCE_LEVELS = ["Beginner (1-2 years)", "Intermediate (3-5 years)", "Expert (5+ years)"];

const STEPS = [
  { number: 1, title: "Welcome" },
  { number: 2, title: "Personal Info" },
  { number: 3, title: "Role Selection" },
  { number: 4, title: "Interests & Skills" },
  { number: 5, title: "Profile Picture" },
  { number: 6, title: "Finish" },
];

// Helper to calculate age
const calculateAge = (dobString: string) => {
  if (!dobString) return 0;
  const birthDate = new Date(dobString);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function CompleteProfilePage() {
  const { user, completeProfile, isLoading: isAuthStoreLoading } = useAuth();
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(1);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadedAvatarUrl, setUploadedAvatarUrl] = useState<string | null>(null);
  const [availableInterests, setAvailableInterests] = useState<string[]>([]);
  const [interestSearch, setInterestSearch] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── RUNTIME DIAGNOSTIC AUDIT ──────────────────────────────────────────
  useEffect(() => {
    async function runDiagnostics() {
      console.log("[DIAGNOSTIC RUNTIME] Initiating full complete-profile page auth audit...");
      const currentPathname = window.location.pathname;
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "NOT SET";
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "NOT SET";
      const anonKeyFirst15 = anonKey !== "NOT SET" ? anonKey.substring(0, 15) : "NONE";

      console.log("[DIAGNOSTIC RUNTIME] Environment:", {
        currentPathname,
        NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
        anonKeyFirst15,
      });

      const supabase = createClient();
      console.log("[DIAGNOSTIC RUNTIME] Supabase client initialized status:", !!supabase);

      try {
        const getSessionResult = await supabase.auth.getSession();
        const session = getSessionResult.data.session;
        console.log("[DIAGNOSTIC RUNTIME] getSession() Result:", {
          error: getSessionResult.error,
          sessionExists: !!session,
          accessTokenExists: !!session?.access_token,
          refreshTokenExists: !!session?.refresh_token,
          expiresAt: session?.expires_at ? new Date(session.expires_at * 1000).toISOString() : null,
        });

        const getUserResult = await supabase.auth.getUser();
        const activeUser = getUserResult.data.user;
        console.log("[DIAGNOSTIC RUNTIME] getUser() Result:", {
          error: getUserResult.error,
          userExists: !!activeUser,
          userId: activeUser?.id || null,
          email: activeUser?.email || null,
        });

        let claims = null;
        if (session?.access_token) {
          try {
            const parts = session.access_token.split('.');
            if (parts.length >= 2) {
              claims = JSON.parse(atob(parts[1]));
            }
          } catch (e) {
            console.warn("[DIAGNOSTIC RUNTIME] Failed to decode claims from access_token:", e);
          }
        }
        console.log("[DIAGNOSTIC RUNTIME] auth.getClaims() (Decoded JWT payload):", claims);

      } catch (err) {
        console.error("[DIAGNOSTIC RUNTIME] Exception thrown during diagnostic run:", err);
      }
    }
    runDiagnostics();
  }, []);

  const {
    register,
    setValue,
    watch,
    trigger,
    setError,
    formState: { errors },
  } = useForm<OnboardingFields>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      fullName: user?.fullName || "",
      username: "",
      dob: "",
      gender: "Male",
      country: "India",
      state: "",
      city: "",
      language: "English",
      bio: "",
      role: (user?.role === "student" || user?.role === "tutor")
        ? (user.role === "student" ? "learner" : "tutor")
        : "learner",
      interests: [],
      skills: "",
      experience: "Beginner (1-2 years)",
      education: "",
      portfolioUrl: "",
      linkedInUrl: "",
      areasOfExpertise: "",
    },
  });

  const selectedRole = watch("role");
  const dob = watch("dob");
  const interests = watch("interests") || [];
  const bioValue = watch("bio") || "";
  const bioLength = bioValue.length;

  // Sync loaded user full name if available later
  useEffect(() => {
    if (user?.fullName) {
      setValue("fullName", user.fullName);
    }
    if (user?.role === "student" || user?.role === "tutor") {
      setValue("role", user.role === "student" ? "learner" : "tutor");
    }
  }, [user, setValue]);

  // Dynamically load interests categories from Admin on mount
  useEffect(() => {
    try {
      const cats = MarketplaceService.getCategories()
        .filter((c) => c.status === "Enabled")
        .map((c) => c.name);
      setAvailableInterests(cats.length > 0 ? cats : LEARNER_INTERESTS);
    } catch (e) {
      console.warn("Failed to load categories from Admin, using fallback.", e);
      setAvailableInterests(LEARNER_INTERESTS);
    }
  }, []);

  // Handle file picker selection with immediate storage upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Validation (JPG, JPEG, PNG, WEBP)
    const allowedExtensions = ["jpg", "jpeg", "png", "webp"];
    const fileExt = file.name.split(".").pop()?.toLowerCase() || "png";
    if (!allowedExtensions.includes(fileExt)) {
      toast.error("Invalid file format. Only JPG, JPEG, PNG, and WEBP are supported.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Profile photo must be less than 2 MB.");
      return;
    }
    // 2. Start Upload Loader
    setIsUploadingImage(true);
    const supabase = createClient();
    if (!supabase) {
      toast.error("Supabase client is missing.");
      setIsUploadingImage(false);
      return;
    }

    // Authoritative session verification and refresh if needed
    let sessionResult;
    try {
      const { data: { session }, error: sessionErr } = await supabase.auth.getSession();
      if (sessionErr || !session) {
        // Attempt session refresh
        const { data: refreshData, error: refreshErr } = await supabase.auth.refreshSession();
        if (refreshErr || !refreshData.session) {
          toast.error("Your session has expired. Please log in again.");
          router.push("/login");
          setIsUploadingImage(false);
          return;
        }
        sessionResult = refreshData.session;
      } else {
        sessionResult = session;
      }
    } catch {
      toast.error("Authentication session check failed.");
      setIsUploadingImage(false);
      return;
    }

    const currentUserId = sessionResult.user.id;

    try {
      // 3. Verify Storage avatars bucket
      const { error: bucketError } = await supabase.storage.getBucket("avatars");
      if (bucketError) {
        if (process.env.NODE_ENV === "development") {
          console.error("[completeProfile Storage Bucket Verification Error]", {
            message: bucketError.message,
            bucket: "avatars",
            authenticatedUserId: currentUserId,
          });
        }
        toast.error(`Storage bucket 'avatars' check failed: ${normalizeError(bucketError)}`);
        setIsUploadingImage(false);
        return;
      }

      const fileName = `${currentUserId}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // 4. Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        if (process.env.NODE_ENV === "development") {
          console.error("[completeProfile Storage Upload Error]", {
            message: uploadError.message,
            bucket: "avatars",
            filePath,
            authenticatedUserId: currentUserId,
          });
        }
        toast.error(`Avatar upload failed: ${normalizeError(uploadError)}`);
        setIsUploadingImage(false);
        return;
      }

      // 5. Retrieve Public URL
      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      if (!publicUrl) {
        toast.error("Failed to generate public URL for avatar.");
        setIsUploadingImage(false);
        return;
      }

      const finalUrl = `${publicUrl}?t=${Date.now()}`;
      setUploadedAvatarUrl(finalUrl);
      setAvatarPreview(finalUrl);
      toast.success("Profile photo uploaded successfully!");
    } catch (err: any) {
      toast.error(`Upload error: ${normalizeError(err)}`);
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Trigger file dialog
  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  // Remove uploaded image
  const removeAvatar = () => {
    setAvatarFile(null);
    setUploadedAvatarUrl(null);
    setAvatarPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Navigating steps with step-specific checks
  const handleNext = async () => {
    if (currentStep === 1) {
      setCurrentStep(2);
      return;
    }

    if (currentStep === 2) {
      // Validate Personal Info step fields
      const isStepValid = await trigger([
        "fullName",
        "username",
        "dob",
        "gender",
        "country",
        "state",
        "city",
        "language",
        "bio",
      ]);
      if (!isStepValid) {
        toast.error("Please fill in all required fields correctly.");
        return;
      }

      // Placeholder check for username uniqueness
      const usernameVal = watch("username") || "";
      const takenUsernames = ["admin", "test", "taken", "eduearn", "root"];
      if (takenUsernames.includes(usernameVal.toLowerCase().trim())) {
        setError("username", {
          type: "manual",
          message: "Username is already taken. Try another name.",
        });
        toast.error("This username is already taken. Please try another one.");
        return;
      }

      setCurrentStep(3);
      return;
    }

    if (currentStep === 3) {
      // Age Eligibility check for tutors
      if (selectedRole === "tutor") {
        const age = calculateAge(dob);
        if (age < 16 || age > 24) {
          toast.error("Tutors must be between 16 and 24 years old.");
          return;
        }
      }
      setCurrentStep(4);
      return;
    }

    if (currentStep === 4) {
      // Validate dynamic fields based on role selection
      const fieldsToValidate: (keyof OnboardingFields)[] =
        selectedRole === "learner"
          ? ["interests"]
          : ["skills", "experience", "education", "portfolioUrl", "linkedInUrl", "areasOfExpertise"];

      const isStepValid = await trigger(fieldsToValidate);
      if (isStepValid) {
        if (selectedRole === "learner" && interests.length < 3) {
          toast.error("Please select at least three interest areas.");
          return;
        }
        setCurrentStep(5);
      } else {
        toast.error("Please check the interests or skills configuration.");
      }
      return;
    }

    if (currentStep === 5) {
      // Step 5 uploads profile picture and saves profile data
      await handleSaveProfile();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSaveProfile = async () => {
    const values = watch();
    
    const cleanFields = {
      fullName: values.fullName,
      username: values.username,
      dob: values.dob,
      gender: values.gender,
      country: values.country,
      state: values.state,
      city: values.city,
      language: values.language,
      bio: values.bio,
      role: (values.role === "learner" ? "student" : "tutor") as "student" | "tutor",
      interests: values.interests,
      skills: values.skills ? values.skills.split(",").map((s) => s.trim()) : [],
      goals: selectedRole === "learner" ? "Learning path focus: " + (values.interests || []).join(", ") : values.areasOfExpertise,
      avatarUrl: uploadedAvatarUrl || undefined,
    };

    const result = await completeProfile(cleanFields);

    if (result.success) {
      toast.success("Profile saved successfully!");
      setCurrentStep(6);
    } else {
      toast.error(normalizeError(result.error || "Something went wrong while completing your profile."));
    }
  };

  // Interest selection toggler for Learners
  const toggleInterest = (interest: string) => {
    const currentInterests = [...interests];
    const index = currentInterests.indexOf(interest);
    if (index > -1) {
      currentInterests.splice(index, 1);
    } else {
      currentInterests.push(interest);
    }
    setValue("interests", currentInterests);
  };

  const isNextDisabled =
    isAuthStoreLoading ||
    isUploadingImage ||
    (currentStep === 2 && bioLength < 10) ||
    (currentStep === 4 && selectedRole === "learner" && interests.length < 3);

  return (
    <PageWrapper>
      <main className="relative flex min-h-[85vh] items-center overflow-y-auto lg:overflow-hidden py-16">
        {/* Background radial gradients */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.12),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.08),transparent_32%)]"
        />

        <Container className="relative z-10 max-w-2xl">
          {/* Header Stepper Navigation bar */}
          {currentStep < 6 && (
            <div className="mb-10 w-full overflow-x-auto pb-2 scrollbar-none select-none">
              <div className="flex items-center justify-between min-w-[500px] gap-2 px-1">
                {STEPS.map((step, idx) => {
                  const isCompleted = currentStep > step.number;
                  const isActive = currentStep === step.number;
                  return (
                    <div key={step.number} className="flex items-center gap-2">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 border ${
                          isCompleted
                            ? "bg-accent/15 border-accent text-accent"
                            : isActive
                              ? "bg-primary text-white border-primary shadow-soft"
                              : "bg-card border-border text-muted-foreground"
                        }`}
                      >
                        {isCompleted ? <Check size={14} strokeWidth={3} /> : step.number}
                      </div>
                      <span
                        className={`text-xs font-heading font-extrabold whitespace-nowrap transition-colors ${
                          isActive ? "text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {step.title}
                      </span>
                      {idx < STEPS.length - 1 && (
                        <div className="h-px w-6 bg-border" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Core Wizard Shell */}
          <Card variant="glass" hoverEffect="none" className="p-6 shadow-floating sm:p-8">
            <AnimatePresence mode="wait">
              {/* STEP 1: WELCOME SCREEN */}
              {currentStep === 1 && (
                <motion.div
                  key="step-1"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col items-center text-center gap-6"
                >
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto animate-bounce">
                    <Sparkles size={26} />
                  </div>
                  <div>
                    <h1 className="text-3xl font-heading font-extrabold text-foreground tracking-tight">
                      Welcome to EduEarn
                    </h1>
                    <p className="text-sm font-heading font-semibold text-primary mt-1">
                      Learn • Teach • Earn.
                    </p>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-4 leading-relaxed">
                      EduEarn is India&apos;s most trusted AI-powered learning marketplace. Let&apos;s configure your account to tailor recommendation feeds, unlock tutoring certificates, or track live peer events.
                    </p>
                  </div>
                  <div className="relative mt-2 h-32 w-full overflow-hidden rounded-[20px] border border-border bg-gradient-to-br from-primary/5 via-sky-500/5 to-accent/5">
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-center">
                      <span className="text-xs font-bold text-foreground">Peer Onboarding Verified</span>
                      <p className="text-[10px] text-muted-foreground">Setup profile · Configure Role · Verify Age limits</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: PERSONAL INFORMATION */}
              {currentStep === 2 && (
                <motion.div
                  key="step-2"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-5"
                >
                  <div className="text-center mb-6">
                    <h2 className="text-xl font-heading font-extrabold text-foreground tracking-tight">
                      Personal Information
                    </h2>
                    <p className="text-xs text-muted-foreground mt-1">
                      Tell us about yourself. This information helps us verify your account details.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      label="Full Name *"
                      placeholder="Jane Doe"
                      error={errors.fullName?.message}
                      {...register("fullName")}
                    />

                    <FormField
                      label="Username *"
                      placeholder="janedoe_12"
                      error={errors.username?.message}
                      {...register("username")}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-foreground">Date of Birth *</label>
                      <input
                        type="date"
                        className={`h-12 w-full rounded-input border border-border bg-card px-4 text-sm font-medium text-foreground shadow-soft transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 ${
                          errors.dob ? "border-destructive focus:border-destructive" : ""
                        }`}
                        {...register("dob")}
                      />
                      {errors.dob && (
                        <p className="flex items-center gap-1 text-xs font-semibold text-destructive mt-1">
                          <ShieldAlert size={12} />
                          {errors.dob.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-foreground">Gender *</label>
                      <select
                        className="h-12 w-full rounded-input border border-border bg-card px-4 text-sm font-medium text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 cursor-pointer"
                        {...register("gender")}
                      >
                        {GENDERS.map((g) => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-foreground">Preferred Language *</label>
                      <select
                        className="h-12 w-full rounded-input border border-border bg-card px-4 text-sm font-medium text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 cursor-pointer"
                        {...register("language")}
                      >
                        {LANGUAGES.map((l) => (
                          <option key={l} value={l}>
                            {l}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-foreground">Country *</label>
                      <select
                        className="h-12 w-full rounded-input border border-border bg-card px-4 text-sm font-medium text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 cursor-pointer"
                        {...register("country")}
                      >
                        {COUNTRIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <FormField
                      label="State / Region *"
                      placeholder="Karnataka"
                      error={errors.state?.message}
                      {...register("state")}
                    />

                    <FormField
                      label="City *"
                      placeholder="Bengaluru"
                      error={errors.city?.message}
                      {...register("city")}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-bold text-foreground">Short Bio *</label>
                      <span className={`text-xs font-semibold ${bioLength < 10 ? "text-destructive" : "text-muted-foreground"}`}>
                        {bioLength} / 300
                      </span>
                    </div>
                    <textarea
                      rows={3}
                      maxLength={300}
                      placeholder="Share a brief introduction with the community..."
                      className={`w-full bg-card border border-border shadow-sm hover:shadow-md transition-shadow duration-200 rounded-input p-3 focus:outline-none focus:border-primary/50 text-sm font-semibold text-foreground placeholder:text-muted-foreground/80 resize-none ${
                        errors.bio || bioLength < 10 ? "border-destructive focus:border-destructive" : ""
                      }`}
                      {...register("bio")}
                    />
                    {bioLength < 10 ? (
                      <p className="flex items-center gap-1 text-xs font-semibold text-destructive mt-1">
                        <ShieldAlert size={12} />
                        Biography must be at least 10 characters. (Need {10 - bioLength} more)
                      </p>
                    ) : (
                      <p className="text-[10px] font-semibold text-muted-foreground mt-1">
                        {300 - bioLength} characters remaining.
                      </p>
                    )}
                  </div>
                </motion.div>
              )}

              {/* STEP 3: ROLE SELECTION */}
              {currentStep === 3 && (
                <motion.div
                  key="step-3"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-5"
                >
                  <div className="text-center mb-6">
                    <h2 className="text-xl font-heading font-extrabold text-foreground tracking-tight">
                      Choose Your Role
                    </h2>
                    <p className="text-xs text-muted-foreground mt-1">
                      Onboard as a student learner or an AI-verified tutor. Age eligibility limits apply for Tutors.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
                    {/* Learner Card */}
                    <div
                      onClick={() => setValue("role", "learner")}
                      className={`p-6 border rounded-card cursor-pointer flex flex-col gap-4 items-center justify-center text-center transition-all ${
                        selectedRole === "learner"
                          ? "border-primary bg-primary/5 ring-1 ring-primary shadow-soft"
                          : "border-border bg-card hover:bg-muted/40"
                      }`}
                    >
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <BookOpen size={22} />
                      </div>
                      <div>
                        <h4 className="text-sm font-heading font-extrabold text-foreground">
                          Learner
                        </h4>
                        <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                          &ldquo;I want to learn.&rdquo; Access peer lecture notes, clear syllabus modules, and earn completion badges.
                        </p>
                      </div>
                    </div>

                    {/* Tutor Card */}
                    <div
                      onClick={() => setValue("role", "tutor")}
                      className={`p-6 border rounded-card cursor-pointer flex flex-col gap-4 items-center justify-center text-center transition-all ${
                        selectedRole === "tutor"
                          ? "border-accent bg-accent/5 ring-1 ring-accent shadow-soft"
                          : "border-border bg-card hover:bg-muted/40"
                      }`}
                    >
                      <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                        <Award size={22} />
                      </div>
                      <div>
                        <h4 className="text-sm font-heading font-extrabold text-foreground">
                          Tutor
                        </h4>
                        <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                          &ldquo;I want to teach and earn.&rdquo; Host live clearance sessions, publish courses, and payout 85% revenue shares.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Summary of permissions for selected role */}
                  <div className="mt-4 p-4 rounded-card border border-border/80 bg-muted/20 text-left space-y-3">
                    <h5 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles size={12} className="text-primary animate-pulse" />
                      Role Privileges & Permissions
                    </h5>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-[11px] text-muted-foreground font-semibold">
                      {selectedRole === "learner" ? (
                        <>
                          <li className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                            Enroll in courses
                          </li>
                          <li className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                            AI Study Assistant
                          </li>
                          <li className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                            Certificates
                          </li>
                          <li className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                            Learning roadmap
                          </li>
                          <li className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                            Community
                          </li>
                        </>
                      ) : (
                        <>
                          <li className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                            Publish courses
                          </li>
                          <li className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                            Live classes
                          </li>
                          <li className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                            Earnings
                          </li>
                          <li className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                            Analytics
                          </li>
                          <li className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                            AI Studio
                          </li>
                          <li className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                            Withdrawals
                          </li>
                        </>
                      )}
                    </ul>
                  </div>

                  {/* DOB/Age display check helper */}
                  {dob && (
                    <div className="mt-4 text-center">
                      <span className="text-[11px] font-semibold text-muted-foreground">
                        Your computed age is:{" "}
                        <span className="font-extrabold text-foreground">
                          {calculateAge(dob)} years old
                        </span>
                      </span>
                      {selectedRole === "tutor" && (calculateAge(dob) < 16 || calculateAge(dob) > 24) && (
                        <p className="text-xs font-bold text-destructive mt-2 flex items-center justify-center gap-1.5">
                          <ShieldAlert size={14} />
                          Only users between 16–24 years are eligible to become tutors.
                        </p>
                      )}
                    </div>
                  )}
                </motion.div>
              )}

              {/* STEP 4: DYNAMIC SKILLS / INTERESTS */}
              {currentStep === 4 && (
                <motion.div
                  key="step-4"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-5"
                >
                  {selectedRole === "learner" ? (
                    // LEARNER VIEW
                    <>
                      <div className="text-center mb-4">
                        <h2 className="text-xl font-heading font-extrabold text-foreground tracking-tight">
                          Select Your Interests
                        </h2>
                        <p className="text-xs text-muted-foreground mt-1">
                          Select at least 3 areas you are interested in. This helps us customize course roadmaps.
                        </p>
                      </div>

                      {/* Search box */}
                      <div className="relative mb-4 w-full">
                        <input
                          type="text"
                          placeholder="Search interests..."
                          value={interestSearch}
                          onChange={(e) => setInterestSearch(e.target.value)}
                          className="h-10 w-full rounded-input border border-border bg-card px-4 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                      </div>

                      {/* Counter indicator */}
                      <div className="flex items-center justify-between mb-3 px-1">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                          Interests catalog
                        </span>
                        <span className={`text-xs font-bold ${interests.length < 3 ? "text-destructive" : "text-emerald-500"}`}>
                          {interests.length < 3 ? `${interests.length} / 3 selected (select ${3 - interests.length} more)` : `${interests.length} selected`}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[220px] overflow-y-auto pr-1">
                        {availableInterests
                          .filter((i) => i.toLowerCase().includes(interestSearch.toLowerCase()))
                          .map((interest) => {
                            const isSelected = interests.includes(interest);
                            return (
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                type="button"
                                key={interest}
                                onClick={() => toggleInterest(interest)}
                                className={`p-3 border rounded-input text-center text-xs font-bold transition-all cursor-pointer ${
                                  isSelected
                                    ? "bg-primary border-primary text-white shadow-soft"
                                    : "border-border bg-card text-muted-foreground hover:bg-muted/40"
                                }`}
                              >
                                {interest}
                              </motion.button>
                            );
                          })}
                      </div>
                    </>
                  ) : (
                    // TUTOR VIEW
                    <>
                      <div className="text-center mb-6">
                        <h2 className="text-xl font-heading font-extrabold text-foreground tracking-tight">
                          Configure Tutor Skills
                        </h2>
                        <p className="text-xs text-muted-foreground mt-1">
                          Tell us about your teaching catalog background. Credentials will be validated in future steps.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                          label="Skills (Comma-separated) *"
                          placeholder="Java, Calculus, Figma, Editing"
                          error={errors.skills?.message}
                          {...register("skills")}
                        />

                        <div className="space-y-2">
                          <label className="text-sm font-bold text-foreground">Experience Level *</label>
                          <select
                            className="h-12 w-full rounded-input border border-border bg-card px-4 text-sm font-medium text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 cursor-pointer"
                            {...register("experience")}
                          >
                            {EXPERIENCE_LEVELS.map((exp) => (
                              <option key={exp} value={exp}>
                                {exp}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                          label="Education / Institution *"
                          placeholder="BITS Pilani - CS Sophomore"
                          error={errors.education?.message}
                          {...register("education")}
                        />

                        <FormField
                          label="Portfolio URL (Optional)"
                          placeholder="https://mywork.com"
                          error={errors.portfolioUrl?.message}
                          {...register("portfolioUrl")}
                        />
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-bold text-foreground">LinkedIn Profile URL (Optional)</label>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                              <rect width="4" height="12" x="2" y="9" />
                              <circle cx="4" cy="4" r="2" />
                            </svg>
                          </div>
                          <input
                            type="url"
                            placeholder="https://linkedin.com/in/username"
                            className={`h-12 w-full rounded-input border border-border bg-card px-4 text-sm font-medium text-foreground shadow-soft transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 ${
                              errors.linkedInUrl ? "border-destructive focus:border-destructive" : ""
                            }`}
                            {...register("linkedInUrl")}
                          />
                          {errors.linkedInUrl && (
                            <p className="flex items-center gap-1 text-xs font-semibold text-destructive mt-1">
                              <ShieldAlert size={12} />
                              {errors.linkedInUrl.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-bold text-foreground">Areas of Expertise *</label>
                          <textarea
                            rows={3}
                            placeholder="Describe your subject focus area..."
                            className={`w-full bg-card border border-border shadow-sm hover:shadow-md transition-shadow duration-200 rounded-input p-3 focus:outline-none focus:border-primary/50 text-sm font-semibold text-foreground placeholder:text-muted-foreground/80 resize-none ${
                              errors.areasOfExpertise ? "border-destructive focus:border-destructive" : ""
                            }`}
                            {...register("areasOfExpertise")}
                          />
                          {errors.areasOfExpertise && (
                            <p className="flex items-center gap-1 text-xs font-semibold text-destructive mt-1">
                              <ShieldAlert size={12} />
                              {errors.areasOfExpertise.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </motion.div>
              )}

              {/* STEP 5: PROFILE PICTURE PICTURE */}
              {currentStep === 5 && (
                <motion.div
                  key="step-5"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-5 text-center flex flex-col items-center"
                >
                  <div className="mb-4">
                    <h2 className="text-xl font-heading font-extrabold text-foreground tracking-tight">
                      Profile Photo (Optional)
                    </h2>
                    <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                      You can upload a profile photo now or skip and add one later.
                    </p>
                  </div>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />

                  {/* Photo crop/preview wrapper */}
                  <div
                    onClick={isUploadingImage || avatarPreview ? undefined : triggerFileSelect}
                    className={`w-40 h-40 rounded-full border-2 border-dashed flex flex-col items-center justify-center transition-all cursor-pointer relative overflow-hidden group select-none ${
                      avatarPreview
                        ? "border-primary bg-card"
                        : "border-border hover:border-primary bg-muted/30"
                    }`}
                  >
                    {isUploadingImage ? (
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="animate-spin text-primary" size={26} />
                        <span className="text-[10px] font-bold text-primary uppercase tracking-wider block">
                          Uploading...
                        </span>
                      </div>
                    ) : avatarPreview ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={avatarPreview}
                          alt="Avatar Preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <button
                            type="button"
                            onClick={triggerFileSelect}
                            className="p-2 bg-white/20 rounded-full text-white backdrop-blur hover:bg-white/30"
                          >
                            <Camera size={18} />
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center p-4">
                        <Camera size={26} className="text-muted-foreground mx-auto mb-2" />
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                          Upload Photo
                        </span>
                        <span className="text-[8px] text-muted-foreground/60 block mt-1">
                          Max 2MB (PNG/JPG/WEBP)
                        </span>
                      </div>
                    )}
                  </div>

                  {avatarPreview && (
                    <div className="flex items-center gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={triggerFileSelect}
                        disabled={isUploadingImage}
                        className="flex items-center gap-1.5"
                      >
                        Replace
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={removeAvatar}
                        disabled={isUploadingImage}
                        className="flex items-center gap-1.5 text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 size={13} />
                        Remove
                      </Button>
                    </div>
                  )}

                  {/* Dynamic crop placeholder badge */}
                  <div className="rounded-[10px] border border-border bg-muted/40 px-4 py-3 max-w-sm mt-2">
                    <p className="text-[10px] leading-relaxed text-muted-foreground text-left">
                      💡 <strong>Crop Recommendation:</strong> Close-up face photos with uniform background outline contrast look best.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* STEP 6: FINISH SCREEN */}
              {currentStep === 6 && (
                <motion.div
                  key="step-6"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6 text-center flex flex-col items-center py-4"
                >
                  <div className="w-16 h-16 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent mx-auto animate-pulse">
                    <Check size={32} strokeWidth={3} />
                  </div>

                  <div>
                    <h2 className="text-2xl font-heading font-extrabold text-foreground tracking-tight">
                      Congratulations!
                    </h2>
                    <p className="text-sm font-heading font-semibold text-accent mt-1">
                      Onboarding profile set successfully.
                    </p>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-3 leading-relaxed">
                      Your profile config metrics have been updated. Welcome to the EduEarn marketplace catalog!
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md mt-4">
                    <Button
                      onClick={() => router.push("/courses")}
                      className="flex-1 flex items-center justify-center gap-2"
                    >
                      Explore Courses
                      <ChevronRight size={14} />
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => router.push("/welcome")}
                      className="flex-1 flex items-center justify-center gap-2"
                    >
                      Go to Dashboard
                    </Button>
                  </div>

                  {selectedRole === "tutor" && (
                    <div className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1.5 justify-center mt-2 border-t border-border/30 pt-4 w-full">
                      <span>Become a Tutor Resources:</span>
                      <a
                        href="/pricing"
                        className="text-primary hover:underline flex items-center gap-0.5"
                      >
                        Earnings Model
                        <ExternalLink size={10} />
                      </a>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Stepper Wizard Navigation controls */}
            {currentStep < 6 && (
              <div className="mt-8 flex items-center justify-between border-t border-border/40 pt-6">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleBack}
                  disabled={currentStep === 1 || isAuthStoreLoading}
                  className="flex items-center gap-1.5"
                >
                  <ChevronLeft size={16} />
                  Back
                </Button>

                <div className="flex items-center gap-3">
                  {currentStep === 5 && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleSaveProfile}
                      disabled={isAuthStoreLoading}
                      className="text-muted-foreground hover:text-foreground font-semibold text-xs transition-colors"
                    >
                      Skip for now
                    </Button>
                  )}

                  <Button
                    type="button"
                    onClick={handleNext}
                    disabled={isNextDisabled}
                    className="flex items-center gap-1.5 shadow-premium"
                  >
                    {isAuthStoreLoading ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        {currentStep === 5 ? "Finish Setup" : "Continue"}
                        <ChevronRight size={16} />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </Container>
      </main>
    </PageWrapper>
  );
}
