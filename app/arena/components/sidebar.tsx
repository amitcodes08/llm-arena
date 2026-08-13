"use client";

import { useState } from "react";
import Link from "next/link";
import { UserButton, Show, SignInButton } from "@clerk/nextjs";
import {
  Swords,
  Trophy,
  Bot,
  MessageSquare,
  Plus,
  ChevronLeft,
  ChevronRight,
  Zap,
} from "lucide-react";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: Readonly<SidebarProps>) {
  const [activeNav, setActiveNav] = useState("arena");

  const threads = [
    { id: "1", title: "Compare Llama 3.1 & Qwen 2.5" },
    { id: "2", title: "React Server Components vs Actions" },
    { id: "3", title: "Quantum Computing Basics" },
  ];

  return (
    <aside
      className={`border-border bg-card flex flex-col border-r transition-all duration-200 ${
        collapsed ? "w-16" : "w-64"
      } sticky top-0 z-20 h-screen`}
    >
      {/* Top Header */}
      <div className="border-border flex h-14 items-center justify-between border-b px-4">
        {!collapsed && (
          <Link
            href="/"
            className="text-foreground flex items-center gap-2.5 font-bold tracking-tight"
          >
            <span className="bg-primary text-primary-foreground flex h-7 w-7 items-center justify-center rounded-lg shadow-sm">
              <Zap className="h-4 w-4 fill-current" />
            </span>
            <span className="text-base font-semibold tracking-tight">
              LLM Arena
            </span>
          </Link>
        )}
        <button
          onClick={onToggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg p-1.5 transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="space-y-1 p-2">
        {[
          { id: "arena", label: "Arena", icon: Swords, href: "/" },
          {
            id: "leaderboard",
            label: "Leaderboard",
            icon: Trophy,
            href: "/leaderboard",
          },
          { id: "models", label: "Models", icon: Bot, href: "/models" },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeNav === item.id;
          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => setActiveNav(item.id)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <hr className="border-border my-2 opacity-60" />

      {/* Threads Section */}
      {!collapsed && (
        <div className="flex-1 space-y-2 overflow-y-auto px-2">
          <div className="text-eyebrow flex items-center justify-between px-2">
            <span>Your Threads</span>
            <button
              className="text-muted-foreground hover:text-primary hover:bg-muted rounded-md p-1 transition-colors"
              title="New Thread"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="space-y-1">
            {threads.map((thread) => (
              <button
                key={thread.id}
                className="text-muted-foreground hover:text-foreground hover:bg-muted flex w-full items-center gap-2 truncate rounded-lg px-3 py-2 text-left text-xs font-medium transition-all"
              >
                <MessageSquare className="h-3.5 w-3.5 shrink-0 opacity-70" />
                <span className="truncate">{thread.title}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Footer Profile & Controls */}
      <div className="border-border bg-card/50 mt-auto flex items-center justify-between border-t p-3">
        <div className="flex items-center gap-2">
          <Show when="signed-in">
            <UserButton />
          </Show>
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button className="text-primary text-xs font-semibold hover:underline">
                Sign In
              </button>
            </SignInButton>
          </Show>
        </div>
        {!collapsed && (
          <span className="text-muted-foreground font-mono text-[10px]">
            v0.1.0
          </span>
        )}
      </div>
    </aside>
  );
}
