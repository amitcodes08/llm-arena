"use client";

import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
} from "react";
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
  X,
} from "lucide-react";
import { Show, SignInButton } from "@clerk/nextjs";
import { ThreadGroup } from "./thread-groups";
import { useThreadHistory } from "@/infrastructure/thread-history-store";

interface ShellContextType {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  toggleMobile: () => void;
}

const ShellContext = createContext<ShellContextType | null>(null);

export function useShell() {
  const context = useContext(ShellContext);
  if (!context) {
    return {
      mobileOpen: false,
      setMobileOpen: () => {},
      toggleMobile: () => {},
    };
  }
  return context;
}

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
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { updatedThreads } = useThreadHistory();

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && mobileOpen) {
        setMobileOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen]);

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

  const sidebarContent = (isMobile: boolean) => (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-border flex h-14 items-center justify-between border-b px-4">
        {(!collapsed || isMobile) && (
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
        {isMobile ? (
          <button
            onClick={() => setMobileOpen(false)}
            aria-label="Close sidebar"
            className="hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg p-1.5 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        ) : (
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
        )}
      </div>

      {/* Navigation */}
      <nav className="space-y-1 p-2" aria-label="Main Navigation">
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
              onClick={isMobile ? () => setMobileOpen(false) : undefined}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {(!collapsed || isMobile) && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <hr className="border-border my-2 opacity-60" />

      {/* Thread History Section */}
      {(!collapsed || isMobile) && (
        <div className="flex-1 space-y-4 overflow-y-auto px-2">
          <div className="text-eyebrow flex items-center justify-between px-2">
            <span>Thread History</span>
            <Link
              href="/"
              onClick={isMobile ? () => setMobileOpen(false) : undefined}
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
                    onClick={isMobile ? () => setMobileOpen(false) : undefined}
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
                      onClick={
                        isMobile ? () => setMobileOpen(false) : undefined
                      }
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
    </div>
  );

  return (
    <ShellContext.Provider
      value={{
        mobileOpen,
        setMobileOpen,
        toggleMobile: () => setMobileOpen((prev) => !prev),
      }}
    >
      <div className="bg-background text-foreground flex h-screen w-full overflow-hidden">
        {/* Skip to Content for Accessibility */}
        <a
          href="#main-content"
          className="focus:bg-primary focus:text-primary-foreground sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:px-4 focus:py-2 focus:text-xs focus:font-semibold focus:shadow-lg"
        >
          Skip to content
        </a>

        {/* Desktop Sidebar Frame */}
        <aside
          className={`border-border bg-card hidden flex-col border-r transition-all duration-200 md:flex ${
            collapsed ? "w-16" : "w-64"
          } sticky top-0 z-20 h-screen`}
        >
          {sidebarContent(false)}
        </aside>

        {/* Mobile Slide-over Drawer Backdrop */}
        {mobileOpen && (
          <div
            onClick={() => setMobileOpen(false)}
            className="animate-enter fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
            aria-hidden="true"
          />
        )}

        {/* Mobile Slide-over Drawer */}
        <aside
          className={`border-border bg-card fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r shadow-2xl transition-transform duration-200 ease-out md:hidden ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          aria-label="Mobile Navigation"
        >
          {sidebarContent(true)}
        </aside>

        {/* Main Screen Content */}
        <main
          id="main-content"
          tabIndex={-1}
          className="flex h-screen flex-1 flex-col overflow-hidden outline-none"
        >
          {children}
        </main>
      </div>
    </ShellContext.Provider>
  );
}
