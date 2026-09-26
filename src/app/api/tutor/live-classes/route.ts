// src/app/api/tutor/live-classes/route.ts

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { validateMeetingUrl } from '@/lib/utils/meetingValidator';

/**
 * GET /api/tutor/live-classes
 * Retrieves all live classes created by the authenticated tutor across their courses.
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
    const { data: liveClasses, error } = await supabase
      .from('live_classes')
      .select('*, courses(title)')
      .eq('tutor_id', user.id)
      .order('scheduled_at', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ liveClasses: liveClasses || [] });
  } catch (err: any) {
    console.error('Failed to fetch tutor live classes:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/tutor/live-classes
 * Server-authoritative creation of a live class.
 * Validates authenticated tutor session, course ownership, and provider/URL consistency.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase unconfigured' }, { status: 503 });
  }

  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { courseId, title, description, scheduledAt, duration, provider, meetingLink } = body;

    if (!courseId || !title || !scheduledAt || !meetingLink || !provider) {
      return NextResponse.json(
        { error: 'Required fields missing: courseId, title, scheduledAt, provider, meetingLink' },
        { status: 400 }
      );
    }

    // 1. Verify tutor owns the target course
    const { data: course, error: courseErr } = await supabase
      .from('courses')
      .select('id, tutor_id')
      .eq('id', courseId)
      .maybeSingle();

    if (courseErr || !course || course.tutor_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden: Course not found or not owned by authenticated tutor' },
        { status: 403 }
      );
    }

    // 2. Server-side provider & meeting URL validation
    const val = validateMeetingUrl(provider, meetingLink);
    if (!val.valid) {
      return NextResponse.json({ error: val.error }, { status: 400 });
    }

    // 3. Insert live class into database
    const { data: newClass, error: insertErr } = await supabase
      .from('live_classes')
      .insert({
        course_id: courseId,
        tutor_id: user.id,
        title: title.trim(),
        description: description ? description.trim() : null,
        scheduled_at: new Date(scheduledAt).toISOString(),
        duration: parseInt(duration, 10) || 60,
        provider: provider,
        meeting_link: meetingLink.trim(),
        status: 'scheduled',
      })
      .select()
      .single();

    if (insertErr) throw insertErr;

    return NextResponse.json({ liveClass: newClass }, { status: 201 });
  } catch (err: any) {
    console.error('Failed to create live class:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
