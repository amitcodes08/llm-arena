/**
 * Server-side PostHog client.
 *
 * Use this for capturing events from Route Handlers, server actions,
 * and anywhere that runs on the server. For client-side tracking,
 * import the globally initialized client from "posthog-js" instead.
 */

import { PostHog } from "posthog-node";

const projectToken = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

if ((!projectToken || !host) && process.env.NODE_ENV !== "production") {
  const missingVariable = !projectToken
    ? "NEXT_PUBLIC_POSTHOG_KEY"
    : "NEXT_PUBLIC_POSTHOG_HOST";

  throw new Error(
    `${missingVariable} variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once ${missingVariable} is configured`,
  );
}

const globalForPostHog = globalThis as unknown as {
  posthogServer: PostHog | undefined;
};

export const posthogServer =
  projectToken && host
    ? (globalForPostHog.posthogServer ??
      new PostHog(projectToken, {
        host,
        enableExceptionAutocapture: true,
        flushAt: 1,
        flushInterval: 0,
      }))
    : undefined;

if (posthogServer && process.env.NODE_ENV !== "production") {
  globalForPostHog.posthogServer = posthogServer;
}
