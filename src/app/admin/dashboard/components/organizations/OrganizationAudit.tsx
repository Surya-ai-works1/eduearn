"use client";

import React from "react";
import { Card } from "../../../../../components/ui/card";
import { TenantOrg } from "./OrganizationsTab";
import { Database } from "lucide-react";

interface SubComponentProps {
  org: TenantOrg;
}

export default function OrganizationAudit({ org }: SubComponentProps) {
  const auditLogs = [
    { id: "aud-01", actor: org.ownerName, action: "Modified Feature Flag certIssuerActive", date: "2026-08-02 13:00", ip: "192.168.1.14" },
    { id: "aud-02", actor: org.ownerName, action: "Updated primary DNS verification settings", date: "2026-08-02 12:45", ip: "192.168.1.14" },
    { id: "aud-03", actor: "System Agent", action: "Provisioned default Starter template index", date: "2026-05-10 09:30", ip: "127.0.0.1" }
  ];

  return (
    <Card className="p-5 border-border bg-card space-y-4 text-left select-none shadow-soft">
      <div className="flex justify-between items-center pb-3 border-b border-border/30">
        <h3 className="text-xs font-heading font-extrabold uppercase text-foreground flex items-center gap-1.5">
          <Database size={14} className="text-primary" /> Tenant Isolated Audit Logs
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs font-semibold">
          <thead>
            <tr className="border-b border-border/50 text-[9px] font-black uppercase text-muted-foreground">
              <th className="py-2.5 px-3">Actor</th>
              <th className="py-2.5 px-3">Action</th>
              <th className="py-2.5 px-3">IP Address</th>
              <th className="py-2.5 px-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {auditLogs.map((log) => (
              <tr key={log.id} className="border-b border-border/10 hover:bg-muted/5">
                <td className="py-2.5 px-3 font-extrabold text-foreground">{log.actor}</td>
                <td className="py-2.5 px-3 text-muted-foreground">{log.action}</td>
                <td className="py-2.5 px-3 font-mono text-muted-foreground/60">{log.ip}</td>
                <td className="py-2.5 px-3 text-muted-foreground/80">{log.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
