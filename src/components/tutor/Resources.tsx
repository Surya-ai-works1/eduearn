"use client";

import React, { useMemo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FolderOpen,
  FolderPlus,
  Upload,
  File,
  Video,
  FileText,
  Image as ImageIcon,
  Trash2,
  HardDrive,
  Download,
  Eye,
  Search,
  ChevronRight,
  ArrowLeft,
  X,
  Edit2,
  Share2,
  Clock,
  Save,
  Plus,
  Play,
  CheckCircle,
  ExternalLink,
  History,
  Lock,
  Unlock,
  Settings,
  AlertCircle,
  BarChart3,
  Coins,
  Grid,
  List,
  MoreVertical,
  Scissors,
  Link as LinkIcon,
  Tag,
  DollarSign,
  Star,
  FileDown,
  Filter
} from "lucide-react";
import { toast } from "sonner";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import type { MediaFile } from "./types";

interface ResourcesProps {
  mediaFiles: MediaFile[];
  setMediaFiles: React.Dispatch<React.SetStateAction<MediaFile[]>>;
  platformConfig: { storageLimit: number };
  calculateTotalMediaSizeMB: () => number;
}

interface ResourceFolder {
  id: string;
  name: string;
  filesCount: number;
}

type ResourceType =
  | "Notes"
  | "Video"
  | "Short"
  | "Slides"
  | "Assignment"
  | "Study Material"
  | "Link";

interface CreatorResource {
  id: string;
  title: string;
  type: ResourceType;
  format: string; // e.g. "PDF", "MP4", "ZIP", "Link", "PPTX"
  courseName: string;
  batchName: string;
  pricing: "Free" | "Paid" | "Included in Course";
  price?: number;
  views: number;
  downloads: number; // or purchases
  earnings: number;
  lastUpdated: string;
  status: "Published" | "Draft" | "Under Review";
  thumbnail?: string;
  description?: string;
  duration?: string; // for videos/shorts
  likes?: number; // for shorts
  folderId?: string;
  url?: string;
}

// ─── SVG RESOURCE PERFORMANCE CHART ───────────────────────────────────────────
function ResourcePerformanceChart({ timeFilter }: { timeFilter: string }) {
  const dataPoints = useMemo(() => {
    if (timeFilter === "7d") {
      return [25, 48, 30, 85, 62, 98, 92];
    } else if (timeFilter === "30d") {
      return [30, 45, 38, 62, 50, 78, 70, 88, 80, 102, 90, 124];
    } else if (timeFilter === "3m") {
      return [40, 80, 65, 110, 95, 145, 125, 168, 150, 188, 172, 218];
    } else {
      return [60, 95, 120, 108, 148, 185, 170, 224, 250, 290, 270, 342];
    }
  }, [timeFilter]);

  const maxVal = Math.max(...dataPoints);
  const width = 500;
  const height = 150;
  const pointsStr = dataPoints
    .map((val, idx) => {
      const x = (idx / (dataPoints.length - 1)) * width;
      const y = height - (val / maxVal) * (height - 30) - 15;
      return `${x},${y}`;
    })
    .join(" ");

  const fillPointsStr = `0,${height} ${pointsStr} ${width},${height}`;

  return (
    <div className="relative w-full h-[150px] mt-4">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full overflow-visible"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Grid lines */}
        <line x1="0" y1={height * 0.25} x2={width} y2={height * 0.25} stroke="currentColor" strokeOpacity="0.05" strokeDasharray="4 4" />
        <line x1="0" y1={height * 0.5} x2={width} y2={height * 0.5} stroke="currentColor" strokeOpacity="0.05" strokeDasharray="4 4" />
        <line x1="0" y1={height * 0.75} x2={width} y2={height * 0.75} stroke="currentColor" strokeOpacity="0.05" strokeDasharray="4 4" />

        {/* Gradient fill */}
        <polygon points={fillPointsStr} fill="url(#chartGrad)" />

        {/* Line */}
        <polyline
          fill="none"
          stroke="#8b5cf6"
          strokeWidth="2.5"
          points={pointsStr}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points dots */}
        {dataPoints.map((val, idx) => {
          const x = (idx / (dataPoints.length - 1)) * width;
          const y = height - (val / maxVal) * (height - 30) - 15;
          return (
            <circle
              key={idx}
              cx={x}
              cy={y}
              r="4.5"
              className="fill-card stroke-primary border-2"
              strokeWidth="2.5"
              style={{ stroke: "#8b5cf6" }}
            />
          );
        })}
      </svg>
    </div>
  );
}

