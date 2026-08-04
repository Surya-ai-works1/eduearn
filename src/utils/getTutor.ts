import { MOCK_TUTORS } from '@/constants/mockData';

export interface Tutor {
  id: string;
  fullName: string;
  avatar?: string;
}

/**
 * Returns a tutor object by id from MOCK_TUTORS.
 * If no id is provided or the tutor is not found, returns a placeholder
 * indicating that a professional tutor will be assigned after enrollment.
 */
export function getTutorById(tutorId?: string): Tutor {
  if (tutorId) {
    const found = MOCK_TUTORS.find((t) => t.id === tutorId);
    if (found) {
      return { id: found.id, fullName: found.fullName, avatar: found.avatar };
    }
  }
  // Placeholder future‑ready tutor
  return {
    id: 'placeholder',
    fullName: 'Professional Tutor will be assigned after enrollment.',
    avatar: '/images/tutors/default.jpg',
  };
}
