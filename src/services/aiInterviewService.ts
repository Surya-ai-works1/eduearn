export interface InterviewQuestion {
  id: string;
  text: string;
  order: number;
}

export interface InterviewSession {
  id: string;
  currentQuestionIndex: number;
  totalQuestions: number;
}

export interface AIInterviewEvaluation {
  score: number;
  strengths: string[];
  improvements: string[];
  transcript: { question: string; answer: string }[];
}

export interface AIInterviewService {
  startInterview(): Promise<{ session: InterviewSession; firstQuestion: InterviewQuestion }>;
  submitAnswer(
    sessionId: string,
    questionId: string,
    answer: string
  ): Promise<{ nextQuestion: InterviewQuestion | null; isFinished: boolean }>;
  getEvaluation(sessionId: string): Promise<AIInterviewEvaluation>;
}

const MOCK_QUESTIONS: InterviewQuestion[] = [
  { id: 'q1', text: 'Tell me about yourself and your experience in teaching programming concepts.', order: 1 },
  { id: 'q2', text: 'How do you explain the difference between Synchronous and Asynchronous JavaScript to a beginner?', order: 2 },
  { id: 'q3', text: 'Describe a situation where a student was struggling with a concept and how you helped them overcome it.', order: 3 },
];

export const aiInterviewService: AIInterviewService = {
  async startInterview(): Promise<{ session: InterviewSession; firstQuestion: InterviewQuestion }> {
    await new Promise(res => setTimeout(res, 800));
    return {
      session: {
        id: `session_${Date.now()}`,
        currentQuestionIndex: 0,
        totalQuestions: MOCK_QUESTIONS.length,
      },
      firstQuestion: MOCK_QUESTIONS[0],
    };
  },

  async submitAnswer(
    sessionId: string,
    questionId: string,
    answer: string
  ): Promise<{ nextQuestion: InterviewQuestion | null; isFinished: boolean }> {
    await new Promise(res => setTimeout(res, 800));
    const currentIndex = MOCK_QUESTIONS.findIndex(q => q.id === questionId);
    const nextIndex = currentIndex + 1;

    if (nextIndex < MOCK_QUESTIONS.length) {
      return {
        nextQuestion: MOCK_QUESTIONS[nextIndex],
        isFinished: false,
      };
    }

    return {
      nextQuestion: null,
      isFinished: true,
    };
  },

  async getEvaluation(sessionId: string): Promise<any> {
    let onboardingState: any = null;
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('tutor_onboarding_state');
      if (saved) {
        try {
          onboardingState = JSON.parse(saved);
        } catch (e) {
          console.error('Failed to read onboarding state from localStorage:', e);
        }
      }
    }

    const payload = {
      education: onboardingState?.professionalDetails?.educationList || [],
      certificates: onboardingState?.professionalDetails?.achievements || '',
      portfolio: onboardingState?.teachingSetup?.profilePhilosophy || {},
      quizAnswers: onboardingState?.aiInterview?.aiQuizAnswers || {},
      experience: onboardingState?.professionalDetails?.teachingExpYears || 'Not provided',
      teachingDemoText: onboardingState?.aiInterview?.teachingDemoText || 'Not provided',
      bio: onboardingState?.personalInfo?.bio || 'Not provided',
      studentDoubtText: onboardingState?.aiInterview?.studentDoubtText || 'Not provided',
      codingChallenge: onboardingState?.aiInterview?.aiCodingCode || 'Not provided',
      category: onboardingState?.professionalDetails?.selectedCategories?.join(', ') || 'General',
    };

    try {
      const response = await fetch('/api/tutor/evaluate-assessment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();
      return data.evaluation;
    } catch (err: any) {
      console.warn('Real AI evaluation failed:', err);
      // Throw actual backend error instead of falling back silently to fake data
      throw new Error(err.message || 'Failed to fetch AI Evaluation from Gemini');
    }
  },
};
