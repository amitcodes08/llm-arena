"use client";

import { useState } from "react";
import { Show, UserButton, SignInButton, SignUpButton } from "@clerk/nextjs";
import { Share2, Check, Menu } from "lucide-react";
import posthog from "posthog-js";
import { useShell } from "@/features/shell/app-shell";
import { ThemeToggle } from "@/features/theme/theme-toggle";

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
  threadTitle = "Arena Battle",
  threadId,
  models = [],
}: Readonly<TopBarProps>) {
  const [copied, setCopied] = useState(false);
  const { toggleMobile } = useShell();

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
    <header className="border-border bg-card/80 sticky top-0 z-10 flex h-14 items-center justify-between border-b px-4 backdrop-blur-sm sm:px-6">
      {/* Left: Mobile Drawer Trigger + Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggleMobile}
          aria-label="Open sidebar navigation"
          className="hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg p-1.5 transition-colors md:hidden"
        >
          <Menu className="h-4 w-4" />
        </button>

        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <span className="text-foreground hidden font-medium sm:inline">
            Arena
          </span>
          <span className="text-muted-foreground/60 hidden sm:inline">/</span>
          <span className="text-foreground max-w-[140px] truncate font-semibold tracking-tight sm:max-w-[240px]">
            {threadTitle}
          </span>
        </div>
      </div>

      {/* Right: Model Win-Rate Pills, Theme Toggle, Share & Auth */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Model win pills */}
        {models.length > 0 && (
          <div className="hidden items-center gap-1.5 lg:flex">
            {models.map((model) => (
              <div
                key={model.id}
                className="border-border bg-muted/60 hover:border-input flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-xs transition-colors"
                title={`${model.shortName}: ${model.wins}/${model.total} wins in this thread`}
              >
                <span className="text-foreground font-bold">
                  {model.shortName[0]}
                </span>
                <span className="text-muted-foreground text-[11px] font-medium">
                  {model.wins}/{model.total}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Share Button (when viewing a thread) */}
        {threadId && (
          <button
            onClick={handleShare}
            className="surface hover:bg-muted text-foreground flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold transition-colors"
            title="Copy shareable link"
          >
            {copied ? (
              <>
                <Check className="text-foreground h-3.5 w-3.5" />
                <span className="text-foreground">Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Share</span>
              </>
            )}
          </button>
        )}

        {/* Quick Theme Toggle */}
        <ThemeToggle className="h-8 w-8" />

        {/* Auth Buttons */}
        <div className="border-border flex items-center gap-2 border-l pl-2">
          <Show when="signed-in">
            <UserButton />
          </Show>
          <Show when="signed-out">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <SignInButton mode="modal">
                <button className="text-foreground hover:text-primary px-2 py-1 text-xs font-medium transition-colors">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="btn-accent px-2.5 py-1 text-xs font-semibold">
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
