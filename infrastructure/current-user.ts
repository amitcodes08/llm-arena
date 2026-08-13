import { database } from "@/infrastructure/database";

/**
 * Finds or upserts the local App User database record corresponding to a Clerk User ID.
 */
export async function findAppUserId(clerkId: string): Promise<string | null> {
  if (!clerkId) return null;

  try {
    const user = await database().user.upsert({
      where: { id: clerkId },
      update: {},
      create: { id: clerkId },
      select: { id: true },
    });

    return user.id;
  } catch (error) {
    console.error("[current-user] failed to find or create user", error);
    return null;
  }
}
