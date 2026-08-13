/**
 * Shared OpenRouter provider instance.
 *
 * Uses the official @openrouter/ai-sdk-provider package so every call
 * goes through the Vercel AI SDK's streamText / generateText interface.
 *
 * Usage:
 *   import { openrouter } from "@/app/arena/lib/openrouter";
 *   const result = streamText({ model: openrouter.chat("model-id"), ... });
 */

import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { env } from "@/app/env";

export const openrouter = createOpenRouter({
  apiKey: env.OPENROUTER_API_KEY,
});
