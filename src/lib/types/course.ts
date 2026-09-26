export interface Resource {
  id: string;
  title: string;
  type: string; // e.g., 'pdf', 'link', 'image'
  url: string;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: number; // minutes
  order: number;
  type: string; // e.g., 'video', 'article'
  videoUrl: string;
  resources: Resource[];
  isCompleted?: boolean;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  thumbnailUrl: string;
  category: string;
  level: string;
  language: string;
  duration: number; // total minutes
  rating: number;
  totalLessons: number;
  enrolledCount: number;
  lastUpdated: string; // ISO date string
  lessons: Lesson[];
  liveClasses?: any[];
}
