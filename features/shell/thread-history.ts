import { database } from "@/infrastructure/database";
import { ThreadGroup, ThreadSummary } from "./thread-groups";

export async function listThreadHistory(
  appUserId: string
): Promise<ThreadGroup[]> {
  if (!appUserId) return [];

  try {
    const threads = await database().thread.findMany({
      where: { userId: appUserId },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        updatedAt: true,
        turns: {
          take: 1,
          orderBy: { createdAt: "asc" },
          select: { prompt: true },
        },
      },
    });

    const now = new Date();
    const today: ThreadSummary[] = [];
    const yesterday: ThreadSummary[] = [];
    const pastWeek: ThreadSummary[] = [];
    const older: ThreadSummary[] = [];

    for (const t of threads) {
      const title = t.turns[0]?.prompt || "New Thread";
      const item: ThreadSummary = { id: t.id, title, updatedAt: t.updatedAt };

      const diffDays = Math.floor(
        (now.getTime() - t.updatedAt.getTime()) / (1000 * 3600 * 24)
      );

      if (diffDays === 0) {
        today.push(item);
      } else if (diffDays === 1) {
        yesterday.push(item);
      } else if (diffDays < 7) {
        pastWeek.push(item);
      } else {
        older.push(item);
      }
    }

    const groups: ThreadGroup[] = [];
    if (today.length > 0) groups.push({ label: "Today", threads: today });
    if (yesterday.length > 0)
      groups.push({ label: "Yesterday", threads: yesterday });
    if (pastWeek.length > 0)
      groups.push({ label: "Previous 7 days", threads: pastWeek });
    if (older.length > 0) groups.push({ label: "Older", threads: older });

    return groups;
  } catch (error) {
    console.error("[thread-history] failed to list thread history", error);
    return [];
  }
}
