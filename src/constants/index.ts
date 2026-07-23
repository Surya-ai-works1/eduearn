export const ROLES = {
  GUEST: "guest",
  LEARNER: "learner",
  TUTOR: "tutor",
  ADMIN: "admin",
} as const;

export type UserRole = typeof ROLES[keyof typeof ROLES];

export const COURSE_STATUS = {
  DRAFT: "draft",
  PENDING: "pending_review",
  PUBLISHED: "published",
  ARCHIVED: "archived",
  REJECTED: "rejected",
} as const;

export type CourseStatus = typeof COURSE_STATUS[keyof typeof COURSE_STATUS];

export const TUTOR_STATUS = {
  PENDING: "pending",
  AI_VERIFIED: "ai_verified",
  REJECTED: "rejected",
  SUSPENDED: "suspended",
} as const;

export type TutorStatus = typeof TUTOR_STATUS[keyof typeof TUTOR_STATUS];

export const COURSE_LEVELS = {
  BEGINNER: "beginner",
  INTERMEDIATE: "intermediate",
  ADVANCED: "advanced",
  ALL: "all_levels",
} as const;

export type CourseLevel = typeof COURSE_LEVELS[keyof typeof COURSE_LEVELS];

export const CATEGORIES = [
  { id: "mathematics", name: "Mathematics", icon: "PlusSquare", type: "academic" },
  { id: "physics", name: "Physics", icon: "Zap", type: "academic" },
  { id: "chemistry", name: "Chemistry", icon: "FlaskConical", type: "academic" },
  { id: "computer-science", name: "Computer Science", icon: "Cpu", type: "academic" },
  { id: "competitive-exams", name: "Competitive Exams", icon: "Award", type: "academic" },
  { id: "programming", name: "Programming", icon: "Code2", type: "skills" },
  { id: "design", name: "UI/UX & Graphic Design", icon: "Palette", type: "skills" },
  { id: "music", name: "Music", icon: "Music", type: "skills" },
  { id: "chess", name: "Chess", icon: "Compass", type: "skills" },
  { id: "photography", name: "Photography", icon: "Camera", type: "skills" },
  { id: "cooking", name: "Cooking", icon: "Utensils", type: "skills" },
  { id: "fitness", name: "Fitness & Yoga", icon: "Heart", type: "skills" },
  { id: "ai-prompting", name: "AI Prompt Engineering", icon: "Bot", type: "ai" },
  { id: "data-science", name: "Data Science & ML", icon: "Database", type: "ai" },
  { id: "robotics", name: "Robotics", icon: "Settings", type: "ai" },
] as const;

export const SUPPORT_LINKS = {
  help: "/help",
  community: "/forum",
  tutor: "/tutor-support",
  safety: "/safety",
} as const;
