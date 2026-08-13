import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";

import type { ResponseState, TurnState } from "@/features/arena/turn-state";
import { ArenaScreen } from "@/features/arena/arena-screen";
import { castVoteAction } from "@/features/voting/cast-vote-action";
import { database } from "@/infrastructure/database";
import { findAppUserId } from "@/infrastructure/current-user";
import { fetchFreeModelCatalog } from "@/infrastructure/fetch-model-catalog";
import { defaultModelSelection } from "@/infrastructure/model-catalog";

interface DBResponse {
  id: string;
  modelId: string;
  status: "PENDING" | "STREAMING" | "COMPLETED" | "FAILED";
  content: string;
  timeToFirstTokenMs: number | null;
  tokensPerSecond: unknown;
  totalTokens: number | null;
}

interface DBVote {
  winnerModelResponseId: string;
}

interface DBTurn {
  id: string;
  prompt: string;
  votes: DBVote[];
  responses: DBResponse[];
}

export default async function ThreadPage({
  params,
}: {
  readonly params: Promise<{ threadId: string }>;
}) {
  const { threadId } = await params;
  const catalog = await fetchFreeModelCatalog();

  const thread = await database().thread.findUnique({
    where: { id: threadId },
    select: {
      id: true,
      userId: true,
      turns: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          prompt: true,
          votes: { select: { winnerModelResponseId: true } },
          responses: {
            select: {
              id: true,
              modelId: true,
              status: true,
              content: true,
              timeToFirstTokenMs: true,
              tokensPerSecond: true,
              totalTokens: true,
            },
          },
        },
      },
    },
  });

  if (!thread) notFound();

  const { userId: clerkId } = await auth();
  const viewerId = clerkId ? await findAppUserId(clerkId) : null;
  const isOwner = viewerId !== null && viewerId === thread.userId;

  const initialTurns: readonly TurnState[] = thread.turns.map(
    (turn: DBTurn) => ({
      id: turn.id,
      prompt: turn.prompt,
      responses: turn.responses.map((response: DBResponse): ResponseState => ({
        id: response.id,
        modelId: response.modelId,
        modelName: response.modelId,
        status: response.status === "COMPLETED" ? "COMPLETE" : response.status,
        text: response.content || "",
        won: turn.votes.some(
          (v: DBVote) => v.winnerModelResponseId === response.id
        ),
        metrics:
          response.status === "COMPLETED"
            ? {
                modelId: response.modelId,
                timeToFirstTokenMs: response.timeToFirstTokenMs,
                tokensPerSecond: response.tokensPerSecond
                  ? Number(response.tokensPerSecond)
                  : null,
                inputTokens: null,
                outputTokens: null,
                totalTokens: response.totalTokens,
                costUsd: 0,
              }
            : null,
      })),
    })
  );

  const latestTurnModels =
    initialTurns.at(-1)?.responses.map((r) => r.modelId) ?? [];

  return (
    <ArenaScreen
      catalog={catalog}
      defaultSelection={
        latestTurnModels.length > 0
          ? latestTurnModels
          : catalog
            ? defaultModelSelection(catalog)
            : []
      }
      onCastVote={castVoteAction}
      threadId={thread.id}
      initialTurns={initialTurns}
      isOwner={isOwner}
    />
  );
}
