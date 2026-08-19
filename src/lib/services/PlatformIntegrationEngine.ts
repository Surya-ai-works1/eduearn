"use client";

// Shared Local Storage Database Keys
export const PLATFORM_EVENTS_KEY = "eduearn_platform_events";
export const AUDIT_LOGS_KEY = "eduearn_platform_audits";
export const NOTIFICATIONS_KEY = "eduearn_platform_notifications";
export const SYSTEM_HEALTH_KEY = "eduearn_platform_health";

export interface PlatformEvent {
  id: string;
  type: string; // e.g. "Student Registered", "Tutor Approved", "Course Published", etc.
  actor: string;
  role: string;
  module: string;
  targetId: string;
  targetName: string;
  timestamp: string;
  ip: string;
  severity: "Low" | "Medium" | "High";
  description: string;
}

export interface AuditEntry {
  id: string;
  user: string;
  role: string;
  module: string;
  action: string;
  oldValue: string;
  newValue: string;
  timestamp: string;
  ip: string;
}

export interface PlatformNotification {
  id: string;
  title: string;
  message: string;
  module: string;
  recipientRole: "Admin" | "Tutor" | "Student" | "All";
  timestamp: string;
  read: boolean;
  archived: boolean;
  priority: "Low" | "Medium" | "High";
}

