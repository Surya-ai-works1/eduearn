// src/app/api/student/live-classes/route.ts

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/student/live-classes
 * Returns upcoming live classes for courses the authenticated student is actively enrolled in.
 * Protected by server session authentication & RLS enrollment boundary.
 */
export async function GET() {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase unconfigured' }, { status: 503 });
  }

  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  }

  try {
    // 1. Get courses student is enrolled in
    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('course_id')
      .eq('learner_id', user.id);

    const enrolledCourseIds = (enrollments || []).map(e => e.course_id);

    if (enrolledCourseIds.length === 0) {
      return NextResponse.json({ liveClasses: [] });
    }

    // 2. Fetch live_classes belonging to enrolled courses
    const { data: liveClasses, error } = await supabase
      .from('live_classes')
      .select('*, courses(title, thumbnail)')
      .in('course_id', enrolledCourseIds)
      .neq('status', 'cancelled')
      .order('scheduled_at', { ascending: true });

    if (error) throw error;

    const formatted = (liveClasses || []).map((lc: any) => ({
      id: lc.id,
      title: lc.title,
      description: lc.description || '',
      courseId: lc.course_id,
      courseTitle: (lc.courses as any)?.title || 'Enrolled Course',
      scheduledAt: lc.scheduled_at,
      duration: lc.duration || 60,
      provider: lc.provider || 'google_meet',
      meetingLink: lc.meeting_link,
      status: lc.status || 'scheduled',
    }));

    return NextResponse.json({ liveClasses: formatted });
  } catch (err: any) {
    console.error('Failed to fetch student live classes:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
