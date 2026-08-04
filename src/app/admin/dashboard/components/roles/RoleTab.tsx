"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldCheck, ShieldAlert, Key, Lock, Check, X, Plus, Copy, Edit2, 
  Trash2, Search, Download, Upload, AlertTriangle, RefreshCw, Play, 
  History, Eye, Archive, UserCheck, HelpCircle, ArrowRightLeft, UserPlus, Users,
  BarChart3
} from "lucide-react";
import { toast } from "sonner";
import { Card } from "../../../../../components/ui/card";
import { Button } from "../../../../../components/ui/button";
import { cn } from "../../../../../utils/cn";

// --- TYPES AND STRUCTURES ---
export type PermissionColumn = "view" | "create" | "edit" | "delete" | "approve" | "export" | "import" | "publish" | "settings";
export type ModuleName = 
  | "dashboard" | "students" | "tutors" | "courses" | "assignments" 
  | "live_classes" | "resources" | "analytics" | "payments" | "certificates" 
  | "ai_studio" | "master_data" | "users" | "settings" | "audit_logs";

export interface RoleVersion {
  versionId: string;
  timestamp: string;
  updatedBy: string;
  action: string;
  permissionsSnapshot: Record<ModuleName, Record<PermissionColumn, boolean>>;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  type: "System" | "Custom";
  status: "Active" | "Inactive";
  permissions: Record<ModuleName, Record<PermissionColumn, boolean>>;
  assignedUsers: string[]; // User IDs from dashboard users list
  versionHistory: RoleVersion[];
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  roleName: string;
  oldValue: string;
  newValue: string;
  ip: string;
}

export interface RoleNotification {
  id: string;
  timestamp: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning";
}

interface LocalUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  walletCoins: number;
}

// --- CONSTANTS ---
const PERMISSION_COLUMNS: { key: PermissionColumn; label: string }[] = [
  { key: "view", label: "View" },
  { key: "create", label: "Create" },
  { key: "edit", label: "Edit" },
  { key: "delete", label: "Delete" },
  { key: "approve", label: "Approve" },
  { key: "export", label: "Export" },
  { key: "import", label: "Import" },
  { key: "publish", label: "Publish" },
  { key: "settings", label: "Settings" }
];

const PERMISSION_GROUPS: {
  groupName: string;
  modules: { key: ModuleName; label: string; description: string }[];
}[] = [
  {
    groupName: "Academic Operations",
    modules: [
      { key: "students", label: "Students", description: "Manage platform learner roster profiles and history" },
      { key: "tutors", label: "Tutors", description: "Review teaching credentials and onboarding documents" },
      { key: "courses", label: "Courses", description: "Review and moderate student course syllabi structures" },
      { key: "assignments", label: "Assignments", description: "Manage assignment templates and submissions grading" },
      { key: "live_classes", label: "Live Classes", description: "Schedule and manage interactive mentoring webcasts" },
      { key: "certificates", label: "Certificates", description: "Issue and audit blockchain verifiable graduation badges" }
    ]
  },
  {
    groupName: "Financial Operations",
    modules: [
      { key: "payments", label: "Payments", description: "Review transaction payouts, refunds, and tutor earnings Ledger" },
      { key: "analytics", label: "Analytics", description: "View financial reports and conversion rates logs" }
    ]
  },
  {
    groupName: "Content Operations",
    modules: [
      { key: "resources", label: "Resources", description: "Browse directory shared libraries and documents" },
      { key: "ai_studio", label: "AI Studio", description: "Audit prompt history and generate pedagogical outline files" }
    ]
  },
  {
    groupName: "Users Operations",
    modules: [
      { key: "users", label: "Users & Accounts", description: "Manage system access logins, roles, and ban lists" }
    ]
  },
  {
    groupName: "Platform Administration",
    modules: [
      { key: "master_data", label: "Master Data", description: "Configure system dropdown keys, tags, and languages lists" },
      { key: "settings", label: "Settings", description: "Configure system rules, configurations, and commission ratios" }
    ]
  },
  {
    groupName: "Security Reports",
    modules: [
      { key: "audit_logs", label: "Audit Logs", description: "Audit security operations and administrator transaction trails" }
    ]
  }
];

// File Scope deterministic counter to replace impure Date.now() / Math.random() inside components
let rbacCounter = 0;
const generateDeterministicId = (prefix: string): string => {
  rbacCounter++;
  return `${prefix}_${rbacCounter}_${Math.floor(Math.sin(rbacCounter) * 1000000).toString().replace("-", "")}`;
};

// --- CORE UTILITY SCHEMAS SEEDS ---
const generateEmptyPermissions = (): Record<ModuleName, Record<PermissionColumn, boolean>> => {
  const modules: ModuleName[] = [
    "dashboard", "students", "tutors", "courses", "assignments", 
    "live_classes", "resources", "analytics", "payments", "certificates", 
    "ai_studio", "master_data", "users", "settings", "audit_logs"
  ];
  const perms = {} as Record<ModuleName, Record<PermissionColumn, boolean>>;
  modules.forEach(m => {
    perms[m] = {
      view: false, create: false, edit: false, delete: false,
      approve: false, export: false, import: false, publish: false, settings: false
    };
  });
  return perms;
};

const generateFullPermissions = (): Record<ModuleName, Record<PermissionColumn, boolean>> => {
  const perms = generateEmptyPermissions();
  Object.keys(perms).forEach(k => {
    const m = k as ModuleName;
    Object.keys(perms[m]).forEach(pk => {
      perms[m][pk as PermissionColumn] = true;
    });
  });
  return perms;
};

const getSeedRoles = (): Role[] => {
  const superAdminPerms = generateFullPermissions();
  
  const tutorPerms = generateEmptyPermissions();
  tutorPerms.dashboard.view = true;
  tutorPerms.students.view = true;
  tutorPerms.courses.view = true;
  tutorPerms.courses.create = true;
  tutorPerms.courses.edit = true;
  tutorPerms.assignments.view = true;
  tutorPerms.assignments.create = true;
  tutorPerms.assignments.edit = true;
  tutorPerms.live_classes.view = true;
  tutorPerms.live_classes.create = true;
  tutorPerms.live_classes.edit = true;
  tutorPerms.resources.view = true;
  tutorPerms.resources.create = true;
  tutorPerms.resources.edit = true;
  tutorPerms.analytics.view = true;
  tutorPerms.ai_studio.view = true;
  tutorPerms.ai_studio.create = true;
  tutorPerms.certificates.view = true;
  tutorPerms.certificates.create = true;

  const studentPerms = generateEmptyPermissions();
  studentPerms.dashboard.view = true;
  studentPerms.courses.view = true;
  studentPerms.assignments.view = true;
  studentPerms.assignments.create = true;
  studentPerms.live_classes.view = true;
  studentPerms.resources.view = true;
  studentPerms.certificates.view = true;
  studentPerms.ai_studio.view = true;

  const adminPerms = generateFullPermissions();
  adminPerms.settings.delete = false; 
  adminPerms.users.delete = false;

  const supportStaffPerms = generateEmptyPermissions();
  supportStaffPerms.dashboard.view = true;
  supportStaffPerms.students.view = true;
  supportStaffPerms.tutors.view = true;
  supportStaffPerms.courses.view = true;
  supportStaffPerms.settings.view = true;

  const financePerms = generateEmptyPermissions();
  financePerms.dashboard.view = true;
  financePerms.payments.view = true;
  financePerms.payments.approve = true;
  financePerms.payments.export = true;
  financePerms.analytics.view = true;
  financePerms.analytics.export = true;

  const reviewerPerms = generateEmptyPermissions();
  reviewerPerms.dashboard.view = true;
  reviewerPerms.courses.view = true;
  reviewerPerms.courses.approve = true;
  reviewerPerms.tutors.view = true;
  reviewerPerms.tutors.approve = true;

  return [
    {
      id: "role-super-admin",
      name: "Super Admin",
      description: "Root system administrator with unrestricted platform credentials.",
      type: "System",
      status: "Active",
      permissions: superAdminPerms,
      assignedUsers: ["u-4"],
      versionHistory: [],
      createdAt: new Date("2026-01-01").toISOString(),
      updatedAt: new Date("2026-01-01").toISOString()
    },
    {
      id: "role-admin",
      name: "Admin",
      description: "Standard administrator managing users, tutors, courses, and platform operations.",
      type: "System",
      status: "Active",
      permissions: adminPerms,
      assignedUsers: [],
      versionHistory: [],
      createdAt: new Date("2026-01-01").toISOString(),
      updatedAt: new Date("2026-01-01").toISOString()
    },
    {
      id: "role-tutor",
      name: "Tutor",
      description: "Academic educator managing course materials, grading, live classrooms, and student profiles.",
      type: "System",
      status: "Active",
      permissions: tutorPerms,
      assignedUsers: ["u-2", "u-3"],
      versionHistory: [],
      createdAt: new Date("2026-01-01").toISOString(),
      updatedAt: new Date("2026-01-01").toISOString()
    },
    {
      id: "role-student",
      name: "Student",
      description: "Registered learner accessing marketplace, lectures, quizzes, and digital certificates.",
      type: "System",
      status: "Active",
      permissions: studentPerms,
      assignedUsers: ["u-1", "u-5"],
      versionHistory: [],
      createdAt: new Date("2026-01-01").toISOString(),
      updatedAt: new Date("2026-01-01").toISOString()
    },
    {
      id: "role-support-staff",
      name: "Support Staff",
      description: "Customer service desk managing help tickets, student guides, and communication logs.",
      type: "System",
      status: "Active",
      permissions: supportStaffPerms,
      assignedUsers: [],
      versionHistory: [],
      createdAt: new Date("2026-01-01").toISOString(),
      updatedAt: new Date("2026-01-01").toISOString()
    },
    {
      id: "role-finance",
      name: "Finance",
      description: "Financial clerk managing invoices, withdrawal audits, course commissions, and gross-net reports.",
      type: "System",
      status: "Active",
      permissions: financePerms,
      assignedUsers: [],
      versionHistory: [],
      createdAt: new Date("2026-01-01").toISOString(),
      updatedAt: new Date("2026-01-01").toISOString()
    },
    {
      id: "role-content-reviewer",
      name: "Content Reviewer",
      description: "Curriculum auditor verifying course syllabus standards, materials, and certificates accuracy.",
      type: "System",
      status: "Active",
      permissions: reviewerPerms,
      assignedUsers: [],
      versionHistory: [],
      createdAt: new Date("2026-01-01").toISOString(),
      updatedAt: new Date("2026-01-01").toISOString()
    }
  ];
};

