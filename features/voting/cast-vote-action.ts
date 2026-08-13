"use server";

import { auth } from "@clerk/nextjs/server";
import { database } from "@/infrastructure/database";
import { findAppUserId } from "@/infrastructure/current-user";

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

    await database().vote.upsert({
      where: { userId_turnId: { userId: appUserId, turnId } },
      update: { winnerModelResponseId: modelResponseId },
      create: {
        userId: appUserId,
        threadId: turn.threadId,
        turnId,
        winnerModelResponseId: modelResponseId,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("[cast-vote-action] failed to record vote", error);
    return { success: false, error: "Failed to record vote." };
  }
}
