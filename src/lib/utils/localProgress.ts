/**
 * Utility for persisting lesson completion progress in Mock Mode.
 * Stores an array of completed lesson IDs in localStorage under the key:
 *   `eduearn_progress_{courseId}`
 */
export function getCompletedLessonIds(courseId: string): string[] {
  if (typeof window === 'undefined') return [];
  const key = `eduearn_progress_${courseId}`;
  const raw = localStorage.getItem(key);
  try {
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addCompletedLessonId(courseId: string, lessonId: string): void {
  if (typeof window === 'undefined') return;
  const completed = getCompletedLessonIds(courseId);
  if (!completed.includes(lessonId)) {
    completed.push(lessonId);
    const key = `eduearn_progress_${courseId}`;
    localStorage.setItem(key, JSON.stringify(completed));
  }
}
