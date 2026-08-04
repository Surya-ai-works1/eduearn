"use client";

import React, { useState } from "react";
import { Card } from "../../../../../components/ui/card";
import { TenantOrg } from "./OrganizationsTab";
import { ShieldCheck, Lock, Key, Power } from "lucide-react";
import { Button } from "../../../../../components/ui/button";
import { toast } from "sonner";

interface SubComponentProps {
  org: TenantOrg;
}

export default function OrganizationSecurity({ org }: SubComponentProps) {
  const [mfaEnforced, setMfaEnforced] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState(60); // minutes

  const handleSaveSecurity = () => {
    toast.success("Tenant organization security policy settings successfully committed");
  };

  return (
    <Card className="p-5 border-border bg-card space-y-5 text-left select-none shadow-soft">
      <div className="flex justify-between items-center pb-3 border-b border-border/30">
        <h3 className="text-xs font-heading font-extrabold uppercase text-foreground flex items-center gap-1.5">
          <ShieldCheck size={14} className="text-primary" /> Tenant Authentication &amp; Security Policy
        </h3>
        <Button size="sm" onClick={handleSaveSecurity} className="h-8 text-[9px] uppercase font-black">
          Commit Policies
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold text-muted-foreground select-none">
        
        {/* Policy switches */}
        <div className="space-y-4">
          <div className="p-4 border border-border/60 bg-muted/10 rounded-lg flex items-center justify-between">
            <div>
              <span className="text-foreground font-extrabold block">Enforce Multi-Factor Auth (MFA)</span>
              <span className="text-[9.5px] mt-0.5 block">Requires 2FA authentication on all roles</span>
            </div>
            <button
              onClick={() => setMfaEnforced(!mfaEnforced)}
              className={`w-10 h-5.5 rounded-full p-0.5 transition-all cursor-pointer ${
                mfaEnforced ? "bg-primary flex justify-end" : "bg-border flex justify-start"
              }`}
            >
              <span className="w-4.5 h-4.5 bg-card rounded-full shadow-soft" />
            </button>
          </div>

          <div className="p-4 border border-border/60 bg-muted/10 rounded-lg space-y-2">
            <span className="text-[10px] uppercase font-black tracking-wider text-muted-foreground block font-bold">Session Idle Timeout</span>
            <div className="flex gap-2">
              <input
                type="number"
                value={sessionTimeout}
                onChange={(e) => setSessionTimeout(parseInt(e.target.value) || 30)}
                className="h-10 w-24 rounded border border-border/80 bg-background px-3 font-mono font-bold text-foreground text-xs focus:outline-none"
              />
              <span className="text-muted-foreground/60 flex items-center">minutes before auto-logout</span>
            </div>
          </div>
        </div>

        {/* IP Access Roster */}
        <Card className="p-4 border-border bg-muted/10 space-y-3">
          <span className="text-[10px] uppercase font-black tracking-wider text-muted-foreground block flex items-center gap-1">
            <Lock size={11} /> IP Whitelist Restrictions (Allowed Range)
          </span>
          <textarea
            readOnly
            value="0.0.0.0/0 (All ranges allowed)"
            className="w-full h-24 bg-card/60 border border-border/60 rounded p-2 text-xs font-mono font-bold text-muted-foreground focus:outline-none resize-none"
          />
        </Card>

      </div>
    </Card>
  );
}
