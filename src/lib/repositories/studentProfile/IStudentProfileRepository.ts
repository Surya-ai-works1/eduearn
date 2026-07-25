// src/lib/repositories/studentProfile/IStudentProfileRepository.ts

import { StudentProfile } from "../../types/studentProfile";

export interface IStudentProfileRepository {
  getProfile(studentId: string): Promise<StudentProfile | null>;
  updateProfile(studentId: string, profile: Partial<StudentProfile>): Promise<StudentProfile>;
}
