import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { logger } from "@/utils/logger";

export async function POST(request: Request) {
  const startTime = Date.now();
  
  // Create admin/service role client to seed courses/lessons bypassing RLS constraints safely
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    logger.error("Supabase service key or URL is missing in environment variables");
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }

  const supabaseAdmin = createAdminClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    }
  });

  try {
    // Authenticate user with normal client
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase is unconfigured/disabled on localhost" }, { status: 503 });
    }
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      logger.warn("Unauthorized attempt to start pathway", { failure: true, errorMessage: authError?.message || "No user session" });
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await request.json();
    const { pathwayTitle, steps } = body;

    if (!pathwayTitle || !steps || !Array.isArray(steps)) {
      logger.warn("Invalid start pathway request body", { userId: user.id, payload: body });
      return NextResponse.json({ error: "Missing required fields: pathwayTitle, steps" }, { status: 400 });
    }

    logger.info("Starting learning pathway initialization", {
      userId: user.id,
      payload: { pathwayTitle, stepsCount: steps.length }
    });

    // 1. Fetch existing course for this pathway title (Duplicate Prevention)
    const { data: existingCourse, error: courseFetchError } = await supabaseAdmin
      .from("courses")
      .select("*")
      .eq("title", pathwayTitle)
      .maybeSingle();

    if (courseFetchError) {
      logger.error("Failed to query existing course", { userId: user.id, errorMessage: courseFetchError.message });
      throw new Error(`Database error querying course: ${courseFetchError.message}`);
    }

    let course = existingCourse;

    // 2. Dynamic Course Seeding (Only when it doesn't exist)
    if (!course) {
      logger.info("No existing course found for pathway. Seeding dynamically.", { userId: user.id, payload: { pathwayTitle } });

      // Find any tutor profile or admin profile to act as instructor
      const { data: tutorProfile } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("role", "tutor")
        .limit(1)
        .maybeSingle();

      let tutorId = tutorProfile?.id;
      if (!tutorId) {
        const { data: adminProfile } = await supabaseAdmin
          .from("profiles")
          .select("id")
          .eq("role", "admin")
          .limit(1)
          .maybeSingle();
        tutorId = adminProfile?.id;
      }
      if (!tutorId) {
        tutorId = user.id; // Fallback to current user if no profiles found
      }

      // Insert course record atomically
      const { data: newCourse, error: courseInsertError } = await supabaseAdmin
        .from("courses")
        .insert({
          tutor_id: tutorId,
          title: pathwayTitle,
          subtitle: `Guided learning pathway for ${pathwayTitle}`,
          description: `Master ${pathwayTitle} with this curated curriculum and expert-guided modules.`,
          category: "Pathways",
          level: "Beginner",
          price: 0,
          status: "private",
          approval_status: "internal",
        })
        .select()
        .single();

      if (courseInsertError) {
        logger.error("Failed to insert course for pathway", { userId: user.id, errorMessage: courseInsertError.message });
        throw new Error(`Course creation failed: ${courseInsertError.message}`);
      }

      course = newCourse;

      // Seed lessons for the newly created course
      const lessonsToInsert = steps.map((stepTitle: string, idx: number) => ({
        course_id: course.id,
        title: stepTitle,
        description: `Deep dive study session for ${stepTitle}`,
        video_url: "https://www.w3schools.com/html/mov_bbb.mp4",
        duration: 120, // 2 minutes mock
        lesson_order: idx + 1,
        position: idx + 1,
      }));

      const { error: lessonsInsertError } = await supabaseAdmin
        .from("lessons")
        .insert(lessonsToInsert);

      if (lessonsInsertError) {
        // Rollback course if lessons seeding failed to preserve atomicity
        await supabaseAdmin.from("courses").delete().eq("id", course.id);
        logger.error("Failed to seed lessons, rolled back course", { userId: user.id, errorMessage: lessonsInsertError.message });
        throw new Error(`Lessons initialization failed: ${lessonsInsertError.message}`);
      }

      logger.info("Successfully seeded course and lessons for pathway", { userId: user.id, payload: { courseId: course.id, lessonsCount: steps.length } });
    }

    // 3. Verify enrollment state
    const { data: existingEnrollment, error: enrollmentFetchError } = await supabaseAdmin
      .from("enrollments")
      .select("*")
      .eq("learner_id", user.id)
      .eq("course_id", course.id)
      .maybeSingle();

    if (enrollmentFetchError) {
      logger.error("Failed to query existing enrollment", { userId: user.id, errorMessage: enrollmentFetchError.message });
      throw new Error(`Enrollment check failed: ${enrollmentFetchError.message}`);
    }

    let enrollment = existingEnrollment;
    if (!enrollment) {
      logger.info("Student not enrolled in course. Creating enrollment record.", { userId: user.id, payload: { courseId: course.id } });
      const { data: newEnrollment, error: enrollErr } = await supabaseAdmin
        .from("enrollments")
        .insert({
          learner_id: user.id,
          course_id: course.id,
          progress: 0,
        })
        .select()
        .single();

      if (enrollErr) {
        logger.error("Failed to enroll student in course", { userId: user.id, errorMessage: enrollErr.message });
        throw new Error(`Enrollment failed: ${enrollErr.message}`);
      }
      enrollment = newEnrollment;
    }

    // 4. Save/Verify Roadmap record (Duplicate prevention)
    const { data: existingRoadmap, error: roadmapFetchError } = await supabaseAdmin
      .from("roadmaps")
      .select("*")
      .eq("user_id", user.id)
      .eq("role_title", pathwayTitle)
      .maybeSingle();

    if (roadmapFetchError) {
      logger.error("Failed to fetch roadmap details", { userId: user.id, errorMessage: roadmapFetchError.message });
      throw new Error(`Roadmap check failed: ${roadmapFetchError.message}`);
    }

    if (!existingRoadmap) {
      logger.info("Initializing new career roadmap for student", { userId: user.id, payload: { roleTitle: pathwayTitle } });
      const { error: roadmapErr } = await supabaseAdmin
        .from("roadmaps")
        .insert({
          user_id: user.id,
          role_title: pathwayTitle,
          steps: steps,
        });

      if (roadmapErr) {
        logger.error("Failed to initialize career roadmap", { userId: user.id, errorMessage: roadmapErr.message });
        throw new Error(`Roadmap database insert failed: ${roadmapErr.message}`);
      }
    }

    // 5. Progress Resuming Logic: Identify first incomplete lesson or last completed lesson
    const { data: courseLessons, error: lessonsFetchError } = await supabaseAdmin
      .from("lessons")
      .select("id, position, lesson_order")
      .eq("course_id", course.id);

    if (lessonsFetchError) {
      logger.error("Failed to fetch course lessons", { userId: user.id, errorMessage: lessonsFetchError.message });
      throw new Error(`Lessons query failed: ${lessonsFetchError.message}`);
    }

    const sortedLessons = (courseLessons || []).sort((a, b) => 
      (a.position ?? a.lesson_order ?? 0) - (b.position ?? b.lesson_order ?? 0)
    );

    const { data: completedProgress, error: progressFetchError } = await supabaseAdmin
      .from("learning_progress")
      .select("lesson_id")
      .eq("user_id", user.id)
      .eq("course_id", course.id);

    if (progressFetchError) {
      logger.error("Failed to fetch learning progress", { userId: user.id, errorMessage: progressFetchError.message });
      throw new Error(`Progress query failed: ${progressFetchError.message}`);
    }

    const completedLessonIds = new Set((completedProgress || []).map(p => p.lesson_id));

    // Logic: Find first lesson in sorted order that is NOT completed.
    let resumeLessonId = sortedLessons[0]?.id || null;
    let resumeState = "started"; // started, resuming, completed

    if (completedLessonIds.size > 0 && sortedLessons.length > 0) {
      const firstIncomplete = sortedLessons.find(l => !completedLessonIds.has(l.id));
      if (firstIncomplete) {
        resumeLessonId = firstIncomplete.id;
        resumeState = "resuming";
      } else {
        // If all lessons are completed, resume from the last completed lesson
        resumeLessonId = sortedLessons[sortedLessons.length - 1].id;
        resumeState = "completed";
      }
    }

    const executionTimeMs = Date.now() - startTime;
    logger.info("Successfully initialized start pathway response", {
      userId: user.id,
      executionTimeMs,
      payload: {
        courseId: course.id,
        resumeLessonId,
        resumeState
      }
    });

    return NextResponse.json({
      success: true,
      courseId: course.id,
      lessonId: resumeLessonId,
      resumeState,
    });

  } catch (err: any) {
    const executionTimeMs = Date.now() - startTime;
    logger.error("Failed to start/resume learning pathway", {
      executionTimeMs,
      failure: true,
      errorMessage: err.message,
      stack: err.stack,
    });
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
