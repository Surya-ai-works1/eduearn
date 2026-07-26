// src/lib/ai/orchestrator/AiOrchestrator.ts

import { LLMProviderFactory } from "../providers/LLMProviderFactory";
import { ToolRegistry } from "../tools/ToolRegistry";
import { MemoryManager } from "../memory/MemoryManager";
import { SafetyLayer } from "../safety/SafetyLayer";
import { systemPrompts } from "../prompts/systemPrompts";
import { studyAssistant } from "../prompts/studyAssistant";
import { quizGenerator } from "../prompts/quizGenerator";
import { roadmapGenerator } from "../prompts/roadmapGenerator";
import { tutorAssistant } from "../prompts/tutorAssistant";
import { moderationPrompts } from "../prompts/moderation";
import { analyticsPrompts } from "../prompts/analytics";
import { recommendationPrompts } from "../prompts/recommendation";

export interface OrchestratorRequest {
  userId: string;
  conversationId?: string;
  prompt: string;
  module?: string;
  context?: Record<string, any>;
  lang?: string;
}

export interface OrchestratorResponse {
  text: string;
  model: string;
  costEstimate: number;
  latencyMs: number;
  tokensCount: number;
  safetyScore?: string;
}

export class AiOrchestrator {
  static async execute(req: OrchestratorRequest): Promise<OrchestratorResponse> {
    const startTime = Date.now();

    // 1. Safety Check
    const safetyCheck = SafetyLayer.validatePrompt(req.prompt);
    if (!safetyCheck.clean) {
      return {
        text: `Access Denied: ${safetyCheck.reason || "Safety policy violation."}`,
        model: "safety-guard",
        costEstimate: 0,
        latencyMs: Date.now() - startTime,
        tokensCount: 0
      };
    }

    // 2. Intent Classification / Prompt Resolution
    const lang = req.lang || "English";
    let systemPrompt = systemPrompts.base.render({ lang });
    let resolvedPrompt = req.prompt;
    const moduleName = req.module || "doubt";

    // If it's a tutor-assessment, run the TutorAssessmentTool immediately
    if (moduleName === "tutor-assessment") {
      try {
        const tool = ToolRegistry.getTool("TutorAssessmentTool");
        if (tool) {
          const result = await tool.execute({ prompt: req.prompt });
          const latencyMs = Date.now() - startTime;
          return {
            text: JSON.stringify(result),
            model: "multi-agent-tutor-assessment",
            costEstimate: 0.002,
            latencyMs,
            tokensCount: 1500
          };
        }
      } catch (err: any) {
        console.error("Tutor assessment tool run failed:", err);
      }
    }

    // Dynamic prompt mapping from strongly-typed Prompt Library
    if (moduleName === "study" || moduleName === "sparky-chat") {
      systemPrompt += "\n" + studyAssistant.chat.render(req.context || {});
    } else if (moduleName === "quiz") {
      resolvedPrompt = quizGenerator.mcq.render({
        topic: req.prompt,
        difficulty: req.context?.difficulty || "Medium"
      });
    } else if (moduleName === "roadmap") {
      resolvedPrompt = roadmapGenerator.plan.render({
        topic: req.prompt,
        commitment: req.context?.commitment || "45 minutes"
      });
    } else if (moduleName === "outline") {
      resolvedPrompt = tutorAssistant.outline.render({
        courseTitle: req.prompt,
        category: req.context?.category || "General"
      });
    } else if (moduleName === "moderation") {
      resolvedPrompt = moderationPrompts.check.render({ text: req.prompt });
    } else if (moduleName === "analytics") {
      resolvedPrompt = analyticsPrompts.dropoff.render({
        courseTitle: req.prompt,
        stats: req.context?.stats || {}
      });
    } else if (moduleName === "recommendation") {
      resolvedPrompt = recommendationPrompts.course.render({
        skills: req.context?.skills,
        interests: req.context?.interests,
        marketplaceRoster: req.context?.marketplaceRoster || []
      });
    }

    // 3. Load Memory Manager Context
    const userId = req.userId || "anonymous-user";
    const conversationId = req.conversationId || "new";
    const memory = await MemoryManager.loadContext(userId, conversationId);
    
    // Concat recent memory for conversational awareness
    let fullPrompt = resolvedPrompt;
    if (memory.history && memory.history.length > 0) {
      const historyStr = MemoryManager.compressContext(memory.history)
        .map((m) => `${m.role === "user" ? "Student" : "Assistant"}: ${m.content}`)
        .join("\n");
      fullPrompt = `Conversation History:\n${historyStr}\n\nStudent: ${resolvedPrompt}`;
    }

    // 4. Provider Dispatch via Factory
    const provider = LLMProviderFactory.getProvider();
    const modelName = LLMProviderFactory.getActiveProviderName() === "openai" ? "gpt-4o-mini" : "gemini-1.5-flash";

    // 5. Response Caching check
    const cacheKey = `${userId}:${moduleName}:${resolvedPrompt}`;
    const cachedResponse = MemoryManager.getCache(cacheKey);
    if (cachedResponse) {
      return {
        text: cachedResponse,
        model: `${modelName}-cached`,
        costEstimate: 0,
        latencyMs: Date.now() - startTime,
        tokensCount: 0
      };
    }

    // 6. Execute Provider Completing
    try {
      const responseText = await provider.generateText(fullPrompt, systemPrompt);

      // Validate Output Safety
      const outputSafety = SafetyLayer.validateResponse(responseText);
      const finalText = outputSafety.clean ? responseText : `Filter Triggered: ${outputSafety.reason}`;

      // Save Message to Memory Manager
      if (req.conversationId) {
        await MemoryManager.saveMessage(userId, req.conversationId, "user", req.prompt);
        await MemoryManager.saveMessage(userId, req.conversationId, "ai", finalText);
      }

      // Write to Cache
      MemoryManager.setCache(cacheKey, finalText);

      // Observability Metrics
      const promptTokens = await provider.countTokens(fullPrompt + systemPrompt);
      const completionTokens = await provider.countTokens(finalText);
      const cost = provider.estimateCost(promptTokens, completionTokens);
      const latencyMs = Date.now() - startTime;

      return {
        text: finalText,
        model: modelName,
        costEstimate: cost,
        latencyMs,
        tokensCount: promptTokens + completionTokens
      };
    } catch (err: any) {
      console.error("Orchestrator completion error:", err);
      // Failover recovery: attempt default backup mock response if provider raises api keys exception
      return {
        text: `EduEarn AI: The service is temporarily overloaded. Please try again in a few moments. (Details: ${err.message || "Endpoint error"})`,
        model: "failover-recovery",
        costEstimate: 0,
        latencyMs: Date.now() - startTime,
        tokensCount: 0
      };
    }
  }
}
