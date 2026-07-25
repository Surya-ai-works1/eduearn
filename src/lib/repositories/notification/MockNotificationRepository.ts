// src/lib/repositories/notification/MockNotificationRepository.ts

import { INotificationRepository } from "./INotificationRepository";
import { Notification, Activity, NotificationType } from "../../types/notification";

const STORAGE_KEY_NOTIFS = "eduearn_notifications";
const STORAGE_KEY_ACTIVITIES = "eduearn_activities";

const DEFAULT_NOTIFICATIONS: Notification[] = [
  {
    id: "n-1",
    studentId: "student-1",
    title: "Welcome to EduEarn!",
    message: "Your account is active. Explore courses and start learning today.",
    type: "System",
    isRead: false,
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    actionUrl: "/student/dashboard",
  },
  {
    id: "n-2",
    studentId: "student-1",
    title: "Assignment Due Tomorrow",
    message: "Python Fundamentals Assignment #1 submission closes in 24 hours.",
    type: "Assignment",
    isRead: false,
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    actionUrl: "/student/dashboard?tab=assignments",
  },
  {
    id: "n-3",
    studentId: "student-1",
    title: "Quiz Results Available",
    message: "Your AI & Prompt Engineering quiz score is ready to view.",
    type: "Quiz",
    isRead: true,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    actionUrl: "/student/dashboard?tab=quizzes",
  },
  {
    id: "n-4",
    studentId: "student-1",
    title: "Certificate Ready",
    message: "Congratulations! Your Python Programming Masterclass certificate is ready.",
    type: "Certificate",
    isRead: false,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    actionUrl: "/student/dashboard?tab=certificates",
  },
  {
    id: "n-5",
    studentId: "student-1",
    title: "New Course Content",
    message: "Your instructor uploaded new lesson materials for UI/UX Figma Design.",
    type: "Course",
    isRead: true,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const DEFAULT_ACTIVITIES: Activity[] = [
  {
    id: "a-1",
    studentId: "student-1",
    type: "course_enrolled",
    title: "Enrolled in Python Programming Masterclass",
    description: "You joined the Python Programming Masterclass course.",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "a-2",
    studentId: "student-1",
    type: "lesson_completed",
    title: "Completed Lesson: Python Basics",
    description: "You completed the Python Basics lesson in Python Programming Masterclass.",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "a-3",
    studentId: "student-1",
    type: "assignment_submitted",
    title: "Submitted: Python Functions Assignment",
    description: "Your assignment was submitted successfully and is pending review.",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "a-4",
    studentId: "student-1",
    type: "quiz_completed",
    title: "Completed: AI & Prompt Engineering Quiz",
    description: "You scored 85% on the AI & Prompt Engineering quiz.",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "a-5",
    studentId: "student-1",
    type: "certificate_earned",
    title: "Certificate Earned: Python Programming Masterclass",
    description: "Congratulations! You earned a verified certificate for completing this course.",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export class MockNotificationRepository implements INotificationRepository {
  private getNotifs(): Notification[] {
    if (typeof window === "undefined") return DEFAULT_NOTIFICATIONS;
    try {
      const saved = localStorage.getItem(STORAGE_KEY_NOTIFS);
      if (saved) return JSON.parse(saved);
    } catch {}
    localStorage.setItem(STORAGE_KEY_NOTIFS, JSON.stringify(DEFAULT_NOTIFICATIONS));
    return DEFAULT_NOTIFICATIONS;
  }

  private saveNotifs(notifs: Notification[]) {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY_NOTIFS, JSON.stringify(notifs));
  }

  private getActivitiesLocal(): Activity[] {
    if (typeof window === "undefined") return DEFAULT_ACTIVITIES;
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ACTIVITIES);
      if (saved) return JSON.parse(saved);
    } catch {}
    localStorage.setItem(STORAGE_KEY_ACTIVITIES, JSON.stringify(DEFAULT_ACTIVITIES));
    return DEFAULT_ACTIVITIES;
  }

  private saveActivities(activities: Activity[]) {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY_ACTIVITIES, JSON.stringify(activities));
  }

  async getNotifications(studentId: string): Promise<Notification[]> {
    return this.getNotifs().filter((n) => n.studentId === studentId || n.studentId === "student-1");
  }

  async markAsRead(notificationId: string): Promise<void> {
    const notifs = this.getNotifs().map((n) =>
      n.id === notificationId ? { ...n, isRead: true } : n
    );
    this.saveNotifs(notifs);
  }

  async markAllAsRead(studentId: string): Promise<void> {
    const notifs = this.getNotifs().map((n) =>
      (n.studentId === studentId || n.studentId === "student-1") ? { ...n, isRead: true } : n
    );
    this.saveNotifs(notifs);
  }

  async deleteNotification(notificationId: string): Promise<void> {
    const notifs = this.getNotifs().filter((n) => n.id !== notificationId);
    this.saveNotifs(notifs);
  }

  async getActivities(studentId: string): Promise<Activity[]> {
    const all = this.getActivitiesLocal();
    return all
      .filter((a) => a.studentId === studentId || a.studentId === "student-1")
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async addActivity(activity: Omit<Activity, "id">): Promise<Activity> {
    const newActivity: Activity = {
      ...activity,
      id: `a-${Date.now()}`,
    };
    const all = this.getActivitiesLocal();
    all.unshift(newActivity);
    this.saveActivities(all);
    return newActivity;
  }
}
