"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, Smartphone, ShieldCheck, ArrowRight, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface RazorpaySimSheetProps {
  isOpen: boolean;
  amount: number;
  orderId: string;
  onSuccess: (paymentId: string) => void;
  onFailure: (error: string) => void;
  onClose: () => void;
}

export function RazorpaySimSheet({
  isOpen,
  amount,
  orderId,
  onSuccess,
  onFailure,
  onClose,
}: RazorpaySimSheetProps) {
  const [method, setMethod] = useState<"UPI" | "Card" | "Netbanking" | null>(null);
  const [step, setStep] = useState<"options" | "paying" | "success" | "failure">("options");
  const [upiId, setUpiId] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [paymentId] = useState(() => `pay_${Math.random().toString(36).substring(2, 15)}`);



  const handlePaymentSubmit = () => {
    setStep("paying");
    
    // Simulate transaction delay
    setTimeout(() => {
      // 90% success rate simulator
      const isSuccessful = Math.random() > 0.05; 
      if (isSuccessful) {
        setStep("success");
        setTimeout(() => {
          onSuccess(paymentId);
        }, 1200);
      } else {
        setStep("failure");
        setTimeout(() => {
          onFailure("Payment rejected by bank gateway.");
        }, 1500);
      }
    }, 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]"
            onClick={() => step !== "paying" && onClose()}
          />

          {/* Razorpay Sheet Container */}
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 max-w-md mx-auto bg-[#1a1f36] border-t border-border rounded-t-3xl shadow-floating z-[201] overflow-hidden text-foreground flex flex-col font-sans select-none"
            style={{ height: "460px" }}
          >
            {/* Razorpay Brand Header */}
            <div className="bg-[#141829] px-6 py-4 flex items-center justify-between border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center font-extrabold text-[10px] text-white">
                  R
                </div>
                <div>
                  <h4 className="text-xs font-bold tracking-wider text-muted-foreground">RAZORPAY SECURE</h4>
                  <p className="text-[9px] text-muted-foreground/80 font-bold">Order ID: {orderId}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-muted-foreground">PAYING</span>
                <h3 className="text-sm font-black text-blue-400">₹{amount}</h3>
              </div>
            </div>

            {/* Inner Content */}
            <div className="flex-1 p-6 overflow-y-auto">
              {step === "options" && (
                <div className="space-y-5">
                  <h3 className="text-xs font-black uppercase text-muted-foreground tracking-wide mb-2">Select Payment Method</h3>
                  
                  {/* Options */}
                  <div className="grid grid-cols-1 gap-3">
                    <button
                      onClick={() => setMethod("UPI")}
                      className={`p-4 rounded-xl border flex items-center gap-3 transition-colors text-left focus:outline-none ${
                        method === "UPI" ? "border-blue-500 bg-blue-500/10" : "border-border hover:border-slate-600 bg-slate-800/40"
                      }`}
                    >
                      <Smartphone className="text-blue-400" size={18} />
                      <div>
                        <h4 className="text-xs font-bold">UPI / GPay / PhonePe</h4>
                        <p className="text-[9px] text-muted-foreground font-medium">Pay instantly using your VPA</p>
                      </div>
                    </button>

                    <button
                      onClick={() => setMethod("Card")}
                      className={`p-4 rounded-xl border flex items-center gap-3 transition-colors text-left focus:outline-none ${
                        method === "Card" ? "border-blue-500 bg-blue-500/10" : "border-border hover:border-slate-600 bg-slate-800/40"
                      }`}
                    >
                      <CreditCard className="text-blue-400" size={18} />
                      <div>
                        <h4 className="text-xs font-bold">Credit or Debit Card</h4>
                        <p className="text-[9px] text-muted-foreground font-medium">Visa, MasterCard, RuPay, Maestro</p>
                      </div>
                    </button>
                  </div>

                  {/* VPA Inputs or Card Input Details */}
                  {method === "UPI" && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                      <label className="text-[10px] font-black text-muted-foreground uppercase">UPI ID / VPA</label>
                      <input
                        type="text"
                        placeholder="e.g. username@upi"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className="h-10 w-full rounded-lg border border-slate-700 bg-slate-800/60 px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </motion.div>
                  )}

                  {method === "Card" && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-muted-foreground uppercase">Card Number</label>
                        <input
                          type="text"
                          maxLength={16}
                          placeholder="4111 2222 3333 4444"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          className="h-10 w-full rounded-lg border border-slate-700 bg-slate-800/60 px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-muted-foreground uppercase">Expiry (MM/YY)</label>
                          <input
                            type="text"
                            placeholder="12/28"
                            className="h-10 w-full rounded-lg border border-slate-700 bg-slate-800/60 px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-center"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-muted-foreground uppercase">CVV</label>
                          <input
                            type="password"
                            maxLength={3}
                            placeholder="***"
                            className="h-10 w-full rounded-lg border border-slate-700 bg-slate-800/60 px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-center"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              {step === "paying" && (
                <div className="h-full flex flex-col items-center justify-center gap-4 text-center">
                  <Loader2 className="animate-spin text-blue-500" size={40} />
                  <div>
                    <h3 className="font-bold text-sm">Processing Payment</h3>
                    <p className="text-[10px] text-muted-foreground mt-1">Please do not refresh this page or close the sheet</p>
                  </div>
                </div>
              )}

              {step === "success" && (
                <div className="h-full flex flex-col items-center justify-center gap-4 text-center">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-emerald-500">
                    <CheckCircle2 size={56} />
                  </motion.div>
                  <div>
                    <h3 className="font-bold text-sm">Payment Successful!</h3>
                    <p className="text-[10px] text-muted-foreground mt-1">Transaction Ref: {paymentId}</p>
                  </div>
                </div>
              )}

              {step === "failure" && (
                <div className="h-full flex flex-col items-center justify-center gap-4 text-center">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-rose-500">
                    <AlertCircle size={56} />
                  </motion.div>
                  <div>
                    <h3 className="font-bold text-sm">Payment Failed</h3>
                    <p className="text-[10px] text-rose-400 mt-1">Declined by your bank gateway</p>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="p-5 bg-[#141829] border-t border-border flex items-center justify-between shrink-0">
              <div className="flex items-center gap-1.5 text-[9px] font-bold text-muted-foreground uppercase">
                <ShieldCheck className="text-emerald-500" size={14} />
                PCI-DSS Compliant
              </div>
              {step === "options" && (
                <button
                  onClick={handlePaymentSubmit}
                  disabled={!method || (method === "UPI" && !upiId) || (method === "Card" && cardNumber.length < 16)}
                  className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white rounded-lg px-6 py-2.5 text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors focus:outline-none">
                  Pay ₹{amount}
                  <ArrowRight size={14} />
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
