// src/lib/repositories/admin/IAdminRepository.ts

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
} from "../../types/admin";

export interface IAdminRepository {
  // Stats
  getDashboardStats(): Promise<AdminDashboardStats>;
  
  // Users
  getUsers(search?: string, role?: string, status?: string): Promise<AdminUser[]>;
  updateUserStatus(userId: string, status: "Active" | "Suspended"): Promise<AdminUser>;
  deleteUser(userId: string): Promise<boolean>;
  logAuditAction(adminName: string, action: string, details?: string): Promise<void>;
  
  // Courses
  getCourses(search?: string, category?: string, status?: string): Promise<AdminCourse[]>;
  updateCourseStatus(courseId: string, status: AdminCourse["status"]): Promise<AdminCourse>;
  updateCourseFeature(courseId: string, featured: boolean): Promise<AdminCourse>;
  assignCourseCategory(courseId: string, category: string): Promise<AdminCourse>;
  
  // Verifications
  getVerifications(): Promise<TutorVerificationApp[]>;
  updateVerificationStatus(verificationId: string, status: TutorVerificationApp["status"]): Promise<TutorVerificationApp>;
  
  // Categories
  getCategories(): Promise<AdminCategory[]>;
  createCategory(name: string, description?: string): Promise<AdminCategory>;
  updateCategory(categoryId: string, updates: Partial<AdminCategory>): Promise<AdminCategory>;
  deleteCategory(categoryId: string): Promise<boolean>;
  
  // Finance
  getPayouts(): Promise<AdminPayout[]>;
  getTransactions(): Promise<AdminTransaction[]>;
  updateWithdrawalStatus(payoutId: string, status: AdminPayout["status"]): Promise<AdminPayout>;
  
  // Reports & Moderation
  getReports(): Promise<AdminReport[]>;
  resolveReport(reportId: string, status: AdminReport["status"]): Promise<AdminReport>;
  deleteReview(reviewId: string): Promise<boolean>;
  
  // Support Tickets
  getTickets(): Promise<SupportTicket[]>;
  replyTicket(ticketId: string, author: string, replyText: string): Promise<SupportTicket>;
  resolveTicket(ticketId: string): Promise<SupportTicket>;
  
  // Announcements
  getAnnouncements(): Promise<AdminAnnouncement[]>;
  createAnnouncement(announcement: Omit<AdminAnnouncement, "id" | "created_at">): Promise<AdminAnnouncement>;
  deleteAnnouncement(announcementId: string): Promise<boolean>;
  
  // Settings
  getSettings(): Promise<PlatformSettings>;
  updateSettings(updates: Partial<PlatformSettings>): Promise<PlatformSettings>;
  
  // Roles Matrix
  getPermissionMatrix(): Promise<PermissionMatrixRow[]>;
  updatePermissionMatrix(matrix: PermissionMatrixRow[]): Promise<PermissionMatrixRow[]>;
}
