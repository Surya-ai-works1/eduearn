// src/lib/repositories/studentProfile/IStudentProfileRepository.ts

import { StudentProfile } from "../../types/studentProfile";

export interface IStudentProfileRepository {
  getProfile(studentId: string, client?: any): Promise<StudentProfile | null>;
  updateProfile(studentId: string, profile: Partial<StudentProfile>, client?: any): Promise<StudentProfile>;
  deleteProfile(studentId: string, client?: any): Promise<boolean>;
}
