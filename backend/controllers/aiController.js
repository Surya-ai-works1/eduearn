import Course from "../models/courseModel.js";
import AiLog from "../models/aiLogModel.js";
import AiService from "../ai/services/aiService.js";
import { SYSTEM_PROMPTS, TEMPLATE_BUILDERS } from "../ai/prompts/templates.js";
import aiToolRegistry from "../ai/config/registry.js";

// Helper to log dynamic AI usage in DB
const logAiUsageObj = async (userId, tool, prompt, response = "", executionTime = 0) => {
  try {
    if (userId) {
      await AiLog.create({
        user: userId,
        feature: tool.id,
        prompt: prompt ? prompt.substring(0, 800) : "",
        response: response ? response.substring(0, 1500) : "",
        provider: tool.provider || "gemini",
        model: tool.model || "gemini-1.5-flash",
        tokensUsed: tool.maxTokens || 1000,
        executionTime
      });
    }
  } catch (error) {
    console.error("AI usage log failed:", error);
  }
};

// In-memory cache to prevent duplicate LLM calls for identical prompts
const aiResponseCache = new Map();

// Central helper to call AI using the Tool Registry configs
const callRegistryAi = async (toolId, prompt, systemPrompt, isJson = false, history = null) => {
  const cacheKey = `${toolId}:${prompt}:${isJson}`;
  if (!history && aiResponseCache.has(cacheKey)) {
    console.log(`[AI CACHE HIT] toolId: ${toolId}`);
    return aiResponseCache.get(cacheKey);
  }

  const tool = aiToolRegistry[toolId] || {
    id: toolId,
    provider: "gemini",
    model: "gemini-1.5-flash",
    temperature: 0.7,
    maxTokens: 1000
  };
  
  let result = null;
  if (history) {
    const text = await AiService.generateChat(history, prompt, systemPrompt, tool.provider, tool);
    result = { response: text, tool };
  } else if (isJson) {
    const json = await AiService.generateJson(prompt, systemPrompt, tool.provider, tool);
    result = { response: json, tool };
  } else {
    const text = await AiService.generateText(prompt, systemPrompt, tool.provider, tool);
    result = { response: text, tool };
  }

  // Cache insertion with eviction policy (max 200 items)
  if (!history && result) {
    if (aiResponseCache.size > 200) {
      const firstKey = aiResponseCache.keys().next().value;
      aiResponseCache.delete(firstKey);
    }
    aiResponseCache.set(cacheKey, result);
  }

  return result;
};

// 1. Search with AI (Public)
export const searchWithAi = async (req, res) => {
  const startTime = Date.now();
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const courses = await Course.find({ isPublished: true, approvalStatus: "approved" });
    const context = courses.map(c => `ID: ${c._id}, Title: ${c.title}, Category: ${c.category}, Price: ${c.price}`).join("\n");
    const prompt = TEMPLATE_BUILDERS.SEARCH(query, context);

    const { response, tool } = await callRegistryAi("ai-tutor", prompt, SYSTEM_PROMPTS.AI_SEARCH_AGENT, true);
    const elapsed = Date.now() - startTime;
    await logAiUsageObj(req.userId || null, tool, query, JSON.stringify(response), elapsed);

    return res.status(200).json(response);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Search with AI failed" });
  }
};

// 2. Chat with Tutor
export const chatWithTutor = async (req, res) => {
  const startTime = Date.now();
  try {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    const prompt = TEMPLATE_BUILDERS.CHAT(message);
    const { response, tool } = await callRegistryAi("ai-tutor", prompt, SYSTEM_PROMPTS.AI_TUTOR_CHAT, false, history);
    const elapsed = Date.now() - startTime;
    await logAiUsageObj(req.userId, tool, message, response, elapsed);

    return res.status(200).json({ reply: response });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Chat failed" });
  }
};

