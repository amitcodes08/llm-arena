import { Show, UserButton, SignInButton, SignUpButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { unstable_rethrow } from "next/navigation";

import { AppShell } from "@/features/shell/app-shell";
import { listThreadHistory } from "@/features/shell/thread-history";
import { type ThreadGroup } from "@/features/shell/thread-groups";
import { ThemeToggle } from "@/features/theme/theme-toggle";
import { findAppUserId } from "@/infrastructure/current-user";
import { ThreadHistoryProvider } from "@/infrastructure/thread-history-store";

const loadThreadHistory = async (): Promise<readonly ThreadGroup[]> => {
  try {
    const { userId: clerkId } = await auth();
    const appUserId = clerkId ? await findAppUserId(clerkId) : null;

    return appUserId ? await listThreadHistory(appUserId) : [];
  } catch (error) {
    unstable_rethrow(error);
    console.error("[shell] could not load the sidebar's thread history", error);
    return [];
  }
};

export default async function ShellLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const threadGroups = await loadThreadHistory();

  return (
    <ThreadHistoryProvider>
      <AppShell
        threadGroups={threadGroups}
        sidebarFooter={
          <>
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
                  <button className="btn-accent px-2.5 py-1 text-xs font-semibold">
                    Sign Up
                  </button>
                </SignUpButton>
              </div>
            </Show>
            <ThemeToggle className="ml-auto" />
          </>
        }
      >
        {children}
      </AppShell>
    </ThreadHistoryProvider>
  );
}
