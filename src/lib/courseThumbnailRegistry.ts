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
  "java": "/images/courses/technology-programming.webp",
  "c-plus-plus": "/images/courses/technology-programming.webp",
  "cpp": "/images/courses/technology-programming.webp",
  "ai-ml": "/images/courses/ai-data-science.webp",
  "ai": "/images/courses/ai-data-science.webp",
  "chatgpt": "/images/courses/ai-data-science.webp",
  "gemini": "/images/courses/ai-data-science.webp",
  "claude": "/images/courses/ai-data-science.webp",
  "deep-learning": "/images/courses/ai-data-science.webp",
  "computer-vision": "/images/courses/ai-data-science.webp",
  "nlp": "/images/courses/ai-data-science.webp",
  "cyber-security": "/images/courses/technology-programming.webp",
  "data-science": "/images/courses/technology-programming.webp",
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
  "hindi": "/images/courses/languages.webp",
  "telugu": "/images/courses/languages.webp",
  "tamil": "/images/courses/languages.webp",
  "kannada": "/images/courses/languages.webp",
  "french": "/images/courses/languages.webp",
  "german": "/images/courses/languages.webp",
  "japanese": "/images/courses/languages.webp",
  "social-studies": "/images/courses/academics.webp",
  "geography": "/images/courses/academics.webp",
  "history": "/images/courses/academics.webp",
  "class-1": "/images/courses/class1.webp",
  "class1": "/images/courses/class1.webp",
  "class-7": "/images/courses/class7.webp",
  "class7": "/images/courses/class7.webp",

  // Business & Commerce
  "economics": "/images/courses/economics.png",
  "commerce": "/images/courses/commerce.png",
  "class-11-commerce": "/images/courses/commerce.png",
  "class-12-commerce": "/images/courses/commerce.png",
  "accountancy": "/images/courses/accountancy.webp",
  "accounting": "/images/courses/accountancy.webp",
  "finance": "/images/courses/business.webp",
  "stock-market": "/images/courses/business.webp",
  "entrepreneurship": "/images/courses/business.webp",

  // Extracurriculars & Skills
  "photography": "/images/courses/photography.webp",
  "videography": "/images/courses/photography.webp",
  "guitar": "/images/courses/music.jpg",
  "piano": "/images/courses/music.jpg",
  "keyboard": "/images/courses/music.jpg",
  "violin": "/images/courses/music.jpg",
  "flute": "/images/courses/music.jpg",
  "singing": "/images/courses/music.jpg",
  "music": "/images/courses/music.jpg",
  "cooking": "/images/courses/cooking.webp",
  "baking": "/images/courses/cooking.webp",
  "dance": "/images/courses/dance.jpg",
  "kuchipudi": "/images/courses/dance.jpg",
  "bharatanatyam": "/images/courses/dance.jpg",
  "hip-hop": "/images/courses/dance.jpg",
  "western": "/images/courses/dance.jpg",
  "classical": "/images/courses/dance.jpg",
  "origami": "/images/courses/origami.webp",
  "sketching": "/images/courses/sketching.webp",
  "painting": "/images/courses/painting.webp",
  "drawing": "/images/courses/sketching.webp",
  "crafts": "/images/courses/origami.webp",
  "arts": "/images/courses/arts.jpg",
  "yoga": "/images/courses/arts.jpg",
  "fitness": "/images/courses/sports.webp",
  "public-speaking": "/images/courses/english.webp",
  "chess": "/images/courses/arts.jpg",
  "digital-marketing": "/images/courses/marketing.webp",
  "ui-ux": "/images/courses/arts.jpg",
  "graphic-design": "/images/courses/arts.jpg",
  "video-editing": "/images/courses/photography.webp",
};

// Category fallbacks
const CATEGORY_FALLBACKS: Record<string, string> = {
  programming: "/images/courses/technology-programming.webp",
  coding: "/images/courses/technology-programming.webp",
  tech: "/images/courses/technology-programming.webp",
  ai: "/images/courses/ai-data-science.webp",
  business: "/images/courses/business.webp",
  commerce: "/images/courses/commerce.png",
  finance: "/images/courses/business.webp",
  language: "/images/courses/languages.webp",
  languages: "/images/courses/languages.webp",
  english: "/images/courses/english.webp",
  school: "/images/courses/academics.webp",
  academic: "/images/courses/academics.webp",
  academics: "/images/courses/academics.webp",
  creative: "/images/courses/arts.jpg",
  skills: "/images/courses/arts.jpg",
  arts: "/images/courses/arts.jpg",
  music: "/images/courses/music.jpg",
  dance: "/images/courses/dance.jpg",
};

