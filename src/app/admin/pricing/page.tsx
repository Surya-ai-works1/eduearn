"use client";

import FinanceTab from "@/app/admin/dashboard/components/finance/FinanceTab";

export default function AdminPricingPage() {
  const logAuditAction = (action: string) => {
    console.log("Audit:", action);
  };
  return <FinanceTab logAuditAction={logAuditAction} />;
}
