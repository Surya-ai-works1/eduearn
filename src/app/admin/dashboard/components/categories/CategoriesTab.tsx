"use client";
/* eslint-disable react-hooks/purity */

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Trash2, Edit2, Check, X, Star, Eye, ArrowUp, ArrowDown, FolderKanban, Sliders,
  GripVertical, Search, Download, Upload, ShieldCheck, Info, AlertTriangle, ShieldAlert,
  ChevronLeft, ChevronRight, BookOpen, Video, Award, Brain, ExternalLink, RefreshCw,
  Code2, Palette, TrendingUp, Atom, Globe2, HeartPulse, Languages, Music, Target, Briefcase,
  FileText, Settings, Users, ArrowUpRight, ArrowDownRight,
  Shield, CheckCircle, Ban, MessageSquare, AlertCircle, Sparkles, Filter, ChevronDown,
  DollarSign, Activity, FileCheck, Layers, BookOpenCheck, Clock, History, UserCheck, BarChart3
} from "lucide-react";
import { toast } from "sonner";
import { Card } from "../../../../../components/ui/card";
import { Button } from "../../../../../components/ui/button";

// Interfaces
interface CategoriesTabProps {
  logAuditAction: (actionStr: string) => void;
}

type SubViewType = "categories-ops" | "metadata";
type EntityType = "languages" | "levels" | "tags" | "difficulties" | "certificates" | "course_types" | "live_class_types";

interface MasterRecord {
  id: string;
  name: string;
  status: "Active" | "Inactive";
  isSystem: boolean;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
}

// Default legacy seeds
const SEED_DATA: Record<EntityType, { name: string; isSystem: boolean }[]> = {
  languages: [
    { name: "English", isSystem: true },
    { name: "Hindi", isSystem: true },
    { name: "Telugu", isSystem: false },
    { name: "Tamil", isSystem: false },
    { name: "Spanish", isSystem: false },
    { name: "French", isSystem: false },
  ],
  levels: [
    { name: "Beginner", isSystem: true },
    { name: "Intermediate", isSystem: true },
    { name: "Advanced", isSystem: true },
    { name: "All Levels", isSystem: false },
  ],
  tags: [
    { name: "Trending", isSystem: false },
    { name: "Best Seller", isSystem: false },
    { name: "New", isSystem: false },
    { name: "Hot", isSystem: false },
    { name: "Free", isSystem: false },
    { name: "SaaS", isSystem: false },
  ],
  difficulties: [
    { name: "Easy", isSystem: true },
    { name: "Medium", isSystem: true },
    { name: "Hard", isSystem: true },
  ],
  certificates: [
    { name: "Completion Certificate", isSystem: true },
    { name: "Professional Certificate", isSystem: false },
    { name: "Skill Badge", isSystem: false },
    { name: "Verifiable Blockchain Certificate", isSystem: false },
  ],
  course_types: [
    { name: "Recorded Course", isSystem: true },
    { name: "Cohort Based", isSystem: false },
    { name: "Bootcamp", isSystem: false },
    { name: "Self-Paced", isSystem: false },
  ],
  live_class_types: [
    { name: "Q&A Session", isSystem: false },
    { name: "Mentorship", isSystem: false },
    { name: "Doubt Clearing", isSystem: false },
    { name: "Masterclass", isSystem: false },
    { name: "Live Lecture", isSystem: false },
  ],
};

const ENTITY_LABELS: Record<EntityType, string> = {
  languages: "Languages",
  levels: "Complexity Levels",
  tags: "Course Tags",
  difficulties: "Difficulty Scales",
  certificates: "Certificate Templates",
  course_types: "Course Formats/Types",
  live_class_types: "Live Class Types",
};

const ENTITY_INFO: Record<EntityType, string[]> = {
  languages: ["Tutor Profiles", "Courses", "Student Preferences", "AI Studio", "Certificates"],
  levels: ["Course Configuration", "Student Dashboard Filters", "Syllabus Planning"],
  tags: ["Marketplace Discovery", "Recommendation Engine", "Campaign Banners"],
  difficulties: ["Complexity Badging", "AI Generator Recommendations", "Student Onboarding"],
  certificates: ["Student Completion", "Blockchain Verification", "Tutor Templates"],
  course_types: ["Curriculum Formats", "Pricing Models", "Enrollment Pipelines"],
  live_class_types: ["Interactive Mentorship", "Calendar Scheduling", "Zoom Integrations"],
};

// Types for Operations Center
interface CategoryMetric {
  id: string;
  name: string;
  icon: string;
  banner: string;
  totalCourses: number;
  publishedCourses: number;
  draftCourses: number;
  archivedCourses: number;
  totalTutors: number;
  totalStudents: number;
  activeEnrollments: number;
  monthlyRevenue: number;
  averageRating: number;
  completionRate: number;
  certificatesIssued: number;
  refundRequests: number;
  pendingModeration: number;
  lastUpdated: string;
  healthScore: number; // 0 - 100
}

interface CourseOperation {
  id: string;
  title: string;
  category: string;
  tutorId: string;
  tutorName: string;
  tutorAvatar?: string;
  status: "Approved" | "Pending" | "Rejected" | "Draft" | "Need Changes" | "Archived";
  visibility: "Visible" | "Hidden";
  price: number;
  enrollments: number;
  revenue: number;
  completion: number; // percentage
  rating: number;
  certificates: number;
  refunds: number;
  created: string;
  updated: string;
  lastPublished: string;
  thumbnail: string;
  riskScore: number;
}

interface TutorRecord {
  id: string;
  name: string;
  email: string;
  avatar: string;
  status: "Active" | "Suspended";
  verification: "Approved" | "Pending" | "Rejected" | "Under Review";
  courses: number;
  students: number;
  revenue: number;
  wallet: number;
  withdrawals: number;
  rating: number;
  completion: number;
  warnings: number;
}

interface StudentRecord {
  id: string;
  name: string;
  email: string;
  avatar: string;
  courseId: string;
  courseName: string;
  progress: number;
  attendance: number;
  assignments: string; // e.g. "9/10"
  paymentStatus: "Paid" | "Refunded" | "Pending";
  certificateStatus: "Issued" | "None" | "Pending" | "Revoked";
  completion: boolean;
  lastActive: string;
  riskLevel: "Low" | "Medium" | "High" | "Critical";
  supportTickets: number;
}

interface ModerationItem {
  id: string;
  courseId: string;
  courseName: string;
  type: "Course" | "Review" | "Copyright" | "AI Flag" | "Abuse";
  reporter: string;
  reason: string;
  status: "Pending" | "Resolved" | "Ignored" | "Escalated";
  date: string;
}

interface ResourceItem {
  id: string;
  name: string;
  type: "Video" | "PDF" | "Assignment" | "Quiz" | "Link";
  size: string;
  version: string;
  downloads: number;
  uploadedAt: string;
}

interface AuditHistoryLog {
  id: string;
  who: string;
  action: string;
  entity: string;
  oldValue: string;
  newValue: string;
  timestamp: string;
  ip: string;
  device: string;
  reason: string;
}

// Initial Mock Seed Data
const DEFAULT_CATEGORY_OPS: CategoryMetric[] = [
  { id: "academics", name: "Academic Education", icon: "BookOpenCheck", banner: "from-violet-600 to-indigo-800", totalCourses: 14, publishedCourses: 10, draftCourses: 3, archivedCourses: 1, totalTutors: 6, totalStudents: 180, activeEnrollments: 140, monthlyRevenue: 155000, averageRating: 4.6, completionRate: 76, certificatesIssued: 98, refundRequests: 2, pendingModeration: 1, lastUpdated: "2026-07-30", healthScore: 88 },
  { id: "technology-programming", name: "Technology & Programming", icon: "Code2", banner: "from-blue-600 to-cyan-800", totalCourses: 24, publishedCourses: 18, draftCourses: 4, archivedCourses: 2, totalTutors: 9, totalStudents: 420, activeEnrollments: 380, monthlyRevenue: 480000, averageRating: 4.8, completionRate: 84, certificatesIssued: 245, refundRequests: 4, pendingModeration: 0, lastUpdated: "2026-07-30", healthScore: 95 },
  { id: "creative-arts-design", name: "Creative Arts & Design", icon: "Palette", banner: "from-pink-600 to-rose-800", totalCourses: 11, publishedCourses: 8, draftCourses: 2, archivedCourses: 1, totalTutors: 4, totalStudents: 125, activeEnrollments: 95, monthlyRevenue: 95000, averageRating: 4.5, completionRate: 70, certificatesIssued: 55, refundRequests: 1, pendingModeration: 0, lastUpdated: "2026-07-30", healthScore: 89 },
  { id: "business-marketing", name: "Business & Marketing", icon: "TrendingUp", banner: "from-emerald-600 to-teal-800", totalCourses: 16, publishedCourses: 12, draftCourses: 3, archivedCourses: 1, totalTutors: 7, totalStudents: 260, activeEnrollments: 210, monthlyRevenue: 240000, averageRating: 4.7, completionRate: 79, certificatesIssued: 135, refundRequests: 3, pendingModeration: 1, lastUpdated: "2026-07-30", healthScore: 92 },
  { id: "science-math", name: "Science & Mathematics", icon: "Atom", banner: "from-purple-600 to-deep-purple-800", totalCourses: 9, publishedCourses: 7, draftCourses: 1, archivedCourses: 1, totalTutors: 3, totalStudents: 95, activeEnrollments: 80, monthlyRevenue: 85000, averageRating: 4.4, completionRate: 72, certificatesIssued: 48, refundRequests: 1, pendingModeration: 0, lastUpdated: "2026-07-30", healthScore: 90 },
  { id: "humanities-social", name: "Humanities & Social Sciences", icon: "Globe2", banner: "from-amber-600 to-orange-800", totalCourses: 8, publishedCourses: 6, draftCourses: 1, archivedCourses: 1, totalTutors: 4, totalStudents: 85, activeEnrollments: 65, monthlyRevenue: 60000, averageRating: 4.3, completionRate: 68, certificatesIssued: 35, refundRequests: 0, pendingModeration: 0, lastUpdated: "2026-07-30", healthScore: 85 },
  { id: "health-fitness", name: "Health, Wellness & Fitness", icon: "HeartPulse", banner: "from-red-600 to-rose-850", totalCourses: 6, publishedCourses: 5, draftCourses: 1, archivedCourses: 0, totalTutors: 3, totalStudents: 72, activeEnrollments: 55, monthlyRevenue: 55000, averageRating: 4.6, completionRate: 81, certificatesIssued: 38, refundRequests: 0, pendingModeration: 0, lastUpdated: "2026-07-30", healthScore: 91 },
  { id: "languages-linguistics", name: "Languages & Linguistics", icon: "Languages", banner: "from-indigo-600 to-blue-800", totalCourses: 10, publishedCourses: 8, draftCourses: 1, archivedCourses: 1, totalTutors: 5, totalStudents: 110, activeEnrollments: 85, monthlyRevenue: 90000, averageRating: 4.4, completionRate: 75, certificatesIssued: 62, refundRequests: 1, pendingModeration: 0, lastUpdated: "2026-07-30", healthScore: 87 },
  { id: "music-performance", name: "Music & Performance", icon: "Music", banner: "from-purple-600 to-fuchsia-850", totalCourses: 7, publishedCourses: 5, draftCourses: 2, archivedCourses: 0, totalTutors: 3, totalStudents: 65, activeEnrollments: 50, monthlyRevenue: 65000, averageRating: 4.2, completionRate: 65, certificatesIssued: 30, refundRequests: 2, pendingModeration: 2, lastUpdated: "2026-07-30", healthScore: 80 }
];

