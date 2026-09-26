// src/lib/repositories/studentDashboard/SupabaseStudentDashboardRepository.ts

import { createClient } from '@/lib/supabase';
import { lmsDb } from '@/lib/lmsDb';

/**
 * Supabase implementation of the Student Dashboard repository.
 * Retrieves real data from the database and shapes it to match the dashboard payload.
 */
export class SupabaseStudentDashboardRepository {
  async getDashboard(userId: string) {
    const supabase = createClient();
    if (!supabase) {
      throw new Error("Supabase credentials required for SupabaseStudentDashboardRepository.");
    }

    // 1️⃣ Enrolled courses – via lmsDb abstraction.
    const enrolledRaw = await lmsDb.getEnrolledCourses(userId);
    const enrolledCourses = enrolledRaw.map((c: any) => ({
      id: c.id,
      title: c.title,
      tutorName: "Tutor Instructor",
      thumbnail: c.thumbnail || "/images/courses/coding.png",
      progress: c.progress || 0,
      lessonsCount: c.lessons?.length || 0,
      completedLessons: Math.round(((c.progress || 0) / 100) * (c.lessons?.length || 0)),
      duration: "8 hours",
      estimatedCompletion: c.progress === 100 ? "Completed" : "In Progress",
      category: c.category,
      lastStudied: "Recently",
    }));

    // 2️⃣ Wishlist – user specific.
    const { data: wishlistRaw } = await supabase
      .from('wishlist')
      .select('*, courses(*)')
      .eq('user_id', userId);
    const wishlist = (wishlistRaw ?? []).map((w: any) => ({
      id: w.courses.id,
      title: w.courses.title,
      tutorId: w.courses.tutor_id,
      tutorName: "Tutor Instructor",
      category: w.courses.category,
      categoryId: w.courses.category?.toLowerCase().replace(/\s+/g, '-') ?? "",
      subjectId: w.courses.category?.toLowerCase().replace(/\s+/g, '-') ?? "",
      subjectName: w.courses.category,
      price: Number(w.courses.price),
      rating: 4.8,
      duration: "10 hours",
      lessonsCount: 10,
      studentsCount: 150,
      thumbnail: w.courses.thumbnail || "",
      level: w.courses.level || "Beginner",
      language: "English",
      createdAt: w.courses.created_at,
      description: w.courses.description || w.courses.subtitle || "",
      status: w.courses.status || "published",
    }));

    // 3️⃣ Notifications.
    const { data: notificationsRaw } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    const notifications = (notificationsRaw ?? []).map((n: any) => ({
      id: n.id,
      title: n.title,
      text: n.content,
      time: new Date(n.created_at).toLocaleDateString(),
      read: n.is_read,
      type: n.type || "System",
    }));

    // 4️⃣ Certificates – derived from enrollments with a certificate URL.
    const { data: certEnrollments } = await supabase
      .from('enrollments')
      .select('*, courses(*)')
      .eq('learner_id', userId)
      .not('certificate_url', 'is', null);
    const certificates = (certEnrollments ?? []).map((e: any) => ({
      id: e.id,
      courseTitle: e.courses.title,
      serialNumber: `EE-CERT-${e.id.substring(0, 8).toUpperCase()}`,
      issueDate: new Date(e.created_at).toLocaleDateString(),
      qrCode: `EE-QR-${e.id.substring(0, 8).toUpperCase()}`,
      courseImage: e.courses.thumbnail || "/images/courses/arts.png",
      tutorName: "Tutor Instructor",
      blockchainHash: `0x${e.id.replace(/-/g, "").substring(0, 16)}`,
    }));

    // 5️⃣ Assignments – Authoritative student submissions query via student_id (protects IDOR boundary)
    const { data: submissionsRaw } = await supabase
      .from('assignment_submissions')
      .select('*, assignments(*, courses(title))')
      .eq('student_id', userId);

    const assignments = (submissionsRaw ?? []).map((s: any) => ({
      id: s.id,
      assignmentId: s.assignment_id,
      courseTitle: s.assignments?.courses?.title || s.assignments?.course_title || "Enrolled Course",
      title: s.assignments?.title || "Course Assignment",
      dueDate: s.assignments?.due_date || "N/A",
      status: s.status || "Submitted",
      grade: s.grade,
      feedback: s.feedback,
      prompt: s.assignments?.description || "",
    }));

    // 6️⃣ Weekly quizzes – Platform Practice Challenge Quizzes
    const weeklyQuizzes = [
      {
        id: "wq-math",
        title: "Derivatives & Calculus Challenge",
        subject: "Mathematics",
        difficulty: "Intermediate",
        questionsCount: 3,
        timeLimit: "3 mins",
        rewardCoins: 50,
        isPlatformChallenge: true,
        questions: [],
      },
      {
        id: "wq-python",
        title: "Python Control Flow & Loops",
        subject: "Python Programming",
        difficulty: "Beginner",
        questionsCount: 3,
        timeLimit: "2 mins",
        rewardCoins: 40,
        isPlatformChallenge: true,
        questions: [],
      },
      {
        id: "wq-ai",
        title: "AI & Prompt Engineering Basics",
        subject: "AI Prompt Engineering",
        difficulty: "Advanced",
        questionsCount: 3,
        timeLimit: "3 mins",
        rewardCoins: 60,
        isPlatformChallenge: true,
        questions: [],
      },
      {
        id: "wq-photo",
        title: "Camera Exposure & Composition",
        subject: "Photography",
        difficulty: "Intermediate",
        questionsCount: 3,
        timeLimit: "3 mins",
        rewardCoins: 50,
        isPlatformChallenge: true,
        questions: [],
      },
    ];

    return {
      enrolledCourses,
      wishlist,
      notifications,
      certificates,
      assignments,
      weeklyQuizzes,
    };
  }
}