// 3. AI Syllabus Builder
export const generateCourseSyllabus = async (req, res) => {
  const startTime = Date.now();
  try {
    const { title, description } = req.body;
    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required" });
    }

    const prompt = TEMPLATE_BUILDERS.COURSE_BUILDER(title, description);
    const { response, tool } = await callRegistryAi("course-description", prompt, SYSTEM_PROMPTS.COURSE_CURRICULUM_GENERATOR, true);
    const elapsed = Date.now() - startTime;
    await logAiUsageObj(req.userId, tool, title, JSON.stringify(response), elapsed);

    return res.status(200).json(response);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to generate syllabus" });
  }
};

// 4. AI Notes
export const generateNotes = async (req, res) => {
  const startTime = Date.now();
  try {
    const { topic } = req.body;
    if (!topic) {
      return res.status(400).json({ message: "Topic is required" });
    }

    const prompt = TEMPLATE_BUILDERS.NOTES(topic);
    const { response, tool } = await callRegistryAi("ai-notes", prompt, SYSTEM_PROMPTS.STUDY_ASSISTANT, false);
    const elapsed = Date.now() - startTime;
    await logAiUsageObj(req.userId, tool, topic, response, elapsed);

    return res.status(200).json({ notes: response });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to generate notes" });
  }
};

// 5. AI Quiz
export const generateQuiz = async (req, res) => {
  const startTime = Date.now();
  try {
    const { topic } = req.body;
    if (!topic) {
      return res.status(400).json({ message: "Topic is required" });
    }

    const prompt = TEMPLATE_BUILDERS.QUIZ(topic);
    const { response, tool } = await callRegistryAi("ai-quiz", prompt, SYSTEM_PROMPTS.STUDY_ASSISTANT, true);
    const elapsed = Date.now() - startTime;
    await logAiUsageObj(req.userId, tool, topic, JSON.stringify(response), elapsed);

    return res.status(200).json(response);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to generate quiz" });
  }
};

// 6. AI Flashcards
export const generateFlashcards = async (req, res) => {
  const startTime = Date.now();
  try {
    const { topic } = req.body;
    if (!topic) {
      return res.status(400).json({ message: "Topic is required" });
    }

    const prompt = TEMPLATE_BUILDERS.FLASHCARDS(topic);
    const { response, tool } = await callRegistryAi("ai-flashcards", prompt, SYSTEM_PROMPTS.STUDY_ASSISTANT, true);
    const elapsed = Date.now() - startTime;
    await logAiUsageObj(req.userId, tool, topic, JSON.stringify(response), elapsed);

    return res.status(200).json(response);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to generate flashcards" });
  }
};

// 7. AI Study Planner
export const generateStudyPlan = async (req, res) => {
  const startTime = Date.now();
  try {
    const { topic, commitment } = req.body;
    if (!topic) {
      return res.status(400).json({ message: "Topic is required" });
    }

    const prompt = TEMPLATE_BUILDERS.STUDY_PLAN(topic, commitment);
    const { response, tool } = await callRegistryAi("ai-planner", prompt, SYSTEM_PROMPTS.STUDY_ASSISTANT, true);
    const elapsed = Date.now() - startTime;
    await logAiUsageObj(req.userId, tool, topic, JSON.stringify(response), elapsed);

    return res.status(200).json(response);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to generate study plan" });
  }
};

// 8. AI Doubt Solver
export const solveDoubt = async (req, res) => {
  const startTime = Date.now();
  try {
    const { doubt, code } = req.body;
    if (!doubt) {
      return res.status(400).json({ message: "Doubt details are required" });
    }

    const prompt = TEMPLATE_BUILDERS.DOUBT(doubt, code);
    const { response, tool } = await callRegistryAi("ai-doubt", prompt, SYSTEM_PROMPTS.STUDY_ASSISTANT, false);
    const elapsed = Date.now() - startTime;
    await logAiUsageObj(req.userId, tool, doubt, response, elapsed);

    return res.status(200).json({ solution: response });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Doubt solver failed" });
  }
};

