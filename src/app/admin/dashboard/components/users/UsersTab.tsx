// src/app/admin/dashboard/components/users/UsersTab.tsx

"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, ShieldCheck, Trash2, Mail, ShieldAlert, Award, 
  FileText, CheckCircle2, Sparkles, X, Eye, Video, Calendar, 
  RefreshCw, ChevronLeft, ChevronRight, SlidersHorizontal, 
  ExternalLink, User, Check, AlertCircle, Info, Ban, UserCheck,
  Brain, Phone, MapPin, Laptop, Compass, FileSpreadsheet, Download, 
  Plus, Copy, Upload, ArrowRightLeft, AlertTriangle, Key
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/utils/cn";
import { AdminUser, TutorVerificationApp as VerificationApp } from "@/lib/types/admin";

interface UsersTabProps {
  users: AdminUser[];
  setUsers: React.Dispatch<React.SetStateAction<AdminUser[]>>;
  verifications: VerificationApp[];
  setVerifications: React.Dispatch<React.SetStateAction<VerificationApp[]>>;
  onApproveTutor: (id: string) => void;
  onRejectTutor: (id: string) => void;
  logAuditAction: (actionStr: string) => void;
  isLoading?: boolean;
  activeTab?: string;
}

// --- EXTENDED TYPES FOR ENTERPRISE DATA ---
interface UserActivity {
  id: string;
  type: "Registration" | "Profile Update" | "Role Change" | "Login Event" | "Course Creation" | "Course Completion";
  detail: string;
  timestamp: string;
}

interface UserLoginHistory {
  id: string;
  timestamp: string;
  device: string;
  browser: string;
  location: string;
  ip: string;
}

interface UserDetailRecord {
  phone: string;
  department: string;
  lastLogin: string;
  verificationStatus: "Verified" | "Pending" | "Unverified";
  coursesCount: number;
  location: string;
  dob: string;
  activities: UserActivity[];
  loginHistory: UserLoginHistory[];
  documents: Array<{ name: string; url: string }>;
}

// Global scope counter to avoid impure functions inside components
let userManagementCounter = 0;
const generatePureUserId = (prefix: string): string => {
  userManagementCounter++;
  return `${prefix}_${userManagementCounter}_${Math.floor(Math.sin(userManagementCounter) * 100000).toString().replace("-", "")}`;
};

