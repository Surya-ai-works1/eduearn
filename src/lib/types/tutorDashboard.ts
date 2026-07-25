// src/lib/types/tutorDashboard.ts

export interface TutorDashboardStatistics {
  totalCourses: number;
  publishedCourses: number;
  draftCourses: number;
  totalStudents: number;
  activeStudents: number;
  totalRevenue: number;
  monthlyRevenue: number;
  pendingAssignments: number;
  pendingQuizEvaluations: number;
  pendingReviews: number;
}

export interface RecentEnrollment {
  id: string;
  studentName: string;
  courseName: string;
  enrolledAt: string; // ISO String
}

export interface RecentActivity {
  id: string;
  type: string; // e.g. "enrollment", "submission", "review"
  title: string;
  createdAt: string; // ISO String
}

export interface TutorDashboardData {
  statistics: TutorDashboardStatistics;
  recentEnrollments: RecentEnrollment[];
  recentActivities: RecentActivity[];
}
