"use client";

import { ModelMetrics } from "./turn-state";

export function InstrumentStrip({
  metrics,
}: {
  readonly metrics: ModelMetrics | null;
}) {
  if (!metrics) {
    return (
      <div className="text-muted-foreground flex items-center gap-4 font-mono text-xs opacity-60">
        <span>TTFT: -- ms</span>
        <span>Speed: -- tok/s</span>
        <span>Tokens: --</span>
      </div>
    );
  }

  return (
    <div className="text-muted-foreground flex items-center justify-between gap-4 font-mono text-xs">
      <div className="flex items-center gap-3">
        <span>
          TTFT:{" "}
          <strong className="text-foreground">
            {metrics.timeToFirstTokenMs ?? "--"} ms
          </strong>
        </span>
        <span>
          Speed:{" "}
          <strong className="text-foreground">
            {metrics.tokensPerSecond
              ? metrics.tokensPerSecond.toFixed(1)
              : "--"}{" "}
            tok/s
          </strong>
        </span>
        <span>
          Tokens:{" "}
          <strong className="text-foreground">
            {metrics.totalTokens ?? "--"}
          </strong>
        </span>
      </div>
      <div className="font-medium text-emerald-600 dark:text-emerald-400">
        ${(metrics.costUsd ?? 0).toFixed(4)}
      </div>
    </div>
  );
}
