export interface RecommendationRequest {
  studentId: string;
  interests: string[];
  completedCourses: string[];
}

export interface AIRecommendationService {
  getRecommendations(req: RecommendationRequest): Promise<{
    recommendedTutors: string[]; // tutor ids or names
    recommendedCourses: string[]; // course ids or names
    skillGapAnalysis: string[];
    learningRoadmap: string; // Markdown formatted custom roadmap
  }>;
}

export const aiRecommendationService: AIRecommendationService = {
  async getRecommendations(req: RecommendationRequest) {
    const systemPrompt = `You are the Lead Student Mentor AI for EduEarn. Analyze the student's learning interests and completed course history.
Identify their skill gaps, suggest matching topics, and generate a customized roadmap.
Respond ONLY with a valid JSON object matching this structure:
{
  "recommendedTutors": ["Tutor Name 1", "Tutor Name 2"],
  "recommendedCourses": ["Course Name 1", "Course Name 2"],
  "skillGapAnalysis": ["Skill gap 1", "Skill gap 2"],
  "learningRoadmap": "Markdown learning plan roadmap here..."
}`;

    const promptText = `
Student Interests: ${req.interests.join(', ')}
Completed Courses: ${req.completedCourses.join(', ')}
`;

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: promptText,
          systemPrompt,
          module: 'quiz-json', // Reuse JSON parser fallback helper
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();
      return {
        recommendedTutors: data.recommendedTutors || [],
        recommendedCourses: data.recommendedCourses || [],
        skillGapAnalysis: data.skillGapAnalysis || [],
        learningRoadmap: data.learningRoadmap || 'No roadmap generated.',
      };
    } catch (err) {
      console.warn('Real AI recommendation failed, using fallback adapter:', err);
      await new Promise(res => setTimeout(res, 800));
      return {
        recommendedTutors: ['Amit Verma', 'Priya Patel'],
        recommendedCourses: ['Mastering React Native Hooks & Layouts', 'Introduction to Machine Learning'],
        skillGapAnalysis: ['Advanced State Management', 'Native Device API integration'],
        learningRoadmap: `
### 🗺️ Your Personalized Learning Roadmap
1. **Week 1: Foundations** - Learn basic hooks and flex layouts.
2. **Week 2: Advanced State** - Dive into Redux Toolkit and Context API.
3. **Week 3: Practical Projects** - Build and compile 2 React applications.
`,
      };
    }
  },
};
