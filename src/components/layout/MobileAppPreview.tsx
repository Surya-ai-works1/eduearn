"use client";

import React from "react";
import { Container } from "./Container";
import { Check, Smartphone, Download, QrCode } from "lucide-react";
import { motion } from "framer-motion";
import { Divider } from "../ui/divider";
import { toast } from "sonner";

export function MobileAppPreview() {
  const features = [
    "Offline Downloads: Learn without WiFi or mobile data.",
    "Push Reminders: Never miss your upcoming live classes.",
    "Peer Chat Rooms: Chat with your tutor and group peers.",
    "Wallet Withdrawals: Student tutors can request direct payouts via UPI.",
  ];

  return (
    <section className="w-full py-20 bg-muted/20 border-y border-border/40 select-none overflow-hidden relative">
      <Container className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Side Custom SVG Device Mockup */}
        <div className="lg:col-span-5 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
            className="w-full max-w-[280px] aspect-[9/18] bg-slate-900 border-8 border-border rounded-[32px] shadow-premium relative flex flex-col items-center justify-between p-4 overflow-hidden"
          >
            {/* Screen Notch */}
            <div className="absolute top-0 w-24 h-4 bg-slate-800 rounded-b-md z-15" />
 
            {/* Screen Top Bar */}
            <div className="w-full flex justify-between items-center text-[7px] font-bold text-muted-foreground/80 z-10 mt-1">
              <span>9:41 AM</span>
              <div className="flex items-center gap-1">
                <span>5G</span>
                <span className="w-4 h-2 border border-slate-600 rounded-sm" />
              </div>
            </div>

            {/* Mock Screen Content (Peer Chat) */}
            <div className="w-full grow flex flex-col gap-2.5 justify-center z-10 px-2 mt-4">
              {/* Message 1 */}
              <div className="bg-slate-800 p-2 rounded-r-input rounded-bl-input text-[8px] text-muted-foreground max-w-[85%] self-start text-left leading-relaxed">
                <span className="font-bold text-[7px] text-primary block mb-0.5">Priya (UI/UX Tutor)</span>
                {"Let's review the wireframe layouts today at 5:00 PM!"}
              </div>

              {/* Message 2 */}
              <div className="bg-primary/20 border border-primary/20 p-2 rounded-l-input rounded-br-input text-[8px] text-primary max-w-[85%] self-end text-left leading-relaxed">
                {"Sure Priya! I've uploaded my Figma draft link."}
              </div>

              {/* Audio node mock */}
              <div className="bg-slate-800 p-2 rounded-r-input rounded-bl-input text-[8px] text-muted-foreground max-w-[80%] self-start flex items-center gap-1.5">
                <Smartphone size={10} className="text-primary animate-pulse" />
                <span>Playing doubt audio (0:12)</span>
              </div>
            </div>

            {/* Screen Bottom Bar */}
            <div className="w-full flex justify-between items-center p-2 bg-slate-800/40 border border-border/10 rounded-input z-10">
              <span className="text-[7px] text-muted-foreground font-semibold">Tutor Wallet</span>
              <span className="text-[8px] text-accent font-extrabold">+₹4,500</span>
            </div>

            {/* Home indicator bar */}
            <div className="w-20 h-1 bg-slate-700 rounded-full mt-2 z-15" />
          </motion.div>
        </div>

        {/* Right Side App Info */}
        <div className="lg:col-span-7 flex flex-col items-start text-left gap-6">
          <span className="text-[10px] uppercase tracking-wider font-extrabold text-primary bg-primary/10 px-3 py-1 rounded-full">
            Mobile Access
          </span>
          <h2 className="text-3xl md:text-5xl font-heading font-extrabold text-foreground tracking-tight leading-tight">
            Learn and Earn <br />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              On the Go.
            </span>
          </h2>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-xl">
            Download the EduEarn mobile app to chat with tutors, attend live stream classes, download video files, and check payouts.
          </p>

          {/* Features List */}
          <ul className="flex flex-col gap-3">
            {features.map((feat, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                <Check size={14} className="text-accent shrink-0 mt-0.5" />
                <span>{feat}</span>
              </li>
            ))}
          </ul>

          <Divider variant="dashed" className="my-2" />

          {/* Download badges & QR Code */}
          <div className="flex flex-wrap items-center gap-6 w-full">
            {/* Badges container */}
            <div className="flex flex-col gap-2.5">
              <span className="text-[8px] uppercase tracking-wider font-extrabold text-muted-foreground/80">Available Stores</span>
              <div className="flex items-center gap-3">
                {/* Mock iOS store badge */}
                <button
                  onClick={() => toast.info("iOS Native App is in Private Beta! Access link will be shared via email soon.")}
                  className="px-3.5 py-2 rounded-button bg-slate-900 border border-border text-white text-[9px] font-bold flex items-center gap-2 cursor-pointer hover:bg-slate-850 transition-colors focus:outline-none"
                >
                  <Download size={11} />
                  <span>App Store</span>
                  <span className="text-[7px] uppercase bg-primary/20 text-primary px-1.5 py-0.2 rounded font-black tracking-wider shrink-0 scale-90">Beta</span>
                </button>
                
                {/* Mock Android store badge */}
                <button
                  onClick={() => toast.info("Android Native App is in Private Beta! Access link will be shared via email soon.")}
                  className="px-3.5 py-2 rounded-button bg-slate-900 border border-border text-white text-[9px] font-bold flex items-center gap-2 cursor-pointer hover:bg-slate-850 transition-colors focus:outline-none"
                >
                  <Download size={11} />
                  <span>Google Play</span>
                  <span className="text-[7px] uppercase bg-amber-500/20 text-amber-500 px-1.5 py-0.2 rounded font-black tracking-wider shrink-0 scale-90">Soon</span>
                </button>
              </div>
            </div>

            {/* QR Scanner card */}
            <div className="flex items-center gap-3 bg-card border border-border shadow-sm hover:shadow-md transition-shadow duration-200/50 p-2.5 rounded-input">
              <div className="w-12 h-12 bg-white flex items-center justify-center p-1 rounded border border-border">
                <QrCode size={40} className="text-slate-900" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[8px] uppercase tracking-wider font-extrabold text-muted-foreground/80">Scan to download</span>
                <span className="text-[10px] text-foreground font-semibold mt-0.5">Compatible with iOS &amp; Android</span>
              </div>
            </div>
          </div>

        </div>

      </Container>
    </section>
  );
}

export default MobileAppPreview;
