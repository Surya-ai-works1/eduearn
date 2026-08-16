// src/app/api/student/course/[id]/complete/route.ts

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { courseDetailsService } from '@/lib/services/courseDetailsService';

/**
 * POST /api/student/course/:id/complete
 * Body: { lessonId: string }
 * Marks the given lesson as completed for the authenticated learner.
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  const supabase = createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase is unconfigured/disabled on localhost" }, { status: 503 });
  }
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const lessonId: string = body.lessonId;
    if (!lessonId) {
      return NextResponse.json({ error: 'lessonId required' }, { status: 400 });
    }
    await courseDetailsService.markLessonComplete(id, lessonId);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Failed to mark lesson complete', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
