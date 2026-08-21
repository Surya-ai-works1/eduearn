// src/lib/repositories/admin/SupabaseAdminRepository.ts

import { IAdminRepository } from "./IAdminRepository";
import { BusinessRulesDb } from "../../businessRulesDb";
import {
  AdminDashboardStats,
  AdminUser,
  AdminCourse,
  TutorVerificationApp,
  AdminCategory,
  AdminPayout,
  AdminTransaction,
  AdminReport,
  SupportTicket,
  AdminAnnouncement,
  PlatformSettings,
  PermissionMatrixRow,
  AdminActivityLog
} from "../../types/admin";

export class SupabaseAdminRepository implements IAdminRepository {
  private async getSupabase() {
    let client;
    if (typeof window === "undefined") {
      const { createClient } = await import("../../supabase/server");
      client = await createClient();
    } else {
      const { createClient } = await import("../../supabase/client");
      client = createClient();
    }
    if (!client) {
      throw new Error(
        "SupabaseAdminRepository requires Supabase credentials. " +
        "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
      );
    }
    return client;
  }

  // Helper for localStorage fallback (for tickets, announcements, reports which lack DB tables)
  private getFallbackData<T>(key: string, defaultVal: T): T {
    if (typeof window === "undefined") return defaultVal;
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultVal;
  }

