"use client";

import { useState, ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
import { Show, SignInButton } from "@clerk/nextjs";
import { ThreadGroup } from "./thread-groups";
import { useThreadHistory } from "@/infrastructure/thread-history-store";

interface AppShellProps {
  readonly threadGroups: readonly ThreadGroup[];
  readonly sidebarFooter?: ReactNode;
  readonly children: ReactNode;
}

export function AppShell({
  threadGroups,
  sidebarFooter,
  children,
}: Readonly<AppShellProps>) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { updatedThreads } = useThreadHistory();

  const navItems = [
    { id: "arena", label: "Arena", icon: Swords, href: "/" },
    {
      id: "leaderboard",
      label: "Leaderboard",
      icon: Trophy,
      href: "/leaderboard",
    },
    { id: "models", label: "Models", icon: Bot, href: "/models" },
  ];

  return (
    <div className="bg-background text-foreground flex h-screen w-full overflow-hidden">
      {/* Sidebar Frame */}
      <aside
        className={`border-border bg-card flex flex-col border-r transition-all duration-200 ${
          collapsed ? "w-16" : "w-64"
        } sticky top-0 z-20 h-screen`}
      >
        {/* Header */}
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
            onClick={() => setCollapsed(!collapsed)}
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

        {/* Navigation */}
        <nav className="space-y-1 p-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/"
                ? pathname === "/" || pathname.startsWith("/t/")
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
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

        {/* Thread History Section */}
        {!collapsed && (
          <div className="flex-1 space-y-4 overflow-y-auto px-2">
            <div className="text-eyebrow flex items-center justify-between px-2">
              <span>Thread History</span>
              <Link
                href="/"
                className="text-muted-foreground hover:text-primary hover:bg-muted flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-semibold transition-colors"
                title="New Arena Thread"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>New</span>
              </Link>
            </div>

            {/* Signed-out prompt */}
            <Show when="signed-out">
              <div className="surface border-border bg-card/70 mx-1 space-y-2 p-3 text-center">
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Sign in to save and revisit your model battle history across
                  visits.
                </p>
                <SignInButton mode="modal">
                  <button className="btn-accent w-full py-1 text-xs font-semibold">
                    Sign In
                  </button>
                </SignInButton>
              </div>
            </Show>

            {/* Signed-in thread list */}
            <Show when="signed-in">
              {/* Optimistic new threads */}
              {updatedThreads.length > 0 && (
                <div className="space-y-1">
                  <p className="text-primary px-2 font-mono text-[10px] font-semibold tracking-wider uppercase">
                    Just Now
                  </p>
                  {updatedThreads.map((t) => (
                    <Link
                      key={t.id}
                      href={`/t/${t.id}`}
                      className={`flex w-full items-center gap-2 truncate rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                        pathname === `/t/${t.id}`
                          ? "bg-primary/15 text-primary border-primary border-l-2 font-semibold"
                          : "text-foreground hover:bg-muted"
                      }`}
                    >
                      <MessageSquare className="text-primary h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{t.title}</span>
                    </Link>
                  ))}
                </div>
              )}

              {/* Grouped past threads */}
              {threadGroups.length === 0 && updatedThreads.length === 0 ? (
                <p className="text-muted-foreground/80 px-2 py-4 text-center text-xs">
                  No previous threads yet.
                </p>
              ) : (
                threadGroups.map((group) => (
                  <div key={group.label} className="space-y-1">
                    <p className="text-muted-foreground/80 px-2 font-mono text-[10px] tracking-wider uppercase">
                      {group.label}
                    </p>
                    {group.threads.map((t) => (
                      <Link
                        key={t.id}
                        href={`/t/${t.id}`}
                        className={`flex w-full items-center gap-2 truncate rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                          pathname === `/t/${t.id}`
                            ? "bg-primary/15 text-primary border-primary border-l-2 font-semibold"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        }`}
                      >
                        <MessageSquare className="h-3.5 w-3.5 shrink-0 opacity-70" />
                        <span className="truncate">{t.title}</span>
                      </Link>
                    ))}
                  </div>
                ))
              )}
            </Show>
          </div>
        )}

        {/* Footer */}
        <div className="border-border bg-card/50 mt-auto flex items-center justify-between border-t p-3">
          {sidebarFooter}
        </div>
      </aside>

      {/* Main Screen Content */}
      <main className="flex h-screen flex-1 flex-col overflow-hidden">
        {children}
      </main>
    </div>
  );
}
