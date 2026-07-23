import ProviderFactory from "../providers/providerFactory.js";

// Helper to clean Markdown json blocks
const cleanJsonResponse = (text) => {
  let cleaned = text || "";
  cleaned = cleaned.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```json\s*/i, "").replace(/^```\s*/, "").replace(/\s*```$/, "").trim();
  }
  return cleaned;
};

export class AiService {
  /**
   * Resolves the appropriate AI provider client.
   */
  static getClient(provider = "gemini") {
    return ProviderFactory.getProvider(provider);
  }

  /**
   * Generates plaintext response with options options
   */
  static async generateText(prompt, systemInstruction = "", provider = "gemini", options = {}) {
    const client = this.getClient(provider);
    const contents = systemInstruction ? `${systemInstruction}\n\n${prompt}` : prompt;
    
    const config = {
      model: options.model || "gemini-1.5-flash",
      contents: contents,
      config: {
        temperature: options.temperature !== undefined ? options.temperature : 0.7,
        maxOutputTokens: options.maxTokens || 1000
      }
    };

    const response = await client.models.generateContent(config);
    return response.text || "";
  }

  /**
   * Generates conversational responses using context history and options configs
   */
  static async generateChat(history, message, systemInstruction = "", provider = "gemini", options = {}) {
    const client = this.getClient(provider);
    const contents = [];
    
    if (history && Array.isArray(history)) {
      history.forEach(item => {
        contents.push({
          role: item.role === "user" ? "user" : "model",
          parts: [{ text: item.text }]
        });
      });
    }
    
    const promptText = systemInstruction ? `${systemInstruction}\n\nUser Question: ${message}` : message;
    contents.push({ role: "user", parts: [{ text: promptText }] });

    const config = {
      model: options.model || "gemini-1.5-flash",
      contents: contents,
      config: {
        temperature: options.temperature !== undefined ? options.temperature : 0.7,
        maxOutputTokens: options.maxTokens || 1000
      }
    };

    const response = await client.models.generateContent(config);
    return response.text || "";
  }

  /**
   * Generates structured data output, parses JSON
   */
  static async generateJson(prompt, systemInstruction = "", provider = "gemini", options = {}) {
    const rawText = await this.generateText(prompt, systemInstruction, provider, options);
    const cleaned = cleanJsonResponse(rawText);
    try {
      return JSON.parse(cleaned);
    } catch (err) {
      console.error("JSON parse exception. Raw text response was:", rawText);
      throw err;
    }
  }
}

export default AiService;
