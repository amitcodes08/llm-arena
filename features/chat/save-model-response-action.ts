"use server";

import { auth } from "@clerk/nextjs/server";
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

export async function saveModelResponseAction(input: SaveModelResponseInput) {
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
      select: { id: true },
    });

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

    return { success: true };
  } catch (error) {
    console.error(
      "[save-model-response-action] failed to save response",
      error
    );
    return { success: false, error: "Failed to persist response." };
  }
}
