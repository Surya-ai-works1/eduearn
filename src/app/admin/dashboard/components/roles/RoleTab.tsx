"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, UserCheck, Key, Lock, Check } from "lucide-react";
import { toast } from "sonner";
import { Card } from "../../../../../components/ui/card";
import { Button } from "../../../../../components/ui/button";

interface RolePermission {
  role: string;
  permissions: {
    view: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
    approve: boolean;
    export: boolean;
  };
}

interface RoleTabProps {
  logAuditAction: (actionStr: string) => void;
}

export default function RoleTab({ logAuditAction }: RoleTabProps) {
  // Roles Matrix
  const [roles, setRoles] = useState<RolePermission[]>([
    { role: "Super Admin", permissions: { view: true, create: true, update: true, delete: true, approve: true, export: true } },
    { role: "Admin", permissions: { view: true, create: true, update: true, delete: false, approve: true, export: true } },
    { role: "Finance Auditor", permissions: { view: true, create: false, update: true, delete: false, approve: true, export: true } },
    { role: "Moderator", permissions: { view: true, create: false, update: true, delete: false, approve: true, export: false } },
    { role: "Support Desk", permissions: { view: true, create: false, update: true, delete: false, approve: false, export: false } },
    { role: "Content Editor", permissions: { view: true, create: true, update: true, delete: true, approve: false, export: false } }
  ]);

  const handlePermissionToggle = (roleName: string, permissionKey: keyof RolePermission["permissions"]) => {
    setRoles(prev => prev.map(r => {
      if (r.role === roleName) {
        const nextVal = !r.permissions[permissionKey];
        logAuditAction(`Toggled permission ${permissionKey} for role ${roleName} to ${nextVal ? "ON" : "OFF"}`);
        return {
          ...r,
          permissions: {
            ...r.permissions,
            [permissionKey]: nextVal
          }
        };
      }
      return r;
    }));
    toast.success("Granular role permission schema updated.");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="space-y-6 text-left text-xs font-semibold"
    >
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-3 select-none">
        <div>
          <h3 className="text-xs font-heading font-extrabold uppercase tracking-wide text-foreground">
            Platform Roles &amp; Security Permissions Matrix
          </h3>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Configure sub-admin account capabilities, lock deletions, grant billing export access, and edit roles.
          </p>
        </div>
      </div>

      {/* MATRIX CHART CARD */}
      <Card className="p-5 border-border bg-card shadow-soft overflow-hidden select-none">
        <h4 className="text-xs font-heading font-extrabold uppercase text-foreground border-b border-border/20 pb-2 mb-3 flex items-center gap-1.5">
          <Key size={14} className="text-primary animate-pulse" /> Access Control Matrix (RBAC)
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border/60 text-[9px] uppercase tracking-wider font-extrabold text-muted-foreground">
                <th className="pb-3 pl-2">System Role Name</th>
                <th className="pb-3 text-center">View (read)</th>
                <th className="pb-3 text-center">Create</th>
                <th className="pb-3 text-center">Update (edit)</th>
                <th className="pb-3 text-center">Delete</th>
                <th className="pb-3 text-center">Approve</th>
                <th className="pb-3 text-center">Export</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((r) => (
                <tr key={r.role} className="border-b border-border/40 hover:bg-muted/15 transition-colors">
                  <td className="py-3 pl-2 font-bold text-foreground">{r.role}</td>
                  
                  {Object.keys(r.permissions).map((permKey) => {
                    const checked = r.permissions[permKey as keyof RolePermission["permissions"]];
                    return (
                      <td key={permKey} className="py-3 text-center">
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={r.role === "Super Admin"} // Lock Super Admin permissions
                          onChange={() => handlePermissionToggle(r.role, permKey as any)}
                          className="h-4 w-4 cursor-pointer accent-primary disabled:cursor-not-allowed"
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* FOOTER EXPLANATION */}
      <div className="p-4 border border-border bg-muted/10 rounded-card text-muted-foreground/80 flex items-start gap-2.5">
        <ShieldCheck size={16} className="text-emerald-500 shrink-0 mt-0.5" />
        <div className="space-y-1 font-medium">
          <span className="text-foreground font-bold block">Role Based Access Control (RBAC) Details</span>
          <p className="text-[10px] leading-relaxed">
            Changing these matrix flags adjusts access parameters in real-time. Sub-admins accessing endpoints will experience limitations based on checked permissions (e.g. Finance auditors cannot delete courses).
          </p>
        </div>
      </div>
    </motion.div>
  );
}
