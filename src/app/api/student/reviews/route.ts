import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase is unconfigured or disabled" }, { status: 503 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthenticated. Please log in as a student to review.' }, { status: 401 });
    }

    const body = await request.json();
    const { courseId, rating, comment } = body;

    if (!courseId || typeof courseId !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid courseId parameter.' }, { status: 400 });
    }

    const numericRating = Number(rating);
    if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
      return NextResponse.json({ error: 'Rating must be an integer between 1 and 5 stars.' }, { status: 400 });
    }

    // 1. Authoritative check: Tutor cannot review their own course
    const { data: course } = await supabase
      .from('courses')
      .select('tutor_id')
      .eq('id', courseId)
      .maybeSingle();

    if (course && course.tutor_id === user.id) {
      return NextResponse.json({ error: 'Educators cannot review their own courses.' }, { status: 403 });
    }

    // 2. Authoritative check: Only enrolled learners can review
    const { data: enrollment } = await supabase
      .from('enrollments')
      .select('id')
      .eq('learner_id', user.id)
      .eq('course_id', courseId)
      .maybeSingle();

    if (!enrollment) {
      return NextResponse.json({ error: 'You must be enrolled in this course to leave a review.' }, { status: 403 });
    }

    const sanitizedComment = typeof comment === 'string' ? comment.trim().substring(0, 1000) : '';

    // 3. Upsert review with ON CONFLICT (user_id, course_id)
    const { data: reviewData, error: reviewErr } = await supabase
      .from('reviews')
      .upsert(
        {
          user_id: user.id,
          course_id: courseId,
          rating: numericRating,
          comment: sanitizedComment,
          created_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,course_id' }
      )
      .select()
      .single();

    if (reviewErr) {
      console.error('Database review insertion failed:', reviewErr);
      return NextResponse.json({ error: reviewErr.message || 'Failed to submit course review.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, review: reviewData });
  } catch (err: any) {
    console.error('Failed to submit review:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ reviews: [] });
    }

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');

    if (!courseId) {
      return NextResponse.json({ error: 'Missing courseId query parameter.' }, { status: 400 });
    }

    const { data: dbReviews, error } = await supabase
      .from('reviews')
      .select('id, rating, comment, created_at, user_id, profiles(full_name, display_name, avatar_url)')
      .eq('course_id', courseId)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Failed to fetch reviews from Supabase:', error);
      return NextResponse.json({ reviews: [] });
    }

    const mapped = (dbReviews || []).map((r: any) => ({
      id: r.id,
      courseId,
      studentName: r.profiles?.full_name || r.profiles?.display_name || 'Verified Learner',
      studentAvatar: r.profiles?.avatar_url || '',
      rating: r.rating,
      comment: r.comment || '',
      createdAt: r.created_at,
    }));

    return NextResponse.json({ reviews: mapped });
  } catch (err: any) {
    console.error('Failed to fetch course reviews:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
