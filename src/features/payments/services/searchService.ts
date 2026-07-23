import { MarketplaceService } from "./marketplaceService";
import { MOCK_COURSES, MOCK_TUTORS } from "../../../constants/mockData";

export interface SearchResultItem {
  id: string;
  title: string;
  type: "category" | "skill" | "course" | "tutor" | "live class" | "AI tool";
  subtitle?: string;
  meta?: any;
}

export interface SearchResults {
  categories: SearchResultItem[];
  skills: SearchResultItem[];
  courses: SearchResultItem[];
  tutors: SearchResultItem[];
  liveClasses: SearchResultItem[];
  aiTools: SearchResultItem[];
}

const AI_TOOLS_LIST = [
  { id: "study", title: "AI Study Assistant", desc: "Breakdown complex concepts, theories, and historical events easily." },
  { id: "homework", title: "AI Homework Solver", desc: "Get step-by-step guidance, outlines, and hint checklists." },
  { id: "quiz", title: "AI Quiz Generator", desc: "Generate custom multiple choice tests to evaluate your knowledge." },
  { id: "notes", title: "AI Notes Generator", desc: "Summarize textbook chapters or lectures into structured review notes." },
  { id: "flashcards", title: "AI Flashcards Creator", desc: "Make active recall Q&A card decks for study revision." },
  { id: "planner", title: "AI Study Planner", desc: "Schedule dynamic revision blocks based on exam deadlines." },
  { id: "career", title: "AI Career Guidance", desc: "Align learning progress with high-salary roles & tutoring." },
  { id: "roadmap", title: "AI Learning Roadmap", desc: "Create structured week-by-week pathways to master skills." },
  { id: "programming", title: "AI Coding Helper", desc: "Debug programming code syntax and build widgets step-by-step." },
  { id: "translator", title: "AI Language Translator", desc: "Translate text phrases and study pronunciation details." },
  { id: "doubt", title: "AI Doubt Solver", desc: "Enter quick questions for direct peer-style clarification." },
  { id: "interview", title: "AI Interview Prep", desc: "Simulate coding interviews, behavioral mocks, and get tips." },
  { id: "resume", title: "AI Resume Reviewer", desc: "Upload details to match resume highlights with job specs." },
  { id: "prompt", title: "AI Prompt Coach", desc: "Master structuring LLM prompts using frameworks like Few-shot." },
];

export class SearchService {
  /**
   * Performs dynamic search across all entities.
   */
  public static search(query: string): SearchResults {
    const q = query.trim().toLowerCase();
    
    const results: SearchResults = {
      categories: [],
      skills: [],
      courses: [],
      tutors: [],
      liveClasses: [],
      aiTools: [],
    };

    if (!q) return results;

    // 1. Categories
    const categories = MarketplaceService.getCategories();
    categories.forEach(cat => {
      if (cat.name.toLowerCase().includes(q) && cat.status === "Enabled") {
        results.categories.push({
          id: cat.id,
          title: cat.name,
          type: "category",
          subtitle: `${cat.subcategories.length} subcategories available`
        });
      }
    });

    // 2. Skills
    const skills = MarketplaceService.getAllSubjects();
    skills.forEach(skill => {
      if (skill.name.toLowerCase().includes(q)) {
        results.skills.push({
          id: skill.id,
          title: skill.name,
          type: "skill",
          subtitle: `Category: ${skill.category}`
        });
      }
    });

    // 3. Courses
    MOCK_COURSES.forEach(course => {
      if (course.title.toLowerCase().includes(q)) {
        results.courses.push({
          id: course.id,
          title: course.title,
          type: "course",
          subtitle: `Tutor: ${course.tutorName} • Rating: ⭐${course.rating}`,
          meta: {
            price: course.price,
            discount: (course as any).discount,
            difficulty: course.level,
            category: course.category
          }
        });
      }
    });

    // 4. Tutors
    MOCK_TUTORS.forEach(tutor => {
      if (tutor.fullName.toLowerCase().includes(q)) {
        results.tutors.push({
          id: tutor.id,
          title: tutor.fullName,
          type: "tutor",
          subtitle: `Specialty: ${tutor.subjectsTaught[0] || "Verified Student Tutor"} • ⭐${tutor.rating}`
        });
      }
    });

    // 5. Live Classes
    try {
      const liveStored = typeof window !== "undefined" ? localStorage.getItem("eduearn_live_classes") : null;
      const parsedLives = liveStored ? JSON.parse(liveStored) : [];
      
      // Static fallbacks
      const fallbackLives = [
        { id: "live-1", title: "Calculus Limits Interactive Room", platform: "Google Meet", time: "Starts in 30 mins" },
        { id: "live-2", title: "Kuchipudi Mudras Performance Review", platform: "Zoom", time: "Starts in 2 hours" }
      ];

      const allLiveClasses = [...parsedLives, ...fallbackLives];
      allLiveClasses.forEach((l: any) => {
        if (l.title.toLowerCase().includes(q)) {
          results.liveClasses.push({
            id: l.id,
            title: l.title,
            type: "live class",
            subtitle: `Platform: ${l.platform || "Video Room"} • ${l.time || "Scheduled"}`
          });
        }
      });
    } catch {
      // Ignored
    }

    // 6. AI Tools
    AI_TOOLS_LIST.forEach(tool => {
      if (tool.title.toLowerCase().includes(q) || tool.desc.toLowerCase().includes(q)) {
        results.aiTools.push({
          id: tool.id,
          title: tool.title,
          type: "AI tool",
          subtitle: tool.desc
        });
      }
    });

    return results;
  }

  /**
   * Cached Recent Searches CRUD
   */
  public static getRecentSearches(): string[] {
    if (typeof window === "undefined") return [];
    try {
      const cached = localStorage.getItem("eduearn_recent_searches");
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  }

  public static addRecentSearch(query: string): string[] {
    if (typeof window === "undefined" || !query.trim()) return [];
    try {
      const current = this.getRecentSearches();
      const updated = [query.trim(), ...current.filter(item => item !== query.trim())].slice(0, 5);
      localStorage.setItem("eduearn_recent_searches", JSON.stringify(updated));
      return updated;
    } catch {
      return [];
    }
  }

  public static clearRecentSearches(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem("eduearn_recent_searches");
  }
}
