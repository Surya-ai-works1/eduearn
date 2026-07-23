import { useEffect, useState } from "react";
import { useAuth } from "./useAuth"; // main platform auth store

export interface LmsUser {
  _id: string;
  name: string;
  email: string;
  role: "student" | "educator" | "admin";
  photoUrl?: string;
  enrolledCourses: any[];
  wishlist: any[];
}

export function useLmsAuth() {
  const { user: supabaseUser, isAuthenticated } = useAuth();
  const [lmsUser, setLmsUser] = useState<LmsUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !supabaseUser) {
      setLmsUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const name = supabaseUser.fullName || supabaseUser.email?.split("@")[0] || "User";
      const photoUrl = supabaseUser.avatarUrl || "";
      
      // Map roles:
      // learner -> student
      // tutor -> educator
      // admin -> admin
      const rawRole = supabaseUser.role || "learner";
      let mappedRole: "student" | "educator" | "admin" = "student";
      if (rawRole === "tutor") {
        mappedRole = "educator";
      } else if (rawRole === "admin") {
        mappedRole = "admin";
      }

      setLmsUser({
        _id: supabaseUser.id,
        name,
        email: supabaseUser.email || "",
        role: mappedRole,
        photoUrl,
        enrolledCourses: [],
        wishlist: [],
      });
      setError(null);
    } catch (err: any) {
      console.error("LMS Auth Bridge Error:", err);
      setError(err.message || "Failed to bridge LMS session");
    } finally {
      setIsLoading(false);
    }
  }, [supabaseUser, isAuthenticated]);

  return { lmsUser, isLoading, error, setLmsUser };
}