  private setFallbackData<T>(key: string, val: T): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(key, JSON.stringify(val));
    }
  }

  private mapCourseStatus(dbStatus: string | null | undefined): AdminCourse["status"] {
    if (!dbStatus) return "Pending";
    const statusLower = dbStatus.toLowerCase();
    if (statusLower === "approved" || statusLower === "published") return "Approved";
    if (statusLower === "pending") return "Pending";
    if (statusLower === "rejected") return "Rejected";
    if (statusLower === "draft") return "Draft";
    if (statusLower === "need changes" || statusLower === "need_changes") return "Need Changes";
    if (statusLower === "archived") return "Archived";
    return "Pending";
  }

  // --- STATS ---
  async getDashboardStats(): Promise<AdminDashboardStats> {
    const supabase = await this.getSupabase();

    // 1. Get total users count from profiles
    const { count: usersCount } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    const { count: studentsCount } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "student");

    const { count: tutorsCount } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "tutor");

    // 2. Get courses stats
    const { data: coursesData } = await supabase
      .from("courses")
      .select("status");

    const totalCourses = coursesData?.length || 0;
    const publishedCourses = coursesData?.filter((c: any) => c.status === "published" || c.status === "Approved").length || 0;
    const pendingCourses = coursesData?.filter((c: any) => c.status === "pending" || c.status === "Pending").length || 0;

    // 3. Get transactions & revenue
    const { data: paymentsData } = await supabase
      .from("payments")
      .select("amount, status");

    const totalRevenue = (paymentsData || [])
      .filter((p: any) => p.status === "success" || p.status === "Success" || p.status === "completed")
      .reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0);

    // Fetch exact counts from enrollments table live
    const { count: dbEnrollmentsCount } = await supabase
      .from("enrollments")
      .select("*", { count: "exact", head: true });
    const activeEnrollments = dbEnrollmentsCount || 0;

    const { count: dbCertificatesCount } = await supabase
      .from("enrollments")
      .select("*", { count: "exact", head: true })
      .not("certificate_url", "is", null);
    const certificatesIssued = dbCertificatesCount || 0;

    // 4. Get recent audit logs
    const { data: dbLogs } = await supabase
      .from("audit_logs")
      .select("*, profiles:user_id(full_name)")
      .order("created_at", { ascending: false })
      .limit(10);

    const recentActivity: AdminActivityLog[] = (dbLogs || []).map((l: any) => ({
      id: l.id,
      timestamp: new Date(l.created_at).toISOString().replace("T", " ").substring(0, 16),
      adminName: l.profiles?.full_name || "Admin",
      action: l.action
    }));

    return {
      totalUsers: usersCount || 0,
      totalStudents: studentsCount || 0,
      totalTutors: tutorsCount || 0,
      totalCourses,
      publishedCourses,
      pendingCourses,
      totalRevenue,
      activeEnrollments,
      certificatesIssued,
      recentActivity
    };
  }

  // --- USERS ---
  async getUsers(search?: string, role?: string, status?: string): Promise<AdminUser[]> {
    const supabase = await this.getSupabase();
    let query = supabase.from("profiles").select("*");

    if (role && role !== "all") {
      query = query.eq("role", role);
    }

    const { data, error } = await query;
    if (error) throw error;

    const safeQuery = async (tableName: string) => {
      try {
        const { data, error } = await supabase.from(tableName).select("*");
        if (error) return [];
        return data || [];
      } catch {
        return [];
      }
    };

    const safeQueryOrdered = async (tableName: string, col: string, asc: boolean) => {
      try {
        const { data, error } = await supabase.from(tableName).select("*").order(col, { ascending: asc });
        if (error) return [];
        return data || [];
      } catch {
        return [];
      }
    };

    // Fetch related tables in parallel, handling potential errors for missing/empty tables gracefully
    const [enrollmentsRes, coursesRes, verificationsRes, reviewsRes, logsRes, earningsRes] = await Promise.all([
      safeQuery("enrollments"),
      safeQuery("courses"),
      safeQuery("tutor_verifications"),
      safeQuery("reviews"),
      safeQueryOrdered("audit_logs", "created_at", false),
      safeQuery("tutor_earnings")
    ]);

    const courseMap = new Map<string, any>(coursesRes.map((c: any) => [c.id, c]));

    let list: AdminUser[] = (data || []).map((u: any) => {
      // 1. Map student details if student
      const userEnrollments = enrollmentsRes
        .filter((e: any) => e.learner_id === u.id)
        .map((e: any) => {
          const course = courseMap.get(e.course_id);
          return {
            courseId: e.course_id,
            courseTitle: course ? course.title : "Enrolled Course",
            progressPercent: Number(e.progress || 0),
            enrolledAt: e.created_at ? new Date(e.created_at).toISOString().split("T")[0] : "",
            certificateUrl: e.certificate_url || undefined
          };
        });

      // 2. Map tutor details if tutor
      let tutorDetails = undefined;
      if (u.role === "tutor") {
        const tutorVerify = verificationsRes.find((v: any) => v.tutor_id === u.id);
        const tutorCourses = coursesRes.filter((c: any) => c.tutor_id === u.id);
        const publishedCoursesCount = tutorCourses.filter((c: any) => c.status === "published" || c.approval_status === "approved").length;
        
        // Unique students taught
        const tutorCourseIds = tutorCourses.map((c: any) => c.id);
        const tutorEnrollments = enrollmentsRes.filter((e: any) => tutorCourseIds.includes(e.course_id));
        const uniqueStudents = new Set(tutorEnrollments.map((e: any) => e.learner_id));
        const studentsTaughtCount = uniqueStudents.size;

        // Total revenue
        const tutorEarning = earningsRes.find((e: any) => e.tutor_id === u.id)?.total_earnings || 0;

        // Average rating
        const tutorReviews = reviewsRes.filter((r: any) => tutorCourseIds.includes(r.course_id));
        const averageRating = tutorReviews.length > 0
          ? tutorReviews.reduce((sum: number, r: any) => sum + Number(r.rating || 0), 0) / tutorReviews.length
          : 0;

        tutorDetails = {
          verificationStatus: tutorVerify ? tutorVerify.status : "Not Applied",
          publishedCoursesCount,
          studentsTaughtCount,
          totalRevenue: Number(tutorEarning),
          averageRating: Number(averageRating.toFixed(1)),
          courses: tutorCourses.map((c: any) => {
            const courseEnr = enrollmentsRes.filter((e: any) => e.course_id === c.id);
            const courseRev = courseEnr.length * (c.price || 0);
            return {
              id: c.id,
              title: c.title,
              price: Number(c.price || 0),
              enrollmentCount: courseEnr.length,
              revenue: courseRev
            };
          })
        };
      }

      // 3. Map last activity
      const userLastLog = logsRes.find((l: any) => l.user_id === u.id);
      const lastActivity = userLastLog
        ? `${userLastLog.action} (${new Date(userLastLog.created_at).toLocaleDateString()})`
        : undefined;

      return {
        id: u.id,
        name: u.full_name || u.display_name || "User Account",
        email: u.email || "",
        role: u.role === "admin" ? "admin" : (u.role === "tutor" ? "tutor" : "learner"),
        status: u.status || "Active",
        createdAt: u.created_at ? new Date(u.created_at).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
        walletCoins: u.wallet_coins || 0,
        country: u.country,
        bio: u.bio,
        enrollments: userEnrollments.length > 0 ? userEnrollments : undefined,
        tutorDetails,
        lastActivity
      };
    });

    if (search) {
      const term = search.toLowerCase();
      list = list.filter((u) => u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term));
    }

    if (status && status !== "all") {
      list = list.filter((u) => u.status === status);
    }

    return list;
  }

  async updateUserStatus(userId: string, status: "Active" | "Suspended"): Promise<AdminUser> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from("profiles")
      .update({ status }) // updates status column in profiles
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      // Gracefully handle if status column is missing in profile
      console.warn("Profiles status update failed, fall backing to local status update", error);
      const mockList = this.getFallbackData<any[]>("eduearn_mock_suspended_users", []);
      if (status === "Suspended") {
        if (!mockList.includes(userId)) mockList.push(userId);
      } else {
        const index = mockList.indexOf(userId);
        if (index > -1) mockList.splice(index, 1);
      }
      this.setFallbackData("eduearn_mock_suspended_users", mockList);
      
      const { data: userProfile } = await supabase.from("profiles").select("*").eq("id", userId).single();
      return {
        id: userId,
        name: userProfile?.full_name || "User Account",
        email: userProfile?.email || "",
        role: userProfile?.role || "student",
        status: status,
        createdAt: new Date().toISOString().split("T")[0],
        walletCoins: userProfile?.wallet_coins || 0
      };
    }

    return {
      id: data.id,
      name: data.full_name || "User Account",
      email: data.email || "",
      role: data.role || "student",
      status: data.status || "Active",
      createdAt: data.created_at ? new Date(data.created_at).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
      walletCoins: data.wallet_coins || 0
    };
  }

  async updateUserCoins(userId: string, coins: number): Promise<AdminUser> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from("profiles")
      .update({ wallet_coins: coins })
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.full_name || "User Account",
      email: data.email || "",
      role: data.role || "student",
      status: data.status || "Active",
      createdAt: data.created_at ? new Date(data.created_at).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
      walletCoins: data.wallet_coins || 0
    };
  }

  async deleteUser(userId: string): Promise<boolean> {
    const supabase = await this.getSupabase();
    const { error } = await supabase.from("profiles").delete().eq("id", userId);
    if (error) throw error;
    return true;
  }

  async logAuditAction(adminName: string, action: string, details?: string): Promise<void> {
    const supabase = await this.getSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    await supabase.from("audit_logs").insert({
      user_id: user?.id || null,
      action: action,
      details: details || null,
      ip_address: "127.0.0.1"
    });
  }

  // --- COURSES ---
  async getCourses(search?: string, category?: string, status?: string): Promise<AdminCourse[]> {
    const supabase = await this.getSupabase();
    const query = supabase.from("courses").select("*");

    const { data: coursesData, error } = await query;
    if (error) throw error;

    // Fetch tutor profiles to resolve names
    const tutorIds = Array.from(new Set((coursesData || []).map((c: any) => c.tutor_id)));
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", tutorIds);

    const tutorMap = new Map<string, string>(
      (profilesData || []).map((p: any) => [p.id, p.full_name || "Tutor"])
    );

    // Fetch all enrollments to count them by course
    const { data: enrollmentsData } = await supabase
      .from("enrollments")
      .select("course_id");

    const enrollmentCountMap = new Map<string, number>();
    (enrollmentsData || []).forEach((e: any) => {
      enrollmentCountMap.set(e.course_id, (enrollmentCountMap.get(e.course_id) || 0) + 1);
    });

    let list: AdminCourse[] = (coursesData || []).map((c: any) => {
      const price = Number(c.price || 0);
      const tutorShare = Math.round(price * 0.8);
      const platformShare = price - tutorShare;
      const enrollmentCount = enrollmentCountMap.get(c.id) || 0;
      const revenue = enrollmentCount * price;

      return {
        id: c.id,
        title: c.title,
        tutorName: tutorMap.get(c.tutor_id) || "Applied Tutor",
        tutorId: c.tutor_id,
        category: c.category,
        price,
        tutorEarnings: tutorShare,
        platformEarnings: platformShare,
        status: this.mapCourseStatus(c.approval_status || c.status),
        featured: c.featured || false,
        hidden: c.status === "draft",
        assignedSkill: c.category,
        created_at: c.created_at,
        thumbnail: c.thumbnail,
        enrollmentCount,
        revenue
      };
    });

    if (search) {
      const term = search.toLowerCase();
      list = list.filter((c) => c.title.toLowerCase().includes(term) || c.tutorName.toLowerCase().includes(term));
    }
    if (category && category !== "all") {
      list = list.filter((c) => c.category === category);
    }
    if (status && status !== "all") {
      list = list.filter((c) => c.status === status);
    }

    return list;
  }

  async updateCourseStatus(courseId: string, status: AdminCourse["status"]): Promise<AdminCourse> {
    const supabase = await this.getSupabase();
    const approval_status = status === "Approved" ? "approved" : status === "Rejected" ? "rejected" : "pending";
    const dbStatus = status === "Approved" ? "published" : status === "Archived" ? "archived" : "draft";

    const { data, error } = await supabase
      .from("courses")
      .update({
        approval_status,
        status: dbStatus,
        updated_at: new Date().toISOString()
      })
      .eq("id", courseId)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      title: data.title,
      tutorName: "Applied Tutor",
      tutorId: data.tutor_id,
      category: data.category,
      price: Number(data.price || 0),
      tutorEarnings: Math.round(Number(data.price || 0) * 0.8),
      platformEarnings: Number(data.price || 0) - Math.round(Number(data.price || 0) * 0.8),
      status: this.mapCourseStatus(data.approval_status || data.status),
      featured: false,
      hidden: data.status === "draft",
      assignedSkill: data.category,
      created_at: data.created_at
    };
  }

  async updateCourseFeature(courseId: string, featured: boolean): Promise<AdminCourse> {
    // Gracefully fallback since public.courses doesn't have a featured column
    const supabase = await this.getSupabase();
    const { data, error } = await supabase.from("courses").select("*").eq("id", courseId).single();
    if (error) throw error;

    return {
      id: data.id,
      title: data.title,
      tutorName: "Applied Tutor",
      tutorId: data.tutor_id,
      category: data.category,
      price: Number(data.price || 0),
      tutorEarnings: Math.round(Number(data.price || 0) * 0.8),
      platformEarnings: Number(data.price || 0) - Math.round(Number(data.price || 0) * 0.8),
      status: this.mapCourseStatus(data.approval_status || data.status),
      featured,
      hidden: data.status === "draft",
      assignedSkill: data.category,
      created_at: data.created_at
    };
  }

  async assignCourseCategory(courseId: string, category: string): Promise<AdminCourse> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from("courses")
      .update({ category })
      .eq("id", courseId)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      title: data.title,
      tutorName: "Applied Tutor",
      tutorId: data.tutor_id,
      category: data.category,
      price: Number(data.price || 0),
      tutorEarnings: Math.round(Number(data.price || 0) * 0.8),
      platformEarnings: Number(data.price || 0) - Math.round(Number(data.price || 0) * 0.8),
      status: this.mapCourseStatus(data.approval_status || data.status),
      featured: false,
      hidden: data.status === "draft",
      assignedSkill: data.category,
      created_at: data.created_at
    };
  }

  // --- VERIFICATIONS ---
  async getVerifications(): Promise<TutorVerificationApp[]> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from("tutor_verifications")
      .select("*, profiles:tutor_id(email)");

    if (error) throw error;

    return (data || []).map((v: any) => ({
      id: v.id,
      tutorId: v.tutor_id,
      tutorName: v.tutor_name || "Tutor",
      expertise: v.subject_selection?.selectedSkills ? v.subject_selection.selectedSkills.join(", ") : (v.expertise || "General"),
      education: v.academic_qualifications && v.academic_qualifications.length > 0 ? `${v.academic_qualifications[0].degree} at ${v.academic_qualifications[0].school}` : (v.education || "Not Specified"),
      status: v.status as any,
      govIdFile: v.gov_id_url ? v.gov_id_url.split("/").pop() || "gov-id.pdf" : "",
      studentIdFile: v.degree_url ? v.degree_url.split("/").pop() || "degree.pdf" : "",
      email: v.profiles?.email || "tutor@example.com",
      created_at: v.created_at,
      
      // Extended fields
      personalInfo: v.personal_info,
      academicQualifications: v.academic_qualifications,
      teachingExperience: v.teaching_experience,
      subjectSelection: v.subject_selection,
      govIdUrl: v.gov_id_url,
      degreeUrl: v.degree_url,
      certificatesUrl: v.certificates_url,
      resumeUrl: v.resume_url,
      videoDemoUrl: v.video_demo_url,
      aiEvaluation: v.ai_evaluation,
      adminNotes: v.admin_notes,
      adminFeedback: v.admin_feedback,
      rejectionReason: v.rejection_reason,
      liveInterviewDetails: v.live_interview_details
    }));
  }

  async updateVerificationStatus(
    verificationId: string, 
    status: TutorVerificationApp["status"], 
    updates?: Partial<TutorVerificationApp>
  ): Promise<TutorVerificationApp> {
    const supabase = await this.getSupabase();
    
    // Build update payload
    const payload: any = { status, updated_at: new Date().toISOString() };
    if (updates) {
      if (updates.adminNotes !== undefined) payload.admin_notes = updates.adminNotes;
      if (updates.adminFeedback !== undefined) payload.admin_feedback = updates.adminFeedback;
      if (updates.rejectionReason !== undefined) payload.rejection_reason = updates.rejectionReason;
      if (updates.liveInterviewDetails !== undefined) payload.live_interview_details = updates.liveInterviewDetails;
    }

    const { data, error } = await supabase
      .from("tutor_verifications")
      .update(payload)
      .eq("id", verificationId)
      .select("*, profiles:tutor_id(email)")
      .single();

    if (error) throw error;

    // Trigger role promotion on verify approval
    if (status === "Approved") {
      await supabase
        .from("profiles")
        .update({ role: "tutor", complete: true })
        .eq("id", data.tutor_id);
    }

    return {
      id: data.id,
      tutorId: data.tutor_id,
      tutorName: data.tutor_name || "Tutor",
      expertise: data.subject_selection?.selectedSkills ? data.subject_selection.selectedSkills.join(", ") : (data.expertise || "General"),
      education: data.academic_qualifications && data.academic_qualifications.length > 0 ? `${data.academic_qualifications[0].degree} at ${data.academic_qualifications[0].school}` : (data.education || "Not Specified"),
      status: data.status as any,
      govIdFile: data.gov_id_url ? data.gov_id_url.split("/").pop() || "gov-id.pdf" : "",
      studentIdFile: data.degree_url ? data.degree_url.split("/").pop() || "degree.pdf" : "",
      email: data.profiles?.email || "tutor@example.com",
      created_at: data.created_at,
      
      // Extended fields
      personalInfo: data.personal_info,
      academicQualifications: data.academic_qualifications,
      teachingExperience: data.teaching_experience,
      subjectSelection: data.subject_selection,
      govIdUrl: data.gov_id_url,
      degreeUrl: data.degree_url,
      certificatesUrl: data.certificates_url,
      resumeUrl: data.resume_url,
      videoDemoUrl: data.video_demo_url,
      aiEvaluation: data.ai_evaluation,
      adminNotes: data.admin_notes,
      adminFeedback: data.admin_feedback,
      rejectionReason: data.rejection_reason,
      liveInterviewDetails: data.live_interview_details
    };
  }

  // --- CATEGORIES ---
  async getCategories(): Promise<AdminCategory[]> {
    const rules = await BusinessRulesDb.getCategoryRules();
    return rules.map((r) => ({
      id: r.id,
      name: r.name,
      status: r.status === "Active" ? "Enabled" : "Disabled",
      description: `Tutor Earning: ₹${r.tutorBaseEarning}, Recommended: ₹${r.recommendedSellingPrice}, Allowed Range: ₹${r.minPrice}-₹${r.maxPrice}`,
      created_at: new Date().toISOString(),
      minPrice: r.minPrice,
      recommendedPrice: r.recommendedSellingPrice,
      maxPrice: r.maxPrice,
      platformCommission: r.platformCommission,
      defaultDiscount: r.defaultDiscount,
      tutorBaseEarning: r.tutorBaseEarning,
      discountFunding: r.discountFunding
    } as any));
  }

  async createCategory(name: string, description?: string): Promise<AdminCategory> {
    const rules = await BusinessRulesDb.getCategoryRules();
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const newRule = {
      id,
      name,
      status: "Active" as const,
      tutorBaseEarning: 1500,
      recommendedSellingPrice: 1800,
      minPrice: 1500,
      maxPrice: 25000,
      platformCommission: 16.67,
      defaultDiscount: 10,
      discountFunding: "Platform-funded" as const
    };
    rules.push(newRule);
    await BusinessRulesDb.saveCategoryRules(rules);
    return {
      id,
      name,
      status: "Enabled",
      description: description || "",
      created_at: new Date().toISOString()
    };
  }

  async updateCategory(categoryId: string, updates: Partial<AdminCategory>): Promise<AdminCategory> {
    const rules = await BusinessRulesDb.getCategoryRules();
    let updatedRule: any = null;
    const newRules = rules.map((r) => {
      if (r.id === categoryId) {
        const nextStatus = updates.status === "Enabled" ? "Active" : updates.status === "Disabled" ? "Inactive" : r.status;
        updatedRule = {
          ...r,
          name: updates.name || r.name,
          status: nextStatus,
          tutorBaseEarning: (updates as any).tutorBaseEarning !== undefined ? (updates as any).tutorBaseEarning : r.tutorBaseEarning,
          recommendedSellingPrice: (updates as any).recommendedPrice !== undefined ? (updates as any).recommendedPrice : r.recommendedSellingPrice,
          minPrice: (updates as any).minPrice !== undefined ? (updates as any).minPrice : r.minPrice,
          maxPrice: (updates as any).maxPrice !== undefined ? (updates as any).maxPrice : r.maxPrice,
          platformCommission: (updates as any).platformCommission !== undefined ? (updates as any).platformCommission : r.platformCommission,
          defaultDiscount: (updates as any).defaultDiscount !== undefined ? (updates as any).defaultDiscount : r.defaultDiscount,
          discountFunding: (updates as any).discountFunding !== undefined ? (updates as any).discountFunding : r.discountFunding
        };
        return updatedRule;
      }
      return r;
    });

    if (!updatedRule) {
      throw new Error(`Category rule ${categoryId} not found`);
    }

    await BusinessRulesDb.saveCategoryRules(newRules);

    return {
      id: categoryId,
      name: updatedRule.name,
      status: updatedRule.status === "Active" ? "Enabled" : "Disabled",
      description: updates.description || "",
      created_at: new Date().toISOString()
    };
  }

  async deleteCategory(categoryId: string): Promise<boolean> {
    const rules = await BusinessRulesDb.getCategoryRules();
    const filtered = rules.filter(r => r.id !== categoryId);
    await BusinessRulesDb.saveCategoryRules(filtered);
    return true;
  }

  // --- FINANCE ---
  async getPayouts(): Promise<AdminPayout[]> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from("withdrawal_requests")
      .select("*");

    if (error) throw error;

    // Fetch tutor names
    const tutorIds = Array.from(new Set((data || []).map((w: any) => w.tutor_id)));
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", tutorIds);

    const tutorMap = new Map<string, string>(
      (profilesData || []).map((p: any) => [p.id, p.full_name || "Tutor"])
    );

    return (data || []).map((w: any) => ({
      id: w.id,
      tutorName: tutorMap.get(w.tutor_id) || "Tutor Account",
      tutorId: w.tutor_id,
      amount: Number(w.amount),
      status: (w.status === "pending" ? "Pending" : w.status === "approved" ? "Released" : "Rejected") as any,
      date: new Date(w.created_at).toISOString().split("T")[0],
      method: "Bank Transfer",
      bankDetails: "Linked Account details"
    }));
  }

  async getTransactions(): Promise<AdminTransaction[]> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from("payments")
      .select("*");

    if (error) throw error;

    // Fetch user profiles to resolve names
    const userIds = Array.from(new Set((data || []).map((p: any) => p.user_id)));
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", userIds);

    const userMap = new Map<string, string>(
      (profilesData || []).map((p: any) => [p.id, p.full_name || "Learner"])
    );

    return (data || []).map((p: any) => ({
      id: p.id,
      studentName: userMap.get(p.user_id) || "Student Learner",
      courseTitle: "Premium Course Purchase",
      amount: Number(p.amount),
      date: new Date(p.created_at).toISOString().split("T")[0],
      status: (p.status === "success" || p.status === "completed" ? "Success" : "Failed") as any
    }));
  }

  async updateWithdrawalStatus(payoutId: string, status: AdminPayout["status"]): Promise<AdminPayout> {
    const supabase = await this.getSupabase();
    const dbStatus = status === "Released" ? "approved" : status === "Rejected" ? "rejected" : "pending";

    const { data, error } = await supabase
      .from("withdrawal_requests")
      .update({ status: dbStatus })
      .eq("id", payoutId)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      tutorName: "Tutor Account",
      tutorId: data.tutor_id,
      amount: Number(data.amount),
      status: (data.status === "approved" ? "Released" : data.status === "rejected" ? "Rejected" : "Pending") as any,
      date: new Date(data.created_at).toISOString().split("T")[0],
      method: "Bank Transfer",
      bankDetails: "Linked bank account"
    };
  }

  // --- FALLBACK WRAPPERS (TICKETS, ANNOUNCEMENTS, REPORTS) ---
  // Store locally in fallback files / localStorage to satisfy RLS/production requirements safely
  async getReports(): Promise<AdminReport[]> {
    return this.getFallbackData<AdminReport[]>("eduearn_supabase_reports", [
      { id: "rep-1", reporterName: "Rahul Verma", reportedEntityName: "Spammy Video Ad Course", reportedEntityType: "course", entityId: "c-spam", reason: "Spam content, advertisements inside video lectures", status: "Pending", date: "2026-07-24" }
    ]);
  }

  async resolveReport(reportId: string, status: AdminReport["status"]): Promise<AdminReport> {
    const list = await this.getReports();
    let updated: AdminReport | null = null;
    const newList = list.map((r) => {
      if (r.id === reportId) {
        updated = { ...r, status };
        return updated;
      }
      return r;
    });
    if (!updated) throw new Error("Report not found");
    this.setFallbackData("eduearn_supabase_reports", newList);
    return updated;
  }

  async deleteReview(reviewId: string): Promise<boolean> {
    const supabase = await this.getSupabase();
    const { error } = await supabase.from("reviews").delete().eq("id", reviewId);
    if (error) throw error;
    return true;
  }

  async getTickets(): Promise<SupportTicket[]> {
    return this.getFallbackData<SupportTicket[]>("eduearn_supabase_tickets", [
      { id: "tkt-1", user: "Rahul Verma", email: "rahul@eduearn.com", title: "Certificate Generation Error", description: "Completed React course but certificate page shows undefined name details.", status: "Open", priority: "High", date: "2026-07-25", replies: [] }
    ]);
  }

  async replyTicket(ticketId: string, author: string, replyText: string): Promise<SupportTicket> {
    const list = await this.getTickets();
    let updated: SupportTicket | null = null;
    const newList = list.map((t) => {
      if (t.id === ticketId) {
        const replies = t.replies || [];
        replies.push({
          id: `rep-${Date.now()}`,
          author,
          text: replyText,
          timestamp: new Date().toISOString()
        });
        updated = { ...t, replies };
        return updated;
      }
      return t;
    });
    if (!updated) throw new Error("Ticket not found");
    this.setFallbackData("eduearn_supabase_tickets", newList);
    return updated;
  }

  async resolveTicket(ticketId: string): Promise<SupportTicket> {
    const list = await this.getTickets();
    let updated: SupportTicket | null = null;
    const newList = list.map((t) => {
      if (t.id === ticketId) {
        updated = { ...t, status: "Resolved" as const };
        return updated;
      }
      return t;
    });
    if (!updated) throw new Error("Ticket not found");
    this.setFallbackData("eduearn_supabase_tickets", newList);
    return updated;
  }

  async getAnnouncements(): Promise<AdminAnnouncement[]> {
    return this.getFallbackData<AdminAnnouncement[]>("eduearn_supabase_announcements", [
      { id: "ann-1", title: "Upcoming Platform Server Maintenance", content: "EduEarn will undergo server migration on July 30, 2026, from 02:00 to 04:00 AM IST.", targetAudience: "all", status: "Published", created_at: "2026-07-25" }
    ]);
  }

  async createAnnouncement(ann: Omit<AdminAnnouncement, "id" | "created_at">): Promise<AdminAnnouncement> {
    const list = await this.getAnnouncements();
    const newAnn: AdminAnnouncement = {
      id: `ann-${Date.now()}`,
      ...ann,
      created_at: new Date().toISOString()
    };
    this.setFallbackData("eduearn_supabase_announcements", [...list, newAnn]);
    return newAnn;
  }

  async deleteAnnouncement(announcementId: string): Promise<boolean> {
    const list = await this.getAnnouncements();
    const newList = list.filter((a) => a.id !== announcementId);
    this.setFallbackData("eduearn_supabase_announcements", newList);
    return true;
  }

  // --- SETTINGS ---
  async getSettings(): Promise<PlatformSettings> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from("system_settings")
      .select("*")
      .eq("id", "main_config")
      .maybeSingle();

    if (error || !data) {
      // Default configurations fallback
      return {
        id: "main_config",
        maintenanceMode: false,
        systemVersion: "1.0.0",
        brandColor: "#3B82F6",
        emailNotificationsEnabled: true,
        allowNewRegistrations: true,
        updatedAt: new Date().toISOString()
      };
    }

    return {
      id: data.id,
      maintenanceMode: data.maintenance_mode || false,
      systemVersion: data.system_version || "1.0.0",
      brandColor: data.brand_color || "#3B82F6",
      emailNotificationsEnabled: true,
      allowNewRegistrations: true,
      updatedAt: data.updated_at
    };
  }

  async updateSettings(updates: Partial<PlatformSettings>): Promise<PlatformSettings> {
    const supabase = await this.getSupabase();
    const payload: any = {};
    if (updates.maintenanceMode !== undefined) payload.maintenance_mode = updates.maintenanceMode;
    if (updates.brandColor) payload.brand_color = updates.brandColor;
    if (updates.systemVersion) payload.system_version = updates.systemVersion;
    payload.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("system_settings")
      .update(payload)
      .eq("id", "main_config")
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      maintenanceMode: data.maintenance_mode || false,
      systemVersion: data.system_version || "1.0.0",
      brandColor: data.brand_color || "#3B82F6",
      emailNotificationsEnabled: true,
      allowNewRegistrations: true,
      updatedAt: data.updated_at
    };
  }

  // --- ROLES MATRIX ---
  async getPermissionMatrix(): Promise<PermissionMatrixRow[]> {
    return this.getFallbackData<PermissionMatrixRow[]>("eduearn_supabase_roles_matrix", [
      { permission: "View Marketplace Courses", student: true, tutor: true, admin: true },
      { permission: "Enroll in Premium Courses", student: true, tutor: false, admin: true },
      { permission: "Create Courses & Lessons", student: false, tutor: true, admin: true },
      { permission: "Access CEO Admin Operations Console", student: false, tutor: false, admin: true }
    ]);
  }

  async updatePermissionMatrix(matrix: PermissionMatrixRow[]): Promise<PermissionMatrixRow[]> {
    this.setFallbackData("eduearn_supabase_roles_matrix", matrix);
    return matrix;
  }
}
