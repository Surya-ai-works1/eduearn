import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Bell,
  BookOpenCheck,
  Bot,
  ChartNoAxesCombined,
  CircleDollarSign,
  ClipboardList,
  FileText,
  FolderTree,
  LayoutDashboard,
  MessagesSquare,
  ReceiptText,
  Settings,
  ShieldCheck,
  Tags,
  Users,
  Video,
  School,
  Globe,
  Scale,
} from "lucide-react";

export type AdminNavigationItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  pending?: boolean;
};

export type AdminNavigationGroup = {
  label: string;
  items: AdminNavigationItem[];
};

export const adminNavigation: AdminNavigationGroup[] = [
  {
    label: "OPERATIONS",
    items: [
      { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/dashboard?tab=organizations", label: "Organizations", icon: School },
      { href: "/admin/dashboard?tab=categories", label: "Categories", icon: FolderTree },
      { href: "/admin/dashboard?tab=courses", label: "Courses", icon: BookOpenCheck },
      { href: "/admin/dashboard?tab=tutors", label: "Tutors", icon: Users },
      { href: "/admin/dashboard?tab=students", label: "Students", icon: Users },
    ],
  },
  {
    label: "FINANCE",
    items: [
      { href: "/admin/dashboard?tab=payments", label: "Payments", icon: ReceiptText },
      { href: "/admin/dashboard?tab=finance", label: "Finance", icon: CircleDollarSign },
    ],
  },
  {
    label: "PLATFORM",
    items: [
      { href: "/admin/dashboard?tab=certificates", label: "Certificates", icon: ShieldCheck },
      { href: "/admin/dashboard?tab=cms", label: "CMS", icon: FileText },
      { href: "/admin/dashboard?tab=analytics", label: "Analytics", icon: ChartNoAxesCombined },
    ],
  },
  {
    label: "SECURITY",
    items: [
      { href: "/admin/dashboard?tab=reports", label: "Reports", icon: BarChart3 },
      { href: "/admin/dashboard?tab=audit-logs", label: "Audit Logs", icon: ClipboardList },
      { href: "/admin/dashboard?tab=security", label: "Security", icon: ShieldCheck },
    ],
  },
  {
    label: "SYSTEM",
    items: [
      { href: "/admin/dashboard?tab=settings", label: "Settings", icon: Settings },
      { href: "/admin/dashboard?tab=system-health", label: "System Health", icon: Bot },
    ],
  },
];

export function getAdminNavigationItem(pathname: string) {
  return adminNavigation.flatMap((group) => group.items).find((item) => item.href === pathname);
}
