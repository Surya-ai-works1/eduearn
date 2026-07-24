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

  async getEvaluation(sessionId: string): Promise<AIInterviewEvaluation> {
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
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: JSON.stringify(payload),
          module: 'tutor-assessment',
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();
      
      // Persist the evaluation results dynamically to localStorage for admin review sync
      if (typeof window !== 'undefined') {
        localStorage.setItem('tutor_application_status', data.decision === 'PASS' ? 'Approved' : 'Rejected');
        localStorage.setItem('tutor_application_details', JSON.stringify(data));
      }

      return {
        score: data.score || data.overall_score || 85,
        strengths: data.strengths || ['Clear communication style'],
        improvements: data.weaknesses || data.learning_plan || ['Incorporate more visual illustrations'],
        transcript: MOCK_QUESTIONS.map(q => ({
          question: q.text,
          answer: onboardingState?.aiInterview?.aiQuizAnswers?.[q.id] || '[No response provided]',
        })),
      };
    } catch (err) {
      console.warn('Real AI evaluation failed, using simulated fallback:', err);
      await new Promise(res => setTimeout(res, 1200));
      return {
        score: 87,
        strengths: [
          'Clear explanations and structured communication style.',
          'Effective use of relatable analogies (e.g. restaurant kitchen for async js).',
          'Strong student empathy and supportive mentoring tone.',
        ],
        improvements: [
          'Could include more concrete examples of actual projects in explainers.',
          'Watch pacing – try to keep basic concept descriptions slightly more concise.',
        ],
        transcript: MOCK_QUESTIONS.map(q => ({
          question: q.text,
          answer: onboardingState?.aiInterview?.aiQuizAnswers?.[q.id] || '[No response provided]',
        })),
      };
    }
  },
};