// 9. AI Career Advisor
export const getCareerAdvice = async (req, res) => {
  const startTime = Date.now();
  try {
    const { targetRole, skills, experience } = req.body;
    if (!targetRole) {
      return res.status(400).json({ message: "Target role is required" });
    }

    const prompt = TEMPLATE_BUILDERS.CAREER_ADVISOR(targetRole, skills, experience);
    const { response, tool } = await callRegistryAi("ai-tutor", prompt, SYSTEM_PROMPTS.STUDY_ASSISTANT, false);
    const elapsed = Date.now() - startTime;
    await logAiUsageObj(req.userId, tool, targetRole, response, elapsed);

    return res.status(200).json({ advice: response });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Career advice failed" });
  }
};

// 10. AI Study Assistant
export const studyAssist = async (req, res) => {
  const startTime = Date.now();
  try {
    const { topic, context } = req.body;
    if (!topic) {
      return res.status(400).json({ message: "Topic is required" });
    }

    const prompt = `Topic: ${topic}. Context: ${context || "None"}`;
    const { response, tool } = await callRegistryAi("ai-tutor", prompt, SYSTEM_PROMPTS.STUDY_ASSISTANT, false);
    const elapsed = Date.now() - startTime;
    await logAiUsageObj(req.userId, tool, topic, response, elapsed);

    return res.status(200).json({ reply: response });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "AI Study Assistant failed" });
  }
};

// 11. AI Research Assistant
export const researchAssist = async (req, res) => {
  const startTime = Date.now();
  try {
    const { paper } = req.body;
    if (!paper) {
      return res.status(400).json({ message: "Paper text is required" });
    }

    const { response, tool } = await callRegistryAi("ai-notes", paper, SYSTEM_PROMPTS.STUDY_ASSISTANT, false);
    const elapsed = Date.now() - startTime;
    await logAiUsageObj(req.userId, tool, paper, response, elapsed);

    return res.status(200).json({ response });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "AI Research Assistant failed" });
  }
};

// 12. AI Resume Builder
export const resumeBuilder = async (req, res) => {
  const startTime = Date.now();
  try {
    const { experienceText } = req.body;
    if (!experienceText) {
      return res.status(400).json({ message: "Experience details are required" });
    }

    const { response, tool } = await callRegistryAi("ai-tutor", experienceText, SYSTEM_PROMPTS.STUDY_ASSISTANT, false);
    const elapsed = Date.now() - startTime;
    await logAiUsageObj(req.userId, tool, experienceText, response, elapsed);

    return res.status(200).json({ response });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "AI Resume Builder failed" });
  }
};

// 13. AI Interview Coach
export const interviewCoach = async (req, res) => {
  const startTime = Date.now();
  try {
    const { role, answer } = req.body;
    if (!role) {
      return res.status(400).json({ message: "Role is required" });
    }

    const prompt = TEMPLATE_BUILDERS.MOCK_INTERVIEW(role, answer);
    const { response, tool } = await callRegistryAi("ai-tutor", prompt, SYSTEM_PROMPTS.AI_TUTOR_CHAT, false);
    const elapsed = Date.now() - startTime;
    await logAiUsageObj(req.userId, tool, role, response, elapsed);

    return res.status(200).json({ critique: response });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "AI Interview Coach failed" });
  }
};

// 14. AI Translation
export const translateText = async (req, res) => {
  const startTime = Date.now();
  try {
    const { text, targetLanguage } = req.body;
    if (!text) {
      return res.status(400).json({ message: "Text is required" });
    }

    const prompt = TEMPLATE_BUILDERS.TRANSLATE(text, targetLanguage);
    const { response, tool } = await callRegistryAi("ai-translation", prompt, SYSTEM_PROMPTS.AI_SEARCH_AGENT, false);
    const elapsed = Date.now() - startTime;
    await logAiUsageObj(req.userId, tool, text, response, elapsed);

    return res.status(200).json({ translated: response });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "AI Translation failed" });
  }
};

// 15. AI Summarizer
export const generateSummary = async (req, res) => {
  const startTime = Date.now();
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ message: "Text to summarize is required" });
    }

    const prompt = TEMPLATE_BUILDERS.SUMMARIZE(text);
    const { response, tool } = await callRegistryAi("ai-summary", prompt, SYSTEM_PROMPTS.STUDY_ASSISTANT, false);
    const elapsed = Date.now() - startTime;
    await logAiUsageObj(req.userId, tool, text, response, elapsed);

    return res.status(200).json({ summary: response });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "AI Summarizer failed" });
  }
};

