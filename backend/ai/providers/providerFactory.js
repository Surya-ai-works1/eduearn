import geminiProvider from "./gemini.js";

export class ProviderFactory {
  /**
   * Retrieves the requested AI provider client configuration.
   * Falls back to Gemini if the provider is a placeholder.
   */
  static getProvider(name = "gemini") {
    const providerName = name.toLowerCase();
    
    switch (providerName) {
      case "gemini":
        return geminiProvider;
      case "openai":
      case "claude":
      case "groq":
      case "deepseek":
      case "openrouter":
        console.warn(`Provider "${name}" is registered as a placeholder. Falling back to Gemini.`);
        return geminiProvider;
      default:
        return geminiProvider;
    }
  }
}

export default ProviderFactory;
