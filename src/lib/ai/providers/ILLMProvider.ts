// src/lib/ai/providers/ILLMProvider.ts

export interface ILLMProvider {
  generateText(prompt: string, systemPrompt?: string): Promise<string>;
  generateStructuredOutput<T>(prompt: string, schema: any, systemPrompt?: string): Promise<T>;
  stream(prompt: string, onChunk: (text: string) => void, systemPrompt?: string): Promise<void>;
  generateEmbeddings(text: string): Promise<number[]>;
  moderate(text: string): Promise<{ safe: boolean; reason?: string }>;
  countTokens(text: string): Promise<number>;
  estimateCost(promptTokens: number, completionTokens: number): number;
}
