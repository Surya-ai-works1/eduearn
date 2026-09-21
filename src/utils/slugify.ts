/**
 * EduEarn Canonical Category & Subject Normalization Utility
 * Centralizes category slugification, legacy alias mapping, and subject matching.
 */

// 1. Canonical Category Aliases mapping to Canonical Category IDs
export const CATEGORY_ALIASES: Record<string, string> = {
  // Legacy short aliases
  "skills": "technology-programming",
  "ai": "ai-data-science",
  "academics": "academic-education",
  "academic": "academic-education",
  "coding": "technology-programming",
  "programming": "technology-programming",
  "tech": "technology-programming",
  "electronics": "engineering-electronics",
  "hardware": "engineering-electronics",
  "media": "photography-media",
  "arts": "creative-arts-design",
  "design": "creative-arts-design",

  // Raw display names & slug variations
  "technology-&-programming": "technology-programming",
  "technology-programming": "technology-programming",
  "technology & programming": "technology-programming",

  "ai-&-data-science": "ai-data-science",
  "ai-data-science": "ai-data-science",
  "ai & data science": "ai-data-science",

  "academic-education": "academic-education",
  "academic education": "academic-education",

  "creative-arts-&-design": "creative-arts-design",
  "creative-arts-design": "creative-arts-design",
  "creative arts & design": "creative-arts-design",

  "video-editing-&-animation": "video-editing-animation",
  "video-editing-animation": "video-editing-animation",
  "video editing & animation": "video-editing-animation",

  "photography-&-media": "photography-media",
  "photography-media": "photography-media",
  "photography & media": "photography-media",

  "engineering-&-electronics": "engineering-electronics",
  "engineering-electronics": "engineering-electronics",
  "engineering & electronics": "engineering-electronics",
  "engineering": "engineering",

  "sports-&-fitness": "sports-fitness",
  "sports-fitness": "sports-fitness",

  "cooking-&-lifestyle": "cooking-lifestyle",
  "cooking-lifestyle": "cooking-lifestyle",

  "business-&-entrepreneurship": "business-entrepreneurship",
  "business-entrepreneurship": "business-entrepreneurship",
};

/**
 * Converts a string into a URL-friendly slug.
 * @param text - The string to slugify.
 */
export function slugify(text: string): string {
  if (!text) return "";
  
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[&\s]+/g, "-")        // Replace & and spaces with -
    .replace(/[^\w\-]+/g, "")       // Remove all non-word chars except dashes
    .replace(/\-\-+/g, "-")         // Replace multiple dashes with single dash
    .replace(/^-+/, "")             // Trim dashes from start
    .replace(/-+$/, "");            // Trim dashes from end
}

/**
 * Maps input string (slug, alias, or raw category name) to canonical Category ID.
 */
export function getCanonicalCategoryId(input?: string | null): string {
  if (!input) return "";
  const raw = input.trim().toLowerCase();
  
  if (CATEGORY_ALIASES[raw]) {
    return CATEGORY_ALIASES[raw];
  }

  const slugified = slugify(input);
  if (CATEGORY_ALIASES[slugified]) {
    return CATEGORY_ALIASES[slugified];
  }

  return slugified;
}

/**
 * Checks if two category values (raw, slug, or alias) match canonically.
 */
export function isCategoryMatch(catA?: string | null, catB?: string | null): boolean {
  if (!catA || !catB) return false;
  return getCanonicalCategoryId(catA) === getCanonicalCategoryId(catB);
}

/**
 * Maps subject IDs / aliases to canonical subject slugs.
 */
export function getCanonicalSubjectId(input?: string | null): string {
  if (!input) return "";
  const slug = slugify(input);
  const mappings: Record<string, string> = {
    "c-programming": "c",
    "web-dev": "web-development",
    "data-structures": "dsa",
    "data-structures-algorithms": "dsa",
    "data-structures-and-algorithms": "dsa",
    "dsa": "dsa",
    "ai-ml": "ai-ml",
    "ai-and-ml": "ai-ml",
    "artificial-intelligence": "ai-ml",
    "gen-ai": "generative-ai",
    "genai": "generative-ai",
    "prompt-engineering": "chatgpt",
  };
  return mappings[slug] || slug;
}

/**
 * Checks if two subject values match canonically.
 */
export function isSubjectMatch(subA?: string | null, subB?: string | null): boolean {
  if (!subA || !subB) return false;
  return getCanonicalSubjectId(subA) === getCanonicalSubjectId(subB);
}

