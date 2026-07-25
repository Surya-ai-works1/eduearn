// src/lib/services/studentDashboardService.ts

import { StudentDashboardRepository } from '@/lib/repositories/studentDashboard';

/**
 * Business‑logic service that fetches the student dashboard payload.
 * It simply forwards the call to the repository selected by IS_MOCK.
 */
export async function getStudentDashboard(userId: string) {
  // Repository implementations return a Promise with the payload shape.
  return await StudentDashboardRepository.getDashboard(userId);
}