const DEFAULT_FALLBACK = "/images/courses/academic-education.webp";

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
    !explicitThumbnail.includes("coding-v2") &&
    explicitThumbnail.startsWith("/images/")
  ) {
    return explicitThumbnail;
  }

  // 2. Check by course ID or slug
  if (input.id) {
    const idKey = input.id.toLowerCase().trim();
    if (SUBJECT_THUMBNAILS[idKey]) return SUBJECT_THUMBNAILS[idKey];
  }

  // 3. Check by subjectId
  if (input.subjectId) {
    const sid = input.subjectId.toLowerCase().trim();
    if (SUBJECT_THUMBNAILS[sid]) return SUBJECT_THUMBNAILS[sid];
  }

  // 4. Check by subjectName
  if (input.subjectName) {
    const sname = input.subjectName.toLowerCase().replace(/[^a-z0-9]/g, "-").trim();
    if (SUBJECT_THUMBNAILS[sname]) return SUBJECT_THUMBNAILS[sname];

    // Substring match in subjectName
    for (const [key, val] of Object.entries(SUBJECT_THUMBNAILS)) {
      if (input.subjectName.toLowerCase().includes(key)) return val;
    }
  }

  // 5. Check by title keywords
  if (input.title) {
    const t = input.title.toLowerCase();
    if (t.includes("class 1 ") || t.includes("class 1 training") || t.includes("class 1-")) return "/images/courses/class1.webp";
    if (t.includes("class 7 ") || t.includes("class 7 training") || t.includes("class 7-")) return "/images/courses/class7.webp";
    if (t.includes("origami")) return "/images/courses/origami.webp";
    if (t.includes("sketching")) return "/images/courses/sketching.webp";
    if (t.includes("painting") || t.includes("paint")) return "/images/courses/painting.webp";
    if (t.includes("drawing")) return "/images/courses/sketching.webp";
    if (t.includes("biology")) return "/images/courses/biology.webp";
    if (t.includes("computer science") || t.includes("computer-science")) return "/images/courses/computer-science.webp";
    if (t.includes("english")) return "/images/courses/english.webp";
    if (t.includes("economics")) return "/images/courses/economics.png";
    if (t.includes("commerce")) return "/images/courses/commerce.png";
    if (t.includes("accountancy") || t.includes("accounting")) return "/images/courses/accountancy.webp";
    if (t.includes("python")) return "/images/courses/python.webp";
    if (t.includes("web dev") || t.includes("react") || t.includes("javascript")) return "/images/courses/web-dev.webp";
    if (t.includes("ai ") || t.includes("machine learning") || t.includes("prompt")) return "/images/courses/ai-data-science.webp";
    if (t.includes("math")) return "/images/courses/mathematics.webp";
    if (t.includes("physics")) return "/images/courses/physics.webp";
    if (t.includes("chemistry")) return "/images/courses/chemistry.webp";
    if (t.includes("photography")) return "/images/courses/photography.webp";
    if (t.includes("music") || t.includes("piano") || t.includes("guitar")) return "/images/courses/music.jpg";
    if (t.includes("dance") || t.includes("kuchipudi") || t.includes("bharatanatyam")) return "/images/courses/dance.jpg";
    if (t.includes("cooking") || t.includes("baking")) return "/images/courses/cooking.webp";
  }

  // 6. Check by category / categoryId / subcategory
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
  "academics": "/images/courses/academic-education.webp",
  "academic": "/images/courses/academic-education.webp",
  "academic-education": "/images/courses/academic-education.webp",
  "school": "/images/courses/academic-education.webp",

  // Technology & Programming
  "technology-programming": "/images/courses/technology-programming.webp",
  "technology": "/images/courses/technology-programming.webp",
  "programming": "/images/courses/technology-programming.webp",
  "coding": "/images/courses/technology-programming.webp",

  // AI & Data Science
  "ai-data-science": "/images/courses/ai-data-science.webp",
  "ai": "/images/courses/ai-data-science.webp",
  "ai-prompting": "/images/courses/ai-data-science.webp",
  "ai-innovation": "/images/courses/ai-data-science.webp",
  "data-science": "/images/courses/ai-data-science.webp",

  // Creative Arts & Design
  "creative-arts-design": "/images/courses/arts.jpg",
  "creative-arts": "/images/courses/arts.jpg",
  "creative": "/images/courses/arts.jpg",
  "design": "/images/courses/arts.jpg",
  "arts": "/images/courses/arts.jpg",

  // Video Editing & Animation
  "video-editing-animation": "/images/courses/video-editing.webp",
  "video-editing": "/images/courses/video-editing.webp",
  "video": "/images/courses/video-editing.webp",
  "animation": "/images/courses/video-editing.webp",

  // Photography & Media
  "photography-media": "/images/courses/photography.webp",
  "photography": "/images/courses/photography.webp",
  "media": "/images/courses/photography.webp",

  // Music
  "music": "/images/courses/music.jpg",

  // Dance
  "dance": "/images/courses/dance.jpg",

  // Sports & Fitness
  "sports-fitness": "/images/courses/sports.webp",
  "fitness": "/images/courses/sports.webp",
  "sports": "/images/courses/sports.webp",

  // Cooking & Lifestyle
  "cooking-lifestyle": "/images/courses/cooking.webp",
  "cooking": "/images/courses/cooking.webp",
  "lifestyle": "/images/courses/cooking.webp",

  // Business & Entrepreneurship
  "business-entrepreneurship": "/images/courses/business.webp",
  "business": "/images/courses/business.webp",
  "entrepreneurship": "/images/courses/business.webp",

  // Marketing
  "marketing": "/images/courses/marketing.webp",
  "digital-marketing": "/images/courses/marketing.webp",

  // Communication
  "communication": "/images/courses/communication.webp",
  "public-speaking": "/images/courses/communication.webp",

  // Languages
  "languages": "/images/courses/languages.webp",
  "language": "/images/courses/languages.webp",

  // Catch-all skills
  "skills": "/images/courses/creative-arts.webp",
};

export function getCategoryBanner(categoryIdOrName?: string | null): string {
  if (!categoryIdOrName) return "/images/courses/academic-education.webp";
  const key = categoryIdOrName.toLowerCase().replace(/[^a-z0-9]/g, "-").trim();

  if (CATEGORY_BANNERS[key]) return CATEGORY_BANNERS[key];

  // Try partial match
  for (const [k, val] of Object.entries(CATEGORY_BANNERS)) {
    if (key.includes(k) || k.includes(key)) return val;
  }

  return "/images/courses/academic-education.webp";
}

