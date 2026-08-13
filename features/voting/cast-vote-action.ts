"use server";

import { auth } from "@clerk/nextjs/server";
import { database } from "@/infrastructure/database";
import { findAppUserId } from "@/infrastructure/current-user";
import { posthogServer } from "@/app/arena/lib/posthog-server";

export async function castVoteAction(turnId: string, modelResponseId: string) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return { success: false, error: "Sign in to vote." };
  }

  const appUserId = await findAppUserId(clerkId);
  if (!appUserId) {
    return { success: false, error: "User account not found." };
  }

  try {
    const turn = await database().turn.findUnique({
      where: { id: turnId },
      select: { threadId: true, thread: { select: { userId: true } } },
    });

    if (!turn || turn.thread.userId !== appUserId) {
      return { success: false, error: "You can only vote on your own turns." };
    }

    // Validate that modelResponseId belongs to this turn and is COMPLETED
    const targetResponse = await database().modelResponse.findUnique({
      where: { id: modelResponseId },
      select: { turnId: true, status: true, modelId: true },
    });

    if (
      !targetResponse ||
      targetResponse.turnId !== turnId ||
      targetResponse.status !== "COMPLETED"
    ) {
      return {
        success: false,
        error: "Invalid or incomplete model response for this turn.",
      };
    }

    // Validate that at least two model responses have completed in this turn
    const completedCount = await database().modelResponse.count({
      where: { turnId, status: "COMPLETED" },
    });

    if (completedCount < 2) {
      return {
        success: false,
        error: "A vote requires at least two completed model responses.",
      };
    }

    const vote = await database().vote.upsert({
      where: { userId_turnId: { userId: appUserId, turnId } },
      update: { winnerModelResponseId: modelResponseId },
      create: {
        userId: appUserId,
        threadId: turn.threadId,
        turnId,
        winnerModelResponseId: modelResponseId,
      },
      select: {
        winnerModelResponse: { select: { modelId: true } },
      },
    });

    if (posthogServer) {
      posthogServer.capture({
        distinctId: clerkId,
        event: "vote_cast",
        properties: {
          turnId,
          modelResponseId,
          winningModelId: vote.winnerModelResponse.modelId,
        },
      });
    }

    return { success: true };
  } catch (error) {
    console.error("[cast-vote-action] failed to record vote", error);
    return { success: false, error: "Failed to record vote." };
  }
}
