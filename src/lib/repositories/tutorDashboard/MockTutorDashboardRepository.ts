// src/lib/repositories/tutorDashboard/MockTutorDashboardRepository.ts

import { ITutorDashboardRepository } from "./ITutorDashboardRepository";
import { TutorDashboardData } from "../../types/tutorDashboard";

export class MockTutorDashboardRepository implements ITutorDashboardRepository {
  async getDashboardData(tutorId: string): Promise<TutorDashboardData> {
    // Return realistic simulated tutor metrics
    return {
      statistics: {
        totalCourses: 3,
        publishedCourses: 2,
        draftCourses: 1,
        totalStudents: 2,
        activeStudents: 1,
        totalRevenue: 2498,
        monthlyRevenue: 2498,
        pendingAssignments: 1,
        pendingQuizEvaluations: 0,
        pendingReviews: 1,
      },
      recentEnrollments: [
        {
          id: "enr-mock-1",
          studentName: "Rahul Verma",
          courseName: "Introduction to Calculus & Geometry Applications",
          enrolledAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "enr-mock-2",
          studentName: "Sneha Roy",
          courseName: "UI/UX Figma Design: Layouts & Grids Essentials",
          enrolledAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        },
      ],
      recentActivities: [
        {
          id: "act-mock-1",
          type: "submission",
          title: "Rahul Verma submitted derivatives-worksheet.pdf for Introduction to Calculus & Geometry Applications",
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "act-mock-2",
          type: "enrollment",
          title: "Rahul Verma enrolled in Introduction to Calculus & Geometry Applications",
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "act-mock-3",
          type: "review",
          title: "Rahul Verma added a 5★ review to Introduction to Calculus & Geometry Applications",
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "act-mock-4",
          type: "enrollment",
          title: "Sneha Roy enrolled in UI/UX Figma Design: Layouts & Grids Essentials",
          createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        },
      ],
    };
  }
}
