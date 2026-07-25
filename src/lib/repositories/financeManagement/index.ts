// src/lib/repositories/financeManagement/index.ts

import { IS_MOCK } from "../../config";
import { IFinanceManagementRepository } from "./IFinanceManagementRepository";
import { MockFinanceManagementRepository } from "./MockFinanceManagementRepository";
import { SupabaseFinanceManagementRepository } from "./SupabaseFinanceManagementRepository";

export const FinanceManagementRepository: IFinanceManagementRepository = IS_MOCK
  ? new MockFinanceManagementRepository()
  : new SupabaseFinanceManagementRepository();
