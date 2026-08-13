"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { CatalogModel } from "@/infrastructure/fetch-model-catalog";
import { TurnState, ResponseState } from "./turn-state";
import { ArenaGrid, ModelCardData } from "@/app/arena/components/arena-grid";
import { PromptInput } from "@/app/arena/components/prompt-input";
import { TopBar } from "@/app/arena/components/top-bar";
import { startTurnAction } from "@/features/chat/start-turn-action";
import { useThreadHistory } from "@/infrastructure/thread-history-store";
import { Swords, Eye } from "lucide-react";
import { Show, SignInButton } from "@clerk/nextjs";

interface ArenaScreenProps {
  readonly catalog: CatalogModel[] | null;
  readonly defaultSelection: string[];
  readonly onCastVote: (
    turnId: string,
    modelResponseId: string
  ) => Promise<{ success: boolean; error?: string }>;
  readonly threadId?: string;
  readonly initialTurns?: readonly TurnState[];
  readonly isOwner?: boolean;
}

export function ArenaScreen({
  catalog,
  defaultSelection,
  onCastVote,
  threadId: initialThreadId,
  initialTurns = [],
  isOwner = true,
}: Readonly<ArenaScreenProps>) {
  const { addThread } = useThreadHistory();
  const [selectedModels, setSelectedModels] =
    useState<string[]>(defaultSelection);
  const [turns, setTurns] = useState<readonly TurnState[]>(initialTurns);
  const [activeThreadId, setActiveThreadId] = useState<string | undefined>(
    initialThreadId
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Convert latest turn or fallback for initial view
  const latestTurn = turns.at(-1);

  const updateResponseState = useCallback(
    (turnId: string, modelId: string, updates: Partial<ResponseState>) => {
      setTurns((prevTurns) =>
        prevTurns.map((turn) => {
          if (turn.id !== turnId) return turn;
          return {
            ...turn,
            responses: turn.responses.map((resp) => {
              if (resp.modelId !== modelId) return resp;
              return { ...resp, ...updates };
            }),
          };
        })
      );
    },
    []
  );

  const displayModels: ModelCardData[] = latestTurn
    ? latestTurn.responses.map((r) => ({
        id: r.modelId,
        name:
          catalog?.find((m) => m.id === r.modelId)?.name ||
          r.modelName ||
          r.modelId.split("/").pop()?.replace(":free", "") ||
          r.modelId,
        shortName:
          r.modelName?.split(" ")[0] ||
          r.modelId.split("/").pop()?.split("-")[0] ||
          "Model",
        response:
          r.text ||
          (r.status === "STREAMING" ? "Generating answer..." : "No response"),
        status:
          r.status === "COMPLETE"
            ? "COMPLETED"
            : r.status === "FAILED"
              ? "FAILED"
              : "STREAMING",
        metrics: {
          ttftMs: r.metrics?.timeToFirstTokenMs ?? 320,
          tokensPerSec: r.metrics?.tokensPerSecond ?? 48,
          totalTokens: r.metrics?.totalTokens ?? 120,
        },
        isWinner: r.won,
      }))
    : selectedModels.map((id) => {
        const catModel = catalog?.find((m) => m.id === id);
        const name =
          catModel?.name || id.split("/").pop()?.replace(":free", "") || id;
        const shortName = name.split(" ")[0];

        return {
          id,
          name,
          shortName,
          response:
            "Send a prompt below to evaluate parallel model streams in real time.",
          status: "COMPLETED" as const,
          metrics: { ttftMs: 320, tokensPerSec: 48.5, totalTokens: 142 },
          isWinner: false,
        };
      });

  // Calculate live model win records for the current thread
  const modelWinMap = new Map<
    string,
    { shortName: string; wins: number; total: number }
  >();
  turns.forEach((turn) => {
    turn.responses.forEach((resp) => {
      const catModel = catalog?.find((m) => m.id === resp.modelId);
      const shortName =
        catModel?.name?.split(" ")[0] ||
        resp.modelName?.split(" ")[0] ||
        resp.modelId.split("/").pop()?.split("-")[0] ||
        "Model";

      if (!modelWinMap.has(resp.modelId)) {
        modelWinMap.set(resp.modelId, { shortName, wins: 0, total: 0 });
      }
      const entry = modelWinMap.get(resp.modelId)!;
      entry.total += 1;
      if (resp.won) entry.wins += 1;
    });
  });

  const winPills = Array.from(modelWinMap.entries()).map(([id, stat]) => ({
    id,
    shortName: stat.shortName,
    wins: stat.wins,
    total: stat.total,
  }));

  const streamSingleModel = async (
    turnId: string,
    modelId: string,
    promptText: string
  ) => {
    const startTime = performance.now();
    let firstTokenTime: number | null = null;

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ turnId, modelId, prompt: promptText }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`Stream error: ${response.statusText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let streamedText = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        if (chunk) {
          const now = performance.now();
          if (!firstTokenTime) firstTokenTime = now;
          streamedText += chunk;

          const ttftMs = Math.round(
            firstTokenTime ? firstTokenTime - startTime : now - startTime
          );
          const totalSec = (now - startTime) / 1000;
          const tokenEstimate = Math.max(1, Math.ceil(streamedText.length / 4));
          const tokPerSec =
            totalSec > 0 ? Number((tokenEstimate / totalSec).toFixed(1)) : 0;

          updateResponseState(turnId, modelId, {
            text: streamedText,
            status: "STREAMING",
            metrics: {
              modelId,
              timeToFirstTokenMs: ttftMs,
              tokensPerSecond: tokPerSec,
              inputTokens: null,
              outputTokens: tokenEstimate,
              totalTokens: tokenEstimate,
              costUsd: 0,
            },
          });
        }
      }

      const endTime = performance.now();
      const finalTtft = Math.round(
        firstTokenTime ? firstTokenTime - startTime : endTime - startTime
      );
      const finalSec = (endTime - startTime) / 1000;
      const finalTokens = Math.max(1, Math.ceil(streamedText.length / 4));
      const finalTokPerSec =
        finalSec > 0 ? Number((finalTokens / finalSec).toFixed(1)) : 0;

      updateResponseState(turnId, modelId, {
        text: streamedText,
        status: "COMPLETE",
        metrics: {
          modelId,
          timeToFirstTokenMs: finalTtft,
          tokensPerSecond: finalTokPerSec,
          inputTokens: null,
          outputTokens: finalTokens,
          totalTokens: finalTokens,
          costUsd: 0,
        },
      });
    } catch (error) {
      console.error(`[arena] stream error for ${modelId}:`, error);
      updateResponseState(turnId, modelId, {
        status: "FAILED",
        text: "Model failed to answer.",
      });
    }
  };

  const handleSendPrompt = async (promptText: string) => {
    if (isSubmitting || selectedModels.length === 0) return;
    setIsSubmitting(true);

    const res = await startTurnAction({
      threadId: activeThreadId,
      prompt: promptText,
      modelIds: selectedModels,
    });

    if (!res.success || !res.turnId || !res.threadId) {
      alert(res.error || "Failed to start turn. Make sure you are signed in.");
      setIsSubmitting(false);
      return;
    }

    const newThreadId = res.threadId;
    if (!activeThreadId) {
      setActiveThreadId(newThreadId);
      addThread({ id: newThreadId, title: promptText.slice(0, 40) });
      window.history.pushState({}, "", `/t/${newThreadId}`);
    }

    const newTurnId = res.turnId;
    const initialResponses: ResponseState[] = selectedModels.map((modelId) => {
      const catModel = catalog?.find((m) => m.id === modelId);
      const modelName = catModel?.name || modelId;
      const respRow = res.responses?.find((r) => r.modelId === modelId);

      return {
        id: respRow?.id || modelId,
        modelId,
        modelName,
        status: "STREAMING",
        text: "",
        won: false,
        metrics: null,
      };
    });

    const newTurn: TurnState = {
      id: newTurnId,
      prompt: promptText,
      responses: initialResponses,
    };

    setTurns((prev) => [...prev, newTurn]);

    // Dispatch parallel streams
    selectedModels.forEach((modelId) => {
      streamSingleModel(newTurnId, modelId, promptText);
    });

    setIsSubmitting(false);
  };

  const handleVote = async (modelId: string) => {
    if (!isOwner || !latestTurn) return;
    const resp = latestTurn.responses.find((r) => r.modelId === modelId);
    if (!resp) return;

    const res = await onCastVote(latestTurn.id, resp.id);
    if (res.success) {
      setTurns((prevTurns) =>
        prevTurns.map((turn) => {
          if (turn.id !== latestTurn.id) return turn;
          return {
            ...turn,
            responses: turn.responses.map((r) => ({
              ...r,
              won: r.modelId === modelId,
            })),
          };
        })
      );
    } else {
      alert(res.error || "Failed to record vote.");
    }
  };

  return (
    <div className="bg-background flex h-full flex-1 flex-col overflow-hidden">
      <TopBar
        threadTitle={
          activeThreadId ? `Thread ${activeThreadId.slice(0, 6)}` : "New Arena"
        }
        threadId={activeThreadId}
        models={winPills.length > 0 ? winPills : undefined}
      />
      <ArenaGrid
        prompt={
          latestTurn?.prompt ||
          "Send a prompt below to evaluate parallel model streams in real time."
        }
        models={displayModels}
        onVote={isOwner ? handleVote : undefined}
      />

      {isOwner ? (
        <PromptInput
          catalog={catalog}
          selectedModelIds={selectedModels}
          onSelectionChange={(ids) => setSelectedModels(ids)}
          onSend={handleSendPrompt}
        />
      ) : (
        /* Public Guest Read-Only Banner */
        <div className="border-border bg-card/90 border-t p-4">
          <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
            <div className="text-muted-foreground flex items-center gap-2.5 text-xs">
              <Eye className="text-primary h-4 w-4 shrink-0" />
              <span>
                Viewing public battle thread. Start your own session to evaluate
                models with your own prompts.
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Show when="signed-out">
                <SignInButton mode="modal">
                  <button className="surface hover:bg-muted px-3 py-1.5 text-xs font-semibold transition-colors">
                    Sign In
                  </button>
                </SignInButton>
              </Show>
              <Link
                href="/"
                className="btn-accent flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold"
              >
                <Swords className="h-3.5 w-3.5" />
                <span>Start New Battle</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
