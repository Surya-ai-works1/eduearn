// src/lib/repositories/studentProfile/index.ts

import { IS_MOCK } from "../../config";
import { IStudentProfileRepository } from "./IStudentProfileRepository";
import { MockStudentProfileRepository } from "./MockStudentProfileRepository";
import { SupabaseStudentProfileRepository } from "./SupabaseStudentProfileRepository";

export const StudentProfileRepository: IStudentProfileRepository = IS_MOCK
  ? new MockStudentProfileRepository()
  : new SupabaseStudentProfileRepository();
