// src/lib/repositories/courseManagement/index.ts

import { IS_MOCK } from "../../config";
import { ICourseManagementRepository } from "./ICourseManagementRepository";
import { MockCourseManagementRepository } from "./MockCourseManagementRepository";
import { SupabaseCourseManagementRepository } from "./SupabaseCourseManagementRepository";

export const CourseManagementRepository: ICourseManagementRepository = IS_MOCK
  ? new MockCourseManagementRepository()
  : new SupabaseCourseManagementRepository();
