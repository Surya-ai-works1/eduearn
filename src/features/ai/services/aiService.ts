// ─── Unified AI Service ────────────────────────────────────────────────────────
// All AI calls in EduEarn go through this service.
// Uses the /api/ai server route which in turn calls Gemini 1.5 Flash.
// No more mock engine — real responses with structured fallback.

export interface AiCallOptions {
  module?: string;
  courseContext?: string;
  systemPrompt?: string;
}

export const AiService = {
  /**
   * Send a prompt to the AI engine and receive the full response text.
   */
  async chat(userPrompt: string, options: AiCallOptions = {}): Promise<string> {
    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: userPrompt,
        module: options.module,
        courseContext: options.courseContext,
        systemPrompt: options.systemPrompt,
      }),
    });

    if (!res.ok) {
      throw new Error(`AI service returned ${res.status}`);
    }

    const data = await res.json();
    return data.text as string;
  },

  /**
   * Stream a chat response word-by-word via a callback.
   * Uses the /api/ai endpoint and simulates streaming on the client.
   */
  async streamChatCompletion(
    _systemPrompt: string,
    userPrompt: string,
    onChunk: (text: string) => void,
    onComplete: () => void,
    options: AiCallOptions = {}
  ) {
    try {
      const fullText = await this.chat(userPrompt, {
        ...options,
        systemPrompt: _systemPrompt || undefined,
      });

      // Stream the response word-by-word for natural feel
      const words = fullText.split(" ");
      let i = 0;
      const interval = setInterval(() => {
        if (i < words.length) {
          onChunk((i === 0 ? "" : " ") + words[i]);
          i++;
        } else {
          clearInterval(interval);
          onComplete();
        }
      }, 18);
    } catch (err) {
      console.error("AI stream error:", err);
      onChunk("\n\n*AI service temporarily unavailable. Please try again.*");
      onComplete();
    }
  },

  /**
   * Generate structured study notes for a topic.
   */
  async generateNotes(topic: string, courseContext?: string): Promise<string> {
    return this.chat(topic, { module: "notes", courseContext });
  },

  /**
   * Generate a quiz for a topic.
   */
  async generateQuiz(topic: string, courseContext?: string): Promise<string> {
    return this.chat(topic, { module: "quiz", courseContext });
  },

  /**
   * Generate flashcards for a topic.
   */
  async generateFlashcards(topic: string, courseContext?: string): Promise<string> {
    return this.chat(topic, { module: "flashcards", courseContext });
  },

  /**
   * Generate a study roadmap.
   */
  async generateRoadmap(topic: string): Promise<string> {
    return this.chat(topic, { module: "roadmap" });
  },
};

// Prompt library for AiChatWidget
export const PROMPT_LIBRARY = {
  STUDY_ASSISTANT_V1: `You are Sparky, the official intelligent AI learning companion across the EduEarn platform. 
Introduce yourself as Sparky, your EduEarn AI companion.
Never refer to yourself as a generic "AI Assistant", "Virtual Assistant", "Study Buddy", or "Chat Assistant". Always use the name "Sparky" or "Sparky AI".
Answer questions clearly and concisely. Use markdown for formatting. Keep answers focused, encouraging, and educational.`,
};
