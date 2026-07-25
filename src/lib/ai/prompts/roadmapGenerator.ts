// src/lib/ai/prompts/roadmapGenerator.ts

import { PromptTemplate } from "./systemPrompts";

export const roadmapGenerator: Record<string, PromptTemplate> = {
  plan: {
    version: "1.0.0",
    template: `Create a custom 3-day learning roadmap planner for: {topic}.
Daily Commitment Time: {commitment}

Rules:
- Respond ONLY with a valid JSON array of objects.
- Do NOT wrap in markdown or add explanations outside the JSON.
Format example:
[
  {{
    "day": "Day 1",
    "objective": "Introduction to the basics",
    "topics": ["Terminologies", "Concepts"],
    "tasks": ["Read manual", "Install software"]
  }}
]`,
    render(params: Record<string, any>) {
      return this.template
        .replace("{topic}", params.topic)
        .replace("{commitment}", params.commitment || "45 minutes");
    }
  }
};
