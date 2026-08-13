"use client";

import { useState } from "react";
import { Show, UserButton, SignInButton, SignUpButton } from "@clerk/nextjs";
import { Share2, Check } from "lucide-react";
import posthog from "posthog-js";

interface TopBarProps {
  threadTitle?: string;
  threadId?: string;
  models?: Array<{
    id: string;
    shortName: string;
    wins: number;
    total: number;
  }>;
}

export function TopBar({
  threadTitle = "Thread 1",
  threadId,
  models = [
    { id: "1", shortName: "Gemma 4", wins: 0, total: 2 },
    { id: "2", shortName: "GPT-OSS", wins: 0, total: 2 },
    { id: "3", shortName: "Nemotron", wins: 1, total: 2 },
  ],
}: Readonly<TopBarProps>) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (typeof window !== "undefined") {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      posthog.capture("thread_shared", {
        threadId,
        threadTitle,
        url: window.location.href,
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <header className="border-border bg-card/80 sticky top-0 z-10 flex h-14 items-center justify-between border-b px-6 backdrop-blur-sm">
      {/* Breadcrumb */}
      <div className="text-muted-foreground flex items-center gap-2 text-sm">
        <span className="text-foreground font-medium">Arena</span>
        <span className="text-muted-foreground/60">/</span>
        <span className="text-foreground font-semibold tracking-tight">
          {threadTitle}
        </span>
      </div>

      {/* Model Win-Rate Pills & Actions */}
      <div className="flex items-center gap-3">
        {/* Model win pills */}
        <div className="hidden items-center gap-2 sm:flex">
          {models.map((model) => (
            <div
              key={model.id}
              className="border-border bg-muted/60 hover:border-input flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-xs transition-colors"
              title={`${model.shortName}: ${model.wins}/${model.total} wins in this thread`}
            >
              <span className="text-foreground font-bold">
                {model.shortName[0]}
              </span>
              <span className="text-muted-foreground font-medium">
                {model.wins}/{model.total}
              </span>
            </div>
          ))}
        </div>

        {/* Share Button (when viewing a thread) */}
        {threadId && (
          <button
            onClick={handleShare}
            className="surface hover:bg-muted text-foreground flex items-center gap-1.5 px-3 py-1 text-xs font-semibold transition-colors"
            title="Copy shareable link"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-emerald-500">Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="h-3.5 w-3.5" />
                <span>Share</span>
              </>
            )}
          </button>
        )}

        {/* Auth Buttons */}
        <div className="border-border flex items-center gap-2 border-l pl-2">
          <Show when="signed-in">
            <UserButton />
          </Show>
          <Show when="signed-out">
            <div className="flex items-center gap-2">
              <SignInButton mode="modal">
                <button className="text-foreground hover:text-primary text-xs font-medium transition-colors">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="btn-accent px-3 py-1 text-xs font-semibold">
                  Sign Up
                </button>
              </SignUpButton>
            </div>
          </Show>
        </div>
      </div>
    </header>
  );
}
