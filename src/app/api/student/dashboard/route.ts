// src/app/api/student/dashboard/route.ts

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getStudentDashboard } from '@/lib/services/studentDashboardService';

/**
 * GET /api/student/dashboard
 * Returns the aggregated data required for the student dashboard.
 * Delegates data fetching to the unified StudentDashboard service which
 * selects the appropriate repository (Mock or Supabase) based on the global IS_MOCK flag.
 */
export async function GET(request: Request) {
  // Initialise Supabase client (server side) to retrieve authenticated user.
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase is unconfigured/disabled on localhost" }, { status: 503 });
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  }

  try {
    const payload = await getStudentDashboard(user.id);
    return NextResponse.json(payload);
  } catch (err) {
    console.error('Failed to build student dashboard payload', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
