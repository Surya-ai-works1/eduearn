const aiToolRegistry = {
  "ai-tutor": {
    id: "ai-tutor",
    name: "AI Tutor Study Buddy",
    description: "Dialogue conversational study partner",
    provider: "gemini",
    model: "gemini-1.5-flash",
    temperature: 0.7,
    maxTokens: 1000,
    category: "learning",
    enabled: true
  },
  "ai-notes": {
    id: "ai-notes",
    name: "AI Notes Generator",
    description: "Build revision study guides",
    provider: "gemini",
    model: "gemini-1.5-flash",
    temperature: 0.5,
    maxTokens: 2000,
    category: "learning",
    enabled: true
  },
  "ai-quiz": {
    id: "ai-quiz",
    name: "AI Quiz Builder",
    description: "Build MCQ assessments",
    provider: "gemini",
    model: "gemini-1.5-flash",
    temperature: 0.4,
    maxTokens: 1500,
    category: "learning",
    enabled: true
  },
  "ai-flashcards": {
    id: "ai-flashcards",
    name: "AI Flashcards Generator",
    description: "Generate front and back flashcards review",
    provider: "gemini",
    model: "gemini-1.5-flash",
    temperature: 0.6,
    maxTokens: 1200,
    category: "learning",
    enabled: true
  },
  "ai-planner": {
    id: "ai-planner",
    name: "AI Study Planner",
    description: "Build day-by-day lesson trackers",
    provider: "gemini",
    model: "gemini-1.5-flash",
    temperature: 0.5,
    maxTokens: 1500,
    category: "learning",
    enabled: true
  },
  "ai-doubt": {
    id: "ai-doubt",
    name: "AI Doubt Resolver",
    description: "Explain codes and questions step-by-step",
    provider: "gemini",
    model: "gemini-1.5-flash",
    temperature: 0.4,
    maxTokens: 1200,
    category: "doubt",
    enabled: true
  },
  "ai-translation": {
    id: "ai-translation",
    name: "AI Translation Agent",
    description: "Contextual translations",
    provider: "gemini",
    model: "gemini-1.5-flash",
    temperature: 0.3,
    maxTokens: 1000,
    category: "language",
    enabled: true
  },
  "ai-summary": {
    id: "ai-summary",
    name: "AI Text Summarizer",
    description: "Condense long articles and text scripts",
    provider: "gemini",
    model: "gemini-1.5-flash",
    temperature: 0.3,
    maxTokens: 1000,
    category: "language",
    enabled: true
  },
  "course-description": {
    id: "course-description",
    name: "AI Course landing copywriter",
    description: "Write high converting sales copies for courses",
    provider: "gemini",
    model: "gemini-1.5-flash",
    temperature: 0.8,
    maxTokens: 1500,
    category: "creator",
    enabled: true
  },
  "thumbnail-prompt": {
    id: "thumbnail-prompt",
    name: "AI Cover image prompt engineer",
    description: "Generate cover vector prompt templates",
    provider: "gemini",
    model: "gemini-1.5-flash",
    temperature: 0.7,
    maxTokens: 500,
    category: "creator",
    enabled: true
  },
  "lesson-plan": {
    id: "lesson-plan",
    name: "AI Course Lesson Planner",
    description: "Build lecture syllabus time frames",
    provider: "gemini",
    model: "gemini-1.5-flash",
    temperature: 0.5,
    maxTokens: 1500,
    category: "creator",
    enabled: true
  }
};

export default aiToolRegistry;
