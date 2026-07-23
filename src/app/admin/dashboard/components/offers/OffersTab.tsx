"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Tag, Percent, Calendar, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { Card } from "../../../../../components/ui/card";
import { Button } from "../../../../../components/ui/button";
import { PaymentService, Coupon } from "../../../../../features/payments/services/paymentService";

interface OffersTabProps {
  logAuditAction: (actionStr: string) => void;
}

export default function OffersTab({ logAuditAction }: OffersTabProps) {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  
  // Coupon Builder State
  const [formCode, setFormCode] = useState("");
  const [formType, setFormType] = useState<Coupon["type"]>("percentage");
  const [formValue, setFormValue] = useState("");
  const [formMinPurchase, setFormMinPurchase] = useState("");
  const [formMaxDiscount, setFormMaxDiscount] = useState("");
  const [formExpiry, setFormExpiry] = useState("");
  const [formLimit, setFormLimit] = useState("");

  const loadCoupons = () => {
    setCoupons(PaymentService.getCoupons());
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCode.trim() || !formValue) return;

    const newCoupon: Coupon = {
      code: formCode.trim().toUpperCase(),
      type: formType,
      value: Number(formValue),
      minPurchase: Number(formMinPurchase || 0),
      maxDiscount: formMaxDiscount ? Number(formMaxDiscount) : undefined,
      expiryDate: formExpiry || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      usageLimit: Number(formLimit || 100),
      usageCount: 0
    };

    PaymentService.createCoupon(newCoupon);
    logAuditAction(`Created discount campaign coupon code: ${newCoupon.code}`);
    toast.success("Coupon code successfully created.");
    
    // Reset form
    setFormCode("");
    setFormValue("");
    setFormMinPurchase("");
    setFormMaxDiscount("");
    setFormExpiry("");
    setFormLimit("");
    loadCoupons();
  };

  const handleDeleteCoupon = (code: string) => {
    if (confirm(`Are you sure you want to permanently delete coupon "${code}"?`)) {
      if (typeof window !== "undefined") {
        const current = PaymentService.getCoupons().filter(c => c.code !== code);
        localStorage.setItem("eduearn_coupons", JSON.stringify(current));
      }
      logAuditAction(`Deleted platform coupon code: ${code}`);
      toast.success("Coupon code deleted.");
      loadCoupons();
    }
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
            Platform Offers Engine &amp; Discount Manager
          </h3>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Construct coupon vouchers, setup seasonal discount limits, and target courses/categories.
          </p>
        </div>
      </div>

      {/* COUPON CREATOR BUILDER FORM */}
      <Card className="p-5 border-border bg-card shadow-soft">
        <h4 className="text-xs font-heading font-extrabold uppercase text-foreground border-b border-border/20 pb-2 mb-4 flex items-center gap-1.5">
          <Plus size={14} /> Create Coupon Code / Campaign
        </h4>
        <form onSubmit={handleCreateCoupon} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-foreground">Coupon Code (Uppercase)</label>
              <input
                type="text"
                required
                placeholder="e.g. MONSOON30"
                value={formCode}
                onChange={(e) => setFormCode(e.target.value)}
                className="h-9 w-full rounded border border-border bg-muted/15 px-3 text-xs focus:outline-none uppercase"
              />
            </div>
            <div className="space-y-1">
              <label className="text-foreground">Reward Scheme Type</label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value as Coupon["type"])}
                className="h-9 w-full rounded border border-border bg-muted/15 px-3 text-xs focus:outline-none"
              >
                <option value="percentage">Percentage Discount (%)</option>
                <option value="flat">Flat Cash Discount (INR)</option>
                <option value="festival">Festival Campaign (Promo)</option>
                <option value="referral">Referral Code (Split)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-foreground">Discount Value</label>
              <input
                type="number"
                required
                placeholder="e.g. 15 or 500"
                value={formValue}
                onChange={(e) => setFormValue(e.target.value)}
                className="h-9 w-full rounded border border-border bg-muted/15 px-3 text-xs focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-foreground">Minimum Checkout Amount (₹)</label>
              <input
                type="number"
                placeholder="e.g. 499"
                value={formMinPurchase}
                onChange={(e) => setFormMinPurchase(e.target.value)}
                className="h-9 w-full rounded border border-border bg-muted/15 px-3 text-xs focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-foreground">Max Cap Discount (₹ - Optional)</label>
              <input
                type="number"
                placeholder="e.g. 200"
                value={formMaxDiscount}
                onChange={(e) => setFormMaxDiscount(e.target.value)}
                className="h-9 w-full rounded border border-border bg-muted/15 px-3 text-xs focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-foreground">Schedule Expiration Date</label>
              <input
                type="date"
                value={formExpiry}
                onChange={(e) => setFormExpiry(e.target.value)}
                className="h-9 w-full rounded border border-border bg-muted/15 px-3 text-xs focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-foreground">Usage Limit (Redemptions)</label>
              <input
                type="number"
                placeholder="e.g. 200"
                value={formLimit}
                onChange={(e) => setFormLimit(e.target.value)}
                className="h-9 w-full rounded border border-border bg-muted/15 px-3 text-xs focus:outline-none"
              />
            </div>
          </div>
          <Button type="submit" size="sm">Launch Campaign Coupon</Button>
        </form>
      </Card>

      {/* ACTIVE COUPONS MATRIX */}
      <Card className="p-5 border-border bg-card shadow-soft">
        <h4 className="text-xs font-heading font-extrabold uppercase text-foreground border-b border-border/20 pb-2 mb-3 flex items-center gap-1.5">
          <Tag size={14} className="text-primary" /> Active Platform Campaigns &amp; Coupons
        </h4>
        <div className="space-y-3">
          {coupons.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground/60">
              No active offers configured. Create one above to incentivize learners.
            </div>
          ) : (
            coupons.map((coupon) => (
              <div
                key={coupon.code}
                className="border border-border/40 p-3.5 bg-muted/5 rounded-card flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div>
                  <h5 className="font-extrabold text-foreground text-xs flex items-center gap-1.5 uppercase">
                    🏷️ {coupon.code}
                    <span className="text-[8px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-extrabold tracking-wide uppercase">
                      {coupon.type}
                    </span>
                  </h5>
                  <div className="flex flex-wrap gap-4 text-[10px] text-muted-foreground mt-1 font-semibold">
                    <span>Value: <span className="text-foreground font-bold">{coupon.type === "percentage" ? `${coupon.value}% off` : `₹${coupon.value} flat`}</span></span>
                    <span>Min Cart: ₹{coupon.minPurchase}</span>
                    {coupon.maxDiscount && <span>Max Cap: ₹{coupon.maxDiscount}</span>}
                    <span>Redemptions: <span className="text-foreground font-bold">{coupon.usageCount} / {coupon.usageLimit}</span></span>
                    <span className="flex items-center gap-1 text-[9px]"><Calendar size={10} /> Exp: {coupon.expiryDate}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 select-none">
                  <button
                    onClick={() => handleDeleteCoupon(coupon.code)}
                    className="p-1.5 hover:bg-destructive/10 text-muted-foreground hover:text-destructive border border-border rounded cursor-pointer transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </motion.div>
  );
}
