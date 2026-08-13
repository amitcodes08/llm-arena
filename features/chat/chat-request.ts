import { z } from "zod";

export const chatRequestSchema = z.object({
  turnId: z.string().min(1),
  modelId: z.string().min(1),
  prompt: z.string().min(1).max(8000),
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;
