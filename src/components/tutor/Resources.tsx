"use client";

import React, { useMemo, useState } from "react";
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
  BarChart3
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

type ResourceCategory =
  | "Notes"
  | "Presentations"
  | "PDFs"
  | "Assignments"
  | "Sample Papers"
  | "Code Files"
  | "Videos"
  | "Images"
  | "External Links"
  | "Templates"
  | "Miscellaneous";

interface ExtendedMediaFile extends MediaFile {
  folderId?: string;
  category: ResourceCategory;
  url?: string;
  uploadedAt: string;
  course: string;
  batch: string;
  downloadCount: number;
  visibility: "Draft" | "Published";
  tags: string[];
  description?: string;
  allowDownload: boolean;
  version: string;
  notes?: string;
  versions?: Array<{
    version: string;
    updatedAt: string;
    updatedBy: string;
  }>;
}

export const Resources = React.memo(function Resources({
  platformConfig,
}: ResourcesProps) {
  // Tabs Navigation
  const [activeModuleTab, setActiveModuleTab] = useState<"library" | "analytics">("library");
  const [libraryView, setLibraryView] = useState<"folders" | "all-cards">("folders");

  // Folders list state
  const [folders, setFolders] = useState<ResourceFolder[]>([
    { id: "fld-notes", name: "Syllabus & Lecture Notes", filesCount: 3 },
    { id: "fld-videos", name: "Recorded Video Materials", filesCount: 2 },
    { id: "fld-assignments", name: "Weekly Assignments Archive", filesCount: 2 }
  ]);

  // Extended resources state
  const [resources, setResources] = useState<ExtendedMediaFile[]>([
    {
      id: "res-1",
      name: "linear_algebra_syllabus.pdf",
      size: "2.4 MB",
      type: "PDF",
      url: "#",
      folderId: "fld-notes",
      category: "PDFs",
      uploadedAt: "2026-07-28",
      course: "Linear Algebra & Applications",
      batch: "Batch A",
      downloadCount: 45,
      visibility: "Published",
      tags: ["Syllabus", "Math", "Intro"],
      description: "Introductory course syllabus mapping out modules 1-6.",
      allowDownload: true,
      version: "1.2",
      notes: "Reviewed and approved by academic board.",
      versions: [
        { version: "1.2", updatedAt: "2026-07-28", updatedBy: "Tutor" },
        { version: "1.1", updatedAt: "2026-07-25", updatedBy: "Tutor" },
        { version: "1.0", updatedAt: "2026-07-20", updatedBy: "Tutor" }
      ]
    },
    {
      id: "res-2",
      name: "intro_vectors_class.mp4",
      size: "48.0 MB",
      type: "Video",
      url: "#",
      folderId: "fld-videos",
      category: "Videos",
      uploadedAt: "2026-07-27",
      course: "Linear Algebra & Applications",
      batch: "Batch A",
      downloadCount: 38,
      visibility: "Published",
      tags: ["Lecture", "Vectors", "Recorded"],
      description: "Class recording explaining vectors additions and dot products.",
      allowDownload: true,
      version: "1.0",
      notes: "Original raw upload.",
      versions: [{ version: "1.0", updatedAt: "2026-07-27", updatedBy: "Tutor" }]
    },
    {
      id: "res-3",
      name: "react_state_guide.pdf",
      size: "3.5 MB",
      type: "PDF",
      url: "#",
      folderId: "fld-notes",
      category: "PDFs",
      uploadedAt: "2026-07-26",
      course: "Full-Stack Web Dev Bootcamp",
      batch: "Batch B",
      downloadCount: 72,
      visibility: "Published",
      tags: ["React", "State", "Frontend"],
      description: "Comprehensive tutorial explaining redux, zustand, and context.",
      allowDownload: true,
      version: "2.0",
      notes: "Updated layout structure.",
      versions: [
        { version: "2.0", updatedAt: "2026-07-26", updatedBy: "Tutor" },
        { version: "1.0", updatedAt: "2026-07-15", updatedBy: "Tutor" }
      ]
    },
    {
      id: "res-4",
      name: "node_api_boilerplate.zip",
      size: "12.4 MB",
      type: "ZIP",
      url: "#",
      folderId: "fld-assignments",
      category: "Code Files",
      uploadedAt: "2026-07-25",
      course: "Full-Stack Web Dev Bootcamp",
      batch: "Batch B",
      downloadCount: 88,
      visibility: "Published",
      tags: ["NodeJS", "Express", "API"],
      description: "Starter repository bundle containing database controllers.",
      allowDownload: true,
      version: "1.0",
      notes: "Initial codebase draft.",
      versions: [{ version: "1.0", updatedAt: "2026-07-25", updatedBy: "Tutor" }]
    },
    {
      id: "res-5",
      name: "homework_assignment_1.docx",
      size: "1.8 MB",
      type: "DOCX",
      url: "#",
      folderId: "fld-assignments",
      category: "Assignments",
      uploadedAt: "2026-07-24",
      course: "Linear Algebra & Applications",
      batch: "Batch A",
      downloadCount: 29,
      visibility: "Draft",
      tags: ["Homework", "Problems"],
      description: "Symmetric matrices homework assignment draft.",
      allowDownload: true,
      version: "1.0",
      notes: "Awaiting final review.",
      versions: [{ version: "1.0", updatedAt: "2026-07-24", updatedBy: "Tutor" }]
    }
  ]);

  // Current folder navigation state: null is root
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);

  // Search & Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [courseFilter, setCourseFilter] = useState("All");
  const [batchFilter, setBatchFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [visibilityFilter, setVisibilityFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest");

  // Modals & Dialogs state
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [previewResource, setPreviewResource] = useState<ExtendedMediaFile | null>(null);
  
  // Renaming folder trigger
  const [renamingFolder, setRenamingFolder] = useState<ResourceFolder | null>(null);
  const [renameFolderInput, setRenameFolderInput] = useState("");

  // Upload Form state
  const [uploadForm, setUploadForm] = useState({
    name: "",
    course: "Linear Algebra & Applications",
    batch: "Batch A",
    category: "Notes" as ResourceCategory,
    description: "",
    tags: "",
    externalUrl: "",
    visibility: "Published" as "Draft" | "Published",
    allowDownload: true
  });

  // Calculate Aggregates
  const totalResources = resources.length;
  const totalStorageUsedMB = useMemo(() => {
    return resources.reduce((acc, curr) => {
      const val = parseFloat(curr.size);
      return acc + (isNaN(val) ? 0 : val);
    }, 0);
  }, [resources]);
  const allowedStorageLimit = platformConfig.storageLimit || 500;
  const usagePercentage = Math.min((totalStorageUsedMB / allowedStorageLimit) * 100, 100);

  const stats = useMemo(() => {
    const distinctCourses = Array.from(new Set(resources.map(r => r.course))).length;
    const sharedResourcesCount = resources.filter(r => r.visibility === "Published").length;
    const totalDownloads = resources.reduce((sum, curr) => sum + curr.downloadCount, 0);
    const recentUploadsCount = resources.filter(r => {
      const diff = Date.now() - new Date(r.uploadedAt).getTime();
      return diff < 7 * 24 * 60 * 60 * 1000;
    }).length;

    return {
      distinctCourses,
      sharedResourcesCount,
      totalDownloads,
      recentUploadsCount
    };
  }, [resources]);

  // Filters logic
  const filteredResources = useMemo(() => {
    return resources
      .filter(res => {
        const matchesFolder = libraryView === "all-cards" || (currentFolderId ? res.folderId === currentFolderId : !res.folderId);
        const matchesSearch = res.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              res.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesCourse = courseFilter === "All" || res.course === courseFilter;
        const matchesBatch = batchFilter === "All" || res.batch === batchFilter;
        const matchesCategory = categoryFilter === "All" || res.category === categoryFilter;
        const matchesType = typeFilter === "All" || res.type === typeFilter;
        const matchesVisibility = visibilityFilter === "All" || res.visibility === visibilityFilter;

        return matchesFolder && matchesSearch && matchesCourse && matchesBatch && matchesCategory && matchesType && matchesVisibility;
      })
      .sort((a, b) => {
        if (sortBy === "newest") return b.uploadedAt.localeCompare(a.uploadedAt);
        if (sortBy === "oldest") return a.uploadedAt.localeCompare(b.uploadedAt);
        if (sortBy === "downloads") return b.downloadCount - a.downloadCount;
        if (sortBy === "size") {
          const sizeA = parseFloat(a.size) || 0;
          const sizeB = parseFloat(b.size) || 0;
          return sizeB - sizeA;
        }
        return 0;
      });
  }, [resources, libraryView, currentFolderId, searchQuery, courseFilter, batchFilter, categoryFilter, typeFilter, visibilityFilter, sortBy]);

  // Folders to render at Root
  const visibleFolders = useMemo(() => {
    if (libraryView === "all-cards" || currentFolderId !== null) return [];
    return folders.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [folders, libraryView, currentFolderId, searchQuery]);

  // Folder Breadcrumb
  const currentFolderName = useMemo(() => {
    if (!currentFolderId) return "Root Resource Library";
    return folders.find(f => f.id === currentFolderId)?.name || "Folder Details";
  }, [currentFolderId, folders]);

  // Create folder handler
  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    const newFolder: ResourceFolder = {
      id: `fld-${Date.now()}`,
      name: newFolderName.trim(),
      filesCount: 0
    };

    setFolders(prev => [...prev, newFolder]);
    setNewFolderName("");
    setIsCreatingFolder(false);
    toast.success(`Folder "${newFolder.name}" created successfully.`);
  };

  // Rename folder handler
  const handleRenameFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!renamingFolder || !renameFolderInput.trim()) return;

    setFolders(prev => prev.map(f => f.id === renamingFolder.id ? { ...f, name: renameFolderInput.trim() } : f));
    setRenamingFolder(null);
    toast.success("Folder renamed successfully.");
  };

  // Delete folder handler
  const handleDeleteFolder = (id: string) => {
    setFolders(prev => prev.filter(f => f.id !== id));
    setResources(prev => prev.map(r => r.folderId === id ? { ...r, folderId: undefined } : r));
    toast.success("Folder deleted. File items moved to main root directory.");
  };

  // Create/Upload file handler
  const handleUploadResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadForm.name.trim()) return;

    const fileType = uploadForm.category === "Videos" ? "Video" : uploadForm.category === "Images" ? "Image" : "PDF";

    const newFile: ExtendedMediaFile = {
      id: `res-${Date.now()}`,
      name: uploadForm.name.trim().toLowerCase().endsWith(".pdf") || uploadForm.category !== "PDFs"
        ? uploadForm.name.trim()
        : `${uploadForm.name.trim()}.pdf`,
      size: `${(Math.random() * 4 + 1.2).toFixed(1)} MB`,
      type: fileType,
      url: uploadForm.externalUrl || "#",
      folderId: currentFolderId || undefined,
      category: uploadForm.category,
      uploadedAt: new Date().toISOString().split("T")[0],
      course: uploadForm.course,
      batch: uploadForm.batch,
      downloadCount: 0,
      visibility: uploadForm.visibility,
      tags: uploadForm.tags.split(",").map(t => t.trim()).filter(Boolean),
      description: uploadForm.description,
      allowDownload: uploadForm.allowDownload,
      version: "1.0",
      notes: "First draft version uploaded.",
      versions: [{ version: "1.0", updatedAt: new Date().toISOString().split("T")[0], updatedBy: "Tutor" }]
    };

    setResources(prev => [newFile, ...prev]);

    // Update folder counts
    if (currentFolderId) {
      setFolders(prev => prev.map(f => f.id === currentFolderId ? { ...f, filesCount: f.filesCount + 1 } : f));
    }

    setIsUploading(false);
    setUploadForm({
      name: "",
      course: "Linear Algebra & Applications",
      batch: "Batch A",
      category: "Notes",
      description: "",
      tags: "",
      externalUrl: "",
      visibility: "Published",
      allowDownload: true
    });
    toast.success("New LMS learning material uploaded and synchronized!");
  };

  // Restore previous version
  const handleRestoreVersion = (fileId: string, verStr: string) => {
    setResources(prev =>
      prev.map(r => {
        if (r.id !== fileId) return r;
        return {
          ...r,
          version: verStr,
          notes: `Restored back to version v${verStr}`
        };
      })
    );
    toast.success(`Restored material version to v${verStr}!`);
    setPreviewResource(null);
  };

  // Delete Resource Handler
  const handleDeleteResource = (id: string) => {
    const targetFile = resources.find(r => r.id === id);
    setResources(prev => prev.filter(r => r.id !== id));
    if (targetFile?.folderId) {
      setFolders(prev =>
        prev.map(f => (f.id === targetFile.folderId ? { ...f, filesCount: Math.max(0, f.filesCount - 1) } : f))
      );
    }
    setPreviewResource(null);
    toast.success("Resource deleted permanently.");
  };

  // Move resource simulated action
  const handleMoveResource = (fileId: string, folderId: string | undefined) => {
    setResources(prev =>
      prev.map(r => {
        if (r.id !== fileId) return r;
        
        // Update counts
        if (r.folderId) {
          setFolders(fPrev => fPrev.map(f => f.id === r.folderId ? { ...f, filesCount: Math.max(0, f.filesCount - 1) } : f));
        }
        if (folderId) {
          setFolders(fPrev => fPrev.map(f => f.id === folderId ? { ...f, filesCount: f.filesCount + 1 } : f));
        }

        return { ...r, folderId };
      })
    );
    toast.success("Resource moved successfully.");
  };

  return (
    <motion.div
      key="tutor-resources-overhaul"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="space-y-6"
    >
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground font-heading">Resource Library Workspace</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Share handouts, slide decks, assignments, and links with cohorts.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setIsCreatingFolder(true)}
            size="sm"
            variant="outline"
            className="h-9 gap-1 font-semibold"
          >
            <FolderPlus size={14} /> Create Folder
          </Button>
          <Button
            onClick={() => setIsUploading(true)}
            size="sm"
            className="h-9 gap-1.5 bg-primary hover:bg-primary/95 text-white font-semibold shadow-sm"
          >
            <Upload size={14} /> Upload Resource
          </Button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {[
          { label: "Total Resources", value: totalResources, icon: FileText },
          { label: "Storage Used", value: `${totalStorageUsedMB.toFixed(1)} MB`, icon: HardDrive },
          { label: "Courses Mapped", value: stats.distinctCourses, icon: Share2 },
          { label: "Recent Uploads", value: stats.recentUploadsCount, icon: Clock },
          { label: "Shared Resources", value: stats.sharedResourcesCount, icon: FolderOpen },
          { label: "Student Downloads", value: stats.totalDownloads, icon: Download }
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <Card key={idx} className="p-3 border border-border bg-card shadow-sm flex items-center justify-between min-w-0">
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-muted-foreground truncate">{item.label}</p>
                <h4 className="text-lg font-extrabold text-foreground mt-0.5">{item.value}</h4>
              </div>
              <Icon size={16} className="text-primary shrink-0 ml-2" />
            </Card>
          );
        })}
      </div>

      {/* Navigation Module Tab buttons */}
      <div className="flex gap-1.5 border-b border-border/40 pb-2 font-semibold">
        {[
          { id: "library", label: "Resources Explorer" },
          { id: "analytics", label: "Library Reports & Usage" }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveModuleTab(tab.id as any)}
            className={`px-3 py-1.5 text-xs border-b-2 transition-all cursor-pointer ${
              activeModuleTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT: RESOURCES EXPLORER */}
      {activeModuleTab === "library" && (
        <div className="space-y-5">
          {/* Filters card */}
          <Card variant="glass" className="p-4 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search file name or tags..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="h-9 w-full pl-9 pr-3 rounded-button border border-border bg-card/60 text-xs font-semibold text-foreground focus:outline-none"
              />
            </div>

            <select
              value={courseFilter}
              onChange={e => setCourseFilter(e.target.value)}
              className="h-9 rounded-button border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
            >
              <option value="All">All Courses</option>
              <option value="Linear Algebra & Applications">Linear Algebra & Applications</option>
              <option value="Full-Stack Web Dev Bootcamp">Full-Stack Web Dev Bootcamp</option>
            </select>

            <select
              value={batchFilter}
              onChange={e => setBatchFilter(e.target.value)}
              className="h-9 rounded-button border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
            >
              <option value="All">All Batches</option>
              <option value="Batch A">Batch A</option>
              <option value="Batch B">Batch B</option>
            </select>

            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="h-9 rounded-button border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
            >
              <option value="All">All Categories</option>
              <option value="Notes">Notes</option>
              <option value="PDFs">PDFs</option>
              <option value="Assignments">Assignments</option>
              <option value="Videos">Videos</option>
              <option value="Code Files">Code Files</option>
            </select>

            <select
              value={visibilityFilter}
              onChange={e => setVisibilityFilter(e.target.value)}
              className="h-9 rounded-button border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
            >
              <option value="All">All Visibility</option>
              <option value="Published">Published</option>
              <option value="Draft">Draft</option>
            </select>

            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="h-9 rounded-button border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none ml-auto"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="downloads">Most Downloaded</option>
              <option value="size">Largest File</option>
            </select>
          </Card>

          {/* Directory Explorer / Grid view switches */}
          <div className="flex items-center justify-between text-xs px-1">
            <div className="flex items-center gap-1 text-[11px] font-bold text-muted-foreground">
              {currentFolderId && (
                <button
                  onClick={() => setCurrentFolderId(null)}
                  className="hover:text-foreground flex items-center gap-0.5 cursor-pointer font-extrabold"
                >
                  <ArrowLeft size={12} /> Back to Root
                </button>
              )}
              {currentFolderId && <ChevronRight size={12} className="opacity-40" />}
              <span className="text-foreground">{currentFolderName}</span>
            </div>
            
            <div className="flex bg-muted/40 p-0.5 rounded-button text-[10px] font-bold">
              <button
                onClick={() => { setLibraryView("folders"); setCurrentFolderId(null); }}
                className={`px-2.5 py-1 rounded-button transition-colors ${libraryView === "folders" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                Folders directory
              </button>
              <button
                onClick={() => setLibraryView("all-cards")}
                className={`px-2.5 py-1 rounded-button transition-colors ${libraryView === "all-cards" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                All Resources cards
              </button>
            </div>
          </div>

          {/* Root Directory Folders list */}
          {visibleFolders.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {visibleFolders.map(folder => (
                <Card
                  key={folder.id}
                  onClick={() => setCurrentFolderId(folder.id)}
                  className="p-4 border border-border bg-card hover:border-primary/30 hover:bg-muted/15 transition-all cursor-pointer flex items-center justify-between shadow-sm"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-button bg-primary/10 text-primary shrink-0">
                      <FolderOpen size={18} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-foreground leading-tight truncate">{folder.name}</h4>
                      <p className="text-[10px] text-muted-foreground mt-0.5 font-semibold">
                        {folder.filesCount} resources
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => { setRenamingFolder(folder); setRenameFolderInput(folder.name); }}
                      className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground cursor-pointer"
                      title="Rename folder"
                    >
                      <Edit2 size={11} />
                    </button>
                    <button
                      onClick={() => handleDeleteFolder(folder.id)}
                      className="p-1 hover:bg-rose-500/10 rounded text-rose-500 cursor-pointer"
                      title="Delete folder"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Directory Files cards */}
          {filteredResources.length === 0 && visibleFolders.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-card border border-border/50 text-muted-foreground italic text-xs">
              No learning materials matching filters found.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredResources.map(file => (
                <div
                  key={file.id}
                  draggable
                  onDragEnd={() => toast.success(`Simulated dragging "${file.name}" between directories`)}
                  className="card-surface p-4 rounded-card border border-border/60 shadow-soft flex flex-col justify-between gap-3 hover:border-primary/20 transition-all cursor-grab"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-2 rounded bg-muted/40 text-primary border border-border/30 shrink-0">
                          {file.type === "Video" ? (
                            <Video size={16} />
                          ) : file.category === "Code Files" ? (
                            <FileText size={16} className="text-emerald-500" />
                          ) : (
                            <File size={16} />
                          )}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-foreground truncate max-w-[180px]">{file.name}</h4>
                          <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{file.course}</p>
                        </div>
                      </div>
                      <span className={`text-[8px] font-extrabold uppercase px-2 py-0.5 rounded border shrink-0 ${
                        file.visibility === "Published" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-muted border-border text-muted-foreground"
                      }`}>
                        {file.visibility}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      <span className="bg-primary/5 text-primary px-2 py-0.5 rounded text-[8px] font-extrabold uppercase">
                        {file.category}
                      </span>
                      <span className="bg-muted text-muted-foreground px-2 py-0.5 rounded text-[8px] font-extrabold uppercase">
                        {file.batch}
                      </span>
                    </div>

                    <p className="text-[10px] text-muted-foreground font-semibold leading-relaxed line-clamp-2">
                      {file.description || "No file description provided."}
                    </p>

                    {/* Tag list */}
                    {file.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {file.tags.map(t => (
                          <span key={t} className="bg-card border border-border/50 text-muted-foreground/95 text-[8px] px-1.5 py-0.5 rounded-full font-bold">
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="border-t border-border/40 pt-3 flex items-center justify-between text-[9px] text-muted-foreground font-semibold">
                    <div className="flex gap-3">
                      <span>Size: {file.size}</span>
                      <span>Downloads: {file.downloadCount}</span>
                    </div>
                    <span>v{file.version}</span>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPreviewResource(file)}
                      className="h-7 text-[10px] font-bold flex-1"
                    >
                      <Eye size={11} className="mr-1" /> Preview
                    </Button>
                    <select
                      onChange={e => handleMoveResource(file.id, e.target.value || undefined)}
                      value={file.folderId || ""}
                      className="h-7 border border-border bg-card rounded text-[9px] px-1 font-bold text-muted-foreground focus:outline-none"
                    >
                      <option value="">Move to: Root</option>
                      {folders.map(f => (
                        <option key={f.id} value={f.id}>{f.name}</option>
                      ))}
                    </select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteResource(file.id)}
                      className="h-7 text-[10px] font-bold text-rose-500 hover:bg-rose-500/5 px-2.5"
                    >
                      <Trash2 size={11} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: ANALYTICS & USAGE */}
      {activeModuleTab === "analytics" && (
        <div className="space-y-6">
          {/* Storage capacity detail card */}
          <Card variant="glass" className="p-5 space-y-4">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <HardDrive size={14} /> Storage Resource Quota Usage
              </span>
              <span className="text-foreground">{totalStorageUsedMB.toFixed(1)} MB used / {allowedStorageLimit} MB limit</span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${usagePercentage}%` }} />
            </div>
            <p className="text-[10px] text-muted-foreground">
              Utilizing {usagePercentage.toFixed(1)}% of your allowed bandwidth/storage capacity.
            </p>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-5 border border-border bg-card shadow-sm space-y-4">
              <h4 className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1.5 border-b border-border/60 pb-2">
                <BarChart3 size={13} className="text-primary" /> Download Trends & Metrics
              </h4>
              <div className="space-y-3.5 text-xs font-semibold">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Most Downloaded Resource</span>
                  <span className="text-primary font-bold">node_api_boilerplate.zip (88 DLs)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Recently Accessed handout</span>
                  <span className="text-foreground">linear_algebra_syllabus.pdf (10 mins ago)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Student Download Rate</span>
                  <span className="text-foreground">28 downloads / week</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Storage by Full-Stack Web Course</span>
                  <span className="text-foreground">15.9 MB</span>
                </div>
              </div>
            </Card>

            <Card className="p-5 border border-border bg-card shadow-sm space-y-4">
              <h4 className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1.5 border-b border-border/60 pb-2">
                <FolderOpen size={13} className="text-primary" /> Resource Distribution
              </h4>
              <div className="space-y-3.5 text-xs font-semibold">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">PDF Handouts count</span>
                  <span className="text-foreground font-bold">2 files</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Videos / Recorded Sessions</span>
                  <span className="text-foreground font-bold">1 file</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Assignments / Code archives</span>
                  <span className="text-foreground font-bold">2 files</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Templates / Links</span>
                  <span className="text-foreground font-bold">0 files</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* PREVIEW SIDE DRAWER */}
      <AnimatePresence>
        {previewResource && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/35 backdrop-blur-sm"
              onClick={() => setPreviewResource(null)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              className="fixed right-0 top-0 bottom-0 w-full sm:w-[440px] bg-card border-l border-border z-50 overflow-y-auto shadow-floating flex flex-col justify-between"
            >
              <div className="p-5 space-y-5 overflow-y-auto flex-1 text-xs font-semibold">
                <div className="flex items-center justify-between border-b border-border/40 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded bg-primary/10 text-primary flex items-center justify-center font-bold">
                      {previewResource.type === "Video" ? <Video size={18} /> : <FileText size={18} />}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-foreground leading-tight truncate max-w-[240px]">
                        {previewResource.name}
                      </h3>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Uploaded on: {previewResource.uploadedAt}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setPreviewResource(null)}
                    aria-label="Close"
                    className="text-muted-foreground hover:text-foreground cursor-pointer p-0.5 rounded"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* File Preview Mock Container */}
                  <div className="p-3 bg-muted/30 border border-border/40 rounded-lg flex flex-col items-center justify-center min-h-[160px] text-center">
                    {previewResource.type === "Video" ? (
                      <div className="w-full space-y-1.5">
                        <div className="aspect-video w-full rounded bg-black flex items-center justify-center relative">
                          <Play size={28} className="text-white fill-white hover:scale-110 transition-transform cursor-pointer" />
                        </div>
                        <p className="text-[9px] text-muted-foreground">Interactive Video Lecture player</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <FileText size={40} className="text-primary mx-auto" />
                        <div>
                          <p className="text-[11px] text-foreground font-bold">{previewResource.name}</p>
                          <p className="text-[9px] text-muted-foreground">Preview simulation of PDF / Document</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-3 bg-muted/20 border border-border/40 rounded space-y-2">
                    <p className="text-[9px] font-bold uppercase text-muted-foreground">Resource Details</p>
                    <div className="space-y-1.5 text-[10px]">
                      <div className="flex justify-between"><span className="text-muted-foreground">Course:</span><span className="text-foreground">{previewResource.course}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Batch:</span><span className="text-foreground">{previewResource.batch}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Category:</span><span className="text-foreground">{previewResource.category}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">File Size:</span><span className="text-foreground">{previewResource.size}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Downloads count:</span><span className="text-foreground">{previewResource.downloadCount}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Version:</span><span className="text-foreground">v{previewResource.version}</span></div>
                    </div>
                  </div>

                  {previewResource.description && (
                    <div className="p-3 bg-muted/20 border border-border/40 rounded space-y-1">
                      <p className="text-[9px] font-bold uppercase text-muted-foreground">Description Notes</p>
                      <p className="text-[10px] text-foreground/90 font-medium leading-relaxed">{previewResource.description}</p>
                    </div>
                  )}

                  {/* Version History section */}
                  <div className="p-3 bg-muted/20 border border-border/40 rounded space-y-2">
                    <p className="text-[9px] font-bold uppercase text-muted-foreground flex items-center gap-1">
                      <History size={11} className="text-primary" /> Version History
                    </p>
                    <div className="space-y-1.5">
                      {previewResource.versions?.map((ver, idx) => (
                        <div key={idx} className="flex justify-between items-center text-[10px] py-1 border-b border-border/10 last:border-0">
                          <div>
                            <span className="font-bold text-foreground">v{ver.version}</span>
                            <span className="text-[9px] text-muted-foreground ml-1.5">{ver.updatedAt}</span>
                          </div>
                          {ver.version !== previewResource.version ? (
                            <button
                              onClick={() => handleRestoreVersion(previewResource.id, ver.version)}
                              className="text-primary hover:underline font-bold text-[9px]"
                            >
                              Restore
                            </button>
                          ) : (
                            <span className="text-emerald-500 font-bold text-[9px]">Active</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Share Cohort Configuration form in Drawer */}
                  <div className="p-3 bg-muted/20 border border-border/40 rounded space-y-2">
                    <p className="text-[9px] font-bold uppercase text-muted-foreground flex items-center gap-1">
                      <Share2 size={11} className="text-primary" /> Share & visibility settings
                    </p>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer font-medium text-[10px]">
                        <input
                          type="checkbox"
                          checked={previewResource.allowDownload}
                          onChange={e => {
                            setResources(prev => prev.map(r => r.id === previewResource.id ? { ...r, allowDownload: e.target.checked } : r));
                            toast.success("Download permissions updated.");
                          }}
                          className="rounded border-border text-primary"
                        />
                        Allow students to download
                      </label>
                      <div className="flex gap-2 items-center text-[9px] bg-card p-1.5 rounded border border-border/40 text-muted-foreground">
                        {previewResource.allowDownload ? (
                          <span className="text-emerald-500 flex items-center gap-0.5"><Unlock size={10} /> Downloads Unlocked</span>
                        ) : (
                          <span className="text-rose-500 flex items-center gap-0.5"><Lock size={10} /> Downloads Locked</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5 border-t border-border/40 flex flex-col gap-2 bg-muted/10">
                <Button
                  onClick={() => {
                    toast.success(`Resource ZIP downloaded: ${previewResource.name}`);
                    setPreviewResource(null);
                  }}
                  className="w-full h-9 text-xs font-bold bg-primary text-white gap-1.5"
                >
                  <Download size={13} /> Download File
                </Button>
                <Button
                  onClick={() => setPreviewResource(null)}
                  variant="outline"
                  className="w-full h-9 text-xs font-bold"
                >
                  Close Workspace
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* CREATE FOLDER MODAL */}
      <AnimatePresence>
        {isCreatingFolder && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/35 backdrop-blur-sm"
              onClick={() => setIsCreatingFolder(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 m-auto z-50 h-fit w-[90%] max-w-sm bg-card border border-border rounded-card p-5 shadow-floating"
            >
              <form onSubmit={handleCreateFolder} className="space-y-4">
                <div className="flex items-center justify-between border-b border-border/60 pb-2">
                  <h4 className="text-xs font-bold uppercase text-foreground">
                    Create Folder
                  </h4>
                  <button type="button" onClick={() => setIsCreatingFolder(false)} className="text-muted-foreground">
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-1 text-xs">
                  <label className="font-bold text-foreground">Folder Name *</label>
                  <input
                    type="text"
                    required
                    value={newFolderName}
                    onChange={e => setNewFolderName(e.target.value)}
                    placeholder="e.g. Code Repositories"
                    className="h-9 w-full rounded border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-1">
                  <Button type="submit" className="h-9 text-xs bg-primary text-white">
                    Create Folder
                  </Button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* RENAME FOLDER MODAL */}
      <AnimatePresence>
        {renamingFolder && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/35 backdrop-blur-sm"
              onClick={() => setRenamingFolder(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 m-auto z-50 h-fit w-[90%] max-w-sm bg-card border border-border rounded-card p-5 shadow-floating"
            >
              <form onSubmit={handleRenameFolder} className="space-y-4">
                <div className="flex items-center justify-between border-b border-border/60 pb-2">
                  <h4 className="text-xs font-bold uppercase text-foreground">
                    Rename Folder
                  </h4>
                  <button type="button" onClick={() => setRenamingFolder(null)} className="text-muted-foreground">
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-1 text-xs">
                  <label className="font-bold text-foreground">Folder Name *</label>
                  <input
                    type="text"
                    required
                    value={renameFolderInput}
                    onChange={e => setRenameFolderInput(e.target.value)}
                    className="h-9 w-full rounded border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-1">
                  <Button type="submit" className="h-9 text-xs bg-primary text-white">
                    Rename Folder
                  </Button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* UPLOAD RESOURCE MODAL */}
      <AnimatePresence>
        {isUploading && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/35 backdrop-blur-sm"
              onClick={() => setIsUploading(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="fixed inset-0 m-auto z-50 h-fit max-h-[85vh] w-[90%] max-w-md bg-card border border-border rounded-card p-5 shadow-floating overflow-y-auto space-y-4"
            >
              <form onSubmit={handleUploadResource} className="space-y-4 text-xs">
                <div className="flex items-center justify-between border-b border-border/60 pb-2">
                  <h4 className="text-sm font-bold uppercase text-foreground">
                    Upload Resource
                  </h4>
                  <button type="button" onClick={() => setIsUploading(false)} className="text-muted-foreground hover:text-foreground">
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-foreground">Resource Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. final_exam_review_questions"
                    value={uploadForm.name}
                    onChange={e => setUploadForm(f => ({ ...f, name: e.target.value }))}
                    className="h-9 w-full rounded border border-border bg-card px-3 font-semibold text-foreground focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-foreground">Course *</label>
                    <select
                      value={uploadForm.course}
                      onChange={e => setUploadForm(f => ({ ...f, course: e.target.value }))}
                      className="h-9 w-full rounded border border-border bg-card px-2 font-semibold text-foreground focus:outline-none"
                    >
                      <option value="Linear Algebra & Applications">Linear Algebra & Applications</option>
                      <option value="Full-Stack Web Dev Bootcamp">Full-Stack Web Dev Bootcamp</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-foreground">Batch *</label>
                    <select
                      value={uploadForm.batch}
                      onChange={e => setUploadForm(f => ({ ...f, batch: e.target.value }))}
                      className="h-9 w-full rounded border border-border bg-card px-2 font-semibold text-foreground focus:outline-none"
                    >
                      <option value="Batch A">Batch A</option>
                      <option value="Batch B">Batch B</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-foreground">Category *</label>
                    <select
                      value={uploadForm.category}
                      onChange={e => setUploadForm(f => ({ ...f, category: e.target.value as any }))}
                      className="h-9 w-full rounded border border-border bg-card px-2 font-semibold text-foreground focus:outline-none"
                    >
                      <option value="Notes">Notes</option>
                      <option value="Presentations">Presentations</option>
                      <option value="PDFs">PDFs</option>
                      <option value="Assignments">Assignments</option>
                      <option value="Sample Papers">Sample Papers</option>
                      <option value="Code Files">Code Files</option>
                      <option value="Videos">Videos</option>
                      <option value="Images">Images</option>
                      <option value="External Links">External Links</option>
                      <option value="Templates">Templates</option>
                      <option value="Miscellaneous">Miscellaneous</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-foreground">Visibility *</label>
                    <select
                      value={uploadForm.visibility}
                      onChange={e => setUploadForm(f => ({ ...f, visibility: e.target.value as any }))}
                      className="h-9 w-full rounded border border-border bg-card px-2 font-semibold text-foreground focus:outline-none"
                    >
                      <option value="Published">Published</option>
                      <option value="Draft">Draft</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-foreground">Tags (comma-separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. math, vectors, linear"
                    value={uploadForm.tags}
                    onChange={e => setUploadForm(f => ({ ...f, tags: e.target.value }))}
                    className="h-9 w-full rounded border border-border bg-card px-3 font-semibold text-foreground focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-foreground">External URL (Optional)</label>
                  <input
                    type="text"
                    placeholder="https://drive.google.com/..."
                    value={uploadForm.externalUrl}
                    onChange={e => setUploadForm(f => ({ ...f, externalUrl: e.target.value }))}
                    className="h-9 w-full rounded border border-border bg-card px-3 font-semibold text-foreground focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-foreground">Description</label>
                  <textarea
                    rows={2}
                    placeholder="Enter resource details..."
                    value={uploadForm.description}
                    onChange={e => setUploadForm(f => ({ ...f, description: e.target.value }))}
                    className="w-full bg-card border border-border rounded p-2 focus:outline-none font-semibold text-foreground resize-none"
                  />
                </div>

                <div className="border-t border-border/40 pt-3 flex flex-col gap-2 font-bold text-foreground">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={uploadForm.allowDownload}
                      onChange={e => setUploadForm(f => ({ ...f, allowDownload: e.target.checked }))}
                      className="rounded border-border text-primary"
                    />
                    Allow students to download
                  </label>
                </div>

                <div className="flex gap-2 justify-end pt-3 border-t border-border/40">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setUploadForm(f => ({ ...f, visibility: "Draft" }));
                      toast.success("Draft saved successfully.");
                      setIsUploading(false);
                    }}
                    className="h-9 text-xs"
                  >
                    Save Draft
                  </Button>
                  <Button
                    type="submit"
                    className="h-9 text-xs bg-primary text-white font-bold"
                  >
                    Publish Resource
                  </Button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
});
