import { aj as arcjet } from "@/app/arena/lib/arcjet";

export async function guardChatRequest(
  request: Request,
  userId: string
): Promise<Response | null> {
  if (!arcjet) return null;

  try {
    const decision = await arcjet.protect(request, { userId, requested: 1 });
    if (decision.isDenied()) {
      return Response.json(
        { error: "Too many requests. Please slow down and try again shortly." },
        { status: 429 }
      );
    }
  } catch (error) {
    console.error("[chat-protection] Arcjet check failed", error);
  }

  return null;
}
