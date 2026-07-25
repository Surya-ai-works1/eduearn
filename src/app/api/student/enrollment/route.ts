import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { enrollmentService } from '@/lib/services/enrollmentService';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');

    if (courseId) {
      const enrollment = await enrollmentService.getEnrollment(user.id, courseId);
      return NextResponse.json({ enrollment });
    }

    const enrollments = await enrollmentService.getEnrollments(user.id);
    return NextResponse.json({ enrollments });
  } catch (err: any) {
    console.error('Failed to get enrollment:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }

    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (profileErr) {
      console.warn("Could not load user profile for role verification:", profileErr);
    }
    
    // Default to student if profile doesn't explicitly block it (in case profile table sync delay)
    if (profile && profile.role && profile.role !== 'student') {
      return NextResponse.json({ error: 'Only student accounts can enroll in courses' }, { status: 403 });
    }

    const body = await request.json();
    const { courseId } = body;
    if (!courseId) {
      return NextResponse.json({ error: 'Missing courseId' }, { status: 400 });
    }

    const enrollment = await enrollmentService.enrollStudent(user.id, courseId);
    return NextResponse.json({ enrollment });
  } catch (err: any) {
    console.error('Failed to enroll student:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
