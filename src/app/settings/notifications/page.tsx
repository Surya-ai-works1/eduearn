"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Container } from "../../../components/layout/Container";
import { PageWrapper } from "../../../components/layout/PageWrapper";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Divider } from "../../../components/ui/divider";
import { ArrowLeft, Bell, Mail, Smartphone, Volume2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { communicationService, NotificationPreferences } from "../../../features/communication/services/communicationService";

export default function NotificationsSettingsPage() {
  const router = useRouter();
  const [prefs, setPrefs] = useState<NotificationPreferences | null>(null);

  useEffect(() => {
    setPrefs(communicationService.getPreferences());
  }, []);

  const handleToggle = (key: keyof NotificationPreferences) => {
    if (!prefs) return;
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
  };

  const handleSave = () => {
    if (!prefs) return;
    communicationService.savePreferences(prefs);
    toast.success("Notification preferences saved successfully!");
  };

  if (!prefs) {
    return (
      <PageWrapper>
        <div className="py-24 text-center text-xs text-muted-foreground animate-pulse">
          Loading preferences...
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <Container className="py-12 max-w-2xl select-none text-left">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-muted text-muted-foreground hover:text-foreground rounded-full transition"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h1 className="text-lg font-heading font-black text-foreground">Alert Preferences</h1>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Configure when and where you want to receive course updates and receipts.
              </p>
            </div>
          </div>

          <Card className="p-6 border-border bg-card shadow-soft space-y-6">
            {/* 1. Global channels */}
            <div className="space-y-4">
              <h3 className="text-xs font-heading font-extrabold text-foreground uppercase tracking-wide">
                Delivery Channels
              </h3>
              
              <div className="flex items-center justify-between p-3 bg-muted/20 border border-border rounded-xl">
                <div className="flex items-center gap-3">
                  <Mail className="text-primary" size={16} />
                  <div>
                    <span className="text-xs font-bold text-foreground block">Email Notifications</span>
                    <span className="text-[10px] text-muted-foreground leading-normal block">
                      Receive weekly highlights, receipts, and credential certificates in your inbox.
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={prefs.emailEnabled}
                  onChange={() => handleToggle("emailEnabled")}
                  className="w-4 h-4 text-primary bg-muted rounded border-border focus:ring-primary/45 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/20 border border-border rounded-xl">
                <div className="flex items-center gap-3">
                  <Smartphone className="text-primary" size={16} />
                  <div>
                    <span className="text-xs font-bold text-foreground block">Push Notifications</span>
                    <span className="text-[10px] text-muted-foreground leading-normal block">
                      Receive live session updates, chat replies, and announcements in-app.
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={prefs.pushEnabled}
                  onChange={() => handleToggle("pushEnabled")}
                  className="w-4 h-4 text-primary bg-muted rounded border-border focus:ring-primary/45 cursor-pointer"
                />
              </div>
            </div>

            <Divider />

            {/* 2. Specific Alert triggers */}
            <div className="space-y-4">
              <h3 className="text-xs font-heading font-extrabold text-foreground uppercase tracking-wide">
                Alert Triggers
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <span className="text-xs font-bold text-foreground block">Assignment Alerts</span>
                    <span className="text-[10px] text-muted-foreground block">Notify when assignments are published or due.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={prefs.assignmentAlerts}
                    onChange={() => handleToggle("assignmentAlerts")}
                    className="w-4 h-4 text-primary bg-muted rounded border-border focus:ring-primary/45 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <span className="text-xs font-bold text-foreground block">Course Updates</span>
                    <span className="text-[10px] text-muted-foreground block">Notify when tutors upload notes or lecture files.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={prefs.courseUpdates}
                    onChange={() => handleToggle("courseUpdates")}
                    className="w-4 h-4 text-primary bg-muted rounded border-border focus:ring-primary/45 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <span className="text-xs font-bold text-foreground block">Certificate Alerts</span>
                    <span className="text-[10px] text-muted-foreground block">Notify when course completion certificates are issued.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={prefs.certificateAlerts}
                    onChange={() => handleToggle("certificateAlerts")}
                    className="w-4 h-4 text-primary bg-muted rounded border-border focus:ring-primary/45 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <span className="text-xs font-bold text-foreground block">Live Sessions</span>
                    <span className="text-[10px] text-muted-foreground block">Notify 15 minutes before a scheduled Zoom/Meet starts.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={prefs.liveSessionReminders}
                    onChange={() => handleToggle("liveSessionReminders")}
                    className="w-4 h-4 text-primary bg-muted rounded border-border focus:ring-primary/45 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <span className="text-xs font-bold text-foreground block">Receipts & Payments</span>
                    <span className="text-[10px] text-muted-foreground block">Notify on successful course enrollments and wallet refunds.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={prefs.paymentAlerts}
                    onChange={() => handleToggle("paymentAlerts")}
                    className="w-4 h-4 text-primary bg-muted rounded border-border focus:ring-primary/45 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <Divider />

            {/* 3. Notification Sounds (Mock setup) */}
            <div className="flex items-center justify-between p-3 bg-muted/10 border border-border/80 rounded-xl">
              <div className="flex items-center gap-3">
                <Volume2 className="text-muted-foreground" size={16} />
                <div className="text-left">
                  <span className="text-xs font-bold text-foreground block">Notification Sounds</span>
                  <span className="text-[10px] text-muted-foreground block">Play audio tones on new messages.</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => toast.success("Playing mock notification alert chime!")}
                className="px-2.5 py-1 bg-muted hover:bg-muted/80 text-[9px] font-heading font-black text-foreground uppercase rounded-lg border border-border"
              >
                Test Sound
              </button>
            </div>

            {/* CTAs */}
            <div className="flex justify-end pt-2">
              <Button onClick={handleSave} size="sm" className="font-heading font-extrabold uppercase gap-1.5 shadow-soft">
                <ShieldCheck size={14} /> Save Preferences
              </Button>
            </div>
          </Card>
        </div>
      </Container>
    </PageWrapper>
  );
}
