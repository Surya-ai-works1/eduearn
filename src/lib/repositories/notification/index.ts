// src/lib/repositories/notification/index.ts

import { IS_MOCK } from "../../config";
import { INotificationRepository } from "./INotificationRepository";
import { MockNotificationRepository } from "./MockNotificationRepository";
import { SupabaseNotificationRepository } from "./SupabaseNotificationRepository";

export const NotificationRepository: INotificationRepository = IS_MOCK
  ? new MockNotificationRepository()
  : new SupabaseNotificationRepository();
