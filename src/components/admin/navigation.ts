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
    label: "Website",
    items: [{ href: "/", label: "Back to website", icon: Globe }],
  },
  {
    label: "Overview",
    items: [{ href: "/admin", label: "Command center", icon: LayoutDashboard }],
  },
  {
    label: "Operations",
    items: [
      { href: "/admin/users", label: "Users", icon: Users },
      { href: "/admin/tutor-verification", label: "Tutor verification", icon: ShieldCheck },
      { href: "/admin/courses", label: "Course operations", icon: BookOpenCheck },
      { href: "/admin/academies", label: "Academy management", icon: School },
      { href: "/admin/learners", label: "Learner analytics", icon: BarChart3 },
      { href: "/admin/categories", label: "Catalog taxonomy", icon: FolderTree },
      { href: "/admin/live-classes", label: "Live classes", icon: Video, pending: true },
    ],
  },
  {
    label: "Finance",
    items: [
      { href: "/admin/payments", label: "Payments & payouts", icon: ReceiptText },
      { href: "/admin/pricing", label: "Pricing", icon: CircleDollarSign, pending: true },
      { href: "/admin/offers", label: "Offers & coupons", icon: Tags, pending: true },
    ],
  },
  {
    label: "Platform",
    items: [
      { href: "/admin/communication", label: "Support & broadcast", icon: MessagesSquare },
      { href: "/admin/cms", label: "Content management", icon: FileText, pending: true },
      { href: "/admin/analytics", label: "Analytics", icon: ChartNoAxesCombined },
      { href: "/admin/ai", label: "AI controls", icon: Bot, pending: true },
    ],
  },
  {
    label: "Governance",
    items: [
      { href: "/admin/roles", label: "Roles & access", icon: ShieldCheck, pending: true },
      { href: "/admin/audit-logs", label: "Audit trail", icon: ClipboardList, pending: true },
      { href: "/admin/settings", label: "Platform settings", icon: Settings },
      { href: "/admin/reports", label: "Moderation reports", icon: BarChart3, pending: true },
      { href: "/admin/policies", label: "Legal & compliance", icon: Scale },
    ],
  },
];

export function getAdminNavigationItem(pathname: string) {
  return adminNavigation.flatMap((group) => group.items).find((item) => item.href === pathname);
}
