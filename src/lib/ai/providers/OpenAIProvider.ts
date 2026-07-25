// src/lib/ai/providers/OpenAIProvider.ts

import { ILLMProvider } from "./ILLMProvider";

export class OpenAIProvider implements ILLMProvider {
  private apiKey: string;
  private defaultModel = "gpt-4o-mini";

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || "";
  }

  private getHeaders() {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.apiKey}`,
    };
  }

  async generateText(prompt: string, systemPrompt?: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error("OPENAI_API_KEY environment variable is not configured.");
    }

    try {
      const messages = [];
      if (systemPrompt) {
        messages.push({ role: "system", content: systemPrompt });
      }
      messages.push({ role: "user", content: prompt });

      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({
          model: this.defaultModel,
          messages,
          temperature: 0.7,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error?.message || `API error status: ${res.status}`);
      }

      const data = await res.json();
      return data.choices[0]?.message?.content || "";
    } catch (err: any) {
      console.error("OpenAI generateText error:", err);
      throw new Error(`OpenAI generateText failed: ${err.message}`);
    }
  }

  async generateStructuredOutput<T>(prompt: string, schema: any, systemPrompt?: string): Promise<T> {
    if (!this.apiKey) {
      throw new Error("OPENAI_API_KEY environment variable is not configured.");
    }

    try {
      const messages = [];
      if (systemPrompt) {
        messages.push({ role: "system", content: systemPrompt });
      }
      messages.push({ role: "user", content: prompt });

      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({
          model: this.defaultModel,
          messages,
          response_format: { type: "json_object" },
          temperature: 0.2,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error?.message || `API error status: ${res.status}`);
      }

      const data = await res.json();
      const content = data.choices[0]?.message?.content || "{}";
      return JSON.parse(content) as T;
    } catch (err: any) {
      console.error("OpenAI generateStructuredOutput error:", err);
      throw new Error(`OpenAI generateStructuredOutput failed: ${err.message}`);
    }
  }

  async stream(prompt: string, onChunk: (text: string) => void, systemPrompt?: string): Promise<void> {
    if (!this.apiKey) {
      throw new Error("OPENAI_API_KEY environment variable is not configured.");
    }

    try {
      const messages = [];
      if (systemPrompt) {
        messages.push({ role: "system", content: systemPrompt });
      }
      messages.push({ role: "user", content: prompt });

      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({
          model: this.defaultModel,
          messages,
          stream: true,
          temperature: 0.7,
        }),
      });

      if (!res.ok) {
        throw new Error(`Streaming failed with status: ${res.status}`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No readable stream response from OpenAI");

      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const cleanLine = line.trim();
          if (!cleanLine || cleanLine === "data: [DONE]") continue;

          if (cleanLine.startsWith("data: ")) {
            try {
              const data = JSON.parse(cleanLine.substring(6));
              const text = data.choices[0]?.delta?.content || "";
              if (text) onChunk(text);
            } catch {
              // ignore parse errors on partial chunks
            }
          }
        }
      }
    } catch (err: any) {
      console.error("OpenAI stream error:", err);
      throw new Error(`OpenAI streaming failed: ${err.message}`);
    }
  }

  async generateEmbeddings(text: string): Promise<number[]> {
    if (!this.apiKey) {
      throw new Error("OPENAI_API_KEY environment variable is not configured.");
    }

    try {
      const res = await fetch("https://api.openai.com/v1/embeddings", {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({
          model: "text-embedding-3-small",
          input: text,
        }),
      });

      if (!res.ok) {
        throw new Error(`Embedding API error: ${res.status}`);
      }

      const data = await res.json();
      return data.data[0]?.embedding || [];
    } catch (err: any) {
      console.error("OpenAI generateEmbeddings error:", err);
      throw new Error(`OpenAI embedding failed: ${err.message}`);
    }
  }

  async moderate(text: string): Promise<{ safe: boolean; reason?: string }> {
    if (!this.apiKey) {
      return { safe: true }; // fallback safe
    }

    try {
      const res = await fetch("https://api.openai.com/v1/moderations", {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({ input: text }),
      });

      if (!res.ok) return { safe: true };

      const data = await res.json();
      const flag = data.results[0]?.flagged || false;
      return { safe: !flag, reason: flag ? "Flagged by OpenAI content moderation model" : undefined };
    } catch {
      return { safe: true };
    }
  }

  async countTokens(text: string): Promise<number> {
    return Math.ceil(text.length / 4);
  }

  estimateCost(promptTokens: number, completionTokens: number): number {
    // gpt-4o-mini is $0.150 / 1M input tokens, $0.600 / 1M output tokens
    const inputCost = (promptTokens / 1000000) * 0.15;
    const outputCost = (completionTokens / 1000000) * 0.60;
    return inputCost + outputCost;
  }
}
