// src/app/api/student/course/[id]/route.ts

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { courseDetailsService } from '@/lib/services/courseDetailsService';

/**
 * GET /api/student/course/:id
 * Server-authoritative endpoint returning course details with enrollment-based access control.
 * Enrolled students/tutors/admins receive full learning content & video URLs.
 * Non-enrolled users receive public-safe course preview information only.
 */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase is unconfigured/disabled on localhost" }, { status: 503 });
  }
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  }

  try {
    const course = await courseDetailsService.getCourseDetails(id);
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // 1. Check user role for Admin or Owning Tutor privilege
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    const userRole = profile?.role || user.user_metadata?.role || 'student';
    const isAdmin = userRole === 'admin' || userRole === 'super-admin';

    // Fetch raw course record to check tutor_id and status
    const { data: rawCourse } = await supabase
      .from('courses')
      .select('tutor_id, status, approval_status')
      .eq('id', id)
      .maybeSingle();

    const isTutorOwner = rawCourse?.tutor_id === user.id;

    // Helper to resolve private storage signed URLs for authorized users
    const resolveSignedVideoUrls = async (lessonsList: any[]) => {
      if (!lessonsList || !Array.isArray(lessonsList)) return lessonsList;
      return Promise.all(
        lessonsList.map(async (lesson: any) => {
          const rawUrl = lesson.videoUrl || lesson.video_url || '';
          if (!rawUrl) return lesson;

          let storagePath: string | null = null;
          if (rawUrl.includes('/storage/v1/object/public/course-videos/')) {
            storagePath = rawUrl.split('/storage/v1/object/public/course-videos/')[1];
          } else if (rawUrl.includes('/storage/v1/object/authenticated/course-videos/')) {
            storagePath = rawUrl.split('/storage/v1/object/authenticated/course-videos/')[1];
          } else if (rawUrl.startsWith('course-videos/')) {
            storagePath = rawUrl.replace('course-videos/', '');
          } else if (!rawUrl.startsWith('http://') && !rawUrl.startsWith('https://')) {
            storagePath = rawUrl;
          }

          if (storagePath) {
            try {
              const { data, error } = await supabase.storage
                .from('course-videos')
                .createSignedUrl(storagePath, 3600);

              if (!error && data?.signedUrl) {
                return {
                  ...lesson,
                  videoUrl: data.signedUrl,
                };
              }
            } catch (err) {
              console.warn(`Failed to generate signed URL for path "${storagePath}":`, err);
            }
          }
          return lesson;
        })
      );
    };

    if (isAdmin || isTutorOwner) {
      const lessonsWithSignedUrls = await resolveSignedVideoUrls(course.lessons);
      return NextResponse.json({
        ...course,
        lessons: lessonsWithSignedUrls,
      });
    }

    // 2. Check Enrollment for Students
    const { data: enrollment } = await supabase
      .from('enrollments')
      .select('id, status, progress')
      .eq('learner_id', user.id)
      .eq('course_id', id)
      .maybeSingle();

    const isEnrolled = !!enrollment;

    if (isEnrolled) {
      // Return full course classroom details to enrolled students with signed video URLs
      const lessonsWithSignedUrls = await resolveSignedVideoUrls(course.lessons);
      return NextResponse.json({
        ...course,
        lessons: lessonsWithSignedUrls,
        enrollment,
      });
    }

    // 3. For Non-Enrolled Users: Verify Course Publication Status
    const isPublished = rawCourse?.status === 'published' && (rawCourse?.approval_status === 'approved' || !rawCourse?.approval_status);
    if (!isPublished) {
      return NextResponse.json(
        { error: 'Forbidden: Course is unpublished or pending admin review' },
        { status: 403 }
      );
    }

    // Sanitize protected video URLs, live class meeting links, and learning assets for non-enrolled preview
    const sanitizedLessons = (course.lessons || []).map((lesson: any) => ({
      id: lesson.id,
      title: lesson.title,
      description: lesson.description || '',
      duration: lesson.duration || 10,
      order: lesson.order || 0,
      type: lesson.type || 'video',
      videoUrl: '', // Redacted for non-enrolled students
      resources: [], // Redacted for non-enrolled students
    }));

    const sanitizedLiveClasses = (course.liveClasses || []).map((lc: any) => ({
      id: lc.id,
      title: lc.title,
      description: lc.description || '',
      scheduledAt: lc.scheduledAt,
      duration: lc.duration || 60,
      provider: lc.provider || 'google_meet',
      status: lc.status || 'scheduled',
      meetingLink: '', // Redacted for non-enrolled students
    }));

    return NextResponse.json({
      ...course,
      lessons: sanitizedLessons,
      liveClasses: sanitizedLiveClasses,
      isEnrolled: false,
    });
  } catch (err) {
    console.error('Failed to fetch course details:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
