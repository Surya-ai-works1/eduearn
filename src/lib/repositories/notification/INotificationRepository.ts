// src/lib/repositories/notification/INotificationRepository.ts

import { Notification, Activity } from "../../types/notification";

export interface INotificationRepository {
  getNotifications(studentId: string): Promise<Notification[]>;
  markAsRead(notificationId: string): Promise<void>;
  markAllAsRead(studentId: string): Promise<void>;
  deleteNotification(notificationId: string): Promise<void>;
  getActivities(studentId: string): Promise<Activity[]>;
  addActivity(activity: Omit<Activity, "id">): Promise<Activity>;
}