// --- DATA ACCESS LAYER ---
const RBACService = {
  getRoles: (): Role[] => {
    if (typeof window === "undefined") return [];
    const saved = localStorage.getItem("eduearn_rbac_roles");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    const seeds = getSeedRoles();
    localStorage.setItem("eduearn_rbac_roles", JSON.stringify(seeds));
    return seeds;
  },

  saveRoles: (roles: Role[]) => {
    if (typeof window === "undefined") return;
    localStorage.setItem("eduearn_rbac_roles", JSON.stringify(roles));
    window.dispatchEvent(new Event("storage"));
  },

  getAuditLogs: (): AuditLog[] => {
    if (typeof window === "undefined") return [];
    const saved = localStorage.getItem("eduearn_rbac_audit_logs");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    const initialLogs: AuditLog[] = [
      { id: "audit-1", timestamp: new Date(Date.now() - 3600000 * 24).toISOString(), actor: "Super Admin", action: "Tutor Manager created", roleName: "Tutor", oldValue: "-", newValue: "Created", ip: "192.168.1.100" },
      { id: "audit-2", timestamp: new Date(Date.now() - 3600000 * 12).toISOString(), actor: "Super Admin", action: "Finance role updated", roleName: "Finance", oldValue: "View: false", newValue: "View: true", ip: "192.168.1.100" }
    ];
    localStorage.setItem("eduearn_rbac_audit_logs", JSON.stringify(initialLogs));
    return initialLogs;
  },

  saveAuditLogs: (logs: AuditLog[]) => {
    if (typeof window === "undefined") return;
    localStorage.setItem("eduearn_rbac_audit_logs", JSON.stringify(logs));
  },

  getNotifications: (): RoleNotification[] => {
    if (typeof window === "undefined") return [];
    const saved = localStorage.getItem("eduearn_rbac_notifications");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  },

  saveNotifications: (notes: RoleNotification[]) => {
    if (typeof window === "undefined") return;
    localStorage.setItem("eduearn_rbac_notifications", JSON.stringify(notes));
  }
};

interface RoleTabProps {
  logAuditAction: (actionStr: string) => void;
}

