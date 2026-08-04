"use client";

import React, { useState } from "react";
import { Card } from "../../../../../components/ui/card";
import { TenantOrg } from "./OrganizationsTab";
import { HardDrive, Trash2, ShieldAlert } from "lucide-react";
import { Button } from "../../../../../components/ui/button";
import { toast } from "sonner";

interface SubComponentProps {
  org: TenantOrg;
}

export default function OrganizationStorage({ org }: SubComponentProps) {
  const [tempStorageSize, setTempStorageSize] = useState(0.8); // GB

  const handlePruneTemp = () => {
    setTempStorageSize(0);
    toast.success("Pruned temporary cache files successfully");
  };

  return (
    <Card className="p-5 border-border bg-card space-y-5 text-left select-none shadow-soft">
      <div className="flex justify-between items-center pb-3 border-b border-border/30">
        <h3 className="text-xs font-heading font-extrabold uppercase text-foreground flex items-center gap-1.5">
          <HardDrive size={14} className="text-primary" /> Tenant Storage allocation monitor
        </h3>
      </div>

      <div className="space-y-4 text-xs font-semibold text-muted-foreground">
        
        {/* Allocated vs Limit */}
        <div className="p-4 border border-border/60 bg-muted/10 rounded-lg space-y-3">
          <div className="flex justify-between items-center select-none">
            <span className="text-[10px] font-black uppercase text-muted-foreground">Storage Used</span>
            <span className="text-foreground font-black">{org.storageUsed} GB / 50 GB Limit</span>
          </div>

          {/* HSL color bar gauge */}
          <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden select-none">
            <div className="h-full bg-primary" style={{ width: `${(org.storageUsed / 50) * 100}%` }} />
          </div>
        </div>

        {/* Partition splits details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 select-none">
          <div className="p-4 border border-border/40 rounded-lg space-y-3">
            <span className="text-[10px] uppercase font-black tracking-wider text-muted-foreground block">Capacity allocations</span>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Course video files:</span>
                <span className="text-foreground font-extrabold">{(org.storageUsed * 0.75).toFixed(1)} GB</span>
              </div>
              <div className="flex justify-between">
                <span>Student assignment PDFs:</span>
                <span className="text-foreground font-extrabold">{(org.storageUsed * 0.15).toFixed(1)} GB</span>
              </div>
              <div className="flex justify-between">
                <span>Temporary files:</span>
                <span className="text-foreground font-extrabold">{tempStorageSize} GB</span>
              </div>
            </div>
          </div>

          <Card className="p-4 border-border bg-rose-500/5 border-rose-500/10 rounded-lg flex flex-col justify-between gap-3">
            <div>
              <span className="text-[10px] uppercase font-black tracking-wider text-rose-500 block flex items-center gap-1">
                <ShieldAlert size={11} /> Storage Optimization tools
              </span>
              <p className="text-[10px] text-muted-foreground/80 leading-relaxed mt-1">
                Clear cached files, static preview bundles, and invalid transcripts to release active storage locks.
              </p>
            </div>

            {tempStorageSize > 0 ? (
              <Button onClick={handlePruneTemp} className="h-8.5 text-[9px] uppercase font-black bg-rose-600 hover:bg-rose-700 text-white shadow-soft">
                Prune Temporary files ({tempStorageSize} GB)
              </Button>
            ) : (
              <Button disabled className="h-8.5 text-[9px] uppercase font-black bg-card border-border border text-muted-foreground/50">
                Cache files cleared
              </Button>
            )}
          </Card>
        </div>

      </div>
    </Card>
  );
}
