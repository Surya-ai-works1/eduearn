"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AppHeader } from "../../../components/shared/AppHeader";
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  BookOpen,
  FolderKanban,
  Coins,
  FileSpreadsheet,
  Bell,
  Settings,
  BookOpenCheck,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Search,
  Sparkles,
  ShieldAlert,
  Trash2,
  Tag,
  Video,
  HelpCircle,
  Award,
  Globe,
  Database,
  BarChart3,
  Sliders,
  DollarSign,
  TrendingUp,
  Activity,
  LogOut,
  Calendar,
  Lock,
  Eye,
  CheckCircle2,
  Bookmark,
  Play,
  RefreshCw
} from "lucide-react";
import { RequireAdmin } from "../../../features/auth/components/RouteGuard";
import { useAuth } from "../../../hooks/useAuth";
import PageHeader from "./components/PageHeader";

interface SidebarGroup {
  title: string;
  items: {
    id: string;
    label: string;
    icon: React.ComponentType<any>;
  }[];
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSearchChange?: (val: string) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export default function DashboardLayout({
  children,
  activeTab,
  setActiveTab,
  onSearchChange,
  onRefresh,
  isRefreshing
}: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  // Title mapping for each tab\n  const titleMap: Record<string, string> = {\n    dashboard: \"Dashboard\",\n    users: \"Users Directory\",\n    students: \"Students\",\n    tutors: \"Tutors\",\n    \"tutor-verification\": \"Tutor Verification\",\n    categories: \"Categories Hierarchy\",\n    courses: \"Courses Inventory\",\n    \"live-classes\": \"Live Classes Monitor\",\n    payments: \"Payments Escrow\",\n    pricing: \"Pricing Settings\",\n    offers: \"Offers & Coupons\",\n    cms: \"Website CMS Layout\",\n    ai: \"AI Control Center\",\n    communication: \"Broadcast & Tickets\",\n    analytics: \"Analytics\",\n    roles: \"Roles & Matrix\",\n    \"audit-logs\": \"Audit Trails\",\n    settings: \"Platform Settings\"\n  };\n  const pageTitle = titleMap[activeTab] || \"Admin\";\n
  
  // Command Palette & Search States
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [paletteSearch, setPaletteSearch] = useState("");

  // Keyboard shortcut listener for Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const sidebarGroups: SidebarGroup[] = [
    {
      title: "OVERVIEW",
      items: [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard }
      ]
    },
    {
      title: "USER MANAGEMENT",
      items: [
        { id: "users", label: "Users Directory", icon: Users },
        { id: "students", label: "Students", icon: Bookmark },
        { id: "tutors", label: "Tutors", icon: Award },
        { id: "tutor-verification", label: "Tutor Verification", icon: ShieldCheck }
      ]
    },
    {
      title: "COURSE MANAGEMENT",
      items: [
        { id: "categories", label: "Categories Hierarchy", icon: FolderKanban },
        { id: "courses", label: "Courses inventory", icon: BookOpenCheck },
        { id: "live-classes", label: "Live Classes Monitor", icon: Video }
      ]
    },
    {
      title: "FINANCE",
      items: [
        { id: "payments", label: "Payments Escrow", icon: FileSpreadsheet },
        { id: "pricing", label: "Pricing settings", icon: Coins },
        { id: "offers", label: "Offers & Coupons", icon: Tag }
      ]
    },
    {
      title: "CONTENT CMS",
      items: [
        { id: "cms", label: "Website CMS Layout", icon: Globe }
      ]
    },
    {
      title: "COMMUNICATION",
      items: [
        { id: "communication", label: "Broadcast & Tickets", icon: Bell }
      ]
    },
    {
      title: "AI CONTROL",
      items: [
        { id: "ai", label: "AI Control Center", icon: Sparkles }
      ]
    },
    {
      title: "SYSTEM",
      items: [
        { id: "settings", label: "Platform Settings", icon: Settings },
        { id: "roles", label: "Roles & Matrix", icon: Lock },
        { id: "audit-logs", label: "Audit Trails", icon: Database }
      ]
    }
  ];

  // Flattened items for command palette matching
  const allPaletteItems = sidebarGroups.flatMap(g => g.items);
  const filteredPaletteItems = allPaletteItems.filter(item => 
    item.label.toLowerCase().includes(paletteSearch.toLowerCase())
  );

  return (
    <RequireAdmin>
      <div className="min-h-screen bg-background text-foreground flex select-none text-left relative overflow-x-hidden font-sans">
        
        {/* 1. DESKTOP SIDEBAR NAVIGATION */}
        <aside
          className={`sidebar-surface backdrop-blur-md hidden md:flex flex-col transition-all duration-300 fixed top-0 left-0 bottom-0 h-screen z-45 bg-card/95 border-r border-border/80 shadow-soft ${
            isSidebarCollapsed ? "w-20" : "w-64"
          }`}
        >
          {/* Collapse toggle button */}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="absolute -right-3 top-6 bg-primary text-white border border-primary/20 rounded-full p-1.5 cursor-pointer hover:opacity-90 shadow-soft focus:outline-none z-50 transition-transform duration-200"
            aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isSidebarCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
          </button>

          {/* Admin Avatar Header */}
          <div className="p-5 border-b border-border/40 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-black text-primary shrink-0 relative overflow-hidden select-none shadow-soft">
              {user?.avatarUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element -- User avatars are dynamically loaded from external Supabase Storage URLs */
                <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                user?.fullName.charAt(0)
              )}
            </div>
            {!isSidebarCollapsed && (
              <div className="min-w-0">
                <h4 className="text-xs font-extrabold text-foreground truncate">{user?.fullName}</h4>
                <span className="text-[8px] uppercase tracking-wider font-extrabold text-primary bg-primary/10 px-2 py-0.5 rounded-full mt-1 inline-block">
                  {user?.role}
                </span>
              </div>
            )}
          </div>

          {/* Navigation Items grouped */}
          <nav className="flex-1 p-3.5 flex flex-col gap-4 overflow-y-auto scrollbar-none select-none">
            {sidebarGroups.map((group) => (
              <div key={group.title} className="space-y-1">
                {!isSidebarCollapsed && (
                  <span className="text-[9px] font-black text-muted-foreground/50 tracking-widest block pl-2 mb-2 uppercase">
                    {group.title}
                  </span>
                )}
                {group.items.map((item) => {
                  const Icon = item.icon;
                  
                  // Active mapping: map sub-tabs to main tab containers
                  let isActive = activeTab === item.id;
                  if (activeTab === "students" && item.id === "students") isActive = true;
                  if (activeTab === "tutors" && item.id === "tutors") isActive = true;
                  if (activeTab === "tutor-verification" && item.id === "tutor-verification") isActive = true;

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                      }}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-button text-xs font-extrabold cursor-pointer transition-all duration-200 focus:outline-none w-full ${
                        isActive
                          ? "bg-primary text-white shadow-soft font-black"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      }`}
                    >
                      <Icon size={16} className="shrink-0" />
                      {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* Logout row */}
          <div className="p-4 border-t border-border/40 select-none">
            <button
              onClick={() => {
                logout();
                router.push("/login");
              }}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-button text-xs font-extrabold text-muted-foreground hover:text-red-500 hover:bg-red-500/10 cursor-pointer transition-all duration-200 focus:outline-none w-full"
            >
              <LogOut size={16} className="shrink-0" />
              {!isSidebarCollapsed && <span className="uppercase tracking-wider text-[10px]">Logout Panel</span>}
            </button>
          </div>
        </aside>

        {/* 2. MOBILE NAVIGATION DRAWER */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-45 md:hidden"
              />
              <motion.aside
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", bounce: 0.1, duration: 0.3 }}
                className="fixed top-0 left-0 bottom-0 w-64 bg-card border-r border-border backdrop-blur-md z-50 flex flex-col p-4 md:hidden"
              >
                <div className="flex items-center justify-between pb-3 border-b border-border/40 mb-3 select-none">
                  <span className="text-xs font-heading font-extrabold text-foreground">EduEarn Menu</span>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-1 hover:bg-muted rounded cursor-pointer text-foreground"
                  >
                    <X size={16} />
                  </button>
                </div>
                <nav className="flex-1 flex flex-col gap-4 overflow-y-auto scrollbar-none">
                  {sidebarGroups.map((group) => (
                    <div key={group.title} className="space-y-1">
                      <span className="text-[8px] font-extrabold text-muted-foreground/60 tracking-wider block pl-2 mb-1">
                        {group.title}
                      </span>
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              setActiveTab(item.id);
                              setIsMobileMenuOpen(false);
                            }}
                            className={`flex items-center gap-3 px-3 py-2 rounded-button text-[11px] font-semibold transition-all w-full cursor-pointer ${
                              isActive
                                ? "bg-primary text-white shadow-soft font-bold"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                            }`}
                          >
                            <Icon size={14} />
                            <span>{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </nav>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* 3. MAIN HEADER NAVBAR & CONTROLLER BODY */}
        <div className={`flex-1 flex flex-col overflow-hidden min-w-0 transition-all duration-300 ${
          isSidebarCollapsed ? "md:pl-20" : "md:pl-64"
        }`}>
          <AppHeader
            activeTab={activeTab}
            onSearchChange={onSearchChange}
            onRefresh={onRefresh}
            isRefreshing={isRefreshing}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
            isSidebarCollapsed={isSidebarCollapsed}
            setIsCommandPaletteOpen={setIsCommandPaletteOpen}
          />

          <PageHeader title={pageTitle} />
          {/* PAGE BODY VIEW */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-background relative z-10 scroll-smooth pt-20">
            {children}
          </main>
        </div>

        {/* 4. COMMAND PALETTE MODAL DIALOG */}
        <AnimatePresence>
          {isCommandPaletteOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsCommandPaletteOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-start justify-center pt-24"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -20 }}
                  transition={{ type: "spring", duration: 0.3 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-card border border-border shadow-modal rounded-card w-full max-w-lg overflow-hidden flex flex-col text-left"
                >
                  {/* Search Input */}
                  <div className="p-4 border-b border-border/50 flex items-center gap-3">
                    <Search size={16} className="text-muted-foreground shrink-0" />
                    <input
                      type="text"
                      autoFocus
                      placeholder="Type a module tab name (e.g. users, pricing)..."
                      value={paletteSearch}
                      onChange={(e) => setPaletteSearch(e.target.value)}
                      className="bg-transparent border-none text-xs text-foreground focus:outline-none w-full font-bold"
                    />
                    <button
                      onClick={() => setIsCommandPaletteOpen(false)}
                      className="p-1 hover:bg-muted rounded cursor-pointer text-muted-foreground hover:text-foreground"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  {/* Search Results list */}
                  <div className="max-h-[300px] overflow-y-auto p-2 space-y-0.5">
                    {filteredPaletteItems.length === 0 ? (
                      <div className="py-8 text-center text-xs text-muted-foreground/60 font-semibold">
                        No modules found matching your search.
                      </div>
                    ) : (
                      filteredPaletteItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              setActiveTab(item.id);
                              setIsCommandPaletteOpen(false);
                              setPaletteSearch("");
                            }}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-button text-xs font-semibold text-foreground hover:bg-primary hover:text-white transition-colors w-full text-left"
                          >
                            <Icon size={14} className="shrink-0" />
                            <span>{item.label}</span>
                          </button>
                        );
                      })
                    )}
                  </div>
                  
                  {/* Footer hotkeys */}
                  <div className="p-3 border-t border-border/30 bg-muted/10 text-[9px] text-muted-foreground flex items-center justify-between font-bold">
                    <span>Use Keyboard arrow keys to browse, Enter to select</span>
                    <span>ESC to close</span>
                  </div>
                </motion.div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

      </div>
    </RequireAdmin>
  );
}
