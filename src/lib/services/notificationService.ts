// src/lib/services/notificationService.ts

import { NotificationRepository } from "../repositories/notification";
import { Notification, Activity } from "../types/notification";

export class NotificationService {
  async getNotifications(studentId: string): Promise<Notification[]> {
    return NotificationRepository.getNotifications(studentId);
  }

  async markAsRead(notificationId: string): Promise<void> {
    return NotificationRepository.markAsRead(notificationId);
  }

  async markAllAsRead(studentId: string): Promise<void> {
    return NotificationRepository.markAllAsRead(studentId);
  }

  async deleteNotification(notificationId: string): Promise<void> {
    return NotificationRepository.deleteNotification(notificationId);
  }

  async getActivities(studentId: string): Promise<Activity[]> {
    return NotificationRepository.getActivities(studentId);
  }

  async addActivity(activity: Omit<Activity, "id">): Promise<Activity> {
    return NotificationRepository.addActivity(activity);
  }

  getUnreadCount(notifications: Notification[]): number {
    return notifications.filter((n) => !n.isRead).length;
  }
}

export const notificationService = new NotificationService();
