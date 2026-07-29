// src/lib/repositories/admin/MockAdminRepository.ts

import { IAdminRepository } from "./IAdminRepository";
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
  PermissionMatrixRow,
  AdminActivityLog
} from "../../types/admin";

export class MockAdminRepository implements IAdminRepository {
  private getLocalData<T>(key: string, defaultVal: T): T {
    if (typeof window === "undefined") return defaultVal;
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultVal;
  }

  private setLocalData<T>(key: string, val: T): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(key, JSON.stringify(val));
    }
  }

  // --- STATS ---
  async getDashboardStats(): Promise<AdminDashboardStats> {
    const users = await this.getUsers();
    const courses = await this.getCourses();
    const verifications = await this.getVerifications();
    const payouts = await this.getPayouts();
    const transactions = await this.getTransactions();
    const tickets = await this.getTickets();
    const auditLogs = this.getLocalData<AdminActivityLog[]>("eduearn_admin_audit_logs", [
      { id: "log-1", timestamp: "2026-07-26 09:30", adminName: "Surya (Admin)", action: "System login authorized." }
    ]);

    const totalRevenue = transactions
      .filter((t) => t.status === "Success")
      .reduce((sum, t) => sum + t.amount, 0) + 1540000; // static base

    const pendingCoursesCount = courses.filter((c) => c.status === "Pending").length;
    const certificatesCount = this.getLocalData<number>("eduearn_mock_certificates_count", 84);

    return {
      totalUsers: users.length,
      totalStudents: users.filter((u) => u.role === "learner").length,
      totalTutors: users.filter((u) => u.role === "tutor").length,
      totalCourses: courses.length,
      publishedCourses: courses.filter((c) => c.status === "Approved").length,
      pendingCourses: pendingCoursesCount,
      totalRevenue,
      activeEnrollments: this.getLocalData<number>("eduearn_mock_enrollments_count", 412),
      certificatesIssued: certificatesCount,
      recentActivity: auditLogs.slice(0, 10)
    };
  }

  // --- USERS ---
  async getUsers(search?: string, role?: string, status?: string): Promise<AdminUser[]> {
    let list = this.getLocalData<AdminUser[]>("eduearn_mock_admin_users", [
      { 
        id: "u-1", 
        name: "Rahul Verma", 
        email: "rahul@eduearn.com", 
        role: "learner", 
        status: "Active", 
        createdAt: "2026-06-01", 
        walletCoins: 120,
        enrollments: [
          { courseId: "c-1", courseTitle: "Mastering React Native Hooks & Layouts", progressPercent: 65, enrolledAt: "2026-06-02" }
        ],
        lastActivity: "Enrolled in React Course (2026-07-28)"
      },
      { 
        id: "u-2", 
        name: "Amit Verma", 
        email: "amit@eduearn.com", 
        role: "tutor", 
        status: "Active", 
        createdAt: "2026-05-15", 
        walletCoins: 450,
        tutorDetails: {
          verificationStatus: "Approved",
          publishedCoursesCount: 1,
          studentsTaughtCount: 3,
          totalRevenue: 28400,
          averageRating: 4.8,
          courses: [
            { id: "c-1", title: "Mastering React Native Hooks & Layouts", price: 1200, enrollmentCount: 3, revenue: 3600 }
          ]
        },
        lastActivity: "Created Lesson (2026-07-28)"
      },
      { 
        id: "u-3", 
        name: "Priya Patel", 
        email: "priya@eduearn.com", 
        role: "tutor", 
        status: "Active", 
        createdAt: "2026-05-20", 
        walletCoins: 310,
        tutorDetails: {
          verificationStatus: "Approved",
          publishedCoursesCount: 1,
          studentsTaughtCount: 1,
          totalRevenue: 12000,
          averageRating: 4.5,
          courses: [
            { id: "c-2", title: "Kuchipudi Mudras & Coordination Masterclass", price: 1500, enrollmentCount: 1, revenue: 1500 }
          ]
        },
        lastActivity: "Uploaded Video (2026-07-28)"
      },
      { id: "u-4", name: "Sanjay Dutt", email: "sanjay@eduearn.com", role: "admin", status: "Active", createdAt: "2026-04-10", walletCoins: 0, lastActivity: "Logged In (2026-07-28)" },
      { 
        id: "u-5", 
        name: "Surya K", 
        email: "surya@learner.com", 
        role: "learner", 
        status: "Active", 
        createdAt: "2026-06-25", 
        walletCoins: 280,
        enrollments: [
          { courseId: "c-2", courseTitle: "Kuchipudi Mudras & Coordination Masterclass", progressPercent: 100, enrolledAt: "2026-06-26", certificateUrl: "https://example.com/cert.pdf" }
        ],
        lastActivity: "Completed Course (2026-07-28)"
      }
    ]);

    if (search) {
      const term = search.toLowerCase();
      list = list.filter((u) => u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term));
    }
    if (role && role !== "all") {
      list = list.filter((u) => u.role === role);
    }
    if (status && status !== "all") {
      list = list.filter((u) => u.status === status);
    }
    return list;
  }

  async updateUserStatus(userId: string, status: "Active" | "Suspended"): Promise<AdminUser> {
    const list = await this.getUsers();
    let updatedUser: AdminUser | null = null;
    const newList = list.map((u) => {
      if (u.id === userId) {
        updatedUser = { ...u, status };
        return updatedUser;
      }
      return u;
    });
    if (!updatedUser) throw new Error("User not found");
    this.setLocalData("eduearn_mock_admin_users", newList);
    return updatedUser;
  }

  async updateUserCoins(userId: string, coins: number): Promise<AdminUser> {
    const list = await this.getUsers();
    let updatedUser: AdminUser | null = null;
    const newList = list.map((u) => {
      if (u.id === userId) {
        updatedUser = { ...u, walletCoins: coins };
        return updatedUser;
      }
      return u;
    });
    if (!updatedUser) throw new Error("User not found");
    this.setLocalData("eduearn_mock_admin_users", newList);
    return updatedUser;
  }

  async deleteUser(userId: string): Promise<boolean> {
    const list = await this.getUsers();
    const newList = list.filter((u) => u.id !== userId);
    this.setLocalData("eduearn_mock_admin_users", newList);
    return true;
  }

  async logAuditAction(adminName: string, action: string, details?: string): Promise<void> {
    const logs = this.getLocalData<AdminActivityLog[]>("eduearn_admin_audit_logs", [
      { id: "log-1", timestamp: "2026-07-26 09:30", adminName: "Surya (Admin)", action: "System login authorized." }
    ]);
    const newLog: AdminActivityLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
      adminName,
      action: action + (details ? ` (${details})` : "")
    };
    this.setLocalData("eduearn_admin_audit_logs", [newLog, ...logs]);
  }

  // --- COURSES ---
  async getCourses(search?: string, category?: string, status?: string): Promise<AdminCourse[]> {
    let list = this.getLocalData<AdminCourse[]>("eduearn_mock_admin_courses", [
      { id: "c-1", title: "Mastering React Native Hooks & Layouts", tutorName: "Amit Verma", tutorId: "u-2", category: "Coding", price: 1200, tutorEarnings: 960, platformEarnings: 240, status: "Approved", featured: true, hidden: false, assignedSkill: "React", created_at: "2026-06-01" },
      { id: "c-2", title: "Kuchipudi Mudras & Coordination Masterclass", tutorName: "Priya Patel", tutorId: "u-3", category: "Dance", price: 1500, tutorEarnings: 1200, platformEarnings: 300, status: "Approved", featured: false, hidden: false, assignedSkill: "Kuchipudi", created_at: "2026-06-10" },
      { id: "c-3", title: "Double-Entry Accounting & Taxation Basics", tutorName: "Priya Patel", tutorId: "u-3", category: "Academics", price: 999, tutorEarnings: 799, platformEarnings: 200, status: "Pending", featured: false, hidden: true, assignedSkill: "Accounting", created_at: "2026-07-01" }
    ]);

    if (search) {
      const term = search.toLowerCase();
      list = list.filter((c) => c.title.toLowerCase().includes(term) || c.tutorName.toLowerCase().includes(term));
    }
    if (category && category !== "all") {
      list = list.filter((c) => c.category === category);
    }
    if (status && status !== "all") {
      list = list.filter((c) => c.status === status);
    }
    return list;
  }

  async updateCourseStatus(courseId: string, status: AdminCourse["status"]): Promise<AdminCourse> {
    const list = await this.getCourses();
    let updated: AdminCourse | null = null;
    const newList = list.map((c) => {
      if (c.id === courseId) {
        updated = { ...c, status, hidden: status === "Draft" || status === "Archived" };
        return updated;
      }
      return c;
    });
    if (!updated) throw new Error("Course not found");
    this.setLocalData("eduearn_mock_admin_courses", newList);
    return updated;
  }

  async updateCourseFeature(courseId: string, featured: boolean): Promise<AdminCourse> {
    const list = await this.getCourses();
    let updated: AdminCourse | null = null;
    const newList = list.map((c) => {
      if (c.id === courseId) {
        updated = { ...c, featured };
        return updated;
      }
      return c;
    });
    if (!updated) throw new Error("Course not found");
    this.setLocalData("eduearn_mock_admin_courses", newList);
    return updated;
  }

  async assignCourseCategory(courseId: string, category: string): Promise<AdminCourse> {
    const list = await this.getCourses();
    let updated: AdminCourse | null = null;
    const newList = list.map((c) => {
      if (c.id === courseId) {
        updated = { ...c, category };
        return updated;
      }
      return c;
    });
    if (!updated) throw new Error("Course not found");
    this.setLocalData("eduearn_mock_admin_courses", newList);
    return updated;
  }

  // --- VERIFICATIONS ---
  async getVerifications(): Promise<TutorVerificationApp[]> {
    return this.getLocalData<TutorVerificationApp[]>("eduearn_mock_admin_verifications", [
      { id: "v-1", tutorId: "u-2", tutorName: "Rohan Das", expertise: "Mathematics & Geometry", education: "IIT Bombay, Math undergrad", status: "Pending", govIdFile: "rohan-aadhaar.jpg", studentIdFile: "rohan-college-id.jpg", email: "rohan@example.com", created_at: "2026-07-20" },
      { id: "v-2", tutorId: "u-3", tutorName: "Sneha Iyer", expertise: "UI/UX Figma Layouts", education: "NID Design undergrad", status: "Pending", govIdFile: "sneha-passport.jpg", studentIdFile: "sneha-college-id.jpg", email: "sneha@example.com", created_at: "2026-07-22" }
    ]);
  }

  async updateVerificationStatus(verificationId: string, status: TutorVerificationApp["status"], updates?: Partial<TutorVerificationApp>): Promise<TutorVerificationApp> {
    const list = await this.getVerifications();
    let updated: TutorVerificationApp | null = null;
    const newList = list.map((v) => {
      if (v.id === verificationId) {
        updated = { ...v, status, ...updates };
        return updated;
      }
      return v;
    });
    if (!updated) throw new Error("Verification application not found");
    this.setLocalData("eduearn_mock_admin_verifications", newList);
    return updated;
  }

  // --- CATEGORIES ---
  async getCategories(): Promise<AdminCategory[]> {
    return this.getLocalData<AdminCategory[]>("eduearn_mock_admin_categories", [
      { id: "academics", name: "Academic Education", status: "Enabled", description: "Primary and secondary school prep" },
      { id: "coding", name: "Coding & Engineering", status: "Enabled", description: "Web, app and cloud development skills" },
      { id: "design", name: "UI UX Designing", status: "Enabled", description: "Figma wireframing and prototyping layouts" }
    ]);
  }

  async createCategory(name: string, description?: string): Promise<AdminCategory> {
    const list = await this.getCategories();
    const newCat: AdminCategory = {
      id: name.toLowerCase().replace(/\s+/g, "-"),
      name,
      status: "Enabled",
      description,
      created_at: new Date().toISOString()
    };
    this.setLocalData("eduearn_mock_admin_categories", [...list, newCat]);
    return newCat;
  }

  async updateCategory(categoryId: string, updates: Partial<AdminCategory>): Promise<AdminCategory> {
    const list = await this.getCategories();
    let updated: AdminCategory | null = null;
    const newList = list.map((c) => {
      if (c.id === categoryId) {
        updated = { ...c, ...updates };
        return updated;
      }
      return c;
    });
    if (!updated) throw new Error("Category not found");
    this.setLocalData("eduearn_mock_admin_categories", newList);
    return updated;
  }

  async deleteCategory(categoryId: string): Promise<boolean> {
    const list = await this.getCategories();
    const newList = list.filter((c) => c.id !== categoryId);
    this.setLocalData("eduearn_mock_admin_categories", newList);
    return true;
  }

  // --- FINANCE ---
  async getPayouts(): Promise<AdminPayout[]> {
    return this.getLocalData<AdminPayout[]>("eduearn_mock_admin_payouts", [
      { id: "po-1", tutorName: "Amit Verma", tutorId: "u-2", amount: 18400, status: "Pending", date: "2026-06-30", method: "Bank Transfer", bankDetails: "A/C: ****1234, IFSC: BARB0..." },
      { id: "po-2", tutorName: "Priya Patel", tutorId: "u-3", amount: 12000, status: "On Hold", date: "2026-06-28", method: "UPI", bankDetails: "priya@upi" }
    ]);
  }

  async getTransactions(): Promise<AdminTransaction[]> {
    return this.getLocalData<AdminTransaction[]>("eduearn_mock_admin_transactions", [
      { id: "tx-1", studentName: "Rahul Verma", courseTitle: "Mastering React Native Hooks & Layouts", amount: 1200, date: "2026-07-24", status: "Success" },
      { id: "tx-2", studentName: "Surya K", courseTitle: "Kuchipudi Mudras & Coordination Masterclass", amount: 1500, date: "2026-07-25", status: "Success" }
    ]);
  }

  async updateWithdrawalStatus(payoutId: string, status: AdminPayout["status"]): Promise<AdminPayout> {
    const list = await this.getPayouts();
    let updated: AdminPayout | null = null;
    const newList = list.map((p) => {
      if (p.id === payoutId) {
        updated = { ...p, status };
        return updated;
      }
      return p;
    });
    if (!updated) throw new Error("Payout not found");
    this.setLocalData("eduearn_mock_admin_payouts", newList);
    return updated;
  }

  // --- REPORTS ---
  async getReports(): Promise<AdminReport[]> {
    return this.getLocalData<AdminReport[]>("eduearn_mock_admin_reports", [
      { id: "rep-1", reporterName: "Rahul Verma", reportedEntityName: "Spammy Video Ad Course", reportedEntityType: "course", entityId: "c-spam", reason: "Spam content, advertisements inside video lectures", status: "Pending", date: "2026-07-24" },
      { id: "rep-2", reporterName: "Amit Verma", reportedEntityName: "Toxic Comment User", reportedEntityType: "user", entityId: "u-toxic", reason: "Abusive replies in Q&A forum", status: "Pending", date: "2026-07-25" }
    ]);
  }

  async resolveReport(reportId: string, status: AdminReport["status"]): Promise<AdminReport> {
    const list = await this.getReports();
    let updated: AdminReport | null = null;
    const newList = list.map((r) => {
      if (r.id === reportId) {
        updated = { ...r, status };
        return updated;
      }
      return r;
    });
    if (!updated) throw new Error("Report not found");
    this.setLocalData("eduearn_mock_admin_reports", newList);
    return updated;
  }

  async deleteReview(reviewId: string): Promise<boolean> {
    // Standard mock delete
    return true;
  }

  // --- TICKETS ---
  async getTickets(): Promise<SupportTicket[]> {
    return this.getLocalData<SupportTicket[]>("eduearn_mock_admin_tickets", [
      { id: "tkt-1", user: "Rahul Verma", email: "rahul@eduearn.com", title: "Certificate Generation Error", description: "Completed React course but certificate page shows undefined name details.", status: "Open", priority: "High", date: "2026-07-25", replies: [] },
      { id: "tkt-2", user: "Priya Patel", email: "priya@eduearn.com", title: "Tutor Payout Delay", description: "Requested withdrawal 3 days ago, still showing Pending status on studio wallet panel.", status: "Open", priority: "Medium", date: "2026-07-24", replies: [] }
    ]);
  }

  async replyTicket(ticketId: string, author: string, replyText: string): Promise<SupportTicket> {
    const list = await this.getTickets();
    let updated: SupportTicket | null = null;
    const newList = list.map((t) => {
      if (t.id === ticketId) {
        const replies = t.replies || [];
        replies.push({
          id: `rep-${Date.now()}`,
          author,
          text: replyText,
          timestamp: new Date().toISOString()
        });
        updated = { ...t, replies };
        return updated;
      }
      return t;
    });
    if (!updated) throw new Error("Ticket not found");
    this.setLocalData("eduearn_mock_admin_tickets", newList);
    return updated;
  }

  async resolveTicket(ticketId: string): Promise<SupportTicket> {
    const list = await this.getTickets();
    let updated: SupportTicket | null = null;
    const newList = list.map((t) => {
      if (t.id === ticketId) {
        updated = { ...t, status: "Resolved" as const };
        return updated;
      }
      return t;
    });
    if (!updated) throw new Error("Ticket not found");
    this.setLocalData("eduearn_mock_admin_tickets", newList);
    return updated;
  }

  // --- ANNOUNCEMENTS ---
  async getAnnouncements(): Promise<AdminAnnouncement[]> {
    return this.getLocalData<AdminAnnouncement[]>("eduearn_mock_admin_announcements", [
      { id: "ann-1", title: "Upcoming Platform Server Maintenance", content: "EduEarn will undergo server migration on July 30, 2026, from 02:00 to 04:00 AM IST.", targetAudience: "all", status: "Published", created_at: "2026-07-25" }
    ]);
  }

  async createAnnouncement(ann: Omit<AdminAnnouncement, "id" | "created_at">): Promise<AdminAnnouncement> {
    const list = await this.getAnnouncements();
    const newAnn: AdminAnnouncement = {
      id: `ann-${Date.now()}`,
      ...ann,
      created_at: new Date().toISOString()
    };
    this.setLocalData("eduearn_mock_admin_announcements", [...list, newAnn]);
    return newAnn;
  }

  async deleteAnnouncement(announcementId: string): Promise<boolean> {
    const list = await this.getAnnouncements();
    const newList = list.filter((a) => a.id !== announcementId);
    this.setLocalData("eduearn_mock_admin_announcements", newList);
    return true;
  }

  // --- SETTINGS ---
  async getSettings(): Promise<PlatformSettings> {
    return this.getLocalData<PlatformSettings>("eduearn_mock_admin_settings", {
      id: "main_config",
      maintenanceMode: false,
      systemVersion: "1.0.0",
      brandColor: "#3B82F6",
      emailNotificationsEnabled: true,
      allowNewRegistrations: true,
      updatedAt: new Date().toISOString()
    });
  }

  async updateSettings(updates: Partial<PlatformSettings>): Promise<PlatformSettings> {
    const settings = await this.getSettings();
    const updated = { ...settings, ...updates, updatedAt: new Date().toISOString() };
    this.setLocalData("eduearn_mock_admin_settings", updated);
    return updated;
  }

  // --- ROLES & PERMISSIONS MATRIX ---
  async getPermissionMatrix(): Promise<PermissionMatrixRow[]> {
    return this.getLocalData<PermissionMatrixRow[]>("eduearn_mock_admin_roles_matrix", [
      { permission: "View Marketplace Courses", student: true, tutor: true, admin: true },
      { permission: "Enroll in Premium Courses", student: true, tutor: false, admin: true },
      { permission: "Create Courses & Lessons", student: false, tutor: true, admin: true },
      { permission: "Access CEO Admin Operations Console", student: false, tutor: false, admin: true }
    ]);
  }

  async updatePermissionMatrix(matrix: PermissionMatrixRow[]): Promise<PermissionMatrixRow[]> {
    this.setLocalData("eduearn_mock_admin_roles_matrix", matrix);
    return matrix;
  }
}
