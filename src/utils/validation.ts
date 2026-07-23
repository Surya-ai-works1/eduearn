import { z } from "zod";

/**
 * Login validation schema.
 */
export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

/**
 * Register validation schema.
 */
export const registerSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters long"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

/**
 * Become Tutor application validation schema (enforcing the 16-24 age limit for Sprints).
 */
export const becomeTutorSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters long"),
  email: z.string().email("Please enter a valid email address"),
  dob: z.string().refine((val) => {
    const birthDate = new Date(val);
    const today = new Date();
    if (isNaN(birthDate.getTime())) return false;
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 16 && age <= 24;
  }, "Tutor applicants must be between 16 and 24 years of age for the initial launch"),
  expertise: z.string().min(3, "Please specify your areas of expertise (e.g. React, Chess, Algebra)"),
  bio: z.string().min(20, "Please write a biography about yourself (at least 20 characters)"),
  terms: z.boolean().refine((val) => val === true, "You must accept the community guidelines"),
});
