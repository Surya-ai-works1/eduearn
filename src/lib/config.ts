const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const IS_MOCK: boolean = 
  !supabaseUrl || 
  !supabaseAnonKey || 
  supabaseUrl.includes("placeholder");
