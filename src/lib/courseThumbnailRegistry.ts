export interface CourseThumbnailInput {
  id?: string;
  category?: string;
  categoryId?: string;
  categoryName?: string;
  subjectId?: string;
  subjectName?: string;
  subcategory?: string;
  title?: string;
  thumbnail?: string;
  image?: string;
  imageSrc?: string;
}

// Subject-to-thumbnail mapping table
const SUBJECT_THUMBNAILS: Record<string, string> = {
  // Programming & Technology
  "python": "/images/courses/python.webp",
  "web-development": "/images/courses/web-dev.webp",
  "web-dev": "/images/courses/web-dev.webp",
  "javascript": "/images/courses/web-dev.webp",
  "react": "/images/courses/web-dev.webp",
  "next-js": "/images/courses/web-dev.webp",
  "node-js": "/images/courses/web-dev.webp",
  "html-css": "/images/courses/web-dev.webp",
  "java": "/images/courses/generic-programming.webp",
  "c-plus-plus": "/images/courses/generic-programming.webp",
  "cpp": "/images/courses/generic-programming.webp",
  "ai-ml": "/images/courses/ai.webp",
  "ai": "/images/courses/ai.webp",
  "chatgpt": "/images/courses/ai.webp",
  "gemini": "/images/courses/ai.webp",
  "claude": "/images/courses/ai.webp",
  "deep-learning": "/images/courses/ai.webp",
  "computer-vision": "/images/courses/ai.webp",
  "nlp": "/images/courses/ai.webp",
  "cyber-security": "/images/courses/generic-programming.webp",
  "data-science": "/images/courses/generic-programming.webp",
  "computer-science": "/images/courses/computer-science.webp",

  // Academics & School
  "biology": "/images/courses/biology.webp",
  "class-11-bipc": "/images/courses/biology.webp",
  "class-12-bipc": "/images/courses/biology.webp",
  "mathematics": "/images/courses/mathematics.webp",
  "maths": "/images/courses/mathematics.webp",
  "class-11-mpc": "/images/courses/mathematics.webp",
  "class-12-mpc": "/images/courses/mathematics.webp",
  "physics": "/images/courses/physics.webp",
  "chemistry": "/images/courses/chemistry.webp",
  "english": "/images/courses/english.webp",
  "hindi": "/images/courses/generic-language.webp",
  "telugu": "/images/courses/generic-language.webp",
  "tamil": "/images/courses/generic-language.webp",
  "kannada": "/images/courses/generic-language.webp",
  "french": "/images/courses/generic-language.webp",
  "german": "/images/courses/generic-language.webp",
  "japanese": "/images/courses/generic-language.webp",
  "social-studies": "/images/courses/generic-school.webp",
  "geography": "/images/courses/generic-school.webp",
  "history": "/images/courses/generic-school.webp",

  // Business & Commerce
  "economics": "/images/courses/economics.webp",
  "commerce": "/images/courses/commerce.webp",
  "class-11-commerce": "/images/courses/commerce.webp",
  "class-12-commerce": "/images/courses/commerce.webp",
  "accountancy": "/images/courses/accountancy.webp",
  "accounting": "/images/courses/accountancy.webp",
  "finance": "/images/courses/generic-business.webp",
  "stock-market": "/images/courses/generic-business.webp",
  "entrepreneurship": "/images/courses/generic-business.webp",

  // Extracurriculars & Skills
  "photography": "/images/courses/photography.webp",
  "videography": "/images/courses/photography.webp",
  "guitar": "/images/courses/music.webp",
  "piano": "/images/courses/music.webp",
  "keyboard": "/images/courses/music.webp",
  "violin": "/images/courses/music.webp",
  "flute": "/images/courses/music.webp",
  "singing": "/images/courses/music.webp",
  "music": "/images/courses/music.webp",
  "cooking": "/images/courses/cooking.webp",
  "baking": "/images/courses/cooking.webp",
  "dance": "/images/courses/dance.webp",
  "kuchipudi": "/images/courses/dance.webp",
  "bharatanatyam": "/images/courses/dance.webp",
  "hip-hop": "/images/courses/dance.webp",
  "western": "/images/courses/dance.webp",
  "classical": "/images/courses/dance.webp",
  "drawing": "/images/courses/arts.webp",
  "painting": "/images/courses/arts.webp",
  "sketching": "/images/courses/arts.webp",
  "crafts": "/images/courses/arts.webp",
  "arts": "/images/courses/arts.webp",
  "yoga": "/images/courses/generic-creative.webp",
  "fitness": "/images/courses/generic-creative.webp",
  "public-speaking": "/images/courses/english.webp",
  "chess": "/images/courses/generic-creative.webp",
  "digital-marketing": "/images/courses/generic-business.webp",
  "ui-ux": "/images/courses/arts.webp",
  "graphic-design": "/images/courses/arts.webp",
  "video-editing": "/images/courses/photography.webp",
};

