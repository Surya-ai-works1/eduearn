"use client";

import CMSTab from "@/app/admin/dashboard/components/cms/CMSTab";

export default function AdminCmsPage() {
  const logAuditAction = (action: string) => {
    console.log("Audit:", action);
  };
  return <CMSTab logAuditAction={logAuditAction} />;
}
