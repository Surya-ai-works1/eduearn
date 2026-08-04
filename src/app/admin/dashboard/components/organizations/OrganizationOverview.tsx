"use client";

import React from "react";
import { Card } from "../../../../../components/ui/card";
import { TenantOrg } from "./OrganizationsTab";
import { Building2, Users, BookOpen, HardDrive } from "lucide-react";

interface SubComponentProps {
  org: TenantOrg;
}

export default function OrganizationOverview({ org }: SubComponentProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-left select-none">
      
      {/* Total Users */}
      <Card className="p-4 border-border bg-card flex justify-between items-center shadow-soft">
        <div>
          <span className="text-[10px] font-extrabold text-muted-foreground uppercase block">Enrolled Users</span>
          <span className="text-lg font-heading font-black text-foreground mt-1.5 block">{org.usersCount}</span>
        </div>
        <span className="p-2 bg-primary/10 text-primary border border-primary/20 rounded-xl">
          <Users size={14} />
        </span>
      </Card>

      {/* Courses */}
      <Card className="p-4 border-border bg-card flex justify-between items-center shadow-soft">
        <div>
          <span className="text-[10px] font-extrabold text-muted-foreground uppercase block">Published Courses</span>
          <span className="text-lg font-heading font-black text-foreground mt-1.5 block">{org.coursesCount}</span>
        </div>
        <span className="p-2 bg-purple-500/10 text-purple-500 border border-purple-500/20 rounded-xl">
          <BookOpen size={14} />
        </span>
      </Card>

      {/* Storage Used */}
      <Card className="p-4 border-border bg-card flex justify-between items-center shadow-soft">
        <div>
          <span className="text-[10px] font-extrabold text-muted-foreground uppercase block">Storage Allocated</span>
          <span className="text-lg font-heading font-black text-foreground mt-1.5 block">{org.storageUsed} GB</span>
        </div>
        <span className="p-2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-xl">
          <HardDrive size={14} />
        </span>
      </Card>

      {/* Health Score */}
      <Card className="p-4 border-border bg-card flex justify-between items-center shadow-soft">
        <div>
          <span className="text-[10px] font-extrabold text-muted-foreground uppercase block">Health Grade</span>
          <span className="text-lg font-heading font-black text-foreground mt-1.5 block">{org.healthScore}%</span>
        </div>
        <span className="p-2 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-xl font-heading font-extrabold text-xs">
          A+
        </span>
      </Card>

    </div>
  );
}
