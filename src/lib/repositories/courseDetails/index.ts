// src/lib/repositories/courseDetails/index.ts

import { IS_MOCK } from '@/lib/config';
import { MockCourseDetailsRepository } from './MockCourseDetailsRepository';
import { SupabaseCourseDetailsRepository } from './SupabaseCourseDetailsRepository';

/**
 * Export a singleton repository instance based on the global IS_MOCK flag.
 */
export const CourseDetailsRepository = IS_MOCK
  ? new MockCourseDetailsRepository()
  : new SupabaseCourseDetailsRepository();
