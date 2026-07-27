// src/lib/services/adminService.ts

import { AdminRepository } from "../repositories/admin";
import {
  AdminDashboardStats,
  AdminUser,
  AdminCourse,
  TutorVerificationApp,
  AdminCategory,
  AdminPayout,
  AdminTransaction,
  AdminReport,
  SupportTicket,
  AdminAnnouncement,
  PlatformSettings,
  PermissionMatrixRow
} from "../types/admin";

export class AdminService {
  // Stats
  async getDashboardStats(): Promise<AdminDashboardStats> {
    return AdminRepository.getDashboardStats();
  }

  // Users
  async getUsers(search?: string, role?: string, status?: string): Promise<AdminUser[]> {
    return AdminRepository.getUsers(search, role, status);
  }

  async updateUserStatus(adminName: string, userId: string, status: "Active" | "Suspended"): Promise<AdminUser> {
    const user = await AdminRepository.updateUserStatus(userId, status);
    // Audit Logging
    await AdminRepository.logAuditAction(
      adminName,
      status === "Suspended" ? "User Account Suspended" : "User Account Activated",
      `Target: ${user.name} (${user.email})`
    );
    return user;
  }

  async deleteUser(adminName: string, userId: string): Promise<boolean> {
    const users = await AdminRepository.getUsers();
    const targetUser = users.find(u => u.id === userId);
    const success = await AdminRepository.deleteUser(userId);
    if (success && targetUser) {
      await AdminRepository.logAuditAction(
        adminName,
        "User Account Deleted",
        `Target: ${targetUser.name} (${targetUser.email})`
      );
    }
    return success;
  }

  // Courses
  async getCourses(search?: string, category?: string, status?: string): Promise<AdminCourse[]> {
    return AdminRepository.getCourses(search, category, status);
  }

  async updateCourseStatus(adminName: string, courseId: string, status: AdminCourse["status"]): Promise<AdminCourse> {
    const course = await AdminRepository.updateCourseStatus(courseId, status);
    
    // Audit Logging
    await AdminRepository.logAuditAction(
      adminName,
      `Course Approval Status Updated: ${status}`,
      `Title: "${course.title}", Tutor ID: ${course.tutorId}`
    );

    // Dynamic notification trigger
    try {
      const { notificationService } = await import("./notificationService");
      await notificationService.addActivity({
        studentId: course.tutorId,
        title: `Course Moderation: ${status}`,
        description: `Your course "${course.title}" status was changed to ${status} by admin operations.`,
        type: "course_enrolled",
        createdAt: new Date().toISOString()
      });
    } catch (err) {
      console.warn("Failed to trigger tutor course status notification:", err);
    }

    return course;
  }

  async updateCourseFeature(adminName: string, courseId: string, featured: boolean): Promise<AdminCourse> {
    const course = await AdminRepository.updateCourseFeature(courseId, featured);
    await AdminRepository.logAuditAction(
      adminName,
      featured ? "Course set as Featured" : "Course removed from Featured",
      `Title: "${course.title}"`
    );
    return course;
  }

  async assignCourseCategory(adminName: string, courseId: string, category: string): Promise<AdminCourse> {
    const course = await AdminRepository.assignCourseCategory(courseId, category);
    await AdminRepository.logAuditAction(
      adminName,
      "Course Category Reassigned",
      `Title: "${course.title}", Category: ${category}`
    );
    return course;
  }

  // Verifications
  async getVerifications(): Promise<TutorVerificationApp[]> {
    return AdminRepository.getVerifications();
  }

