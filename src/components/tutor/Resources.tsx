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
  X
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
}

interface ExtendedMediaFile extends MediaFile {
  folderId?: string; // organize by folders
}

const FILE_ICON_MAP: Record<string, React.ElementType> = {
  Video: Video,
  PDF: FileText,
  PPT: FileText,
  DOC: FileText,
  ZIP: FolderOpen,
  Image: ImageIcon,
};

export const Resources = React.memo(function Resources({
  mediaFiles,
  setMediaFiles,
  platformConfig,
  calculateTotalMediaSizeMB,
}: ResourcesProps) {
  // Folders list
  const [folders, setFolders] = useState<ResourceFolder[]>([
    { id: "fld-1", name: "Syllabus & Notes" },
    { id: "fld-2", name: "Video Materials" },
    { id: "fld-3", name: "Assignments Archive" }
  ]);

  // Current folder navigation: null means root.
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);

  // Modal to create folders
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  // Search query
  const [searchQuery, setSearchQuery] = useState("");

  // Preview file modal
  const [previewFile, setPreviewFile] = useState<ExtendedMediaFile | null>(null);

  // Cast mediaFiles to include folderId compatibility
  const resources: ExtendedMediaFile[] = useMemo(() => {
    return mediaFiles.map((f, idx) => {
      // Map mock types to correct folders or root
      let folderId = undefined;
      if (f.type === "Video") folderId = "fld-2";
      else if (f.type === "PDF") folderId = "fld-1";
      else if (f.type === "Assignment") folderId = "fld-3";
      return { ...f, folderId };
    });
  }, [mediaFiles]);

  const totalMB = calculateTotalMediaSizeMB();
  const storagePct = Math.min((totalMB / (platformConfig.storageLimit * 1024)) * 100, 100);

  // Actions
  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    const newFolder: ResourceFolder = {
      id: `fld-${Date.now()}`,
      name: newFolderName.trim()
    };
    setFolders((prev) => [...prev, newFolder]);
    setIsCreatingFolder(false);
    setNewFolderName("");
    toast.success("Folder created successfully!");
  };

  const handleDeleteFile = (id: string) => {
    setMediaFiles((prev) => prev.filter((f) => f.id !== id));
    toast.success("File deleted successfully.");
  };

  const handleUploadFile = (type: string, fileObject?: File) => {
    const name = fileObject ? fileObject.name : `Assessment_${type}.${type === "Video" ? "mp4" : type.toLowerCase()}`;
    const size = fileObject ? `${(fileObject.size / (1024 * 1024)).toFixed(1)} MB` : "4.8 MB";

    const newFile: MediaFile = {
      id: `file-${Date.now()}`,
      name,
      size,
      type,
    };
    setMediaFiles((prev) => [...prev, newFile]);
    toast.success(`${type} file uploaded successfully to storage!`);
  };

  const triggerUploadClick = (type: string) => {
    const input = document.createElement("input");
    input.type = "file";
    // Filter accept extension based on type
    if (type === "PDF") input.accept = ".pdf";
    else if (type === "PPT") input.accept = ".ppt,.pptx";
    else if (type === "DOC") input.accept = ".doc,.docx";
    else if (type === "ZIP") input.accept = ".zip,.rar";
    else if (type === "Video") input.accept = "video/*";

    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (file) {
        handleUploadFile(type, file);
      }
    };
    input.click();
  };

  // Filtered files & folders
  const currentFiles = useMemo(() => {
    return resources.filter((f) => {
      const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFolder = searchQuery ? true : f.folderId === (currentFolderId || undefined);
      return matchesSearch && matchesFolder;
    });
  }, [resources, currentFolderId, searchQuery]);

  const activeFolder = folders.find((f) => f.id === currentFolderId);

  return (
    <motion.div
      key="tutor-resources"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="space-y-5"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-heading font-extrabold text-foreground">Resource Center</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {mediaFiles.length} files &bull; {totalMB.toFixed(1)} MB used
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsCreatingFolder(true)}
            variant="outline"
            size="sm"
            className="h-9 gap-1.5 shadow-soft border-border text-foreground font-bold"
          >
            <FolderPlus size={14} /> New Folder
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2.5fr] gap-5">
        {/* Sidebar storage meter + upload buttons */}
        <div className="space-y-4">
          <Card variant="glass" className="p-4 flex flex-col gap-4">
            <div className="flex items-center gap-2.5">
              <HardDrive size={18} className="text-primary" />
              <h4 className="text-xs font-heading font-extrabold text-foreground">Storage Meter</h4>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold">
                <span className="text-muted-foreground">Used Storage</span>
                <span className="text-foreground">{totalMB.toFixed(1)} MB / {platformConfig.storageLimit} GB</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${storagePct > 85 ? "bg-rose-500" : "bg-primary"}`}
                  style={{ width: `${storagePct}%` }}
                />
              </div>
            </div>

            {/* Quick Upload triggers */}
            <div className="space-y-2 pt-2">
              <p className="text-[9px] font-extrabold uppercase text-muted-foreground">Quick File Upload</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { type: "PDF", label: "Upload PDF" },
                  { type: "PPT", label: "Upload PPT" },
                  { type: "DOC", label: "Upload DOC" },
                  { type: "ZIP", label: "Upload ZIP" },
                  { type: "Video", label: "Upload Video" }
                ].map((item) => (
                  <Button
                    key={item.type}
                    variant="outline"
                    size="sm"
                    onClick={() => triggerUploadClick(item.type)}
                    className="h-9 text-[9px] font-bold gap-1 justify-center py-2"
                  >
                    <Upload size={11} />
                    {item.type}
                  </Button>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Content catalog explorer */}
        <div className="space-y-4">
          {/* Breadcrumb / Search bar */}
          <Card variant="glass" className="p-3.5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
              {currentFolderId ? (
                <>
                  <button
                    onClick={() => setCurrentFolderId(null)}
                    className="text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer font-bold"
                  >
                    <ArrowLeft size={13} /> Root
                  </button>
                  <ChevronRight size={12} className="text-muted-foreground/60" />
                  <span className="text-primary">{activeFolder?.name}</span>
                </>
              ) : (
                <span className="text-muted-foreground font-bold">Root Folder Directory</span>
              )}
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-60">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 w-full pl-8 pr-3 rounded-button border border-border bg-card px-3 text-xs font-semibold text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
              />
            </div>
          </Card>

          {/* Root folders layout (only show if not inside folder and not searching) */}
          {!currentFolderId && !searchQuery && (
            <div className="space-y-2">
              <h4 className="text-[10px] font-extrabold uppercase text-muted-foreground">Folders</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {folders.map((folder) => {
                  const folderFilesCount = resources.filter(r => r.folderId === folder.id).length;
                  return (
                    <Card
                      key={folder.id}
                      onClick={() => setCurrentFolderId(folder.id)}
                      className="p-4 hover:shadow-md hover:border-primary/40 transition-all cursor-pointer flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                          <FolderOpen size={16} />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">{folder.name}</h4>
                          <p className="text-[9px] text-muted-foreground">{folderFilesCount} items</p>
                        </div>
                      </div>
                      <ChevronRight size={14} className="text-muted-foreground/50" />
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Files List grid */}
          <div className="space-y-2 pt-2">
            <h4 className="text-[10px] font-extrabold uppercase text-muted-foreground">Files</h4>
            {currentFiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center bg-card border border-dashed border-border rounded-card">
                <FolderOpen size={32} className="text-muted-foreground/30 mb-2" />
                <h4 className="text-xs font-bold text-foreground">No files in directory</h4>
                <p className="text-[10px] text-muted-foreground mt-0.5">Use quick upload controls to add items here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentFiles.map((file) => {
                  const Icon = FILE_ICON_MAP[file.type] || File;
                  return (
                    <div
                      key={file.id}
                      className="card-surface p-3.5 rounded-card border border-border/60 flex items-center justify-between gap-3 shadow-soft group hover:border-primary/25 transition-all"
                    >
                      <div
                        className="flex items-center gap-3 min-w-0 cursor-pointer flex-1"
                        onClick={() => setPreviewFile(file)}
                      >
                        <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                          <Icon size={16} />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors truncate">{file.name}</h4>
                          <p className="text-[9px] text-muted-foreground uppercase">{file.type} &bull; {file.size}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => setPreviewFile(file)}
                          className="text-muted-foreground hover:text-foreground p-1 rounded hover:bg-muted cursor-pointer"
                          title="Preview file"
                        >
                          <Eye size={13} />
                        </button>
                        <button
                          onClick={() => toast.success(`Downloading: ${file.name}`)}
                          className="text-muted-foreground hover:text-foreground p-1 rounded hover:bg-muted cursor-pointer"
                          title="Download file"
                        >
                          <Download size={13} />
                        </button>
                        <button
                          onClick={() => handleDeleteFile(file.id)}
                          className="text-rose-500 hover:bg-rose-500/10 p-1 rounded cursor-pointer"
                          title="Delete file"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CREATE FOLDER MODAL */}
      <AnimatePresence>
        {isCreatingFolder && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-45 bg-black/35 backdrop-blur-sm"
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
                    Create New Folder
                  </h4>
                  <button
                    type="button"
                    onClick={() => setIsCreatingFolder(false)}
                    className="text-muted-foreground hover:text-foreground cursor-pointer"
                  >
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
                    placeholder="e.g. Midterm Exams 2026"
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

      {/* PREVIEW FILE MODAL */}
      <AnimatePresence>
        {previewFile && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-45 bg-black/35 backdrop-blur-sm"
              onClick={() => setPreviewFile(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 m-auto z-50 h-fit max-h-[80vh] w-[90%] max-w-lg bg-card border border-border rounded-card p-5 shadow-floating overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-border/60 pb-2">
                <h4 className="text-xs font-heading font-extrabold uppercase text-foreground truncate max-w-[80%]">
                  File Preview: {previewFile.name}
                </h4>
                <button
                  onClick={() => setPreviewFile(null)}
                  className="text-muted-foreground hover:text-foreground cursor-pointer p-0.5 rounded"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Rendering preview block depending on file type */}
              <div className="my-5 p-4 rounded-lg bg-muted/30 border border-border/40 min-h-[160px] flex items-center justify-center text-center">
                {previewFile.type === "Video" ? (
                  <div className="w-full space-y-2">
                    <div className="aspect-video w-full rounded bg-black flex items-center justify-center text-white relative">
                      <Video size={36} className="text-primary animate-pulse" />
                      <span className="absolute bottom-2 right-2 text-[8px] bg-black/60 px-1 py-0.5 rounded">0:00 / 2:30</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground font-semibold">Video demo player ready.</p>
                  </div>
                ) : previewFile.type === "Image" ? (
                  <div className="flex flex-col items-center gap-2">
                    <ImageIcon size={42} className="text-primary" />
                    <p className="text-xs text-foreground font-bold">{previewFile.name}</p>
                    <p className="text-[10px] text-muted-foreground">Dimensions: 800 x 600px &bull; Format: PNG</p>
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
                  onClick={() => {
                    toast.success(`File downloaded: ${previewFile.name}`);
                    setPreviewFile(null);
                  }}
                  className="h-9 text-xs bg-primary hover:bg-primary/95 text-white gap-1.5"
                >
                  <Download size={13} />
                  Download File
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
});
