"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Trophy,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  User,
  Sparkles,
  Zap,
  Clock,
  Layers,
  ArrowUpRight,
  ArrowDown,
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
  onSelectSuggestion?: (text: string) => void;
}

export function ArenaGrid({
  turnItems = [],
  onVote,
  onSelectSuggestion,
}: Readonly<ArenaGridProps>) {
  const [expandedMetrics, setExpandedMetrics] = useState<
    Record<string, boolean>
  >({});
  const [showScrollButton, setShowScrollButton] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef<boolean>(true);
  const prevTurnCountRef = useRef<number>(turnItems.length);

  // Track scroll position to prevent locking scroll when user scrolls up
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const distanceToBottom = scrollHeight - scrollTop - clientHeight;
    const isNearBottom = distanceToBottom < 100;
    isAtBottomRef.current = isNearBottom;
    setShowScrollButton(!isNearBottom && distanceToBottom > 200);
  }, []);

  const scrollToBottom = (smooth = true) => {
    isAtBottomRef.current = true;
    setShowScrollButton(false);
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({
        behavior: smooth ? "smooth" : "auto",
      });
    }
  };

  // Smart auto-scroll: only scrolls if user is already at the bottom or on new turn
  useEffect(() => {
    if (turnItems.length === 0) return;

    // If a new turn was added, scroll to bottom
    if (turnItems.length > prevTurnCountRef.current) {
      prevTurnCountRef.current = turnItems.length;
      scrollToBottom(true);
      return;
    }

    // While streaming tokens: ONLY auto-scroll if the user hasn't scrolled up
    if (isAtBottomRef.current && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [turnItems]);

  const toggleMetrics = (key: string) => {
    setExpandedMetrics((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const suggestions = [
    "Compare client-side rendering (CSR) vs server-side rendering (SSR) in 3 key points.",
    "Explain quantum computing principles to a software developer.",
    "Write a TypeScript generic debounce function with cancellation support.",
  ];

  // If no turns yet, show the minimalist welcome & suggested prompts
  if (!turnItems || turnItems.length === 0) {
    return (
      <div className="animate-enter flex flex-1 flex-col items-center justify-center p-6 text-center">
        <div className="mx-auto max-w-2xl space-y-6">
          <div className="border-border bg-muted/70 text-muted-foreground inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 font-mono text-xs shadow-xs">
            <Sparkles className="text-primary h-3.5 w-3.5" />
            <span>Head-to-Head AI Model Evaluation</span>
          </div>

          <div className="space-y-2">
            <h1 className="font-display text-foreground text-3xl font-normal tracking-tight sm:text-5xl">
              Compare 3 LLMs side by side
            </h1>
            <p className="text-muted-foreground mx-auto max-w-lg text-sm leading-relaxed sm:text-base">
              Send a single prompt to watch independent parallel streams,
              measure latency and throughput, and vote on the best answer.
            </p>
          </div>

          {/* Quick Suggestion Chips */}
          <div className="space-y-2 pt-4 text-left">
            <p className="text-eyebrow text-center">Try a battle prompt</p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => onSelectSuggestion?.(suggestion)}
                  className="surface hover:border-input hover:bg-muted/40 group flex flex-col justify-between p-3 text-left text-xs transition-all duration-150"
                >
                  <span className="text-foreground/90 line-clamp-3 leading-relaxed font-medium">
                    {suggestion}
                  </span>
                  <div className="text-muted-foreground group-hover:text-foreground mt-2 flex items-center justify-end font-mono text-[11px]">
                    <span>Use</span>
                    <ArrowUpRight className="ml-1 h-3 w-3" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 space-y-12 overflow-y-auto p-4 sm:p-6"
      >
        {turnItems.map((turn, turnIdx) => {
          const hasWinnerOnTurn = turn.models.some((m) => m.isWinner);

          return (
            <div key={turn.id} className="animate-enter space-y-6">
              {/* User Prompt */}
              <div className="flex flex-col items-end gap-1.5">
                <div className="text-muted-foreground flex items-center gap-1.5 pr-1 font-mono text-[11px] tracking-wider uppercase">
                  <User className="h-3 w-3" />
                  <span>Prompt {turn.turnNumber || turnIdx + 1}</span>
                </div>
                <div className="bg-card border-border text-foreground max-w-2xl rounded-2xl rounded-tr-sm border px-5 py-3.5 text-sm font-medium shadow-xs">
                  {turn.prompt}
                </div>
              </div>

              {/* Model Response Grid */}
              <div
                className={`grid gap-4 sm:gap-5 ${
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
                  const isStreaming = model.status === "STREAMING";
                  const isFailed = model.status === "FAILED";

                  return (
                    <div
                      key={model.id}
                      className={`surface flex flex-col justify-between p-5 transition-all duration-200 ${
                        model.isWinner
                          ? "border-primary/80 ring-primary/20 shadow-md ring-2"
                          : hasWinnerOnTurn
                            ? "border-border/80 opacity-85"
                            : "hover:border-input"
                      }`}
                    >
                      {/* Card Header */}
                      <div>
                        <div className="border-border mb-4 flex items-center justify-between border-b pb-3.5">
                          <div className="flex items-center gap-2.5">
                            <span className="bg-muted text-foreground border-border flex h-7 w-7 items-center justify-center rounded-full border text-xs font-bold shadow-xs">
                              {model.shortName[0]}
                            </span>
                            <div className="flex flex-col">
                              <span className="text-foreground max-w-[130px] truncate text-xs font-semibold">
                                {model.name}
                              </span>
                              {isStreaming && (
                                <span className="text-muted-foreground flex items-center gap-1 font-mono text-[10px]">
                                  <span className="bg-primary inline-block h-1.5 w-1.5 animate-ping rounded-full" />
                                  Streaming...
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Vote Button or Winner Badge */}
                          {model.isWinner ? (
                            <span className="bg-primary text-primary-foreground flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold shadow-xs">
                              <Trophy className="h-3.5 w-3.5" />
                              <span>Winner</span>
                            </span>
                          ) : onVote ? (
                            <button
                              type="button"
                              onClick={() => onVote(turn.id, model.id)}
                              disabled={
                                hasWinnerOnTurn || isStreaming || isFailed
                              }
                              className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
                                hasWinnerOnTurn
                                  ? "text-muted-foreground cursor-not-allowed opacity-40"
                                  : "text-primary hover:bg-muted hover:text-foreground cursor-pointer"
                              }`}
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>Vote Winner</span>
                            </button>
                          ) : null}
                        </div>

                        {/* Markdown Response Body */}
                        <div className="prose-arena min-h-[60px]">
                          {isFailed ? (
                            <p className="text-destructive text-xs italic">
                              {model.response || "Model failed to respond."}
                            </p>
                          ) : (
                            <>
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {model.response || ""}
                              </ReactMarkdown>
                              {isStreaming && (
                                <span className="streaming-cursor" />
                              )}
                            </>
                          )}
                        </div>
                      </div>

                      {/* Card Footer Metrics */}
                      <div className="border-border mt-5 border-t pt-3.5">
                        <button
                          type="button"
                          onClick={() => toggleMetrics(metricKey)}
                          aria-expanded={isExpanded}
                          aria-label={`Toggle metrics for ${model.name}`}
                          className="text-muted-foreground hover:text-foreground flex w-full items-center justify-between rounded-md p-1 text-xs transition-colors"
                        >
                          <span className="text-eyebrow flex items-center gap-1 text-[10px]">
                            {isExpanded ? (
                              <ChevronDown className="h-3.5 w-3.5" />
                            ) : (
                              <ChevronRight className="h-3.5 w-3.5" />
                            )}
                            <span>
                              {isExpanded ? "Hide Metrics" : "Metrics"}
                            </span>
                          </span>
                          <span className="metric-value font-mono text-xs">
                            {model.metrics.ttftMs}ms ·{" "}
                            {model.metrics.tokensPerSec} tok/s
                          </span>
                        </button>

                        {isExpanded && (
                          <div className="bg-muted/60 border-border text-foreground animate-enter mt-3 space-y-1.5 rounded-lg border p-3 font-mono text-xs">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" /> TTFT:
                              </span>
                              <span className="metric-value">
                                {model.metrics.ttftMs} ms
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground flex items-center gap-1">
                                <Zap className="h-3 w-3" /> Speed:
                              </span>
                              <span className="metric-value">
                                {model.metrics.tokensPerSec} tok/s
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground flex items-center gap-1">
                                <Layers className="h-3 w-3" /> Total Tokens:
                              </span>
                              <span className="metric-value">
                                {model.metrics.totalTokens}
                              </span>
                            </div>
                            <div className="text-muted-foreground border-border/50 flex justify-between border-t pt-1.5 text-[11px]">
                              <span>Evaluation Tier:</span>
                              <span className="text-foreground font-medium">
                                OpenRouter Free
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
              {turnIdx < turnItems.length - 1 && (
                <hr className="border-border my-8 opacity-40" />
              )}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Floating Scroll to Bottom Button */}
      {showScrollButton && (
        <button
          type="button"
          onClick={() => scrollToBottom(true)}
          className="surface hover:bg-muted text-foreground animate-enter absolute right-6 bottom-4 z-20 flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold shadow-lg transition-all"
          aria-label="Scroll to bottom"
        >
          <ArrowDown className="h-3.5 w-3.5" />
          <span>Scroll to latest</span>
        </button>
      )}
    </div>
  );
}
