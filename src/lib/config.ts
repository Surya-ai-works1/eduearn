// src/lib/config.ts

/**
 * Global flag indicating whether the application should run in Mock Mode.
 * Set the environment variable NEXT_PUBLIC_MOCK_MODE to "true" to enable mock data.
 * This file is the SINGLE source of truth; no other part of the code should read
 * process.env directly for mock mode decisions.
 */
export const IS_MOCK: boolean = process.env.NEXT_PUBLIC_MOCK_MODE === "true";
