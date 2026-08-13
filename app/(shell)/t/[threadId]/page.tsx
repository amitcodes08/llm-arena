import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { request as getRequest } from "@arcjet/next";

import type { ResponseState, TurnState } from "@/features/arena/turn-state";
import { ArenaScreen } from "@/features/arena/arena-screen";
import { castVoteAction } from "@/features/voting/cast-vote-action";
import { database } from "@/infrastructure/database";
import { findAppUserId } from "@/infrastructure/current-user";
import { fetchFreeModelCatalog } from "@/infrastructure/fetch-model-catalog";
import { defaultModelSelection } from "@/infrastructure/model-catalog";
import { ajPublic } from "@/app/arena/lib/arcjet";
import { posthogServer } from "@/app/arena/lib/posthog-server";
import { ShieldAlert } from "lucide-react";

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

export async function generateMetadata({
  params,
}: {
  readonly params: Promise<{ threadId: string }>;
}): Promise<Metadata> {
  const { threadId } = await params;
  const thread = await database().thread.findUnique({
    where: { id: threadId },
    select: {
      turns: {
        take: 1,
        orderBy: { createdAt: "asc" },
        select: { prompt: true },
      },
    },
  });

  const promptTitle = thread?.turns[0]?.prompt
    ? `"${thread.turns[0].prompt.slice(0, 50)}..."`
    : "Model Battle";

  return {
    title: `${promptTitle} | LLM Arena`,
    description:
      "Compare LLM model responses side by side in real time with direct benchmark metrics.",
  };
}

async function checkPublicAccess(): Promise<
  "ALLOWED" | "RATE_LIMITED" | "DENIED"
> {
  try {
    const req = await getRequest();
    const decision = await ajPublic.protect(req);

    if (decision.isDenied()) {
      return decision.reason.isRateLimit() ? "RATE_LIMITED" : "DENIED";
    }
    return "ALLOWED";
  } catch (err) {
    console.error("[arcjet-public] check failed", err);
    return "ALLOWED";
  }
}

export default async function ThreadPage({
  params,
}: {
  readonly params: Promise<{ threadId: string }>;
}) {
  const { threadId } = await params;

  // Arcjet protection for unauthenticated public thread sharing
  const access = await checkPublicAccess();

  if (access === "RATE_LIMITED") {
    return (
      <div className="bg-background flex h-full flex-1 flex-col items-center justify-center p-8 text-center">
        <div className="bg-card border-border max-w-md space-y-4 rounded-xl border p-6 shadow-sm">
          <ShieldAlert className="text-primary mx-auto h-10 w-10" />
          <h2 className="text-foreground text-lg font-bold">
            Too Many Requests
          </h2>
          <p className="text-muted-foreground text-xs leading-relaxed">
            You are viewing shared threads too quickly. Please wait a minute
            before refreshing.
          </p>
        </div>
      </div>
    );
  }

  if (access === "DENIED") {
    return (
      <div className="bg-background flex h-full flex-1 flex-col items-center justify-center p-8 text-center">
        <div className="bg-card border-border max-w-md space-y-4 rounded-xl border p-6 shadow-sm">
          <ShieldAlert className="text-error mx-auto h-10 w-10" />
          <h2 className="text-foreground text-lg font-bold">Access Denied</h2>
          <p className="text-muted-foreground text-xs leading-relaxed">
            Automated scraping and suspicious traffic are restricted on public
            shared threads.
          </p>
        </div>
      </div>
    );
  }

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

  if (posthogServer) {
    posthogServer.capture({
      distinctId: clerkId ?? `anonymous_${threadId}`,
      event: "shared_thread_viewed",
      properties: {
        threadId: thread.id,
        isOwner,
        turnCount: thread.turns.length,
      },
    });
  }

  const initialTurns: readonly TurnState[] = thread.turns.map(
    (turn: DBTurn) => ({
      id: turn.id,
      prompt: turn.prompt,
      responses: turn.responses.map((response: DBResponse): ResponseState => ({
        id: response.id,
        modelId: response.modelId,
        modelName: response.modelId,
        status: response.status === "COMPLETED" ? "COMPLETE" : response.status,
        text: response.content,
        won: turn.votes.some(
          (vote: DBVote) => vote.winnerModelResponseId === response.id
        ),
        metrics:
          response.timeToFirstTokenMs !== null
            ? {
                modelId: response.modelId,
                timeToFirstTokenMs: response.timeToFirstTokenMs,
                tokensPerSecond: Number(response.tokensPerSecond ?? 0),
                inputTokens: null,
                outputTokens: response.totalTokens ?? 0,
                totalTokens: response.totalTokens ?? 0,
                costUsd: 0,
              }
            : null,
      })),
    })
  );

  return (
    <ArenaScreen
      catalog={catalog}
      defaultSelection={defaultModelSelection(catalog || [])}
      onCastVote={castVoteAction}
      threadId={thread.id}
      initialTurns={initialTurns}
      isOwner={isOwner}
    />
  );
}
