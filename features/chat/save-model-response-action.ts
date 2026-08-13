"use server";

import { auth } from "@clerk/nextjs/server";
import { posthogServer } from "@/app/arena/lib/posthog-server";
import { database } from "@/infrastructure/database";
import { findAppUserId } from "@/infrastructure/current-user";

export interface SaveModelResponseInput {
  turnId: string;
  modelId: string;
  content: string;
  timeToFirstTokenMs: number | null;
  tokensPerSecond: number | null;
  totalTokens: number | null;
}

export interface PersistedMetrics {
  timeToFirstTokenMs: number | null;
  tokensPerSecond: number | null;
  totalTokens: number | null;
}

export async function saveModelResponseAction(
  input: SaveModelResponseInput
): Promise<{
  success: boolean;
  error?: string;
  persistedMetrics?: PersistedMetrics;
}> {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return { success: false, error: "Authentication required" };
  }

  const appUserId = await findAppUserId(clerkId);
  if (!appUserId) {
    return { success: false, error: "User not found" };
  }

  try {
    const turn = await database().turn.findUnique({
      where: { id: input.turnId },
      select: { thread: { select: { userId: true } } },
    });

    if (!turn || turn.thread.userId !== appUserId) {
      return { success: false, error: "Unauthorized" };
    }

    const existing = await database().modelResponse.findFirst({
      where: {
        turnId: input.turnId,
        modelId: input.modelId,
      },
      select: {
        id: true,
        status: true,
        timeToFirstTokenMs: true,
        tokensPerSecond: true,
        totalTokens: true,
      },
    });

    // If already persisted with COMPLETED status by server onFinish, do not overwrite provider metrics
    if (existing && existing.status === "COMPLETED") {
      return {
        success: true,
        persistedMetrics: {
          timeToFirstTokenMs: existing.timeToFirstTokenMs,
          tokensPerSecond:
            existing.tokensPerSecond !== null
              ? Number(existing.tokensPerSecond)
              : null,
          totalTokens: existing.totalTokens,
        },
      };
    }

    if (existing) {
      await database().modelResponse.update({
        where: { id: existing.id },
        data: {
          status: "COMPLETED",
          content: input.content,
          timeToFirstTokenMs: input.timeToFirstTokenMs,
          tokensPerSecond: input.tokensPerSecond,
          totalTokens: input.totalTokens,
        },
      });
    } else {
      await database().modelResponse.create({
        data: {
          turnId: input.turnId,
          modelId: input.modelId,
          status: "COMPLETED",
          content: input.content,
          timeToFirstTokenMs: input.timeToFirstTokenMs,
          tokensPerSecond: input.tokensPerSecond,
          totalTokens: input.totalTokens,
        },
      });
    }

    if (posthogServer) {
      posthogServer.capture({
        distinctId: clerkId,
        event: "stream_completed",
        properties: {
          turnId: input.turnId,
          modelId: input.modelId,
          timeToFirstTokenMs: input.timeToFirstTokenMs,
          tokensPerSecond: input.tokensPerSecond,
          totalTokens: input.totalTokens,
        },
      });
    }

    return {
      success: true,
      persistedMetrics: {
        timeToFirstTokenMs: input.timeToFirstTokenMs,
        tokensPerSecond: input.tokensPerSecond,
        totalTokens: input.totalTokens,
      },
    };
  } catch (error) {
    console.error(
      "[save-model-response-action] failed to save response",
      error
    );
    return { success: false, error: "Failed to persist response." };
  }
}
