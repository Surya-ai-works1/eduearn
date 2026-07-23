import { ALL_SUBJECTS } from "../constants/mockData";

export function getLevenshteinDistance(a: string, b: string): number {
  const matrix = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      if (a[i - 1] === b[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,    // deletion
          matrix[i][j - 1] + 1,    // insertion
          matrix[i - 1][j - 1] + 1 // substitution
        );
      }
    }
  }
  return matrix[a.length][b.length];
}

export function isTolerantMatch(qWord: string, targetWord: string): boolean {
  const qw = qWord.toLowerCase().trim();
  const tw = targetWord.toLowerCase().trim();
  if (tw.includes(qw) || qw.includes(tw)) return true;
  if (qw.length < 3) return false;
  const distance = getLevenshteinDistance(qw, tw);
  const maxAllowedDistance = qw.length <= 4 ? 1 : 2;
  return distance <= maxAllowedDistance;
}

export const SYNONYM_MAP: Record<string, string[]> = {
  dance: ["kuchipudi", "bharatanatyam", "hip-hop", "hip hop", "western", "classical", "dance"],
  coding: ["python", "java", "c-plus-plus", "javascript", "react", "next-js", "node-js", "ai-ml", "programming", "coding", "web development", "development"],
  programming: ["python", "java", "c-plus-plus", "javascript", "react", "next-js", "node-js", "ai-ml", "programming", "coding", "web development", "development"],
  music: ["keyboard", "guitar", "piano", "violin", "flute", "singing", "music", "musician"],
  photography: ["camera", "dslr", "photography", "photo", "photographer"],
  chess: ["chess", "grandmaster", "tactics", "strategy"],
  cooking: ["cooking", "baking", "recipe", "chef", "recipes", "food"],
  english: ["english", "fluent", "grammar", "speaking", "language"],
};

export function getSearchTerms(query: string): string[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  const queryTerms = q.split(/\s+/).filter(Boolean);
  const expandedTerms = [...queryTerms];
  
  queryTerms.forEach(term => {
    // Check direct synonyms
    if (SYNONYM_MAP[term]) {
      expandedTerms.push(...SYNONYM_MAP[term]);
    }
    // Check if term is typo-tolerant key of synonym
    Object.keys(SYNONYM_MAP).forEach(key => {
      if (isTolerantMatch(term, key)) {
        expandedTerms.push(...SYNONYM_MAP[key]);
      }
    });
  });
  
  return Array.from(new Set(expandedTerms));
}

export function getImpliedCategory(query: string): string | null {
  const terms = getSearchTerms(query);
  if (terms.length === 0) return null;

  for (const term of terms) {
    const match = ALL_SUBJECTS.find(sub => 
      sub.id.toLowerCase() === term || 
      sub.name.toLowerCase() === term ||
      isTolerantMatch(term, sub.id.toLowerCase()) ||
      isTolerantMatch(term, sub.name.toLowerCase())
    );
    if (match) {
      return match.category;
    }
  }
  return null;
}

export interface SearchTutor {
  id: string;
  fullName: string;
  bio?: string;
  expertise?: string[];
  subjectsTaught?: string[];
  subjectsTaughtIds?: string[];
  classLevels?: string[];
  languages?: string[];
}

export interface SearchCourse {
  id: string;
  tutorName?: string;
  categoryId?: string;
  category?: string;
  subjectId?: string;
  subjectName?: string;
  title?: string;
  description?: string;
  language?: string;
}

export function scoreTutor(tutor: SearchTutor, query: string): number {
  const terms = getSearchTerms(query);
  if (terms.length === 0) return 1; // default score if no search query

  let score = 0;

  terms.forEach((term) => {
    // Is it a query term or a synonym? (Query terms get slightly higher weight)
    const isQueryTerm = query.toLowerCase().includes(term);
    const weight = isQueryTerm ? 1.5 : 1.0;

    // 1. Primary Skill (Highest Priority)
    const primarySkill = tutor.expertise && tutor.expertise[0];
    if (primarySkill && isTolerantMatch(term, primarySkill)) {
      score += 1000 * weight;
    }

    // 2. Tutor Main Subject (Taught Subjects)
    const matchesTaughtSubject = tutor.subjectsTaught && tutor.subjectsTaught.some((s: string) => isTolerantMatch(term, s));
    if (matchesTaughtSubject) {
      score += 500 * weight;
    }

    // 3. Category match
    const belongsToCategory = tutor.subjectsTaughtIds && tutor.subjectsTaughtIds.some((subId: string) => {
      const subObj = ALL_SUBJECTS.find(s => s.id === subId);
      return subObj && isTolerantMatch(term, subObj.categoryName);
    });
    if (belongsToCategory) {
      score += 300 * weight;
    }

    // 4. Tutor Skills / Expertise list
    const matchingSkillsCount = tutor.expertise ? tutor.expertise.filter((s: string) => isTolerantMatch(term, s)).length : 0;
    score += matchingSkillsCount * 200 * weight;

    // 5. Tags / Class Levels
    const matchesLevel = tutor.classLevels && tutor.classLevels.some((l: string) => isTolerantMatch(term, l));
    if (matchesLevel) {
      score += 100 * weight;
    }

    // 6. Languages
    const matchesLang = tutor.languages && tutor.languages.some((l: string) => isTolerantMatch(term, l));
    if (matchesLang) {
      score += 50 * weight;
    }

    // 7. Description / Bio
    if (tutor.bio && isTolerantMatch(term, tutor.bio)) {
      score += 10 * weight;
    }

    // Direct name match
    if (tutor.fullName && isTolerantMatch(term, tutor.fullName)) {
      score += 400 * weight;
    }
  });

  return score;
}

export function scoreCourse(course: SearchCourse, query: string): number {
  const terms = getSearchTerms(query);
  if (terms.length === 0) return 1; // default score if no search query

  let score = 0;

  terms.forEach((term) => {
    const isQueryTerm = query.toLowerCase().includes(term);
    const weight = isQueryTerm ? 1.5 : 1.0;

    // 1. Primary Skill / Subject Name
    if (course.subjectName && isTolerantMatch(term, course.subjectName)) {
      score += 1000 * weight;
    }
    if (course.subjectId && isTolerantMatch(term, course.subjectId)) {
      score += 1000 * weight;
    }

    // 2. Course Title
    if (course.title && isTolerantMatch(term, course.title)) {
      score += 500 * weight;
    }

    // 3. Category match
    if (course.category && isTolerantMatch(term, course.category)) {
      score += 300 * weight;
    }
    if (course.categoryId && isTolerantMatch(term, course.categoryId)) {
      score += 300 * weight;
    }

    // 4. Tutor Name
    if (course.tutorName && isTolerantMatch(term, course.tutorName)) {
      score += 200 * weight;
    }

    // 5. Language
    if (course.language && isTolerantMatch(term, course.language)) {
      score += 50 * weight;
    }

    // 6. Description
    if (course.description && isTolerantMatch(term, course.description)) {
      score += 10 * weight;
    }
  });

  return score;
}