export const Resources = React.memo(function Resources({
  mediaFiles,
  setMediaFiles,
  platformConfig,
  calculateTotalMediaSizeMB,
}: ResourcesProps) {
  // Navigation tabs: explorer (Resource Library), recorded-classes (Recorded Live Classes), reports (Library Reports)
  const [activeTab, setActiveTab] = useState<"explorer" | "recorded-classes" | "reports">("explorer");

  // Grid/List toggle
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Time filter for Performance Analytics
  const [timeFilter, setTimeFilter] = useState<"7d" | "30d" | "3m" | "1y">("30d");

  // Resource Type Category tabs filter
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>("All");

  // Search & Filter bar states
  const [searchQuery, setSearchQuery] = useState("");
  const [courseFilter, setCourseFilter] = useState("All");
  const [batchFilter, setBatchFilter] = useState("All");
  const [visibilityFilter, setVisibilityFilter] = useState("All");
  const [pricingFilter, setPricingFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest");

  // Folder navigation: null means root resources explorer
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);

  // Folder Management State
  const [folders, setFolders] = useState<ResourceFolder[]>([
    { id: "fld-1", name: "Python Masterclass", filesCount: 5 },
    { id: "fld-2", name: "DSA Notes", filesCount: 4 },
    { id: "fld-3", name: "Web Development", filesCount: 5 },
    { id: "fld-4", name: "Recorded Classes", filesCount: 2 },
    { id: "fld-5", name: "Shorts", filesCount: 2 },
  ]);

  // Extended professional resources state
  const [resources, setResources] = useState<CreatorResource[]>([
    {
      id: "res-1",
      title: "Python Complete Notes",
      type: "Notes",
      format: "PDF",
      courseName: "Python Programming Masterclass",
      batchName: "Batch A",
      pricing: "Paid",
      price: 99,
      views: 1240,
      downloads: 184,
      earnings: 18216,
      lastUpdated: "2026-08-15",
      status: "Published",
      folderId: "fld-1",
      description: "Detailed object-oriented programming notes covering syntax and structure.",
    },
    {
      id: "res-2",
      title: "Python Programming Masterclass — Class 04",
      type: "Video",
      format: "MP4",
      courseName: "Python Programming Masterclass",
      batchName: "Batch A",
      pricing: "Included in Course",
      views: 842,
      downloads: 74,
      earnings: 0,
      lastUpdated: "2026-08-14",
      status: "Published",
      folderId: "fld-4",
      duration: "1h 24m",
      description: "Recorded doubt solving session for loop controls and functions.",
    },
    {
      id: "res-3",
      title: "3 Python Tricks Every Beginner Should Know",
      type: "Short",
      format: "MP4",
      courseName: "Python Programming Masterclass",
      batchName: "Batch A",
      pricing: "Free",
      views: 2840,
      downloads: 0,
      earnings: 0,
      lastUpdated: "2026-08-15",
      status: "Published",
      folderId: "fld-5",
      likes: 624,
      duration: "0m 58s",
      description: "Short informative clip demonstrating list comprehensions.",
    },
    {
      id: "res-4",
      title: "Introduction to Machine Learning Slides",
      type: "Slides",
      format: "PPTX",
      courseName: "AI & Data Science Foundation",
      batchName: "Batch C",
      pricing: "Free",
      views: 450,
      downloads: 120,
      earnings: 0,
      lastUpdated: "2026-08-11",
      status: "Published",
      description: "Slide deck presenting regression paradigms and neural networks.",
    },
    {
      id: "res-5",
      title: "Data Structures Practice Sheet",
      type: "Assignment",
      format: "PDF",
      courseName: "DSA & Algorithms Bootcamp",
      batchName: "Batch B",
      pricing: "Free",
      views: 310,
      downloads: 95,
      earnings: 0,
      lastUpdated: "2026-08-12",
      status: "Published",
      description: "Weekly challenge sheet for stacks and queues.",
    },
    {
      id: "res-6",
      title: "SQL Cheat Sheet",
      type: "Notes",
      format: "PDF",
      courseName: "SQL & Database Essentials",
      batchName: "Batch A",
      pricing: "Paid",
      price: 50,
      views: 980,
      downloads: 210,
      earnings: 10500,
      lastUpdated: "2026-08-10",
      status: "Published",
      description: "Aggregations and SQL join tables quick reference handbook.",
    },
    {
      id: "res-7",
      title: "Web Dev Bootcamp Syllabus",
      type: "Study Material",
      format: "PDF",
      courseName: "Full-Stack Web Dev Bootcamp",
      batchName: "Batch B",
      pricing: "Free",
      views: 1500,
      downloads: 620,
      earnings: 0,
      lastUpdated: "2026-08-08",
      status: "Published",
      folderId: "fld-3",
      description: "Syllabus mapping roadmap from absolute basics to deployment.",
    },
    {
      id: "res-8",
      title: "React State Management Best Practices",
      type: "Link",
      format: "Link",
      courseName: "Full-Stack Web Dev Bootcamp",
      batchName: "Batch B",
      pricing: "Free",
      views: 340,
      downloads: 0,
      earnings: 0,
      lastUpdated: "2026-08-09",
      status: "Published",
      folderId: "fld-3",
      description: "Medium link summarizing React state managers.",
    },
    {
      id: "res-9",
      title: "Advanced Algorithms Homework",
      type: "Assignment",
      format: "PDF",
      courseName: "DSA & Algorithms Bootcamp",
      batchName: "Batch B",
      pricing: "Free",
      views: 120,
      downloads: 40,
      earnings: 0,
      lastUpdated: "2026-08-16",
      status: "Draft",
      folderId: "fld-2",
      description: "Homework draft for dynamic programming challenges.",
    },
    {
      id: "res-10",
      title: "CSS Grid Masterclass recorded",
      type: "Video",
      format: "MP4",
      courseName: "Full-Stack Web Dev Bootcamp",
      batchName: "Batch B",
      pricing: "Included in Course",
      views: 620,
      downloads: 54,
      earnings: 0,
      lastUpdated: "2026-08-05",
      status: "Published",
      folderId: "fld-4",
      duration: "1h 10m",
      description: "Class session discussing custom grid layout definitions.",
    },
    {
      id: "res-11",
      title: "JavaScript Closures in 60s",
      type: "Short",
      format: "MP4",
      courseName: "Full-Stack Web Dev Bootcamp",
      batchName: "Batch B",
      pricing: "Free",
      views: 4120,
      downloads: 0,
      earnings: 0,
      lastUpdated: "2026-08-04",
      status: "Published",
      folderId: "fld-5",
      likes: 890,
      duration: "0m 59s",
      description: "Short clip explaining execution context and lexical scope.",
    },
    {
      id: "res-12",
      title: "Django REST Framework Setup Guides",
      type: "Notes",
      format: "PDF",
      courseName: "Python Programming Masterclass",
      batchName: "Batch A",
      pricing: "Paid",
      price: 75,
      views: 430,
      downloads: 88,
      earnings: 6600,
      lastUpdated: "2026-08-11",
      status: "Published",
      folderId: "fld-1",
      description: "Guidebook to implement serializers and viewsets.",
    },
  ]);

  // Recorded Live Classes list
  const [recordedClasses, setRecordedClasses] = useState([
    { id: "rec-1", title: "Python Loops & Control Flow", courseName: "Python Programming Masterclass", batchName: "Batch A", date: "2026-08-15", duration: "1h 15m", isPublished: false },
    { id: "rec-2", title: "Introduction to HTML/CSS", courseName: "Full-Stack Web Dev Bootcamp", batchName: "Batch B", date: "2026-08-12", duration: "1h 30m", isPublished: true },
    { id: "rec-3", title: "Complexity Analysis & Big O", courseName: "DSA & Algorithms Bootcamp", batchName: "Batch B", date: "2026-08-10", duration: "1h 45m", isPublished: false },
    { id: "rec-4", title: "SQL Subqueries & Join Optimization", courseName: "SQL & Database Essentials", batchName: "Batch A", date: "2026-08-16", duration: "1h 20m", isPublished: false },
  ]);

  // Modals Open State
  const [isUploading, setIsUploading] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [activeRenameFolder, setActiveRenameFolder] = useState<ResourceFolder | null>(null);
  const [selectedResourceForAnalytics, setSelectedResourceForAnalytics] = useState<CreatorResource | null>(null);
  const [selectedResourceForEdit, setSelectedResourceForEdit] = useState<CreatorResource | null>(null);
  const [selectedResourceForShort, setSelectedResourceForShort] = useState<{ recId: string; title: string } | null>(null);
  const [selectedResourceForPreview, setSelectedResourceForPreview] = useState<CreatorResource | null>(null);

  // Forms Input States
  const [newFolderName, setNewFolderName] = useState("");
  const [renameFolderName, setRenameFolderName] = useState("");

  const [uploadForm, setUploadForm] = useState({
    title: "",
    type: "Notes" as ResourceType,
    description: "",
    courseName: "Python Programming Masterclass",
    batchName: "Batch A",
    pricing: "Free" as "Free" | "Paid",
    price: 99,
    visibility: "Published" as "Published" | "Draft",
    tags: "",
    objective: "",
  });

  const [editForm, setEditForm] = useState({
    id: "",
    title: "",
    type: "Notes" as ResourceType,
    description: "",
    courseName: "",
    batchName: "",
    pricing: "Free" as "Free" | "Paid" | "Included in Course",
    price: 99,
    status: "Published" as "Published" | "Draft" | "Under Review",
  });

  const [shortsForm, setShortsForm] = useState({
    title: "",
    description: "",
    clipStart: "00:00",
    clipEnd: "00:59",
    thumbnail: "",
  });

  // Unique list of Course titles for filters dropdown
  const courseOptions = useMemo(() => {
    const list = Array.from(new Set(resources.map(r => r.courseName)));
    return ["All", ...list];
  }, [resources]);

  // Folder breadcrumb helper
  const activeFolderName = useMemo(() => {
    if (!currentFolderId) return "Library Root";
    return folders.find(f => f.id === currentFolderId)?.name || "Folder Explorer";
  }, [currentFolderId, folders]);

  // Aggregate Metrics Calculations
  const statsSummary = useMemo(() => {
    const totalCount = resources.length;
    const publishedCount = resources.filter(r => r.status === "Published").length;
    const paidCount = resources.filter(r => r.pricing === "Paid").length;
    const totalDownloadsCount = resources.reduce((sum, r) => sum + r.views * 0.15, 0); // simulated downloads proportion
    const totalDownloadsRounded = Math.round(totalDownloadsCount) + 1100; // static offset to match mock data
    const totalEarningsSum = resources.reduce((sum, r) => sum + r.earnings, 0) + 234;
    const storageUsedMB = resources.reduce((sum, r) => sum + (r.type === "Video" ? 180 : 3.5), 0);
    const storageUsedGB = (storageUsedMB / 1024).toFixed(1);

    return {
      totalCount,
      publishedCount,
      paidCount,
      downloads: totalDownloadsRounded,
      revenue: totalEarningsSum,
      storage: `${storageUsedGB} GB`,
    };
  }, [resources]);

  // Folders with computed item counts
  const foldersWithCounts = useMemo(() => {
    return folders.map(f => ({
      ...f,
      filesCount: resources.filter(r => r.folderId === f.id).length,
    }));
  }, [folders, resources]);

  // Filtering Resources Explorer logic
  const filteredResources = useMemo(() => {
    return resources
      .filter(res => {
        // Folder level hierarchy
        const matchesFolder = currentFolderId ? res.folderId === currentFolderId : !res.folderId;
        // Tab type filter
        const matchesTab = selectedCategoryTab === "All" || res.type + "s" === selectedCategoryTab || (selectedCategoryTab === "Videos" && res.type === "Video") || (selectedCategoryTab === "Notes" && res.type === "Notes") || (selectedCategoryTab === "Shorts" && res.type === "Short") || (selectedCategoryTab === "Slides" && res.type === "Slides") || (selectedCategoryTab === "Assignments" && res.type === "Assignment") || (selectedCategoryTab === "Study Materials" && res.type === "Study Material");
        
        // Search bar
        const matchesSearch = res.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              (res.description && res.description.toLowerCase().includes(searchQuery.toLowerCase()));

        // Left sidebar filters
        const matchesCourse = courseFilter === "All" || res.courseName === courseFilter;
        const matchesBatch = batchFilter === "All" || res.batchName === batchFilter;
        const matchesVisibility = visibilityFilter === "All" || res.status === visibilityFilter;
        const matchesPricing = pricingFilter === "All" || res.pricing === pricingFilter;

        return matchesFolder && matchesTab && matchesSearch && matchesCourse && matchesBatch && matchesVisibility && matchesPricing;
      })
      .sort((a, b) => {
        if (sortBy === "newest") return b.lastUpdated.localeCompare(a.lastUpdated);
        if (sortBy === "views") return b.views - a.views;
        if (sortBy === "downloads") return b.downloads - a.downloads;
        if (sortBy === "revenue") return b.earnings - a.earnings;
        return 0;
      });
  }, [resources, currentFolderId, selectedCategoryTab, searchQuery, courseFilter, batchFilter, visibilityFilter, pricingFilter, sortBy]);

  // Folder Action Handlers
  const handleCreateFolderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    const newFolder: ResourceFolder = {
      id: `fld-${Date.now()}`,
      name: newFolderName.trim(),
      filesCount: 0,
    };

    setFolders(prev => [...prev, newFolder]);
    setNewFolderName("");
    setIsCreatingFolder(false);
    toast.success(`Folder "${newFolder.name}" created successfully.`);
  };

  const handleRenameFolderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRenameFolder || !renameFolderName.trim()) return;

    setFolders(prev =>
      prev.map(f => (f.id === activeRenameFolder.id ? { ...f, name: renameFolderName.trim() } : f))
    );
    toast.success("Folder renamed successfully.");
    setRenameFolderName("");
    setActiveRenameFolder(null);
  };

  const handleDeleteFolder = (id: string) => {
    setFolders(prev => prev.filter(f => f.id !== id));
    // Move contained files back to Root
    setResources(prev =>
      prev.map(r => (r.folderId === id ? { ...r, folderId: undefined } : r))
    );
    toast.success("Folder deleted. Resource files moved to Library Root.");
  };

  // Resource Action Handlers
  const handleUploadResourceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadForm.title.trim()) return;

    const isPaid = uploadForm.pricing === "Paid";
    const fileType = uploadForm.type;
    const formatStr = 
      fileType === "Video" || fileType === "Short" 
        ? "MP4" 
        : fileType === "Slides" 
        ? "PPTX" 
        : fileType === "Link" 
        ? "Link" 
        : "PDF";

    const newResource: CreatorResource = {
      id: `res-${Date.now()}`,
      title: uploadForm.title.trim(),
      type: fileType,
      format: formatStr,
      courseName: uploadForm.courseName,
      batchName: uploadForm.batchName,
      pricing: isPaid ? "Paid" : "Free",
      price: isPaid ? uploadForm.price : undefined,
      views: 0,
      downloads: 0,
      earnings: 0,
      lastUpdated: new Date().toISOString().split("T")[0],
      status: uploadForm.visibility,
      description: uploadForm.description,
      folderId: currentFolderId || undefined,
      duration: fileType === "Video" ? "1h 05m" : fileType === "Short" ? "0m 45s" : undefined,
      likes: fileType === "Short" ? 0 : undefined,
    };

    setResources(prev => [newResource, ...prev]);
    setIsUploading(false);
    toast.success(`Resource "${newResource.title}" uploaded & synchronised.`);
    setUploadForm({
      title: "",
      type: "Notes",
      description: "",
      courseName: "Python Programming Masterclass",
      batchName: "Batch A",
      pricing: "Free",
      price: 99,
      visibility: "Published",
      tags: "",
      objective: "",
    });
  };

  const handleEditResourceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.title.trim()) return;

    setResources(prev =>
      prev.map(r =>
        r.id === editForm.id
          ? {
              ...r,
              title: editForm.title.trim(),
              type: editForm.type,
              description: editForm.description,
              pricing: editForm.pricing as any,
              price: editForm.pricing === "Paid" ? editForm.price : undefined,
              status: editForm.status,
            }
          : r
      )
    );
    toast.success("Resource metadata updated.");
    setSelectedResourceForEdit(null);
  };

  const handleDeleteResource = (id: string) => {
    setResources(prev => prev.filter(r => r.id !== id));
    toast.success("Resource deleted permanently.");
  };

  const handleTogglePublish = (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "Published" ? "Draft" : "Published";
    setResources(prev =>
      prev.map(r => (r.id === id ? { ...r, status: nextStatus as any } : r))
    );
    toast.success(nextStatus === "Published" ? "Resource published to marketplace." : "Resource reverted to draft.");
  };

  // Workflow integration helpers
  const handlePublishClassRecording = (recId: string) => {
    const recording = recordedClasses.find(c => c.id === recId);
    if (!recording) return;

    const newRes: CreatorResource = {
      id: `res-${Date.now()}`,
      title: `${recording.courseName} — ${recording.title}`,
      type: "Video",
      format: "MP4",
      courseName: recording.courseName,
      batchName: recording.batchName,
      pricing: "Included in Course",
      views: 0,
      downloads: 0,
      earnings: 0,
      lastUpdated: new Date().toISOString().split("T")[0],
      status: "Published",
      duration: recording.duration,
      description: `Class session recording from ${recording.date}.`,
    };

    setResources(prev => [newRes, ...prev]);
    setRecordedClasses(prev => prev.map(c => c.id === recId ? { ...c, isPublished: true } : c));
    toast.success(`Recording published as video resource: "${newRes.title}"`);
  };

  const handleCreateShortSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResourceForShort || !shortsForm.title.trim()) return;

    const newShort: CreatorResource = {
      id: `res-${Date.now()}`,
      title: shortsForm.title.trim(),
      type: "Short",
      format: "MP4",
      courseName: resources.find(r => r.id === selectedResourceForShort.recId)?.courseName || "General Course",
      batchName: "Batch A",
      pricing: "Free",
      views: 0,
      downloads: 0,
      earnings: 0,
      lastUpdated: new Date().toISOString().split("T")[0],
      status: "Published",
      likes: 0,
      duration: "0m 59s",
      description: shortsForm.description,
    };

    setResources(prev => [newShort, ...prev]);
    setSelectedResourceForShort(null);
    setShortsForm({ title: "", description: "", clipStart: "00:00", clipEnd: "00:59", thumbnail: "" });
    toast.success(`Short clip "${newShort.title}" generated successfully from recording.`);
  };

  return (
    <motion.div
      key="tutor-resources-overhaul"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="space-y-8"
    >
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="text-left">
          <h2 className="text-2xl font-bold tracking-tight text-foreground font-heading">Resource Library</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Create, manage, publish and monetize your teaching resources.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setIsCreatingFolder(true)}
            size="sm"
            variant="outline"
            className="h-9 gap-1 font-bold border-border/80 hover:bg-muted text-foreground cursor-pointer"
          >
            <FolderPlus size={14} className="text-primary" />
            <span>Create Folder</span>
          </Button>
          <Button
            onClick={() => setIsUploading(true)}
            size="sm"
            className="h-9 gap-1.5 bg-primary hover:bg-primary/95 text-white font-bold shadow-soft cursor-pointer border-none"
          >
            <Upload size={14} />
            <span>Upload Resource</span>
          </Button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: "Total Resources", value: statsSummary.totalCount, icon: FileText, color: "text-primary" },
          { label: "Published Resources", value: statsSummary.publishedCount, icon: CheckCircle, color: "text-emerald-500" },
          { label: "Paid Resources", value: statsSummary.paidCount, icon: DollarSign, color: "text-amber-500" },
          { label: "Total Downloads", value: statsSummary.downloads.toLocaleString(), icon: FileDown, color: "text-indigo-500" },
          { label: "Resource Revenue", value: `₹${statsSummary.revenue.toLocaleString()}`, icon: Coins, color: "text-emerald-500" },
          { label: "Storage Used", value: statsSummary.storage, icon: HardDrive, color: "text-muted-foreground" },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <Card key={idx} variant="glass" className="p-4 flex items-center justify-between border-border/60 hover:border-primary/20 transition-all select-none">
              <div className="text-left space-y-0.5 min-w-0">
                <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground truncate">{item.label}</p>
                <h4 className="text-lg font-extrabold text-foreground truncate mt-0.5">{item.value}</h4>
              </div>
              <span className={`p-1.5 bg-muted/20 border border-border/20 rounded-lg shrink-0 ml-2 ${item.color}`}>
                <Icon size={16} />
              </span>
            </Card>
          );
        })}
      </div>

      {/* Navigation tabs */}
      <div className="flex items-center gap-1 border-b border-border/40 pb-2 select-none">
        {[
          { id: "explorer", label: "Library Explorer" },
          { id: "recorded-classes", label: "Recorded Live Classes" },
          { id: "reports", label: "Library Reports" },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 text-xs font-black transition-all cursor-pointer bg-transparent border-none ${
              activeTab === tab.id
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main View Area */}
      <AnimatePresence mode="wait">
        {/* TAB 1: Library Explorer */}
        {activeTab === "explorer" && (
          <motion.div
            key="explorer-view"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-6"
          >
            {/* Creator Performance Section */}
            <Card variant="glass" className="p-6 border-border/60 text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4 select-none">
                <div>
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5 font-heading">
                    <BarChart3 size={15} className="text-primary" />
                    Resource Performance Analytics
                  </h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Visualize your handout downloads, video watch metrics, and purchase trends over time.</p>
                </div>
                <div className="flex items-center gap-1 bg-muted/30 p-1 border border-border/40 rounded-lg shrink-0">
                  {(["7d", "30d", "3m", "1y"] as const).map(tf => (
                    <button
                      key={tf}
                      onClick={() => setTimeFilter(tf)}
                      className={`px-2.5 py-1 text-[9.5px] font-black uppercase rounded transition cursor-pointer border-none ${
                        timeFilter === tf
                          ? "bg-primary text-white"
                          : "text-muted-foreground hover:text-foreground bg-transparent"
                      }`}
                    >
                      {tf === "7d" ? "7 Days" : tf === "30d" ? "30 Days" : tf === "3m" ? "3 Months" : "1 Year"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-5">
                <div className="md:col-span-3">
                  <ResourcePerformanceChart timeFilter={timeFilter} />
                </div>
                <div className="flex flex-col justify-around bg-muted/10 border border-border/40 p-4 rounded-xl space-y-4">
                  {[
                    { label: "Views", val: "9,420 views", color: "text-primary" },
                    { label: "Downloads", val: "1,284 downloads", color: "text-indigo-500" },
                    { label: "Purchases", val: "482 orders", color: "text-amber-500" },
                    { label: "Net Revenue", val: "₹18,450", color: "text-emerald-500 font-extrabold" },
                  ].map((p, i) => (
                    <div key={i} className="flex justify-between items-center text-xs border-b border-border/20 pb-2 last:border-0 last:pb-0">
                      <span className="font-bold text-muted-foreground">{p.label}</span>
                      <span className={`font-black ${p.color}`}>{p.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Folder Hierarchy List at top of Explorer */}
            {!currentFolderId && (
              <div className="space-y-3.5 text-left">
                <h3 className="text-[11px] font-black uppercase tracking-wider text-muted-foreground select-none">Quick Folders</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  {foldersWithCounts.map(fld => (
                    <Card
                      key={fld.id}
                      variant="glass"
                      className="p-4 border-border/60 hover:border-primary/20 transition-all flex flex-col justify-between group h-24 select-none relative"
                    >
                      <div className="flex justify-between items-start">
                        <span
                          onClick={() => setCurrentFolderId(fld.id)}
                          className="text-primary group-hover:scale-105 transition-transform cursor-pointer"
                        >
                          <FolderOpen size={24} className="fill-primary/5" />
                        </span>
                        <div className="relative group/menu">
                          <button className="text-muted-foreground hover:text-foreground cursor-pointer bg-transparent border-none">
                            <MoreVertical size={13} />
                          </button>
                          <div className="absolute right-0 mt-1 hidden group-hover/menu:flex flex-col bg-card border border-border rounded-lg shadow-floating py-1.5 w-32 z-30">
                            <button
                              onClick={() => {
                                setActiveRenameFolder(fld);
                                setRenameFolderName(fld.name);
                              }}
                              className="px-3 py-1.5 text-[10px] text-left font-bold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition cursor-pointer bg-transparent border-none"
                            >
                              Rename Folder
                            </button>
                            <button
                              onClick={() => handleDeleteFolder(fld.id)}
                              className="px-3 py-1.5 text-[10px] text-left font-bold text-destructive hover:bg-destructive/5 transition cursor-pointer bg-transparent border-none"
                            >
                              Delete Folder
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 text-left min-w-0">
                        <h4
                          onClick={() => setCurrentFolderId(fld.id)}
                          className="text-xs font-black text-foreground truncate cursor-pointer hover:text-primary transition"
                        >
                          {fld.name}
                        </h4>
                        <span className="text-[9.5px] text-muted-foreground font-semibold">{fld.filesCount} items</span>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Breadcrumb if inside folder */}
            {currentFolderId && (
              <div className="flex items-center gap-2 text-xs font-bold select-none text-left">
                <button
                  onClick={() => setCurrentFolderId(null)}
                  className="p-1 rounded bg-muted/40 hover:bg-muted/80 text-muted-foreground hover:text-foreground transition cursor-pointer border-none"
                >
                  <ArrowLeft size={13} />
                </button>
                <span className="text-muted-foreground">Resource Library Root</span>
                <ChevronRight size={12} className="text-muted-foreground/50" />
                <span className="text-foreground">{activeFolderName}</span>
              </div>
            )}

            {/* Sub-categories Tabs bar */}
            <div className="flex items-center justify-between border-b border-border/40 pb-2.5 select-none">
              <div className="flex flex-wrap gap-1">
                {["All", "Notes", "Videos", "Shorts", "Slides", "Assignments", "Study Materials"].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategoryTab(cat)}
                    className={`px-3 py-1.5 text-[10.5px] font-black rounded-lg transition border-none ${
                      selectedCategoryTab === cat
                        ? "bg-primary/15 text-primary border border-primary/20"
                        : "text-muted-foreground hover:text-foreground bg-transparent border border-transparent"
                    }`}
                  >
                    <span>{cat === "All" ? "All Resources" : cat}</span>
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1.5 bg-muted/40 border border-border/60 p-0.5 rounded-lg shrink-0">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1 rounded cursor-pointer border-none ${viewMode === "grid" ? "bg-primary text-white" : "text-muted-foreground bg-transparent"}`}
                >
                  <Grid size={13} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-1 rounded cursor-pointer border-none ${viewMode === "list" ? "bg-primary text-white" : "text-muted-foreground bg-transparent"}`}
                >
                  <List size={13} />
                </button>
              </div>
            </div>

            {/* Search + filter area */}
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-3 text-left">
              {/* Search */}
              <div className="relative md:col-span-2">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
                <input
                  type="text"
                  placeholder="Search resources..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-muted/20 border border-border/80 focus:border-primary/40 rounded-xl text-xs font-bold text-foreground outline-none transition"
                />
              </div>

              {/* Course */}
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] font-bold text-muted-foreground uppercase px-1">Course</span>
                <select
                  value={courseFilter}
                  onChange={e => setCourseFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-muted/20 border border-border/80 focus:border-primary/40 rounded-xl text-xs font-bold text-foreground outline-none cursor-pointer"
                >
                  {courseOptions.map((opt, i) => <option key={i} value={opt} className="bg-slate-900">{opt}</option>)}
                </select>
              </div>

              {/* Batch */}
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] font-bold text-muted-foreground uppercase px-1">Batch</span>
                <select
                  value={batchFilter}
                  onChange={e => setBatchFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-muted/20 border border-border/80 focus:border-primary/40 rounded-xl text-xs font-bold text-foreground outline-none cursor-pointer"
                >
                  <option value="All" className="bg-slate-900">All Batches</option>
                  <option value="Batch A" className="bg-slate-900">Batch A</option>
                  <option value="Batch B" className="bg-slate-900">Batch B</option>
                  <option value="Batch C" className="bg-slate-900">Batch C</option>
                </select>
              </div>

              {/* Visibility */}
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] font-bold text-muted-foreground uppercase px-1">Visibility</span>
                <select
                  value={visibilityFilter}
                  onChange={e => setVisibilityFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-muted/20 border border-border/80 focus:border-primary/40 rounded-xl text-xs font-bold text-foreground outline-none cursor-pointer"
                >
                  <option value="All" className="bg-slate-900">All Visibility</option>
                  <option value="Published" className="bg-slate-900">Published</option>
                  <option value="Draft" className="bg-slate-900">Draft</option>
                  <option value="Under Review" className="bg-slate-900">Under Review</option>
                </select>
              </div>

              {/* Pricing */}
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] font-bold text-muted-foreground uppercase px-1">Pricing</span>
                <select
                  value={pricingFilter}
                  onChange={e => setPricingFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-muted/20 border border-border/80 focus:border-primary/40 rounded-xl text-xs font-bold text-foreground outline-none cursor-pointer"
                >
                  <option value="All" className="bg-slate-900">All Pricing</option>
                  <option value="Free" className="bg-slate-900">Free</option>
                  <option value="Paid" className="bg-slate-900">Paid</option>
                  <option value="Included in Course" className="bg-slate-900">Included in Course</option>
                </select>
              </div>

              {/* Sorting */}
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] font-bold text-muted-foreground uppercase px-1">Sort</span>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="px-2.5 py-1.5 bg-muted/20 border border-border/80 focus:border-primary/40 rounded-xl text-xs font-bold text-foreground outline-none cursor-pointer"
                >
                  <option value="newest" className="bg-slate-900">Newest First</option>
                  <option value="views" className="bg-slate-900">Most Viewed</option>
                  <option value="downloads" className="bg-slate-900">Most Downloaded</option>
                  <option value="revenue" className="bg-slate-900">Highest Revenue</option>
                </select>
              </div>
            </div>

            {/* Resources Render area */}
            {filteredResources.length === 0 ? (
              <div className="border border-border/80 bg-muted/5 rounded-xl py-14 flex flex-col items-center justify-center gap-4 text-center select-none text-left">
                <AlertCircle size={28} className="text-muted-foreground/60" />
                <div>
                  <h4 className="text-sm font-black text-foreground">No resources found matching filter criteria</h4>
                  <p className="text-[11px] text-muted-foreground mt-1 max-w-sm leading-relaxed">
                    Upload your first teaching resource, publish notes, or turn a completed live class into reusable content.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setIsUploading(true)}
                    size="sm"
                    className="h-8 text-[10.5px] bg-primary text-white font-bold cursor-pointer border-none"
                  >
                    Upload Resource
                  </Button>
                  <Button
                    onClick={() => setIsCreatingFolder(true)}
                    size="sm"
                    variant="outline"
                    className="h-8 text-[10.5px] font-bold cursor-pointer"
                  >
                    Create Folder
                  </Button>
                </div>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 text-left">
                {filteredResources.map(res => (
                  <Card
                    key={res.id}
                    variant="glass"
                    className="flex flex-col justify-between border-border/60 hover:border-primary/20 transition duration-300 overflow-hidden shadow-sm"
                  >
                    {/* Upper block */}
                    <div className="p-4 space-y-3 min-w-0">
                      <div className="flex justify-between items-start">
                        {/* Format / Type icon block */}
                        <span className={`p-2 border rounded-lg shrink-0 ${
                          res.type === "Video"
                            ? "text-rose-500 bg-rose-500/10 border-rose-500/20"
                            : res.type === "Short"
                            ? "text-primary bg-primary/10 border-primary/20"
                            : res.type === "Slides"
                            ? "text-indigo-500 bg-indigo-500/10 border-indigo-500/20"
                            : res.type === "Assignment"
                            ? "text-sky-500 bg-sky-500/10 border-sky-500/20"
                            : "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
                        }`}>
                          {res.type === "Video" && <Video size={16} />}
                          {res.type === "Short" && <Scissors size={16} />}
                          {res.type === "Slides" && <FileText size={16} />}
                          {res.type === "Assignment" && <FileText size={16} />}
                          {res.type === "Notes" && <FileText size={16} />}
                          {res.type === "Study Material" && <FileText size={16} />}
                          {res.type === "Link" && <LinkIcon size={16} />}
                        </span>

                        {/* Badges and Price info */}
                        <div className="flex items-center gap-1.5 select-none">
                          <span className={`text-[8.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                            res.pricing === "Paid"
                              ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                              : res.pricing === "Free"
                              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                              : "bg-indigo-500/10 text-indigo-500 border-indigo-500/20"
                          }`}>
                            {res.pricing === "Paid" ? `₹${res.price}` : res.pricing}
                          </span>
                          <span className={`text-[8.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                            res.status === "Published"
                              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                              : res.status === "Draft"
                              ? "bg-slate-500/10 text-slate-500 border-slate-500/20"
                              : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                          }`}>
                            {res.status}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-xs font-black text-foreground truncate">{res.title}</h4>
                        <p className="text-[10px] text-muted-foreground font-semibold truncate">Course: {res.courseName}</p>
                        {res.description && (
                          <p className="text-[10.5px] text-muted-foreground line-clamp-2 leading-relaxed pt-1">{res.description}</p>
                        )}
                      </div>
                    </div>

                    {/* Meta numbers block */}
                    <div className="px-4 py-3 bg-muted/10 border-t border-border/40 space-y-2 select-none">
                      <div className="grid grid-cols-2 gap-2 text-[10px] text-muted-foreground font-semibold">
                        <div>Views: <strong className="text-foreground">{res.views.toLocaleString()}</strong></div>
                        <div>
                          {res.type === "Short" 
                            ? `Likes: ${res.likes || 0}`
                            : res.pricing === "Paid"
                            ? `Purchases: ${res.downloads}`
                            : `Downloads: ${res.downloads}`}
                        </div>
                        {res.pricing === "Paid" && (
                          <div className="col-span-2 text-emerald-500 font-bold">Earnings: ₹{res.earnings.toLocaleString()}</div>
                        )}
                        {res.duration && (
                          <div className="col-span-2">Duration: <strong className="text-foreground">{res.duration}</strong></div>
                        )}
                      </div>

                      {/* Lower buttons */}
                      <div className="flex items-center gap-1.5 pt-2 border-t border-border/20">
                        {res.type === "Video" ? (
                          <button
                            onClick={() => setSelectedResourceForPreview(res)}
                            className="px-2.5 py-1 bg-primary text-white text-[9.5px] font-bold rounded hover:opacity-95 transition flex items-center gap-0.5 cursor-pointer border-none"
                          >
                            <Play size={10} className="fill-white" />
                            <span>Watch</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => setSelectedResourceForPreview(res)}
                            className="px-2.5 py-1 bg-primary text-white text-[9.5px] font-bold rounded hover:opacity-95 transition flex items-center gap-0.5 cursor-pointer border-none"
                          >
                            <Eye size={10} />
                            <span>Preview</span>
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setEditForm({
                              id: res.id,
                              title: res.title,
                              type: res.type,
                              description: res.description || "",
                              courseName: res.courseName,
                              batchName: res.batchName,
                              pricing: res.pricing,
                              price: res.price || 99,
                              status: res.status,
                            });
                            setSelectedResourceForEdit(res);
                          }}
                          className="px-2.5 py-1 bg-muted hover:bg-muted/80 text-foreground text-[9.5px] font-bold rounded transition cursor-pointer border-none"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => setSelectedResourceForAnalytics(res)}
                          className="px-2.5 py-1 bg-transparent hover:bg-muted text-muted-foreground hover:text-foreground text-[9.5px] font-bold rounded transition cursor-pointer border-none"
                        >
                          Analytics
                        </button>

                        <div className="relative group/more ml-auto">
                          <button className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground cursor-pointer bg-transparent border-none">
                            <MoreVertical size={13} />
                          </button>
                          <div className="absolute right-0 bottom-full mb-1 hidden group-hover/more:flex flex-col bg-card border border-border rounded-lg shadow-floating py-1.5 w-36 z-30">
                            {res.type === "Video" && (
                              <button
                                onClick={() => setSelectedResourceForShort({ recId: res.id, title: res.title })}
                                className="px-3 py-1.5 text-[10px] text-left font-bold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition flex items-center gap-1 cursor-pointer bg-transparent border-none"
                              >
                                <Scissors size={10} className="text-primary" />
                                <span>Create Short</span>
                              </button>
                            )}
                            <button
                              onClick={() => handleTogglePublish(res.id, res.status)}
                              className="px-3 py-1.5 text-[10px] text-left font-bold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition cursor-pointer bg-transparent border-none"
                            >
                              {res.status === "Published" ? "Unpublish" : "Publish"}
                            </button>
                            <button
                              onClick={() => {
                                const newId = `res-${Date.now()}`;
                                setResources(prev => [{ ...res, id: newId, title: `${res.title} (Copy)` }, ...prev]);
                                toast.success("Resource duplicated.");
                              }}
                              className="px-3 py-1.5 text-[10px] text-left font-bold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition cursor-pointer bg-transparent border-none"
                            >
                              Duplicate
                            </button>
                            <button
                              onClick={() => handleDeleteResource(res.id)}
                              className="px-3 py-1.5 text-[10px] text-left font-bold text-destructive hover:bg-destructive/5 transition cursor-pointer bg-transparent border-none"
                            >
                              Delete Resource
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="bg-card border border-border/80 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-xs font-semibold text-foreground select-none">
                  <thead>
                    <tr className="bg-muted/30 border-b border-border/60 text-[10px] font-black uppercase text-muted-foreground tracking-wider select-none text-left">
                      <th className="p-3">Resource Name</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Course / Batch</th>
                      <th className="p-3">Pricing</th>
                      <th className="p-3 text-right">Views</th>
                      <th className="p-3 text-right">Downloads</th>
                      <th className="p-3 text-right">Revenue</th>
                      <th className="p-3 text-center">Status</th>
                      <th className="p-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30 text-left">
                    {filteredResources.map(res => (
                      <tr key={res.id} className="hover:bg-muted/10 transition">
                        <td className="p-3 font-extrabold">{res.title}</td>
                        <td className="p-3 text-muted-foreground">{res.format} • {res.type}</td>
                        <td className="p-3 text-muted-foreground">{res.courseName} ({res.batchName})</td>
                        <td className="p-3">
                          {res.pricing === "Paid" ? (
                            <span className="text-amber-500 font-bold">₹{res.price}</span>
                          ) : (
                            <span className="text-emerald-500 font-bold">{res.pricing}</span>
                          )}
                        </td>
                        <td className="p-3 text-right">{res.views.toLocaleString()}</td>
                        <td className="p-3 text-right">{res.downloads.toLocaleString()}</td>
                        <td className="p-3 text-right text-emerald-500">{res.pricing === "Paid" ? `₹${res.earnings.toLocaleString()}` : "—"}</td>
                        <td className="p-3 text-center">
                          <span className={`text-[8.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                            res.status === "Published"
                              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                              : "bg-slate-500/10 text-slate-500 border-slate-500/20"
                          }`}>
                            {res.status}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center justify-center gap-2 select-none">
                            <button
                              onClick={() => setSelectedResourceForPreview(res)}
                              className="p-1 hover:bg-muted rounded text-primary transition cursor-pointer bg-transparent border-none"
                              title="Preview"
                            >
                              <Eye size={13} />
                            </button>
                            <button
                              onClick={() => {
                                setEditForm({
                                  id: res.id,
                                  title: res.title,
                                  type: res.type,
                                  description: res.description || "",
                                  courseName: res.courseName,
                                  batchName: res.batchName,
                                  pricing: res.pricing,
                                  price: res.price || 99,
                                  status: res.status,
                                });
                                setSelectedResourceForEdit(res);
                              }}
                              className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition cursor-pointer bg-transparent border-none"
                              title="Edit"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() => setSelectedResourceForAnalytics(res)}
                              className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition cursor-pointer bg-transparent border-none"
                              title="Analytics"
                            >
                              <BarChart3 size={13} />
                            </button>
                            <button
                              onClick={() => handleDeleteResource(res.id)}
                              className="p-1 hover:bg-destructive/10 rounded text-destructive transition cursor-pointer bg-transparent border-none"
                              title="Delete"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}

        {/* TAB 2: Recorded Live Classes */}
        {activeTab === "recorded-classes" && (
          <motion.div
            key="recorded-view"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-4 text-left"
          >
            <div className="border-b border-border/40 pb-2 mb-2 select-none">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider font-heading">Recorded Live Classes Pipeline</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">EduEarn completed sessions are recorded. Review, publish, generate shorts, or attach study materials.</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {recordedClasses.map(rec => (
                <div
                  key={rec.id}
                  className="bg-card border border-border/60 hover:border-primary/20 p-5 rounded-xl transition flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 select-none">
                      <span className={`text-[8.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        rec.isPublished 
                          ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
                          : "bg-slate-500/10 text-slate-500 border-slate-500/20"
                      }`}>
                        {rec.isPublished ? "Published" : "Awaiting Publish"}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-semibold">{rec.duration} • Completed on {rec.date}</span>
                    </div>
                    <h4 className="font-extrabold text-sm text-foreground">{rec.courseName} — {rec.title}</h4>
                    <p className="text-[10.5px] text-muted-foreground font-semibold">Batch: {rec.batchName} • Recording state ready.</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 select-none">
                    {!rec.isPublished ? (
                      <button
                        onClick={() => handlePublishClassRecording(rec.id)}
                        className="px-3.5 py-1.5 bg-primary text-white text-[10.5px] font-bold rounded hover:opacity-95 transition flex items-center gap-1 cursor-pointer border-none"
                      >
                        <Upload size={11} />
                        <span>Publish Recording</span>
                      </button>
                    ) : (
                      <button
                        className="px-3.5 py-1.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10.5px] font-bold rounded cursor-default border-none"
                        disabled
                      >
                        Recording Live
                      </button>
                    )}

                    <button
                      onClick={() => setSelectedResourceForShort({ recId: rec.id, title: `${rec.courseName} — ${rec.title}` })}
                      className="px-3.5 py-1.5 bg-muted hover:bg-muted/80 text-foreground text-[10.5px] font-bold rounded transition flex items-center gap-1 cursor-pointer border-none"
                    >
                      <Scissors size={11} className="text-primary" />
                      <span>Create Short</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsUploading(true);
                        setUploadForm(prev => ({ ...prev, courseName: rec.courseName, batchName: rec.batchName, title: `${rec.title} Notes` }));
                      }}
                      className="px-3.5 py-1.5 bg-transparent hover:bg-muted text-muted-foreground hover:text-foreground text-[10.5px] font-bold rounded border border-border/40 transition cursor-pointer"
                    >
                      Attach Notes
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* TAB 3: Library Reports */}
        {activeTab === "reports" && (
          <motion.div
            key="reports-view"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-6 text-left"
          >
            <div className="border-b border-border/40 pb-2 mb-2 select-none">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider font-heading">Library Reports Workspace</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Comprehensive audit reports on popular resources and monthly earnings metrics.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Popular Resource Table */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase text-muted-foreground select-none">Highest Earning Resources</h4>
                <div className="bg-card border border-border/80 rounded-xl overflow-hidden shadow-sm">
                  <table className="w-full text-xs font-semibold text-foreground select-none">
                    <thead>
                      <tr className="bg-muted/30 border-b border-border/60 text-[9.5px] font-black uppercase text-muted-foreground tracking-wider select-none text-left">
                        <th className="p-3">Resource</th>
                        <th className="p-3 text-right">Orders</th>
                        <th className="p-3 text-right">Earnings</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30 text-left">
                      {resources
                        .filter(r => r.pricing === "Paid")
                        .sort((a, b) => b.earnings - a.earnings)
                        .slice(0, 4)
                        .map(r => (
                          <tr key={r.id} className="hover:bg-muted/10 transition">
                            <td className="p-3 font-extrabold">{r.title}</td>
                            <td className="p-3 text-right">{r.downloads}</td>
                            <td className="p-3 text-right text-emerald-500 font-bold">₹{r.earnings.toLocaleString()}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Most Watched Videos */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase text-muted-foreground select-none">Top Performing Recorded Classes</h4>
                <div className="bg-card border border-border/80 rounded-xl overflow-hidden shadow-sm">
                  <table className="w-full text-xs font-semibold text-foreground select-none">
                    <thead>
                      <tr className="bg-muted/30 border-b border-border/60 text-[9.5px] font-black uppercase text-muted-foreground tracking-wider select-none text-left">
                        <th className="p-3">Recording Title</th>
                        <th className="p-3 text-right">Views</th>
                        <th className="p-3 text-right">Students Watched</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30 text-left">
                      {resources
                        .filter(r => r.type === "Video")
                        .sort((a, b) => b.views - a.views)
                        .slice(0, 4)
                        .map(r => (
                          <tr key={r.id} className="hover:bg-muted/10 transition">
                            <td className="p-3 font-extrabold">{r.title}</td>
                            <td className="p-3 text-right">{r.views.toLocaleString()}</td>
                            <td className="p-3 text-right text-indigo-500 font-bold">{r.downloads} students</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── MODAL: UPLOAD RESOURCE ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isUploading && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-card border border-border shadow-floating max-w-lg w-full rounded-modal p-6 text-foreground text-left"
            >
              <div className="flex justify-between items-center border-b border-border/40 pb-3 mb-4 select-none">
                <h3 className="font-heading font-extrabold text-sm uppercase text-foreground">Upload Learning Resource</h3>
                <button
                  onClick={() => setIsUploading(false)}
                  className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground cursor-pointer bg-transparent border-none"
                >
                  <X size={15} />
                </button>
              </div>

              <form onSubmit={handleUploadResourceSubmit} className="space-y-4 text-xs font-bold">
                <div className="flex flex-col gap-1">
                  <label className="text-muted-foreground uppercase text-[9px]">Resource Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Advanced SQL Handouts"
                    value={uploadForm.title}
                    onChange={e => setUploadForm({ ...uploadForm, title: e.target.value })}
                    className="px-3 py-2 bg-muted/20 border border-border focus:border-primary/45 rounded-xl outline-none text-foreground font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-muted-foreground uppercase text-[9px]">Resource Type</label>
                    <select
                      value={uploadForm.type}
                      onChange={e => setUploadForm({ ...uploadForm, type: e.target.value as any })}
                      className="px-3 py-2 bg-muted/20 border border-border rounded-xl outline-none text-foreground font-bold cursor-pointer"
                    >
                      <option value="Notes" className="bg-slate-900">Notes (PDF)</option>
                      <option value="Video" className="bg-slate-900">Recorded Video (MP4)</option>
                      <option value="Short" className="bg-slate-900">Short Clip (MP4)</option>
                      <option value="Slides" className="bg-slate-900">Slides (PPTX)</option>
                      <option value="Assignment" className="bg-slate-900">Assignment (PDF)</option>
                      <option value="Study Material" className="bg-slate-900">Study Material (PDF)</option>
                      <option value="Link" className="bg-slate-900">External Web Link</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-muted-foreground uppercase text-[9px]">Course Scope</label>
                    <select
                      value={uploadForm.courseName}
                      onChange={e => setUploadForm({ ...uploadForm, courseName: e.target.value })}
                      className="px-3 py-2 bg-muted/20 border border-border rounded-xl outline-none text-foreground font-bold cursor-pointer"
                    >
                      <option value="Python Programming Masterclass" className="bg-slate-900">Python Programming Masterclass</option>
                      <option value="Full-Stack Web Dev Bootcamp" className="bg-slate-900">Full-Stack Web Dev Bootcamp</option>
                      <option value="DSA & Algorithms Bootcamp" className="bg-slate-900">DSA & Algorithms Bootcamp</option>
                      <option value="AI & Data Science Foundation" className="bg-slate-900">AI & Data Science Foundation</option>
                      <option value="SQL & Database Essentials" className="bg-slate-900">SQL & Database Essentials</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-muted-foreground uppercase text-[9px]">Resource Description</label>
                  <textarea
                    placeholder="Short summary of the resource content..."
                    value={uploadForm.description}
                    onChange={e => setUploadForm({ ...uploadForm, description: e.target.value })}
                    className="px-3 py-2 bg-muted/20 border border-border focus:border-primary/45 rounded-xl outline-none text-foreground font-semibold min-h-[60px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-border/20 pt-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-muted-foreground uppercase text-[9px]">Monetization Mode</label>
                    <select
                      value={uploadForm.pricing}
                      onChange={e => setUploadForm({ ...uploadForm, pricing: e.target.value as any })}
                      className="px-3 py-2 bg-muted/20 border border-border rounded-xl outline-none text-foreground font-bold cursor-pointer"
                    >
                      <option value="Free" className="bg-slate-900">Free Resource</option>
                      <option value="Paid" className="bg-slate-900">Paid Handout</option>
                    </select>
                  </div>

                  {uploadForm.pricing === "Paid" && (
                    <div className="flex flex-col gap-1">
                      <label className="text-muted-foreground uppercase text-[9px]">Set Price (Affordable tier)</label>
                      <select
                        value={uploadForm.price}
                        onChange={e => setUploadForm({ ...uploadForm, price: Number(e.target.value) })}
                        className="px-3 py-2 bg-muted/20 border border-border rounded-xl outline-none text-foreground font-bold cursor-pointer"
                      >
                        <option value="50" className="bg-slate-900">₹50</option>
                        <option value="75" className="bg-slate-900">₹75</option>
                        <option value="99" className="bg-slate-900">₹99</option>
                        <option value="129" className="bg-slate-900">₹129</option>
                        <option value="149" className="bg-slate-900">₹149</option>
                      </select>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-muted-foreground uppercase text-[9px]">Visibility Option</label>
                  <select
                    value={uploadForm.visibility}
                    onChange={e => setUploadForm({ ...uploadForm, visibility: e.target.value as any })}
                    className="px-3 py-2 bg-muted/20 border border-border rounded-xl outline-none text-foreground font-bold cursor-pointer"
                  >
                    <option value="Published" className="bg-slate-900">Publish Immediately</option>
                    <option value="Draft" className="bg-slate-900">Save as Draft</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-border/40 select-none">
                  <Button variant="outline" size="sm" type="button" onClick={() => setIsUploading(false)} className="font-bold cursor-pointer">
                    Cancel
                  </Button>
                  <Button size="sm" type="submit" className="bg-primary hover:bg-primary/95 text-white font-bold cursor-pointer border-none">
                    Save &amp; Sync
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── MODAL: CREATE FOLDER ───────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isCreatingFolder && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-card border border-border shadow-floating max-w-sm w-full rounded-modal p-6 text-foreground text-left"
            >
              <div className="flex justify-between items-center border-b border-border/40 pb-3 mb-4 select-none">
                <h3 className="font-heading font-extrabold text-sm uppercase text-foreground">Create Resource Folder</h3>
                <button
                  onClick={() => setIsCreatingFolder(false)}
                  className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground cursor-pointer bg-transparent border-none"
                >
                  <X size={15} />
                </button>
              </div>

              <form onSubmit={handleCreateFolderSubmit} className="space-y-4 text-xs font-bold">
                <div className="flex flex-col gap-1">
                  <label className="text-muted-foreground uppercase text-[9px]">Folder Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Python Assignments"
                    value={newFolderName}
                    onChange={e => setNewFolderName(e.target.value)}
                    className="px-3 py-2 bg-muted/20 border border-border focus:border-primary/45 rounded-xl outline-none text-foreground font-bold"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 select-none">
                  <Button variant="outline" size="sm" type="button" onClick={() => setIsCreatingFolder(false)} className="font-bold cursor-pointer">
                    Cancel
                  </Button>
                  <Button size="sm" type="submit" className="bg-primary hover:bg-primary/95 text-white font-bold cursor-pointer border-none">
                    Create
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── MODAL: RENAME FOLDER ───────────────────────────────────────────────────── */}
      <AnimatePresence>
        {activeRenameFolder && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-card border border-border shadow-floating max-w-sm w-full rounded-modal p-6 text-foreground text-left"
            >
              <div className="flex justify-between items-center border-b border-border/40 pb-3 mb-4 select-none">
                <h3 className="font-heading font-extrabold text-sm uppercase text-foreground">Rename Folder</h3>
                <button
                  onClick={() => setActiveRenameFolder(null)}
                  className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground cursor-pointer bg-transparent border-none"
                >
                  <X size={15} />
                </button>
              </div>

              <form onSubmit={handleRenameFolderSubmit} className="space-y-4 text-xs font-bold">
                <div className="flex flex-col gap-1">
                  <label className="text-muted-foreground uppercase text-[9px]">Folder Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Python Handouts"
                    value={renameFolderName}
                    onChange={e => setRenameFolderName(e.target.value)}
                    className="px-3 py-2 bg-muted/20 border border-border focus:border-primary/45 rounded-xl outline-none text-foreground font-bold"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 select-none">
                  <Button variant="outline" size="sm" type="button" onClick={() => setActiveRenameFolder(null)} className="font-bold cursor-pointer">
                    Cancel
                  </Button>
                  <Button size="sm" type="submit" className="bg-primary hover:bg-primary/95 text-white font-bold cursor-pointer border-none">
                    Rename
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── MODAL: EDIT RESOURCE ───────────────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedResourceForEdit && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-card border border-border shadow-floating max-w-lg w-full rounded-modal p-6 text-foreground text-left"
            >
              <div className="flex justify-between items-center border-b border-border/40 pb-3 mb-4 select-none">
                <h3 className="font-heading font-extrabold text-sm uppercase text-foreground">Edit Resource Metadata</h3>
                <button
                  onClick={() => setSelectedResourceForEdit(null)}
                  className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground cursor-pointer bg-transparent border-none"
                >
                  <X size={15} />
                </button>
              </div>

              <form onSubmit={handleEditResourceSubmit} className="space-y-4 text-xs font-bold">
                <div className="flex flex-col gap-1">
                  <label className="text-muted-foreground uppercase text-[9px]">Resource Title</label>
                  <input
                    type="text"
                    required
                    value={editForm.title}
                    onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                    className="px-3 py-2 bg-muted/20 border border-border focus:border-primary/45 rounded-xl outline-none text-foreground font-bold"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-muted-foreground uppercase text-[9px]">Resource Description</label>
                  <textarea
                    value={editForm.description}
                    onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                    className="px-3 py-2 bg-muted/20 border border-border focus:border-primary/45 rounded-xl outline-none text-foreground font-semibold min-h-[60px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-border/20 pt-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-muted-foreground uppercase text-[9px]">Pricing tier</label>
                    <select
                      value={editForm.pricing}
                      onChange={e => setEditForm({ ...editForm, pricing: e.target.value as any })}
                      className="px-3 py-2 bg-muted/20 border border-border rounded-xl outline-none text-foreground font-bold cursor-pointer"
                    >
                      <option value="Free" className="bg-slate-900">Free Resource</option>
                      <option value="Paid" className="bg-slate-900">Paid Handout</option>
                      <option value="Included in Course" className="bg-slate-900">Included in Course</option>
                    </select>
                  </div>

                  {editForm.pricing === "Paid" && (
                    <div className="flex flex-col gap-1">
                      <label className="text-muted-foreground uppercase text-[9px]">Set Price</label>
                      <select
                        value={editForm.price}
                        onChange={e => setEditForm({ ...editForm, price: Number(e.target.value) })}
                        className="px-3 py-2 bg-muted/20 border border-border rounded-xl outline-none text-foreground font-bold cursor-pointer"
                      >
                        <option value="50" className="bg-slate-900">₹50</option>
                        <option value="75" className="bg-slate-900">₹75</option>
                        <option value="99" className="bg-slate-900">₹99</option>
                        <option value="129" className="bg-slate-900">₹129</option>
                        <option value="149" className="bg-slate-900">₹149</option>
                      </select>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-muted-foreground uppercase text-[9px]">Publish Status</label>
                  <select
                    value={editForm.status}
                    onChange={e => setEditForm({ ...editForm, status: e.target.value as any })}
                    className="px-3 py-2 bg-muted/20 border border-border rounded-xl outline-none text-foreground font-bold cursor-pointer"
                  >
                    <option value="Published" className="bg-slate-900">Published</option>
                    <option value="Draft" className="bg-slate-900">Draft</option>
                    <option value="Under Review" className="bg-slate-900">Under Review</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-border/40 select-none">
                  <Button variant="outline" size="sm" type="button" onClick={() => setSelectedResourceForEdit(null)} className="font-bold cursor-pointer">
                    Cancel
                  </Button>
                  <Button size="sm" type="submit" className="bg-primary hover:bg-primary/95 text-white font-bold cursor-pointer border-none">
                    Save Changes
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── MODAL: INTERACTIVE RESOURCE ANALYTICS ──────────────────────────────────── */}
      <AnimatePresence>
        {selectedResourceForAnalytics && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-card border border-border shadow-floating max-w-lg w-full rounded-modal p-6 text-foreground text-left"
            >
              <div className="flex justify-between items-center border-b border-border/40 pb-3 mb-4 select-none">
                <div className="space-y-0.5">
                  <h3 className="font-heading font-extrabold text-sm uppercase text-foreground">Resource Analytics Report</h3>
                  <p className="text-[10px] text-muted-foreground font-bold">Item: {selectedResourceForAnalytics.title}</p>
                </div>
                <button
                  onClick={() => setSelectedResourceForAnalytics(null)}
                  className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground cursor-pointer bg-transparent border-none"
                >
                  <X size={15} />
                </button>
              </div>

              <div className="space-y-6 text-xs font-bold">
                {/* 3 Metrics Cards */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-muted/10 border border-border/50 p-3 rounded-lg text-left">
                    <span className="text-[8.5px] font-bold text-muted-foreground uppercase">Views</span>
                    <p className="text-lg font-extrabold text-foreground mt-0.5">{selectedResourceForAnalytics.views.toLocaleString()}</p>
                  </div>
                  <div className="bg-muted/10 border border-border/50 p-3 rounded-lg text-left">
                    <span className="text-[8.5px] font-bold text-muted-foreground uppercase">Orders</span>
                    <p className="text-lg font-extrabold text-foreground mt-0.5">{selectedResourceForAnalytics.downloads.toLocaleString()}</p>
                  </div>
                  <div className="bg-muted/10 border border-border/50 p-3 rounded-lg text-left">
                    <span className="text-[8.5px] font-bold text-muted-foreground uppercase">Earnings</span>
                    <p className="text-lg font-extrabold text-emerald-500 mt-0.5">₹{selectedResourceForAnalytics.earnings.toLocaleString()}</p>
                  </div>
                </div>

                <div className="space-y-2 border-t border-border/20 pt-4">
                  <h4 className="text-[10px] font-black uppercase text-muted-foreground tracking-wider select-none">Audience Performance Metrics</h4>
                  <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-muted-foreground">
                    <div className="flex justify-between border-b border-border/20 pb-1.5">
                      <span>Completion / Watch Rate:</span>
                      <strong className="text-foreground">82%</strong>
                    </div>
                    <div className="flex justify-between border-b border-border/20 pb-1.5">
                      <span>Average User Rating:</span>
                      <strong className="text-amber-500">4.7 ★</strong>
                    </div>
                    <div className="flex justify-between border-b border-border/20 pb-1.5">
                      <span>Top Traffic Source:</span>
                      <strong className="text-foreground">Course Students</strong>
                    </div>
                    <div className="flex justify-between border-b border-border/20 pb-1.5">
                      <span>Monetization Tier:</span>
                      <strong className="text-foreground">{selectedResourceForAnalytics.pricing}</strong>
                    </div>
                  </div>
                </div>

                {/* SVG Performance Line graph */}
                <div className="space-y-1 border-t border-border/20 pt-4">
                  <h4 className="text-[10px] font-black uppercase text-muted-foreground tracking-wider select-none">Resource Downloads Trend</h4>
                  <ResourcePerformanceChart timeFilter="7d" />
                </div>

                <div className="flex justify-end pt-2 border-t border-border/40 select-none">
                  <Button size="sm" onClick={() => setSelectedResourceForAnalytics(null)} className="bg-primary hover:bg-primary/95 text-white font-bold cursor-pointer border-none">
                    Close Panel
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── MODAL: CREATE SHORT FROM RECORDING ─────────────────────────────────────── */}
      <AnimatePresence>
        {selectedResourceForShort && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-card border border-border shadow-floating max-w-lg w-full rounded-modal p-6 text-foreground text-left"
            >
              <div className="flex justify-between items-center border-b border-border/40 pb-3 mb-4 select-none">
                <div className="space-y-0.5">
                  <h3 className="font-heading font-extrabold text-sm uppercase text-foreground">Create Educational Short</h3>
                  <p className="text-[10px] text-muted-foreground font-bold">Source: {selectedResourceForShort.title}</p>
                </div>
                <button
                  onClick={() => setSelectedResourceForShort(null)}
                  className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground cursor-pointer bg-transparent border-none"
                >
                  <X size={15} />
                </button>
              </div>

              <form onSubmit={handleCreateShortSubmit} className="space-y-4 text-xs font-bold">
                <div className="flex flex-col gap-1">
                  <label className="text-muted-foreground uppercase text-[9px]">Short Clip Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Loop iteration trick in Python"
                    value={shortsForm.title}
                    onChange={e => setShortsForm({ ...shortsForm, title: e.target.value })}
                    className="px-3 py-2 bg-muted/20 border border-border focus:border-primary/45 rounded-xl outline-none text-foreground font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-muted-foreground uppercase text-[9px]">Clip Start Time</label>
                    <input
                      type="text"
                      placeholder="00:00"
                      value={shortsForm.clipStart}
                      onChange={e => setShortsForm({ ...shortsForm, clipStart: e.target.value })}
                      className="px-3 py-2 bg-muted/20 border border-border rounded-xl outline-none text-foreground font-bold text-center"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-muted-foreground uppercase text-[9px]">Clip End Time (Max 60s)</label>
                    <input
                      type="text"
                      placeholder="00:59"
                      value={shortsForm.clipEnd}
                      onChange={e => setShortsForm({ ...shortsForm, clipEnd: e.target.value })}
                      className="px-3 py-2 bg-muted/20 border border-border rounded-xl outline-none text-foreground font-bold text-center"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-muted-foreground uppercase text-[9px]">Objective / Description</label>
                  <textarea
                    placeholder="Explain what concept this short educational clip covers..."
                    value={shortsForm.description}
                    onChange={e => setShortsForm({ ...shortsForm, description: e.target.value })}
                    className="px-3 py-2 bg-muted/20 border border-border focus:border-primary/45 rounded-xl outline-none text-foreground font-semibold min-h-[60px]"
                  />
                </div>

                <p className="text-[10px] text-muted-foreground font-semibold leading-relaxed border-t border-border/20 pt-3">
                  This clip will be processed from the recording and added directly to your Resource Library as a 60s educational Short.
                </p>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/40 select-none">
                  <Button variant="outline" size="sm" type="button" onClick={() => setSelectedResourceForShort(null)} className="font-bold cursor-pointer">
                    Cancel
                  </Button>
                  <Button size="sm" type="submit" className="bg-primary hover:bg-primary/95 text-white font-bold cursor-pointer border-none">
                    Generate Clip
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── MODAL: PREVIEW RESOURCE ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedResourceForPreview && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-card border border-border shadow-floating max-w-2xl w-full rounded-modal p-6 text-foreground text-left"
            >
              <div className="flex justify-between items-center border-b border-border/40 pb-3 mb-4 select-none">
                <div className="space-y-0.5">
                  <span className="text-[9px] font-black uppercase text-primary tracking-wider">{selectedResourceForPreview.type} Preview</span>
                  <h3 className="font-heading font-extrabold text-sm text-foreground">{selectedResourceForPreview.title}</h3>
                </div>
                <button
                  onClick={() => setSelectedResourceForPreview(null)}
                  className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground cursor-pointer bg-transparent border-none"
                >
                  <X size={15} />
                </button>
              </div>

              <div className="space-y-4">
                {selectedResourceForPreview.type === "Video" || selectedResourceForPreview.type === "Short" ? (
                  <div className="relative w-full aspect-video bg-slate-900 border border-border/80 rounded-xl flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/[0.01] opacity-50" />
                    <div className="flex flex-col items-center justify-center gap-3 text-center z-10 p-6">
                      <div className="w-14 h-14 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 shadow-premium group">
                        <Play size={20} className="fill-rose-500 ml-0.5 group-hover:scale-105 transition" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black uppercase text-foreground">Play Video Preview</h4>
                        <p className="text-[10px] text-muted-foreground mt-1 max-w-sm leading-relaxed">
                          Duration: {selectedResourceForPreview.duration || "N/A"} • Format: {selectedResourceForPreview.format}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-10 border border-border/85 bg-muted/10 rounded-xl text-center flex flex-col items-center gap-3">
                    <FileText size={40} className="text-primary" />
                    <div>
                      <h4 className="text-xs font-black uppercase text-foreground">Document Details</h4>
                      <p className="text-[10.5px] text-muted-foreground mt-1 max-w-sm leading-relaxed">
                        This {selectedResourceForPreview.format} document is available for download or attachment in courses.
                      </p>
                    </div>
                  </div>
                )}

                {selectedResourceForPreview.description && (
                  <div className="bg-muted/10 p-4 border border-border/40 rounded-xl text-xs">
                    <span className="text-[9px] font-black uppercase text-muted-foreground block mb-1">Description</span>
                    <p className="text-muted-foreground font-semibold leading-relaxed">{selectedResourceForPreview.description}</p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-border/40 select-none">
                  <span className="text-[10px] font-bold text-muted-foreground">Course: {selectedResourceForPreview.courseName}</span>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setSelectedResourceForPreview(null)} className="font-bold cursor-pointer">
                      Close
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedResourceForPreview(null);
                        toast.success("Document downloaded (simulated).");
                      }}
                      className="bg-primary hover:bg-primary/95 text-white font-bold cursor-pointer border-none"
                    >
                      Download Resource
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});
