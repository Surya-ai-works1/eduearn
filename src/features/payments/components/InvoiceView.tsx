"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Printer } from "lucide-react";
import { Button } from "../../../components/ui/button";

interface InvoiceViewProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceNo: string;
  courseTitle: string;
  amount: number;
  date: string;
  studentName?: string;
  studentEmail?: string;
}

export function InvoiceView({
  isOpen,
  onClose,
  invoiceNo,
  courseTitle,
  amount,
  date,
  studentName = "Rahul Sharma",
  studentEmail = "rahul.sharma@gmail.com",
}: InvoiceViewProps) {
  
  const handlePrint = () => {
    window.print();
  };

  const basePrice = Math.round(amount / 1.18);
  const gstTax = amount - basePrice;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[180] print:hidden"
            onClick={onClose}
          />

          {/* Invoice Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white text-slate-800 shadow-floating z-[181] rounded-2xl overflow-hidden flex flex-col max-h-[90vh] print:fixed print:inset-0 print:m-0 print:max-w-none print:bg-white print:text-black print:rounded-none print:shadow-none print:z-max"
          >
            {/* Header / Actions */}
            <div className="p-4 bg-background border-b border-border flex items-center justify-between print:hidden">
              <span className="text-xs font-bold text-muted-foreground">INVOICE PREVIEW</span>
              <div className="flex items-center gap-2">
                <Button onClick={handlePrint} variant="ghost" className="h-8 text-xs gap-1.5 hover:bg-muted">
                  <Printer size={14} />
                  Print / Save PDF
                </Button>
                <button
                  onClick={onClose}
                  className="p-1.5 text-muted-foreground/80 hover:text-slate-800 hover:bg-muted rounded-lg transition-colors focus:outline-none"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Printable Invoice Page */}
            <div className="flex-1 p-8 sm:p-12 overflow-y-auto print:p-0 print:overflow-visible">
              
              {/* Top Section */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-border pb-8">
                <div>
                  <h1 className="text-2xl font-black tracking-tight text-primary flex items-center gap-2">
                    <span className="w-8 h-8 rounded bg-primary text-white flex items-center justify-center font-extrabold text-sm select-none">E</span>
                    EduEarn
                  </h1>
                  <p className="text-xs text-muted-foreground/80 mt-1.5">Learn · Teach · Earn</p>
                  <p className="text-[10px] text-muted-foreground mt-1">Reg No: 3345/EDU/2026</p>
                </div>
                <div className="text-left sm:text-right text-xs">
                  <h2 className="text-lg font-extrabold text-slate-800">TAX INVOICE</h2>
                  <p className="font-bold text-muted-foreground mt-1">Invoice #: {invoiceNo}</p>
                  <p className="text-muted-foreground/80">Date: {date}</p>
                  <p className="text-muted-foreground/80">Payment: Razorpay Wallet/UPI</p>
                </div>
              </div>

              {/* Billed To / From */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-8 text-xs">
                <div>
                  <h3 className="font-black text-muted-foreground uppercase tracking-wider mb-2">Billed To</h3>
                  <p className="font-bold text-slate-800 text-sm">{studentName}</p>
                  <p className="text-muted-foreground">{studentEmail}</p>
                  <p className="text-muted-foreground/80">Student ID: edu-learner-1049</p>
                </div>
                <div>
                  <h3 className="font-black text-muted-foreground uppercase tracking-wider mb-2">Billed By</h3>
                  <p className="font-bold text-slate-800 text-sm">EduEarn EduTech Pvt Ltd</p>
                  <p className="text-muted-foreground">80 Feet Road, Koramangala</p>
                  <p className="text-muted-foreground/80">Bengaluru, Karnataka, 560034</p>
                  <p className="text-muted-foreground">GSTIN: 29AAFCE4492F1Z6 (Placeholder)</p>
                </div>
              </div>

              {/* Item Details Table */}
              <div className="border border-border rounded-lg overflow-hidden my-8">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-background border-b border-border font-bold text-slate-700">
                      <th className="p-3">Course / Path Description</th>
                      <th className="p-3 text-right">Taxable Value</th>
                      <th className="p-3 text-right">GST (18%)</th>
                      <th className="p-3 text-right">Total (INR)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border font-semibold text-muted-foreground">
                      <td className="p-3">
                        <span className="font-bold text-slate-800 block">{courseTitle}</span>
                        <span className="text-[10px] text-muted-foreground mt-0.5 block">Online e-learning platform license</span>
                      </td>
                      <td className="p-3 text-right">₹{basePrice}</td>
                      <td className="p-3 text-right">₹{gstTax}</td>
                      <td className="p-3 text-right font-bold text-slate-800">₹{amount}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Total Calculation */}
              <div className="flex flex-col items-end text-xs font-semibold space-y-1.5 border-t border-border pt-6">
                <div className="flex justify-between w-64 text-muted-foreground/80">
                  <span>Subtotal:</span>
                  <span>₹{basePrice}</span>
                </div>
                <div className="flex justify-between w-64 text-muted-foreground/80">
                  <span>Integrated GST (18%):</span>
                  <span>₹{gstTax}</span>
                </div>
                <div className="flex justify-between w-64 text-slate-800 text-sm font-black border-t border-border pt-2">
                  <span>Grand Total (Paid):</span>
                  <span className="text-primary">₹{amount}</span>
                </div>
              </div>

              {/* Thank you and notes */}
              <div className="mt-12 text-[10px] text-muted-foreground leading-relaxed border-t border-border pt-6 select-none">
                <p className="font-bold text-muted-foreground/80">Important Terms:</p>
                <p className="mt-1">1. This is a computer-generated tax invoice and requires no physical signature.</p>
                <p>2. Course purchases are eligible for refund requests within 14 days of purchase under EduEarn platform rules.</p>
                <p className="text-center font-bold text-muted-foreground/80 text-xs mt-6">Thank you for learning with EduEarn!</p>
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
