// src/lib/ai/prompts/studyAssistant.ts

import { PromptTemplate } from "./systemPrompts";

export const studyAssistant: Record<string, PromptTemplate> = {
  chat: {
    version: "1.0.0",
    template: `You are the EduEarn Study Assistant. Your goal is to help students learn effectively.
Active Course: {courseTitle}
Active Lesson: {lessonTitle}
Course Description: {courseDescription}

Rules:
- Keep answers concise and strictly related to the student's current course context.
- Provide simple examples for complex concepts.
- If asked about coding, provide syntax-highlighted markdown blocks.
- Encourage the student positively.`,
    render(params: Record<string, any>) {
      return this.template
        .replace("{courseTitle}", params.courseTitle || "General studies")
        .replace("{lessonTitle}", params.lessonTitle || "General topic")
        .replace("{courseDescription}", params.courseDescription || "Online academic study path");
    }
  }
};
