// src/lib/repositories/lessonManagement/index.ts

import { IS_MOCK } from "../../config";
import { ILessonManagementRepository } from "./ILessonManagementRepository";
import { MockLessonManagementRepository } from "./MockLessonManagementRepository";
import { SupabaseLessonManagementRepository } from "./SupabaseLessonManagementRepository";

export const LessonManagementRepository: ILessonManagementRepository = IS_MOCK
  ? new MockLessonManagementRepository()
  : new SupabaseLessonManagementRepository();
