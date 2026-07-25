// src/lib/ai/providers/LLMProviderFactory.ts

import { ILLMProvider } from "./ILLMProvider";
import { GeminiProvider } from "./GeminiProvider";
import { OpenAIProvider } from "./OpenAIProvider";

export class LLMProviderFactory {
  private static activeProvider: "gemini" | "openai" = "gemini";
  private static geminiInstance = new GeminiProvider();
  private static openAIInstance = new OpenAIProvider();

  static setProvider(provider: "gemini" | "openai") {
    this.activeProvider = provider;
  }

  static getActiveProviderName(): "gemini" | "openai" {
    // If OpenAI API key is set but no Gemini key, switch default to OpenAI
    if (!process.env.GEMINI_API_KEY && process.env.OPENAI_API_KEY) {
      return "openai";
    }
    return this.activeProvider;
  }

  static getProvider(): ILLMProvider {
    const name = this.getActiveProviderName();
    if (name === "openai") {
      return this.openAIInstance;
    }
    return this.geminiInstance;
  }
}
