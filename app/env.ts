/**
 * Fail-fast environment variable validation.
 *
 * Import this module at the top of any server-side entry point.
 * If a required variable is missing, the process crashes immediately
 * with a clear message naming the missing variable.
 */

const required = [
  "OPENROUTER_API_KEY",
  "DATABASE_URL",
  "CLERK_SECRET_KEY",
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
  "ARCJET_KEY",
] as const;

type EnvKey = (typeof required)[number];

function getEnv(key: EnvKey): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${key}. ` +
        `See .env.example for the full list.`
    );
  }
  return value;
}

/** Validate all required vars at import time. */
function validateEnv(): Readonly<Record<EnvKey, string>> {
  const entries = required.map((key) => [key, getEnv(key)] as const);
  return Object.freeze(Object.fromEntries(entries)) as Record<EnvKey, string>;
}

/**
 * Validated, typed environment.
 *
 * Accessing any key here is guaranteed non-empty at runtime.
 * The process will have already crashed on import if anything was missing.
 */
export const env = validateEnv();
