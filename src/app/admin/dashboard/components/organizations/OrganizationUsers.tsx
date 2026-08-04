"use client";

import React, { useState } from "react";
import { Card } from "../../../../../components/ui/card";
import { TenantOrg } from "./OrganizationsTab";
import { Users, Mail, Plus } from "lucide-react";
import { Button } from "../../../../../components/ui/button";
import { toast } from "sonner";

interface SubComponentProps {
  org: TenantOrg;
}

export default function OrganizationUsers({ org }: SubComponentProps) {
  const [usersList, setUsersList] = useState([
    { id: "usr-1", name: `${org.ownerName} (Owner)`, email: org.ownerEmail, role: "Administrator", status: "Active" },
    { id: "usr-2", name: "Suresh Kumar", email: `suresh@${org.domain}`, role: "Educator / Tutor", status: "Active" },
    { id: "usr-3", name: "Kiran Sen", email: `kiran@${org.domain}`, role: "Learner / Student", status: "Active" }
  ]);

  const handleInviteUser = () => {
    toast.success(`Invitation dispatch email queued for the tenant namespace`);
  };

  return (
    <Card className="p-5 border-border bg-card space-y-4 text-left select-none shadow-soft">
      <div className="flex justify-between items-center pb-3 border-b border-border/30">
        <h3 className="text-xs font-heading font-extrabold uppercase text-foreground flex items-center gap-1.5">
          <Users size={14} className="text-primary" /> Tenant Isolated Users Directory
        </h3>
        <Button size="sm" onClick={handleInviteUser} className="h-8 text-[9px] uppercase font-black">
          <Plus size={11} className="mr-1" /> Invite User
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs font-semibold">
          <thead>
            <tr className="border-b border-border/50 text-[9px] font-black uppercase text-muted-foreground">
              <th className="py-2.5 px-3">Name</th>
              <th className="py-2.5 px-3">Email</th>
              <th className="py-2.5 px-3">Role</th>
              <th className="py-2.5 px-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {usersList.map((u) => (
              <tr key={u.id} className="border-b border-border/10 hover:bg-muted/5">
                <td className="py-2.5 px-3 font-extrabold text-foreground">{u.name}</td>
                <td className="py-2.5 px-3 font-mono text-muted-foreground">{u.email}</td>
                <td className="py-2.5 px-3 font-extrabold text-primary">{u.role}</td>
                <td className="py-2.5 px-3">
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded border border-emerald-500/20 text-emerald-500 bg-emerald-500/10">{u.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
