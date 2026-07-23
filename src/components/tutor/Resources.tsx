"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  FolderOpen,
  Upload,
  File,
  Video,
  FileText,
  Image,
  Trash2,
  HardDrive,
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

const FILE_ICON_MAP: Record<string, React.ElementType> = {
  Video: Video,
  PDF: FileText,
  Image: Image,
  Assignment: File,
};

export const Resources = React.memo(function Resources({
  mediaFiles,
  setMediaFiles,
  platformConfig,
  calculateTotalMediaSizeMB,
}: ResourcesProps) {
  const totalMB = calculateTotalMediaSizeMB();
  const storagePct = Math.min((totalMB / (platformConfig.storageLimit * 1024)) * 100, 100);

  const handleDelete = (id: string) => {
    setMediaFiles((prev) => prev.filter((f) => f.id !== id));
    toast.success("File deleted.");
  };

  const handleUpload = (type: string) => {
    const newFile: MediaFile = {
      id: `file-${Date.now()}`,
      name: `New ${type} File`,
      size: "2.4 MB",
      type,
    };
    setMediaFiles((prev) => [...prev, newFile]);
    toast.success(`${type} file uploaded!`);
  };

  return (
    <motion.div
      key="tutor-resources"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="space-y-5"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-heading font-extrabold text-foreground">Resources</h2>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {mediaFiles.length} files &bull; {totalMB.toFixed(1)} MB used
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-5">
        {/* Storage meter */}
        <Card variant="glass" className="p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2.5">
            <HardDrive size={18} className="text-primary" />
            <h4 className="text-xs font-heading font-extrabold text-foreground">Storage</h4>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-semibold">
              <span className="text-muted-foreground">Used</span>
              <span className="text-foreground">{totalMB.toFixed(1)} MB / {platformConfig.storageLimit} GB</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${storagePct > 80 ? "bg-rose-500" : "bg-primary"}`}
                style={{ width: `${storagePct}%` }}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {["Video", "PDF", "Image", "Assignment"].map((type) => {
              const Icon = FILE_ICON_MAP[type] || File;
              return (
                <Button
                  key={type}
                  variant="outline"
                  size="sm"
                  onClick={() => handleUpload(type)}
                  className="h-9 text-[10px] font-bold flex-col gap-0.5 py-2"
                >
                  <Icon size={13} />
                  {type}
                </Button>
              );
            })}
          </div>
        </Card>

        {/* File grid */}
        <div className="space-y-3">
          {mediaFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <FolderOpen size={36} className="text-muted-foreground/30 mb-3" />
              <h4 className="text-sm font-bold text-foreground">No files yet</h4>
              <p className="text-xs text-muted-foreground mt-1">Upload videos, PDFs, and resources</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {mediaFiles.map((file) => {
                const Icon = FILE_ICON_MAP[file.type] || File;
                return (
                  <div
                    key={file.id}
                    className="card-surface p-3.5 rounded-card flex items-center gap-3 shadow-soft"
                  >
                    <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Icon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-foreground truncate">{file.name}</h4>
                      <p className="text-[9px] text-muted-foreground">{file.type} &bull; {file.size}</p>
                    </div>
                    <button
                      onClick={() => handleDelete(file.id)}
                      className="text-destructive hover:bg-destructive/10 p-1 rounded cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
});
