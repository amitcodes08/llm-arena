"use client";

import { useState } from "react";
import { CatalogModel } from "@/infrastructure/fetch-model-catalog";
import { TurnState } from "./turn-state";
import { ArenaGrid, ModelCardData } from "@/app/arena/components/arena-grid";
import { PromptInput } from "@/app/arena/components/prompt-input";
import { TopBar } from "@/app/arena/components/top-bar";

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
  threadId,
  initialTurns = [],
  isOwner = true,
}: Readonly<ArenaScreenProps>) {
  const [selectedModels] = useState<string[]>(defaultSelection);
  const [turns] = useState<readonly TurnState[]>(initialTurns);

  // Convert latest turn or placeholder for grid display
  const latestTurn = turns.at(-1);

  const displayModels: ModelCardData[] = latestTurn?.responses.map((r) => ({
    id: r.modelId,
    name: r.modelName || r.modelId,
    shortName: r.modelName?.split(" ")[0] || "Model",
    response: r.text,
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
  })) || [
    {
      id: selectedModels[0] || catalog?.[0]?.id || "llama",
      name: "Llama 3.1 8B Free",
      shortName: "Llama",
      response:
        "Client-side routing intercepts URL changes in the browser without reloading the page. Server-side routing fetches HTML from the server for every URL change.",
      status: "COMPLETED",
      metrics: { ttftMs: 320, tokensPerSec: 48.5, totalTokens: 142 },
      isWinner: false,
    },
    {
      id: selectedModels[1] || catalog?.[1]?.id || "qwen",
      name: "Qwen 2.5 72B Free",
      shortName: "Qwen",
      response:
        "Client-side routing uses JS to render components dynamically. Server-side routing delivers fully rendered HTML directly from web servers.",
      status: "COMPLETED",
      metrics: { ttftMs: 410, tokensPerSec: 52.1, totalTokens: 156 },
      isWinner: true,
    },
    {
      id: selectedModels[2] || catalog?.[2]?.id || "gemma",
      name: "Gemma 2 9B Free",
      shortName: "Gemma",
      response:
        "Client-side routing renders UI updates locally in JS. Server-side routing processes navigation on the server.",
      status: "COMPLETED",
      metrics: { ttftMs: 290, tokensPerSec: 44.2, totalTokens: 130 },
      isWinner: false,
    },
  ];

  return (
    <div className="bg-background flex h-full flex-1 flex-col overflow-hidden">
      <TopBar
        threadTitle={threadId ? `Thread ${threadId.slice(0, 6)}` : "New Arena"}
      />
      <ArenaGrid
        prompt={
          latestTurn?.prompt ||
          "Hello! Can you compare client-side routing vs server-side routing?"
        }
        models={displayModels}
        onVote={(modelId) => {
          if (latestTurn) {
            const resp = latestTurn.responses.find(
              (r) => r.modelId === modelId
            );
            if (resp) onCastVote(latestTurn.id, resp.id);
          }
        }}
      />
      {isOwner && (
        <PromptInput
          selectedModelsCount={selectedModels.length}
          onSend={(promptText) => {
            console.log("Send prompt:", promptText);
          }}
        />
      )}
    </div>
  );
}