export default function RoleTab({ logAuditAction }: RoleTabProps) {
  // --- CORE STATE DECLARATIONS ---
  const [roles, setRoles] = useState<Role[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [notifications, setNotifications] = useState<RoleNotification[]>([]);
  
  const [selectedRoleId, setSelectedRoleId] = useState<string>("role-super-admin");
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<"matrix" | "users" | "effective" | "simulation" | "comparison" | "history" | "analytics">("matrix");
  
  const [roleSearchText, setRoleSearchText] = useState("");
  const [matrixSearchText, setMatrixSearchText] = useState("");
  const [userSearchText, setUserSearchText] = useState("");
  
  // Custom Role Actions States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDesc, setNewRoleDesc] = useState("");
  const [cloneSourceRoleId, setCloneSourceRoleId] = useState("none");
  
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renamedRoleName, setRenamedRoleName] = useState("");
  
  // Comparison state
  const [compareTargetRoleId, setCompareTargetRoleId] = useState("role-tutor");
  
  // User Selection Checklist
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [bulkRoleSelect, setBulkRoleSelect] = useState("role-student");

  // Multi Selection Bulk Roles list
  const [selectedRoleIdsList, setSelectedRoleIdsList] = useState<string[]>([]);
  
  // Simulated Logged-In Admin Context
  const activeAdminUserId = "u-4"; // Sanjay Dutt

  // Loader
  useEffect(() => {
    setRoles(RBACService.getRoles());
    setAuditLogs(RBACService.getAuditLogs());
    setNotifications(RBACService.getNotifications());
  }, []);

  const selectedRole = useMemo(() => {
    return roles.find(r => r.id === selectedRoleId) || roles[0];
  }, [roles, selectedRoleId]);

  const localUsersList = useMemo((): LocalUser[] => {
    if (typeof window === "undefined") return [];
    const saved = localStorage.getItem("eduearn_admin_users");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  }, [roles]);

  // Sync users state when localStorage changes
  useEffect(() => {
    const handleStorageSync = () => {
      setRoles(RBACService.getRoles());
    };
    window.addEventListener("storage", handleStorageSync);
    return () => window.removeEventListener("storage", handleStorageSync);
  }, []);

  // --- REUSABLE AUDIT LOG ACTION ---
  const recordAuditTrail = (action: string, roleName: string, oldValue: string, newValue: string) => {
    const newLog: AuditLog = {
      id: generateDeterministicId("audit"),
      timestamp: new Date().toISOString(),
      actor: "Super Admin",
      action,
      roleName,
      oldValue,
      newValue,
      ip: "192.168.1.100"
    };
    const updatedLogs = [newLog, ...auditLogs];
    setAuditLogs(updatedLogs);
    RBACService.saveAuditLogs(updatedLogs);
    
    // Add real-time notification
    const newNote: RoleNotification = {
      id: generateDeterministicId("note"),
      timestamp: new Date().toISOString(),
      title: action,
      message: `Role "${roleName}" has been updated: ${oldValue} ➔ ${newValue}`,
      type: "info"
    };
    const updatedNotes = [newNote, ...notifications];
    setNotifications(updatedNotes);
    RBACService.saveNotifications(updatedNotes);

    logAuditAction(`[RBAC Config] ${action} on Role "${roleName}"`);
  };

  // --- DEPENDENCY ENFORCEMENT ENGINE ---
  const enforceMatrixDependencies = (
    module: ModuleName, 
    column: PermissionColumn, 
    nextVal: boolean,
    currentPerms: Record<ModuleName, Record<PermissionColumn, boolean>>
  ): Record<ModuleName, Record<PermissionColumn, boolean>> => {
    const perms = JSON.parse(JSON.stringify(currentPerms));
    perms[module][column] = nextVal;

    if (nextVal) {
      // 1. Delete Course/User requires View & Edit Course/User
      if (column === "delete") {
        perms[module].view = true;
        perms[module].edit = true;
      }
      // 2. Edit / Create / Publish requires View
      if (column === "edit" || column === "create" || column === "publish" || column === "settings" || column === "approve") {
        perms[module].view = true;
      }
    } else {
      // 3. Disabling View automatically disables all other operations
      if (column === "view") {
        PERMISSION_COLUMNS.forEach(col => {
          perms[module][col.key] = false;
        });
      }
      // 4. Disabling Edit disables Delete
      if (column === "edit") {
        perms[module].delete = false;
      }
    }
    return perms;
  };

  // --- HANDLER FUNCTIONS ---

  const handlePermissionToggle = (module: ModuleName, column: PermissionColumn) => {
    if (!selectedRole) return;
    if (selectedRole.name === "Super Admin") {
      toast.error("Super Admin permission matrix is protected and cannot be modified.");
      return;
    }

    const currentVal = selectedRole.permissions[module][column];
    const nextVal = !currentVal;
    
    const updatedPermissions = enforceMatrixDependencies(module, column, nextVal, selectedRole.permissions);
    
    // Add version snapshot before update
    const newVersion: RoleVersion = {
      versionId: generateDeterministicId("ver"),
      timestamp: new Date().toISOString(),
      updatedBy: "Super Admin",
      action: `Modified permission "${column}" in module "${module}"`,
      permissionsSnapshot: JSON.parse(JSON.stringify(selectedRole.permissions))
    };

    const updatedRoles = roles.map(r => {
      if (r.id === selectedRoleId) {
        return {
          ...r,
          permissions: updatedPermissions,
          versionHistory: [newVersion, ...(r.versionHistory || [])],
          updatedAt: new Date().toISOString()
        };
      }
      return r;
    });

    setRoles(updatedRoles);
    RBACService.saveRoles(updatedRoles);
    recordAuditTrail("Permission Changed", selectedRole.name, `${module}.${column}: ${currentVal}`, `${module}.${column}: ${nextVal}`);
    toast.success(`Permission "${column}" updated for module "${module}".`);
  };

  const handleCreateRole = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newRoleName.trim();
    const desc = newRoleDesc.trim();
    if (!name) return;

    const isDuplicate = roles.some(r => r.name.toLowerCase() === name.toLowerCase());
    if (isDuplicate) {
      toast.error("A role with this name already exists.");
      return;
    }

    let initialPermissions = generateEmptyPermissions();
    if (cloneSourceRoleId !== "none") {
      const source = roles.find(r => r.id === cloneSourceRoleId);
      if (source) {
        initialPermissions = JSON.parse(JSON.stringify(source.permissions));
      }
    }

    const newRole: Role = {
      id: generateDeterministicId("role"),
      name,
      description: desc || "Custom platform administrative role.",
      type: "Custom",
      status: "Active",
      permissions: initialPermissions,
      assignedUsers: [],
      versionHistory: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedRoles = [...roles, newRole];
    setRoles(updatedRoles);
    RBACService.saveRoles(updatedRoles);
    recordAuditTrail("Role Created", name, "-", "Created Custom Role");
    
    setNewRoleName("");
    setNewRoleDesc("");
    setCloneSourceRoleId("none");
    setShowCreateModal(false);
    toast.success(`Custom role "${name}" created successfully.`);
  };

  const handleRenameRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole || selectedRole.type === "System") return;
    const name = renamedRoleName.trim();
    if (!name) return;

    if (roles.some(r => r.id !== selectedRoleId && r.name.toLowerCase() === name.toLowerCase())) {
      toast.error("A role with this name already exists.");
      return;
    }

    const oldName = selectedRole.name;
    const updatedRoles = roles.map(r => {
      if (r.id === selectedRoleId) {
        return {
          ...r,
          name,
          updatedAt: new Date().toISOString()
        };
      }
      return r;
    });

    setRoles(updatedRoles);
    RBACService.saveRoles(updatedRoles);
    recordAuditTrail("Role Renamed", oldName, oldName, name);
    setShowRenameModal(false);
    setRenamedRoleName("");
    toast.success(`Role renamed to "${name}".`);
  };

  const handleArchiveRole = () => {
    if (!selectedRole || selectedRole.type === "System") return;
    const nextStatus = selectedRole.status === "Active" ? "Inactive" : "Active";

    const updatedRoles = roles.map(r => {
      if (r.id === selectedRoleId) {
        return {
          ...r,
          status: nextStatus as "Active" | "Inactive",
          updatedAt: new Date().toISOString()
        };
      }
      return r;
    });

    setRoles(updatedRoles);
    RBACService.saveRoles(updatedRoles);
    recordAuditTrail(nextStatus === "Inactive" ? "Role Archived" : "Role Restored", selectedRole.name, selectedRole.status, nextStatus);
    toast.success(`Role status changed to ${nextStatus}.`);
  };

  const handleDeleteRole = () => {
    if (!selectedRole || selectedRole.type === "System") {
      toast.error("System roles cannot be deleted.");
      return;
    }

    if (selectedRole.assignedUsers.length > 0) {
      toast.error(`Cannot delete role. It still has ${selectedRole.assignedUsers.length} assigned users. Transfer them first.`);
      return;
    }

    if (confirm(`Are you sure you want to delete the role "${selectedRole.name}"?`)) {
      const updatedRoles = roles.filter(r => r.id !== selectedRoleId);
      setRoles(updatedRoles);
      RBACService.saveRoles(updatedRoles);
      recordAuditTrail("Role Deleted", selectedRole.name, "Active", "Deleted");
      setSelectedRoleId("role-admin");
      toast.success("Role deleted successfully.");
    }
  };

  const handleRestoreVersion = (version: RoleVersion) => {
    if (!selectedRole) return;
    if (selectedRole.name === "Super Admin") {
      toast.error("Super Admin versions are protected.");
      return;
    }

    const currentSnapshot = JSON.parse(JSON.stringify(selectedRole.permissions));
    const newHistoryLog: RoleVersion = {
      versionId: generateDeterministicId("ver"),
      timestamp: new Date().toISOString(),
      updatedBy: "Super Admin",
      action: `Restored back to snapshot from ${new Date(version.timestamp).toLocaleString()}`,
      permissionsSnapshot: currentSnapshot
    };

    const updatedRoles = roles.map(r => {
      if (r.id === selectedRoleId) {
        return {
          ...r,
          permissions: JSON.parse(JSON.stringify(version.permissionsSnapshot)),
          versionHistory: [newHistoryLog, ...(r.versionHistory || [])],
          updatedAt: new Date().toISOString()
        };
      }
      return r;
    });

    setRoles(updatedRoles);
    RBACService.saveRoles(updatedRoles);
    recordAuditTrail("Version Restored", selectedRole.name, "Previous Config", "Restored Snapshot");
    toast.success(`Permissions reverted to historical snapshot version.`);
  };

  // --- USER ASSIGNMENT LOGICS ---
  const handleAssignUser = (userId: string) => {
    if (!selectedRole) return;
    if (selectedRole.assignedUsers.includes(userId)) return;

    // 1. Remove user from all other roles first to prevent multiple assignments
    const updatedRoles = roles.map(r => {
      let changed = false;
      const filteredUsers = r.assignedUsers.filter(uid => {
        if (uid === userId) {
          changed = true;
          return false;
        }
        return true;
      });
      return {
        ...r,
        assignedUsers: filteredUsers,
        updatedAt: changed ? new Date().toISOString() : r.updatedAt
      };
    });

    // 2. Add user to selected role
    const finalRoles = updatedRoles.map(r => {
      if (r.id === selectedRoleId) {
        return {
          ...r,
          assignedUsers: [...r.assignedUsers, userId],
          updatedAt: new Date().toISOString()
        };
      }
      return r;
    });

    // 3. Sync to legacy users table in localStorage
    const matchedUser = localUsersList.find(u => u.id === userId);
    if (matchedUser) {
      const legacyRoleVal = selectedRole.name === "Super Admin" ? "super_admin" : selectedRole.name === "Student" ? "learner" : selectedRole.name.toLowerCase();
      const updatedUsersList = localUsersList.map(u => {
        if (u.id === userId) {
          return { ...u, role: legacyRoleVal };
        }
        return u;
      });
      localStorage.setItem("eduearn_admin_users", JSON.stringify(updatedUsersList));
    }

    setRoles(finalRoles);
    RBACService.saveRoles(finalRoles);
    recordAuditTrail("User Assigned", selectedRole.name, "Unassigned", `User ${userId} assigned`);
    toast.success("User role updated and synchronized.");
  };

  const handleRemoveUser = (userId: string) => {
    if (!selectedRole) return;
    
    // Security check: Prevent removing own Super Admin permissions
    if (userId === activeAdminUserId && selectedRole.name === "Super Admin") {
      toast.error("Security Lock: You cannot remove yourself from the Super Admin role.");
      return;
    }

    const updatedRoles = roles.map(r => {
      if (r.id === selectedRoleId) {
        return {
          ...r,
          assignedUsers: r.assignedUsers.filter(uid => uid !== userId),
          updatedAt: new Date().toISOString()
        };
      }
      return r;
    });

    // Reset user back to Student role (learner)
    const updatedUsersList = localUsersList.map(u => {
      if (u.id === userId) {
        return { ...u, role: "learner" };
      }
      return u;
    });
    localStorage.setItem("eduearn_admin_users", JSON.stringify(updatedUsersList));

    setRoles(updatedRoles);
    RBACService.saveRoles(updatedRoles);
    recordAuditTrail("User Removed", selectedRole.name, `User ${userId}`, "Removed to Student");
    toast.success("User unassigned from role.");
  };

  const handleTransferUser = (userId: string, targetRoleId: string) => {
    if (userId === activeAdminUserId && selectedRole.name === "Super Admin" && targetRoleId !== "role-super-admin") {
      toast.error("Security Lock: You cannot transfer yourself away from the Super Admin role.");
      return;
    }

    // 1. Remove from current
    const step1 = roles.map(r => {
      return {
        ...r,
        assignedUsers: r.assignedUsers.filter(uid => uid !== userId)
      };
    });

    // 2. Add to target
    const targetRole = roles.find(r => r.id === targetRoleId);
    const finalRoles = step1.map(r => {
      if (r.id === targetRoleId) {
        return {
          ...r,
          assignedUsers: [...r.assignedUsers, userId],
          updatedAt: new Date().toISOString()
        };
      }
      return r;
    });

    // 3. Sync to legacy users table
    if (targetRole) {
      const legacyRoleVal = targetRole.name === "Super Admin" ? "super_admin" : targetRole.name === "Student" ? "learner" : targetRole.name.toLowerCase();
      const updatedUsersList = localUsersList.map(u => {
        if (u.id === userId) {
          return { ...u, role: legacyRoleVal };
        }
        return u;
      });
      localStorage.setItem("eduearn_admin_users", JSON.stringify(updatedUsersList));
    }

    setRoles(finalRoles);
    RBACService.saveRoles(finalRoles);
    recordAuditTrail("User Transferred", selectedRole.name, `User ${userId}`, `Moved to ${targetRoleId}`);
    toast.success("User transferred successfully.");
  };

  const handleBulkUserAssign = () => {
    if (selectedUserIds.length === 0) {
      toast.warning("No users selected.");
      return;
    }

    const targetRoleObj = roles.find(r => r.id === bulkRoleSelect);
    if (!targetRoleObj) return;

    // 1. Remove all selected users from all other roles first
    const step1 = roles.map(r => {
      return {
        ...r,
        assignedUsers: r.assignedUsers.filter(uid => !selectedUserIds.includes(uid))
      };
    });

    // 2. Add all selected users to the target role
    const finalRoles = step1.map(r => {
      if (r.id === bulkRoleSelect) {
        return {
          ...r,
          assignedUsers: [...r.assignedUsers, ...selectedUserIds],
          updatedAt: new Date().toISOString()
        };
      }
      return r;
    });

    // 3. Sync legacy list
    const legacyRoleVal = targetRoleObj.name === "Super Admin" ? "super_admin" : targetRoleObj.name === "Student" ? "learner" : targetRoleObj.name.toLowerCase();
    const updatedUsersList = localUsersList.map(u => {
      if (selectedUserIds.includes(u.id)) {
        return { ...u, role: legacyRoleVal };
      }
      return u;
    });
    localStorage.setItem("eduearn_admin_users", JSON.stringify(updatedUsersList));

    setRoles(finalRoles);
    RBACService.saveRoles(finalRoles);
    recordAuditTrail("Bulk Users Assigned", targetRoleObj.name, `${selectedUserIds.length} users`, "Assigned");
    
    setSelectedUserIds([]);
    toast.success(`Successfully assigned ${selectedUserIds.length} users to "${targetRoleObj.name}".`);
  };

  // --- DATA IMPORT / EXPORT UTILITIES ---
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(roles, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `rbac_roles_matrix_export.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success("JSON template exported successfully!");
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!Array.isArray(parsed)) {
          toast.error("Invalid format. Expected JSON array of roles.");
          return;
        }

        // Validate structure
        const isValid = parsed.every(r => r.name && r.permissions);
        if (!isValid) {
          toast.error("Missing required keys in role JSON nodes.");
          return;
        }

        // Merge imported custom roles into system roles
        const mergedRoles = [...roles];
        let importedCount = 0;

        parsed.forEach((imp: Role) => {
          if (imp.type === "System") return; // Skip seeding system duplicate roles
          const exists = mergedRoles.some(r => r.name.toLowerCase() === imp.name.toLowerCase());
          if (!exists) {
            mergedRoles.push({
              ...imp,
              id: generateDeterministicId("role"),
              type: "Custom",
              status: "Active",
              assignedUsers: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            });
            importedCount++;
          }
        });

        if (importedCount > 0) {
          setRoles(mergedRoles);
          RBACService.saveRoles(mergedRoles);
          recordAuditTrail("Roles Imported", "Multiple", "Import", `${importedCount} roles`);
          toast.success(`Successfully imported ${importedCount} custom roles templates!`);
        } else {
          toast.warning("No new unique custom roles were found in the template.");
        }
      } catch (err) {
        toast.error("Failed to parse JSON file.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // --- FILTERS & INTERACTIVE SEARCH ---
  const filteredRolesList = useMemo(() => {
    return roles.filter(r => 
      r.name.toLowerCase().includes(roleSearchText.toLowerCase()) || 
      r.description.toLowerCase().includes(roleSearchText.toLowerCase())
    );
  }, [roles, roleSearchText]);

  // --- MEMOIZED ANALYTICS DATA ---
  const roleChartMetrics = useMemo(() => {
    const labels = roles.map(r => r.name);
    const userCounts = roles.map(r => r.assignedUsers.length);
    const activePercent = roles.map(r => {
      let allowedCount = 0;
      let totalCount = 0;
      Object.keys(r.permissions).forEach(k => {
        const m = k as ModuleName;
        Object.keys(r.permissions[m]).forEach(pk => {
          totalCount++;
          if (r.permissions[m][pk as PermissionColumn]) allowedCount++;
        });
      });
      return Math.round((allowedCount / totalCount) * 100);
    });

    return { labels, userCounts, activePercent };
  }, [roles]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="space-y-6 text-left text-xs font-semibold text-foreground select-none"
    >
      {/* 🚀 ENTERPRISE HEADER CONTAINER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/20 pb-4">
        <div>
          <h3 className="text-sm font-heading font-extrabold uppercase tracking-wide text-foreground">
            Enterprise Access &amp; Role-Based Security Hub
          </h3>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Configure platform administrative authorization models, manage permission matrix tables, audit logs, and simulate role security profiles.
          </p>
        </div>
      </div>

      {/* 📊 Enterprise KPI Stat Cards Grid (6 columns) */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card className="p-3 border-border bg-card shadow-soft flex flex-col justify-between">
          <span className="text-[8px] font-black uppercase text-muted-foreground">Total Roles</span>
          <p className="text-lg font-heading font-extrabold mt-1 text-primary">{roles.length}</p>
        </Card>
        <Card className="p-3 border-border bg-card shadow-soft flex flex-col justify-between">
          <span className="text-[8px] font-black uppercase text-emerald-500">Active Roles</span>
          <p className="text-lg font-heading font-extrabold mt-1 text-emerald-600 dark:text-emerald-400">
            {roles.filter(r => r.status === "Active").length}
          </p>
        </Card>
        <Card className="p-3 border-border bg-card shadow-soft flex flex-col justify-between">
          <span className="text-[8px] font-black uppercase text-amber-500">System Roles</span>
          <p className="text-lg font-heading font-extrabold mt-1 text-amber-600 dark:text-amber-400 font-extrabold">
            {roles.filter(r => r.type === "System").length}
          </p>
        </Card>
        <Card className="p-3 border-border bg-card shadow-soft flex flex-col justify-between">
          <span className="text-[8px] font-black uppercase text-purple-500 font-extrabold">Custom Roles</span>
          <p className="text-lg font-heading font-extrabold mt-1 text-purple-600 dark:text-purple-400">
            {roles.filter(r => r.type === "Custom").length}
          </p>
        </Card>
        <Card className="p-3 border-border bg-card shadow-soft flex flex-col justify-between">
          <span className="text-[8px] font-black uppercase text-sky-500 font-extrabold">Assigned Users</span>
          <p className="text-lg font-heading font-extrabold mt-1 text-sky-600 dark:text-sky-400">
            {localUsersList.length}
          </p>
        </Card>
        <Card className="p-3 border-border bg-card shadow-soft flex flex-col justify-between">
          <span className="text-[8px] font-black uppercase text-rose-500">Pending Requests</span>
          <p className="text-lg font-heading font-extrabold mt-1 text-rose-600 dark:text-rose-400 animate-pulse">2</p>
        </Card>
      </div>

      {/* 🛠️ TWO-COLUMN SPLIT PANEL */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        
        {/* LEFT COLUMN: ROSTER LIST */}
        <div className="space-y-4 xl:col-span-1">
          <Card className="p-4 border-border bg-card shadow-soft space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-foreground">Roster List</span>
              <button 
                onClick={() => setShowCreateModal(true)}
                className="h-6 px-2 bg-primary text-white text-[9px] font-bold uppercase rounded flex items-center gap-1 hover:bg-primary/95 transition-all focus:outline-none"
              >
                <Plus size={10} /> Create Role
              </button>
            </div>

            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search roles..."
                value={roleSearchText}
                onChange={(e) => setRoleSearchText(e.target.value)}
                className="w-full h-8 pl-8 pr-2.5 rounded border border-border bg-muted/10 text-[10px] font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary/20"
              />
            </div>

            {/* List */}
            <div className="space-y-1.5 max-h-[400px] overflow-y-auto pr-0.5">
              {filteredRolesList.map(r => (
                <button
                  key={r.id}
                  onClick={() => setSelectedRoleId(r.id)}
                  className={cn(
                    "w-full text-left p-2.5 rounded-card border transition-all flex flex-col gap-1 hover:border-primary/20 focus:outline-none",
                    selectedRoleId === r.id 
                      ? "border-primary bg-primary/5 text-primary" 
                      : "border-border bg-muted/5 text-foreground",
                    r.status === "Inactive" && "opacity-60"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold truncate">{r.name}</span>
                    <span className={cn(
                      "text-[7px] font-black uppercase px-1 rounded scale-90",
                      r.type === "System" 
                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25"
                        : "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/25"
                    )}>
                      {r.type}
                    </span>
                  </div>
                  <p className="text-[9px] text-muted-foreground truncate leading-none">{r.description}</p>
                  <div className="flex items-center justify-between text-[8px] mt-1 pt-1 border-t border-border/10">
                    <span className="text-muted-foreground font-bold">Assigned: {r.assignedUsers?.length || 0} users</span>
                    <span className={cn("font-black", r.status === "Active" ? "text-emerald-500" : "text-rose-500")}>
                      {r.status}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN: WORKSPACE INTERFACE */}
        <div className="xl:col-span-3 space-y-4">
          {selectedRole ? (
            <div className="space-y-4">
              
              {/* Selected Role Meta Header Info */}
              <Card className="p-4 border-border bg-card shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-heading font-extrabold text-foreground">{selectedRole.name}</h4>
                    <span className={cn(
                      "text-[8px] font-black uppercase px-1.5 py-0.2 border rounded-full",
                      selectedRole.type === "System" 
                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25"
                        : "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/25"
                    )}>
                      {selectedRole.type}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-relaxed max-w-xl">{selectedRole.description}</p>
                  <div className="text-[8px] text-muted-foreground/60 uppercase font-black tracking-wide pt-1">
                    Created at: {new Date(selectedRole.createdAt).toLocaleDateString()} • Updated: {new Date(selectedRole.updatedAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                  {selectedRole.type === "Custom" && (
                    <>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => {
                          setRenamedRoleName(selectedRole.name);
                          setShowRenameModal(true);
                        }} 
                        className="h-8 text-[10px] font-bold"
                      >
                        <Edit2 size={11} className="mr-1 text-primary" /> Rename
                      </Button>

                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={handleArchiveRole}
                        className="h-8 text-[10px] font-bold"
                      >
                        <Archive size={11} className="mr-1 text-amber-500" />
                        {selectedRole.status === "Active" ? "Archive" : "Activate"}
                      </Button>

                      <button 
                        onClick={handleDeleteRole}
                        className="h-8 px-3 rounded text-rose-500 hover:bg-rose-500/5 text-[10px] font-bold flex items-center transition-colors focus:outline-none"
                      >
                        <Trash2 size={11} className="mr-1" /> Delete
                      </button>
                    </>
                  )}
                </div>
              </Card>

              {/* Workspace Navigation Tabs Selector */}
              <div className="flex border-b border-border/20 pb-1.5 gap-2 select-none overflow-x-auto">
                {(["matrix", "users", "effective", "simulation", "comparison", "history", "analytics"] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveWorkspaceTab(tab)}
                    className={cn(
                      "pb-2 px-1 text-[10px] font-black uppercase tracking-wider border-b-2 transition-all focus:outline-none shrink-0",
                      activeWorkspaceTab === tab 
                        ? "border-primary text-primary" 
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {tab === "matrix" && "🛡️ Permission Matrix"}
                    {tab === "users" && `👥 Assigned Users (${selectedRole.assignedUsers.length})`}
                    {tab === "effective" && "🔍 Effective Summary"}
                    {tab === "simulation" && "🎭 Simulation Preview"}
                    {tab === "comparison" && "🔄 Comparative Study"}
                    {tab === "history" && `📜 History logs (${selectedRole.versionHistory?.length || 0})`}
                    {tab === "analytics" && "📊 Role Stats"}
                  </button>
                ))}
              </div>

              {/* WORKSPACE CONTENT AREA CONTAINER */}
              <Card className="p-5 border-border bg-card shadow-soft min-h-[400px]">
                
                {/* 🛡️ TAB 1: PERMISSION MATRIX */}
                {activeWorkspaceTab === "matrix" && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/10 pb-3">
                      <div>
                        <span className="text-[10px] font-black uppercase text-foreground">Granular Module Permissions</span>
                        <p className="text-[9px] text-muted-foreground mt-0.5">Toggle permission flags. Dependencies are handled automatically.</p>
                      </div>
                      <div className="relative max-w-xs w-full">
                        <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                          type="text"
                          placeholder="Search permissions..."
                          value={matrixSearchText}
                          onChange={(e) => setMatrixSearchText(e.target.value)}
                          className="w-full h-8 pl-8 pr-2.5 rounded border border-border bg-muted/10 text-[10px] font-semibold text-foreground focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="overflow-x-auto max-h-[450px] overflow-y-auto">
                      <table className="w-full text-left border-collapse text-[10px]">
                        <thead>
                          <tr className="border-b border-border text-[8px] uppercase tracking-wider font-extrabold text-muted-foreground select-none">
                            <th className="pb-3 pl-2">Platform Domain Modules</th>
                            {PERMISSION_COLUMNS.map(col => (
                              <th key={col.key} className="pb-3 text-center w-16">{col.label}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {PERMISSION_GROUPS.map((group, groupIdx) => {
                            // Filter modules inside this group based on search query
                            const visibleModules = group.modules.filter(m => 
                              m.label.toLowerCase().includes(matrixSearchText.toLowerCase()) || 
                              group.groupName.toLowerCase().includes(matrixSearchText.toLowerCase())
                            );

                            if (visibleModules.length === 0) return null;

                            return (
                              <React.Fragment key={group.groupName}>
                                <tr className="bg-muted/10 select-none">
                                  <td colSpan={10} className="py-2 pl-2 font-black uppercase text-[8px] tracking-wide text-primary border-b border-border/30">
                                    📂 {group.groupName}
                                  </td>
                                </tr>
                                {visibleModules.map(module => (
                                  <tr key={module.key} className="border-b border-border/30 hover:bg-muted/10 transition-colors">
                                    <td className="py-3.5 pl-4 pr-3">
                                      <span className="font-extrabold text-foreground block">{module.label}</span>
                                      <span className="text-[8px] text-muted-foreground block font-medium leading-tight mt-0.5">{module.description}</span>
                                    </td>
                                    {PERMISSION_COLUMNS.map(col => {
                                      const isChecked = selectedRole.permissions[module.key]?.[col.key] || false;
                                      const isSuperAdminRole = selectedRole.name === "Super Admin";

                                      return (
                                        <td key={col.key} className="py-3.5 text-center">
                                          <input
                                            type="checkbox"
                                            checked={isChecked}
                                            disabled={isSuperAdminRole}
                                            onChange={() => handlePermissionToggle(module.key, col.key)}
                                            className="h-4 w-4 cursor-pointer accent-primary disabled:cursor-not-allowed border-border rounded text-primary focus:ring-primary/20"
                                            title={`${col.label} permission for ${module.label}`}
                                          />
                                        </td>
                                      );
                                    })}
                                  </tr>
                                ))}
                              </React.Fragment>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 👥 TAB 2: ASSIGNED USERS */}
                {activeWorkspaceTab === "users" && (
                  <div className="space-y-4 animate-fadeIn">
                    
                    {/* Add Assign Selector Row */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-border/10 pb-3">
                      <div>
                        <span className="text-[10px] font-black uppercase text-foreground">User Assignment Controller</span>
                        <p className="text-[9px] text-muted-foreground mt-0.5">Assign users to role. Assigned users will automatically assume the role matrix privileges.</p>
                      </div>
                      
                      <div className="flex gap-2 w-full sm:w-auto">
                        <select
                          onChange={(e) => {
                            if (e.target.value !== "none") {
                              handleAssignUser(e.target.value);
                              e.target.value = "none";
                            }
                          }}
                          className="h-8 border border-border rounded bg-card px-2 text-[10px] font-bold focus:outline-none"
                        >
                          <option value="none">Assign new User...</option>
                          {localUsersList
                            .filter(u => !selectedRole.assignedUsers.includes(u.id))
                            .map(u => (
                              <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                            ))
                          }
                        </select>
                      </div>
                    </div>

                    {/* Bulk Selection control bar */}
                    {selectedUserIds.length > 0 && (
                      <div className="bg-primary/5 border border-primary/20 p-2.5 rounded-card flex items-center justify-between">
                        <span className="text-[9px] text-primary font-black uppercase">Selected {selectedUserIds.length} users</span>
                        <div className="flex items-center gap-1.5">
                          <select
                            value={bulkRoleSelect}
                            onChange={(e) => setBulkRoleSelect(e.target.value)}
                            className="h-7 border border-border rounded bg-card px-2 text-[9px] focus:outline-none"
                          >
                            {roles.map(r => (
                              <option key={r.id} value={r.id}>{r.name}</option>
                            ))}
                          </select>
                          <Button size="sm" onClick={handleBulkUserAssign} className="h-7 text-[9px] font-bold">
                            Bulk Assign Role
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Assigned User List */}
                    <div className="space-y-2 max-h-[350px] overflow-y-auto">
                      {selectedRole.assignedUsers.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground/60">
                          No users assigned to this role. Add users from the selection tools above.
                        </div>
                      ) : (
                        localUsersList
                          .filter(u => selectedRole.assignedUsers.includes(u.id))
                          .map(user => {
                            const isChecked = selectedUserIds.includes(user.id);
                            return (
                              <div key={user.id} className="border border-border/40 p-3 rounded-card bg-muted/5 hover:border-primary/20 transition-all flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedUserIds([...selectedUserIds, user.id]);
                                      } else {
                                        setSelectedUserIds(selectedUserIds.filter(uid => uid !== user.id));
                                      }
                                    }}
                                    className="rounded border-border text-primary focus:ring-primary/20 cursor-pointer h-3.5 w-3.5"
                                  />
                                  <div className="space-y-0.5">
                                    <span className="font-extrabold text-foreground block text-[11px]">{user.name}</span>
                                    <span className="text-[9px] text-muted-foreground block">{user.email}</span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  {/* Transfer role selector */}
                                  <select
                                    onChange={(e) => {
                                      if (e.target.value !== selectedRoleId) {
                                        handleTransferUser(user.id, e.target.value);
                                      }
                                    }}
                                    value={selectedRoleId}
                                    className="h-7 border border-border rounded bg-card px-2 text-[9px] font-bold focus:outline-none"
                                  >
                                    {roles.map(r => (
                                      <option key={r.id} value={r.id}>Move: {r.name}</option>
                                    ))}
                                  </select>

                                  <button
                                    onClick={() => handleRemoveUser(user.id)}
                                    className="p-1.5 hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 rounded border border-border/20 transition-colors"
                                    title="Unassign user"
                                  >
                                    <Trash2 size={11} />
                                  </button>
                                </div>
                              </div>
                            );
                          })
                      )}
                    </div>
                  </div>
                )}

                {/* 🔍 TAB 3: EFFECTIVE PERMISSIONS */}
                {activeWorkspaceTab === "effective" && (
                  <div className="space-y-4 animate-fadeIn">
                    <div>
                      <span className="text-[10px] font-black uppercase text-foreground">Effective Role Permissions Summary</span>
                      <p className="text-[9px] text-muted-foreground mt-0.5">Below is a calculated overview explaining allowed operations versus prohibited operations based on the active matrix schema.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Allowed Card */}
                      <Card className="p-4 border-emerald-500/20 bg-emerald-500/5 rounded-card space-y-3">
                        <div className="flex items-center gap-1.5 border-b border-emerald-500/10 pb-1.5">
                          <Check size={14} className="text-emerald-500" />
                          <span className="font-extrabold text-[10px] text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Permitted Modules ({
                            Object.keys(selectedRole.permissions).filter(k => 
                              Object.values(selectedRole.permissions[k as ModuleName]).some(v => v)
                            ).length
                          })</span>
                        </div>
                        
                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                          {Object.keys(selectedRole.permissions).map(k => {
                            const m = k as ModuleName;
                            const activeCols = Object.keys(selectedRole.permissions[m]).filter(pk => 
                              selectedRole.permissions[m][pk as PermissionColumn]
                            );
                            if (activeCols.length === 0) return null;

                            return (
                              <div key={m} className="bg-card p-2 rounded border border-emerald-500/10">
                                <span className="font-black text-foreground capitalize text-[9px]">{m.replace("_", " ")}</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {activeCols.map(c => (
                                    <span key={c} className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.2 rounded text-[7px] font-black uppercase">
                                      {c}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </Card>

                      {/* Prohibited Card */}
                      <Card className="p-4 border-rose-500/20 bg-rose-500/5 rounded-card space-y-3">
                        <div className="flex items-center gap-1.5 border-b border-rose-500/10 pb-1.5">
                          <X size={14} className="text-rose-500" />
                          <span className="font-extrabold text-[10px] text-rose-600 dark:text-rose-400 uppercase tracking-wider">Forbidden Modules ({
                            Object.keys(selectedRole.permissions).filter(k => 
                              Object.values(selectedRole.permissions[k as ModuleName]).every(v => !v)
                            ).length
                          })</span>
                        </div>

                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                          {Object.keys(selectedRole.permissions).map(k => {
                            const m = k as ModuleName;
                            const activeCols = Object.keys(selectedRole.permissions[m]).filter(pk => 
                              selectedRole.permissions[m][pk as PermissionColumn]
                            );
                            if (activeCols.length > 0) return null;

                            return (
                              <div key={m} className="bg-card p-2 rounded border border-rose-500/10 flex items-center justify-between">
                                <span className="font-black text-foreground capitalize text-[9px]">{m.replace("_", " ")}</span>
                                <span className="text-[7px] font-black text-rose-500 uppercase bg-rose-500/10 px-2 py-0.2 rounded">Blocked</span>
                              </div>
                            );
                          })}
                        </div>
                      </Card>
                    </div>
                  </div>
                )}

                {/* 🎭 TAB 4: SIMULATION PREVIEW */}
                {activeWorkspaceTab === "simulation" && (
                  <div className="space-y-4 animate-fadeIn">
                    <div>
                      <span className="text-[10px] font-black uppercase text-foreground">Interactive Screen Simulation Preview</span>
                      <p className="text-[9px] text-muted-foreground mt-0.5">Preview a simulated mockup layout showing what the platform workspace screen layout looks like for this active role.</p>
                    </div>

                    <Card className="p-4 border-border bg-muted/10 rounded-card flex flex-col gap-3 overflow-hidden select-none">
                      {/* Top Bar Mock */}
                      <div className="bg-card border border-border/60 p-2.5 rounded flex items-center justify-between text-[9px]">
                        <span className="font-black text-primary">🏫 EduEarn LMS Portal</span>
                        <div className="flex items-center gap-1.5">
                          <span className="bg-primary/10 text-primary px-2 py-0.2 rounded font-black uppercase text-[7px]">{selectedRole.name} View</span>
                          <span className="text-muted-foreground font-bold">Active User Session</span>
                        </div>
                      </div>

                      {/* Content view mockup based on allowed sections */}
                      <div className="border border-border/30 rounded p-4 bg-card min-h-[220px] flex flex-col justify-center items-center text-center gap-2">
                        {selectedRole.name === "Super Admin" || selectedRole.permissions.users.view ? (
                          <>
                            <div className="w-10 h-10 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center text-primary">
                              <ShieldCheck size={18} />
                            </div>
                            <h5 className="font-extrabold text-foreground uppercase tracking-wide">Enterprise Administrative Root System Console</h5>
                            <p className="text-[9px] text-muted-foreground max-w-sm">Full read/write capability to adjust configurations, ban accounts, issue payouts, edit matrices, and download audit logs.</p>
                          </>
                        ) : selectedRole.name === "Tutor" || selectedRole.permissions.courses.create ? (
                          <>
                            <div className="w-10 h-10 bg-indigo-500/10 border border-indigo-500/20 rounded-full flex items-center justify-center text-indigo-500">
                              <Play size={18} />
                            </div>
                            <h5 className="font-extrabold text-foreground uppercase tracking-wide">Tutor LMS Workspace studio</h5>
                            <p className="text-[9px] text-muted-foreground max-w-sm">Create courses, schedule interactive live mentoring webinars, edit syllabus, grade assignments, and request NEFT bank withdrawals.</p>
                          </>
                        ) : selectedRole.name === "Student" ? (
                          <>
                            <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center text-emerald-500">
                              <UserCheck size={18} />
                            </div>
                            <h5 className="font-extrabold text-foreground uppercase tracking-wide">Learner Marketplace Dashboard</h5>
                            <p className="text-[9px] text-muted-foreground max-w-sm">Browse catalog courses, watch recorded sessions, complete MCQs quizzes, and issue blockchain verified completions certificates.</p>
                          </>
                        ) : selectedRole.name === "Finance" || selectedRole.permissions.payments.view ? (
                          <>
                            <div className="w-10 h-10 bg-sky-500/10 border border-sky-500/20 rounded-full flex items-center justify-center text-sky-500">
                              <BarChart3 size={18} />
                            </div>
                            <h5 className="font-extrabold text-foreground uppercase tracking-wide">Finance &amp; Ledger Hub</h5>
                            <p className="text-[9px] text-muted-foreground max-w-sm">Audit course revenues, commission ratios, approve tutor payouts, and generate Excel statement logs.</p>
                          </>
                        ) : (
                          <>
                            <div className="w-10 h-10 bg-slate-500/10 border border-slate-500/20 rounded-full flex items-center justify-center text-slate-500">
                              <Lock size={18} />
                            </div>
                            <h5 className="font-extrabold text-foreground uppercase tracking-wide">Restricted Desk Console</h5>
                            <p className="text-[9px] text-muted-foreground max-w-sm">Basic platform access dashboard. Adjustments features are locked under role matrix guidelines.</p>
                          </>
                        )}
                      </div>
                    </Card>
                  </div>
                )}

                {/* 🔄 TAB 5: COMPARATIVE STUDY */}
                {activeWorkspaceTab === "comparison" && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/10 pb-3">
                      <div>
                        <span className="text-[10px] font-black uppercase text-foreground">Interactive Side-by-Side Comparison</span>
                        <p className="text-[9px] text-muted-foreground mt-0.5">Compare permission matrices between two roles with highlighted overrides.</p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground font-bold">Compare with:</span>
                        <select
                          value={compareTargetRoleId}
                          onChange={(e) => setCompareTargetRoleId(e.target.value)}
                          className="h-8 border border-border rounded bg-card px-2 text-[10px] font-bold focus:outline-none"
                        >
                          {roles.map(r => (
                            <option key={r.id} value={r.id}>{r.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Comparison table */}
                    <div className="overflow-x-auto max-h-[380px] overflow-y-auto">
                      <table className="w-full text-left border-collapse text-[9px]">
                        <thead>
                          <tr className="border-b border-border text-[8px] uppercase tracking-wider font-extrabold text-muted-foreground select-none">
                            <th className="pb-3 pl-2">Module Action</th>
                            <th className="pb-3 text-center bg-primary/5 text-primary">{selectedRole.name}</th>
                            <th className="pb-3 text-center">Compare target: {roles.find(r => r.id === compareTargetRoleId)?.name}</th>
                            <th className="pb-3 text-center">Access Difference Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(() => {
                            const targetRole = roles.find(r => r.id === compareTargetRoleId);
                            if (!targetRole) return null;

                            return PERMISSION_GROUPS.flatMap(group => {
                              return group.modules.flatMap(mod => {
                                return PERMISSION_COLUMNS.map(col => {
                                  const valA = selectedRole.permissions[mod.key]?.[col.key] || false;
                                  const valB = targetRole.permissions[mod.key]?.[col.key] || false;
                                  const isDifferent = valA !== valB;

                                  return (
                                    <tr 
                                      key={`${mod.key}-${col.key}`} 
                                      className={cn(
                                        "border-b border-border/20 hover:bg-muted/10 transition-colors",
                                        isDifferent && "bg-amber-500/5"
                                      )}
                                    >
                                      <td className="py-2.5 pl-2">
                                        <span className="font-extrabold capitalize text-foreground">{mod.label}</span>
                                        <span className="text-muted-foreground font-bold ml-1">({col.label})</span>
                                      </td>
                                      <td className="py-2.5 text-center font-black">
                                        {valA ? (
                                          <span className="text-emerald-500">✓ Enabled</span>
                                        ) : (
                                          <span className="text-rose-500">✕ Blocked</span>
                                        )}
                                      </td>
                                      <td className="py-2.5 text-center font-black">
                                        {valB ? (
                                          <span className="text-emerald-500">✓ Enabled</span>
                                        ) : (
                                          <span className="text-rose-500">✕ Blocked</span>
                                        )}
                                      </td>
                                      <td className="py-2.5 text-center select-none">
                                        {isDifferent ? (
                                          <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[8px] font-black uppercase px-2 py-0.2 rounded border border-amber-500/25">
                                            ⚠️ Difference
                                          </span>
                                        ) : (
                                          <span className="text-muted-foreground/60 font-semibold italic">Identical</span>
                                        )}
                                      </td>
                                    </tr>
                                  );
                                });
                              });
                            });
                          })()}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 📜 TAB 6: VERSION HISTORY */}
                {activeWorkspaceTab === "history" && (
                  <div className="space-y-4 animate-fadeIn">
                    <div>
                      <span className="text-[10px] font-black uppercase text-foreground">Permissions version tracking snapshot</span>
                      <p className="text-[9px] text-muted-foreground mt-0.5">Restoring to a previous version rolls permissions back. Changes will immediately sync to active user sessions.</p>
                    </div>

                    <div className="space-y-2 max-h-[350px] overflow-y-auto">
                      {!selectedRole.versionHistory || selectedRole.versionHistory.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground/60">
                          No previous configuration snapshots found. Change permissions in the matrix to generate version logs.
                        </div>
                      ) : (
                        selectedRole.versionHistory.map((version, idx) => (
                          <div key={version.versionId} className="border border-border/40 p-3 rounded-card bg-muted/5 hover:border-primary/20 transition-all flex items-center justify-between gap-3">
                            <div className="space-y-0.5">
                              <span className="font-extrabold text-foreground block text-[11px]">
                                Version {selectedRole.versionHistory.length - idx} • {version.action}
                              </span>
                              <span className="text-[9px] text-muted-foreground block">
                                Modified by {version.updatedBy} on {new Date(version.timestamp).toLocaleString()}
                              </span>
                            </div>

                            <button
                              onClick={() => handleRestoreVersion(version)}
                              className="h-7 px-3 bg-primary/10 border border-primary/25 hover:bg-primary/20 text-primary text-[9px] font-black uppercase rounded transition-colors focus:outline-none"
                            >
                              Restore
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* 📊 TAB 7: ANALYTICS PERFORMANCE CHART */}
                {activeWorkspaceTab === "analytics" && (
                  <div className="space-y-6 animate-fadeIn select-none">
                    <div>
                      <span className="text-[10px] font-black uppercase text-foreground">Role Distribution &amp; Usage statistics</span>
                      <p className="text-[9px] text-muted-foreground mt-0.5">Pedagogical visual analysis of how roles are used and permission rates inside the application.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Bar Indicator chart */}
                      <Card className="p-4 border-border bg-card shadow-soft space-y-3">
                        <span className="font-extrabold text-[10px] uppercase text-muted-foreground block">Assigned Users per Role</span>
                        <div className="space-y-3.5 pt-2">
                          {roleChartMetrics.labels.map((label, idx) => {
                            const count = roleChartMetrics.userCounts[idx];
                            const maxVal = Math.max(...roleChartMetrics.userCounts) || 1;
                            const percent = Math.round((count / maxVal) * 100);

                            return (
                              <div key={label} className="space-y-1">
                                <div className="flex items-center justify-between text-[9px]">
                                  <span className="font-extrabold text-foreground">{label}</span>
                                  <span className="text-muted-foreground font-bold">{count} users</span>
                                </div>
                                <div className="h-2 w-full bg-muted/30 rounded-full overflow-hidden border border-border/10">
                                  <div 
                                    className="bg-primary h-full rounded-full transition-all duration-500" 
                                    style={{ width: `${percent || 2}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </Card>

                      {/* Matrix Density Indicator card */}
                      <Card className="p-4 border-border bg-card shadow-soft space-y-3">
                        <span className="font-extrabold text-[10px] uppercase text-muted-foreground block">Matrix Permissions Density (%)</span>
                        <div className="space-y-3.5 pt-2">
                          {roleChartMetrics.labels.map((label, idx) => {
                            const percent = roleChartMetrics.activePercent[idx];
                            
                            return (
                              <div key={label} className="space-y-1">
                                <div className="flex items-center justify-between text-[9px]">
                                  <span className="font-extrabold text-foreground">{label}</span>
                                  <span className="text-muted-foreground font-bold">{percent}% access rate</span>
                                </div>
                                <div className="h-2 w-full bg-muted/30 rounded-full overflow-hidden border border-border/10">
                                  <div 
                                    className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                                    style={{ width: `${percent}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </Card>

                    </div>
                  </div>
                )}

              </Card>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              Select a role from the left pane to edit permissions.
            </div>
          )}
        </div>

      </div>

      {/* 📜 BOTTOM ROW: AUDIT TRAIL TIMELINE & IMPORTER */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left: Audit Timeline (2 columns) */}
        <div className="xl:col-span-2">
          <Card className="p-5 border-border bg-card shadow-soft space-y-4">
            <div className="flex items-center gap-1.5 border-b border-border/20 pb-2">
              <History size={14} className="text-primary" />
              <span className="text-xs font-heading font-extrabold uppercase text-foreground">Access Change Activity Timeline</span>
            </div>

            <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
              {auditLogs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground/60">
                  No log activity records found.
                </div>
              ) : (
                auditLogs.map(log => (
                  <div key={log.id} className="relative pl-6 border-l-2 border-border/60 pb-3 last:pb-0">
                    <div className="absolute left-[-5px] top-1.5 w-2.5 h-2.5 rounded-full bg-primary border border-card" />
                    
                    <div className="space-y-0.5">
                      <div className="flex flex-wrap items-center justify-between gap-1 text-[9px]">
                        <span className="font-extrabold text-foreground">{log.action}</span>
                        <span className="text-muted-foreground/60 font-medium">IP: {log.ip} • {new Date(log.timestamp).toLocaleString()}</span>
                      </div>
                      <p className="text-[8px] text-muted-foreground font-semibold leading-relaxed">
                        Actor: <span className="text-foreground">{log.actor}</span> | Target Role: <span className="text-foreground">{log.roleName}</span> | Details: <span className="italic text-rose-500 font-bold">{log.oldValue} ➔ {log.newValue}</span>
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Right: Importers & Template desk */}
        <div className="xl:col-span-1">
          <Card className="p-5 border-border bg-card shadow-soft flex flex-col justify-between min-h-[220px]">
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 border-b border-border/20 pb-2">
                <Download size={14} className="text-primary" />
                <span className="text-xs font-heading font-extrabold uppercase text-foreground">Import &amp; Export Config</span>
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed leading-normal">
                Back up or migrate custom role matrices schema configurations. Use JSON role template loaders to seed platform configurations quickly.
              </p>
            </div>

            <div className="space-y-2.5 pt-4">
              <label className="w-full h-9 border border-border hover:bg-muted text-foreground text-[10px] font-bold uppercase tracking-wider rounded transition-colors cursor-pointer flex items-center justify-center gap-1.5">
                <Upload size={13} className="text-primary" />
                <span>Import JSON Template</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportJSON}
                  className="hidden"
                />
              </label>

              <button
                onClick={handleExportJSON}
                className="w-full h-9 border border-border hover:bg-muted text-foreground text-[10px] font-bold uppercase tracking-wider rounded transition-colors cursor-pointer flex items-center justify-center gap-1.5 focus:outline-none"
              >
                <Download size={13} className="text-primary" />
                <span>Export JSON Template</span>
              </button>
            </div>
          </Card>
        </div>

      </div>

      {/* --- OVERLAY MODALS --- */}

      {/* 1. CREATE ROLE MODAL */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateModal(false)}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm cursor-pointer"
            />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card border border-border shadow-premium rounded-modal w-full max-w-sm p-6 relative z-10 text-left space-y-4"
            >
              <div className="flex items-center gap-2 text-primary border-b border-border/20 pb-2">
                <UserPlus size={18} className="shrink-0" />
                <span className="font-heading font-extrabold uppercase tracking-wide text-foreground">Create Custom Role</span>
              </div>
              
              <form onSubmit={handleCreateRole} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-wider text-muted-foreground font-black">Role Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tutor Manager"
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                    className="w-full h-9 border border-border rounded bg-muted/15 px-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary/20 text-foreground"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-wider text-muted-foreground font-black">Role Description</label>
                  <textarea
                    placeholder="Enter role responsibilities..."
                    value={newRoleDesc}
                    onChange={(e) => setNewRoleDesc(e.target.value)}
                    className="w-full min-h-[60px] border border-border rounded bg-muted/15 p-2.5 text-xs font-semibold focus:outline-none text-foreground"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-wider text-muted-foreground font-black">Clone Permissions From</label>
                  <select
                    value={cloneSourceRoleId}
                    onChange={(e) => setCloneSourceRoleId(e.target.value)}
                    className="w-full h-9 border border-border rounded bg-card px-3 text-xs font-semibold focus:outline-none text-foreground"
                  >
                    <option value="none">No cloning (start clean)</option>
                    {roles.map(r => (
                      <option key={r.id} value={r.id}>Copy: {r.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCreateModal(false)}
                    className="text-xs font-bold uppercase h-9"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    className="h-9 px-4 text-xs font-bold uppercase"
                  >
                    Create
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. RENAME ROLE MODAL */}
      <AnimatePresence>
        {showRenameModal && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRenameModal(false)}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm cursor-pointer"
            />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card border border-border shadow-premium rounded-modal w-full max-w-xs p-6 relative z-10 text-left space-y-4"
            >
              <div className="flex items-center gap-2 text-primary border-b border-border/20 pb-2">
                <Edit2 size={16} className="shrink-0" />
                <span className="font-heading font-extrabold uppercase tracking-wide text-foreground">Rename Role</span>
              </div>
              
              <form onSubmit={handleRenameRole} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-wider text-muted-foreground font-black">New Role Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter name..."
                    value={renamedRoleName}
                    onChange={(e) => setRenamedRoleName(e.target.value)}
                    className="w-full h-9 border border-border rounded bg-muted/15 px-3 text-xs font-semibold focus:outline-none text-foreground"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowRenameModal(false)}
                    className="text-xs font-bold uppercase h-9"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    className="h-9 px-4 text-xs font-bold uppercase"
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
