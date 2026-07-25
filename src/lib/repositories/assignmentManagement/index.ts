// src/lib/repositories/assignmentManagement/index.ts

import { IS_MOCK } from "../../config";
import { IAssignmentManagementRepository } from "./IAssignmentManagementRepository";
import { MockAssignmentManagementRepository } from "./MockAssignmentManagementRepository";
import { SupabaseAssignmentManagementRepository } from "./SupabaseAssignmentManagementRepository";

export const AssignmentManagementRepository: IAssignmentManagementRepository = IS_MOCK
  ? new MockAssignmentManagementRepository()
  : new SupabaseAssignmentManagementRepository();