// Category fallbacks
const CATEGORY_FALLBACKS: Record<string, string> = {
  programming: "/images/courses/generic-programming.webp",
  coding: "/images/courses/generic-programming.webp",
  tech: "/images/courses/generic-programming.webp",
  ai: "/images/courses/ai.webp",
  business: "/images/courses/generic-business.webp",
  commerce: "/images/courses/commerce.webp",
  finance: "/images/courses/generic-business.webp",
  language: "/images/courses/generic-language.webp",
  languages: "/images/courses/generic-language.webp",
  english: "/images/courses/english.webp",
  school: "/images/courses/generic-school.webp",
  academic: "/images/courses/generic-school.webp",
  academics: "/images/courses/generic-school.webp",
  creative: "/images/courses/generic-creative.webp",
  skills: "/images/courses/generic-creative.webp",
  arts: "/images/courses/arts.webp",
  music: "/images/courses/music.webp",
};

const DEFAULT_FALLBACK = "/images/courses/generic-education.webp";

export function getCourseThumbnail(input?: CourseThumbnailInput | string | null): string {
  if (!input) return DEFAULT_FALLBACK;

  // Handle string argument (e.g. subjectId or category)
  if (typeof input === "string") {
    const key = input.toLowerCase().trim();
    if (SUBJECT_THUMBNAILS[key]) return SUBJECT_THUMBNAILS[key];
    if (CATEGORY_FALLBACKS[key]) return CATEGORY_FALLBACKS[key];
    return DEFAULT_FALLBACK;
  }

  // 1. Direct custom thumbnail/image provided on object (if not broken/legacy jpg fallback)
  const explicitThumbnail = input.thumbnail || input.image || input.imageSrc;
  if (
    explicitThumbnail &&
    !explicitThumbnail.endsWith("fallback.jpg") &&
    !explicitThumbnail.endsWith("fallback.png") &&
    explicitThumbnail.startsWith("/images/")
  ) {
    return explicitThumbnail;
  }

  // 2. Check by subjectId
  if (input.subjectId) {
    const sid = input.subjectId.toLowerCase().trim();
    if (SUBJECT_THUMBNAILS[sid]) return SUBJECT_THUMBNAILS[sid];
  }

  // 3. Check by subjectName
  if (input.subjectName) {
    const sname = input.subjectName.toLowerCase().replace(/[^a-z0-9]/g, "-").trim();
    if (SUBJECT_THUMBNAILS[sname]) return SUBJECT_THUMBNAILS[sname];

    // Substring match in subjectName
    for (const [key, val] of Object.entries(SUBJECT_THUMBNAILS)) {
      if (input.subjectName.toLowerCase().includes(key)) return val;
    }
  }

  // 4. Check by title keywords
  if (input.title) {
    const t = input.title.toLowerCase();
    if (t.includes("biology")) return "/images/courses/biology.webp";
    if (t.includes("computer science") || t.includes("computer-science")) return "/images/courses/computer-science.webp";
    if (t.includes("english")) return "/images/courses/english.webp";
    if (t.includes("economics")) return "/images/courses/economics.webp";
    if (t.includes("commerce")) return "/images/courses/commerce.webp";
    if (t.includes("accountancy") || t.includes("accounting")) return "/images/courses/accountancy.webp";
    if (t.includes("python")) return "/images/courses/python.webp";
    if (t.includes("web dev") || t.includes("react") || t.includes("javascript")) return "/images/courses/web-dev.webp";
    if (t.includes("ai ") || t.includes("machine learning") || t.includes("prompt")) return "/images/courses/ai.webp";
    if (t.includes("math")) return "/images/courses/mathematics.webp";
    if (t.includes("physics")) return "/images/courses/physics.webp";
    if (t.includes("chemistry")) return "/images/courses/chemistry.webp";
    if (t.includes("photography")) return "/images/courses/photography.webp";
    if (t.includes("music") || t.includes("piano") || t.includes("guitar")) return "/images/courses/music.webp";
    if (t.includes("dance") || t.includes("kuchipudi") || t.includes("bharatanatyam")) return "/images/courses/dance.webp";
    if (t.includes("cooking") || t.includes("baking")) return "/images/courses/cooking.webp";
    if (t.includes("sketching") || t.includes("drawing") || t.includes("paint")) return "/images/courses/arts.webp";
  }

  // 5. Check by category / categoryId / subcategory
  const cat = (input.category || input.categoryId || input.subcategory || "").toLowerCase();
  if (cat) {
    for (const [key, val] of Object.entries(CATEGORY_FALLBACKS)) {
      if (cat.includes(key)) return val;
    }
  }

  return DEFAULT_FALLBACK;
}

