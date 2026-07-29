"use client";

import RoleTab from "@/app/admin/dashboard/components/roles/RoleTab";

export default function AdminRolesPage() {
  const logAuditAction = (action: string) => {
    console.log("Audit:", action);
  };
  return <RoleTab logAuditAction={logAuditAction} />;
}