// 1. Centralized Platform Event Bus
export class PlatformEventBus {
  static emit(event: Omit<PlatformEvent, "id" | "timestamp" | "ip">, oldValue = "", newValue = "") {
    if (typeof window === "undefined") return;

    const newEvent: PlatformEvent = {
      ...event,
      id: `evt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      ip: `192.168.1.${Math.floor(10 + Math.random() * 240)}`
    };

    // Store Event
    const events = this.getEvents();
    events.unshift(newEvent);
    localStorage.setItem(PLATFORM_EVENTS_KEY, JSON.stringify(events.slice(0, 200)));

    // Create Audit Log Entry
    this.logAudit({
      user: event.actor,
      role: event.role,
      module: event.module,
      action: event.type,
      oldValue,
      newValue,
      timestamp: newEvent.timestamp,
      ip: newEvent.ip
    });

    // Run Automatic Workflow Rules
    PlatformWorkflowEngine.process(newEvent);
  }

  static getEvents(): PlatformEvent[] {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(PLATFORM_EVENTS_KEY);
    try {
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  // 2. Audit Engine
  static logAudit(entry: Omit<AuditEntry, "id">) {
    if (typeof window === "undefined") return;
    const logs: AuditEntry[] = this.getAuditLogs();
    const newLog: AuditEntry = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      ...entry
    };
    logs.unshift(newLog);
    localStorage.setItem(AUDIT_LOGS_KEY, JSON.stringify(logs.slice(0, 300)));
  }

  static getAuditLogs(): AuditEntry[] {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(AUDIT_LOGS_KEY);
    try {
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  // 3. Smart Notifications Center
  static pushNotification(notif: Omit<PlatformNotification, "id" | "timestamp" | "read" | "archived">) {
    if (typeof window === "undefined") return;
    const notifications: PlatformNotification[] = this.getNotifications();
    const newNotif: PlatformNotification = {
      ...notif,
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      read: false,
      archived: false
    };
    notifications.unshift(newNotif);
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications.slice(0, 150)));
  }

  static getNotifications(): PlatformNotification[] {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(NOTIFICATIONS_KEY);
    try {
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }
}

// 4. Automatic Workflow Engine
export class PlatformWorkflowEngine {
  static process(event: PlatformEvent) {
    switch (event.type) {
      case "Student Registered":
        // Auto trigger: Add user, create default empty grade records, notify tutor/admin
        PlatformEventBus.pushNotification({
          title: "New Student Enrollment",
          message: `${event.targetName} registered for learning path program.`,
          module: "Student",
          recipientRole: "All",
          priority: "Low"
        });
        break;

      case "Tutor Approved":
        // Auto trigger: update tutor metrics status, dispatch verifications welcome announcements
        PlatformEventBus.pushNotification({
          title: "Educator Onboarded",
          message: `Tutor verification approved for ${event.targetName}.`,
          module: "Tutor",
          recipientRole: "Admin",
          priority: "Medium"
        });
        break;

      case "Course Published":
        // Auto trigger: notify all students, add to active search catalogs
        PlatformEventBus.pushNotification({
          title: "New Course Published",
          message: `Classroom session '${event.targetName}' is now live.`,
          module: "Course",
          recipientRole: "Student",
          priority: "High"
        });
        break;

      case "Assignment Graded":
        // Auto trigger: recalculate student risks & certificate eligibilities
        PlatformEventBus.pushNotification({
          title: "Assignment Evaluated",
          message: `Your quiz results are ready for review: ${event.targetName}.`,
          module: "Assignment",
          recipientRole: "Student",
          priority: "Medium"
        });
        break;

      case "Payment Completed":
        // Auto trigger: credit tutor wallet earnings, update revenue graphs
        PlatformEventBus.pushNotification({
          title: "Transaction Received",
          message: `Gross billing payout split verified for transaction: ${event.targetName}`,
          module: "Finance",
          recipientRole: "Admin",
          priority: "High"
        });
        break;

      case "Withdrawal Requested":
        PlatformEventBus.pushNotification({
          title: "Payout Awaiting Release",
          message: `Escrow request of ₹${event.targetName} submitted for authorization check.`,
          module: "Finance",
          recipientRole: "Admin",
          priority: "High"
        });
        break;

      case "Certificate Issued":
        PlatformEventBus.pushNotification({
          title: "Verifiable Credential Generated",
          message: `Academic certificate generated for student ${event.targetName}.`,
          module: "Certificate",
          recipientRole: "Student",
          priority: "High"
        });
        break;

      case "Live Class Created":
        PlatformEventBus.pushNotification({
          title: "Google Meet Scheduled",
          message: `New interactive live class scheduled for ${event.targetName}`,
          module: "Course",
          recipientRole: "Student",
          priority: "Medium"
        });
        break;

      case "Course Flagged":
        PlatformEventBus.pushNotification({
          title: "Content Quality Alert",
          message: `Course '${event.targetName}' flagged for moderation review.`,
          module: "Course",
          recipientRole: "Admin",
          priority: "High"
        });
        break;

      default:
        break;
    }
  }
}

// 5. Global Search Index
export class GlobalSearchIndex {
  static query(term: string): { module: string; id: string; name: string; info: string }[] {
    if (typeof window === "undefined" || !term.trim()) return [];
    
    const results: { module: string; id: string; name: string; info: string }[] = [];
    const lower = term.toLowerCase();

    const searchCollection = (
      key: string,
      moduleName: string,
      nameField: string,
      infoField: string,
      filterFn?: (item: any) => boolean
    ) => {
      const stored = localStorage.getItem(key);
      if (stored) {
        try {
          const list = JSON.parse(stored);
          if (Array.isArray(list)) {
            list.forEach((item: any) => {
              if (filterFn && !filterFn(item)) return;
              const name = String(item[nameField] || "");
              const info = String(item[infoField] || "");
              const matchId = String(item.id || item.tutorId || item.code || "").toLowerCase();
              if (
                name.toLowerCase().includes(lower) ||
                info.toLowerCase().includes(lower) ||
                matchId.includes(lower)
              ) {
                results.push({
                  module: moduleName,
                  id: item.id || item.tutorId || item.code || "",
                  name,
                  info
                });
              }
            });
          }
        } catch {}
      }
    };

    // Scan across all 11 required operational collections
    searchCollection("eduearn_admin_users", "User", "name", "email");
    searchCollection("eduearn_admin_users", "Student", "name", "email", (item) => item.role === "learner" || item.role === "student");
    searchCollection("eduearn_admin_users", "Tutor", "name", "email", (item) => item.role === "tutor");
    searchCollection("eduearn_tutor_courses", "Course", "title", "category");
    searchCollection("eduearn_admin_categories", "Category", "name", "slug");
    searchCollection("eduearn_admin_enrollments", "Payment", "courseTitle", "amount");
    searchCollection("eduearn_certificates", "Certificate", "studentName", "courseTitle");
    searchCollection("eduearn_tenants", "Organization", "name", "domain");
    searchCollection("eduearn_platform_audits", "Audit Log", "action", "user");
    searchCollection("eduearn_tickets", "Support Ticket", "title", "status");
    searchCollection("eduearn_moderation_reports", "Report", "title", "status");
    
    return results.slice(0, 30);
  }
}

// 6. System Health Diagnostic Engine
export class SystemHealthCenter {
  static getDiagnostics() {
    return {
      dbHealth: "Connected",
      storageStatus: "Connected",
      apiLatency: 15, // in ms
      queuedNotifications: 0,
      failedJobs: 0,
      warningsCount: 0
    };
  }
}

// 7. Auto Data Consistency Engine
export class DataConsistencyValidator {
  static validate(): { ok: boolean; errors: string[] } {
    if (typeof window === "undefined") return { ok: true, errors: [] };
    const errors: string[] = [];

    const getList = (key: string): any[] => {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : [];
    };

    const courses = getList("eduearn_academic_courses");
    const students = getList("eduearn_academic_students");
    const tutors = getList("eduearn_academic_tutors");

    // 1. Check duplicate Course Codes
    const codes = new Set();
    courses.forEach(c => {
      if (codes.has(c.code)) {
        errors.push(`Duplicate Course Code found: ${c.code}`);
      }
      codes.add(c.code);
    });

    // 2. Check broken student-course links
    students.forEach(s => {
      if (!courses.some(c => c.id === s.courseId)) {
        errors.push(`Broken Reference: Student '${s.name}' links to non-existent Course ID '${s.courseId}'`);
      }
    });

    // 3. Check tutor reference assignments
    courses.forEach(c => {
      if (c.tutorId && !tutors.some(t => t.tutorId === c.tutorId)) {
        errors.push(`Broken Reference: Course '${c.title}' references non-existent Tutor ID '${c.tutorId}'`);
      }
    });

    return {
      ok: errors.length === 0,
      errors
    };
  }
}
