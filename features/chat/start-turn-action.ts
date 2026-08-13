"use server";

import { auth } from "@clerk/nextjs/server";
import { database } from "@/infrastructure/database";
import { findAppUserId } from "@/infrastructure/current-user";

export interface StartTurnInput {
  threadId?: string;
  prompt: string;
  modelIds: string[];
}

export async function startTurnAction(input: StartTurnInput) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return { success: false, error: "Sign in to send a prompt to the arena." };
  }

  const appUserId = await findAppUserId(clerkId);
  if (!appUserId) {
    return { success: false, error: "User account not found." };
  }

  try {
    let threadId = input.threadId;

    if (threadId) {
      // Validate that the existing thread belongs to this user.
      // If it belongs to another author (public view), fork into a new thread for this user.
      const existingThread = await database().thread.findUnique({
        where: { id: threadId },
        select: { userId: true },
      });

      if (!existingThread || existingThread.userId !== appUserId) {
        threadId = undefined;
      }
    }

    if (!threadId) {
      const thread = await database().thread.create({
        data: {
          userId: appUserId,
          title: input.prompt.slice(0, 40),
        },
      });
      threadId = thread.id;
    }

    const turnCount = await database().turn.count({
      where: { threadId },
    });

    const turn = await database().turn.create({
      data: {
        threadId,
        prompt: input.prompt,
        turnNumber: turnCount + 1,
        responses: {
          create: input.modelIds.map((modelId) => ({
            modelId,
            content: "",
            status: "PENDING",
          })),
        },
      },
      select: {
        id: true,
        responses: {
          select: {
            id: true,
            modelId: true,
          },
        },
      },
    });

    return {
      success: true,
      threadId,
      turnId: turn.id,
      responses: turn.responses,
    };
  } catch (error) {
    console.error("[start-turn-action] failed to create turn", error);
    return { success: false, error: "Failed to start turn." };
  }
}
