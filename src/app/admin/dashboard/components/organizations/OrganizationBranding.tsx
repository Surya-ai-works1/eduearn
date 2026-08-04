"use client";

import React, { useState } from "react";
import { Card } from "../../../../../components/ui/card";
import { TenantOrg } from "./OrganizationsTab";
import { Layout, Palette, Image as ImageIcon, Save } from "lucide-react";
import { Button } from "../../../../../components/ui/button";
import { toast } from "sonner";

interface SubComponentProps {
  org: TenantOrg;
}

export default function OrganizationBranding({ org }: SubComponentProps) {
  const [primaryColor, setPrimaryColor] = useState("#6366F1");
  const [secondaryColor, setSecondaryColor] = useState("#4F46E5");
  const [loginBg, setLoginBg] = useState("Dark Glassmorphism");

  const handleSaveBranding = () => {
    toast.success("Organization tenant branding configuration saved");
  };

  return (
    <Card className="p-5 border-border bg-card space-y-5 text-left select-none shadow-soft">
      <div className="flex justify-between items-center pb-3 border-b border-border/30">
        <h3 className="text-xs font-heading font-extrabold uppercase text-foreground flex items-center gap-1.5">
          <Palette size={14} className="text-primary" /> Tenant Portal Branding Manager
        </h3>
        <Button size="sm" onClick={handleSaveBranding} className="h-8 text-[9px] uppercase font-black">
          <Save size={11} className="mr-1" /> Save Branding
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-black uppercase text-muted-foreground mb-1.5 block">Primary Interface Color</label>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-10 h-10 p-0.5 rounded border border-border bg-background cursor-pointer"
              />
              <input
                type="text"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="h-10 px-3 rounded border border-border/80 bg-background text-xs font-mono font-bold text-foreground focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-muted-foreground mb-1.5 block">Secondary Accent Color</label>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                className="w-10 h-10 p-0.5 rounded border border-border bg-background cursor-pointer"
              />
              <input
                type="text"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                className="h-10 px-3 rounded border border-border/80 bg-background text-xs font-mono font-bold text-foreground focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-black uppercase text-muted-foreground mb-1.5 block">Custom Login Background Theme</label>
            <select
              value={loginBg}
              onChange={(e) => setLoginBg(e.target.value)}
              className="h-10 w-full rounded border border-border bg-background px-3 text-xs font-bold text-foreground focus:outline-none"
            >
              <option value="Dark Glassmorphism">Dark Glassmorphism (Vibrant colors)</option>
              <option value="Gradient Flow">Aurora Gradient Flow animations</option>
              <option value="Clean Minimalist">Clean Minimalist Light/Dark Mode</option>
            </select>
          </div>

          <div className="p-4 border border-border/40 bg-muted/10 rounded-lg space-y-2">
            <span className="text-[10px] uppercase font-black tracking-wider text-muted-foreground block">Workspace Preview Frame</span>
            <div className="h-20 w-full rounded border border-border/40 relative overflow-hidden flex items-center justify-center bg-slate-950">
              <span className="text-[9px] font-black uppercase tracking-widest text-white animate-pulse">Preview Screen Layout</span>
              <div className="absolute inset-x-0 bottom-0 h-1.5" style={{ backgroundColor: primaryColor }} />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
