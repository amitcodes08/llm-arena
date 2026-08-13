"use client";

import { useState } from "react";
import {
  Trophy,
  ChevronDown,
  ChevronRight,
  Sparkles,
  CheckCircle2,
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

interface ArenaGridProps {
  prompt?: string;
  models?: ModelCardData[];
  onVote?: (modelId: string) => void;
}

export function ArenaGrid({
  prompt = "Hello! Can you compare client-side routing vs server-side routing?",
  models = [
    {
      id: "meta-llama/llama-3.1-8b-instruct:free",
      name: "Llama 3.1 8B Free",
      shortName: "Llama",
      response:
        "Client-side routing intercepts URL changes in the browser without reloading the page, giving a fast single-page app feel. Server-side routing fetches complete HTML documents from the server for every URL change, offering great initial SEO.",
      status: "COMPLETED",
      metrics: { ttftMs: 320, tokensPerSec: 48.5, totalTokens: 142 },
      isWinner: false,
    },
    {
      id: "qwen/qwen-2.5-72b-instruct:free",
      name: "Qwen 2.5 72B Free",
      shortName: "Qwen",
      response:
        "Client-side routing relies on JavaScript (like React Router) to render components dynamically. Server-side routing delivers fully rendered HTML directly from web servers, which is generally faster on low-power devices.",
      status: "COMPLETED",
      metrics: { ttftMs: 410, tokensPerSec: 52.1, totalTokens: 156 },
      isWinner: true,
    },
    {
      id: "google/gemma-2-9b-it:free",
      name: "Gemma 2 9B Free",
      shortName: "Gemma",
      response:
        "Client-side routing renders UI updates locally in JS after the initial bundle download. Server-side routing processes navigation requests on the server, generating fresh pages per request.",
      status: "COMPLETED",
      metrics: { ttftMs: 290, tokensPerSec: 44.2, totalTokens: 130 },
      isWinner: false,
    },
  ],
  onVote,
}: Readonly<ArenaGridProps>) {
  const [expandedMetrics, setExpandedMetrics] = useState<
    Record<string, boolean>
  >({});

  const toggleMetrics = (id: string) => {
    setExpandedMetrics((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="flex-1 space-y-6 overflow-y-auto p-6">
      {/* User Prompt Message Bubble */}
      <div className="flex justify-end">
        <div className="bg-card border-border text-foreground max-w-xl rounded-2xl rounded-tr-sm border px-5 py-3.5 text-sm font-medium shadow-sm">
          {prompt}
        </div>
      </div>

      {/* Model Response Columns */}
      <div
        className={`grid gap-5 ${
          models.length === 1
            ? "grid-cols-1"
            : models.length === 2
              ? "grid-cols-1 md:grid-cols-2"
              : "grid-cols-1 md:grid-cols-3"
        }`}
      >
        {models.map((model) => (
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
                ) : (
                  <button
                    onClick={() => onVote?.(model.id)}
                    className="text-primary hover:bg-muted flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Vote Winner</span>
                  </button>
                )}
              </div>

              {/* Response Text */}
              <div className="text-foreground text-sm leading-relaxed whitespace-pre-wrap">
                {model.response}
              </div>
            </div>

            {/* Card Footer: Instrument Strip Metrics */}
            <div className="border-border mt-5 border-t pt-3.5">
              <button
                onClick={() => toggleMetrics(model.id)}
                className="text-muted-foreground hover:text-foreground flex w-full items-center justify-between rounded-md p-1 text-xs transition-colors"
              >
                <span className="text-eyebrow flex items-center gap-1">
                  {expandedMetrics[model.id] ? (
                    <ChevronDown className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5" />
                  )}
                  <span>
                    {expandedMetrics[model.id]
                      ? "Hide Metrics"
                      : "Show Metrics"}
                  </span>
                </span>
                <span className="metric-value font-mono text-xs">
                  {model.metrics.ttftMs}ms · {model.metrics.tokensPerSec} tok/s
                </span>
              </button>

              {expandedMetrics[model.id] && (
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
                    <span className="text-muted-foreground">Total Tokens:</span>
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
        ))}
      </div>
    </div>
  );
}
