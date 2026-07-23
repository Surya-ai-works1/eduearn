export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  geminiApiKey: process.env.GEMINI_API_KEY || "",
  appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
};

/**
 * Validates that crucial environment variables are loaded.
 * Warns in development instead of crashing to support running with mocks.
 */
export function validateEnv(): boolean {
  const missing: string[] = [];
  
  if (!env.supabaseUrl) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!env.supabaseAnonKey) missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  
  if (missing.length > 0) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        `[EduEarn Environment Check] Missing variables: ${missing.join(", ")}. Mocks will be used.`
      );
    }
    return false;
  }
  return true;
}
