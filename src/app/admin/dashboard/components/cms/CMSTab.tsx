"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe, LayoutDashboard, Star, Tag, BookOpen, Layers, FileText,
  Check, X, Edit2, Trash, Plus, ArrowUp, ArrowDown, Eye, EyeOff,
  RefreshCw, Save, SendHorizontal, AlertCircle, CheckCircle2,
  ChevronDown, ChevronUp, Search, ToggleLeft, ToggleRight, Percent,
  Calendar, DollarSign, Hash
} from "lucide-react";
import { toast } from "sonner";
import { Card } from "../../../../../components/ui/card";
import { Button } from "../../../../../components/ui/button";
import {
  MarketplaceService,
  MarketplaceCategory
} from "../../../../../features/payments/services/marketplaceService";
import {
  PaymentService,
  Coupon
} from "../../../../../features/payments/services/paymentService";

// ─── Types ──────────────────────────────────────────────────────────────────

interface CMSTabProps {
  logAuditAction: (actionStr: string) => void;
}

interface HeroConfig {
  headline: string;
  subheadline: string;
  primaryCtaText: string;
  primaryCtaUrl: string;
  secondaryCtaText: string;
  secondaryCtaUrl: string;
  visible: boolean;
  lastSaved: string | null;
  lastPublished: string | null;
  status: "Draft" | "Published";
}

interface SectionConfig {
  id: string;
  label: string;
  enabled: boolean;
  order: number;
}

interface FeaturedCourse {
  id: string;
  title: string;
  tutorName: string;
  category: string;
  price: number;
  status: string;
  featured: boolean;
  homepageVisible: boolean;
  displayOrder: number;
}

interface CategoryCmsRow extends MarketplaceCategory {
  homepageVisible: boolean;
  featuredOnHome: boolean;
  displayOrder: number;
}

// ─── Default Hero Config ─────────────────────────────────────────────────────

const DEFAULT_HERO: HeroConfig = {
  headline: "Learn & Earn with India's Smartest Cohort Platform",
  subheadline: "Earn rewards, learn from expert industry tutors, and secure verifiable blockchain certificates.",
  primaryCtaText: "Start Learning",
  primaryCtaUrl: "/courses",
  secondaryCtaText: "Become a Tutor",
  secondaryCtaUrl: "/become-tutor",
  visible: true,
  lastSaved: null,
  lastPublished: null,
  status: "Published"
};

const DEFAULT_SECTIONS: SectionConfig[] = [
  { id: "hero", label: "Hero Banner", enabled: true, order: 1 },
  { id: "trending-categories", label: "Trending Categories", enabled: true, order: 2 },
  { id: "featured-courses", label: "Featured Courses", enabled: true, order: 3 },
  { id: "why-eduearn", label: "Why EduEarn", enabled: true, order: 4 },
  { id: "how-it-works", label: "How It Works", enabled: true, order: 5 },
  { id: "testimonials", label: "Testimonials", enabled: true, order: 6 },
  { id: "faq", label: "FAQ", enabled: true, order: 7 },
  { id: "blog", label: "Blog / Resources", enabled: false, order: 8 },
];

const CMS_HERO_KEY = "eduearn_landing_cms";
const CMS_SECTIONS_KEY = "eduearn_cms_sections";
const CMS_FEATURED_KEY = "eduearn_featured_courses";
const CMS_CAT_META_KEY = "eduearn_cms_category_meta";

// ─── Utility ─────────────────────────────────────────────────────────────────

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

// ─── Sub-Tab IDs ─────────────────────────────────────────────────────────────

type CmsTab = "overview" | "hero" | "categories" | "courses" | "offers" | "sections" | "content";

