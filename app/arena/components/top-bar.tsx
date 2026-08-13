"use client";

interface TopBarProps {
  threadTitle?: string;
  models?: Array<{
    id: string;
    shortName: string;
    wins: number;
    total: number;
  }>;
}

export function TopBar({
  threadTitle = "Thread 1",
  models = [
    { id: "1", shortName: "Llama 3.1 8B", wins: 0, total: 2 },
    { id: "2", shortName: "Qwen 2.5 72B", wins: 0, total: 2 },
    { id: "3", shortName: "Gemma 2 9B", wins: 1, total: 2 },
  ],
}: Readonly<TopBarProps>) {
  return (
    <header className="border-border bg-card/80 sticky top-0 z-10 flex h-14 items-center justify-between border-b px-6 backdrop-blur-sm">
      {/* Breadcrumb */}
      <div className="text-muted-foreground flex items-center gap-2 text-sm">
        <span className="text-foreground font-medium">Arena</span>
        <span className="text-muted-foreground/60">/</span>
        <span className="text-foreground font-semibold tracking-tight">
          {threadTitle}
        </span>
      </div>

      {/* Model Win-Rate Pills */}
      <div className="flex items-center gap-2">
        {models.map((model) => (
          <div
            key={model.id}
            className="border-border bg-muted/60 hover:border-input flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-xs transition-colors"
            title={`${model.shortName}: ${model.wins}/${model.total} wins in this thread`}
          >
            <span className="text-foreground font-bold">
              {model.shortName[0]}
            </span>
            <span className="text-muted-foreground font-medium">
              {model.wins}/{model.total}
            </span>
          </div>
        ))}
      </div>
    </header>
  );
}
