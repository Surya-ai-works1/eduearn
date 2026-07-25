// src/lib/ai/providers/GeminiProvider.ts

import { ILLMProvider } from "./ILLMProvider";

export class GeminiProvider implements ILLMProvider {
  private apiKey: string;
  private defaultModel = "gemini-1.5-flash";

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || "";
  }

  private async getGenAI() {
    if (!this.apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not configured.");
    }
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    return new GoogleGenerativeAI(this.apiKey);
  }

  async generateText(prompt: string, systemPrompt?: string): Promise<string> {
    try {
      const genAI = await this.getGenAI();
      const model = genAI.getGenerativeModel({
        model: this.defaultModel,
        systemInstruction: systemPrompt,
      });

      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (err: any) {
      console.error("Gemini generateText error:", err);
      throw new Error(`Gemini generateText failed: ${err.message}`);
    }
  }

  async generateStructuredOutput<T>(prompt: string, schema: any, systemPrompt?: string): Promise<T> {
    try {
      const genAI = await this.getGenAI();
      const model = genAI.getGenerativeModel({
        model: this.defaultModel,
        systemInstruction: systemPrompt,
      });

      const result = await model.generateContent(prompt);
      const text = result.response.text();

      // Simple clean helper for JSON markdown block wrapper
      const match = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/```\s*([\s\S]*?)\s*```/);
      const cleanText = match ? match[1].trim() : text.trim();
      return JSON.parse(cleanText) as T;
    } catch (err: any) {
      console.error("Gemini generateStructuredOutput error:", err);
      throw new Error(`Gemini generateStructuredOutput failed: ${err.message}`);
    }
  }

  async stream(prompt: string, onChunk: (text: string) => void, systemPrompt?: string): Promise<void> {
    try {
      const genAI = await this.getGenAI();
      const model = genAI.getGenerativeModel({
        model: this.defaultModel,
        systemInstruction: systemPrompt,
      });

      const result = await model.generateContentStream(prompt);
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        onChunk(chunkText);
      }
    } catch (err: any) {
      console.error("Gemini stream error:", err);
      throw new Error(`Gemini streaming failed: ${err.message}`);
    }
  }

  async generateEmbeddings(text: string): Promise<number[]> {
    try {
      const genAI = await this.getGenAI();
      const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
      const result = await model.embedContent(text);
      return result.embedding.values;
    } catch (err: any) {
      console.error("Gemini generateEmbeddings error:", err);
      throw new Error(`Gemini embedding failed: ${err.message}`);
    }
  }

  async moderate(text: string): Promise<{ safe: boolean; reason?: string }> {
    // Simple rule-based/regex filter for basic moderation safety
    const lower = text.toLowerCase();
    const unsafeWords = ["abuse", "scam", "hack", "bypass", "exploit", "spam", "offensive"];
    const found = unsafeWords.filter(word => lower.includes(word));
    if (found.length > 0) {
      return { safe: false, reason: `Unsafe words detected: ${found.join(", ")}` };
    }
    return { safe: true };
  }

  async countTokens(text: string): Promise<number> {
    // Basic approximate count: 1 token = ~4 characters
    return Math.ceil(text.length / 4);
  }

  estimateCost(promptTokens: number, completionTokens: number): number {
    // Approximate cost: gemini-1.5-flash is $0.075 / 1M input tokens, $0.30 / 1M output tokens
    const inputCost = (promptTokens / 1000000) * 0.075;
    const outputCost = (completionTokens / 1000000) * 0.30;
    return inputCost + outputCost;
  }
}
