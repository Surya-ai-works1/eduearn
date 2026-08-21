"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Receipt, Wallet, Tag, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { PaymentService } from "../services/paymentService";
import { RazorpaySimSheet } from "./RazorpaySimSheet";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  courseTitle: string;
  price: number; // base price
  onSuccess?: () => void;
}

export function CheckoutModal({
  isOpen,
  onClose,
  courseId,
  courseTitle,
  price,
  onSuccess,
}: CheckoutModalProps) {
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [useWallet, setUseWallet] = useState(false);
  const [walletBalance] = useState(() => PaymentService.getWalletBalance().total);
  const [isRazorpayOpen, setIsRazorpayOpen] = useState(false);
  const [orderData, setOrderData] = useState<{ id: string; amount: number } | null>(null);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  // Pricing calculations
  const basePrice = price;
  const couponDiscount = appliedCoupon ? appliedCoupon.discount : 0;
  
  // Maximum wallet credit applicable is basePrice - couponDiscount
  const maxWalletApplicable = Math.max(0, basePrice - couponDiscount);
  const walletApplied = useWallet ? Math.min(walletBalance, maxWalletApplicable) : 0;

  const subtotal = Math.max(0, basePrice - couponDiscount - walletApplied);
  const gstTax = Math.round(subtotal * 0.18); // 18% GST
  const finalTotal = subtotal + gstTax;

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) return;
    const res = PaymentService.validateCoupon(couponCode.trim(), basePrice);
    if (res.success) {
      setAppliedCoupon({ code: couponCode.trim().toUpperCase(), discount: res.discountAmount });
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    toast.info("Coupon removed.");
  };

  const handleStartPayment = async () => {
    setIsCreatingOrder(true);
    try {
      const order = await PaymentService.createRazorpayOrder(finalTotal);
      setOrderData({ id: order.id, amount: finalTotal });
      setIsRazorpayOpen(true);
    } catch {
      toast.error("Failed to create checkout order.");
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const handlePaymentSuccess = async (paymentId: string) => {
    setIsRazorpayOpen(false);
    
    // Save to purchase history
    await PaymentService.addPurchase(courseId, courseTitle, finalTotal);
    
    // Deduct wallet if used
    if (walletApplied > 0) {
      PaymentService.deductWalletCredits(walletApplied);
    }

    toast.success(`Purchase completed successfully! Ref: ${paymentId}`);
    if (onSuccess) onSuccess();
    onClose();
  };

  const handlePaymentFailure = (error: string) => {
    setIsRazorpayOpen(false);
    toast.error(error || "Payment verification failed.");
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150]"
              onClick={onClose}
            />

            {/* Checkout Window */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-card border border-border shadow-sm hover:shadow-md transition-shadow duration-200 shadow-floating z-[151] rounded-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="p-4 border-b border-border/50 flex items-center justify-between bg-card shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                    <Receipt size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-heading font-extrabold text-foreground">Checkout Summary</h3>
                    <p className="text-[10px] text-muted-foreground font-bold">Secure Purchase</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-button transition-colors focus:outline-none"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 overflow-y-auto space-y-5 flex-1 text-xs">
                {/* Course Header card */}
                <Card variant="glass" className="p-4 flex flex-col gap-1 select-none border-primary/20">
                  <span className="text-[9px] font-black uppercase text-primary tracking-wide">Item Selection</span>
                  <h4 className="font-heading font-extrabold text-sm text-foreground line-clamp-1">{courseTitle}</h4>
                </Card>

                {/* Coupons Section */}
                <div className="space-y-2">
                  <label className="font-bold text-foreground flex items-center gap-1.5 select-none">
                    <Tag size={13} className="text-primary" /> Apply Promo Code
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. WELCOME10"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      disabled={!!appliedCoupon}
                      className="h-9 flex-1 rounded border border-border bg-card px-3 text-xs font-semibold uppercase text-foreground focus:outline-none focus:border-primary/50 disabled:opacity-60"
                    />
                    {appliedCoupon ? (
                      <Button variant="danger" onClick={handleRemoveCoupon} className="h-9 px-3 text-xs rounded">
                        Remove
                      </Button>
                    ) : (
                      <Button onClick={handleApplyCoupon} className="h-9 px-4 text-xs rounded shadow-soft">
                        Apply
                      </Button>
                    )}
                  </div>
                </div>

                {/* Wallet Balance Section */}
                {walletBalance > 0 && (
                  <div className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-muted/20 select-none">
                    <div className="flex items-center gap-2">
                      <Wallet size={15} className="text-emerald-500" />
                      <div>
                        <h5 className="font-bold text-foreground">EduEarn Wallet Credits</h5>
                        <p className="text-[9px] text-muted-foreground font-semibold">Available: ₹{walletBalance}</p>
                      </div>
                    </div>
                    <label className="relative flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={useWallet}
                        onChange={(e) => setUseWallet(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-border rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500" />
                    </label>
                  </div>
                )}

                {/* Billing Details */}
                <div className="space-y-2 border-t border-border/40 pt-4 font-semibold select-none">
                  <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-2">Billing Breakdown</h4>
                  
                  <div className="flex justify-between text-muted-foreground">
                    <span>Base Course Fee</span>
                    <span>₹{basePrice}</span>
                  </div>

                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-emerald-500 font-bold">
                      <span>Promo Discount ({appliedCoupon?.code})</span>
                      <span>-₹{couponDiscount}</span>
                    </div>
                  )}

                  {walletApplied > 0 && (
                    <div className="flex justify-between text-emerald-500 font-bold">
                      <span>Wallet Credits Applied</span>
                      <span>-₹{walletApplied}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>₹{subtotal}</span>
                  </div>

                  <div className="flex justify-between text-muted-foreground">
                    <span>Taxes (GST 18%)</span>
                    <span>₹{gstTax}</span>
                  </div>

                  <div className="flex justify-between text-sm font-heading font-black text-foreground border-t border-border/40 pt-2.5">
                    <span>Total Amount Payable</span>
                    <span className="text-primary">₹{finalTotal}</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-border/50 bg-card shrink-0 flex justify-end gap-3 select-none">
                <Button variant="ghost" onClick={onClose} className="h-9 text-xs">
                  Cancel
                </Button>
                <Button
                  onClick={handleStartPayment}
                  disabled={isCreatingOrder}
                  className="h-9 text-xs gap-2 px-6 shadow-soft"
                >
                  {isCreatingOrder ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Creating Order...
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} />
                      Proceed to Pay
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Razorpay Simulation Sheet */}
      {orderData && (
        <RazorpaySimSheet
          isOpen={isRazorpayOpen}
          amount={orderData.amount}
          orderId={orderData.id}
          onSuccess={handlePaymentSuccess}
          onFailure={handlePaymentFailure}
          onClose={() => setIsRazorpayOpen(false)}
        />
      )}
    </>
  );
}
