// src/lib/ai/prompts/tutorAssistant.ts

import { PromptTemplate } from "./systemPrompts";

export const tutorAssistant: Record<string, PromptTemplate> = {
  outline: {
    version: "1.0.0",
    template: `Generate a comprehensive outline for a new course about: {courseTitle}.
Category: {category}

Include:
- Course Overview
- Target Audience & Prerequisites
- 3 Modules with 2 Lessons each
- Structured descriptions and duration recommendations.`,
    render(params: Record<string, any>) {
      return this.template
        .replace("{courseTitle}", params.courseTitle)
        .replace("{category}", params.category || "General");
    }
  }
};
