/**
 * Shared Arcjet client instances.
 *
 * aj: Pre-configured for authenticated endpoints (WAF Shield, Bot Detection, User Token Bucket).
 * ajPublic: Configured for unauthenticated public routes (WAF Shield, Bot Detection with Search Engine allowlist, IP Sliding Window).
 */

import arcjet, {
  shield,
  detectBot,
  tokenBucket,
  slidingWindow,
} from "@arcjet/next";
import { env } from "@/app/env";

export const aj = arcjet({
  key: env.ARCJET_KEY,
  characteristics: ["userId"],
  rules: [
    shield({ mode: "LIVE" }),
    detectBot({
      mode: "LIVE",
      allow: [],
    }),
    tokenBucket({
      mode: "LIVE",
      refillRate: 20,
      interval: "1h",
      capacity: 60,
    }),
  ],
});

export const ajPublic = arcjet({
  key: env.ARCJET_KEY,
  rules: [
    shield({ mode: "LIVE" }),
    detectBot({
      mode: "LIVE",
      allow: ["CATEGORY:SEARCH_ENGINE"],
    }),
    slidingWindow({
      mode: "LIVE",
      interval: "1m",
      max: 60,
    }),
  ],
});
