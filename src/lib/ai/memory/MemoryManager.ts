// src/lib/ai/memory/MemoryManager.ts

import { lmsHubsDb } from "../../lmsHubsDb";

export interface MemoryContext {
  history: { role: "user" | "ai"; content: string }[];
  summary?: string;
  preferences?: Record<string, any>;
  learningProgress?: Record<string, any>;
}

export class MemoryManager {
  private static responseCache = new Map<string, { result: any; expiresAt: number }>();

  // Expiration caching policy
  static getCache(key: string): any | null {
    const cached = this.responseCache.get(key);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.result;
    }
    this.responseCache.delete(key);
    return null;
  }

  static setCache(key: string, value: any, ttlMs = 120000) {
    this.responseCache.set(key, { result: value, expiresAt: Date.now() + ttlMs });
  }

  static async loadContext(userId: string, conversationId: string): Promise<MemoryContext> {
    const context: MemoryContext = { history: [] };

    try {
      if (conversationId && conversationId !== "new") {
        const sessions = await lmsHubsDb.getChatSessions(userId);
        const active = sessions.find((s) => s.id === conversationId);
        if (active && active.messages) {
          context.history = active.messages.map((m: any) => ({
            role: m.role as "user" | "ai",
            content: m.content
          }));
        }
      }
    } catch (err) {
      console.warn("Failed to load memory context from Supabase, using mock memory fallbacks:", err);
    }

    return context;
  }

  static async saveMessage(userId: string, conversationId: string, role: "user" | "ai", content: string): Promise<void> {
    try {
      const sessions = await lmsHubsDb.getChatSessions(userId);
      const active = sessions.find((s) => s.id === conversationId);
      if (active) {
        const updatedMessages = [...(active.messages || []), { role, content, timestamp: new Date().toISOString() }];
        await lmsHubsDb.updateChatSession(conversationId, {
          messages: updatedMessages
        });
      } else {
        await lmsHubsDb.saveChatSession({
          user_id: userId,
          title: "Sparky AI Chat",
          module: "sparky-chat",
          course_id: undefined,
          is_pinned: false,
          messages: [{ role, content, timestamp: new Date().toISOString() }]
        });
      }
    } catch (err) {
      console.warn("MemoryManager failed to save message in database:", err);
    }
  }

  static compressContext(history: { role: "user" | "ai"; content: string }[], maxTokens = 1000): { role: "user" | "ai"; content: string }[] {
    // Basic context compression strategy: retain only recent 8 messages if length overflows threshold
    if (history.length > 8) {
      return history.slice(history.length - 8);
    }
    return history;
  }
}
