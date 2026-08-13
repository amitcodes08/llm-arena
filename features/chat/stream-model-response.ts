import { streamText } from "ai";
import { openrouter } from "@/app/arena/lib/openrouter";
import { database } from "@/infrastructure/database";
import { ChatRequest } from "./chat-request";

export function streamModelResponse(
  data: ChatRequest,
  _metadata: { clerkId: string }
): Response {
  const startTime = Date.now();
  let firstTokenTime: number | null = null;
  let fullText = "";

  const messages =
    data.messages && data.messages.length > 0
      ? data.messages
      : [{ role: "user" as const, content: data.prompt }];

  const result = streamText({
    model: openrouter(data.modelId),
    messages,
    onChunk({ chunk }: { chunk: { type: string; textDelta?: string } }) {
      if (chunk.type === "text-delta" && chunk.textDelta) {
        if (!firstTokenTime) {
          firstTokenTime = Date.now();
        }
        fullText += chunk.textDelta;
      }
    },
    onFinish: async ({
      text,
      usage,
    }: {
      text?: string;
      usage?: {
        completionTokens?: number;
        outputTokens?: number;
        promptTokens?: number;
        inputTokens?: number;
        totalTokens?: number;
      };
    }) => {
      const endTime = Date.now();
      const ttftMs = firstTokenTime
        ? firstTokenTime - startTime
        : endTime - startTime;
      const totalTimeSec = (endTime - startTime) / 1000;
      const outputTokens = usage?.completionTokens ?? usage?.outputTokens ?? 0;
      const inputTokens = usage?.promptTokens ?? usage?.inputTokens ?? 0;
      const totalTokens = usage?.totalTokens ?? inputTokens + outputTokens;
      const tokensPerSec = totalTimeSec > 0 ? outputTokens / totalTimeSec : 0;
      const finalText = text || fullText;

      try {
        const existing = await database().modelResponse.findFirst({
          where: { turnId: data.turnId, modelId: data.modelId },
          select: { id: true },
        });

        if (existing) {
          await database().modelResponse.update({
            where: { id: existing.id },
            data: {
              status: "COMPLETED",
              content: finalText,
              timeToFirstTokenMs: ttftMs,
              tokensPerSecond: tokensPerSec,
              totalTokens,
            },
          });
        }
      } catch (err) {
        console.error(
          "[stream-model-response] failed to update response row",
          err
        );
      }
    },
    onError: async (error: unknown) => {
      console.error(
        "[stream-model-response] stream error for model",
        data.modelId,
        error
      );
      try {
        const existing = await database().modelResponse.findFirst({
          where: { turnId: data.turnId, modelId: data.modelId },
          select: { id: true },
        });

        if (existing) {
          await database().modelResponse.update({
            where: { id: existing.id },
            data: {
              status: "FAILED",
              errorMessage: "Model response failed.",
            },
          });
        }
      } catch (e) {
        console.error(
          "[stream-model-response] failed to update error status",
          e
        );
      }
    },
  });

  return result.toTextStreamResponse();
}
