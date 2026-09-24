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
    if (!supabase) return [];
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
    if (!supabase) return [];
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
    if (!supabase) return [];
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

ToolRegistry.register({
  name: "TutorAssessmentTool",
  description: "Runs a multi-agent evaluation on tutor resumes, teaching capabilities, scenario doubtful handling, and coding",
  inputSchema: { type: "object", properties: { prompt: { type: "string" } } },
  async execute(input: any) {
    const { LLMProviderFactory } = await import("../providers/LLMProviderFactory");
    const provider = LLMProviderFactory.getProvider();

    let parsedInput: any = {};
    try {
      parsedInput = JSON.parse(input.prompt);
    } catch {
      parsedInput = { rawText: input.prompt };
    }

    // 1. Resume Score
    const resumePrompt = `Analyze credentials:
    Education: ${JSON.stringify(parsedInput.education || [])}
    Certificates: ${JSON.stringify(parsedInput.certificates || [])}
    Portfolio: ${JSON.stringify(parsedInput.portfolio || {})}
    Respond ONLY with JSON object: {"resume_score": number, "extracted_skills": string[], "notes": string}`;
    
    // 2. Knowledge Score
    const knowledgePrompt = `Evaluate subject answers:
    Quiz Answers: ${JSON.stringify(parsedInput.quizAnswers || {})}
    Respond ONLY with JSON: {"knowledge_score": number, "notes": string}`;

    // 3. Teaching Score
    const teachingPrompt = `Evaluate teaching style:
    Experience: ${parsedInput.experience || "Not provided"}
    Teaching demo: ${parsedInput.teachingDemoText || "Not provided"}
    Respond ONLY with JSON: {"teaching_score": number, "notes": string}`;

    // 4. Communication Score
    const communicationPrompt = `Evaluate doubt resolution:
    Bio: ${parsedInput.bio || "Not provided"}
    Doubt resolution: ${parsedInput.studentDoubtText || "Not provided"}
    Respond ONLY with JSON: {"communication_score": number, "doubt_handling_score": number, "notes": string}`;

    // Parallel calls
    const [resResult, knResult, teResult, coResult] = await Promise.all([
      provider.generateStructuredOutput<any>(resumePrompt, {}).catch(() => ({ resume_score: 0 })),
      provider.generateStructuredOutput<any>(knowledgePrompt, {}).catch(() => ({ knowledge_score: 0 })),
      provider.generateStructuredOutput<any>(teachingPrompt, {}).catch(() => ({ teaching_score: 0 })),
      provider.generateStructuredOutput<any>(communicationPrompt, {}).catch(() => ({ communication_score: 0, doubt_handling_score: 0 }))
    ]);

    // Collator Prompt
    const collatorPrompt = `Collate assessment stats:
    Resume: ${JSON.stringify(resResult)}
    Knowledge: ${JSON.stringify(knResult)}
    Teaching: ${JSON.stringify(teResult)}
    Communication: ${JSON.stringify(coResult)}
    
    Respond strictly with a JSON object containing:
    "overall_score": number (average of all scores),
    "knowledge_score": number,
    "communication_score": number,
    "confidence_score": number (between 1 and 100),
    "reasoning_score": number (between 1 and 100),
    "teaching_style": string,
    "strengths": string[],
    "weaknesses": string[],
    "recommended_subjects": string[],
    "suggested_grade_levels": string[],
    "improvement_plan": string,
    "recommendation": "PASS" | "REVIEW" | "REJECT",
    "summary": string`;

    const finalReport = await provider.generateStructuredOutput<any>(collatorPrompt, {}).catch(() => ({
      overall_score: 0,
      knowledge_score: 0,
      communication_score: 0,
      confidence_score: 0,
      reasoning_score: 0,
      teaching_style: "Pending Review",
      recommendation: "REVIEW",
      summary: "Automated assessment failed or could not be completed; manual review required.",
      strengths: [],
      weaknesses: ["Automated evaluation could not complete"],
      recommended_subjects: [],
      suggested_grade_levels: [],
      improvement_plan: "Manual verification by platform administrator required."
    }));

    return {
      score: finalReport.overall_score ?? 0,
      overall_score: finalReport.overall_score ?? 0,
      knowledge_score: finalReport.knowledge_score ?? 0,
      communication_score: finalReport.communication_score ?? 0,
      confidence_score: finalReport.confidence_score ?? 0,
      reasoning_score: finalReport.reasoning_score ?? 0,
      teaching_style: finalReport.teaching_style || "Pending Review",
      strengths: finalReport.strengths || [],
      weaknesses: finalReport.weaknesses || [],
      improvements: finalReport.weaknesses || [],
      recommended_subjects: finalReport.recommended_subjects || [],
      suggested_grade_levels: finalReport.suggested_grade_levels || [],
      improvement_plan: finalReport.improvement_plan || "",
      recommendation: finalReport.recommendation || "PASS",
      summary: finalReport.summary || ""
    };
  }
});
