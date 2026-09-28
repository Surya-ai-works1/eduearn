import { createClient } from '@/lib/supabase/client';

export interface Tutor {
  id: string;
  fullName: string;
  avatar?: string;
}

/**
 * Returns an authoritative tutor profile object by id from Supabase database.
 * If no id is provided or the tutor profile is not found in database, returns null.
 * Never silently substitutes fake mock tutor records.
 */
export async function getTutorById(tutorId?: string): Promise<Tutor | null> {
  if (!tutorId) return null;

  try {
    const supabase = createClient();
    if (!supabase) return null;

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, full_name, display_name, avatar_url, role')
      .eq('id', tutorId)
      .maybeSingle();

    if (error || !profile || profile.role !== 'tutor') {
      return null;
    }

    return {
      id: profile.id,
      fullName: profile.full_name || profile.display_name || 'Tutor Instructor',
      avatar: profile.avatar_url || '/images/tutors/default.jpg',
    };
  } catch (err) {
    console.warn("Failed to fetch authoritative tutor profile from database:", err);
    return null;
  }
}
