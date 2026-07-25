// src/lib/repositories/tutorDashboard/index.ts

import { IS_MOCK } from "../../config";
import { ITutorDashboardRepository } from "./ITutorDashboardRepository";
import { MockTutorDashboardRepository } from "./MockTutorDashboardRepository";
import { SupabaseTutorDashboardRepository } from "./SupabaseTutorDashboardRepository";

export const TutorDashboardRepository: ITutorDashboardRepository = IS_MOCK
  ? new MockTutorDashboardRepository()
  : new SupabaseTutorDashboardRepository();
