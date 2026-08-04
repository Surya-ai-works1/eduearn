export interface LearnerType {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  displayOrder: number;
  status: "Active" | "Coming Soon" | "Private Beta" | "Archived";
  dashboardModules: string[];
  aiPersonalizationNotes: string;
}

export const LEARNER_TYPES: LearnerType[] = [
  {
    id: "school",
    name: "School Student",
    slug: "school",
    description: "K-12 student looking for tuition help, homework support, and core subjects learning.",
    icon: "GraduationCap",
    displayOrder: 1,
    status: "Active",
    dashboardModules: ["Tuition", "Homework", "Assignments", "Live Classes"],
    aiPersonalizationNotes: "Tailor study planners for grade-wise K-12 curriculums, school tests schedules, and simplified explanations."
  },
  {
    id: "college",
    name: "College Student",
    slug: "college",
    description: "Undergraduate or postgraduate student seeking career paths, portfolio building, and technical masterclasses.",
    icon: "BookOpen",
    displayOrder: 2,
    status: "Active",
    dashboardModules: ["Career Paths", "My Courses", "AI Hub", "Notes Library", "Certificates"],
    aiPersonalizationNotes: "Recommend career roadmaps, portfolio projects, hackathon events, and resume scanner actions."
  },
  {
    id: "professional",
    name: "Working Professional",
    slug: "professional",
    description: "Industry professional looking for career transitions, upskilling, and certified programs.",
    icon: "Briefcase",
    displayOrder: 3,
    status: "Active",
    dashboardModules: ["Career Paths", "AI Hub", "Certificates", "AI Interview Coach"],
    aiPersonalizationNotes: "Recommend senior technical tracks, corporate leadership workshops, resume ATS analyzers, and interview simulators."
  },
  {
    id: "parent",
    name: "Parent",
    slug: "parent",
    description: "Guardian seeking to monitor child progress, view lesson attendance, manage fees, and check schedules.",
    icon: "Users",
    displayOrder: 4,
    status: "Active",
    dashboardModules: ["Children Registry", "Learning Progress Monitoring", "Fee Logs", "Notifications Hub"],
    aiPersonalizationNotes: "Generate parent progress insight reports, conceptual learning alerts, and kids safety scan checks."
  },
  {
    id: "homemaker",
    name: "Homemaker",
    slug: "homemaker",
    description: "Individuals exploring cooking, creative arts, health, lifestyle, and home wellness peer courses.",
    icon: "Home",
    displayOrder: 5,
    status: "Active",
    dashboardModules: ["Creative Learning", "Cooking & Baking Catalog", "Yoga & Wellness Tracker", "Interactive Lessons"],
    aiPersonalizationNotes: "Provide home recipes generation recommendations, artistic/painting feedback loops, and daily workouts reminders."
  },
  {
    id: "kids",
    name: "Kids",
    slug: "kids",
    description: "Early childhood learner looking for storytelling, creative coding games, and interactive arts.",
    icon: "Sparkles",
    displayOrder: 6,
    status: "Active",
    dashboardModules: ["Block Coding Hub", "Creative Storytelling", "Junior Drawing", "Fun Activities"],
    aiPersonalizationNotes: "Mount child friendly gamified avatars, storytelling visual elements, and playful voice speech tools."
  },
  {
    id: "corporate",
    name: "Corporate Employee",
    slug: "corporate",
    description: "Enterprise group member doing corporate training, agile management, and teamwork courses.",
    icon: "Award",
    displayOrder: 7,
    status: "Archived",
    dashboardModules: ["Agile Training", "Executive Leadership", "Group Project Labs"],
    aiPersonalizationNotes: "Track corporate compliance, team metrics analytics, and peer team performance logs."
  }
];

export function getLearnerTypeBySlug(slug: string): LearnerType | undefined {
  return LEARNER_TYPES.find((l) => l.slug.toLowerCase() === slug.toLowerCase());
}

export function getLearnerTypeById(id: string): LearnerType | undefined {
  return LEARNER_TYPES.find((l) => l.id === id);
}
