// src/lib/repositories/quizManagement/index.ts

import { IS_MOCK } from "../../config";
import { IQuizManagementRepository } from "./IQuizManagementRepository";
import { MockQuizManagementRepository } from "./MockQuizManagementRepository";
import { SupabaseQuizManagementRepository } from "./SupabaseQuizManagementRepository";

export const QuizManagementRepository: IQuizManagementRepository = IS_MOCK
  ? new MockQuizManagementRepository()
  : new SupabaseQuizManagementRepository();
