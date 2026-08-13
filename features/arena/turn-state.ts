export interface ModelMetrics {
  modelId: string;
  timeToFirstTokenMs: number | null;
  tokensPerSecond: number | null;
  inputTokens: number | null;
  outputTokens: number | null;
  totalTokens: number | null;
  costUsd: number | null;
}

export interface ResponseState {
  id: string;
  modelId: string;
  modelName: string;
  status: "COMPLETE" | "STREAMING" | "FAILED" | "PENDING";
  text: string;
  won?: boolean;
  metrics: ModelMetrics | null;
}

export interface TurnState {
  id: string;
  prompt: string;
  responses: ResponseState[];
}
