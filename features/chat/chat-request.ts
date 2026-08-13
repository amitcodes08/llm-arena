import { z } from "zod";

export const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string(),
});

export const chatRequestSchema = z.object({
  turnId: z.string().min(1),
  modelId: z.string().min(1),
  prompt: z.string().min(1).max(8000),
  messages: z.array(chatMessageSchema).optional(),
});

export type ChatMessage = z.infer<typeof chatMessageSchema>;
export type ChatRequest = z.infer<typeof chatRequestSchema>;
