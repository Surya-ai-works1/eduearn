export interface EnvValidationResult {
  supabase: boolean;
  gemini: boolean;
  smtp: boolean;
  paymentGateway: boolean;
  errors: string[];
}

export function validateEnvironment(): EnvValidationResult {
  const errors: string[] = [];

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;
  const smtpHost = process.env.SMTP_HOST || process.env.BREVO_SMTP_HOST;
  const smtpPass = process.env.SMTP_PASS || process.env.BREVO_SMTP_KEY;

  let supabaseValid = true;
  if (!supabaseUrl || !supabaseAnonKey) {
    supabaseValid = false;
    errors.push("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  let geminiValid = true;
  if (!geminiKey) {
    geminiValid = false;
    errors.push("Missing GEMINI_API_KEY");
  }

  let smtpValid = true;
  if (!smtpHost || !smtpPass) {
    smtpValid = false;
    errors.push("Missing SMTP_HOST or SMTP_PASS (Brevo config)");
  }

  return {
    supabase: supabaseValid,
    gemini: geminiValid,
    smtp: smtpValid,
    paymentGateway: true, // checkout gateways are preconfigured in simulated modes
    errors,
  };
}