  async updateVerificationStatus(adminName: string, verificationId: string, status: TutorVerificationApp["status"], updates?: Partial<TutorVerificationApp>): Promise<TutorVerificationApp> {
    const verification = await AdminRepository.updateVerificationStatus(verificationId, status, updates);
    
    // Audit Logging
    await AdminRepository.logAuditAction(
      adminName,
      `Tutor Verification Request ${status}`,
      `Applicant: ${verification.tutorName}${updates?.adminNotes ? `. Notes: ${updates.adminNotes}` : ""}`
    );

    // Notify applicant tutor
    try {
      const { notificationService } = await import("./notificationService");
      await notificationService.addActivity({
        studentId: verification.tutorId,
        title: `Verification Application: ${status}`,
        description: status === "Approved" 
          ? "Congratulations! Your tutor application was approved. You can now access the Tutor Studio dashboard."
          : status === "Rejected"
            ? `Your application has been rejected. Reason: ${updates?.rejectionReason || "Credentials review failed."}`
            : `Your application status was changed to: ${status}.`,
        type: "certificate_earned",
        createdAt: new Date().toISOString()
      });
    } catch (err) {
      console.warn("Failed to trigger tutor verification status notification:", err);
    }

    return verification;
  }

  // Categories
  async getCategories(): Promise<AdminCategory[]> {
    return AdminRepository.getCategories();
  }

  async createCategory(adminName: string, name: string, description?: string): Promise<AdminCategory> {
    const cat = await AdminRepository.createCategory(name, description);
    await AdminRepository.logAuditAction(
      adminName,
      "New Course Category Created",
      `Category: "${name}"`
    );
    return cat;
  }

  async updateCategory(adminName: string, categoryId: string, updates: Partial<AdminCategory>): Promise<AdminCategory> {
    const cat = await AdminRepository.updateCategory(categoryId, updates);
    await AdminRepository.logAuditAction(
      adminName,
      "Course Category Updated",
      `Category ID: ${categoryId}, Changed Keys: ${Object.keys(updates).join(", ")}`
    );
    return cat;
  }

  async deleteCategory(adminName: string, categoryId: string): Promise<boolean> {
    const categories = await AdminRepository.getCategories();
    const target = categories.find(c => c.id === categoryId);
    const success = await AdminRepository.deleteCategory(categoryId);
    if (success && target) {
      await AdminRepository.logAuditAction(
        adminName,
        "Course Category Deleted",
        `Category: "${target.name}"`
      );
    }
    return success;
  }

  // Finance
  async getPayouts(): Promise<AdminPayout[]> {
    return AdminRepository.getPayouts();
  }

  async getTransactions(): Promise<AdminTransaction[]> {
    return AdminRepository.getTransactions();
  }

  async updateWithdrawalStatus(adminName: string, payoutId: string, status: AdminPayout["status"]): Promise<AdminPayout> {
    const payout = await AdminRepository.updateWithdrawalStatus(payoutId, status);
    
    // Audit Logging
    await AdminRepository.logAuditAction(
      adminName,
      `Tutor Payout Request Updated: ${status}`,
      `Recipient: ${payout.tutorName}, Amount: ₹${payout.amount}`
    );

    // Notify Tutor
    try {
      const { notificationService } = await import("./notificationService");
      await notificationService.addActivity({
        studentId: payout.tutorId,
        title: `Withdrawal Request: ${status}`,
        description: `Your withdrawal request of ₹${payout.amount} has been marked as ${status} by admin finance operations.`,
        type: "course_enrolled",
        createdAt: new Date().toISOString()
      });
    } catch (err) {
      console.warn("Failed to trigger tutor payout status notification:", err);
    }

    return payout;
  }

  // Reports & Moderation
  async getReports(): Promise<AdminReport[]> {
    return AdminRepository.getReports();
  }

  async resolveReport(adminName: string, reportId: string, status: AdminReport["status"]): Promise<AdminReport> {
    const report = await AdminRepository.resolveReport(reportId, status);
    await AdminRepository.logAuditAction(
      adminName,
      `Moderation Report Resolved: ${status}`,
      `Report ID: ${reportId}, Reason: ${report.reason}`
    );
    return report;
  }

  async deleteReview(adminName: string, reviewId: string): Promise<boolean> {
    const success = await AdminRepository.deleteReview(reviewId);
    if (success) {
      await AdminRepository.logAuditAction(
        adminName,
        "Flagged Review Deleted",
        `Review ID: ${reviewId}`
      );
    }
    return success;
  }

