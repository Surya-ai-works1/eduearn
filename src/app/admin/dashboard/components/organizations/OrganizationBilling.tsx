"use client";

import React, { useState } from "react";
import { Card } from "../../../../../components/ui/card";
import { TenantOrg } from "./OrganizationsTab";
import { Coins, CreditCard, Clock, FileText } from "lucide-react";
import { Button } from "../../../../../components/ui/button";
import { toast } from "sonner";

interface SubComponentProps {
  org: TenantOrg;
}

export default function OrganizationBilling({ org }: SubComponentProps) {
  const [billingPlan, setBillingPlan] = useState(org.plan);

  const planRates = {
    Starter: { rate: "₹2,900/mo", seats: "25 seats", storage: "10 GB" },
    Professional: { rate: "₹7,900/mo", seats: "150 seats", storage: "50 GB" },
    Business: { rate: "₹14,900/mo", seats: "500 seats", storage: "200 GB" },
    Enterprise: { rate: "₹29,900/mo", seats: "Unlimited seats", storage: "1 TB" }
  };

  const handleUpdatePlan = (newPlan: any) => {
    setBillingPlan(newPlan);
    toast.success(`Billing subscription updated to: ${newPlan} Tier`);
  };

  return (
    <Card className="p-5 border-border bg-card space-y-5 text-left select-none shadow-soft">
      <div className="flex justify-between items-center pb-3 border-b border-border/30">
        <h3 className="text-xs font-heading font-extrabold uppercase text-foreground flex items-center gap-1.5">
          <Coins size={14} className="text-primary" /> Tenant Billing &amp; Subscriptions
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
        
        {/* Active plan status info */}
        <div className="space-y-4">
          <div className="p-4 border border-border/60 bg-muted/10 rounded-lg space-y-2">
            <span className="text-[10px] uppercase font-black tracking-wider text-muted-foreground block font-bold">Active SaaS Subscription Plan</span>
            <span className="text-foreground font-black text-lg block">{billingPlan} Plan</span>
            <span className="text-[10px] text-muted-foreground block mt-1">
              Rate: {planRates[billingPlan]?.rate} &bull; Capacity: {planRates[billingPlan]?.seats} ({planRates[billingPlan]?.storage} space)
            </span>
          </div>

          {/* Plan upgrades shortcuts */}
          <div className="p-4 border border-border/40 rounded-lg space-y-2 select-none">
            <span className="text-[10px] uppercase font-black tracking-wider text-muted-foreground block">Upgrade organization tier plan</span>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {["Starter", "Professional", "Business", "Enterprise"].map(pl => (
                <button
                  key={pl}
                  onClick={() => handleUpdatePlan(pl as any)}
                  className={`text-[9px] uppercase font-extrabold px-3 py-1 rounded border transition-all ${
                    billingPlan === pl ? "bg-primary text-white border-primary shadow-soft" : "bg-card text-muted-foreground border-border hover:bg-muted"
                  }`}
                >
                  {pl}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Invoice Histories */}
        <Card className="p-4 border-border bg-muted/10 space-y-3">
          <span className="text-[10px] uppercase font-black tracking-wider text-muted-foreground block flex items-center gap-1">
            <FileText size={11} /> Invoice billing logs history
          </span>

          <div className="space-y-2 text-xs font-semibold">
            {[
              { id: "inv-01", date: "2026-08-01", amount: planRates[billingPlan]?.rate, status: "Paid" },
              { id: "inv-02", date: "2026-07-01", amount: planRates[billingPlan]?.rate, status: "Paid" }
            ].map(inv => (
              <div key={inv.id} className="p-2.5 bg-card border border-border/40 rounded flex items-center justify-between">
                <div>
                  <span className="text-foreground font-black block">{inv.id}</span>
                  <span className="text-[9.5px] text-muted-foreground/60 block mt-0.5">Bill Date: {inv.date}</span>
                </div>
                <div className="text-right">
                  <span className="text-foreground font-black block">{inv.amount}</span>
                  <span className="text-[8.5px] font-black uppercase text-emerald-500 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">{inv.status}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

      </div>
    </Card>
  );
}
