/**
 * Arcjet Guard protection instance for non-HTTP / AI agent tool calls.
 *
 * Usage:
 *   import { arcjetGuard } from "@/app/arena/lib/arcjet-guard";
 *   const decision = await arcjetGuard.guard("tools.llm-call", [ ... ]);
 */

import { launchArcjet } from "@arcjet/guard";
import { env } from "@/app/env";

export const arcjetGuard = launchArcjet({
  key: env.ARCJET_KEY,
});
