// ─── central LMS API Client ──────────────────────────────────────────────────
// Maps the old Express/AI backend bridge requests to the new Next.js /api/ai
// endpoint (which uses real Gemini 1.5 Flash).
// This prevents runtime errors on pre-existing code calling lmsApi.post().

import axios from "axios";

export const LMS_API_BASE_URL = "/api/lms";

const lmsApi = {
  post: async (url: string, payload: any): Promise<{ data: any }> => {
    // ── INTERCEPT AI ENDPOINTS ──────────────────────────────────────────────
    if (url.startsWith("/ai/") || url.startsWith("ai/")) {
      const endpoint = url.startsWith("/") ? url : `/${url}`;
      let aiModule = "study";
      let promptText = "";

      if (endpoint === "/ai/chat") {
        promptText = payload.message || "";
        aiModule = "study";
      } else if (endpoint === "/ai/generate-study-plan") {
        promptText = payload.topic || "";
        aiModule = "study-plan";
      } else if (endpoint === "/ai/generate-notes") {
        promptText = payload.topic || "";
        aiModule = "notes";
      } else if (endpoint === "/ai/generate-quiz") {
        promptText = payload.topic || "";
        aiModule = "quiz-json";
      } else if (endpoint === "/ai/solve-doubt") {
        promptText = payload.doubt || "";
        if (payload.code) {
          promptText += `\n\nCode context:\n\`\`\`\n${payload.code}\n\`\`\``;
        }
        aiModule = "doubt";
      }

      // Call our Next.js API route
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: promptText,
          module: aiModule,
        }),
      });

      if (!res.ok) {
        throw new Error(`AI service returned ${res.status}`);
      }

      const rawData = await res.json();

      // Return the exact structure each page expects
      if (endpoint === "/ai/chat") {
        return { data: { reply: rawData.text } };
      } else if (endpoint === "/ai/generate-study-plan") {
        // Already parsed by /api/ai POST handler
        return { data: rawData };
      } else if (endpoint === "/ai/generate-notes") {
        return { data: { notes: rawData.text } };
      } else if (endpoint === "/ai/generate-quiz") {
        // Already parsed by /api/ai POST handler
        return { data: rawData };
      } else if (endpoint === "/ai/solve-doubt") {
        return { data: { solution: rawData.text } };
      }

      return { data: rawData };
    }

    // ── FALLBACK FOR NON-AI REQUESTS ────────────────────────────────────────
    // If there are other endpoints, use the default axios client
    const fallbackClient = axios.create({
      baseURL: LMS_API_BASE_URL,
      timeout: 15000,
      withCredentials: true,
    });
    return fallbackClient.post(url, payload);
  },
};

export default lmsApi;
export { lmsApi };
