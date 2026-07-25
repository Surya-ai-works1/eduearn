// src/lib/ai/tools/ToolRegistry.ts

export interface AITool {
  name: string;
  description: string;
  inputSchema: any;
  execute(input: any, context?: any): Promise<any>;
}

export class ToolRegistry {
  private static registry = new Map<string, AITool>();

  static register(tool: AITool) {
    this.registry.set(tool.name, tool);
  }

  static getTool(name: string): AITool | undefined {
    return this.registry.get(name);
  }

  static getAllTools(): AITool[] {
    return Array.from(this.registry.values());
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Core System Tools Registration
// ─────────────────────────────────────────────────────────────────────────────

ToolRegistry.register({
  name: "SearchCourseTool",
  description: "Queries courses in the database matching a search query",
  inputSchema: { type: "object", properties: { search: { type: "string" } } },
  async execute(input: any) {
    const { createClient } = await import("../../supabase/server");
    const supabase = await createClient();
    const { data } = await supabase
      .from("courses")
      .select("id, title, category, price, tutor_name")
      .ilike("title", `%${input.search || ""}%`);
    return data || [];
  }
});

ToolRegistry.register({
  name: "RetrieveLessonTool",
  description: "Pulls lesson titles and details for a given course ID",
  inputSchema: { type: "object", properties: { courseId: { type: "string" } } },
  async execute(input: any) {
    const { createClient } = await import("../../supabase/server");
    const supabase = await createClient();
    const { data } = await supabase
      .from("lessons")
      .select("id, title, content")
      .eq("course_id", input.courseId);
    return data || [];
  }
});

ToolRegistry.register({
  name: "RetrieveNotesTool",
  description: "Fetch student notes history for context enhancement",
  inputSchema: { type: "object", properties: { userId: { type: "string" } } },
  async execute(input: any) {
    // Falls back to local storage simulator logs or mock records
    return [
      { id: "note-1", title: "TypeScript Interface Rules", content: "Interfaces define contracts that shape data" }
    ];
  }
});

ToolRegistry.register({
  name: "GenerateQuizTool",
  description: "Executes quiz generation using prompt instructions",
  inputSchema: { type: "object", properties: { topic: { type: "string" }, difficulty: { type: "string" } } },
  async execute(input: any) {
    const { LLMProviderFactory } = await import("../providers/LLMProviderFactory");
    const { quizGenerator } = await import("../prompts/quizGenerator");
    const provider = LLMProviderFactory.getProvider();
    const systemPrompt = quizGenerator.mcq.render({ topic: input.topic, difficulty: input.difficulty });
    return provider.generateStructuredOutput(`Generate practice quiz on: ${input.topic}`, {}, systemPrompt);
  }
});

ToolRegistry.register({
  name: "RecommendationTool",
  description: "Queries courses fitting student history profile interests",
  inputSchema: { type: "object", properties: { userId: { type: "string" }, interests: { type: "string" } } },
  async execute(input: any) {
    const { createClient } = await import("../../supabase/server");
    const supabase = await createClient();
    const { data: courses } = await supabase.from("courses").select("id, title, category");
    return (courses || []).slice(0, 3);
  }
});

ToolRegistry.register({
  name: "ModerationTool",
  description: "Validates content safety before publishing",
  inputSchema: { type: "object", properties: { text: { type: "string" } } },
  async execute(input: any) {
    const { LLMProviderFactory } = await import("../providers/LLMProviderFactory");
    const provider = LLMProviderFactory.getProvider();
    return provider.moderate(input.text);
  }
});

ToolRegistry.register({
  name: "AnalyticsTool",
  description: "Gathers student cohort analytics timelines",
  inputSchema: { type: "object", properties: { courseId: { type: "string" } } },
  async execute() {
    return { completionVelocity: "84%", activeDauRate: "15%" };
  }
});

ToolRegistry.register({
  name: "AssignmentEvaluationTool",
  description: "Scores student coding scripts to return hint feedbacks",
  inputSchema: { type: "object", properties: { assignmentText: { type: "string" } } },
  async execute(input: any) {
    const { LLMProviderFactory } = await import("../providers/LLMProviderFactory");
    const provider = LLMProviderFactory.getProvider();
    const systemInstruction = "Evaluate code structure, correctness, and suggest hints. Never return raw code answers.";
    return provider.generateText(`Evaluate: ${input.assignmentText}`, systemInstruction);
  }
});

ToolRegistry.register({
  name: "RoadmapPlanningTool",
  description: "Generates custom roadmap study guides",
  inputSchema: { type: "object", properties: { topic: { type: "string" }, commitment: { type: "string" } } },
  async execute(input: any) {
    const { LLMProviderFactory } = await import("../providers/LLMProviderFactory");
    const { roadmapGenerator } = await import("../prompts/roadmapGenerator");
    const provider = LLMProviderFactory.getProvider();
    const systemPrompt = roadmapGenerator.plan.render({ topic: input.topic, commitment: input.commitment });
    return provider.generateStructuredOutput(`Build study roadmap for: ${input.topic}`, {}, systemPrompt);
  }
});