const CMS_TABS: { id: CmsTab; label: string; icon: React.ReactNode }[] = [
  { id: "overview", label: "Overview", icon: <LayoutDashboard size={13} /> },
  { id: "hero", label: "Hero", icon: <Globe size={13} /> },
  { id: "categories", label: "Categories", icon: <Layers size={13} /> },
  { id: "courses", label: "Featured Courses", icon: <BookOpen size={13} /> },
  { id: "offers", label: "Offers & Promotions", icon: <Tag size={13} /> },
  { id: "sections", label: "Sections", icon: <LayoutDashboard size={13} /> },
  { id: "content", label: "Content Blocks", icon: <FileText size={13} /> },
];

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function CMSTab({ logAuditAction }: CMSTabProps) {
  const [activeTab, setActiveTab] = useState<CmsTab>("overview");

  // ── Hero State ───────────────────────────────────────────────────────────
  const [hero, setHero] = useState<HeroConfig>(DEFAULT_HERO);
  const [heroSaving, setHeroSaving] = useState(false);

  // ── Categories State ─────────────────────────────────────────────────────
  const [catRows, setCatRows] = useState<CategoryCmsRow[]>([]);
  const [editingCat, setEditingCat] = useState<string | null>(null);
  const [catPricingEdit, setCatPricingEdit] = useState<Record<string, any>>({});

  // ── Featured Courses State ───────────────────────────────────────────────
  const [allCourses, setAllCourses] = useState<FeaturedCourse[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [courseSearch, setCourseSearch] = useState("");

  // ── Offers State ─────────────────────────────────────────────────────────
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [formCode, setFormCode] = useState("");
  const [formType, setFormType] = useState<Coupon["type"]>("percentage");
  const [formValue, setFormValue] = useState("");
  const [formMinPurchase, setFormMinPurchase] = useState("");
  const [formMaxDiscount, setFormMaxDiscount] = useState("");
  const [formExpiry, setFormExpiry] = useState("");
  const [formLimit, setFormLimit] = useState("");
  const [formStatus, setFormStatus] = useState<"Active" | "Inactive">("Active");

  // ── Sections State ───────────────────────────────────────────────────────
  const [sections, setSections] = useState<SectionConfig[]>(DEFAULT_SECTIONS);

  // ── Content Blocks (preserved) ───────────────────────────────────────────
  const [testimonials, setTestimonials] = useState([
    { name: "Rohan Das", text: "Best learning experience! The peer classroom whiteboard was extremely fluid." },
    { name: "Sneha Iyer", text: "Highly recommend the Web Design cohorts. I got an internship within 2 weeks of completing my certification!" }
  ]);
  const [newTestimonialName, setNewTestimonialName] = useState("");
  const [newTestimonialText, setNewTestimonialText] = useState("");
  const [faqs, setFaqs] = useState([
    { q: "How do I claim certificate codes?", a: "Once your course progress bar reaches 100%, check your student panel under certificates tab and copy your verified certificate hash." },
    { q: "What is the token reward coin ratio?", a: "Each coin represents ₹1. You can apply these coins to get direct flat discounts during product checks." }
  ]);
  const [newFaqQ, setNewFaqQ] = useState("");
  const [newFaqA, setNewFaqA] = useState("");
  const [blogs, setBlogs] = useState([
    { id: "blog-1", title: "Empowering Young Students to Earn through Mentorship", date: "June 28, 2026", author: "EduEarn Editorial" },
    { id: "blog-2", title: "Introduction to Next.js 16 and Tailwind CSS v4 design rules", date: "June 25, 2026", author: "Tech Team" }
  ]);
  const [newBlogTitle, setNewBlogTitle] = useState("");
  const [newBlogAuthor, setNewBlogAuthor] = useState("");

  // ═══════════════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════════════════

  const loadHero = useCallback(() => {
    const stored = loadFromStorage<any>(CMS_HERO_KEY, null);
    if (stored) {
      setHero({
        headline: stored.heroTitle || DEFAULT_HERO.headline,
        subheadline: stored.heroSubtitle || DEFAULT_HERO.subheadline,
        primaryCtaText: stored.primaryCtaText ?? DEFAULT_HERO.primaryCtaText,
        primaryCtaUrl: stored.primaryCtaUrl ?? DEFAULT_HERO.primaryCtaUrl,
        secondaryCtaText: stored.secondaryCtaText ?? DEFAULT_HERO.secondaryCtaText,
        secondaryCtaUrl: stored.secondaryCtaUrl ?? DEFAULT_HERO.secondaryCtaUrl,
        visible: stored.visible ?? true,
        lastSaved: stored.lastSaved ?? null,
        lastPublished: stored.lastPublished ?? null,
        status: stored.status ?? "Published"
      });
    }
  }, []);

  const loadCategories = useCallback(() => {
    const cats = MarketplaceService.getCategories();
    const meta = loadFromStorage<Record<string, any>>(CMS_CAT_META_KEY, {});
    const rows: CategoryCmsRow[] = cats.map((c, idx) => ({
      ...c,
      homepageVisible: meta[c.id]?.homepageVisible ?? true,
      featuredOnHome: meta[c.id]?.featuredOnHome ?? (idx < 4),
      displayOrder: meta[c.id]?.displayOrder ?? (idx + 1),
    }));
    rows.sort((a, b) => a.displayOrder - b.displayOrder);
    setCatRows(rows);
  }, []);

  const loadCourses = useCallback(async () => {
    setCoursesLoading(true);
    try {
      const res = await fetch("/api/admin/courses");
      if (res.ok) {
        const data = await res.json();
        const featuredMeta = loadFromStorage<Record<string, any>>(CMS_FEATURED_KEY, {});
        const mapped: FeaturedCourse[] = (data.courses || data || [])
          .filter((c: any) => c.status === "Approved" || c.status === "published" || c.status === "approved")
          .map((c: any, idx: number) => ({
            id: c.id,
            title: c.title || "Untitled Course",
            tutorName: c.tutorName || "Tutor",
            category: c.category || "General",
            price: Number(c.price || 0),
            status: c.status,
            featured: featuredMeta[c.id]?.featured ?? false,
            homepageVisible: featuredMeta[c.id]?.homepageVisible ?? true,
            displayOrder: featuredMeta[c.id]?.displayOrder ?? (idx + 1),
          }));
        setAllCourses(mapped);
      }
    } catch (err) {
      console.warn("Could not load courses for CMS:", err);
      setAllCourses([]);
    } finally {
      setCoursesLoading(false);
    }
  }, []);

  const loadCoupons = useCallback(() => {
    setCoupons(PaymentService.getCoupons());
  }, []);

  const loadSections = useCallback(() => {
    const stored = loadFromStorage<SectionConfig[]>(CMS_SECTIONS_KEY, DEFAULT_SECTIONS);
    setSections(stored);
  }, []);

  useEffect(() => {
    loadHero();
    loadCategories();
    loadCoupons();
    loadSections();
  }, [loadHero, loadCategories, loadCoupons, loadSections]);

  useEffect(() => {
    if (activeTab === "courses" && allCourses.length === 0 && !coursesLoading) {
      loadCourses();
    }
  }, [activeTab, allCourses.length, coursesLoading, loadCourses]);

  // ═══════════════════════════════════════════════════════════════════════
  // HERO ACTIONS
  // ═══════════════════════════════════════════════════════════════════════

  const handleSaveHeroDraft = () => {
    setHeroSaving(true);
    const saved = { ...hero, lastSaved: new Date().toISOString(), status: "Draft" as const };
    setHero(saved);
    saveToStorage(CMS_HERO_KEY, {
      heroTitle: saved.headline,
      heroSubtitle: saved.subheadline,
      primaryCtaText: saved.primaryCtaText,
      primaryCtaUrl: saved.primaryCtaUrl,
      secondaryCtaText: saved.secondaryCtaText,
      secondaryCtaUrl: saved.secondaryCtaUrl,
      visible: saved.visible,
      lastSaved: saved.lastSaved,
      lastPublished: saved.lastPublished,
      status: "Draft"
    });
    if (typeof window !== "undefined") window.dispatchEvent(new Event("storage"));
    setTimeout(() => { setHeroSaving(false); toast.success("Hero saved as draft."); }, 500);
    logAuditAction("Saved homepage hero as draft");
  };

  const handlePublishHero = () => {
    setHeroSaving(true);
    const now = new Date().toISOString();
    const published = { ...hero, lastSaved: now, lastPublished: now, status: "Published" as const };
    setHero(published);
    saveToStorage(CMS_HERO_KEY, {
      heroTitle: published.headline,
      heroSubtitle: published.subheadline,
      primaryCtaText: published.primaryCtaText,
      primaryCtaUrl: published.primaryCtaUrl,
      secondaryCtaText: published.secondaryCtaText,
      secondaryCtaUrl: published.secondaryCtaUrl,
      visible: published.visible,
      lastSaved: now,
      lastPublished: now,
      status: "Published"
    });
    if (typeof window !== "undefined") window.dispatchEvent(new Event("storage"));
    setTimeout(() => { setHeroSaving(false); toast.success("Hero section published to homepage."); }, 500);
    logAuditAction("Published homepage hero section");
  };

  // ═══════════════════════════════════════════════════════════════════════
  // CATEGORY ACTIONS
  // ═══════════════════════════════════════════════════════════════════════

  const saveCatMeta = (rows: CategoryCmsRow[]) => {
    const meta: Record<string, any> = {};
    rows.forEach(r => {
      meta[r.id] = {
        homepageVisible: r.homepageVisible,
        featuredOnHome: r.featuredOnHome,
        displayOrder: r.displayOrder
      };
    });
    saveToStorage(CMS_CAT_META_KEY, meta);
  };

  const toggleCatHomepage = (id: string) => {
    const updated = catRows.map(r => r.id === id ? { ...r, homepageVisible: !r.homepageVisible } : r);
    setCatRows(updated);
    saveCatMeta(updated);
    toast.success("Category homepage visibility updated.");
  };

  const toggleCatFeatured = (id: string) => {
    const updated = catRows.map(r => r.id === id ? { ...r, featuredOnHome: !r.featuredOnHome } : r);
    setCatRows(updated);
    saveCatMeta(updated);
    toast.success("Category featured status updated.");
  };

  const moveCat = (id: string, dir: "up" | "down") => {
    const idx = catRows.findIndex(r => r.id === id);
    if ((dir === "up" && idx === 0) || (dir === "down" && idx === catRows.length - 1)) return;
    const swapIdx = dir === "up" ? idx - 1 : idx + 1;
    const updated = [...catRows];
    const tmp = updated[idx].displayOrder;
    updated[idx] = { ...updated[idx], displayOrder: updated[swapIdx].displayOrder };
    updated[swapIdx] = { ...updated[swapIdx], displayOrder: tmp };
    updated.sort((a, b) => a.displayOrder - b.displayOrder);
    setCatRows(updated);
    saveCatMeta(updated);
  };

  const toggleCatStatus = (id: string) => {
    const updated = catRows.map(r => r.id === id
      ? { ...r, status: (r.status === "Enabled" ? "Disabled" : "Enabled") as "Enabled" | "Disabled" }
      : r
    );
    setCatRows(updated);
    // Sync to MarketplaceService
    const mkCats = updated.map(r => {
      const { homepageVisible, featuredOnHome, displayOrder, ...rest } = r;
      return rest as MarketplaceCategory;
    });
    MarketplaceService.saveCategories(mkCats);
    saveCatMeta(updated);
    toast.success("Category status updated and synced.");
    logAuditAction(`Updated category status: ${id}`);
  };

  const openPricingEdit = (row: CategoryCmsRow) => {
    setEditingCat(row.id);
    setCatPricingEdit({
      minPrice: row.minPrice ?? 1000,
      recommendedPrice: row.recommendedPrice ?? 1800,
      maxPrice: row.maxPrice ?? 25000,
      platformCommission: row.platformCommission ?? 20,
      defaultDiscount: row.defaultDiscount ?? 10,
    });
  };

  const savePricingEdit = (id: string) => {
    const updated = catRows.map(r => r.id === id ? {
      ...r,
      minPrice: Number(catPricingEdit.minPrice),
      recommendedPrice: Number(catPricingEdit.recommendedPrice),
      maxPrice: Number(catPricingEdit.maxPrice),
      platformCommission: Number(catPricingEdit.platformCommission),
      defaultDiscount: Number(catPricingEdit.defaultDiscount),
    } : r);
    setCatRows(updated);
    saveCatMeta(updated);
    const mkCats = updated.map(r => {
      const { homepageVisible, featuredOnHome, displayOrder, ...rest } = r;
      return rest as MarketplaceCategory;
    });
    MarketplaceService.saveCategories(mkCats);
    setEditingCat(null);
    toast.success("Category pricing rules saved and synced.");
    logAuditAction(`Updated pricing rules for category: ${id}`);
  };

  // ═══════════════════════════════════════════════════════════════════════
  // FEATURED COURSES ACTIONS
  // ═══════════════════════════════════════════════════════════════════════

  const saveFeaturedMeta = (courses: FeaturedCourse[]) => {
    const meta: Record<string, any> = {};
    courses.forEach(c => {
      meta[c.id] = {
        featured: c.featured,
        homepageVisible: c.homepageVisible,
        displayOrder: c.displayOrder
      };
    });
    saveToStorage(CMS_FEATURED_KEY, meta);
  };

  const toggleFeatured = (id: string) => {
    const updated = allCourses.map(c => c.id === id ? { ...c, featured: !c.featured } : c);
    setAllCourses(updated);
    saveFeaturedMeta(updated);
    toast.success("Featured status updated.");
  };

  const toggleCourseHomepage = (id: string) => {
    const updated = allCourses.map(c => c.id === id ? { ...c, homepageVisible: !c.homepageVisible } : c);
    setAllCourses(updated);
    saveFeaturedMeta(updated);
    toast.success("Homepage visibility updated.");
  };

  const moveCourse = (id: string, dir: "up" | "down") => {
    const sorted = [...allCourses].sort((a, b) => a.displayOrder - b.displayOrder);
    const idx = sorted.findIndex(c => c.id === id);
    if ((dir === "up" && idx === 0) || (dir === "down" && idx === sorted.length - 1)) return;
    const swapIdx = dir === "up" ? idx - 1 : idx + 1;
    const tmp = sorted[idx].displayOrder;
    sorted[idx] = { ...sorted[idx], displayOrder: sorted[swapIdx].displayOrder };
    sorted[swapIdx] = { ...sorted[swapIdx], displayOrder: tmp };
    setAllCourses(sorted);
    saveFeaturedMeta(sorted);
  };

  // ═══════════════════════════════════════════════════════════════════════
  // OFFERS ACTIONS
  // ═══════════════════════════════════════════════════════════════════════

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCode.trim() || !formValue) return;
    const newCoupon: Coupon = {
      code: formCode.trim().toUpperCase(),
      type: formType,
      value: Number(formValue),
      minPurchase: Number(formMinPurchase || 0),
      maxDiscount: formMaxDiscount ? Number(formMaxDiscount) : undefined,
      expiryDate: formExpiry || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      usageLimit: Number(formLimit || 100),
      usageCount: 0,
      status: formStatus
    };
    PaymentService.createCoupon(newCoupon);
    logAuditAction(`Created coupon: ${newCoupon.code}`);
    toast.success(`Coupon "${newCoupon.code}" created.`);
    setFormCode(""); setFormValue(""); setFormMinPurchase(""); setFormMaxDiscount(""); setFormExpiry(""); setFormLimit("");
    loadCoupons();
  };

  const handleToggleCouponStatus = (code: string) => {
    const current = PaymentService.getCoupons();
    const updated = current.map(c => c.code === code
      ? { ...c, status: (c.status === "Active" ? "Inactive" : "Active") as "Active" | "Inactive" }
      : c
    );
    if (typeof PaymentService.saveCoupons === "function") {
      (PaymentService as any).saveCoupons(updated);
    } else {
      saveToStorage("eduearn_coupons", updated);
    }
    toast.success("Coupon status toggled.");
    loadCoupons();
    logAuditAction(`Toggled coupon status: ${code}`);
  };

  const handleDeleteCoupon = (code: string) => {
    if (!confirm(`Delete coupon "${code}"?`)) return;
    PaymentService.deleteCoupon(code);
    logAuditAction(`Deleted coupon: ${code}`);
    toast.success("Coupon deleted.");
    loadCoupons();
  };

  // ═══════════════════════════════════════════════════════════════════════
  // SECTIONS ACTIONS
  // ═══════════════════════════════════════════════════════════════════════

  const toggleSection = (id: string) => {
    const updated = sections.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s);
    setSections(updated);
    saveToStorage(CMS_SECTIONS_KEY, updated);
    toast.success("Section visibility updated.");
    logAuditAction(`Toggled homepage section: ${id}`);
  };

  const moveSection = (id: string, dir: "up" | "down") => {
    const sorted = [...sections].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex(s => s.id === id);
    if ((dir === "up" && idx === 0) || (dir === "down" && idx === sorted.length - 1)) return;
    const swapIdx = dir === "up" ? idx - 1 : idx + 1;
    const tmp = sorted[idx].order;
    sorted[idx] = { ...sorted[idx], order: sorted[swapIdx].order };
    sorted[swapIdx] = { ...sorted[swapIdx], order: tmp };
    setSections(sorted);
    saveToStorage(CMS_SECTIONS_KEY, sorted);
  };

  // ═══════════════════════════════════════════════════════════════════════
  // OVERVIEW STATS
  // ═══════════════════════════════════════════════════════════════════════

  const overviewStats = {
    homepageStatus: hero.status,
    lastSaved: hero.lastSaved ? new Date(hero.lastSaved).toLocaleString() : "Never",
    lastPublished: hero.lastPublished ? new Date(hero.lastPublished).toLocaleString() : "Never",
    activeCategories: catRows.filter(c => c.status === "Enabled").length,
    featuredCategories: catRows.filter(c => c.featuredOnHome).length,
    featuredCourses: allCourses.filter(c => c.featured).length,
    activeCoupons: coupons.filter(c => (c.status ?? "Active") === "Active").length,
    sectionsEnabled: sections.filter(s => s.enabled).length,
  };

  // ═══════════════════════════════════════════════════════════════════════
  // INPUT FIELD HELPER
  // ═══════════════════════════════════════════════════════════════════════

  const inputCls = "h-9 w-full rounded border border-border bg-muted/15 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/40";
  const labelCls = "text-[10px] font-semibold text-muted-foreground uppercase tracking-wide";

  // ═══════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="space-y-5 text-xs"
    >
      {/* ── Page Header ───────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-3">
        <div>
          <h3 className="text-xs font-heading font-extrabold uppercase tracking-wide text-foreground">
            Homepage Management — Landing Page Control Center
          </h3>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Configure what students see. Control categories, hero copy, featured courses, offers, and section order.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
            hero.status === "Published"
              ? "bg-green-500/10 border-green-500/30 text-green-600"
              : "bg-yellow-500/10 border-yellow-500/30 text-yellow-600"
          }`}>
            {hero.status === "Published" ? <CheckCircle2 size={10} /> : <AlertCircle size={10} />}
            {hero.status}
          </span>
        </div>
      </div>

      {/* ── Sub-Tab Nav ───────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-1 border-b border-border/30 pb-2">
        {CMS_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wide transition-colors cursor-pointer ${
              activeTab === tab.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.15 }}
        >
          {/* A. OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Homepage Status", value: overviewStats.homepageStatus, color: overviewStats.homepageStatus === "Published" ? "text-green-500" : "text-yellow-500" },
                  { label: "Last Updated", value: overviewStats.lastSaved },
                  { label: "Last Published", value: overviewStats.lastPublished },
                  { label: "Sections Enabled", value: `${overviewStats.sectionsEnabled} / ${sections.length}` },
                  { label: "Active Categories", value: overviewStats.activeCategories },
                  { label: "Featured on Home", value: overviewStats.featuredCategories },
                  { label: "Featured Courses", value: allCourses.length === 0 ? "Load tab to see" : String(overviewStats.featuredCourses) },
                  { label: "Active Offers", value: overviewStats.activeCoupons },
                ].map(stat => (
                  <Card key={stat.label} className="p-3 border-border bg-card shadow-soft">
                    <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wide">{stat.label}</p>
                    <p className={`text-sm font-extrabold mt-0.5 ${stat.color || "text-foreground"}`}>{stat.value}</p>
                  </Card>
                ))}
              </div>

              <Card className="p-4 border-border bg-card">
                <h4 className="text-[10px] font-extrabold uppercase tracking-wide text-foreground border-b border-border/20 pb-2 mb-3">
                  Quick Actions
                </h4>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" className="h-7 text-[10px]" onClick={() => setActiveTab("hero")}>
                    <Edit2 size={10} className="mr-1" /> Edit Hero
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={() => setActiveTab("categories")}>
                    <Layers size={10} className="mr-1" /> Manage Categories
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={() => setActiveTab("courses")}>
                    <BookOpen size={10} className="mr-1" /> Featured Courses
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={() => setActiveTab("offers")}>
                    <Tag size={10} className="mr-1" /> Manage Offers
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={() => setActiveTab("sections")}>
                    <Layers size={10} className="mr-1" /> Section Order
                  </Button>
                </div>
              </Card>

              <Card className="p-4 border-border bg-card">
                <h4 className="text-[10px] font-extrabold uppercase tracking-wide text-foreground border-b border-border/20 pb-2 mb-3">
                  Homepage Sections — Status
                </h4>
                <div className="space-y-1.5">
                  {[...sections].sort((a, b) => a.order - b.order).map(s => (
                    <div key={s.id} className="flex items-center justify-between py-1 px-2 rounded bg-muted/10 border border-border/20">
                      <span className="text-xs font-semibold text-foreground">{s.label}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${s.enabled ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-500"}`}>
                        {s.enabled ? "ON" : "OFF"}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* B. HERO CONTROL */}
          {activeTab === "hero" && (
            <div className="space-y-4">
              <Card className="p-5 border-border bg-card shadow-soft">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-[10px] font-extrabold uppercase tracking-wide text-foreground flex items-center gap-1.5">
                    <Globe size={13} className="text-primary" /> Hero Section Configuration
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-muted-foreground">Visibility:</span>
                    <button
                      onClick={() => setHero(h => ({ ...h, visible: !h.visible }))}
                      className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                        hero.visible
                          ? "bg-green-500/10 border-green-500/30 text-green-600"
                          : "bg-muted/20 border-border text-muted-foreground"
                      }`}
                    >
                      {hero.visible ? <Eye size={10} /> : <EyeOff size={10} />}
                      {hero.visible ? "Visible" : "Hidden"}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className={labelCls}>Hero Headline</label>
                    <input
                      type="text"
                      value={hero.headline}
                      onChange={e => setHero(h => ({ ...h, headline: e.target.value }))}
                      className={inputCls}
                      placeholder="Main heading students see..."
                    />
                  </div>
                  <div className="space-y-1">
                    <label className={labelCls}>Sub-Headline</label>
                    <input
                      type="text"
                      value={hero.subheadline}
                      onChange={e => setHero(h => ({ ...h, subheadline: e.target.value }))}
                      className={inputCls}
                      placeholder="Supporting description text..."
                    />
                  </div>
                  <div className="space-y-1">
                    <label className={labelCls}>Primary CTA Text</label>
                    <input
                      type="text"
                      value={hero.primaryCtaText}
                      onChange={e => setHero(h => ({ ...h, primaryCtaText: e.target.value }))}
                      className={inputCls}
                      placeholder="e.g. Start Learning"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className={labelCls}>Primary CTA Destination</label>
                    <input
                      type="text"
                      value={hero.primaryCtaUrl}
                      onChange={e => setHero(h => ({ ...h, primaryCtaUrl: e.target.value }))}
                      className={inputCls}
                      placeholder="/courses"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className={labelCls}>Secondary CTA Text</label>
                    <input
                      type="text"
                      value={hero.secondaryCtaText}
                      onChange={e => setHero(h => ({ ...h, secondaryCtaText: e.target.value }))}
                      className={inputCls}
                      placeholder="e.g. Become a Tutor"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className={labelCls}>Secondary CTA Destination</label>
                    <input
                      type="text"
                      value={hero.secondaryCtaUrl}
                      onChange={e => setHero(h => ({ ...h, secondaryCtaUrl: e.target.value }))}
                      className={inputCls}
                      placeholder="/become-tutor"
                    />
                  </div>
                </div>

                <div className="border-t border-border/20 pt-4 mt-4 flex items-center gap-3 flex-wrap">
                  <div className="text-[9px] text-muted-foreground space-y-0.5">
                    {hero.lastSaved && <p>Last saved: {new Date(hero.lastSaved).toLocaleString()}</p>}
                    {hero.lastPublished && <p>Last published: {new Date(hero.lastPublished).toLocaleString()}</p>}
                  </div>
                  <div className="flex gap-2 ml-auto">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-[10px]"
                      onClick={handleSaveHeroDraft}
                      disabled={heroSaving}
                    >
                      <Save size={10} className="mr-1" /> Save Draft
                    </Button>
                    <Button
                      size="sm"
                      className="h-8 text-[10px]"
                      onClick={handlePublishHero}
                      disabled={heroSaving}
                    >
                      <SendHorizontal size={10} className="mr-1" /> Publish to Homepage
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Preview */}
              <Card className="p-4 border-border bg-muted/5">
                <p className="text-[9px] font-bold uppercase text-muted-foreground mb-2">Live Preview</p>
                <div className={`rounded-lg border border-border/30 p-6 bg-gradient-to-r from-primary/5 to-primary/10 ${!hero.visible ? "opacity-40" : ""}`}>
                  <p className="text-base font-extrabold text-foreground leading-tight">{hero.headline || "—"}</p>
                  <p className="text-xs text-muted-foreground mt-1">{hero.subheadline || "—"}</p>
                  <div className="flex gap-2 mt-3">
                    <span className="px-3 py-1 rounded bg-primary text-primary-foreground text-[10px] font-bold">{hero.primaryCtaText}</span>
                    <span className="px-3 py-1 rounded border border-border text-[10px] font-bold text-foreground">{hero.secondaryCtaText}</span>
                  </div>
                  {!hero.visible && (
                    <p className="text-[9px] text-red-500 font-bold mt-2">⚠ Hero is set to hidden</p>
                  )}
                </div>
              </Card>
            </div>
          )}

          {/* C. CATEGORY / SUBJECT CONTROL */}
          {activeTab === "categories" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-[10px] font-extrabold uppercase tracking-wide text-foreground">Category Homepage Control</h4>
                  <p className="text-[9px] text-muted-foreground mt-0.5">Configure which categories appear on the homepage, their order, and pricing rules.</p>
                </div>
                <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={loadCategories}>
                  <RefreshCw size={10} className="mr-1" /> Refresh
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-[10px]">
                  <thead>
                    <tr className="bg-muted/30 border-b border-border/40">
                      {["Order", "Category", "Status", "Homepage", "Featured", "Price Range", "Commission", "Discount", "Actions"].map(h => (
                        <th key={h} className="text-left px-3 py-2 text-[9px] font-extrabold uppercase tracking-wide text-muted-foreground whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {catRows.map((row, idx) => (
                      <React.Fragment key={row.id}>
                        <tr className="border-b border-border/20 hover:bg-muted/10 transition-colors">
                          <td className="px-3 py-2">
                            <div className="flex gap-0.5">
                              <button onClick={() => moveCat(row.id, "up")} disabled={idx === 0} className="p-0.5 hover:bg-muted/30 rounded disabled:opacity-30 cursor-pointer"><ArrowUp size={10} /></button>
                              <button onClick={() => moveCat(row.id, "down")} disabled={idx === catRows.length - 1} className="p-0.5 hover:bg-muted/30 rounded disabled:opacity-30 cursor-pointer"><ArrowDown size={10} /></button>
                            </div>
                          </td>
                          <td className="px-3 py-2 font-bold text-foreground">{row.name}</td>
                          <td className="px-3 py-2">
                            <button
                              onClick={() => toggleCatStatus(row.id)}
                              className={`px-2 py-0.5 rounded-full text-[9px] font-bold border cursor-pointer transition-colors ${
                                row.status === "Enabled"
                                  ? "bg-green-500/10 border-green-500/30 text-green-600"
                                  : "bg-red-500/10 border-red-500/30 text-red-500"
                              }`}
                            >
                              {row.status}
                            </button>
                          </td>
                          <td className="px-3 py-2">
                            <button
                              onClick={() => toggleCatHomepage(row.id)}
                              className={`px-2 py-0.5 rounded text-[9px] font-bold cursor-pointer ${row.homepageVisible ? "text-green-500" : "text-muted-foreground"}`}
                            >
                              {row.homepageVisible ? "ON" : "OFF"}
                            </button>
                          </td>
                          <td className="px-3 py-2">
                            <button
                              onClick={() => toggleCatFeatured(row.id)}
                              className={`flex items-center gap-0.5 px-2 py-0.5 rounded text-[9px] font-bold cursor-pointer ${row.featuredOnHome ? "text-yellow-500" : "text-muted-foreground"}`}
                            >
                              <Star size={9} fill={row.featuredOnHome ? "currentColor" : "none"} />
                              {row.featuredOnHome ? "YES" : "NO"}
                            </button>
                          </td>
                          <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">
                            ₹{(row.minPrice ?? 0).toLocaleString()}–₹{(row.maxPrice ?? 0).toLocaleString()}
                          </td>
                          <td className="px-3 py-2 text-muted-foreground">{row.platformCommission ?? "—"}%</td>
                          <td className="px-3 py-2 text-muted-foreground">{row.defaultDiscount ?? "—"}%</td>
                          <td className="px-3 py-2">
                            <button
                              onClick={() => editingCat === row.id ? setEditingCat(null) : openPricingEdit(row)}
                              className="flex items-center gap-1 px-2 py-1 rounded border border-border/30 hover:bg-muted/20 text-[9px] font-bold text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                            >
                              <Edit2 size={9} />
                              {editingCat === row.id ? "Close" : "Edit Pricing"}
                            </button>
                          </td>
                        </tr>

                        <AnimatePresence>
                          {editingCat === row.id && (
                            <tr>
                              <td colSpan={9} className="p-0">
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="overflow-hidden"
                                >
                                  <div className="bg-primary/5 border-b border-primary/20 p-4 grid grid-cols-2 sm:grid-cols-5 gap-3">
                                    {[
                                      { key: "minPrice", label: "Min Price (₹)", prefix: "₹" },
                                      { key: "recommendedPrice", label: "Recommended (₹)", prefix: "₹" },
                                      { key: "maxPrice", label: "Max Price (₹)", prefix: "₹" },
                                      { key: "platformCommission", label: "Commission (%)", suffix: "%" },
                                      { key: "defaultDiscount", label: "Default Discount (%)", suffix: "%" },
                                    ].map(field => (
                                      <div key={field.key} className="space-y-1">
                                        <label className="text-[9px] font-bold uppercase text-muted-foreground">{field.label}</label>
                                        <div className="relative">
                                          {field.prefix && <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">{field.prefix}</span>}
                                          <input
                                            type="number"
                                            value={catPricingEdit[field.key] ?? ""}
                                            onChange={e => setCatPricingEdit(p => ({ ...p, [field.key]: e.target.value }))}
                                            className={`${inputCls} ${field.prefix ? "pl-5" : ""}`}
                                          />
                                          {field.suffix && <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">{field.suffix}</span>}
                                        </div>
                                      </div>
                                    ))}
                                    <div className="col-span-full flex gap-2 pt-1">
                                      <Button size="sm" className="h-7 text-[10px]" onClick={() => savePricingEdit(row.id)}>
                                        <Check size={10} className="mr-1" /> Save & Sync
                                      </Button>
                                      <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={() => setEditingCat(null)}>
                                        Cancel
                                      </Button>
                                    </div>
                                  </div>
                                </motion.div>
                              </td>
                            </tr>
                          )}
                        </AnimatePresence>
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* D. FEATURED COURSES */}
          {activeTab === "courses" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-[10px] font-extrabold uppercase tracking-wide text-foreground">Featured Courses Control</h4>
                  <p className="text-[9px] text-muted-foreground mt-0.5">Only approved/published courses are shown. Toggle featured and homepage visibility.</p>
                </div>
                <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={loadCourses} disabled={coursesLoading}>
                  <RefreshCw size={10} className={`mr-1 ${coursesLoading ? "animate-spin" : ""}`} />
                  {coursesLoading ? "Loading..." : "Reload"}
                </Button>
              </div>

              <div className="relative">
                <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={courseSearch}
                  onChange={e => setCourseSearch(e.target.value)}
                  className="h-8 w-full rounded border border-border bg-muted/15 pl-8 pr-3 text-xs focus:outline-none"
                />
              </div>

              {coursesLoading ? (
                <div className="text-center py-8 text-muted-foreground text-[10px]">Loading courses from database...</div>
              ) : allCourses.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-[10px]">
                  No published courses found. Courses must be approved before they can be featured on the homepage.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-[10px]">
                    <thead>
                      <tr className="bg-muted/30 border-b border-border/40">
                        {["Order", "Course", "Tutor", "Category", "Price", "Featured", "Homepage", "Actions"].map(h => (
                          <th key={h} className="text-left px-3 py-2 text-[9px] font-extrabold uppercase tracking-wide text-muted-foreground whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {allCourses
                        .filter(c =>
                          !courseSearch ||
                          c.title.toLowerCase().includes(courseSearch.toLowerCase()) ||
                          c.tutorName.toLowerCase().includes(courseSearch.toLowerCase()) ||
                          c.category.toLowerCase().includes(courseSearch.toLowerCase())
                        )
                        .sort((a, b) => a.displayOrder - b.displayOrder)
                        .map((course, idx) => (
                          <tr key={course.id} className="border-b border-border/20 hover:bg-muted/10 transition-colors">
                            <td className="px-3 py-2">
                              <div className="flex gap-0.5">
                                <button onClick={() => moveCourse(course.id, "up")} disabled={idx === 0} className="p-0.5 hover:bg-muted/30 rounded disabled:opacity-30 cursor-pointer"><ArrowUp size={10} /></button>
                                <button onClick={() => moveCourse(course.id, "down")} disabled={idx === allCourses.length - 1} className="p-0.5 hover:bg-muted/30 rounded disabled:opacity-30 cursor-pointer"><ArrowDown size={10} /></button>
                              </div>
                            </td>
                            <td className="px-3 py-2 font-bold text-foreground max-w-[180px]">
                              <div className="truncate">{course.title}</div>
                            </td>
                            <td className="px-3 py-2 text-muted-foreground">{course.tutorName}</td>
                            <td className="px-3 py-2">
                              <span className="px-1.5 py-0.5 rounded bg-muted/20 text-[9px] font-bold text-muted-foreground">{course.category}</span>
                            </td>
                            <td className="px-3 py-2 font-bold text-foreground">₹{course.price.toLocaleString()}</td>
                            <td className="px-3 py-2">
                              <button
                                onClick={() => toggleFeatured(course.id)}
                                className={`flex items-center gap-0.5 cursor-pointer ${course.featured ? "text-yellow-500" : "text-muted-foreground"}`}
                              >
                                <Star size={11} fill={course.featured ? "currentColor" : "none"} />
                                <span className="text-[9px] font-bold">{course.featured ? "YES" : "NO"}</span>
                              </button>
                            </td>
                            <td className="px-3 py-2">
                              <button
                                onClick={() => toggleCourseHomepage(course.id)}
                                className={`flex items-center gap-0.5 cursor-pointer ${course.homepageVisible ? "text-green-500" : "text-muted-foreground"}`}
                              >
                                {course.homepageVisible ? <Eye size={10} /> : <EyeOff size={10} />}
                                <span className="text-[9px] font-bold">{course.homepageVisible ? "ON" : "OFF"}</span>
                              </button>
                            </td>
                            <td className="px-3 py-2">
                              <div className="flex gap-1">
                                {course.featured ? (
                                  <button
                                    onClick={() => toggleFeatured(course.id)}
                                    className="px-2 py-0.5 rounded border border-red-300/30 text-red-500 text-[9px] font-bold hover:bg-red-500/10 cursor-pointer"
                                  >
                                    Remove
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => toggleFeatured(course.id)}
                                    className="px-2 py-0.5 rounded border border-yellow-300/30 text-yellow-600 text-[9px] font-bold hover:bg-yellow-500/10 cursor-pointer"
                                  >
                                    Feature
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* E. OFFERS & PROMOTIONS */}
          {activeTab === "offers" && (
            <div className="space-y-5">
              <div>
                <h4 className="text-[10px] font-extrabold uppercase tracking-wide text-foreground mb-3">
                  Active Offers & Promotions ({coupons.filter(c => (c.status ?? "Active") === "Active").length} active)
                </h4>
                {coupons.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground text-[10px] border border-dashed border-border/40 rounded-lg">
                    No offers configured. Create your first offer below.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {coupons.map(c => {
                      const isActive = (c.status ?? "Active") === "Active";
                      const isExpired = new Date(c.expiryDate) < new Date();
                      return (
                        <Card key={c.code} className={`p-3 border shadow-soft ${isActive && !isExpired ? "border-green-500/20 bg-green-500/5" : "border-border bg-muted/5 opacity-70"}`}>
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-extrabold text-foreground text-xs tracking-wide">{c.code}</span>
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${isActive && !isExpired ? "bg-green-500/15 text-green-600" : isExpired ? "bg-red-500/15 text-red-500" : "bg-muted/30 text-muted-foreground"}`}>
                                  {isExpired ? "EXPIRED" : (c.status ?? "Active").toUpperCase()}
                                </span>
                              </div>
                              <p className="text-[10px] font-semibold text-muted-foreground mt-0.5 capitalize">{c.type}</p>
                            </div>
                            <span className="text-sm font-extrabold text-primary">
                              {c.type === "percentage" ? `${c.value}%` : `₹${c.value}`}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-1 mt-2 text-[9px] text-muted-foreground">
                            <span>Min: ₹{c.minPurchase.toLocaleString()}</span>
                            {c.maxDiscount && <span>Max off: ₹{c.maxDiscount}</span>}
                            <span className="flex items-center gap-0.5"><Calendar size={8} /> {c.expiryDate}</span>
                            <span>{c.usageCount} / {c.usageLimit} used</span>
                          </div>
                          <div className="flex gap-1.5 mt-2.5 pt-2 border-t border-border/20">
                            <button
                              onClick={() => handleToggleCouponStatus(c.code)}
                              className={`flex-1 py-0.5 rounded text-[9px] font-bold border cursor-pointer transition-colors ${
                                isActive
                                  ? "border-yellow-400/30 text-yellow-600 hover:bg-yellow-500/10"
                                  : "border-green-400/30 text-green-600 hover:bg-green-500/10"
                              }`}
                            >
                              {isActive ? "Deactivate" : "Activate"}
                            </button>
                            <button
                              onClick={() => handleDeleteCoupon(c.code)}
                              className="px-2 py-0.5 rounded text-[9px] font-bold border border-red-400/30 text-red-500 hover:bg-red-500/10 cursor-pointer transition-colors"
                            >
                              <Trash size={9} />
                            </button>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>

              <Card className="p-5 border-border bg-card shadow-soft">
                <h4 className="text-[10px] font-extrabold uppercase tracking-wide text-foreground border-b border-border/20 pb-2 mb-4 flex items-center gap-1.5">
                  <Plus size={12} className="text-primary" /> Create New Offer
                </h4>
                <form onSubmit={handleCreateCoupon} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <label className={labelCls}>Coupon Code</label>
                    <input type="text" value={formCode} onChange={e => setFormCode(e.target.value)}
                      placeholder="BACK2LEARNING" className={inputCls} required />
                  </div>
                  <div className="space-y-1">
                    <label className={labelCls}>Type</label>
                    <select value={formType} onChange={e => setFormType(e.target.value as Coupon["type"])}
                      className={inputCls}>
                      <option value="percentage">Percentage</option>
                      <option value="flat">Flat Amount</option>
                      <option value="festival">Festival</option>
                      <option value="referral">Referral</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className={labelCls}>Value {formType === "percentage" ? "(%)" : "(₹)"}</label>
                    <input type="number" value={formValue} onChange={e => setFormValue(e.target.value)}
                      placeholder={formType === "percentage" ? "10" : "200"} className={inputCls} required />
                  </div>
                  <div className="space-y-1">
                    <label className={labelCls}>Min Purchase (₹)</label>
                    <input type="number" value={formMinPurchase} onChange={e => setFormMinPurchase(e.target.value)}
                      placeholder="0" className={inputCls} />
                  </div>
                  {formType === "percentage" && (
                    <div className="space-y-1">
                      <label className={labelCls}>Max Discount (₹)</label>
                      <input type="number" value={formMaxDiscount} onChange={e => setFormMaxDiscount(e.target.value)}
                        placeholder="500" className={inputCls} />
                    </div>
                  )}
                  <div className="space-y-1">
                    <label className={labelCls}>Expiry Date</label>
                    <input type="date" value={formExpiry} onChange={e => setFormExpiry(e.target.value)}
                      className={inputCls} />
                  </div>
                  <div className="space-y-1">
                    <label className={labelCls}>Usage Limit</label>
                    <input type="number" value={formLimit} onChange={e => setFormLimit(e.target.value)}
                      placeholder="100" className={inputCls} />
                  </div>
                  <div className="space-y-1">
                    <label className={labelCls}>Status</label>
                    <select value={formStatus} onChange={e => setFormStatus(e.target.value as "Active" | "Inactive")}
                      className={inputCls}>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive (draft)</option>
                    </select>
                  </div>
                  <div className="col-span-full pt-1">
                    <Button type="submit" size="sm" className="h-8 text-[10px]">
                      <Plus size={10} className="mr-1" /> Create Offer
                    </Button>
                  </div>
                </form>
              </Card>
            </div>
          )}

          {/* F. SECTION MANAGER */}
          {activeTab === "sections" && (
            <div className="space-y-4">
              <div>
                <h4 className="text-[10px] font-extrabold uppercase tracking-wide text-foreground">Homepage Section Manager</h4>
                <p className="text-[9px] text-muted-foreground mt-0.5">
                  Control visibility and display order of homepage sections. Changes are stored and available for integration with the public homepage.
                </p>
              </div>
              <Card className="p-4 border-border bg-card shadow-soft">
                <div className="space-y-1">
                  {[...sections].sort((a, b) => a.order - b.order).map((s, idx) => (
                    <div key={s.id} className="flex items-center justify-between gap-3 py-2 px-3 rounded-lg hover:bg-muted/10 border border-transparent hover:border-border/20 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col gap-0.5">
                          <button onClick={() => moveSection(s.id, "up")} disabled={idx === 0} className="p-0.5 hover:bg-muted/30 rounded disabled:opacity-30 cursor-pointer"><ChevronUp size={11} /></button>
                          <button onClick={() => moveSection(s.id, "down")} disabled={idx === sections.length - 1} className="p-0.5 hover:bg-muted/30 rounded disabled:opacity-30 cursor-pointer"><ChevronDown size={11} /></button>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-foreground">{s.label}</p>
                          <p className="text-[9px] text-muted-foreground">Position {s.order}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleSection(s.id)}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border transition-colors cursor-pointer ${
                          s.enabled
                            ? "bg-green-500/10 border-green-500/30 text-green-600"
                            : "bg-muted/20 border-border/30 text-muted-foreground"
                        }`}
                      >
                        {s.enabled ? <ToggleRight size={12} /> : <ToggleLeft size={12} />}
                        {s.enabled ? "Visible" : "Hidden"}
                      </button>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* G. CONTENT BLOCKS */}
          {activeTab === "content" && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <Card className="p-5 border-border bg-card shadow-soft space-y-4">
                  <h4 className="text-[10px] font-extrabold uppercase tracking-wide text-foreground border-b border-border/20 pb-2">
                    Testimonials Manager
                  </h4>
                  <div className="space-y-2">
                    {testimonials.map((t, idx) => (
                      <div key={idx} className="p-3 bg-muted/10 border border-border/40 rounded-lg flex items-start justify-between gap-3">
                        <div>
                          <span className="font-bold text-foreground text-xs block">{t.name}</span>
                          <p className="text-[10px] text-muted-foreground italic mt-0.5">&ldquo;{t.text}&rdquo;</p>
                        </div>
                        <button onClick={() => setTestimonials(ts => ts.filter((_, i) => i !== idx))}
                          className="p-1 hover:bg-destructive/10 text-muted-foreground hover:text-destructive border border-border/20 rounded cursor-pointer shrink-0">
                          <Trash size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-border/20 pt-3 space-y-2">
                    <p className="text-[9px] font-bold text-muted-foreground uppercase">Add Testimonial</p>
                    <div className="grid grid-cols-2 gap-2">
                      <input type="text" placeholder="Student Name" value={newTestimonialName}
                        onChange={e => setNewTestimonialName(e.target.value)}
                        className="h-8 rounded border border-border bg-muted/15 px-2 text-[10px] focus:outline-none" />
                      <input type="text" placeholder="Quote..." value={newTestimonialText}
                        onChange={e => setNewTestimonialText(e.target.value)}
                        className="h-8 rounded border border-border bg-muted/15 px-2 text-[10px] focus:outline-none" />
                    </div>
                    <Button size="sm" variant="outline" className="h-7 text-[10px]"
                      onClick={() => {
                        if (!newTestimonialName.trim() || !newTestimonialText.trim()) return;
                        setTestimonials(ts => [...ts, { name: newTestimonialName.trim(), text: newTestimonialText.trim() }]);
                        setNewTestimonialName(""); setNewTestimonialText("");
                        toast.success("Testimonial added.");
                      }}>
                      <Plus size={10} className="mr-1" /> Add
                    </Button>
                  </div>
                </Card>

                <Card className="p-5 border-border bg-card shadow-soft space-y-4">
                  <h4 className="text-[10px] font-extrabold uppercase tracking-wide text-foreground border-b border-border/20 pb-2">
                    FAQs Manager
                  </h4>
                  <div className="space-y-2">
                    {faqs.map((f, idx) => (
                      <div key={idx} className="p-3 bg-muted/10 border border-border/40 rounded-lg flex items-start justify-between gap-3">
                        <div>
                          <span className="font-bold text-foreground text-xs block">Q: {f.q}</span>
                          <p className="text-[10px] text-muted-foreground mt-0.5">A: {f.a}</p>
                        </div>
                        <button onClick={() => setFaqs(fs => fs.filter((_, i) => i !== idx))}
                          className="p-1 hover:bg-destructive/10 text-muted-foreground hover:text-destructive border border-border/20 rounded cursor-pointer shrink-0">
                          <Trash size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-border/20 pt-3 space-y-2">
                    <p className="text-[9px] font-bold text-muted-foreground uppercase">Add FAQ</p>
                    <input type="text" placeholder="Question..." value={newFaqQ}
                      onChange={e => setNewFaqQ(e.target.value)}
                      className="h-8 w-full rounded border border-border bg-muted/15 px-2 text-[10px] focus:outline-none" />
                    <input type="text" placeholder="Answer..." value={newFaqA}
                      onChange={e => setNewFaqA(e.target.value)}
                      className="h-8 w-full rounded border border-border bg-muted/15 px-2 text-[10px] focus:outline-none" />
                    <Button size="sm" variant="outline" className="h-7 text-[10px]"
                      onClick={() => {
                        if (!newFaqQ.trim() || !newFaqA.trim()) return;
                        setFaqs(fs => [...fs, { q: newFaqQ.trim(), a: newFaqA.trim() }]);
                        setNewFaqQ(""); setNewFaqA("");
                        toast.success("FAQ added.");
                      }}>
                      <Plus size={10} className="mr-1" /> Add FAQ
                    </Button>
                  </div>
                </Card>
              </div>

              <Card className="p-5 border-border bg-card shadow-soft space-y-4">
                <h4 className="text-[10px] font-extrabold uppercase tracking-wide text-foreground border-b border-border/20 pb-2 flex items-center gap-1.5">
                  <FileText size={12} className="text-primary" /> Blog Articles
                </h4>
                <div className="space-y-2">
                  {blogs.map(b => (
                    <div key={b.id} className="p-3 bg-muted/10 border border-border/40 rounded-lg flex items-center justify-between">
                      <div>
                        <h5 className="font-bold text-foreground text-xs">{b.title}</h5>
                        <p className="text-[9px] text-muted-foreground mt-0.5">{b.author} · {b.date}</p>
                      </div>
                      <button onClick={() => setBlogs(bs => bs.filter(item => item.id !== b.id))}
                        className="p-1.5 hover:bg-destructive/10 text-muted-foreground hover:text-destructive border border-border/20 rounded cursor-pointer">
                        <Trash size={11} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="border-t border-border/20 pt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className={labelCls}>Article Title</label>
                    <input type="text" value={newBlogTitle} onChange={e => setNewBlogTitle(e.target.value)}
                      placeholder="Article title..." className={inputCls} />
                  </div>
                  <div className="space-y-1">
                    <label className={labelCls}>Author</label>
                    <input type="text" value={newBlogAuthor} onChange={e => setNewBlogAuthor(e.target.value)}
                      placeholder="Author name..." className={inputCls} />
                  </div>
                  <div className="col-span-full">
                    <Button size="sm" className="h-8 text-[10px]"
                      onClick={() => {
                        if (!newBlogTitle.trim()) return;
                        setBlogs(bs => [{
                          id: `blog-${Date.now()}`,
                          title: newBlogTitle.trim(),
                          date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
                          author: newBlogAuthor.trim() || "Admin Editor"
                        }, ...bs]);
                        setNewBlogTitle(""); setNewBlogAuthor("");
                        toast.success("Blog article published.");
                        logAuditAction(`Published blog: "${newBlogTitle}"`);
                      }}>
                      <SendHorizontal size={10} className="mr-1" /> Publish Article
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
