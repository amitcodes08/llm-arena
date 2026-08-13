"use client";

import Link from "next/link";
import { LeaderboardRow } from "./leaderboard-standings";
import { Trophy, Lock, BarChart2, Swords, Zap, Clock } from "lucide-react";
import { Show, SignInButton } from "@clerk/nextjs";

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
      {/* Header & View Switcher */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-normal tracking-tight">
            Leaderboard
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Real win rates calculated from head-to-head model response votes.
          </p>
        </div>

        <div className="bg-muted border-border flex items-center self-start rounded-xl border p-1 sm:self-auto">
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
        <div className="surface space-y-5 p-12 text-center">
          <div className="bg-muted/80 text-muted-foreground mx-auto flex h-12 w-12 items-center justify-center rounded-2xl">
            <Lock className="h-6 w-6" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-foreground text-lg font-semibold">
              Sign in to view your personal standings
            </h2>
            <p className="text-muted-foreground mx-auto max-w-md text-xs leading-relaxed">
              Your personal leaderboard tracks how each model performed across
              your own head-to-head battles and voting history.
            </p>
          </div>
          <div>
            <Show when="signed-out">
              <SignInButton mode="modal">
                <button className="btn-accent px-4 py-2 text-xs font-semibold">
                  Sign In
                </button>
              </SignInButton>
            </Show>
          </div>
        </div>
      ) : rows.length === 0 ? (
        <div className="surface space-y-5 p-12 text-center">
          <div className="bg-muted/80 text-muted-foreground mx-auto flex h-12 w-12 items-center justify-center rounded-2xl">
            <BarChart2 className="h-6 w-6 opacity-80" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-foreground text-lg font-semibold">
              No votes recorded yet
            </h2>
            <p className="text-muted-foreground mx-auto max-w-md text-xs leading-relaxed">
              {view === "me"
                ? "You haven't voted on any model responses yet. Send prompts in the arena to vote for the best response!"
                : "No model votes have been cast in the arena yet. Be the first to evaluate models side by side and vote!"}
            </p>
          </div>
          <div>
            <Link
              href="/"
              className="btn-accent inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold"
            >
              <Swords className="h-4 w-4" />
              <span>Enter Arena</span>
            </Link>
          </div>
        </div>
      ) : (
        /* Standings Table */
        <div className="surface overflow-hidden">
          <div className="text-eyebrow border-border bg-muted/30 grid grid-cols-[3rem_1fr_13rem_8rem_8rem] gap-4 border-b px-5 py-3 text-xs">
            <span>#</span>
            <span>Model</span>
            <span>Win Record</span>
            <span className="flex items-center gap-1">
              <Clock className="text-muted-foreground h-3 w-3" />
              Avg. TTFT
            </span>
            <span className="flex items-center gap-1">
              <Zap className="text-muted-foreground h-3 w-3" />
              Avg. Speed
            </span>
          </div>

          <div className="divide-border divide-y">
            {rows.map((row) => {
              const isFirstPlace = row.rank === 1;

              return (
                <div
                  key={row.modelId}
                  className={`grid grid-cols-[3rem_1fr_13rem_8rem_8rem] items-center gap-4 px-5 py-4 transition-colors ${
                    isFirstPlace
                      ? "bg-primary/[0.04] border-primary border-l-2"
                      : "hover:bg-muted/30"
                  }`}
                >
                  {/* Rank */}
                  <span className="flex items-center gap-1.5 font-mono text-sm font-semibold">
                    {isFirstPlace ? (
                      <Trophy className="text-primary h-4 w-4 shrink-0" />
                    ) : (
                      <span className="text-muted-foreground pl-0.5">
                        {row.rank}
                      </span>
                    )}
                  </span>

                  {/* Model Name & ID */}
                  <div>
                    <div className="text-foreground text-sm font-semibold">
                      {row.modelName}
                    </div>
                    <div className="text-muted-foreground truncate font-mono text-xs">
                      {row.modelId}
                    </div>
                  </div>

                  {/* Win Record ("won X of Y" + accent bar) */}
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-primary font-mono text-base font-bold">
                        won {row.wins} of {row.totalVotes}
                      </span>
                      {row.totalVotes > 0 && (
                        <span className="text-muted-foreground font-mono text-xs">
                          ({row.winRatePct}%)
                        </span>
                      )}
                    </div>
                    <div className="bg-muted border-border mt-1.5 h-1.5 w-full overflow-hidden rounded-full border">
                      <div
                        className="bg-primary h-full rounded-full transition-all duration-300"
                        style={{ width: `${row.winRatePct}%` }}
                      />
                    </div>
                  </div>

                  {/* Avg. TTFT */}
                  <span className="text-muted-foreground font-mono text-xs">
                    {row.avgTtftMs > 0 ? `${row.avgTtftMs} ms` : "—"}
                  </span>

                  {/* Avg. Speed */}
                  <span className="text-muted-foreground font-mono text-xs">
                    {row.avgTokensPerSec > 0
                      ? `${row.avgTokensPerSec} tok/s`
                      : "—"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