  // Support Tickets
  async getTickets(): Promise<SupportTicket[]> {
    return AdminRepository.getTickets();
  }

  async replyTicket(adminName: string, ticketId: string, replyText: string): Promise<SupportTicket> {
    const ticket = await AdminRepository.replyTicket(ticketId, adminName, replyText);
    await AdminRepository.logAuditAction(
      adminName,
      "Support Ticket Replied",
      `Ticket ID: ${ticketId}, Response content preview: "${replyText.substring(0, 30)}..."`
    );
    return ticket;
  }

  async resolveTicket(adminName: string, ticketId: string): Promise<SupportTicket> {
    const ticket = await AdminRepository.resolveTicket(ticketId);
    await AdminRepository.logAuditAction(
      adminName,
      "Support Ticket Resolved",
      `Ticket ID: ${ticketId}, Title: "${ticket.title}"`
    );
    return ticket;
  }

  // Announcements
  async getAnnouncements(): Promise<AdminAnnouncement[]> {
    return AdminRepository.getAnnouncements();
  }

  async createAnnouncement(adminName: string, title: string, content: string, targetAudience: AdminAnnouncement["targetAudience"], scheduleDate?: string): Promise<AdminAnnouncement> {
    const status = scheduleDate ? "Scheduled" : "Published";
    const ann = await AdminRepository.createAnnouncement({
      title,
      content,
      targetAudience,
      scheduleDate,
      status
    });

    await AdminRepository.logAuditAction(
      adminName,
      `Broadcast Announcement Dispatched: ${status}`,
      `Title: "${title}", Target: ${targetAudience}`
    );

    // If published immediately, push system activity notification campaign
    if (status === "Published") {
      try {
        const { getUsers } = AdminRepository;
        const users = await getUsers();
        const targets = users.filter((u) => {
          if (targetAudience === "all") return true;
          if (targetAudience === "students") return u.role === "learner";
          if (targetAudience === "tutors") return u.role === "tutor";
          return false;
        });

        const { notificationService } = await import("./notificationService");
        await Promise.all(
          targets.map((t) =>
            notificationService.addActivity({
              studentId: t.id,
              title: `📢 Announcement: ${title}`,
              description: content,
              type: "course_enrolled",
              createdAt: new Date().toISOString()
            }).catch(() => null)
          )
        );
      } catch (err) {
        console.warn("Failed to broadcast immediate announcement activity notifications:", err);
      }
    }

    return ann;
  }

  async deleteAnnouncement(adminName: string, announcementId: string): Promise<boolean> {
    const announcements = await AdminRepository.getAnnouncements();
    const target = announcements.find(a => a.id === announcementId);
    const success = await AdminRepository.deleteAnnouncement(announcementId);
    if (success && target) {
      await AdminRepository.logAuditAction(
        adminName,
        "Broadcast Announcement Deleted",
        `Title: "${target.title}"`
      );
    }
    return success;
  }

  // Settings
  async getSettings(): Promise<PlatformSettings> {
    return AdminRepository.getSettings();
  }

  async updateSettings(adminName: string, updates: Partial<PlatformSettings>): Promise<PlatformSettings> {
    const settings = await AdminRepository.updateSettings(updates);
    await AdminRepository.logAuditAction(
      adminName,
      "Platform Settings Updated",
      `Changed Keys: ${Object.keys(updates).join(", ")}`
    );
    return settings;
  }

  // Roles Matrix
  async getPermissionMatrix(): Promise<PermissionMatrixRow[]> {
    return AdminRepository.getPermissionMatrix();
  }

  async updatePermissionMatrix(adminName: string, matrix: PermissionMatrixRow[]): Promise<PermissionMatrixRow[]> {
    const updated = await AdminRepository.updatePermissionMatrix(matrix);
    await AdminRepository.logAuditAction(
      adminName,
      "Security Roles & Permission Matrix Updated"
    );
    return updated;
  }
}

export const adminService = new AdminService();
