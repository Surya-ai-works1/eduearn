// src/lib/repositories/notification/SupabaseNotificationRepository.ts

import { INotificationRepository } from "./INotificationRepository";
import { Notification, Activity, NotificationType } from "../../types/notification";
import { createClient } from "../../supabase";

export class SupabaseNotificationRepository implements INotificationRepository {
  private mapDbNotification(row: any): Notification {
    return {
      id: row.id,
      studentId: row.user_id,
      title: row.title,
      message: row.content || "",
      type: (row.type as NotificationType) || "System",
      isRead: row.is_read ?? false,
      createdAt: row.created_at,
      actionUrl: row.action_url || undefined,
    };
  }

  private mapDbActivity(row: any): Activity {
    return {
      id: row.id,
      studentId: row.user_id || row.learner_id || "",
      type: row.type || "lesson_completed",
      title: row.title || "",
      description: row.description || "",
      createdAt: row.created_at,
    };
  }

  async getNotifications(studentId: string): Promise<Notification[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", studentId)
      .order("created_at", { ascending: false });

    if (error || !data) return [];
    return data.map((row: any) => this.mapDbNotification(row));
  }

  async markAsRead(notificationId: string): Promise<void> {
    const supabase = createClient();
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notificationId);
  }

  async markAllAsRead(studentId: string): Promise<void> {
    const supabase = createClient();
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", studentId);
  }

  async deleteNotification(notificationId: string): Promise<void> {
    const supabase = createClient();
    await supabase
      .from("notifications")
      .delete()
      .eq("id", notificationId);
  }

  async getActivities(studentId: string): Promise<Activity[]> {
    const supabase = createClient();

    // Derive activity from enrollments and completed lessons
    const { data: enrollments } = await supabase
      .from("enrollments")
      .select("*, courses(title)")
      .eq("learner_id", studentId)
      .order("created_at", { ascending: false })
      .limit(20);

    const activities: Activity[] = [];

    if (enrollments) {
      for (const enr of enrollments) {
        activities.push({
          id: `enr-${enr.id}`,
          studentId,
          type: "course_enrolled",
          title: `Enrolled in ${enr.courses?.title || "a course"}`,
          description: `You joined ${enr.courses?.title || "a course"}.`,
          createdAt: enr.created_at,
        });

        if (Number(enr.progress || 0) === 100) {
          activities.push({
            id: `cert-${enr.id}`,
            studentId,
            type: "certificate_earned",
            title: `Completed: ${enr.courses?.title || "Course"}`,
            description: `You completed all content in ${enr.courses?.title || "this course"}.`,
            createdAt: enr.updated_at || enr.created_at,
          });
        }
      }
    }

    return activities.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async addActivity(activity: Omit<Activity, "id">): Promise<Activity> {
    // Activities are derived dynamically in Supabase mode; return a transient record
    return {
      ...activity,
      id: `activity-${Date.now()}`,
    };
  }

  async createNotification(userId: string, title: string, content: string, type: string = "general"): Promise<void> {
    const supabase = createClient();
    await supabase
      .from("notifications")
      .insert({
        user_id: userId,
        title,
        content,
        type,
        is_read: false,
      });
  }
}
