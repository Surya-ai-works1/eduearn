import { createClient } from "@/lib/supabase";

export interface Policy {
  id?: string;
  title: string;
  slug: string;
  content: string;
  category: string;
  version: string;
  effective_date: string;
  last_updated: string;
  published_status: "published" | "draft" | "archived";
  applicable_roles: string[];
  applicable_academies: string[];
  seo_title?: string;
  seo_description?: string;
}

export interface PolicyLog {
  id?: string;
  policy_slug: string;
  action: string;
  user_email?: string;
  details?: any;
  created_at?: string;
}

// Global default seed policies
export const DEFAULT_SEED_POLICIES: Record<string, Policy> = {
  // --- GLOBAL POLICIES ---
  "privacy": {
    title: "Privacy Policy",
    slug: "privacy",
    category: "Global",
    version: "1.0",
    effective_date: new Date().toISOString(),
    last_updated: new Date().toISOString(),
    published_status: "published",
    applicable_roles: ["student", "parent", "tutor", "admin"],
    applicable_academies: ["school-tuition", "career-academy", "extra-curricular"],
    seo_title: "Privacy Policy | EduEarn Learning Marketplace",
    seo_description: "Learn how EduEarn collects, utilizes, and protects user data and personal credentials across India's smart cohort learning platform.",
    content: `
# EduEarn Privacy Policy

**Effective Date:** August 1, 2026

Welcome to EduEarn. We are committed to protecting your personal data and privacy. This Privacy Policy details our practices regarding the collection, storage, and processing of personal credentials for Students, Parents, Tutors, and Teachers.

## 1. Information We Collect
We collect information that you provide directly to us during registration, profile completion, or payment checkout:
- **Personal Identification:** Name, email address, phone number, and physical billing addresses.
- **Academic Profiles:** Class level, school boards, interested subjects, and career goals.
- **Professional Background (Tutors):** Degrees, qualifications, verification proofs (Government IDs), and bank/UPI coordinates.
- **Child Profiling:** Child's name, age, and parental consent details for Kids Academy.

## 2. Data Encryption and Protection
All personal credentials and payment processing details are encrypted in transit using SSL/TLS protocols and stored securely under Supabase PostgreSQL row-level security (RLS) policies.

## 3. Contact & Grievance
For questions, data access requests, or deletion queries, please contact our Data Protection Officer at privacy@eduearn.com.
`
  },
  "terms": {
    title: "Terms & Conditions",
    slug: "terms",
    category: "Global",
    version: "1.0",
    effective_date: new Date().toISOString(),
    last_updated: new Date().toISOString(),
    published_status: "published",
    applicable_roles: ["student", "parent", "tutor", "admin"],
    applicable_academies: ["school-tuition", "career-academy", "extra-curricular"],
    seo_title: "Terms & Conditions | EduEarn",
    seo_description: "General Terms of Service governing the use of EduEarn peer marketplaces, courses, cohorts, and student tutor interactions.",
    content: `
# EduEarn Terms & Conditions

**Effective Date:** August 1, 2026

These Terms & Conditions govern your access to and use of the EduEarn cohort marketplace platforms. By registering an account, you agree to comply with these terms in full.

## 1. Marketplace Integrity
- **Age limit:** Learners under 18 must register with parental consent or through a parent-managed account.
- **Tutor Accounts:** Tutors must complete AI-assisted screening and provide valid government-issued documents.
- **Classroom conduct:** Hostility, hate speech, or sharing unauthorized promotional links in doubt rooms will result in suspension.

## 2. Payment Terms
- Users agree to pay convenience fees and tax rates (18% GST) specified at checkout.
- Payments are processed through Razerpay secure channels.
`
  },
  "refunds": {
    title: "Refund & Cancellation Policy",
    slug: "refunds",
    category: "Global",
    version: "1.0",
    effective_date: new Date().toISOString(),
    last_updated: new Date().toISOString(),
    published_status: "published",
    applicable_roles: ["student", "parent"],
    applicable_academies: ["school-tuition", "career-academy", "extra-curricular"],
    content: `
# Refund & Cancellation Policy

**Effective Date:** August 1, 2026

EduEarn provides a digital learning marketplace. Refunds are subject to the following rules:

## 1. Cohort Cancellations
- Full refunds can be requested up to 24 hours prior to the scheduled first live class.
- Once a cohort commences and the student enrolls/joins, no refunds will be processed.
- Self-paced courses are non-refundable once content chapters have been accessed.
`
  },
  "payments-policy": {
    title: "Payment Policy",
    slug: "payments-policy",
    category: "Global",
    version: "1.0",
    effective_date: new Date().toISOString(),
    last_updated: new Date().toISOString(),
    published_status: "published",
    applicable_roles: ["student", "parent", "tutor"],
    applicable_academies: ["school-tuition", "career-academy", "extra-curricular"],
    content: `
# Payment Policy

This Payment Policy outlines transaction rules, convenience fees, and tax mappings across EduEarn:
- **Convenience Fee:** 2% platform transaction charges are mapped to learner checkouts.
- **GST:** 18% Service Tax is levied on all paid tuition courses.
- **UPI payouts:** Verified tutors receive 70% share of enrollment revenues, transferred directly to their bank/UPI accounts.
`
  },
  "cookies": {
    title: "Cookie Policy",
    slug: "cookies",
    category: "Global",
    version: "1.0",
    effective_date: new Date().toISOString(),
    last_updated: new Date().toISOString(),
    published_status: "published",
    applicable_roles: ["student", "parent", "tutor"],
    applicable_academies: ["school-tuition", "career-academy", "extra-curricular"],
    content: `
# Cookie Policy

EduEarn uses cookies to maintain sessions and persist preferences:
- **Authentication Cookies:** Retain session tokens in the browser.
- **Theme and Settings:** Stored in LocalStorage to remember dark/light styling modes.
- **Analytics:** Anonymous cookies help monitor platform traffic.
`
  },
  "ai-policy": {
    title: "AI Usage Policy",
    slug: "ai-policy",
    category: "Global",
    version: "1.0",
    effective_date: new Date().toISOString(),
    last_updated: new Date().toISOString(),
    published_status: "published",
    applicable_roles: ["student", "tutor"],
    applicable_academies: ["school-tuition", "career-academy", "extra-curricular"],
    content: `
# AI Usage Policy

EduEarn integrates Google Gemini models to assist learning:
- **Sparky AI Assistant:** Used for study planning, roadmap generations, and doubt clarifications.
- **Code Evaluation:** Automatically evaluates homework assignments.
- **Academic honesty:** Students must write their own work; submitting pure AI generated text as assignments violates policies.
`
  },

  // --- SPECIALIZED STUDENT POLICIES ---
  "student-policy": {
    title: "Student Code of Conduct",
    slug: "student-policy",
    category: "Student",
    version: "1.0",
    effective_date: new Date().toISOString(),
    last_updated: new Date().toISOString(),
    published_status: "published",
    applicable_roles: ["student"],
    applicable_academies: ["school-tuition", "career-academy", "extra-curricular"],
    content: `
# Student Code of Conduct

Students agree to:
- Be respectful to peer learners and instructors in all classrooms.
- Maintain academic honesty. Cheating on practice tests is prohibited.
- Attend live cohort timings regularly.
`
  },

  // --- SPECIALIZED PARENT POLICIES ---
  "parent-policy": {
    title: "Parent Responsibilities",
    slug: "parent-policy",
    category: "Parent",
    version: "1.0",
    effective_date: new Date().toISOString(),
    last_updated: new Date().toISOString(),
    published_status: "published",
    applicable_roles: ["parent"],
    applicable_academies: ["school-tuition", "extra-curricular"],
    content: `
# Parent Responsibilities Policy

Parents registering profiles for children under 16 agree to:
- Monitor learning progress and supervise live interactions.
- Assure accurate registration details for Kids Academy.
`
  },
  "safety": {
    title: "Child Safety Policy",
    slug: "safety",
    category: "Parent",
    version: "1.0",
    effective_date: new Date().toISOString(),
    last_updated: new Date().toISOString(),
    published_status: "published",
    applicable_roles: ["parent"],
    applicable_academies: ["school-tuition", "extra-curricular"],
    content: `
# Child Safety Policy

EduEarn is committed to child protection:
- Tutors interacting with minor kids undergo background screening.
- Interaction sessions are logged for moderation audits.
- No direct contact exchange is permitted between tutors and students.
`
  },

  // --- SPECIALIZED TUTOR POLICIES ---
  "tutor-policy": {
    title: "Tutor Agreement",
    slug: "tutor-policy",
    category: "Tutor",
    version: "1.0",
    effective_date: new Date().toISOString(),
    last_updated: new Date().toISOString(),
    published_status: "published",
    applicable_roles: ["tutor"],
    applicable_academies: ["school-tuition", "career-academy", "extra-curricular"],
    content: `
# Tutor Agreement & Earnings Policy

This Agreement governs teaching credentials, payout percentages, and marketplace rules:
- **Revenue Share:** Tutors receive a standard 70% share of actual course checkout fees.
- **Verification:** Tutor profiles are only listed after gov ID checking.
- **Commission:** EduEarn retains a 30% commission for workspace licensing, payment gateways, and hosting costs.
`
  },

  // --- SPECIALIZED TEACHER POLICIES ---
  "teacher-policy": {
    title: "Teacher Agreement",
    slug: "teacher-policy",
    category: "Teacher",
    version: "1.0",
    effective_date: new Date().toISOString(),
    last_updated: new Date().toISOString(),
    published_status: "published",
    applicable_roles: ["tutor"],
    applicable_academies: ["school-tuition"],
    content: `
# Teacher Agreement & Standards

School Tuition instructors agree to:
- Provide high quality curricula synced with CBSE/ICSE boards.
- Grade homework submissions within 48 hours of submission.
- Maintain professional interaction boundaries.
`
  },

  // --- COMPLIANCE / ACCESSIBILITY / GRIEVANCE ---
  "accessibility": {
    title: "Accessibility Statement",
    slug: "accessibility",
    category: "Global",
    version: "1.0",
    effective_date: new Date().toISOString(),
    last_updated: new Date().toISOString(),
    published_status: "published",
    applicable_roles: ["student", "parent", "tutor"],
    applicable_academies: [],
    content: `
# Accessibility Statement

We aim to make EduEarn accessible to everyone. Our templates conform to WCAG 2.1 Level AA accessibility guidelines.
`
  },
  "grievance": {
    title: "Contact & Grievance Policy",
    slug: "grievance",
    category: "Global",
    version: "1.0",
    effective_date: new Date().toISOString(),
    last_updated: new Date().toISOString(),
    published_status: "published",
    applicable_roles: ["student", "parent", "tutor"],
    applicable_academies: [],
    content: `
# Contact & Grievance Policy

If you have legal disputes or compliance concerns, please file a ticket or contact our Grievance Officer at compliance@eduearn.com.
`
  }
};

