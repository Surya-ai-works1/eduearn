// src/lib/repositories/tutorDashboard/SupabaseTutorDashboardRepository.ts

import { ITutorDashboardRepository } from "./ITutorDashboardRepository";
import { TutorDashboardData, RecentEnrollment, RecentActivity } from "../../types/tutorDashboard";
import { createClient } from "../../supabase";

export class SupabaseTutorDashboardRepository implements ITutorDashboardRepository {
  async getDashboardData(tutorId: string): Promise<TutorDashboardData> {
    const supabase = createClient();

    // 1. Fetch tutor courses
    const { data: courses, error: coursesErr } = await supabase
      .from("courses")
      .select("id, status, title")
      .eq("tutor_id", tutorId);

    if (coursesErr || !courses || courses.length === 0) {
      return {
        statistics: {
          totalCourses: 0,
          publishedCourses: 0,
          draftCourses: 0,
          totalStudents: 0,
          activeStudents: 0,
          totalRevenue: 0,
          monthlyRevenue: 0,
          pendingAssignments: 0,
          pendingQuizEvaluations: 0,
          pendingReviews: 0,
        },
        recentEnrollments: [],
        recentActivities: [],
      };
    }

    const courseIds = courses.map((c: any) => c.id);

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // 2. Fetch all dependent metrics in parallel to improve load performance
    const [
      enrollmentsRes,
      earningsRes,
      paymentsRes,
      assignmentsRes,
      reviewsRes
    ] = await Promise.all([
      supabase
        .from("enrollments")
        .select("*, profiles:learner_id(full_name), courses(title)")
        .in("course_id", courseIds)
        .order("created_at", { ascending: false }),
      supabase
        .from("tutor_earnings")
        .select("total_earnings")
        .eq("tutor_id", tutorId)
        .maybeSingle(),
      supabase
        .from("payments")
        .select("amount")
        .in("course_id", courseIds)
        .eq("status", "success")
        .gte("created_at", startOfMonth.toISOString()),
      supabase
        .from("assignments")
        .select("id")
        .in("course_id", courseIds),
      supabase
        .from("reviews")
        .select("id, rating, comment, created_at, profiles:user_id(full_name), courses(title)")
        .in("course_id", courseIds)
        .order("created_at", { ascending: false })
    ]);

    if (enrollmentsRes.error) console.error("TutorDashboard fetchEnrollments error:", enrollmentsRes.error);
    if (earningsRes.error) console.error("TutorDashboard fetchEarnings error:", earningsRes.error);
    if (paymentsRes.error) console.error("TutorDashboard fetchPayments error:", paymentsRes.error);
    if (assignmentsRes.error) console.error("TutorDashboard fetchAssignments error:", assignmentsRes.error);
    if (reviewsRes.error) console.error("TutorDashboard fetchReviews error:", reviewsRes.error);

    const enrollments = enrollmentsRes.data || [];
    const earnings = earningsRes.data;
    const payments = paymentsRes.data || [];
    const assignments = assignmentsRes.data || [];
    const reviews = reviewsRes.data || [];

    const totalStudents = enrollments.length;
    const activeStudents = enrollments.filter((e: any) => Number(e.progress || 0) > 0).length;

    const recentEnrollments: RecentEnrollment[] = enrollments.slice(0, 10).map((e: any) => ({
      id: e.id,
      studentName: e.profiles?.full_name || "Enrolled Student",
      courseName: e.courses?.title || "Course Module",
      enrolledAt: e.created_at,
    }));

    // 3. Process Revenue
    const totalRevenue = earnings ? Number(earnings.total_earnings) : 0;
    const monthlyRevenue = payments.reduce((sum: number, p: any) => sum + Number(p.amount), 0) * 0.70;

    // 4. Fetch Pending Assignments and Recent Submissions in parallel
    let pendingAssignments = 0;
    let submissions: any[] = [];
    const assignmentIds: string[] = assignments.map((a: any) => a.id);

    if (assignmentIds.length > 0) {
      const [submissionsCountRes, submissionsListRes] = await Promise.all([
        supabase
          .from("assignment_submissions")
          .select("id", { count: "exact", head: true })
          .in("assignment_id", assignmentIds)
          .is("grade", null),
        supabase
          .from("assignment_submissions")
          .select("id, created_at, student_id, profiles:student_id(full_name), assignments(title, courses(title))")
          .in("assignment_id", assignmentIds)
          .order("created_at", { ascending: false })
          .limit(5)
      ]);

      if (submissionsCountRes.error) console.error("TutorDashboard submissionsCount error:", submissionsCountRes.error);
      if (submissionsListRes.error) console.error("TutorDashboard submissionsList error:", submissionsListRes.error);

      pendingAssignments = submissionsCountRes.count || 0;
      submissions = submissionsListRes.data || [];
    }

    const pendingReviews = reviews.length;

    // 5. Build Recent Activities Timeline Dynamically
    const recentActivities: RecentActivity[] = [];

    // Add recent enrollments to activities
    enrollments.slice(0, 5).forEach((e: any) => {
      recentActivities.push({
        id: `act-enr-${e.id}`,
        type: "enrollment",
        title: `${e.profiles?.full_name || "A student"} enrolled in ${e.courses?.title || "your course"}`,
        createdAt: e.created_at,
      });
    });

    // Add recent reviews to activities
    reviews.slice(0, 5).forEach((r: any) => {
      recentActivities.push({
        id: `act-rev-${r.id}`,
        type: "review",
        title: `${r.profiles?.full_name || "A student"} added a ${r.rating}★ review to ${r.courses?.title || "your course"}`,
        createdAt: r.created_at,
      });
    });

    // Add recent assignment submissions to activities
    submissions.forEach((s: any) => {
      recentActivities.push({
        id: `act-sub-${s.id}`,
        type: "submission",
        title: `${s.profiles?.full_name || "A student"} submitted assignment for ${s.assignments?.courses?.title || "your course"}`,
        createdAt: s.created_at,
      });
    });

    // Sort all activities by date descending and limit to top 10
    recentActivities.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const finalActivities = recentActivities.slice(0, 10);

    return {
      statistics: {
        totalCourses: courses.length,
        publishedCourses: courses.filter((c: any) => c.status === "published").length,
        draftCourses: courses.filter((c: any) => c.status === "draft").length,
        totalStudents,
        activeStudents,
        totalRevenue,
        monthlyRevenue,
        pendingAssignments,
        pendingQuizEvaluations: 0,
        pendingReviews,
      },
      recentEnrollments,
      recentActivities: finalActivities,
    };
  }
}
