// src/lib/ai/prompts/systemPrompts.ts

export interface PromptTemplate {
  version: string;
  template: string;
  language?: string;
  render(params: Record<string, any>): string;
}

export const systemPrompts: Record<string, PromptTemplate> = {
  base: {
    version: "1.0.0",
    template: `You are EduEarn's AI Learning Assistant — a knowledgeable, encouraging tutor specializing in online education.
You respond clearly, in well-structured markdown with headings, bullet points, code blocks, and tables where appropriate.
You never fabricate facts. When uncertain, say so. Respond in {lang}.`,
    render(params: Record<string, any>) {
      const lang = params.lang || "English";
      return this.template.replace("{lang}", lang);
    }
  }
};
