import { createClient } from "../../../lib/supabase";

export interface SchoolEnrollmentPayload {
  studentId: string;
  academicYearId?: string;
  boardId?: string;
  classId?: string;
  section?: string;
  rollNumber?: string;
  admissionNumber?: string;
  schoolName?: string;
  emergencyContact?: string;
  contactNumber?: string;
  parentEmail?: string;
  preferredLanguage?: string;
}

export class EnrollmentSyncService {
  /**
   * Automatically creates or updates a student's academic profile enrollment details
   * upon purchasing a School Tuition course (called from the checkout pipeline).
   */
  static async autoEnrollStudent(payload: SchoolEnrollmentPayload) {
    const supabase = createClient();
    try {
      const admissionNum = payload.admissionNumber || `ADM-${Date.now()}`;
      
      const { data, error } = await supabase
        .from("student_academic_profiles")
        .upsert({
          student_id: payload.studentId,
          academic_year_id: payload.academicYearId || null,
          board_id: payload.boardId || null,
          class_id: payload.classId || null,
          section: payload.section || "A",
          roll_number: payload.rollNumber || null,
          admission_number: admissionNum,
          school_name: payload.schoolName || null,
          emergency_contact: payload.emergencyContact || null,
          contact_number: payload.contactNumber || null,
          parent_email: payload.parentEmail || null,
          preferred_language: payload.preferredLanguage || "en",
          status: "Active",
          updated_at: new Date().toISOString()
        }, {
          onConflict: "student_id"
        })
        .select()
        .single();

      if (error) throw error;
      return { ok: true, data };
    } catch (err: any) {
      console.error("[ENROLLMENT AUTO SYNC] Failed to create or update academic profile:", err);
      // Fallback/log simulation during development
      return { ok: false, error: err.message };
    }
  }
}
