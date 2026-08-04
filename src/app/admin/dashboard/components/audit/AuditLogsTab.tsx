"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Search, Clock, Trash2, Filter } from "lucide-react";
import { toast } from "sonner";
import { Card } from "../../../../../components/ui/card";
import { Button } from "../../../../../components/ui/button";

interface AuditLog {
  id: string;
  timestamp: string;
  adminName: string;
  action: string;
}

interface AuditLogsTabProps {
  auditLogs?: AuditLog[];
  setAuditLogs?: React.Dispatch<React.SetStateAction<AuditLog[]>>;
}

export default function AuditLogsTab({ auditLogs: propAuditLogs, setAuditLogs: propSetAuditLogs }: AuditLogsTabProps) {
  const [localAuditLogs, setLocalAuditLogs] = useState<AuditLog[]>([]);
  const auditLogs = propAuditLogs || localAuditLogs;
  const setAuditLogs = propSetAuditLogs || setLocalAuditLogs;

  const [searchQuery, setSearchQuery] = useState("");
  const [filterModule, setFilterModule] = useState("all");

  const handleClearLogs = () => {
    if (confirm("Are you sure you want to purge the security audit logs trail? This action is irreversible.")) {
      setAuditLogs([]);
      toast.success("Security audit trail logs cleared.");
    }
  };

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          log.adminName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

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
          <h3 className="text-xs font-heading font-extrabold uppercase tracking-wide text-foreground font-sans">
            Platform Security Audit Trails
          </h3>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Audit system actions, settings adjustments, and verification releases.
          </p>
        </div>
        <Button onClick={handleClearLogs} variant="outline" size="sm" className="h-8 text-[10px] text-rose-500 hover:bg-rose-500/10 border-rose-500/20">
          Clear Audit Trail
        </Button>
      </div>

      {/* FILTER SEARCH BAR */}
      <Card className="p-4 border-border bg-card shadow-soft">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 select-none">
          <div className="flex items-center gap-2 border border-border rounded-button bg-muted/15 px-3 py-1.5 w-full">
            <Search size={14} className="text-muted-foreground shrink-0" />
            <input
              type="text"
              placeholder="Search operator action records..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none text-xs text-foreground focus:outline-none w-full font-semibold"
            />
          </div>

          <select
            value={filterModule}
            onChange={(e) => setFilterModule(e.target.value)}
            className="border border-border rounded-button bg-card px-3 py-1.5 text-xs font-semibold focus:outline-none"
          >
            <option value="all">Filter: All Modules</option>
            <option value="finance">Finance Releases</option>
            <option value="moderation">Course moderation</option>
            <option value="users">User permissions</option>
          </select>
        </div>
      </Card>

      {/* AUDIT LOG TABLE LIST */}
      <Card className="p-5 border-border bg-card shadow-soft select-none overflow-hidden">
        <h4 className="text-xs font-heading font-extrabold uppercase text-foreground border-b border-border/20 pb-2 mb-3 flex items-center gap-1.5">
          <Clock size={14} className="text-primary" /> Active Operator Security Audit Trail ({filteredLogs.length} Actions)
        </h4>

        <div className="space-y-2.5 max-h-[450px] overflow-y-auto pr-1">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground/60">
              No audit logs captured yet. Perform dashboard actions to register entries.
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div
                key={log.id}
                className="border border-border bg-card p-3 rounded-card text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-soft hover:border-primary/20 transition-all font-semibold"
              >
                <div className="flex items-start sm:items-center gap-3">
                  <span className="text-[9px] font-extrabold bg-muted text-muted-foreground px-2 py-0.5 rounded shrink-0">
                    {log.adminName}
                  </span>
                  <span className="text-foreground leading-snug">{log.action}</span>
                </div>
                
                {/* Meta details */}
                <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                  <div className="flex gap-2 text-[8px] text-muted-foreground/60 font-mono font-bold">
                    <span>IP: 192.168.1.1</span>
                    <span>Chrome Windows</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-bold">{log.timestamp}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </motion.div>
  );
}
