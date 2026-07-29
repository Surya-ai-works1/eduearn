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
  ArrowUpDown,
  Share2,
  Clock,
  Save
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

interface ExtendedMediaFile extends MediaFile {
  folderId?: string; // organize by folders
  category?: string;
  url?: string;
  uploadedAt: string;
  sharedWithCohort?: string;
}

export const Resources = React.memo(function Resources({
  mediaFiles,
  setMediaFiles,
  platformConfig,
  calculateTotalMediaSizeMB,
}: ResourcesProps) {
  // Folders list
  const [folders, setFolders] = useState<ResourceFolder[]>([
    { id: "fld-1", name: "Syllabus & Notes", filesCount: 2 },
    { id: "fld-2", name: "Video Materials", filesCount: 1 },
    { id: "fld-3", name: "Assignments Archive", filesCount: 1 }
  ]);

  // Extended media files (which support categories and folders)
  const [extendedMedia, setExtendedMedia] = useState<ExtendedMediaFile[]>([
    {
      id: "media-1",
      name: "syllabus_draft_v2.pdf",
      size: "2.4 MB",
      type: "PDF",
      url: "#",
      folderId: "fld-1",
      category: "Syllabus",
      uploadedAt: "2026-07-28",
      sharedWithCohort: "All Enrolled Students"
    },
    {
      id: "media-2",
      name: "intro_lecture_recording.mp4",
      size: "45.0 MB",
      type: "Video",
      url: "#",
      folderId: "fld-2",
      category: "Lecture Recording",
      uploadedAt: "2026-07-27",
      sharedWithCohort: "Linear Algebra Cohort"
    },
    {
      id: "media-3",
      name: "final_project_rubric.zip",
      size: "8.1 MB",
      type: "ZIP",
      url: "#",
      folderId: "fld-3",
      category: "Rubric",
      uploadedAt: "2026-07-25",
      sharedWithCohort: "Full-Stack Cohort"
    }
  ]);

  // Current folder navigation: null means root.
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);

  // Search, Filter & Sort
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sortBy, setSortBy] = useState("name-asc"); // "name-asc" | "size-desc" | "date-desc"

  // Dialogs
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  const [isUploading, setIsUploading] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    name: "",
    type: "PDF" as ExtendedMediaFile["type"],
    size: "1.2 MB",
    category: "General Notes"
  });

  const [previewFile, setPreviewFile] = useState<ExtendedMediaFile | null>(null);

  // Rename File Dialog
  const [renamingFile, setRenamingFile] = useState<ExtendedMediaFile | null>(null);
  const [newNameInput, setNewNameInput] = useState("");

  // Rename Folder Dialog
  const [renamingFolder, setRenamingFolder] = useState<ResourceFolder | null>(null);
  const [newFolderInput, setNewFolderInput] = useState("");

  // Storage utilization stats
  const totalLimit = platformConfig.storageLimit || 500; // in MB
  const totalUsedMB = calculateTotalMediaSizeMB() + 55.5; // Mock actual baseline + custom uploads
  const usagePercentage = Math.min((totalUsedMB / totalLimit) * 100, 100);

  const statsBreakdown = useMemo(() => {
    const totalFiles = extendedMedia.length;
    const pdfCount = extendedMedia.filter((f) => f.type === "PDF").length;
    const videoCount = extendedMedia.filter((f) => f.type === "Video").length;
    const zipCount = extendedMedia.filter((f) => f.type === "ZIP").length;
    return { totalFiles, pdfCount, videoCount, zipCount };
  }, [extendedMedia]);

  const uniqueCategories = useMemo(() => {
    const cats = extendedMedia.map((f) => f.category).filter(Boolean) as string[];
    return Array.from(new Set(cats));
  }, [extendedMedia]);

  // Navigation crumbs
  const currentFolderName = useMemo(() => {
    if (!currentFolderId) return "Root Library Directory";
    return folders.find((f) => f.id === currentFolderId)?.name || "Folder";
  }, [currentFolderId, folders]);

  // Recent Uploads list (sorted by upload date desc)
  const recentUploads = useMemo(() => {
    return [...extendedMedia].sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt)).slice(0, 3);
  }, [extendedMedia]);

  // Shared Resources list
  const sharedResources = useMemo(() => {
    return extendedMedia.filter((f) => f.sharedWithCohort);
  }, [extendedMedia]);

  // Handlers
  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    const newFolder: ResourceFolder = {
      id: `fld-${Date.now()}`,
      name: newFolderName,
      filesCount: 0
    };

    setFolders((prev) => [...prev, newFolder]);
    setNewFolderName("");
    setIsCreatingFolder(false);
    toast.success("New folder created successfully.");
  };

  const handleUploadFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadForm.name) return;

    const newFile: ExtendedMediaFile = {
      id: `media-${Date.now()}`,
      name: uploadForm.name.includes(".") ? uploadForm.name : `${uploadForm.name}.${uploadForm.type.toLowerCase()}`,
      size: uploadForm.size,
      type: uploadForm.type,
      url: "#",
      folderId: currentFolderId || undefined,
      category: uploadForm.category,
      uploadedAt: new Date().toISOString().split("T")[0],
      sharedWithCohort: currentFolderId === "fld-1" ? "All Enrolled Students" : "Cohort batch"
    };

    setExtendedMedia((prev) => [newFile, ...prev]);

    // Update folder counts
    if (currentFolderId) {
      setFolders((prev) =>
        prev.map((f) => (f.id === currentFolderId ? { ...f, filesCount: f.filesCount + 1 } : f))
      );
    }

    setIsUploading(false);
    setUploadForm({
      name: "",
      type: "PDF",
      size: "1.5 MB",
      category: "General Notes"
    });
    toast.success("Resource uploaded successfully!");
  };

  const handleDeleteFile = (id: string) => {
    const file = extendedMedia.find((f) => f.id === id);
    setExtendedMedia((prev) => prev.filter((f) => f.id !== id));
    if (file?.folderId) {
      setFolders((prev) =>
        prev.map((f) => (f.id === file.folderId ? { ...f, filesCount: Math.max(0, f.filesCount - 1) } : f))
      );
    }
    toast.success("Resource deleted permanently.");
  };

  const handleDeleteFolder = (id: string) => {
    setFolders((prev) => prev.filter((f) => f.id !== id));
    setExtendedMedia((prev) => prev.map((f) => (f.folderId === id ? { ...f, folderId: undefined } : f)));
    if (currentFolderId === id) {
      setCurrentFolderId(null);
    }
    toast.success("Folder deleted. Inner resources moved to root.");
  };

  const handleRenameFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!renamingFile || !newNameInput.trim()) return;

    setExtendedMedia((prev) =>
      prev.map((f) => (f.id === renamingFile.id ? { ...f, name: newNameInput } : f))
    );
    setRenamingFile(null);
    toast.success("File renamed successfully.");
  };

  const handleRenameFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!renamingFolder || !newFolderInput.trim()) return;

    setFolders((prev) =>
      prev.map((f) => (f.id === renamingFolder.id ? { ...f, name: newFolderInput } : f))
    );
    setRenamingFolder(null);
    toast.success("Folder renamed successfully.");
  };

  // Filtered files
  const visibleFolders = useMemo(() => {
    if (currentFolderId !== null) return [];
    return folders.filter((f) => f.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [folders, currentFolderId, searchQuery]);

  const visibleFiles = useMemo(() => {
    return extendedMedia
      .filter((f) => {
        const inCurrentFolder = currentFolderId ? f.folderId === currentFolderId : !f.folderId;
        const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCat = categoryFilter === "All" || f.category === categoryFilter;
        return inCurrentFolder && matchesSearch && matchesCat;
      })
      .sort((a, b) => {
        if (sortBy === "name-asc") return a.name.localeCompare(b.name);
        if (sortBy === "date-desc") return b.uploadedAt.localeCompare(a.uploadedAt);
        if (sortBy === "size-desc") {
          const valA = parseFloat(a.size);
          const valB = parseFloat(b.size);
          return valB - valA;
        }
        return 0;
      });
  }, [extendedMedia, currentFolderId, searchQuery, categoryFilter, sortBy]);

  const FILE_ICON_MAP: Record<string, React.ElementType> = {
    Video: Video,
    PDF: FileText,
    PPT: FileText,
    DOC: FileText,
    ZIP: FolderOpen,
  };

  return (
    <motion.div
      key="tutor-resources"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-heading font-extrabold text-foreground">Resources</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Study material libraries, lecture recordings, guidelines and folder configurations.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setIsCreatingFolder(true)}
            size="sm"
            variant="outline"
            className="h-9 gap-1 font-bold"
          >
            <FolderPlus size={14} /> New Folder
          </Button>
          <Button
            onClick={() => setIsUploading(true)}
            size="sm"
            className="h-9 gap-1.5 shadow-soft bg-primary hover:bg-primary/95 text-white font-bold"
          >
            <Upload size={14} /> Upload Resource
          </Button>
        </div>
      </div>

      {/* Main split grid: library files / Side status details */}
      <div className="grid grid-cols-1 xl:grid-cols-[2.5fr_1fr] gap-6">
        
        {/* Left Side Library explorer */}
        <div className="space-y-5">
          {/* Filters & Search */}
          <Card variant="glass" className="p-4 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[180px] max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search file library..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-full pl-9 pr-3 rounded-button border border-border bg-card/60 text-xs font-semibold text-foreground focus:outline-none"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-9 rounded-button border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
            >
              <option value="All">All Categories</option>
              {uniqueCategories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-9 rounded-button border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
            >
              <option value="name-asc">Sort: A-Z</option>
              <option value="date-desc">Sort: Newest</option>
              <option value="size-desc">Sort: Largest</option>
            </select>
          </Card>

          {/* Breadcrumbs Navigation */}
          <div className="flex items-center gap-1 text-[11px] font-bold text-muted-foreground px-1">
            {currentFolderId && (
              <button
                onClick={() => setCurrentFolderId(null)}
                className="hover:text-foreground flex items-center gap-0.5 cursor-pointer font-extrabold"
              >
                <ArrowLeft size={12} /> Back to root
              </button>
            )}
            <ChevronRight size={12} className="opacity-40" />
            <span className="text-foreground">{currentFolderName}</span>
          </div>

          {/* Directory Folder Grid */}
          {currentFolderId === null && visibleFolders.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {visibleFolders.map((folder) => (
                <Card
                  key={folder.id}
                  onClick={() => setCurrentFolderId(folder.id)}
                  className="p-4 hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer flex items-center justify-between border-border/70 shadow-soft"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2.5 rounded-lg bg-primary/10 text-primary shrink-0">
                      <FolderOpen size={20} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-foreground leading-tight truncate">{folder.name}</h4>
                      <p className="text-[10px] text-muted-foreground mt-1 font-semibold">
                        {folder.filesCount} resources
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => { setRenamingFolder(folder); setNewFolderInput(folder.name); }}
                      className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      <Edit2 size={11} />
                    </button>
                    <button
                      onClick={() => handleDeleteFolder(folder.id)}
                      className="p-1 hover:bg-rose-500/10 rounded text-rose-500 cursor-pointer"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Explorer Files Grid */}
          {visibleFiles.length === 0 && visibleFolders.length === 0 ? (
            <div className="text-center py-10 bg-card rounded-card border border-border/50 text-muted-foreground italic text-xs">
              No study materials found in this directory folder.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {visibleFiles.map((file) => {
                const Icon = FILE_ICON_MAP[file.type] || File;
                return (
                  <div
                    key={file.id}
                    className="card-surface p-3.5 border border-border/50 rounded-card flex items-center justify-between shadow-soft hover:border-primary/20"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded bg-muted/40 text-primary border border-border/30 shrink-0">
                        <Icon size={18} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-foreground truncate max-w-[190px]">{file.name}</h4>
                        <div className="flex items-center gap-2 text-[8px] font-extrabold uppercase mt-1 text-muted-foreground">
                          <span>{file.size}</span>
                          <span>&bull;</span>
                          <span className="bg-primary/5 text-primary px-1.5 rounded">{file.category || "General"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPreviewFile(file)}
                        className="h-7 w-7 p-0"
                        title="Preview"
                      >
                        <Eye size={12} />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => { setRenamingFile(file); setNewNameInput(file.name); }}
                        className="h-7 w-7 p-0"
                        title="Rename"
                      >
                        <Edit2 size={12} />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toast.info(`Downloading resource ZIP: ${file.name}`)}
                        className="h-7 w-7 p-0"
                        title="Download"
                      >
                        <Download size={12} />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteFile(file.id)}
                        className="h-7 w-7 p-0 text-rose-500 hover:bg-rose-500/5"
                        title="Delete"
                      >
                        <Trash2 size={12} />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Side Status Panel details */}
        <div className="space-y-5">
          {/* Storage Indicator */}
          <Card variant="glass" className="p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <HardDrive size={13} />
                Storage Utilization
              </span>
              <span className="text-foreground">{totalUsedMB.toFixed(1)} / {totalLimit} MB</span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: `${usagePercentage}%` }} />
            </div>
            <p className="text-[9px] text-muted-foreground leading-normal">
              Utilizing {usagePercentage.toFixed(1)}% of your allowed bandwidth/storage capacity.
            </p>
          </Card>

          {/* Recent Uploads */}
          <Card variant="glass" className="p-4 space-y-3">
            <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-2">
              Recent Uploads
            </h4>
            <div className="space-y-2">
              {recentUploads.map((f) => (
                <div key={f.id} className="flex items-center gap-2 text-[10px] font-semibold text-foreground">
                  <Clock size={11} className="text-primary shrink-0" />
                  <span className="truncate max-w-[120px]">{f.name}</span>
                  <span className="text-[8px] text-muted-foreground ml-auto">{f.uploadedAt}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Shared study cohort resources */}
          <Card variant="glass" className="p-4 space-y-3">
            <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-violet-600 border-b border-border/40 pb-2">
              Shared Study Cohorts
            </h4>
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {sharedResources.map((f) => (
                <div key={f.id} className="p-2 bg-violet-500/5 border border-violet-500/10 rounded text-[9px] font-semibold space-y-1">
                  <div className="flex items-center justify-between text-foreground">
                    <span className="font-bold truncate max-w-[120px]">{f.name}</span>
                    <Share2 size={10} className="text-violet-500" />
                  </div>
                  <p className="text-muted-foreground">Shared: {f.sharedWithCohort}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* CREATE FOLDER DIALOG */}
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
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="fixed inset-0 m-auto z-50 h-fit w-[90%] max-w-sm bg-card border border-border rounded-card p-5 shadow-floating"
            >
              <form onSubmit={handleCreateFolder} className="space-y-4">
                <div className="flex items-center justify-between border-b border-border/60 pb-2">
                  <h4 className="text-xs font-heading font-extrabold uppercase text-foreground">
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
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="e.g. Reference Slides"
                    className="h-9 w-full rounded border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-1">
                  <Button type="submit" className="h-9 text-xs bg-primary hover:bg-primary/95 text-white">
                    Create Folder
                  </Button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* UPLOAD DIALOG */}
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
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="fixed inset-0 m-auto z-50 h-fit w-[90%] max-w-sm bg-card border border-border rounded-card p-5 shadow-floating"
            >
              <form onSubmit={handleUploadFile} className="space-y-4">
                <div className="flex items-center justify-between border-b border-border/60 pb-2">
                  <h4 className="text-xs font-heading font-extrabold uppercase text-foreground">
                    Upload Resource
                  </h4>
                  <button type="button" onClick={() => setIsUploading(false)} className="text-muted-foreground">
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-1 text-xs">
                  <label className="font-bold text-foreground">Resource File Name *</label>
                  <input
                    type="text"
                    required
                    value={uploadForm.name}
                    onChange={(e) => setUploadForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. vector_calculus_axioms"
                    className="h-9 w-full rounded border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-foreground">Type *</label>
                    <select
                      value={uploadForm.type}
                      onChange={(e) => setUploadForm((f) => ({ ...f, type: e.target.value as any }))}
                      className="h-9 w-full rounded border border-border bg-card px-2 font-semibold text-foreground focus:outline-none"
                    >
                      <option value="PDF">PDF Document</option>
                      <option value="PPT">PPT Slide deck</option>
                      <option value="DOC">DOC Guide</option>
                      <option value="ZIP">ZIP Download bundle</option>
                      <option value="Video">Video File Player</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-foreground">Mock Size *</label>
                    <input
                      type="text"
                      required
                      value={uploadForm.size}
                      onChange={(e) => setUploadForm((f) => ({ ...f, size: e.target.value }))}
                      className="h-9 w-full rounded border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <label className="font-bold text-foreground">Category *</label>
                  <input
                    type="text"
                    value={uploadForm.category}
                    onChange={(e) => setUploadForm((f) => ({ ...f, category: e.target.value }))}
                    className="h-9 w-full rounded border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-1">
                  <Button type="submit" className="h-9 text-xs bg-primary hover:bg-primary/95 text-white font-bold">
                    Submit Upload
                  </Button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* RENAME FOLDER */}
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
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="fixed inset-0 m-auto z-50 h-fit w-[90%] max-w-sm bg-card border border-border rounded-card p-5 shadow-floating"
            >
              <form onSubmit={handleRenameFolder} className="space-y-4">
                <div className="flex items-center justify-between border-b border-border/60 pb-2">
                  <h4 className="text-xs font-heading font-extrabold uppercase text-foreground">
                    Rename Folder
                  </h4>
                  <button type="button" onClick={() => setRenamingFolder(null)} className="text-muted-foreground">
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-1 text-xs">
                  <label className="font-bold text-foreground">New Folder Name *</label>
                  <input
                    type="text"
                    required
                    value={newFolderInput}
                    onChange={(e) => setNewFolderInput(e.target.value)}
                    className="h-9 w-full rounded border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-1">
                  <Button type="submit" className="h-9 text-xs bg-primary hover:bg-primary/95 text-white font-bold">
                    Save Name
                  </Button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* RENAME FILE */}
      <AnimatePresence>
        {renamingFile && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/35 backdrop-blur-sm"
              onClick={() => setRenamingFile(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="fixed inset-0 m-auto z-50 h-fit w-[90%] max-w-sm bg-card border border-border rounded-card p-5 shadow-floating"
            >
              <form onSubmit={handleRenameFile} className="space-y-4">
                <div className="flex items-center justify-between border-b border-border/60 pb-2">
                  <h4 className="text-xs font-heading font-extrabold uppercase text-foreground">
                    Rename Resource
                  </h4>
                  <button type="button" onClick={() => setRenamingFile(null)} className="text-muted-foreground">
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-1 text-xs">
                  <label className="font-bold text-foreground">New File Name *</label>
                  <input
                    type="text"
                    required
                    value={newNameInput}
                    onChange={(e) => setNewNameInput(e.target.value)}
                    className="h-9 w-full rounded border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-1">
                  <Button type="submit" className="h-9 text-xs bg-primary hover:bg-primary/95 text-white font-bold">
                    Save Name
                  </Button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Preview Dialog */}
      <AnimatePresence>
        {previewFile && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/35 backdrop-blur-sm"
              onClick={() => setPreviewFile(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="fixed inset-0 m-auto z-50 h-fit max-h-[85vh] w-[90%] max-w-lg bg-card border border-border rounded-card p-5 shadow-floating overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-border/60 pb-2">
                <h4 className="text-xs font-heading font-extrabold uppercase text-foreground">
                  File Preview Workspace
                </h4>
                <button onClick={() => setPreviewFile(null)} className="text-muted-foreground hover:text-foreground">
                  <X size={16} />
                </button>
              </div>

              {/* Rendering preview block depending on file type */}
              <div className="my-5 p-4 rounded-lg bg-muted/30 border border-border/40 min-h-[180px] flex items-center justify-center text-center">
                {previewFile.type === "Video" ? (
                  <div className="w-full space-y-2">
                    <div className="aspect-video w-full rounded bg-black flex items-center justify-center text-white relative">
                      <Video size={36} className="text-primary animate-pulse" />
                      <span className="absolute bottom-2 right-2 text-[8px] bg-black/60 px-1 py-0.5 rounded">0:00 / 2:30</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground font-semibold">Video player active.</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 py-6">
                    <FileText size={48} className="text-primary" />
                    <div>
                      <p className="text-xs text-foreground font-bold">{previewFile.name}</p>
                      <p className="text-[10px] text-muted-foreground">Interactive preview of {previewFile.type} documents is ready.</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    toast.info(`Downloading resource: ${previewFile.name}`);
                    setPreviewFile(null);
                  }}
                  className="h-9 text-xs font-bold gap-1"
                >
                  <Download size={13} /> ZIP Download
                </Button>
                <Button variant="outline" size="sm" onClick={() => setPreviewFile(null)} className="h-9 text-xs font-bold">
                  Close Preview
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
});