// Category Banner Registry
const CATEGORY_BANNERS: Record<string, string> = {
  // Academic Education
  "academics": "/images/categories/academic.webp",
  "academic": "/images/categories/academic.webp",
  "academic-education": "/images/categories/academic.webp",
  "school": "/images/categories/academic.webp",

  // Technology & Programming
  "technology-programming": "/images/categories/technology.webp",
  "technology": "/images/categories/technology.webp",
  "programming": "/images/categories/technology.webp",
  "coding": "/images/categories/technology.webp",

  // AI & Data Science
  "ai-data-science": "/images/categories/ai.webp",
  "ai": "/images/categories/ai.webp",
  "ai-prompting": "/images/categories/ai.webp",
  "ai-innovation": "/images/categories/ai.webp",
  "data-science": "/images/categories/ai.webp",

  // Creative Arts & Design
  "creative-arts-design": "/images/categories/creative.webp",
  "creative-arts": "/images/categories/creative.webp",
  "creative": "/images/categories/creative.webp",
  "design": "/images/categories/creative.webp",
  "arts": "/images/categories/creative.webp",

  // Video Editing & Animation
  "video-editing-animation": "/images/categories/video.webp",
  "video-editing": "/images/categories/video.webp",
  "video": "/images/categories/video.webp",
  "animation": "/images/categories/video.webp",

  // Photography & Media
  "photography-media": "/images/categories/photography.webp",
  "photography": "/images/categories/photography.webp",
  "media": "/images/categories/photography.webp",

  // Music
  "music": "/images/categories/music.webp",

  // Dance
  "dance": "/images/categories/dance.webp",

  // Sports & Fitness
  "sports-fitness": "/images/categories/fitness.webp",
  "fitness": "/images/categories/fitness.webp",
  "sports": "/images/categories/fitness.webp",

  // Cooking & Lifestyle
  "cooking-lifestyle": "/images/categories/cooking.webp",
  "cooking": "/images/categories/cooking.webp",
  "lifestyle": "/images/categories/cooking.webp",

  // Business & Entrepreneurship
  "business-entrepreneurship": "/images/categories/business.webp",
  "business": "/images/categories/business.webp",
  "entrepreneurship": "/images/categories/business.webp",

  // Marketing
  "marketing": "/images/categories/marketing.webp",
  "digital-marketing": "/images/categories/marketing.webp",

  // Communication
  "communication": "/images/categories/communication.webp",
  "public-speaking": "/images/categories/communication.webp",

  // Languages
  "languages": "/images/categories/languages.webp",
  "language": "/images/categories/languages.webp",

  // Catch-all skills
  "skills": "/images/categories/creative.webp",
};

export function getCategoryBanner(categoryIdOrName?: string | null): string {
  if (!categoryIdOrName) return "/images/categories/academic.webp";
  const key = categoryIdOrName.toLowerCase().replace(/[^a-z0-9]/g, "-").trim();

  if (CATEGORY_BANNERS[key]) return CATEGORY_BANNERS[key];

  // Try partial match
  for (const [k, val] of Object.entries(CATEGORY_BANNERS)) {
    if (key.includes(k) || k.includes(key)) return val;
  }

  return "/images/categories/academic.webp";
}

