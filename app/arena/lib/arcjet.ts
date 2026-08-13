/**
 * Shared Arcjet client.
 *
 * Pre-configured with rate limiting, bot detection, and Shield WAF.
 * This is the base instance — individual route handlers can layer
 * additional rules on top via `aj.withRule(...)`.
 *
 * Not applied to any route yet; Feature 6 wires it into the chat endpoint.
 */

import arcjet, { shield, detectBot, tokenBucket } from "@arcjet/next";
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
