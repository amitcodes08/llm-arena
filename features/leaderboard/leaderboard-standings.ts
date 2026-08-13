import { database } from "@/infrastructure/database";

export interface LeaderboardRow {
  rank: number;
  modelId: string;
  modelName: string;
  winRatePct: number;
  wins: number;
  totalVotes: number;
  avgTtftMs: number;
  avgTokensPerSec: number;
}

export async function getLeaderboardStandings(
  userId: string | null
): Promise<LeaderboardRow[]> {
  try {
    const votes = await database().vote.findMany({
      where: userId ? { userId } : {},
      select: {
        winnerModelResponse: {
          select: {
            modelId: true,
            timeToFirstTokenMs: true,
            tokensPerSecond: true,
          },
        },
      },
    });

    const responses = await database().modelResponse.findMany({
      where: { status: "COMPLETED" },
      select: {
        modelId: true,
        timeToFirstTokenMs: true,
        tokensPerSecond: true,
        turn: { select: { thread: { select: { userId: true } } } },
      },
    });

    const modelStatsMap = new Map<
      string,
      {
        name: string;
        wins: number;
        total: number;
        ttftSum: number;
        ttftCount: number;
        tpsSum: number;
        tpsCount: number;
      }
    >();

    const getOrInit = (id: string, name?: string) => {
      if (!modelStatsMap.has(id)) {
        modelStatsMap.set(id, {
          name: name || id.split("/").pop()?.replace(":free", "") || id,
          wins: 0,
          total: 0,
          ttftSum: 0,
          ttftCount: 0,
          tpsSum: 0,
          tpsCount: 0,
        });
      }
      return modelStatsMap.get(id)!;
    };

    for (const r of responses) {
      if (userId && r.turn.thread.userId !== userId) continue;
      const stat = getOrInit(r.modelId);
      stat.total += 1;
      if (r.timeToFirstTokenMs) {
        stat.ttftSum += r.timeToFirstTokenMs;
        stat.ttftCount += 1;
      }
      if (r.tokensPerSecond) {
        stat.tpsSum += Number(r.tokensPerSecond);
        stat.tpsCount += 1;
      }
    }

    for (const v of votes) {
      if (v.winnerModelResponse) {
        const stat = getOrInit(v.winnerModelResponse.modelId);
        stat.wins += 1;
      }
    }

    const rows: LeaderboardRow[] = Array.from(modelStatsMap.entries())
      .map(([id, stat]) => ({
        rank: 0,
        modelId: id,
        modelName: stat.name,
        winRatePct:
          stat.total > 0 ? Math.round((stat.wins / stat.total) * 100) : 0,
        wins: stat.wins,
        totalVotes: stat.total,
        avgTtftMs:
          stat.ttftCount > 0 ? Math.round(stat.ttftSum / stat.ttftCount) : 0,
        avgTokensPerSec:
          stat.tpsCount > 0
            ? Number((stat.tpsSum / stat.tpsCount).toFixed(1))
            : 0,
      }))
      .sort((a, b) => b.winRatePct - a.winRatePct)
      .map((row, idx) => ({ ...row, rank: idx + 1 }));

    return rows;
  } catch (error) {
    console.error("[leaderboard-standings] failed to fetch standings", error);
    return [];
  }
}
