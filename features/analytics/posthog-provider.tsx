"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import posthog from "posthog-js";
import { PostHogProvider as PHReactProvider } from "posthog-js/react";
import { useEffect, useRef, type ReactNode } from "react";

function PostHogIdentifier() {
  const { isSignedIn, userId } = useAuth();
  const { user } = useUser();
  const identifiedUserId = useRef<string | null>(null);

  useEffect(() => {
    if (isSignedIn && userId && user && identifiedUserId.current !== userId) {
      if (identifiedUserId.current) {
        posthog.reset();
      }

      posthog.identify(userId, {
        email: user.primaryEmailAddress?.emailAddress,
        name: user.fullName,
      });
      identifiedUserId.current = userId;
    }

    if (!isSignedIn && identifiedUserId.current) {
      posthog.reset();
      identifiedUserId.current = null;
    }
  }, [isSignedIn, userId, user]);

  return null;
}

export function PostHogProvider({
  children,
}: {
  readonly children: ReactNode;
}) {
  return (
    <PHReactProvider client={posthog}>
      <PostHogIdentifier />
      {children}
    </PHReactProvider>
  );
}
