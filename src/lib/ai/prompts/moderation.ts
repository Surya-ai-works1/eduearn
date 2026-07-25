// src/lib/ai/prompts/moderation.ts

import { PromptTemplate } from "./systemPrompts";

export const moderationPrompts: Record<string, PromptTemplate> = {
  check: {
    version: "1.0.0",
    template: `Analyze the following content for toxicity, spam, self-harm language, profanity, or inappropriate themes:
Content: "{text}"

Respond ONLY with a valid JSON object:
{{
  "safe": boolean,
  "reason": string | null
}}`,
    render(params: Record<string, any>) {
      return this.template.replace("{text}", params.text);
    }
  }
};
