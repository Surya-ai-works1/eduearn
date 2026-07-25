// src/lib/ai/safety/SafetyLayer.ts

export class SafetyLayer {
  static validatePrompt(prompt: string): { clean: boolean; reason?: string } {
    const lower = prompt.toLowerCase();

    // 1. Prompt Injection Checks
    const injectionPatterns = [
      "ignore previous instructions",
      "ignore instructions",
      "bypass system prompt",
      "you are now a",
      "forget what we talked",
      "act as a",
      "system instruction override",
      "dan mode",
      "jailbreak"
    ];

    for (const pattern of injectionPatterns) {
      if (lower.includes(pattern)) {
        return { clean: false, reason: `Potential Prompt Injection Detected: "${pattern}"` };
      }
    }

    // 2. Sensitive Leakage Checks
    const secretKeywords = ["api_key", "supabase_key", "jwt_secret", "database_url", "private_key"];
    for (const secret of secretKeywords) {
      if (lower.includes(secret)) {
        return { clean: false, reason: "Sensitive credentials leakage filter triggered." };
      }
    }

    return { clean: true };
  }

  static validateResponse(text: string): { clean: boolean; reason?: string } {
    // Simple filter checking for raw secret hashes or token keys in model responses
    const regex = /xox[b-to-z]-[0-9]{12}/i; // mock api key leak pattern
    if (regex.test(text)) {
      return { clean: false, reason: "Potential API Key leaks detected in output." };
    }
    return { clean: true };
  }
}
