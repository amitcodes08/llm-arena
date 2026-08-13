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

        {/* Thread History */}
        {!collapsed && (
          <div className="flex-1 space-y-3 overflow-y-auto px-2">
            <div className="text-eyebrow flex items-center justify-between px-2">
              <span>Your Threads</span>
              <Link
                href="/"
                className="text-muted-foreground hover:text-primary hover:bg-muted rounded-md p-1 transition-colors"
                title="New Thread"
              >
                <Plus className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Optimistic new threads */}
            {updatedThreads.length > 0 && (
              <div className="space-y-1">
                {updatedThreads.map((t) => (
                  <Link
                    key={t.id}
                    href={`/t/${t.id}`}
                    className="text-foreground hover:bg-muted flex w-full items-center gap-2 truncate rounded-lg px-3 py-2 text-xs font-medium transition-all"
                  >
                    <MessageSquare className="text-primary h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{t.title}</span>
                  </Link>
                ))}
              </div>
            )}

            {/* Server rendered thread history groups */}
            {threadGroups.map((group) => (
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
                        ? "bg-muted text-foreground font-semibold"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    <MessageSquare className="h-3.5 w-3.5 shrink-0 opacity-70" />
                    <span className="truncate">{t.title}</span>
                  </Link>
                ))}
              </div>
            ))}
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
