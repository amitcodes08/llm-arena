"use client";

import { ReactNode } from "react";

export function PostHogProvider({
  children,
}: {
  readonly children: ReactNode;
}) {
  return <>{children}</>;
}
