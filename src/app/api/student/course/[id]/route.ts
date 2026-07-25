// src/app/api/student/course/[id]/route.ts

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { courseDetailsService } from '@/lib/services/courseDetailsService';

/**
 * GET /api/student/course/:id
 * Returns full course details for the given course ID.
 */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  }

  try {
    const course = await courseDetailsService.getCourseDetails(id);
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }
    return NextResponse.json(course);
  } catch (err) {
    console.error('Failed to fetch course details', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
