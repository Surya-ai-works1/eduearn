// src/lib/repositories/quiz/index.ts

import { IS_MOCK } from "../../config";
import { IQuizRepository } from "./IQuizRepository";
import { MockQuizRepository } from "./MockQuizRepository";
import { SupabaseQuizRepository } from "./SupabaseQuizRepository";

export const QuizRepository: IQuizRepository = IS_MOCK
  ? new MockQuizRepository()
  : new SupabaseQuizRepository();
