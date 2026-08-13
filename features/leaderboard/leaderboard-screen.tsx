"use client";

import Link from "next/link";
import { LeaderboardRow } from "./leaderboard-standings";
import { Trophy, Lock, BarChart2 } from "lucide-react";

interface LeaderboardScreenProps {
  readonly rows: LeaderboardRow[];
  readonly view: "everyone" | "me";
  readonly needsSignIn?: boolean;
}

export function LeaderboardScreen({
  rows,
  view,
  needsSignIn,
}: Readonly<LeaderboardScreenProps>) {
  return (
    <div className="mx-auto flex h-full w-full max-w-5xl flex-1 flex-col space-y-6 overflow-y-auto p-6">
      {/* Header & Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-normal tracking-tight">
            Leaderboard
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Real win rates calculated from parallel model response votes.
          </p>
        </div>

        <div className="bg-muted border-border flex items-center rounded-xl border p-1">
          <Link
            href="/leaderboard?view=everyone"
            className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition-all ${
              view === "everyone"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Everyone
          </Link>
          <Link
            href="/leaderboard?view=me"
            className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition-all ${
              view === "me"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Just me
          </Link>
        </div>
      </div>

      {needsSignIn ? (
        <div className="surface space-y-4 p-10 text-center">
          <Lock className="text-muted-foreground mx-auto h-8 w-8" />
          <h2 className="text-lg font-semibold">Sign in to view your votes</h2>
          <p className="text-muted-foreground mx-auto max-w-md text-sm">
            Your personal leaderboard tracks model win rates across your own
            threads and prompts.
          </p>
        </div>
      ) : rows.length === 0 ? (
        <div className="surface space-y-4 p-12 text-center">
          <BarChart2 className="text-muted-foreground mx-auto h-10 w-10 opacity-60" />
          <h2 className="text-foreground text-lg font-semibold">
            No votes recorded yet
          </h2>
          <p className="text-muted-foreground mx-auto max-w-md text-sm leading-relaxed">
            {view === "me"
              ? "You haven't voted on any turns yet. Start an arena battle to vote for your favorite model!"
              : "No model votes have been cast yet. Be the first to evaluate models in the arena and vote!"}
          </p>
          <Link
            href="/"
            className="btn-accent inline-flex items-center gap-2 text-xs font-semibold"
          >
            <Trophy className="h-4 w-4" />
            <span>Enter the Arena</span>
          </Link>
        </div>
      ) : (
        /* Standings Table */
        <div className="surface overflow-hidden">
          <div className="text-eyebrow border-border bg-muted/30 grid grid-cols-[3rem_1fr_12rem_8rem_8rem] gap-4 border-b px-5 py-3">
            <span>#</span>
            <span>Model</span>
            <span>Win Rate</span>
            <span>Avg. TTFT</span>
            <span>Avg. Speed</span>
          </div>

          <div className="divide-border divide-y">
            {rows.map((row) => (
              <div
                key={row.modelId}
                className="hover:bg-muted/40 grid grid-cols-[3rem_1fr_12rem_8rem_8rem] items-center gap-4 px-5 py-4 transition-colors"
              >
                <span className="flex items-center gap-1.5 font-mono text-sm font-semibold">
                  {row.rank === 1 && (
                    <Trophy className="h-4 w-4 fill-amber-500 text-amber-500" />
                  )}
                  {row.rank}
                </span>
                <div>
                  <div className="text-foreground text-sm font-semibold">
                    {row.modelName}
                  </div>
                  <div className="text-muted-foreground truncate font-mono text-xs">
                    {row.modelId}
                  </div>
                </div>

                {/* Win Rate Progress Bar */}
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-primary font-mono text-xl font-bold">
                      {row.winRatePct}%
                    </span>
                    <span className="text-muted-foreground font-mono text-xs">
                      won {row.wins} of {row.totalVotes}
                    </span>
                  </div>
                  <div className="bg-muted border-border mt-1.5 h-1.5 w-full overflow-hidden rounded-full border">
                    <div
                      className="bg-primary h-full rounded-full transition-all duration-300"
                      style={{ width: `${row.winRatePct}%` }}
                    />
                  </div>
                </div>

                <span className="text-foreground font-mono text-xs font-medium">
                  {row.avgTtftMs} ms
                </span>

                <span className="text-foreground font-mono text-xs font-medium">
                  {row.avgTokensPerSec} tok/s
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
