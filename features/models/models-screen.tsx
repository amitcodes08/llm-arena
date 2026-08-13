"use client";

import { CatalogModel } from "@/infrastructure/fetch-model-catalog";
import { Sparkles, Bot } from "lucide-react";

interface ModelsScreenProps {
  readonly catalog: CatalogModel[] | null;
  readonly defaultSelection: string[];
}

export function ModelsScreen({ catalog }: Readonly<ModelsScreenProps>) {
  const models = catalog || [];
  const maxContext = Math.max(...models.map((m) => m.contextLength), 131072);

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 space-y-6 overflow-y-auto p-6">
      <div>
        <h1 className="font-display text-3xl font-normal tracking-tight">
          Models Catalog
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          OpenRouter free-tier catalog sorted by context window capacity.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {models.map((model) => {
          const pct = Math.round((model.contextLength / maxContext) * 100);

          return (
            <div
              key={model.id}
              className="surface hover:border-input space-y-4 p-5 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="bg-muted border-border text-foreground flex h-9 w-9 items-center justify-center rounded-xl border font-bold">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-foreground text-sm font-semibold">
                      {model.name}
                    </h3>
                    <p className="text-muted-foreground font-mono text-xs">
                      {model.id}
                    </p>
                  </div>
                </div>

                <span className="flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <Sparkles className="h-3 w-3" />
                  Free Tier
                </span>
              </div>

              {/* Context Window Comparison Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between font-mono text-xs">
                  <span className="text-muted-foreground">Context Window</span>
                  <span className="text-foreground font-medium">
                    {model.contextLength.toLocaleString()} tokens
                  </span>
                </div>
                <div className="measure-bar">
                  <span style={{ width: `${pct}%` }} />
                </div>
              </div>

              {/* Pricing breakdown */}
              <div className="border-border text-muted-foreground flex justify-between border-t pt-2 font-mono text-xs">
                <span>Prompt: $0.00 / 1M</span>
                <span>Completion: $0.00 / 1M</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
