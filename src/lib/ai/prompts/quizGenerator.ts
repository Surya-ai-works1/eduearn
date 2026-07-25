// src/lib/ai/prompts/quizGenerator.ts

import { PromptTemplate } from "./systemPrompts";

export const quizGenerator: Record<string, PromptTemplate> = {
  mcq: {
    version: "1.0.0",
    template: `Generate a practice multiple choice quiz on the topic: {topic}.
Difficulty Level: {difficulty}

Rules:
- Generate exactly 3 questions.
- Format strictly as a valid JSON array of objects.
- Do NOT wrap in markdown markdown blocks or add extra explanations outside the JSON.
Format example:
[
  {{
    "question": "What is 2+2?",
    "options": ["3", "4", "5", "6"],
    "correctIndex": 1,
    "explanation": "Because 2 plus 2 equals 4."
  }}
]`,
    render(params: Record<string, any>) {
      return this.template
        .replace("{topic}", params.topic)
        .replace("{difficulty}", params.difficulty || "Medium");
    }
  }
};
