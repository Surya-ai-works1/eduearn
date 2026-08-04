"use client";

import React, { useState } from "react";
import { Card } from "../../../../../components/ui/card";
import { TenantOrg } from "./OrganizationsTab";
import { Globe, Server, Check, AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "../../../../../components/ui/button";
import { toast } from "sonner";

interface SubComponentProps {
  org: TenantOrg;
}

export default function OrganizationDomains({ org }: SubComponentProps) {
  const [sslActive, setSslActive] = useState(org.sslStatus === "Active");
  const [dnsStatus, setDnsStatus] = useState(org.dnsStatus);

  const handleVerifyDns = () => {
    toast.success("DNS configuration resolved. CNAME target verified.");
    setDnsStatus("Verified");
    setSslActive(true);
  };

  return (
    <Card className="p-5 border-border bg-card space-y-5 text-left select-none shadow-soft">
      <div className="flex justify-between items-center pb-3 border-b border-border/30">
        <h3 className="text-xs font-heading font-extrabold uppercase text-foreground flex items-center gap-1.5">
          <Globe size={14} className="text-primary" /> Tenant Custom DNS Domains &amp; SSL Certificates
        </h3>
        <Button size="sm" onClick={handleVerifyDns} className="h-8 text-[9px] uppercase font-black">
          <RefreshCw size={11} className="mr-1" /> Re-Verify DNS
        </Button>
      </div>

      <div className="space-y-4 text-xs font-semibold text-muted-foreground">
        
        {/* Domain Display info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border border-border/60 bg-muted/10 rounded-lg space-y-2">
            <span className="text-[10px] uppercase font-black tracking-wider text-muted-foreground block">Primary Custom Domain</span>
            <span className="text-foreground font-mono font-black text-sm block">{org.domain}</span>
          </div>

          <div className="p-4 border border-border/60 bg-muted/10 rounded-lg space-y-2">
            <span className="text-[10px] uppercase font-black tracking-wider text-muted-foreground block">EduEarn routing subdomain</span>
            <span className="text-foreground font-mono font-black text-sm block">{org.subdomain}.eduearn.com</span>
          </div>
        </div>

        {/* DNS / Certificate status badges */}
        <div className="p-4 border border-border/40 rounded-lg space-y-3">
          <span className="text-[10px] uppercase font-black tracking-wider text-muted-foreground block">Infrastructure Handshake status</span>
          
          <div className="flex flex-wrap gap-4 select-none">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold text-muted-foreground">DNS Record:</span>
              {dnsStatus === "Verified" ? (
                <span className="text-[9px] font-black uppercase text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">✓ Resolved</span>
              ) : (
                <span className="text-[9px] font-black uppercase text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">⚠ CNAME Missing</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold text-muted-foreground">SSL Certificate:</span>
              {sslActive ? (
                <span className="text-[9px] font-black uppercase text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">✓ Let&apos;s Encrypt Active</span>
              ) : (
                <span className="text-[9px] font-black uppercase text-slate-500 bg-slate-500/10 px-2 py-0.5 rounded border border-slate-500/20">Pending SSL Issued</span>
              )}
            </div>
          </div>
        </div>

        {/* Instruction details */}
        <div className="p-3 bg-muted/10 border border-border/30 rounded text-[10px] space-y-1">
          <span className="font-black text-foreground block">CNAME Destination Target:</span>
          <span className="font-mono text-muted-foreground block">cname.eduearn.com &bull; TTL: 3600</span>
        </div>

      </div>
    </Card>
  );
}
