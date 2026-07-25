// src/lib/ai/prompts/recommendation.ts

import { PromptTemplate } from "./systemPrompts";

export const recommendationPrompts: Record<string, PromptTemplate> = {
  course: {
    version: "1.0.0",
    template: `Based on the user's completed skills, learning history, and interest areas:
Skills: {skills}
Interests: {interests}

Select the 3 best-fitting courses from the marketplace roster:
{marketplaceRoster}

Respond as a JSON array of objects:
[
  {{
    "courseId": string,
    "reason": string
  }}
]`,
    render(params: Record<string, any>) {
      return this.template
        .replace("{skills}", params.skills || "None")
        .replace("{interests}", params.interests || "General")
        .replace("{marketplaceRoster}", JSON.stringify(params.marketplaceRoster || []));
    }
  }
};