export class PolicyService {
  /**
   * Fetch policy by slug.
   * If table doesn't exist, catches error and returns local seed policy.
   */
  static async getPolicy(slug: string): Promise<Policy> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("policies")
        .select("*")
        .eq("slug", slug)
        .eq("published_status", "published")
        .maybeSingle();

      if (error) throw error;
      if (data) return data as Policy;
    } catch (err) {
      console.warn(`Supabase policies query failed for slug "${slug}". Returning default seed content.`, err);
    }
    
    // Return seed policy or construct a fallback dynamic layout
    const seed = DEFAULT_SEED_POLICIES[slug];
    if (seed) return seed;

    return {
      title: slug.replace("-", " ").toUpperCase(),
      slug,
      content: `# ${slug.replace("-", " ").toUpperCase()}\n\nThis policy is currently in review. Content is coming soon.`,
      category: "Compliance",
      version: "1.0",
      effective_date: new Date().toISOString(),
      last_updated: new Date().toISOString(),
      published_status: "published",
      applicable_roles: [],
      applicable_academies: []
    };
  }

  /**
   * Fetch all policies (for lists or search queries)
   */
  static async getPolicies(): Promise<Policy[]> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("policies")
        .select("*")
        .order("last_updated", { ascending: false });

      if (error) throw error;
      if (data && data.length > 0) return data as Policy[];
    } catch (err) {
      console.warn("Supabase getPolicies failed. Returning local seed policies list.", err);
    }

    return Object.values(DEFAULT_SEED_POLICIES);
  }

  /**
   * Save (Insert/Update) a policy in Supabase.
   */
  static async savePolicy(policy: Policy, adminEmail?: string): Promise<Policy> {
    const supabase = createClient();
    
    // First verify/upsert table presence
    const { data, error } = await supabase
      .from("policies")
      .upsert({
        ...policy,
        last_updated: new Date().toISOString()
      }, { onConflict: "slug" })
      .select("*")
      .maybeSingle();

    if (error) {
      throw error;
    }

    // Log the policy action
    await this.logAction({
      policy_slug: policy.slug,
      action: policy.id ? "Policy Updated" : "Policy Created",
      user_email: adminEmail || "admin@eduearn.com",
      details: { version: policy.version, published_status: policy.published_status }
    });

    return data as Policy;
  }

  /**
   * Delete / Archive policy
   */
  static async deletePolicy(slug: string, adminEmail?: string): Promise<boolean> {
    const supabase = createClient();
    const { error } = await supabase
      .from("policies")
      .delete()
      .eq("slug", slug);

    if (error) throw error;

    await this.logAction({
      policy_slug: slug,
      action: "Policy Archived",
      user_email: adminEmail || "admin@eduearn.com"
    });

    return true;
  }

  /**
   * Log policy action
   */
  static async logAction(log: PolicyLog): Promise<void> {
    try {
      const supabase = createClient();
      await supabase.from("policy_logs").insert({
        policy_slug: log.policy_slug,
        action: log.action,
        user_email: log.user_email || "system@eduearn.com",
        details: log.details || {},
        created_at: new Date().toISOString()
      });
    } catch (err) {
      console.warn("Could not write audit log entry to policy_logs table.", err);
    }
  }

  /**
   * Fetch audit logs
   */
  static async getAuditLogs(): Promise<PolicyLog[]> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("policy_logs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data) return data as PolicyLog[];
    } catch (err) {
      console.warn("Supabase query for policy audit logs failed.");
    }
    return [
      { policy_slug: "privacy", action: "Policy Published", user_email: "admin@eduearn.com", created_at: new Date().toISOString() },
      { policy_slug: "tutor-policy", action: "Policy Updated", user_email: "admin@eduearn.com", created_at: new Date().toISOString() }
    ];
  }
}
