// src/app/api/tutor/live-classes/[id]/route.ts

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { validateMeetingUrl } from '@/lib/utils/meetingValidator';

/**
 * PATCH /api/tutor/live-classes/:id
 * Server-authoritative update/reschedule/cancellation of a live class.
 * Verifies authenticated session & tutor ownership.
 */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const classId = resolvedParams.id;

  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase unconfigured' }, { status: 503 });
  }

  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  }

  try {
    // 1. Verify live class exists & belongs to authenticated tutor
    const { data: existingClass, error: fetchErr } = await supabase
      .from('live_classes')
      .select('id, tutor_id, provider, meeting_link')
      .eq('id', classId)
      .maybeSingle();

    if (fetchErr || !existingClass || existingClass.tutor_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden: Live class not found or not owned by authenticated tutor' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const updates: any = {};

    if (body.title !== undefined) updates.title = body.title.trim();
    if (body.description !== undefined) updates.description = body.description.trim();
    if (body.scheduledAt !== undefined) updates.scheduled_at = new Date(body.scheduledAt).toISOString();
    if (body.duration !== undefined) updates.duration = parseInt(body.duration, 10) || 60;
    if (body.status !== undefined) {
      if (!['scheduled', 'live', 'completed', 'cancelled'].includes(body.status)) {
        return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
      }
      updates.status = body.status;
    }

    if (body.provider !== undefined || body.meetingLink !== undefined) {
      const newProvider = body.provider || existingClass.provider || 'google_meet';
      const newLink = body.meetingLink || existingClass.meeting_link || '';

      const val = validateMeetingUrl(newProvider, newLink);
      if (!val.valid) {
        return NextResponse.json({ error: val.error }, { status: 400 });
      }
      if (body.provider !== undefined) updates.provider = newProvider;
      if (body.meetingLink !== undefined) updates.meeting_link = newLink.trim();
    }

    const { data: updatedClass, error: updateErr } = await supabase
      .from('live_classes')
      .update(updates)
      .eq('id', classId)
      .select()
      .single();

    if (updateErr) throw updateErr;

    return NextResponse.json({ liveClass: updatedClass });
  } catch (err: any) {
    console.error('Failed to update live class:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/tutor/live-classes/:id
 * Server-authoritative cancellation/deletion of a live class.
 */
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const classId = resolvedParams.id;

  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase unconfigured' }, { status: 503 });
  }

  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  }

  try {
    const { data: existingClass, error: fetchErr } = await supabase
      .from('live_classes')
      .select('id, tutor_id')
      .eq('id', classId)
      .maybeSingle();

    if (fetchErr || !existingClass || existingClass.tutor_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden: Live class not found or not owned by authenticated tutor' },
        { status: 403 }
      );
    }

    const { error: deleteErr } = await supabase
      .from('live_classes')
      .delete()
      .eq('id', classId);

    if (deleteErr) throw deleteErr;

    return NextResponse.json({ success: true, message: 'Live class deleted' });
  } catch (err: any) {
    console.error('Failed to delete live class:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
