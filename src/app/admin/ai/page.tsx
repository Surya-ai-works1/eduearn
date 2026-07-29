"use client";

import AiControlTab from "@/app/admin/dashboard/components/ai/AiControlTab";

export default function AdminAiPage() {
  const logAuditAction = (action: string) => {
    console.log("Audit:", action);
  };
  return <AiControlTab logAuditAction={logAuditAction} />;
}
