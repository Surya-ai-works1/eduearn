// src/lib/types/admin.ts

export interface AdminDashboardStats {
  totalUsers: number;
  totalStudents: number;
  totalTutors: number;
  totalCourses: number;
  publishedCourses: number;
  pendingCourses: number;
  totalRevenue: number;
  activeEnrollments: number;
  certificatesIssued: number;
  recentActivity: AdminActivityLog[];
}

export interface AdminActivityLog {
  id: string;
  timestamp: string;
  adminName: string;
  action: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "learner" | "tutor" | "admin";
  status: "Active" | "Suspended";
  createdAt: string;
  walletCoins: number;
  country?: string;
  bio?: string;
  enrollments?: Array<{
    courseId: string;
    courseTitle: string;
    progressPercent: number;
    enrolledAt: string;
    certificateUrl?: string;
  }>;
  tutorDetails?: {
    verificationStatus: string;
    publishedCoursesCount: number;
    studentsTaughtCount: number;
    totalRevenue: number;
    averageRating: number;
    courses?: Array<{
      id: string;
      title: string;
      price: number;
      enrollmentCount: number;
      revenue: number;
    }>;
  };
  lastActivity?: string;
}

export interface AdminCourse {
  id: string;
  title: string;
  tutorName: string;
  tutorId: string;
  category: string;
  price: number;
  tutorEarnings: number;
  platformEarnings: number;
  status: "Pending" | "Approved" | "Rejected" | "Draft" | "Need Changes" | "Archived";
  featured: boolean;
  hidden: boolean;
  assignedSkill: string;
  created_at: string;
  isDynamic?: boolean;
  thumbnail?: string;
  enrollmentCount?: number;
  revenue?: number;
}

export interface TutorVerificationApp {
  id: string;
  tutorId: string;
  tutorName: string;
  expertise: string;
  education: string;
  status: "Pending" | "Documents Submitted" | "AI Test Scheduled" | "AI Test Completed" | "Under Review" | "Approved" | "Rejected";
  govIdFile: string;
  studentIdFile: string;
  email: string;
  created_at: string;
  isDynamic?: boolean;
  // Extended properties for production review console
  personalInfo?: any;
  academicQualifications?: any;
  teachingExperience?: any;
  subjectSelection?: any;
  govIdUrl?: string;
  degreeUrl?: string;
  certificatesUrl?: string;
  resumeUrl?: string;
  videoDemoUrl?: string;
  aiEvaluation?: any;
  adminNotes?: string;
  adminFeedback?: string;
  rejectionReason?: string;
  liveInterviewDetails?: any;
}

export interface AdminCategory {
  id: string;
  name: string;
  status: "Enabled" | "Disabled";
  description?: string;
  created_at?: string;
}

export interface AdminPayout {
  id: string;
  tutorName: string;
  tutorId: string;
  amount: number;
  status: "Pending" | "Released" | "Rejected" | "On Hold";
  date: string;
  method: string;
  bankDetails: string;
}

export interface AdminTransaction {
  id: string;
  studentName: string;
  courseTitle: string;
  amount: number;
  date: string;
  status: "Success" | "Failed";
}

export interface AdminReport {
  id: string;
  reporterName: string;
  reportedEntityName: string; // e.g. Course Title or User Name
  reportedEntityType: "course" | "user" | "review";
  entityId: string;
  reason: string;
  status: "Pending" | "Resolved" | "Ignored";
  date: string;
}

export interface SupportTicket {
  id: string;
  user: string;
  email: string;
  title: string;
  description: string;
  status: "Open" | "Resolved";
  priority: "Low" | "Medium" | "High";
  date: string;
  replies?: TicketReply[];
}

export interface TicketReply {
  id: string;
  author: string;
  text: string;
  timestamp: string;
}

export interface AdminAnnouncement {
  id: string;
  title: string;
  content: string;
  targetAudience: "all" | "students" | "tutors";
  scheduleDate?: string;
  status: "Published" | "Scheduled" | "Draft";
  created_at: string;
}

export interface PlatformSettings {
  id: string;
  maintenanceMode: boolean;
  systemVersion: string;
  brandColor: string;
  emailNotificationsEnabled: boolean;
  allowNewRegistrations: boolean;
  updatedAt: string;
}

export interface PermissionMatrixRow {
  permission: string;
  student: boolean;
  tutor: boolean;
  admin: boolean;
}

// ---- Offer type ----
export interface Offer {
  id: string;               // UUID primary key
  code: string;             // Upper‑case unique coupon code
  type: "percentage" | "fixed";
  value: number;            // Discount amount (percentage or flat amount)
  minPurchase?: number;     // Minimum cart value required (optional)
  maxDiscount?: number;     // Optional cap for percentage discounts
  expiresAt: string;        // ISO date string (YYYY‑MM‑DD)
  usageLimit: number;       // Maximum redemptions allowed (0 = unlimited)
  usageCount?: number;      // Derived usage count (optional)
  createdAt: string;        // Timestamp
  updatedAt?: string;       // Timestamp for updates
}