export default function UsersTab({
  users,
  setUsers,
  verifications,
  setVerifications,
  onApproveTutor,
  onRejectTutor,
  logAuditAction,
  isLoading = false,
  activeTab
}: UsersTabProps) {
  // --- STATE VARIABLES ---
  const [currentTime] = useState(() => Date.now());
  const [roleFilter, setRoleFilter] = useState<string>(() => {
    if (activeTab === "tutors") return "tutor-roster";
    if (activeTab === "admin") return "admin";
    if (activeTab === "tutor-verification") return "tutor";
    return "learner";
  });

  useEffect(() => {
    if (activeTab === "tutors") {
      setRoleFilter("tutor-roster");
    } else if (activeTab === "students" || activeTab === "users" || activeTab === "learners") {
      setRoleFilter("learner");
    } else if (activeTab === "admin") {
      setRoleFilter("admin");
    } else if (activeTab === "tutor-verification") {
      setRoleFilter("tutor");
    }
  }, [activeTab]);
  const [userSearch, setUserSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  // Custom Filter State
  const [deptFilter, setDeptFilter] = useState<string>("all");
  const [verifyFilter, setVerifyFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [loginFilter, setLoginFilter] = useState<string>("all");

  // Advanced selection states
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [bulkRoleSelect, setBulkRoleSelect] = useState("student");
  const [selectedUserProfile, setSelectedUserProfile] = useState<AdminUser | null>(null);
  
  const [grantCoinsAmount, setGrantCoinsAmount] = useState<number>(0);
  const [isGrantingCoins, setIsGrantingCoins] = useState(false);

  // Tutor App states
  const [appSearch, setAppSearch] = useState<string>("");
  const [appStatusFilter, setAppStatusFilter] = useState<string>("all");
  const [selectedApp, setSelectedApp] = useState<VerificationApp | null>(null);

  // Drawer custom tabs
  const [drawerActiveTab, setDrawerActiveTab] = useState<"details" | "rbac" | "activities" | "history" | "courses">("details");

  // Pagination
  const [userPage, setUserPage] = useState(1);
  const [appPage, setAppPage] = useState(1);
  const itemsPerPage = 8;

  // Decision & Notes states inside Drawer
  const [adminNotes, setAdminNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [showInterviewForm, setShowInterviewForm] = useState(false);
  const [interviewDate, setInterviewDate] = useState("");
  const [interviewTime, setInterviewTime] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  // Security
  const activeAdminUserId = "u-4"; // Sanjay Dutt

  // --- PERSISTENT USER DETAILS STORE ---
  const [userDetails, setUserDetails] = useState<Record<string, UserDetailRecord>>({});

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("eduearn_user_details_registry");
    if (saved) {
      try {
        setUserDetails(JSON.parse(saved));
        return;
      } catch (e) {}
    }

    // Initialize mock detailed data for seeded users
    const mockDetails: Record<string, UserDetailRecord> = {
      "u-1": {
        phone: "+91 98765 43210",
        department: "Academic",
        lastLogin: new Date(Date.now() - 3600000 * 2).toISOString(),
        verificationStatus: "Verified",
        coursesCount: 3,
        location: "New Delhi, India",
        dob: "2002-05-15",
        activities: [
          { id: "act-1", type: "Registration", detail: "Account registered successfully", timestamp: "2026-06-01T10:00:00Z" },
          { id: "act-2", type: "Login Event", detail: "Logged in via Chrome/Windows", timestamp: new Date(Date.now() - 3600000 * 2).toISOString() }
        ],
        loginHistory: [
          { id: "lh-1", timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), device: "Windows Desktop", browser: "Chrome 124", location: "New Delhi, India", ip: "192.168.1.101" }
        ],
        documents: [{ name: "Student ID Card", url: "/mock-id.jpg" }]
      },
      "u-2": {
        phone: "+91 87654 32109",
        department: "Academic",
        lastLogin: new Date(Date.now() - 3600000 * 1).toISOString(),
        verificationStatus: "Verified",
        coursesCount: 2,
        location: "Mumbai, India",
        dob: "1994-08-22",
        activities: [
          { id: "act-1", type: "Registration", detail: "Tutor profile created", timestamp: "2026-05-15T09:00:00Z" },
          { id: "act-2", type: "Course Creation", detail: "Published course: Mastering React Native Hooks", timestamp: "2026-05-20T14:00:00Z" }
        ],
        loginHistory: [
          { id: "lh-1", timestamp: new Date(Date.now() - 3600000 * 1).toISOString(), device: "MacBook Pro", browser: "Safari 17", location: "Mumbai, India", ip: "192.168.1.102" }
        ],
        documents: [{ name: "Tutor Degree scan", url: "/degree.pdf" }]
      },
      "u-3": {
        phone: "+91 76543 21098",
        department: "Academic",
        lastLogin: new Date(Date.now() - 3600000 * 24).toISOString(),
        verificationStatus: "Verified",
        coursesCount: 4,
        location: "Ahmedabad, India",
        dob: "1991-11-05",
        activities: [
          { id: "act-1", type: "Registration", detail: "Tutor profile created", timestamp: "2026-05-20T11:00:00Z" },
          { id: "act-2", type: "Course Creation", detail: "Published course: Kuchipudi Mudras", timestamp: "2026-05-25T15:30:00Z" }
        ],
        loginHistory: [
          { id: "lh-1", timestamp: new Date(Date.now() - 3600000 * 24).toISOString(), device: "Windows Laptop", browser: "Firefox 125", location: "Ahmedabad, India", ip: "192.168.1.103" }
        ],
        documents: [{ name: "Teaching Credentials certificate", url: "/certs.pdf" }]
      },
      "u-4": {
        phone: "+91 65432 10987",
        department: "Executive",
        lastLogin: new Date().toISOString(),
        verificationStatus: "Verified",
        coursesCount: 0,
        location: "Pune, India",
        dob: "1988-02-18",
        activities: [
          { id: "act-1", type: "Registration", detail: "Super Admin account initiated", timestamp: "2026-04-10T08:00:00Z" },
          { id: "act-2", type: "Role Change", detail: "Assigned own Super Admin credentials", timestamp: "2026-04-10T08:15:00Z" }
        ],
        loginHistory: [
          { id: "lh-1", timestamp: new Date().toISOString(), device: "Mac Studio", browser: "Chrome 124", location: "Pune, India", ip: "192.168.1.104" }
        ],
        documents: []
      },
      "u-5": {
        phone: "+91 54321 09876",
        department: "Academic",
        lastLogin: new Date(Date.now() - 3600000 * 48).toISOString(),
        verificationStatus: "Unverified",
        coursesCount: 1,
        location: "Chennai, India",
        dob: "2001-09-30",
        activities: [
          { id: "act-1", type: "Registration", detail: "Student account registered", timestamp: "2026-06-25T16:00:00Z" }
        ],
        loginHistory: [
          { id: "lh-1", timestamp: new Date(Date.now() - 3600000 * 48).toISOString(), device: "Android Phone", browser: "Chrome Mobile", location: "Chennai, India", ip: "192.168.1.105" }
        ],
        documents: []
      }
    };
    setUserDetails(mockDetails);
    localStorage.setItem("eduearn_user_details_registry", JSON.stringify(mockDetails));
  }, []);

  const saveDetailsRegistry = (registry: Record<string, UserDetailRecord>) => {
    setUserDetails(registry);
    localStorage.setItem("eduearn_user_details_registry", JSON.stringify(registry));
  };

  const getOrInitUserDetail = (userId: string): UserDetailRecord => {
    if (userDetails[userId]) return userDetails[userId];
    const newDetail: UserDetailRecord = {
      phone: "+91 99999 88888",
      department: "Academic",
      lastLogin: new Date().toISOString(),
      verificationStatus: "Unverified",
      coursesCount: 0,
      location: "India",
      dob: "2000-01-01",
      activities: [{ id: "act-1", type: "Registration", detail: "Account registered successfully", timestamp: new Date().toISOString() }],
      loginHistory: [{ id: "lh-1", timestamp: new Date().toISOString(), device: "Unknown Device", browser: "Web Browser", location: "India", ip: "127.0.0.1" }],
      documents: []
    };
    const updated = { ...userDetails, [userId]: newDetail };
    saveDetailsRegistry(updated);
    return newDetail;
  };

  // --- MOCKED SYSTEM AUDIT TRAIL LOGGING ---
  const recordSystemAuditLog = (action: string, userName: string, oldValue: string, newValue: string) => {
    const newLog = {
      id: generatePureUserId("audit"),
      timestamp: new Date().toISOString(),
      actor: "Super Admin",
      action,
      roleName: userName,
      oldValue,
      newValue,
      ip: "192.168.1.100"
    };

    // Push to shared local storage audit logs
    const saved = localStorage.getItem("eduearn_rbac_audit_logs");
    let currentLogs = [];
    if (saved) {
      try { currentLogs = JSON.parse(saved); } catch (e) {}
    }
    const updatedLogs = [newLog, ...currentLogs];
    localStorage.setItem("eduearn_rbac_audit_logs", JSON.stringify(updatedLogs));

    // Push to shared notifications desk
    const savedNotes = localStorage.getItem("eduearn_rbac_notifications");
    let currentNotes = [];
    if (savedNotes) {
      try { currentNotes = JSON.parse(savedNotes); } catch (e) {}
    }
    const newNote = {
      id: generatePureUserId("note"),
      timestamp: new Date().toISOString(),
      title: action,
      message: `User "${userName}" updated: ${oldValue} ➔ ${newValue}`,
      type: "info" as const
    };
    localStorage.setItem("eduearn_rbac_notifications", JSON.stringify([newNote, ...currentNotes]));

    logAuditAction(`[User Manager] ${action} on ${userName}`);
  };

  // --- DUAL PERSISTENCE SYNCHRONIZED UPDATE HANDLERS ---
  const handleUpdateUserStatus = (userId: string, nextStatus: string) => {
    // Security check: Super Admin Sanjay Dutt cannot lock himself out
    if (userId === activeAdminUserId && nextStatus !== "Active") {
      toast.error("Security Lock: You cannot lock or suspend your own Super Admin account.");
      return;
    }

    const matchedUser = users.find(u => u.id === userId);
    if (!matchedUser) return;

    const updated = users.map(u => {
      if (u.id === userId) {
        return { ...u, status: nextStatus };
      }
      return u;
    });

    setUsers(updated);
    if (selectedUserProfile && selectedUserProfile.id === userId) {
      setSelectedUserProfile({ ...selectedUserProfile, status: nextStatus });
    }

    recordSystemAuditLog("Account Status Changed", matchedUser.name, matchedUser.status, nextStatus);
    toast.success(`Account status updated to ${nextStatus}.`);
  };

  const handleResetPasswordLink = (userId: string) => {
    const matchedUser = users.find(u => u.id === userId);
    if (!matchedUser) return;

    recordSystemAuditLog("Password Reset Initiated", matchedUser.name, "Dispatched link", "Reset Requested");
    toast.success(`Reset link dispatched to ${matchedUser.email}.`);
  };

  const handleVerifyEmailManual = (userId: string) => {
    const matchedUser = users.find(u => u.id === userId);
    if (!matchedUser) return;

    const reg = getOrInitUserDetail(userId);
    const updatedReg = {
      ...userDetails,
      [userId]: {
        ...reg,
        verificationStatus: "Verified" as const
      }
    };
    saveDetailsRegistry(updatedReg);

    recordSystemAuditLog("Manual Email Verification", matchedUser.name, "Unverified", "Verified");
    toast.success("Account email verification set to complete.");
  };

  const handleForceLogoutSession = (userId: string) => {
    const matchedUser = users.find(u => u.id === userId);
    if (!matchedUser) return;

    recordSystemAuditLog("Session Terminated", matchedUser.name, "Active Session", "Forced Logout");
    toast.success("All active web sessions terminated.");
  };

  // --- ROLE INTEGRATION WORKSPACE INTERFACE MAPPINGS ---
  const handleModifyUserRole = (userId: string, nextRoleName: string) => {
    // Security check: Sanjay Dutt u-4 cannot remove his own Super Admin role
    if (userId === activeAdminUserId && nextRoleName !== "Super Admin" && nextRoleName !== "super_admin") {
      toast.error("Security Lock: You cannot revoke your own Super Admin access.");
      return;
    }

    const matchedUser = users.find(u => u.id === userId);
    if (!matchedUser) return;

    const oldRole = matchedUser.role;
    // Map clean legacy strings for filters compatibility
    const legacyRoleVal = nextRoleName === "Super Admin" ? "super_admin" : nextRoleName === "Student" ? "learner" : nextRoleName === "Tutor" ? "tutor" : nextRoleName.toLowerCase();

    // 1. Update user list
    const updatedUsers = users.map(u => {
      if (u.id === userId) {
        return { ...u, role: legacyRoleVal };
      }
      return u;
    });
    setUsers(updatedUsers);

    if (selectedUserProfile && selectedUserProfile.id === userId) {
      setSelectedUserProfile({ ...selectedUserProfile, role: legacyRoleVal });
    }

    // 2. Sync to eduearn_rbac_roles assignedUsers array
    const savedRoles = localStorage.getItem("eduearn_rbac_roles");
    if (savedRoles) {
      try {
        const parsedRoles = JSON.parse(savedRoles) as any[];
        const updatedRoles = parsedRoles.map(roleNode => {
          // Remove user from all roles first
          const cleanUsers = (roleNode.assignedUsers || []).filter((uid: string) => uid !== userId);
          
          // Add to target role
          if (roleNode.name.toLowerCase() === nextRoleName.toLowerCase() || roleNode.id.toLowerCase().includes(nextRoleName.toLowerCase())) {
            return {
              ...roleNode,
              assignedUsers: [...cleanUsers, userId],
              updatedAt: new Date().toISOString()
            };
          }
          return {
            ...roleNode,
            assignedUsers: cleanUsers
          };
        });
        localStorage.setItem("eduearn_rbac_roles", JSON.stringify(updatedRoles));
      } catch (e) {}
    }

    recordSystemAuditLog("Role Reassigned", matchedUser.name, oldRole, legacyRoleVal);
    toast.success(`User role updated to ${nextRoleName}.`);
  };

  // --- BULK OPERATIONS TOOLBAR ACTIONS ---
  const handleBulkStatusChange = (nextStatus: string) => {
    if (selectedUserIds.length === 0) {
      toast.warning("No users selected.");
      return;
    }

    let skipCount = 0;
    const updated = users.map(u => {
      if (selectedUserIds.includes(u.id)) {
        if (u.id === activeAdminUserId && nextStatus !== "Active") {
          skipCount++;
          return u; // Skip Super Admin Sanjay Dutt
        }
        return { ...u, status: nextStatus };
      }
      return u;
    });

    setUsers(updated);
    setSelectedUserIds([]);
    
    recordSystemAuditLog("Bulk Status Update", `${selectedUserIds.length} users`, "Status", nextStatus);
    
    if (skipCount > 0) {
      toast.warning(`Status updated. Skipped Super Admin account.`);
    } else {
      toast.success(`Successfully updated status to ${nextStatus} for selected users.`);
    }
  };

  const handleBulkVerificationUpdate = (nextVerify: "Verified" | "Unverified") => {
    if (selectedUserIds.length === 0) {
      toast.warning("No users selected.");
      return;
    }

    const updatedReg = { ...userDetails };
    selectedUserIds.forEach(uid => {
      const reg = updatedReg[uid] || {
        phone: "+91 99999 88888",
        department: "Academic",
        lastLogin: new Date().toISOString(),
        verificationStatus: "Unverified" as const,
        coursesCount: 0,
        location: "India",
        dob: "2000-01-01",
        activities: [],
        loginHistory: [],
        documents: []
      };
      updatedReg[uid] = {
        ...reg,
        verificationStatus: nextVerify
      };
    });
    saveDetailsRegistry(updatedReg);
    setSelectedUserIds([]);

    recordSystemAuditLog("Bulk Verification Update", `${selectedUserIds.length} users`, "Verify Status", nextVerify);
    toast.success(`Successfully set verification status to ${nextVerify} for selected users.`);
  };

  const handleBulkRoleReassign = () => {
    if (selectedUserIds.length === 0) {
      toast.warning("No users selected.");
      return;
    }

    // Target Role label
    const targetLabel = bulkRoleSelect === "super_admin" ? "Super Admin" : bulkRoleSelect === "admin" ? "Admin" : bulkRoleSelect === "tutor" ? "Tutor" : bulkRoleSelect === "learner" ? "Student" : bulkRoleSelect;
    const legacyRoleVal = bulkRoleSelect;

    let skipCount = 0;
    const updatedUsersList = users.map(u => {
      if (selectedUserIds.includes(u.id)) {
        if (u.id === activeAdminUserId && legacyRoleVal !== "super_admin" && legacyRoleVal !== "admin") {
          skipCount++;
          return u; // Skip Super Admin
        }
        return { ...u, role: legacyRoleVal };
      }
      return u;
    });

    // Sync to eduearn_rbac_roles
    const savedRoles = localStorage.getItem("eduearn_rbac_roles");
    if (savedRoles) {
      try {
        const parsedRoles = JSON.parse(savedRoles) as any[];
        const updatedRoles = parsedRoles.map(roleNode => {
          const cleanUsers = (roleNode.assignedUsers || []).filter((uid: string) => !selectedUserIds.includes(uid));
          
          if (roleNode.name.toLowerCase() === targetLabel.toLowerCase() || roleNode.id.toLowerCase().includes(legacyRoleVal.toLowerCase())) {
            const addedUsers = selectedUserIds.filter(uid => !(uid === activeAdminUserId && legacyRoleVal !== "super_admin" && legacyRoleVal !== "admin"));
            return {
              ...roleNode,
              assignedUsers: [...cleanUsers, ...addedUsers],
              updatedAt: new Date().toISOString()
            };
          }
          return {
            ...roleNode,
            assignedUsers: cleanUsers
          };
        });
        localStorage.setItem("eduearn_rbac_roles", JSON.stringify(updatedRoles));
      } catch (e) {}
    }

    setUsers(updatedUsersList);
    setSelectedUserIds([]);

    recordSystemAuditLog("Bulk Role Change", `${selectedUserIds.length} users`, "Multiple", targetLabel);
    
    if (skipCount > 0) {
      toast.warning("Roles updated. Skipped modifying Super Admin profile.");
    } else {
      toast.success(`Successfully reassigned selected users to ${targetLabel}.`);
    }
  };

  const handleBulkUserDeletion = () => {
    if (selectedUserIds.length === 0) {
      toast.warning("No users selected.");
      return;
    }

    if (selectedUserIds.includes(activeAdminUserId)) {
      toast.error("Security Lock: You cannot delete your own Super Admin account in bulk operations.");
      return;
    }

    if (confirm(`Are you sure you want to permanently delete the ${selectedUserIds.length} selected users? This action is irreversible.`)) {
      const updated = users.filter(u => !selectedUserIds.includes(u.id));
      setUsers(updated);
      setSelectedUserIds([]);

      recordSystemAuditLog("Bulk Accounts Deleted", `${selectedUserIds.length} users`, "Active", "Permanently Deleted");
      toast.success("Selected users permanently deleted.");
    }
  };

  // --- BULK DATA EXPORTS ---
  const handleBulkExportCSV = () => {
    if (selectedUserIds.length === 0) {
      toast.warning("No users selected.");
      return;
    }

    const selectedUsers = users.filter(u => selectedUserIds.includes(u.id));
    const headers = "ID,Name,Email,Role,Status,Created At,Coins\n";
    const rows = selectedUsers.map(u => 
      `${u.id},"${u.name}",${u.email},${u.role},${u.status},${u.createdAt},${u.walletCoins}`
    ).join("\n");
    
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `enterprise_users_bulk_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setSelectedUserIds([]);
    toast.success("CSV export dispatched successfully.");
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(users, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `users_registry_export.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success("Users JSON registry exported successfully!");
  };

  // --- SEARCH AND ADVANCED FILTERS PIPELINES ---
  const filteredUsersList = useMemo(() => {
    return users.filter(u => {
      // 1. Search term match
      const matchesSearch = 
        u.name.toLowerCase().includes(userSearch.toLowerCase()) || 
        u.email.toLowerCase().includes(userSearch.toLowerCase());
      if (!matchesSearch) return false;

      // 2. Role filter tab sync
      if (roleFilter === "learner" && u.role !== "learner" && u.role !== "student") return false;
      if (roleFilter === "tutor-roster" && u.role !== "tutor") return false;
      if (roleFilter === "admin" && u.role !== "admin" && u.role !== "super_admin") return false;

      // 3. Status filter match
      if (statusFilter !== "all" && u.status.toLowerCase() !== statusFilter.toLowerCase()) return false;

      // 4. Detail fields matching
      const detailsNode = userDetails[u.id];
      if (detailsNode) {
        if (deptFilter !== "all" && detailsNode.department.toLowerCase() !== deptFilter.toLowerCase()) return false;
        if (verifyFilter !== "all" && detailsNode.verificationStatus.toLowerCase() !== verifyFilter.toLowerCase()) return false;
        
        // Login Filter
        if (loginFilter !== "all") {
          const hoursAgo = (currentTime - new Date(detailsNode.lastLogin).getTime()) / 3600000;
          if (loginFilter === "today" && hoursAgo > 24) return false;
          if (loginFilter === "week" && hoursAgo > 168) return false;
          if (loginFilter === "inactive" && hoursAgo <= 168) return false;
        }

        // Date registration Filter
        if (dateFilter !== "all") {
          const daysAgo = (currentTime - new Date(u.createdAt).getTime()) / (3600000 * 24);
          if (dateFilter === "7days" && daysAgo > 7) return false;
          if (dateFilter === "30days" && daysAgo > 30) return false;
        }
      }

      return true;
    });
  }, [users, userSearch, roleFilter, statusFilter, deptFilter, verifyFilter, dateFilter, loginFilter, userDetails]);

  // Pagination
  const totalUserPages = Math.ceil(filteredUsersList.length / itemsPerPage) || 1;
  const paginatedUsers = useMemo(() => {
    const startIndex = (userPage - 1) * itemsPerPage;
    return filteredUsersList.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredUsersList, userPage]);

  // Reset page index on tab/filters change
  useEffect(() => {
    setUserPage(1);
  }, [roleFilter, statusFilter, deptFilter, verifyFilter, dateFilter, loginFilter, userSearch]);

  // --- STATS KPI DERIVATIONS ---
  const kpis = useMemo(() => {
    const total = users.length;
    const active = users.filter(u => u.status === "Active").length;
    const suspended = users.filter(u => u.status === "Suspended").length;
    const pendingVer = verifications.filter(v => v.status === "Pending" || v.status === "Under Review").length;
    const tutors = users.filter(u => u.role === "tutor").length;
    const students = users.filter(u => u.role === "learner" || u.role === "student").length;
    const admins = users.filter(u => u.role === "admin" || u.role === "super_admin").length;
    const recent = users.filter(u => {
      const days = (currentTime - new Date(u.createdAt).getTime()) / (3600000 * 24);
      return days <= 30;
    }).length;

    return { total, active, suspended, pendingVer, tutors, students, admins, recent };
  }, [users, verifications]);

  // --- MEMOIZED ANALYTICS DATA ---
  const activeRatioPercent = useMemo(() => {
    if (users.length === 0) return 0;
    return Math.round((kpis.active / users.length) * 100);
  }, [users, kpis.active]);

  const departmentUserShare = useMemo(() => {
    const labels = ["Academic", "Financial", "Content", "Executive"];
    const counts = labels.map(label => {
      return Object.values(userDetails).filter(detail => detail.department === label).length;
    });
    return { labels, counts };
  }, [userDetails]);

  // --- TUTOR APPLICATIONS FUNCTIONS (RETAINED WORKSPACE) ---
  const totalApps = verifications.length;
  const pendingApps = verifications.filter(v => v.status === "Pending" || v.status === "Under Review").length;
  const approvedApps = verifications.filter(v => v.status === "Approved").length;
  const rejectedApps = verifications.filter(v => v.status === "Rejected").length;
  const avgAiScore = useMemo(() => {
    const scoreFilteredApps = verifications.filter(v => v.aiEvaluation?.overall_score);
    return scoreFilteredApps.length > 0
      ? (scoreFilteredApps.reduce((acc, v) => acc + (v.aiEvaluation?.overall_score || 0), 0) / scoreFilteredApps.length).toFixed(1)
      : "N/A";
  }, [verifications]);
  const approvalRate = totalApps > 0 ? ((approvedApps / totalApps) * 100).toFixed(0) : "0";

  const filteredApps = verifications.filter(v => {
    const matchesSearch = 
      v.tutorName.toLowerCase().includes(appSearch.toLowerCase()) || 
      v.email.toLowerCase().includes(appSearch.toLowerCase()) ||
      v.expertise.toLowerCase().includes(appSearch.toLowerCase());
    if (!matchesSearch) return false;

    if (appStatusFilter !== "all" && v.status !== appStatusFilter) return false;
    return true;
  });

  const totalAppPages = Math.ceil(filteredApps.length / itemsPerPage) || 1;
  const paginatedApps = filteredApps.slice((appPage - 1) * itemsPerPage, appPage * itemsPerPage);

  const handleAppAction = async (status: "Approved" | "Rejected" | "Under Review" | "Pending", additionalPayload: any = {}) => {
    if (!selectedApp) return;
    setIsSubmittingAction(true);
    try {
      const res = await fetch("/api/admin/verifications", {
        method: "PATCH",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verificationId: selectedApp.id,
          status,
          adminNotes,
          ...additionalPayload
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update application status");
      
      setVerifications(prev => prev.map(app => app.id === selectedApp.id ? { ...app, status, adminNotes } : app));
      
      // If approved, update legacy users table status
      if (status === "Approved") {
        onApproveTutor(selectedApp.tutorId);
      } else if (status === "Rejected") {
        onRejectTutor(selectedApp.tutorId);
      }

      toast.success(`Application updated to ${status}.`);
      logAuditAction(`Tutor Application ${selectedApp.tutorName} set to ${status}`);
      setSelectedApp(null);
      setAdminNotes("");
      setRejectionReason("");
      setShowRejectForm(false);
      setShowInterviewForm(false);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsSubmittingAction(false);
    }
  };

  return (
    <div className="space-y-6 text-foreground text-xs font-semibold text-left select-none">
      
      {/* ── ROLE TAB SWITCHER ── */}
      <div className="flex border-b border-border/40 pb-px gap-4">
        {[
          { id: "learner", label: "Student Roster" },
          { id: "tutor-roster", label: "Tutor Roster" },
          { id: "tutor", label: "Tutor Applications Desk" },
          { id: "admin", label: "Admin Roster" }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setRoleFilter(tab.id);
              setUserPage(1);
              setAppPage(1);
            }}
            className={cn(
              "pb-3 text-sm font-bold tracking-tight border-b-2 transition-all relative focus:outline-none",
              roleFilter === tab.id 
                ? 'border-primary text-primary font-extrabold' 
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            {tab.label}
            {tab.id === 'tutor' && pendingApps > 0 && (
              <span className="ml-2 px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                {pendingApps}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── TUTOR APPLICATIONS PORTAL VIEW ── */}
      {roleFilter === "tutor" ? (
        <div className="space-y-6 animate-fadeIn">
          {/* 1. Analytics Widget Cards */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {[
              { label: "Total Applications", value: totalApps, sub: "All time submitted", color: "text-foreground" },
              { label: "Pending Review", value: pendingApps, sub: "Awaiting action", color: "text-amber-500" },
              { label: "Approved Tutors", value: approvedApps, sub: "Granted access", color: "text-emerald-500" },
              { label: "Rejected Applications", value: rejectedApps, sub: "Unsuccessful", color: "text-rose-500" },
              { label: "Average AI Score", value: avgAiScore !== "N/A" ? `${avgAiScore}%` : "N/A", sub: "Gemini evaluation", color: "text-purple-500" },
              { label: "Approval Rate", value: `${approvalRate}%`, sub: "Applications success", color: "text-blue-500" },
            ].map((card, idx) => (
              <Card key={idx} className="p-4 bg-card border border-border/40 space-y-1 shadow-soft">
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">{card.label}</span>
                <strong className={`text-2xl font-extrabold tracking-tight ${card.color}`}>{card.value}</strong>
                <span className="text-[10px] text-muted-foreground block">{card.sub}</span>
              </Card>
            ))}
          </div>

          {/* 2. Searching, Filtering, and Table Desk */}
          <Card className="bg-card border border-border/40 p-4 shadow-soft">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border/40">
              <div className="flex items-center gap-2 border border-border bg-background px-3 py-2 rounded-xl flex-1 max-w-md">
                <Search size={14} className="text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search tutor applicants, email, subjects..."
                  value={appSearch}
                  onChange={(e) => { setAppSearch(e.target.value); setAppPage(1); }}
                  className="bg-transparent border-none text-xs text-foreground focus:outline-none w-full font-semibold"
                />
              </div>

              <div className="flex items-center gap-3">
                <SlidersHorizontal size={14} className="text-muted-foreground" />
                <select
                  value={appStatusFilter}
                  onChange={(e) => { setAppStatusFilter(e.target.value); setAppPage(1); }}
                  className="border border-border rounded-xl px-3 py-1.5 text-xs bg-card focus:outline-none font-bold"
                >
                  <option value="all">All Applications</option>
                  <option value="Pending">Pending Review</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Approved">Approved Tutors</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>

            {/* Applicants list table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border/60 text-[9px] uppercase tracking-wider font-extrabold text-muted-foreground">
                    <th className="py-4 px-3">Applicant Candidate</th>
                    <th className="py-4 px-3">Primary Expertise</th>
                    <th className="py-4 px-3">Education Qualifications</th>
                    <th className="py-4 px-3">Date Applied</th>
                    <th className="py-4 px-3">Status</th>
                    <th className="py-4 px-3 text-right pr-6">Administrative Review</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, idx) => (
                      <tr key={idx} className="animate-pulse">
                        <td colSpan={6} className="py-4 px-3">
                          <div className="h-4 bg-muted-foreground/10 rounded w-full"></div>
                        </td>
                      </tr>
                    ))
                  ) : paginatedApps.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-muted-foreground">
                        No tutor applications matching filters.
                      </td>
                    </tr>
                  ) : (
                    paginatedApps.map((app) => (
                      <tr key={app.id} className="border-b border-border/40 hover:bg-muted/15 transition-colors font-semibold">
                        <td className="py-4 px-3">
                          <div className="flex flex-col">
                            <span className="font-bold text-foreground">{app.tutorName}</span>
                            <span className="text-[10px] text-muted-foreground font-medium mt-0.5">{app.email}</span>
                          </div>
                        </td>
                        <td className="py-4 px-3 text-muted-foreground truncate max-w-[200px]">{app.expertise}</td>
                        <td className="py-4 px-3 text-muted-foreground truncate max-w-[200px]">{app.education}</td>
                        <td className="py-4 px-3 text-muted-foreground">
                          {app.created_at ? new Date(app.created_at).toLocaleDateString() : ""}
                        </td>
                        <td className="py-4 px-3">
                          <span className={cn(
                            "px-2.5 py-0.5 rounded-full text-[9px] uppercase font-extrabold",
                            app.status === "Approved" ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" :
                            app.status === "Rejected" ? "bg-rose-500/10 text-rose-600 border border-rose-500/20" :
                            "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                          )}>
                            {app.status}
                          </span>
                        </td>
                        <td className="py-4 px-3 text-right">
                          <Button
                            onClick={() => {
                              setSelectedApp(app);
                              setAdminNotes(app.adminNotes || "");
                              setRejectionReason(app.rejectionReason || "");
                              setShowRejectForm(false);
                              setShowInterviewForm(false);
                            }}
                            className="text-[10px] font-bold h-8 px-3 bg-primary hover:bg-primary/90 text-white flex items-center gap-1 ml-auto"
                          >
                            <Eye size={12} /> Review Application
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination controls */}
            {totalAppPages > 1 && (
              <div className="flex items-center justify-between border-t border-border/40 pt-4 mt-2">
                <span className="text-xs text-muted-foreground">Showing {(appPage - 1) * itemsPerPage + 1} to {Math.min(appPage * itemsPerPage, filteredApps.length)} of {filteredApps.length} applications</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setAppPage(p => Math.max(1, p - 1))}
                    disabled={appPage === 1}
                    className="p-2 border border-border rounded-xl hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    onClick={() => setAppPage(p => Math.min(totalAppPages, p + 1))}
                    disabled={appPage === totalAppPages}
                    className="p-2 border border-border rounded-xl hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </Card>
        </div>
      ) : (
        /* ── ENTERPRISE UNIFIED USER DIRECTORY ── */
        <div className="space-y-6 animate-fadeIn">
          
          {/* 1. Analytics & KPI stats bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {roleFilter === "tutor-roster" ? (
              // Tutor-specific workspace KPIs
              [
                { label: "Total Tutors", value: kpis.tutors, sub: "All registered tutors", color: "text-blue-500" },
                { label: "Active Tutors", value: users.filter(u => u.role === "tutor" && u.status === "Active").length, sub: "Actively teaching", color: "text-emerald-500" },
                { label: "Pending Verification", value: kpis.pendingVer, sub: "Awaiting approval", color: "text-amber-500" },
                { label: "Suspended Tutors", value: users.filter(u => u.role === "tutor" && u.status === "Suspended").length, sub: "Restricted list", color: "text-rose-500" },
                { label: "Courses Created", value: Object.values(userDetails).reduce((sum, d) => sum + (d.coursesCount || 0), 0), sub: "Total tutor curriculum", color: "text-purple-500" },
                { label: "Students Taught", value: "Unavailable", sub: "Calculated from enrollments", color: "text-slate-500" }
              ].map((kpi, idx) => (
                <Card key={idx} className="p-4 bg-card border border-border/40 space-y-1 shadow-soft flex flex-col justify-between">
                  <span className="text-[10px] text-muted-foreground font-black uppercase tracking-wider block">{kpi.label}</span>
                  <strong className={`text-2xl font-extrabold tracking-tight mt-1 ${kpi.color}`}>{kpi.value}</strong>
                  <span className="text-[9px] text-muted-foreground/60 block font-semibold mt-1">{kpi.sub}</span>
                </Card>
              ))
            ) : roleFilter === "learner" ? (
              // Student-specific workspace KPIs
              [
                { label: "Total Students", value: kpis.students, sub: "All registered learners", color: "text-purple-500" },
                { label: "Active Students", value: users.filter(u => (u.role === "learner" || u.role === "student") && u.status === "Active").length, sub: "Actively studying", color: "text-emerald-500" },
                { label: "New Students (30d)", value: users.filter(u => (u.role === "learner" || u.role === "student") && ((currentTime - new Date(u.createdAt).getTime()) / 86400000) <= 30).length, sub: "Recent registrations", color: "text-blue-500" },
                { label: "Suspended Students", value: users.filter(u => (u.role === "learner" || u.role === "student") && u.status === "Suspended").length, sub: "Restricted list", color: "text-rose-500" },
                { label: "Enrollments Count", value: "Unavailable", sub: "Active subscriptions", color: "text-amber-500" },
                { label: "Learning Activity", value: "Active Now", sub: "Operational state", color: "text-cyan-500" }
              ].map((kpi, idx) => (
                <Card key={idx} className="p-4 bg-card border border-border/40 space-y-1 shadow-soft flex flex-col justify-between">
                  <span className="text-[10px] text-muted-foreground font-black uppercase tracking-wider block">{kpi.label}</span>
                  <strong className={`text-2xl font-extrabold tracking-tight mt-1 ${kpi.color}`}>{kpi.value}</strong>
                  <span className="text-[9px] text-muted-foreground/60 block font-semibold mt-1">{kpi.sub}</span>
                </Card>
              ))
            ) : (
              // Default/Admin KPIs
              [
                { label: "Total Users", value: kpis.total, sub: "All accounts", color: "text-primary" },
                { label: "Active Users", value: kpis.active, sub: `${activeRatioPercent}% rate`, color: "text-emerald-500" },
                { label: "Suspended Users", value: kpis.suspended, sub: "Restricted list", color: "text-rose-500" },
                { label: "Administrators", value: kpis.admins, sub: "Platform security", color: "text-cyan-500" }
              ].map((kpi, idx) => (
                <Card key={idx} className="p-4 bg-card border border-border/40 space-y-1 shadow-soft flex flex-col justify-between">
                  <span className="text-[10px] text-muted-foreground font-black uppercase tracking-wider block">{kpi.label}</span>
                  <strong className={`text-2xl font-extrabold tracking-tight mt-1 ${kpi.color}`}>{kpi.value}</strong>
                  <span className="text-[9px] text-muted-foreground/60 block font-semibold mt-1">{kpi.sub}</span>
                </Card>
              ))
            )}
          </div>

          {/* 2. Bulk operations bar */}
          {selectedUserIds.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-card border border-primary/20 bg-primary/5 text-xs font-bold shadow-soft select-none"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-primary" />
                <span className="text-foreground">Selected {selectedUserIds.length} users</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={bulkRoleSelect}
                  onChange={(e) => setBulkRoleSelect(e.target.value)}
                  className="h-8 border border-border rounded bg-card px-2 text-[10px] focus:outline-none"
                >
                  <option value="super_admin">Super Admin</option>
                  <option value="admin">Admin</option>
                  <option value="tutor">Tutor</option>
                  <option value="learner">Student</option>
                </select>
                
                <Button onClick={handleBulkRoleReassign} size="sm" className="h-8 text-[9px] font-bold">
                  Reassign Selected
                </Button>
                
                <Button onClick={() => handleBulkVerificationUpdate("Verified")} size="sm" className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-bold">
                  Verify Selected
                </Button>
                
                <Button onClick={() => handleBulkStatusChange("Active")} size="sm" className="h-8 bg-teal-600 hover:bg-teal-700 text-white text-[9px] font-bold">
                  Activate
                </Button>

                <Button onClick={() => handleBulkStatusChange("Suspended")} size="sm" className="h-8 bg-amber-600 hover:bg-amber-700 text-white text-[9px] font-bold">
                  Suspend
                </Button>

                <Button onClick={handleBulkUserDeletion} size="sm" className="h-8 bg-rose-600 hover:bg-rose-700 text-white text-[9px] font-bold">
                  Delete
                </Button>

                <Button onClick={handleBulkExportCSV} size="sm" variant="outline" className="h-8 border-border hover:bg-muted text-[9px] font-bold">
                  Export CSV
                </Button>
              </div>
            </motion.div>
          )}

          {/* 3. Search & Advanced filters toolbar */}
          <Card className="bg-card border border-border/40 p-4 shadow-soft space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-4 xl:grid-cols-7 gap-3">
              {/* Search */}
              <div className="md:col-span-2 relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search user name, email, credentials..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 rounded border border-border bg-muted/10 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary/20"
                />
              </div>

              {/* Status */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 border border-border rounded bg-card px-2 text-[10px] font-bold focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="locked">Locked</option>
              </select>

              {/* Department */}
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="h-9 border border-border rounded bg-card px-2 text-[10px] font-bold focus:outline-none"
              >
                <option value="all">All Departments</option>
                <option value="academic">Academic</option>
                <option value="financial">Financial</option>
                <option value="content">Content</option>
                <option value="executive">Executive</option>
              </select>

              {/* Verification */}
              <select
                value={verifyFilter}
                onChange={(e) => setVerifyFilter(e.target.value)}
                className="h-9 border border-border rounded bg-card px-2 text-[10px] font-bold focus:outline-none"
              >
                <option value="all">All Verifications</option>
                <option value="verified">Verified</option>
                <option value="pending">Pending</option>
                <option value="unverified">Unverified</option>
              </select>

              {/* Registration Date */}
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="h-9 border border-border rounded bg-card px-2 text-[10px] font-bold focus:outline-none"
              >
                <option value="all">All Registration Dates</option>
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
              </select>

              {/* Last Login */}
              <select
                value={loginFilter}
                onChange={(e) => setLoginFilter(e.target.value)}
                className="h-9 border border-border rounded bg-card px-2 text-[10px] font-bold focus:outline-none"
              >
                <option value="all">All Login Activities</option>
                <option value="today">Active Today</option>
                <option value="week">Active this Week</option>
                <option value="inactive">Inactive (&gt; 7 Days)</option>
              </select>
            </div>

            {/* Importers */}
            <div className="flex items-center justify-end gap-2 border-t border-border/10 pt-3">
              <button
                onClick={handleExportJSON}
                className="h-8 px-3 border border-border hover:bg-muted text-[10px] font-bold uppercase tracking-wider rounded transition-colors cursor-pointer flex items-center gap-1.5 focus:outline-none"
              >
                <Download size={12} className="text-primary" />
                <span>Export JSON Registry</span>
              </button>
            </div>
          </Card>

          {/* 4. Enterprise Data Grid Table */}
          <Card className="bg-card border border-border/40 p-4 shadow-soft">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[10px]">
                <thead>
                  <tr className="border-b border-border/60 text-[9px] uppercase tracking-wider font-extrabold text-muted-foreground select-none">
                    <th className="py-4 px-3 w-8">
                      <input
                        type="checkbox"
                        checked={selectedUserIds.length === paginatedUsers.length && paginatedUsers.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUserIds(paginatedUsers.map(u => u.id));
                          } else {
                            setSelectedUserIds([]);
                          }
                        }}
                        className="rounded border-border text-primary focus:ring-primary/20 cursor-pointer h-3.5 w-3.5"
                      />
                    </th>
                    <th className="py-4 px-3">User Profile</th>
                    <th className="py-4 px-3">Role</th>
                    <th className="py-4 px-3">Status</th>
                    <th className="py-4 px-3">Department</th>
                    <th className="py-4 px-3">Verification</th>
                    <th className="py-4 px-3">Last Login</th>
                    <th className="py-4 px-3">Date Registered</th>
                    <th className="py-4 px-3">Active Items</th>
                    <th className="py-4 px-3 text-right pr-6">Console Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="text-center py-12 text-muted-foreground">
                        No matching user records defined.
                      </td>
                    </tr>
                  ) : (
                    paginatedUsers.map((u) => {
                      const details = getOrInitUserDetail(u.id);
                      const isChecked = selectedUserIds.includes(u.id);

                      return (
                        <tr key={u.id} className="border-b border-border/40 hover:bg-muted/15 transition-colors font-semibold">
                          <td className="py-4 px-3">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedUserIds([...selectedUserIds, u.id]);
                                } else {
                                  setSelectedUserIds(selectedUserIds.filter(uid => uid !== u.id));
                                }
                              }}
                              className="rounded border-border text-primary focus:ring-primary/20 cursor-pointer h-3.5 w-3.5"
                            />
                          </td>
                          <td className="py-4 px-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-sm shrink-0 border border-primary/20 select-none">
                                {u.name.charAt(0)}
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="font-extrabold text-foreground truncate text-[11px]">{u.name}</span>
                                <span className="text-[9px] text-muted-foreground font-medium truncate mt-0.5">{u.email}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-3">
                            <span className={cn(
                              "px-2 py-0.2 rounded text-[7px] font-black uppercase border select-none",
                              u.role === "super_admin" ? "bg-rose-500/10 text-rose-600 border-rose-500/25" :
                              u.role === "tutor" ? "bg-blue-500/10 text-blue-600 border-blue-500/25" :
                              u.role === "admin" ? "bg-amber-500/10 text-amber-600 border-amber-500/25" :
                              "bg-emerald-500/10 text-emerald-600 border-emerald-500/25"
                            )}>
                              {u.role === "super_admin" ? "Super Admin" : u.role === "learner" ? "Student" : u.role === "tutor" ? "Tutor" : u.role}
                            </span>
                          </td>
                          <td className="py-4 px-3">
                            <span className={cn(
                              "px-2 py-0.5 rounded text-[8px] font-extrabold uppercase select-none",
                              u.status === "Active" ? "bg-emerald-500/10 text-emerald-600" : 
                              u.status === "Locked" ? "bg-rose-500/10 text-rose-600" :
                              "bg-amber-500/10 text-amber-600"
                            )}>
                              {u.status}
                            </span>
                          </td>
                          <td className="py-4 px-3 text-muted-foreground uppercase text-[8px] font-black">{details.department}</td>
                          <td className="py-4 px-3">
                            <span className={cn(
                              "flex items-center gap-1 font-bold",
                              details.verificationStatus === "Verified" ? "text-emerald-500" :
                              details.verificationStatus === "Pending" ? "text-amber-500" : "text-rose-500"
                            )}>
                              <CheckCircle2 size={10} />
                              {details.verificationStatus}
                            </span>
                          </td>
                          <td className="py-4 px-3 text-muted-foreground">{new Date(details.lastLogin).toLocaleDateString()}</td>
                          <td className="py-4 px-3 text-muted-foreground">{new Date(u.createdAt).toLocaleDateString()}</td>
                          <td className="py-4 px-3 text-muted-foreground font-bold">
                            {u.role === "tutor" ? `${details.coursesCount} Courses` : `${u.walletCoins || 0} Coins`}
                          </td>
                          <td className="py-4 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setSelectedUserProfile(u);
                                  setGrantCoinsAmount(u.walletCoins || 0);
                                  setDrawerActiveTab("details");
                                }}
                                className="text-[9px] font-black uppercase h-7 px-2"
                              >
                                View Profile
                              </Button>
                              
                              <select
                                onChange={(e) => {
                                  if (e.target.value !== "none") {
                                    handleUpdateUserStatus(u.id, e.target.value);
                                    e.target.value = "none";
                                  }
                                }}
                                className="h-7 border border-border rounded bg-card px-1.5 text-[9px] font-bold focus:outline-none"
                              >
                                <option value="none">Status...</option>
                                <option value="Active">Activate</option>
                                <option value="Suspended">Suspend</option>
                                <option value="Locked">Lock Account</option>
                              </select>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalUserPages > 1 && (
              <div className="flex items-center justify-between border-t border-border/40 pt-4 mt-2 select-none">
                <span className="text-xs text-muted-foreground">Showing {(userPage - 1) * itemsPerPage + 1} to {Math.min(userPage * itemsPerPage, filteredUsersList.length)} of {filteredUsersList.length} users</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setUserPage(p => Math.max(1, p - 1))}
                    disabled={userPage === 1}
                    className="p-2 border border-border rounded-xl hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    onClick={() => setUserPage(p => Math.min(totalUserPages, p + 1))}
                    disabled={userPage === totalUserPages}
                    className="p-2 border border-border rounded-xl hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </Card>

          {/* 5. Pure CSS Analytics Visualizations */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Chart 1: Users by Role */}
            <Card className="p-4 border-border bg-card shadow-soft space-y-3">
              <span className="font-extrabold text-[9px] uppercase tracking-wider text-muted-foreground block">Users by Department Distribution</span>
              <div className="space-y-3 pt-2">
                {departmentUserShare.labels.map((label, idx) => {
                  const count = departmentUserShare.counts[idx];
                  const total = Object.values(userDetails).length || 1;
                  const percent = Math.round((count / total) * 100);

                  return (
                    <div key={label} className="space-y-1">
                      <div className="flex items-center justify-between text-[9px]">
                        <span className="font-extrabold text-foreground">{label}</span>
                        <span className="text-muted-foreground font-bold">{count} accounts ({percent}%)</span>
                      </div>
                      <div className="h-2 w-full bg-muted/30 rounded-full overflow-hidden border border-border/10">
                        <div 
                          className="bg-primary h-full rounded-full transition-all duration-500" 
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Chart 2: Active vs Inactive ratio */}
            <Card className="p-4 border-border bg-card shadow-soft space-y-3 flex flex-col justify-between">
              <div className="space-y-1">
                <span className="font-extrabold text-[9px] uppercase tracking-wider text-muted-foreground block">Active vs Inactive Account ratio</span>
                <p className="text-[10px] text-muted-foreground mt-0.5">Ratios of active user logins in the past 30 days.</p>
              </div>
              
              <div className="py-4 flex flex-col items-center justify-center gap-2">
                <div className="relative w-24 h-24 rounded-full border-8 border-muted/20 flex items-center justify-center font-heading font-extrabold text-lg text-primary">
                  {activeRatioPercent}%
                  <div className="absolute inset-[-8px] rounded-full border-8 border-emerald-500 border-t-transparent border-l-transparent transition-transform duration-500" />
                </div>
                <span className="text-[9px] font-black uppercase text-emerald-500 mt-2">Active Accounts Rate</span>
              </div>
            </Card>

            {/* Chart 3: Account verification rate */}
            <Card className="p-4 border-border bg-card shadow-soft space-y-3 flex flex-col justify-between">
              <div className="space-y-1">
                <span className="font-extrabold text-[9px] uppercase tracking-wider text-muted-foreground block">Verified Account statistics</span>
                <p className="text-[10px] text-muted-foreground mt-0.5">Email and tutor credentials verification completion rate.</p>
              </div>
              
              <div className="space-y-3">
                {[
                  { label: "Verified", count: Object.values(userDetails).filter(d => d.verificationStatus === "Verified").length, color: "bg-emerald-500" },
                  { label: "Pending Review", count: Object.values(userDetails).filter(d => d.verificationStatus === "Pending").length, color: "bg-amber-500" },
                  { label: "Unverified", count: Object.values(userDetails).filter(d => d.verificationStatus === "Unverified").length, color: "bg-rose-500" }
                ].map((item) => {
                  const total = Object.values(userDetails).length || 1;
                  const percent = Math.round((item.count / total) * 100);

                  return (
                    <div key={item.label} className="space-y-1">
                      <div className="flex items-center justify-between text-[9px]">
                        <span className="font-extrabold text-foreground">{item.label}</span>
                        <span className="text-muted-foreground font-bold">{item.count} users ({percent}%)</span>
                      </div>
                      <div className="h-2 w-full bg-muted/30 rounded-full overflow-hidden border border-border/10">
                        <div 
                          className={cn("h-full rounded-full transition-all duration-500", item.color)} 
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

      {/* ── 3. SLIDING TUTOR REVIEW DRAWER CONSOLE ── */}
      <AnimatePresence>
        {selectedApp && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedApp(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 cursor-pointer"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-3xl bg-background border-l border-border/80 z-50 overflow-y-auto shadow-2xl flex flex-col justify-between select-none"
            >
              
              {/* Header */}
              <div className="p-6 border-b border-border/40 flex items-center justify-between bg-card">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg border border-primary/20">
                    {selectedApp.tutorName.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-foreground">{selectedApp.tutorName}</h2>
                    <p className="text-xs text-muted-foreground">{selectedApp.email} · Applied {selectedApp.created_at ? new Date(selectedApp.created_at).toLocaleDateString() : ""}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-0.5 rounded text-[9px] uppercase font-extrabold border ${
                    selectedApp.status === "Approved" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/25" :
                    selectedApp.status === "Rejected" ? "bg-rose-500/10 text-rose-600 border-rose-500/25" :
                    "bg-amber-500/10 text-amber-600 border-amber-500/25"
                  }`}>
                    {selectedApp.status}
                  </span>
                  <button
                    onClick={() => setSelectedApp(null)}
                    className="p-2 rounded hover:bg-muted text-muted-foreground transition-all"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Scrollable Body */}
              <div className="p-6 space-y-6 flex-1 text-xs font-semibold text-left overflow-y-auto">
                {/* 1. Academic Credentials Details */}
                <div className="space-y-2">
                  <h3 className="text-[10px] uppercase font-extrabold text-muted-foreground tracking-wider">Candidate Education Details</h3>
                  <Card className="p-4 bg-card border border-border/40 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-muted-foreground block text-[10px]">Academic background</span>
                        <span className="text-foreground">{selectedApp.education}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[10px]">Tutor ID Code</span>
                        <span className="text-foreground font-mono">{selectedApp.tutorId}</span>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* 2. Documents uploads verification */}
                <div className="space-y-2">
                  <h3 className="text-[10px] uppercase font-extrabold text-muted-foreground tracking-wider">Submitted Credentials &amp; Documents</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { title: "National Identity Card (Aadhaar/Passport)", file: selectedApp.govIdFile },
                      { title: "College Enrollment / Degree scanner copy", file: selectedApp.studentIdFile }
                    ].map((doc, idx) => (
                      <Card key={idx} className="p-3 bg-card border border-border/40 flex items-center justify-between shadow-soft">
                        <div className="space-y-1">
                          <span className="font-extrabold text-foreground block truncate max-w-[200px]">{doc.title}</span>
                          <span className="text-[9px] text-muted-foreground block">File: {doc.file}</span>
                        </div>
                        <Button variant="outline" size="sm" className="h-7 px-2 text-[9px] font-bold">
                          <ExternalLink size={10} className="mr-1" /> View Scan
                        </Button>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* 3. Gemini AI Assistant Socratic Score Evaluation */}
                {selectedApp.aiEvaluation && (
                  <div className="space-y-2">
                    <h3 className="text-[10px] uppercase font-extrabold text-purple-600 dark:text-purple-400 tracking-wider flex items-center gap-1.5">
                      <Brain size={14} className="animate-pulse" /> Gemini AI Candidate Assessment Report
                    </h3>
                    <Card className="p-4 border-purple-500/20 bg-purple-500/5 space-y-3 shadow-soft text-foreground">
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-card p-2 rounded border border-purple-500/10 text-center">
                          <span className="text-[8px] text-muted-foreground uppercase font-bold block">Overall score</span>
                          <strong className="text-lg font-heading text-purple-600 dark:text-purple-400 block">{selectedApp.aiEvaluation.overall_score}%</strong>
                        </div>
                        <div className="bg-card p-2 rounded border border-purple-500/10 text-center">
                          <span className="text-[8px] text-muted-foreground uppercase font-bold block">Subject Knowledge</span>
                          <strong className="text-lg font-heading text-purple-600 dark:text-purple-400 block">{selectedApp.aiEvaluation.subject_score}%</strong>
                        </div>
                        <div className="bg-card p-2 rounded border border-purple-500/10 text-center">
                          <span className="text-[8px] text-muted-foreground uppercase font-bold block">Communication</span>
                          <strong className="text-lg font-heading text-purple-600 dark:text-purple-400 block">{selectedApp.aiEvaluation.communication_score}%</strong>
                        </div>
                      </div>

                      <div className="border-t border-purple-500/15 pt-3 space-y-2">
                        <div className="text-[10px] leading-relaxed">
                          <strong>Socratic Scenario analysis:</strong>
                          <p className="text-muted-foreground italic mt-0.5">&quot;{selectedApp.aiEvaluation.socratic_response_analysis}&quot;</p>
                        </div>
                        <div className="text-[10px] leading-relaxed">
                          <strong>Administrative notes:</strong>
                          <p className="text-muted-foreground italic mt-0.5">&quot;{selectedApp.aiEvaluation.resume_verdict}&quot;</p>
                        </div>
                      </div>
                    </Card>
                  </div>
                )}

                {/* 4. Action Decision Controls Form */}
                <div className="space-y-3.5 border-t border-border/40 pt-4">
                  <span className="text-[10px] uppercase font-extrabold text-foreground tracking-wider block">Decision Actions Desk</span>
                  
                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={() => handleAppAction("Approved")}
                      disabled={isSubmittingAction}
                      className="h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase"
                    >
                      Approve &amp; Onboard Candidate
                    </Button>

                    <Button
                      onClick={() => {
                        setShowRejectForm(true);
                        setShowInterviewForm(false);
                      }}
                      variant="outline"
                      className="h-9 px-4 border-rose-500/20 text-rose-500 hover:bg-rose-500/5 font-bold text-xs uppercase"
                    >
                      Reject Application
                    </Button>

                    <Button
                      onClick={() => {
                        setShowInterviewForm(true);
                        setShowRejectForm(false);
                      }}
                      variant="outline"
                      className="h-9 px-4 border-primary/20 text-primary hover:bg-primary/5 font-bold text-xs uppercase"
                    >
                      Schedule Interview
                    </Button>
                  </div>

                  {/* Rejection Form Input */}
                  {showRejectForm && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-3 p-4 border border-rose-500/20 bg-rose-500/5 rounded-card"
                    >
                      <label className="text-[9px] uppercase tracking-wider text-rose-500 font-bold block">Feedback Rejection Reason</label>
                      <textarea
                        required
                        placeholder="Detail why candidate qualifications failed criteria..."
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        className="w-full min-h-[70px] border border-border rounded bg-card p-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-rose-500/20 font-semibold"
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleAppAction("Rejected", { rejectionReason })}
                          disabled={isSubmittingAction || !rejectionReason.trim()}
                          className="h-8 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold"
                        >
                          Confirm Rejection
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => setShowRejectForm(false)}
                          className="h-8 text-[10px] font-bold"
                        >
                          Cancel
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {/* Live Interview Scheduling Form Input */}
                  {showInterviewForm && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-3.5 p-4 border border-primary/20 bg-primary/5 rounded-card"
                    >
                      <span className="text-[10px] uppercase font-extrabold text-primary tracking-wide block">Schedule Google Meet live interview</span>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[8px] uppercase tracking-wider text-muted-foreground font-black">Date</label>
                          <input
                            type="date"
                            value={interviewDate}
                            onChange={(e) => setInterviewDate(e.target.value)}
                            className="w-full h-8 border border-border rounded bg-card px-2 text-xs focus:outline-none text-foreground font-semibold"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] uppercase tracking-wider text-muted-foreground font-black">Time</label>
                          <input
                            type="time"
                            value={interviewTime}
                            onChange={(e) => setInterviewTime(e.target.value)}
                            className="w-full h-8 border border-border rounded bg-card px-2 text-xs focus:outline-none text-foreground font-semibold"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[8px] uppercase tracking-wider text-muted-foreground font-black">Google Meet URL</label>
                        <input
                          type="url"
                          placeholder="https://meet.google.com/xyz..."
                          value={meetingLink}
                          onChange={(e) => setMeetingLink(e.target.value)}
                          className="w-full h-8 border border-border rounded bg-card px-3 text-xs focus:outline-none text-foreground font-semibold"
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleAppAction("Under Review", { 
                            live_interview_details: { date: interviewDate, time: interviewTime, link: meetingLink }
                          })}
                          disabled={isSubmittingAction || !meetingLink.trim()}
                          className="h-8 bg-primary hover:bg-primary/95 text-white text-[10px] font-bold"
                        >
                          Send Invitation link
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => setShowInterviewForm(false)}
                          className="h-8 text-[10px] font-bold"
                        >
                          Cancel
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {/* Notes Area */}
                  <div className="space-y-1 pt-2">
                    <label className="text-[9px] uppercase tracking-wider text-muted-foreground font-black">Internal administrative notes</label>
                    <textarea
                      placeholder="Add administrative notes about candidate portfolio..."
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      className="w-full min-h-[50px] border border-border rounded bg-card p-2.5 text-xs text-foreground focus:outline-none font-semibold"
                    />
                  </div>
                </div>

              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── 6. SLIDING ENTERPRISE USER PROFILE DRAWER ── */}
      <AnimatePresence>
        {selectedUserProfile && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedUserProfile(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 cursor-pointer"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-3xl bg-background border-l border-border/80 z-50 overflow-y-auto shadow-2xl flex flex-col justify-between select-none text-foreground"
            >
              
              {/* Header */}
              <div className="p-6 border-b border-border/40 flex items-center justify-between bg-card">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg border border-primary/20">
                    {selectedUserProfile.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-foreground">{selectedUserProfile.name}</h2>
                    <p className="text-xs text-muted-foreground">{selectedUserProfile.email} · Joined {selectedUserProfile.createdAt}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={cn(
                    "px-2.5 py-0.5 rounded text-[9px] uppercase font-extrabold border",
                    selectedUserProfile.status === "Active" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/25" : "bg-rose-500/10 text-rose-600 border-rose-500/25"
                  )}>
                    {selectedUserProfile.status}
                  </span>
                  <button
                    onClick={() => setSelectedUserProfile(null)}
                    className="p-2 rounded hover:bg-muted text-muted-foreground transition-all"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Drawer inner tabs switcher */}
              <div className="flex border-b border-border/10 bg-muted/10 px-6 gap-4">
                {(["details", "rbac", "activities", "history", "courses"] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setDrawerActiveTab(tab)}
                    className={cn(
                      "py-2.5 text-[9px] font-black uppercase tracking-wider border-b-2 transition-all focus:outline-none",
                      drawerActiveTab === tab 
                        ? "border-primary text-primary" 
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {tab === "details" && "👤 Profile Details"}
                    {tab === "rbac" && "🛡️ RBAC & Permissions"}
                    {tab === "activities" && "📜 User Activity"}
                    {tab === "history" && "💻 Login Logs"}
                    {tab === "courses" && "🏫 Enrollments"}
                  </button>
                ))}
              </div>

              {/* Scrollable Body */}
              <div className="p-6 space-y-6 flex-1 text-xs font-semibold text-left overflow-y-auto">
                
                {/* SUB TAB 1: DETAILS */}
                {drawerActiveTab === "details" && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="space-y-2">
                      <h3 className="text-[10px] uppercase font-extrabold text-muted-foreground tracking-wider">Account Roster Details</h3>
                      <Card className="p-4 bg-card border border-border/40 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <span className="text-muted-foreground block text-[10px]">User Role</span>
                            <span className="text-foreground uppercase">{selectedUserProfile.role === "learner" ? "Student" : selectedUserProfile.role}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block text-[10px]">Nationality</span>
                            <span className="text-foreground">{selectedUserProfile.country || "India"}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block text-[10px]">Phone Number</span>
                            <span className="text-foreground font-mono">{getOrInitUserDetail(selectedUserProfile.id).phone}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block text-[10px]">Department</span>
                            <span className="text-foreground uppercase">{getOrInitUserDetail(selectedUserProfile.id).department}</span>
                          </div>
                        </div>
                        {selectedUserProfile.bio && (
                          <div className="border-t border-border/20 pt-2 text-muted-foreground leading-relaxed">
                            <strong>Bio:</strong> &quot;{selectedUserProfile.bio}&quot;
                          </div>
                        )}
                      </Card>
                    </div>

                    {/* Account operations */}
                    <div className="space-y-2">
                      <h3 className="text-[10px] uppercase font-extrabold text-muted-foreground tracking-wider font-extrabold">Administrative Account Controls</h3>
                      <Card className="p-4 bg-card border border-border/40 space-y-3">
                        <div className="flex flex-wrap gap-2">
                          <Button
                            onClick={() => handleResetPasswordLink(selectedUserProfile.id)}
                            variant="outline"
                            className="text-[9px] font-bold h-8 px-2.5"
                          >
                            <Key size={12} className="mr-1" /> Reset Password
                          </Button>

                          <Button
                            onClick={() => handleVerifyEmailManual(selectedUserProfile.id)}
                            variant="outline"
                            className="text-[9px] font-bold h-8 px-2.5"
                          >
                            <Check size={12} className="mr-1" /> Verify Email
                          </Button>

                          <Button
                            onClick={() => handleForceLogoutSession(selectedUserProfile.id)}
                            variant="outline"
                            className="text-[9px] font-bold h-8 px-2.5 border-rose-500/25 text-rose-500 hover:bg-rose-500/5"
                          >
                            <Trash2 size={12} className="mr-1" /> Force Logout
                          </Button>
                        </div>
                      </Card>
                    </div>
                  </div>
                )}

                {/* SUB TAB 2: RBAC & INTEGRATION */}
                {drawerActiveTab === "rbac" && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="space-y-2">
                      <h3 className="text-[10px] uppercase font-extrabold text-muted-foreground tracking-wider">Access Control settings</h3>
                      <Card className="p-4 bg-card border border-border/40 space-y-3.5">
                        <div className="space-y-2">
                          <label className="text-[9px] uppercase tracking-wider text-muted-foreground font-black">Assign RBAC Role</label>
                          <select
                            value={selectedUserProfile.role === "learner" ? "student" : selectedUserProfile.role}
                            onChange={(e) => handleModifyUserRole(selectedUserProfile.id, e.target.value)}
                            className="w-full max-w-xs h-9 border border-border rounded bg-card px-3 text-xs font-semibold focus:outline-none"
                          >
                            <option value="super_admin">Super Admin</option>
                            <option value="admin">Admin</option>
                            <option value="tutor">Tutor</option>
                            <option value="student">Student</option>
                          </select>
                        </div>

                        {/* Effective Permissions Preview */}
                        <div className="border-t border-border/20 pt-3 space-y-2">
                          <span className="font-extrabold text-[10px] text-foreground uppercase tracking-wider block">Effective Role Matrix privileges</span>
                          
                          <div className="bg-muted/10 border border-border/60 p-3 rounded text-[10px] leading-relaxed leading-normal text-muted-foreground">
                            {selectedUserProfile.role === "super_admin" || selectedUserProfile.role === "admin" ? (
                              <p>✓ All platform administrative sections enabled. Access to verifications logs, master schema configs, and payments Ledgers is permitted.</p>
                            ) : selectedUserProfile.role === "tutor" ? (
                              <p>✓ Access to Tutor Dashboard allowed. Creating courses, teaching lectures, grading, and finance dashboards enabled. Administrative tools locked.</p>
                            ) : (
                              <p>✓ Standard learner credentials. Access to browse courses directory, participate in mentorship classes, and study quiz outlines is enabled.</p>
                            )}
                          </div>
                        </div>
                      </Card>
                    </div>
                  </div>
                )}

                {/* SUB TAB 3: ACTIVITIES TIMELINE */}
                {drawerActiveTab === "activities" && (
                  <div className="space-y-2 animate-fadeIn">
                    <h3 className="text-[10px] uppercase font-extrabold text-muted-foreground tracking-wider">Account Action History</h3>
                    <Card className="p-4 bg-card border border-border/40 space-y-4">
                      <div className="space-y-3.5 max-h-[300px] overflow-y-auto">
                        {getOrInitUserDetail(selectedUserProfile.id).activities.map((act) => (
                          <div key={act.id} className="relative pl-6 border-l-2 border-border/60 pb-3 last:pb-0">
                            <div className="absolute left-[-5px] top-1.5 w-2.5 h-2.5 rounded-full bg-primary border border-card" />
                            <div className="space-y-0.5">
                              <span className="font-extrabold text-foreground block text-[10px]">{act.detail}</span>
                              <span className="text-[8px] text-muted-foreground block">{new Date(act.timestamp).toLocaleString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>
                )}

                {/* SUB TAB 4: LOGIN HISTORY */}
                {drawerActiveTab === "history" && (
                  <div className="space-y-2 animate-fadeIn">
                    <h3 className="text-[10px] uppercase font-extrabold text-muted-foreground tracking-wider">Recent Login Audit Logs</h3>
                    <Card className="p-4 bg-card border border-border/40">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-[10px]">
                          <thead>
                            <tr className="border-b border-border/60 text-[8px] uppercase tracking-wider font-extrabold text-muted-foreground">
                              <th className="pb-2">Timestamp</th>
                              <th className="pb-2">Device</th>
                              <th className="pb-2">Browser</th>
                              <th className="pb-2">IP address</th>
                              <th className="pb-2">Location</th>
                            </tr>
                          </thead>
                          <tbody>
                            {getOrInitUserDetail(selectedUserProfile.id).loginHistory.map((history) => (
                              <tr key={history.id} className="border-b border-border/30 hover:bg-muted/10 font-semibold">
                                <td className="py-2 text-muted-foreground">{new Date(history.timestamp).toLocaleDateString()}</td>
                                <td className="py-2 text-foreground">{history.device}</td>
                                <td className="py-2 text-muted-foreground">{history.browser}</td>
                                <td className="py-2 text-muted-foreground font-mono">{history.ip}</td>
                                <td className="py-2 text-foreground">{history.location}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </Card>
                  </div>
                )}

                {/* SUB TAB 5: ENROLLMENTS */}
                {drawerActiveTab === "courses" && (
                  <div className="space-y-2 animate-fadeIn">
                    <h3 className="text-[10px] uppercase font-extrabold text-muted-foreground tracking-wider">Enrolled Courses &amp; Progress</h3>
                    <Card className="p-4 bg-card border border-border/40 space-y-3">
                      {!selectedUserProfile.enrollments || selectedUserProfile.enrollments.length === 0 ? (
                        <span className="text-muted-foreground text-xs font-semibold">No active course enrollments defined.</span>
                      ) : (
                        <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
                          {selectedUserProfile.enrollments.map((enr) => (
                            <div key={enr.courseId} className="space-y-1.5 border-b border-border/30 pb-2 last:border-0 last:pb-0">
                              <div className="flex justify-between items-center text-xs">
                                <span className="font-extrabold text-foreground truncate max-w-[280px]">{enr.courseTitle}</span>
                                <span className="text-muted-foreground text-[10px] font-bold">{enr.progressPercent}% Completed</span>
                              </div>
                              <div className="h-2 w-full bg-muted/30 rounded-full overflow-hidden border border-border/10">
                                <div 
                                  className="bg-primary h-full rounded-full transition-all" 
                                  style={{ width: `${enr.progressPercent}%` }}
                                />
                              </div>
                              {enr.certificateUrl && (
                                <Button variant="ghost" size="sm" className="h-6 text-[9px] font-bold px-1.5 mt-1 text-primary">
                                  <Award size={10} className="mr-1" /> View Certificate badge
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </Card>
                  </div>
                )}

              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
