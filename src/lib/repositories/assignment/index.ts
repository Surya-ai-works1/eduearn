// src/lib/repositories/assignment/index.ts

import { IS_MOCK } from "../../config";
import { IAssignmentRepository } from "./IAssignmentRepository";
import { MockAssignmentRepository } from "./MockAssignmentRepository";
import { SupabaseAssignmentRepository } from "./SupabaseAssignmentRepository";

export const AssignmentRepository: IAssignmentRepository = IS_MOCK
  ? new MockAssignmentRepository()
  : new SupabaseAssignmentRepository();
