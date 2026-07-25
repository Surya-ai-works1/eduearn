// src/lib/repositories/tutorDashboard/ITutorDashboardRepository.ts

import { TutorDashboardData } from "../../types/tutorDashboard";

export interface ITutorDashboardRepository {
  getDashboardData(tutorId: string): Promise<TutorDashboardData>;
}
