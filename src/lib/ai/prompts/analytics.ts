// src/lib/ai/prompts/analytics.ts

import { PromptTemplate } from "./systemPrompts";

export const analyticsPrompts: Record<string, PromptTemplate> = {
  dropoff: {
    version: "1.0.0",
    template: `Evaluate the following course drop-off statistics and student engagement records:
Course title: {courseTitle}
Student cohort details: {stats}

Identify:
- 3 key drop-off reasons
- Actionable steps to improve completion rates`,
    render(params: Record<string, any>) {
      return this.template
        .replace("{courseTitle}", params.courseTitle)
        .replace("{stats}", JSON.stringify(params.stats || {}));
    }
  }
};
