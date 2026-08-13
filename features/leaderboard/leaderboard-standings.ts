import { database } from "@/infrastructure/database";
import { fetchFreeModelCatalog } from "@/infrastructure/fetch-model-catalog";

export interface LeaderboardRow {
  rank: number;
  modelId: string;
  modelName: string;
  shortName: string;
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
    const catalog = await fetchFreeModelCatalog();

    // Query turns that have a cast vote
    const turns = await database().turn.findMany({
      where: {
        votes: {
          some: userId ? { userId } : {},
        },
      },
      select: {
        id: true,
        votes: {
          where: userId ? { userId } : {},
          select: { winnerModelResponseId: true },
        },
        responses: {
          where: { status: "COMPLETED" },
          select: {
            id: true,
            modelId: true,
            timeToFirstTokenMs: true,
            tokensPerSecond: true,
          },
        },
      },
    });

    const modelStatsMap = new Map<
      string,
      {
        name: string;
        shortName: string;
        wins: number;
        total: number;
        ttftSum: number;
        ttftCount: number;
        tpsSum: number;
        tpsCount: number;
      }
    >();

    const getOrInit = (id: string) => {
      if (!modelStatsMap.has(id)) {
        const catModel = catalog?.find((m) => m.id === id);
        const name =
          catModel?.name || id.split("/").pop()?.replace(":free", "") || id;
        const shortName = name.split(" ")[0] || "Model";

        modelStatsMap.set(id, {
          name,
          shortName,
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

    // Calculate win rates strictly from voted turns
    for (const turn of turns) {
      if (turn.votes.length === 0 || turn.responses.length < 2) continue;
      const winnerResponseId = turn.votes[0]?.winnerModelResponseId;

      for (const resp of turn.responses) {
        const stat = getOrInit(resp.modelId);
        stat.total += 1;

        if (resp.id === winnerResponseId) {
          stat.wins += 1;
        }

        if (resp.timeToFirstTokenMs) {
          stat.ttftSum += resp.timeToFirstTokenMs;
          stat.ttftCount += 1;
        }

        if (resp.tokensPerSecond) {
          stat.tpsSum += Number(resp.tokensPerSecond);
          stat.tpsCount += 1;
        }
      }
    }

    // Include any remaining catalog models with 0 votes if in global view
    if (!userId && catalog) {
      for (const m of catalog) {
        getOrInit(m.id);
      }
    }

    const rows: LeaderboardRow[] = Array.from(modelStatsMap.entries())
      .map(([id, stat]) => ({
        rank: 0,
        modelId: id,
        modelName: stat.name,
        shortName: stat.shortName,
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
      .sort((a, b) => {
        if (b.winRatePct !== a.winRatePct) return b.winRatePct - a.winRatePct;
        if (b.wins !== a.wins) return b.wins - a.wins;
        return b.avgTokensPerSec - a.avgTokensPerSec;
      })
      .map((row, idx) => ({ ...row, rank: idx + 1 }));

    return rows;
  } catch (error) {
    console.error("[leaderboard-standings] failed to fetch standings", error);
    return [];
  }
}
