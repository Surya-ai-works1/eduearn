import { scoreTutor, scoreCourse, SearchTutor, SearchCourse } from '../utils/search';

export interface AISearchService {
  searchTutors(query: string, tutors: SearchTutor[]): Promise<SearchTutor[]>;
  searchCourses(query: string, courses: SearchCourse[]): Promise<SearchCourse[]>;
}

export const aiSearchService: AISearchService = {
  async searchTutors(query: string, tutors: SearchTutor[]): Promise<SearchTutor[]> {
    if (!query.trim()) return tutors;

    try {
      // Call backend semantic search endpoint (real adapter)
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, type: 'tutor', items: tutors }),
      });

      if (!response.ok) throw new Error('Semantic search failed');
      const data = await response.json();
      return data.results as SearchTutor[];
    } catch (err) {
      console.warn('Semantic search fallback to Levenshtein:', err);
      // Fallback adapter: Levenshtein distance
      return [...tutors]
        .map(tutor => ({ tutor, score: scoreTutor(tutor, query) }))
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .map(item => item.tutor);
    }
  },

  async searchCourses(query: string, courses: SearchCourse[]): Promise<SearchCourse[]> {
    if (!query.trim()) return courses;

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, type: 'course', items: courses }),
      });

      if (!response.ok) throw new Error('Semantic search failed');
      const data = await response.json();
      return data.results as SearchCourse[];
    } catch (err) {
      console.warn('Semantic search course fallback to Levenshtein:', err);
      return [...courses]
        .map(course => ({ course, score: scoreCourse(course, query) }))
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .map(item => item.course);
    }
  },
};
