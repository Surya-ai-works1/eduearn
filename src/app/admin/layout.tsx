import { AdminConsoleShell } from "@/components/admin/AdminConsoleShell";

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <AdminConsoleShell>{children}</AdminConsoleShell>;
}
