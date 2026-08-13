"use client";

import { useState, useRef, useEffect } from "react";
import {
  Trophy,
  ChevronDown,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  User,
} from "lucide-react";

export interface ModelCardData {
  id: string;
  name: string;
  shortName: string;
  response: string;
  status: "COMPLETED" | "STREAMING" | "FAILED";
  metrics: {
    ttftMs: number;
    tokensPerSec: number;
    totalTokens: number;
  };
  isWinner?: boolean;
}

export interface TurnFeedItem {
  id: string;
  turnNumber?: number;
  prompt: string;
  models: ModelCardData[];
}

interface ArenaGridProps {
  turnItems?: TurnFeedItem[];
  prompt?: string;
  models?: ModelCardData[];
  onVote?: (turnId: string, modelId: string) => void;
}

export function ArenaGrid({
  turnItems,
  prompt = "Hello! Can you compare client-side routing vs server-side routing?",
  models = [],
  onVote,
}: Readonly<ArenaGridProps>) {
  const [expandedMetrics, setExpandedMetrics] = useState<
    Record<string, boolean>
  >({});
  const bottomRef = useRef<HTMLDivElement>(null);

  // Normalize turns feed
  const activeFeed: TurnFeedItem[] =
    turnItems && turnItems.length > 0
      ? turnItems
      : [
          {
            id: "initial-turn",
            prompt,
            models: models.length > 0 ? models : [],
          },
        ];

  // Auto-scroll on new turns or incoming streaming content
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeFeed.length]);

  const toggleMetrics = (key: string) => {
    setExpandedMetrics((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="flex-1 space-y-12 overflow-y-auto scroll-smooth p-6">
      {activeFeed.map((turn, turnIdx) => (
        <div key={turn.id} className="space-y-6">
          {/* Turn Indicator & Prompt Bubble */}
          <div className="flex flex-col items-end gap-1.5">
            <div className="text-muted-foreground flex items-center gap-1.5 pr-1 font-mono text-[11px] tracking-wider uppercase">
              <User className="h-3 w-3" />
              <span>Prompt {turn.turnNumber || turnIdx + 1}</span>
            </div>
            <div className="bg-card border-border text-foreground max-w-2xl rounded-2xl rounded-tr-sm border px-5 py-3.5 text-sm font-medium shadow-xs">
              {turn.prompt}
            </div>
          </div>

          {/* Model Response Columns */}
          <div
            className={`grid gap-5 ${
              turn.models.length === 1
                ? "grid-cols-1"
                : turn.models.length === 2
                  ? "grid-cols-1 md:grid-cols-2"
                  : "grid-cols-1 md:grid-cols-3"
            }`}
          >
            {turn.models.map((model) => {
              const metricKey = `${turn.id}-${model.id}`;
              const isExpanded = !!expandedMetrics[metricKey];

              return (
                <div
                  key={model.id}
                  className={`surface flex flex-col justify-between p-5 transition-all ${
                    model.isWinner
                      ? "border-winner ring-winner/20 border-2 shadow-md ring-1"
                      : ""
                  }`}
                >
                  {/* Card Header */}
                  <div>
                    <div className="border-border mb-4 flex items-center justify-between border-b pb-3.5">
                      <div className="flex items-center gap-2.5">
                        <span className="bg-muted text-foreground border-border flex h-7 w-7 items-center justify-center rounded-full border text-xs font-bold shadow-xs">
                          {model.shortName[0]}
                        </span>
                        <span className="text-foreground max-w-[140px] truncate text-xs font-semibold">
                          {model.name}
                        </span>
                      </div>

                      {/* Vote Action / Winner Badge */}
                      {model.isWinner ? (
                        <span className="bg-winner flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold text-white shadow-xs">
                          <Trophy className="h-3.5 w-3.5" />
                          <span>Winner</span>
                        </span>
                      ) : onVote ? (
                        <button
                          onClick={() => onVote(turn.id, model.id)}
                          className="text-primary hover:bg-muted flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Vote Winner</span>
                        </button>
                      ) : null}
                    </div>

                    {/* Response Content */}
                    <div className="text-foreground text-sm leading-relaxed whitespace-pre-wrap">
                      {model.response}
                    </div>
                  </div>

                  {/* Card Footer: Instrument Strip Metrics */}
                  <div className="border-border mt-5 border-t pt-3.5">
                    <button
                      onClick={() => toggleMetrics(metricKey)}
                      className="text-muted-foreground hover:text-foreground flex w-full items-center justify-between rounded-md p-1 text-xs transition-colors"
                    >
                      <span className="text-eyebrow flex items-center gap-1">
                        {isExpanded ? (
                          <ChevronDown className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronRight className="h-3.5 w-3.5" />
                        )}
                        <span>{isExpanded ? "Hide Metrics" : "Metrics"}</span>
                      </span>
                      <span className="metric-value font-mono text-xs">
                        {model.metrics.ttftMs}ms · {model.metrics.tokensPerSec}{" "}
                        tok/s
                      </span>
                    </button>

                    {isExpanded && (
                      <div className="bg-muted/60 border-border text-foreground mt-3 space-y-1.5 rounded-lg border p-3 font-mono text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">TTFT:</span>
                          <span className="metric-value">
                            {model.metrics.ttftMs} ms
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Speed:</span>
                          <span className="metric-value">
                            {model.metrics.tokensPerSec} tok/s
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Total Tokens:
                          </span>
                          <span className="metric-value">
                            {model.metrics.totalTokens}
                          </span>
                        </div>
                        <div className="text-muted-foreground flex justify-between">
                          <span>Cost:</span>
                          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                            <Sparkles className="h-3 w-3" />
                            $0.0000 (Free Tier)
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Turn Divider */}
          {turnIdx < activeFeed.length - 1 && (
            <hr className="border-border my-8 opacity-40" />
          )}
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