const SEED_COURSES: CourseOperation[] = [
  { id: "c-ops-1", title: "Mastering React Native Hooks & Layouts", category: "technology-programming", tutorId: "t-ops-1", tutorName: "Amit Verma", status: "Approved", visibility: "Visible", price: 1200, enrollments: 120, revenue: 144000, completion: 82, rating: 4.8, certificates: 95, refunds: 1, created: "2026-05-15", updated: "2026-07-20", lastPublished: "2026-07-20", thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=150&auto=format&fit=crop&q=60", riskScore: 12 },
  { id: "c-ops-2", title: "Python Algorithm Bootcamp & PyTest Labs", category: "technology-programming", tutorId: "t-ops-1", tutorName: "Amit Verma", status: "Approved", visibility: "Visible", price: 999, enrollments: 260, revenue: 259740, completion: 86, rating: 4.9, certificates: 150, refunds: 3, created: "2026-04-10", updated: "2026-07-28", lastPublished: "2026-07-28", thumbnail: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=150&auto=format&fit=crop&q=60", riskScore: 8 },
  { id: "c-ops-3", title: "Kuchipudi Mudras & Coordination Masterclass", category: "music-performance", tutorId: "t-ops-2", tutorName: "Priya Patel", status: "Approved", visibility: "Visible", price: 1500, enrollments: 50, revenue: 75000, completion: 65, rating: 4.2, certificates: 30, refunds: 2, created: "2026-05-20", updated: "2026-07-25", lastPublished: "2026-07-25", thumbnail: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=150&auto=format&fit=crop&q=60", riskScore: 40 },
  { id: "c-ops-4", title: "Double-Entry Accounting & Taxation Basics", category: "academics", tutorId: "t-ops-2", tutorName: "Priya Patel", status: "Pending", visibility: "Hidden", price: 999, enrollments: 140, revenue: 139860, completion: 76, rating: 4.6, certificates: 98, refunds: 2, created: "2026-06-01", updated: "2026-07-29", lastPublished: "2026-07-29", thumbnail: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=150&auto=format&fit=crop&q=60", riskScore: 18 },
  { id: "c-ops-5", title: "Figma Prototyping Systems & UI Micro-Animations", category: "creative-arts-design", tutorId: "t-ops-3", tutorName: "Sneha Iyer", status: "Approved", visibility: "Visible", price: 1100, enrollments: 95, revenue: 104500, completion: 70, rating: 4.5, certificates: 55, refunds: 1, created: "2026-05-18", updated: "2026-07-22", lastPublished: "2026-07-22", thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60", riskScore: 15 }
];

const SEED_TUTORS: TutorRecord[] = [
  { id: "t-ops-1", name: "Amit Verma", email: "amit@eduearn.com", avatar: "", status: "Active", verification: "Approved", courses: 5, students: 380, revenue: 403740, wallet: 124000, withdrawals: 279740, rating: 4.8, completion: 84, warnings: 0 },
  { id: "t-ops-2", name: "Priya Patel", email: "priya@eduearn.com", avatar: "", status: "Active", verification: "Approved", courses: 3, students: 190, revenue: 214860, wallet: 68000, withdrawals: 146860, rating: 4.4, completion: 71, warnings: 1 },
  { id: "t-ops-3", name: "Sneha Iyer", email: "sneha@eduearn.com", avatar: "", status: "Active", verification: "Approved", courses: 2, students: 95, revenue: 104500, wallet: 35000, withdrawals: 69500, rating: 4.5, completion: 70, warnings: 0 }
];

const SEED_STUDENTS: StudentRecord[] = [
  { id: "s-ops-1", name: "Rahul Verma", email: "rahul@eduearn.com", avatar: "", courseId: "c-ops-1", courseName: "Mastering React Native Hooks & Layouts", progress: 85, attendance: 90, assignments: "9/10", paymentStatus: "Paid", certificateStatus: "Pending", completion: false, lastActive: "2026-08-01 14:30", riskLevel: "Low", supportTickets: 0 },
  { id: "s-ops-2", name: "Surya K", email: "surya@learner.com", avatar: "", courseId: "c-ops-1", courseName: "Mastering React Native Hooks & Layouts", progress: 40, attendance: 75, assignments: "4/10", paymentStatus: "Paid", certificateStatus: "None", completion: false, lastActive: "2026-07-31 09:15", riskLevel: "Medium", supportTickets: 1 },
  { id: "s-ops-3", name: "Rajesh Kumar", email: "rajesh@learner.com", avatar: "", courseId: "c-ops-2", courseName: "Python Algorithm Bootcamp & PyTest Labs", progress: 100, attendance: 98, assignments: "10/10", paymentStatus: "Paid", certificateStatus: "Issued", completion: true, lastActive: "2026-08-01 18:22", riskLevel: "Low", supportTickets: 0 },
  { id: "s-ops-4", name: "Deepa Nair", email: "deepa@learner.com", avatar: "", courseId: "c-ops-3", courseName: "Kuchipudi Mudras & Coordination Masterclass", progress: 15, attendance: 40, assignments: "1/5", paymentStatus: "Paid", certificateStatus: "None", completion: false, lastActive: "2026-07-24 11:00", riskLevel: "Critical", supportTickets: 2 }
];

const SEED_MODERATION: ModerationItem[] = [
  { id: "mod-1", courseId: "c-ops-3", courseName: "Kuchipudi Mudras & Coordination Masterclass", type: "Abuse", reporter: "Deepa Nair", reason: "Audio levels completely broken in Lecture 3 and tutor unresponsive", status: "Pending", date: "2026-07-28" },
  { id: "mod-2", courseId: "c-ops-4", courseName: "Double-Entry Accounting & Taxation Basics", type: "AI Flag", reporter: "Ecosystem Guard", reason: "Auto-generated slides with inaccurate regulatory terminology", status: "Pending", date: "2026-07-30" }
];

const SEED_RESOURCES: ResourceItem[] = [
  { id: "res-1", name: "React_Hooks_DeepDive_Lecture3.mp4", type: "Video", size: "148 MB", version: "v1.2", downloads: 182, uploadedAt: "2026-06-12" },
  { id: "res-2", name: "Double_Entry_Bookkeeping_MasterGuide.pdf", type: "PDF", size: "4.2 MB", version: "v1.0", downloads: 88, uploadedAt: "2026-06-05" },
  { id: "res-3", name: "Quiz_1_State_Management_Config.json", type: "Quiz", size: "18 KB", version: "v1.1", downloads: 312, uploadedAt: "2026-06-18" }
];

const SEED_AUDITS: AuditHistoryLog[] = [
  { id: "aud-1", who: "Surya (Admin)", action: "Status Changed", entity: "Course (c-ops-1)", oldValue: "Pending", newValue: "Approved", timestamp: "2026-07-20 10:15", ip: "192.168.1.45", device: "Chrome / Windows 11", reason: "Syllabus review completed successfully" },
  { id: "aud-2", who: "Surya (Admin)", action: "Price Changed", entity: "Course (c-ops-2)", oldValue: "₹1,499", newValue: "₹999", timestamp: "2026-07-28 14:02", ip: "192.168.1.45", device: "Chrome / Windows 11", reason: "Promotional alignment with competitive category campaign" }
];

// Helper to resolve icon from key
const getCategoryIcon = (iconName: string) => {
  switch (iconName) {
    case "BookOpenCheck": return <BookOpenCheck size={18} />;
    case "Code2": return <Code2 size={18} />;
    case "Palette": return <Palette size={18} />;
    case "TrendingUp": return <TrendingUp size={18} />;
    case "Atom": return <Atom size={18} />;
    case "Globe2": return <Globe2 size={18} />;
    case "HeartPulse": return <HeartPulse size={18} />;
    case "Languages": return <Languages size={18} />;
    case "Music": return <Music size={18} />;
    default: return <FolderKanban size={18} />;
  }
};

export default function CategoriesTab({ logAuditAction }: CategoriesTabProps) {
  // Navigation stack state
  const [activeSubView, setActiveSubView] = useState<SubViewType>("categories-ops");
  const [navStack, setNavStack] = useState<{
    currentView: "dashboard" | "category-operations" | "course-operations" | "tutor-profile" | "student-details";
    selectedCategoryId: string | null;
    selectedCourseId: string | null;
    selectedTutorId: string | null;
    selectedStudentId: string | null;
  }[]>([
    { currentView: "dashboard", selectedCategoryId: null, selectedCourseId: null, selectedTutorId: null, selectedStudentId: null }
  ]);

  const currentNav = navStack[navStack.length - 1];

  // Core Datasets
  const [categoriesOps, setCategoriesOps] = useState<CategoryMetric[]>([]);
  const [coursesOps, setCoursesOps] = useState<CourseOperation[]>([]);
  const [tutorsOps, setTutorsOps] = useState<TutorRecord[]>([]);
  const [studentsOps, setStudentsOps] = useState<StudentRecord[]>([]);
  const [moderationsOps, setModerationsOps] = useState<ModerationItem[]>([]);
  const [resourcesOps, setResourcesOps] = useState<ResourceItem[]>([]);
  const [auditLogsOps, setAuditLogsOps] = useState<AuditHistoryLog[]>([]);

  // Search, Filters & View Settings
  const [globalSearch, setGlobalSearch] = useState("");
  const [filterRating, setFilterRating] = useState("all");
  const [filterRevenue, setFilterRevenue] = useState("all");
  const [filterStudents, setFilterStudents] = useState("all");
  const [filterHealth, setFilterHealth] = useState("all");
  const [selectedSavedView, setSelectedSavedView] = useState("all");
  const [selectedCardIds, setSelectedCardIds] = useState<string[]>([]);
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);

  // Custom Detail Section Tabs
  const [activeCategoryTab, setActiveCategoryTab] = useState<"overview" | "courses" | "tutors" | "students" | "analytics" | "resources" | "moderation" | "audit">("overview");
  const [activeCourseTab, setActiveCourseTab] = useState<"overview" | "tutor" | "students" | "assignments" | "resources" | "payments" | "certificates" | "reviews" | "analytics" | "audit" | "version">("overview");

  // Legacy Master Tables State
  const [selectedEntity, setSelectedEntity] = useState<EntityType>("languages");
  const [metadataItems, setMetadataItems] = useState<string[]>([]);
  const [newMetadataValue, setNewMetadataValue] = useState("");
  const [editingMetadataIndex, setEditingMetadataIndex] = useState<number | null>(null);
  const [editingMetadataValue, setEditingMetadataValue] = useState("");
  const [records, setRecords] = useState<MasterRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteConfirmRecord, setDeleteConfirmRecord] = useState<MasterRecord | null>(null);
  const [deleteConfirmBulk, setDeleteConfirmBulk] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Form Management states
  const [isEditCourseModalOpen, setIsEditCourseModalOpen] = useState(false);
  const [editingCourseObj, setEditingCourseObj] = useState<CourseOperation | null>(null);
  const [courseFormTitle, setCourseFormTitle] = useState("");
  const [courseFormPrice, setCourseFormPrice] = useState(999);
  const [courseFormStatus, setCourseFormStatus] = useState<CourseOperation["status"]>("Approved");
  const [courseFormVisibility, setCourseFormVisibility] = useState<CourseOperation["visibility"]>("Visible");

  // Safety Confirmation Alert
  const [safetyAlert, setSafetyAlert] = useState<{ isOpen: boolean; title: string; message: string } | null>(null);

  // Initialize datasets
  const loadDatabase = () => {
    if (typeof window === "undefined") return;

    // Categories
    const localCats = localStorage.getItem("eduearn_admin_categories");
    const catsData: CategoryMetric[] = localCats ? JSON.parse(localCats) : DEFAULT_CATEGORY_OPS;
    setCategoriesOps(catsData);
    if (!localCats) localStorage.setItem("eduearn_admin_categories", JSON.stringify(DEFAULT_CATEGORY_OPS));

    // Courses
    const localCourses = localStorage.getItem("eduearn_admin_courses");
    const coursesData: CourseOperation[] = localCourses ? JSON.parse(localCourses) : SEED_COURSES;
    setCoursesOps(coursesData);
    if (!localCourses) localStorage.setItem("eduearn_admin_courses", JSON.stringify(SEED_COURSES));

    // Operations (Tutors, Students, Moderation, Resources)
    const localOps = localStorage.getItem("eduearn_admin_operations");
    const opsData = localOps ? JSON.parse(localOps) : { tutors: SEED_TUTORS, students: SEED_STUDENTS, moderations: SEED_MODERATION, resources: SEED_RESOURCES };
    setTutorsOps(opsData.tutors);
    setStudentsOps(opsData.students);
    setModerationsOps(opsData.moderations);
    setResourcesOps(opsData.resources);
    if (!localOps) localStorage.setItem("eduearn_admin_operations", JSON.stringify(opsData));

    // Audits
    const localAudits = localStorage.getItem("eduearn_course_audit");
    const auditsData: AuditHistoryLog[] = localAudits ? JSON.parse(localAudits) : SEED_AUDITS;
    setAuditLogsOps(auditsData);
    if (!localAudits) localStorage.setItem("eduearn_course_audit", JSON.stringify(SEED_AUDITS));
  };

  useEffect(() => {
    loadDatabase();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveCategoriesToLocal = (data: CategoryMetric[]) => {
    setCategoriesOps(data);
    localStorage.setItem("eduearn_admin_categories", JSON.stringify(data));
  };

  const saveCoursesToLocal = (data: CourseOperation[]) => {
    setCoursesOps(data);
    localStorage.setItem("eduearn_admin_courses", JSON.stringify(data));
  };

  const saveOperationsToLocal = (tutors: TutorRecord[], students: StudentRecord[], moderations: ModerationItem[], resources: ResourceItem[]) => {
    setTutorsOps(tutors);
    setStudentsOps(students);
    setModerationsOps(moderations);
    setResourcesOps(resources);
    localStorage.setItem("eduearn_admin_operations", JSON.stringify({ tutors, students, moderations, resources }));
  };

  const saveAuditsToLocal = (data: AuditHistoryLog[]) => {
    setAuditLogsOps(data);
    localStorage.setItem("eduearn_course_audit", JSON.stringify(data));
  };

  // Push new audit log
  const pushAuditLog = (action: string, entity: string, oldValue: string, newValue: string, reason: string) => {
    const newLog: AuditHistoryLog = {
      id: `aud-${Date.now()}`,
      who: "Surya (Admin)",
      action,
      entity,
      oldValue,
      newValue,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
      ip: "192.168.1.100",
      device: "Chrome / macOS Ventura",
      reason
    };
    const updated = [newLog, ...auditLogsOps];
    saveAuditsToLocal(updated);
    logAuditAction(`${action} on ${entity}: Changed from "${oldValue}" to "${newValue}". Reason: ${reason}`);
  };

  // Drilldown helper navigations
  const pushNav = (view: typeof currentNav.currentView, selectedCategoryId: string | null = null, selectedCourseId: string | null = null, selectedTutorId: string | null = null, selectedStudentId: string | null = null) => {
    setNavStack(prev => [
      ...prev,
      { currentView: view, selectedCategoryId, selectedCourseId, selectedTutorId, selectedStudentId }
    ]);
  };

  const popNav = () => {
    if (navStack.length > 1) {
      setNavStack(prev => prev.slice(0, -1));
    }
  };

  // Advanced Filtering logic for categories
  const filteredCategories = useMemo(() => {
    return categoriesOps.filter(cat => {
      // Search match
      const matchesSearch = cat.name.toLowerCase().includes(globalSearch.toLowerCase());
      
      // Rating filter
      const matchesRating = filterRating === "all" ? true :
                            filterRating === "high" ? cat.averageRating >= 4.7 :
                            filterRating === "avg" ? cat.averageRating >= 4.4 : true;

      // Revenue filter
      const matchesRevenue = filterRevenue === "all" ? true :
                             filterRevenue === "high" ? cat.monthlyRevenue >= 150000 :
                             filterRevenue === "low" ? cat.monthlyRevenue < 100000 : true;

      // Students count filter
      const matchesStudents = filterStudents === "all" ? true :
                              filterStudents === "high" ? cat.totalStudents >= 200 :
                              filterStudents === "low" ? cat.totalStudents < 100 : true;

      // Health status filter
      const matchesHealth = filterHealth === "all" ? true :
                            filterHealth === "healthy" ? cat.healthScore >= 90 :
                            filterHealth === "warning" ? cat.healthScore < 90 && cat.healthScore >= 80 :
                            filterHealth === "critical" ? cat.healthScore < 80 : true;

      // Saved view overrides
      if (selectedSavedView === "revenue") {
        return matchesSearch && cat.monthlyRevenue >= 150000;
      }
      if (selectedSavedView === "moderation") {
        return matchesSearch && cat.pendingModeration > 0;
      }
      if (selectedSavedView === "critical") {
        return matchesSearch && cat.healthScore < 82;
      }

      return matchesSearch && matchesRating && matchesRevenue && matchesStudents && matchesHealth;
    });
  }, [categoriesOps, globalSearch, filterRating, filterRevenue, filterStudents, filterHealth, selectedSavedView]);

  // Bulk Operations Handlers
  const handleBulkPublish = () => {
    if (selectedCardIds.length === 0) {
      toast.warning("No categories selected for bulk publishing.");
      return;
    }
    const updated = categoriesOps.map(cat => {
      if (selectedCardIds.includes(cat.id)) {
        return { ...cat, lastUpdated: new Date().toISOString().substring(0, 10) };
      }
      return cat;
    });
    saveCategoriesToLocal(updated);
    pushAuditLog("Bulk Publish", `Categories: ${selectedCardIds.join(", ")}`, "Various", "Published/Updated", "Bulk administration dashboard trigger");
    toast.success(`Successfully updated ${selectedCardIds.length} categories.`);
    setSelectedCardIds([]);
  };

  const handleBulkArchive = () => {
    if (selectedCardIds.length === 0) {
      toast.warning("No categories selected.");
      return;
    }
    pushAuditLog("Bulk Archive", `Categories: ${selectedCardIds.join(", ")}`, "Active", "Archived", "Ecosystem configuration adjustment");
    toast.success(`Archived ${selectedCardIds.length} categories.`);
    setSelectedCardIds([]);
  };

  const handleBulkDeleteCategories = () => {
    if (selectedCardIds.length === 0) {
      toast.warning("No categories selected.");
      return;
    }

    // Safety checks: Categories containing active courses cannot be deleted
    const violationNames: string[] = [];
    selectedCardIds.forEach(id => {
      const hasCourses = coursesOps.some(c => c.category === id);
      if (hasCourses) {
        const catObj = categoriesOps.find(c => c.id === id);
        if (catObj) violationNames.push(catObj.name);
      }
    });

    if (violationNames.length > 0) {
      setSafetyAlert({
        isOpen: true,
        title: "Security Guard Policy Violation",
        message: `Deletion rejected. The following categories contain active courses which cannot be orphaned: ${violationNames.join(", ")}. Please transfer or archive all courses first.`
      });
      return;
    }

    // Delete allowed
    if (window.confirm(`Are you sure you want to delete the ${selectedCardIds.length} selected categories?`)) {
      const updated = categoriesOps.filter(c => !selectedCardIds.includes(c.id));
      saveCategoriesToLocal(updated);
      pushAuditLog("Bulk Delete", `Categories: ${selectedCardIds.join(", ")}`, "Active", "Deleted", "Governance purge");
      toast.success("Categories deleted successfully.");
      setSelectedCardIds([]);
    }
  };

  // Single Category security deletion guard
  const handleDeleteCategory = (catId: string, catName: string) => {
    const hasCourses = coursesOps.some(c => c.category === catId);
    if (hasCourses) {
      setSafetyAlert({
        isOpen: true,
        title: "Category Security Interceptor Triggered",
        message: `Cannot delete "${catName}" because it is currently linked to active course listings. Under canvas-grade policies, active taxonomy folders cannot be pruned.`
      });
      return;
    }

    // Check active enrollments
    const catMetric = categoriesOps.find(c => c.id === catId);
    if (catMetric && catMetric.activeEnrollments > 0) {
      setSafetyAlert({
        isOpen: true,
        title: "Category Security Interceptor Triggered",
        message: `Cannot delete "${catName}" because there are active students enrolled in this category ecosystem.`
      });
      return;
    }

    if (window.confirm(`Are you sure you want to completely delete category taxonomy node "${catName}"?`)) {
      const updated = categoriesOps.filter(c => c.id !== catId);
      saveCategoriesToLocal(updated);
      pushAuditLog("Category Deleted", catName, "Active", "Permanently Purged", "Governance manual override");
      toast.success("Category deleted.");
      // Back if we are currently inside it
      if (currentNav.selectedCategoryId === catId) {
        popNav();
      }
    }
  };

  // Course deletion guard
  const handleDeleteCourse = (courseId: string, courseName: string) => {
    const courseObj = coursesOps.find(c => c.id === courseId);
    if (courseObj && courseObj.enrollments > 0) {
      setSafetyAlert({
        isOpen: true,
        title: "Course Security Interceptor Triggered",
        message: `Cannot delete course "${courseName}" (ID: ${courseId}) because it contains active student enrollments (${courseObj.enrollments} learners). Please suspend the course or process student transfer protocols first.`
      });
      return;
    }

    if (window.confirm(`Are you sure you want to delete course "${courseName}"?`)) {
      const updated = coursesOps.filter(c => c.id !== courseId);
      saveCoursesToLocal(updated);
      pushAuditLog("Course Deleted", courseName, "Active", "Deleted", "Manual admin review command");
      toast.success("Course deleted successfully.");
      if (currentNav.selectedCourseId === courseId) {
        popNav();
      }
    }
  };

  // Tutor deletion security guard
  const handleSuspendTutor = (tutorId: string, tutorName: string) => {
    const tutorObj = tutorsOps.find(t => t.id === tutorId);
    if (!tutorObj) return;

    if (tutorObj.courses > 0) {
      setSafetyAlert({
        isOpen: true,
        title: "Tutor Security Interceptor Triggered",
        message: `Tutor "${tutorName}" has ${tutorObj.courses} assigned courses. Platform records cannot be suspended without transferring catalog responsibilities first.`
      });
      return;
    }

    const nextStatus: "Active" | "Suspended" = tutorObj.status === "Active" ? "Suspended" : "Active";
    const updated = tutorsOps.map(t => {
      if (t.id === tutorId) return { ...t, status: nextStatus };
      return t;
    });
    saveOperationsToLocal(updated, studentsOps, moderationsOps, resourcesOps);
    pushAuditLog("Tutor Status Toggle", tutorName, tutorObj.status, nextStatus, "Admin policy check");
    toast.success(`Tutor account marked ${nextStatus}.`);
  };

  // Open Edit Course
  const openEditCourse = (course: CourseOperation) => {
    setEditingCourseObj(course);
    setCourseFormTitle(course.title);
    setCourseFormPrice(course.price);
    setCourseFormStatus(course.status);
    setCourseFormVisibility(course.visibility);
    setIsEditCourseModalOpen(true);
  };

  // Save Edit Course
  const saveCourseForm = () => {
    if (!editingCourseObj) return;
    const updated = coursesOps.map(c => {
      if (c.id === editingCourseObj.id) {
        return {
          ...c,
          title: courseFormTitle,
          price: Number(courseFormPrice),
          status: courseFormStatus,
          visibility: courseFormVisibility,
          updated: new Date().toISOString().substring(0, 10)
        };
      }
      return c;
    });
    saveCoursesToLocal(updated);
    pushAuditLog(
      "Course Meta Updated",
      editingCourseObj.title,
      `Price: ${editingCourseObj.price}, Status: ${editingCourseObj.status}`,
      `Price: ${courseFormPrice}, Status: ${courseFormStatus}`,
      "Manual metadata correction console action"
    );
    toast.success("Course metrics saved.");
    setIsEditCourseModalOpen(false);
    setEditingCourseObj(null);
  };

  // Export dataset triggers
  const triggerExportCSV = (title: string, data: any[]) => {
    if (data.length === 0) {
      toast.error("Export dataset is empty.");
      return;
    }
    const headers = Object.keys(data[0]).join(",");
    const rows = data.map(row => 
      Object.values(row).map(val => `"${String(val).replace(/"/g, '""')}"`).join(",")
    ).join("\n");
    
    const blob = new Blob([headers + "\n" + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${title.toLowerCase().replace(/\s+/g, "_")}_export.csv`);
    link.click();
    toast.success(`${title} successfully exported to CSV.`);
  };

  // ==========================================
  // LEGACY MASTER DATA HANDLERS (UNCHANGED BACKWARD COMPATIBILITY)
  // ==========================================
  const getFullMasterRecords = (entity: EntityType): MasterRecord[] => {
    if (typeof window === "undefined") {
      return SEED_DATA[entity].map((item, idx) => ({
        id: `${entity}_${idx}`,
        name: item.name,
        status: "Active",
        isSystem: item.isSystem,
        createdBy: "System Admin",
        createdAt: new Date().toISOString(),
        updatedBy: "System Admin",
        updatedAt: new Date().toISOString(),
      }));
    }

    const saved = localStorage.getItem(`eduearn_master_${entity}`);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }

    const initial = SEED_DATA[entity].map((item, idx) => ({
      id: `master_${selectedEntity}_record_${idx}_${Date.now()}`,
      name: item.name,
      status: "Active" as const,
      isSystem: item.isSystem,
      createdBy: "System Admin",
      createdAt: new Date().toISOString(),
      updatedBy: "System Admin",
      updatedAt: new Date().toISOString(),
    }));
    localStorage.setItem(`eduearn_master_${entity}`, JSON.stringify(initial));

    const activeNames = initial.filter(r => r.status === "Active").map(r => r.name);
    localStorage.setItem(getMarketplaceStorageKey(entity), JSON.stringify(activeNames));

    return initial;
  };

  const getMarketplaceStorageKey = (entity: EntityType): string => {
    switch (entity) {
      case "languages": return "eduearn_languages";
      case "levels": return "eduearn_levels";
      case "tags": return "eduearn_course_tags";
      case "difficulties": return "eduearn_difficulties";
      case "certificates": return "eduearn_certificates";
      case "course_types": return "eduearn_course_types";
      case "live_class_types": return "eduearn_live_class_types";
    }
  };

  const loadMetadata = () => {
    const full = getFullMasterRecords(selectedEntity);
    setRecords(full);
    const activeNames = full.filter(r => r.status === "Active").map(r => r.name);
    setMetadataItems(activeNames);
    setSelectedIds([]);
  };

  const filteredRecords = useMemo(() => {
    return records.filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [records, searchTerm]);

  const handleExportCSV = () => {
    const headers = "Name,Status,IsSystem,CreatedBy,CreatedAt,UpdatedBy,UpdatedAt\n";
    const rows = records.map(r => 
      `"${r.name}","${r.status}",${r.isSystem},"${r.createdBy}","${r.createdAt}","${r.updatedBy}","${r.updatedAt}"`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `master_${selectedEntity}_export.csv`);
    link.click();
    toast.success("CSV exported successfully!");
  };

  const handleDownloadTemplate = () => {
    const content = "Name\nEnglish\nSpanish\nFrench\n";
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `master_${selectedEntity}_template.csv`);
    link.click();
    toast.success("Template downloaded successfully!");
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
      if (lines.length <= 1) {
        toast.error("CSV file is empty or missing headers");
        return;
      }

      const header = lines[0].toLowerCase();
      if (!header.includes("name")) {
        toast.error("Invalid CSV format. Header must contain 'Name'");
        return;
      }

      const importedNames = lines.slice(1).map(line => {
        return line.replace(/^["']|["']$/g, '').trim();
      }).filter(Boolean);

      let addedCount = 0;
      let duplicateCount = 0;
      const updated = [...records];

      importedNames.forEach(name => {
        const isDuplicate = updated.some(r => r.name.toLowerCase() === name.toLowerCase());
        if (isDuplicate) {
          duplicateCount++;
        } else {
          updated.push({
            id: `master_${selectedEntity}_${Date.now()}_${Math.random()}`,
            name,
            status: "Active" as const,
            isSystem: false,
            createdBy: "CSV Import",
            createdAt: new Date().toISOString(),
            updatedBy: "CSV Import",
            updatedAt: new Date().toISOString(),
          });
          addedCount++;
        }
      });

      if (addedCount > 0) {
        saveRecords(selectedEntity, updated);
        toast.success(`Successfully imported ${addedCount} records!`);
      }
      if (duplicateCount > 0) {
        toast.warning(`Skipped ${duplicateCount} duplicate names.`);
      }
      e.target.value = "";
    };
    reader.readAsText(file);
  };

  const handleBulkStatusChange = (status: "Active" | "Inactive") => {
    if (selectedIds.length === 0) {
      toast.warning("No records selected.");
      return;
    }

    let skipCount = 0;
    const updated = records.map(r => {
      if (selectedIds.includes(r.id)) {
        if (r.isSystem && !isSuperAdmin && status === "Inactive") {
          skipCount++;
          return r;
        }
        return {
          ...r,
          status,
          updatedBy: "Admin User",
          updatedAt: new Date().toISOString(),
        };
      }
      return r;
    });

    saveRecords(selectedEntity, updated);
    logAuditAction(`Bulk changed status of ${selectedIds.length} items in ${selectedEntity} to ${status}`);
    
    if (skipCount > 0) {
      toast.warning(`Status updated. Skipped ${skipCount} system records.`);
    } else {
      toast.success(`Status updated for selected records.`);
    }
    setSelectedIds([]);
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) {
      toast.warning("No records selected.");
      return;
    }
    setDeleteConfirmBulk(true);
  };

  const confirmBulkDelete = () => {
    let skipCount = 0;
    const updated = records.filter(r => {
      if (selectedIds.includes(r.id)) {
        if (r.isSystem && !isSuperAdmin) {
          skipCount++;
          return true;
        }
        return false;
      }
      return true;
    });

    saveRecords(selectedEntity, updated);
    logAuditAction(`Bulk deleted items in ${selectedEntity}`);
    
    if (skipCount > 0) {
      toast.warning(`Deleted selected records. Skipped ${skipCount} system records.`);
    } else {
      toast.success("Selected records deleted successfully.");
    }
    setSelectedIds([]);
    setDeleteConfirmBulk(false);
  };

  const handleBulkExport = () => {
    if (selectedIds.length === 0) {
      toast.warning("No records selected.");
      return;
    }

    const selectedRecords = records.filter(r => selectedIds.includes(r.id));
    const headers = "Name,Status,IsSystem,CreatedBy,CreatedAt,UpdatedBy,UpdatedAt\n";
    const rows = selectedRecords.map(r => 
      `"${r.name}","${r.status}",${r.isSystem},"${r.createdBy}","${r.createdAt}","${r.updatedBy}","${r.updatedAt}"`
    ).join("\n");
    
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `master_${selectedEntity}_selected_export.csv`);
    link.click();
    toast.success("Selected records exported to CSV!");
    setSelectedIds([]);
  };

  const getRecordUsage = (name: string, entity: EntityType) => {
    const charSum = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    let courses = 0;
    let tutors = 0;
    let students = 0;

    if (entity === "languages" || entity === "levels" || entity === "difficulties" || entity === "course_types") {
      courses = (charSum % 40) + 5;
      tutors = (charSum % 25) + 3;
      students = (charSum % 180) + 20;
    } else if (entity === "tags") {
      courses = (charSum % 60) + 2;
      tutors = 0;
      students = (charSum % 120) + 10;
    } else if (entity === "certificates") {
      courses = (charSum % 15) + 1;
      tutors = (charSum % 10) + 1;
      students = (charSum % 90) + 5;
    } else if (entity === "live_class_types") {
      courses = 0;
      tutors = (charSum % 12) + 2;
      students = (charSum % 50) + 5;
    }
    return { courses, tutors, students, total: courses + tutors + students };
  };

  const saveRecords = (entity: EntityType, updated: MasterRecord[]) => {
    setRecords(updated);
    localStorage.setItem(`eduearn_master_${entity}`, JSON.stringify(updated));
    const activeNames = updated.filter(r => r.status === "Active").map(r => r.name);
    setMetadataItems(activeNames);
    const key = getMarketplaceStorageKey(entity);
    localStorage.setItem(key, JSON.stringify(activeNames));
    window.dispatchEvent(new Event("storage"));
  };

  const confirmDeleteRecord = () => {
    if (!deleteConfirmRecord) return;
    if (deleteConfirmRecord.isSystem && !isSuperAdmin) {
      toast.error("System records cannot be deleted without Super Admin permission.");
      return;
    }
    const updated = records.filter(r => r.id !== deleteConfirmRecord.id);
    saveRecords(selectedEntity, updated);
    logAuditAction(`Deleted master metadata item: "${deleteConfirmRecord.name}"`);
    toast.success("Item deleted successfully.");
    setDeleteConfirmRecord(null);
  };

  const handleRenameMetadata = (id: string) => {
    const val = editingName.trim();
    if (!val) return;

    const record = records.find(r => r.id === id);
    if (!record) return;

    if (record.name === val) {
      setEditingId(null);
      return;
    }

    const isDuplicate = records.some(r => r.id !== id && r.name.toLowerCase() === val.toLowerCase());
    if (isDuplicate) {
      toast.error("An item with this name already exists.");
      return;
    }

    const updated = records.map(r => {
      if (r.id === id) {
        return { ...r, name: val, updatedBy: "Admin User", updatedAt: new Date().toISOString() };
      }
      return r;
    });

    saveRecords(selectedEntity, updated);
    logAuditAction(`Renamed metadata from "${record.name}" to "${val}"`);
    setEditingId(null);
    setEditingName("");
    toast.success("Item renamed successfully.");
  };

  const handleToggleStatus = (id: string, currentStatus: "Active" | "Inactive") => {
    const record = records.find(r => r.id === id);
    if (!record) return;

    if (record.isSystem && !isSuperAdmin) {
      toast.error("System records cannot be disabled without Super Admin permission.");
      return;
    }

    const nextStatus: "Active" | "Inactive" = currentStatus === "Active" ? "Inactive" : "Active";
    const updated = records.map(r => {
      if (r.id === id) {
        return { ...r, status: nextStatus, updatedBy: "Admin User", updatedAt: new Date().toISOString() };
      }
      return r;
    });

    saveRecords(selectedEntity, updated);
    logAuditAction(`Toggled status of "${record.name}" to ${nextStatus}`);
    toast.success(`Status changed to ${nextStatus}.`);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };
  const handleDragOver = (e: React.DragEvent, index: number) => { e.preventDefault(); };
  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;
    const updated = [...records];
    const [draggedItem] = updated.splice(draggedIndex, 1);
    updated.splice(targetIndex, 0, draggedItem);
    saveRecords(selectedEntity, updated);
    logAuditAction(`Reordered master data items`);
    toast.success("Order updated!");
    setDraggedIndex(null);
  };
  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleAddMetadata = (e: React.FormEvent) => {
    e.preventDefault();
    const val = newMetadataValue.trim();
    if (!val) return;
    const isDuplicate = records.some(r => r.name.toLowerCase() === val.toLowerCase());
    if (isDuplicate) {
      toast.error("An item with this name already exists.");
      return;
    }
    const newRecord: MasterRecord = {
      id: `master_${selectedEntity}_${Date.now()}`,
      name: val,
      status: "Active",
      isSystem: false,
      createdBy: "Admin User",
      createdAt: new Date().toISOString(),
      updatedBy: "Admin User",
      updatedAt: new Date().toISOString()
    };
    const updated = [...records, newRecord];
    saveRecords(selectedEntity, updated);
    toast.success("Item added successfully.");
    setNewMetadataValue("");
  };

  useEffect(() => {
    loadMetadata();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEntity]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="space-y-6 text-left"
    >
      {/* SUB-VIEW NAVIGATION */}
      <div className="flex border-b border-border/40 pb-2 gap-2 select-none">
        <button
          onClick={() => setActiveSubView("categories-ops")}
          className={`px-3.5 py-1.5 border rounded-button text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors ${
            activeSubView === "categories-ops"
              ? "bg-primary border-primary text-white shadow-soft"
              : "border-border text-muted-foreground hover:bg-muted/40"
          }`}
        >
          <FolderKanban size={12} />
          <span>Platform Operations Center</span>
        </button>
        <button
          onClick={() => setActiveSubView("metadata")}
          className={`px-3.5 py-1.5 border rounded-button text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors ${
            activeSubView === "metadata"
              ? "bg-primary border-primary text-white shadow-soft"
              : "border-border text-muted-foreground hover:bg-muted/40"
          }`}
        >
          <Sliders size={12} />
          <span>Master Platform Tables</span>
        </button>
      </div>

      {/* OPERATIONS SUB VIEW */}
      {activeSubView === "categories-ops" && (
        <div className="space-y-6">
          {/* Breadcrumb drill-down info */}
          {navStack.length > 1 && (
            <div className="flex items-center gap-2 select-none text-[10px] font-black uppercase text-primary border border-primary/20 bg-primary/5 px-3 py-1.5 rounded-card w-fit">
              <button onClick={() => setNavStack([{ currentView: "dashboard", selectedCategoryId: null, selectedCourseId: null, selectedTutorId: null, selectedStudentId: null }])} className="hover:underline">Dashboard</button>
              {navStack.map((step, idx) => {
                if (idx === 0) return null;
                const catObj = categoriesOps.find(c => c.id === step.selectedCategoryId);
                const courseObj = coursesOps.find(c => c.id === step.selectedCourseId);
                const tutorObj = tutorsOps.find(t => t.id === step.selectedTutorId);
                const studentObj = studentsOps.find(s => s.id === step.selectedStudentId);
                
                let label = "";
                if (step.currentView === "category-operations") label = catObj?.name || "Category";
                if (step.currentView === "course-operations") label = courseObj?.title || "Course";
                if (step.currentView === "tutor-profile") label = `Tutor: ${tutorObj?.name || "Profile"}`;
                if (step.currentView === "student-details") label = `Student: ${studentObj?.name || "Details"}`;
                
                return (
                  <React.Fragment key={idx}>
                    <span>/</span>
                    <button onClick={() => setNavStack(prev => prev.slice(0, idx + 1))} className="hover:underline max-w-[120px] truncate">{label}</button>
                  </React.Fragment>
                );
              })}
            </div>
          )}

          {/* VIEW: GLOBAL DASHBOARD GRID */}
          {currentNav.currentView === "dashboard" && (
            <>
              {/* TOP HEADER GLOBAL TOOLBAR (PHASE 10) */}
              <Card className="p-4 border-border bg-card shadow-soft space-y-4">
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 select-none">
                  {/* Left Search & Saved Views */}
                  <div className="flex flex-wrap items-center gap-3 flex-grow max-w-3xl">
                    <div className="relative flex-grow max-w-md">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Search category operators..."
                        value={globalSearch}
                        onChange={(e) => setGlobalSearch(e.target.value)}
                        className="w-full h-9 pl-9 pr-3 rounded border border-border bg-muted/10 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/10"
                      />
                    </div>

                    <select
                      value={selectedSavedView}
                      onChange={(e) => {
                        setSelectedSavedView(e.target.value);
                        if (e.target.value === "revenue") setFilterRevenue("high");
                        if (e.target.value === "moderation") setFilterRating("all");
                        if (e.target.value === "critical") setFilterHealth("critical");
                      }}
                      className="h-9 px-3 border border-border rounded bg-card text-xs font-bold text-foreground focus:outline-none"
                    >
                      <option value="all">Saved Views: Default</option>
                      <option value="revenue">⚡ Top Revenue Categories</option>
                      <option value="moderation">🚨 Action Required (Flags)</option>
                      <option value="critical">⚠️ Critical Health Warnings</option>
                    </select>
                  </div>

                  {/* Right Advanced Filters & Export */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0 justify-end">
                    <button
                      onClick={loadDatabase}
                      className="h-9 px-3 border border-border hover:bg-muted text-foreground text-[10px] font-bold uppercase tracking-wider rounded transition-colors flex items-center gap-1"
                    >
                      <RefreshCw size={13} />
                      <span>Sync Stats</span>
                    </button>

                    <button
                      onClick={() => triggerExportCSV("Categories_Overview", filteredCategories)}
                      className="h-9 px-3 bg-primary hover:opacity-90 text-white text-[10px] font-bold uppercase tracking-wider rounded transition-colors flex items-center gap-1.5"
                    >
                      <Download size={13} />
                      <span>Export Grid</span>
                    </button>
                  </div>
                </div>

                {/* Sub-Filters Drawer Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 border-t border-border/20 select-none">
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-muted-foreground uppercase">Average Rating</label>
                    <select value={filterRating} onChange={(e) => setFilterRating(e.target.value)} className="w-full h-8 px-2 border border-border rounded text-[10px] font-semibold bg-card text-foreground">
                      <option value="all">All Ratings</option>
                      <option value="high">Excellent (&gt;4.7)</option>
                      <option value="avg">Healthy (&gt;4.4)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-muted-foreground uppercase">Monthly Revenue</label>
                    <select value={filterRevenue} onChange={(e) => setFilterRevenue(e.target.value)} className="w-full h-8 px-2 border border-border rounded text-[10px] font-semibold bg-card text-foreground">
                      <option value="all">All Revenues</option>
                      <option value="high">High (&gt;₹1.5L)</option>
                      <option value="low">Low (&lt;₹1L)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-muted-foreground uppercase">Total Students</label>
                    <select value={filterStudents} onChange={(e) => setFilterStudents(e.target.value)} className="w-full h-8 px-2 border border-border rounded text-[10px] font-semibold bg-card text-foreground">
                      <option value="all">All Student Volume</option>
                      <option value="high">High (&gt;200)</option>
                      <option value="low">Low (&lt;100)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-muted-foreground uppercase">Health Score</label>
                    <select value={filterHealth} onChange={(e) => setFilterHealth(e.target.value)} className="w-full h-8 px-2 border border-border rounded text-[10px] font-semibold bg-card text-foreground">
                      <option value="all">All Health states</option>
                      <option value="healthy">Healthy (&gt;90)</option>
                      <option value="warning">Warning (80-90)</option>
                      <option value="critical">Critical (&lt;80)</option>
                    </select>
                  </div>
                </div>

                {/* Bulk Actions row */}
                {selectedCardIds.length > 0 && (
                  <div className="bg-primary/5 border border-primary/20 p-2.5 rounded flex items-center justify-between select-none text-[10px] font-bold">
                    <span className="text-primary">Selected {selectedCardIds.length} categories</span>
                    <div className="flex items-center gap-2">
                      <button onClick={handleBulkPublish} className="h-7 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded uppercase tracking-wider text-[9px]">Bulk Publish</button>
                      <button onClick={handleBulkArchive} className="h-7 px-3 bg-slate-600 hover:bg-slate-700 text-white rounded uppercase tracking-wider text-[9px]">Bulk Archive</button>
                      <button onClick={handleBulkDeleteCategories} className="h-7 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded uppercase tracking-wider text-[9px]">Bulk Delete</button>
                    </div>
                  </div>
                )}
              </Card>

              {/* CATEGORIES OPERATIONS CARDS GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCategories.map(cat => {
                  const isChecked = selectedCardIds.includes(cat.id);
                  
                  return (
                    <Card
                      key={cat.id}
                      className="border border-border/80 bg-card/45 backdrop-blur-md overflow-hidden rounded-xl shadow-soft hover:shadow-floating transition-all duration-300 relative group flex flex-col justify-between"
                    >
                      {/* Top banner visual header */}
                      <div className={`h-16 bg-gradient-to-r ${cat.banner} p-3.5 flex items-center justify-between text-white relative`}>
                        <div className="absolute inset-0 bg-black/10 mix-blend-overlay" />
                        <div className="flex items-center gap-2 relative z-10">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              e.stopPropagation();
                              if (e.target.checked) setSelectedCardIds(p => [...p, cat.id]);
                              else setSelectedCardIds(p => p.filter(id => id !== cat.id));
                            }}
                            className="w-3.5 h-3.5 rounded border-white/40 focus:ring-transparent text-primary cursor-pointer"
                          />
                          <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center">
                            {getCategoryIcon(cat.icon)}
                          </div>
                          <span className="font-heading font-extrabold text-xs tracking-tight">{cat.name}</span>
                        </div>
                        
                        <div className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full z-10 ${
                          cat.healthScore >= 90 ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/35" :
                          cat.healthScore >= 80 ? "bg-amber-500/20 text-amber-300 border border-amber-500/35" :
                          "bg-rose-500/25 text-rose-300 border border-rose-500/40 animate-pulse"
                        }`}>
                          Health {cat.healthScore}%
                        </div>
                      </div>

                      {/* Management KPI Stats Body */}
                      <div className="p-4 grid grid-cols-2 gap-3.5 text-left border-b border-border/30">
                        <div className="space-y-0.5">
                          <span className="text-[8px] font-black text-muted-foreground uppercase">Inventory (P/D/A)</span>
                          <p className="text-xs font-extrabold text-foreground">{cat.publishedCourses} / {cat.draftCourses} / {cat.archivedCourses}</p>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[8px] font-black text-muted-foreground uppercase">Instructors / Students</span>
                          <p className="text-xs font-extrabold text-foreground">{cat.totalTutors} / {cat.totalStudents}</p>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[8px] font-black text-muted-foreground uppercase">Completion / Rating</span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-extrabold text-foreground">{cat.completionRate}%</span>
                            <span className="text-[9px] text-amber-500 font-bold flex items-center">⭐ {cat.averageRating}</span>
                          </div>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[8px] font-black text-muted-foreground uppercase">Monthly Revenue</span>
                          <p className="text-xs font-extrabold text-primary">₹{cat.monthlyRevenue.toLocaleString()}</p>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[8px] font-black text-muted-foreground uppercase">Verification Logs</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] text-rose-500 font-bold">⚠️ {cat.refundRequests} Refunds</span>
                            <span className="text-[9px] text-amber-500 font-bold">🚨 {cat.pendingModeration} Mod</span>
                          </div>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[8px] font-black text-muted-foreground uppercase">Last Audit Action</span>
                          <p className="text-[10px] text-muted-foreground font-semibold">{cat.lastUpdated}</p>
                        </div>
                      </div>

                      {/* Card Operations Buttons Row */}
                      <div className="p-3 bg-muted/10 flex items-center justify-between select-none">
                        <Button
                          size="sm"
                          onClick={() => pushNav("category-operations", cat.id)}
                          className="h-8 text-[10px] font-black uppercase tracking-wider bg-primary/10 text-primary hover:bg-primary/20 flex-grow mr-2"
                        >
                          Manage Category
                        </Button>
                        <button
                          onClick={() => handleDeleteCategory(cat.id, cat.name)}
                          className="p-2 border border-border/70 text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-button transition-all cursor-pointer"
                          title="Purge Category taxonomy"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </>
          )}

          {/* VIEW: CATEGORY DETAILS WORKSPACE */}
          {currentNav.currentView === "category-operations" && (
            <div className="space-y-6">
              {/* Back actions bar */}
              <div className="flex items-center justify-between select-none border-b border-border/20 pb-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={popNav}
                    className="p-2 border border-border hover:bg-muted text-foreground rounded-button transition-colors cursor-pointer"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <div>
                    <h2 className="text-base font-heading font-black text-foreground uppercase tracking-wide">
                      {categoriesOps.find(c => c.id === currentNav.selectedCategoryId)?.name} Operations
                    </h2>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Operational directory covering courses, payouts ledger, tutor validation queues, and student risk parameters.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const catObj = categoriesOps.find(c => c.id === currentNav.selectedCategoryId);
                      if (catObj) triggerExportCSV(catObj.name, coursesOps.filter(c => c.category === catObj.id));
                    }}
                    className="h-9 px-3 border border-border hover:bg-muted text-[10px] font-bold uppercase tracking-wider text-foreground rounded transition-colors"
                  >
                    Export Section
                  </button>
                </div>
              </div>

              {/* Local Navigation Tabs for Category Detail */}
              <div className="flex flex-wrap border-b border-border/30 pb-2 gap-1.5 select-none">
                {[
                  { id: "overview", label: "Overview", icon: Activity },
                  { id: "courses", label: "Course Inventory", icon: BookOpenCheck },
                  { id: "tutors", label: "Tutor Registry", icon: Users },
                  { id: "students", label: "Student Analytics", icon: UserCheck },
                  { id: "analytics", label: "Performance Analytics", icon: BarChart3 },
                  { id: "resources", label: "Resource Inspector", icon: Layers },
                  { id: "moderation", label: "Moderation Queue", icon: Shield },
                  { id: "audit", label: "Change Audit Logs", icon: Clock }
                ].map(tab => {
                  const IconComp = tab.icon;
                  const isActive = activeCategoryTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveCategoryTab(tab.id as any)}
                      className={`h-8 px-3.5 border rounded-button text-[9px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer ${
                        isActive ? "bg-primary border-primary text-white" : "border-border/60 text-muted-foreground hover:bg-muted/40"
                      }`}
                    >
                      <IconComp size={12} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Sub-view: OVERVIEW */}
              {activeCategoryTab === "overview" && (
                <div className="space-y-6">
                  {/* KPI cards grid */}
                  {(() => {
                    const cat = categoriesOps.find(c => c.id === currentNav.selectedCategoryId);
                    if (!cat) return null;
                    return (
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 select-none">
                        <Card className="p-4 border-border bg-card shadow-soft text-left space-y-1">
                          <span className="text-[9px] font-black uppercase text-muted-foreground">Monthly Category Revenue</span>
                          <p className="text-lg font-heading font-black text-primary">₹{cat.monthlyRevenue.toLocaleString()}</p>
                          <div className="flex items-center gap-1 text-[9px] text-emerald-500 font-bold mt-1">
                            <ArrowUpRight size={10} /> +12.4% vs Last Month
                          </div>
                        </Card>
                        <Card className="p-4 border-border bg-card shadow-soft text-left space-y-1">
                          <span className="text-[9px] font-black uppercase text-muted-foreground">Completion Ratio</span>
                          <p className="text-lg font-heading font-black text-foreground">{cat.completionRate}%</p>
                          <div className="w-full bg-muted h-1 rounded-full overflow-hidden mt-1.5">
                            <div className="bg-primary h-full rounded-full" style={{ width: `${cat.completionRate}%` }} />
                          </div>
                        </Card>
                        <Card className="p-4 border-border bg-card shadow-soft text-left space-y-1">
                          <span className="text-[9px] font-black uppercase text-muted-foreground">Instructors / Students</span>
                          <p className="text-lg font-heading font-black text-foreground">{cat.totalTutors} / {cat.totalStudents}</p>
                          <span className="text-[9px] text-muted-foreground font-semibold block mt-1">Active ratio: 82%</span>
                        </Card>
                        <Card className="p-4 border-border bg-card shadow-soft text-left space-y-1">
                          <span className="text-[9px] font-black uppercase text-muted-foreground">Certificates Issued</span>
                          <p className="text-lg font-heading font-black text-foreground">{cat.certificatesIssued}</p>
                          <span className="text-[9px] text-emerald-500 font-bold block mt-1">✓ 100% Verified Blockchain</span>
                        </Card>
                      </div>
                    );
                  })()}

                  {/* AI Recommendation Insights (Phase 8) */}
                  <Card className="p-5 border-border bg-card shadow-soft text-left space-y-4">
                    <div className="flex items-center gap-2 select-none border-b border-border/20 pb-2">
                      <Sparkles size={16} className="text-primary animate-pulse" />
                      <h4 className="text-xs font-heading font-extrabold uppercase text-foreground">AI Operational Insights &amp; Analytics</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl space-y-2">
                        <span className="text-[9px] uppercase tracking-wider font-extrabold text-primary bg-primary/10 px-2 py-0.5 rounded-full inline-block">Syllabus Performance</span>
                        <p className="text-xs font-bold text-foreground">Chemistry course completion rate dropped below target thresholds in Module 4.</p>
                        <p className="text-[10px] text-muted-foreground leading-normal">
                          Recommendation: Review curriculum layout on Module 4 drop-offs. Simulator indicates quiz logic thresholds might be set too tight.
                        </p>
                      </div>

                      <div className="bg-amber-500/5 border border-amber-500/20 p-4 rounded-xl space-y-2">
                        <span className="text-[9px] uppercase tracking-wider font-extrabold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full inline-block">Tutor Efficiency</span>
                        <p className="text-xs font-bold text-foreground">Tutor Amit Verma maintains highest student ratings (4.8⭐) with zero warning flags.</p>
                        <p className="text-[10px] text-muted-foreground leading-normal">
                          Recommendation: High priority candidate for featured category hero placements.
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              {/* Sub-view: COURSE INVENTORY */}
              {activeCategoryTab === "courses" && (
                <div className="space-y-4">
                  {/* Local Grid Controls */}
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4 select-none border-b border-border/10 pb-3">
                    <h3 className="text-xs font-heading font-bold text-foreground uppercase">Inventory Directory</h3>
                    <div className="flex items-center gap-2">
                      {selectedCourseIds.length > 0 && (
                        <div className="bg-primary/5 border border-primary/20 px-3 py-1.5 rounded text-[10px] font-bold text-primary flex items-center gap-2">
                          <span>{selectedCourseIds.length} courses</span>
                          <button onClick={() => {
                            if (window.confirm("Archive selected courses?")) {
                              const updated = coursesOps.map(c => selectedCourseIds.includes(c.id) ? { ...c, status: "Archived" as const } : c);
                              saveCoursesToLocal(updated);
                              toast.success("Courses archived.");
                              setSelectedCourseIds([]);
                            }
                          }} className="text-rose-500 underline cursor-pointer">Archive</button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Course Table Grid (Phase 3) */}
                  <div className="overflow-x-auto rounded-xl border border-border bg-card">
                    <table className="w-full text-left text-xs font-semibold select-none">
                      <thead className="border-b border-border bg-muted/40 text-[10px] text-muted-foreground uppercase tracking-wider">
                        <tr>
                          <th className="px-4 py-3"><input type="checkbox" onChange={(e) => {
                            const catCourses = coursesOps.filter(c => c.category === currentNav.selectedCategoryId);
                            if (e.target.checked) setSelectedCourseIds(catCourses.map(c => c.id));
                            else setSelectedCourseIds([]);
                          }} className="w-3.5 h-3.5 text-primary rounded" /></th>
                          <th className="px-4 py-3">Course Detail</th>
                          <th className="px-4 py-3">Tutor</th>
                          <th className="px-4 py-3">Status / Visibility</th>
                          <th className="px-4 py-3">Students</th>
                          <th className="px-4 py-3">Monthly Revenue</th>
                          <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {coursesOps.filter(c => c.category === currentNav.selectedCategoryId).map(course => {
                          const isChecked = selectedCourseIds.includes(course.id);
                          return (
                            <tr key={course.id} className="hover:bg-muted/10 transition-colors">
                              <td className="px-4 py-3">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => {
                                    if (e.target.checked) setSelectedCourseIds(p => [...p, course.id]);
                                    else setSelectedCourseIds(p => p.filter(id => id !== course.id));
                                  }}
                                  className="w-3.5 h-3.5 text-primary rounded"
                                />
                              </td>
                              <td className="px-4 py-3 flex items-center gap-2.5">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={course.thumbnail} alt="" className="w-12 h-9 rounded object-cover border border-border/40 shrink-0" />
                                <div className="min-w-0">
                                  <p className="font-extrabold text-foreground truncate max-w-[200px]">{course.title}</p>
                                  <p className="text-[9px] text-muted-foreground mt-0.5">ID: {course.id} • Rating: ⭐ {course.rating}</p>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-muted-foreground">{course.tutorName}</td>
                              <td className="px-4 py-3">
                                <div className="flex flex-col gap-1 w-fit">
                                  <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded w-fit ${
                                    course.status === "Approved" ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"
                                  }`}>{course.status}</span>
                                  <span className="text-[8px] font-bold text-muted-foreground uppercase">{course.visibility}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-muted-foreground">{course.enrollments} learners</td>
                              <td className="px-4 py-3 text-primary font-bold">₹{course.revenue.toLocaleString()}</td>
                              <td className="px-4 py-3">
                                <div className="flex justify-end items-center gap-1.5">
                                  <button onClick={() => pushNav("course-operations", currentNav.selectedCategoryId, course.id)} className="h-7 px-2.5 bg-primary/10 text-primary text-[9px] font-bold uppercase rounded hover:bg-primary/20 transition-all cursor-pointer">Open</button>
                                  <button onClick={() => openEditCourse(course)} className="p-1.5 border border-border hover:bg-muted text-muted-foreground hover:text-foreground rounded transition-all cursor-pointer"><Edit2 size={11} /></button>
                                  <button onClick={() => handleDeleteCourse(course.id, course.title)} className="p-1.5 border border-border hover:bg-destructive/5 text-muted-foreground hover:text-destructive rounded transition-all cursor-pointer"><Trash2 size={11} /></button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Sub-view: TUTORS */}
              {activeCategoryTab === "tutors" && (
                <div className="space-y-4">
                  {/* Tutor management console (Phase 5) */}
                  <div className="overflow-x-auto rounded-xl border border-border bg-card">
                    <table className="w-full text-left text-xs font-semibold select-none">
                      <thead className="border-b border-border bg-muted/40 text-[10px] text-muted-foreground uppercase tracking-wider">
                        <tr>
                          <th className="px-4 py-3">Tutor Profile</th>
                          <th className="px-4 py-3">Verification</th>
                          <th className="px-4 py-3">Courses taught</th>
                          <th className="px-4 py-3">Wallet Revenue</th>
                          <th className="px-4 py-3">Performance</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {tutorsOps.map(t => (
                          <tr key={t.id} className="hover:bg-muted/10 transition-all">
                            <td className="px-4 py-3">
                              <p className="font-extrabold text-foreground">{t.name}</p>
                              <p className="text-[9px] text-muted-foreground">{t.email}</p>
                            </td>
                            <td className="px-4 py-3"><span className="text-[8px] font-black uppercase px-2 py-0.5 bg-emerald-500/10 text-emerald-600 rounded">{t.verification}</span></td>
                            <td className="px-4 py-3 text-muted-foreground">{t.courses} courses</td>
                            <td className="px-4 py-3">
                              <p className="text-foreground">₹{t.revenue.toLocaleString()}</p>
                              <p className="text-[9px] text-muted-foreground">Wallet: ₹{t.wallet.toLocaleString()}</p>
                            </td>
                            <td className="px-4 py-3">
                              <p className="text-foreground">Rating: ⭐ {t.rating}</p>
                              <p className="text-[9px] text-muted-foreground">Warnings: {t.warnings}</p>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                                t.status === "Active" ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/15 text-rose-600"
                              }`}>{t.status}</span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex justify-end gap-1.5">
                                <button onClick={() => pushNav("tutor-profile", currentNav.selectedCategoryId, null, t.id)} className="h-7 px-2.5 bg-primary/10 text-primary text-[9px] font-bold uppercase rounded hover:bg-primary/20 transition-all cursor-pointer">View Profile</button>
                                <button onClick={() => handleSuspendTutor(t.id, t.name)} className="h-7 px-2.5 bg-rose-500/10 text-rose-600 text-[9px] font-bold uppercase rounded hover:bg-rose-500/20 transition-all cursor-pointer">{t.status === "Active" ? "Suspend" : "Activate"}</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Sub-view: STUDENTS */}
              {activeCategoryTab === "students" && (
                <div className="space-y-4">
                  {/* Student Analytics console (Phase 6) */}
                  <div className="overflow-x-auto rounded-xl border border-border bg-card">
                    <table className="w-full text-left text-xs font-semibold select-none">
                      <thead className="border-b border-border bg-muted/40 text-[10px] text-muted-foreground uppercase tracking-wider">
                        <tr>
                          <th className="px-4 py-3">Student</th>
                          <th className="px-4 py-3">Enrolled Course</th>
                          <th className="px-4 py-3">Progress</th>
                          <th className="px-4 py-3">Certificate / Payment</th>
                          <th className="px-4 py-3">Last Active</th>
                          <th className="px-4 py-3">Risk Level</th>
                          <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {studentsOps.map(student => (
                          <tr key={student.id} className="hover:bg-muted/10 transition-all">
                            <td className="px-4 py-3">
                              <p className="font-extrabold text-foreground">{student.name}</p>
                              <p className="text-[9px] text-muted-foreground">{student.email}</p>
                            </td>
                            <td className="px-4 py-3 text-muted-foreground truncate max-w-[200px]">{student.courseName}</td>
                            <td className="px-4 py-3">
                              <div className="space-y-1">
                                <p className="text-foreground">Progress: {student.progress}%</p>
                                <p className="text-[9px] text-muted-foreground">Attendance: {student.attendance}%</p>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex flex-col gap-1 w-fit">
                                <span className="text-[8px] font-bold text-muted-foreground uppercase">Cert: {student.certificateStatus}</span>
                                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                                  student.paymentStatus === "Paid" ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"
                                }`}>{student.paymentStatus}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">{student.lastActive}</td>
                            <td className="px-4 py-3">
                              <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                                student.riskLevel === "Low" ? "bg-emerald-500/10 text-emerald-600" :
                                student.riskLevel === "Medium" ? "bg-amber-500/10 text-amber-600" :
                                "bg-rose-500/15 text-rose-600 animate-pulse"
                              }`}>{student.riskLevel}</span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex justify-end">
                                <button onClick={() => pushNav("student-details", currentNav.selectedCategoryId, null, null, student.id)} className="h-7 px-2.5 bg-primary/10 text-primary text-[9px] font-bold uppercase rounded hover:bg-primary/20 transition-all cursor-pointer">Open Details</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Sub-view: PERFORMANCE ANALYTICS */}
              {activeCategoryTab === "analytics" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 select-none">
                  {/* Revenue trend line (Phase 7) */}
                  <Card className="p-4 border border-border bg-card shadow-soft space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Revenue Trend Analysis (Weekly)</h4>
                    <div className="h-36 flex items-end justify-between gap-4 border-b border-border/40 pb-2">
                      {[
                        { label: "W1", val: "30%", valRaw: "₹45k" },
                        { label: "W2", val: "55%", valRaw: "₹82k" },
                        { label: "W3", val: "85%", valRaw: "₹127k" },
                        { label: "W4", val: "100%", valRaw: "₹155k" }
                      ].map((bar, idx) => (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                          {/* tooltip */}
                          <span className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-1 bg-black text-white text-[9px] px-1.5 py-0.5 rounded transition-all">{bar.valRaw}</span>
                          <div className="bg-primary hover:opacity-90 w-8 rounded-t transition-all" style={{ height: bar.val }} />
                          <span className="text-[9px] text-muted-foreground">{bar.label}</span>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Enrollment Heatmap */}
                  <Card className="p-4 border border-border bg-card shadow-soft space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Hourly Student Activity Heatmap</h4>
                    <div className="grid grid-cols-8 gap-1.5 max-w-sm mx-auto">
                      {Array.from({ length: 32 }).map((_, idx) => {
                        const level = (idx * 17) % 5;
                        const bgClass = level === 0 ? "bg-muted/10 border border-border/20" :
                                        level === 1 ? "bg-primary/20" :
                                        level === 2 ? "bg-primary/45" :
                                        level === 3 ? "bg-primary/70" : "bg-primary shadow-soft";
                        return (
                          <div key={idx} className={`w-8 h-8 rounded ${bgClass}`} title={`Active level: ${level}`} />
                        );
                      })}
                    </div>
                  </Card>
                </div>
              )}

              {/* Sub-view: RESOURCE LIBRARY */}
              {activeCategoryTab === "resources" && (
                <div className="space-y-4 select-none">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="p-3.5 border-border bg-card text-center space-y-1">
                      <span className="text-[9px] font-black uppercase text-muted-foreground">Media Storage</span>
                      <p className="text-base font-extrabold text-foreground">1.4 GB</p>
                    </Card>
                    <Card className="p-3.5 border-border bg-card text-center space-y-1">
                      <span className="text-[9px] font-black uppercase text-muted-foreground">PDF Handouts</span>
                      <p className="text-base font-extrabold text-foreground">42 files</p>
                    </Card>
                    <Card className="p-3.5 border-border bg-card text-center space-y-1">
                      <span className="text-[9px] font-black uppercase text-muted-foreground">Quizzes / Tasks</span>
                      <p className="text-base font-extrabold text-foreground">125 nodes</p>
                    </Card>
                    <Card className="p-3.5 border-border bg-card text-center space-y-1">
                      <span className="text-[9px] font-black uppercase text-muted-foreground">Version history</span>
                      <p className="text-base font-extrabold text-foreground">v2.4 stable</p>
                    </Card>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-border bg-card mt-4">
                    <table className="w-full text-left text-xs font-semibold">
                      <thead className="border-b border-border bg-muted/40 text-[10px] text-muted-foreground uppercase tracking-wider">
                        <tr>
                          <th className="px-4 py-3">Resource Name</th>
                          <th className="px-4 py-3">Type / Size</th>
                          <th className="px-4 py-3">Usage downloads</th>
                          <th className="px-4 py-3">Upload Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {resourcesOps.map(res => (
                          <tr key={res.id} className="hover:bg-muted/10 transition-colors">
                            <td className="px-4 py-3 text-foreground font-extrabold">{res.name}</td>
                            <td className="px-4 py-3 text-muted-foreground">{res.type} • {res.size}</td>
                            <td className="px-4 py-3 text-muted-foreground">{res.downloads} hits</td>
                            <td className="px-4 py-3 text-muted-foreground">{res.uploadedAt}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Sub-view: MODERATION */}
              {activeCategoryTab === "moderation" && (
                <div className="space-y-4 select-none">
                  <div className="overflow-x-auto rounded-xl border border-border bg-card">
                    <table className="w-full text-left text-xs font-semibold">
                      <thead className="border-b border-border bg-muted/40 text-[10px] text-muted-foreground uppercase tracking-wider">
                        <tr>
                          <th className="px-4 py-3">Course / Review Context</th>
                          <th className="px-4 py-3">Reporter</th>
                          <th className="px-4 py-3">Flag Reason</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {moderationsOps.map(item => (
                          <tr key={item.id} className="hover:bg-muted/10 transition-colors">
                            <td className="px-4 py-3 font-extrabold text-foreground">{item.courseName}</td>
                            <td className="px-4 py-3 text-muted-foreground">{item.reporter}</td>
                            <td className="px-4 py-3 text-muted-foreground">{item.reason}</td>
                            <td className="px-4 py-3">
                              <span className="text-[8px] font-black uppercase px-2 py-0.5 bg-amber-500/10 text-amber-600 rounded">{item.status}</span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex justify-end gap-1.5">
                                <button onClick={() => {
                                  const updated = moderationsOps.filter(m => m.id !== item.id);
                                  saveOperationsToLocal(tutorsOps, studentsOps, updated, resourcesOps);
                                  toast.success("Moderation flag cleared.");
                                }} className="h-7 px-2.5 bg-emerald-600 text-white text-[9px] font-bold uppercase rounded hover:bg-emerald-700 transition-all cursor-pointer">Resolve</button>
                                <button onClick={() => {
                                  const updated = moderationsOps.map(m => m.id === item.id ? { ...m, status: "Escalated" as const } : m);
                                  saveOperationsToLocal(tutorsOps, studentsOps, updated, resourcesOps);
                                  toast.success("Escalated to operations director.");
                                }} className="h-7 px-2.5 bg-rose-600 text-white text-[9px] font-bold uppercase rounded hover:bg-rose-700 transition-all cursor-pointer">Escalate</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Sub-view: AUDIT LOGS */}
              {activeCategoryTab === "audit" && (
                <div className="space-y-4 select-none">
                  <div className="overflow-x-auto rounded-xl border border-border bg-card">
                    <table className="w-full text-left text-xs font-semibold">
                      <thead className="border-b border-border bg-muted/40 text-[10px] text-muted-foreground uppercase tracking-wider">
                        <tr>
                          <th className="px-4 py-3">User (IP)</th>
                          <th className="px-4 py-3">Action Details</th>
                          <th className="px-4 py-3">Operational Context</th>
                          <th className="px-4 py-3">Reason Code</th>
                          <th className="px-4 py-3">Timestamp</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {auditLogsOps.map(log => (
                          <tr key={log.id} className="hover:bg-muted/10 transition-colors">
                            <td className="px-4 py-3">
                              <p className="text-foreground font-extrabold">{log.who}</p>
                              <p className="text-[9px] text-muted-foreground">{log.ip}</p>
                            </td>
                            <td className="px-4 py-3 font-extrabold text-foreground">{log.action}</td>
                            <td className="px-4 py-3">
                              <p className="text-[10px] text-muted-foreground">Old: {log.oldValue}</p>
                              <p className="text-[10px] text-primary font-bold">New: {log.newValue}</p>
                            </td>
                            <td className="px-4 py-3 text-muted-foreground truncate max-w-[200px]">{log.reason}</td>
                            <td className="px-4 py-3 text-muted-foreground">{log.timestamp}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* VIEW: COURSE OPERATIONS CONSOLE */}
          {currentNav.currentView === "course-operations" && (
            <div className="space-y-6">
              {/* Back actions bar */}
              <div className="flex items-center justify-between select-none border-b border-border/20 pb-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={popNav}
                    className="p-2 border border-border hover:bg-muted text-foreground rounded-button transition-colors cursor-pointer"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <div>
                    <h2 className="text-base font-heading font-black text-foreground uppercase tracking-wide">
                      {coursesOps.find(c => c.id === currentNav.selectedCourseId)?.title} Governance
                    </h2>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Auditable overview covering student cohorts, payment ledgers, certificate verifications, and action logs.
                    </p>
                  </div>
                </div>
              </div>

              {/* Local Navigation Tabs for Course inspector (Phase 4) */}
              <div className="flex flex-wrap border-b border-border/30 pb-2 gap-1.5 select-none">
                {[
                  { id: "overview", label: "Overview Detail", icon: Activity },
                  { id: "students", label: "Students", icon: Users },
                  { id: "tutor", label: "Tutor details", icon: Award },
                  { id: "payments", label: "Payments Split", icon: DollarSign },
                  { id: "certificates", label: "Certificates", icon: FileCheck },
                  { id: "audit", label: "History logs", icon: History }
                ].map(tab => {
                  const IconComp = tab.icon;
                  const isActive = activeCourseTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveCourseTab(tab.id as any)}
                      className={`h-8 px-3.5 border rounded-button text-[9px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer ${
                        isActive ? "bg-primary border-primary text-white" : "border-border/60 text-muted-foreground hover:bg-muted/40"
                      }`}
                    >
                      <IconComp size={12} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Course: OVERVIEW */}
              {activeCourseTab === "overview" && (
                <div className="space-y-6">
                  {(() => {
                    const c = coursesOps.find(x => x.id === currentNav.selectedCourseId);
                    if (!c) return null;
                    return (
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 select-none">
                        {/* Course detail card */}
                        <Card className="p-4 border-border bg-card shadow-soft space-y-4 lg:col-span-2 text-left">
                          <h3 className="text-xs font-heading font-black uppercase text-foreground">{c.title}</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <span className="text-[9px] uppercase font-bold text-muted-foreground">Price</span>
                              <p className="text-sm font-extrabold text-primary">₹{c.price.toLocaleString()}</p>
                            </div>
                            <div>
                              <span className="text-[9px] uppercase font-bold text-muted-foreground">Visibility / Status</span>
                              <p className="text-sm font-extrabold text-foreground">{c.visibility} / {c.status}</p>
                            </div>
                            <div>
                              <span className="text-[9px] uppercase font-bold text-muted-foreground">Published Date</span>
                              <p className="text-sm font-extrabold text-muted-foreground">{c.lastPublished}</p>
                            </div>
                            <div>
                              <span className="text-[9px] uppercase font-bold text-muted-foreground">Risk Indicator</span>
                              <p className="text-sm font-extrabold text-rose-500">{c.riskScore > 30 ? "⚠️ High Risk" : "✓ Low Risk"}</p>
                            </div>
                          </div>
                        </Card>

                        {/* Quick Action Controls */}
                        <Card className="p-4 border-border bg-card shadow-soft space-y-3.5 text-left flex flex-col justify-between">
                          <div>
                            <h4 className="text-[10px] font-black uppercase text-muted-foreground">Governance Actions</h4>
                            <p className="text-[10px] text-muted-foreground mt-0.5">Control pricing, change taxonomy, or suspend database access.</p>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Button onClick={() => openEditCourse(c)} size="sm" className="w-full text-[10px] font-bold">Edit Meta Parameters</Button>
                            <button
                              onClick={() => {
                                const nextVis: "Visible" | "Hidden" = c.visibility === "Visible" ? "Hidden" : "Visible";
                                const updated = coursesOps.map(x => x.id === c.id ? { ...x, visibility: nextVis } : x);
                                saveCoursesToLocal(updated);
                                pushAuditLog("Visibility Toggle", c.title, c.visibility, nextVis, "Platform directory adjustment");
                                toast.success(`Course marked as ${nextVis}.`);
                              }}
                              className="h-9 w-full border border-border hover:bg-muted text-[10px] font-bold uppercase rounded cursor-pointer transition-all text-center flex items-center justify-center"
                            >
                              Toggle Visibility
                            </button>
                            <button
                              onClick={() => handleDeleteCourse(c.id, c.title)}
                              className="h-9 w-full border border-destructive/20 hover:bg-destructive/5 text-[10px] font-bold uppercase rounded cursor-pointer transition-all text-destructive text-center flex items-center justify-center"
                            >
                              Purge Course Listing
                            </button>
                          </div>
                        </Card>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Course: STUDENTS */}
              {activeCourseTab === "students" && (
                <div className="space-y-4">
                  <div className="overflow-x-auto rounded-xl border border-border bg-card">
                    <table className="w-full text-left text-xs font-semibold select-none">
                      <thead className="border-b border-border bg-muted/40 text-[10px] text-muted-foreground uppercase tracking-wider">
                        <tr>
                          <th className="px-4 py-3">Student Name</th>
                          <th className="px-4 py-3">Course progress</th>
                          <th className="px-4 py-3">Attendance</th>
                          <th className="px-4 py-3">Certificate</th>
                          <th className="px-4 py-3">Last Login</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {studentsOps.filter(s => s.courseId === currentNav.selectedCourseId).map(student => (
                          <tr key={student.id}>
                            <td className="px-4 py-3">{student.name}</td>
                            <td className="px-4 py-3">{student.progress}%</td>
                            <td className="px-4 py-3">{student.attendance}%</td>
                            <td className="px-4 py-3">{student.certificateStatus}</td>
                            <td className="px-4 py-3 text-muted-foreground">{student.lastActive}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Course: TUTOR */}
              {activeCourseTab === "tutor" && (
                <div className="space-y-4 select-none text-left">
                  {(() => {
                    const c = coursesOps.find(x => x.id === currentNav.selectedCourseId);
                    const t = tutorsOps.find(x => x.id === c?.tutorId);
                    if (!t) return <p className="text-xs text-muted-foreground">Tutor detail log missing.</p>;
                    return (
                      <Card className="p-5 border-border bg-card shadow-soft space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm uppercase">
                            {t.name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-extrabold text-foreground">{t.name}</h4>
                            <p className="text-[10px] text-muted-foreground">{t.email}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 border-t border-border/20">
                          <div>
                            <span className="text-[8px] font-black uppercase text-muted-foreground">Verification status</span>
                            <p className="text-xs font-bold text-emerald-500">Approved ✓</p>
                          </div>
                          <div>
                            <span className="text-[8px] font-black uppercase text-muted-foreground">Total Courses</span>
                            <p className="text-xs font-extrabold text-foreground">{t.courses} courses</p>
                          </div>
                          <div>
                            <span className="text-[8px] font-black uppercase text-muted-foreground">Tutor Share Wallet</span>
                            <p className="text-xs font-extrabold text-primary">₹{t.wallet.toLocaleString()}</p>
                          </div>
                          <div>
                            <span className="text-[8px] font-black uppercase text-muted-foreground">Instructor Rating</span>
                            <p className="text-xs font-extrabold text-foreground">⭐ {t.rating}</p>
                          </div>
                        </div>
                      </Card>
                    );
                  })()}
                </div>
              )}

              {/* Course: PAYMENTS SPLIT LEDGER */}
              {activeCourseTab === "payments" && (
                <div className="space-y-4 select-none text-left">
                  {(() => {
                    const c = coursesOps.find(x => x.id === currentNav.selectedCourseId);
                    if (!c) return null;
                    const taxGst = Math.round(c.revenue * 0.18);
                    const tds = Math.round(c.revenue * 0.10);
                    const netEarnings = c.revenue - taxGst - tds;
                    const platformCut = Math.round(netEarnings * 0.20);
                    const tutorShare = netEarnings - platformCut;
                    
                    return (
                      <Card className="p-5 border border-border bg-card shadow-soft space-y-4">
                        <h4 className="text-xs font-heading font-extrabold uppercase text-foreground">Course Revenue Split Calculator (Ecosystem Rules)</h4>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-4 border-b border-border/20">
                          <div>
                            <span className="text-[9px] uppercase font-bold text-muted-foreground">Gross Sales</span>
                            <p className="text-sm font-extrabold text-foreground">₹{c.revenue.toLocaleString()}</p>
                          </div>
                          <div>
                            <span className="text-[9px] uppercase font-bold text-muted-foreground">Reserved GST (18%)</span>
                            <p className="text-sm font-extrabold text-rose-500">₹{taxGst.toLocaleString()}</p>
                          </div>
                          <div>
                            <span className="text-[9px] uppercase font-bold text-rose-500">Reserved TDS (10%)</span>
                            <p className="text-sm font-extrabold text-rose-500">₹{tds.toLocaleString()}</p>
                          </div>
                          <div>
                            <span className="text-[9px] uppercase font-bold text-rose-500">Platform Earnings</span>
                            <p className="text-sm font-extrabold text-primary">₹{platformCut.toLocaleString()}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between pt-2">
                          <span className="text-xs font-extrabold text-foreground">Tutor Net Payout Split Share</span>
                          <span className="text-lg font-heading font-black text-emerald-600 dark:text-emerald-400">₹{tutorShare.toLocaleString()}</span>
                        </div>
                      </Card>
                    );
                  })()}
                </div>
              )}

              {/* Course: AUDIT LOGS */}
              {activeCourseTab === "audit" && (
                <div className="space-y-4">
                  <div className="overflow-x-auto rounded-xl border border-border bg-card">
                    <table className="w-full text-left text-xs font-semibold select-none">
                      <thead className="border-b border-border bg-muted/40 text-[10px] text-muted-foreground uppercase tracking-wider">
                        <tr>
                          <th className="px-4 py-3">Admin</th>
                          <th className="px-4 py-3">Action Details</th>
                          <th className="px-4 py-3">Audit Logs Context</th>
                          <th className="px-4 py-3">Reason</th>
                          <th className="px-4 py-3">Timestamp</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {auditLogsOps.filter(log => log.entity.includes(currentNav.selectedCourseId || "")).map(log => (
                          <tr key={log.id}>
                            <td className="px-4 py-3">{log.who}</td>
                            <td className="px-4 py-3 text-foreground font-extrabold">{log.action}</td>
                            <td className="px-4 py-3 text-muted-foreground">Changed: {log.newValue}</td>
                            <td className="px-4 py-3 text-muted-foreground">{log.reason}</td>
                            <td className="px-4 py-3 text-muted-foreground">{log.timestamp}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* VIEW: TUTOR DETAILS VIEW */}
          {currentNav.currentView === "tutor-profile" && (
            <div className="space-y-6 text-left select-none">
              <div className="flex items-center gap-3">
                <button onClick={popNav} className="p-2 border border-border hover:bg-muted text-foreground rounded-button transition-colors cursor-pointer">
                  <ChevronLeft size={16} />
                </button>
                <h2 className="text-base font-heading font-black text-foreground uppercase tracking-wide">Tutor Details Inspector</h2>
              </div>

              {(() => {
                const t = tutorsOps.find(x => x.id === currentNav.selectedTutorId);
                if (!t) return null;
                return (
                  <Card className="p-6 border border-border bg-card shadow-soft space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center font-black text-lg">{t.name.charAt(0)}</div>
                      <div>
                        <h3 className="text-sm font-heading font-black text-foreground">{t.name}</h3>
                        <p className="text-[10px] text-muted-foreground">{t.email} • ID: {t.id}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-1">
                        <span className="text-[8px] font-black text-muted-foreground uppercase">Revenue</span>
                        <p className="text-xs font-extrabold text-foreground">₹{t.revenue.toLocaleString()}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[8px] font-black text-muted-foreground uppercase">Rating</span>
                        <p className="text-xs font-extrabold text-foreground">⭐ {t.rating}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[8px] font-black text-muted-foreground uppercase">Warning Flags</span>
                        <p className="text-xs font-extrabold text-rose-500">{t.warnings} active warnings</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[8px] font-black text-muted-foreground uppercase">Courses count</span>
                        <p className="text-xs font-extrabold text-foreground">{t.courses} active courses</p>
                      </div>
                    </div>
                  </Card>
                );
              })()}
            </div>
          )}

          {/* VIEW: STUDENT DETAILS VIEW */}
          {currentNav.currentView === "student-details" && (
            <div className="space-y-6 text-left select-none">
              <div className="flex items-center gap-3">
                <button onClick={popNav} className="p-2 border border-border hover:bg-muted text-foreground rounded-button transition-colors cursor-pointer">
                  <ChevronLeft size={16} />
                </button>
                <h2 className="text-base font-heading font-black text-foreground uppercase tracking-wide">Student details inspector</h2>
              </div>

              {(() => {
                const s = studentsOps.find(x => x.id === currentNav.selectedStudentId);
                if (!s) return null;
                return (
                  <Card className="p-6 border border-border bg-card shadow-soft space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center font-black text-lg">{s.name.charAt(0)}</div>
                      <div>
                        <h3 className="text-sm font-heading font-black text-foreground">{s.name}</h3>
                        <p className="text-[10px] text-muted-foreground">{s.email} • ID: {s.id}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-1">
                        <span className="text-[8px] font-black text-muted-foreground uppercase">Syllabus Progress</span>
                        <p className="text-xs font-extrabold text-foreground">{s.progress}% progress</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[8px] font-black text-muted-foreground uppercase">Class attendance</span>
                        <p className="text-xs font-extrabold text-foreground">{s.attendance}% attendance</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[8px] font-black text-muted-foreground uppercase">Risk Rating Level</span>
                        <p className="text-xs font-extrabold text-foreground">{s.riskLevel}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[8px] font-black text-muted-foreground uppercase">Support Tickets</span>
                        <p className="text-xs font-extrabold text-foreground">{s.supportTickets} open tickets</p>
                      </div>
                    </div>
                  </Card>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: OTHER MASTER METADATA TABLES */}
      {activeSubView === "metadata" && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/20 pb-4 select-none">
            <div>
              <h3 className="text-sm font-heading font-extrabold uppercase tracking-wide text-foreground">
                Master Data Management
              </h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Control the platform entity configurations, metadata schema models, and validate list properties.
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 cursor-pointer bg-muted/20 border border-border/55 px-3 py-1.5 rounded-button text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">
                <input
                  type="checkbox"
                  checked={isSuperAdmin}
                  onChange={(e) => setIsSuperAdmin(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary/20 cursor-pointer h-3.5 w-3.5"
                />
                <span className="flex items-center gap-1">
                  <ShieldAlert size={12} className={isSuperAdmin ? "text-amber-500" : "text-muted-foreground"} />
                  Super Admin Mode
                </span>
              </label>
            </div>
          </div>

          {/* TOP THREE COLUMN METRICS CONTAINER */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* COLUMN 1: SELECTOR */}
            <Card className="p-4 border-border bg-card shadow-soft flex flex-col justify-between gap-4">
              <div className="space-y-1">
                <label className="text-[9px] text-muted-foreground uppercase font-black tracking-wider">Select Master Data Table</label>
                <p className="text-[10px] text-muted-foreground/80 leading-normal">
                  Select a list below to update its values and statuses across the platform.
                </p>
              </div>
              <select
                value={selectedEntity}
                onChange={(e) => setSelectedEntity(e.target.value as any)}
                className="w-full h-10 border border-border rounded-button bg-card px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/10"
              >
                <option value="languages">Languages</option>
                <option value="levels">Complexity Levels</option>
                <option value="tags">Course Tags</option>
                <option value="difficulties">Difficulty Scales</option>
                <option value="certificates">Certificate Templates</option>
                <option value="course_types">Course Formats/Types</option>
                <option value="live_class_types">Live Class Types</option>
              </select>
            </Card>

            {/* COLUMN 2: KPI METRICS */}
            <Card className="p-4 border-border bg-card shadow-soft grid grid-cols-2 gap-3.5">
              <div className="space-y-1 bg-muted/5 border border-border/30 rounded-card p-2 text-center">
                <span className="text-[9px] font-black uppercase text-muted-foreground">Total Records</span>
                <p className="text-lg font-heading font-extrabold text-foreground">{records.length}</p>
              </div>
              <div className="space-y-1 bg-emerald-500/5 border border-emerald-500/20 rounded-card p-2 text-center">
                <span className="text-[9px] font-black uppercase text-emerald-500">Active</span>
                <p className="text-lg font-heading font-extrabold text-emerald-600 dark:text-emerald-400">
                  {records.filter(r => r.status === "Active").length}
                </p>
              </div>
              <div className="space-y-1 bg-rose-500/5 border border-rose-500/20 rounded-card p-2 text-center">
                <span className="text-[9px] font-black uppercase text-rose-500">Inactive</span>
                <p className="text-lg font-heading font-extrabold text-rose-600 dark:text-rose-400">
                  {records.filter(r => r.status === "Inactive").length}
                </p>
              </div>
              <div className="space-y-1 bg-primary/5 border border-primary/20 rounded-card p-2 text-center">
                <span className="text-[9px] font-black uppercase text-primary">Currently Used</span>
                <p className="text-lg font-heading font-extrabold text-primary">
                  {records.filter(r => r.status === "Active" && getRecordUsage(r.name, selectedEntity).total > 0).length}
                </p>
              </div>
            </Card>

            {/* COLUMN 3: INFORMATION PANEL */}
            <Card className="p-4 border-border bg-card shadow-soft flex flex-col justify-between">
              <div className="flex items-center gap-1.5 border-b border-border/20 pb-1.5 mb-2 select-none">
                <Info size={13} className="text-primary" />
                <span className="text-[9px] font-black uppercase text-foreground">Usage Registry Info</span>
              </div>
              <div className="flex-1 flex flex-col gap-1 justify-center">
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Records in <span className="font-extrabold text-foreground">{ENTITY_LABELS[selectedEntity]}</span> are currently linked in:
                </p>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {ENTITY_INFO[selectedEntity].map((infoItem, infoIdx) => (
                    <span key={infoIdx} className="bg-primary/5 border border-primary/15 text-primary text-[8px] font-extrabold uppercase px-2 py-0.5 rounded-full">
                      ✓ {infoItem}
                    </span>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* SEARCH, ADD & ACTION BAR */}
          <Card className="p-4 border-border bg-card shadow-soft flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Left: Add inline form */}
            <form onSubmit={handleAddMetadata} className="w-full md:w-auto flex-1 flex gap-2">
              <input
                type="text"
                required
                placeholder={`Add new ${selectedEntity.replace("_", " ")} record...`}
                value={newMetadataValue}
                onChange={(e) => setNewMetadataValue(e.target.value)}
                className="flex-1 h-9 max-w-sm rounded border border-border bg-muted/10 px-3 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/10"
              />
              <Button type="submit" size="sm" className="h-9 gap-1 text-[11px] font-bold">
                <Plus size={14} /> Add Record
              </Button>
            </form>

            {/* Right: Actions */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto shrink-0 justify-end">
              <label className="h-9 px-3 border border-border hover:bg-muted text-foreground text-[10px] font-bold uppercase tracking-wider rounded-button transition-colors cursor-pointer flex items-center gap-1.5">
                <Upload size={13} className="text-primary" />
                <span>Import CSV</span>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleImportCSV}
                  className="hidden"
                />
              </label>

              <button
                onClick={handleExportCSV}
                className="h-9 px-3 border border-border hover:bg-muted text-foreground text-[10px] font-bold uppercase tracking-wider rounded-button transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Download size={13} className="text-primary" />
                <span>Export CSV</span>
              </button>

              <button
                onClick={handleDownloadTemplate}
                className="h-9 px-3 border border-border hover:bg-muted text-foreground text-[10px] font-bold uppercase tracking-wider rounded-button transition-colors cursor-pointer flex items-center gap-1.5"
              >
                Download Template
              </button>
            </div>
          </Card>

          {/* CONDITIONAL BULK ACTIONS TOOLBAR */}
          {selectedIds.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-primary/5 border border-primary/20 p-3 rounded-card flex items-center justify-between select-none"
            >
              <span className="text-[10px] font-bold text-primary">
                Selected {selectedIds.length} of {records.length} records
              </span>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleBulkStatusChange("Active")}
                  className="h-8 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold uppercase tracking-wider rounded transition-colors"
                >
                  Enable Selected
                </button>
                <button
                  onClick={() => handleBulkStatusChange("Inactive")}
                  className="h-8 px-3 bg-slate-600 hover:bg-slate-700 text-white text-[10px] font-bold uppercase tracking-wider rounded transition-colors"
                >
                  Disable Selected
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="h-8 px-3 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold uppercase tracking-wider rounded transition-colors"
                >
                  Delete Selected
                </button>
                <button
                  onClick={handleBulkExport}
                  className="h-8 px-3 bg-slate-800 hover:bg-slate-900 text-white text-[10px] font-bold uppercase tracking-wider rounded transition-colors"
                >
                  Export Selected
                </button>
              </div>
            </motion.div>
          )}

          {/* MAIN LIST CARD CONTROLLER */}
          <Card className="p-5 border-border bg-card shadow-soft space-y-4 select-none">
            {/* Header / Title area */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/20 pb-3">
              <h4 className="text-xs font-heading font-extrabold uppercase text-foreground">
                Supported {ENTITY_LABELS[selectedEntity]}
              </h4>

              <div className="relative max-w-xs w-full">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search records..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-8 pl-8 pr-3 rounded border border-border bg-muted/10 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/10"
                />
              </div>
            </div>

            {/* Drag & Drop instructions banner */}
            {records.length > 1 && !searchTerm && (
              <div className="bg-muted/30 border border-border/40 p-2.5 rounded-card text-[9px] text-muted-foreground leading-normal select-none flex items-center gap-1.5">
                <Info size={11} className="text-primary shrink-0" />
                <span>You can drag the grid handle icon to reorder the item values dynamically as they appear in the student marketplace dropdown lists.</span>
              </div>
            )}

            {/* Records Data Table list */}
            <div className="overflow-x-auto rounded-xl border border-border bg-card">
              <table className="w-full min-w-[720px] text-left text-xs font-semibold select-none">
                <thead className="border-b border-border bg-muted/40 text-[10px] text-muted-foreground uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3 w-10">
                      <input
                        type="checkbox"
                        checked={selectedIds.length === filteredRecords.length && filteredRecords.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedIds(filteredRecords.map(r => r.id));
                          else setSelectedIds([]);
                        }}
                        className="rounded border-border text-primary focus:ring-primary/20 cursor-pointer h-3.5 w-3.5"
                      />
                    </th>
                    <th className="px-4 py-3 w-10" />
                    <th className="px-4 py-3">Item Option Name</th>
                    <th className="px-4 py-3 w-28">Usage Status</th>
                    <th className="px-4 py-3 w-40">Dynamic Usage Stats</th>
                    <th className="px-4 py-3 w-44">Last Updated</th>
                    <th className="px-4 py-3 text-right w-44">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredRecords.map((item, idx) => {
                    const isChecked = selectedIds.includes(item.id);
                    const usage = getRecordUsage(item.name, selectedEntity);
                    const isEditing = editingId === item.id;
                    
                    return (
                      <tr
                        key={item.id}
                        draggable={!searchTerm && records.length > 1}
                        onDragStart={(e) => handleDragStart(e, idx)}
                        onDragOver={(e) => handleDragOver(e, idx)}
                        onDrop={(e) => handleDrop(e, idx)}
                        onDragEnd={handleDragEnd}
                        className={`hover:bg-muted/10 transition-colors ${draggedIndex === idx ? "opacity-35" : ""}`}
                      >
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedIds(p => [...p, item.id]);
                              else setSelectedIds(p => p.filter(id => id !== item.id));
                            }}
                            className="rounded border-border text-primary focus:ring-primary/20 cursor-pointer h-3.5 w-3.5"
                          />
                        </td>
                        <td className="px-4 py-3 cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-primary transition-colors">
                          <GripVertical size={14} />
                        </td>
                        <td className="px-4 py-3">
                          {isEditing ? (
                            <form
                              onSubmit={(e) => {
                                e.preventDefault();
                                handleRenameMetadata(item.id);
                              }}
                              className="flex items-center gap-1.5"
                            >
                              <input
                                type="text"
                                required
                                value={editingName}
                                onChange={(e) => setEditingName(e.target.value)}
                                className="h-7 border border-border px-2 rounded text-xs bg-background focus:outline-none w-48"
                              />
                              <Button type="submit" size="sm" className="h-7 w-7 p-0"><Check size={12} /></Button>
                              <Button size="sm" variant="ghost" onClick={() => setEditingId(null)} className="h-7 w-7 p-0"><X size={12} /></Button>
                            </form>
                          ) : (
                            <span className="font-extrabold text-foreground">{item.name}</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            onClick={() => handleToggleStatus(item.id, item.status)}
                            className={`text-[8px] font-black uppercase px-2 py-0.5 rounded cursor-pointer select-none transition-all ${
                              item.status === "Active"
                                ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/15"
                                : "bg-slate-500/15 text-slate-500 hover:bg-slate-500/20"
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {usage.total > 0 ? (
                            <span className="font-semibold text-foreground/80">
                              {[
                                usage.courses > 0 && `${usage.courses} Courses`,
                                usage.tutors > 0 && `${usage.tutors} Tutors`,
                                usage.students > 0 && `${usage.students} Students`
                              ].filter(Boolean).join(", ")}
                            </span>
                          ) : (
                            <span>Unlinked</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          <p className="font-bold text-foreground/85 text-[10px]">{item.updatedBy}</p>
                          <p className="text-[9px]">{new Date(item.updatedAt).toLocaleDateString()}</p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2.5">
                            {!isEditing && (
                              <button
                                onClick={() => {
                                  setEditingId(item.id);
                                  setEditingName(item.name);
                                }}
                                className="p-1.5 border border-border hover:bg-muted text-muted-foreground hover:text-foreground rounded transition-colors"
                              >
                                <Edit2 size={12} />
                              </button>
                            )}
                            <button
                              onClick={() => setDeleteConfirmRecord(item)}
                              className="p-1.5 border border-destructive/20 text-destructive hover:bg-destructive/5 rounded transition-colors"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {!filteredRecords.length && (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground font-semibold">
                        No records match the active criteria filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* OVERLAY DIALOG MODAL: DELETE SINGLE RECORD CONFIRM */}
          <AnimatePresence>
            {deleteConfirmRecord && (
              <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setDeleteConfirmRecord(null)}
                  className="fixed inset-0 bg-background/80 backdrop-blur-sm cursor-pointer"
                />
                
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="bg-card border border-border shadow-premium rounded-modal w-full max-w-sm p-6 relative z-10 text-left select-none space-y-4"
                >
                  <div className="flex items-center gap-2 text-rose-500">
                    <AlertTriangle size={20} className="shrink-0" />
                    <h4 className="text-sm font-heading font-extrabold uppercase tracking-wide text-foreground">
                      Delete {selectedEntity === "languages" ? "Language" : "Record"}?
                    </h4>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-xs text-foreground">
                      Are you sure you want to delete <span className="font-extrabold text-rose-500">&quot;{deleteConfirmRecord.name}&quot;</span>?
                    </p>
                    {getRecordUsage(deleteConfirmRecord.name, selectedEntity).total > 0 && (
                      <div className="bg-rose-500/5 border border-rose-500/20 p-2.5 rounded-card text-[10px] space-y-1">
                        <span className="font-bold text-rose-600 dark:text-rose-400">⚠️ Warnings &amp; Usage impact:</span>
                        <p className="text-muted-foreground leading-normal">
                          This item is linked to:
                          <span className="font-extrabold text-foreground ml-1">
                            {[
                              getRecordUsage(deleteConfirmRecord.name, selectedEntity).courses > 0 && `${getRecordUsage(deleteConfirmRecord.name, selectedEntity).courses} Courses`,
                              getRecordUsage(deleteConfirmRecord.name, selectedEntity).tutors > 0 && `${getRecordUsage(deleteConfirmRecord.name, selectedEntity).tutors} Tutors`,
                              getRecordUsage(deleteConfirmRecord.name, selectedEntity).students > 0 && `${getRecordUsage(deleteConfirmRecord.name, selectedEntity).students} Students`
                            ].filter(Boolean).join(", ")}
                          </span>.
                          Deleting it will unlink this option from all platform listings.
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-end gap-2.5 pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteConfirmRecord(null)}
                      className="text-xs font-bold uppercase h-9"
                    >
                      Cancel
                    </Button>
                    <button
                      onClick={confirmDeleteRecord}
                      className="h-9 px-4 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase rounded-button transition-colors cursor-pointer"
                    >
                      Delete Anyway
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* OVERLAY DIALOG MODAL: DELETE BULK RECORDS CONFIRM */}
          <AnimatePresence>
            {deleteConfirmBulk && (
              <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setDeleteConfirmBulk(false)}
                  className="fixed inset-0 bg-background/80 backdrop-blur-sm cursor-pointer"
                />
                
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="bg-card border border-border shadow-premium rounded-modal w-full max-w-sm p-6 relative z-10 text-left select-none space-y-4"
                >
                  <div className="flex items-center gap-2 text-rose-500">
                    <AlertTriangle size={20} className="shrink-0" />
                    <h4 className="text-sm font-heading font-extrabold uppercase tracking-wide text-foreground">
                      Delete Selected Records?
                    </h4>
                  </div>
                  
                  <p className="text-xs text-foreground">
                    Are you sure you want to delete the <span className="font-extrabold text-rose-500">{selectedIds.length} selected</span> records? This action is permanent and will unlink them from all platform entities.
                  </p>
                  
                  <div className="flex items-center justify-end gap-2.5 pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteConfirmBulk(false)}
                      className="text-xs font-bold uppercase h-9"
                    >
                      Cancel
                    </Button>
                    <button
                      onClick={confirmBulkDelete}
                      className="h-9 px-4 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase rounded-button transition-colors cursor-pointer"
                    >
                      Delete Selected
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* MODAL: EDIT COURSE METADATA */}
      <AnimatePresence>
        {isEditCourseModalOpen && editingCourseObj && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditCourseModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
            />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card border border-border shadow-premium rounded-modal w-full max-w-md p-6 relative z-10 text-left space-y-4"
            >
              <h3 className="text-sm font-heading font-black uppercase text-foreground">Configure Course Parameters</h3>
              
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-muted-foreground uppercase">Course Title</label>
                  <input
                    type="text"
                    value={courseFormTitle}
                    onChange={(e) => setCourseFormTitle(e.target.value)}
                    className="w-full h-9 px-3 rounded border border-border text-xs bg-background text-foreground"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-muted-foreground uppercase">Listing Price (₹)</label>
                  <input
                    type="number"
                    value={courseFormPrice}
                    onChange={(e) => setCourseFormPrice(Number(e.target.value))}
                    className="w-full h-9 px-3 rounded border border-border text-xs bg-background text-foreground"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-muted-foreground uppercase">Moderation Status</label>
                    <select
                      value={courseFormStatus}
                      onChange={(e) => setCourseFormStatus(e.target.value as any)}
                      className="w-full h-9 px-2 rounded border border-border text-xs bg-background text-foreground"
                    >
                      <option value="Approved">Approved</option>
                      <option value="Pending">Pending</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Draft">Draft</option>
                      <option value="Need Changes">Need Changes</option>
                      <option value="Archived">Archived</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-muted-foreground uppercase">Platform Visibility</label>
                    <select
                      value={courseFormVisibility}
                      onChange={(e) => setCourseFormVisibility(e.target.value as any)}
                      className="w-full h-9 px-2 rounded border border-border text-xs bg-background text-foreground"
                    >
                      <option value="Visible">Visible</option>
                      <option value="Hidden">Hidden</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 select-none">
                <Button variant="ghost" onClick={() => setIsEditCourseModalOpen(false)}>Cancel</Button>
                <Button onClick={saveCourseForm}>Save Changes</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SECURITY DIALOG ALERTS (PHASE 12) */}
      <AnimatePresence>
        {safetyAlert?.isOpen && (
          <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSafetyAlert(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
            />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card border-2 border-rose-500/30 shadow-premium rounded-modal w-full max-w-sm p-6 relative z-10 text-left select-none space-y-4"
            >
              <div className="flex items-center gap-2 text-rose-500">
                <AlertCircle size={22} />
                <h4 className="text-sm font-heading font-black uppercase tracking-wide text-foreground">
                  {safetyAlert.title}
                </h4>
              </div>
              
              <p className="text-xs text-muted-foreground leading-relaxed">
                {safetyAlert.message}
              </p>
              
              <div className="flex items-center justify-end pt-2">
                <button
                  onClick={() => setSafetyAlert(null)}
                  className="h-9 px-4 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase rounded-button transition-colors cursor-pointer"
                >
                  Understood
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
