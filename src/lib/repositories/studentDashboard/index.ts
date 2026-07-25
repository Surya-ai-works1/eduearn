// src/lib/repositories/studentDashboard/index.ts

import { IS_MOCK } from '@/lib/config';
import { MockStudentDashboardRepository } from './MockStudentDashboardRepository';
import { SupabaseStudentDashboardRepository } from './SupabaseStudentDashboardRepository';

/**
 * Export a single repository instance that selects the appropriate implementation
 * based on the global IS_MOCK flag.
 */
export const StudentDashboardRepository = IS_MOCK
  ? new MockStudentDashboardRepository()
  : new SupabaseStudentDashboardRepository();
