import { createClient } from "./supabase/client";

export interface CategoryPricingRule {
  id: string;
  name: string;
  status: "Active" | "Inactive";
  tutorBaseEarning: number;
  recommendedSellingPrice: number;
  minPrice: number;
  maxPrice: number;
  platformCommission: number;
  defaultDiscount: number;
  discountFunding: "Platform-funded" | "Shared" | "Tutor-funded";
}

export interface Coupon {
  code: string;
  type: "percentage" | "flat" | "festival" | "referral";
  value: number;
  minPurchase: number;
  maxDiscount?: number;
  expiryDate: string;
  usageLimit: number;
  usageCount: number;
  applicableCourses?: string[];
  applicableCategories?: string[];
  perUserLimit?: number;
  status: "Active" | "Inactive";
}

const DEFAULT_RULES: CategoryPricingRule[] = [
  {
    id: "programming",
    name: "Programming",
    status: "Active",
    tutorBaseEarning: 1500,
    recommendedSellingPrice: 1800,
    minPrice: 1500,
    maxPrice: 25000,
    platformCommission: 16.67,
    defaultDiscount: 10,
    discountFunding: "Platform-funded"
  },
  {
    id: "business",
    name: "Business",
    status: "Active",
    tutorBaseEarning: 1200,
    recommendedSellingPrice: 1400,
    minPrice: 1000,
    maxPrice: 20000,
    platformCommission: 14.28,
    defaultDiscount: 10,
    discountFunding: "Platform-funded"
  },
  {
    id: "design",
    name: "Design",
    status: "Active",
    tutorBaseEarning: 1000,
    recommendedSellingPrice: 1200,
    minPrice: 800,
    maxPrice: 15000,
    platformCommission: 16.67,
    defaultDiscount: 10,
    discountFunding: "Platform-funded"
  },
  {
    id: "academics",
    name: "Academics",
    status: "Active",
    tutorBaseEarning: 800,
    recommendedSellingPrice: 900,
    minPrice: 600,
    maxPrice: 10000,
    platformCommission: 11.11,
    defaultDiscount: 5,
    discountFunding: "Platform-funded"
  },
  {
    id: "languages",
    name: "Languages",
    status: "Active",
    tutorBaseEarning: 600,
    recommendedSellingPrice: 700,
    minPrice: 500,
    maxPrice: 8000,
    platformCommission: 14.28,
    defaultDiscount: 10,
    discountFunding: "Platform-funded"
  }
];

const TUTOR_UUID = "b194445d-3fbe-47ce-9bd2-07379c180142"; // Valid UUID from database

function getSupabase() {
  return createClient();
}

export const BusinessRulesDb = {
  async getCategoryRules(): Promise<CategoryPricingRule[]> {
    try {
      const supabase = getSupabase();
      if (!supabase) {
        return DEFAULT_RULES;
      }
      const { data, error } = await supabase
        .from("courses")
        .select("description")
        .eq("title", "__eduearn_system_pricing_rules__");
      
      if (error) {
        console.warn("Supabase load of pricing rules failed, using default rules:", error);
        return DEFAULT_RULES;
      }

      if (data && data.length > 0 && data[0].description) {
        try {
          return JSON.parse(data[0].description);
        } catch {
          return DEFAULT_RULES;
        }
      }

      // Initialize in Supabase if empty
      await this.saveCategoryRules(DEFAULT_RULES);
      return DEFAULT_RULES;
    } catch (err) {
      console.error("Error loading pricing rules from Supabase:", err);
      return DEFAULT_RULES;
    }
  },

  async saveCategoryRules(rules: CategoryPricingRule[]): Promise<boolean> {
    try {
      const supabase = getSupabase();
      if (!supabase) {
        return false;
      }
      
      // Check if it already exists
      const { data } = await supabase
        .from("courses")
        .select("id")
        .eq("title", "__eduearn_system_pricing_rules__")
        .limit(1);

      if (data && data.length > 0) {
        const { error } = await supabase
          .from("courses")
          .update({ description: JSON.stringify(rules) })
          .eq("title", "__eduearn_system_pricing_rules__");
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("courses")
          .insert({
            tutor_id: TUTOR_UUID,
            title: "__eduearn_system_pricing_rules__",
            description: JSON.stringify(rules),
            price: 0,
            category: "System",
            level: "Beginner",
            status: "draft",
            approval_status: "approved"
          });
        if (error) throw error;
      }
      return true;
    } catch (err) {
      console.error("Failed to save pricing rules in Supabase:", err);
      return false;
    }
  },

  async getCoupons(): Promise<Coupon[]> {
    try {
      const supabase = getSupabase();
      if (!supabase) {
        return [];
      }
      const { data, error } = await supabase
        .from("courses")
        .select("description")
        .eq("title", "__eduearn_system_coupons__");

      if (error) {
        console.warn("Supabase load of coupons failed, returning empty:", error);
        return [];
      }

      if (data && data.length > 0 && data[0].description) {
        try {
          return JSON.parse(data[0].description);
        } catch {
          return [];
        }
      }

      return [];
    } catch (err) {
      console.error("Error loading coupons from Supabase:", err);
      return [];
    }
  },

  async saveCoupons(coupons: Coupon[]): Promise<boolean> {
    try {
      const supabase = getSupabase();
      if (!supabase) {
        return false;
      }
      const { data } = await supabase
        .from("courses")
        .select("id")
        .eq("title", "__eduearn_system_coupons__")
        .limit(1);

      if (data && data.length > 0) {
        const { error } = await supabase
          .from("courses")
          .update({ description: JSON.stringify(coupons) })
          .eq("title", "__eduearn_system_coupons__");
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("courses")
          .insert({
            tutor_id: TUTOR_UUID,
            title: "__eduearn_system_coupons__",
            description: JSON.stringify(coupons),
            price: 0,
            category: "System",
            level: "Beginner",
            status: "draft",
            approval_status: "approved"
          });
        if (error) throw error;
      }
      return true;
    } catch (err) {
      console.error("Failed to save coupons in Supabase:", err);
      return false;
    }
  }
};