// Architecture Placeholders
export const voiceTutor = async (req, res) => {
  return res.status(200).json({ reply: "EduSpark Voice Tutor is operating in warning/dry-run placeholder mode." });
};

export const pdfChat = async (req, res) => {
  return res.status(200).json({ reply: "EduSpark PDF Document Chat is operating in warning/dry-run placeholder mode." });
};

export const mindMaps = async (req, res) => {
  return res.status(200).json({ 
    nodes: [
      { id: "1", label: "Artificial Intelligence Core" },
      { id: "2", label: "Neural Models & Weights" }
    ]
  });
};

// 19. History
export const getAiHistory = async (req, res) => {
  try {
    const logs = await AiLog.find({ user: req.userId }).sort({ requestedAt: -1 }).limit(50);
    return res.status(200).json(logs);
  } catch (error) {
    return res.status(500).json({ message: "Failed to load history logs." });
  }
};

// 20. Favorites
export const toggleFavoriteAiLog = async (req, res) => {
  try {
    const { logId } = req.params;
    const log = await AiLog.findById(logId);
    if (!log) {
      return res.status(404).json({ message: "Log record not found." });
    }
    if (log.user.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: "Access denied." });
    }
    log.isFavorite = !log.isFavorite;
    await log.save();
    return res.status(200).json({ message: "Favorites status updated", isFavorite: log.isFavorite });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update favorites." });
  }
};

export const getAiFavorites = async (req, res) => {
  try {
    const favs = await AiLog.find({ user: req.userId, isFavorite: true }).sort({ requestedAt: -1 });
    return res.status(200).json(favs);
  } catch (error) {
    return res.status(500).json({ message: "Failed to load favorites." });
  }
};

// AI Course Description Builder (Tutor Studio)
export const generateCourseDescription = async (req, res) => {
  const startTime = Date.now();
  try {
    const { title, category } = req.body;
    if (!title || !category) {
      return res.status(400).json({ message: "Course title and category are required." });
    }
    const prompt = TEMPLATE_BUILDERS.COURSE_DESC(title, category);
    const { response, tool } = await callRegistryAi("course-description", prompt, SYSTEM_PROMPTS.AI_SEARCH_AGENT, false);
    const elapsed = Date.now() - startTime;
    await logAiUsageObj(req.userId, tool, title, response, elapsed);
    return res.status(200).json({ description: response });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "AI Course Description failed." });
  }
};

// AI Thumbnail Cover Prompt Builder (Tutor Studio)
export const generateThumbnailCoverPrompt = async (req, res) => {
  const startTime = Date.now();
  try {
    const { title } = req.body;
    if (!title) {
      return res.status(400).json({ message: "Course title is required." });
    }
    const prompt = TEMPLATE_BUILDERS.THUMBNAIL(title);
    const { response, tool } = await callRegistryAi("thumbnail-prompt", prompt, SYSTEM_PROMPTS.AI_SEARCH_AGENT, false);
    const elapsed = Date.now() - startTime;
    await logAiUsageObj(req.userId, tool, title, response, elapsed);
    return res.status(200).json({ thumbnailPrompt: response });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "AI Thumbnail Prompt builder failed." });
  }
};

// AI Lesson Plan Builder (Tutor Studio)
export const generateLessonPlan = async (req, res) => {
  const startTime = Date.now();
  try {
    const { title, duration } = req.body;
    if (!title) {
      return res.status(400).json({ message: "Lecture title is required." });
    }
    const prompt = TEMPLATE_BUILDERS.LESSON_PLAN(title, duration);
    const { response, tool } = await callRegistryAi("lesson-plan", prompt, SYSTEM_PROMPTS.AI_SEARCH_AGENT, false);
    const elapsed = Date.now() - startTime;
    await logAiUsageObj(req.userId, tool, title, response, elapsed);
    return res.status(200).json({ lessonPlan: response });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "AI Lesson Planner failed." });
  }
};