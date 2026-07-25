// src/lib/ai/compatibility/AiCompatibilityLayer.ts

import { AiOrchestrator } from "../orchestrator/AiOrchestrator";

export class AiCompatibilityLayer {
  /**
   * Adapts legacy /api/ai POST requests into Orchestrator requests,
   * preserving full request and response formats.
   */
  static async handleLegacyChat(body: {
    prompt: string;
    module?: string;
    courseContext?: string;
    systemPrompt?: string;
    userId?: string;
  }): Promise<{ text: string; model: string }> {
    const orchestratorReq = {
      userId: body.userId || "anonymous-user",
      prompt: body.prompt,
      module: body.module || "doubt",
      context: {
        courseTitle: body.courseContext || "General studies",
        courseDescription: body.courseContext || "Online learning",
        systemPrompt: body.systemPrompt
      }
    };

    const orchestratorRes = await AiOrchestrator.execute(orchestratorReq);
    return {
      text: orchestratorRes.text,
      model: orchestratorRes.model
    };
  }
}
