// src/lib/repositories/admin/index.ts

import { IS_MOCK } from "../../config";
import { IAdminRepository } from "./IAdminRepository";
import { MockAdminRepository } from "./MockAdminRepository";
import { SupabaseAdminRepository } from "./SupabaseAdminRepository";

export const AdminRepository: IAdminRepository = IS_MOCK
  ? new MockAdminRepository()
  : new SupabaseAdminRepository();
export type { IAdminRepository };
