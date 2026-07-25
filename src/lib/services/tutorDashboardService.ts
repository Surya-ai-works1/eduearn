// src/lib/services/tutorDashboardService.ts

import { TutorDashboardRepository } from "../repositories/tutorDashboard";
import { TutorDashboardData } from "../types/tutorDashboard";

export class TutorDashboardService {
  async getDashboardData(tutorId: string): Promise<TutorDashboardData> {
    return TutorDashboardRepository.getDashboardData(tutorId);
  }
}

export const tutorDashboardService = new TutorDashboardService();
