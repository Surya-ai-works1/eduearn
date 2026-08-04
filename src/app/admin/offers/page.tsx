"use client";

import OffersTab from "@/app/admin/dashboard/components/offers/OffersTab";

export default function AdminOffersPage() {
  const logAuditAction = (action: string) => {
    console.log("Audit:", action);
  };
  return <OffersTab logAuditAction={logAuditAction} />;
}
