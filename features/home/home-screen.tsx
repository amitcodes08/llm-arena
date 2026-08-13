"use client";

import Link from "next/link";
import { CatalogModel } from "@/infrastructure/fetch-model-catalog";
import {
  Swords,
  Trophy,
  Zap,
  ShieldCheck,
  Bot,
  ArrowRight,
  Sparkles,
  Gauge,
} from "lucide-react";
import { ArenaScreen } from "@/features/arena/arena-screen";
import { useState } from "react";

interface HomeScreenProps {
  readonly catalog: CatalogModel[] | null;
  readonly defaultSelection: string[];
  readonly onCastVote: (
    turnId: string,
    modelResponseId: string
  ) => Promise<{ success: boolean; error?: string }>;
}

export function HomeScreen({
  catalog,
  defaultSelection,
  onCastVote,
}: Readonly<HomeScreenProps>) {
  const [activeTab, setActiveTab] = useState<"arena" | "overview">("arena");

  if (activeTab === "arena") {
    return (
      <div className="flex h-full w-full flex-col">
        {/* Banner to switch view */}
        <div className="bg-muted/60 border-border flex items-center justify-between border-b px-6 py-2 text-xs">
          <div className="text-muted-foreground flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
            <span className="font-mono">Live Arena Ready</span>
          </div>
          <button
            onClick={() => setActiveTab("overview")}
            className="text-primary flex items-center gap-1 font-semibold hover:underline"
          >
            <span>Learn More About LLM Arena</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
        <ArenaScreen
          catalog={catalog}
          defaultSelection={defaultSelection}
          onCastVote={onCastVote}
        />
      </div>
    );
  }

  return (
    <div className="bg-background text-foreground mx-auto w-full max-w-6xl flex-1 space-y-16 overflow-y-auto p-6 sm:p-12">
      {/* Top Switcher */}
      <div className="flex justify-end">
        <button
          onClick={() => setActiveTab("arena")}
          className="btn-accent flex items-center gap-2 text-xs font-semibold"
        >
          <Swords className="h-4 w-4" />
          <span>Launch Live Battle Arena</span>
        </button>
      </div>

      {/* Hero Section */}
      <div className="mx-auto max-w-3xl space-y-6 pt-4 text-center">
        <div className="border-border bg-muted/80 text-muted-foreground inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 font-mono text-xs">
          <Sparkles className="text-primary h-3.5 w-3.5" />
          <span>Benchmarking AI Models Through Direct Battle</span>
        </div>

        <h1 className="text-display text-foreground text-4xl font-normal tracking-tight sm:text-6xl">
          Compare 3 LLMs side by side, in real time
        </h1>

        <p className="text-muted-foreground mx-auto max-w-2xl text-base leading-relaxed sm:text-lg">
          Send a single prompt to top OpenRouter free-tier models
          simultaneously. Watch independent parallel streams, evaluate latency &
          speed metrics, and vote on the best answer.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <button
            onClick={() => setActiveTab("arena")}
            className="btn-accent flex items-center gap-2 px-6 py-3 text-sm font-semibold shadow-md"
          >
            <Swords className="h-4 w-4" />
            <span>Enter the Arena</span>
          </button>

          <Link
            href="/leaderboard"
            className="surface hover:bg-muted flex items-center gap-2 px-6 py-3 text-sm font-semibold transition-colors"
          >
            <Trophy className="h-4 w-4 text-amber-500" />
            <span>View Standings</span>
          </Link>
        </div>
      </div>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="surface space-y-3 p-6">
          <div className="bg-primary/10 text-primary border-primary/20 flex h-10 w-10 items-center justify-center rounded-xl border">
            <Zap className="h-5 w-5" />
          </div>
          <h3 className="text-foreground text-base font-semibold">
            Parallel Streams
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Three independent HTTP streams run concurrently. If one model drops,
            the other two continue without interruption.
          </p>
        </div>

        <div className="surface space-y-3 p-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Gauge className="h-5 w-5" />
          </div>
          <h3 className="text-foreground text-base font-semibold">
            Instrument Strip Metrics
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Every response measures real-time latency (TTFT), tokens per second
            speed, and token volume with tabular digits.
          </p>
        </div>

        <div className="surface space-y-3 p-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-500">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h3 className="text-foreground text-base font-semibold">
            Arcjet Protection
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Shield WAF, bot detection, and rate limiting protect every turn so
            evaluation remains fair and abuse-free.
          </p>
        </div>
      </div>

      {/* Model Catalog Banner */}
      <div className="surface bg-card/60 flex flex-col items-center justify-between gap-6 p-8 md:flex-row">
        <div className="space-y-2 text-center md:text-left">
          <div className="text-muted-foreground flex items-center justify-center gap-2 font-mono text-xs tracking-wider uppercase md:justify-start">
            <Bot className="text-primary h-4 w-4" />
            <span>OpenRouter Free Catalog</span>
          </div>
          <h2 className="font-display text-foreground text-2xl font-normal">
            Explore {catalog?.length || 3}+ Models
          </h2>
          <p className="text-muted-foreground max-w-lg text-sm">
            Compare context window sizes and specifications across Llama 3.1,
            Qwen 2.5, Gemma 2, and more.
          </p>
        </div>

        <Link
          href="/models"
          className="surface hover:bg-muted flex shrink-0 items-center gap-2 px-5 py-2.5 text-xs font-semibold transition-colors"
        >
          <span>Browse Catalog</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
